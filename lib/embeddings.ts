import { GoogleGenAI } from "@google/genai";
import { getEmbedDim, getGeminiApiKey } from "./env";

function l2Normalize(values: number[]): number[] {
  let sum = 0;
  for (const v of values) sum += v * v;
  const norm = Math.sqrt(sum) || 1;
  return values.map((v) => v / norm);
}

export async function embedTexts(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT",
): Promise<number[][]> {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  const dim = getEmbedDim();
  const vectors: number[][] = [];

  for (const text of texts) {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        taskType,
        outputDimensionality: dim,
      },
    });

    const values = result.embeddings?.[0]?.values;
    if (!values?.length) {
      throw new Error("Empty embedding returned from Gemini");
    }

    // gemini-embedding-001 requires manual normalization when not using 3072 dims
    vectors.push(dim === 3072 ? values : l2Normalize(values));
  }

  return vectors;
}

export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embedTexts([query], "RETRIEVAL_QUERY");
  return vector;
}
