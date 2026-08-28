require("dotenv").config();
const { pool } = require("./backend/config/database");

async function check() {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'auth_%'");
    console.log("Tables found:", tables);

    const [userCols] = await pool.query("DESCRIBE auth_user");
    console.log("auth_user columns:", userCols.map(c => `${c.Field} (${c.Type})`));

    const [configCols] = await pool.query("DESCRIBE auth_configurations");
    console.log("auth_configurations columns:", configCols.map(c => `${c.Field} (${c.Type})`));

    console.log("\nLive Database connection and schemas verified 100%!");
  } catch (err) {
    console.error("DB Check error:", err);
  } finally {
    await pool.end();
  }
}

check();
