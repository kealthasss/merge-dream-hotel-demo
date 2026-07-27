// 引擎逻辑功能测试（Node 无头运行，不依赖浏览器/DOM）
// 目的：证明核心闭环与 Gate 机制确实成立，而非仅仅"构建通过"。
import { STATE } from '../src/state/store';
import { CONFIG } from '../src/data/config';
import { AREA_MAP, roomById } from '../src/data/areas';
import { GENERATOR_MAP } from '../src/data/generators';
import {
  spawn,
  moveOrMerge,
  completeTask,
  completeOrder,
  decorateRoom,
  computeAreaUnlocked,
  computeGenUnlocked,
  isRoomUnlocked,
  isRoomDecoratable,
  tickEnergy,
  resetGame,
  syncUnlocks
} from '../src/game';

let pass = 0;
let fail = 0;
const fails: string[] = [];
function ok(cond: boolean, name: string) {
  if (cond) {
    pass++;
    console.log('  ✓ ' + name);
  } else {
    fail++;
    fails.push(name);
    console.log('  ✗ ' + name);
  }
}

function setBoard(items: Record<number, string | null>) {
  const s = STATE.get();
  for (const k of Object.keys(items)) s.board[Number(k)] = items[Number(k)];
  STATE.save();
}

console.log('[T1] 初始教学种子');
resetGame();
{
  const b = STATE.get().board;
  ok(b[0] === 'cleaning_1' && b[1] === 'cleaning_1' && b[2] === 'cleaning_2', '开局预置 2×抹布 + 1×扫帚');
  ok(STATE.get().orders.length === 3, '初始 3 条客人订单');
}

console.log('[T2] 生成器产出与能量消耗');
resetGame();
{
  const before = STATE.get().energy;
  const r = spawn('gen_toolbox');
  ok(r.ok && STATE.get().energy === before - CONFIG.spawnCost, '产出成功且能量 -1');
  ok(STATE.get().board.includes('cleaning_1'), '棋盘出现基础物');
}

console.log('[T3] 合并同类升级');
resetGame();
{
  const r = moveOrMerge(0, 1); // 两个 cleaning_1 -> cleaning_2
  ok(r.ok && STATE.get().board[1] === 'cleaning_2' && STATE.get().board[0] === null, '两抹布合成扫帚');
}

console.log('[T4] 异类不可合并 / 满盘不出');
resetGame();
{
  setBoard({ 3: 'linen_1' });
  const r = moveOrMerge(2, 3); // cleaning_2(种子) vs linen_1 -> 失败
  ok(!r.ok, '不同物品无法合并');
  STATE.get().board = STATE.get().board.map(() => 'cleaning_1');
  STATE.save();
  const r2 = spawn('gen_toolbox');
  ok(!r2.ok, '棋盘满时生成器拒绝产出');
}

console.log('[T5] 能量不足拒绝产出');
resetGame();
{
  STATE.get().energy = 0;
  STATE.save();
  const r = spawn('gen_toolbox');
  ok(!r.ok, '能量为 0 时拒绝');
}

console.log('[T6] 完成任务（G4 顺序）与奖励');
resetGame();
{
  setBoard({ 4: 'cleaning_2', 5: 'cleaning_2' }); // 已有 [2] 处的 cleaning_2，共 3 个
  const r = completeTask('room_lobby_front', 't_front_1'); // 需 cleaning_2 ×3
  ok(r.ok, '按顺序完成任务');
  const s = STATE.get();
  ok(s.rooms['room_lobby_front'].tasksDone.includes('t_front_1'), '任务记为已完成');
  ok(s.coins === 25 && s.stars === 2, '奖励发放（币25/星2）');
}

console.log('[T7] Gate：区域/生成器初始锁定');
resetGame();
{
  ok(!computeAreaUnlocked(AREA_MAP['area_2'], STATE.get()), '客房层初始锁定');
  ok(!computeGenUnlocked(GENERATOR_MAP['gen_linen'], STATE.get()), '布草箱初始锁定（Lv3）');
  ok(!isRoomUnlocked(roomById('room_guest_std')!, STATE.get()), '标准间初始未解锁');
}

console.log('[T8] Gate：等级门槛解锁生成器');
resetGame();
{
  STATE.get().level = 3;
  STATE.save();
  syncUnlocks(STATE.get());
  ok(computeGenUnlocked(GENERATOR_MAP['gen_linen'], STATE.get()), 'Lv3 解锁布草箱');
}

console.log('[T9] 完整进度链：装修大堂 → Lv5 → 解锁客房层 + 食材篮');
resetGame();
{
  const s = STATE.get();
  const front = roomById('room_lobby_front')!;
  const lounge = roomById('room_lobby_lounge')!;
  s.rooms[front.id].tasksDone = front.tasks.map((t) => t.id);
  s.stars = 8;
  STATE.save();
  decorateRoom(front.id);
  s.rooms[lounge.id].tasksDone = lounge.tasks.map((t) => t.id);
  s.stars = 12;
  STATE.save();
  decorateRoom(lounge.id);
  s.level = 5;
  STATE.save();
  syncUnlocks(s);
  ok(computeAreaUnlocked(AREA_MAP['area_2'], s), '大堂全装修 + Lv5 → 客房层解锁');
  ok(s.areasUnlocked.includes('area_2'), '客房层写入解锁集合');
  ok(computeGenUnlocked(GENERATOR_MAP['gen_pantry'], s), '客房层解锁 → 食材篮解锁');
  ok(isRoomUnlocked(roomById('room_guest_std')!, s), '标准间解锁');
}

console.log('[T10] 装修门槛（G5 星星）');
resetGame();
{
  const s = STATE.get();
  const room = roomById('room_lobby_front')!;
  s.rooms[room.id].tasksDone = room.tasks.map((t) => t.id);
  s.stars = 8;
  STATE.save();
  ok(isRoomDecoratable(room, s), '任务完成+星星足够 → 可装修');
  const r = decorateRoom(room.id);
  ok(r.ok && s.rooms[room.id].decorated && s.stars === 0, '装修成功且扣除 8★');
}

console.log('[T11] 客人订单交付（G5 星星主来源）');
resetGame();
{
  setBoard({ 6: 'cleaning_3', 7: 'cleaning_3' });
  const r = completeOrder('ord_1'); // cleaning_3 ×2 → 40币/5星
  ok(r.ok && !STATE.get().orders.includes('ord_1'), '订单交付并刷新');
  ok(STATE.get().coins === 40 && STATE.get().stars === 5, '订单奖励（币40/星5）');
}

console.log('[T12] 能量再生 tick');
resetGame();
{
  const s = STATE.get();
  s.energy = 50;
  s.lastEnergyTick = Date.now() - CONFIG.energyRegenMs * 3;
  STATE.save();
  const changed = tickEnergy(Date.now());
  ok(changed && STATE.get().energy >= 53, '跨 3 个再生周期回能');
}

console.log('[T13] 重置');
resetGame();
{
  const b = STATE.get().board;
  ok(b[0] === 'cleaning_1' && STATE.get().level === 1 && STATE.get().coins === 0, '重置回到初始态');
}

console.log('[T14] 未解锁区域/房间任务不可交付');
resetGame();
{
  // 客房层未解锁（需 Lv5），标准间任务 t_guest_std_1 需求 cleaning_4 ×2
  setBoard({ 0: 'cleaning_4', 1: 'cleaning_4' });
  const r = completeTask('room_guest_std', 't_guest_std_1');
  ok(!r.ok, '未解锁房间任务无法交付');
  // 大堂已解锁，前台任务可正常交付
  setBoard({ 2: 'cleaning_2', 3: 'cleaning_2', 4: 'cleaning_2' });
  const r2 = completeTask('room_lobby_front', 't_front_1');
  ok(r2.ok, '已解锁房间任务可交付');
}

console.log(`\n结果：通过 ${pass} / 失败 ${fail}`);
if (fail > 0) {
  console.log('失败项：\n - ' + fails.join('\n - '));
  process.exit(1);
} else {
  console.log('全部通过 ✅');
}
