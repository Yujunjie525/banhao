import { _decorator, Color, Component, EventTouch, Graphics, instantiate, Node, Prefab, UITransform, Vec2, Vec3 } from 'cc';
import { LightBlock } from './LightBlock';
import { BlackHole } from './BlackHole';
const { ccclass, property } = _decorator;

export type GridCoord = {
    col: number;
    row: number;
};

export type GridDirection = {
    col: number;
    row: number;
};

export type LightBlockConfig = {
    id: string;
    start: GridCoord;
};

export type MemorySlotConfig = {
    id: string;
    position: GridCoord;
};

export type BlackHoleConfig = {
    id: string;
    type?: 'patrol' | 'pulse' | 'gravity'; // 黑洞类型：巡逻型、脉冲型、引力型
    path: GridCoord[];
    moveSeconds?: number;
    visibleAlpha?: number;
    hiddenAlpha?: number;
    // 脉冲黑洞参数
    pulseInterval?: number; // 脉冲周期（秒）
    pulseDuration?: number; // 爆发持续时间（秒）
};

export type LevelConfig = {
    level?: number;
    id: string;
    name?: string;
    minSteps?: number;
    firstClearRewards?: Record<string, number>;
    repeatRewards?: Record<string, any>;
    cols: number;
    rows: number;
    steps: number;
    obstacles: GridCoord[];
    slots: MemorySlotConfig[];
    lightBlocks: LightBlockConfig[];
    blackHoles: BlackHoleConfig[];
    playerStart?: GridCoord;
};

type Occupant = {
    id: string;
    block: LightBlock;
};

type FilledSlot = {
    id: string;
    block: LightBlock;
};

@ccclass('GridSystem')
export class GridSystem extends Component {
    @property
    /** 网格列数 */
    cols = 7;

    @property
    /** 网格行数 */
    rows = 9;

    @property
    /** 每个格子的大小（像素） */
    cellSize = 86;

    @property(Node)
    /** 网格节点的根节点 */
    gridRoot: Node = null;

    @property(Prefab)
    /** 光球预制件 */
    lightBlockPrefab: Prefab = null;

    @property(Prefab)
    /** 噬梦黑洞预制件（E001） */
    blackHolePatrolPrefab: Prefab = null;

    @property(Prefab)
    /** 脉冲黑洞预制件（E002） */
    blackHolePulsePrefab: Prefab = null;

    @property(Prefab)
    /** 引力黑洞预制件（E003） */
    blackHoleGravityPrefab: Prefab = null;

    @property(Prefab)
    /** 障碍物预制件 */
    obstaclePrefab: Prefab = null;

    @property(Prefab)
    /** 记忆槽预制件 */
    memorySlotPrefab: Prefab = null;

    @property(Prefab)
    /** 地板格子预制件 */
    floorCellPrefab: Prefab = null;

    /** 引力黑洞3x3预制件 */
    @property(Prefab)
    gravityFieldPrefab: Prefab = null;

    @property(Prefab)
    pusherPrefab: Prefab = null;

    public levelConfig: LevelConfig = null;

    private obstacles = new Set<string>();
    private slots = new Map<string, MemorySlotConfig>();
    private slotByCoord = new Map<string, MemorySlotConfig>();
    private filledSlots = new Map<string, FilledSlot>();
    private occupants = new Map<string, Occupant>();
    private lightBlocks: LightBlock[] = [];
    private blackHoles: BlackHole[] = [];
    private selectedBlock: LightBlock = null;
    private pusherNode: Node = null;
    private boardTouchStart = new Vec2();
    private minBoardSwipeDistance = 24;
    private lastBlockedHazardCoord: GridCoord | null = null;
    private playerStartCoord: GridCoord | null = null;

    onLoad() {
        if (!this.gridRoot) {
            this.gridRoot = this.node;
        }

        this.registerBoardTouch();
    }

    onDestroy() {
        this.unregisterBoardTouch();
    }

    public buildLevel(config: LevelConfig) {
        this.clearLevel();
        this.levelConfig = config;
        this.playerStartCoord = config.playerStart || null;
        this.cols = config.cols;
        this.rows = config.rows;
        this.resizeGridRoot();

        this.drawFloor();
        this.buildObstacles(config.obstacles);
        this.buildSlots(config.slots);
        this.buildLightBlocks(config.lightBlocks);
        this.buildBlackHoles(config.blackHoles);
        this.placeInitialPusher();
    }

    public clearLevel() {
        if (!this.gridRoot) {
            this.gridRoot = this.node;
        }

        for (const child of this.gridRoot.children.slice()) {
            child.destroy();
        }
        this.obstacles.clear();
        this.slots.clear();
        this.slotByCoord.clear();
        this.filledSlots.clear();
        this.occupants.clear();
        this.lightBlocks.length = 0;
        this.blackHoles.length = 0;
        this.selectedBlock = null;
        this.pusherNode = null;
        this.playerStartCoord = null;
    }

    public getLightBlocks() {
        return this.lightBlocks;
    }

    public getBlackHoles() {
        return this.blackHoles;
    }

    public consumeLastBlockedHazardCoord(): GridCoord | null {
        const coord = this.lastBlockedHazardCoord;
        this.lastBlockedHazardCoord = null;
        return coord;
    }

    public updatePusherBehind(block: LightBlock, direction: GridDirection, coord: GridCoord) {
        const pusher = this.ensurePusher();
        if (!pusher) {
            return;
        }

        const pusherCoord = {
            col: coord.col - direction.col,
            row: coord.row - direction.row,
        };

        pusher.active = true;
        pusher.setSiblingIndex(Math.max(0, block.node.getSiblingIndex() - 1));
        pusher.setPosition(this.gridToLocalPosition(pusherCoord));
    }

    public updatePusherBehindPosition(block: LightBlock, direction: GridDirection, position: Vec3) {
        const pusher = this.ensurePusher();
        if (!pusher) {
            return;
        }

        pusher.active = true;
        pusher.setSiblingIndex(Math.max(0, block.node.getSiblingIndex() - 1));
        pusher.setPosition(new Vec3(
            position.x - direction.col * this.cellSize,
            position.y - direction.row * this.cellSize,
            position.z,
        ));
    }

    public hidePusher() {
        if (this.pusherNode) {
            this.pusherNode.active = false;
        }
    }

    private placeInitialPusher() {
        const pusher = this.ensurePusher();
        if (!pusher || this.lightBlocks.length === 0) {
            return;
        }

        const targetBlock = this.lightBlocks[0];
        const coord = this.getInitialPlayerCoord(targetBlock);

        pusher.active = true;
        pusher.setPosition(this.gridToLocalPosition(coord));
        pusher.setSiblingIndex(Math.max(0, targetBlock.node.getSiblingIndex() - 1));
    }

    private getInitialPlayerCoord(targetBlock: LightBlock) {
        if (this.playerStartCoord && this.isValidPlayerStart(this.playerStartCoord)) {
            return this.playerStartCoord;
        }

        const fallbackSides: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
        for (const side of fallbackSides) {
            const coord = this.getCoordBesideBlock(targetBlock, side);
            if (this.isValidPlayerStart(coord)) {
                return coord;
            }
        }

        return { col: targetBlock.gridCoord.col, row: targetBlock.gridCoord.row };
    }

    private isValidPlayerStart(coord: GridCoord) {
        return this.isInBounds(coord) && !this.isObstacle(coord) && !this.hasActiveBlock(coord) && !this.hasFilledSlotAt(coord);
    }

    private getCoordBesideBlock(block: LightBlock, side: 'left' | 'right' | 'up' | 'down') {
        const offset = this.getSideOffset(side);
        return {
            col: block.gridCoord.col + offset.col,
            row: block.gridCoord.row + offset.row,
        };
    }

    private getSideOffset(side: 'left' | 'right' | 'up' | 'down'): GridDirection {
        switch (side) {
            case 'right':
                return { col: 1, row: 0 };
            case 'up':
                return { col: 0, row: 1 };
            case 'down':
                return { col: 0, row: -1 };
            case 'left':
            default:
                return { col: -1, row: 0 };
        }
    }

    private ensurePusher() {
        if (!this.pusherPrefab) {
            return null;
        }

        if (!this.pusherNode || !this.pusherNode.isValid) {
            this.pusherNode = instantiate(this.pusherPrefab);
            this.pusherNode.name = 'Pusher';
            this.gridRoot.addChild(this.pusherNode);
        }

        return this.pusherNode;
    }

    public getTotalSlotCount() {
        return this.slots.size;
    }

    public getFilledSlotCount() {
        let count = 0;
        this.filledSlots.forEach(() => count++);
        return count;
    }

    public areAllSlotsFilled() {
        return this.getTotalSlotCount() > 0 && this.getFilledSlotCount() >= this.getTotalSlotCount();
    }

    public canMoveTo(coord: GridCoord) {
        return this.isInBounds(coord) && !this.isObstacle(coord) && !this.hasActiveBlock(coord);
    }

    public isInBounds(coord: GridCoord) {
        return coord.col >= 0 && coord.col < this.cols && coord.row >= 0 && coord.row < this.rows;
    }

    public isObstacle(coord: GridCoord) {
        return this.obstacles.has(this.key(coord));
    }

    public hasActiveBlock(coord: GridCoord) {
        const occupant = this.occupants.get(this.key(coord));
        return !!occupant;
    }

    public hasFilledSlotAt(coord: GridCoord) {
        const slot = this.getSlotAt(coord);
        return !!slot && this.isSlotFilled(slot.id);
    }

    public getSlotAt(coord: GridCoord) {
        return this.slotByCoord.get(this.key(coord)) || null;
    }

    public isSlotFilled(slotId: string) {
        return this.filledSlots.has(slotId);
    }

    public getSlideDestination(start: GridCoord, direction: GridDirection, recursionDepth: number = 0): GridCoord {
        if (recursionDepth > 10) {
            return start;
        }

        let current = { col: start.col, row: start.row };

        while (true) {
            const next = {
                col: current.col + direction.col,
                row: current.row + direction.row,
            };

            if (!this.isInBounds(next) || this.isObstacle(next) || this.hasActiveBlock(next) || this.hasFilledSlotAt(next)) {
                return current;
            }

            // 检查下一步是否会进入引力场，如果是就改变方向并重新计算轨迹
            const gravityEffect = this.checkGravityEffectAtPosition(next, direction);
            if (gravityEffect.changed) {
                return this.getSlideDestination(current, gravityEffect.newDirection, recursionDepth + 1);
            }

            current = next;
        }
    }

    public getSlidePath(start: GridCoord, direction: GridDirection, recursionDepth: number = 0): GridCoord[] {
        if (recursionDepth > 10) {
            return [start];
        }

        const path: GridCoord[] = [start];
        let current = { col: start.col, row: start.row };
        this.lastBlockedHazardCoord = null;

        while (true) {
            const next = {
                col: current.col + direction.col,
                row: current.row + direction.row,
            };

            if (this.isPulseDangerCoord(next)) {
                this.lastBlockedHazardCoord = next;
                return path;
            }

            if (!this.isInBounds(next) || this.isObstacle(next) || this.hasActiveBlock(next) || this.hasFilledSlotAt(next)) {
                return path;
            }

            // 检查下一步是否会进入引力场，如果是就在当前格子改变方向并继续计算轨迹
            const gravityEffect = this.checkGravityEffectAtPosition(next, direction);
            if (gravityEffect.changed) {
                // 不在引力场格子转向，而是在边缘格子(current)转向
                // 不把next加入路径，直接从current开始沿新方向计算
                const remainingPath = this.getSlidePath(current, gravityEffect.newDirection, recursionDepth + 1);
                // 移除重复的起点
                if (remainingPath.length > 0 && !this.sameCoord(remainingPath[0], current)) {
                    path.push(...remainingPath);
                } else if (remainingPath.length > 1) {
                    path.push(...remainingPath.slice(1));
                }
                return path;
            }

            path.push(next);
            current = next;
        }
    }

    private isPulseDangerCoord(coord: GridCoord) {
        return this.blackHoles.some((blackHole) => blackHole.isPulseDangerCoord(coord));
    }

    private checkGravityEffectAtPosition(currentCoord: GridCoord, currentDirection: GridDirection): { changed: boolean; newDirection: GridDirection } {
        for (const blackHole of this.blackHoles) {
            if (blackHole.blackHoleType !== 'gravity') {
                continue;
            }

            // 检查当前位置是否在引力黑洞的3x3范围内
            if (this.isInGravityField(currentCoord, blackHole.gridCoord)) {
                // 随机改变90度方向（向左或向右）
                const turnLeft = Math.random() < 0.5;
                const newDirection = this.turnDirection(currentDirection, turnLeft);
                return { changed: true, newDirection };
            }
        }

        return { changed: false, newDirection: currentDirection };
    }

    private isInGravityField(coord: GridCoord, blackHoleCoord: GridCoord): boolean {
        const colDiff = Math.abs(coord.col - blackHoleCoord.col);
        const rowDiff = Math.abs(coord.row - blackHoleCoord.row);
        return colDiff <= 1 && rowDiff <= 1; // 3x3范围
    }

    private turnDirection(direction: GridDirection, turnLeft: boolean): GridDirection {
        // 向左转：上→左→下→右→上
        // 向右转：上→右→下→左→上
        if (direction.col === 0 && direction.row === -1) { // 上
            return turnLeft ? { col: -1, row: 0 } : { col: 1, row: 0 };
        } else if (direction.col === 1 && direction.row === 0) { // 右
            return turnLeft ? { col: 0, row: -1 } : { col: 0, row: 1 };
        } else if (direction.col === 0 && direction.row === 1) { // 下
            return turnLeft ? { col: 1, row: 0 } : { col: -1, row: 0 };
        } else { // 左
            return turnLeft ? { col: 0, row: 1 } : { col: 0, row: -1 };
        }
    }

    public registerBlock(block: LightBlock, coord: GridCoord) {
        this.occupants.set(this.key(coord), { id: block.blockId, block });
    }

    public moveBlockOccupancy(block: LightBlock, from: GridCoord, to: GridCoord) {
        this.occupants.delete(this.key(from));
        this.registerBlock(block, to);
    }

    public restoreBlockOccupancy(block: LightBlock, from: GridCoord, to: GridCoord) {
        this.occupants.delete(this.key(from));
        this.registerBlock(block, to);
    }

    public unregisterBlock(coord: GridCoord) {
        this.occupants.delete(this.key(coord));
    }

    private lastFilledSlotId: string = '';

    public fillSlot(slotId: string, block: LightBlock) {
        this.filledSlots.set(slotId, { id: slotId, block });
        this.lastFilledSlotId = slotId;
    }

    public getLastFilledSlotId(): string {
        return this.lastFilledSlotId;
    }

    public clearSlot(slotId: string, block?: LightBlock) {
        const filled = this.filledSlots.get(slotId);
        if (!filled) {
            return;
        }

        if (block && filled.block !== block) {
            return;
        }

        this.filledSlots.delete(slotId);
    }

    public rollbackSlidingBlocks() {
        for (const block of this.lightBlocks) {
            if (block.isSliding) {
                block.rollbackToLastStableState();
            }
        }
        this.clearSelection();
    }

    public rollbackBlocksAfterContinue() {
        for (const block of this.lightBlocks) {
            block.rollbackAfterContinue();
        }
        this.clearSelection();
    }

    public gridToLocalPosition(coord: GridCoord) {
        const originX = -((this.cols - 1) * this.cellSize) / 2;
        const originY = -((this.rows - 1) * this.cellSize) / 2;
        return new Vec3(originX + coord.col * this.cellSize, originY + coord.row * this.cellSize, 0);
    }

    public localToGridPosition(position: Vec3) {
        const originX = -((this.cols - 1) * this.cellSize) / 2;
        const originY = -((this.rows - 1) * this.cellSize) / 2;
        return {
            col: Math.round((position.x - originX) / this.cellSize),
            row: Math.round((position.y - originY) / this.cellSize),
        };
    }

    public sameCoord(a: GridCoord, b: GridCoord) {
        return a.col === b.col && a.row === b.row;
    }

    public key(coord: GridCoord) {
        return `${coord.col}:${coord.row}`;
    }

    public selectBlock(block: LightBlock) {
        if (this.selectedBlock && this.selectedBlock !== block) {
            this.selectedBlock.setSelected(false);
        }

        this.selectedBlock = block;
        this.selectedBlock.setSelected(true);
    }

    public clearSelection(block?: LightBlock) {
        if (!block || this.selectedBlock === block) {
            this.selectedBlock = null;
        }
    }

    public beginBoardSwipe(point: Vec2) {
        this.boardTouchStart.set(point.x, point.y);

        const coord = this.uiPointToGrid(point);
        if (!coord || !this.isInBounds(coord)) {
            return;
        }

        const occupant = this.occupants.get(this.key(coord));
        if (occupant) {
            this.selectBlock(occupant.block);
        }
    }

    public endBoardSwipe(point: Vec2) {
        if (!this.selectedBlock || this.selectedBlock.isSliding) {
            return;
        }

        const delta = new Vec2(point.x - this.boardTouchStart.x, point.y - this.boardTouchStart.y);
        if (delta.length() < this.minBoardSwipeDistance) {
            return;
        }

        const direction = Math.abs(delta.x) >= Math.abs(delta.y)
            ? { col: delta.x > 0 ? 1 : -1, row: 0 }
            : { col: 0, row: delta.y > 0 ? 1 : -1 };

        this.selectedBlock.trySlide(direction);
    }

    private drawFloor() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.createNode(this.floorCellPrefab, `Cell_${col}_${row}`);
                node.setPosition(this.gridToLocalPosition({ col, row }));
                if (!this.floorCellPrefab) {
                    this.drawRect(node, new Color(35, 54, 70, 210), new Color(83, 111, 130, 170), this.cellSize - 4);
                }
            }
        }
    }

    private buildObstacles(obstacles: GridCoord[]) {
        for (const coord of obstacles) {
            this.obstacles.add(this.key(coord));
            const node = this.createNode(this.obstaclePrefab, `Obstacle_${coord.col}_${coord.row}`);
            node.setPosition(this.gridToLocalPosition(coord));
            if (!this.obstaclePrefab) {
                this.drawRect(node, new Color(105, 116, 126, 255), new Color(176, 188, 197, 255), this.cellSize - 10);
            }
        }
    }

    private buildSlots(slots: MemorySlotConfig[]) {
        for (const slot of slots) {
            this.slots.set(slot.id, slot);
            this.slotByCoord.set(this.key(slot.position), slot);

            const node = this.createNode(this.memorySlotPrefab, `MemorySlot_${slot.id}`);
            node.setPosition(this.gridToLocalPosition(slot.position));
            if (!this.memorySlotPrefab) {
                this.drawSlot(node);
            }
        }
    }

    private buildLightBlocks(configs: LightBlockConfig[]) {
        for (const config of configs) {
            const node = this.createNode(this.lightBlockPrefab, `LightBlock_${config.id}`);
            node.setPosition(this.gridToLocalPosition(config.start));

            const block = node.getComponent(LightBlock) || node.addComponent(LightBlock);
            block.setUsePrefabVisual(!!this.lightBlockPrefab);
            block.init(this, config);
            this.registerBlock(block, config.start);
            this.lightBlocks.push(block);
        }
    }

    private buildBlackHoles(configs: BlackHoleConfig[]) {
        for (const config of configs) {
            if (config.path.length === 0) {
                continue;
            }

            const blackHoleType = this.getBlackHoleType(config);
            const prefab = this.getBlackHolePrefab(blackHoleType);
            const node = this.createNode(prefab, `BlackHole_${config.id}`);
            node.setPosition(this.gridToLocalPosition(config.path[0]));

            // 引力黑洞需要创建3x3范围的显示
            if (blackHoleType === 'gravity') {
                this.createGravityField(node, config.path[0]);
            }

            const blackHole = node.getComponent(BlackHole) || node.addComponent(BlackHole);
            blackHole.setUsePrefabVisual(!!prefab);
            blackHole.init(this, config);
            this.blackHoles.push(blackHole);
        }
    }

    private getBlackHoleType(config: BlackHoleConfig): 'patrol' | 'pulse' | 'gravity' {
        if (config.type) {
            return config.type;
        }
        if (config.id.startsWith('E001')) return 'patrol';
        if (config.id.startsWith('E002')) return 'pulse';
        if (config.id.startsWith('E003')) return 'gravity';
        return 'patrol';
    }

    private getBlackHolePrefab(type: 'patrol' | 'pulse' | 'gravity'): Prefab {
        switch (type) {
            case 'patrol':
                return this.blackHolePatrolPrefab || this.blackHolePulsePrefab;
            case 'pulse':
                return this.blackHolePulsePrefab || this.blackHolePatrolPrefab;
            case 'gravity':
                return this.blackHoleGravityPrefab || this.blackHolePatrolPrefab;
            default:
                return this.blackHolePatrolPrefab;
        }
    }

    private createGravityField(centerNode: Node, centerCoord: GridCoord) {
        const gravityFieldNode = this.gravityFieldPrefab ? instantiate(this.gravityFieldPrefab) : new Node('GravityField');
        gravityFieldNode.name = 'GravityField';
        centerNode.parent.addChild(gravityFieldNode);
        
        // 设置引力场覆盖3x3范围
        const transform = gravityFieldNode.getComponent(UITransform) || gravityFieldNode.addComponent(UITransform);
        transform.setContentSize(this.cellSize * 3, this.cellSize * 3);
        gravityFieldNode.setPosition(this.gridToLocalPosition({
            col: centerCoord.col,
            row: centerCoord.row
        }));

        if (this.gravityFieldPrefab) {
            return;
        }
        
        // 添加引力场图形
        const graphics = gravityFieldNode.addComponent(Graphics);
        graphics.fillColor = new Color(30, 60, 150, 40);
        graphics.strokeColor = new Color(100, 150, 255, 100);
        graphics.lineWidth = 2;
        graphics.roundRect(-this.cellSize * 1.5, -this.cellSize * 1.5, this.cellSize * 3, this.cellSize * 3, 8);
        graphics.fill();
        graphics.stroke();
    }

    private createNode(prefab: Prefab, name: string) {
        const node = prefab ? instantiate(prefab) : new Node(name);
        node.name = name;
        this.gridRoot.addChild(node);

        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        transform.setContentSize(this.cellSize, this.cellSize);

        return node;
    }

    private resizeGridRoot() {
        const transform = this.gridRoot.getComponent(UITransform) || this.gridRoot.addComponent(UITransform);
        transform.setContentSize(this.cols * this.cellSize, this.rows * this.cellSize);
    }

    private drawRect(node: Node, fill: Color, stroke: Color, size: number) {
        const graphics = node.getComponent(Graphics) || node.addComponent(Graphics);
        const half = size / 2;
        graphics.clear();
        graphics.fillColor = fill;
        graphics.strokeColor = stroke;
        graphics.lineWidth = 2;
        graphics.roundRect(-half, -half, size, size, 8);
        graphics.fill();
        graphics.stroke();
    }

    private drawSlot(node: Node) {
        const graphics = node.getComponent(Graphics) || node.addComponent(Graphics);
        const outer = this.cellSize - 8;
        const inner = this.cellSize - 28;
        const halfOuter = outer / 2;
        const halfInner = inner / 2;

        graphics.clear();
        graphics.fillColor = new Color(70, 224, 214, 185);
        graphics.strokeColor = new Color(164, 255, 239, 255);
        graphics.lineWidth = 4;
        graphics.roundRect(-halfOuter, -halfOuter, outer, outer, 10);
        graphics.fill();
        graphics.stroke();

        graphics.fillColor = new Color(255, 228, 126, 80);
        graphics.roundRect(-halfInner, -halfInner, inner, inner, 8);
        graphics.fill();

        graphics.strokeColor = new Color(255, 240, 165, 255);
        graphics.lineWidth = 3;
        graphics.roundRect(-halfInner, -halfInner, inner, inner, 8);
        graphics.stroke();
    }

    private registerBoardTouch() {
        this.unregisterBoardTouch();
        this.gridRoot.on(Node.EventType.TOUCH_START, this.onBoardTouchStart, this);
        this.gridRoot.on(Node.EventType.TOUCH_END, this.onBoardTouchEnd, this);
        this.gridRoot.on(Node.EventType.TOUCH_CANCEL, this.onBoardTouchCancel, this);
    }

    private unregisterBoardTouch() {
        if (!this.gridRoot) {
            return;
        }

        this.gridRoot.off(Node.EventType.TOUCH_START, this.onBoardTouchStart, this);
        this.gridRoot.off(Node.EventType.TOUCH_END, this.onBoardTouchEnd, this);
        this.gridRoot.off(Node.EventType.TOUCH_CANCEL, this.onBoardTouchCancel, this);
    }

    private onBoardTouchStart(event: EventTouch) {
        if (this.isLightBlockEvent(event)) {
            return;
        }

        const point = event.getUILocation();
        this.beginBoardSwipe(new Vec2(point.x, point.y));
    }

    private onBoardTouchEnd(event: EventTouch) {
        if (this.isLightBlockEvent(event) || !this.selectedBlock || this.selectedBlock.isSliding) {
            return;
        }

        this.endBoardSwipe(event.getUILocation());
    }

    private onBoardTouchCancel() {
        this.boardTouchStart.set(0, 0);
    }

    private isLightBlockEvent(event: EventTouch) {
        const target = event.target as Node;
        return !!target?.getComponent(LightBlock);
    }

    private uiPointToGrid(point: Vec2) {
        const transform = this.gridRoot.getComponent(UITransform);
        if (!transform) {
            return null;
        }

        const local = transform.convertToNodeSpaceAR(new Vec3(point.x, point.y, 0));
        return this.localToGridPosition(local);
    }
}
