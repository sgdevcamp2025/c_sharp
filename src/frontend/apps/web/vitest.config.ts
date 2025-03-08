import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    testTimeout: 10000,
    setupFiles: './vitest-setup.ts',
    globals: true,
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@workspace/ui': resolve(__dirname, '../../packages/ui/src'),
      '@': resolve(__dirname, '.'),
    },
  },
});
