"use strict";
cc._RF.push(module, '894b78TzxVCLYl5Cx61MdQ0', 'EventMgr');
// Scripts/Managers/EventMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var EventMgr = /** @class */ (function (_super) {
    __extends(EventMgr, _super);
    function EventMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.events_map = {};
        return _this;
    }
    EventMgr_1 = EventMgr;
    EventMgr.prototype.onLoad = function () {
        if (!EventMgr_1.Instance || !cc.isValid(EventMgr_1.Instance)) {
            EventMgr_1.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
    };
    EventMgr.prototype.onDestroy = function () {
        if (EventMgr_1.Instance === this) {
            EventMgr_1.Instance = null;
        }
    };
    // func(event_name: string, udata: any)
    EventMgr.prototype.add_event_listenner = function (event_name, caller, func) {
        if (!this.events_map[event_name]) {
            this.events_map[event_name] = [];
        }
        var event_queue = this.events_map[event_name];
        event_queue.push({
            caller: caller,
            func: func
        });
    };
    EventMgr.prototype.remove_event_listenner = function (event_name, caller, func) {
        if (!this.events_map || !this.events_map[event_name]) {
            return;
        }
        var event_queue = this.events_map[event_name];
        for (var i = 0; i < event_queue.length; i++) {
            var obj = event_queue[i];
            if (obj.caller == caller && obj.func == func) {
                event_queue.splice(i, 1);
                break;
            }
        }
        if (event_queue.length <= 0) {
            this.events_map[event_name] = null;
        }
    };
    EventMgr.prototype.dispatch_event = function (event_name, udata) {
        if (!this.events_map || !this.events_map[event_name]) {
            return;
        }
        var event_queue = this.events_map[event_name];
        for (var i = 0; i < event_queue.length; i++) {
            var obj = event_queue[i];
            obj.func.call(obj.caller, event_name, udata);
        }
    };
    var EventMgr_1;
    EventMgr.Instance = null;
    EventMgr = EventMgr_1 = __decorate([
        ccclass
    ], EventMgr);
    return EventMgr;
}(cc.Component));
exports.default = EventMgr;

cc._RF.pop();