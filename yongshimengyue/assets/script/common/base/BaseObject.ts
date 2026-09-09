/**
 * BaseObject -
 * @date 2020/10/31
 * @author lancetop@cn.lancetop
 * @version 1.0
 * @author yk.luo@cn.lancetop
 * @version -alter1.8
 */

import { TweenPreSet } from "../const/Define";
import { INF } from "../const/GlobalConst";
import { EventCenterManager } from "../utils/ManagerToolkit";
import { QuickTool, UUIDUtils } from "../utils/UtilsToolkit";
import BaseComponent from "./BaseComponent";

/**
 * 注: 节点不能重名
 */
export default abstract class BaseObject {
    private _nmp: Map<string, cc.Node>;

    private _node: cc.Node;
    public get node(): cc.Node {
        return this._node;
    }

    public get name(): string {
        return this._node.name;
    }

    public get uuid(): string {
        return this._node.uuid;
    }

    private _comp: BaseComponent;

    private _duration: number;
    private _timeFlagMap: Map<string, number>;

    /**
     * BaseObject
     * @param prefab 
     * @param name 
     * @since 1.0
     * @alter 1.4 兼容NodePool创建方式
     */
    public constructor (prefab: cc.Prefab | cc.Node, name?: string) {
        if (prefab instanceof cc.Prefab) this._node = cc.instantiate(prefab);
        else this._node = prefab;
        this._node.name = name || `${prefab.name}-${UUIDUtils.randomUUID()}`;

        this._comp = this._node.getComponent(BaseComponent);
        if (QuickTool.isNotNull(this._comp)) this._comp.bind(this);
        else this._comp = this._node.addComponent(BaseComponent).bind(this);

        this._nmp = new Map<string, cc.Node>();
        this._nmp.set(this._node.name, this._node);

        this._duration = 0.0;
        this._timeFlagMap = new Map<string, number>();

    }

    public findNode(name: string): cc.Node {
        return this.find(name) as cc.Node;
    }

    public findComponent<T extends cc.Component>(name: string, component: typeof cc.Component): T {
        return this.find(name, component) as T;
    }

    protected find<T extends cc.Component>(name: string, component?: typeof cc.Component): cc.Node | T {
        let node: cc.Node = null;
        node = this._nmp.get(name);
        if (QuickTool.isInValid(node)) {
            // find cc.Node
            node = this.findChildByName(name, this._node);
            if (QuickTool.isInValid(node)) return null;
            this._nmp.set(name, node);
        }
        if (!component) {
            // return cc.Node
            return node;
        } else {
            // find cc.Component
            return node.getComponent(component) as T;
        }
    }

    /**
     * 修复动态节点增删导致的错误
     * @since alter1.1 by yk.luo
     */
    private findChildByName(name: string, node: cc.Node): cc.Node {
        if (QuickTool.isInValid(node)) return null;
        let ans = node.getChildByName(name);
        if (!ans) {
            for (let i = 0; i < node.childrenCount; i++) {
                if (ans = this.findChildByName(name, node.children[i])) break;
            }
        }
        return ans;
    }

    protected onLoad () {

    }

    protected onEnable () {

    }

    protected start () {

    }

    protected update (dt: number) {
        this._duration += dt;
    }

    protected lateUpdate (dt: number) {

    }

    protected onDisable () {

    }

    protected onDestroy () {
        this._comp.unscheduleAllCallbacks();
    }

    protected scheduleOnce (callback: Function, delay?: number) {
        this._comp.scheduleOnce(callback, delay);
    }

    protected schedule (callback: Function, interval?: number, repeat?: number, delay?: number) {
        this._comp.schedule(callback, interval, repeat, delay);
    }

    protected unschedule (callback_fn: Function) {
        this._comp.unschedule(callback_fn);
    }

    public onCenterEvent<T extends Function>(type: string, callback: T, target: any): T {
        return EventCenterManager.getInstance().onCenterEvent(type, callback, target);
    }

    public onceCenterEvent(type: string, callback: (arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) => void, target: any): void {
        EventCenterManager.getInstance().onceCenterEvent(type, callback, target);
    }

    public offCenterEvent(type: string, callback: Function, target: any): void {
        EventCenterManager.getInstance().offCenterEvent(type, callback, target);
    }

    protected flag (tag: string) {
        this._timeFlagMap.set(tag, this._duration);
    }

    protected calcDuration (tag: string): number {
        let currentTime: number = this._duration;
        let lastTime: number = this._timeFlagMap.get(tag);
        if (QuickTool.isNull(lastTime)) {
            this.flag(tag);
            return 0.0;
        }
        let durationTime: number = cc.misc.clampf(currentTime - lastTime, 0.0, INF);
        this.flag(tag);
        return durationTime;
    }

    protected onDisplay () {

    }

    protected onHide () {

    }

    protected fadeIn () {
        this.node.opacity = 0.0;
        TweenPreSet.fadeIn.clone(this.node).call(this.onDisplay.bind(this)).start();
    }

    protected fadeOut () {
        this.node.opacity = 255.0;
        TweenPreSet.fadeOut.clone(this.node).call(this.onHide.bind(this)).start();
    }

}