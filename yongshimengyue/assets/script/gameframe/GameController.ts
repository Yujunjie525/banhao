import { ViewZorder } from "../common/const/ViewZOrder";
import { httpServer } from "../common/manager/HttpServer";
import MasterGlobal from "../common/MasterGlobal";
import UIHelp from "../common/utils/UIHelp";
import { Package, PackageType } from "./data/const/DefineConst";
import UILoading from "./logic/ui/common/UILoading";
import UIFrame from "./logic/ui/prefab/UIFrame";
import { lyx_bridge } from "./manager/LYXBridge";
import simpleFrameBridge from "./SimpleFrameBridge";

class GameController {
    public gameId = 0;
    public curLevel = 1;
    public mode = 0;
    public requestUrl = "";
    public planId = 1003230;
    public token: string = null;
    public hiddenBack = 0;
    public config: any = null;
    public loadingCallback: Function = null;

    public init(): void {
        this.loadingCallback = () => this.gameStart();
        cc.resources.load("config/levels", cc.JsonAsset, () => {
            setTimeout(() => {
                this.getGameConfig();
            }, 0);
        });
    }

    public getGameGonfig(): void {
        this.getGameConfig();
    }

    public getGameConfig(): void {
        if (Package.TYPE === PackageType.DEV || Package.TYPE === PackageType.WEB) {
            this.getCommonConfig();
            return;
        }

        if (Package.TYPE === PackageType.APP) {
            if (!lyx_bridge.isWebViewJavascriptBridge()) {
                this.getCommonConfig();
                return;
            }
            lyx_bridge.getParams((res) => {
                try {
                    const data = JSON.parse(res || "{}");
                    this.gameId = Number(data.gameid) || 0;
                    this.curLevel = Number(data.level) || 1;
                    this.mode = Number(data.mode) || 0;
                    this.requestUrl = data.requesturl || "";
                    this.planId = Number(data.planid) || 0;
                    this.token = data.token || "";
                    this.hiddenBack = Number(data.hiddenBack) || 0;
                    if (this.requestUrl) {
                        httpServer.setMainUrl(this.requestUrl + "api/");
                    }
                    if (this.token) {
                        httpServer.setToken(this.token);
                    }
                } catch (error) {
                    cc.warn("GameController.getGameConfig parse failed", error);
                }
                this.updateServerConfig();
            }, () => this.getCommonConfig());
            return;
        }

        if (Package.TYPE === PackageType.WX) {
            this.curLevel = 1;
            this.refreshCurrentConfig();
            this.gameStart();
        }
    }

    public getCommonConfig(): void {
        let level = -1;
        if (typeof window !== "undefined" && window.location && window.location.href) {
            const queryIndex = window.location.href.indexOf("?");
            if (queryIndex >= 0) {
                const query = window.location.href.substring(queryIndex + 1);
                query.split("&").forEach((part) => {
                    const kv = part.split("=");
                    if (kv[0] === "level" && kv[1] != null) {
                        level = parseInt(kv[1], 10);
                    }
                });
            }
        }

        this.curLevel = level === -1 ? 1 : level;
        this.refreshCurrentConfig();
        this.loadingCallback && this.loadingCallback();
    }

    public updateServerConfig(): void {
        this.refreshCurrentConfig();
        this.loadingCallback && this.loadingCallback();
    }

    public refreshCurrentConfig(level?: number): void {
        if (level != null) {
            this.curLevel = level;
        }
        this.curLevel = this.clampLevel(this.curLevel);
        MasterGlobal.level = this.curLevel;
        this.config = this.buildRuntimeConfig(this.curLevel);
    }

    public buildRuntimeConfig(level: number): any {
        const levelConfigs = this.getLevelConfigs();
        const index = Math.max(0, Math.min(levelConfigs.length - 1, level - 1));
        const levelConfig = levelConfigs[index] || {};
        const mapId = Number(levelConfig.level || this.parseLevelId(levelConfig.level_id)) || level;
        const levelName = levelConfig.level_name || `Level ${mapId}`;

        return Object.assign({}, levelConfig, {
            lv: mapId,
            level,
            mapId,
            levelTitle: levelName,
        });
    }

    private clampLevel(level: number): number {
        const maxLevel = this.getAvailableMaxLevel();
        let result = Number(level) || 1;
        if (result <= 0) result = 1;
        if (result > maxLevel) result = maxLevel;
        return result;
    }

    private getAvailableMaxLevel(): number {
        const levels = this.getLevelConfigs();
        if (levels.length > 0) {
            return levels.length;
        }
        return 1;
    }

    private getLevelConfigs(): any[] {
        const levelsAsset = cc.resources.get("config/levels", cc.JsonAsset) as cc.JsonAsset;
        return levelsAsset && levelsAsset.json && Array.isArray(levelsAsset.json.levels)
            ? levelsAsset.json.levels
            : [];
    }

    private parseLevelId(levelId: string): number {
        const match = String(levelId || "").match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    public gameStart(): void {
        simpleFrameBridge.sendMessage("initgame", () => {
            lyx_bridge.sendState("loading:1");
            lyx_bridge.sendState("loaded");
            UIHelp.CloseUI(UILoading);
            UIHelp.ShowUI(UIFrame, ViewZorder.Float);
        });
    }

    public nextGameLevel(): void {
        this.refreshCurrentConfig(this.curLevel + 1);
    }
}

export default new GameController();
