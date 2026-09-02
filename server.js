/* =========================================================
   AUTH PAGE BUILDER - UNIFIED EXPRESS SERVER & API
   File: server.js
========================================================= */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { testConnection, isDbConnected } = require("./backend/config/database");

const { errorHandler } = require("./backend/middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// 1. Global Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 2. Health check & Django REST API Proxy
const http = require("http");

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path === "/health/") {
    return res.status(200).json({
      status: "ok",
      backend: "django",
      timestamp: new Date().toISOString()
    });
  }

  const djangoHost = process.env.DJANGO_HOST || "127.0.0.1";
  const djangoPort = Number(process.env.DJANGO_PORT || 8000);
  const targetPath = `/api${req.url}`;

  const proxyHeaders = { ...req.headers };
  delete proxyHeaders["host"];
  delete proxyHeaders["content-length"];

  let bodyData = null;
  if (req.body && Object.keys(req.body).length > 0) {
    bodyData = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    proxyHeaders["content-type"] = "application/json";
    proxyHeaders["content-length"] = Buffer.byteLength(bodyData);
  }

  const options = {
    hostname: djangoHost,
    port: djangoPort,
    path: targetPath,
    method: req.method,
    headers: proxyHeaders
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    Object.keys(proxyRes.headers).forEach((key) => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error(`[Django Proxy Error] ${req.method} ${targetPath} ->`, err.message);
    res.status(503).json({
      success: false,
      message: "Django authentication service is currently unavailable. Please start Django server on port 8000."
    });
  });

  if (bodyData) {
    proxyReq.write(bodyData);
  }

  proxyReq.end();
});

// 4. Serve Static Frontend Files
app.use(express.static(ROOT_DIR, {
  index: "index.html",
  maxAge: 0
}));

// Static aliases for legacy or relative script paths
app.get("/js/redirectService.js", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "js", "services", "redirectService.js"));
});

// SPA Fallback: serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) {
    return next();
  }
  if (req.method === "GET") {
    return res.sendFile(path.join(ROOT_DIR, "index.html"));
  }
  next();
});

let currentPort = Number(PORT);

function startServer(port) {
  const server = http.createServer(app);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is busy, retrying on port ${port + 1}...`);
      setTimeout(() => startServer(port + 1), 150);
    } else {
      console.error("Server error:", err);
    }
  });

  server.listen(port, "0.0.0.0", async () => {
    console.log(`\n==================================================`);
    console.log(`  AUTH PAGE BUILDER SERVER RUNNING`);
    console.log(`==================================================`);
    console.log(`  Local URL:    http://localhost:${port}/`);
    console.log(`  Loopback URL: http://127.0.0.1:${port}/`);
    console.log(`  API Health:   http://localhost:${port}/api/health`);
    console.log(`==================================================\n`);

    // Verify DB connectivity
    await testConnection();
  });

  return server;
}

// Start server
if (require.main === module) {
  startServer(currentPort);
}

module.exports = { app, startServer };
