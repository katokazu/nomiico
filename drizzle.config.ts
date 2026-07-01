import type { Config } from "drizzle-kit";

export default {
  schema: "./src/data/sqlite/schema.ts",
  out: "./src/data/sqlite/migrations",
  dialect: "sqlite",
  driver: "expo",
} satisfies Config;
