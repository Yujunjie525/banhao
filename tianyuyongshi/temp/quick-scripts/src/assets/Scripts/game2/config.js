"use strict";
cc._RF.push(module, 'b9df9Um8EJNHJ6b3IQLfTGP', 'config');
// Scripts/game2/config.js

"use strict";

// 唯一数据源 — 所有业务数值只在此定义
module.exports = {
  // 体力
  stamina: {
    max: 30,
    recoverPerMin: 1,
    // 每10分钟恢复1点
    recoverIntervalSec: 600
  },
  // 神魄（局外核心货币）
  currency: {
    initShenpo: 0
  },
  // 局内召唤神格消耗公式: 10 + summonCount * 5
  summon: {
    baseCost: 10,
    costStep: 5
  },
  // 勇士局内阶级（跃迁）
  heroRank: {
    maxLevel: 3,
    damageMultiplier: [1.0, 2.0, 4.0],
    energyBonusAtMax: 0
  },
  // 勇士表
  heroConfig: [{
    id: 'Hero_01',
    name: '灵能剑侍',
    fragmentId: 'Item_002',
    fan: 100,
    San: 120,
    li: 10,
    m: 1,
    icon: 'ui_1.png'
  }, {
    id: 'Hero_02',
    name: '怒雷力士',
    fragmentId: 'Item_003',
    fan: 60,
    San: 60,
    li: 10,
    m: 3,
    icon: 'ui_2.png'
  }, {
    id: 'Hero_03',
    name: '聚灵天女',
    fragmentId: 'Item_004',
    fan: 150,
    San: 360,
    li: 10,
    m: 5,
    icon: 'ui_3.png'
  }, {
    id: 'Hero_04',
    name: '烈焰法尊',
    fragmentId: 'Item_005',
    fan: 150,
    San: 120,
    li: 10,
    m: 2,
    icon: 'ui_4.png'
  }, {
    id: 'Hero_05',
    name: '穿云弩手',
    fragmentId: 'Item_006',
    fan: 200,
    San: 360,
    li: 10,
    m: 2,
    icon: 'ui_5.png'
  }, {
    id: 'Hero_06',
    name: '八卦天师',
    fragmentId: 'Item_007',
    fan: 200,
    San: 120,
    li: 10,
    m: 2,
    icon: 'ui_6.png'
  }],
  // 勇士局外境界强化表
  heroUpgradeConfig: [{
    id: 1,
    Hero_id: 'Hero_01',
    lv: 1,
    fragmentCost: 0,
    goldCost: 0,
    atkBonusPct: 300,
    mpBonusPct: 100
  }, {
    id: 2,
    Hero_id: 'Hero_01',
    lv: 2,
    fragmentCost: 10,
    goldCost: 10,
    atkBonusPct: 310,
    mpBonusPct: 100
  }, {
    id: 3,
    Hero_id: 'Hero_01',
    lv: 3,
    fragmentCost: 20,
    goldCost: 20,
    atkBonusPct: 320,
    mpBonusPct: 100
  }, {
    id: 4,
    Hero_id: 'Hero_01',
    lv: 4,
    fragmentCost: 30,
    goldCost: 30,
    atkBonusPct: 330,
    mpBonusPct: 100
  }, {
    id: 5,
    Hero_id: 'Hero_01',
    lv: 5,
    fragmentCost: 40,
    goldCost: 40,
    atkBonusPct: 340,
    mpBonusPct: 150
  }, {
    id: 6,
    Hero_id: 'Hero_02',
    lv: 1,
    fragmentCost: 0,
    goldCost: 0,
    atkBonusPct: 500,
    mpBonusPct: 100
  }, {
    id: 7,
    Hero_id: 'Hero_02',
    lv: 2,
    fragmentCost: 10,
    goldCost: 10,
    atkBonusPct: 510,
    mpBonusPct: 100
  }, {
    id: 8,
    Hero_id: 'Hero_02',
    lv: 3,
    fragmentCost: 20,
    goldCost: 20,
    atkBonusPct: 520,
    mpBonusPct: 100
  }, {
    id: 9,
    Hero_id: 'Hero_02',
    lv: 4,
    fragmentCost: 30,
    goldCost: 30,
    atkBonusPct: 530,
    mpBonusPct: 100
  }, {
    id: 10,
    Hero_id: 'Hero_02',
    lv: 5,
    fragmentCost: 40,
    goldCost: 40,
    atkBonusPct: 540,
    mpBonusPct: 150
  }, {
    id: 11,
    Hero_id: 'Hero_03',
    lv: 1,
    fragmentCost: 0,
    goldCost: 0,
    atkBonusPct: 10,
    mpBonusPct: 100
  }, {
    id: 12,
    Hero_id: 'Hero_03',
    lv: 2,
    fragmentCost: 10,
    goldCost: 10,
    atkBonusPct: 20,
    mpBonusPct: 100
  }, {
    id: 13,
    Hero_id: 'Hero_03',
    lv: 3,
    fragmentCost: 20,
    goldCost: 20,
    atkBonusPct: 20,
    mpBonusPct: 100
  }, {
    id: 14,
    Hero_id: 'Hero_03',
    lv: 4,
    fragmentCost: 30,
    goldCost: 30,
    atkBonusPct: 20,
    mpBonusPct: 100
  }, {
    id: 15,
    Hero_id: 'Hero_03',
    lv: 5,
    fragmentCost: 40,
    goldCost: 40,
    atkBonusPct: 30,
    mpBonusPct: 150
  }, {
    id: 16,
    Hero_id: 'Hero_04',
    lv: 1,
    fragmentCost: 0,
    goldCost: 0,
    atkBonusPct: 350,
    mpBonusPct: 100
  }, {
    id: 17,
    Hero_id: 'Hero_04',
    lv: 2,
    fragmentCost: 10,
    goldCost: 10,
    atkBonusPct: 360,
    mpBonusPct: 100
  }, {
    id: 18,
    Hero_id: 'Hero_04',
    lv: 3,
    fragmentCost: 20,
    goldCost: 20,
    atkBonusPct: 370,
    mpBonusPct: 100
  }, {
    id: 19,
    Hero_id: 'Hero_04',
    lv: 4,
    fragmentCost: 30,
    goldCost: 30,
    atkBonusPct: 380,
    mpBonusPct: 100
  }, {
    id: 20,
    Hero_id: 'Hero_04',
    lv: 5,
    fragmentCost: 40,
    goldCost: 40,
    atkBonusPct: 390,
    mpBonusPct: 150
  }, {
    id: 21,
    Hero_id: 'Hero_05',
    lv: 1,
    fragmentCost: 0,
    goldCost: 0,
    atkBonusPct: 300,
    mpBonusPct: 100
  }, {
    id: 22,
    Hero_id: 'Hero_05',
    lv: 2,
    fragmentCost: 10,
    goldCost: 10,
    atkBonusPct: 310,
    mpBonusPct: 100
  }, {
    id: 23,
    Hero_id: 'Hero_05',
    lv: 3,
    fragmentCost: 20,
    goldCost: 20,
    atkBonusPct: 320,
    mpBonusPct: 100
  }, {
    id: 24,
    Hero_id: 'Hero_05',
    lv: 4,
    fragmentCost: 30,
    goldCost: 30,
    atkBonusPct: 330,
    mpBonusPct: 100
  }, {
    id: 25,
    Hero_id: 'Hero_05',
    lv: 5,
    fragmentCost: 40,
    goldCost: 40,
    atkBonusPct: 340,
    mpBonusPct: 150
  }, {
    id: 26,
    Hero_id: 'Hero_06',
    lv: 1,
    fragmentCost: 0,
    goldCost: 0,
    atkBonusPct: 500,
    mpBonusPct: 100
  }, {
    id: 27,
    Hero_id: 'Hero_06',
    lv: 2,
    fragmentCost: 10,
    goldCost: 10,
    atkBonusPct: 510,
    mpBonusPct: 100
  }, {
    id: 28,
    Hero_id: 'Hero_06',
    lv: 3,
    fragmentCost: 20,
    goldCost: 20,
    atkBonusPct: 520,
    mpBonusPct: 100
  }, {
    id: 29,
    Hero_id: 'Hero_06',
    lv: 4,
    fragmentCost: 30,
    goldCost: 30,
    atkBonusPct: 530,
    mpBonusPct: 100
  }, {
    id: 30,
    Hero_id: 'Hero_06',
    lv: 5,
    fragmentCost: 40,
    goldCost: 40,
    atkBonusPct: 540,
    mpBonusPct: 150
  }],
  // 怪物表
  monsterConfig: [{
    id: 'm_01',
    name: '迷雾妖狼',
    icon: 'ui_13.png',
    hp: 750,
    atk: 50,
    speed: 0.2,
    god: 10,
    m: 4,
    skill: '' // 基础近战，

  }, {
    id: 'm_02',
    name: '混沌巨灵',
    icon: 'ui_14.png',
    hp: 3000,
    atk: 100,
    speed: 0.1,
    god: 10,
    m: 5,
    skill: '' // 坦克型怪物，

  }, {
    id: 'm_03',
    name: '诡翼魔蝠',
    icon: 'ui_15.png',
    hp: 1000,
    atk: 50,
    speed: 0.3,
    god: 10,
    m: 1,
    skill: '' // 飞行高机动，

  }, {
    id: 'm_04',
    name: '爆裂火鬼',
    icon: 'ui_16.png',
    hp: 1500,
    atk: 200,
    speed: 0.3,
    god: 10,
    m: 2,
    skill: '' // 脆皮高威胁，

  }, {
    id: 'm_05',
    name: '噬魂骨巫',
    icon: 'ui_17.png',
    hp: 2000,
    atk: 100,
    speed: 0.3,
    god: 10,
    m: 3,
    skill: '' // 远程法师，

  }, {
    id: 'm_06',
    name: '深渊领主',
    icon: 'ui_18.png',
    hp: 10000,
    atk: 1000,
    speed: 0.3,
    god: 10,
    m: 5,
    skill: '' // Boss级，

  }],
  // 神核
  coreSkins: [{
    id: 'Skin_01',
    name: '凌霄原核',
    icon: 'ui_19.png',
    hp: 10000,
    atk: 300,
    cost: 0,
    skill: ''
  }, {
    id: 'Skin_02',
    name: '兜率天炉',
    icon: 'ui_23.png',
    hp: 20000,
    atk: 400,
    cost: 50000,
    skill: ''
  }, {
    id: 'Skin_03',
    name: '广寒冰晶',
    icon: 'ui_21.png',
    hp: 30000,
    atk: 500,
    cost: 50000,
    skill: ''
  }, {
    id: 'Skin_04',
    name: '雷音金莲',
    icon: 'ui_23.png',
    hp: 40000,
    atk: 600,
    cost: 50000,
    skill: ''
  }, {
    id: 'Skin_05',
    name: '修罗血瞳',
    icon: 'ui_20.png',
    hp: 50000,
    atk: 700,
    cost: 150000,
    skill: ''
  }],
  // 道具表
  itemConfig: [{
    id: 'Item_001',
    name: '神魄',
    icon: 'ui_25.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_002',
    name: '灵能剑侍战魂',
    icon: 'ui_7.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_003',
    name: '怒雷力士战魂',
    icon: 'ui_8.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_004',
    name: '聚灵天女战魂',
    icon: 'ui_9.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_005',
    name: '烈焰法尊战魂',
    icon: 'ui_10.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_006',
    name: '穿云弩手战魂',
    icon: 'ui_11.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_007',
    name: '八卦天师战魂',
    icon: 'ui_12.png',
    type: '',
    desc: ''
  }, {
    id: 'Item_008',
    name: '神格',
    icon: 'ui_24.png',
    type: '',
    desc: ''
  }],
  // 关卡体力消耗
  levelStaminaCost: 1,
  // 三星评级阈值（神核HP百分比）
  starThresholds: [0.8, 0.4, 0.0],
  // 关卡配置（按此格式继续添加）
  "levels": [{
    "level_id": 1,
    "map_bg": "map_1.png",
    "initial_shenge": 200,
    "difficulty_mult": 1.0,
    "total_waves": 10,
    "wave_interval": 15.0,
    "monsters_per_wave": 10,
    "spawn_pools": ["m_01"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 1500
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.5,
      "min_amount": 1,
      "max_amount": 2
    }]
  }, {
    "level_id": 2,
    "map_bg": "map_1.png",
    "initial_shenge": 200,
    "difficulty_mult": 1.08,
    "total_waves": 10,
    "wave_interval": 15.0,
    "monsters_per_wave": 17,
    "spawn_pools": ["m_01"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 1700
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.51,
      "min_amount": 1,
      "max_amount": 2
    }]
  }, {
    "level_id": 3,
    "map_bg": "map_1.png",
    "initial_shenge": 200,
    "difficulty_mult": 1.16,
    "total_waves": 10,
    "wave_interval": 15.0,
    "monsters_per_wave": 19,
    "spawn_pools": ["m_01"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 1900
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.52,
      "min_amount": 1,
      "max_amount": 2
    }]
  }, {
    "level_id": 4,
    "map_bg": "map_1.png",
    "initial_shenge": 200,
    "difficulty_mult": 1.24,
    "total_waves": 10,
    "wave_interval": 15.0,
    "monsters_per_wave": 21,
    "spawn_pools": ["m_01"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 2100
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.53,
      "min_amount": 1,
      "max_amount": 2
    }]
  }, {
    "level_id": 5,
    "map_bg": "map_1.png",
    "initial_shenge": 200,
    "difficulty_mult": 1.32,
    "total_waves": 10,
    "wave_interval": 15.0,
    "monsters_per_wave": 20,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 2300
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.54,
      "min_amount": 1,
      "max_amount": 2
    }]
  }, {
    "level_id": 6,
    "map_bg": "map_1.png",
    "initial_shenge": 250,
    "difficulty_mult": 1.4,
    "total_waves": 11,
    "wave_interval": 15.0,
    "monsters_per_wave": 25,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 2500
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.55,
      "min_amount": 1,
      "max_amount": 3
    }]
  }, {
    "level_id": 7,
    "map_bg": "map_1.png",
    "initial_shenge": 250,
    "difficulty_mult": 1.48,
    "total_waves": 11,
    "wave_interval": 15.0,
    "monsters_per_wave": 27,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 2700
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.56,
      "min_amount": 1,
      "max_amount": 3
    }]
  }, {
    "level_id": 8,
    "map_bg": "map_1.png",
    "initial_shenge": 250,
    "difficulty_mult": 1.56,
    "total_waves": 11,
    "wave_interval": 15.0,
    "monsters_per_wave": 29,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 2900
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.57,
      "min_amount": 1,
      "max_amount": 3
    }]
  }, {
    "level_id": 9,
    "map_bg": "map_1.png",
    "initial_shenge": 250,
    "difficulty_mult": 1.64,
    "total_waves": 11,
    "wave_interval": 15.0,
    "monsters_per_wave": 31,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 3100
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.58,
      "min_amount": 1,
      "max_amount": 3
    }]
  }, {
    "level_id": 10,
    "map_bg": "map_1.png",
    "initial_shenge": 250,
    "difficulty_mult": 1.72,
    "total_waves": 11,
    "wave_interval": 15.0,
    "monsters_per_wave": 33,
    "spawn_pools": ["m_01", "m_02", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 6600
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.59,
      "min_amount": 1,
      "max_amount": 3
    }]
  }, {
    "level_id": 11,
    "map_bg": "map_1.png",
    "initial_shenge": 275,
    "difficulty_mult": 1.8,
    "total_waves": 12,
    "wave_interval": 14.5,
    "monsters_per_wave": 35,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 3500
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.6,
      "min_amount": 2,
      "max_amount": 4
    }]
  }, {
    "level_id": 12,
    "map_bg": "map_1.png",
    "initial_shenge": 275,
    "difficulty_mult": 1.88,
    "total_waves": 12,
    "wave_interval": 14.5,
    "monsters_per_wave": 37,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 3700
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.61,
      "min_amount": 2,
      "max_amount": 4
    }]
  }, {
    "level_id": 13,
    "map_bg": "map_1.png",
    "initial_shenge": 275,
    "difficulty_mult": 1.96,
    "total_waves": 12,
    "wave_interval": 14.5,
    "monsters_per_wave": 39,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 3900
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.62,
      "min_amount": 2,
      "max_amount": 4
    }]
  }, {
    "level_id": 14,
    "map_bg": "map_1.png",
    "initial_shenge": 275,
    "difficulty_mult": 2.04,
    "total_waves": 12,
    "wave_interval": 14.5,
    "monsters_per_wave": 41,
    "spawn_pools": ["m_01", "m_02"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 4100
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.63,
      "min_amount": 2,
      "max_amount": 4
    }]
  }, {
    "level_id": 15,
    "map_bg": "map_1.png",
    "initial_shenge": 275,
    "difficulty_mult": 2.12,
    "total_waves": 12,
    "wave_interval": 14.5,
    "monsters_per_wave": 43,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 4300
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.64,
      "min_amount": 2,
      "max_amount": 4
    }]
  }, {
    "level_id": 16,
    "map_bg": "map_1.png",
    "initial_shenge": 300,
    "difficulty_mult": 2.2,
    "total_waves": 13,
    "wave_interval": 14.5,
    "monsters_per_wave": 45,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 4500
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.65,
      "min_amount": 2,
      "max_amount": 5
    }]
  }, {
    "level_id": 17,
    "map_bg": "map_1.png",
    "initial_shenge": 300,
    "difficulty_mult": 2.28,
    "total_waves": 13,
    "wave_interval": 14.5,
    "monsters_per_wave": 47,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 4700
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.66,
      "min_amount": 2,
      "max_amount": 5
    }]
  }, {
    "level_id": 18,
    "map_bg": "map_1.png",
    "initial_shenge": 300,
    "difficulty_mult": 2.36,
    "total_waves": 13,
    "wave_interval": 14.5,
    "monsters_per_wave": 49,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 4900
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.67,
      "min_amount": 2,
      "max_amount": 5
    }]
  }, {
    "level_id": 19,
    "map_bg": "map_1.png",
    "initial_shenge": 300,
    "difficulty_mult": 2.44,
    "total_waves": 13,
    "wave_interval": 14.5,
    "monsters_per_wave": 51,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 5100
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.68,
      "min_amount": 2,
      "max_amount": 5
    }]
  }, {
    "level_id": 20,
    "map_bg": "map_1.png",
    "initial_shenge": 300,
    "difficulty_mult": 2.52,
    "total_waves": 13,
    "wave_interval": 14.5,
    "monsters_per_wave": 53,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 10600
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.69,
      "min_amount": 2,
      "max_amount": 5
    }]
  }, {
    "level_id": 21,
    "map_bg": "map_1.png",
    "initial_shenge": 325,
    "difficulty_mult": 2.6,
    "total_waves": 14,
    "wave_interval": 14.0,
    "monsters_per_wave": 55,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 5500
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.7,
      "min_amount": 3,
      "max_amount": 6
    }]
  }, {
    "level_id": 22,
    "map_bg": "map_1.png",
    "initial_shenge": 325,
    "difficulty_mult": 2.68,
    "total_waves": 14,
    "wave_interval": 14.0,
    "monsters_per_wave": 57,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 5700
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.71,
      "min_amount": 3,
      "max_amount": 6
    }]
  }, {
    "level_id": 23,
    "map_bg": "map_1.png",
    "initial_shenge": 325,
    "difficulty_mult": 2.76,
    "total_waves": 14,
    "wave_interval": 14.0,
    "monsters_per_wave": 59,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 5900
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.72,
      "min_amount": 3,
      "max_amount": 6
    }]
  }, {
    "level_id": 24,
    "map_bg": "map_1.png",
    "initial_shenge": 325,
    "difficulty_mult": 2.84,
    "total_waves": 14,
    "wave_interval": 14.0,
    "monsters_per_wave": 61,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 6100
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.73,
      "min_amount": 3,
      "max_amount": 6
    }]
  }, {
    "level_id": 25,
    "map_bg": "map_1.png",
    "initial_shenge": 325,
    "difficulty_mult": 2.92,
    "total_waves": 14,
    "wave_interval": 14.0,
    "monsters_per_wave": 63,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 6300
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.74,
      "min_amount": 3,
      "max_amount": 6
    }]
  }, {
    "level_id": 26,
    "map_bg": "map_1.png",
    "initial_shenge": 350,
    "difficulty_mult": 3.0,
    "total_waves": 15,
    "wave_interval": 14.0,
    "monsters_per_wave": 65,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 6500
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.75,
      "min_amount": 3,
      "max_amount": 7
    }]
  }, {
    "level_id": 27,
    "map_bg": "map_1.png",
    "initial_shenge": 350,
    "difficulty_mult": 3.08,
    "total_waves": 15,
    "wave_interval": 14.0,
    "monsters_per_wave": 67,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 6700
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.76,
      "min_amount": 3,
      "max_amount": 7
    }]
  }, {
    "level_id": 28,
    "map_bg": "map_1.png",
    "initial_shenge": 350,
    "difficulty_mult": 3.16,
    "total_waves": 15,
    "wave_interval": 14.0,
    "monsters_per_wave": 69,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 6900
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.77,
      "min_amount": 3,
      "max_amount": 7
    }]
  }, {
    "level_id": 29,
    "map_bg": "map_1.png",
    "initial_shenge": 350,
    "difficulty_mult": 3.24,
    "total_waves": 15,
    "wave_interval": 14.0,
    "monsters_per_wave": 71,
    "spawn_pools": ["m_01", "m_02", "m_03"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 7100
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.78,
      "min_amount": 3,
      "max_amount": 7
    }]
  }, {
    "level_id": 30,
    "map_bg": "map_1.png",
    "initial_shenge": 350,
    "difficulty_mult": 3.32,
    "total_waves": 15,
    "wave_interval": 14.0,
    "monsters_per_wave": 73,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 14600
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.79,
      "min_amount": 3,
      "max_amount": 7
    }]
  }, {
    "level_id": 31,
    "map_bg": "map_1.png",
    "initial_shenge": 375,
    "difficulty_mult": 3.4,
    "total_waves": 16,
    "wave_interval": 13.5,
    "monsters_per_wave": 75,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 7500
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.8,
      "min_amount": 4,
      "max_amount": 8
    }]
  }, {
    "level_id": 32,
    "map_bg": "map_1.png",
    "initial_shenge": 375,
    "difficulty_mult": 3.48,
    "total_waves": 16,
    "wave_interval": 13.5,
    "monsters_per_wave": 77,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 7700
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.81,
      "min_amount": 4,
      "max_amount": 8
    }]
  }, {
    "level_id": 33,
    "map_bg": "map_1.png",
    "initial_shenge": 375,
    "difficulty_mult": 3.56,
    "total_waves": 16,
    "wave_interval": 13.5,
    "monsters_per_wave": 79,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 7900
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.82,
      "min_amount": 4,
      "max_amount": 8
    }]
  }, {
    "level_id": 34,
    "map_bg": "map_1.png",
    "initial_shenge": 375,
    "difficulty_mult": 3.64,
    "total_waves": 16,
    "wave_interval": 13.5,
    "monsters_per_wave": 81,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 8100
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.83,
      "min_amount": 4,
      "max_amount": 8
    }]
  }, {
    "level_id": 35,
    "map_bg": "map_1.png",
    "initial_shenge": 375,
    "difficulty_mult": 3.72,
    "total_waves": 16,
    "wave_interval": 13.5,
    "monsters_per_wave": 83,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 8300
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.84,
      "min_amount": 4,
      "max_amount": 8
    }]
  }, {
    "level_id": 36,
    "map_bg": "map_1.png",
    "initial_shenge": 400,
    "difficulty_mult": 3.8,
    "total_waves": 17,
    "wave_interval": 13.5,
    "monsters_per_wave": 85,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 8500
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.85,
      "min_amount": 4,
      "max_amount": 9
    }]
  }, {
    "level_id": 37,
    "map_bg": "map_1.png",
    "initial_shenge": 400,
    "difficulty_mult": 3.88,
    "total_waves": 17,
    "wave_interval": 13.5,
    "monsters_per_wave": 87,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 8700
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.86,
      "min_amount": 4,
      "max_amount": 9
    }]
  }, {
    "level_id": 38,
    "map_bg": "map_1.png",
    "initial_shenge": 400,
    "difficulty_mult": 3.96,
    "total_waves": 17,
    "wave_interval": 13.5,
    "monsters_per_wave": 89,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 8900
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.87,
      "min_amount": 4,
      "max_amount": 9
    }]
  }, {
    "level_id": 39,
    "map_bg": "map_1.png",
    "initial_shenge": 400,
    "difficulty_mult": 4.04,
    "total_waves": 17,
    "wave_interval": 13.5,
    "monsters_per_wave": 91,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 9100
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.88,
      "min_amount": 4,
      "max_amount": 9
    }]
  }, {
    "level_id": 40,
    "map_bg": "map_1.png",
    "initial_shenge": 400,
    "difficulty_mult": 4.12,
    "total_waves": 17,
    "wave_interval": 13.5,
    "monsters_per_wave": 93,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 18600
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.89,
      "min_amount": 4,
      "max_amount": 9
    }]
  }, {
    "level_id": 41,
    "map_bg": "map_1.png",
    "initial_shenge": 425,
    "difficulty_mult": 4.2,
    "total_waves": 18,
    "wave_interval": 13.0,
    "monsters_per_wave": 95,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 9500
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.9,
      "min_amount": 5,
      "max_amount": 10
    }]
  }, {
    "level_id": 42,
    "map_bg": "map_1.png",
    "initial_shenge": 425,
    "difficulty_mult": 4.28,
    "total_waves": 18,
    "wave_interval": 13.0,
    "monsters_per_wave": 97,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 9700
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.91,
      "min_amount": 5,
      "max_amount": 10
    }]
  }, {
    "level_id": 43,
    "map_bg": "map_1.png",
    "initial_shenge": 425,
    "difficulty_mult": 4.36,
    "total_waves": 18,
    "wave_interval": 13.0,
    "monsters_per_wave": 99,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 9900
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.92,
      "min_amount": 5,
      "max_amount": 10
    }]
  }, {
    "level_id": 44,
    "map_bg": "map_1.png",
    "initial_shenge": 425,
    "difficulty_mult": 4.44,
    "total_waves": 18,
    "wave_interval": 13.0,
    "monsters_per_wave": 101,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 10100
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.93,
      "min_amount": 5,
      "max_amount": 10
    }]
  }, {
    "level_id": 45,
    "map_bg": "map_1.png",
    "initial_shenge": 425,
    "difficulty_mult": 4.52,
    "total_waves": 18,
    "wave_interval": 13.0,
    "monsters_per_wave": 103,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 10300
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 0.94,
      "min_amount": 5,
      "max_amount": 10
    }]
  }, {
    "level_id": 46,
    "map_bg": "map_1.png",
    "initial_shenge": 450,
    "difficulty_mult": 4.6,
    "total_waves": 19,
    "wave_interval": 13.0,
    "monsters_per_wave": 105,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 10500
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 0.95,
      "min_amount": 5,
      "max_amount": 11
    }]
  }, {
    "level_id": 47,
    "map_bg": "map_1.png",
    "initial_shenge": 450,
    "difficulty_mult": 4.68,
    "total_waves": 19,
    "wave_interval": 13.0,
    "monsters_per_wave": 107,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 10700
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 0.96,
      "min_amount": 5,
      "max_amount": 11
    }]
  }, {
    "level_id": 48,
    "map_bg": "map_1.png",
    "initial_shenge": 450,
    "difficulty_mult": 4.76,
    "total_waves": 19,
    "wave_interval": 13.0,
    "monsters_per_wave": 109,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 10900
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 0.97,
      "min_amount": 5,
      "max_amount": 11
    }]
  }, {
    "level_id": 49,
    "map_bg": "map_1.png",
    "initial_shenge": 450,
    "difficulty_mult": 4.84,
    "total_waves": 19,
    "wave_interval": 13.0,
    "monsters_per_wave": 111,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 11100
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 0.98,
      "min_amount": 5,
      "max_amount": 11
    }]
  }, {
    "level_id": 50,
    "map_bg": "map_1.png",
    "initial_shenge": 450,
    "difficulty_mult": 4.92,
    "total_waves": 19,
    "wave_interval": 13.0,
    "monsters_per_wave": 113,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 22600
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 0.99,
      "min_amount": 5,
      "max_amount": 11
    }]
  }, {
    "level_id": 51,
    "map_bg": "map_1.png",
    "initial_shenge": 475,
    "difficulty_mult": 5.0,
    "total_waves": 20,
    "wave_interval": 12.5,
    "monsters_per_wave": 115,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 11500
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 12
    }]
  }, {
    "level_id": 52,
    "map_bg": "map_1.png",
    "initial_shenge": 475,
    "difficulty_mult": 5.08,
    "total_waves": 20,
    "wave_interval": 12.5,
    "monsters_per_wave": 117,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 11700
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 12
    }]
  }, {
    "level_id": 53,
    "map_bg": "map_1.png",
    "initial_shenge": 475,
    "difficulty_mult": 5.16,
    "total_waves": 20,
    "wave_interval": 12.5,
    "monsters_per_wave": 119,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 11900
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 12
    }]
  }, {
    "level_id": 54,
    "map_bg": "map_1.png",
    "initial_shenge": 475,
    "difficulty_mult": 5.24,
    "total_waves": 20,
    "wave_interval": 12.5,
    "monsters_per_wave": 121,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 12100
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 12
    }]
  }, {
    "level_id": 55,
    "map_bg": "map_1.png",
    "initial_shenge": 475,
    "difficulty_mult": 5.32,
    "total_waves": 20,
    "wave_interval": 12.5,
    "monsters_per_wave": 123,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 12300
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 12
    }]
  }, {
    "level_id": 56,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.4,
    "total_waves": 21,
    "wave_interval": 12.5,
    "monsters_per_wave": 125,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 12500
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 13
    }]
  }, {
    "level_id": 57,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.48,
    "total_waves": 21,
    "wave_interval": 12.5,
    "monsters_per_wave": 127,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 12700
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 13
    }]
  }, {
    "level_id": 58,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.56,
    "total_waves": 21,
    "wave_interval": 12.5,
    "monsters_per_wave": 129,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 12900
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 13
    }]
  }, {
    "level_id": 59,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.64,
    "total_waves": 21,
    "wave_interval": 12.5,
    "monsters_per_wave": 131,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 13100
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 13
    }]
  }, {
    "level_id": 60,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.72,
    "total_waves": 21,
    "wave_interval": 12.5,
    "monsters_per_wave": 133,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 26600
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 6,
      "max_amount": 13
    }]
  }, {
    "level_id": 61,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.8,
    "total_waves": 22,
    "wave_interval": 12.0,
    "monsters_per_wave": 135,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 13500
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 14
    }]
  }, {
    "level_id": 62,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.88,
    "total_waves": 22,
    "wave_interval": 12.0,
    "monsters_per_wave": 137,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 13700
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 14
    }]
  }, {
    "level_id": 63,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 5.96,
    "total_waves": 22,
    "wave_interval": 12.0,
    "monsters_per_wave": 139,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 13900
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 14
    }]
  }, {
    "level_id": 64,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.04,
    "total_waves": 22,
    "wave_interval": 12.0,
    "monsters_per_wave": 141,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 14100
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 14
    }]
  }, {
    "level_id": 65,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.12,
    "total_waves": 22,
    "wave_interval": 12.0,
    "monsters_per_wave": 143,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 14300
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 14
    }]
  }, {
    "level_id": 66,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.2,
    "total_waves": 23,
    "wave_interval": 12.0,
    "monsters_per_wave": 145,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 14500
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 15
    }]
  }, {
    "level_id": 67,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.28,
    "total_waves": 23,
    "wave_interval": 12.0,
    "monsters_per_wave": 147,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 14700
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 15
    }]
  }, {
    "level_id": 68,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.36,
    "total_waves": 23,
    "wave_interval": 12.0,
    "monsters_per_wave": 149,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 14900
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 15
    }]
  }, {
    "level_id": 69,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.44,
    "total_waves": 23,
    "wave_interval": 12.0,
    "monsters_per_wave": 151,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 15100
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 15
    }]
  }, {
    "level_id": 70,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.52,
    "total_waves": 23,
    "wave_interval": 12.0,
    "monsters_per_wave": 153,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 30600
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 7,
      "max_amount": 15
    }]
  }, {
    "level_id": 71,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.6,
    "total_waves": 24,
    "wave_interval": 11.5,
    "monsters_per_wave": 155,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 15500
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 16
    }]
  }, {
    "level_id": 72,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.68,
    "total_waves": 24,
    "wave_interval": 11.5,
    "monsters_per_wave": 157,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 15700
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 16
    }]
  }, {
    "level_id": 73,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.76,
    "total_waves": 24,
    "wave_interval": 11.5,
    "monsters_per_wave": 159,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 15900
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 16
    }]
  }, {
    "level_id": 74,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.84,
    "total_waves": 24,
    "wave_interval": 11.5,
    "monsters_per_wave": 161,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 16100
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 16
    }]
  }, {
    "level_id": 75,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 6.92,
    "total_waves": 24,
    "wave_interval": 11.5,
    "monsters_per_wave": 163,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 16300
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 16
    }]
  }, {
    "level_id": 76,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.0,
    "total_waves": 25,
    "wave_interval": 11.5,
    "monsters_per_wave": 165,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 16500
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 17
    }]
  }, {
    "level_id": 77,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.08,
    "total_waves": 25,
    "wave_interval": 11.5,
    "monsters_per_wave": 167,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 16700
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 17
    }]
  }, {
    "level_id": 78,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.16,
    "total_waves": 25,
    "wave_interval": 11.5,
    "monsters_per_wave": 169,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 16900
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 17
    }]
  }, {
    "level_id": 79,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.24,
    "total_waves": 25,
    "wave_interval": 11.5,
    "monsters_per_wave": 171,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 17100
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 17
    }]
  }, {
    "level_id": 80,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.32,
    "total_waves": 25,
    "wave_interval": 11.5,
    "monsters_per_wave": 173,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 34600
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 8,
      "max_amount": 17
    }]
  }, {
    "level_id": 81,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.4,
    "total_waves": 26,
    "wave_interval": 11.0,
    "monsters_per_wave": 175,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 17500
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 18
    }]
  }, {
    "level_id": 82,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.48,
    "total_waves": 26,
    "wave_interval": 11.0,
    "monsters_per_wave": 177,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 17700
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 18
    }]
  }, {
    "level_id": 83,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.56,
    "total_waves": 26,
    "wave_interval": 11.0,
    "monsters_per_wave": 179,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 17900
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 18
    }]
  }, {
    "level_id": 84,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.64,
    "total_waves": 26,
    "wave_interval": 11.0,
    "monsters_per_wave": 181,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 18100
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 18
    }]
  }, {
    "level_id": 85,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.72,
    "total_waves": 26,
    "wave_interval": 11.0,
    "monsters_per_wave": 183,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 18300
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 18
    }]
  }, {
    "level_id": 86,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.8,
    "total_waves": 27,
    "wave_interval": 11.0,
    "monsters_per_wave": 185,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 18500
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 19
    }]
  }, {
    "level_id": 87,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.88,
    "total_waves": 27,
    "wave_interval": 11.0,
    "monsters_per_wave": 187,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 18700
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 19
    }]
  }, {
    "level_id": 88,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 7.96,
    "total_waves": 27,
    "wave_interval": 11.0,
    "monsters_per_wave": 189,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 18900
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 19
    }]
  }, {
    "level_id": 89,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.04,
    "total_waves": 27,
    "wave_interval": 11.0,
    "monsters_per_wave": 191,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 19100
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 19
    }]
  }, {
    "level_id": 90,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.12,
    "total_waves": 27,
    "wave_interval": 11.0,
    "monsters_per_wave": 193,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 38600
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 9,
      "max_amount": 19
    }]
  }, {
    "level_id": 91,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.2,
    "total_waves": 28,
    "wave_interval": 10.5,
    "monsters_per_wave": 195,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 19500
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 20
    }]
  }, {
    "level_id": 92,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.28,
    "total_waves": 28,
    "wave_interval": 10.5,
    "monsters_per_wave": 197,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 19700
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 20
    }]
  }, {
    "level_id": 93,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.36,
    "total_waves": 28,
    "wave_interval": 10.5,
    "monsters_per_wave": 199,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 19900
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 20
    }]
  }, {
    "level_id": 94,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.44,
    "total_waves": 28,
    "wave_interval": 10.5,
    "monsters_per_wave": 201,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 20100
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 20
    }]
  }, {
    "level_id": 95,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.52,
    "total_waves": 28,
    "wave_interval": 10.5,
    "monsters_per_wave": 203,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 20300
    }],
    "random_rewards": [{
      "item_id": "Item_006",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 20
    }]
  }, {
    "level_id": 96,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.6,
    "total_waves": 29,
    "wave_interval": 10.5,
    "monsters_per_wave": 205,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 20500
    }],
    "random_rewards": [{
      "item_id": "Item_007",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 21
    }]
  }, {
    "level_id": 97,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.68,
    "total_waves": 29,
    "wave_interval": 10.5,
    "monsters_per_wave": 207,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 20700
    }],
    "random_rewards": [{
      "item_id": "Item_002",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 21
    }]
  }, {
    "level_id": 98,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.76,
    "total_waves": 29,
    "wave_interval": 10.5,
    "monsters_per_wave": 209,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 20900
    }],
    "random_rewards": [{
      "item_id": "Item_003",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 21
    }]
  }, {
    "level_id": 99,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.84,
    "total_waves": 29,
    "wave_interval": 10.5,
    "monsters_per_wave": 211,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 21100
    }],
    "random_rewards": [{
      "item_id": "Item_004",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 21
    }]
  }, {
    "level_id": 100,
    "map_bg": "map_1.png",
    "initial_shenge": 500,
    "difficulty_mult": 8.92,
    "total_waves": 29,
    "wave_interval": 10.5,
    "monsters_per_wave": 213,
    "spawn_pools": ["m_01", "m_02", "m_03", "m_04", "m_05", "m_06"],
    "fixed_rewards": [{
      "currency_id": "Item_001",
      "amount": 42600
    }],
    "random_rewards": [{
      "item_id": "Item_005",
      "drop_rate": 1.0,
      "min_amount": 10,
      "max_amount": 21
    }]
  }]
};

cc._RF.pop();