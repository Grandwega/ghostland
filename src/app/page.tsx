"use client";

import { useMemo, useState } from "react";

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

  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawJson = useMemo(() => {
    if (!game) return "";
    return JSON.stringify(game, null, 2);
  }, [game]);

  const createGame = async () => {
    setLoading(true);
    setError("");
    setGame(null);
    setCopied(false);

    try {
      const res = await fetch("/api/create-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text(); // läs alltid text först

      let data: any = null;
      if (contentType.includes("application/json")) {
        data = raw ? JSON.parse(raw) : null;
      } else {
        data = { error: raw || `Servern svarade med ${res.status}` };
      }

      if (!res.ok) {
        throw new Error(data?.error || `Serverfel (${res.status})`);
      }

      setGame(data.game);
    } catch (e: any) {
      setError(e?.message || "Fel");
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!game) return;
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setError("Kunde inte kopiera (blockerad av webbläsaren).");
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Ghostland</h1>
      <p className="mb-6 text-neutral-600">
        Skriv en idé → få en spelspec. (Nästa: spelbar output)
      </p>

      <label className="block text-sm font-medium mb-2">Din idé</label>
      <textarea
        className="w-full border rounded-2xl p-4 min-h-36 focus:outline-none focus:ring-2 focus:ring-black/10"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder='Ex: "Ett neon obby-spel med coins och 3 banor"'
      />

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={createGame}
          disabled={loading || !idea.trim()}
          className="px-5 py-2 rounded-2xl border bg-black text-white disabled:opacity-50"
        >
          {loading ? "Skapar..." : "Skapa spel"}
        </button>

        <button
          onClick={() => {
            setIdea("");
            setGame(null);
            setError("");
            setCopied(false);
          }}
          disabled={loading}
          className="px-5 py-2 rounded-2xl border disabled:opacity-50"
        >
          Rensa
        </button>
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {game && (
        <section className="mt-8 space-y-4">
          <div className="border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{game.title}</h2>
                <p className="text-sm text-neutral-600 mt-1">
                  {game.genre} • {game.theme} • svårighet: {game.difficulty}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={copyJson} className="px-4 py-2 rounded-xl border">
                  {copied ? "Kopierad!" : "Kopiera JSON"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <div className="text-xs uppercase text-neutral-500">Objective</div>
                <div className="text-sm">{game.objective}</div>
              </div>

              <div>
                <div className="text-xs uppercase text-neutral-500">Core mechanics</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {game.coreMechanics.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2 py-1 rounded-full border bg-neutral-50"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="border rounded-xl p-3">
                  <div className="text-xs uppercase text-neutral-500">Map</div>
                  <div className="text-sm mt-1">
                    {game.map.size} • {game.map.zones.length} zoner
                  </div>
                </div>
                <div className="border rounded-xl p-3">
                  <div className="text-xs uppercase text-neutral-500">Coins</div>
                  <div className="text-sm mt-1">{game.systems.coins ? "På" : "Av"}</div>
                </div>
                <div className="border rounded-xl p-3">
                  <div className="text-xs uppercase text-neutral-500">Time limit</div>
                  <div className="text-sm mt-1">{game.systems.timeLimitSec}s</div>
                </div>
              </div>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                checked={showRaw}
                onChange={(e) => setShowRaw(e.target.checked)}
              />
              Visa rå JSON
            </label>

            {showRaw && (
              <pre className="mt-3 p-4 border rounded-xl overflow-auto text-sm whitespace-pre-wrap bg-neutral-50">
                {rawJson}
              </pre>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
