import {
    BondChaseConfig,
    BondChasePlatformConfig,
    BondChaseRouteStep,
    BondChaseTemplateConfig,
} from "./BondChaseTypes";

interface WorldPlatform {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visual_layers?: number;
}

export default class BondChaseGenerator {
    private readonly config: BondChaseConfig;
    private randomState: number;
    private lastPlatform: WorldPlatform = null;
    private lastPrincessX: number = 0;
    private hasPrincessPoint: boolean = false;
    private generatedPlatformCount: number = 0;

    public constructor(config: BondChaseConfig) {
        this.config = config;
        const seed = Math.floor(Number(config.generator.seed) || 1);
        this.randomState = seed >>> 0;
        if (this.randomState === 0) {
            this.randomState = 1;
        }
    }

    public generateChunk(chunkIndex: number, worldY: number): BondChaseTemplateConfig {
        const generator = this.config.generator;
        const platforms: BondChasePlatformConfig[] = [];
        const route: BondChaseRouteStep[] = [];
        const entryPlatform = this.lastPlatform;
        const entryPrincess = entryPlatform
            ? {
                x: this.hasPrincessPoint ? this.lastPrincessX : entryPlatform.x,
                y: entryPlatform.y - worldY + entryPlatform.height / 2 + this.config.princess.height / 2,
            }
            : { x: -80, y: 98 };

        let spawn: BondChaseTemplateConfig["spawn"] = {
            princess: entryPrincess,
        };

        if (!this.lastPlatform) {
            const startPlatform: WorldPlatform = {
                id: "PROC_START",
                x: 0,
                y: worldY + 40,
                width: Math.min(460, this.config.world_width - 80),
                height: 40,
            };
            platforms.push(this.toLocalPlatform(startPlatform, worldY));
            this.lastPlatform = startPlatform;
            this.lastPrincessX = -80;
            this.hasPrincessPoint = true;
            spawn = {
                princess: {
                    x: -80,
                    y: startPlatform.y - worldY + startPlatform.height / 2 + this.config.princess.height / 2,
                },
                guard: {
                    x: -10,
                    y: startPlatform.y - worldY + startPlatform.height / 2 + this.config.guard.height / 2,
                },
            };
        }

        const chunkTop = worldY + generator.chunk_height;
        const targetTopMargin = 68;
        while (this.lastPlatform.y < chunkTop - targetTopMargin) {
            const remaining = chunkTop - targetTopMargin - this.lastPlatform.y;
            if (remaining < generator.min_rise) {
                break;
            }

            let rise = this.randomRange(generator.min_rise, generator.max_rise);
            if (rise > remaining) {
                rise = remaining;
            }
            const recovery = this.generatedPlatformCount > 0
                && this.generatedPlatformCount % generator.recovery_interval === 0;
            const next = this.generateReachablePlatform(chunkIndex, rise, recovery);
            platforms.push(this.toLocalPlatform(next, worldY));
            this.appendPrincessTransition(route, next, worldY, recovery);
            this.lastPlatform = next;
            this.generatedPlatformCount += 1;
        }

        return {
            id: "PROC_" + this.padNumber(chunkIndex, 4),
            height: generator.chunk_height,
            spawn: spawn,
            platforms: platforms,
            princess_route: route,
        };
    }

    public calculateSafeHorizontalGap(rise: number): number {
        const landingTime = this.calculateGuardLandingTime(rise);
        if (landingTime <= 0) {
            return 0;
        }
        const theoreticalReach = this.config.guard.speed * landingTime;
        return Math.max(0, theoreticalReach - this.config.generator.safety_margin);
    }

    private calculateGuardLandingTime(rise: number): number {
        const guard = this.config.guard;
        const gravity = Math.abs(guard.gravity);
        const discriminant = guard.jump_impulse * guard.jump_impulse - 2 * gravity * rise;
        if (gravity <= 0 || discriminant <= 0) {
            return 0;
        }
        return (guard.jump_impulse + Math.sqrt(discriminant)) / gravity;
    }

    private generateReachablePlatform(chunkIndex: number, centerRise: number, recovery: boolean): WorldPlatform {
        const generator = this.config.generator;
        const previous = this.lastPlatform;
        const height = 28;
        const targetY = previous.y + centerRise;
        const topRise = targetY + height / 2 - (previous.y + previous.height / 2);
        const safeGap = this.calculateSafeHorizontalGap(topRise);

        for (let attempt = 0; attempt < generator.max_attempts; attempt++) {
            const width = recovery
                ? generator.max_platform_width
                : this.randomRange(generator.min_platform_width, generator.max_platform_width);
            const maxGap = recovery ? Math.min(safeGap, 70) : safeGap;
            const minGap = Math.min(generator.min_edge_gap, maxGap);
            const edgeGap = this.randomRange(minGap, Math.max(minGap, maxGap));
            const direction = this.pickDirection(previous.x);
            const centerDistance = previous.width / 2 + width / 2 + edgeGap;
            const unclampedX = previous.x + direction * centerDistance;
            const x = this.clampPlatformX(unclampedX, width);
            const actualGap = this.getEdgeGap(previous, x, width);
            const centerShift = Math.abs(x - previous.x);
            const arcHeight = Math.max(70, centerRise * 0.72);
            const maxPathDistance = this.getPrincessPathMaxDistance(
                x - previous.x,
                topRise,
                arcHeight
            );
            const chainBudget = this.config.max_chain_distance * 0.92;

            if (actualGap <= safeGap + 0.01
                && maxPathDistance <= chainBudget
                && (recovery || centerShift >= 70)) {
                return {
                    id: "PROC_" + chunkIndex + "_" + this.generatedPlatformCount,
                    x: x,
                    y: targetY,
                    width: width,
                    height: height,
                    visual_layers: this.pickVisualStackLayers(width),
                };
            }
        }

        const fallbackWidth = this.randomRange(
            generator.min_fallback_platform_width,
            generator.max_fallback_platform_width
        );
        return {
            id: "PROC_" + chunkIndex + "_SAFE_" + this.generatedPlatformCount,
            x: this.clampPlatformX(previous.x, fallbackWidth),
            y: targetY,
            width: fallbackWidth,
            height: height,
            visual_layers: 0,
        };
    }

    private pickVisualStackLayers(width: number): number {
        const generator = this.config.generator;
        if (width > generator.visual_stack_short_width
            || this.nextRandom() >= generator.visual_stack_probability) {
            return 0;
        }
        return 1 + Math.floor(this.nextRandom() * generator.visual_stack_max_layers);
    }

    private appendPrincessTransition(
        route: BondChaseRouteStep[],
        target: WorldPlatform,
        worldY: number,
        recovery: boolean
    ): void {
        const current = this.lastPlatform;
        const direction = this.getHorizontalDirection(target.x - current.x);
        const takeoffX = current.x + direction * current.width / 4;
        const currentStandingY = current.y - worldY + current.height / 2 + this.config.princess.height / 2;
        const currentPrincessX = this.hasPrincessPoint ? this.lastPrincessX : current.x;
        const runDistance = Math.abs(takeoffX - currentPrincessX);

        if (runDistance > 1) {
            route.push({
                action: "run",
                x: takeoffX,
                y: currentStandingY,
                duration: Math.max(0.05, runDistance / Math.max(1, this.config.guard.speed)),
            });
        }

        const landingX = target.x - direction * target.width / 4;
        route.push(this.createPrincessJump(current, target, landingX, worldY));
        if (recovery) {
            route.push({
                action: "wait_guard",
                resume_distance: this.config.max_chain_distance * 0.7,
            });
        }
        this.lastPrincessX = landingX;
        this.hasPrincessPoint = true;
    }

    private createPrincessJump(
        previous: WorldPlatform,
        target: WorldPlatform,
        landingX: number,
        worldY: number
    ): BondChaseRouteStep {
        const rise = target.y + target.height / 2 - (previous.y + previous.height / 2);
        const guardLandingTime = this.calculateGuardLandingTime(rise);
        const referenceDuration = guardLandingTime > 0
            ? guardLandingTime + this.config.princess_pace_control_allowance
            : 1;
        return {
            action: "jump",
            x: landingX,
            y: target.y - worldY + target.height / 2 + this.config.princess.height / 2,
            duration: Math.max(0.65, Math.min(1.4, referenceDuration)),
            arc_height: Math.max(70, rise * 0.72),
        };
    }

    private getHorizontalDirection(deltaX: number): number {
        if (deltaX > 1) {
            return 1;
        }
        if (deltaX < -1) {
            return -1;
        }
        return 0;
    }

    private toLocalPlatform(platform: WorldPlatform, worldY: number): BondChasePlatformConfig {
        return {
            id: platform.id,
            type: "solid",
            x: platform.x,
            y: platform.y - worldY,
            width: platform.width,
            height: platform.height,
            visual_layers: platform.visual_layers,
        };
    }

    private pickDirection(currentX: number): number {
        const halfWidth = this.config.world_width / 2;
        if (currentX > halfWidth * 0.45) {
            return -1;
        }
        if (currentX < -halfWidth * 0.45) {
            return 1;
        }
        return this.nextRandom() < 0.5 ? -1 : 1;
    }

    private clampPlatformX(value: number, width: number): number {
        const halfWorld = this.config.world_width / 2;
        const halfPlatform = width / 2;
        return Math.max(-halfWorld + halfPlatform, Math.min(halfWorld - halfPlatform, value));
    }

    private getEdgeGap(previous: WorldPlatform, targetX: number, targetWidth: number): number {
        const centerDistance = Math.abs(targetX - previous.x);
        return Math.max(0, centerDistance - previous.width / 2 - targetWidth / 2);
    }

    private getPrincessPathMaxDistance(horizontalDelta: number, verticalDelta: number, arcHeight: number): number {
        let maxDistance = 0;
        for (let i = 0; i <= 12; i++) {
            const progress = i / 12;
            const x = horizontalDelta * progress;
            const y = verticalDelta * progress + 4 * progress * (1 - progress) * arcHeight;
            maxDistance = Math.max(maxDistance, Math.sqrt(x * x + y * y));
        }
        return maxDistance;
    }

    private randomRange(min: number, max: number): number {
        if (max <= min) {
            return min;
        }
        return min + (max - min) * this.nextRandom();
    }

    private nextRandom(): number {
        // 乘积仍低于 JavaScript 安全整数范围，使用普通乘法兼容旧运行环境。
        this.randomState = (this.randomState * 1664525 + 1013904223) >>> 0;
        return this.randomState / 4294967296;
    }

    private padNumber(value: number, length: number): string {
        let text = String(Math.max(0, Math.floor(value)));
        while (text.length < length) {
            text = "0" + text;
        }
        return text;
    }
}
