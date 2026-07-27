import { CONFIG } from '../data/config';
import { AREAS } from '../data/areas';
import { ORDERS } from '../data/areas';

const KEY = 'mergehotel_demo_v1'; // 版本化持久化 key

export interface RoomProgress {
  tasksDone: string[]; // 已完成任务 id（G4）
  decorated: boolean; // 是否已装修（G5）
}

export interface GameState {
  version: number;
  energy: number;
  coins: number;
  gems: number;
  stars: number;
  xp: number;
  level: number;
  board: (string | null)[]; // 棋盘格：cellIndex -> ItemId | null
  rooms: Record<string, RoomProgress>;
  areasUnlocked: string[];
  generatorsUnlocked: string[];
  orders: string[]; // 当前激活的客人订单 id
  lastEnergyTick: number; // 能量再生时间戳（epoch ms）
  gemRefillsUsed: number; // 钻石补能次数（成本递增）
}

function makeBoard(): (string | null)[] {
  return new Array(CONFIG.boardCols * CONFIG.boardRows).fill(null);
}

function defaultRooms(): Record<string, RoomProgress> {
  const r: Record<string, RoomProgress> = {};
  for (const a of AREAS) for (const rm of a.rooms) r[rm.id] = { tasksDone: [], decorated: false };
  return r;
}

// 首局确定性教学：预置板上物品，使"两个抹布→扫帚"成为开局面授课
function seedBoard(): (string | null)[] {
  const b = makeBoard();
  b[0] = 'cleaning_1';
  b[1] = 'cleaning_1';
  b[2] = 'cleaning_2';
  return b;
}

export function defaultState(): GameState {
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
    generatorsUnlocked: ['gen_toolbox'],
    orders: ORDERS.slice(0, 3).map((o) => o.id),
    lastEnergyTick: Date.now(),
    gemRefillsUsed: 0
  };
}

// 单例状态仓库：所有写操作经由此处并持久化
class Store {
  private state: GameState;

  constructor() {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    this.state = raw ? (JSON.parse(raw) as GameState) : defaultState();
    // 版本迁移：schema 变化则重置
    if (this.state.version !== 2) this.state = defaultState();
  }

  get(): GameState {
    return this.state;
  }

  save(): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(this.state));
  }

  reset(): void {
    this.state = defaultState();
    this.save();
  }
}

export const STATE = new Store();
