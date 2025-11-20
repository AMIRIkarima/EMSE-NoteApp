import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['dist/src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)']
  }
});
