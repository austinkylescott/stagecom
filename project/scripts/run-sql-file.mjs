import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { resolveConnection } from "./db-connection.mjs";

const sqlFileArg = process.argv[2];

if (!sqlFileArg) {
  console.error("Usage: node ./scripts/run-sql-file.mjs <sql-file>");
  process.exit(1);
}

const env = loadEnv(path.resolve(process.cwd(), ".env"));
const connection = resolveConnection(env);
const sqlPath = path.resolve(process.cwd(), sqlFileArg);
const sql = await fsp.readFile(sqlPath, "utf8");

const client = new Client({
  host: connection.host,
  port: Number(connection.port),
  database: connection.database,
  user: connection.user,
  password: connection.psqlEnv.PGPASSWORD,
  ssl: connection.sslMode === "disable" ? false : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
} finally {
  await client.end();
}

function loadEnv(filePath) {
  const env = { ...process.env };

  if (!fs.existsSync(filePath)) {
    return env;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in env)) {
      env[key] = value;
    }
  }

  return env;
}
