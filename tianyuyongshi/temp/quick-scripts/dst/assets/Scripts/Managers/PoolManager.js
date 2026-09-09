
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/PoolManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '57099GOZ5FJZKQdU10ra1y/', 'PoolManager');
// Scripts/Managers/PoolManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var PoolManager = /** @class */ (function (_super) {
    __extends(PoolManager, _super);
    function PoolManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allPrefab = [];
        _this.allPrefabMap = null;
        _this.poolMap = null;
        return _this;
    }
    PoolManager_1 = PoolManager;
    // LIFE-CYCLE CALLBACKS:
    PoolManager.prototype.onLoad = function () {
        if (PoolManager_1.Instance != null) {
            PoolManager_1.Instance.destroy();
        }
        PoolManager_1.Instance = this;
        this.allPrefabMap = new Map();
        this.poolMap = new Map();
        for (var i = 0; i < this.allPrefab.length; i++) {
            this.allPrefabMap.set(this.allPrefab[i].name, this.allPrefab[i]);
            cc.log(this.allPrefab[i].name);
            var nodePool = new cc.NodePool();
            this.poolMap.set(this.allPrefab[i].name, nodePool);
            // console.log("创建时名称："+this.allPrefabMap[i].name)
            // console.log("节点池名字："+ this.poolMap[i].name)
        }
        this.allPrefabMap.forEach(function (value, key) {
            console.log("value：", value, "key:", key);
        });
        this.poolMap.forEach(function (value, key) {
            console.log("value：", value, "key:", key);
        });
    };
    /**从对象池中取出对象*/
    PoolManager.Spawn = function (_prefabName, _parent) {
        if (_parent === void 0) { _parent = null; }
        if (!PoolManager_1.Instance.poolMap.has(_prefabName)) {
            cc.warn('no prefab named ' + _prefabName);
            return null;
        }
        var pool = PoolManager_1.Instance.poolMap.get(_prefabName);
        if (pool.size() > 0) {
            var object = pool.get();
            console.log("我拿了一个");
            if (_parent != null)
                object.parent = _parent;
            var pos_enemy1 = cc.v2(0, 0);
            pos_enemy1.x = -200 + Math.random() * 420;
            pos_enemy1.y = 600 + Math.random() * 200;
            object.setPosition(pos_enemy1);
            return object;
        }
        else {
            var newObject = cc.instantiate(PoolManager_1.Instance.allPrefabMap.get(_prefabName));
            console.log("我新创建了一个");
            if (_parent != null)
                newObject.parent = _parent;
            var pos_enemy = cc.v2(0, 0);
            pos_enemy.x = -200 + Math.random() * 420;
            pos_enemy.y = 600 + Math.random() * 200;
            newObject.setPosition(pos_enemy);
            return newObject;
        }
    };
    PoolManager.Despawn = function (_prefabName, _node) {
        if (!PoolManager_1.Instance.poolMap.has(_prefabName)) {
            cc.log('回收失败,节点名 : ' + _prefabName);
            return null;
        }
        var pool = PoolManager_1.Instance.poolMap.get(_prefabName);
        pool.put(_node);
        cc.log('回收成功,节点名 : ', _node, "节点池：", PoolManager_1.Instance.poolMap.get(_prefabName));
        // _node.destroy()
    };
    PoolManager.GetPrefab = function (_prefabName) {
        if (!PoolManager_1.Instance.allPrefabMap.has(_prefabName))
            return null;
        return PoolManager_1.Instance.allPrefabMap.get(_prefabName);
    };
    PoolManager.Preload = function (_prefabName, _count) {
        if (!PoolManager_1.Instance.poolMap.has(_prefabName))
            return null;
        var pool = PoolManager_1.Instance.poolMap.get(_prefabName);
        for (var i = 0; i < _count; i++) {
            var newObject = cc.instantiate(PoolManager_1.Instance.allPrefabMap.get(_prefabName));
            pool.put(newObject);
        }
    };
    var PoolManager_1;
    PoolManager.Instance = null;
    __decorate([
        property([cc.Prefab])
    ], PoolManager.prototype, "allPrefab", void 0);
    PoolManager = PoolManager_1 = __decorate([
        ccclass
    ], PoolManager);
    return PoolManager;
}(cc.Component));
exports.default = PoolManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFBvb2xNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUF5QywrQkFBWTtJQUFyRDtRQUFBLHFFQWtHQztRQS9GVyxlQUFTLEdBQWdCLEVBQUUsQ0FBQztRQUk1QixrQkFBWSxHQUEyQixJQUFJLENBQUM7UUFDNUMsYUFBTyxHQUE2QixJQUFJLENBQUM7O0lBMEZyRCxDQUFDO29CQWxHb0IsV0FBVztJQVM1Qix3QkFBd0I7SUFFeEIsNEJBQU0sR0FBTjtRQUNJLElBQUcsYUFBVyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUM7WUFDNUIsYUFBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNsQztRQUNELGFBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBRTVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztRQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixJQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUs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LFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN2QjtJQUNMLENBQUM7O0lBNUZhLG9CQUFRLEdBQWdCLElBQUksQ0FBQztJQUYzQztRQURDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztrREFDYztJQUhuQixXQUFXO1FBRC9CLE9BQU87T0FDYSxXQUFXLENBa0cvQjtJQUFELGtCQUFDO0NBbEdELEFBa0dDLENBbEd3QyxFQUFFLENBQUMsU0FBUyxHQWtHcEQ7a0JBbEdvQixXQUFXIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcclxuIFxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb29sTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiBcclxuICAgIEBwcm9wZXJ0eShbY2MuUHJlZmFiXSlcclxuICAgIHByaXZhdGUgYWxsUHJlZmFiOiBjYy5QcmVmYWJbXSA9IFtdO1xyXG4gXHJcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBQb29sTWFuYWdlciA9IG51bGw7XHJcbiBcclxuICAgIHByaXZhdGUgYWxsUHJlZmFiTWFwOiBNYXA8c3RyaW5nLCBjYy5QcmVmYWI+ID0gbnVsbDtcclxuICAgIHByaXZhdGUgcG9vbE1hcDogTWFwPHN0cmluZywgY2MuTm9kZVBvb2w+ID0gbnVsbDtcclxuICAgIC8vIExJRkUtQ1lDTEUgQ0FMTEJBQ0tTOlxyXG4gXHJcbiAgICBvbkxvYWQoKSB7XHJcbiAgICAgICAgaWYoUG9vbE1hbmFnZXIuSW5zdGFuY2UgIT0gbnVsbCl7XHJcbiAgICAgICAgICAgIFBvb2xNYW5hZ2VyLkluc3RhbmNlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUG9vbE1hbmFnZXIuSW5zdGFuY2UgPSB0aGlzO1xyXG4gXHJcbiAgICAgICAgdGhpcy5hbGxQcmVmYWJNYXAgPSBuZXcgTWFwPHN0cmluZywgY2MuUHJlZmFiPigpO1xyXG4gICAgICAgIHRoaXMucG9vbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBjYy5Ob2RlUG9vbD4oKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYWxsUHJlZmFiLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsUHJlZmFiTWFwLnNldCh0aGlzLmFsbFByZWZhYltpXS5uYW1lLCB0aGlzLmFsbFByZWZhYltpXSk7XHJcbiAgICAgICAgICAgIGNjLmxvZyh0aGlzLmFsbFByZWZhYltpXS5uYW1lKTtcclxuICAgICAgICAgICAgbGV0IG5vZGVQb29sID0gbmV3IGNjLk5vZGVQb29sKCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9vbE1hcC5zZXQodGhpcy5hbGxQcmVmYWJbaV0ubmFtZSwgbm9kZVBvb2wpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIuWIm+W7uuaXtuWQjeensO+8mlwiK3RoaXMuYWxsUHJlZmFiTWFwW2ldLm5hbWUpXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi6IqC54K55rGg5ZCN5a2X77yaXCIrIHRoaXMucG9vbE1hcFtpXS5uYW1lKVxyXG4gICAgICAgIH1cclxuICAgICAgIHRoaXMuIGFsbFByZWZhYk1hcC4gIGZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ2YWx1Ze+8mlwiLHZhbHVlLFwia2V5OlwiLGtleSlcclxuICAgICAgICB9KSBcclxuICAgICAgIHRoaXMucG9vbE1hcC4gZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInZhbHVl77yaXCIsdmFsdWUsXCJrZXk6XCIsa2V5KVxyXG5cclxuICAgICAgICB9KSBcclxuICAgIH1cclxuIFxyXG4gICAgLyoq5LuO5a+56LGh5rGg5Lit5Y+W5Ye65a+56LGhKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU3Bhd24oX3ByZWZhYk5hbWU6IHN0cmluZywgX3BhcmVudDogY2MuTm9kZSA9IG51bGwpIHtcclxuIFxyXG4gICAgICAgIGlmICghUG9vbE1hbmFnZXIuSW5zdGFuY2UucG9vbE1hcC5oYXMoX3ByZWZhYk5hbWUpKXtcclxuICAgICAgICAgICAgY2Mud2Fybignbm8gcHJlZmFiIG5hbWVkICcgKyBfcHJlZmFiTmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcG9vbDogY2MuTm9kZVBvb2wgPSBQb29sTWFuYWdlci5JbnN0YW5jZS5wb29sTWFwLmdldChfcHJlZmFiTmFtZSk7XHJcbiAgICAgICAgaWYgKHBvb2wuc2l6ZSgpID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgb2JqZWN0ID0gcG9vbC5nZXQoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLmiJHmi7/kuobkuIDkuKpcIilcclxuICAgICAgICAgICAgaWYgKF9wYXJlbnQgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIG9iamVjdC5wYXJlbnQgPSBfcGFyZW50O1xyXG4gICAgICAgICAgICAgICAgdmFyIHBvc19lbmVteTE6Y2MuVmVjMj1jYy52MigwLDApXHJcbiAgICAgICAgICAgICAgICBwb3NfZW5lbXkxLnggPSAtMjAwICsgTWF0aC5yYW5kb20oKSAqIDQyMFxyXG4gICAgICAgICAgICAgICAgcG9zX2VuZW15MS55ID0gNjAwICsgTWF0aC5yYW5kb20oKSAqIDIwMFxyXG4gICAgICAgICAgICAgICAgb2JqZWN0LnNldFBvc2l0aW9uKHBvc19lbmVteTEpXHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbmV3T2JqZWN0ID0gY2MuaW5zdGFudGlhdGUoUG9vbE1hbmFnZXIuSW5zdGFuY2UuYWxsUHJlZmFiTWFwLmdldChfcHJlZmFiTmFtZSkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuaIkeaWsOWIm+W7uuS6huS4gOS4qlwiKVxyXG4gICAgICAgICAgICBpZiAoX3BhcmVudCAhPSBudWxsKVxyXG5cclxuICAgICAgICAgICAgICAgIG5ld09iamVjdC5wYXJlbnQgPSBfcGFyZW50OyAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIHBvc19lbmVteTpjYy5WZWMyPWNjLnYyKDAsMClcclxuICAgICAgICAgICAgICAgIHBvc19lbmVteS54ID0gLTIwMCArIE1hdGgucmFuZG9tKCkgKiA0MjBcclxuICAgICAgICAgICAgICAgIHBvc19lbmVteS55ID0gNjAwICsgTWF0aC5yYW5kb20oKSAqIDIwMFxyXG4gICAgICAgICAgICAgICAgbmV3T2JqZWN0LnNldFBvc2l0aW9uKHBvc19lbmVteSlcclxuICAgICAgICAgICAgcmV0dXJuIG5ld09iamVjdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiBcclxuICAgIHB1YmxpYyBzdGF0aWMgRGVzcGF3bihfcHJlZmFiTmFtZTogc3RyaW5nLCBfbm9kZTogY2MuTm9kZSkge1xyXG4gICAgICAgIGlmICghUG9vbE1hbmFnZXIuSW5zdGFuY2UucG9vbE1hcC5oYXMoX3ByZWZhYk5hbWUpKXtcclxuICAgICAgICAgICAgY2MubG9nKCflm57mlLblpLHotKUs6IqC54K55ZCNIDogJyArIF9wcmVmYWJOYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBwb29sOiBjYy5Ob2RlUG9vbCA9IFBvb2xNYW5hZ2VyLkluc3RhbmNlLnBvb2xNYXAuZ2V0KF9wcmVmYWJOYW1lKTtcclxuXHJcbiAgICAgICAgcG9vbC5wdXQoX25vZGUpO1xyXG4gICAgICAgIGNjLmxvZygn5Zue5pS25oiQ5YqfLOiKgueCueWQjSA6ICcgLCBfbm9kZSxcIuiKgueCueaxoO+8mlwiLFBvb2xNYW5hZ2VyLkluc3RhbmNlLnBvb2xNYXAuZ2V0KF9wcmVmYWJOYW1lKSlcclxuXHJcbiAgICAgIC8vIF9ub2RlLmRlc3Ryb3koKVxyXG4gICAgfVxyXG4gXHJcbiAgICBwdWJsaWMgc3RhdGljIEdldFByZWZhYihfcHJlZmFiTmFtZSkge1xyXG4gICAgICAgIGlmICghUG9vbE1hbmFnZXIuSW5zdGFuY2UuYWxsUHJlZmFiTWFwLmhhcyhfcHJlZmFiTmFtZSkpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBQb29sTWFuYWdlci5JbnN0YW5jZS5hbGxQcmVmYWJNYXAuZ2V0KF9wcmVmYWJOYW1lKTtcclxuICAgIH1cclxuIFxyXG4gICAgcHVibGljIHN0YXRpYyBQcmVsb2FkKF9wcmVmYWJOYW1lLCBfY291bnQpIHtcclxuICAgICAgICBpZiAoIVBvb2xNYW5hZ2VyLkluc3RhbmNlLnBvb2xNYXAuaGFzKF9wcmVmYWJOYW1lKSlcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiBcclxuICAgICAgICBsZXQgcG9vbDogY2MuTm9kZVBvb2wgPSBQb29sTWFuYWdlci5JbnN0YW5jZS5wb29sTWFwLmdldChfcHJlZmFiTmFtZSk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbmV3T2JqZWN0ID0gY2MuaW5zdGFudGlhdGUoUG9vbE1hbmFnZXIuSW5zdGFuY2UuYWxsUHJlZmFiTWFwLmdldChfcHJlZmFiTmFtZSkpO1xyXG4gICAgICAgICAgICBwb29sLnB1dChuZXdPYmplY3QpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=