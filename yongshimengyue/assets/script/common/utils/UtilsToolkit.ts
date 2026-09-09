/**
 * Utils -
 * @date 2020/10/31
 * @author lancetop@cn.lancetop
 * @version 1.0
 * @author yk.luo@cn.lancetop
 * @version -alter1.8
 */

import BaseObject from "../base/BaseObject";

/**
 * UUID Utils
 */
const DICT: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export class UUIDUtils {

    public static randomUUID (): string {
        let uuid = "";
        let len = 32;
        while (len-- > 0) {
            uuid += DICT.charAt(RandomUtils.randomInt(0, DICT.length - 1));
        }
        return uuid;
    }

}

/**
 * RandomUtils
 */
export class RandomUtils {

    public static SEED: number = 1.0;

    private static srand(x: number): number {
        return Math.abs((Math.sin(x) * 100000.0) % 1.0);
    }

    public static srandNumber(): number {
        let n = RandomUtils.srand(RandomUtils.SEED);
        RandomUtils.SEED = n * 100000;
        return n;
    }

    protected static SEED2: number = 1.0;
    protected static seededRandom(): number {
        RandomUtils.SEED2 = (RandomUtils.SEED2 * 9301 + 49297) % 233280;
        var n = RandomUtils.SEED2 / 233280.0;
        return n;
    }

    public static randomNumber(min: number, max: number, useSeed: boolean = false): number {
        let x = useSeed ? RandomUtils.srandNumber() : Math.random();
        return x * (max - min) + min;
    }

    public static randomInt(min: number, max: number, useSeed: boolean = false): number {
        let x = useSeed ? RandomUtils.srandNumber() : Math.random();
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(x * (max - min + 1)) + min;
    }

    public static randomBoolean(useSeed: boolean = false): boolean {
        let x = useSeed ? RandomUtils.srandNumber() : Math.random();
        return x > 0.5;
    }

    /**
     * 洗牌数组
     * @param srcSet
     * @param len 
     */
    public static randomSet(srcSet: any[], len: number, useSeed: boolean = false): any[] {
        let ans = [];
        let ids = [];
        for (let i = 0; i < srcSet.length; i++) {
            ids[i] = i;
        }
        for (let i = 0; i < len; i++) {
            let randomId = RandomUtils.randomInt(0, ids.length - 1, useSeed);
            ans.push(srcSet[ids[randomId]]);
            ids.splice(randomId, 1);
        }
        return ans;
    }

    public static randomTypeByRatio(ratios: number[], useSeed: boolean = false): number {
        let sum = ratios.reduce((a, b)=> a + b, 0);
        if (Math.abs(sum - 1.0) > 1e-6) ratios.push(1.0 - sum);
        let caseN: number = ratios.length;
        let caseI: number = 0;
        let r: number = RandomUtils.randomNumber(0.0, 1.0, useSeed);
        while (caseI < caseN) {
            if (r <= ratios[caseI]) break;
            else r -= ratios[caseI];
            caseI++;
        }
        return caseI >= caseN ? -1 : caseI;
    }

    public static randomSelectOne<T>(arr: T[] | T, useSeed: boolean = false): T {
        if (arr instanceof Array) {
            // arr = arr as T[];
            return arr[RandomUtils.randomInt(0, arr.length - 1, useSeed)];
        } else {
            return arr as T;
        }
    }

    public static randomPositions(rect: cc.Rect, num: number = 1, radius: number = 1): cc.Vec2[] {
        if (num == 1) {
            if (rect.width < radius * 2 || rect.height < radius * 2) {
                throw new Error("[Error] rect.width or rect.height must be larger than radius*2.");
                return;
            }
            let pos: cc.Vec2 = new cc.Vec2();
            pos.x = RandomUtils.randomInt(rect.x + radius, rect.x + rect.width - radius);
            pos.y = RandomUtils.randomInt(rect.y + radius, rect.y + rect.height - radius);
            return [pos];
        }
        let rcNum: number = Math.floor((Math.ceil(Math.sqrt(num))));
        let blocks: cc.Rect[] = new Array<cc.Rect>();
        let blockW: number = Math.floor(rect.width / rcNum);
        let blockH: number = Math.floor(rect.height / rcNum);
        for (let i = 0; i < rcNum; i++) {
            for (let j = 0; j < rcNum; j++) {
                blocks.push(new cc.Rect(rect.x + i * blockW, rect.y + j * blockH, blockW, blockH));
            }
        }
        blocks = RandomUtils.randomSet(blocks, num);
        return blocks.map(item=>RandomUtils.randomPositions(item, 1, radius)[0]);
    }

}

/**
 * QuickTool
 */
export class QuickTool {
    
    public static isNull(obj: any): boolean {
        if (typeof(obj) == 'undefined' || obj == void 0 || obj == null) return true;
        return false;
    }

    public static isNotNull(obj: any): boolean {
        return !QuickTool.isNull(obj);
    }

    public static isEmptyString(str: any): boolean {
        if (typeof(str) != 'string' || str.trim() == '') return true;
        return false;
    }

    public static isValid(obj: cc.Node | BaseObject): boolean {
        let node: cc.Node = null;
        if (obj instanceof BaseObject) {
            if (QuickTool.isNull(obj)) return false;
            node = obj.node;
        } else node = obj as cc.Node;
        return !QuickTool.isNull(node) && node.isValid;
    }

    public static isInValid(node: cc.Node): boolean {
        return !QuickTool.isValid(node);
    }

    public static safeCall(target: object, func: string | Function, ...argArray: any[]): any {
        if (QuickTool.isNull(func) || (typeof func == 'string' && QuickTool.isNull(target))) return;
        let fun: Function = func instanceof Function ? func : Reflect.get(target, func) as Function;
        return fun && fun.call(target, ...argArray);
    }

    /**
     * @since alter1.2 by yk.luo
     * @param sec 
     */
    public static sleep(sec: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, sec * 1000.0));
        // async function example() {
        //     await QuickTool.sleep(3);
        // }
    }

    // 转换srcNode中的posInSrc坐标到targetNode坐标系下
    public static convertNodeSpaceAR(targetNode: cc.Node, srcNode: cc.Node, posInSrc: cc.Vec2 = cc.v2(0, 0)): cc.Vec2 {
        let posInWorld = srcNode.convertToWorldSpaceAR(posInSrc);
        return targetNode.convertToNodeSpaceAR(posInWorld);
    }

    public static updateAlignment(node: cc.Node) {
        if (!QuickTool.isValid(node)) return;
        let widget = node.getComponent(cc.Widget);
        if (QuickTool.isNull(widget)) return;
        widget.updateAlignment();
    }

    public static updateAlignmentErgodic(node: cc.Node) {
        QuickTool.updateAlignment(node);
        node.children.forEach(it=>{
            QuickTool.updateAlignmentErgodic(it);
        });
    }

    public static toFixed(val: number, fractionDigits?: number): number {
        return Number(val.toFixed(fractionDigits));
    }

    public static compareString(a: string, b: string): number {
        if (a === b) {
            return 0;
        } else if (a.length != b.length) {
            return a.length > b.length ? 1 : -1;
        } else {
            let codeA = 0;
            let codeB = 0;
            for (let i = 0; i < a.length; i++) {
                codeA = a.charCodeAt(i);
                codeB = b.charCodeAt(i);
                if (codeA === codeB) continue;
                return codeA > codeB ? 1 : -1;
            }
        }
        return 0;
    }

    public static createNodePool(prefab: cc.Prefab, len: number): cc.NodePool {
        let nodePool: cc.NodePool = new cc.NodePool();
        for (let i = 0; i < len; i++) {
            nodePool.put(cc.instantiate(prefab));
        }
        return nodePool;
    }

    public static getNodeFromPool(prefab: cc.Prefab, nodePool: cc.NodePool): cc.Node {
        let node: cc.Node = null;
        if (nodePool.size() > 0) {
            node = nodePool.get();
        } else {
            node = cc.instantiate(prefab);
        }
        return node;
    }

    public static putNodeInPool(node: cc.Node, nodePool: cc.NodePool) {
        nodePool.put(node);
    }

    public static logDebug(tag: string, obj: cc.Vec2 | cc.Size | Object) {
        let debugLog = `Debug: [${tag}] -> `;
        if (obj instanceof cc.Vec2) {
            debugLog += `(${obj.x}, ${obj.y})`;
        } else if (obj instanceof cc.Size) {
            debugLog += `(${obj.width}x${obj.height})`;
        } else if (obj instanceof Object) {
            debugLog += `${JSON.stringify(obj)}`;
        }
        cc.warn(debugLog);
    }

}
