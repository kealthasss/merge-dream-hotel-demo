// 组装单文件 HTML：将 IIFE 打包的 JS 与构建出的 CSS 内联进一个 index.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const outDir = join(process.cwd(), 'dist-single');
mkdirSync(outDir, { recursive: true });

const cssFile = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.css'));
const css = readFileSync(join(dist, 'assets', cssFile), 'utf8');
const js = readFileSync(join(outDir, 'app.js'), 'utf8');

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>晨光酒店 · 合成翻修 Demo</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
${js}
    </script>
  </body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), html, 'utf8');
console.log('单文件已生成: dist-single/index.html  (' + html.length + ' 字节)');
