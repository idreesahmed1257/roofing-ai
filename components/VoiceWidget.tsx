"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  GoogleGenAI,
  Modality,
  type LiveServerMessage,
  type Session,
} from "@google/genai";
import {
  arrayBufferToBase64,
  downsampleTo16k,
  floatTo16BitPCM,
  PcmPlayer,
  rmsLevel,
} from "@/lib/audio";

type Status = "idle" | "connecting" | "listening" | "speaking" | "error";

type TranscriptLine = {
  role: "user" | "assistant" | "system";
  text: string;
};

async function readJsonSafe(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {
      error: `Non-JSON response (${res.status}): ${text.slice(0, 180)}`,
    };
  }
}

async function runTool(
  name: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (name === "search_company_knowledge") {
    const res = await fetch("/api/knowledge/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: String(args.query || "") }),
    });
    const data = await readJsonSafe(res);
    if (!res.ok) {
      return { error: String(data.error || `Search failed (${res.status})`) };
    }
    const hits = Array.isArray(data.hits) ? data.hits : [];
    return { context: data.context, hits: hits.length };
  }

  if (name === "book_estimate") {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await readJsonSafe(res);
    if (!res.ok) {
      return { error: String(data.error || `Booking failed (${res.status})`) };
    }
    return {
      ok: true,
      message: data.message,
      leadId: (data.lead as { id?: string } | undefined)?.id,
    };
  }

  return { error: `Unknown tool: ${name}` };
}

export default function VoiceWidget() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [open, setOpen] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const userPartialRef = useRef("");
  const assistantPartialRef = useRef("");

  /** Half-duplex: mute mic upload while agent audio is playing. */
  const micOpenRef = useRef(true);
  const agentSpeakingRef = useRef(false);
  const startingRef = useRef(false);
  const sessionIdRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const unmuteTimerRef = useRef<number | null>(null);
  const keepErrorRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const onStart = () => {
      setOpen(true);
      if (
        !sessionRef.current &&
        !startingRef.current &&
        (statusRef.current === "idle" || statusRef.current === "error")
      ) {
        void startSession();
      }
    };
    window.addEventListener("schoenherr:start-voice", onStart);
    return () => {
      window.removeEventListener("schoenherr:start-voice", onStart);
      void stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function appendLine(role: TranscriptLine["role"], text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    setLines((prev) => [...prev.slice(-40), { role, text: cleaned }]);
  }

  function clearUnmuteTimer() {
    if (unmuteTimerRef.current) {
      clearTimeout(unmuteTimerRef.current);
      unmuteTimerRef.current = null;
    }
  }

  function fail(message: string) {
    keepErrorRef.current = true;
    setError(message);
    setStatus("error");
    appendLine("system", message);
  }

  function openMicAfterPlayback() {
    agentSpeakingRef.current = false;
    clearUnmuteTimer();
    // Short grace so speaker tail / room echo doesn't re-trigger the model
    unmuteTimerRef.current = window.setTimeout(() => {
      unmuteTimerRef.current = null;
      if (!agentSpeakingRef.current && sessionRef.current) {
        micOpenRef.current = true;
        setStatus((s) =>
          s === "speaking" || s === "connecting" ? "listening" : s,
        );
      }
    }, 400);
  }

  function markAgentSpeaking() {
    agentSpeakingRef.current = true;
    micOpenRef.current = false;
    setStatus("speaking");
    // Failsafe: never leave the mic muted forever if drain/audio glitches
    clearUnmuteTimer();
    unmuteTimerRef.current = window.setTimeout(() => {
      unmuteTimerRef.current = null;
      if (sessionRef.current && !micOpenRef.current) {
        openMicAfterPlayback();
      }
    }, 12_000);
  }

  async function handleToolCalls(message: LiveServerMessage) {
    const calls = message.toolCall?.functionCalls;
    if (!calls?.length || !sessionRef.current) return;

    const functionResponses = [];
    for (const call of calls) {
      const name = call.name || "";
      let args: Record<string, unknown> = {};
      try {
        args =
          typeof call.args === "string"
            ? (JSON.parse(call.args) as Record<string, unknown>)
            : ((call.args || {}) as Record<string, unknown>);
      } catch {
        args = {};
      }
      appendLine("system", `Looking up: ${name}`);
      let response: Record<string, unknown>;
      try {
        response = await runTool(name, args);
      } catch (err) {
        response = {
          error: err instanceof Error ? err.message : "Tool request failed",
        };
      }
      if (response.error) {
        appendLine("system", `Tool error (${name}): ${String(response.error)}`);
        setError(String(response.error));
      }
      functionResponses.push({
        id: call.id,
        name,
        response,
      });
    }

    try {
      sessionRef.current.sendToolResponse({ functionResponses });
    } catch (err) {
      fail(
        err instanceof Error
          ? `Failed to send tool response: ${err.message}`
          : "Failed to send tool response",
      );
    }
  }

  async function startMic(session: Session) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      } as MediaTrackConstraints,
    });
    mediaStreamRef.current = stream;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (event) => {
      // Half-duplex: do not send mic while agent is talking (stops speaker→mic loop)
      if (!micOpenRef.current || agentSpeakingRef.current) return;
      if (!sessionRef.current) return;

      const input = event.inputBuffer.getChannelData(0);
      // Drop near-silence / faint echo leftovers
      if (rmsLevel(input) < 0.012) return;

      const down = downsampleTo16k(input, audioCtx.sampleRate);
      const pcm = floatTo16BitPCM(down);
      const base64 = arrayBufferToBase64(pcm.buffer as ArrayBuffer);
      try {
        session.sendRealtimeInput({
          audio: {
            data: base64,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      } catch {
        // session may be closing
      }
    };

    const mute = audioCtx.createGain();
    mute.gain.value = 0;
    source.connect(processor);
    processor.connect(mute);
    mute.connect(audioCtx.destination);
  }

  async function cleanupMediaAndSession() {
    clearUnmuteTimer();
    micOpenRef.current = false;
    agentSpeakingRef.current = false;
    try {
      processorRef.current?.disconnect();
      await audioCtxRef.current?.close();
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      playerRef.current?.stop();
      sessionRef.current?.close();
    } catch {
      // ignore cleanup errors
    }
    processorRef.current = null;
    audioCtxRef.current = null;
    mediaStreamRef.current = null;
    playerRef.current = null;
    sessionRef.current = null;
  }

  async function stopSession() {
    sessionIdRef.current += 1;
    startingRef.current = false;
    await cleanupMediaAndSession();
    if (keepErrorRef.current) {
      setStatus("error");
    } else {
      setStatus("idle");
    }
  }

  async function startSession() {
    if (startingRef.current) return;
    startingRef.current = true;
    keepErrorRef.current = false;

    // Invalidate any in-flight session and clear media before connecting once
    sessionIdRef.current += 1;
    const myId = sessionIdRef.current;
    await cleanupMediaAndSession();

    setError(null);
    setStatus("connecting");
    setOpen(true);
    setLines([]);
    userPartialRef.current = "";
    assistantPartialRef.current = "";
    micOpenRef.current = false;
    agentSpeakingRef.current = false;

    try {
      const healthRes = await fetch("/api/health");
      const health = await readJsonSafe(healthRes);
      if (!healthRes.ok || health.ok === false) {
        const missing = Array.isArray(health.missing)
          ? health.missing.join(", ")
          : "required environment variables";
        throw new Error(
          `Server env incomplete (missing: ${missing}). In Vercel: Settings → Environment Variables → add them for Production → Redeploy. ${String(health.note || "")}`,
        );
      }

      const tokenRes = await fetch("/api/voice/token", { method: "POST" });
      const grant = await readJsonSafe(tokenRes);
      if (!tokenRes.ok) {
        throw new Error(
          String(grant.error || `Could not start voice session (${tokenRes.status})`),
        );
      }
      if (!grant.token || !grant.model) {
        throw new Error("Voice token response missing token/model");
      }
      if (myId !== sessionIdRef.current) return;

      const ai = new GoogleGenAI({
        apiKey: String(grant.token),
        httpOptions: { apiVersion: "v1alpha" },
      });

      const player = new PcmPlayer(24000);
      await player.resume();
      player.onDrain(() => openMicAfterPlayback(), 450);
      playerRef.current = player;

      const session = await ai.live.connect({
        model: String(grant.model),
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: (
            grant.config as { speechConfig?: unknown } | undefined
          )?.speechConfig as never,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            if (myId !== sessionIdRef.current) return;
            setStatus("listening");
          },
          onmessage: (message: LiveServerMessage) => {
            if (myId !== sessionIdRef.current) return;
            void handleToolCalls(message);

            if (message.serverContent?.interrupted) {
              player.interrupt();
              player.onDrain(() => openMicAfterPlayback(), 300);
              agentSpeakingRef.current = false;
              micOpenRef.current = true;
              clearUnmuteTimer();
              setStatus("listening");
            }

            const inputTx = message.serverContent?.inputTranscription?.text;
            if (inputTx && micOpenRef.current) {
              userPartialRef.current += inputTx;
            }
            if (message.serverContent?.turnComplete && userPartialRef.current) {
              appendLine("user", userPartialRef.current);
              userPartialRef.current = "";
            }

            const outputTx = message.serverContent?.outputTranscription?.text;
            if (outputTx) {
              assistantPartialRef.current += outputTx;
              markAgentSpeaking();
            }

            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              const data = part.inlineData?.data;
              const mime = part.inlineData?.mimeType || "";
              if (data && mime.includes("audio")) {
                markAgentSpeaking();
                try {
                  player.enqueueBase64Pcm16(data);
                } catch (err) {
                  fail(
                    err instanceof Error
                      ? `Audio playback failed: ${err.message}`
                      : "Audio playback failed",
                  );
                }
              }
            }

            if (message.serverContent?.turnComplete) {
              if (assistantPartialRef.current) {
                appendLine("assistant", assistantPartialRef.current);
                assistantPartialRef.current = "";
              }
              // Mic stays closed until playback drain callback
              if (!player.isPlaying) {
                openMicAfterPlayback();
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            if (myId !== sessionIdRef.current) return;
            console.error(e);
            fail(e.message || "Voice connection error");
          },
          onclose: (event?: CloseEvent) => {
            if (myId !== sessionIdRef.current) return;
            const reason =
              event?.reason ||
              (typeof event?.code === "number"
                ? `code ${event.code}`
                : "connection closed");
            if (statusRef.current === "error" || keepErrorRef.current) {
              setStatus("error");
              return;
            }
            if (
              statusRef.current === "listening" ||
              statusRef.current === "speaking" ||
              statusRef.current === "connecting"
            ) {
              fail(`Voice session ended unexpectedly (${reason}). Try again.`);
              void cleanupMediaAndSession();
              return;
            }
            setStatus("idle");
          },
        },
      });

      if (myId !== sessionIdRef.current) {
        session.close();
        return;
      }

      sessionRef.current = session;
      try {
        await startMic(session);
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? `Microphone permission failed: ${err.message}`
            : "Microphone permission failed",
        );
      }
      if (myId !== sessionIdRef.current) return;

      // Mute mic during greeting so the bot doesn't hear itself and double-talk
      markAgentSpeaking();
      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              {
                text: "A homeowner just opened the voice sales agent. Greet them briefly as Schoenherr Roofing's AI sales agent and ask how you can help today.",
              },
            ],
          },
        ],
        turnComplete: true,
      });
    } catch (err) {
      console.error(err);
      fail(err instanceof Error ? err.message : "Failed to connect");
      await stopSession();
    } finally {
      startingRef.current = false;
    }
  }

  const busy =
    status === "connecting" ||
    status === "listening" ||
    status === "speaking";

  return (
    <>
      <button
        type="button"
        className={`voice-fab${busy ? " is-active" : ""}${status === "speaking" ? " is-speaking" : ""}`}
        aria-label={busy ? "End call with AI sales agent" : "Talk to AI sales agent"}
        onClick={() => {
          if (busy || startingRef.current) {
            void stopSession();
            return;
          }
          void startSession();
        }}
      >
        <Image
          src="/bot.png"
          alt="AI sales agent"
          width={72}
          height={72}
          className="voice-fab-avatar"
          priority
        />
        <span className="voice-fab-label">
          {busy ? "End call" : "AI sales agent"}
        </span>
      </button>

      {open && (
        <div className="voice-panel" role="dialog" aria-label="AI sales agent">
          <div className="voice-panel-head">
            <div className="voice-panel-brand">
              <Image
                src="/bot.png"
                alt=""
                width={48}
                height={48}
                className="voice-panel-avatar"
              />
              <div>
                <p className="voice-eyebrow">Live AI sales agent</p>
                <h3>Schoenherr sales desk</h3>
              </div>
            </div>
            <button
              type="button"
              className="voice-close"
              onClick={() => {
                void stopSession();
                setOpen(false);
              }}
            >
              Close
            </button>
          </div>

          <p className="voice-status" data-status={status}>
            {status === "idle" && "Ready when you are"}
            {status === "connecting" && "Connecting secure voice session…"}
            {status === "listening" && "Listening — your turn to speak"}
            {status === "speaking" && "Sales agent speaking (mic paused)"}
            {status === "error" && "Something went wrong"}
          </p>

          {error && (
            <p className="voice-error" role="alert">
              {error}
            </p>
          )}

          <div className="voice-transcript">
            {lines.length === 0 && (
              <p className="voice-empty">
                Try: “Yesterday there was a hailstorm and I found granules by my
                gutters — what should I do?”
              </p>
            )}
            {lines.map((line, i) => (
              <div
                key={`${i}-${line.role}`}
                className={`voice-line ${line.role}`}
              >
                <span>
                  {line.role === "user"
                    ? "You"
                    : line.role === "assistant"
                      ? "Sales agent"
                      : "System"}
                </span>
                <p>{line.text}</p>
              </div>
            ))}
          </div>

          <div className="voice-actions">
            {!busy ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => void startSession()}
              >
                Start talking
              </button>
            ) : (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => void stopSession()}
              >
                Hang up
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
