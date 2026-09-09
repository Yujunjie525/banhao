export type BondChaseRouteAction = "run" | "jump" | "wait" | "wait_guard";

export type BondChasePlatformType = "solid" | "fragile" | "dichi";

export interface BondChasePoint {
    x: number;
    y: number;
}

export interface BondChasePlatformConfig {
    id: string;
    type: BondChasePlatformType | string;
    x: number;
    y: number;
    width: number;
    height: number;
    /** 仅用于平台外观的下方叠层数量，不参与碰撞。 */
    visual_layers?: number;
}

export interface BondChaseRouteStep {
    action: BondChaseRouteAction | string;
    x?: number;
    y?: number;
    duration?: number;
    arc_height?: number;
    resume_distance?: number;
}

export interface BondChaseTemplateConfig {
    id: string;
    height: number;
    spawn?: {
        princess?: BondChasePoint;
        guard?: BondChasePoint;
    };
    platforms: BondChasePlatformConfig[];
    princess_route: BondChaseRouteStep[];
}

export interface BondChaseCharacterConfig {
    speed: number;
    jump_impulse: number;
    gravity: number;
    width: number;
    height: number;
}

export interface BondChaseGeneratorConfig {
    enabled: boolean;
    seed: number;
    randomize_seed_each_run: boolean;
    chunk_height: number;
    min_rise: number;
    max_rise: number;
    min_platform_width: number;
    max_platform_width: number;
    min_fallback_platform_width: number;
    max_fallback_platform_width: number;
    visual_stack_probability: number;
    visual_stack_short_width: number;
    visual_stack_max_layers: number;
    safety_margin: number;
    min_edge_gap: number;
    recovery_interval: number;
    max_attempts: number;
}

export interface BondChaseConfig {
    world_width: number;
    camera_smooth: number;
    princess_pace_start_ratio: number;
    princess_pace_end_ratio: number;
    princess_pace_ramp_seconds: number;
    princess_pace_variation: number;
    princess_pace_control_allowance: number;
    water_start: number;
    water_speed: number;
    water_target_gap: number;
    water_guard_clearance: number;
    water_min_speed_scale: number;
    water_max_speed_scale: number;
    water_distance_gain: number;
    water_speed_response: number;
    max_chain_distance: number;
    chain_fail_delay: number;
    guard: BondChaseCharacterConfig;
    princess: BondChaseCharacterConfig;
    generator: BondChaseGeneratorConfig;
    template_pool: string[];
    templates: BondChaseTemplateConfig[];
}
