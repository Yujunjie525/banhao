import EventMng from "../manager/EventMng";

export interface UIClass<T extends UIBase> {
    new(): T;
    getBundleName(): string;
    getBundleUrl(): string;
    getUrl(): string;
    getName(): string;
}

const PREFAB_UI_DIR = 'prefab/';

const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class UIBase extends cc.Component {
    protected static bundleName;
    protected static prefabUrl;
    protected static className;

    params = {};

    protected mTag: any;
    public get tag(): any {
        return this.mTag;
    }
    public set tag(value: any) {
        this.mTag = value;
    }

    public static getBundleName(): string {
        return this.bundleName;
    }

    public static getBundleUrl(): string {
        return this.bundleName + ":" + this.getUrl();
    }

    /**
     * 得到prefab的路径，相对于resources目录
     */
    public static getUrl(): string {
        return PREFAB_UI_DIR + this.prefabUrl;
    }

    /**
     * 类名，用于给UI命名
     */
    public static getName(): string {
        return this.className;
    }

    /* ----------------------------- 以下方法不能在子类重写 ----------------------------- */
    /**初始化函数，在onLoad之前被调用，params为打开ui是传入的不定参数数组 */
    init(params) {
        this.onInit(params);
    }

    /**onLoad 会在组件被首次加载的时候被回调。且优先于任何start */
    onLoad() {
        this.onUILoad();
    }

    onDestroy() {
        this.onUIDestroy();
    }

    onEnable() {

        this.onShow();
    }

    onDisable() {

        this.onHide();
    }

    /**注册notice事件，disable的时候会自动移除 */
    initEvent(eventName: string, cb: Function) {
        EventMng.on(eventName, cb, this);
    }

    private touchEvent(event) {
        event.stopPropagation();
    }

    start() {
        this.onStart();
    }

    update(dt) {
        this.onUpdate(dt);
    }
    /* ---------------------------------------------------------------------------------- */


    onInit(params) {
        this.params = params;
    }

    onUILoad() {

    }

    onUIDestroy() {

    }

    onShow() {

    }

    onHide() {

    }

    onStart() {

    }

    onUpdate(dt) {

    }

    onClose() {

    }

}