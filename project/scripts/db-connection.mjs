import fs from "node:fs";
import path from "node:path";

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const command = process.argv[2];
  const env = loadEnvFile(path.resolve(process.cwd(), ".env"));
  const merged = { ...env, ...process.env };

  if (!command || command === "--help" || command === "-h") {
    console.log(`Usage:
  node ./scripts/db-connection.mjs print-url
  node ./scripts/db-connection.mjs print-psql-env
  node ./scripts/db-connection.mjs check

Env support:
  Preferred:
    DB_HOST
    DB_PORT
    DB_NAME
    DB_USER
    DB_PASSWORD
    DB_SSL

  Fallback:
    DATABASE_URL
    DB_SSL
`);
    process.exit(command ? 0 : 1);
  }

  const connection = resolveConnection(merged);

  if (command === "print-url") {
    process.stdout.write(connection.url);
    process.exit(0);
  }

  if (command === "print-psql-env") {
    for (const [key, value] of Object.entries(connection.psqlEnv)) {
      process.stdout.write(`${key}=${shellEscape(value)}\n`);
    }

    process.exit(0);
  }

  if (command === "check") {
    process.stdout.write(
      JSON.stringify(
        {
          source: connection.source,
          host: connection.host,
          port: connection.port,
          database: connection.database,
          user: connection.user,
          sslMode: connection.sslMode,
        },
        null,
        2,
      ),
    );
    process.stdout.write("\n");
    process.exit(0);
  }

  throw new Error(`Unsupported command "${command}".`);
}

export function resolveConnection(values) {
  const sslMode = normalizeSslMode(values.DB_SSL);
  const splitVars = {
    host: clean(values.DB_HOST),
    port: clean(values.DB_PORT),
    database: clean(values.DB_NAME),
    user: clean(values.DB_USER),
    password: clean(values.DB_PASSWORD),
  };

  const hasAnySplitVars = Object.values(splitVars).some(Boolean);
  const hasAllSplitVars = Object.values(splitVars).every(Boolean);

  if (hasAnySplitVars && !hasAllSplitVars) {
    throw new Error(
      "Incomplete split DB env vars. Set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD together.",
    );
  }

  if (hasAllSplitVars) {
    const url = new URL("postgresql://placeholder");
    url.hostname = splitVars.host;
    url.port = splitVars.port;
    url.pathname = `/${splitVars.database}`;
    url.username = splitVars.user;
    url.password = splitVars.password;

    return {
      source: "split",
      url: url.toString(),
      host: splitVars.host,
      port: splitVars.port,
      database: splitVars.database,
      user: splitVars.user,
      sslMode,
      psqlEnv: {
        PGHOST: splitVars.host,
        PGPORT: splitVars.port,
        PGDATABASE: splitVars.database,
        PGUSER: splitVars.user,
        PGPASSWORD: splitVars.password,
        PGSSLMODE: sslMode,
      },
    };
  }

  const rawUrl = clean(values.DATABASE_URL);
  if (!rawUrl) {
    throw new Error(
      "Database connection is not configured. Set split DB env vars or DATABASE_URL.",
    );
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      "DATABASE_URL is invalid. If the password contains reserved characters, prefer split DB env vars.",
    );
  }

  return {
    source: "url",
    url: parsed.toString(),
    host: parsed.hostname,
    port: parsed.port || "5432",
    database: parsed.pathname.replace(/^\//, ""),
    user: decodeURIComponent(parsed.username),
    sslMode,
    psqlEnv: {
      PGHOST: parsed.hostname,
      PGPORT: parsed.port || "5432",
      PGDATABASE: parsed.pathname.replace(/^\//, ""),
      PGUSER: decodeURIComponent(parsed.username),
      PGPASSWORD: decodeURIComponent(parsed.password),
      PGSSLMODE: sslMode,
    },
  };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const result = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function normalizeSslMode(value) {
  return String(value ?? "true").toLowerCase() === "false" ? "disable" : "require";
}

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function shellEscape(value) {
  return `'${String(value).replaceAll("'", `'\\''`)}'`;
}
