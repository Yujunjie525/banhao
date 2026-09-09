import { Define } from "../const/Define";
import { CallbackTask, TaskPool } from "../utils/TaskToolkit";
import ResAttr from "../vo/ResAttr";

class ResLoader {

    private _taskPool: TaskPool;

    constructor() {
        this._taskPool = new TaskPool();
    }

    public loadResList(resList: Array<ResAttr>, completeCallback?: (total?: number)=>void, progressCallback?: (finish: number, total: number, progress?: number)=>void): void {
        let total = resList.length;
        let finish = 0;
        resList.sort((a, b) => -(a.type == Define.RES_TYPE_BUNDLE));
        resList.forEach(resAttr => {
            this.loadRes(resAttr, (asset: cc.Asset) => {
                progressCallback && progressCallback(++ finish, total, total == 0 ? 0.0 : (finish / total));
            });
        });
        this._taskPool.push(new CallbackTask(callback => {
            callback();
            this._taskPool.stop();
            completeCallback && completeCallback(total);
        }));
    }

    public loadRes(resAttr: ResAttr, completeCallback?: (asset: cc.Asset | cc.AssetManager.Bundle)=>void) {
        this._taskPool.push(new CallbackTask(callback => {
            let type: typeof cc.Asset | typeof cc.AssetManager.Bundle;
            switch (resAttr.type) {
                case Define.RES_TYPE_BUNDLE: type = cc.AssetManager.Bundle; break;
                case Define.RES_TYPE_BMFONT: type = cc.BitmapFont; break;
                case Define.RES_TYPE_JSON: type = cc.JsonAsset; break;
                case Define.RES_TYPE_ATLAS: type = cc.SpriteAtlas; break;
                case Define.RES_TYPE_FRAME: type = cc.SpriteFrame; break;
                case Define.RES_TYPE_PREFAB: type = cc.Prefab; break;
                case Define.RES_TYPE_MP3: type = cc.AudioClip; break;
                case Define.RES_TYPE_ANIMCLIP: type = cc.AnimationClip; break;
                default: type = cc.Asset; break;
            }

            if (type === cc.AssetManager.Bundle) {
                cc.assetManager.loadBundle(resAttr.name, (err: Error, asset: cc.AssetManager.Bundle) => {
                    if (err) {
                        throw new Error(`Error: When load bundle[${resAttr.name}].`);
                    } else {
                        completeCallback && completeCallback(asset);
                        callback();
                    }
                });
            } else {
                let url: string = resAttr.url + resAttr.name;
                let bundle: cc.AssetManager.Bundle;
                if (new RegExp(/.*:.*/).test(url)) {
                    bundle = cc.assetManager.getBundle(url.substring(0, url.indexOf(":")));
                    url = url.substring(url.indexOf(":") + 1);
                } else {
                    bundle = cc.resources;
                }
                bundle.load(url, type as typeof cc.Asset, (err: Error, asset: cc.Asset) => {
                    if (err) {
                        throw new Error(`Error: When load res[${resAttr.url + resAttr.name}]`);
                    } else {
                        completeCallback && completeCallback(asset);
                        callback();
                    }
                })
            }
           
        }));
    }

}

export let resLoader: ResLoader = new ResLoader();

