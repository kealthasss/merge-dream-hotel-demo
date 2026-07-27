// 验证单文件 IIFE 包在最小 DOM 桩下能正常渲染（纯 JS，直接 node 运行）
import { readFileSync } from 'node:fs';
const appStub = { innerHTML: '', addEventListener() {} };
const store = {};
globalThis.document = {
  getElementById: (id) => (id === 'app' ? appStub : null),
  addEventListener() {},
  body: { appendChild() {} },
  elementFromPoint: () => null
};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = v;
  },
  removeItem: (k) => {
    delete store[k];
  }
};
const code = readFileSync('dist-single/app.js', 'utf8');
try {
  (0, eval)(code);
  const html = appStub.innerHTML;
  const marks = ['翻修进度', '工具箱', '客人订单', 'data-cell', 'energy', 'Lv'];
  const allok = marks.every((m) => html.includes(m));
  console.log(allok ? '单文件渲染 OK (len=' + html.length + ')' : '单文件渲染缺失标记');
  process.exit(allok ? 0 : 1);
} catch (e) {
  console.log('单文件渲染抛异常: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
}
