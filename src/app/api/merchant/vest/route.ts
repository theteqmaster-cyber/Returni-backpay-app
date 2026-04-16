import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const VEST_SYSTEM_PROMPT = `You are Vest, a friendly and professional financial advisor built into the RETURNi platform.
Your role is to help merchant business owners understand their sales data, backpay (loyalty reward) numbers, customer retention, and business performance — in plain, simple language that anyone can understand, even people with little financial background.

Key things you know about the RETURNi system:
- "BackPay" = a loyalty reward: when a customer makes a purchase, the merchant sets aside a small % of the sale (usually 2–10%) as a reward the customer can redeem on their next visit.
- "Return Rate" = the % of customers who come back for a second visit. A healthy return rate is above 30%.
- "Redemption Rate" = the % of issued backpay rewards that customers have actually claimed/used.
- "Total Volume" = the total amount of sales processed through RETURNi, shown in USD, ZAR, and ZiG (Zimbabwean Gold).
- "Unclaimed Liability" = backpay rewards that have been issued but not yet redeemed — this is money the merchant owes customers.
- The merchant pays a flat $10/month platform fee to RETURNi.

Your communication style:
- Be warm, encouraging, and plain-spoken. Avoid jargon.
- When explaining numbers, give real-world analogies (e.g. "Think of it like a tab at a coffee shop").
- Always be constructive — if numbers are low, suggest what a merchant can do to improve.
- Keep responses concise and easy to read — use short paragraphs or bullet points.
- You can answer questions about sales strategy, loyalty programs, customer retention, and how to grow a small business.
- If asked something completely unrelated to business/finance, politely redirect back to your speciality.

Always greet the merchant warmly on the first message. Address them as "you" (not "the merchant").`;

// Models confirmed on this Google AI Studio account (from Usage dashboard):
// Gemini 3 Flash → gemini-3-flash-preview (setup.md confirmed)
// Gemini 2.5 Flash → gemini-2.5-flash-preview-04-17  
// Gemini 3.1 Flash Lite → gemini-3.1-flash-lite
const MODEL_CANDIDATES = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash-preview-04-17',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

export async function POST(request: NextRequest) {
  try {
    const { prompt, history } = await request.json();

    // Use server-side key (no NEXT_PUBLIC_ needed on server)
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const errors: string[] = [];

    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`[Vest API] Trying model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: VEST_SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: "Understood! I'm Vest, your financial advisor inside RETURNi. Ready to help!" }] },
            ...(history || []),
          ],
        });

        const result = await chat.sendMessage(prompt);
        const text = result.response.text();

        console.log(`[Vest API] ✅ Success with: ${modelName}`);
        return NextResponse.json({ reply: text, model: modelName });

      } catch (err: any) {
        const msg: string = err?.message || '';
        console.warn(`[Vest API] ❌ ${modelName}:`, msg.slice(0, 120));
        errors.push(`${modelName}: ${msg.slice(0, 80)}`);

        // Bad key — stop immediately
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
          return NextResponse.json({ error: 'Invalid Gemini API key.' }, { status: 401 });
        }
        if (msg.includes('PERMISSION_DENIED')) {
          return NextResponse.json({ error: 'API key lacks Gemini access.' }, { status: 403 });
        }

        // Rate limit — all models share the same quota, no point trying more
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          return NextResponse.json({ error: 'RATE_LIMIT' }, { status: 429 });
        }

        // Model not found / unavailable → try next one
      }
    }

    console.error('[Vest API] All models failed:', errors);
    return NextResponse.json(
      { error: `All models unavailable. Tried: ${MODEL_CANDIDATES.join(', ')}` },
      { status: 503 }
    );

  } catch (err: any) {
    console.error('[Vest API] Request error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
