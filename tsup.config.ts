import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/**/*.ts', 'bin/npd.ts'],
  splitting: false,
  platform: 'node',
  target: 'node16',
  shims: true,
  sourcemap: false,
  bundle: true,
  minify: true,
  dts: {
    resolve: true,
    entry: 'lib/npd.ts',
  },
  clean: true,
  format: ['cjs', 'esm'],
  outDir: 'dist',
  tsconfig: './tsconfig.json',
});
