import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY saknas i env. Lägg den i .env.local lokalt (OPENAI_API_KEY=...) och i hostens env senare."
  );
}

const client = new OpenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();

    if (!idea || typeof idea !== "string") {
      return NextResponse.json({ error: "Spelidé saknas" }, { status: 400 });
    }

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
      messages: [
        { role: "system", content: system },
        { role: "user", content: idea },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "{}";

    let game: any;
    try {
      game = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI-svaret var inte giltig JSON", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ game });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Okänt serverfel" },
      { status: 500 }
    );
  }
}
