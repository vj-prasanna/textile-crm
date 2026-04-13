import { NextRequest, NextResponse } from "next/server";
import { generateInsights, askBusinessQuestion, BusinessSummary } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  console.log("[AI route] POST /api/ai/insights — start");

  let body: { type: string; summary: BusinessSummary; question?: string };

  try {
    body = await req.json() as typeof body;
    console.log(`[AI route] type="${body.type}", summary keys=${Object.keys(body.summary ?? {}).join(",")}`);
  } catch (parseErr) {
    console.error("[AI route] Failed to parse request body:", parseErr);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.type === "insights") {
      console.log("[AI route] Calling generateInsights...");
      const insights = await generateInsights(body.summary);
      console.log("[AI route] generateInsights OK");
      return NextResponse.json(insights);
    }

    if (body.type === "ask") {
      const question = body.question?.trim();
      if (!question) {
        return NextResponse.json({ error: "Question is required" }, { status: 400 });
      }
      console.log(`[AI route] Calling askBusinessQuestion: "${question.slice(0, 60)}..."`);
      const answer = await askBusinessQuestion(body.summary, question);
      console.log("[AI route] askBusinessQuestion OK");
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: `Unknown type: ${body.type}` }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI route] Error:", message);
    if (err instanceof Error && err.stack) {
      console.error("[AI route] Stack:", err.stack);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Simple health check — GET /api/ai/insights returns 200 if route is reachable */
export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;
  console.log(`[AI route] GET health check — GEMINI_API_KEY set: ${hasKey}`);
  return NextResponse.json({
    status: "ok",
    geminiKeyConfigured: hasKey,
    model: "gemini-1.5-flash",
  });
}
