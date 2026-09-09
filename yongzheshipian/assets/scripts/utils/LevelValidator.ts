import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

export interface Position {
    col: number;
    row: number;
}

export interface LevelConfig {
    level: number;
    id: string;
    name: string;
    cols: number;
    rows: number;
    minSteps: number;
    steps: number;
    obstacles: Position[];
    slots: { id: string; position: Position }[];
    lightBlocks: { id: string; start: Position }[];
    blackHoles?: { id: string; path: Position[] }[];
    playerStart?: Position;
}

export interface MoveStep {
    ballId: string;
    direction: string;
    from: Position;
    to: Position;
}

interface State {
    positions: Map<string, Position>;
    steps: number;
    cost: number;
    path: MoveStep[];
}

@ccclass('LevelValidator')
export class LevelValidator extends Component {
    private obstacles: Set<string> = new Set();
    private slotPositions: Map<string, Position> = new Map();
    private cols: number = 0;
    private rows: number = 0;
    private maxSearchSteps: number = 50;

    validateLevel(config: LevelConfig): ValidationResult {
        this.cols = config.cols;
        this.rows = config.rows;
        
        this.obstacles.clear();
        config.obstacles.forEach(pos => {
            this.obstacles.add(this.posToString(pos));
        });
        
        this.slotPositions.clear();
        config.slots.forEach(slot => {
            this.slotPositions.set(slot.id, slot.position);
        });

        const initialPositions = new Map<string, Position>();
        config.lightBlocks.forEach(block => {
            initialPositions.set(block.id, { ...block.start });
        });

        const result = this.aStarSearch(initialPositions);
        
        return {
            levelId: config.id,
            levelName: config.name,
            levelNumber: config.level,
            hasSolution: result.hasSolution,
            minSteps: result.minSteps,
            configuredMinSteps: config.minSteps,
            configuredSteps: config.steps,
            isStepsEnough: result.hasSolution && result.minSteps <= config.steps,
            isMinStepsAccurate: result.hasSolution && result.minSteps === config.minSteps,
            isValid: result.hasSolution && result.minSteps <= config.steps,
            searchCompleted: result.searchCompleted,
            solutionPath: result.path
        };
    }

    private aStarSearch(initialPositions: Map<string, Position>): AStarResult {
        const openSet: State[] = [{ positions: initialPositions, steps: 0, cost: 0, path: [] }];
        const visited = new Set<string>();

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.cost - b.cost);
            const current = openSet.shift()!;

            if (current.steps > this.maxSearchSteps) {
                return { hasSolution: false, minSteps: -1, searchCompleted: false, path: [] };
            }

            if (this.isTargetState(current.positions)) {
                return { hasSolution: true, minSteps: current.steps, searchCompleted: true, path: current.path };
            }

            const stateKey = this.stateToString(current.positions);
            if (visited.has(stateKey)) continue;
            visited.add(stateKey);

            const neighbors = this.getValidMovesWithInfo(current.positions);
            for (const { newPositions, moveStep } of neighbors) {
                const neighborKey = this.stateToString(newPositions);
                if (!visited.has(neighborKey)) {
                    const newSteps = current.steps + 1;
                    const heuristic = this.calculateHeuristic(newPositions);
                    const newPath = [...current.path, moveStep];
                    openSet.push({
                        positions: newPositions,
                        steps: newSteps,
                        cost: newSteps + heuristic,
                        path: newPath
                    });
                }
            }

            if (visited.size > 100000) {
                return { hasSolution: false, minSteps: -1, searchCompleted: false, path: [] };
            }
        }

        return { hasSolution: false, minSteps: -1, searchCompleted: true, path: [] };
    }

    private calculateHeuristic(positions: Map<string, Position>): number {
        let totalDistance = 0;
        positions.forEach((pos, id) => {
            const targetPos = this.slotPositions.get(id);
            if (targetPos) {
                totalDistance += Math.abs(pos.col - targetPos.col) + Math.abs(pos.row - targetPos.row);
            }
        });
        return totalDistance;
    }

    private getValidMovesWithInfo(positions: Map<string, Position>): { newPositions: Map<string, Position>; moveStep: MoveStep }[] {
        const moves: { newPositions: Map<string, Position>; moveStep: MoveStep }[] = [];
        const directions = [
            { dc: 0, dr: -1, name: '上' },
            { dc: 0, dr: 1, name: '下' },
            { dc: -1, dr: 0, name: '左' },
            { dc: 1, dr: 0, name: '右' }
        ];

        for (const [id, pos] of positions) {
            for (const dir of directions) {
                const finalPos = this.slideSingleBall(pos, dir, positions, id);
                
                if (finalPos.col !== pos.col || finalPos.row !== pos.row) {
                    const newPositions = new Map(positions);
                    newPositions.set(id, finalPos);
                    
                    moves.push({
                        newPositions,
                        moveStep: {
                            ballId: id,
                            direction: dir.name,
                            from: { ...pos },
                            to: { ...finalPos }
                        }
                    });
                }
            }
        }

        return moves;
    }

    private slideSingleBall(
        startPos: Position,
        dir: { dc: number; dr: number; name: string },
        allPositions: Map<string, Position>,
        movingId: string
    ): Position {
        let currentCol = startPos.col;
        let currentRow = startPos.row;

        while (true) {
            const nextCol = currentCol + dir.dc;
            const nextRow = currentRow + dir.dr;

            if (!this.isValidPosition({ col: nextCol, row: nextRow })) {
                break;
            }

            if (this.isObstacle({ col: nextCol, row: nextRow })) {
                break;
            }

            if (this.isOccupiedByOtherBall(nextCol, nextRow, allPositions, movingId)) {
                break;
            }

            currentCol = nextCol;
            currentRow = nextRow;
        }

        return { col: currentCol, row: currentRow };
    }

    private isOccupiedByOtherBall(col: number, row: number, positions: Map<string, Position>, excludeId: string): boolean {
        for (const [id, pos] of positions) {
            if (id !== excludeId && pos.col === col && pos.row === row) {
                return true;
            }
        }
        return false;
    }

    private isValidPosition(pos: Position): boolean {
        return pos.col >= 0 && pos.col < this.cols && pos.row >= 0 && pos.row < this.rows;
    }

    private isObstacle(pos: Position): boolean {
        return this.obstacles.has(this.posToString(pos));
    }

    private isTargetState(positions: Map<string, Position>): boolean {
        for (const [id, targetPos] of this.slotPositions) {
            const currentPos = positions.get(id);
            if (!currentPos || currentPos.col !== targetPos.col || currentPos.row !== targetPos.row) {
                return false;
            }
        }
        return true;
    }

    private posToString(pos: Position): string {
        return `${pos.col},${pos.row}`;
    }

    private stateToString(positions: Map<string, Position>): string {
        const arr = Array.from(positions.entries());
        arr.sort((a, b) => a[0].localeCompare(b[0]));
        return arr.map(([id, pos]) => `${id}:${this.posToString(pos)}`).join('|');
    }

    validateAllLevels(configs: { levels: LevelConfig[] }): ValidationResult[] {
        const results: ValidationResult[] = [];
        configs.levels.forEach(config => {
            console.log(`正在校验关卡 ${config.id}: ${config.name}`);
            const result = this.validateLevel(config);
            results.push(result);
            console.log(`  结果: ${result.hasSolution ? `最优解 ${result.minSteps} 步` : '无解'}`);
        });
        return results;
    }
}

interface AStarResult {
    hasSolution: boolean;
    minSteps: number;
    searchCompleted: boolean;
    path: MoveStep[];
}

export interface ValidationResult {
    levelId: string;
    levelName: string;
    levelNumber: number;
    hasSolution: boolean;
    minSteps: number;
    configuredMinSteps: number;
    configuredSteps: number;
    isStepsEnough: boolean;
    isMinStepsAccurate: boolean;
    isValid: boolean;
    searchCompleted?: boolean;
    solutionPath?: MoveStep[];
}

export function generateValidationReport(results: ValidationResult[]): string {
    let report = '=== 关卡校验报告 ===\n\n';
    let validCount = 0;
    let invalidCount = 0;
    let noSolutionCount = 0;
    let stepsNotEnoughCount = 0;
    let minStepsInaccurateCount = 0;
    let searchTimeoutCount = 0;

    results.forEach(result => {
        report += `关卡 ${result.levelId}: ${result.levelName}\n`;
        report += `  状态: ${result.isValid ? '✓ 有效' : '✗ 无效'}\n`;
        
        if (!result.searchCompleted) {
            report += `  ⚠ 搜索超时（可能是复杂关卡）\n`;
            searchTimeoutCount++;
            invalidCount++;
        } else if (!result.hasSolution) {
            report += `  ✗ 无解\n`;
            noSolutionCount++;
            invalidCount++;
        } else {
            report += `  ✓ 最优解步数: ${result.minSteps}\n`;
            report += `  ✓ 配置最小步数: ${result.configuredMinSteps}\n`;
            report += `  ✓ 配置总步数: ${result.configuredSteps}\n`;
            
            if (!result.isStepsEnough) {
                report += `  ✗ 配置步数不足（需要${result.minSteps}步，配置${result.configuredSteps}步）\n`;
                stepsNotEnoughCount++;
                invalidCount++;
            }
            
            if (!result.isMinStepsAccurate) {
                report += `  ⚠ 配置最小步数不准确（实际${result.minSteps}步，配置${result.configuredMinSteps}步）\n`;
                minStepsInaccurateCount++;
            }
            
            if (result.isValid) {
                validCount++;
            }

            if (result.solutionPath && result.solutionPath.length > 0) {
                report += `  ┌─ 解法步骤 ─┐\n`;
                result.solutionPath.forEach((step, index) => {
                    report += `  │ ${index + 1}. ${step.ballId} → ${step.direction} `;
                    report += `[(${step.from.col},${step.from.row}) → (${step.to.col},${step.to.row})]\n`;
                });
                report += `  └────────────┘\n`;
            }
        }
        
        report += '\n';
    });

    report += '=== 统计汇总 ===\n';
    report += `总关卡数: ${results.length}\n`;
    report += `有效关卡: ${validCount}\n`;
    report += `无效关卡: ${invalidCount}\n`;
    report += `  - 无解关卡: ${noSolutionCount}\n`;
    report += `  - 步数不足: ${stepsNotEnoughCount}\n`;
    report += `  - 搜索超时: ${searchTimeoutCount}\n`;
    report += `最小步数不准确: ${minStepsInaccurateCount}\n`;

    return report;
}
