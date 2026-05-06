import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.ts',
      name: 'TryOnWidget',
      fileName: (format) => `widget.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      output: {
        globals: {
          axios: 'axios',
        },
      },
    },
  },
});
