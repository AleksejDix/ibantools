import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/ibantools.ts',
      formats: ['es'],
      fileName: 'ibantools',
    },
    minify: 'esbuild',
    sourcemap: true,
    outDir: 'dist',
  },
  plugins: [
    dts({
      rollupTypes: true,
      outDir: 'dist',
    }),
  ],
});
