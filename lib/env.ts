export function getGeminiApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GEMENI_API_KEY?.trim() ||
    "";
  if (!key) {
    throw new Error(
      "Missing GEMINI_API_KEY (or GEMENI_API_KEY) in environment",
    );
  }
  return key;
}

export function getLiveModel(): string {
  return (
    process.env.GEMINI_LIVE_MODEL?.trim() ||
    "gemini-2.5-flash-native-audio-preview-12-2025"
  );
}

export function getEmbedDim(): number {
  const n = Number(process.env.GEMINI_EMBED_DIM || "768");
  return Number.isFinite(n) && n > 0 ? n : 768;
}
