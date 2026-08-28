require("dotenv").config();
const { pool } = require("./backend/config/database");

async function inspectUserTable() {
  try {
    const [rows] = await pool.query("SELECT * FROM auth_user LIMIT 5");
    console.log("Existing rows in auth_user count:", rows.length);
    if (rows.length > 0) {
      console.log("Sample user row:", rows[0]);
    }

    const [columns] = await pool.query("SHOW COLUMNS FROM auth_user");
    console.log("All columns in auth_user:", columns.map(c => c.Field));
  } catch (err) {
    console.error("Error inspecting auth_user:", err);
  } finally {
    await pool.end();
  }
}

inspectUserTable();
