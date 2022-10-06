import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['solid-js'],

      /* options */
    }),
    solid({
      ssr: false,
      hot: false,
    }),
  ],
  server: {
    hmr: {},
  },
  resolve: {
    alias: {
      '@/': './src/modules/',
      '~/trinity/': './src/trinity/',
      '~/trinity': './src/trinity/index.ts',
      '~': './src',
    },
  },
})
