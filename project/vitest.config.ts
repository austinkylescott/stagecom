import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.{test,spec}.{ts,js}"],
  },
  resolve: {
    alias: {
      "~": rootDir,
      "@": rootDir,
      "@@": rootDir,
    },
  },
});
