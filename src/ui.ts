// UI 层：渲染横屏界面、拖拽合并、弹窗、Toast。DOM 事件用委托，避免每次重渲染重绑。
import { STATE } from './state/store';
import { CONFIG } from './data/config';
import { ITEMS } from './data/chains';
import { GENERATORS, GENERATOR_MAP } from './data/generators';
import { AREAS, AREA_MAP, ORDER_MAP } from './data/areas';
import { ITEM_IMAGES } from './data/images';
import {
  computeAreaUnlocked,
  computeGenUnlocked,
  isRoomUnlocked,
  isRoomDecoratable,
  currentTask,
  countOnBoard,
  spawn,
  moveOrMerge,
  completeTask,
  completeOrder,
  decorateRoom,
  refillByCoin,
  refillByGem,
  gemRefillCost,
  tickEnergy,
  resetGame,
  drainNews,
  type ToastKind
} from './game';
import type { AreaDef, RoomDef, ItemId } from './types';
import { highlightAttrs, setDraggedItem, setDragSourceIndex } from './highlight';

let selected = { areaId: 'area_1', roomId: 'room_lobby_front' };

// 弹窗状态
let pendingAction: (() => void) | null = null;
let modalTitle = '';
let modalBody = '';
let modalConfirm = '确认';

let drag: { from: number; ghost: HTMLElement | null; moved: boolean; x: number; y: number; src: HTMLElement | null } | null = null;

const app = document.getElementById('app')!;

// ---------------- Toast ----------------
function showToast(msg: string, kind: ToastKind = 'info'): void {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

// 物品视觉：有图用图，无图或加载失败回退 emoji
// emoji fallback 默认隐藏，避免透明 PNG 在 anti-aliasing 处透出底层 emoji；onerror 时添加 no-img 类显示 fallback
function itemVisualHtml(itemId: ItemId): string {
  const emoji = ITEMS[itemId].icon;
  const img = ITEM_IMAGES[itemId];
  if (!img) return `<span class="item-visual no-img"><span class="item-fallback">${emoji}</span></span>`;
  return `<span class="item-visual"><span class="item-fallback">${emoji}</span><img class="item-img" src="${img}" alt="${ITEMS[itemId].name}" loading="lazy" onerror="this.style.display='none'; this.parentElement?.classList.add('no-img')"></span>`;
}

// ---------------- 渲染 ----------------
function hudHtml(): string {
  const s = STATE.get();
  const ePct = (s.energy / CONFIG.energyMax) * 100;
  const need = CONFIG.xpToNext(s.level);
  const xPct = Math.min(100, (s.xp / need) * 100);
  return `
  <div class="hud">
    <div class="hud-left">
      <div class="lvl">Lv <b id="hud-level">${s.level}</b></div>
      <div class="xpbar"><div class="xpfill" id="hud-xp-fill" style="width:${xPct}%"></div>
        <span id="hud-xp-text">${s.xp}/${need}</span></div>
    </div>
    <div class="hud-mid">
      <div class="energy">
        <span class="e-ico">⚡</span>
        <div class="ebar"><div class="efill" id="hud-energy-fill" style="width:${ePct}%"></div>
          <span id="hud-energy-text">${s.energy}/${CONFIG.energyMax}</span></div>
      </div>
    </div>
    <div class="hud-right">
      <span class="res">💰 <b id="hud-coins">${s.coins}</b></span>
      <span class="res">💎 <b id="hud-gems">${s.gems}</b></span>
      <span class="res">⭐ <b id="hud-stars">${s.stars}</b></span>
    </div>
  </div>`;
}

function generatorsHtml(): string {
  const s = STATE.get();
  return GENERATORS.map((g) => {
    const unlocked = computeGenUnlocked(g, s);
    const can = unlocked && s.energy >= CONFIG.spawnCost;
    const lockTxt = !unlocked ? (g.unlockLevel ? `Lv${g.unlockLevel}解锁` : '到客房层解锁') : '';
    return `<button class="gen ${unlocked ? '' : 'locked'}" id="gen-${g.id}" data-action="gen" data-id="${g.id}" ${
      can ? '' : 'disabled'
    }>
      <div class="gen-name">${g.name}</div>
      <div class="gen-prod">${itemVisualHtml(g.produces)} ${ITEMS[g.produces].name}</div>
      <div class="gen-cost">⚡${CONFIG.spawnCost}${lockTxt ? ` · ${lockTxt}` : ''}</div>
    </button>`;
  }).join('');
}

function currentTaskRequiredItems(): Set<ItemId> {
  const s = STATE.get();
  const set = new Set<ItemId>();
  for (const a of AREAS) {
    if (!computeAreaUnlocked(a, s)) continue; // 未解锁区域的房间不纳入高亮
    for (const room of a.rooms) {
      if (!isRoomUnlocked(room, s)) continue; // 未解锁房间不纳入高亮
      const rp = s.rooms[room.id];
      if (!rp) continue;
      for (const t of room.tasks) {
        if (!rp.tasksDone.includes(t.id)) {
          set.add(t.requireItem);
          break; // 每个房间只取当前任务（串行）
        }
      }
    }
  }
  return set;
}

function boardHtml(): string {
  const s = STATE.get();
  const required = currentTaskRequiredItems();
  return s.board
    .map((itemId, idx) => {
      if (!itemId) return `<div class="cell empty" data-cell="${idx}"></div>`;
      const it = ITEMS[itemId];
      const hl = highlightAttrs(itemId, idx, required);
      const cls = `cell ${hl.classes}`.trim();
      return `<div class="${cls}" data-cell="${idx}" style="--c:${it.color};${hl.style}">
        <div class="item-icon">${itemVisualHtml(itemId)}</div>
        <div class="item-name">${it.name}</div>
        <div class="item-tier">T${it.tier}</div>
      </div>`;
    })
    .join('');
}

/** 仅更新棋盘高亮 class/style，不重建 DOM（拖拽期间用） */
function updateBoardHighlights(): void {
  const board = document.getElementById('board');
  if (!board) return;
  const s = STATE.get();
  const required = currentTaskRequiredItems();
  const cells = board.querySelectorAll('[data-cell]');
  cells.forEach((el) => {
    const idx = parseInt((el as HTMLElement).getAttribute('data-cell')!, 10);
    const itemId = s.board[idx];
    const hl = highlightAttrs(itemId, idx, required);
    // 先清除旧高亮 class
    (el as HTMLElement).className = `cell ${itemId ? '' : 'empty'} ${hl.classes}`.trim();
    // 保留 --c 变量并叠加高亮样式
    const baseColor = itemId ? ITEMS[itemId].color : '#3fb8af';
    (el as HTMLElement).style.cssText = `--c:${baseColor};${hl.style}`;
  });
}

function leftPanelHtml(): string {
  const s = STATE.get();
  const tabs = AREAS.map((a) => {
    const u = computeAreaUnlocked(a, s);
    const cond = !u
      ? a.unlockLevel > s.level
        ? `需 Lv${a.unlockLevel}`
        : '需前置区域全装修'
      : '';
    return `<button class="tab ${a.id === selected.areaId ? 'active' : ''} ${u ? '' : 'locked'}" data-action="area" data-id="${a.id}">${a.name}${u ? '' : ` 🔒${cond}`}</button>`;
  }).join('');

  const area: AreaDef = AREA_MAP[selected.areaId];
  const roomsHtml = area.rooms
    .map((room: RoomDef) => {
      const unlocked = isRoomUnlocked(room, s);
      const rp = s.rooms[room.id];
      const tasksHtml = room.tasks
        .map((t) => {
          const done = rp.tasksDone.includes(t.id);
          const cur = currentTask(room, s);
          const isCur = cur?.id === t.id;
          const enough = countOnBoard(t.requireItem) >= t.requireQty;
          const cls = done ? 'done' : isCur ? 'cur' : 'locked';
          const btn = done
            ? '✓'
            : isCur && unlocked
            ? `<button class="mini-btn" data-action="task" data-id="${t.id}" data-room="${room.id}" ${enough ? '' : 'disabled'}>交付</button>`
            : '🔒';
          return `<li class="task ${cls}">
            <span class="t-req">${itemVisualHtml(t.requireItem)} ×${t.requireQty}</span>
            <span class="t-rew">+${t.reward.coins}💰 +${t.reward.stars}★</span>
            ${btn}
          </li>`;
        })
        .join('');
      const decorated = rp.decorated;
      const decBtn = decorated
        ? `<span class="badge ok">已装修 ✓</span>`
        : !unlocked
        ? `<span class="badge lock">未解锁 🔒</span>`
        : isRoomDecoratable(room, s)
        ? `<button class="dec-btn" data-action="decorate" data-id="${room.id}">装修 (${room.decorateCost}★)</button>`
        : `<span class="badge">需完成全部任务 · ${room.decorateCost}★</span>`;
      return `<div class="room ${unlocked ? '' : 'lock'}">
        <div class="room-head"><b>${room.name}</b></div>
        <ul class="tasks">${tasksHtml}</ul>
        <div class="room-foot">${decBtn}</div>
      </div>`;
    })
    .join('');

  return `<aside class="panel left">
    <h2>翻修进度</h2>
    <div class="tabs">${tabs}</div>
    <div class="rooms">${roomsHtml}</div>
  </aside>`;
}

function rightPanelHtml(): string {
  const s = STATE.get();
  const ordersHtml = s.orders
    .map((oid) => {
      const o = ORDER_MAP[oid];
      const enough = countOnBoard(o.requireItem) >= o.requireQty;
      return `<div class="order">
        <div class="order-req">${itemVisualHtml(o.requireItem)} ${ITEMS[o.requireItem].name} ×${o.requireQty}</div>
        <div class="order-rew">+${o.reward.coins}💰 +${o.reward.stars}★ +${o.reward.xp}xp</div>
        <button class="mini-btn" data-action="order" data-id="${oid}" ${enough ? '' : 'disabled'}>交付</button>
      </div>`;
    })
    .join('');
  const gc = gemRefillCost();
  return `<aside class="panel right">
    <h2>客人订单</h2>
    <div class="orders">${ordersHtml}</div>
    <h2>商店 / 工具</h2>
    <button class="shop-btn" id="refill-coin" data-action="refill-coin" ${s.coins >= CONFIG.coinRefillCost ? '' : 'disabled'}>补能量（💰${CONFIG.coinRefillCost}）</button>
    <button class="shop-btn" id="refill-gem" data-action="refill-gem" ${s.gems >= gc ? '' : 'disabled'}>补能量（💎${gc}）</button>
    <button class="shop-btn danger" data-action="reset">重置进度</button>
    <details class="help">
      <summary>玩法说明</summary>
      <p>① 点生成器产出基础物（耗 ⚡）。<br>② 拖同类物品合并升级。<br>③ 交付房间任务 / 客人订单赚 💰⭐。<br>④ 攒够 ⭐ 装修房间，解锁新区域与生成器。</p>
    </details>
  </aside>`;
}

function modalHtml(): string {
  if (!pendingAction) return '';
  return `<div class="modal-backdrop" data-action="modal-cancel">
    <div class="modal">
      <h3>${modalTitle}</h3>
      <div class="modal-body">${modalBody}</div>
      <div class="modal-foot">
        <button data-action="modal-cancel">取消</button>
        <button class="primary" data-action="modal-confirm">${modalConfirm}</button>
      </div>
    </div>
  </div>`;
}

function render(): void {
  app.innerHTML = `
    ${hudHtml()}
    <div class="main">
      ${leftPanelHtml()}
      <section class="board-wrap">
        <div class="generators">${generatorsHtml()}</div>
        <div class="board" id="board">${boardHtml()}</div>
        <div class="hint">提示：拖动两个相同物品到一处即可合成升级 · 点上方生成器产出基础物</div>
      </section>
      ${rightPanelHtml()}
    </div>
    <div class="toast-wrap" id="toast-wrap"></div>
    ${modalHtml()}
  `;
}

// 仅更新 HUD（能量每秒 tick 用，避免关闭弹窗/打断拖拽）
function updateHud(): void {
  const s = STATE.get();
  const set = (id: string, v: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  const setW = (id: string, v: string) => {
    const el = document.getElementById(id);
    if (el) el.style.width = v;
  };
  set('hud-level', String(s.level));
  const need = CONFIG.xpToNext(s.level);
  set('hud-xp-text', `${s.xp}/${need}`);
  setW('hud-xp-fill', `${Math.min(100, (s.xp / need) * 100)}%`);
  set('hud-energy-text', `${s.energy}/${CONFIG.energyMax}`);
  setW('hud-energy-fill', `${(s.energy / CONFIG.energyMax) * 100}%`);
  set('hud-coins', String(s.coins));
  set('hud-gems', String(s.gems));
  set('hud-stars', String(s.stars));
  // 能量相关按钮启用态
  for (const g of GENERATORS) {
    const btn = document.getElementById(`gen-${g.id}`) as HTMLButtonElement | null;
    if (btn) {
      const unlocked = computeGenUnlocked(g, s);
      btn.disabled = !(unlocked && s.energy >= CONFIG.spawnCost);
    }
  }
  const rc = document.getElementById('refill-coin') as HTMLButtonElement | null;
  if (rc) rc.disabled = s.coins < CONFIG.coinRefillCost;
  const rg = document.getElementById('refill-gem') as HTMLButtonElement | null;
  if (rg) rg.disabled = s.gems < gemRefillCost();
}

// ---------------- 事件 ----------------
function handleAction(action: string, id: string | null, el: HTMLElement): void {
  const s = STATE.get();
  switch (action) {
    case 'gen': {
      const r = spawn(id!);
      if (r.msg) showToast(r.msg, r.kind);
      if (r.news) showToast('解锁：' + r.news.join('、'), 'info');
      render();
      break;
    }
    case 'task': {
      const roomId = el.getAttribute('data-room')!;
      const r = completeTask(roomId, id!);
      if (r.msg) showToast(r.msg, r.kind);
      if (r.news) showToast('解锁：' + r.news.join('、'), 'info');
      render();
      break;
    }
    case 'order': {
      const r = completeOrder(id!);
      if (r.msg) showToast(r.msg, r.kind);
      if (r.news) showToast('解锁：' + r.news.join('、'), 'info');
      render();
      break;
    }
    case 'area': {
      selected.areaId = id!;
      const area = AREA_MAP[id!];
      selected.roomId = area.rooms[0].id;
      render();
      break;
    }
    case 'decorate': {
      openDecorateModal(id!);
      break;
    }
    case 'refill-coin': {
      const r = refillByCoin();
      showToast(r.msg, r.kind);
      render();
      break;
    }
    case 'refill-gem': {
      const r = refillByGem();
      showToast(r.msg, r.kind);
      render();
      break;
    }
    case 'reset': {
      openResetModal();
      break;
    }
    case 'modal-confirm': {
      const fn = pendingAction;
      pendingAction = null;
      if (fn) fn();
      render();
      break;
    }
    case 'modal-cancel': {
      pendingAction = null;
      render();
      break;
    }
  }
}

function openDecorateModal(roomId: string): void {
  const s = STATE.get();
  const area = AREAS.find((a) => a.rooms.some((r) => r.id === roomId))!;
  const room = area.rooms.find((r) => r.id === roomId)!;
  const rp = s.rooms[roomId];
  const doneTasks = rp.tasksDone.length;
  modalTitle = `装修：${room.name}`;
  modalBody = `消耗 <b>${room.decorateCost}⭐</b>（当前 ${s.stars}⭐）<br>已完成任务 ${doneTasks}/${room.tasks.length}。<br>装修后解锁后续房间 / 区域。`;
  modalConfirm = `确认装修（-${room.decorateCost}⭐）`;
  pendingAction = () => {
    const r = decorateRoom(roomId);
    showToast(r.msg, r.kind);
    if (r.news) showToast('解锁：' + r.news.join('、'), 'info');
  };
  render();
}

function openResetModal(): void {
  modalTitle = '重置进度';
  modalBody = '将清空当前所有进度（棋盘、资源、解锁），恢复到初始状态。确定？';
  modalConfirm = '确认重置';
  pendingAction = () => {
    resetGame();
    selected = { areaId: 'area_1', roomId: 'room_lobby_front' };
    showToast('已重置', 'info');
  };
  render();
}

function onPointerDown(e: PointerEvent): void {
  const cell = (e.target as HTMLElement).closest('[data-cell]') as HTMLElement | null;
  if (!cell) return;
  const idx = parseInt(cell.getAttribute('data-cell')!, 10);
  const s = STATE.get();
  const itemId = s.board[idx];
  if (!itemId) return; // 仅拖拽有物品的格
  drag = { from: idx, ghost: null, moved: false, x: e.clientX, y: e.clientY, src: cell };
  cell.classList.add('src-drag');
  setDraggedItem(itemId);
  setDragSourceIndex(idx);
  updateBoardHighlights();
}

function onPointerMove(e: PointerEvent): void {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) > 6) {
    drag.moved = true;
    const s = STATE.get();
    const it = ITEMS[s.board[drag.from]!];
    const g = document.createElement('div');
    g.className = 'drag-ghost';
    g.innerHTML = itemVisualHtml(s.board[drag.from]!);
    document.body.appendChild(g);
    drag.ghost = g;
  }
  if (drag.moved && drag.ghost) {
    drag.ghost.style.left = `${e.clientX}px`;
    drag.ghost.style.top = `${e.clientY}px`;
  }
}

function onPointerUp(e: PointerEvent): void {
  if (!drag) return;
  const d = drag;
  drag = null;
  setDraggedItem(null);
  setDragSourceIndex(null);
  if (d.ghost) d.ghost.remove();
  if (d.src) d.src.classList.remove('src-drag');
  if (!d.moved) {
    updateBoardHighlights();
    return; // 轻点不触发
  }
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  const cell = el?.closest('[data-cell]') as HTMLElement | null;
  if (cell) {
    const to = parseInt(cell.getAttribute('data-cell')!, 10);
    const r = moveOrMerge(d.from, to);
    if (r.msg && r.msg !== '移动') showToast(r.msg, r.kind);
    if (r.news && r.news.length) showToast('解锁：' + r.news.join('、'), 'info');
    render();
  } else {
    updateBoardHighlights();
  }
}

function onClick(e: MouseEvent): void {
  const t = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
  if (!t) return;
  const action = t.getAttribute('data-action')!;
  const id = t.getAttribute('data-id');
  handleAction(action, id, t);
}

export function start(): void {
  render();
  // 初始化能量（处理离线再生）
  tickEnergy(Date.now());
  render();
  app.addEventListener('click', onClick);
  app.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp);
  setInterval(() => {
    if (drag) return; // 拖拽中不刷新，避免打断
    if (tickEnergy(Date.now())) updateHud();
  }, 1000);
}
