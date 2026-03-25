import fs from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const usage = `Usage:
  node ./scripts/seed-auth-users.mjs --config ./mock-data.config.json [--out ./mock-data.resolved.json]

Requirements:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - users[].auth.email for each user to be resolved

Behavior:
  - Creates missing auth users in Supabase Auth
  - Updates existing users to keep passwords and metadata in sync
  - Writes a resolved config file with real auth user IDs
`;

const options = parseOptions(process.argv.slice(2));
const configPath = path.resolve(process.cwd(), options.config ?? "./mock-data.config.json");
const outPath = path.resolve(process.cwd(), options.out ?? "./mock-data.resolved.json");

const env = loadEnv();
const supabaseUrl = requireString(env.SUPABASE_URL, "SUPABASE_URL");
const serviceRoleKey = requireString(
  env.SUPABASE_SERVICE_ROLE_KEY,
  "SUPABASE_SERVICE_ROLE_KEY",
);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const config = JSON.parse(await readFile(configPath, "utf8"));
const users = Array.isArray(config.users) ? config.users : [];
const existingUsers = await listAllUsers(supabase);
const existingByEmail = new Map(
  existingUsers
    .filter((user) => typeof user.email === "string" && user.email.length > 0)
    .map((user) => [user.email.toLowerCase(), user]),
);

let createdCount = 0;
let updatedCount = 0;
const resolvedUsers = [];

for (const user of users) {
  const auth = user?.auth;
  if (!auth) {
    resolvedUsers.push(user);
    continue;
  }

  const email = requireString(auth.email, `users[${user.key}].auth.email`).toLowerCase();
  const password = optionalString(auth.password);
  const emailConfirm = auth.emailConfirm ?? true;
  const userMetadata = {
    full_name: user.displayName ?? null,
    name: user.displayName ?? null,
    avatar_url: user.avatarUrl ?? null,
    mock_user_key: user.key ?? null,
  };

  let resolvedAuthUser = existingByEmail.get(email);

  if (resolvedAuthUser) {
    const updatePayload = {
      email,
      email_confirm: emailConfirm,
      user_metadata: userMetadata,
    };

    if (password) {
      updatePayload.password = password;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      resolvedAuthUser.id,
      updatePayload,
    );

    if (error) {
      throw new Error(`Failed to update auth user "${email}": ${error.message}`);
    }

    resolvedAuthUser = data.user;
    existingByEmail.set(email, resolvedAuthUser);
    updatedCount += 1;
  } else {
    if (!password) {
      throw new Error(
        `users[${user.key}].auth.password is required when creating a new auth user.`,
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: emailConfirm,
      user_metadata: userMetadata,
    });

    if (error) {
      throw new Error(`Failed to create auth user "${email}": ${error.message}`);
    }

    resolvedAuthUser = data.user;
    existingByEmail.set(email, resolvedAuthUser);
    createdCount += 1;
  }

  resolvedUsers.push({
    ...user,
    id: resolvedAuthUser.id,
  });
}

const resolvedConfig = {
  ...config,
  users: resolvedUsers,
};

await writeFile(outPath, `${JSON.stringify(resolvedConfig, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      config: path.relative(process.cwd(), configPath),
      out: path.relative(process.cwd(), outPath),
      created: createdCount,
      updated: updatedCount,
      resolvedUsers: resolvedUsers
        .filter((user) => user?.auth?.email)
        .map((user) => ({
          key: user.key,
          email: user.auth.email,
          id: user.id,
        })),
    },
    null,
    2,
  ),
);

function parseOptions(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--help" || arg === "-h") {
      console.log(usage);
      process.exit(0);
    }

    if (arg === "--config") {
      options.config = requireString(next, "--config value");
      index += 1;
      continue;
    }

    if (arg === "--out") {
      options.out = requireString(next, "--out value");
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument "${arg}".`);
  }

  return options;
}

async function listAllUsers(client) {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const batch = data.users ?? [];
    users.push(...batch);

    if (batch.length < perPage) {
      return users;
    }

    page += 1;
  }
}

function loadEnv() {
  const env = { ...process.env };
  const filePath = path.resolve(process.cwd(), ".env");

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

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

function optionalString(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Expected optional string value.");
  }

  return value;
}
