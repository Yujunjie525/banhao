
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/OnlineTimeManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcT25saW5lVGltZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFTLElBQUEsT0FBTyxHQUFLLEVBQUUsQ0FBQyxVQUFVLFFBQWxCLENBQW1CO0FBRW5DLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsT0FBTyxDQUFDO0FBRXJFO0lBQUE7SUF1SEEsQ0FBQztJQTVHa0IsaUNBQVMsR0FBeEI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRWMsd0NBQWdCLEdBQS9CLFVBQWdDLE9BQWU7UUFDM0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBVSxPQUFPLFNBQUksTUFBUSxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVjLHVDQUFlLEdBQTlCO1FBQ0ksSUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFNLEtBQUssQ0FBQyxXQUFXLEVBQUUsU0FBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFHLENBQUM7SUFDM0ksQ0FBQztJQUVjLG9EQUE0QixHQUEzQztRQUNJLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNFLElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFD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IiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsi77u/Y29uc3QgeyBjY2NsYXNzIH0gPSBjYy5fZGVjb3JhdG9yO1xyXG5cclxuY29uc3QgVXNlckRhdGFTeW5jTWFuYWdlciA9IHJlcXVpcmUoJy4vVXNlckRhdGFTeW5jTWFuYWdlcicpLmRlZmF1bHQ7XHJcblxyXG5jbGFzcyBPbmxpbmVUaW1lTWFuYWdlclN0YXRpYyB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBvbmxpbmVUaW1lcjogYW55ID0gbnVsbDtcclxuICAgIHByaXZhdGUgc3RhdGljIG9ubGluZU1pbnV0ZXM6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIHN0YXRpYyB0b2RheURhdGU6IHN0cmluZyA9ICcnO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgc3RhdGljIGN1cnJlbnRVc2VySWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGRhaWx5UmV3YXJkRGF0ZUtleTogc3RyaW5nID0gJ2RhaWx5UmV3YXJkRGF0ZSc7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBkYWlseVJld2FyZENsYWltZWRLZXk6IHN0cmluZyA9ICdkYWlseVJld2FyZENsYWltZWQnO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgZGFpbHlPbmxpbmVNaW51dGVzS2V5OiBzdHJpbmcgPSAnZGFpbHlPbmxpbmVNaW51dGVzJztcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRLZXlXaXRoVXNlcklkKGJhc2VLZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBpZiAodXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlS2V5fV8ke3VzZXJJZH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZUtleTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyB1cGRhdGVUb2RheURhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMudG9kYXlEYXRlID0gYCR7dG9kYXkuZ2V0RnVsbFllYXIoKX0tJHtTdHJpbmcodG9kYXkuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKHRvZGF5LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRPbmxpbmVNaW51dGVzRnJvbVN0b3JhZ2UoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlPbmxpbmVNaW51dGVzS2V5KTtcclxuICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKG9ubGluZU1pbnV0ZXNLZXkpO1xyXG4gICAgICAgIGlmICghb25saW5lTWludXRlc1N0cikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KG9ubGluZU1pbnV0ZXNTdHIsIDEwKTtcclxuICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyAwIDogTWF0aC5tYXgoMCwgcGFyc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzYXZlT25saW5lTWludXRlcyhtaW51dGVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlPbmxpbmVNaW51dGVzS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0ob25saW5lTWludXRlc0tleSwgbWludXRlcy50b1N0cmluZygpKTtcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBjaGVja05ld0RheSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCByZXdhcmREYXRlS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlSZXdhcmREYXRlS2V5KTtcclxuICAgICAgICBjb25zdCBjbGFpbWVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlSZXdhcmRDbGFpbWVkS2V5KTtcclxuICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlPbmxpbmVNaW51dGVzS2V5KTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2F2ZWREYXRlID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHJld2FyZERhdGVLZXkpO1xyXG4gICAgICAgIGlmICghc2F2ZWREYXRlIHx8IHNhdmVkRGF0ZSAhPT0gdGhpcy50b2RheURhdGUpIHtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHJld2FyZERhdGVLZXksIHRoaXMudG9kYXlEYXRlKTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGNsYWltZWRLZXksIEpTT04uc3RyaW5naWZ5KFtdKSk7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShvbmxpbmVNaW51dGVzS2V5LCAnMCcpO1xyXG4gICAgICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc3luY1VzZXJTY29wZUlmTmVlZGVkKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGxhdGVzdFVzZXJJZCA9IHRoaXMuZ2V0VXNlcklkKCk7XHJcbiAgICAgICAgaWYgKGxhdGVzdFVzZXJJZCAhPT0gdGhpcy5jdXJyZW50VXNlcklkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFVzZXJJZCA9IGxhdGVzdFVzZXJJZDtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUb2RheURhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jaGVja05ld0RheSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9ubGluZU1pbnV0ZXMgPSB0aGlzLnJlYWRPbmxpbmVNaW51dGVzRnJvbVN0b3JhZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFVzZXJJZCA9IHRoaXMuZ2V0VXNlcklkKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlVG9kYXlEYXRlKCk7XHJcbiAgICAgICAgdGhpcy5jaGVja05ld0RheSgpO1xyXG4gICAgICAgIHRoaXMub25saW5lTWludXRlcyA9IHRoaXMucmVhZE9ubGluZU1pbnV0ZXNGcm9tU3RvcmFnZSgpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRPbmxpbmVUaW1lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHN0YXJ0T25saW5lVGltZXIoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMub25saW5lVGltZXIpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLm9ubGluZVRpbWVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub25saW5lVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3luY1VzZXJTY29wZUlmTmVlZGVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVG9kYXlEYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tOZXdEYXkoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub25saW5lTWludXRlcyArPSAxO1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVPbmxpbmVNaW51dGVzKHRoaXMub25saW5lTWludXRlcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlvZPliY3lnKjnur/ml7bplb86ICR7dGhpcy5vbmxpbmVNaW51dGVzfSDliIbpkp9gKTtcclxuICAgICAgICB9LCA2MDAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBzdG9wT25saW5lVGltZXIoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMub25saW5lVGltZXIpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLm9ubGluZVRpbWVyKTtcclxuICAgICAgICAgICAgdGhpcy5vbmxpbmVUaW1lciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0T25saW5lTWludXRlcygpOiBudW1iZXIge1xyXG4gICAgICAgIHRoaXMuc3luY1VzZXJTY29wZUlmTmVlZGVkKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUb2RheURhdGUoKTtcclxuICAgICAgICB0aGlzLmNoZWNrTmV3RGF5KCk7XHJcblxyXG4gICAgICAgIHRoaXMub25saW5lTWludXRlcyA9IHRoaXMucmVhZE9ubGluZU1pbnV0ZXNGcm9tU3RvcmFnZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9ubGluZU1pbnV0ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRDdXJyZW50T25saW5lTWludXRlcygpOiBudW1iZXIge1xyXG4gICAgICAgIHRoaXMuc3luY1VzZXJTY29wZUlmTmVlZGVkKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub25saW5lTWludXRlcztcclxuICAgIH1cclxufVxyXG5cclxuQGNjY2xhc3NcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT25saW5lVGltZU1hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBPbmxpbmVUaW1lTWFuYWdlciA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgSW5zdGFuY2UoKTogT25saW5lVGltZU1hbmFnZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignT25saW5lVGltZU1hbmFnZXIgaW5zdGFuY2Ugbm90IGluaXRpYWxpemVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Mb2FkKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghT25saW5lVGltZU1hbmFnZXIuX2luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIE9ubGluZVRpbWVNYW5hZ2VyLl9pbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgICAgIE9ubGluZVRpbWVNYW5hZ2VyU3RhdGljLmluaXRpYWxpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIC8vIOmdmeaAgeeuoeeQhuWZqOe7p+e7rei/kOihjO+8jOS4jeWcqOatpOWBnOatolxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRPbmxpbmVNaW51dGVzKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9ubGluZVRpbWVNYW5hZ2VyU3RhdGljLmdldE9ubGluZU1pbnV0ZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudE9ubGluZU1pbnV0ZXMoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gT25saW5lVGltZU1hbmFnZXJTdGF0aWMuZ2V0Q3VycmVudE9ubGluZU1pbnV0ZXMoKTtcclxuICAgIH1cclxufVxyXG4iXX0=