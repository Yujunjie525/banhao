export type WarriorElement = 'none' | 'wind' | 'fire' | 'thunder';

export interface WarriorCharacterConfig {
    entity_id: string;
    name: string;
    base_attack: number;
    fire_rate_per_sec: number;
    unlock_cost: number;
    initial_element: WarriorElement;
    initial_bullet_bonus: number;
    combo_dmg_bonus_per_hit: number;
    boss_damage_multiplier: number;
    element_advantage_bonus: number;
    squad_threshold_offset: number;
}

export interface WarriorDropPackConfig {
    pack_id: string;
    name: string;
    pack_type: 'element' | 'math_buff' | 'math_debuff';
    element_value: WarriorElement;
    math_operator: 'none' | 'add' | 'subtract' | 'multiply' | 'divide';
    math_value: number;
}

export interface WarriorTargetConfig {
    entity_id: string;
    name: string;
    target_type: 'cluster' | 'obstacle';
    cluster_shape: 'square' | 'column' | 'wide' | 'null';
    hp_per_unit: number;
    unit_count: number;
    drop_types: string[];
}

export interface WarriorBossConfig {
    entity_id: string;
    name: string;
    base_hp: number;
    element_type: WarriorElement;
    lane_occupy: number;
    shift_interval_sec: number;
    approach_speed_per_sec: number;
}

export interface WarriorLevelConfig {
    level_id: number;
    base_run_speed: number;
    initial_bullet_count: number;
    boss_hp_multiplier: number;
    duration_sec: number;
    wave_interval_sec: number;
    wave_group_count: number;
    unit_count_multiplier: number;
    enemy_speed_multiplier: number;
    boss_interval_sec: number;
    first_clear_reward: number;
}

function level(level_id: number): WarriorLevelConfig {
    const difficulty = Math.max(0, Math.min(1, (level_id - 1) / 99));
    return {
        level_id,
        base_run_speed: 60,
        initial_bullet_count: 16,
        boss_hp_multiplier: 0.5 + difficulty * 0.5,
        duration_sec: 120,
        wave_interval_sec: 6.4 - difficulty * 2.8,
        wave_group_count: 1 + difficulty * 2,
        unit_count_multiplier: 0.55 + difficulty * 0.7,
        enemy_speed_multiplier: 0.85 + difficulty * 0.35,
        boss_interval_sec: 30,
        first_clear_reward: 100,
    };
}

const warriorRunConfig = {
    global_configs: {
        combo_max_limit: 300,
        combo_dmg_buff_per_hit: 0.01,
        element_advantage_multiplier: 1.5,
        element_disadvantage_multiplier: 0.5,
        score_per_distance: 10,
        score_per_monster_kill: 5,
    },
    characters: [
        { entity_id: 'C001', name: '孤狼突击手', base_attack: 5, fire_rate_per_sec: 6, unlock_cost: 0, initial_element: 'wind', initial_bullet_bonus: 0, combo_dmg_bonus_per_hit: 0, boss_damage_multiplier: 1, element_advantage_bonus: 0, squad_threshold_offset: 0 },
        { entity_id: 'C002', name: '烈焰先锋', base_attack: 3, fire_rate_per_sec: 8, unlock_cost: 500, initial_element: 'fire', initial_bullet_bonus: 10, combo_dmg_bonus_per_hit: 0, boss_damage_multiplier: 1, element_advantage_bonus: 0.15, squad_threshold_offset: -5 },
        { entity_id: 'C003', name: '重装破坏者', base_attack: 15, fire_rate_per_sec: 5, unlock_cost: 1000, initial_element: 'thunder', initial_bullet_bonus: -6, combo_dmg_bonus_per_hit: 0, boss_damage_multiplier: 1.15, element_advantage_bonus: 0, squad_threshold_offset: 10 },
        { entity_id: 'C004', name: '幽灵狙击手', base_attack: 40, fire_rate_per_sec: 2, unlock_cost: 2000, initial_element: 'wind', initial_bullet_bonus: -20, combo_dmg_bonus_per_hit: 0.005, boss_damage_multiplier: 1.35, element_advantage_bonus: 0, squad_threshold_offset: 20 },
        { entity_id: 'C005', name: '赛博指挥官', base_attack: 20, fire_rate_per_sec: 7, unlock_cost: 5000, initial_element: 'thunder', initial_bullet_bonus: 20, combo_dmg_bonus_per_hit: 0.003, boss_damage_multiplier: 1.1, element_advantage_bonus: 0.1, squad_threshold_offset: -15 },
    ] as WarriorCharacterConfig[],
    drop_packs: [
        { pack_id: 'DP_E_WIND', name: '风', pack_type: 'element', element_value: 'wind', math_operator: 'none', math_value: 0 },
        { pack_id: 'DP_E_FIRE', name: '火', pack_type: 'element', element_value: 'fire', math_operator: 'none', math_value: 0 },
        { pack_id: 'DP_E_THUNDER', name: '雷', pack_type: 'element', element_value: 'thunder', math_operator: 'none', math_value: 0 },
        { pack_id: 'DP_M_ADD10', name: '+10', pack_type: 'math_buff', element_value: 'none', math_operator: 'add', math_value: 10 },
        { pack_id: 'DP_M_ADD50', name: '+50', pack_type: 'math_buff', element_value: 'none', math_operator: 'add', math_value: 50 },
        { pack_id: 'DP_M_MUL2', name: 'x2', pack_type: 'math_buff', element_value: 'none', math_operator: 'multiply', math_value: 2 },
        { pack_id: 'DP_M_SUB15', name: '-15', pack_type: 'math_debuff', element_value: 'none', math_operator: 'subtract', math_value: 15 },
        { pack_id: 'DP_M_DIV2', name: '÷2', pack_type: 'math_debuff', element_value: 'none', math_operator: 'divide', math_value: 2 },
    ] as WarriorDropPackConfig[],
    targets: [
        { entity_id: 'M001', name: '基础方阵', target_type: 'cluster', cluster_shape: 'square', hp_per_unit: 18, unit_count: 68, drop_types: ['element', 'math_buff'] },
        { entity_id: 'M002', name: '纵列方阵', target_type: 'cluster', cluster_shape: 'column', hp_per_unit: 16, unit_count: 30, drop_types: ['math_buff'] },
        { entity_id: 'M003', name: '铁壁方阵', target_type: 'cluster', cluster_shape: 'wide', hp_per_unit: 34, unit_count: 18, drop_types: ['element', 'math_buff', 'math_debuff'] },
        { entity_id: 'M004', name: '诱饵队列', target_type: 'cluster', cluster_shape: 'column', hp_per_unit: 16, unit_count: 15, drop_types: [] },
        { entity_id: 'O001', name: '战术补给箱', target_type: 'obstacle', cluster_shape: 'null', hp_per_unit: 520, unit_count: 1, drop_types: ['math_buff'] },
    ] as WarriorTargetConfig[],
    bosses: [
        { entity_id: 'B001', name: '机械典狱长', base_hp: 1000, element_type: 'thunder', lane_occupy: 1, shift_interval_sec: 3, approach_speed_per_sec: 2.8 },
    ] as WarriorBossConfig[],
    levels: Array.from({ length: 100 }, (_, index) => level(index + 1)) as WarriorLevelConfig[],
};

export default warriorRunConfig;
