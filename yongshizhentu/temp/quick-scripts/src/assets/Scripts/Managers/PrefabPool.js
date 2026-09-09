"use strict";
cc._RF.push(module, 'cbcbaROChdIaaY6TkEhT4PR', 'PrefabPool');
// Scripts/Managers/PrefabPool.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ResMgr_1 = require("./ResMgr");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
/**
 * 预制体对象池
 * @author chenkai 2020.6.11
 */
var PrefabPool = /** @class */ (function () {
    function PrefabPool() {
    }
    /**
     * 获取对象
     * @param prefabUrl        预制体路径
     * @param poolHandlerComp  reuse绑定函数
     */
    PrefabPool.get = function (prefabUrl, poolHandlerComp) {
        if (poolHandlerComp === void 0) { poolHandlerComp = null; }
        //创建对象池数组
        if (this.poolList[prefabUrl] == null) {
            this.poolList[prefabUrl] = [];
        }
        //从对象池获取对象，没有则创建
        var pool = this.poolList[prefabUrl];
        var obj;
        if (pool.length == 0) {
            obj = cc.instantiate(ResMgr_1.default.Instance.getAsset("GUI", prefabUrl));
            obj.poolKey = prefabUrl;
        }
        else {
            obj = pool.pop();
        }
        //执行reuse
        var handler = poolHandlerComp ? obj.getComponent(poolHandlerComp) : null;
        if (handler && handler.reuse) {
            handler.reuse.apply(handler, arguments);
        }
        //返回对象
        return obj;
    };
    /**
     * 回收对象
     * @param obj              实体
     * @param poolHandlerComp  unuse绑定函数
     */
    PrefabPool.put = function (obj, poolHandlerComp) {
        if (poolHandlerComp === void 0) { poolHandlerComp = null; }
        var pool = this.poolList[obj.poolKey];
        //判断对象池存在
        if (pool && pool.indexOf(obj) == -1) {
            console.log("我移除了");
            //移除舞台
            // obj.destroy()
            obj.removeFromParent(false);
            //执行unuse
            var handler = poolHandlerComp ? obj.getComponent(poolHandlerComp) : null;
            if (handler && handler.unuse) {
                handler.unuse();
            }
            //存放对象
            console.log("我put了");
            pool.push(obj);
        }
    };
    /**
     * 清理对象池
     * @param prefabUrl 预制体路径
     */
    PrefabPool.clear = function (prefabUrl) {
        var pool = this.poolList[prefabUrl];
        if (pool) {
            for (var i = 0, len = pool.length; i < len; i++) {
                pool[i].destroy();
            }
            pool.length = 0;
        }
    };
    /**清理所有对象池 */
    PrefabPool.clearAll = function () {
        for (var key in this.poolList) {
            this.clear(key);
        }
    };
    /**
     * 对象池长度
     * @param prefabUrl 预制体路径
     */
    PrefabPool.size = function (prefabUrl) {
        var pool = this.poolList[prefabUrl];
        if (pool) {
            return pool.length;
        }
        return 0;
    };
    /**对象池列表 */
    PrefabPool.poolList = {};
    PrefabPool = __decorate([
        ccclass
    ], PrefabPool);
    return PrefabPool;
}());
exports.default = PrefabPool;

cc._RF.pop();