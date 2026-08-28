/* =========================================================
   AUTH PAGE BUILDER - DATABASE CONFIGURATION & POOL
   File: backend/config/database.js
========================================================= */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const mysql = require("mysql2/promise");
const fs = require("fs");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "internship",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 8000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create reusable connection pool
let pool = mysql.createPool(dbConfig);

let isConnected = false;

/**
 * Test database connectivity and safely run non-destructive schema migrations
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    isConnected = true;
    console.log(`[DB] Connected successfully to MySQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`);
    
    // Safely run table creation if not existing
    try {
      const schemaPath = path.join(__dirname, "..", "migrations", "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");
        const statements = schemaSql
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith("--"));

        for (const statement of statements) {
          await connection.query(statement);
        }
        console.log("[DB] Verified required tables (auth_user, auth_configurations) are ready.");
      }
    } catch (schemaErr) {
      console.warn("[DB] Schema verification warning:", schemaErr.message);
    } finally {
      connection.release();
    }

    return true;
  } catch (error) {
    isConnected = false;
    console.error("[DB] Database connection error:", error.code || error.message);
    console.warn("[DB] Running in disconnected mode. Check DB_PASSWORD or network credentials.");
    return false;
  }
}

module.exports = {
  get pool() {
    return pool;
  },
  set pool(newPool) {
    pool = newPool;
  },
  getPool: () => pool,
  setPool: (newPool) => { pool = newPool; },
  testConnection,
  isDbConnected: () => isConnected
};
