// 全局类型定义（数据驱动，便于后续 Web→Unity 迁移为 ScriptableObject）

export type ItemId = string;
export type ChainId = 'cleaning' | 'linen' | 'fb';

export interface ItemDef {
  id: string;
  chain: ChainId;
  tier: number; // 1..N，1 为基础物（由生成器产出）
  name: string;
  icon: string; // 原型占位 emoji；M6 由聚合站生图后替换为静态图
  color: string; // 主题色，用于 DOM 卡片
}

export interface ChainDef {
  id: ChainId;
  name: string;
  tiers: ItemDef[]; // 按 tier 升序
  generatorId: string;
}

export interface GeneratorDef {
  id: string;
  name: string;
  produces: string; // 基础物 ItemId
  energyCost: number;
  unlockLevel?: number; // G1：达到等级后生成器解锁
  unlockArea?: string; // G7：到达区域后生成器解锁
}

export interface Reward {
  coins: number;
  stars: number;
  xp: number;
}

export interface TaskDef {
  id: string;
  order: number; // 房间内顺序（G4 前置）
  requireItem: string;
  requireQty: number;
  reward: Reward;
}

export interface RoomDef {
  id: string;
  name: string;
  prereqRoomId?: string; // G3：同区域前一房间装修完成后才解锁
  decorateCost: number; // G5：装修所需星星
  tasks: TaskDef[];
}

export interface AreaDef {
  id: string;
  name: string;
  unlockLevel: number; // G1：等级门槛
  prereqAreaId?: string; // G2：前一区域全部装修完成后才解锁
  rooms: RoomDef[];
}

export interface OrderDef {
  id: string;
  requireItem: string;
  requireQty: number;
  reward: Reward;
}
