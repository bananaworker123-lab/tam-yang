import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    target: 'es2022',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.pbt.test.ts'],
    environment: 'node',
  },
});
