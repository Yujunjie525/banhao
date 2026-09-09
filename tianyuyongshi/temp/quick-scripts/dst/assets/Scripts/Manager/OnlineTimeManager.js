
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcT25saW5lVGltZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFTLElBQUEsT0FBTyxHQUFLLEVBQUUsQ0FBQyxVQUFVLFFBQWxCLENBQW1CO0FBRW5DLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsT0FBTyxDQUFDO0FBRXJFO0lBQUE7SUF1SEEsQ0FBQztJQTVHa0IsaUNBQVMsR0FBeEI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRWMsd0NBQWdCLEdBQS9CLFVBQWdDLE9BQWU7UUFDM0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBVSxPQUFPLFNBQUksTUFBUSxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVjLHVDQUFlLEdBQTlCO1FBQ0ksSUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFNLEtBQUssQ0FBQyxXQUFXLEVBQUUsU0FBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFHLENBQUM7SUFDM0ksQ0FBQztJQUVjLG9EQUE0QixHQUEzQztRQUNJLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNFLElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFD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QiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIu+7v2NvbnN0IHsgY2NjbGFzcyB9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbmNvbnN0IFVzZXJEYXRhU3luY01hbmFnZXIgPSByZXF1aXJlKCcuL1VzZXJEYXRhU3luY01hbmFnZXInKS5kZWZhdWx0O1xuXG5jbGFzcyBPbmxpbmVUaW1lTWFuYWdlclN0YXRpYyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgb25saW5lVGltZXI6IE5vZGVKUy5UaW1lb3V0ID0gbnVsbDtcclxuICAgIHByaXZhdGUgc3RhdGljIG9ubGluZU1pbnV0ZXM6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIHN0YXRpYyB0b2RheURhdGU6IHN0cmluZyA9ICcnO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgc3RhdGljIGN1cnJlbnRVc2VySWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGRhaWx5UmV3YXJkRGF0ZUtleTogc3RyaW5nID0gJ2RhaWx5UmV3YXJkRGF0ZSc7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBkYWlseVJld2FyZENsYWltZWRLZXk6IHN0cmluZyA9ICdkYWlseVJld2FyZENsYWltZWQnO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgZGFpbHlPbmxpbmVNaW51dGVzS2V5OiBzdHJpbmcgPSAnZGFpbHlPbmxpbmVNaW51dGVzJztcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRLZXlXaXRoVXNlcklkKGJhc2VLZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBpZiAodXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlS2V5fV8ke3VzZXJJZH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZUtleTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyB1cGRhdGVUb2RheURhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMudG9kYXlEYXRlID0gYCR7dG9kYXkuZ2V0RnVsbFllYXIoKX0tJHtTdHJpbmcodG9kYXkuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKHRvZGF5LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRPbmxpbmVNaW51dGVzRnJvbVN0b3JhZ2UoKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlPbmxpbmVNaW51dGVzS2V5KTtcclxuICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKG9ubGluZU1pbnV0ZXNLZXkpO1xyXG4gICAgICAgIGlmICghb25saW5lTWludXRlc1N0cikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KG9ubGluZU1pbnV0ZXNTdHIsIDEwKTtcclxuICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyAwIDogTWF0aC5tYXgoMCwgcGFyc2VkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzYXZlT25saW5lTWludXRlcyhtaW51dGVzOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb25saW5lTWludXRlc0tleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmRhaWx5T25saW5lTWludXRlc0tleSk7XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShvbmxpbmVNaW51dGVzS2V5LCBtaW51dGVzLnRvU3RyaW5nKCkpO1xuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcbiAgICB9XG5cclxuICAgIHByaXZhdGUgc3RhdGljIGNoZWNrTmV3RGF5KCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHJld2FyZERhdGVLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5kYWlseVJld2FyZERhdGVLZXkpO1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5kYWlseVJld2FyZENsYWltZWRLZXkpO1xyXG4gICAgICAgIGNvbnN0IG9ubGluZU1pbnV0ZXNLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5kYWlseU9ubGluZU1pbnV0ZXNLZXkpO1xyXG5cclxuICAgICAgICBjb25zdCBzYXZlZERhdGUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0ocmV3YXJkRGF0ZUtleSk7XG4gICAgICAgIGlmICghc2F2ZWREYXRlIHx8IHNhdmVkRGF0ZSAhPT0gdGhpcy50b2RheURhdGUpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShyZXdhcmREYXRlS2V5LCB0aGlzLnRvZGF5RGF0ZSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oY2xhaW1lZEtleSwgSlNPTi5zdHJpbmdpZnkoW10pKTtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShvbmxpbmVNaW51dGVzS2V5LCAnMCcpO1xuICAgICAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cclxuICAgIHByaXZhdGUgc3RhdGljIHN5bmNVc2VyU2NvcGVJZk5lZWRlZCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBsYXRlc3RVc2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xyXG4gICAgICAgIGlmIChsYXRlc3RVc2VySWQgIT09IHRoaXMuY3VycmVudFVzZXJJZCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRVc2VySWQgPSBsYXRlc3RVc2VySWQ7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVG9kYXlEYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tOZXdEYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5vbmxpbmVNaW51dGVzID0gdGhpcy5yZWFkT25saW5lTWludXRlc0Zyb21TdG9yYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRVc2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVRvZGF5RGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuY2hlY2tOZXdEYXkoKTtcclxuICAgICAgICB0aGlzLm9ubGluZU1pbnV0ZXMgPSB0aGlzLnJlYWRPbmxpbmVNaW51dGVzRnJvbVN0b3JhZ2UoKTtcclxuICAgICAgICB0aGlzLnN0YXJ0T25saW5lVGltZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzdGFydE9ubGluZVRpbWVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLm9ubGluZVRpbWVyKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5vbmxpbmVUaW1lcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9ubGluZVRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnN5bmNVc2VyU2NvcGVJZk5lZWRlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRvZGF5RGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrTmV3RGF5KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9ubGluZU1pbnV0ZXMgKz0gMTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlT25saW5lTWludXRlcyh0aGlzLm9ubGluZU1pbnV0ZXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5b2T5YmN5Zyo57q/5pe26ZW/OiAke3RoaXMub25saW5lTWludXRlc30g5YiG6ZKfYCk7XHJcbiAgICAgICAgfSwgNjAwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgc3RvcE9ubGluZVRpbWVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLm9ubGluZVRpbWVyKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5vbmxpbmVUaW1lcik7XHJcbiAgICAgICAgICAgIHRoaXMub25saW5lVGltZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldE9ubGluZU1pbnV0ZXMoKTogbnVtYmVyIHtcclxuICAgICAgICB0aGlzLnN5bmNVc2VyU2NvcGVJZk5lZWRlZCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVG9kYXlEYXRlKCk7XHJcbiAgICAgICAgdGhpcy5jaGVja05ld0RheSgpO1xyXG5cclxuICAgICAgICB0aGlzLm9ubGluZU1pbnV0ZXMgPSB0aGlzLnJlYWRPbmxpbmVNaW51dGVzRnJvbVN0b3JhZ2UoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5vbmxpbmVNaW51dGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q3VycmVudE9ubGluZU1pbnV0ZXMoKTogbnVtYmVyIHtcclxuICAgICAgICB0aGlzLnN5bmNVc2VyU2NvcGVJZk5lZWRlZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9ubGluZU1pbnV0ZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9ubGluZVRpbWVNYW5hZ2VyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogT25saW5lVGltZU1hbmFnZXIgPSBudWxsO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IEluc3RhbmNlKCk6IE9ubGluZVRpbWVNYW5hZ2VyIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ09ubGluZVRpbWVNYW5hZ2VyIGluc3RhbmNlIG5vdCBpbml0aWFsaXplZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTG9hZCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIU9ubGluZVRpbWVNYW5hZ2VyLl9pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBPbmxpbmVUaW1lTWFuYWdlci5faW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICAgICBPbmxpbmVUaW1lTWFuYWdlclN0YXRpYy5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICAvLyDpnZnmgIHnrqHnkIblmajnu6fnu63ov5DooYzvvIzkuI3lnKjmraTlgZzmraJcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0T25saW5lTWludXRlcygpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPbmxpbmVUaW1lTWFuYWdlclN0YXRpYy5nZXRPbmxpbmVNaW51dGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRPbmxpbmVNaW51dGVzKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9ubGluZVRpbWVNYW5hZ2VyU3RhdGljLmdldEN1cnJlbnRPbmxpbmVNaW51dGVzKCk7XHJcbiAgICB9XHJcbn1cclxuIl19