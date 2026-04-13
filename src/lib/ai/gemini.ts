/**
 * Gemini AI client using the REST API directly with a hard timeout.
 * The timeout ensures we always respond before nginx's proxy_read_timeout fires.
 */

const MODEL = "gemini-2.5-flash-lite"; // confirmed available for this API key
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 25_000; // 25s — respond before nginx's default 60s (or shorter custom) timeout

interface GeminiCandidate {
  content: { parts: { text: string }[] };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { code: number; message: string; status: string };
}

/** Strip markdown code fences Gemini sometimes wraps around JSON */
function extractJSON(raw: string): string {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

async function callGemini(prompt: string, jsonMode: boolean): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`;

  console.log(`[Gemini] → calling ${MODEL}, jsonMode=${jsonMode}, prompt length=${prompt.length}`);

  // Explicit abort controller so we always respond before nginx times out
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
    console.error(`[Gemini] ✗ aborted after ${TIMEOUT_MS / 1000}s timeout`);
  }, TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          ...(jsonMode && { responseMimeType: "application/json" }),
        },
      }),
    });

    const raw = await res.text();
    console.log(`[Gemini] ← HTTP ${res.status} (${raw.length} bytes)`);

    if (!res.ok) {
      // Try to parse Google's error body
      let detail = raw.slice(0, 300);
      try {
        const parsed = JSON.parse(raw) as GeminiResponse;
        if (parsed.error) detail = `${parsed.error.status}: ${parsed.error.message}`;
      } catch { /* not JSON */ }
      throw new Error(`Gemini API error ${res.status}: ${detail}`);
    }

    const data = JSON.parse(raw) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned an empty response body");

    console.log(`[Gemini] ✓ got response (${text.length} chars)`);
    return text.trim();
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new Error(`Gemini request timed out after ${TIMEOUT_MS / 1000}s. Check your API key and network.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ─── Types ─── */

export interface AIInsights {
  salesForecast: string;
  followUpSuggestions: string;
  dealRiskAlerts: string;
  weeklySummary: string;
}

export interface BusinessSummary {
  totalRevenue: number;
  activeOrders: number;
  unpaidOrders: number;
  totalCustomers: number;
  pipelineValue: number;
  topCustomers: { name: string; revenue: number; orders: number }[];
  dealsByStage: { stage: string; count: number; value: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentPayments: { contact: string; amount: number; method: string }[];
}

/* ─── API functions ─── */

export async function generateInsights(summary: BusinessSummary): Promise<AIInsights> {
  const prompt = `You are a business analyst for a textile company in India. Analyse this compact business summary and provide concise, actionable insights.

SUMMARY (INR):
${JSON.stringify(summary)}

Reply with ONLY a valid JSON object with exactly these 4 keys:
{
  "salesForecast": "2-3 sentences predicting revenue trends based on orders and pipeline",
  "followUpSuggestions": "2-3 sentences identifying customers needing follow-up (inactive, unpaid invoices)",
  "dealRiskAlerts": "2-3 sentences highlighting deals at risk (stuck stages, low probability)",
  "weeklySummary": "2-3 sentences summarising overall business health and key wins this week"
}`;

  const text = await callGemini(prompt, true);
  return JSON.parse(extractJSON(text)) as AIInsights;
}

export async function askBusinessQuestion(
  summary: BusinessSummary,
  question: string
): Promise<string> {
  const prompt = `You are a business analyst for a textile company in India. Use the business summary below to answer the question concisely.

SUMMARY (INR):
${JSON.stringify(summary)}

QUESTION: ${question}

Answer in 2-4 sentences with specific numbers and actionable advice.`;

  return callGemini(prompt, false);
}
