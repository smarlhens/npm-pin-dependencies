import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    deps: {
      interopDefault: false,
      optimizer: {
        web: {
          include: ['@yarnpkg/lockfile'],
        },
      },
    },
    coverage: {
      provider: 'v8',
      clean: true,
      cleanOnRerun: true,
      reporter: ['cobertura', 'text', 'html'],
      include: ['lib/*'],
    },
  },
});
