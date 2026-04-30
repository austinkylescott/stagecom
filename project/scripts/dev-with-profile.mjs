import { spawn } from "node:child_process";

const profile = process.argv[2];

if (!profile || !["local", "remote"].includes(profile)) {
  console.error("Usage: node ./scripts/dev-with-profile.mjs <local|remote>");
  process.exit(1);
}

if (profile === "local") {
  await run("npx", ["supabase", "start"]);
}

await run("node", ["./scripts/env-profile.mjs", "use", profile]);
await run("npx", ["nuxt", "dev"]);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });

    child.on("error", reject);
  });
}
