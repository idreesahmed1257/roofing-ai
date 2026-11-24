import {
  GoogleGenAI,
  Modality,
  Type,
  type FunctionDeclaration,
  type LiveConnectConfig,
} from "@google/genai";
import { NextResponse } from "next/server";
import { getGeminiApiKey, getLiveModel } from "@/lib/env";
import { RECEPTIONIST_SYSTEM_PROMPT } from "@/lib/prompts";

const searchTool: FunctionDeclaration = {
  name: "search_company_knowledge",
  description:
    "Search Schoenherr Roofing knowledge base for services, materials, storm guidance, FAQs, locations, and process.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Natural language search query",
      },
    },
    required: ["query"],
  },
};

const bookTool: FunctionDeclaration = {
  name: "book_estimate",
  description:
    "Book a no-pressure estimate / consultation after collecting contact details.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      phone: { type: Type.STRING },
      email: { type: Type.STRING },
      address: { type: Type.STRING },
      issue_summary: { type: Type.STRING },
      preferred_time: { type: Type.STRING },
    },
    required: ["name", "phone", "issue_summary"],
  },
};

export async function POST() {
  try {
    const apiKey = getGeminiApiKey();
    const model = getLiveModel();
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1alpha" },
    });

    const expireTime = new Date(Date.now() + 30 * 60_000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 2 * 60_000).toISOString();

    const liveConfig: LiveConnectConfig = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: RECEPTIONIST_SYSTEM_PROMPT,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" },
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      tools: [{ functionDeclarations: [searchTool, bookTool] }],
    };

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        httpOptions: { apiVersion: "v1alpha" },
        liveConnectConstraints: {
          model,
          config: liveConfig,
        },
      },
    });

    if (!token.name) {
      throw new Error("Ephemeral token missing name");
    }

    return NextResponse.json({
      token: token.name,
      model,
      expireTime,
      newSessionExpireTime,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: liveConfig.speechConfig,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });
  } catch (error) {
    console.error("voice token failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create voice session token",
      },
      { status: 500 },
    );
  }
}
