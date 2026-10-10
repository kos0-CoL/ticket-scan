import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*', 'dist/'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ticketscan/ui': resolve(__dirname, '../../packages/ui/src'),
      '@ticketscan/db': resolve(__dirname, '../../packages/db/src'),
      '@ticketscan/types': resolve(__dirname, '../../packages/types'),
      '@ticketscan/utils': resolve(__dirname, '../../packages/utils'),
      '@ticketscan/ai': resolve(__dirname, '../../packages/ai/src'),
    },
  },
});