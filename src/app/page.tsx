"use client";

import { useState } from "react";

export default function HomePage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState("");

  const createGame = async () => {
    setLoading(true);
    setError("");
    setGame(null);

    try {
      const res = await fetch("/api/create-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Något gick fel");

      setGame(data.game);
    } catch (e: any) {
      setError(e.message || "Fel");
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
        className="mt-4 px-5 py-2 rounded-xl border"
      >
        {loading ? "Skapar spel..." : "Skapa spel"}
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {game && (
        <pre className="mt-6 p-4 border rounded-xl overflow-auto text-sm">
          {JSON.stringify(game, null, 2)}
        </pre>
      )}
    </main>
  );
}
