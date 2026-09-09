"use strict";
cc._RF.push(module, '2b8d8NFNKdGr7LzuGheHQGA', 'GameLanch');
// Scripts/GameLanch.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
/**
 * Legacy scene component stub.
 *
 * Load.fire and Start.fire still contain serialized components that point to
 * this script UUID. The old airplane-battle launcher logic has been removed;
 * this class is intentionally empty so those scenes can deserialize without
 * "missing or invalid script" errors.
 */
var GameLanch = /** @class */ (function (_super) {
    __extends(GameLanch, _super);
    function GameLanch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isUsingWebSocket = false;
        return _this;
    }
    __decorate([
        property
    ], GameLanch.prototype, "isUsingWebSocket", void 0);
    GameLanch = __decorate([
        ccclass
    ], GameLanch);
    return GameLanch;
}(cc.Component));
exports.default = GameLanch;

cc._RF.pop();