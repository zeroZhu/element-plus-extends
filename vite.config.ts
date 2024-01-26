import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ElementPlus({})
  ],
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
