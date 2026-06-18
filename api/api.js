const https = require("https");

module.exports = async (req, res) => {
  const targetPath = req.url.replace(/^\/api/, ""); // → /manga?limit=96&offset=1&...
  const fullTarget = `https://api.mangadex.org${targetPath}`; // query string já inclusa
  const data = await response.text();
  console.log("Status:", response.status);
  console.log("CF-Ray:", response.headers.get("cf-ray"));
  console.log("Body preview:", data.slice(0, 200)); // ver se é HTML do Cloudflare

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
        "User-Agent": "manga-project/1.0 (987.liara@gmail.com)",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
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
