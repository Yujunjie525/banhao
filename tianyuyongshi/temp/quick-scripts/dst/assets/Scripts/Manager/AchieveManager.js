
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/AchieveManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'e044d6yt21GMIT8SzER8v+s', 'AchieveManager');
// Scripts/Manager/AchieveManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameData_1 = require("../Load/GameData");
var TipsManager_1 = require("../Load/TipsManager");
var UserDataSyncManager_1 = require("./UserDataSyncManager");
var AchieveManager = /** @class */ (function (_super) {
    __extends(AchieveManager, _super);
    function AchieveManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.closeButton = null;
        _this.scrollView = null;
        _this.achieveItemPrefab = null;
        _this.achieves = [];
        _this.achieveConfigs = [];
        _this.isConfigLoaded = false;
        _this.loadConfigPromise = null;
        _this.claimHandler = null;
        _this.achieveClaimedKey = 'Achievesclaimed';
        _this.dailyOnlineMinutesKey = 'dailyOnlineMinutes';
        return _this;
    }
    AchieveManager.prototype.getUserId = function () {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    };
    AchieveManager.prototype.getKeyWithUserId = function (baseKey) {
        var userId = this.getUserId();
        if (userId) {
            return baseKey + "_" + userId;
        }
        return baseKey;
    };
    AchieveManager.prototype.getAchieveClaimedList = function () {
        var storageKey = this.getKeyWithUserId(this.achieveClaimedKey);
        var claimedStr = cc.sys.localStorage.getItem(storageKey);
        if (!claimedStr) {
            return [];
        }
        try {
            var parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            console.error('Parse achieve claimed data failed:', error);
            return [];
        }
    };
    AchieveManager.prototype.saveAchieveClaimedList = function (claimedList) {
        var storageKey = this.getKeyWithUserId(this.achieveClaimedKey);
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(claimedList));
        UserDataSyncManager_1.default.requestUpload();
    };
    AchieveManager.prototype.onLoad = function () {
        var _this = this;
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
        this.claimHandler = function (achieveId) { return _this.onClaimClick(achieveId); };
        this.refreshAchievements().catch(function (error) {
            console.error('Load achievement config failed:', error);
        });
    };
    AchieveManager.prototype.onEnable = function () {
        this.refreshAchievements().catch(function (error) {
            console.error('Refresh achievement data failed:', error);
        });
    };
    AchieveManager.prototype.loadAchievementConfig = function () {
        var _this = this;
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }
        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }
        this.loadConfigPromise = new Promise(function (resolve, reject) {
            cc.loader.loadRes('config/achievement', cc.JsonAsset, function (err, jsonAsset) {
                if (err) {
                    reject(err);
                    return;
                }
                var rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                _this.achieveConfigs = rawConfigs.map(function (config) {
                    var _a, _b;
                    return ({
                        id: Number(config.id) || 0,
                        icon: "" + (config.icon || ''),
                        name: "" + (config.name || ''),
                        desc: "" + (config.desc || ''),
                        type: "" + (config.type || ''),
                        count: Number((_a = config.target) !== null && _a !== void 0 ? _a : config.count) || 0,
                        rewardGold: Number((_b = config.rewardDiamond) !== null && _b !== void 0 ? _b : config.rewardGold) || 0
                    });
                });
                _this.isConfigLoaded = true;
                resolve();
            });
        });
        return this.loadConfigPromise;
    };
    AchieveManager.prototype.initAchieves = function () {
        var _this = this;
        this.achieves = this.achieveConfigs.map(function (config) {
            var isCompleted = _this.checkAchieveCompletion(config);
            var currentProgress = _this.getAchieveProgress(config);
            return __assign(__assign({}, config), { isCompleted: isCompleted, isClaimed: _this.checkAchieveClaimed(config.id), currentProgress: currentProgress });
        });
    };
    AchieveManager.prototype.refreshAchievements = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadAchievementConfig()];
                    case 1:
                        _a.sent();
                        this.initAchieves();
                        this.refreshScrollView();
                        return [2 /*return*/];
                }
            });
        });
    };
    AchieveManager.prototype.getBestScore = function () {
        if (GameData_1.default.GetBestScoreData) {
            GameData_1.default.GetBestScoreData();
        }
        return Math.max(0, GameData_1.default.BestScore || 0);
    };
    AchieveManager.prototype.getOnlineMinutes = function () {
        return UserDataSyncManager_1.default.getStoredNumber(this.dailyOnlineMinutesKey, 0);
    };
    AchieveManager.prototype.checkAchieveCompletion = function (achieve) {
        switch (achieve.type) {
            case '1':
                return this.getBestScore() >= achieve.count;
            case '2':
                return this.getOnlineMinutes() >= achieve.count;
            case '3':
                return GameData_1.default.totalGoldEarned >= achieve.count;
            case '4':
                return UserDataSyncManager_1.default.getTotalConsumedStamina() >= achieve.count;
            default:
                return false;
        }
    };
    AchieveManager.prototype.getAchieveProgress = function (achieve) {
        switch (achieve.type) {
            case '1':
                return this.getBestScore();
            case '2':
                return this.getOnlineMinutes();
            case '3':
                return GameData_1.default.totalGoldEarned;
            case '4':
                return UserDataSyncManager_1.default.getTotalConsumedStamina();
            default:
                return 0;
        }
    };
    AchieveManager.prototype.checkAchieveClaimed = function (achieveId) {
        var claimedList = this.getAchieveClaimedList();
        return claimedList.includes(achieveId);
    };
    AchieveManager.prototype.markAchieveClaimed = function (achieveId) {
        var claimedList = this.getAchieveClaimedList();
        if (!claimedList.includes(achieveId)) {
            claimedList.push(achieveId);
            this.saveAchieveClaimedList(claimedList);
        }
    };
    AchieveManager.prototype.refreshScrollView = function () {
        if (!this.scrollView || !this.achieveItemPrefab || !this.scrollView.content) {
            console.error('ScrollView or achieveItemPrefab not assigned');
            return;
        }
        this.scrollView.content.removeAllChildren();
        this.achieves.sort(function (a, b) { return a.id - b.id; });
        for (var i = 0; i < this.achieves.length; i++) {
            var achieveData = this.achieves[i];
            var achieveItem = cc.instantiate(this.achieveItemPrefab);
            this.scrollView.content.addChild(achieveItem);
            this.setAchieveItemData(achieveItem, achieveData);
        }
        this.adjustContainerSize();
    };
    AchieveManager.prototype.setAchieveItemData = function (achieveItem, achieveData) {
        var _this = this;
        var _a;
        var iconNode = achieveItem.getChildByName('icon');
        var nameNode = achieveItem.getChildByName('name');
        var descriptionNode = achieveItem.getChildByName('description');
        var rewardNode = achieveItem.getChildByName('reward');
        var claimButton = (_a = achieveItem.getChildByName('claimButton')) === null || _a === void 0 ? void 0 : _a.getComponent(cc.Button);
        var claimedNode = achieveItem.getChildByName('claimed');
        if (iconNode) {
            var spriteComponent = iconNode.getComponent(cc.Sprite);
            if (spriteComponent) {
            }
        }
        if (nameNode) {
            nameNode.getComponent(cc.Label).string = achieveData.name;
        }
        if (descriptionNode) {
            var currentProgress = achieveData.currentProgress || 0;
            var targetProgress = achieveData.count;
            var isCompleted = achieveData.isCompleted;
            var richText = descriptionNode.getComponent(cc.RichText);
            if (richText) {
                var progressColor = isCompleted ? '#00ff00' : '#ff0000';
                richText.string = achieveData.desc + "<color=" + progressColor + ">(" + currentProgress + "/" + targetProgress + ")</color>\u3002";
            }
        }
        if (rewardNode) {
            rewardNode.getChildByName('cost').getComponent(cc.Label).string = "x" + achieveData.rewardGold;
        }
        if (claimButton && this.claimHandler) {
            if (achieveData.isClaimed) {
                claimButton.node.active = false;
                if (claimedNode) {
                    claimedNode.active = true;
                }
            }
            else if (achieveData.isCompleted) {
                claimButton.node.active = true;
                if (claimedNode) {
                    claimedNode.active = false;
                }
                claimButton.interactable = true;
                claimButton.node.on(cc.Node.EventType.TOUCH_END, function () { return _this.onClaimClick(achieveData.id); }, this);
            }
            else {
                claimButton.node.active = true;
                if (claimedNode) {
                    claimedNode.active = false;
                }
                claimButton.interactable = false;
                var buttonSprite = claimButton.node.getComponent(cc.Sprite);
                if (buttonSprite) {
                    buttonSprite.node.color = cc.Color.GRAY;
                }
            }
        }
    };
    AchieveManager.prototype.adjustContainerSize = function () {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView or content node not assigned');
            return;
        }
        var container = this.scrollView.content;
        var children = container.children;
        if (children.length === 0) {
            return;
        }
        var item = children[0];
        var itemWidth = item.width;
        var itemHeight = item.height;
        var itemScale = item.scale || 1;
        var view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('view node not found');
            return;
        }
        var viewWidth = view.width;
        var columnCount = 3;
        var verticalSpacing = 30;
        var xPadding = 0;
        var yPadding = 10;
        var layoutItemWidth = itemWidth * itemScale;
        var layoutItemHeight = itemHeight * itemScale;
        var horizontalSpacing = Math.min(25, Math.max(0, (viewWidth - xPadding * 2 - layoutItemWidth * columnCount) / Math.max(1, columnCount - 1)));
        var rowCount = Math.ceil(children.length / columnCount);
        var totalHeight = rowCount * layoutItemHeight + Math.max(0, rowCount - 1) * verticalSpacing + 2 * yPadding;
        container.width = viewWidth;
        container.height = totalHeight;
        container.anchorX = 0.5;
        container.anchorY = 1;
        var gridWidth = columnCount * layoutItemWidth + (columnCount - 1) * horizontalSpacing;
        var startX = -gridWidth / 2 + layoutItemWidth / 2;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var row = Math.floor(i / columnCount);
            var col = i % columnCount;
            child.y = -yPadding - layoutItemHeight / 2 - row * (layoutItemHeight + verticalSpacing);
            child.x = startX + col * (layoutItemWidth + horizontalSpacing);
        }
        if (this.scrollView.scrollToTop) {
            this.scrollView.scrollToTop(0.1);
        }
    };
    AchieveManager.prototype.onClaimClick = function (achieveId) {
        var achieve = this.achieves.find(function (a) { return a.id === achieveId; });
        if (!achieve) {
            return;
        }
        if (!achieve.isCompleted) {
            console.log('Achievement not completed');
            return;
        }
        if (achieve.isClaimed) {
            console.log('Achievement already claimed');
            return;
        }
        this.giveReward(achieve);
        achieve.isClaimed = true;
        this.markAchieveClaimed(achieveId);
        this.refreshScrollView();
        this.showToast("\u83B7\u5F97" + achieve.rewardGold + "\u94BB\u77F3\u3002");
    };
    AchieveManager.prototype.giveReward = function (achieve) {
        if (achieve.rewardGold <= 0) {
            return;
        }
        GameData_1.default.addGold(achieve.rewardGold);
    };
    AchieveManager.prototype.onCloseClick = function () {
        this.node.active = false;
    };
    AchieveManager.prototype.showToast = function (message) {
        TipsManager_1.default.show(message);
    };
    AchieveManager.prototype.show = function () {
        this.node.active = true;
        this.refreshAchievements().catch(function (error) {
            console.error('Reload achievement config failed:', error);
        });
    };
    AchieveManager.prototype.hide = function () {
        this.node.active = false;
    };
    __decorate([
        property(cc.Button)
    ], AchieveManager.prototype, "closeButton", void 0);
    __decorate([
        property(cc.ScrollView)
    ], AchieveManager.prototype, "scrollView", void 0);
    __decorate([
        property(cc.Prefab)
    ], AchieveManager.prototype, "achieveItemPrefab", void 0);
    AchieveManager = __decorate([
        ccclass
    ], AchieveManager);
    return AchieveManager;
}(cc.Component));
exports.default = AchieveManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcQWNoaWV2ZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBc0IsRUFBRSxDQUFDLFVBQVUsRUFBbEMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFpQixDQUFDO0FBQzFDLDZDQUF5QztBQUN6QyxtREFBOEM7QUFDOUMsNkRBQXdEO0FBbUJ4RDtJQUE0QyxrQ0FBWTtJQUF4RDtRQUFBLHFFQThXQztRQTVXRyxpQkFBVyxHQUFjLElBQUksQ0FBQztRQUc5QixnQkFBVSxHQUFrQixJQUFJLENBQUM7UUFHakMsdUJBQWlCLEdBQWMsSUFBSSxDQUFDO1FBRTVCLGNBQVEsR0FBMEIsRUFBRSxDQUFDO1FBQ3JDLG9CQUFjLEdBQXdCLEVBQUUsQ0FBQztRQUN6QyxvQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2Qix1QkFBaUIsR0FBeUIsSUFBSSxDQUFDO1FBQy9DLGtCQUFZLEdBQXlDLElBQUksQ0FBQztRQUVqRCx1QkFBaUIsR0FBVyxpQkFBaUIsQ0FBQztRQUM5QywyQkFBcUIsR0FBVyxvQkFBb0IsQ0FBQzs7SUE2VjFFLENBQUM7SUEzVlcsa0NBQVMsR0FBakI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8seUNBQWdCLEdBQXhCLFVBQXlCLE9BQWU7UUFDcEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBVSxPQUFPLFNBQUksTUFBUSxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVPLDhDQUFxQixHQUE3QjtRQUNJLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRSxJ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Q0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBRU8sa0NBQVMsR0FBakIsVUFBa0IsT0FBZTtRQUM3QixxQkFBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0sNkJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ25DLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sNkJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBM1dEO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7dURBQ1U7SUFHOUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQztzREFDUztJQUdqQztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOzZEQUNnQjtJQVJuQixjQUFjO1FBRGxDLE9BQU87T0FDYSxjQUFjLENBOFdsQztJQUFELHFCQUFDO0NBOVdELEFBOFdDLENBOVcyQyxFQUFFLENBQUMsU0FBUyxHQThXdkQ7a0JBOVdvQixjQUFjIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XHJcbmltcG9ydCBtR2FtZURhdGEgZnJvbSAnLi4vTG9hZC9HYW1lRGF0YSc7XHJcbmltcG9ydCBUaXBzTWFuYWdlciBmcm9tICcuLi9Mb2FkL1RpcHNNYW5hZ2VyJztcclxuaW1wb3J0IFVzZXJEYXRhU3luY01hbmFnZXIgZnJvbSAnLi9Vc2VyRGF0YVN5bmNNYW5hZ2VyJztcclxuXHJcbmludGVyZmFjZSBBY2hpZXZlbWVudENvbmZpZyB7XHJcbiAgICBpZDogbnVtYmVyO1xyXG4gICAgaWNvbjogc3RyaW5nO1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGVzYzogc3RyaW5nO1xyXG4gICAgdHlwZTogc3RyaW5nO1xyXG4gICAgY291bnQ6IG51bWJlcjtcclxuICAgIHJld2FyZEdvbGQ6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEFjaGlldmVtZW50SXRlbURhdGEgZXh0ZW5kcyBBY2hpZXZlbWVudENvbmZpZyB7XHJcbiAgICBpc0NvbXBsZXRlZDogYm9vbGVhbjtcclxuICAgIGlzQ2xhaW1lZDogYm9vbGVhbjtcclxuICAgIGN1cnJlbnRQcm9ncmVzcz86IG51bWJlcjtcclxufVxyXG5cclxuQGNjY2xhc3NcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWNoaWV2ZU1hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG4gICAgQHByb3BlcnR5KGNjLkJ1dHRvbilcclxuICAgIGNsb3NlQnV0dG9uOiBjYy5CdXR0b24gPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5TY3JvbGxWaWV3KVxyXG4gICAgc2Nyb2xsVmlldzogY2MuU2Nyb2xsVmlldyA9IG51bGw7XHJcblxyXG4gICAgQHByb3BlcnR5KGNjLlByZWZhYilcclxuICAgIGFjaGlldmVJdGVtUHJlZmFiOiBjYy5QcmVmYWIgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgYWNoaWV2ZXM6IEFjaGlldmVtZW50SXRlbURhdGFbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBhY2hpZXZlQ29uZmlnczogQWNoaWV2ZW1lbnRDb25maWdbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBpc0NvbmZpZ0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBsb2FkQ29uZmlnUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBjbGFpbUhhbmRsZXI6ICgoYWNoaWV2ZUlkOiBudW1iZXIpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBhY2hpZXZlQ2xhaW1lZEtleTogc3RyaW5nID0gJ0FjaGlldmVzY2xhaW1lZCc7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRhaWx5T25saW5lTWludXRlc0tleTogc3RyaW5nID0gJ2RhaWx5T25saW5lTWludXRlcyc7XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEtleVdpdGhVc2VySWQoYmFzZUtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xyXG4gICAgICAgIGlmICh1c2VySWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VLZXl9XyR7dXNlcklkfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBiYXNlS2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWNoaWV2ZUNsYWltZWRMaXN0KCk6IG51bWJlcltdIHtcclxuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuYWNoaWV2ZUNsYWltZWRLZXkpO1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSk7XHJcbiAgICAgICAgaWYgKCFjbGFpbWVkU3RyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY2xhaW1lZFN0cik7XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBhcnNlZCkgPyBwYXJzZWQgOiBbXTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQYXJzZSBhY2hpZXZlIGNsYWltZWQgZGF0YSBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2F2ZUFjaGlldmVDbGFpbWVkTGlzdChjbGFpbWVkTGlzdDogbnVtYmVyW10pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuYWNoaWV2ZUNsYWltZWRLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShjbGFpbWVkTGlzdCkpO1xyXG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2xvc2VCdXR0b24pIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5ub2RlLm9uKCdjbGljaycsIHRoaXMub25DbG9zZUNsaWNrLCB0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2xhaW1IYW5kbGVyID0gKGFjaGlldmVJZDogbnVtYmVyKSA9PiB0aGlzLm9uQ2xhaW1DbGljayhhY2hpZXZlSWQpO1xyXG5cclxuICAgICAgICB0aGlzLnJlZnJlc2hBY2hpZXZlbWVudHMoKS5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTG9hZCBhY2hpZXZlbWVudCBjb25maWcgZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25FbmFibGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoQWNoaWV2ZW1lbnRzKCkuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZnJlc2ggYWNoaWV2ZW1lbnQgZGF0YSBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbG9hZEFjaGlldmVtZW50Q29uZmlnKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ29uZmlnTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxvYWRDb25maWdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRDb25maWdQcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2FkQ29uZmlnUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ2NvbmZpZy9hY2hpZXZlbWVudCcsIGNjLkpzb25Bc3NldCwgKGVycjogRXJyb3IsIGpzb25Bc3NldDogY2MuSnNvbkFzc2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0NvbmZpZ3MgPSBqc29uQXNzZXQgJiYgQXJyYXkuaXNBcnJheShqc29uQXNzZXQuanNvbikgPyBqc29uQXNzZXQuanNvbiA6IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY2hpZXZlQ29uZmlncyA9IHJhd0NvbmZpZ3MubWFwKChjb25maWc6IGFueSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogTnVtYmVyKGNvbmZpZy5pZCkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBgJHtjb25maWcuaWNvbiB8fCAnJ31gLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke2NvbmZpZy5uYW1lIHx8ICcnfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogYCR7Y29uZmlnLmRlc2MgfHwgJyd9YCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBgJHtjb25maWcudHlwZSB8fCAnJ31gLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiBOdW1iZXIoY29uZmlnLnRhcmdldCA/PyBjb25maWcuY291bnQpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkR29sZDogTnVtYmVyKGNvbmZpZy5yZXdhcmREaWFtb25kID8/IGNvbmZpZy5yZXdhcmRHb2xkKSB8fCAwXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29uZmlnTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRDb25maWdQcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdEFjaGlldmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYWNoaWV2ZXMgPSB0aGlzLmFjaGlldmVDb25maWdzLm1hcCgoY29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gdGhpcy5jaGVja0FjaGlldmVDb21wbGV0aW9uKGNvbmZpZyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9ncmVzcyA9IHRoaXMuZ2V0QWNoaWV2ZVByb2dyZXNzKGNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAuLi5jb25maWcsXHJcbiAgICAgICAgICAgICAgICBpc0NvbXBsZXRlZCxcclxuICAgICAgICAgICAgICAgIGlzQ2xhaW1lZDogdGhpcy5jaGVja0FjaGlldmVDbGFpbWVkKGNvbmZpZy5pZCksXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UHJvZ3Jlc3NcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHJlZnJlc2hBY2hpZXZlbWVudHMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkQWNoaWV2ZW1lbnRDb25maWcoKTtcclxuICAgICAgICB0aGlzLmluaXRBY2hpZXZlcygpO1xyXG4gICAgICAgIHRoaXMucmVmcmVzaFNjcm9sbFZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEJlc3RTY29yZSgpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChtR2FtZURhdGEuR2V0QmVzdFNjb3JlRGF0YSkge1xyXG4gICAgICAgICAgICBtR2FtZURhdGEuR2V0QmVzdFNjb3JlRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgbUdhbWVEYXRhLkJlc3RTY29yZSB8fCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE9ubGluZU1pbnV0ZXMoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gVXNlckRhdGFTeW5jTWFuYWdlci5nZXRTdG9yZWROdW1iZXIodGhpcy5kYWlseU9ubGluZU1pbnV0ZXNLZXksIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tBY2hpZXZlQ29tcGxldGlvbihhY2hpZXZlOiBBY2hpZXZlbWVudENvbmZpZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHN3aXRjaCAoYWNoaWV2ZS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJzEnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QmVzdFNjb3JlKCkgPj0gYWNoaWV2ZS5jb3VudDtcclxuICAgICAgICAgICAgY2FzZSAnMic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPbmxpbmVNaW51dGVzKCkgPj0gYWNoaWV2ZS5jb3VudDtcclxuICAgICAgICAgICAgY2FzZSAnMyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbUdhbWVEYXRhLnRvdGFsR29sZEVhcm5lZCA+PSBhY2hpZXZlLmNvdW50O1xyXG4gICAgICAgICAgICBjYXNlICc0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBVc2VyRGF0YVN5bmNNYW5hZ2VyLmdldFRvdGFsQ29uc3VtZWRTdGFtaW5hKCkgPj0gYWNoaWV2ZS5jb3VudDtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBY2hpZXZlUHJvZ3Jlc3MoYWNoaWV2ZTogQWNoaWV2ZW1lbnRDb25maWcpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAoYWNoaWV2ZS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJzEnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QmVzdFNjb3JlKCk7XHJcbiAgICAgICAgICAgIGNhc2UgJzInOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25saW5lTWludXRlcygpO1xyXG4gICAgICAgICAgICBjYXNlICczJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBtR2FtZURhdGEudG90YWxHb2xkRWFybmVkO1xyXG4gICAgICAgICAgICBjYXNlICc0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBVc2VyRGF0YVN5bmNNYW5hZ2VyLmdldFRvdGFsQ29uc3VtZWRTdGFtaW5hKCk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0FjaGlldmVDbGFpbWVkKGFjaGlldmVJZDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgY2xhaW1lZExpc3QgPSB0aGlzLmdldEFjaGlldmVDbGFpbWVkTGlzdCgpO1xyXG4gICAgICAgIHJldHVybiBjbGFpbWVkTGlzdC5pbmNsdWRlcyhhY2hpZXZlSWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbWFya0FjaGlldmVDbGFpbWVkKGFjaGlldmVJZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2xhaW1lZExpc3QgPSB0aGlzLmdldEFjaGlldmVDbGFpbWVkTGlzdCgpO1xyXG4gICAgICAgIGlmICghY2xhaW1lZExpc3QuaW5jbHVkZXMoYWNoaWV2ZUlkKSkge1xyXG4gICAgICAgICAgICBjbGFpbWVkTGlzdC5wdXNoKGFjaGlldmVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZUFjaGlldmVDbGFpbWVkTGlzdChjbGFpbWVkTGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVmcmVzaFNjcm9sbFZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcgfHwgIXRoaXMuYWNoaWV2ZUl0ZW1QcmVmYWIgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Njcm9sbFZpZXcgb3IgYWNoaWV2ZUl0ZW1QcmVmYWIgbm90IGFzc2lnbmVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgdGhpcy5hY2hpZXZlcy5zb3J0KChhLCBiKSA9PiBhLmlkIC0gYi5pZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hY2hpZXZlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBhY2hpZXZlRGF0YSA9IHRoaXMuYWNoaWV2ZXNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGFjaGlldmVJdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5hY2hpZXZlSXRlbVByZWZhYik7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LmFkZENoaWxkKGFjaGlldmVJdGVtKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRBY2hpZXZlSXRlbURhdGEoYWNoaWV2ZUl0ZW0sIGFjaGlldmVEYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyU2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0QWNoaWV2ZUl0ZW1EYXRhKGFjaGlldmVJdGVtOiBjYy5Ob2RlLCBhY2hpZXZlRGF0YTogQWNoaWV2ZW1lbnRJdGVtRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGljb25Ob2RlID0gYWNoaWV2ZUl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ2ljb24nKTtcclxuICAgICAgICBjb25zdCBuYW1lTm9kZSA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCduYW1lJyk7XHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb25Ob2RlID0gYWNoaWV2ZUl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ2Rlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgY29uc3QgcmV3YXJkTm9kZSA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCdyZXdhcmQnKTtcclxuICAgICAgICBjb25zdCBjbGFpbUJ1dHRvbiA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCdjbGFpbUJ1dHRvbicpPy5nZXRDb21wb25lbnQoY2MuQnV0dG9uKTtcclxuICAgICAgICBjb25zdCBjbGFpbWVkTm9kZSA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCdjbGFpbWVkJyk7XHJcblxyXG4gICAgICAgIGlmIChpY29uTm9kZSkge1xyXG4gICAgICAgICAgICBjb25zdCBzcHJpdGVDb21wb25lbnQgPSBpY29uTm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcclxuICAgICAgICAgICAgaWYgKHNwcml0ZUNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmFtZU5vZGUpIHtcclxuICAgICAgICAgICAgbmFtZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBhY2hpZXZlRGF0YS5uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRlc2NyaXB0aW9uTm9kZSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UHJvZ3Jlc3MgPSBhY2hpZXZlRGF0YS5jdXJyZW50UHJvZ3Jlc3MgfHwgMDtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UHJvZ3Jlc3MgPSBhY2hpZXZlRGF0YS5jb3VudDtcclxuICAgICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBhY2hpZXZlRGF0YS5pc0NvbXBsZXRlZDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJpY2hUZXh0ID0gZGVzY3JpcHRpb25Ob2RlLmdldENvbXBvbmVudChjYy5SaWNoVGV4dCk7XHJcbiAgICAgICAgICAgIGlmIChyaWNoVGV4dCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NDb2xvciA9IGlzQ29tcGxldGVkID8gJyMwMGZmMDAnIDogJyNmZjAwMDAnO1xyXG4gICAgICAgICAgICAgICAgcmljaFRleHQuc3RyaW5nID0gYCR7YWNoaWV2ZURhdGEuZGVzY308Y29sb3I9JHtwcm9ncmVzc0NvbG9yfT4oJHtjdXJyZW50UHJvZ3Jlc3N9LyR7dGFyZ2V0UHJvZ3Jlc3N9KTwvY29sb3I+44CCYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJld2FyZE5vZGUpIHtcclxuICAgICAgICAgICAgcmV3YXJkTm9kZS5nZXRDaGlsZEJ5TmFtZSgnY29zdCcpLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gYHgke2FjaGlldmVEYXRhLnJld2FyZEdvbGR9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjbGFpbUJ1dHRvbiAmJiB0aGlzLmNsYWltSGFuZGxlcikge1xyXG4gICAgICAgICAgICBpZiAoYWNoaWV2ZURhdGEuaXNDbGFpbWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFpbUJ1dHRvbi5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsYWltZWROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhaW1lZE5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY2hpZXZlRGF0YS5pc0NvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgY2xhaW1CdXR0b24ubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsYWltZWROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhaW1lZE5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbGFpbUJ1dHRvbi5pbnRlcmFjdGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY2xhaW1CdXR0b24ubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25DbGFpbUNsaWNrKGFjaGlldmVEYXRhLmlkKSwgdGhpcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjbGFpbUJ1dHRvbi5ub2RlLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xhaW1lZE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFpbWVkTm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNsYWltQnV0dG9uLmludGVyYWN0YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uU3ByaXRlID0gY2xhaW1CdXR0b24ubm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcclxuICAgICAgICAgICAgICAgIGlmIChidXR0b25TcHJpdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25TcHJpdGUubm9kZS5jb2xvciA9IGNjLkNvbG9yLkdSQVk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGp1c3RDb250YWluZXJTaXplKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxWaWV3IHx8ICF0aGlzLnNjcm9sbFZpZXcuY29udGVudCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY3JvbGxWaWV3IG9yIGNvbnRlbnQgbm9kZSBub3QgYXNzaWduZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5zY3JvbGxWaWV3LmNvbnRlbnQ7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW47XHJcblxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaXRlbSA9IGNoaWxkcmVuWzBdO1xyXG4gICAgICAgIGNvbnN0IGl0ZW1XaWR0aCA9IGl0ZW0ud2lkdGg7XHJcbiAgICAgICAgY29uc3QgaXRlbUhlaWdodCA9IGl0ZW0uaGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IGl0ZW1TY2FsZSA9IGl0ZW0uc2NhbGUgfHwgMTtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuc2Nyb2xsVmlldy5ub2RlLmdldENoaWxkQnlOYW1lKCd2aWV3Jyk7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3ZpZXcgbm9kZSBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSB2aWV3LndpZHRoO1xyXG5cclxuICAgICAgICBjb25zdCBjb2x1bW5Db3VudCA9IDM7XHJcbiAgICAgICAgY29uc3QgdmVydGljYWxTcGFjaW5nID0gMzA7XHJcbiAgICAgICAgY29uc3QgeFBhZGRpbmcgPSAwO1xyXG4gICAgICAgIGNvbnN0IHlQYWRkaW5nID0gMTA7XHJcbiAgICAgICAgY29uc3QgbGF5b3V0SXRlbVdpZHRoID0gaXRlbVdpZHRoICogaXRlbVNjYWxlO1xyXG4gICAgICAgIGNvbnN0IGxheW91dEl0ZW1IZWlnaHQgPSBpdGVtSGVpZ2h0ICogaXRlbVNjYWxlO1xyXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxTcGFjaW5nID0gTWF0aC5taW4oMjUsIE1hdGgubWF4KDAsICh2aWV3V2lkdGggLSB4UGFkZGluZyAqIDIgLSBsYXlvdXRJdGVtV2lkdGggKiBjb2x1bW5Db3VudCkgLyBNYXRoLm1heCgxLCBjb2x1bW5Db3VudCAtIDEpKSk7XHJcbiAgICAgICAgY29uc3Qgcm93Q291bnQgPSBNYXRoLmNlaWwoY2hpbGRyZW4ubGVuZ3RoIC8gY29sdW1uQ291bnQpO1xyXG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gcm93Q291bnQgKiBsYXlvdXRJdGVtSGVpZ2h0ICsgTWF0aC5tYXgoMCwgcm93Q291bnQgLSAxKSAqIHZlcnRpY2FsU3BhY2luZyArIDIgKiB5UGFkZGluZztcclxuXHJcbiAgICAgICAgY29udGFpbmVyLndpZHRoID0gdmlld1dpZHRoO1xyXG4gICAgICAgIGNvbnRhaW5lci5oZWlnaHQgPSB0b3RhbEhlaWdodDtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclggPSAwLjU7XHJcbiAgICAgICAgY29udGFpbmVyLmFuY2hvclkgPSAxO1xyXG5cclxuICAgICAgICBjb25zdCBncmlkV2lkdGggPSBjb2x1bW5Db3VudCAqIGxheW91dEl0ZW1XaWR0aCArIChjb2x1bW5Db3VudCAtIDEpICogaG9yaXpvbnRhbFNwYWNpbmc7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRYID0gLWdyaWRXaWR0aCAvIDIgKyBsYXlvdXRJdGVtV2lkdGggLyAyO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIGNvbHVtbkNvdW50KTtcclxuICAgICAgICAgICAgY29uc3QgY29sID0gaSAlIGNvbHVtbkNvdW50O1xyXG4gICAgICAgICAgICBjaGlsZC55ID0gLXlQYWRkaW5nIC0gbGF5b3V0SXRlbUhlaWdodCAvIDIgLSByb3cgKiAobGF5b3V0SXRlbUhlaWdodCArIHZlcnRpY2FsU3BhY2luZyk7XHJcbiAgICAgICAgICAgIGNoaWxkLnggPSBzdGFydFggKyBjb2wgKiAobGF5b3V0SXRlbVdpZHRoICsgaG9yaXpvbnRhbFNwYWNpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsVmlldy5zY3JvbGxUb1RvcCkge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFZpZXcuc2Nyb2xsVG9Ub3AoMC4xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNsYWltQ2xpY2soYWNoaWV2ZUlkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBhY2hpZXZlID0gdGhpcy5hY2hpZXZlcy5maW5kKGEgPT4gYS5pZCA9PT0gYWNoaWV2ZUlkKTtcclxuICAgICAgICBpZiAoIWFjaGlldmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFhY2hpZXZlLmlzQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBY2hpZXZlbWVudCBub3QgY29tcGxldGVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhY2hpZXZlLmlzQ2xhaW1lZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWNoaWV2ZW1lbnQgYWxyZWFkeSBjbGFpbWVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2l2ZVJld2FyZChhY2hpZXZlKTtcclxuXHJcbiAgICAgICAgYWNoaWV2ZS5pc0NsYWltZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWFya0FjaGlldmVDbGFpbWVkKGFjaGlldmVJZCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVmcmVzaFNjcm9sbFZpZXcoKTtcclxuICAgICAgICB0aGlzLnNob3dUb2FzdChg6I635b6XJHthY2hpZXZlLnJld2FyZEdvbGR96ZK755+z44CCYCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnaXZlUmV3YXJkKGFjaGlldmU6IEFjaGlldmVtZW50SXRlbURhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZiAoYWNoaWV2ZS5yZXdhcmRHb2xkIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbUdhbWVEYXRhLmFkZEdvbGQoYWNoaWV2ZS5yZXdhcmRHb2xkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ2xvc2VDbGljaygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgVGlwc01hbmFnZXIuc2hvdyhtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hBY2hpZXZlbWVudHMoKS5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUmVsb2FkIGFjaGlldmVtZW50IGNvbmZpZyBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxufVxyXG4iXX0=