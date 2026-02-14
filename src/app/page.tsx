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
      // om servern skickar HTML/inget alls
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
