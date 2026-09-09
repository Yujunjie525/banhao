"use strict";
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