import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '~': '/app',
    },
  },
  test: {
    include: ['app/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
