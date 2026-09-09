
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/LevelSelectManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'f9e40tjO61M7r2qGBtfEI+5', 'LevelSelectManager');
// Scripts/Manager/LevelSelectManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ccclass = cc._decorator.ccclass;
var StateBridge_1 = require("../game2/StateBridge");
var LevelSelectManager = /** @class */ (function (_super) {
    __extends(LevelSelectManager, _super);
    function LevelSelectManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LevelSelectManager.prototype.onEnable = function () {
        StateBridge_1.default.prepareLevelSelection();
        cc.audioEngine.stopAll();
        cc.director.loadScene('xuan');
    };
    LevelSelectManager.prototype.initLevelList = function () {
        StateBridge_1.default.prepareLevelSelection();
    };
    LevelSelectManager = __decorate([
        ccclass
    ], LevelSelectManager);
    return LevelSelectManager;
}(cc.Component));
exports.default = LevelSelectManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcTGV2ZWxTZWxlY3RNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBUSxJQUFBLE9BQU8sR0FBSyxFQUFFLENBQUMsVUFBVSxRQUFsQixDQUFtQjtBQUVsQyxvREFBK0M7QUFHL0M7SUFBZ0Qsc0NBQVk7SUFBNUQ7O0lBVUEsQ0FBQztJQVRHLHFDQUFRLEdBQVI7UUFDSSxxQkFBVyxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDcEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsMENBQWEsR0FBYjtRQUNJLHFCQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBVGdCLGtCQUFrQjtRQUR0QyxPQUFPO09BQ2Esa0JBQWtCLENBVXRDO0lBQUQseUJBQUM7Q0FWRCxBQVVDLENBVitDLEVBQUUsQ0FBQyxTQUFTLEdBVTNEO2tCQVZvQixrQkFBa0IiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IGNjY2xhc3MgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbmltcG9ydCBTdGF0ZUJyaWRnZSBmcm9tICcuLi9nYW1lMi9TdGF0ZUJyaWRnZSc7XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbFNlbGVjdE1hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIG9uRW5hYmxlKCkge1xuICAgICAgICBTdGF0ZUJyaWRnZS5wcmVwYXJlTGV2ZWxTZWxlY3Rpb24oKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbCgpO1xuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ3h1YW4nKTtcbiAgICB9XG5cbiAgICBpbml0TGV2ZWxMaXN0KCkge1xuICAgICAgICBTdGF0ZUJyaWRnZS5wcmVwYXJlTGV2ZWxTZWxlY3Rpb24oKTtcbiAgICB9XG59XG4iXX0=