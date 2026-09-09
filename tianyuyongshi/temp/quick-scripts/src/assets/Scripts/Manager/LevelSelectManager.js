"use strict";
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