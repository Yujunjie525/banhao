"use strict";
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