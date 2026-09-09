import { _decorator, assetManager, AssetManager, AudioClip, Component, JsonAsset, Node, resources } from 'cc';
import { resPath } from '../data/enmus';
import { loadPool } from './loadPool';
const { ccclass, property } = _decorator;

@ccclass('loadRes')
export class loadRes extends Component {
    // 资源是否加载完成
    isRes: boolean = false;
    // 存储加载的所有资源
    allBundleRes: { [key: string]: AssetManager.Bundle } = {};
    // 储存Json
    allJson: { [key: string]: any } = {};

    /**
     * 单例
     */
    private static _ins: loadRes = null;
    public static get ins() {
        if (!this._ins) {
            this._ins = new loadRes();
        }
        return this._ins;
    }
    /**
     * 加载bundle中的资源
     */
    async loadBundle(name: string) {
        assetManager.loadBundle(name, (err: string, budle: AssetManager.Bundle) => {
            if (budle) {
                this.allBundleRes[1] = budle;
                this.isRes = true;
            } else {
                console.log('资源加载失败' + err);
            }
        });
    }

    /**
     * 指定的资源包中加载不同类型的游戏资源，并将这些资源分配到相应的集合中进行管理和使用
     */
    async resLoad(type: { type: any; path: any }) {
        //新声明一个方法，方便自调用，用于判断需要的资源是否加载完成，没有的话重新调用
        const startLoad = () => {
            // isRes为true代表总资源包加载完成
            if (this.isRes) {
                try {
                    this.allBundleRes[1].loadDir(
                        type.path,
                        type.type,
                        (err: any, assets: any[]) => {
                            if (assets) {
                                let linShiAss = null;
                                switch (type) {
                                    // 玩家及场景元素预制体
                                    case resPath.itemsPre:
                                        for (let i = 0; i < assets.length; i++) {
                                            linShiAss = assets[i];
                                            const name = linShiAss.data.name as string;
                                            loadPool.ins.setPrefab(name, linShiAss);
                                        }
                                        break;
                                    // ui预制体资源
                                    case resPath.uiPre:
                                        for (let i = 0; i < assets.length; i++) {
                                            linShiAss = assets[i];
                                            const name = linShiAss.data.name as string;
                                            loadPool.ins.setPrefab(name, linShiAss);
                                        }
                                        break;
                                    // json资源
                                    case resPath.json:
                                        for (let i = 0; i < assets.length; i++) {
                                            linShiAss = assets[i];
                                            if (!this.allJson[linShiAss.name]) {
                                                this.allJson[linShiAss.name] = linShiAss.json;
                                            }
                                        }
                                        break;
                                }
                            } else {
                                console.log(err);
                            }
                        }
                    );
                } catch (err) {
                    console.log('分载资源问题：' + err);
                }
            } else {
                //1秒后调用
                this.scheduleOnce(() => {
                    startLoad();
                }, 1);
            }
        };
        //第一次执行
        startLoad();
    }
    /**
     * 获取Json数据
     */
    public getJson(name: string) {
        return this.allJson[name];
    }
    /**
     * 获取音乐数据（从resources目录加载）
     */
    public async getClip(name: string): Promise<AudioClip> {
        return new Promise((resolve, reject) => {
            // 尝试多种路径格式
            const paths = [`music/${name}`, `music/${name}.mp3`, `music/${name}.ogg`];
            let currentIndex = 0;
            
            const tryLoad = () => {
                if (currentIndex >= paths.length) {
                    console.error(`所有路径都加载失败: ${name}`);
                    reject(new Error(`所有路径都加载失败: ${name}`));
                    return;
                }
                
                const path = paths[currentIndex];
                currentIndex++;
                
                console.log(`尝试加载音频: ${path}`);
                resources.load(path, AudioClip, (err: Error, clip: AudioClip) => {
                    if (err) {
                        console.warn(`加载路径失败: ${path}`, err);
                        tryLoad(); // 尝试下一个路径
                    } else {
                        console.log(`成功加载音频: ${path}`);
                        resolve(clip);
                    }
                });
            };
            
            tryLoad();
        });
    }
}