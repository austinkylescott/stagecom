import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import pg from "pg";
import { resolveConnection } from "./db-connection.mjs";

const projectRoot = process.cwd();
const activeEnvPath = path.join(projectRoot, ".env");
const profilePaths = {
  local: path.join(projectRoot, ".env.local"),
  remote: path.join(projectRoot, ".env.remote"),
};

const command = process.argv[2];
const arg = process.argv[3];

if (!command || command === "--help" || command === "-h") {
  printUsage();
  process.exit(command ? 0 : 1);
}

if (command === "use") {
  if (!arg || !(arg in profilePaths)) {
    throw new Error(`Unsupported env profile "${arg || ""}".`);
  }

  useProfile(arg);
  process.exit(0);
}

if (command === "status") {
  await printStatus();
  process.exit(0);
}

if (command === "doctor") {
  await printStatus({ verifyConnections: true });
  process.exit(0);
}

throw new Error(`Unsupported command "${command}".`);

function printUsage() {
  console.log(`Usage:
  node ./scripts/env-profile.mjs use remote
  node ./scripts/env-profile.mjs use local
  node ./scripts/env-profile.mjs status
  node ./scripts/env-profile.mjs doctor`);
}

function useProfile(profile) {
  const sourcePath = profilePaths[profile];
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Missing ${path.basename(sourcePath)}. Create it from ${path.basename(sourcePath)}.example first.`,
    );
  }

  const sourceContents = fs.readFileSync(sourcePath, "utf8").trimEnd();
  const nextContents = [
    "# Managed by ./scripts/env-profile.mjs",
    `# STAGECOM_ENV_PROFILE=${profile}`,
    "",
    sourceContents,
    "",
  ].join("\n");

  fs.writeFileSync(activeEnvPath, nextContents);
  console.log(
    `Activated ${profile} environment in ${path.relative(projectRoot, activeEnvPath)}.`,
  );
}

async function printStatus({ verifyConnections = false } = {}) {
  const activeEnv = loadEnvFile(activeEnvPath);
  const activeProfile = parseManagedProfile(activeEnvPath);
  const hasActiveEnv = fs.existsSync(activeEnvPath);
  const supabaseTarget = classifySupabaseUrl(activeEnv.SUPABASE_URL);
  const dbConnection = tryResolveConnection(activeEnv);
  const dbTarget = dbConnection
    ? classifyDbHost(dbConnection.host)
    : {
        kind: "unknown",
        label: "unconfigured",
        ref: null,
      };
  const targetsMatch =
    supabaseTarget.kind !== "unknown" &&
    dbTarget.kind !== "unknown" &&
    supabaseTarget.ref === dbTarget.ref;

  const localApiReachable = await canConnect("127.0.0.1", 54321);
  const localDbReachable = await canConnect("127.0.0.1", 54322);
  const appReachable = verifyConnections
    ? await canReachSupabase(activeEnv.SUPABASE_URL)
    : null;
  const dbReachable = verifyConnections
    ? await canConnectDatabase(dbConnection)
    : null;

  const lines = [
    `Active profile: ${activeProfile || "unmanaged"}`,
    `Active .env: ${hasActiveEnv ? "present" : "missing"}`,
    `App target: ${supabaseTarget.label}`,
    `DB target: ${dbTarget.label}`,
    `App/DB target match: ${targetsMatch ? "yes" : "no"}`,
    `Remote profile file: ${fs.existsSync(profilePaths.remote) ? "present" : "missing"}`,
    `Local profile file: ${fs.existsSync(profilePaths.local) ? "present" : "missing"}`,
    `Local Supabase API: ${localApiReachable ? "reachable" : "offline"}`,
    `Local Supabase DB: ${localDbReachable ? "reachable" : "offline"}`,
  ];

  if (dbConnection) {
    lines.push(
      `DB connection source: ${dbConnection.source} (${dbConnection.user}@${dbConnection.host}:${dbConnection.port}/${dbConnection.database})`,
    );
  } else {
    lines.push("DB connection source: invalid or incomplete .env");
  }

  if (!targetsMatch) {
    lines.push(
      "Warning: the app Supabase target and direct DB target do not match. Fix the active .env before running migrations or the app.",
    );
  }

  if (verifyConnections) {
    lines.push(`Supabase API auth check: ${formatProbe(appReachable)}`);
    lines.push(`Direct DB auth check: ${formatProbe(dbReachable)}`);
  }

  console.log(lines.join("\n"));
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const values = {};

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

    values[key] = value;
  }

  return values;
}

function parseManagedProfile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const match = contents.match(/^\s*#\s*STAGECOM_ENV_PROFILE=(local|remote)\s*$/m);
  return match?.[1] || null;
}

function tryResolveConnection(values) {
  try {
    return resolveConnection(values);
  } catch {
    return null;
  }
}

function classifySupabaseUrl(value) {
  if (!value) {
    return {
      kind: "unknown",
      label: "unconfigured",
      ref: null,
    };
  }

  try {
    const url = new URL(value);
    if (isLocalHost(url.hostname)) {
      return {
        kind: "local",
        label: `${url.hostname}:${url.port || "80"} (local)`,
        ref: "local",
      };
    }

    const [ref] = url.hostname.split(".");
    return {
      kind: "remote",
      label: `${ref} (remote)`,
      ref,
    };
  } catch {
    return {
      kind: "unknown",
      label: "invalid SUPABASE_URL",
      ref: null,
    };
  }
}

function classifyDbHost(host) {
  if (!host) {
    return {
      kind: "unknown",
      label: "unconfigured",
      ref: null,
    };
  }

  if (isLocalHost(host)) {
    return {
      kind: "local",
      label: `${host} (local)`,
      ref: "local",
    };
  }

  const match = host.match(/^db\.([^.]+)\./);
  const ref = match?.[1] || host;
  return {
    kind: "remote",
    label: `${ref} (remote)`,
    ref,
  };
}

function isLocalHost(host) {
  return host === "127.0.0.1" || host === "localhost";
}

function canConnect(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (value) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(500, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

async function canReachSupabase(value) {
  if (!value) {
    return { ok: false, message: "missing SUPABASE_URL" };
  }

  try {
    const url = new URL("/auth/v1/health", value).toString();
    const response = await fetch(url);
    return {
      ok: true,
      message: `${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function canConnectDatabase(connection) {
  if (!connection) {
    return { ok: false, message: "database is not configured" };
  }

  const client = new pg.Client(connection.url);

  try {
    await client.connect();
    await client.query("select 1");
    return { ok: true, message: "connected" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

function formatProbe(result) {
  if (!result) {
    return "skipped";
  }

  return `${result.ok ? "ok" : "failed"} (${result.message})`;
}
