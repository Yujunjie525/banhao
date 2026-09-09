/**
 * BaseComponent -
 * @date 2020/10/31
 * @author lancetop@cn.lancetop
 * @version 1.0
 * @author yk.luo@cn.lancetop
 * @version -alter1.8
 */

import { QuickTool } from "../utils/UtilsToolkit";
import BaseObject from "./BaseObject";

const {ccclass, property} = cc._decorator;
@ccclass
export default class BaseComponent extends cc.Component {

    protected _baseObject: BaseObject;

    public bind (baseObject: BaseObject): BaseComponent {
        this._baseObject = baseObject;
        return this;
    }

    protected onLoad () {
        QuickTool.safeCall(this._baseObject, "onLoad");
    }

    protected onEnable () {
        QuickTool.safeCall(this._baseObject, "onEnable");
    }

    protected start () {
        QuickTool.safeCall(this._baseObject, "start");
    }

    protected update (dt: number) {
        QuickTool.safeCall(this._baseObject, "update", dt);
    }

    protected lateUpdate (dt: number) {
        QuickTool.safeCall(this._baseObject, "lateUpdate", dt);
    }

    protected onDisable () {
        QuickTool.safeCall(this._baseObject, "onDisable");
    }

    protected onDestroy () {
        QuickTool.safeCall(this._baseObject, "onDestroy");
    }

    protected onCollisionEnter (other: cc.Collider, self: cc.Collider) {
        QuickTool.safeCall(this._baseObject, "onCollisionEnter", other, self);
    }

    protected onCollisionStay (other: cc.Collider, self: cc.Collider) {
        QuickTool.safeCall(this._baseObject, "onCollisionStay", other, self);
    }

    protected onCollisionExit (other: cc.Collider, self: cc.Collider) {
        QuickTool.safeCall(this._baseObject, "onCollisionExit", other, self);
    }

    protected onBeginContact (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        QuickTool.safeCall(this._baseObject, "onBeginContact", contact, selfCollider, otherCollider);
    }

    protected onEndContact (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        QuickTool.safeCall(this._baseObject, "onEndContact", contact, selfCollider, otherCollider);
    }

    protected onPreSolve (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        QuickTool.safeCall(this._baseObject, "onPreSolve", contact, selfCollider, otherCollider);
    }

    protected onPostSolve (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        QuickTool.safeCall(this._baseObject, "onPostSolve", contact, selfCollider, otherCollider);
    }

}