/* =========================================================
   AUTH PAGE BUILDER - STANDALONE EXPORTED SERVER
   File: server.js
========================================================= */

const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

// Content types map for fallback static serving
const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

function renderDemoDashboardHTML(targetPath) {
  const safeTarget = String(targetPath || "/dashboard").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Authentication Successful | Application Dashboard Demo</title>
  <style>
    body {
      margin: 0; padding: 0;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: #0f172a; color: #f8fafc;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .demo-card {
      background: rgba(30, 41, 59, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; padding: 40px; max-width: 560px; width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); text-align: center;
    }
    .success-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(34, 197, 94, 0.15); color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 6px 16px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-bottom: 20px;
    }
    h1 { margin: 0 0 12px; font-size: 26px; font-weight: 700; }
    p { color: #94a3b8; margin: 0 0 24px; font-size: 15px; line-height: 1.6; }
    .info-box {
      background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 24px; font-size: 14px;
    }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .info-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .val { color: #38bdf8; font-weight: 600; font-family: monospace; }
    .btn-return {
      display: inline-block; background: #2563eb; color: #fff; text-decoration: none;
      padding: 12px 24px; border-radius: 8px; font-weight: 600; transition: background 0.2s;
    }
    .btn-return:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="demo-card">
    <div class="success-badge">✓ Authentication Successful</div>
    <h1>Welcome to your Application</h1>
    <p>You have successfully logged in via your custom authentication page. This page is served by your standalone local server to verify your configured redirect destination.</p>
    <div class="info-box">
      <div class="info-row"><span class="label">Configured Destination:</span><span class="val">${safeTarget}</span></div>
      <div class="info-row"><span class="label">Status:</span><span class="val">HTTP 200 OK (Demo Route)</span></div>
      <div class="info-row"><span class="label">Package:</span><span class="val">Standalone Auth Package</span></div>
    </div>
    <a href="/" class="btn-return">← Back to Auth Page</a>
  </div>
</body>
</html>`;
}

function serveFile(res, filePath, overrideMime = null) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
      res.end("404 The requested path could not be found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = overrideMime || MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

function createBuiltinServer() {
  return http.createServer((req, res) => {
    // Normalize URL path
    let reqPath = decodeURIComponent(req.url.split("?")[0]);
    if (reqPath === "/") {
      reqPath = "/index.html";
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
    let filePath = path.join(ROOT, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        // If file extension exists or API path, return 404
        if (path.extname(safePath) || reqPath.startsWith("/api/")) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
          res.end("404 The requested path could not be found");
          return;
        }
        // Fallback for relative application demo routes (e.g. /dashboard)
        res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(renderDemoDashboardHTML(reqPath));
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      serveFile(res, filePath);
    });
  });
}

function startServer() {
  let appServer = null;

  // Try loading express if available
  try {
    const express = require("express");
    const app = express();

    app.use(express.static(ROOT, { index: "index.html" }));

    app.get("/", (req, res) => {
      res.sendFile(path.join(ROOT, "index.html"));
    });

    app.get("/config/auth-config.json", (req, res) => {
      res.sendFile(path.join(ROOT, "config", "auth-config.json"));
    });

    app.use((req, res, next) => {
      if (req.method === "GET" && !path.extname(req.path) && !req.path.startsWith("/api/")) {
        return res.status(200).send(renderDemoDashboardHTML(req.path));
      }
      next();
    });

    appServer = http.createServer(app);
  } catch (e) {
    // Zero-dependency fallback server using built-in http & fs
    appServer = createBuiltinServer();
  }

  appServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} busy, trying ${Number(PORT) + 1}...`);
      process.env.PORT = String(Number(PORT) + 1);
      setTimeout(startServer, 150);
    } else {
      console.error("Standalone server error:", err);
    }
  });

  appServer.listen(PORT, () => {
    const actualPort = appServer.address().port;
    console.log(`\n==================================================`);
    console.log(`  AUTH PAGE STANDALONE SERVER RUNNING`);
    console.log(`==================================================`);
    console.log(`  Local URL: http://localhost:${actualPort}/`);
    console.log(`  Config:    http://localhost:${actualPort}/config/auth-config.json`);
    console.log(`==================================================\n`);
  });

  return appServer;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
