import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // viktigt på Vercel (OpenAI SDK kör Node, inte Edge)

const apiKey = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY saknas på servern (Vercel env var)." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const idea = body?.idea;

    if (!idea || typeof idea !== "string") {
      return NextResponse.json({ error: "Spelidé saknas" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });

    const system = `
Du är en spel-designer.
Returnera ENDAST giltig JSON i detta format:
{
  "title": "string",
  "genre": "obby | wave_survival | topdown_shooter",
  "theme": "string",
  "objective": "string",
  "coreMechanics": ["string", "string"],
  "difficulty": "easy | medium | hard",
  "map": {
    "size": "small | medium | large",
    "zones": ["string", "string"]
  },
  "systems": {
    "coins": true,
    "enemies": number,
    "timeLimitSec": number
  }
}
Ingen annan text.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: system.trim() },
        { role: "user", content: idea.trim() },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";

    // Om modellen råkar svara med ```json ... ``` så strippar vi
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let game: any;
    try {
      game = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI-svaret var inte giltig JSON", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Okänt serverfel" },
      { status: 500 }
    );
  }
}
