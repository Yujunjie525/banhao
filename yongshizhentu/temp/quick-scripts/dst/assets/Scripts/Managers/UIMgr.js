
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/UIMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFVJTWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQStCO0FBQ3pCLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDO0lBQTRCLDBCQUFZO0lBQXhDO1FBQUEscUVBNEJDO1FBM0JhLFVBQUksR0FBRyxFQUFFLENBQUM7O0lBMkJ4QixDQUFDO0lBekJHLGdDQUFlLEdBQWYsVUFBZ0IsSUFBSSxFQUFFLElBQUk7UUFDdEIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFHLEVBQUU7WUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDOUU7SUFDTCxDQUFDO0lBRUQsdUJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxrQ0FBaUIsR0FBeEIsVUFBeUIsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJO1FBQzVDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZ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LENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQzlCLHdDQUF3QztnQkFFbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDMUI7U0FDSjtJQUNMLENBQUM7SUF2RWEsY0FBUSxHQUFVLElBQUksQ0FBQztJQXdFekMsWUFBQztDQTFFRCxBQTBFQyxDQTFFa0MsRUFBRSxDQUFDLFNBQVMsR0EwRTlDO2tCQTFFb0IsS0FBSyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgUmVzTWdyICBmcm9tIFwiLi9SZXNNZ3JcIjtcclxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbmV4cG9ydCBjbGFzcyBVSUN0cmwgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG4gICAgcHJvdGVjdGVkIHZpZXcgPSB7fTtcclxuXHJcbiAgICBsb2FkX2FsbF9vYmplY3Qocm9vdCwgcGF0aCkge1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCByb290LmNoaWxkcmVuQ291bnQ7IGkgKyspIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3W3BhdGggKyByb290LmNoaWxkcmVuW2ldLm5hbWVdID0gcm9vdC5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkX2FsbF9vYmplY3Qocm9vdC5jaGlsZHJlbltpXSwgcGF0aCArIHJvb3QuY2hpbGRyZW5baV0ubmFtZSArIFwiL1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25Mb2FkICgpIHtcclxuICAgICAgICB0aGlzLnZpZXcgPSB7fTtcclxuICAgICAgICB0aGlzLmxvYWRfYWxsX29iamVjdCh0aGlzLm5vZGUsIFwiXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRfYnV0dG9uX2xpc3Rlbih2aWV3X25hbWUsIGNhbGxlciwgZnVuYykge1xyXG4gICAgICAgIHZhciB2aWV3X25vZGUgPSB0aGlzLnZpZXdbdmlld19uYW1lXTtcclxuICAgICAgICBpZiAoIXZpZXdfbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBidXR0b24gPSB2aWV3X25vZGUuZ2V0Q29tcG9uZW50KGNjLkJ1dHRvbik7XHJcbiAgICAgICAgaWYgKCFidXR0b24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmlld19ub2RlLm9uKFwiY2xpY2tcIiwgZnVuYywgY2FsbGVyKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVUlNZ3IgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG4gICAgcHJpdmF0ZSBDYW52YXM6IGNjLk5vZGUgPSBudWxsO1xyXG4gICAgcHVibGljIHN0YXRpYyBJbnN0YW5jZTogVUlNZ3IgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSB1aU1hcCA9IHt9O1xyXG5cclxuICAgIG9uTG9hZCgpIHtcclxuICAgICAgICBpZiAoIVVJTWdyLkluc3RhbmNlIHx8ICFjYy5pc1ZhbGlkKFVJTWdyLkluc3RhbmNlKSkge1xyXG4gICAgICAgICAgICBVSU1nci5JbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5DYW52YXMgPSB0aGlzLm5vZGUucGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIG9uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAoVUlNZ3IuSW5zdGFuY2UgPT09IHRoaXMpIHtcclxuICAgICAgICAgICAgVUlNZ3IuSW5zdGFuY2UgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvd191aSh1aV9uYW1lLCBkYXRhPzogYW55LCBwYXJlbnQ/OiBjYy5Ob2RlKTogY2MuTm9kZSB7XHJcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5DYW52YXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgXHJcbiAgICAgICAgdmFyIHByZWZhYiA9IFJlc01nci5JbnN0YW5jZS5nZXRBc3NldChcInVpX3ByZWZhYnNcIiwgICB1aV9uYW1lKTtcclxuICAgICAgICB2YXIgaXRlbSA9IG51bGw7XHJcbiAgICBcclxuICAgICAgICBpZiAocHJlZmFiKSB7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgICAgaXRlbSA9IGNjLmluc3RhbnRpYXRlKHByZWZhYik7XHJcbiAgICAgICAgICAgIHBhcmVudC5hZGRDaGlsZChpdGVtKTtcclxuICAgICAgICAgICAgdmFyIGN0cmwgPSBpdGVtLmFkZENvbXBvbmVudCh1aV9uYW1lICsgXCJfQ3RybFwiKTtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5Lyg5YWl5LqG5pWw5o2u77yM6K6+572u57uZ5o6n5Yi25ZmoXHJcbiAgICAgICAgICAgIGlmIChkYXRhICYmIGN0cmwpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudWlNYXBbdWlfbmFtZV0gPSBpdGVtO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwi5Zy65pmv6IqC54K5XCIscGFyZW50LmNoaWxkcmVuKVxyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVfdWkodWlfbmFtZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnVpTWFwW3VpX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMudWlNYXBbdWlfbmFtZV0uZGVzdHJveSgpO1xyXG4gICAgIC8vICAgICB0aGlzLnVpTWFwW3VpX25hbWVdLnJlbW92ZUZyb21QYXJlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy51aU1hcFt1aV9uYW1lXSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBwdWJsaWMgZGVzdHJveV91aSh1aV9uYW1lKSB7XHJcbiAgICAvLyAgICAgaWYgKHRoaXMudWlNYXBbdWlfbmFtZV0pIHtcclxuICAgIC8vICAgICAgICAgdGhpcy51aU1hcFt1aV9uYW1lXS5kZXN0cm95KClcclxuICAgIC8vICAgICAgIC8vICB0aGlzLnVpTWFwW3VpX25hbWVdLmRlc3Ryb3koKVxyXG4gICAgLy8gICAgICAgICB0aGlzLnVpTWFwW3VpX25hbWVdID0gbnVsbDtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyQWxsKCkge1xyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnVpTWFwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnVpTWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudWlNYXBba2V5XS5kZXN0cm95KClcclxuICAgICAgICAgICAvLyAgIHRoaXMudWlNYXBba2V5XS5yZW1vdmVGcm9tUGFyZW50KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy51aU1hcFtrZXldID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=