import UIBase, { UIClass } from "../base/UIBase";
import { ViewZorder } from "../const/ViewZOrder";
import ResUtils from "../utils/ResUtils";

export default class UIMng {
    private static instance: UIMng;

    private uiList: UIBase[] = [];

    public static getInstance(): UIMng {
        if (this.instance == null) {
            this.instance = new UIMng();
        }
        return this.instance;
    }

    private constructor() {

    }

    /**
    * 打开UI
    * @param uiClass 
    * @param zOrder 
    * @param callback 打开完毕回调函数
    * @param onProgress 打开过程进度函数
    * @param parent UI的父节点
    * @param args 传入到UI的参数
    */
    public openUI<T extends UIBase>(uiClass: UIClass<T>, zOrder: number = ViewZorder.UI, callback?: Function, onProgress?: Function, parent?: cc.Node, ...args: any[]) {
        cc.log("uiClass:", uiClass.getName())
        if (this.getUI(uiClass)) {
            this.closeUI(uiClass);
            this.openUI(uiClass, zOrder, callback, onProgress, parent, ...args);
            return;
        }
        ResUtils.loadAsset<cc.Prefab>(uiClass.getBundleUrl(), cc.Prefab,
            (error, prefab: cc.Prefab) => {
                if (error) {
                    console.error(`UIMng OpenUI: load ui error: ${error} uiname:${uiClass.getName()}`);
                    return;
                }
                if (this.getUI(uiClass)) {
                    console.error(`UIMng OpenUI 2: ui ${uiClass.getName()} is already exist, please check`);
                    return;
                }

                let uiNode: cc.Node = cc.instantiate(prefab);
                let ui = uiNode.getComponent(uiClass) as UIBase;
                if (!ui) {
                    // console.error(`${uiClass.getUrl()}没有绑定UI脚本!!!`);
                    ui = uiNode.addComponent(uiClass);
                    // return;
                }
                if (ui.node.getComponent(cc.Widget) == null) {// 在没有找到穿透解决方案之前。使用些方法 。
                    ui.node.width = cc.winSize.width;
                    ui.node.height = cc.winSize.height;
                }

                ui.node.x = cc.winSize.width / 2;
                ui.node.y = cc.winSize.height / 2;
                ui.init(args);

                if (!parent) {
                    let uiRoot = cc.director.getScene();
                    if (!uiRoot) {
                        console.error(`当前场景${cc.director.getScene().name}Canvas!!!`);
                        return;
                    }
                    parent = uiRoot;
                }

                parent.addChild(uiNode);
                uiNode.zIndex = zOrder;
                this.uiList.push(ui);
                ui.tag = uiClass;

                callback && callback(ui);
            },
            (completedCount: number, totalCount: number, item: any) => {
                onProgress && onProgress(completedCount, totalCount, item);
            }
        );
    }


    /**
     * 清除依赖资源
     * @param prefabUrl 
     */
    private clearDependsRes(prefabUrl) {
        let deps = cc.loader.getDependsRecursively(prefabUrl);
        // console.log(`UIMng clearDependsRes: release ${prefabUrl} depends resources `, deps);
        deps.forEach((item) => {
            // todo：排除公共资源，然后清理
            // if (item.indexOf('common') === -1) {
            //     cc.loader.release(item);
            // }
        });
    }

    public closeUI<T extends UIBase>(uiClass: UIClass<T>) {
        for (let i = 0; i < this.uiList.length; ++i) {
            if (this.uiList[i].tag === uiClass) {
                if (cc.isValid(this.uiList[i].node)) {
                    this.uiList[i].node.destroy();
                    this.clearDependsRes(uiClass.getUrl());
                }
                this.uiList.splice(i, 1);
                return;
            }
        }
    }

    public closeAllUI() {
        if (this.uiList.length == 0) {
            return;
        }
        this.closeUI(this.uiList[0].tag);
        while (this.uiList.length > 0) {
            this.closeUI(this.uiList[0].tag);
        }
    }

    /**
     * 关闭  除了哪个页面以外的所有页面
     * @param uiClass 
     */
    public closeFilterAllUI<T extends UIBase>(uiClass: UIClass<T>) {
        for (let i = this.uiList.length - 1; i >= 0; i--) {
            if (this.uiList[i].tag != uiClass) {
                if (cc.isValid(this.uiList[i].node)) {
                    this.uiList[i].node.destroy();
                    this.clearDependsRes(uiClass.getUrl());
                }
                this.uiList.splice(i, 1);
            }
        }
    }

    public shiftUI() {
        if (this.uiList && this.uiList.length > 1) {
            let index: number = this.uiList.length - 1;
            if (cc.isValid(this.uiList[index].node)) {
                this.uiList[index].node.destroy();
                this.clearDependsRes(this.uiList[index].tag.getUrl());
            }
            this.uiList.splice(index, 1);
            return;
        }
    }

    public showUI<T extends UIBase>(uiClass: UIClass<T>, callback?: Function) {
        let ui = this.getUI(uiClass);
        if (!ui) {
            console.error(`UIMng showUI: ui ${uiClass.getName()} not exist`);
            return;
        }
        ui.node.active = true;
    }

    public hideUI<T extends UIBase>(uiClass: UIClass<T>) {
        let ui = this.getUI(uiClass);
        if (ui) {
            ui.node.active = false;
        }
    }

    public getUI<T extends UIBase>(uiClass: UIClass<T>): UIBase {
        for (let i = 0; i < this.uiList.length; ++i) {
            if (this.uiList[i].tag === uiClass) {
                return this.uiList[i];
            }
        }
        return null;
    }

    public getUIs(): UIBase[] {
        return this.uiList;
    }

    public isShowing<T extends UIBase>(uiClass: UIClass<T>) {
        let ui = this.getUI(uiClass);
        if (!ui) {
            return false;
        }
        return ui.node.active;
    }
}