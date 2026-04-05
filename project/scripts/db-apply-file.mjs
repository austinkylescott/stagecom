import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { resolveConnection } from "./db-connection.mjs";

const target = process.argv[2];

if (!target) {
  console.error("Usage: node ./scripts/db-apply-file.mjs <sql-file>");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), target);
if (!fs.existsSync(filePath)) {
  console.error(`SQL file not found: ${filePath}`);
  process.exit(1);
}

const connection = resolveConnection(process.env);
const sql = fs.readFileSync(filePath, "utf8");
const client = new Client({
  connectionString: connection.url,
  ssl: connection.sslMode === "require" ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`Applied SQL from ${target}`);
} finally {
  await client.end().catch(() => {});
}
