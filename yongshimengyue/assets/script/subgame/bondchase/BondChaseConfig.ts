import {
    BondChaseCharacterConfig,
    BondChaseConfig,
    BondChaseGeneratorConfig,
    BondChasePlatformConfig,
    BondChaseTemplateConfig,
} from "./BondChaseTypes";

function numberOr(value: any, fallback: number): number {
    const result = Number(value);
    return isFinite(result) ? result : fallback;
}

function normalizeCharacter(raw: any, fallback: BondChaseCharacterConfig): BondChaseCharacterConfig {
    raw = raw || {};
    return {
        speed: Math.max(0, numberOr(raw.speed, fallback.speed)),
        jump_impulse: Math.max(0, numberOr(raw.jump_impulse, fallback.jump_impulse)),
        gravity: Math.min(-1, numberOr(raw.gravity, fallback.gravity)),
        width: Math.max(16, numberOr(raw.width, fallback.width)),
        height: Math.max(20, numberOr(raw.height, fallback.height)),
    };
}

function normalizeGenerator(raw: any, fallback: BondChaseGeneratorConfig): BondChaseGeneratorConfig {
    raw = raw || {};
    const minRise = Math.max(40, numberOr(raw.min_rise, fallback.min_rise));
    const minWidth = Math.max(80, numberOr(raw.min_platform_width, fallback.min_platform_width));
    const minFallbackWidth = Math.max(80, numberOr(
        raw.min_fallback_platform_width,
        fallback.min_fallback_platform_width
    ));
    const maxPlatformWidth = Math.max(minWidth, numberOr(raw.max_platform_width, fallback.max_platform_width));
    const maxFallbackWidth = Math.max(minFallbackWidth, numberOr(
        raw.max_fallback_platform_width,
        fallback.max_fallback_platform_width
    ));
    return {
        enabled: raw.enabled === undefined ? fallback.enabled : Boolean(raw.enabled),
        seed: Math.floor(numberOr(raw.seed, fallback.seed)),
        randomize_seed_each_run: raw.randomize_seed_each_run === undefined
            ? fallback.randomize_seed_each_run
            : Boolean(raw.randomize_seed_each_run),
        chunk_height: Math.max(360, numberOr(raw.chunk_height, fallback.chunk_height)),
        min_rise: minRise,
        max_rise: Math.max(minRise, numberOr(raw.max_rise, fallback.max_rise)),
        min_platform_width: minWidth,
        max_platform_width: maxPlatformWidth,
        min_fallback_platform_width: minFallbackWidth,
        max_fallback_platform_width: maxFallbackWidth,
        visual_stack_probability: Math.max(0, Math.min(1, numberOr(
            raw.visual_stack_probability,
            fallback.visual_stack_probability
        ))),
        visual_stack_short_width: Math.max(80, numberOr(
            raw.visual_stack_short_width,
            fallback.visual_stack_short_width
        )),
        visual_stack_max_layers: Math.max(1, Math.min(2, Math.floor(numberOr(
            raw.visual_stack_max_layers,
            fallback.visual_stack_max_layers
        )))),
        safety_margin: Math.max(0, numberOr(raw.safety_margin, fallback.safety_margin)),
        min_edge_gap: Math.max(0, numberOr(raw.min_edge_gap, fallback.min_edge_gap)),
        recovery_interval: Math.max(2, Math.floor(numberOr(raw.recovery_interval, fallback.recovery_interval))),
        max_attempts: Math.max(1, Math.floor(numberOr(raw.max_attempts, fallback.max_attempts))),
    };
}

function normalizePlatform(raw: any, index: number): BondChasePlatformConfig {
    raw = raw || {};
    const rawType = String(raw.type || "solid").replace(";", "");
    const type = rawType === "fragile" || rawType === "dichi" ? rawType : "solid";
    return {
        id: String(raw.id || raw.stone_id || "platform_" + index),
        type: type,
        x: numberOr(raw.x, 0),
        y: numberOr(raw.y, 0),
        width: Math.max(24, numberOr(raw.width, 160)),
        height: Math.max(12, numberOr(raw.height, 28)),
    };
}

function normalizeTemplate(raw: any, index: number): BondChaseTemplateConfig {
    raw = raw || {};
    const route = Array.isArray(raw.princess_route) ? raw.princess_route : [];
    return {
        id: String(raw.id || "T" + (index + 1)),
        height: Math.max(240, numberOr(raw.height, 720)),
        spawn: raw.spawn || {},
        platforms: (Array.isArray(raw.platforms) ? raw.platforms : []).map((item: any, itemIndex: number) => {
            return normalizePlatform(item, itemIndex);
        }),
        princess_route: route.map((step: any) => {
            const action = String(step && step.action || "wait");
            return {
                action: action === "run" || action === "jump" || action === "wait_guard" ? action : "wait",
                x: numberOr(step && step.x, 0),
                y: numberOr(step && step.y, 0),
                duration: Math.max(0, numberOr(step && step.duration, 0)),
                arc_height: Math.max(0, numberOr(step && step.arc_height, 0)),
                resume_distance: Math.max(0, numberOr(step && step.resume_distance, 180)),
            };
        }),
    };
}

export function normalizeBondChaseConfig(raw: any): BondChaseConfig {
    const fallback = createDefaultBondChaseConfig();
    raw = raw || {};
    const templates = (Array.isArray(raw.templates) ? raw.templates : fallback.templates).map((item: any, index: number) => {
        return normalizeTemplate(item, index);
    });
    const pool = Array.isArray(raw.template_pool) && raw.template_pool.length > 0
        ? raw.template_pool.map((item: any) => String(item))
        : templates.map((item: BondChaseTemplateConfig) => item.id);

    const paceStart = Math.max(0.4, Math.min(0.95, numberOr(raw.princess_pace_start_ratio, fallback.princess_pace_start_ratio)));
    const paceEnd = Math.max(paceStart, Math.min(0.95, numberOr(raw.princess_pace_end_ratio, fallback.princess_pace_end_ratio)));

    return {
        world_width: Math.max(320, numberOr(raw.world_width, fallback.world_width)),
        camera_smooth: Math.max(1, numberOr(raw.camera_smooth, fallback.camera_smooth)),
        princess_pace_start_ratio: paceStart,
        princess_pace_end_ratio: paceEnd,
        princess_pace_ramp_seconds: Math.max(10, numberOr(raw.princess_pace_ramp_seconds, fallback.princess_pace_ramp_seconds)),
        princess_pace_variation: Math.max(0, Math.min(0.1, numberOr(raw.princess_pace_variation, fallback.princess_pace_variation))),
        princess_pace_control_allowance: Math.max(0, Math.min(0.5, numberOr(raw.princess_pace_control_allowance, fallback.princess_pace_control_allowance))),
        water_start: numberOr(raw.water_start, fallback.water_start),
        water_speed: Math.max(0, numberOr(raw.water_speed, fallback.water_speed)),
        water_target_gap: Math.max(80, numberOr(raw.water_target_gap, fallback.water_target_gap)),
        water_guard_clearance: Math.max(40, numberOr(raw.water_guard_clearance, fallback.water_guard_clearance)),
        water_min_speed_scale: Math.max(0, Math.min(1, numberOr(raw.water_min_speed_scale, fallback.water_min_speed_scale))),
        water_max_speed_scale: Math.max(1, numberOr(raw.water_max_speed_scale, fallback.water_max_speed_scale)),
        water_distance_gain: Math.max(0, numberOr(raw.water_distance_gain, fallback.water_distance_gain)),
        water_speed_response: Math.max(0.05, Math.min(5, numberOr(raw.water_speed_response, fallback.water_speed_response))),
        max_chain_distance: Math.max(80, numberOr(raw.max_chain_distance, fallback.max_chain_distance)),
        chain_fail_delay: Math.max(0.1, numberOr(raw.chain_fail_delay, fallback.chain_fail_delay)),
        guard: normalizeCharacter(raw.guard, fallback.guard),
        princess: normalizeCharacter(raw.princess, fallback.princess),
        generator: normalizeGenerator(raw.generator, fallback.generator),
        template_pool: pool,
        templates: templates,
    };
}

export function createDefaultBondChaseConfig(): BondChaseConfig {
    return {
        world_width: 720,
        camera_smooth: 8,
        princess_pace_start_ratio: 0.74,
        princess_pace_end_ratio: 0.9,
        princess_pace_ramp_seconds: 45,
        princess_pace_variation: 0.04,
        princess_pace_control_allowance: 0.15,
        water_start: -140,
        water_speed: 46,
        water_target_gap: 180,
        water_guard_clearance: 90,
        water_min_speed_scale: 0.5,
        water_max_speed_scale: 4,
        water_distance_gain: 3,
        water_speed_response: 0.75,
        max_chain_distance: 330,
        chain_fail_delay: 1,
        guard: {
            speed: 250,
            jump_impulse: 780,
            gravity: -1500,
            width: 50,
            height: 82,
        },
        princess: {
            speed: 220,
            jump_impulse: 0,
            gravity: -1500,
            width: 44,
            height: 76,
        },
        generator: {
            enabled: true,
            seed: 1357911,
            randomize_seed_each_run: true,
            chunk_height: 720,
            min_rise: 120,
            max_rise: 185,
            min_platform_width: 110,
            max_platform_width: 210,
            min_fallback_platform_width: 180,
            max_fallback_platform_width: 240,
            visual_stack_probability: 0.2,
            visual_stack_short_width: 160,
            visual_stack_max_layers: 2,
            safety_margin: 35,
            min_edge_gap: 50,
            recovery_interval: 4,
            max_attempts: 12,
        },
        template_pool: ["T1", "T2", "T3"],
        templates: [
            {
                id: "T1",
                height: 720,
                spawn: { princess: { x: -100, y: 101 }, guard: { x: -20, y: 101 } },
                platforms: [
                    { id: "T1_start", type: "solid", x: 0, y: 40, width: 620, height: 40 },
                    { id: "T1_left", type: "solid", x: -180, y: 210, width: 190, height: 28 },
                    { id: "T1_right", type: "solid", x: 170, y: 330, width: 180, height: 28 },
                    { id: "T1_mid", type: "solid", x: 0, y: 480, width: 180, height: 28 },
                    { id: "T1_exit", type: "solid", x: 80, y: 650, width: 280, height: 34 },
                ],
                princess_route: [
                    { action: "wait", duration: 0.6 },
                    { action: "run", x: -180, y: 252, duration: 1.3 },
                    { action: "jump", x: 170, y: 372, duration: 1.6, arc_height: 110 },
                    { action: "wait_guard", resume_distance: 250 },
                    { action: "run", x: 0, y: 522, duration: 1.2 },
                    { action: "jump", x: 80, y: 692, duration: 1.5, arc_height: 90 },
                    { action: "wait_guard", resume_distance: 230 },
                ],
            },
            {
                id: "T2",
                height: 720,
                platforms: [
                    { id: "T2_low", type: "solid", x: 0, y: 40, width: 300, height: 40 },
                    { id: "T2_right", type: "solid", x: 210, y: 190, width: 170, height: 28 },
                    { id: "T2_left", type: "solid", x: -190, y: 330, width: 170, height: 28 },
                    { id: "T2_fragile", type: "fragile", x: 40, y: 470, width: 145, height: 28 },
                    { id: "T2_exit", type: "solid", x: -80, y: 650, width: 280, height: 34 },
                ],
                princess_route: [
                    { action: "run", x: 210, y: 232, duration: 1.4 },
                    { action: "jump", x: -190, y: 372, duration: 1.7, arc_height: 120 },
                    { action: "wait_guard", resume_distance: 240 },
                    { action: "jump", x: 40, y: 512, duration: 1.5, arc_height: 100 },
                    { action: "wait_guard", resume_distance: 210 },
                    { action: "run", x: -80, y: 692, duration: 1.2 },
                ],
            },
            {
                id: "T3",
                height: 720,
                platforms: [
                    { id: "T3_low", type: "solid", x: 0, y: 40, width: 350, height: 40 },
                    { id: "T3_mid_left", type: "solid", x: -210, y: 220, width: 150, height: 28 },
                    { id: "T3_mid_right", type: "solid", x: 210, y: 370, width: 150, height: 28 },
                    { id: "T3_high", type: "solid", x: -30, y: 520, width: 190, height: 28 },
                    { id: "T3_exit", type: "solid", x: 120, y: 650, width: 250, height: 34 },
                ],
                princess_route: [
                    { action: "jump", x: -210, y: 262, duration: 1.5, arc_height: 110 },
                    { action: "wait_guard", resume_distance: 230 },
                    { action: "jump", x: 210, y: 412, duration: 1.7, arc_height: 120 },
                    { action: "wait_guard", resume_distance: 230 },
                    { action: "jump", x: -30, y: 562, duration: 1.6, arc_height: 105 },
                    { action: "wait_guard", resume_distance: 220 },
                    { action: "run", x: 120, y: 692, duration: 1.1 },
                ],
            },
        ],
    };
}
