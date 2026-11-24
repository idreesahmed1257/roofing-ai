import { embedQuery } from "./embeddings";
import { getVectorIndex, type KnowledgeMetadata } from "./upstash";

export async function searchKnowledge(query: string, topK = 5) {
  const index = getVectorIndex();
  const vector = await embedQuery(query);
  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return results.map((r) => {
    const meta = (r.metadata || {}) as Partial<KnowledgeMetadata>;
    return {
      id: String(r.id),
      score: r.score ?? 0,
      source: meta.source || "unknown",
      title: meta.title || "",
      text: meta.text || "",
    };
  });
}

export function formatSearchContext(
  hits: Awaited<ReturnType<typeof searchKnowledge>>,
): string {
  if (!hits.length) {
    return "No matching knowledge found. Say you will confirm details during a consultation.";
  }
  return hits
    .map(
      (h, i) =>
        `[${i + 1}] (${h.source}${h.title ? ` — ${h.title}` : ""}, score ${h.score.toFixed(3)})\n${h.text}`,
    )
    .join("\n\n");
}
