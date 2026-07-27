import { defineConfig } from 'vite';

// 横屏 Web Demo：base 用相对路径，构建产物可直接静态托管（本地 / 局域网 / CloudStudio）
// 根目录 index.html 是给用户的提示页；真实源码入口为 src/index.html
export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    assetsInlineLimit: 0,
    emptyOutDir: true
  }
});
