// 条件高亮系统：支持规则配置与样式定制
// 渲染时给 cell 附加 hl-* class 与内联样式

import { STATE } from './state/store';
import { ITEMS } from './data/chains';
import { ORDER_MAP } from './data/areas';
import type { ItemId } from './types';

export interface HighlightStyle {
  background?: string;   // CSS background
  color?: string;        // 文字/图标色
  borderColor?: string;  // 边框色
  boxShadow?: string;    // 外发光
  animation?: string;    // CSS animation name
  opacity?: number;      // 1 为不透明
}

export type HighlightRuleId =
  | 'merge-target'   // 拖拽时：与拖拽源可合并的目标（同类同阶）
  | 'task-required'  // 当前房间任务所需的物品
  | 'order-required' // 当前订单所需的物品
  | 'max-tier';      // 当前合成链最高级（T5）

export interface HighlightRule {
  id: HighlightRuleId;
  enabled: boolean;
  priority: number;      // 数字越大越优先（同名样式后者覆盖）
  style: HighlightStyle;
}

export const HIGHLIGHT_RULES: HighlightRule[] = [
  {
    id: 'merge-target',
    enabled: true,
    priority: 100,
    style: {
      background: 'radial-gradient(circle at 50% 35%, rgba(126,224,255,.35), rgba(46,123,255,.25))',
      borderColor: '#7ee0ff',
      boxShadow: 'inset 0 0 0 2px #7ee0ff, 0 0 12px rgba(126,224,255,.4)',
      animation: 'pulse 1.4s ease-in-out infinite',
    },
  },
  {
    id: 'task-required',
    enabled: true,
    priority: 80,
    style: {
      background: 'radial-gradient(circle at 50% 35%, rgba(255,179,78,.28), rgba(255,126,95,.18))',
      borderColor: '#ffb14e',
      boxShadow: 'inset 0 0 0 2px #ffb14e',
    },
  },
  {
    id: 'order-required',
    enabled: true,
    priority: 70,
    style: {
      background: 'radial-gradient(circle at 50% 35%, rgba(158,255,180,.22), rgba(74,202,118,.12))',
      borderColor: '#9effb4',
      boxShadow: 'inset 0 0 0 2px #9effb4',
    },
  },
  {
    id: 'max-tier',
    enabled: true,
    priority: 50,
    style: {
      borderColor: '#ffd36e',
      boxShadow: 'inset 0 0 0 1px #ffd36e, 0 0 8px rgba(255,211,110,.35)',
    },
  },
];

let draggedItem: ItemId | null = null;
let dragSourceIndex: number | null = null;

export function setDraggedItem(itemId: ItemId | null): void { draggedItem = itemId; }
export function getDraggedItem(): ItemId | null { return draggedItem; }
export function setDragSourceIndex(idx: number | null): void { dragSourceIndex = idx; }

/** 评估某个格子命中哪些高亮规则 */
export function evaluateHighlights(
  itemId: ItemId | null,
  idx: number,
  taskRequiredItems: Set<ItemId> = new Set()
): HighlightRule[] {
  if (!itemId) return [];
  const s = STATE.get();
  const item = ITEMS[itemId];
  const hits: HighlightRule[] = [];

  for (const rule of HIGHLIGHT_RULES) {
    if (!rule.enabled) continue;
    let hit = false;
    switch (rule.id) {
      case 'merge-target': {
        // 拖拽源本身不亮，其他同 itemId 的格子高亮（可合并目标）
        hit = draggedItem === itemId && idx !== dragSourceIndex;
        break;
      }
      case 'task-required': {
        hit = taskRequiredItems.has(itemId);
        break;
      }
      case 'order-required': {
        hit = s.orders.some((oid) => ORDER_MAP[oid].requireItem === itemId);
        break;
      }
      case 'max-tier': {
        hit = item.tier >= 5;
        break;
      }
    }
    if (hit) hits.push(rule);
  }
  hits.sort((a, b) => b.priority - a.priority);
  return hits;
}

/** 把命中规则转成 class 列表与内联样式字符串 */
export function highlightAttrs(
  itemId: ItemId | null,
  idx: number,
  taskRequiredItems?: Set<ItemId>
): { classes: string; style: string } {
  const hits = evaluateHighlights(itemId, idx, taskRequiredItems);
  const classes = hits.map((r) => `hl-${r.id}`).join(' ');
  const merged: HighlightStyle = {};
  for (const r of hits) Object.assign(merged, r.style);

  const styleParts: string[] = [];
  if (merged.background) styleParts.push(`background:${merged.background}`);
  if (merged.color) styleParts.push(`color:${merged.color}`);
  if (merged.borderColor) styleParts.push(`border-color:${merged.borderColor}`);
  if (merged.boxShadow) styleParts.push(`box-shadow:${merged.boxShadow}`);
  if (merged.opacity !== undefined) styleParts.push(`opacity:${merged.opacity}`);
  if (merged.animation) styleParts.push(`animation:${merged.animation}`);

  return { classes, style: styleParts.join(';') };
}
