
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/Net/NetMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ca6dcBBP+9JbZD7KoLjwFLj', 'NetMgr');
// Scripts/Managers/Net/NetMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var EventMgr_1 = require("../EventMgr");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var State = {
    Disconnected: 0,
    Connecting: 1,
    Connected: 2,
};
var NetMgr = /** @class */ (function (_super) {
    __extends(NetMgr, _super);
    function NetMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.url = "ws://127.0.0.1:6081/ws";
        _this.state = State.Disconnected;
        _this.sock = null;
        return _this;
    }
    NetMgr_1 = NetMgr;
    NetMgr.prototype.onLoad = function () {
        if (!NetMgr_1.Instance || !cc.isValid(NetMgr_1.Instance)) {
            NetMgr_1.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
        this.state = State.Disconnected;
    };
    NetMgr.prototype.onDestroy = function () {
        if (NetMgr_1.Instance === this) {
            NetMgr_1.Instance = null;
        }
    };
    NetMgr.prototype._on_opened = function (event) {
        this.state = State.Connected;
        cc.log("connect to server: " + this.url + " sucess!");
        EventMgr_1.default.Instance.dispatch_event("net_connect", null);
    };
    NetMgr.prototype._on_recv_data = function (event) {
        EventMgr_1.default.Instance.dispatch_event("net_message", event.data);
    };
    NetMgr.prototype.close_socket = function () {
        if (this.state === State.Connected) {
            if (this.sock !== null) {
                this.sock.close();
                this.sock = null;
            }
        }
        EventMgr_1.default.Instance.dispatch_event("net_disconnect", null);
        this.state = State.Disconnected;
    };
    NetMgr.prototype._on_socket_close = function (event) {
        this.close_socket();
    };
    NetMgr.prototype._on_socket_err = function (event) {
        this.close_socket();
    };
    // 发起连接;
    NetMgr.prototype.connect_to_server = function () {
        if (this.state !== State.Disconnected) {
            return;
        }
        EventMgr_1.default.Instance.dispatch_event("net_connecting", null);
        this.state = State.Connecting;
        this.sock = new WebSocket(this.url); // H5标准，底层做好了;
        this.sock.binaryType = "arraybuffer";
        this.sock.onopen = this._on_opened.bind(this);
        this.sock.onmessage = this._on_recv_data.bind(this);
        this.sock.onclose = this._on_socket_close.bind(this);
        this.sock.onerror = this._on_socket_err.bind(this);
    };
    NetMgr.prototype.send_data = function (data_arraybuf) {
        if (this.state === State.Connected && this.sock) {
            this.sock.send(data_arraybuf);
        }
    };
    NetMgr.prototype.update = function (dt) {
        if (this.state !== State.Disconnected) {
            return;
        }
        this.connect_to_server();
    };
    var NetMgr_1;
    NetMgr.Instance = null;
    NetMgr = NetMgr_1 = __decorate([
        ccclass
    ], NetMgr);
    return NetMgr;
}(cc.Component));
exports.default = NetMgr;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXE5ldFxcTmV0TWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3Q0FBcUM7QUFDL0IsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFFNUMsSUFBSSxLQUFLLEdBQUc7SUFDUixZQUFZLEVBQUUsQ0FBQztJQUNmLFVBQVUsRUFBRSxDQUFDO0lBQ2IsU0FBUyxFQUFFLENBQUM7Q0FDZixDQUFDO0FBR0Y7SUFBb0MsMEJBQVk7SUFBaEQ7UUFBQSxxRUFxRkM7UUFsRlcsU0FBRyxHQUFXLHdCQUF3QixDQUFDO1FBQ3ZDLFdBQUssR0FBVyxLQUFLLENBQUMsWUFBWSxDQUFDO1FBQ25DLFVBQUksR0FBYyxJQUFJLENBQUM7O0lBZ0ZuQyxDQUFDO2VBckZvQixNQUFNO0lBT3ZCLHVCQUFNLEdBQU47UUFDSSxJQUFJLENBQUMsUUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2xELFFBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQzFCO2FBQ0k7WUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDcEMsQ0FBQztJQUVELDBCQUFTLEdBQVQ7UUFDSSxJQUFJLFFBQU0sQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQzFCLFFBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQUVELDJCQUFVLEdBQVYsVUFBVyxLQUFLO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFB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ZW50IjpbImltcG9ydCAgRXZlbnRNZ3IgIGZyb20gXCIuLi9FdmVudE1nclwiO1xyXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xyXG5cclxudmFyIFN0YXRlID0ge1xyXG4gICAgRGlzY29ubmVjdGVkOiAwLCAvLyDmlq3lvIDov57mjqVcclxuICAgIENvbm5lY3Rpbmc6IDEsIC8vIOato+WcqOi/nuaOpVxyXG4gICAgQ29ubmVjdGVkOiAyLCAvLyDlt7Lnu4/ov57mjqU7XHJcbn07XHJcblxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXRNZ3IgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG4gICAgcHVibGljIHN0YXRpYyBJbnN0YW5jZTogTmV0TWdyID0gbnVsbDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSB1cmw6IHN0cmluZyA9IFwid3M6Ly8xMjcuMC4wLjE6NjA4MS93c1wiO1xyXG4gICAgcHJpdmF0ZSBzdGF0ZTogbnVtYmVyID0gU3RhdGUuRGlzY29ubmVjdGVkO1xyXG4gICAgcHJpdmF0ZSBzb2NrOiBXZWJTb2NrZXQgPSBudWxsO1xyXG5cclxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgaWYgKCFOZXRNZ3IuSW5zdGFuY2UgfHwgIWNjLmlzVmFsaWQoTmV0TWdyLkluc3RhbmNlKSkge1xuICAgICAgICAgICAgTmV0TWdyLkluc3RhbmNlID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5EaXNjb25uZWN0ZWQ7XG4gICAgfVxuXG4gICAgb25EZXN0cm95KCkge1xuICAgICAgICBpZiAoTmV0TWdyLkluc3RhbmNlID09PSB0aGlzKSB7XG4gICAgICAgICAgICBOZXRNZ3IuSW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXHJcbiAgICBfb25fb3BlbmVkKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLkNvbm5lY3RlZDtcclxuICAgICAgICBjYy5sb2coXCJjb25uZWN0IHRvIHNlcnZlcjogXCIgKyB0aGlzLnVybCArIFwiIHN1Y2VzcyFcIik7XHJcbiAgICAgICAgRXZlbnRNZ3IuSW5zdGFuY2UuZGlzcGF0Y2hfZXZlbnQoXCJuZXRfY29ubmVjdFwiLCBudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBfb25fcmVjdl9kYXRhKGV2ZW50KSB7XHJcbiAgICAgICAgRXZlbnRNZ3IuSW5zdGFuY2UuZGlzcGF0Y2hfZXZlbnQoXCJuZXRfbWVzc2FnZVwiLCBldmVudC5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZV9zb2NrZXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zb2NrICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvY2suY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc29jayA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgRXZlbnRNZ3IuSW5zdGFuY2UuZGlzcGF0Y2hfZXZlbnQoXCJuZXRfZGlzY29ubmVjdFwiLCBudWxsKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gU3RhdGUuRGlzY29ubmVjdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIF9vbl9zb2NrZXRfY2xvc2UoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLmNsb3NlX3NvY2tldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9vbl9zb2NrZXRfZXJyKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZV9zb2NrZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDlj5Hotbfov57mjqU7XHJcbiAgICBjb25uZWN0X3RvX3NlcnZlcigpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gU3RhdGUuRGlzY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEV2ZW50TWdyLkluc3RhbmNlLmRpc3BhdGNoX2V2ZW50KFwibmV0X2Nvbm5lY3RpbmdcIiwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBTdGF0ZS5Db25uZWN0aW5nO1xyXG4gICAgICAgIHRoaXMuc29jayA9IG5ldyBXZWJTb2NrZXQodGhpcy51cmwpOyAvLyBINeagh+WHhu+8jOW6leWxguWBmuWlveS6hjtcclxuICAgICAgICB0aGlzLnNvY2suYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrLm9ub3BlbiA9IHRoaXMuX29uX29wZW5lZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc29jay5vbm1lc3NhZ2UgPSB0aGlzLl9vbl9yZWN2X2RhdGEuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnNvY2sub25jbG9zZSA9IHRoaXMuX29uX3NvY2tldF9jbG9zZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc29jay5vbmVycm9yID0gdGhpcy5fb25fc29ja2V0X2Vyci5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbmRfZGF0YShkYXRhX2FycmF5YnVmKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNvbm5lY3RlZCAmJiB0aGlzLnNvY2spIHtcclxuICAgICAgICAgICAgdGhpcy5zb2NrLnNlbmQoZGF0YV9hcnJheWJ1Zik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoZHQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBTdGF0ZS5EaXNjb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0X3RvX3NlcnZlcigpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==