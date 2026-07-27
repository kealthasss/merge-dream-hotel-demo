// 全局调参（Demo 草案，待你确认）
// 数值取自同类合并装修游戏通用范式；原游戏精确数值未公开，均标注为可调草案。

export const CONFIG = {
  // 能量（G6 摩擦）
  energyMax: 100,
  energyStart: 100,
  energyRegenMs: 120_000, // 每 120s 回复 1 点

  // 生成器产出消耗
  spawnCost: 1, // 每次点击生成器产出 1 个基础物，耗 1 能量

  // 补能量
  coinRefillCost: 30, // 用金币补满
  gemRefillBase: 10, // 用钻石补满（首次）
  gemRefillStep: 2, // 每次补满后钻石成本 +2（递增）

  // 棋盘（横屏）
  boardCols: 8,
  boardRows: 5, // 8×5 = 40 格

  // 等级
  startLevel: 1,
  startGems: 5,

  // 升级所需经验曲线：Lv -> 升级到下一级所需 XP
  xpToNext: (lv: number): number => 50 + lv * 30,

  // 首局确定性教学（M2 使用）：开局预置的板上物品
  firstRunSeed: true
};

export type Config = typeof CONFIG;
