/* =========================================================
   AUTH PAGE BUILDER - UNIFIED EXPRESS SERVER & API
   File: server.js
========================================================= */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { testConnection, isDbConnected } = require("./backend/config/database");

// Route imports
const authRoutes = require("./backend/routes/auth.routes");
const configurationRoutes = require("./backend/routes/configuration.routes");
const { errorHandler } = require("./backend/middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// 1. Global Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 2. Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: isDbConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/configurations", configurationRoutes);

// Compatibility aliases
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", configurationRoutes);
app.use("/api/projects", configurationRoutes);

// 4. Serve Static Frontend Files
app.use(express.static(ROOT_DIR, {
  index: "index.html",
  maxAge: 0
}));

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

// 5. Centralized Error Handling
app.use(errorHandler);

const http = require("http");

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
