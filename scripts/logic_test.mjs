// src/data/config.ts
var CONFIG = {
  // 能量（G6 摩擦）
  energyMax: 100,
  energyStart: 100,
  energyRegenMs: 12e4,
  // 每 120s 回复 1 点
  // 生成器产出消耗
  spawnCost: 1,
  // 每次点击生成器产出 1 个基础物，耗 1 能量
  // 补能量
  coinRefillCost: 30,
  // 用金币补满
  gemRefillBase: 10,
  // 用钻石补满（首次）
  gemRefillStep: 2,
  // 每次补满后钻石成本 +2（递增）
  // 棋盘（横屏）
  boardCols: 8,
  boardRows: 5,
  // 8×5 = 40 格
  // 等级
  startLevel: 1,
  startGems: 5,
  // 升级所需经验曲线：Lv -> 升级到下一级所需 XP
  xpToNext: (lv) => 50 + lv * 30,
  // 首局确定性教学（M2 使用）：开局预置的板上物品
  firstRunSeed: true
};

// src/data/areas.ts
var AREAS = [
  {
    id: "area_1",
    name: "\u5927\u5802",
    unlockLevel: 0,
    // 开局即解锁
    rooms: [
      {
        id: "room_lobby_front",
        name: "\u524D\u53F0",
        decorateCost: 8,
        tasks: [
          { id: "t_front_1", order: 1, requireItem: "cleaning_2", requireQty: 3, reward: { coins: 25, stars: 2, xp: 12 } },
          { id: "t_front_2", order: 2, requireItem: "cleaning_3", requireQty: 2, reward: { coins: 30, stars: 2, xp: 15 } },
          { id: "t_front_3", order: 3, requireItem: "cleaning_5", requireQty: 1, reward: { coins: 40, stars: 3, xp: 20 } }
        ]
      },
      {
        id: "room_lobby_lounge",
        name: "\u4F11\u606F\u533A",
        prereqRoomId: "room_lobby_front",
        decorateCost: 12,
        tasks: [
          { id: "t_lounge_1", order: 1, requireItem: "cleaning_4", requireQty: 2, reward: { coins: 35, stars: 3, xp: 18 } },
          { id: "t_lounge_2", order: 2, requireItem: "linen_2", requireQty: 3, reward: { coins: 35, stars: 3, xp: 18 } },
          { id: "t_lounge_3", order: 3, requireItem: "linen_3", requireQty: 1, reward: { coins: 45, stars: 4, xp: 22 } }
        ]
      }
    ]
  },
  {
    id: "area_2",
    name: "\u5BA2\u623F\u5C42",
    unlockLevel: 5,
    // G1：Lv5 解锁
    prereqAreaId: "area_1",
    // G2：大堂全装修后
    rooms: [
      {
        id: "room_guest_std",
        name: "\u6807\u51C6\u95F4",
        decorateCost: 12,
        tasks: [
          { id: "t_std_1", order: 1, requireItem: "linen_3", requireQty: 2, reward: { coins: 40, stars: 3, xp: 20 } },
          { id: "t_std_2", order: 2, requireItem: "linen_4", requireQty: 1, reward: { coins: 45, stars: 3, xp: 22 } },
          { id: "t_std_3", order: 3, requireItem: "fb_2", requireQty: 3, reward: { coins: 40, stars: 3, xp: 20 } }
        ]
      },
      {
        id: "room_guest_suite",
        name: "\u5957\u623F",
        prereqRoomId: "room_guest_std",
        decorateCost: 16,
        tasks: [
          { id: "t_suite_1", order: 1, requireItem: "linen_5", requireQty: 1, reward: { coins: 60, stars: 5, xp: 30 } },
          { id: "t_suite_2", order: 2, requireItem: "fb_4", requireQty: 2, reward: { coins: 55, stars: 5, xp: 28 } }
        ]
      }
    ]
  },
  {
    id: "area_3",
    name: "\u9910\u5385",
    unlockLevel: 8,
    // G1：Lv8 解锁
    prereqAreaId: "area_2",
    // G2：客房层全装修后
    rooms: [
      {
        id: "room_cafe",
        name: "\u5496\u5561\u5385",
        decorateCost: 16,
        tasks: [
          { id: "t_cafe_1", order: 1, requireItem: "fb_4", requireQty: 2, reward: { coins: 55, stars: 5, xp: 28 } },
          { id: "t_cafe_2", order: 2, requireItem: "fb_5", requireQty: 1, reward: { coins: 70, stars: 6, xp: 35 } }
        ]
      },
      {
        id: "room_banquet",
        name: "\u5BB4\u4F1A\u5385",
        prereqRoomId: "room_cafe",
        decorateCost: 20,
        tasks: [
          { id: "t_banquet_1", order: 1, requireItem: "fb_5", requireQty: 3, reward: { coins: 90, stars: 8, xp: 45 } },
          { id: "t_banquet_2", order: 2, requireItem: "cleaning_5", requireQty: 2, reward: { coins: 80, stars: 7, xp: 40 } }
        ]
      }
    ]
  }
];
var AREA_MAP = {};
for (const a of AREAS) AREA_MAP[a.id] = a;
function allRooms() {
  return AREAS.flatMap((a) => a.rooms);
}
function roomById(id) {
  return allRooms().find((r) => r.id === id);
}
var ORDERS = [
  { id: "ord_1", requireItem: "cleaning_3", requireQty: 2, reward: { coins: 40, stars: 5, xp: 20 } },
  { id: "ord_2", requireItem: "linen_2", requireQty: 2, reward: { coins: 35, stars: 4, xp: 18 } },
  { id: "ord_3", requireItem: "cleaning_4", requireQty: 1, reward: { coins: 45, stars: 5, xp: 22 } },
  { id: "ord_4", requireItem: "linen_3", requireQty: 1, reward: { coins: 50, stars: 6, xp: 25 } },
  { id: "ord_5", requireItem: "fb_3", requireQty: 2, reward: { coins: 55, stars: 6, xp: 28 } },
  { id: "ord_6", requireItem: "cleaning_5", requireQty: 1, reward: { coins: 70, stars: 8, xp: 35 } },
  { id: "ord_7", requireItem: "fb_4", requireQty: 1, reward: { coins: 65, stars: 7, xp: 30 } },
  { id: "ord_8", requireItem: "linen_5", requireQty: 1, reward: { coins: 80, stars: 9, xp: 40 } }
];
var ORDER_MAP = {};
for (const o of ORDERS) ORDER_MAP[o.id] = o;

// src/state/store.ts
var KEY = "mergehotel_demo_v1";
function makeBoard() {
  return new Array(CONFIG.boardCols * CONFIG.boardRows).fill(null);
}
function defaultRooms() {
  const r = {};
  for (const a of AREAS) for (const rm of a.rooms) r[rm.id] = { tasksDone: [], decorated: false };
  return r;
}
function seedBoard() {
  const b = makeBoard();
  b[0] = "cleaning_1";
  b[1] = "cleaning_1";
  b[2] = "cleaning_2";
  return b;
}
function defaultState() {
  return {
    version: 2,
    energy: CONFIG.energyStart,
    coins: 0,
    gems: CONFIG.startGems,
    stars: 0,
    xp: 0,
    level: CONFIG.startLevel,
    board: seedBoard(),
    rooms: defaultRooms(),
    areasUnlocked: [AREAS[0].id],
    generatorsUnlocked: ["gen_toolbox"],
    orders: ORDERS.slice(0, 3).map((o) => o.id),
    lastEnergyTick: Date.now(),
    gemRefillsUsed: 0
  };
}
var Store = class {
  state;
  constructor() {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    this.state = raw ? JSON.parse(raw) : defaultState();
    if (this.state.version !== 2) this.state = defaultState();
  }
  get() {
    return this.state;
  }
  save() {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(this.state));
  }
  reset() {
    this.state = defaultState();
    this.save();
  }
};
var STATE = new Store();

// src/data/generators.ts
var GENERATORS = [
  {
    id: "gen_toolbox",
    name: "\u5DE5\u5177\u7BB1",
    produces: "cleaning_1",
    energyCost: 1
    // 无解锁条件：开局可用
  },
  {
    id: "gen_linen",
    name: "\u5E03\u8349\u7BB1",
    produces: "linen_1",
    energyCost: 1,
    unlockLevel: 3
    // G1：Lv3 解锁布草链
  },
  {
    id: "gen_pantry",
    name: "\u98DF\u6750\u7BEE",
    produces: "fb_1",
    energyCost: 1,
    unlockArea: "area_2"
    // G7：到达客房层后解锁餐饮链
  }
];
var GENERATOR_MAP = {};
for (const g of GENERATORS) GENERATOR_MAP[g.id] = g;

// src/data/chains.ts
var cleaning = [
  { id: "cleaning_1", chain: "cleaning", tier: 1, name: "\u62B9\u5E03", icon: "\u{1F9FD}", color: "#3fb8af" },
  { id: "cleaning_2", chain: "cleaning", tier: 2, name: "\u626B\u5E1A", icon: "\u{1F9F9}", color: "#37a89f" },
  { id: "cleaning_3", chain: "cleaning", tier: 3, name: "\u62D6\u628A", icon: "\u{1FAA3}", color: "#2f968f" },
  { id: "cleaning_4", chain: "cleaning", tier: 4, name: "\u5438\u5C18\u5668", icon: "\u{1F300}", color: "#288679" },
  { id: "cleaning_5", chain: "cleaning", tier: 5, name: "\u6E05\u6D01\u8F66", icon: "\u{1F6D2}", color: "#207066" }
];
var linen = [
  { id: "linen_1", chain: "linen", tier: 1, name: "\u7EBF\u56E2", icon: "\u{1F9F5}", color: "#e98ab5" },
  { id: "linen_2", chain: "linen", tier: 2, name: "\u6BDB\u5DFE", icon: "\u{1F9FB}", color: "#e07aa8" },
  { id: "linen_3", chain: "linen", tier: 3, name: "\u5E8A\u5355", icon: "\u{1F6CF}\uFE0F", color: "#d06a9b" },
  { id: "linen_4", chain: "linen", tier: 4, name: "\u6795\u5934", icon: "\u{1F4A4}", color: "#c05a8e" },
  { id: "linen_5", chain: "linen", tier: 5, name: "\u7FBD\u7ED2\u88AB", icon: "\u{1F6CC}", color: "#b04a81" }
];
var fb = [
  { id: "fb_1", chain: "fb", tier: 1, name: "\u5C0F\u9EA6", icon: "\u{1F33E}", color: "#e0b45a" },
  { id: "fb_2", chain: "fb", tier: 2, name: "\u9762\u7C89", icon: "\u{1F35A}", color: "#d9a84a" },
  { id: "fb_3", chain: "fb", tier: 3, name: "\u9762\u56E2", icon: "\u{1FAD3}", color: "#d29c3c" },
  { id: "fb_4", chain: "fb", tier: 4, name: "\u9762\u5305", icon: "\u{1F35E}", color: "#cb902e" },
  { id: "fb_5", chain: "fb", tier: 5, name: "\u86CB\u7CD5", icon: "\u{1F370}", color: "#c48420" }
];
var CHAINS = [
  { id: "cleaning", name: "\u6E05\u6D01\u94FE", tiers: cleaning, generatorId: "gen_toolbox" },
  { id: "linen", name: "\u5E03\u8349\u94FE", tiers: linen, generatorId: "gen_linen" },
  { id: "fb", name: "\u9910\u996E\u94FE", tiers: fb, generatorId: "gen_pantry" }
];
var ITEMS = {};
for (const c of CHAINS) for (const it of c.tiers) ITEMS[it.id] = it;
function nextTier(itemId) {
  const it = ITEMS[itemId];
  if (!it) return null;
  const chain = CHAINS.find((c) => c.id === it.chain);
  const up = chain.tiers.find((t) => t.tier === it.tier + 1);
  return up ? up.id : null;
}

// src/game.ts
function good(msg, news = []) {
  return { ok: true, msg, kind: "good", news };
}
function bad(msg) {
  return { ok: false, msg, kind: "bad" };
}
function countOnBoard(itemId) {
  return STATE.get().board.filter((x) => x === itemId).length;
}
function firstEmpty() {
  return STATE.get().board.findIndex((x) => x === null);
}
function removeItems(itemId, qty) {
  const s = STATE.get();
  let removed = 0;
  for (let i = 0; i < s.board.length && removed < qty; i++) {
    if (s.board[i] === itemId) {
      s.board[i] = null;
      removed++;
    }
  }
}
var pendingNews = [];
function drainNews() {
  const n = pendingNews;
  pendingNews = [];
  return n;
}
function addXp(s, n) {
  s.xp += n;
  let need = CONFIG.xpToNext(s.level);
  while (s.xp >= need) {
    s.xp -= need;
    s.level += 1;
    s.energy = Math.min(CONFIG.energyMax, s.energy + 20);
    need = CONFIG.xpToNext(s.level);
  }
  const nw = syncUnlocks(s);
  pendingNews.push(...nw);
}
function addReward(s, r) {
  s.coins += r.coins;
  s.stars += r.stars;
  addXp(s, r.xp);
}
function computeAreaUnlocked(area, s) {
  if (area.unlockLevel > s.level) return false;
  if (area.prereqAreaId) {
    const pre = AREA_MAP[area.prereqAreaId];
    if (!pre.rooms.every((r) => s.rooms[r.id].decorated)) return false;
  }
  return true;
}
function computeGenUnlocked(gen, s) {
  if (gen.unlockLevel && s.level < gen.unlockLevel) return false;
  if (gen.unlockArea && !s.areasUnlocked.includes(gen.unlockArea)) return false;
  return true;
}
function isRoomUnlocked(room, s) {
  const area = AREAS.find((a) => a.rooms.some((r) => r.id === room.id));
  if (!area || !computeAreaUnlocked(area, s)) return false;
  if (room.prereqRoomId && !s.rooms[room.prereqRoomId].decorated) return false;
  return true;
}
function isRoomDecoratable(room, s) {
  if (!isRoomUnlocked(room, s)) return false;
  const rp = s.rooms[room.id];
  if (rp.decorated) return false;
  if (!room.tasks.every((t) => rp.tasksDone.includes(t.id))) return false;
  return s.stars >= room.decorateCost;
}
function currentTask(room, s) {
  const rp = s.rooms[room.id];
  return room.tasks.find((t) => !rp.tasksDone.includes(t.id)) ?? null;
}
function syncUnlocks(s) {
  const beforeA = new Set(s.areasUnlocked);
  const beforeG = new Set(s.generatorsUnlocked);
  for (const a of AREAS) {
    if (computeAreaUnlocked(a, s) && !beforeA.has(a.id)) s.areasUnlocked.push(a.id);
  }
  for (const g of GENERATORS) {
    if (computeGenUnlocked(g, s) && !beforeG.has(g.id)) s.generatorsUnlocked.push(g.id);
  }
  const news = [];
  for (const id of s.areasUnlocked) if (!beforeA.has(id)) news.push(`${AREA_MAP[id].name}\uFF08\u533A\u57DF\uFF09`);
  for (const id of s.generatorsUnlocked) if (!beforeG.has(id)) news.push(`${GENERATOR_MAP[id].name}\uFF08\u751F\u6210\u5668\uFF09`);
  return news;
}
function pickNewOrder(active) {
  const pool = ORDERS.filter((o) => !active.includes(o.id));
  const src = pool.length ? pool : ORDERS;
  return src[Math.floor(Math.random() * src.length)].id;
}
function spawn(genId) {
  const s = STATE.get();
  const gen = GENERATOR_MAP[genId];
  if (!gen) return bad("\u751F\u6210\u5668\u4E0D\u5B58\u5728");
  if (!computeGenUnlocked(gen, s)) return bad("\u751F\u6210\u5668\u5C1A\u672A\u89E3\u9501");
  if (s.energy < CONFIG.spawnCost) return bad("\u80FD\u91CF\u4E0D\u8DB3");
  const idx = firstEmpty();
  if (idx < 0) return bad("\u68CB\u76D8\u5DF2\u6EE1\uFF0C\u5148\u5408\u5E76\u6216\u6E05\u7406");
  s.board[idx] = gen.produces;
  s.energy -= CONFIG.spawnCost;
  STATE.save();
  return good(`\u4EA7\u51FA ${ITEMS[gen.produces].name}`);
}
function moveOrMerge(from, to) {
  if (from === to) return bad("");
  const s = STATE.get();
  const a = s.board[from];
  const b = s.board[to];
  if (!a) return bad("");
  if (!b) {
    s.board[to] = a;
    s.board[from] = null;
    STATE.save();
    return good("\u79FB\u52A8");
  }
  if (a === b) {
    const up = nextTier(a);
    if (!up) return bad("\u5DF2\u662F\u6700\u9AD8\u7EA7");
    s.board[to] = up;
    s.board[from] = null;
    addXp(s, 2);
    STATE.save();
    const news = drainNews();
    return good(`\u5408\u6210 ${ITEMS[up].name}`, news);
  }
  return bad("\u65E0\u6CD5\u5408\u5E76\uFF08\u7269\u54C1\u4E0D\u540C\uFF09");
}
function completeTask(roomId, taskId) {
  const s = STATE.get();
  const room = roomById(roomId);
  const rp = s.rooms[roomId];
  if (!room || !rp) return bad("\u623F\u95F4\u4E0D\u5B58\u5728");
  if (!isRoomUnlocked(room, s)) return bad("\u623F\u95F4\u672A\u89E3\u9501");
  if (rp.tasksDone.includes(taskId)) return bad("\u5DF2\u5B8C\u6210");
  const cur = currentTask(room, s);
  if (cur?.id !== taskId) return bad("\u8BF7\u6309\u987A\u5E8F\u5B8C\u6210\u4EFB\u52A1");
  if (countOnBoard(cur.requireItem) < cur.requireQty) {
    return bad(`\u68CB\u76D8\u4E0A ${ITEMS[cur.requireItem].name} \u4E0D\u8DB3\uFF08\u9700 \xD7${cur.requireQty}\uFF09`);
  }
  removeItems(cur.requireItem, cur.requireQty);
  addReward(s, cur.reward);
  rp.tasksDone.push(taskId);
  STATE.save();
  const news = drainNews();
  return good(`\u5B8C\u6210\u4EFB\u52A1 +${cur.reward.coins}\u5E01 +${cur.reward.stars}\u2605 +${cur.reward.xp}xp`, news);
}
function completeOrder(orderId) {
  const s = STATE.get();
  if (!s.orders.includes(orderId)) return bad("\u8BA2\u5355\u5DF2\u5931\u6548");
  const ord = ORDER_MAP[orderId];
  if (countOnBoard(ord.requireItem) < ord.requireQty) {
    return bad(`\u68CB\u76D8\u4E0A ${ITEMS[ord.requireItem].name} \u4E0D\u8DB3\uFF08\u9700 \xD7${ord.requireQty}\uFF09`);
  }
  removeItems(ord.requireItem, ord.requireQty);
  addReward(s, ord.reward);
  const idx = s.orders.indexOf(orderId);
  s.orders[idx] = pickNewOrder(s.orders);
  STATE.save();
  const news = drainNews();
  return good(`\u4EA4\u4ED8\u8BA2\u5355 +${ord.reward.coins}\u5E01 +${ord.reward.stars}\u2605 +${ord.reward.xp}xp`, news);
}
function decorateRoom(roomId) {
  const s = STATE.get();
  const room = roomById(roomId);
  const rp = s.rooms[roomId];
  if (!room || !rp) return bad("\u623F\u95F4\u4E0D\u5B58\u5728");
  if (!isRoomUnlocked(room, s)) return bad("\u623F\u95F4\u672A\u89E3\u9501");
  if (rp.decorated) return bad("\u5DF2\u88C5\u4FEE");
  if (!room.tasks.every((t) => rp.tasksDone.includes(t.id))) return bad("\u9700\u5148\u5B8C\u6210\u5168\u90E8\u4EFB\u52A1");
  if (s.stars < room.decorateCost) return bad(`\u661F\u661F\u4E0D\u8DB3\uFF08\u9700 ${room.decorateCost}\u2605\uFF09`);
  s.stars -= room.decorateCost;
  rp.decorated = true;
  STATE.save();
  const news = syncUnlocks(s);
  return good(`\u88C5\u4FEE\u5B8C\u6210\uFF1A${room.name}`, news);
}
function tickEnergy(now) {
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
function resetGame() {
  STATE.reset();
}

// scripts/logic_test.ts
var pass = 0;
var fail = 0;
var fails = [];
function ok(cond, name) {
  if (cond) {
    pass++;
    console.log("  \u2713 " + name);
  } else {
    fail++;
    fails.push(name);
    console.log("  \u2717 " + name);
  }
}
function setBoard(items) {
  const s = STATE.get();
  for (const k of Object.keys(items)) s.board[Number(k)] = items[Number(k)];
  STATE.save();
}
console.log("[T1] \u521D\u59CB\u6559\u5B66\u79CD\u5B50");
resetGame();
{
  const b = STATE.get().board;
  ok(b[0] === "cleaning_1" && b[1] === "cleaning_1" && b[2] === "cleaning_2", "\u5F00\u5C40\u9884\u7F6E 2\xD7\u62B9\u5E03 + 1\xD7\u626B\u5E1A");
  ok(STATE.get().orders.length === 3, "\u521D\u59CB 3 \u6761\u5BA2\u4EBA\u8BA2\u5355");
}
console.log("[T2] \u751F\u6210\u5668\u4EA7\u51FA\u4E0E\u80FD\u91CF\u6D88\u8017");
resetGame();
{
  const before = STATE.get().energy;
  const r = spawn("gen_toolbox");
  ok(r.ok && STATE.get().energy === before - CONFIG.spawnCost, "\u4EA7\u51FA\u6210\u529F\u4E14\u80FD\u91CF -1");
  ok(STATE.get().board.includes("cleaning_1"), "\u68CB\u76D8\u51FA\u73B0\u57FA\u7840\u7269");
}
console.log("[T3] \u5408\u5E76\u540C\u7C7B\u5347\u7EA7");
resetGame();
{
  const r = moveOrMerge(0, 1);
  ok(r.ok && STATE.get().board[1] === "cleaning_2" && STATE.get().board[0] === null, "\u4E24\u62B9\u5E03\u5408\u6210\u626B\u5E1A");
}
console.log("[T4] \u5F02\u7C7B\u4E0D\u53EF\u5408\u5E76 / \u6EE1\u76D8\u4E0D\u51FA");
resetGame();
{
  setBoard({ 3: "linen_1" });
  const r = moveOrMerge(2, 3);
  ok(!r.ok, "\u4E0D\u540C\u7269\u54C1\u65E0\u6CD5\u5408\u5E76");
  STATE.get().board = STATE.get().board.map(() => "cleaning_1");
  STATE.save();
  const r2 = spawn("gen_toolbox");
  ok(!r2.ok, "\u68CB\u76D8\u6EE1\u65F6\u751F\u6210\u5668\u62D2\u7EDD\u4EA7\u51FA");
}
console.log("[T5] \u80FD\u91CF\u4E0D\u8DB3\u62D2\u7EDD\u4EA7\u51FA");
resetGame();
{
  STATE.get().energy = 0;
  STATE.save();
  const r = spawn("gen_toolbox");
  ok(!r.ok, "\u80FD\u91CF\u4E3A 0 \u65F6\u62D2\u7EDD");
}
console.log("[T6] \u5B8C\u6210\u4EFB\u52A1\uFF08G4 \u987A\u5E8F\uFF09\u4E0E\u5956\u52B1");
resetGame();
{
  setBoard({ 4: "cleaning_2", 5: "cleaning_2" });
  const r = completeTask("room_lobby_front", "t_front_1");
  ok(r.ok, "\u6309\u987A\u5E8F\u5B8C\u6210\u4EFB\u52A1");
  const s = STATE.get();
  ok(s.rooms["room_lobby_front"].tasksDone.includes("t_front_1"), "\u4EFB\u52A1\u8BB0\u4E3A\u5DF2\u5B8C\u6210");
  ok(s.coins === 25 && s.stars === 2, "\u5956\u52B1\u53D1\u653E\uFF08\u5E0125/\u661F2\uFF09");
}
console.log("[T7] Gate\uFF1A\u533A\u57DF/\u751F\u6210\u5668\u521D\u59CB\u9501\u5B9A");
resetGame();
{
  ok(!computeAreaUnlocked(AREA_MAP["area_2"], STATE.get()), "\u5BA2\u623F\u5C42\u521D\u59CB\u9501\u5B9A");
  ok(!computeGenUnlocked(GENERATOR_MAP["gen_linen"], STATE.get()), "\u5E03\u8349\u7BB1\u521D\u59CB\u9501\u5B9A\uFF08Lv3\uFF09");
  ok(!isRoomUnlocked(roomById("room_guest_std"), STATE.get()), "\u6807\u51C6\u95F4\u521D\u59CB\u672A\u89E3\u9501");
}
console.log("[T8] Gate\uFF1A\u7B49\u7EA7\u95E8\u69DB\u89E3\u9501\u751F\u6210\u5668");
resetGame();
{
  STATE.get().level = 3;
  STATE.save();
  syncUnlocks(STATE.get());
  ok(computeGenUnlocked(GENERATOR_MAP["gen_linen"], STATE.get()), "Lv3 \u89E3\u9501\u5E03\u8349\u7BB1");
}
console.log("[T9] \u5B8C\u6574\u8FDB\u5EA6\u94FE\uFF1A\u88C5\u4FEE\u5927\u5802 \u2192 Lv5 \u2192 \u89E3\u9501\u5BA2\u623F\u5C42 + \u98DF\u6750\u7BEE");
resetGame();
{
  const s = STATE.get();
  const front = roomById("room_lobby_front");
  const lounge = roomById("room_lobby_lounge");
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
  ok(computeAreaUnlocked(AREA_MAP["area_2"], s), "\u5927\u5802\u5168\u88C5\u4FEE + Lv5 \u2192 \u5BA2\u623F\u5C42\u89E3\u9501");
  ok(s.areasUnlocked.includes("area_2"), "\u5BA2\u623F\u5C42\u5199\u5165\u89E3\u9501\u96C6\u5408");
  ok(computeGenUnlocked(GENERATOR_MAP["gen_pantry"], s), "\u5BA2\u623F\u5C42\u89E3\u9501 \u2192 \u98DF\u6750\u7BEE\u89E3\u9501");
  ok(isRoomUnlocked(roomById("room_guest_std"), s), "\u6807\u51C6\u95F4\u89E3\u9501");
}
console.log("[T10] \u88C5\u4FEE\u95E8\u69DB\uFF08G5 \u661F\u661F\uFF09");
resetGame();
{
  const s = STATE.get();
  const room = roomById("room_lobby_front");
  s.rooms[room.id].tasksDone = room.tasks.map((t) => t.id);
  s.stars = 8;
  STATE.save();
  ok(isRoomDecoratable(room, s), "\u4EFB\u52A1\u5B8C\u6210+\u661F\u661F\u8DB3\u591F \u2192 \u53EF\u88C5\u4FEE");
  const r = decorateRoom(room.id);
  ok(r.ok && s.rooms[room.id].decorated && s.stars === 0, "\u88C5\u4FEE\u6210\u529F\u4E14\u6263\u9664 8\u2605");
}
console.log("[T11] \u5BA2\u4EBA\u8BA2\u5355\u4EA4\u4ED8\uFF08G5 \u661F\u661F\u4E3B\u6765\u6E90\uFF09");
resetGame();
{
  setBoard({ 6: "cleaning_3", 7: "cleaning_3" });
  const r = completeOrder("ord_1");
  ok(r.ok && !STATE.get().orders.includes("ord_1"), "\u8BA2\u5355\u4EA4\u4ED8\u5E76\u5237\u65B0");
  ok(STATE.get().coins === 40 && STATE.get().stars === 5, "\u8BA2\u5355\u5956\u52B1\uFF08\u5E0140/\u661F5\uFF09");
}
console.log("[T12] \u80FD\u91CF\u518D\u751F tick");
resetGame();
{
  const s = STATE.get();
  s.energy = 50;
  s.lastEnergyTick = Date.now() - CONFIG.energyRegenMs * 3;
  STATE.save();
  const changed = tickEnergy(Date.now());
  ok(changed && STATE.get().energy >= 53, "\u8DE8 3 \u4E2A\u518D\u751F\u5468\u671F\u56DE\u80FD");
}
console.log("[T13] \u91CD\u7F6E");
resetGame();
{
  const b = STATE.get().board;
  ok(b[0] === "cleaning_1" && STATE.get().level === 1 && STATE.get().coins === 0, "\u91CD\u7F6E\u56DE\u5230\u521D\u59CB\u6001");
}
console.log("[T14] \u672A\u89E3\u9501\u533A\u57DF/\u623F\u95F4\u4EFB\u52A1\u4E0D\u53EF\u4EA4\u4ED8");
resetGame();
{
  setBoard({ 0: "cleaning_4", 1: "cleaning_4" });
  const r = completeTask("room_guest_std", "t_guest_std_1");
  ok(!r.ok, "\u672A\u89E3\u9501\u623F\u95F4\u4EFB\u52A1\u65E0\u6CD5\u4EA4\u4ED8");
  setBoard({ 2: "cleaning_2", 3: "cleaning_2", 4: "cleaning_2" });
  const r2 = completeTask("room_lobby_front", "t_front_1");
  ok(r2.ok, "\u5DF2\u89E3\u9501\u623F\u95F4\u4EFB\u52A1\u53EF\u4EA4\u4ED8");
}
console.log(`
\u7ED3\u679C\uFF1A\u901A\u8FC7 ${pass} / \u5931\u8D25 ${fail}`);
if (fail > 0) {
  console.log("\u5931\u8D25\u9879\uFF1A\n - " + fails.join("\n - "));
  process.exit(1);
} else {
  console.log("\u5168\u90E8\u901A\u8FC7 \u2705");
}
