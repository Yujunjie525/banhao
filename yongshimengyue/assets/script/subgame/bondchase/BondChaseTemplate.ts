import { BondChasePlatformConfig, BondChaseTemplateConfig } from "./BondChaseTypes";

const { ccclass } = cc._decorator;

export interface BondChasePlatformRect {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BondChaseTemplateRuntime {
    node: cc.Node;
    config: BondChaseTemplateConfig;
    worldY: number;
    platforms: BondChasePlatformRect[];
}

@ccclass("BondChaseTemplate")
export default class BondChaseTemplate extends cc.Component {
    private platformGraphics: cc.Graphics = null;
    private routeGraphics: cc.Graphics = null;
    private config: BondChaseTemplateConfig = null;

    public setup(
        config: BondChaseTemplateConfig,
        platformSpriteFrame: cc.SpriteFrame = null,
        showDebugRoute: boolean = true
    ): void {
        this.config = config;
        this.node.setContentSize(720, config.height);

        if (platformSpriteFrame) {
            this.createPlatformVisuals(config.platforms, platformSpriteFrame);
        }
        if (!platformSpriteFrame || showDebugRoute) {
            const platformDebugNode = new cc.Node("PlatformCollisionDebug");
            this.node.addChild(platformDebugNode, 2);
            this.platformGraphics = platformDebugNode.addComponent(cc.Graphics);
            this.drawPlatforms(config.platforms, !platformSpriteFrame);
        }

        if (showDebugRoute) {
            const routeNode = new cc.Node("PrincessRouteDebug");
            this.node.addChild(routeNode, 3);
            this.routeGraphics = routeNode.addComponent(cc.Graphics);
            this.drawRoute(config);
        }
    }

    public getPlatformRects(): BondChasePlatformRect[] {
        if (!this.config) {
            return [];
        }
        return this.config.platforms.map((item: BondChasePlatformConfig) => {
            return {
                id: item.id,
                type: String(item.type || "solid").replace(";", ""),
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
            };
        });
    }

    public static create(
        parent: cc.Node,
        config: BondChaseTemplateConfig,
        worldY: number,
        platformSpriteFrame: cc.SpriteFrame = null,
        showDebugRoute: boolean = true
    ): BondChaseTemplateRuntime {
        const node = new cc.Node("BondChaseTemplate_" + config.id);
        node.setPosition(0, worldY);
        parent.addChild(node, 1);
        const component = node.addComponent(BondChaseTemplate);
        component.setup(config, platformSpriteFrame, showDebugRoute);
        return {
            node: node,
            config: config,
            worldY: worldY,
            platforms: component.getPlatformRects(),
        };
    }

    private createPlatformVisuals(platforms: BondChasePlatformConfig[], spriteFrame: cc.SpriteFrame): void {
        const sourceSize = spriteFrame.getOriginalSize();
        const visualHeight = Math.max(1, sourceSize.height || 36);
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            const collisionTop = platform.y + platform.height / 2;
            this.createPlatformVisual(
                "PlatformVisual_" + platform.id,
                platform.x,
                collisionTop - visualHeight / 2,
                platform.width,
                visualHeight,
                spriteFrame
            );
            const layerCount = Math.max(0, Math.floor(Number(platform.visual_layers) || 0));
            for (let layer = 1; layer <= layerCount; layer++) {
                this.createPlatformVisual(
                    "PlatformVisual_" + platform.id + "_Stack" + layer,
                    platform.x,
                    collisionTop - visualHeight * (layer + 0.5),
                    platform.width,
                    visualHeight,
                    spriteFrame
                );
            }
        }
    }

    private createPlatformVisual(
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        spriteFrame: cc.SpriteFrame
    ): void {
        const visualNode = new cc.Node(name);
        visualNode.setPosition(x, y);
        this.node.addChild(visualNode, 1);
        const sprite = visualNode.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.type = cc.Sprite.Type.TILED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        visualNode.setContentSize(width, height);
    }

    private drawPlatforms(platforms: BondChasePlatformConfig[], filled: boolean): void {
        this.platformGraphics.clear();
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            const type = String(platform.type || "solid").replace(";", "");
            this.platformGraphics.fillColor = type === "fragile"
                ? cc.color(207, 153, 68, 255)
                : type === "dichi"
                    ? cc.color(190, 70, 80, 255)
                    : cc.color(82, 108, 142, 255);
            this.platformGraphics.strokeColor = filled
                ? cc.color(235, 244, 255, 230)
                : cc.color(255, 80, 160, 230);
            this.platformGraphics.lineWidth = filled ? 2 : 3;
            this.platformGraphics.roundRect(
                platform.x - platform.width / 2,
                platform.y - platform.height / 2,
                platform.width,
                platform.height,
                6
            );
            if (filled) {
                this.platformGraphics.fill();
            }
            this.platformGraphics.stroke();
        }
    }

    private drawRoute(config: BondChaseTemplateConfig): void {
        this.routeGraphics.clear();
        this.routeGraphics.strokeColor = cc.color(120, 230, 220, 170);
        this.routeGraphics.lineWidth = 3;
        let cursor = config.spawn && config.spawn.princess
            ? config.spawn.princess
            : { x: 0, y: 100 };
        this.routeGraphics.moveTo(cursor.x, cursor.y);
        for (let i = 0; i < config.princess_route.length; i++) {
            const step = config.princess_route[i];
            if (step.action === "run" || step.action === "jump") {
                cursor = { x: Number(step.x) || 0, y: Number(step.y) || 0 };
                this.routeGraphics.lineTo(cursor.x, cursor.y);
            }
        }
        this.routeGraphics.stroke();
    }
}
