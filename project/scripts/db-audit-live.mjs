import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { resolveConnection } from "./db-connection.mjs";

const connection = resolveConnection(loadEnv(path.resolve(process.cwd(), ".env")));

const client = new Client({
  host: connection.host,
  port: Number(connection.port),
  database: connection.database,
  user: connection.user,
  password: connection.psqlEnv.PGPASSWORD,
  ssl: connection.sslMode === "disable" ? false : { rejectUnauthorized: false },
});

const expectedTables = [
  "email_outbox",
  "notifications",
  "profiles",
  "show_cast",
  "show_occurrences",
  "show_review_events",
  "show_roles",
  "shows",
  "theater_memberships",
  "theaters",
];

const expectedEnums = [
  "casting_mode",
  "email_outbox_status",
  "event_type",
  "membership_status",
  "notification_entity",
  "profile_visibility",
  "review_action",
  "show_cast_source",
  "show_cast_status",
  "show_occurrence_status",
  "show_role",
  "show_status",
  "theater_role",
];

const expectedFunctions = [
  "handle_new_user",
  "is_active_member_of_theater",
  "set_timestamp",
];

try {
  await client.connect();

  const tableResult = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name",
  );
  const enumResult = await client.query(
    "select distinct t.typname as enum_name from pg_type t join pg_enum e on t.oid = e.enumtypid join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' order by enum_name",
  );
  const functionResult = await client.query(
    "select routine_name from information_schema.routines where specific_schema = 'public' order by routine_name",
  );

  const actualTables = tableResult.rows.map((row) => row.table_name);
  const actualEnums = enumResult.rows.map((row) => row.enum_name);
  const actualFunctions = functionResult.rows.map((row) => row.routine_name);

  console.log(
    JSON.stringify(
      {
        connection: {
          source: connection.source,
          host: connection.host,
          port: connection.port,
          database: connection.database,
          user: connection.user,
        },
        tables: compare(expectedTables, actualTables),
        enums: compare(expectedEnums, actualEnums),
        functions: compare(expectedFunctions, actualFunctions),
      },
      null,
      2,
    ),
  );
} finally {
  await client.end();
}

function compare(expected, actual) {
  return {
    missing: expected.filter((item) => !actual.includes(item)),
    extra: actual.filter((item) => !expected.includes(item)),
  };
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
