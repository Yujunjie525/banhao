class DemandResLoader {
    private bundleTasks: Map<string, Promise<cc.AssetManager.Bundle>> = new Map();
    private assetTasks: Map<string, Promise<cc.Asset>> = new Map();
    private dirTasks: Map<string, Promise<cc.Asset[]>> = new Map();

    public ensureBundle(bundleName: string): Promise<cc.AssetManager.Bundle> {
        const name = (bundleName || "").trim();
        if (!name || name === "resources") {
            return Promise.resolve(cc.resources);
        }

        const cachedBundle = cc.assetManager.getBundle(name);
        if (cachedBundle) {
            return Promise.resolve(cachedBundle);
        }

        if (this.bundleTasks.has(name)) {
            return this.bundleTasks.get(name);
        }

        const task = new Promise<cc.AssetManager.Bundle>((resolve, reject) => {
            cc.assetManager.loadBundle(name, (err: Error, bundle: cc.AssetManager.Bundle) => {
                if (err) {
                    this.bundleTasks.delete(name);
                    reject(err);
                    return;
                }

                resolve(bundle);
            });
        });
        this.bundleTasks.set(name, task);
        return task;
    }

    public async loadAsset<T extends cc.Asset>(url: string, type?: typeof cc.Asset): Promise<T> {
        const key = `asset:${url}:${type ? type.name : "Asset"}`;
        if (this.assetTasks.has(key)) {
            return this.assetTasks.get(key) as Promise<T>;
        }

        const task = this.loadAssetInner<T>(url, type).catch((err) => {
            this.assetTasks.delete(key);
            throw err;
        });
        this.assetTasks.set(key, task as Promise<cc.Asset>);
        return task;
    }

    public async loadDir<T extends cc.Asset>(bundleName: string, dir: string, type?: typeof cc.Asset): Promise<T[]> {
        const key = `dir:${bundleName}:${dir}:${type ? type.name : "Asset"}`;
        if (this.dirTasks.has(key)) {
            return this.dirTasks.get(key) as Promise<T[]>;
        }

        const task = this.loadDirInner<T>(bundleName, dir, type).catch((err) => {
            this.dirTasks.delete(key);
            throw err;
        });
        this.dirTasks.set(key, task as Promise<cc.Asset[]>);
        return task;
    }

    public async ensureGameframeCommonPrefabs(): Promise<void> {
        await this.ensureBundle("subgame");
        await this.loadDir<cc.Prefab>("subgame", "prefab/common", cc.Prefab);
    }

    public async ensureSubgameEntry(): Promise<void> {
        await this.ensureBundle("subgame");
        await this.loadAsset<cc.Prefab>("subgame:./prefab/Game", cc.Prefab);
    }

    public async ensureSubgameGuide(): Promise<void> {
        await this.ensureBundle("subgame");
        await Promise.all([
            this.loadDir<cc.Prefab>("subgame", "prefab/component", cc.Prefab),
            this.loadDir<cc.Prefab>("subgame", "prefab/mapPrefab", cc.Prefab),
        ]);
    }

    public async ensureSubgameLogicEntry(): Promise<void> {
        await this.ensureBundle("subgame");
        await Promise.all([
            this.loadAsset<cc.Prefab>("subgame:prefab/component/GeneraItem", cc.Prefab),
            this.loadDir<cc.Prefab>("subgame", "prefab/mapPrefab/stage", cc.Prefab),
            this.loadAsset<cc.JsonAsset>("resources:config/levels", cc.JsonAsset),
            this.loadAsset<cc.JsonAsset>("resources:config/stages", cc.JsonAsset),
            this.loadDir<cc.SpriteFrame>("subgame", "ui_ysmy", cc.SpriteFrame),
            this.loadDir<cc.SpriteFrame>("subgame", "ui_ysmy/stage", cc.SpriteFrame),
        ]);
    }

    public async ensureSubgameRuntime(): Promise<void> {
        await this.ensureBundle("subgame");
        await Promise.all([
            this.loadDir<cc.Prefab>("subgame", "prefab/component", cc.Prefab),
            this.loadDir<cc.Prefab>("subgame", "prefab/mapPrefab", cc.Prefab),
        ]);
    }

    private async loadAssetInner<T extends cc.Asset>(url: string, type?: typeof cc.Asset): Promise<T> {
        const bundleName = this.parseBundleName(url);
        const assetPath = this.parseAssetPath(url);
        const bundle = await this.ensureBundle(bundleName);
        const loaded = bundle.get(assetPath, type as typeof cc.Asset) as T;
        if (loaded) {
            return loaded;
        }

        return new Promise<T>((resolve, reject) => {
            bundle.load(assetPath, type as typeof cc.Asset, (err: Error, asset: T) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    private async loadDirInner<T extends cc.Asset>(bundleName: string, dir: string, type?: typeof cc.Asset): Promise<T[]> {
        const bundle = await this.ensureBundle(bundleName);
        return new Promise<T[]>((resolve, reject) => {
            bundle.loadDir(dir, type as typeof cc.Asset, (err: Error, assets: T[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(assets || []);
            });
        });
    }

    private parseBundleName(url: string): string {
        if (!url) {
            return "resources";
        }
        if (url.startsWith("resources:")) {
            return "resources";
        }

        const idx = url.indexOf(":");
        if (idx < 0) {
            return "resources";
        }
        return url.substring(0, idx).trim();
    }

    private parseAssetPath(url: string): string {
        if (!url) {
            return "";
        }

        const idx = url.indexOf(":");
        if (idx < 0) {
            return url.trim();
        }
        return url.substring(idx + 1).trim();
    }
}

export const demandResLoader = new DemandResLoader();
