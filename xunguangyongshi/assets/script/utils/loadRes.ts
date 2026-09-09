import { _decorator, assetManager, AssetManager, AudioClip, Component } from 'cc';
import { nodePool } from './nodePool';
import { loadPool } from '../../scripts/res/loadPool';

const { ccclass } = _decorator;

@ccclass('loadRes')
export class loadRes extends Component {
    isRes = false;
    allBundleRes: { [key: string]: AssetManager.Bundle } = {};
    allMusic: { [key: string]: AudioClip } = {};

    private static _ins: loadRes = null;
    private bundlePromise: Promise<AssetManager.Bundle> | null = null;

    public static get ins() {
        if (!this._ins) {
            this._ins = new loadRes();
        }
        return this._ins;
    }

    async loadBundle(name: string) {
        return this.ensureBundle(name);
    }

    async resLoad(type: { type: any; path: string }) {
        try {
            const bundle = await this.ensureBundle('bundles');
            bundle.loadDir(type.path, type.type, (err: any, assets: any[]) => {
                if (!assets) {
                    console.log(err);
                    return;
                }

                for (let i = 0; i < assets.length; i++) {
                    this.cacheLoadedAsset(type.path, assets[i]);
                }
            });
        } catch (err) {
            console.log('分载资源问题：' + err);
        }
    }

    public getClip(name: string) {
        return this.allMusic[name];
    }

    private ensureBundle(name: string): Promise<AssetManager.Bundle> {
        const loaded = assetManager.getBundle(name);
        if (loaded) {
            this.allBundleRes[1] = loaded;
            this.isRes = true;
            return Promise.resolve(loaded);
        }

        if (this.bundlePromise) {
            return this.bundlePromise;
        }

        this.bundlePromise = new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (err || !bundle) {
                    this.bundlePromise = null;
                    reject(err || new Error(`load bundle failed: ${name}`));
                    return;
                }

                this.allBundleRes[1] = bundle;
                this.isRes = true;
                resolve(bundle);
            });
        });

        return this.bundlePromise;
    }

    private cacheLoadedAsset(path: string, asset: any) {
        if (asset instanceof AudioClip || path === 'music') {
            if (!this.allMusic[asset.name]) {
                this.allMusic[asset.name] = asset;
            }
            return;
        }

        const prefabName = asset?.data?.name as string;
        if (!prefabName) {
            return;
        }

        if (path.startsWith('prefabs/')) {
            loadPool.ins.setPrefab(prefabName, asset);
            return;
        }

        if (path.startsWith('parfabs/')) {
            nodePool.ins.setPrefab(prefabName, asset);
        }
    }
}
