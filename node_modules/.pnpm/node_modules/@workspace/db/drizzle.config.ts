import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set. Copy .env.example to .env and fill in your database credentials.");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
