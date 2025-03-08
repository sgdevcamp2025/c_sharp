import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@workspace/ui': path.resolve(__dirname, '../../packages/ui/dist'),
    },
  },
});
