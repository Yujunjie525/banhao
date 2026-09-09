import {
    _decorator,
    Color,
    Component,
    EventTouch,
    Graphics,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    UIOpacity,
    Vec2,
} from 'cc';
import { GridCoord, GridSystem } from './GridSystem';
import { HeroUpgradeStore } from '../../script/data/heroUpgradeStore';
import { getHeroBrightnessBonus } from '../../script/data/heroSkills';

const { ccclass, property } = _decorator;

type MaskCell = {
    node: Node;
    opacity?: UIOpacity;
    graphics?: Graphics;
};

@ccclass('VisionMask')
export class VisionMask extends Component {
    @property(GridSystem)
    gridSystem: GridSystem = null;

    @property(SpriteFrame)
    maskSpriteFrame: SpriteFrame = null;

    @property
    brightnessPower = 1.6;

    private maskCells = new Map<string, MaskCell>();

    start() {
        if (this.gridSystem) {
            this.refresh();
        }

        this.registerTouchForwarder();
    }

    onDestroy() {
        this.unregisterTouchForwarder();
    }

    public bindGrid(grid: GridSystem) {
        this.gridSystem = grid;
        this.rebuildMaskCells();
        this.refresh();
    }

    public refresh() {
        if (!this.gridSystem) {
            return;
        }

        this.ensureMaskCells();

        const lit = this.collectLitCells();
        const brightness = this.getSceneBrightness();
        const darkOpacity = Math.round(255 * (1 - brightness));

        for (let row = 0; row < this.gridSystem.rows; row++) {
            for (let col = 0; col < this.gridSystem.cols; col++) {
                const coord = { col, row };
                const key = this.gridSystem.key(coord);
                const cell = this.maskCells.get(key);
                if (!cell) {
                    continue;
                }

                const targetOpacity = lit.has(key) ? 0 : darkOpacity;
                if (cell.opacity) {
                    cell.opacity.opacity = targetOpacity;
                }
                if (cell.graphics) {
                    this.renderGraphicsCell(cell.graphics, this.gridSystem.cellSize, targetOpacity);
                }
            }
        }
    }

    private ensureMaskCells() {
        const expectedCount = this.gridSystem.cols * this.gridSystem.rows;
        if (this.maskCells.size !== expectedCount) {
            this.rebuildMaskCells();
        }
    }

    private rebuildMaskCells() {
        this.maskCells.clear();
        this.node.removeAllChildren();

        if (!this.gridSystem) {
            return;
        }

        const cellSize = this.gridSystem.cellSize;
        const width = this.gridSystem.cols * cellSize;
        const height = this.gridSystem.rows * cellSize;

        const transform = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        transform.setContentSize(width, height);

        for (let row = 0; row < this.gridSystem.rows; row++) {
            for (let col = 0; col < this.gridSystem.cols; col++) {
                const coord = { col, row };
                const key = this.gridSystem.key(coord);
                const cellNode = new Node(`MaskCell_${col}_${row}`);
                cellNode.layer = this.node.layer;
                cellNode.setPosition(this.gridSystem.gridToLocalPosition(coord));

                const cellTransform = cellNode.addComponent(UITransform);
                cellTransform.setContentSize(cellSize, cellSize);

                this.node.addChild(cellNode);

                if (this.maskSpriteFrame) {
                    const sprite = cellNode.addComponent(Sprite);
                    sprite.spriteFrame = this.maskSpriteFrame;
                    sprite.sizeMode = Sprite.SizeMode.CUSTOM;

                    const opacity = cellNode.addComponent(UIOpacity);
                    opacity.opacity = 255;

                    this.maskCells.set(key, { node: cellNode, opacity });
                } else {
                    const graphics = cellNode.addComponent(Graphics);
                    this.renderGraphicsCell(graphics, cellSize, 255);
                    this.maskCells.set(key, { node: cellNode, graphics });
                }
            }
        }
    }

    private renderGraphicsCell(graphics: Graphics, cellSize: number, alpha: number) {
        graphics.clear();
        if (alpha <= 0) {
            return;
        }

        const half = cellSize / 2;
        graphics.fillColor = new Color(0, 0, 0, alpha);
        graphics.rect(-half, -half, cellSize, cellSize);
        graphics.fill();
    }

    private collectLitCells() {
        const lit = new Set<string>();
        const grid = this.gridSystem;
        if (!grid) {
            return lit;
        }

        for (const block of grid.getLightBlocks()) {
            const center = block.getVisionCoord();
            const cells: GridCoord[] = [
                center,
                { col: center.col + 1, row: center.row },
                { col: center.col - 1, row: center.row },
                { col: center.col, row: center.row + 1 },
                { col: center.col, row: center.row - 1 },
            ];

            for (const cell of cells) {
                if (grid.isInBounds(cell)) {
                    lit.add(grid.key(cell));
                }
            }
        }

        for (const slotCoord of grid.getSlotCoords()) {
            if (grid.isInBounds(slotCoord)) {
                lit.add(grid.key(slotCoord));
            }
        }

        return lit;
    }

    private getSlotProgress() {
        const total = this.gridSystem.getTotalSlotCount();
        if (total <= 0) {
            return 0;
        }

        return this.gridSystem.getFilledSlotCount() / total;
    }

    private getSceneBrightness() {
        const progress = this.getSlotProgress();
        const qhInitialBrightness = HeroUpgradeStore.getCurrentInitialBrightness() / 100;
        const heroBrightnessBonus = getHeroBrightnessBonus() / 100;
        const initialBrightness = Math.min(1, qhInitialBrightness + heroBrightnessBonus);
        const initialDarkAlpha = 1 - initialBrightness;
        const remainingDarkAlpha = initialDarkAlpha * (1 - Math.pow(progress, this.brightnessPower));
        return 1 - remainingDarkAlpha;
    }

    private registerTouchForwarder() {
        this.unregisterTouchForwarder();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private unregisterTouchForwarder() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart(event: EventTouch) {
        this.gridSystem?.beginBoardSwipe(event.getUILocation());
    }

    private onTouchEnd(event: EventTouch) {
        this.gridSystem?.endBoardSwipe(event.getUILocation());
    }

    private onTouchCancel() {
        this.gridSystem?.beginBoardSwipe(new Vec2(0, 0));
    }
}
