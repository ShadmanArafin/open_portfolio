import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@/core': path.resolve(import.meta.dirname, './core'),
      '@': path.resolve(import.meta.dirname, './src'),
      // `server-only` throws when imported outside a React Server Component.
      // Under the test runner there is no such distinction, so it is stubbed —
      // the guarantee it provides is enforced by the Next build, not here.
      'server-only': path.resolve(
        import.meta.dirname,
        './core/storage/__tests__/server-only-stub.ts'
      ),
    },
  },
  test: {
    environment: 'node',
    // `.tsx` too: block rendering is checked by rendering it, which needs JSX.
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['core/**'],
    },
  },
});
