import { NextResponse } from "next/server";
import { formatSearchContext, searchKnowledge } from "@/lib/knowledge";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { query?: string };
    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const hits = await searchKnowledge(query, 5);
    return NextResponse.json({
      hits,
      context: formatSearchContext(hits),
    });
  } catch (error) {
    console.error("knowledge search failed", error);
    const message =
      error instanceof Error ? error.message : "Search failed";
    const hint = /UPSTASH|GEMINI|Missing|environment/i.test(message)
      ? " Set the missing keys in Vercel → Settings → Environment Variables, then Redeploy. Check /api/health."
      : "";
    return NextResponse.json(
      { error: `${message}${hint}` },
      { status: 500 },
    );
  }
}
