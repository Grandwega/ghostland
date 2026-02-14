"use client";

import { useState } from "react";

type GameData = {
  title: string;
  genre: string;
  theme: string;
  objective: string;
  coreMechanics: string[];
  difficulty: "easy" | "medium" | "hard";
  map: {
    size: "small" | "medium" | "large";
    zones: string[];
  };
  systems: {
    coins: boolean;
    enemies: number;
    timeLimitSec: number;
  };
};

export default function HomePage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<GameData | null>(null);
  const [error, setError] = useState("");

  const createGame = async () => {
    setLoading(true);
    setError("");
    setGame(null);

    try {
      const text = idea.trim();
      const lower = text.toLowerCase();

      // Liten "AI-känsla"
      await new Promise((r) => setTimeout(r, 700));

      const hasNeon = lower.includes("neon");
      const hasObby = lower.includes("obby");
      const hasCoin = lower.includes("coin");
      const hasHard = lower.includes("svår") || lower.includes("hard");
      const hasEasy = lower.includes("lätt") || lower.includes("easy");

      const generated: GameData = {
        title: hasNeon
          ? "Neon Obby: Ljusbanan"
          : hasObby
          ? "Ghostland Obby Challenge"
          : "Ghostland Adventure",
        genre: hasObby ? "obby" : "platformer",
        theme: hasNeon ? "neon cyberpunk" : "fantasy",
        objective: `Byggt från idé: "${text}"`,
        coreMechanics: [
          "precision hopping",
          hasCoin ? "coinsamling" : "poängjakt",
          "checkpoint-system",
        ],
        difficulty: hasHard ? "hard" : hasEasy ? "easy" : "medium",
        map: {
          size: "medium",
          zones: ["Bana 1", "Bana 2", "Bana 3"],
        },
        systems: {
          coins: hasCoin || hasObby,
          enemies: 0,
          timeLimitSec: hasHard ? 180 : 240,
        },
      };

      setGame(generated);
    } catch (e: any) {
      setError(e?.message || "Fel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Ghostland - Skapa spel med AI</h1>
      <p className="mb-4">Beskriv spelet du vill skapa.</p>

      <textarea
        className="w-full border rounded-xl p-3 min-h-36"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder='Ex: "Ett neon obby-spel med coins och 3 banor"'
      />

      <button
        onClick={createGame}
        disabled={loading || !idea.trim()}
        className="mt-4 px-5 py-2 rounded-xl border disabled:opacity-50"
      >
        {loading ? "Skapar spel..." : "Skapa spel"}
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {game && (
        <pre className="mt-6 p-4 border rounded-xl overflow-auto text-sm whitespace-pre-wrap">
          {JSON.stringify(game, null, 2)}
        </pre>
      )}
    </main>
  );
}
