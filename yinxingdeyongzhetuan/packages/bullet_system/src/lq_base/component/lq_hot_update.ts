import {LQPlatformUtil} from "../util/lq_platform_util";

export class LQHotUpdate {
    private readonly storage_path: string;
    private readonly am: any;
    private func_check: Function;
    private func_update: Function;

    constructor(manifest_url: cc.Asset) {
        if (!LQPlatformUtil.is_native()) {
            return;
        }
        this.storage_path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'hot_update');
        console.log('-----------热更新储存路径' + this.storage_path);
        // @ts-ignore
        this.am = new jsb.AssetsManager('', this.storage_path, this.version_compare_handle);
        if (LQPlatformUtil.is_android()) {
            this.am.setMaxConcurrentTask(2);
        }
        // @ts-ignore
        if (this.am.getState() === jsb.AssetsManager.State.UNINITED) {
            let url = manifest_url.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this.am.loadLocalManifest(url);
        }
    }

    private version_compare_handle(versionA, versionB) {
        const vA = versionA.split('.');
        const vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            const a = parseInt(vA[i], 10);
            const b = parseInt(vB[i] || 0, 10);
            if (a !== b) {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    }

    private check_cb(event) {
        let err_str = '';
        let code = 0;
        switch (event.getEventCode()) {
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                code = -1;
                err_str = "No local manifest file found, hot update skipped.";
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                code = -1;
                err_str = "Fail to download manifest file, hot update skipped.";
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                code = 0;
                err_str = "----------热更新完成----------";
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                code = 1;
                break;
            default:
                return;
        }
        this.am.setEventCallback(undefined);
        this.func_check(code, err_str);
    }

    private is_exist(v: string, path: string[]) {
        for (let i = 0; i < path.length; i++) {
            if (path[i] === v) {
                return true;
            }
        }
        return false;
    }

    private update_cb(event) {
        let aleadyUptoDate = false;
        let needRestart = false;
        let failed = false;
        let err_str = '';
        switch (event.getEventCode()) {
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                err_str = 'No local manifest file found, hot update skipped.';
                failed = true;
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                const v1 = event.getDownloadedBytes();
                const v2 = event.getTotalBytes();
                if (v1 & v2) {
                    this.func_update(0, v1, v2);
                }
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                err_str = 'Fail to download manifest file, hot update skipped.';
                failed = true;
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                err_str = 'Already up to date with the latest remote version.';
                aleadyUptoDate = true;
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                err_str = 'Update finished. ' + event.getMessage();
                needRestart = true;
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.UPDATE_FAILED:
                err_str = 'Update failed. ' + event.getMessage();
                failed = true;
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_UPDATING:
                err_str = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                failed = true;
                break;
            // @ts-ignore
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                err_str = event.getMessage();
                failed = true;
                break;
            default:
                break;
        }
        if (failed) {
            this.am.setEventCallback(undefined);
            this.func_update(-1, err_str);
        } else if (aleadyUptoDate) {
            this.func_update(1);
        }

        if (needRestart) {
            this.am.setEventCallback(undefined);
            // @ts-ignore
            const searchPaths = jsb.fileUtils.getSearchPaths();
            // @ts-ignore
            console.log('-----------当前路径' + searchPaths);
            const newPaths = this.am.getLocalManifest().getSearchPaths();
            console.log('-----------需要添加的路径' + newPaths);
            for (let i = 0; i < newPaths.length; i++) {
                const newPath = newPaths[i];
                if (!this.is_exist(newPath, searchPaths)) {
                    searchPaths.unshift(newPath);
                }
            }
            console.log('-----------新路径' + searchPaths);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    }


    public check_update(f1: Function, f2: Function) {
        if (!LQPlatformUtil.is_native()) {
            f1(-1, '非原生不用更新');
            return;
        }
        this.func_check = f1;
        this.func_update = f2;
        this.am.setEventCallback(this.check_cb.bind(this));
        this.am.checkUpdate();
    }

    public start_update() {
        this.am.setEventCallback(this.update_cb.bind(this));
        this.am.update();
    }
}
