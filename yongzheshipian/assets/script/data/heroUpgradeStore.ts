import { JsonAsset, resources } from 'cc';
import { load, save } from '../utils/tools';

export interface HeroUpgradeConfig {
    level: number;
    stepBonus: number;
    initialBrightness: number;
    goldCost: number;
}

export class HeroUpgradeStore {
    private static readonly HERO_UPGRADE_LEVEL_KEY = 'heroUpgradeLevel';
    private static readonly DEFAULT_INITIAL_BRIGHTNESS = 15;
    private static configs: HeroUpgradeConfig[] = [];
    private static loadPromise: Promise<HeroUpgradeConfig[]> | null = null;

    static async ensureLoaded(): Promise<HeroUpgradeConfig[]> {
        if (this.configs.length > 0) {
            return this.configs;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = new Promise((resolve) => {
            resources.load<JsonAsset>('config/heroUpgrade', (err, asset) => {
                if (!err && asset) {
                    this.configs = asset.json as HeroUpgradeConfig[];
                } else {
                    this.configs = [];
                    console.warn('[HeroUpgradeStore] Failed to load config/heroUpgrade', err);
                }

                const result = this.configs;
                this.loadPromise = null;
                resolve(result);
            });
        });

        return this.loadPromise;
    }

    static setConfigs(configs: HeroUpgradeConfig[]) {
        this.configs = configs || [];
    }

    static getConfigs(): HeroUpgradeConfig[] {
        return this.configs;
    }

    static getMaxLevel(): number {
        return this.configs.length;
    }

    static getCurrentLevel(): number {
        const savedLevel = load(this.HERO_UPGRADE_LEVEL_KEY, 1);
        const maxLevel = this.getMaxLevel();

        if (savedLevel !== null && savedLevel >= 1 && (maxLevel <= 0 || savedLevel <= maxLevel)) {
            return savedLevel;
        }

        save(this.HERO_UPGRADE_LEVEL_KEY, 1);
        return 1;
    }

    static setCurrentLevel(level: number) {
        save(this.HERO_UPGRADE_LEVEL_KEY, level);
    }

    static getConfigByLevel(level: number): HeroUpgradeConfig | null {
        if (this.configs.length === 0) {
            return null;
        }

        return this.configs.find((config) => config.level === level) || this.configs[0] || null;
    }

    static getCurrentConfig(): HeroUpgradeConfig | null {
        return this.getConfigByLevel(this.getCurrentLevel());
    }

    static getNextConfig(): HeroUpgradeConfig | null {
        const currentLevel = this.getCurrentLevel();
        const maxLevel = this.getMaxLevel();

        if (this.configs.length === 0 || currentLevel >= maxLevel) {
            return null;
        }

        return this.getConfigByLevel(currentLevel + 1);
    }

    static getCurrentStepBonus(): number {
        return this.getCurrentConfig()?.stepBonus ?? 0;
    }

    static getCurrentInitialBrightness(): number {
        return this.getCurrentConfig()?.initialBrightness ?? this.DEFAULT_INITIAL_BRIGHTNESS;
    }
}
