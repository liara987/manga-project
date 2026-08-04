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
      keepalive: false,
      headers: {
        "User-Agent":
          "manga-project/1.0 (+https://manga-project-w833.vercel.app)",
        "Accept-Encoding": "identity",
        Connection: "close",
      },
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    // Only forward the headers we actually need; never trust upstream
    // content-length/transfer-encoding/connection framing on our own response.
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);

    res.status(response.status).end(buffer);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
