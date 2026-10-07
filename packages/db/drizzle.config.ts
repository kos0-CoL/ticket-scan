import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  db_credentials: { url: process.env.DATABASE_URL! },
});