
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/PrefabPool.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFByZWZhYlBvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QjtBQUN4QixJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUk1Qzs7O0dBR0c7QUFFSDtJQUFBO0lBd0ZBLENBQUM7SUFwRkc7Ozs7T0FJRztJQUNXLGNBQUcsR0FBakIsVUFBa0IsU0FBZ0IsRUFBRSxlQUErQjtRQUEvQixnQ0FBQSxFQUFBLHNCQUErQjtRQUMvRCxTQUFTO1FBQ1QsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksRUFBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNqQztRQUNELGdCQUFnQjtRQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNqQixHQUFHLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEUsR0FBVyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7U0FDcEM7YUFBSTtZQUNELEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDcEI7UUFDRCxTQUFTO1FBQ1QsSUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekUsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDM0M7UUFDRCxNQUFNO1FBQ04sT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNXLGNBQUcsR0FBakIsVUFBa0IsR0FBVyxFQUFFLGVBQStCO1FBQS9CLGdDQUFBLEVBQUEsc0JBQStCO1FBQzFELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUUsR0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLFNBQVM7UUFDVCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDbkIsTUFBTTtZQUNQLGdCQUFnQjtZQUNoQixHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsU0FBUztZQUNULElBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3pFLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQzFCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNuQjtZQUNELE1BQU07WUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEI7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ1csZ0JBQUssR0FBbkIsVUFBb0IsU0FBZ0I7UUFDaEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxJQUFHLElBQUksRUFBQztZQUNKLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLEdBQUcsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNyQjtZQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztJQUVELGFBQWE7SUFDQyxtQkFBUSxHQUF0QjtRQUNJLEtBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztZQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNXLGVBQUksR0FBbEIsVUFBbUIsU0FBZ0I7UUFDL0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxJQUFHLElBQUksRUFBQztZQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUN0QjtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQXRGRCxXQUFXO0lBQ0ksbUJBQVEsR0FBRyxFQUFFLENBQUM7SUFGWixVQUFVO1FBRDlCLE9BQU87T0FDYSxVQUFVLENBd0Y5QjtJQUFELGlCQUFDO0NBeEZELEFBd0ZDLElBQUE7a0JBeEZvQixVQUFVIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlc01nciBmcm9tIFwiLi9SZXNNZ3JcIjtcclxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcblxyXG4gXHJcbi8qKlxyXG4gKiDpooTliLbkvZPlr7nosaHmsaBcclxuICogQGF1dGhvciBjaGVua2FpIDIwMjAuNi4xMVxyXG4gKi9cclxuQGNjY2xhc3NcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlZmFiUG9vbCB7XHJcbiAgICAvKirlr7nosaHmsaDliJfooaggKi9cclxuICAgIHByaXZhdGUgc3RhdGljIHBvb2xMaXN0ID0ge307XHJcbiBcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5a+56LGhXHJcbiAgICAgKiBAcGFyYW0gcHJlZmFiVXJsICAgICAgICDpooTliLbkvZPot6/lvoRcclxuICAgICAqIEBwYXJhbSBwb29sSGFuZGxlckNvbXAgIHJldXNl57uR5a6a5Ye95pWwXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KHByZWZhYlVybDpzdHJpbmcsIHBvb2xIYW5kbGVyQ29tcDpGdW5jdGlvbiA9IG51bGwpe1xyXG4gICAgICAgIC8v5Yib5bu65a+56LGh5rGg5pWw57uEXHJcbiAgICAgICAgaWYodGhpcy5wb29sTGlzdFtwcmVmYWJVcmxdID09IG51bGwpe1xyXG4gICAgICAgICAgICB0aGlzLnBvb2xMaXN0W3ByZWZhYlVybF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/ku47lr7nosaHmsaDojrflj5blr7nosaHvvIzmsqHmnInliJnliJvlu7pcclxuICAgICAgICBsZXQgcG9vbCA9IHRoaXMucG9vbExpc3RbcHJlZmFiVXJsXTtcclxuICAgICAgICBsZXQgb2JqO1xyXG4gICAgICAgIGlmIChwb29sLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICBvYmogPSBjYy5pbnN0YW50aWF0ZShSZXNNZ3IuSW5zdGFuY2UuZ2V0QXNzZXQoXCJHVUlcIixwcmVmYWJVcmwpKTtcclxuICAgICAgICAgICAgKG9iaiBhcyBhbnkpLnBvb2xLZXkgPSBwcmVmYWJVcmw7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIG9iaiA9IHBvb2wucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5omn6KGMcmV1c2VcclxuICAgICAgICB2YXIgaGFuZGxlciA9IHBvb2xIYW5kbGVyQ29tcCA/IG9iai5nZXRDb21wb25lbnQocG9vbEhhbmRsZXJDb21wKSA6IG51bGw7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5yZXVzZSkge1xyXG4gICAgICAgICAgICBoYW5kbGVyLnJldXNlLmFwcGx5KGhhbmRsZXIsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v6L+U5Zue5a+56LGhXHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuIFxyXG4gICAgLyoqXHJcbiAgICAgKiDlm57mlLblr7nosaFcclxuICAgICAqIEBwYXJhbSBvYmogICAgICAgICAgICAgIOWunuS9k1xyXG4gICAgICogQHBhcmFtIHBvb2xIYW5kbGVyQ29tcCAgdW51c2Xnu5Hlrprlh73mlbBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwdXQob2JqOmNjLk5vZGUsIHBvb2xIYW5kbGVyQ29tcDpGdW5jdGlvbiA9IG51bGwpe1xyXG4gICAgICAgIGxldCBwb29sID0gdGhpcy5wb29sTGlzdFsob2JqIGFzIGFueSkucG9vbEtleV07XHJcbiAgICAgICAgLy/liKTmlq3lr7nosaHmsaDlrZjlnKhcclxuICAgICAgICBpZiAocG9vbCAmJiBwb29sLmluZGV4T2Yob2JqKSA9PSAtMSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuaIkeenu+mZpOS6hlwiKVxyXG4gICAgICAgICAgICAvL+enu+mZpOiInuWPsFxyXG4gICAgICAgICAgIC8vIG9iai5kZXN0cm95KClcclxuICAgICAgICAgICBvYmoucmVtb3ZlRnJvbVBhcmVudChmYWxzZSk7XHJcbiAgICAgICAgICAgIC8v5omn6KGMdW51c2VcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBwb29sSGFuZGxlckNvbXAgPyBvYmouZ2V0Q29tcG9uZW50KHBvb2xIYW5kbGVyQ29tcCkgOiBudWxsO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLnVudXNlKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyLnVudXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy/lrZjmlL7lr7nosaFcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLmiJFwdXTkuoZcIilcclxuICAgICAgICAgICAgcG9vbC5wdXNoKG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gXHJcbiAgICAvKipcclxuICAgICAqIOa4heeQhuWvueixoeaxoFxyXG4gICAgICogQHBhcmFtIHByZWZhYlVybCDpooTliLbkvZPot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGVhcihwcmVmYWJVcmw6c3RyaW5nKXtcclxuICAgICAgICBsZXQgcG9vbCA9IHRoaXMucG9vbExpc3RbcHJlZmFiVXJsXTtcclxuICAgICAgICBpZihwb29sKXtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsbGVuPXBvb2wubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHBvb2xbaV0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvb2wubGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiBcclxuICAgIC8qKua4heeQhuaJgOacieWvueixoeaxoCAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGVhckFsbCgpe1xyXG4gICAgICAgIGZvcihsZXQga2V5IGluIHRoaXMucG9vbExpc3Qpe1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gXHJcbiAgICAvKipcclxuICAgICAqIOWvueixoeaxoOmVv+W6plxyXG4gICAgICogQHBhcmFtIHByZWZhYlVybCDpooTliLbkvZPot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzaXplKHByZWZhYlVybDpzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcG9vbCA9IHRoaXMucG9vbExpc3RbcHJlZmFiVXJsXTtcclxuICAgICAgICBpZihwb29sKXtcclxuICAgICAgICAgICAgcmV0dXJuIHBvb2wubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufSJdfQ==