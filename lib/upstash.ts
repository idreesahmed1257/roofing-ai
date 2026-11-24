import { Index } from "@upstash/vector";

export function getVectorIndex() {
  const url = process.env.UPSTASH_VECTOR_REST_URL?.replace(/^"|"$/g, "");
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN?.replace(/^"|"$/g, "");
  if (!url || !token) {
    throw new Error("Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN");
  }
  return new Index({ url, token });
}

export type KnowledgeMetadata = {
  source: string;
  title: string;
  text: string;
};
