import { Component, resources, SpriteAtlas, Texture2D } from "cc";
import { ILevel, ITitle } from "../../Levels"
import Singleton from "./Singleton"

export default class ResourceLoadMgr extends Singleton {
    static get Instance() {
        // super()
        return super.getInstance<ResourceLoadMgr>()
    }

    loadRes(path: string, type = SpriteAtlas) {
        return new Promise<SpriteAtlas>((resolve, reject) => {
            // resources.loadDir("texture/tile/tile", SpriteFrame, function (err, assets) {
            //     if (!err) {
            //         resolve(assets)
            //         return
            //     } else {
            //         console.log(err)
            //         reject(false)
            //     }
            // });
            resources.load(path, type, (err, atlas) => {
                if (!err) {
                    resolve(atlas)
                    return
                } else {
                    console.log(err)
                    reject(false)
                }
            });
        })
    }
}