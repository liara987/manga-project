module.exports = async (req, res) => {
  const targetPath = req.url.replace(/^\/api/, ""); // → /manga?limit=96&offset=1&...
  const fullTarget = `https://api.mangadex.org${targetPath}`; // query string já inclusa

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const MAX_ATTEMPTS = 3;
  let lastErr;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // `keepalive: false` avoids handing this request a socket that Vercel's
      // frozen/thawed Lambda kept "alive" but the remote side already closed —
      // that's what causes silent, partial bodies (no thrown error, just a
      // truncated string) instead of a clean connection error.
      const response = await fetch(fullTarget, {
        keepalive: false,
        headers: {
          "User-Agent":
            "manga-project/1.0 (+https://manga-project-w833.vercel.app)",
          "Accept-Encoding": "identity",
          Connection: "close",
        },
      });

      const raw = await response.text();

      if (!response.ok) {
        // Pass upstream errors through as-is (already valid JSON from MangaDex).
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(response.status).end(raw);
        return;
      }

      // Validate the body is actually complete, well-formed JSON before
      // trusting it. A truncated fetch produces a SyntaxError here instead
      // of silently forwarding broken data to the browser.
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        lastErr = parseErr;
        if (attempt < MAX_ATTEMPTS) continue; // retry on truncation
        throw new Error(
          `Upstream returned incomplete JSON after ${MAX_ATTEMPTS} attempts: ${parseErr.message}`,
        );
      }

      // Re-serialize ourselves so Content-Length is computed by Node from
      // the exact bytes we're about to write — never forwarded from upstream.
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.status(response.status).json(parsed);
      return;
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_ATTEMPTS) {
        res.status(502).json({
          error: "Failed to fetch valid response from MangaDex",
          detail: err.message,
        });
        return;
      }
    }
  }
};
