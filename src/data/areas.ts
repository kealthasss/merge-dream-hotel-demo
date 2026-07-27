import type { AreaDef, OrderDef } from '../types';

// 区域 / 房间 / 任务（含 Gate 结构）
// G1 等级门槛：area.unlockLevel
// G2 区域顺序锁：area.prereqAreaId（前一区域全部房间装修完成）
// G3 房间前置：room.prereqRoomId（同区域前一房间装修完成）
// G4 任务前置：task.order 顺序执行
// G5 星星装修门槛：room.decorateCost

export const AREAS: AreaDef[] = [
  {
    id: 'area_1',
    name: '大堂',
    unlockLevel: 0, // 开局即解锁
    rooms: [
      {
        id: 'room_lobby_front',
        name: '前台',
        decorateCost: 8,
        tasks: [
          { id: 't_front_1', order: 1, requireItem: 'cleaning_2', requireQty: 3, reward: { coins: 25, stars: 2, xp: 12 } },
          { id: 't_front_2', order: 2, requireItem: 'cleaning_3', requireQty: 2, reward: { coins: 30, stars: 2, xp: 15 } },
          { id: 't_front_3', order: 3, requireItem: 'cleaning_5', requireQty: 1, reward: { coins: 40, stars: 3, xp: 20 } }
        ]
      },
      {
        id: 'room_lobby_lounge',
        name: '休息区',
        prereqRoomId: 'room_lobby_front',
        decorateCost: 12,
        tasks: [
          { id: 't_lounge_1', order: 1, requireItem: 'cleaning_4', requireQty: 2, reward: { coins: 35, stars: 3, xp: 18 } },
          { id: 't_lounge_2', order: 2, requireItem: 'linen_2', requireQty: 3, reward: { coins: 35, stars: 3, xp: 18 } },
          { id: 't_lounge_3', order: 3, requireItem: 'linen_3', requireQty: 1, reward: { coins: 45, stars: 4, xp: 22 } }
        ]
      }
    ]
  },
  {
    id: 'area_2',
    name: '客房层',
    unlockLevel: 5, // G1：Lv5 解锁
    prereqAreaId: 'area_1', // G2：大堂全装修后
    rooms: [
      {
        id: 'room_guest_std',
        name: '标准间',
        decorateCost: 12,
        tasks: [
          { id: 't_std_1', order: 1, requireItem: 'linen_3', requireQty: 2, reward: { coins: 40, stars: 3, xp: 20 } },
          { id: 't_std_2', order: 2, requireItem: 'linen_4', requireQty: 1, reward: { coins: 45, stars: 3, xp: 22 } },
          { id: 't_std_3', order: 3, requireItem: 'fb_2', requireQty: 3, reward: { coins: 40, stars: 3, xp: 20 } }
        ]
      },
      {
        id: 'room_guest_suite',
        name: '套房',
        prereqRoomId: 'room_guest_std',
        decorateCost: 16,
        tasks: [
          { id: 't_suite_1', order: 1, requireItem: 'linen_5', requireQty: 1, reward: { coins: 60, stars: 5, xp: 30 } },
          { id: 't_suite_2', order: 2, requireItem: 'fb_4', requireQty: 2, reward: { coins: 55, stars: 5, xp: 28 } }
        ]
      }
    ]
  },
  {
    id: 'area_3',
    name: '餐厅',
    unlockLevel: 8, // G1：Lv8 解锁
    prereqAreaId: 'area_2', // G2：客房层全装修后
    rooms: [
      {
        id: 'room_cafe',
        name: '咖啡厅',
        decorateCost: 16,
        tasks: [
          { id: 't_cafe_1', order: 1, requireItem: 'fb_4', requireQty: 2, reward: { coins: 55, stars: 5, xp: 28 } },
          { id: 't_cafe_2', order: 2, requireItem: 'fb_5', requireQty: 1, reward: { coins: 70, stars: 6, xp: 35 } }
        ]
      },
      {
        id: 'room_banquet',
        name: '宴会厅',
        prereqRoomId: 'room_cafe',
        decorateCost: 20,
        tasks: [
          { id: 't_banquet_1', order: 1, requireItem: 'fb_5', requireQty: 3, reward: { coins: 90, stars: 8, xp: 45 } },
          { id: 't_banquet_2', order: 2, requireItem: 'cleaning_5', requireQty: 2, reward: { coins: 80, stars: 7, xp: 40 } }
        ]
      }
    ]
  }
];

export const AREA_MAP: Record<string, AreaDef> = {};
for (const a of AREAS) AREA_MAP[a.id] = a;

export function allRooms() {
  return AREAS.flatMap((a) => a.rooms);
}
export function roomById(id: string) {
  return allRooms().find((r) => r.id === id);
}

// 客人订单池（G5 星星的主来源；M3 接线奖励，M4 接入刷新）
export const ORDERS: OrderDef[] = [
  { id: 'ord_1', requireItem: 'cleaning_3', requireQty: 2, reward: { coins: 40, stars: 5, xp: 20 } },
  { id: 'ord_2', requireItem: 'linen_2', requireQty: 2, reward: { coins: 35, stars: 4, xp: 18 } },
  { id: 'ord_3', requireItem: 'cleaning_4', requireQty: 1, reward: { coins: 45, stars: 5, xp: 22 } },
  { id: 'ord_4', requireItem: 'linen_3', requireQty: 1, reward: { coins: 50, stars: 6, xp: 25 } },
  { id: 'ord_5', requireItem: 'fb_3', requireQty: 2, reward: { coins: 55, stars: 6, xp: 28 } },
  { id: 'ord_6', requireItem: 'cleaning_5', requireQty: 1, reward: { coins: 70, stars: 8, xp: 35 } },
  { id: 'ord_7', requireItem: 'fb_4', requireQty: 1, reward: { coins: 65, stars: 7, xp: 30 } },
  { id: 'ord_8', requireItem: 'linen_5', requireQty: 1, reward: { coins: 80, stars: 9, xp: 40 } }
];

export const ORDER_MAP: Record<string, OrderDef> = {};
for (const o of ORDERS) ORDER_MAP[o.id] = o;
