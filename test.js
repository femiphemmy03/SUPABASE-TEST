require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false},
});

// Basic health check — confirms Render is serving the app at all
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// DB connectivity test — confirms Render can reach Supabase Postgres
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// JWT sanity check — confirms env vars load correctly
app.get("/jwt-test", (req, res) => {
  const token = jwt.sign({ test: true }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  res.json({ token, decoded });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));