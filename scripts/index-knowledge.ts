import { config } from "dotenv";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { embedTexts } from "../lib/embeddings";
import { getVectorIndex } from "../lib/upstash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

config({ path: path.join(root, ".env.local") });
config({ path: path.join(root, ".env") });
config({ path: path.join(root, "..", ".env") });

function chunkMarkdown(source: string, text: string): { id: string; title: string; text: string }[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const sections = cleaned.split(/\n(?=#{1,3}\s)/);
  const chunks: { id: string; title: string; text: string }[] = [];
  let part = 0;

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    const titleMatch = trimmed.match(/^#{1,3}\s+(.+)$/m);
    const title = titleMatch?.[1]?.trim() || source;
    const pieces =
      trimmed.length > 1800
        ? trimmed.match(/[\s\S]{1,1600}(?=\n|$)/g) || [trimmed]
        : [trimmed];

    for (const piece of pieces) {
      const body = piece.trim();
      if (body.length < 40) continue;
      part += 1;
      chunks.push({
        id: `${source.replace(/\.md$/i, "")}-${part}`,
        title,
        text: body,
      });
    }
  }

  return chunks;
}

async function main() {
  const knowledgeDir = path.join(root, "knowledge");
  const files = (await readdir(knowledgeDir))
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (!files.length) {
    throw new Error(`No markdown files in ${knowledgeDir}`);
  }

  const allChunks: {
    id: string;
    source: string;
    title: string;
    text: string;
  }[] = [];

  for (const file of files) {
    const raw = await readFile(path.join(knowledgeDir, file), "utf8");
    for (const chunk of chunkMarkdown(file, raw)) {
      allChunks.push({ ...chunk, source: file });
    }
  }

  console.log(`Indexing ${allChunks.length} chunks from ${files.length} files...`);

  const index = getVectorIndex();
  const batchSize = 8;

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const vectors = await embedTexts(batch.map((c) => c.text));
    await index.upsert(
      batch.map((c, j) => ({
        id: c.id,
        vector: vectors[j],
        metadata: {
          source: c.source,
          title: c.title,
          text: c.text.slice(0, 3500),
        },
      })),
    );
    console.log(`Upserted ${Math.min(i + batchSize, allChunks.length)}/${allChunks.length}`);
  }

  console.log("Done. Knowledge is ready for the voice bot.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
