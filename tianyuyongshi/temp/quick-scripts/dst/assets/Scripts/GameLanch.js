
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/GameLanch.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcR2FtZUxhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1Qzs7Ozs7OztHQU9HO0FBRUg7SUFBdUMsNkJBQVk7SUFBbkQ7UUFBQSxxRUFHQztRQURHLHNCQUFnQixHQUFZLEtBQUssQ0FBQzs7SUFDdEMsQ0FBQztJQURHO1FBREMsUUFBUTt1REFDeUI7SUFGakIsU0FBUztRQUQ3QixPQUFPO09BQ2EsU0FBUyxDQUc3QjtJQUFELGdCQUFDO0NBSEQsQUFHQyxDQUhzQyxFQUFFLENBQUMsU0FBUyxHQUdsRDtrQkFIb0IsU0FBUyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbi8qKlxuICogTGVnYWN5IHNjZW5lIGNvbXBvbmVudCBzdHViLlxuICpcbiAqIExvYWQuZmlyZSBhbmQgU3RhcnQuZmlyZSBzdGlsbCBjb250YWluIHNlcmlhbGl6ZWQgY29tcG9uZW50cyB0aGF0IHBvaW50IHRvXG4gKiB0aGlzIHNjcmlwdCBVVUlELiBUaGUgb2xkIGFpcnBsYW5lLWJhdHRsZSBsYXVuY2hlciBsb2dpYyBoYXMgYmVlbiByZW1vdmVkO1xuICogdGhpcyBjbGFzcyBpcyBpbnRlbnRpb25hbGx5IGVtcHR5IHNvIHRob3NlIHNjZW5lcyBjYW4gZGVzZXJpYWxpemUgd2l0aG91dFxuICogXCJtaXNzaW5nIG9yIGludmFsaWQgc2NyaXB0XCIgZXJyb3JzLlxuICovXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZUxhbmNoIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcbiAgICBAcHJvcGVydHlcbiAgICBpc1VzaW5nV2ViU29ja2V0OiBib29sZWFuID0gZmFsc2U7XG59XG4iXX0=