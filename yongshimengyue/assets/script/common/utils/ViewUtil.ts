import ResUtils from "./ResUtils";

export class ViewUtil {

    /**
     * 设置文字
     * @param node 
     * @param str 
     */
    public static setLabelStr(node: cc.Node, str: string): void {
        if (!node) {
            cc.error("node is invalid!");
            return;
        }

        let lbl: any = node.getComponent(cc.Label);
        if (!lbl) {
            lbl = node.getComponent(cc.RichText);
        }
        lbl.string = str;
    }

    /**
     * 设置图集资源
     * @param node 
     * @param name 
     */
    public static setAtlasSpriteFrame(node: cc.Node, atlas: string, name: string): void {
        if (!node) {
            cc.error("node is invalid!");
            return;
        }

        let sprite: cc.Sprite = node.getComponent(cc.Sprite);
        if (!sprite) {
            sprite = node.addComponent(cc.Sprite);
        }
        sprite.spriteFrame = ResUtils.getAtlasSpriteFrame(atlas, name);
    }

    /**
     * 设置单张资源
     * @param node 
     * @param path 
     */
    public static setSpriteFrame(node: cc.Node, path: string): void {
        if (!node) {
            cc.error("node is invalid!");
            return;
        }

        let sprite: cc.Sprite = node.getComponent(cc.Sprite);
        if (!sprite) {
            sprite = node.addComponent(cc.Sprite);
        }
        sprite.spriteFrame = ResUtils.getSpriteFrame(path);
    }
}

