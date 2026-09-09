import { Package, PackageType } from "../data/const/DefineConst";

/**
 * 主要用于负责与原生交互
 */
class LYXBridge {

    constructor() { }

    /**
     * 状态交互
     * @param key 
     * @param callback 
     */
    public sendState(key, callback = null): void {
        this.callHandler("onState", key, (res: string) => {
            cc.log(`onState->callback(${res})`);
            callback && callback(res);
        });
    }

    /**
     * 传值给原生
     * @param data 
     * @param callback 
     */
    public sendData(data, callback = null): void {
        this.callHandler("onData", data, (res: string) => {
            cc.log(`onData->callback(${res})`)
            callback && callback(res);
        });
    }

    /**
     * 获取原生端的数据
     * @param success 
     * @param error 
     */
    public getParams(success, error): void {
        if (!this.isWebViewJavascriptBridge()) {
            cc.error("IsNotWebViewJavascriptBridge!");
            error && error();
            return;
        }
        this.callHandler("getParam", {}, (res: string) => {
            cc.log(`getParam->callback(${JSON.stringify(res)})`);
            success && success(res);
        });
    }

    public isWebViewJavascriptBridge(): boolean {
        let wd: any = window;
        return wd.WebViewJavascriptBridge;
    }

    public callHandler(name, data, success = null): void {
        if (Package.TYPE != PackageType.APP) {
            return;
        }

        let wd: any = window;
        wd.callHandler && wd.callHandler(name, data, success);
    }

    public registerHandler(name, callback): void {
        if (Package.TYPE != PackageType.APP) {
            return;
        }

        let wd: any = window;
        wd.callHandler && wd.registerHandler(name, callback);
    }

}

export let lyx_bridge: LYXBridge = new LYXBridge();