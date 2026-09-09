import MasterGlobal from "../common/MasterGlobal";
import AbFrameBridge from "../launcher/AbFrameBridge";
import { Package, PackageType } from "./data/const/DefineConst";
import GameController from "./GameController";
import { lyx_bridge } from "./manager/LYXBridge";

class SimpleFrameBridge extends AbFrameBridge {
    protected static instance: SimpleFrameBridge = new SimpleFrameBridge();

    protected constructor() {
        super();
    }

    public static getInstance(): SimpleFrameBridge {
        return this.instance;
    }

    public initFrame(): void {
        Package.TYPE = MasterGlobal.isDebugMode
            ? PackageType.DEV
            : (lyx_bridge.isWebViewJavascriptBridge() ? PackageType.APP : PackageType.WEB);
        GameController.init();
    }

}

let simpleFrameBridge = SimpleFrameBridge.getInstance();

export default simpleFrameBridge;
