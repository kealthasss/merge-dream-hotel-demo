// 无头 DOM 冒烟测试：用最小 DOM 桩跑 start()，确认界面渲染不抛异常（防白屏）
import './dom_shim';
import * as ui from '../src/ui';

try {
  ui.start();
  const appStub: any = (globalThis as any).appStub;
  const html: string = appStub.innerHTML;
  const checks = ['翻修进度', '工具箱', '客人订单', 'data-cell', 'energy', 'Lv'];
  let allok = true;
  for (const c of checks) {
    if (!html.includes(c)) {
      allok = false;
      console.log('  ✗ 缺失标记: ' + c);
    }
  }
  if (allok) {
    console.log('DOM 渲染 OK，HTML 长度 = ' + html.length + '，含 ' + checks.length + ' 个关键区块');
    console.log('冒烟测试通过 ✅');
    process.exit(0);
  } else {
    console.log('冒烟测试失败 ❌');
    process.exit(1);
  }
} catch (e: any) {
  console.log('渲染抛异常 ❌: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
}
