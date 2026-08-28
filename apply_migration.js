require("dotenv").config();
const { pool } = require("./backend/config/database");

async function applyMigration() {
  const connection = await pool.getConnection();
  try {
    console.log("Applying safe schema setup...");

    // 1. Check columns in auth_user
    const [cols] = await connection.query("SHOW COLUMNS FROM auth_user");
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes("full_name")) {
      console.log("Adding full_name column to auth_user...");
      await connection.query("ALTER TABLE auth_user ADD COLUMN full_name VARCHAR(150) NULL AFTER id");
    }

    if (!colNames.includes("mobile")) {
      console.log("Adding mobile column to auth_user...");
      await connection.query("ALTER TABLE auth_user ADD COLUMN mobile VARCHAR(20) NULL AFTER email");
    }

    if (!colNames.includes("password_hash")) {
      console.log("Adding password_hash column to auth_user...");
      await connection.query("ALTER TABLE auth_user ADD COLUMN password_hash VARCHAR(255) NULL AFTER mobile");
    }

    // 2. Create auth_configurations if not exists
    console.log("Creating auth_configurations table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS auth_configurations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        configuration_name VARCHAR(255) NOT NULL,
        landing_url TEXT NULL,
        redirect_url TEXT NULL,
        configuration_data JSON NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_auth_configurations_user_id (user_id)
      )
    `);

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    connection.release();
    await pool.end();
  }
}

applyMigration();
