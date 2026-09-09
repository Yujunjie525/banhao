import { _decorator, Color, Component, director, Graphics, Node, Sprite, tween, Tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { BlackHoleConfig, GridCoord, GridSystem } from './GridSystem';
import { gameConfig } from '../../script/data/gameConfig';
import { emits } from '../../script/data/enums';
import { isImmuneBlackHole } from '../../script/data/heroSkills';
import { BlackHoleAnimator } from './BlackHoleAnimator';

const { ccclass, property } = _decorator;

@ccclass('BlackHole')
export class BlackHole extends Component {
    @property
    moveSeconds = 0.6;

    @property
    visibleAlpha = 255;

    @property
    hiddenAlpha = 0;

    @property
    pulseInterval = 5;

    @property
    pulseDuration = 2;

    @property
    pulseScale = 3;

    public blackHoleId = '';
    public blackHoleType: 'patrol' | 'pulse' | 'gravity' = 'patrol';
    public gridCoord: GridCoord = { col: 0, row: 0 };

    private grid: GridSystem = null;
    private path: GridCoord[] = [];
    private pathIndex = 0;
    private movingForward = true;
    private opacity: UIOpacity = null;
    private isMoving = false;
    private isPulsing = false;
    private isInPulse = false;
    private lastPulseVisualState: boolean | null = null;
    private caughtThisPulse = new Set<string>();
    private usePrefabVisual = false;
    private lastCaughtTime = 0;
    private animator: BlackHoleAnimator = null;
    private immuneDuration = 3000; // 3秒免疫时间

    public setUsePrefabVisual(value: boolean) {
        this.usePrefabVisual = value;
    }

    public init(grid: GridSystem, config: BlackHoleConfig) {
        this.grid = grid;
        this.blackHoleId = config.id;
        this.blackHoleType = config.type || this.getBlackHoleTypeById(config.id);
        this.path = config.path.map((coord) => ({ col: coord.col, row: coord.row }));
        this.pathIndex = 0;
        this.movingForward = true;
        this.moveSeconds = config.moveSeconds || this.moveSeconds;
        this.visibleAlpha = config.visibleAlpha || this.visibleAlpha;
        this.hiddenAlpha = config.hiddenAlpha || this.hiddenAlpha;
        this.pulseInterval = config.pulseInterval || this.pulseInterval;
        this.pulseDuration = config.pulseDuration || this.pulseDuration;
        this.gridCoord = this.path[0] || { col: 0, row: 0 };
        this.isInPulse = false;
        this.lastPulseVisualState = null;
        this.lastCaughtTime = 0;

        this.ensureVisual();
        this.node.setPosition(this.grid.gridToLocalPosition(this.gridCoord));
        this.refreshVisibility();
        director.on(emits.gamePause, this.onPauseChanged, this);
        void this.applyAnimatedVisual();

        switch (this.blackHoleType) {
            case 'patrol':
                this.startPatrol();
                break;
            case 'pulse':
                this.startPulse();
                break;
            case 'gravity':
                break;
        }
    }

    update() {
        if (!GameManager.instance?.canPlay()) {
            return;
        }

        this.refreshVisibility();

        if (this.blackHoleType === 'pulse') {
            this.updatePulseVisual();
        }

        this.checkCollision();
    }

    onDestroy() {
        director.off(emits.gamePause, this.onPauseChanged, this);
        Tween.stopAllByTarget(this.node);
        this.unscheduleAllCallbacks();
    }

    public refreshVisibility() {
        if (!this.grid || !this.opacity) {
            return;
        }

        const lit = this.grid.getLightBlocks().some((block) => block.isLightingCoord(this.gridCoord));
        this.opacity.opacity = lit ? this.visibleAlpha : this.hiddenAlpha;
    }

    public checkCollisionNow() {
        this.checkCollision();
    }

    public applyGravityEffect(entryCoord: GridCoord, exitCoord: GridCoord): GridCoord {
        if (this.blackHoleType !== 'gravity' || isImmuneBlackHole()) {
            return exitCoord;
        }

        const dx = exitCoord.col - entryCoord.col;
        const dy = exitCoord.row - entryCoord.row;
        const passedThrough = this.isCoordInRange(entryCoord) || this.isCoordInRange(exitCoord);

        if (!passedThrough) {
            return exitCoord;
        }

        const directions = [
            { col: 0, row: -1 },
            { col: 0, row: 1 },
            { col: -1, row: 0 },
            { col: 1, row: 0 },
        ];
        const originalDirIndex = directions.findIndex((direction) => direction.col === dx && direction.row === dy);
        const oppositeDirIndex = (originalDirIndex + 2) % 4;
        const availableDirs = directions.filter((_, index) => index !== originalDirIndex && index !== oppositeDirIndex);

        if (availableDirs.length === 0) {
            return exitCoord;
        }

        const randomDir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
        return {
            col: entryCoord.col + randomDir.col,
            row: entryCoord.row + randomDir.row,
        };
    }

    public isPulseDangerCoord(coord: GridCoord) {
        return this.blackHoleType === 'pulse' && this.isInPulse && this.isCoordInRange(coord);
    }

    private getBlackHoleTypeById(id: string): 'patrol' | 'pulse' | 'gravity' {
        if (id.startsWith('E001')) return 'patrol';
        if (id.startsWith('E002')) return 'pulse';
        if (id.startsWith('E003')) return 'gravity';
        return 'patrol';
    }

    private startPatrol() {
        if (this.path.length <= 1) {
            return;
        }

        this.scheduleMove(this.moveSeconds);
    }

    private startPulse() {
        this.isPulsing = true;
        this.schedulePulse();
    }

    private schedulePulse() {
        if (!GameManager.instance?.canPlay()) {
            this.scheduleOnce(this.schedulePulse, 0.5);
            return;
        }

        this.isInPulse = true;
        this.caughtThisPulse.clear();
        this.updatePulseVisual(true);
        this.scheduleOnce(() => {
            this.isInPulse = false;
            this.caughtThisPulse.clear();
            this.updatePulseVisual(true);
            this.scheduleOnce(this.schedulePulse, Math.max(0.1, this.pulseInterval - this.pulseDuration));
        }, this.pulseDuration);
    }

    private moveNext = () => {
        if (!this.grid || this.path.length <= 1) {
            return;
        }

        if (!GameManager.instance?.canPlay()) {
            this.scheduleMove(this.moveSeconds);
            return;
        }

        this.advancePathIndex();
        this.gridCoord = this.path[this.pathIndex];
        this.isMoving = true;

        tween(this.node)
            .to(this.moveSeconds, { position: this.grid.gridToLocalPosition(this.gridCoord) }, { easing: 'sineInOut' })
            .call(() => {
                this.isMoving = false;
                this.checkCollision();
                this.refreshVisibility();
                this.scheduleMove(0.05);
            })
            .start();
    };

    private scheduleMove(delay: number) {
        this.unschedule(this.moveNext);
        this.scheduleOnce(this.moveNext, delay);
    }

    private onPauseChanged() {
        if (gameConfig.gamePause === 1) {
            this.isMoving = false;
            this.isPulsing = false;
            this.isInPulse = false;
            this.caughtThisPulse.clear();
            this.lastPulseVisualState = null;
            Tween.stopAllByTarget(this.node);
            this.node.setScale(Vec3.ONE);
            if (this.grid) {
                this.node.setPosition(this.grid.gridToLocalPosition(this.gridCoord));
            }
            this.unschedule(this.moveNext);
            this.unscheduleAllCallbacks();
            return;
        }

        if (this.blackHoleType === 'patrol' && !this.isMoving) {
            this.scheduleMove(0.05);
        } else if (this.blackHoleType === 'pulse') {
            this.isPulsing = true;
            this.schedulePulse();
        }
    }

    private advancePathIndex() {
        if (this.path.length <= 1) {
            return;
        }

        if (this.movingForward) {
            this.pathIndex++;
            if (this.pathIndex >= this.path.length - 1) {
                this.pathIndex = this.path.length - 1;
                this.movingForward = false;
            }
        } else {
            this.pathIndex--;
            if (this.pathIndex <= 0) {
                this.pathIndex = 0;
                this.movingForward = true;
            }
        }
    }

    private checkCollision() {
        if (!this.grid || !GameManager.instance?.canPlay() || isImmuneBlackHole()) {
            return;
        }

        let hit = false;

        switch (this.blackHoleType) {
            case 'patrol':
                hit = this.checkPatrolCollision();
                break;
            case 'pulse':
                hit = this.checkPulseCollision();
                break;
            case 'gravity':
                break;
        }

        if (hit) {
            const now = Date.now();
            if (now - this.lastCaughtTime >= this.immuneDuration) {
                this.lastCaughtTime = now;
                GameManager.instance.onBlockCaught();
            }
        }
    }

    private checkPatrolCollision(): boolean {
        const hitDistance = this.grid.cellSize * 0.6;

        return this.grid.getLightBlocks().some((block) => {
            if (block.isSlotted) {
                return false;
            }

            if (Vec3.distance(block.node.position, this.node.position) <= hitDistance) {
                return true;
            }

            return this.grid.sameCoord(block.getVisionCoord(), this.gridCoord);
        });
    }

    private checkPulseCollision(): boolean {
        if (!this.isInPulse) {
            return this.checkPatrolCollision();
        }

        const blocks = this.grid.getLightBlocks();
        for (let dc = -1; dc <= 1; dc++) {
            for (let dr = -1; dr <= 1; dr++) {
                const checkCoord: GridCoord = {
                    col: this.gridCoord.col + dc,
                    row: this.gridCoord.row + dr,
                };
                const hitBlock = blocks.find((block) => {
                    return !block.isSlotted && this.grid.sameCoord(block.getVisionCoord(), checkCoord);
                });

                if (hitBlock && !this.caughtThisPulse.has(hitBlock.blockId)) {
                    this.caughtThisPulse.add(hitBlock.blockId);
                    return true;
                }
            }
        }

        return false;
    }

    private isCoordInRange(coord: GridCoord): boolean {
        const dx = Math.abs(coord.col - this.gridCoord.col);
        const dy = Math.abs(coord.row - this.gridCoord.row);
        return dx <= 1 && dy <= 1;
    }

    private updatePulseVisual(force = false) {
        if (!force && this.lastPulseVisualState === this.isInPulse) {
            return;
        }

        this.lastPulseVisualState = this.isInPulse;
        const baseScale = this.blackHoleType === 'gravity' ? 3 : 1;
        const scale = this.isInPulse ? baseScale * this.pulseScale : baseScale;
        tween(this.node)
            .to(0.12, { scale: new Vec3(scale, scale, 1) })
            .start();
    }

    private ensureVisual() {
        const size = this.grid ? this.grid.cellSize : 86;
        const transform = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        transform.setContentSize(size, size);

        this.opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);

        if (this.usePrefabVisual) {
            return;
        }

        const graphics = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
        graphics.clear();

        switch (this.blackHoleType) {
            case 'patrol':
                this.drawPatrolBlackHole(graphics, size);
                break;
            case 'pulse':
                this.drawPulseBlackHole(graphics, size);
                break;
            case 'gravity':
                this.drawGravityBlackHole(graphics, size);
                break;
        }
    }

    private async applyAnimatedVisual() {
        this.animator = this.node.getComponent(BlackHoleAnimator) || this.node.addComponent(BlackHoleAnimator);
        this.animator.setDisplayScale(this.blackHoleType === 'gravity' ? 3 : 1);
        const played = await this.animator.playLoop(this.blackHoleType);
        if (!played) {
            return;
        }

        this.usePrefabVisual = true;
        const graphics = this.node.getComponent(Graphics);
        if (graphics) {
            graphics.clear();
            graphics.enabled = false;
        }

        const displayNode = this.animator.getDisplayNode();
        const sprite = displayNode?.getComponent(Sprite);
        if (sprite) {
            sprite.enabled = true;
        }
    }

    private drawPatrolBlackHole(graphics: Graphics, size: number) {
        graphics.fillColor = new Color(160, 88, 255, 70);
        graphics.circle(0, 0, size * 0.48);
        graphics.fill();

        graphics.fillColor = new Color(87, 36, 148, 255);
        graphics.strokeColor = new Color(220, 158, 255, 255);
        graphics.lineWidth = 6;
        graphics.circle(0, 0, size * 0.34);
        graphics.fill();
        graphics.stroke();

        graphics.fillColor = new Color(9, 5, 24, 255);
        graphics.circle(0, 0, size * 0.18);
        graphics.fill();

        graphics.strokeColor = new Color(255, 108, 211, 230);
        graphics.lineWidth = 3;
        graphics.arc(0, 0, size * 0.27, 0.25, 4.8, false);
        graphics.stroke();
    }

    private drawPulseBlackHole(graphics: Graphics, size: number) {
        graphics.fillColor = new Color(200, 50, 50, 60);
        graphics.circle(0, 0, size * 0.5);
        graphics.fill();

        graphics.fillColor = new Color(150, 30, 30, 255);
        graphics.strokeColor = new Color(255, 100, 100, 255);
        graphics.lineWidth = 6;
        graphics.circle(0, 0, size * 0.36);
        graphics.fill();
        graphics.stroke();

        graphics.fillColor = new Color(9, 5, 24, 255);
        graphics.circle(0, 0, size * 0.2);
        graphics.fill();

        graphics.strokeColor = new Color(255, 80, 80, 180);
        graphics.lineWidth = 4;
        graphics.circle(0, 0, size * 0.42);
        graphics.stroke();
    }

    private drawGravityBlackHole(graphics: Graphics, size: number) {
        graphics.fillColor = new Color(30, 60, 150, 70);
        graphics.circle(0, 0, size * 0.52);
        graphics.fill();

        graphics.fillColor = new Color(20, 40, 120, 255);
        graphics.strokeColor = new Color(100, 150, 255, 255);
        graphics.lineWidth = 6;
        graphics.circle(0, 0, size * 0.38);
        graphics.fill();
        graphics.stroke();

        graphics.fillColor = new Color(5, 15, 60, 255);
        graphics.circle(0, 0, size * 0.2);
        graphics.fill();

        graphics.strokeColor = new Color(80, 120, 255, 200);
        graphics.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3;
            graphics.arc(0, 0, size * 0.3, angle + 0.3, angle + 1.5, false);
            graphics.stroke();
        }
    }
}
