"use strict";
cc._RF.push(module, '98c22AOEztEc7gkdzvbGRrU', 'UIMgr');
// Scripts/Managers/UIMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
exports.UICtrl = void 0;
var ResMgr_1 = require("./ResMgr");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var UICtrl = /** @class */ (function (_super) {
    __extends(UICtrl, _super);
    function UICtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.view = {};
        return _this;
    }
    UICtrl.prototype.load_all_object = function (root, path) {
        for (var i = 0; i < root.childrenCount; i++) {
            this.view[path + root.children[i].name] = root.children[i];
            this.load_all_object(root.children[i], path + root.children[i].name + "/");
        }
    };
    UICtrl.prototype.onLoad = function () {
        this.view = {};
        this.load_all_object(this.node, "");
    };
    UICtrl.prototype.add_button_listen = function (view_name, caller, func) {
        var view_node = this.view[view_name];
        if (!view_node) {
            return;
        }
        var button = view_node.getComponent(cc.Button);
        if (!button) {
            return;
        }
        view_node.on("click", func, caller);
    };
    return UICtrl;
}(cc.Component));
exports.UICtrl = UICtrl;
var UIMgr = /** @class */ (function (_super) {
    __extends(UIMgr, _super);
    function UIMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Canvas = null;
        _this.uiMap = {};
        return _this;
    }
    UIMgr.prototype.onLoad = function () {
        if (!UIMgr.Instance || !cc.isValid(UIMgr.Instance)) {
            UIMgr.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
        this.Canvas = this.node.parent;
    };
    UIMgr.prototype.onDestroy = function () {
        if (UIMgr.Instance === this) {
            UIMgr.Instance = null;
        }
    };
    UIMgr.prototype.show_ui = function (ui_name, data, parent) {
        if (!parent) {
            parent = this.Canvas;
        }
        var prefab = ResMgr_1.default.Instance.getAsset("ui_prefabs", ui_name);
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
        console.log("场景节点", parent.children);
        return item;
    };
    UIMgr.prototype.remove_ui = function (ui_name) {
        if (this.uiMap[ui_name]) {
            this.uiMap[ui_name].destroy();
            //     this.uiMap[ui_name].removeFromParent();
            this.uiMap[ui_name] = null;
        }
    };
    // public destroy_ui(ui_name) {
    //     if (this.uiMap[ui_name]) {
    //         this.uiMap[ui_name].destroy()
    //       //  this.uiMap[ui_name].destroy()
    //         this.uiMap[ui_name] = null;
    //     }
    // }
    UIMgr.prototype.clearAll = function () {
        for (var key in this.uiMap) {
            if (this.uiMap[key]) {
                this.uiMap[key].destroy();
                //   this.uiMap[key].removeFromParent();
                this.uiMap[key] = null;
            }
        }
    };
    UIMgr.Instance = null;
    return UIMgr;
}(cc.Component));
exports.default = UIMgr;

cc._RF.pop();