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
      },
    });

    const data = await response.text();
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.end(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
