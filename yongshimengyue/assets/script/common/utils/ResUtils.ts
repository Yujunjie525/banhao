import { Define } from "../const/Define";
import { QuickTool } from "./UtilsToolkit";

export default class ResUtils {

    private static getBundle(url: string): cc.AssetManager.Bundle {
        let bundle: cc.AssetManager.Bundle = null;
        if (url.startsWith("resources:")) {
            bundle = cc.resources;
        } else if (/.+:.*/.test(url)) {
            bundle = cc.assetManager.getBundle(url.replace(/:.*/, "").trim());
        } else {
            bundle = cc.resources;
        }
        if (QuickTool.isNull(bundle)) cc.error(`Error: When get bundle[url = ${url}].`);
        return bundle;
    }

    private static parseUrl(url: string): string {
        let idx: number = url.indexOf(":");
        if (idx < 0) cc.warn(`Warn: ${url} should has [flag:].`);
        if (idx < 0) return url.trim();
        else return url.substring(idx + 1);
    }

    public static getAsset<T extends cc.Asset>(url: string, type?: typeof cc.Asset): T {
        return this.getBundle(url).get(this.parseUrl(url), type) as T;
    }

    public static loadAsset<T extends cc.Asset>(url: string, type?: typeof cc.Asset, onComplete?: (error: Error, assets: T | T[]) => void, onProgress?: (finish?: number, total?: number, item?: cc.AssetManager.RequestItem) => void) {
        this.getBundle(url).load<T>(this.parseUrl(url), type, onProgress, onComplete);
    }

    /**
     * 获取配置数据
     * @param name 
     */
    public static getJsonAssets(name: string): cc.JsonAsset {
        return cc.loader.getRes(Define.RES_JSON_URL + name, cc.JsonAsset);
    }

    /**
     * 获取prefab资源
     * @param name 
     */
    public static getPrefabAssets(name: string): cc.Prefab {
        return this.getAsset<cc.Prefab>(name, cc.Prefab);
    }

    /**
     * 获取音乐mp3资源
     * @param name 
     */
    public static getMusicAssets(name: string): cc.AudioClip {
        return this.getAsset<cc.AudioClip>(name, cc.AudioClip);
    }

    /**
     * 获取ui图集资源
     * @param name 
     */
    public static getAtlasSpriteFrame(atlas_name: string, img_name: string) {
        let atlas = this.getAsset<cc.SpriteAtlas>(atlas_name, cc.SpriteAtlas);
        if (atlas) {
            return atlas.getSpriteFrame(img_name);
        }
    }

    /**
     * 获取单张资源
     * @param path 
     */
    public static getSpriteFrame(path: string) {
        let frame = this.getAsset<cc.SpriteFrame>(path, cc.SpriteFrame);
        return frame;
    }
}