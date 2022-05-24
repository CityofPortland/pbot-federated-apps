import typescript from '@rollup/plugin-typescript';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: { entry: './src/index.ts', name: 'common' },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['axios', 'vue', 'vue-router'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          axios: 'axios',
          vue: 'Vue',
          'vue-router': 'vue-router',
        },
      },
    },
  },
  plugins: [
    typescript({
      emitDeclarationOnly: true,
    }),
    vue(),
    eslint(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
