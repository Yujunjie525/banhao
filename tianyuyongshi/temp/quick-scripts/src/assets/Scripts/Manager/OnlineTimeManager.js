"use strict";
cc._RF.push(module, '252b9DG929ESp822PrNuro0', 'OnlineTimeManager');
// Scripts/Manager/OnlineTimeManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ccclass = cc._decorator.ccclass;
var UserDataSyncManager = require('./UserDataSyncManager').default;
var OnlineTimeManagerStatic = /** @class */ (function () {
    function OnlineTimeManagerStatic() {
    }
    OnlineTimeManagerStatic.getUserId = function () {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    };
    OnlineTimeManagerStatic.getKeyWithUserId = function (baseKey) {
        var userId = this.getUserId();
        if (userId) {
            return baseKey + "_" + userId;
        }
        return baseKey;
    };
    OnlineTimeManagerStatic.updateTodayDate = function () {
        var today = new Date();
        this.todayDate = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
    };
    OnlineTimeManagerStatic.readOnlineMinutesFromStorage = function () {
        var onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        var onlineMinutesStr = cc.sys.localStorage.getItem(onlineMinutesKey);
        if (!onlineMinutesStr) {
            return 0;
        }
        var parsed = parseInt(onlineMinutesStr, 10);
        return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    };
    OnlineTimeManagerStatic.saveOnlineMinutes = function (minutes) {
        var onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        cc.sys.localStorage.setItem(onlineMinutesKey, minutes.toString());
        UserDataSyncManager.requestUpload();
    };
    OnlineTimeManagerStatic.checkNewDay = function () {
        var rewardDateKey = this.getKeyWithUserId(this.dailyRewardDateKey);
        var claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        var onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        var savedDate = cc.sys.localStorage.getItem(rewardDateKey);
        if (!savedDate || savedDate !== this.todayDate) {
            cc.sys.localStorage.setItem(rewardDateKey, this.todayDate);
            cc.sys.localStorage.setItem(claimedKey, JSON.stringify([]));
            cc.sys.localStorage.setItem(onlineMinutesKey, '0');
            UserDataSyncManager.requestUpload();
        }
    };
    OnlineTimeManagerStatic.syncUserScopeIfNeeded = function () {
        var latestUserId = this.getUserId();
        if (latestUserId !== this.currentUserId) {
            this.currentUserId = latestUserId;
            this.updateTodayDate();
            this.checkNewDay();
            this.onlineMinutes = this.readOnlineMinutesFromStorage();
        }
    };
    OnlineTimeManagerStatic.initialize = function () {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.currentUserId = this.getUserId();
        this.updateTodayDate();
        this.checkNewDay();
        this.onlineMinutes = this.readOnlineMinutesFromStorage();
        this.startOnlineTimer();
    };
    OnlineTimeManagerStatic.startOnlineTimer = function () {
        var _this = this;
        if (this.onlineTimer) {
            clearInterval(this.onlineTimer);
        }
        this.onlineTimer = setInterval(function () {
            _this.syncUserScopeIfNeeded();
            _this.updateTodayDate();
            _this.checkNewDay();
            _this.onlineMinutes += 1;
            _this.saveOnlineMinutes(_this.onlineMinutes);
            console.log("\u5F53\u524D\u5728\u7EBF\u65F6\u957F: " + _this.onlineMinutes + " \u5206\u949F");
        }, 60000);
    };
    OnlineTimeManagerStatic.stopOnlineTimer = function () {
        if (this.onlineTimer) {
            clearInterval(this.onlineTimer);
            this.onlineTimer = null;
        }
    };
    OnlineTimeManagerStatic.getOnlineMinutes = function () {
        this.syncUserScopeIfNeeded();
        this.updateTodayDate();
        this.checkNewDay();
        this.onlineMinutes = this.readOnlineMinutesFromStorage();
        return this.onlineMinutes;
    };
    OnlineTimeManagerStatic.getCurrentOnlineMinutes = function () {
        this.syncUserScopeIfNeeded();
        return this.onlineMinutes;
    };
    OnlineTimeManagerStatic.onlineTimer = null;
    OnlineTimeManagerStatic.onlineMinutes = 0;
    OnlineTimeManagerStatic.todayDate = '';
    OnlineTimeManagerStatic.initialized = false;
    OnlineTimeManagerStatic.currentUserId = null;
    OnlineTimeManagerStatic.dailyRewardDateKey = 'dailyRewardDate';
    OnlineTimeManagerStatic.dailyRewardClaimedKey = 'dailyRewardClaimed';
    OnlineTimeManagerStatic.dailyOnlineMinutesKey = 'dailyOnlineMinutes';
    return OnlineTimeManagerStatic;
}());
var OnlineTimeManager = /** @class */ (function (_super) {
    __extends(OnlineTimeManager, _super);
    function OnlineTimeManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OnlineTimeManager_1 = OnlineTimeManager;
    Object.defineProperty(OnlineTimeManager, "Instance", {
        get: function () {
            if (!this._instance) {
                console.error('OnlineTimeManager instance not initialized');
            }
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    OnlineTimeManager.prototype.onLoad = function () {
        if (!OnlineTimeManager_1._instance) {
            OnlineTimeManager_1._instance = this;
            OnlineTimeManagerStatic.initialize();
        }
        else {
            this.node.destroy();
        }
    };
    OnlineTimeManager.prototype.onDestroy = function () {
        // 静态管理器继续运行，不在此停止
    };
    OnlineTimeManager.prototype.getOnlineMinutes = function () {
        return OnlineTimeManagerStatic.getOnlineMinutes();
    };
    OnlineTimeManager.prototype.getCurrentOnlineMinutes = function () {
        return OnlineTimeManagerStatic.getCurrentOnlineMinutes();
    };
    var OnlineTimeManager_1;
    OnlineTimeManager._instance = null;
    OnlineTimeManager = OnlineTimeManager_1 = __decorate([
        ccclass
    ], OnlineTimeManager);
    return OnlineTimeManager;
}(cc.Component));
exports.default = OnlineTimeManager;

cc._RF.pop();