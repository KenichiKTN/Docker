const express = require("express");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json({ limit: "1mb" }));

const dbPath = process.env.SQLITE_DB_PATH || "/hostdata/株式データベース.db";
const db = new Database(dbPath);
db.pragma("journal_mode = WAL"); // ロックに強くする

app.get("/health", (req, res) => res.json({ ok: true, dbPath }));

app.post("/exec", (req, res) => {
  const { sql, params } = req.body || {};
  if (!sql || typeof sql !== "string") return res.status(400).json({ ok: false, error: "sql is required" });

  try {
    const stmt = db.prepare(sql);
    const isSelect = /^\s*select/i.test(sql);
    const result = isSelect ? stmt.all(params || []) : stmt.run(params || []);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(3000, () => console.log("sqlite-writer listening on :3000"));
