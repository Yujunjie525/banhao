import AbGameBridge from "../launcher/AbGameBridge";
import InitGameHandler from "./handler/InitGameHandler";

class SimpleGameBridge extends AbGameBridge {
    protected static instance: SimpleGameBridge = new SimpleGameBridge();
    private inited: boolean = false;
    private initOwner: cc.Node = null;

    protected constructor() {
        super();
    }

    public static getInstance(): SimpleGameBridge {
        return this.instance;
    }

    public initGame(): void {
        const scene = cc.director.getScene();
        if (this.inited && this.initOwner && this.initOwner.isValid && this.initOwner === scene) {
            return;
        }

        this.inited = true;
        this.initOwner = scene;
        this.registerHandler(new InitGameHandler(scene));
    }
}

let simpleGameBridge = SimpleGameBridge.getInstance();

export default simpleGameBridge;
