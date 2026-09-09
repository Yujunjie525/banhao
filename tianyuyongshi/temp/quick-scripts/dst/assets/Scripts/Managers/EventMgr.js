
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/EventMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXEV2ZW50TWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUFzQyw0QkFBWTtJQUFsRDtRQUFBLHFFQWdFQztRQTdEVyxnQkFBVSxHQUFHLEVBQUUsQ0FBQzs7SUE2RDVCLENBQUM7aUJBaEVvQixRQUFRO0lBS3pCLHlCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsVUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3RELFVBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQzVCO2FBQ0k7WUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixPQUFPO1NBQ1Y7SUFDTCxDQUFDO0lBRUQsNEJBQVMsR0FBVDtRQUNJLElBQUksVUFBUSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDNUIsVUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDNUI7SUFDTCxDQUFDO0lBRUQsdUNBQXVDO0lBQ2hDLHNDQUFtQixHQUExQixVQUEyQixVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUk7UUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDcEM7UUFFRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDYixNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLHlDQUFzQixHQUE3QixVQUE4QixVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUk7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xELE9BQU87U0FDVjtRQUVELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFHLEVBQUU7WUFDekMsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQzFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNO2FBQ1Q7U0FDSjtRQUVELElBQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDdEM7SUFDTCxDQUFDO0lBRU0saUNBQWMsR0FBckIsVUFBc0IsVUFBVSxFQUFFLEtBQUs7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xELE9BQU87U0FDVjtRQUVELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFHLEVBQUU7WUFDekMsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQzs7SUE5RGEsaUJBQVEsR0FBYSxJQUFJLENBQUM7SUFEdkIsUUFBUTtRQUQ1QixPQUFPO09BQ2EsUUFBUSxDQWdFNUI7SUFBRCxlQUFDO0NBaEVELEFBZ0VDLENBaEVxQyxFQUFFLENBQUMsU0FBUyxHQWdFakQ7a0JBaEVvQixRQUFRIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XHJcblxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudE1nciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBFdmVudE1nciA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudHNfbWFwID0ge307XHJcblxyXG4gICAgb25Mb2FkKCkge1xuICAgICAgICBpZiAoIUV2ZW50TWdyLkluc3RhbmNlIHx8ICFjYy5pc1ZhbGlkKEV2ZW50TWdyLkluc3RhbmNlKSkge1xuICAgICAgICAgICAgRXZlbnRNZ3IuSW5zdGFuY2UgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkRlc3Ryb3koKSB7XG4gICAgICAgIGlmIChFdmVudE1nci5JbnN0YW5jZSA9PT0gdGhpcykge1xuICAgICAgICAgICAgRXZlbnRNZ3IuSW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXHJcbiAgICAvLyBmdW5jKGV2ZW50X25hbWU6IHN0cmluZywgdWRhdGE6IGFueSlcclxuICAgIHB1YmxpYyBhZGRfZXZlbnRfbGlzdGVubmVyKGV2ZW50X25hbWUsIGNhbGxlciwgZnVuYykge1xyXG4gICAgICAgIGlmICghdGhpcy5ldmVudHNfbWFwW2V2ZW50X25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzX21hcFtldmVudF9uYW1lXSA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGV2ZW50X3F1ZXVlID0gdGhpcy5ldmVudHNfbWFwW2V2ZW50X25hbWVdO1xyXG4gICAgICAgIGV2ZW50X3F1ZXVlLnB1c2goe1xyXG4gICAgICAgICAgICBjYWxsZXI6IGNhbGxlcixcclxuICAgICAgICAgICAgZnVuYzogZnVuY1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVfZXZlbnRfbGlzdGVubmVyKGV2ZW50X25hbWUsIGNhbGxlciwgZnVuYykge1xyXG4gICAgICAgIGlmICghdGhpcy5ldmVudHNfbWFwIHx8ICF0aGlzLmV2ZW50c19tYXBbZXZlbnRfbmFtZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGV2ZW50X3F1ZXVlID0gdGhpcy5ldmVudHNfbWFwW2V2ZW50X25hbWVdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBldmVudF9xdWV1ZS5sZW5ndGg7IGkgKyspIHtcclxuICAgICAgICAgICAgdmFyIG9iaiA9IGV2ZW50X3F1ZXVlW2ldO1xyXG4gICAgICAgICAgICBpZiAob2JqLmNhbGxlciA9PSBjYWxsZXIgJiYgb2JqLmZ1bmMgPT0gZnVuYykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRfcXVldWUuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudF9xdWV1ZS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c19tYXBbZXZlbnRfbmFtZV0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlzcGF0Y2hfZXZlbnQoZXZlbnRfbmFtZSwgdWRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzX21hcCB8fCAhdGhpcy5ldmVudHNfbWFwW2V2ZW50X25hbWVdKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBldmVudF9xdWV1ZSA9IHRoaXMuZXZlbnRzX21hcFtldmVudF9uYW1lXTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRfcXVldWUubGVuZ3RoOyBpICsrKSB7XHJcbiAgICAgICAgICAgIHZhciBvYmogPSBldmVudF9xdWV1ZVtpXTtcclxuICAgICAgICAgICAgb2JqLmZ1bmMuY2FsbChvYmouY2FsbGVyLCBldmVudF9uYW1lLCB1ZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==