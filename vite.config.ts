import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [vue()],
  resolve: {
    // 配置别名
    alias: {
      '@package': resolve(__dirname, './package'),
      '@examples': resolve(__dirname, './examples'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        examples: resolve(__dirname, 'examples/index.html'),
      },
    }
  },
})
