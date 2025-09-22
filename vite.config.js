import { resolve } from 'path'
import { defineConfig } from 'vite'

const locals = { name: 'components' }

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.html'),
      fileName: 'app',
      formats: ['es']
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        assetFileNames: '[name].css',
        chunkFileNames: '[name].js'
      }
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})
