require("dotenv").config();
const { pool } = require("./backend/config/database");

async function checkVersion() {
  const [v] = await pool.query("SELECT VERSION() as version");
  console.log("MySQL Version:", v[0].version);
  await pool.end();
}

checkVersion();
