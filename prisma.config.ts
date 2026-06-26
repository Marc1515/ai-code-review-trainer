import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "prisma/config";

function loadPrismaEnv() {
  const values: Record<string, string> = {};

  for (const fileName of [".env", ".env.local"]) {
    const filePath = join(process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      const value = rawValue.replace(/^['"]|['"]$/g, "");
      values[key] = value;
    }
  }

  for (const [key, value] of Object.entries(values)) {
    process.env[key] ??= value;
  }
}

loadPrismaEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
