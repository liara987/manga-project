// Vercel Serverless Function
export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing target URL" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // Only forward safe headers
        "Content-Type": req.headers["content-type"] || "application/json",
        Authorization: req.headers["authorization"] || "",
      },
      body: req.method === "GET" ? undefined : req.body,
    });

    const contentType =
      response.headers.get("content-type") || "application/json";
    res.setHeader("Content-Type", contentType);
    res.status(response.status);

    // Stream back the data
    if (contentType.includes("application/json")) {
      const json = await response.json();
      res.json(json);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
