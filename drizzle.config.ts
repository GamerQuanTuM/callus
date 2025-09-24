import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./src/lib/db",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    ssl: {
      rejectUnauthorized: true
    },
  },
  verbose: true,
  strict: true,
});
