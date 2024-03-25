import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ElementPlus from 'unplugin-element-plus/vite'
import PurgeIcons from 'vite-plugin-purge-icons'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ElementPlus({}),
    PurgeIcons()
  ],
  resolve: {
    // 配置别名
    alias: {
      '@package': resolve(__dirname, './package'),
      '@examples': resolve(__dirname, './examples'),
    }
  },
  build: {
    target: 'es2015',
    cssTarget: 'chrome80',
    rollupOptions: {
      input: {
        examples: resolve(__dirname, 'examples/index.html'),
      },
    }
  },
})
 