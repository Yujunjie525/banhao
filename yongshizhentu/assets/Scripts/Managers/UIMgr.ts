
import ResMgr  from "./ResMgr";
const { ccclass, property } = cc._decorator;

export class UICtrl extends cc.Component {
    protected view = {};

    load_all_object(root, path) {
        for(let i = 0; i < root.childrenCount; i ++) {
            this.view[path + root.children[i].name] = root.children[i];
            this.load_all_object(root.children[i], path + root.children[i].name + "/");
        }
    }

    onLoad () {
        this.view = {};
        this.load_all_object(this.node, "");
    }

    public add_button_listen(view_name, caller, func) {
        var view_node = this.view[view_name];
        if (!view_node) {
            return;
        }
        
        var button = view_node.getComponent(cc.Button);
        if (!button) {
            return;
        }

        view_node.on("click", func, caller);
    }
}

export default class UIMgr extends cc.Component {
    private Canvas: cc.Node = null;
    public static Instance: UIMgr = null;
    private uiMap = {};

    onLoad() {
        if (!UIMgr.Instance || !cc.isValid(UIMgr.Instance)) {
            UIMgr.Instance = this;
        }
        else {
            this.destroy();
            return;
        }

        this.Canvas = this.node.parent;
    }

    onDestroy() {
        if (UIMgr.Instance === this) {
            UIMgr.Instance = null;
        }
    }

    public show_ui(ui_name, data?: any, parent?: cc.Node): cc.Node {
        if (!parent) {
            parent = this.Canvas;
        }
       
        var prefab = ResMgr.Instance.getAsset("ui_prefabs",   ui_name);
        var item = null;
    
        if (prefab) {
          
            item = cc.instantiate(prefab);
            parent.addChild(item);
            var ctrl = item.addComponent(ui_name + "_Ctrl");
            // 如果传入了数据，设置给控制器
            if (data && ctrl) {
                ctrl.data = data;
            }
        }

        this.uiMap[ui_name] = item;
        console.log("场景节点",parent.children)
        return item;
    }

    public remove_ui(ui_name) {
        if (this.uiMap[ui_name]) {
            this.uiMap[ui_name].destroy();
     //     this.uiMap[ui_name].removeFromParent();
            this.uiMap[ui_name] = null;
        }
    }


    // public destroy_ui(ui_name) {
    //     if (this.uiMap[ui_name]) {
    //         this.uiMap[ui_name].destroy()
    //       //  this.uiMap[ui_name].destroy()
    //         this.uiMap[ui_name] = null;
    //     }
    // }

    public clearAll() {
        for (var key in this.uiMap) {
            if (this.uiMap[key]) {
                this.uiMap[key].destroy()
           //   this.uiMap[key].removeFromParent();

                this.uiMap[key] = null;
            }
        }
    }
}
