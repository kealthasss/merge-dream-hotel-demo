"use strict";
(() => {
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
  function refillByCoin() {
    const s = STATE.get();
    if (s.coins < CONFIG.coinRefillCost) return bad("\u91D1\u5E01\u4E0D\u8DB3");
    s.coins -= CONFIG.coinRefillCost;
    s.energy = CONFIG.energyMax;
    s.lastEnergyTick = Date.now();
    STATE.save();
    return good("\u80FD\u91CF\u5DF2\u8865\u6EE1\uFF08\u91D1\u5E01\uFF09");
  }
  function refillByGem() {
    const s = STATE.get();
    const cost = CONFIG.gemRefillBase + s.gemRefillsUsed * CONFIG.gemRefillStep;
    if (s.gems < cost) return bad(`\u94BB\u77F3\u4E0D\u8DB3\uFF08\u9700 ${cost}\uFF09`);
    s.gems -= cost;
    s.gemRefillsUsed += 1;
    s.energy = CONFIG.energyMax;
    s.lastEnergyTick = Date.now();
    STATE.save();
    return good("\u80FD\u91CF\u5DF2\u8865\u6EE1\uFF08\u94BB\u77F3\uFF09");
  }
  function gemRefillCost() {
    const s = STATE.get();
    return CONFIG.gemRefillBase + s.gemRefillsUsed * CONFIG.gemRefillStep;
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

  // src/highlight.ts
  var HIGHLIGHT_RULES = [
    {
      id: "merge-target",
      enabled: true,
      priority: 100,
      style: {
        background: "radial-gradient(circle at 50% 35%, rgba(126,224,255,.35), rgba(46,123,255,.25))",
        borderColor: "#7ee0ff",
        boxShadow: "inset 0 0 0 2px #7ee0ff, 0 0 12px rgba(126,224,255,.4)",
        animation: "pulse 1.4s ease-in-out infinite"
      }
    },
    {
      id: "task-required",
      enabled: true,
      priority: 80,
      style: {
        background: "radial-gradient(circle at 50% 35%, rgba(255,179,78,.28), rgba(255,126,95,.18))",
        borderColor: "#ffb14e",
        boxShadow: "inset 0 0 0 2px #ffb14e"
      }
    },
    {
      id: "order-required",
      enabled: true,
      priority: 70,
      style: {
        background: "radial-gradient(circle at 50% 35%, rgba(158,255,180,.22), rgba(74,202,118,.12))",
        borderColor: "#9effb4",
        boxShadow: "inset 0 0 0 2px #9effb4"
      }
    },
    {
      id: "max-tier",
      enabled: true,
      priority: 50,
      style: {
        borderColor: "#ffd36e",
        boxShadow: "inset 0 0 0 1px #ffd36e, 0 0 8px rgba(255,211,110,.35)"
      }
    }
  ];
  var draggedItem = null;
  var dragSourceIndex = null;
  function setDraggedItem(itemId) {
    draggedItem = itemId;
  }
  function setDragSourceIndex(idx) {
    dragSourceIndex = idx;
  }
  function evaluateHighlights(itemId, idx, taskRequiredItems = /* @__PURE__ */ new Set()) {
    if (!itemId) return [];
    const s = STATE.get();
    const item = ITEMS[itemId];
    const hits = [];
    for (const rule of HIGHLIGHT_RULES) {
      if (!rule.enabled) continue;
      let hit = false;
      switch (rule.id) {
        case "merge-target": {
          hit = draggedItem === itemId && idx !== dragSourceIndex;
          break;
        }
        case "task-required": {
          hit = taskRequiredItems.has(itemId);
          break;
        }
        case "order-required": {
          hit = s.orders.some((oid) => ORDER_MAP[oid].requireItem === itemId);
          break;
        }
        case "max-tier": {
          hit = item.tier >= 5;
          break;
        }
      }
      if (hit) hits.push(rule);
    }
    hits.sort((a, b) => b.priority - a.priority);
    return hits;
  }
  function highlightAttrs(itemId, idx, taskRequiredItems) {
    const hits = evaluateHighlights(itemId, idx, taskRequiredItems);
    const classes = hits.map((r) => `hl-${r.id}`).join(" ");
    const merged = {};
    for (const r of hits) Object.assign(merged, r.style);
    const styleParts = [];
    if (merged.background) styleParts.push(`background:${merged.background}`);
    if (merged.color) styleParts.push(`color:${merged.color}`);
    if (merged.borderColor) styleParts.push(`border-color:${merged.borderColor}`);
    if (merged.boxShadow) styleParts.push(`box-shadow:${merged.boxShadow}`);
    if (merged.opacity !== void 0) styleParts.push(`opacity:${merged.opacity}`);
    if (merged.animation) styleParts.push(`animation:${merged.animation}`);
    return { classes, style: styleParts.join(";") };
  }

  // src/ui.ts
  var selected = { areaId: "area_1", roomId: "room_lobby_front" };
  var pendingAction = null;
  var modalTitle = "";
  var modalBody = "";
  var modalConfirm = "\u786E\u8BA4";
  var drag = null;
  var app = document.getElementById("app");
  function showToast(msg, kind = "info") {
    const wrap = document.getElementById("toast-wrap");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = `toast ${kind}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2200);
  }
  function hudHtml() {
    const s = STATE.get();
    const ePct = s.energy / CONFIG.energyMax * 100;
    const need = CONFIG.xpToNext(s.level);
    const xPct = Math.min(100, s.xp / need * 100);
    return `
  <div class="hud">
    <div class="hud-left">
      <div class="lvl">Lv <b id="hud-level">${s.level}</b></div>
      <div class="xpbar"><div class="xpfill" id="hud-xp-fill" style="width:${xPct}%"></div>
        <span id="hud-xp-text">${s.xp}/${need}</span></div>
    </div>
    <div class="hud-mid">
      <div class="energy">
        <span class="e-ico">\u26A1</span>
        <div class="ebar"><div class="efill" id="hud-energy-fill" style="width:${ePct}%"></div>
          <span id="hud-energy-text">${s.energy}/${CONFIG.energyMax}</span></div>
      </div>
    </div>
    <div class="hud-right">
      <span class="res">\u{1F4B0} <b id="hud-coins">${s.coins}</b></span>
      <span class="res">\u{1F48E} <b id="hud-gems">${s.gems}</b></span>
      <span class="res">\u2B50 <b id="hud-stars">${s.stars}</b></span>
    </div>
  </div>`;
  }
  function generatorsHtml() {
    const s = STATE.get();
    return GENERATORS.map((g) => {
      const unlocked = computeGenUnlocked(g, s);
      const can = unlocked && s.energy >= CONFIG.spawnCost;
      const lockTxt = !unlocked ? g.unlockLevel ? `Lv${g.unlockLevel}\u89E3\u9501` : "\u5230\u5BA2\u623F\u5C42\u89E3\u9501" : "";
      return `<button class="gen ${unlocked ? "" : "locked"}" id="gen-${g.id}" data-action="gen" data-id="${g.id}" ${can ? "" : "disabled"}>
      <div class="gen-name">${g.name}</div>
      <div class="gen-prod">${ITEMS[g.produces].icon} ${ITEMS[g.produces].name}</div>
      <div class="gen-cost">\u26A1${CONFIG.spawnCost}${lockTxt ? ` \xB7 ${lockTxt}` : ""}</div>
    </button>`;
    }).join("");
  }
  function currentTaskRequiredItems() {
    const s = STATE.get();
    const set = /* @__PURE__ */ new Set();
    for (const a of AREAS) {
      if (!computeAreaUnlocked(a, s)) continue;
      for (const room of a.rooms) {
        if (!isRoomUnlocked(room, s)) continue;
        const rp = s.rooms[room.id];
        if (!rp) continue;
        for (const t of room.tasks) {
          if (!rp.tasksDone.includes(t.id)) {
            set.add(t.requireItem);
            break;
          }
        }
      }
    }
    return set;
  }
  function boardHtml() {
    const s = STATE.get();
    const required = currentTaskRequiredItems();
    return s.board.map((itemId, idx) => {
      if (!itemId) return `<div class="cell empty" data-cell="${idx}"></div>`;
      const it = ITEMS[itemId];
      const hl = highlightAttrs(itemId, idx, required);
      const cls = `cell ${hl.classes}`.trim();
      return `<div class="${cls}" data-cell="${idx}" style="--c:${it.color};${hl.style}">
        <div class="item-icon">${it.icon}</div>
        <div class="item-name">${it.name}</div>
        <div class="item-tier">T${it.tier}</div>
      </div>`;
    }).join("");
  }
  function updateBoardHighlights() {
    const board = document.getElementById("board");
    if (!board) return;
    const s = STATE.get();
    const required = currentTaskRequiredItems();
    const cells = board.querySelectorAll("[data-cell]");
    cells.forEach((el) => {
      const idx = parseInt(el.getAttribute("data-cell"), 10);
      const itemId = s.board[idx];
      const hl = highlightAttrs(itemId, idx, required);
      el.className = `cell ${itemId ? "" : "empty"} ${hl.classes}`.trim();
      const baseColor = itemId ? ITEMS[itemId].color : "#3fb8af";
      el.style.cssText = `--c:${baseColor};${hl.style}`;
    });
  }
  function leftPanelHtml() {
    const s = STATE.get();
    const tabs = AREAS.map((a) => {
      const u = computeAreaUnlocked(a, s);
      const cond = !u ? a.unlockLevel > s.level ? `\u9700 Lv${a.unlockLevel}` : "\u9700\u524D\u7F6E\u533A\u57DF\u5168\u88C5\u4FEE" : "";
      return `<button class="tab ${a.id === selected.areaId ? "active" : ""} ${u ? "" : "locked"}" data-action="area" data-id="${a.id}">${a.name}${u ? "" : ` \u{1F512}${cond}`}</button>`;
    }).join("");
    const area = AREA_MAP[selected.areaId];
    const roomsHtml = area.rooms.map((room) => {
      const unlocked = isRoomUnlocked(room, s);
      const rp = s.rooms[room.id];
      const tasksHtml = room.tasks.map((t) => {
        const done = rp.tasksDone.includes(t.id);
        const cur = currentTask(room, s);
        const isCur = cur?.id === t.id;
        const enough = countOnBoard(t.requireItem) >= t.requireQty;
        const cls = done ? "done" : isCur ? "cur" : "locked";
        const btn = done ? "\u2713" : isCur && unlocked ? `<button class="mini-btn" data-action="task" data-id="${t.id}" data-room="${room.id}" ${enough ? "" : "disabled"}>\u4EA4\u4ED8</button>` : "\u{1F512}";
        return `<li class="task ${cls}">
            <span class="t-req">${ITEMS[t.requireItem].icon} \xD7${t.requireQty}</span>
            <span class="t-rew">+${t.reward.coins}\u{1F4B0} +${t.reward.stars}\u2605</span>
            ${btn}
          </li>`;
      }).join("");
      const decorated = rp.decorated;
      const decBtn = decorated ? `<span class="badge ok">\u5DF2\u88C5\u4FEE \u2713</span>` : !unlocked ? `<span class="badge lock">\u672A\u89E3\u9501 \u{1F512}</span>` : isRoomDecoratable(room, s) ? `<button class="dec-btn" data-action="decorate" data-id="${room.id}">\u88C5\u4FEE (${room.decorateCost}\u2605)</button>` : `<span class="badge">\u9700\u5B8C\u6210\u5168\u90E8\u4EFB\u52A1 \xB7 ${room.decorateCost}\u2605</span>`;
      return `<div class="room ${unlocked ? "" : "lock"}">
        <div class="room-head"><b>${room.name}</b></div>
        <ul class="tasks">${tasksHtml}</ul>
        <div class="room-foot">${decBtn}</div>
      </div>`;
    }).join("");
    return `<aside class="panel left">
    <h2>\u7FFB\u4FEE\u8FDB\u5EA6</h2>
    <div class="tabs">${tabs}</div>
    <div class="rooms">${roomsHtml}</div>
  </aside>`;
  }
  function rightPanelHtml() {
    const s = STATE.get();
    const ordersHtml = s.orders.map((oid) => {
      const o = ORDER_MAP[oid];
      const enough = countOnBoard(o.requireItem) >= o.requireQty;
      return `<div class="order">
        <div class="order-req">${ITEMS[o.requireItem].icon} ${ITEMS[o.requireItem].name} \xD7${o.requireQty}</div>
        <div class="order-rew">+${o.reward.coins}\u{1F4B0} +${o.reward.stars}\u2605 +${o.reward.xp}xp</div>
        <button class="mini-btn" data-action="order" data-id="${oid}" ${enough ? "" : "disabled"}>\u4EA4\u4ED8</button>
      </div>`;
    }).join("");
    const gc = gemRefillCost();
    return `<aside class="panel right">
    <h2>\u5BA2\u4EBA\u8BA2\u5355</h2>
    <div class="orders">${ordersHtml}</div>
    <h2>\u5546\u5E97 / \u5DE5\u5177</h2>
    <button class="shop-btn" id="refill-coin" data-action="refill-coin" ${s.coins >= CONFIG.coinRefillCost ? "" : "disabled"}>\u8865\u80FD\u91CF\uFF08\u{1F4B0}${CONFIG.coinRefillCost}\uFF09</button>
    <button class="shop-btn" id="refill-gem" data-action="refill-gem" ${s.gems >= gc ? "" : "disabled"}>\u8865\u80FD\u91CF\uFF08\u{1F48E}${gc}\uFF09</button>
    <button class="shop-btn danger" data-action="reset">\u91CD\u7F6E\u8FDB\u5EA6</button>
    <details class="help">
      <summary>\u73A9\u6CD5\u8BF4\u660E</summary>
      <p>\u2460 \u70B9\u751F\u6210\u5668\u4EA7\u51FA\u57FA\u7840\u7269\uFF08\u8017 \u26A1\uFF09\u3002<br>\u2461 \u62D6\u540C\u7C7B\u7269\u54C1\u5408\u5E76\u5347\u7EA7\u3002<br>\u2462 \u4EA4\u4ED8\u623F\u95F4\u4EFB\u52A1 / \u5BA2\u4EBA\u8BA2\u5355\u8D5A \u{1F4B0}\u2B50\u3002<br>\u2463 \u6512\u591F \u2B50 \u88C5\u4FEE\u623F\u95F4\uFF0C\u89E3\u9501\u65B0\u533A\u57DF\u4E0E\u751F\u6210\u5668\u3002</p>
    </details>
  </aside>`;
  }
  function modalHtml() {
    if (!pendingAction) return "";
    return `<div class="modal-backdrop" data-action="modal-cancel">
    <div class="modal">
      <h3>${modalTitle}</h3>
      <div class="modal-body">${modalBody}</div>
      <div class="modal-foot">
        <button data-action="modal-cancel">\u53D6\u6D88</button>
        <button class="primary" data-action="modal-confirm">${modalConfirm}</button>
      </div>
    </div>
  </div>`;
  }
  function render() {
    app.innerHTML = `
    ${hudHtml()}
    <div class="main">
      ${leftPanelHtml()}
      <section class="board-wrap">
        <div class="generators">${generatorsHtml()}</div>
        <div class="board" id="board">${boardHtml()}</div>
        <div class="hint">\u63D0\u793A\uFF1A\u62D6\u52A8\u4E24\u4E2A\u76F8\u540C\u7269\u54C1\u5230\u4E00\u5904\u5373\u53EF\u5408\u6210\u5347\u7EA7 \xB7 \u70B9\u4E0A\u65B9\u751F\u6210\u5668\u4EA7\u51FA\u57FA\u7840\u7269</div>
      </section>
      ${rightPanelHtml()}
    </div>
    <div class="toast-wrap" id="toast-wrap"></div>
    ${modalHtml()}
  `;
  }
  function updateHud() {
    const s = STATE.get();
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    const setW = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.style.width = v;
    };
    set("hud-level", String(s.level));
    const need = CONFIG.xpToNext(s.level);
    set("hud-xp-text", `${s.xp}/${need}`);
    setW("hud-xp-fill", `${Math.min(100, s.xp / need * 100)}%`);
    set("hud-energy-text", `${s.energy}/${CONFIG.energyMax}`);
    setW("hud-energy-fill", `${s.energy / CONFIG.energyMax * 100}%`);
    set("hud-coins", String(s.coins));
    set("hud-gems", String(s.gems));
    set("hud-stars", String(s.stars));
    for (const g of GENERATORS) {
      const btn = document.getElementById(`gen-${g.id}`);
      if (btn) {
        const unlocked = computeGenUnlocked(g, s);
        btn.disabled = !(unlocked && s.energy >= CONFIG.spawnCost);
      }
    }
    const rc = document.getElementById("refill-coin");
    if (rc) rc.disabled = s.coins < CONFIG.coinRefillCost;
    const rg = document.getElementById("refill-gem");
    if (rg) rg.disabled = s.gems < gemRefillCost();
  }
  function handleAction(action, id, el) {
    const s = STATE.get();
    switch (action) {
      case "gen": {
        const r = spawn(id);
        if (r.msg) showToast(r.msg, r.kind);
        if (r.news) showToast("\u89E3\u9501\uFF1A" + r.news.join("\u3001"), "info");
        render();
        break;
      }
      case "task": {
        const roomId = el.getAttribute("data-room");
        const r = completeTask(roomId, id);
        if (r.msg) showToast(r.msg, r.kind);
        if (r.news) showToast("\u89E3\u9501\uFF1A" + r.news.join("\u3001"), "info");
        render();
        break;
      }
      case "order": {
        const r = completeOrder(id);
        if (r.msg) showToast(r.msg, r.kind);
        if (r.news) showToast("\u89E3\u9501\uFF1A" + r.news.join("\u3001"), "info");
        render();
        break;
      }
      case "area": {
        selected.areaId = id;
        const area = AREA_MAP[id];
        selected.roomId = area.rooms[0].id;
        render();
        break;
      }
      case "decorate": {
        openDecorateModal(id);
        break;
      }
      case "refill-coin": {
        const r = refillByCoin();
        showToast(r.msg, r.kind);
        render();
        break;
      }
      case "refill-gem": {
        const r = refillByGem();
        showToast(r.msg, r.kind);
        render();
        break;
      }
      case "reset": {
        openResetModal();
        break;
      }
      case "modal-confirm": {
        const fn = pendingAction;
        pendingAction = null;
        if (fn) fn();
        render();
        break;
      }
      case "modal-cancel": {
        pendingAction = null;
        render();
        break;
      }
    }
  }
  function openDecorateModal(roomId) {
    const s = STATE.get();
    const area = AREAS.find((a) => a.rooms.some((r) => r.id === roomId));
    const room = area.rooms.find((r) => r.id === roomId);
    const rp = s.rooms[roomId];
    const doneTasks = rp.tasksDone.length;
    modalTitle = `\u88C5\u4FEE\uFF1A${room.name}`;
    modalBody = `\u6D88\u8017 <b>${room.decorateCost}\u2B50</b>\uFF08\u5F53\u524D ${s.stars}\u2B50\uFF09<br>\u5DF2\u5B8C\u6210\u4EFB\u52A1 ${doneTasks}/${room.tasks.length}\u3002<br>\u88C5\u4FEE\u540E\u89E3\u9501\u540E\u7EED\u623F\u95F4 / \u533A\u57DF\u3002`;
    modalConfirm = `\u786E\u8BA4\u88C5\u4FEE\uFF08-${room.decorateCost}\u2B50\uFF09`;
    pendingAction = () => {
      const r = decorateRoom(roomId);
      showToast(r.msg, r.kind);
      if (r.news) showToast("\u89E3\u9501\uFF1A" + r.news.join("\u3001"), "info");
    };
    render();
  }
  function openResetModal() {
    modalTitle = "\u91CD\u7F6E\u8FDB\u5EA6";
    modalBody = "\u5C06\u6E05\u7A7A\u5F53\u524D\u6240\u6709\u8FDB\u5EA6\uFF08\u68CB\u76D8\u3001\u8D44\u6E90\u3001\u89E3\u9501\uFF09\uFF0C\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001\u3002\u786E\u5B9A\uFF1F";
    modalConfirm = "\u786E\u8BA4\u91CD\u7F6E";
    pendingAction = () => {
      resetGame();
      selected = { areaId: "area_1", roomId: "room_lobby_front" };
      showToast("\u5DF2\u91CD\u7F6E", "info");
    };
    render();
  }
  function onPointerDown(e) {
    const cell = e.target.closest("[data-cell]");
    if (!cell) return;
    const idx = parseInt(cell.getAttribute("data-cell"), 10);
    const s = STATE.get();
    const itemId = s.board[idx];
    if (!itemId) return;
    drag = { from: idx, ghost: null, moved: false, x: e.clientX, y: e.clientY, src: cell };
    cell.classList.add("src-drag");
    setDraggedItem(itemId);
    setDragSourceIndex(idx);
    updateBoardHighlights();
  }
  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
      const s = STATE.get();
      const it = ITEMS[s.board[drag.from]];
      const g = document.createElement("div");
      g.className = "drag-ghost";
      g.textContent = it.icon;
      document.body.appendChild(g);
      drag.ghost = g;
    }
    if (drag.moved && drag.ghost) {
      drag.ghost.style.left = `${e.clientX}px`;
      drag.ghost.style.top = `${e.clientY}px`;
    }
  }
  function onPointerUp(e) {
    if (!drag) return;
    const d = drag;
    drag = null;
    setDraggedItem(null);
    setDragSourceIndex(null);
    if (d.ghost) d.ghost.remove();
    if (d.src) d.src.classList.remove("src-drag");
    if (!d.moved) {
      updateBoardHighlights();
      return;
    }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el?.closest("[data-cell]");
    if (cell) {
      const to = parseInt(cell.getAttribute("data-cell"), 10);
      const r = moveOrMerge(d.from, to);
      if (r.msg && r.msg !== "\u79FB\u52A8") showToast(r.msg, r.kind);
      if (r.news && r.news.length) showToast("\u89E3\u9501\uFF1A" + r.news.join("\u3001"), "info");
      render();
    } else {
      updateBoardHighlights();
    }
  }
  function onClick(e) {
    const t = e.target.closest("[data-action]");
    if (!t) return;
    const action = t.getAttribute("data-action");
    const id = t.getAttribute("data-id");
    handleAction(action, id, t);
  }
  function start() {
    render();
    tickEnergy(Date.now());
    render();
    app.addEventListener("click", onClick);
    app.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    setInterval(() => {
      if (drag) return;
      if (tickEnergy(Date.now())) updateHud();
    }, 1e3);
  }

  // src/main.ts
  start();
})();
