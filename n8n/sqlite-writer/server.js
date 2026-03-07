const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));

// DB格納フォルダ
const DB_DIR = "/hostdata";

// DB接続キャッシュ
const dbCache = {};

function getDb(dbName) {
  if (!dbName) throw new Error("db_name is required");

  if (!dbCache[dbName]) {
    const dbPath = path.join(DB_DIR, dbName);
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    dbCache[dbName] = db;
  }

  return dbCache[dbName];
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    dbDir: DB_DIR,
    activeConnections: Object.keys(dbCache)
  });
});

app.post("/exec", (req, res) => {
  const { db_name, sql, params } = req.body || {};

  if (!sql || typeof sql !== "string") {
    return res.status(400).json({ ok: false, error: "sql is required" });
  }

  if (!db_name) {
    return res.status(400).json({ ok: false, error: "db_name is required" });
  }

  try {
    const db = getDb(db_name);

    const stmt = db.prepare(sql);
    const isSelect = /^\s*select/i.test(sql);

    const result = isSelect
      ? stmt.all(params || [])
      : stmt.run(params || []);

    res.json({ ok: true, result });

  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(3000, () => console.log("sqlite-writer listening on :3000"));
