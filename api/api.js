const https = require('https');

module.exports = async (req, res) => {
  // Remove o prefixo /api da URL
  const targetPath = req.url.replace(/^\/api/, '') || '/';
  const targetUrl = `https://api.mangadex.org${targetPath}`;

  // Monta a query string
  const url = new URL(req.url, 'http://localhost');
  const queryString = url.search;
  const fullTarget = `https://api.mangadex.org${targetPath}${queryString}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(fullTarget, {
      headers: {
        'Referer': 'https://mangadex.org',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const data = await response.text();
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.end(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
