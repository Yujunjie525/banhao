import { _decorator, Color, Component, EventTouch, Graphics, Node, Sprite, SpriteFrame, tween, Tween, UITransform, UIOpacity, Vec2, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { GridCoord, GridDirection, GridSystem, LightBlockConfig } from './GridSystem';
import { isImmuneBlackHole } from '../../script/data/heroSkills';
const { ccclass, property } = _decorator;

@ccclass('LightBlock')
export class LightBlock extends Component {
    @property
    /** 滑动每个格子所需的时间（秒） */
    slideSecondsPerCell = 0.06;

    @property
    /** 触发滑动所需的最小滑动距离（像素） */
    minSwipeDistance = 12;

    @property
    /** 拖尾效果的节点数量 */
    trailCount = 10;

    @property
    /** 拖尾效果的透明度 (0-1) */
    trailOpacity = 0.6;

    @property
    /** 拖尾效果的缩放比例 */
    trailScale = 1;
    //初始本体光球预制件
    @property(SpriteFrame)
    normalSpriteFrame: SpriteFrame = null;

    //选中状态光球预制件
    @property(SpriteFrame)
    selectedSpriteFrame: SpriteFrame = null;

    //已插入记忆槽状态光球预制件
    @property(SpriteFrame)
    slottedSpriteFrame: SpriteFrame = null;
    
    //拖尾效果光球预制件
    @property(SpriteFrame)
    trailSpriteFrame: SpriteFrame = null;

    public blockId = '';
    public gridCoord: GridCoord = { col: 0, row: 0 };
    public isSelected = false;
    public isSliding = false;
    public isSlotted = false;
    public currentSlotId = '';

    private grid: GridSystem = null;
    private touchStart = new Vec2();
    private lastStableCoord: GridCoord = { col: 0, row: 0 };
    private slideDirection: GridDirection = { col: 0, row: 0 };
    private needContinueRollback = false;
    private trailNodes: Node[] = [];
    private lastTrailTime = 0;
    private usePrefabVisual = false;
    private pendingHazardCoord: GridCoord | null = null;

    public setUsePrefabVisual(value: boolean) {
        this.usePrefabVisual = value;
    }

    public init(grid: GridSystem, config: LightBlockConfig) {
        this.grid = grid;
        this.blockId = config.id;
        this.gridCoord = { col: config.start.col, row: config.start.row };
        this.lastStableCoord = { col: config.start.col, row: config.start.row };
        this.isSelected = false;
        this.isSliding = false;
        this.isSlotted = false;
        this.currentSlotId = '';
        this.needContinueRollback = false;

        this.ensureVisual();
        this.setSelected(false);
        this.registerTouch();
    }

    onDestroy() {
        this.unregisterTouch();
    }

    public setSelected(selected: boolean) {
        this.isSelected = selected;
        this.drawVisual();
    }

    public trySlide(direction: GridDirection) {
        if (!this.grid || this.isSliding || !GameManager.instance?.canPlay()) {
            return;
        }

        const path = this.grid.getSlidePath(this.gridCoord, direction);
        const blockedHazardCoord = this.grid.consumeLastBlockedHazardCoord();
        if (path.length <= 1) {
            if (blockedHazardCoord) {
                GameManager.instance?.onBlockCaught();
            }
            this.setSelected(false);
            return;
        }

        if (!GameManager.instance.consumeStep()) {
            return;
        }

        const from = { col: this.gridCoord.col, row: this.gridCoord.row };
        const destination = path[path.length - 1];
        const distance = Math.abs(destination.col - from.col) + Math.abs(destination.row - from.row);
        const totalDuration = Math.max(0.08, distance * this.slideSecondsPerCell);

        this.releaseCurrentSlot();
        this.lastStableCoord = { col: from.col, row: from.row };
        this.slideDirection = { col: direction.col, row: direction.row };
        this.needContinueRollback = false;
        this.pendingHazardCoord = blockedHazardCoord;
        this.isSliding = true;
        this.grid.moveBlockOccupancy(this, from, destination);
        this.gridCoord = destination;
        this.grid.clearSelection(this);
        this.setSelected(false);
        GameManager.instance?.onBlockMoved();
        this.grid.updatePusherBehind(this, direction, from);

        this.slideAlongPath(path, totalDuration);
    }

    private slideAlongPath(path: GridCoord[], totalDuration: number) {
        if (path.length <= 1) {
            this.isSliding = false;
            this.clearTrails();
            this.checkSlot();
            this.lastStableCoord = { col: this.gridCoord.col, row: this.gridCoord.row };
            GameManager.instance?.onBlockMoved();
            return;
        }

        const segmentDuration = totalDuration / (path.length - 1);
        
        let currentIndex = 0;
        const slideToNextPoint = () => {
            currentIndex++;
            if (currentIndex >= path.length) {
                this.isSliding = false;
                this.clearTrails();
                this.checkSlot();
                this.lastStableCoord = { col: this.gridCoord.col, row: this.gridCoord.row };
                this.grid.updatePusherBehind(this, this.slideDirection, this.gridCoord);
                this.resolvePendingHazard();
                GameManager.instance?.onBlockMoved();
                return;
            }

            const targetCoord = path[currentIndex];
            const previousCoord = path[currentIndex - 1];
            this.gridCoord = targetCoord;
            this.grid.updatePusherBehind(this, this.slideDirection, previousCoord);

            tween(this.node)
                .to(segmentDuration, { position: this.grid.gridToLocalPosition(targetCoord) }, {
                    easing: 'sineOut',
                    onUpdate: () => {
                        this.grid.updatePusherBehindPosition(this, this.slideDirection, this.node.position);
                        this.updateTrail();
                    }
                })
                .call(slideToNextPoint)
                .start();
        };

        slideToNextPoint();
    }

    public rollbackToLastStableState() {
        if (!this.grid) {
            return;
        }

        Tween.stopAllByTarget(this.node);
        const currentCoord = { col: this.gridCoord.col, row: this.gridCoord.row };
        this.releaseCurrentSlot();
        this.isSliding = false;
        this.clearTrails();
        this.pendingHazardCoord = null;
        this.grid.restoreBlockOccupancy(this, currentCoord, this.lastStableCoord);
        this.gridCoord = { col: this.lastStableCoord.col, row: this.lastStableCoord.row };
        this.node.setPosition(this.grid.gridToLocalPosition(this.gridCoord));
        this.grid.hidePusher();
        this.checkSlot();
        this.setSelected(false);
        this.needContinueRollback = false;
    }

    public stopBeforeBlackHole(hazardCoord: GridCoord) {
        if (!this.grid || !this.isSliding) {
            return;
        }

        const stopCoord = {
            col: hazardCoord.col - this.slideDirection.col,
            row: hazardCoord.row - this.slideDirection.row,
        };
        const safeCoord = this.grid.isInBounds(stopCoord) ? stopCoord : this.lastStableCoord;
        const currentCoord = { col: this.gridCoord.col, row: this.gridCoord.row };

        Tween.stopAllByTarget(this.node);
        this.releaseCurrentSlot();
        this.isSliding = false;
        this.clearTrails();
        this.pendingHazardCoord = null;
        this.grid.restoreBlockOccupancy(this, currentCoord, safeCoord);
        this.gridCoord = { col: safeCoord.col, row: safeCoord.row };
        this.node.setPosition(this.grid.gridToLocalPosition(this.gridCoord));
        this.grid.updatePusherBehind(this, this.slideDirection, this.gridCoord);
        this.checkSlot();
        this.setSelected(false);
        this.needContinueRollback = true;
        GameManager.instance?.onBlockMoved();
    }

    public rollbackAfterContinue() {
        if (!this.needContinueRollback) {
            return;
        }

        this.rollbackToLastStableState();
    }

    update() {
        if (this.isSliding) {
            GameManager.instance?.onBlockMoved();
            this.checkBlackHoleCollision();
            this.updateTrail();
        }
    }

    private updateTrail() {
        const now = Date.now();
        if (now - this.lastTrailTime > 30) {
            this.createTrail();
            this.lastTrailTime = now;
        }
        
        this.updateTrailOpacity();
    }

    private createTrail() {
        const trailNode = new Node('trail');
        trailNode.parent = this.node.parent;
        trailNode.setPosition(this.node.position);
        trailNode.setScale(new Vec3(this.trailScale, this.trailScale, 1));
        
        const size = this.grid ? this.grid.cellSize : 86;
        const transform = trailNode.addComponent(UITransform);
        transform.setContentSize(size, size);

        if (this.trailSpriteFrame) {
            const sprite = trailNode.addComponent(Sprite);
            sprite.spriteFrame = this.trailSpriteFrame;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;

            const opacity = trailNode.addComponent(UIOpacity);
            opacity.opacity = Math.floor(255 * this.trailOpacity);
        } else {
            const graphics = trailNode.addComponent(Graphics);
            const radius = this.isSelected ? size * 0.44 : size * 0.38;

            graphics.fillColor = new Color(255, 196, 61, Math.floor(255 * this.trailOpacity));
            graphics.strokeColor = new Color(255, 241, 164, Math.floor(255 * this.trailOpacity));
            graphics.lineWidth = 2;
            graphics.circle(0, 0, radius);
            graphics.fill();
            graphics.stroke();
        }
        
        this.trailNodes.push(trailNode);
        
        if (this.trailNodes.length > this.trailCount) {
            const oldest = this.trailNodes.shift();
            if (oldest) {
                oldest.destroy();
            }
        }
    }

    private updateTrailOpacity() {
        const totalTrails = this.trailNodes.length;
        for (let i = 0; i < totalTrails; i++) {
            const trail = this.trailNodes[i];
            const progress = i / totalTrails;
            const opacity = trail.getComponent(UIOpacity);
            if (opacity) {
                const maxOpacity = 255;
                const minOpacity = Math.floor(255 * this.trailOpacity);
                const currentOpacity = Math.floor(minOpacity + (maxOpacity - minOpacity) * progress);
                opacity.opacity = currentOpacity;
            }

            const graphics = trail.getComponent(Graphics);
            if (graphics) {
                const maxAlpha = 255;
                const minAlpha = Math.floor(255 * this.trailOpacity);
                const currentAlpha = Math.floor(minAlpha + (maxAlpha - minAlpha) * progress);
                graphics.fillColor = new Color(255, 196, 61, currentAlpha);
                graphics.strokeColor = new Color(255, 241, 164, currentAlpha);
            }
            
            const scaleProgress = i / (totalTrails - 1 || 1);
            const easedProgress = scaleProgress * scaleProgress;
            const minScale = 0.3;
            const scale = minScale + (this.trailScale - minScale) * easedProgress;
            trail.setScale(new Vec3(scale, scale, 1));
        }
    }

    private clearTrails() {
        for (const trail of this.trailNodes) {
            trail.destroy();
        }
        this.trailNodes = [];
    }

    public getVisionCoord() {
        if (!this.grid) {
            return this.gridCoord;
        }

        return this.grid.localToGridPosition(this.node.position);
    }

    public isLightingCoord(coord: GridCoord) {
        const visionCoord = this.getVisionCoord();
        const delta = Math.abs(coord.col - visionCoord.col) + Math.abs(coord.row - visionCoord.row);
        return delta <= 1;
    }

    private checkSlot() {
        const slot = this.grid?.getSlotAt(this.gridCoord);
        if (!slot) {
            this.releaseCurrentSlot();
            return;
        }

        if (this.currentSlotId === slot.id) {
            if (!this.isSlotted) {
                this.isSlotted = true;
                this.drawVisual();
            }
            return;
        }

        if (this.grid.isSlotFilled(slot.id)) {
            return;
        }

        this.releaseCurrentSlot();
        this.isSlotted = true;
        this.currentSlotId = slot.id;
        this.grid.fillSlot(slot.id, this);
        this.drawVisual();
        GameManager.instance?.onBlockSlotted();
    }

    private checkBlackHoleCollision() {
        if (!this.grid || !GameManager.instance?.canPlay()) {
            return;
        }

        if (isImmuneBlackHole()) {
            return;
        }

        const currentCoord = this.getVisionCoord();
        for (const blackHole of this.grid.getBlackHoles()) {
            if (this.grid.sameCoord(currentCoord, blackHole.gridCoord)) {
                this.stopBeforeBlackHole(blackHole.gridCoord);
                GameManager.instance?.onBlockCaught();
                return;
            }
        }
    }

    private resolvePendingHazard() {
        if (!this.pendingHazardCoord) {
            return;
        }

        this.pendingHazardCoord = null;
        this.needContinueRollback = true;
        GameManager.instance?.onBlockCaught();
    }

    private registerTouch() {
        this.unregisterTouch();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private unregisterTouch() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart(event: EventTouch) {
        if (!GameManager.instance?.canPlay() || this.isSliding) {
            return;
        }

        const point = event.getUILocation();
        this.touchStart.set(point.x, point.y);
        this.grid?.selectBlock(this);
    }

    private onTouchEnd(event: EventTouch) {
        if (!this.isSelected) {
            return;
        }

        const point = event.getUILocation();
        const delta = new Vec2(point.x - this.touchStart.x, point.y - this.touchStart.y);

        if (delta.length() < this.minSwipeDistance) {
            this.grid?.selectBlock(this);
            return;
        }

        this.trySlide(this.getDirection(delta));
    }

    private onTouchCancel() {
        this.setSelected(false);
    }

    private getDirection(delta: Vec2): GridDirection {
        if (Math.abs(delta.x) >= Math.abs(delta.y)) {
            return { col: delta.x > 0 ? 1 : -1, row: 0 };
        }

        return { col: 0, row: delta.y > 0 ? 1 : -1 };
    }

    private ensureVisual() {
        const transform = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        const size = this.grid ? this.grid.cellSize : 86;
        transform.setContentSize(size, size);
        if (this.getCurrentSpriteFrame()) {
            const sprite = this.node.getComponent(Sprite) || this.node.addComponent(Sprite);
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        } else if (!this.usePrefabVisual) {
            this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
        }
    }

    private drawVisual() {
        const spriteFrame = this.getCurrentSpriteFrame();
        const sprite = this.node.getComponent(Sprite);
        if (spriteFrame) {
            const activeSprite = sprite || this.node.addComponent(Sprite);
            activeSprite.spriteFrame = spriteFrame;
            activeSprite.sizeMode = Sprite.SizeMode.CUSTOM;
            this.node.getComponent(Graphics)?.clear();
            return;
        }

        if (sprite) {
            sprite.spriteFrame = null;
        }

        if (this.usePrefabVisual) {
            return;
        }

        const graphics = this.node.getComponent(Graphics);
        if (!graphics) {
            return;
        }

        const size = this.grid ? this.grid.cellSize : 86;
        if (this.isSlotted) {
            const outer = size * 0.72;
            const half = outer / 2;

            graphics.clear();
            graphics.fillColor = new Color(255, 210, 42, 120);
            graphics.roundRect(-half - 8, -half - 8, outer + 16, outer + 16, 10);
            graphics.fill();

            graphics.fillColor = new Color(255, 215, 45, 255);
            graphics.strokeColor = new Color(255, 246, 167, 255);
            graphics.lineWidth = 4;
            graphics.roundRect(-half, -half, outer, outer, 8);
            graphics.fill();
            graphics.stroke();
            return;
        }

        const radius = this.isSelected ? size * 0.44 : size * 0.38;

        graphics.clear();
        graphics.fillColor = new Color(255, 214, 92, 80);
        graphics.circle(0, 0, radius + 12);
        graphics.fill();

        graphics.fillColor = new Color(255, 196, 61, 255);
        graphics.strokeColor = new Color(255, 241, 164, 255);
        graphics.lineWidth = this.isSelected ? 5 : 3;
        graphics.circle(0, 0, radius);
        graphics.fill();
        graphics.stroke();
    }

    private getCurrentSpriteFrame() {
        if (this.isSlotted && this.slottedSpriteFrame) {
            return this.slottedSpriteFrame;
        }

        if (this.isSelected && this.selectedSpriteFrame) {
            return this.selectedSpriteFrame;
        }

        return this.normalSpriteFrame;
    }

    private releaseCurrentSlot() {
        if (!this.currentSlotId) {
            return;
        }

        this.grid?.clearSlot(this.currentSlotId, this);
        this.currentSlotId = '';

        if (this.isSlotted) {
            this.isSlotted = false;
            this.drawVisual();
            GameManager.instance?.updateProgress();
        }
    }
}
