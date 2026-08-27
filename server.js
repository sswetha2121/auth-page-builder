/* =========================================================
   AUTH PAGE BUILDER - STATIC DEV SERVER
   File: server.js
========================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURIComponent(req.url.split("?")[0]);
  if (reqUrl === "/") reqUrl = "/index.html";

  const filePath = path.normalize(path.join(ROOT_DIR, reqUrl));

  // Security check: ensure within root dir
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`404 Not Found: ${reqUrl}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache"
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n==================================================`);
  console.log(`  AUTH PAGE BUILDER SERVER RUNNING`);
  console.log(`==================================================`);
  console.log(`  Local URL:    http://localhost:${PORT}/`);
  console.log(`  Loopback URL: http://127.0.0.1:${PORT}/`);
  console.log(`==================================================\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is busy, retrying on port ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1, "0.0.0.0");
  } else {
    console.error("Server error:", err);
  }
});
