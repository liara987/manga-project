const PROXY_CONFIG = [
  {
    context: ["/manga", "/cover", "/chapter", "/at-home"],
    target: "https://api.mangadex.org",
    secure: true,
    changeOrigin: true,
  },
  {
    context: ["/covers", "/data"],
    target: "https://uploads.mangadex.org",
    secure: true,
    changeOrigin: true,
  },
];

module.exports = PROXY_CONFIG;
