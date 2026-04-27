module.exports = async (req, res) => {
  const targetPath = req.url.replace(/^\/cover/, "") || "/";
  const fullTarget = `https://uploads.mangadex.org${targetPath}`;

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(fullTarget, {
      headers: {
        Referer: "https://mangadex.org",
        "User-Agent": "Mozilla/5.0",
        "Accept-Encoding": "identity",
      },
    });

    const BLOCKED_HEADERS = [
      "transfer-encoding",
      "connection",
      "content-encoding",
    ];
    response.headers.forEach((value, key) => {
      if (!BLOCKED_HEADERS.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buffer = await response.arrayBuffer();
    res.status(response.status).end(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
