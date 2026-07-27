// 游戏引擎：纯逻辑层（不接触 DOM）。所有状态写操作均经 STATE 并持久化。
// 覆盖 M2 合并板、M3 资源经济、M4 Gate 与进度。
import { STATE } from './state/store';
import type { GameState, RoomProgress } from './state/store';
import { CONFIG } from './data/config';
import { ITEMS, nextTier } from './data/chains';
import { GENERATORS, GENERATOR_MAP } from './data/generators';
import { AREAS, AREA_MAP, ORDERS, ORDER_MAP, roomById } from './data/areas';
import type { Reward, GeneratorDef, AreaDef, RoomDef, TaskDef } from './types';

export type ToastKind = 'good' | 'bad' | 'info';
export interface ActionResult {
  ok: boolean;
  msg: string;
  kind?: ToastKind;
  news?: string[]; // 新解锁的名称（区域/生成器）
}

function good(msg: string, news: string[] = []): ActionResult {
  return { ok: true, msg, kind: 'good', news };
}
function bad(msg: string): ActionResult {
  return { ok: false, msg, kind: 'bad' };
}

// ---------------- 棋盘工具 ----------------
export function countOnBoard(itemId: string): number {
  return STATE.get().board.filter((x) => x === itemId).length;
}
function firstEmpty(): number {
  return STATE.get().board.findIndex((x) => x === null);
}
function removeItems(itemId: string, qty: number): void {
  const s = STATE.get();
  let removed = 0;
  for (let i = 0; i < s.board.length && removed < qty; i++) {
    if (s.board[i] === itemId) {
      s.board[i] = null;
      removed++;
    }
  }
}

// ---------------- 升级 / 奖励 ----------------
let pendingNews: string[] = [];
export function drainNews(): string[] {
  const n = pendingNews;
  pendingNews = [];
  return n;
}

function addXp(s: GameState, n: number): void {
  s.xp += n;
  let need = CONFIG.xpToNext(s.level);
  while (s.xp >= need) {
    s.xp -= need;
    s.level += 1;
    s.energy = Math.min(CONFIG.energyMax, s.energy + 20); // 升级补能
    need = CONFIG.xpToNext(s.level);
  }
  const nw = syncUnlocks(s); // 升级可能解锁区域/生成器
  pendingNews.push(...nw);
}

function addReward(s: GameState, r: Reward): void {
  s.coins += r.coins;
  s.stars += r.stars;
  addXp(s, r.xp);
}

// ---------------- Gate 判定 ----------------
export function computeAreaUnlocked(area: AreaDef, s: GameState): boolean {
  if (area.unlockLevel > s.level) return false;
  if (area.prereqAreaId) {
    const pre = AREA_MAP[area.prereqAreaId];
    if (!pre.rooms.every((r) => s.rooms[r.id].decorated)) return false;
  }
  return true;
}

export function computeGenUnlocked(gen: GeneratorDef, s: GameState): boolean {
  if (gen.unlockLevel && s.level < gen.unlockLevel) return false;
  if (gen.unlockArea && !s.areasUnlocked.includes(gen.unlockArea)) return false;
  return true;
}

export function isRoomUnlocked(room: RoomDef, s: GameState): boolean {
  const area = AREAS.find((a) => a.rooms.some((r) => r.id === room.id));
  if (!area || !computeAreaUnlocked(area, s)) return false;
  if (room.prereqRoomId && !s.rooms[room.prereqRoomId].decorated) return false;
  return true;
}

export function isRoomDecoratable(room: RoomDef, s: GameState): boolean {
  if (!isRoomUnlocked(room, s)) return false;
  const rp = s.rooms[room.id];
  if (rp.decorated) return false;
  if (!room.tasks.every((t) => rp.tasksDone.includes(t.id))) return false;
  return s.stars >= room.decorateCost;
}

export function currentTask(room: RoomDef, s: GameState): TaskDef | null {
  const rp = s.rooms[room.id];
  return room.tasks.find((t) => !rp.tasksDone.includes(t.id)) ?? null;
}

// 重算并写入解锁集合；返回本次新解锁的名称
export function syncUnlocks(s: GameState): string[] {
  const beforeA = new Set(s.areasUnlocked);
  const beforeG = new Set(s.generatorsUnlocked);
  for (const a of AREAS) {
    if (computeAreaUnlocked(a, s) && !beforeA.has(a.id)) s.areasUnlocked.push(a.id);
  }
  for (const g of GENERATORS) {
    if (computeGenUnlocked(g, s) && !beforeG.has(g.id)) s.generatorsUnlocked.push(g.id);
  }
  const news: string[] = [];
  for (const id of s.areasUnlocked) if (!beforeA.has(id)) news.push(`${AREA_MAP[id].name}（区域）`);
  for (const id of s.generatorsUnlocked) if (!beforeG.has(id)) news.push(`${GENERATOR_MAP[id].name}（生成器）`);
  return news;
}

function pickNewOrder(active: string[]): string {
  const pool = ORDERS.filter((o) => !active.includes(o.id));
  const src = pool.length ? pool : ORDERS;
  return src[Math.floor(Math.random() * src.length)].id;
}

// ---------------- 动作 ----------------
// 生成器产出基础物（耗能量）
export function spawn(genId: string): ActionResult {
  const s = STATE.get();
  const gen = GENERATOR_MAP[genId];
  if (!gen) return bad('生成器不存在');
  if (!computeGenUnlocked(gen, s)) return bad('生成器尚未解锁');
  if (s.energy < CONFIG.spawnCost) return bad('能量不足');
  const idx = firstEmpty();
  if (idx < 0) return bad('棋盘已满，先合并或清理');
  s.board[idx] = gen.produces;
  s.energy -= CONFIG.spawnCost;
  STATE.save();
  return good(`产出 ${ITEMS[gen.produces].name}`);
}

// 拖拽：from->to。空格=移动；同类=合并；异类=无效
export function moveOrMerge(from: number, to: number): ActionResult {
  if (from === to) return bad('');
  const s = STATE.get();
  const a = s.board[from];
  const b = s.board[to];
  if (!a) return bad('');
  if (!b) {
    s.board[to] = a;
    s.board[from] = null;
    STATE.save();
    return good('移动');
  }
  if (a === b) {
    const up = nextTier(a);
    if (!up) return bad('已是最高级');
    s.board[to] = up;
    s.board[from] = null;
    addXp(s, 2); // 合并给少量经验
    STATE.save();
    const news = drainNews();
    return good(`合成 ${ITEMS[up].name}`, news);
  }
  return bad('无法合并（物品不同）');
}

// 完成任务（G4 顺序）
export function completeTask(roomId: string, taskId: string): ActionResult {
  const s = STATE.get();
  const room = roomById(roomId);
  const rp: RoomProgress = s.rooms[roomId];
  if (!room || !rp) return bad('房间不存在');
  if (!isRoomUnlocked(room, s)) return bad('房间未解锁');
  if (rp.tasksDone.includes(taskId)) return bad('已完成');
  const cur = currentTask(room, s);
  if (cur?.id !== taskId) return bad('请按顺序完成任务');
  if (countOnBoard(cur.requireItem) < cur.requireQty) {
    return bad(`棋盘上 ${ITEMS[cur.requireItem].name} 不足（需 ×${cur.requireQty}）`);
  }
  removeItems(cur.requireItem, cur.requireQty);
  addReward(s, cur.reward);
  rp.tasksDone.push(taskId);
  STATE.save();
  const news = drainNews();
  return good(`完成任务 +${cur.reward.coins}币 +${cur.reward.stars}★ +${cur.reward.xp}xp`, news);
}

// 交付客人订单（G5 星星主来源）
export function completeOrder(orderId: string): ActionResult {
  const s = STATE.get();
  if (!s.orders.includes(orderId)) return bad('订单已失效');
  const ord = ORDER_MAP[orderId];
  if (countOnBoard(ord.requireItem) < ord.requireQty) {
    return bad(`棋盘上 ${ITEMS[ord.requireItem].name} 不足（需 ×${ord.requireQty}）`);
  }
  removeItems(ord.requireItem, ord.requireQty);
  addReward(s, ord.reward);
  const idx = s.orders.indexOf(orderId);
  s.orders[idx] = pickNewOrder(s.orders);
  STATE.save();
  const news = drainNews();
  return good(`交付订单 +${ord.reward.coins}币 +${ord.reward.stars}★ +${ord.reward.xp}xp`, news);
}

// 装修房间（G5 星星门槛；完成后解锁 G3 下一房间 / G2 下一区域）
export function decorateRoom(roomId: string): ActionResult {
  const s = STATE.get();
  const room = roomById(roomId);
  const rp = s.rooms[roomId];
  if (!room || !rp) return bad('房间不存在');
  if (!isRoomUnlocked(room, s)) return bad('房间未解锁');
  if (rp.decorated) return bad('已装修');
  if (!room.tasks.every((t) => rp.tasksDone.includes(t.id))) return bad('需先完成全部任务');
  if (s.stars < room.decorateCost) return bad(`星星不足（需 ${room.decorateCost}★）`);
  s.stars -= room.decorateCost;
  rp.decorated = true;
  STATE.save();
  const news = syncUnlocks(s);
  return good(`装修完成：${room.name}`, news);
}

// 补能量
export function refillByCoin(): ActionResult {
  const s = STATE.get();
  if (s.coins < CONFIG.coinRefillCost) return bad('金币不足');
  s.coins -= CONFIG.coinRefillCost;
  s.energy = CONFIG.energyMax;
  s.lastEnergyTick = Date.now();
  STATE.save();
  return good('能量已补满（金币）');
}

export function refillByGem(): ActionResult {
  const s = STATE.get();
  const cost = CONFIG.gemRefillBase + s.gemRefillsUsed * CONFIG.gemRefillStep;
  if (s.gems < cost) return bad(`钻石不足（需 ${cost}）`);
  s.gems -= cost;
  s.gemRefillsUsed += 1;
  s.energy = CONFIG.energyMax;
  s.lastEnergyTick = Date.now();
  STATE.save();
  return good('能量已补满（钻石）');
}

export function gemRefillCost(): number {
  const s = STATE.get();
  return CONFIG.gemRefillBase + s.gemRefillsUsed * CONFIG.gemRefillStep;
}

// 能量再生（每 energyRegenMs 回 1 点）；返回是否变化
export function tickEnergy(now: number): boolean {
  const s = STATE.get();
  if (s.energy >= CONFIG.energyMax) {
    s.lastEnergyTick = now;
    STATE.save();
    return false;
  }
  const elapsed = now - s.lastEnergyTick;
  const gained = Math.floor(elapsed / CONFIG.energyRegenMs);
  if (gained > 0) {
    s.energy = Math.min(CONFIG.energyMax, s.energy + gained);
    s.lastEnergyTick = s.lastEnergyTick + gained * CONFIG.energyRegenMs;
    STATE.save();
    return true;
  }
  return false;
}

export function resetGame(): void {
  STATE.reset();
}
