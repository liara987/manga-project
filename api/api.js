const https = require("https");

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

  try {
    const response = await fetch(fullTarget, {
      headers: {
        Referer: "https://mangadex.org",
        "User-Agent": "Mozilla/5.0",
        "Accept-Encoding": "identity",
      },
    });

    const data = await response.text();

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

    res.status(response.status).end(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
