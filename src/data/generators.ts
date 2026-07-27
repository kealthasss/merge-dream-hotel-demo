import type { GeneratorDef } from '../types';

// 生成器：点击产出基础物（tier1），每次消耗 spawnCost 能量
// 解锁条件：unlockLevel（G1）/ unlockArea（G7）
export const GENERATORS: GeneratorDef[] = [
  {
    id: 'gen_toolbox',
    name: '工具箱',
    produces: 'cleaning_1',
    energyCost: 1
    // 无解锁条件：开局可用
  },
  {
    id: 'gen_linen',
    name: '布草箱',
    produces: 'linen_1',
    energyCost: 1,
    unlockLevel: 3 // G1：Lv3 解锁布草链
  },
  {
    id: 'gen_pantry',
    name: '食材篮',
    produces: 'fb_1',
    energyCost: 1,
    unlockArea: 'area_2' // G7：到达客房层后解锁餐饮链
  }
];

export const GENERATOR_MAP: Record<string, GeneratorDef> = {};
for (const g of GENERATORS) GENERATOR_MAP[g.id] = g;
