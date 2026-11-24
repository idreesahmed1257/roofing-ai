/** Convert Float32 mono PCM from Web Audio into 16-bit PCM Int16Array. */
export function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** Downsample audio to 16kHz for Gemini Live input. */
export function downsampleTo16k(
  input: Float32Array,
  inputSampleRate: number,
): Float32Array {
  if (inputSampleRate === 16000) return input;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.floor(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const idx = Math.floor(i * ratio);
    result[i] = input[idx];
  }
  return result;
}

/** RMS energy — used to ignore near-silent frames when gating mic. */
export function rmsLevel(samples: Float32Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

export class PcmPlayer {
  private ctx: AudioContext;
  private nextTime = 0;
  private readonly sampleRate: number;
  private sources = new Set<AudioBufferSourceNode>();
  private playingCount = 0;
  private drainTimer: ReturnType<typeof setTimeout> | null = null;
  private onDrainCb: (() => void) | null = null;

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
    this.ctx = new AudioContext({ sampleRate });
  }

  async resume() {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  get isPlaying() {
    return this.playingCount > 0 || this.nextTime > this.ctx.currentTime + 0.05;
  }

  /** Fires once after queued playback finishes (+ optional grace ms). */
  onDrain(cb: (() => void) | null, graceMs = 350) {
    this.onDrainCb = cb
      ? () => {
          if (this.drainTimer) clearTimeout(this.drainTimer);
          this.drainTimer = setTimeout(() => {
            this.drainTimer = null;
            if (!this.isPlaying) cb();
          }, graceMs);
        }
      : null;
  }

  private maybeDrain() {
    if (this.playingCount === 0) {
      this.onDrainCb?.();
    }
  }

  stop() {
    if (this.drainTimer) clearTimeout(this.drainTimer);
    this.drainTimer = null;
    this.onDrainCb = null;
    for (const source of this.sources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // already stopped
      }
    }
    this.sources.clear();
    this.playingCount = 0;
    this.nextTime = 0;
    void this.ctx.close();
  }

  enqueueBase64Pcm16(base64: string) {
    if (this.ctx.state === "closed") {
      this.ctx = new AudioContext({ sampleRate: this.sampleRate });
      this.nextTime = 0;
    }

    const buffer = base64ToArrayBuffer(base64);
    const int16 = new Int16Array(buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 0x8000;
    }

    const audioBuffer = this.ctx.createBuffer(
      1,
      float32.length,
      this.sampleRate,
    );
    audioBuffer.copyToChannel(float32, 0);
    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    if (this.nextTime < now) this.nextTime = now + 0.02;
    const startAt = this.nextTime;
    this.nextTime += audioBuffer.duration;

    this.playingCount += 1;
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      this.playingCount = Math.max(0, this.playingCount - 1);
      this.maybeDrain();
    };
    source.start(startAt);
  }

  /** Clear queued playback after barge-in / interruption. */
  interrupt() {
    if (this.drainTimer) clearTimeout(this.drainTimer);
    this.drainTimer = null;
    for (const source of this.sources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // already stopped
      }
    }
    this.sources.clear();
    this.playingCount = 0;
    void this.ctx.close();
    this.ctx = new AudioContext({ sampleRate: this.sampleRate });
    this.nextTime = 0;
  }
}
