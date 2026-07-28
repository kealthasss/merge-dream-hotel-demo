// 美术图映射：物品/生成器 id -> 相对路径（对应 src/public/assets/items/<id>.png）
// 由 scripts/gen_images.py 把生成图下载到该目录后自动生效；
// 图像缺失时 UI 通过 start() 中的 error 监听回退到 emoji（见 ui.ts）。
// 路径用相对形式，兼容 GitHub Pages 子路径（base: './'）。
export const ITEM_IMAGES: Record<string, string> = {
  // 清洁链
  cleaning_1: 'assets/items/cleaning_1.png',
  cleaning_2: 'assets/items/cleaning_2.png',
  cleaning_3: 'assets/items/cleaning_3.png',
  cleaning_4: 'assets/items/cleaning_4.png',
  cleaning_5: 'assets/items/cleaning_5.png',
  // 布草链
  linen_1: 'assets/items/linen_1.png',
  linen_2: 'assets/items/linen_2.png',
  linen_3: 'assets/items/linen_3.png',
  linen_4: 'assets/items/linen_4.png',
  linen_5: 'assets/items/linen_5.png',
  // 餐饮链
  fb_1: 'assets/items/fb_1.png',
  fb_2: 'assets/items/fb_2.png',
  fb_3: 'assets/items/fb_3.png',
  fb_4: 'assets/items/fb_4.png',
  fb_5: 'assets/items/fb_5.png',
  // 生成器
  gen_toolbox: 'assets/items/gen_toolbox.png',
  gen_linen: 'assets/items/gen_linen.png',
  gen_pantry: 'assets/items/gen_pantry.png'
};
