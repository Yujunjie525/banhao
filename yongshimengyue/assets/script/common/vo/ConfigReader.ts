import MasterGlobal from "../MasterGlobal";

export class ConfigReader {
    public get level(): number {
        return Number(MasterGlobal.level) || 1;
    }

    public get difficulty(): number {
        return Number(MasterGlobal.difficulty) || this.level;
    }

    public get gameConfig(): any {
        return MasterGlobal.config ? (MasterGlobal.config.gameConfig || {}) : {};
    }

    public get maxLevel(): any {
        const configs = this.mapConfig;
        return configs.length > 0 ? configs.length : 1;
    }

    public get curLevel(): any {
        return this.level;
    }

    public get titleConfig(): any {
        return this.gameConfig.titleConfig || {};
    }

    public get titleBgOpacity(): any {
        return this.titleConfig.titleBgOpacity;
    }

    public get titleTxtColor(): any {
        return this.titleConfig.titleTxtColor;
    }

    public get titleBgColor(): any {
        return this.titleConfig.titleBgColor;
    }

    public get myGameConfig(): any {
        return this.gameConfig.myGameConfig || {};
    }

    public get itemDelayTime(): any {
        return this.myGameConfig.itemDelayTime;
    }

    public get DurationTime(): any {
        return this.myGameConfig.DurationTime;
    }

    public get round(): any {
        return this.gameConfig.round;
    }

    public get name(): any {
        return this.gameConfig.name;
    }

    public get timedown(): any {
        return this.gameConfig.timedown || {};
    }

    public get val(): any {
        return this.timedown.val;
    }

    public get color(): any {
        return this.timedown.color;
    }

    public get musicStart(): any {
        return this.timedown.musicStart;
    }

    public get musicEnd(): any {
        return this.timedown.musicEnd;
    }

    public get guideMsg(): any[] {
        return this.gameConfig.guideMsg || [];
    }

    public get nameConfig(): any {
        return this.gameConfig.nameConfig || {};
    }

    public get nameBgColor(): any {
        return this.nameConfig.nameBgColor;
    }

    public get nameTxtColor(): any {
        return this.nameConfig.nameTxtColor;
    }

    public get nameBgOpacity(): any {
        return this.nameConfig.nameBgOpacity;
    }

    public get version(): any {
        return this.gameConfig.version;
    }

    public get musicBg(): any {
        return this.gameConfig.musicBg;
    }

    public get timeout(): any {
        const intervals = this.currentMapConfig.wave_intervals;
        if (Array.isArray(intervals) && intervals.length > 0) {
            return intervals.reduce((sum, item) => sum + (Number(item) || 0), 0);
        }
        return this.gameConfig.timeout;
    }

    public get time(): any {
        return this.timeout || "";
    }

    public get diff(): any {
        return this.level;
    }

    public get goodsScore(): any {
        return Number(this.currentMapConfig.soul_stone_reward) || 0;
    }

    public get map(): any {
        return this.currentMapIndex;
    }

    public get totalScore(): any {
        const waves = this.currentMapConfig.monsters_per_wave;
        if (Array.isArray(waves)) {
            return waves.reduce((sum, item) => sum + (Number(item) || 0), 0);
        }
        return 0;
    }

    public get trainCount(): any {
        return 0;
    }

    public get errorScore(): any {
        return 0;
    }

    public get lv(): any {
        return this.mapId;
    }

    public get levelTitle(): any {
        return this.currentMapConfig.level_name || `Level ${this.mapId}`;
    }

    public get mapConfig(): any[] {
        const levelsAsset = cc.resources.get("config/levels", cc.JsonAsset) as cc.JsonAsset;
        if (levelsAsset && levelsAsset.json && Array.isArray(levelsAsset.json.levels)) {
            return levelsAsset.json.levels;
        }
        return [];
    }

    public get road(): any[] {
        return this.currentMapConfig.road || [];
    }

    public get goods(): any[] {
        return this.currentMapConfig.goods || [];
    }

    public get boss(): number {
        const bossConfig = this.currentMapConfig.boss_config;
        if (Array.isArray(bossConfig)) {
            return bossConfig.length;
        }
        return bossConfig ? 1 : 0;
    }

    public get gold(): number {
        return Math.max(0, Number(this.currentMapConfig.soul_stone_reward) || 0);
    }

    public get monster(): string {
        const ids = this.currentMapConfig.monster_ids;
        return Array.isArray(ids) ? `${ids[0] || ""}` : "";
    }

    public get monster2(): string {
        const ids = this.currentMapConfig.monster_ids;
        return Array.isArray(ids) ? `${ids[1] || ""}` : "";
    }

    public get totalGoodsCount(): number {
        return 0;
    }

    public get mapId(): any {
        const current = this.currentMapConfig;
        if (current && current.mapId != null) {
            return Number(current.mapId);
        }
        const match = String(current && current.level_id || "").match(/\d+/);
        return match ? parseInt(match[0], 10) || this.level : this.level;
    }

    public get mapIcon(): number {
        const current = this.currentMapConfig;
        return Math.max(1, Number(current && (current.mapIcon || current.map_icon || current.stage_icon)) || 1);
    }

    public get roadChange(): any[] {
        return this.currentMapConfig.roadChange || [];
    }

    public get train(): any[] {
        return this.currentMapConfig.train || [];
    }

    private get currentMapIndex(): number {
        const configs = this.mapConfig;
        if (!Array.isArray(configs) || configs.length <= 0) {
            return 0;
        }

        const index = this.level - 1;
        return Math.max(0, Math.min(configs.length - 1, index));
    }

    private get currentMapConfig(): any {
        const configs = this.mapConfig;
        if (!Array.isArray(configs) || configs.length <= 0) {
            return {};
        }
        return configs[this.currentMapIndex] || {};
    }
}

let cfg = new ConfigReader();

export default cfg;
