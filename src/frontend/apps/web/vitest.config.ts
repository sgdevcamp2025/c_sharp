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
    exclude: [
      'node_modules',
      '.next',
      'next.config.mjs',
      'postcss.config.mjs',
      'tailwind.config.ts',
    ],
    coverage: {
      provider: 'v8',
      exclude: [
        'next.config.mjs',
        'postcss.config.mjs',
        'tailwind.config.ts',
        'eslint.config.js',
        'vite.config.ts',
        'vitest.config.ts',
        'node_modules',
        '.next',
        'next-env.d.ts',
        'app',
        'src/entities',
        'src/shared',
        'src/features/auth/api',
        'src/features/auth/ui',
        'src/features/chat/api',
        'src/features/chat/ui',
        'src/features/stock/api',
        'src/features/stock/ui',
        'src/features/user/api',
        'src/features/user/ui',
        'src/features/workspace/api',
        'src/features/workspace/ui',
        'src/features/file-upload/api',
        'src/features/file-upload/ui',
        'src/features/video',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@workspace/ui': resolve(__dirname, '../../packages/ui/src'),
      '@': resolve(__dirname, '.'),
    },
  },
});
