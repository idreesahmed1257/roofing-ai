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

/** Presence-only env check for diagnostics (never returns secret values). */
export function getEnvHealth() {
  const has = (value: string | undefined) => Boolean(value?.trim());

  const env = {
    GEMINI_API_KEY: has(
      process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY,
    ),
    UPSTASH_VECTOR_REST_URL: has(process.env.UPSTASH_VECTOR_REST_URL),
    UPSTASH_VECTOR_REST_TOKEN: has(process.env.UPSTASH_VECTOR_REST_TOKEN),
    GEMINI_LIVE_MODEL: has(process.env.GEMINI_LIVE_MODEL),
    GEMINI_EMBED_DIM: has(process.env.GEMINI_EMBED_DIM),
  };

  const required = [
    "GEMINI_API_KEY",
    "UPSTASH_VECTOR_REST_URL",
    "UPSTASH_VECTOR_REST_TOKEN",
  ] as const;

  const missing = required.filter((key) => !env[key]);

  return {
    ok: missing.length === 0,
    env,
    missing: [...missing],
    liveModel: getLiveModel(),
    note:
      "Set missing keys in Vercel → Project → Settings → Environment Variables (Production), then redeploy. .env files are gitignored and are not uploaded automatically.",
  };
}
