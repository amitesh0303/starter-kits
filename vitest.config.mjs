import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{mjs,mts,js,ts}'],
    testTimeout: 30000
  }
});
