import type { ChainDef, ItemDef } from '../types';

// 3 条合成链，各 5 级（MVP：完整合成链）
// 合并规则：两个相同 ItemId 拖到一起 -> tier+1

const cleaning: ItemDef[] = [
  { id: 'cleaning_1', chain: 'cleaning', tier: 1, name: '抹布', icon: '🧽', color: '#3fb8af' },
  { id: 'cleaning_2', chain: 'cleaning', tier: 2, name: '扫帚', icon: '🧹', color: '#37a89f' },
  { id: 'cleaning_3', chain: 'cleaning', tier: 3, name: '拖把', icon: '🪣', color: '#2f968f' },
  { id: 'cleaning_4', chain: 'cleaning', tier: 4, name: '吸尘器', icon: '🌀', color: '#288679' },
  { id: 'cleaning_5', chain: 'cleaning', tier: 5, name: '清洁车', icon: '🛒', color: '#207066' }
];

const linen: ItemDef[] = [
  { id: 'linen_1', chain: 'linen', tier: 1, name: '线团', icon: '🧵', color: '#e98ab5' },
  { id: 'linen_2', chain: 'linen', tier: 2, name: '毛巾', icon: '🧻', color: '#e07aa8' },
  { id: 'linen_3', chain: 'linen', tier: 3, name: '床单', icon: '🛏️', color: '#d06a9b' },
  { id: 'linen_4', chain: 'linen', tier: 4, name: '枕头', icon: '💤', color: '#c05a8e' },
  { id: 'linen_5', chain: 'linen', tier: 5, name: '羽绒被', icon: '🛌', color: '#b04a81' }
];

const fb: ItemDef[] = [
  { id: 'fb_1', chain: 'fb', tier: 1, name: '小麦', icon: '🌾', color: '#e0b45a' },
  { id: 'fb_2', chain: 'fb', tier: 2, name: '面粉', icon: '🍚', color: '#d9a84a' },
  { id: 'fb_3', chain: 'fb', tier: 3, name: '面团', icon: '🫓', color: '#d29c3c' },
  { id: 'fb_4', chain: 'fb', tier: 4, name: '面包', icon: '🍞', color: '#cb902e' },
  { id: 'fb_5', chain: 'fb', tier: 5, name: '蛋糕', icon: '🍰', color: '#c48420' }
];

export const CHAINS: ChainDef[] = [
  { id: 'cleaning', name: '清洁链', tiers: cleaning, generatorId: 'gen_toolbox' },
  { id: 'linen', name: '布草链', tiers: linen, generatorId: 'gen_linen' },
  { id: 'fb', name: '餐饮链', tiers: fb, generatorId: 'gen_pantry' }
];

// 扁平查找表
export const ITEMS: Record<string, ItemDef> = {};
for (const c of CHAINS) for (const it of c.tiers) ITEMS[it.id] = it;

// 取合并后的上一级（若存在）
export function nextTier(itemId: string): string | null {
  const it = ITEMS[itemId];
  if (!it) return null;
  const chain = CHAINS.find((c) => c.id === it.chain)!;
  const up = chain.tiers.find((t) => t.tier === it.tier + 1);
  return up ? up.id : null;
}

export function itemName(id: string): string {
  return ITEMS[id]?.name ?? id;
}
