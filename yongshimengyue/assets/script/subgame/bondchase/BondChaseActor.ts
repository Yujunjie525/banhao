const { ccclass } = cc._decorator;

@ccclass("BondChaseActor")
export default class BondChaseActor extends cc.Component {
    private bodyGraphics: cc.Graphics = null;
    private titleLabel: cc.Label = null;
    private baseColor: cc.Color = cc.color(255, 255, 255, 255);
    private visualNode: cc.Node = null;
    private visualAnimation: cc.Animation = null;
    private idleClipName: string = "";
    private runClipName: string = "";
    private currentClipName: string = "";
    private baseVisualScaleX: number = 1;

    public roleId: string = "";


    public setup(
        roleId: string,
        displayName: string,
        width: number,
        height: number,
        color: cc.Color,
        visualPrefab: cc.Prefab = null,
        idleClipName: string = "",
        runClipName: string = ""
    ): void {
        this.roleId = roleId;
        this.baseColor = color;
        this.node.setContentSize(width, height);
        this.idleClipName = idleClipName;
        this.runClipName = runClipName;

        if (visualPrefab) {
            this.setupVisual(visualPrefab, height);
            return;
        }

        this.bodyGraphics = this.node.getComponent(cc.Graphics);
        if (!this.bodyGraphics) {
            this.bodyGraphics = this.node.addComponent(cc.Graphics);
        }
        this.drawBody(width, height, color);

        const labelNode = new cc.Node("RoleLabel");
        labelNode.setPosition(0, height / 2 + 18);
        this.node.addChild(labelNode, 2);
        this.titleLabel = labelNode.addComponent(cc.Label);
        this.titleLabel.string = displayName;
        this.titleLabel.fontSize = 18;
        this.titleLabel.lineHeight = 20;
        this.titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        this.titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = cc.color(255, 245, 200, 255);
    }

    public setMotion(moving: boolean, direction: number): void {
        if (!this.visualNode || !this.visualNode.isValid) {
            return;
        }

        if (Math.abs(direction) > 0.01) {
            this.visualNode.scaleX = direction >= 0
                ? this.baseVisualScaleX
                : -this.baseVisualScaleX;
        }

        this.playClip(moving ? this.runClipName : this.idleClipName);
    }

    public setWarning(active: boolean): void {
        if (this.visualNode && this.visualNode.isValid) {
            this.visualNode.color = active
                ? cc.color(255, 145, 125, 255)
                : cc.Color.WHITE;
            return;
        }
        if (!this.bodyGraphics) {
            return;
        }
        const color = active ? cc.color(255, 90, 70, 255) : this.baseColor;
        this.drawBody(this.node.width, this.node.height, color);
    }

    private setupVisual(visualPrefab: cc.Prefab, collisionHeight: number): void {
        this.visualNode = cc.instantiate(visualPrefab);
        this.visualNode.name = "Visual";
        this.visualNode.setPosition(0, Math.max(0, (this.visualNode.height - collisionHeight) / 2));
        this.node.addChild(this.visualNode, 1);
        this.baseVisualScaleX = Math.abs(this.visualNode.scaleX || 1);
        this.visualAnimation = this.visualNode.getComponent(cc.Animation);
        this.playClip(this.idleClipName);
    }

    private playClip(clipName: string): void {
        if (!clipName || !this.visualAnimation || this.currentClipName === clipName) {
            return;
        }

        const hasClip = this.visualAnimation.getClips().some((clip: cc.AnimationClip) => {
            return !!clip && clip.name === clipName;
        });
        if (!hasClip) {
            cc.warn("BondChaseActor missing animation clip:", clipName, this.roleId);
            return;
        }

        this.visualAnimation.play(clipName);
        this.currentClipName = clipName;
    }

    private drawBody(width: number, height: number, color: cc.Color): void {
        this.bodyGraphics.clear();
        this.bodyGraphics.fillColor = color;
        this.bodyGraphics.strokeColor = cc.color(255, 255, 255, 230);
        this.bodyGraphics.lineWidth = 3;
        this.bodyGraphics.roundRect(-width / 2, -height / 2, width, height, 12);
        this.bodyGraphics.fill();
        this.bodyGraphics.stroke();
        this.bodyGraphics.fillColor = cc.color(255, 255, 255, 180);
        this.bodyGraphics.circle(0, height * 0.18, Math.min(width, height) * 0.18);
        this.bodyGraphics.fill();
    }
}
