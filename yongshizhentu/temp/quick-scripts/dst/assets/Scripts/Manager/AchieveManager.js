
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
                        desc: ("" + (config.desc || '')).trim(),
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
    AchieveManager.prototype.getBestDistance = function () {
        var userId = this.getUserId();
        var scopedKey = userId ? "WarriorRunBestDistance_" + userId : 'WarriorRunBestDistance';
        var raw = cc.sys.localStorage.getItem(scopedKey) || cc.sys.localStorage.getItem('WarriorRunBestDistance');
        return Math.max(0, Number(raw) || 0);
    };
    AchieveManager.prototype.getOnlineMinutes = function () {
        return UserDataSyncManager_1.default.getStoredNumber(this.dailyOnlineMinutesKey, 0);
    };
    AchieveManager.prototype.checkAchieveCompletion = function (achieve) {
        switch (achieve.type) {
            case '1':
                return this.getBestDistance() >= achieve.count;
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
                return this.getBestDistance();
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
            var spriteComponent_1 = iconNode.getComponent(cc.Sprite);
            if (spriteComponent_1) {
                cc.loader.loadRes('2main/jinbi', cc.SpriteFrame, function (err, spriteFrame) {
                    if (!err && spriteFrame && iconNode.isValid) {
                        spriteComponent_1.spriteFrame = spriteFrame;
                    }
                });
            }
        }
        if (nameNode) {
            var label = nameNode.getComponent(cc.Label);
            if (label) {
                label.string = achieveData.name;
                label.fontSize = 28;
                label.lineHeight = 34;
                label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                nameNode.color = cc.Color.WHITE;
            }
        }
        if (descriptionNode) {
            var currentProgress = achieveData.currentProgress || 0;
            var targetProgress = achieveData.count;
            var isCompleted = achieveData.isCompleted;
            var richText = descriptionNode.getComponent(cc.RichText);
            if (richText) {
                var progressColor = isCompleted ? '#00FF33' : '#E60000';
                richText.fontSize = 20;
                richText.lineHeight = 22;
                richText.maxWidth = 206;
                richText.string = achieveData.desc + "\n<color=" + progressColor + ">(" + currentProgress + "/" + targetProgress + ")\u3002</color>";
            }
        }
        if (rewardNode) {
            var costNode = rewardNode.getChildByName('cost');
            var costLabel = costNode ? costNode.getComponent(cc.Label) : null;
            if (costLabel) {
                costLabel.string = "" + achieveData.rewardGold;
                costLabel.fontSize = 28;
                costLabel.lineHeight = 34;
                costNode.color = cc.color(255, 241, 183);
            }
        }
        if (claimButton && this.claimHandler) {
            claimButton.node.off(cc.Node.EventType.TOUCH_END);
            claimButton.node.opacity = 255;
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
                claimButton.node.opacity = 185;
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
        var itemWidth = item.width || 243;
        var itemHeight = item.height || 278;
        var view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('view node not found');
            return;
        }
        var columns = 2;
        var columnSpacing = 24;
        var rowSpacing = 24;
        var topPadding = 8;
        var bottomPadding = 24;
        var viewWidth = Math.max(view.width, columns * itemWidth + columnSpacing);
        var rows = Math.ceil(children.length / columns);
        var totalHeight = rows * itemHeight + Math.max(0, rows - 1) * rowSpacing + topPadding + bottomPadding;
        container.width = viewWidth;
        container.height = Math.max(view.height, totalHeight);
        container.anchorX = 0.5;
        container.anchorY = 1;
        var startX = -((columns - 1) * (itemWidth + columnSpacing)) / 2;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var col = i % columns;
            var row = Math.floor(i / columns);
            child.x = startX + col * (itemWidth + columnSpacing);
            child.y = -topPadding - itemHeight / 2 - row * (itemHeight + rowSpacing);
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
        var _this = this;
        if (!this.claimHandler) {
            this.claimHandler = function (achieveId) { return _this.onClaimClick(achieveId); };
        }
        this.refreshAchievements().then(function () {
            _this.node.active = true;
        }).catch(function (error) {
            console.error('Reload achievement config failed:', error);
            _this.node.active = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcQWNoaWV2ZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBc0IsRUFBRSxDQUFDLFVBQVUsRUFBbEMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFpQixDQUFDO0FBQzFDLDZDQUF5QztBQUN6QyxtREFBOEM7QUFDOUMsNkRBQXdEO0FBbUJ4RDtJQUE0QyxrQ0FBWTtJQUF4RDtRQUFBLHFFQXdYQztRQXRYRyxpQkFBVyxHQUFjLElBQUksQ0FBQztRQUc5QixnQkFBVSxHQUFrQixJQUFJLENBQUM7UUFHakMsdUJBQWlCLEdBQWMsSUFBSSxDQUFDO1FBRTVCLGNBQVEsR0FBMEIsRUFBRSxDQUFDO1FBQ3JDLG9CQUFjLEdBQXdCLEVBQUUsQ0FBQztRQUN6QyxvQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2Qix1QkFBaUIsR0FBeUIsSUFBSSxDQUFDO1FBQy9DLGtCQUFZLEdBQXlDLElBQUksQ0FBQztRQUVqRCx1QkFBaUIsR0FBVyxpQkFBaUIsQ0FBQztRQUM5QywyQkFBcUIsR0FBVyxvQkFBb0IsQ0FBQzs7SUF1VzFFLENBQUM7SUFyV1csa0NBQVMsR0FBakI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8seUNBQWdCLEdBQXhCLFVBQXlCLE9BQWU7UUFDcEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBVSxPQUFPLFNBQUksTUFBUSxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVPLDhDQUFxQixHQUE3QjtRQUNJLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRSxJ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LENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSztZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUQsS0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDZCQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQXJYRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO3VEQUNVO0lBRzlCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7c0RBQ1M7SUFHakM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzs2REFDZ0I7SUFSbkIsY0FBYztRQURsQyxPQUFPO09BQ2EsY0FBYyxDQXdYbEM7SUFBRCxxQkFBQztDQXhYRCxBQXdYQyxDQXhYMkMsRUFBRSxDQUFDLFNBQVMsR0F3WHZEO2tCQXhYb0IsY0FBYyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xyXG5pbXBvcnQgbUdhbWVEYXRhIGZyb20gJy4uL0xvYWQvR2FtZURhdGEnO1xyXG5pbXBvcnQgVGlwc01hbmFnZXIgZnJvbSAnLi4vTG9hZC9UaXBzTWFuYWdlcic7XHJcbmltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gJy4vVXNlckRhdGFTeW5jTWFuYWdlcic7XHJcblxyXG5pbnRlcmZhY2UgQWNoaWV2ZW1lbnRDb25maWcge1xyXG4gICAgaWQ6IG51bWJlcjtcclxuICAgIGljb246IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRlc2M6IHN0cmluZztcclxuICAgIHR5cGU6IHN0cmluZztcclxuICAgIGNvdW50OiBudW1iZXI7XHJcbiAgICByZXdhcmRHb2xkOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBY2hpZXZlbWVudEl0ZW1EYXRhIGV4dGVuZHMgQWNoaWV2ZW1lbnRDb25maWcge1xyXG4gICAgaXNDb21wbGV0ZWQ6IGJvb2xlYW47XHJcbiAgICBpc0NsYWltZWQ6IGJvb2xlYW47XHJcbiAgICBjdXJyZW50UHJvZ3Jlc3M/OiBudW1iZXI7XHJcbn1cclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjaGlldmVNYW5hZ2VyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pXHJcbiAgICBjbG9zZUJ1dHRvbjogY2MuQnV0dG9uID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuU2Nyb2xsVmlldylcclxuICAgIHNjcm9sbFZpZXc6IGNjLlNjcm9sbFZpZXcgPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5QcmVmYWIpXHJcbiAgICBhY2hpZXZlSXRlbVByZWZhYjogY2MuUHJlZmFiID0gbnVsbDtcclxuXHJcbiAgICBwcml2YXRlIGFjaGlldmVzOiBBY2hpZXZlbWVudEl0ZW1EYXRhW10gPSBbXTtcclxuICAgIHByaXZhdGUgYWNoaWV2ZUNvbmZpZ3M6IEFjaGlldmVtZW50Q29uZmlnW10gPSBbXTtcclxuICAgIHByaXZhdGUgaXNDb25maWdMb2FkZWQgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgbG9hZENvbmZpZ1Byb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgY2xhaW1IYW5kbGVyOiAoKGFjaGlldmVJZDogbnVtYmVyKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgYWNoaWV2ZUNsYWltZWRLZXk6IHN0cmluZyA9ICdBY2hpZXZlc2NsYWltZWQnO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBkYWlseU9ubGluZU1pbnV0ZXNLZXk6IHN0cmluZyA9ICdkYWlseU9ubGluZU1pbnV0ZXMnO1xyXG5cclxuICAgIHByaXZhdGUgZ2V0VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRLZXlXaXRoVXNlcklkKGJhc2VLZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBpZiAodXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlS2V5fV8ke3VzZXJJZH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZUtleTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEFjaGlldmVDbGFpbWVkTGlzdCgpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmFjaGlldmVDbGFpbWVkS2V5KTtcclxuICAgICAgICBjb25zdCBjbGFpbWVkU3RyID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpO1xyXG4gICAgICAgIGlmICghY2xhaW1lZFN0cikge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNsYWltZWRTdHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShwYXJzZWQpID8gcGFyc2VkIDogW107XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUGFyc2UgYWNoaWV2ZSBjbGFpbWVkIGRhdGEgZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNhdmVBY2hpZXZlQ2xhaW1lZExpc3QoY2xhaW1lZExpc3Q6IG51bWJlcltdKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmFjaGlldmVDbGFpbWVkS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkoY2xhaW1lZExpc3QpKTtcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Mb2FkKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmNsb3NlQnV0dG9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24ubm9kZS5vbignY2xpY2snLCB0aGlzLm9uQ2xvc2VDbGljaywgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNsYWltSGFuZGxlciA9IChhY2hpZXZlSWQ6IG51bWJlcikgPT4gdGhpcy5vbkNsYWltQ2xpY2soYWNoaWV2ZUlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGxvYWRBY2hpZXZlbWVudENvbmZpZygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAodGhpcy5pc0NvbmZpZ0xvYWRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5sb2FkQ29uZmlnUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2FkQ29uZmlnUHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9hZENvbmZpZ1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKCdjb25maWcvYWNoaWV2ZW1lbnQnLCBjYy5Kc29uQXNzZXQsIChlcnI6IEVycm9yLCBqc29uQXNzZXQ6IGNjLkpzb25Bc3NldCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCByYXdDb25maWdzID0ganNvbkFzc2V0ICYmIEFycmF5LmlzQXJyYXkoanNvbkFzc2V0Lmpzb24pID8ganNvbkFzc2V0Lmpzb24gOiBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWNoaWV2ZUNvbmZpZ3MgPSByYXdDb25maWdzLm1hcCgoY29uZmlnOiBhbnkpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IE51bWJlcihjb25maWcuaWQpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogYCR7Y29uZmlnLmljb24gfHwgJyd9YCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBgJHtjb25maWcubmFtZSB8fCAnJ31gLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2M6IGAke2NvbmZpZy5kZXNjIHx8ICcnfWAudHJpbSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGAke2NvbmZpZy50eXBlIHx8ICcnfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IE51bWJlcihjb25maWcudGFyZ2V0ID8/IGNvbmZpZy5jb3VudCkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICByZXdhcmRHb2xkOiBOdW1iZXIoY29uZmlnLnJld2FyZERpYW1vbmQgPz8gY29uZmlnLnJld2FyZEdvbGQpIHx8IDBcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNDb25maWdMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZENvbmZpZ1Byb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0QWNoaWV2ZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hY2hpZXZlcyA9IHRoaXMuYWNoaWV2ZUNvbmZpZ3MubWFwKChjb25maWcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSB0aGlzLmNoZWNrQWNoaWV2ZUNvbXBsZXRpb24oY29uZmlnKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdGhpcy5nZXRBY2hpZXZlUHJvZ3Jlc3MoY29uZmlnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIC4uLmNvbmZpZyxcclxuICAgICAgICAgICAgICAgIGlzQ29tcGxldGVkLFxyXG4gICAgICAgICAgICAgICAgaXNDbGFpbWVkOiB0aGlzLmNoZWNrQWNoaWV2ZUNsYWltZWQoY29uZmlnLmlkKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9ncmVzc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgcmVmcmVzaEFjaGlldmVtZW50cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWRBY2hpZXZlbWVudENvbmZpZygpO1xyXG4gICAgICAgIHRoaXMuaW5pdEFjaGlldmVzKCk7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoU2Nyb2xsVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QmVzdERpc3RhbmNlKCk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBjb25zdCBzY29wZWRLZXkgPSB1c2VySWQgPyBgV2FycmlvclJ1bkJlc3REaXN0YW5jZV8ke3VzZXJJZH1gIDogJ1dhcnJpb3JSdW5CZXN0RGlzdGFuY2UnO1xyXG4gICAgICAgIGNvbnN0IHJhdyA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzY29wZWRLZXkpIHx8IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnV2FycmlvclJ1bkJlc3REaXN0YW5jZScpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgwLCBOdW1iZXIocmF3KSB8fCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE9ubGluZU1pbnV0ZXMoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gVXNlckRhdGFTeW5jTWFuYWdlci5nZXRTdG9yZWROdW1iZXIodGhpcy5kYWlseU9ubGluZU1pbnV0ZXNLZXksIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tBY2hpZXZlQ29tcGxldGlvbihhY2hpZXZlOiBBY2hpZXZlbWVudENvbmZpZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHN3aXRjaCAoYWNoaWV2ZS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJzEnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QmVzdERpc3RhbmNlKCkgPj0gYWNoaWV2ZS5jb3VudDtcclxuICAgICAgICAgICAgY2FzZSAnMic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPbmxpbmVNaW51dGVzKCkgPj0gYWNoaWV2ZS5jb3VudDtcclxuICAgICAgICAgICAgY2FzZSAnMyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbUdhbWVEYXRhLnRvdGFsR29sZEVhcm5lZCA+PSBhY2hpZXZlLmNvdW50O1xyXG4gICAgICAgICAgICBjYXNlICc0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBVc2VyRGF0YVN5bmNNYW5hZ2VyLmdldFRvdGFsQ29uc3VtZWRTdGFtaW5hKCkgPj0gYWNoaWV2ZS5jb3VudDtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBY2hpZXZlUHJvZ3Jlc3MoYWNoaWV2ZTogQWNoaWV2ZW1lbnRDb25maWcpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAoYWNoaWV2ZS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJzEnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QmVzdERpc3RhbmNlKCk7XHJcbiAgICAgICAgICAgIGNhc2UgJzInOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25saW5lTWludXRlcygpO1xyXG4gICAgICAgICAgICBjYXNlICczJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBtR2FtZURhdGEudG90YWxHb2xkRWFybmVkO1xyXG4gICAgICAgICAgICBjYXNlICc0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBVc2VyRGF0YVN5bmNNYW5hZ2VyLmdldFRvdGFsQ29uc3VtZWRTdGFtaW5hKCk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0FjaGlldmVDbGFpbWVkKGFjaGlldmVJZDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgY2xhaW1lZExpc3QgPSB0aGlzLmdldEFjaGlldmVDbGFpbWVkTGlzdCgpO1xyXG4gICAgICAgIHJldHVybiBjbGFpbWVkTGlzdC5pbmNsdWRlcyhhY2hpZXZlSWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbWFya0FjaGlldmVDbGFpbWVkKGFjaGlldmVJZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2xhaW1lZExpc3QgPSB0aGlzLmdldEFjaGlldmVDbGFpbWVkTGlzdCgpO1xyXG4gICAgICAgIGlmICghY2xhaW1lZExpc3QuaW5jbHVkZXMoYWNoaWV2ZUlkKSkge1xyXG4gICAgICAgICAgICBjbGFpbWVkTGlzdC5wdXNoKGFjaGlldmVJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZUFjaGlldmVDbGFpbWVkTGlzdChjbGFpbWVkTGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVmcmVzaFNjcm9sbFZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcgfHwgIXRoaXMuYWNoaWV2ZUl0ZW1QcmVmYWIgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Njcm9sbFZpZXcgb3IgYWNoaWV2ZUl0ZW1QcmVmYWIgbm90IGFzc2lnbmVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgdGhpcy5hY2hpZXZlcy5zb3J0KChhLCBiKSA9PiBhLmlkIC0gYi5pZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hY2hpZXZlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBhY2hpZXZlRGF0YSA9IHRoaXMuYWNoaWV2ZXNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGFjaGlldmVJdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5hY2hpZXZlSXRlbVByZWZhYik7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVmlldy5jb250ZW50LmFkZENoaWxkKGFjaGlldmVJdGVtKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRBY2hpZXZlSXRlbURhdGEoYWNoaWV2ZUl0ZW0sIGFjaGlldmVEYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyU2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0QWNoaWV2ZUl0ZW1EYXRhKGFjaGlldmVJdGVtOiBjYy5Ob2RlLCBhY2hpZXZlRGF0YTogQWNoaWV2ZW1lbnRJdGVtRGF0YSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGljb25Ob2RlID0gYWNoaWV2ZUl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ2ljb24nKTtcclxuICAgICAgICBjb25zdCBuYW1lTm9kZSA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCduYW1lJyk7XHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb25Ob2RlID0gYWNoaWV2ZUl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ2Rlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgY29uc3QgcmV3YXJkTm9kZSA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCdyZXdhcmQnKTtcclxuICAgICAgICBjb25zdCBjbGFpbUJ1dHRvbiA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCdjbGFpbUJ1dHRvbicpPy5nZXRDb21wb25lbnQoY2MuQnV0dG9uKTtcclxuICAgICAgICBjb25zdCBjbGFpbWVkTm9kZSA9IGFjaGlldmVJdGVtLmdldENoaWxkQnlOYW1lKCdjbGFpbWVkJyk7XHJcblxyXG4gICAgICAgIGlmIChpY29uTm9kZSkge1xyXG4gICAgICAgICAgICBjb25zdCBzcHJpdGVDb21wb25lbnQgPSBpY29uTm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcclxuICAgICAgICAgICAgaWYgKHNwcml0ZUNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJzJtYWluL2ppbmJpJywgY2MuU3ByaXRlRnJhbWUsIChlcnI6IEVycm9yLCBzcHJpdGVGcmFtZTogY2MuU3ByaXRlRnJhbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSAmJiBpY29uTm9kZS5pc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmFtZU5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBuYW1lTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xyXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IGFjaGlldmVEYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDI4O1xyXG4gICAgICAgICAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDM0O1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcclxuICAgICAgICAgICAgICAgIG5hbWVOb2RlLmNvbG9yID0gY2MuQ29sb3IuV0hJVEU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkZXNjcmlwdGlvbk5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gYWNoaWV2ZURhdGEuY3VycmVudFByb2dyZXNzIHx8IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb2dyZXNzID0gYWNoaWV2ZURhdGEuY291bnQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gYWNoaWV2ZURhdGEuaXNDb21wbGV0ZWQ7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByaWNoVGV4dCA9IGRlc2NyaXB0aW9uTm9kZS5nZXRDb21wb25lbnQoY2MuUmljaFRleHQpO1xyXG4gICAgICAgICAgICBpZiAocmljaFRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQ29sb3IgPSBpc0NvbXBsZXRlZCA/ICcjMDBGRjMzJyA6ICcjRTYwMDAwJztcclxuICAgICAgICAgICAgICAgIHJpY2hUZXh0LmZvbnRTaXplID0gMjA7XHJcbiAgICAgICAgICAgICAgICByaWNoVGV4dC5saW5lSGVpZ2h0ID0gMjI7XHJcbiAgICAgICAgICAgICAgICByaWNoVGV4dC5tYXhXaWR0aCA9IDIwNjtcclxuICAgICAgICAgICAgICAgIHJpY2hUZXh0LnN0cmluZyA9IGAke2FjaGlldmVEYXRhLmRlc2N9XFxuPGNvbG9yPSR7cHJvZ3Jlc3NDb2xvcn0+KCR7Y3VycmVudFByb2dyZXNzfS8ke3RhcmdldFByb2dyZXNzfSnjgII8L2NvbG9yPmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXdhcmROb2RlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvc3ROb2RlID0gcmV3YXJkTm9kZS5nZXRDaGlsZEJ5TmFtZSgnY29zdCcpO1xyXG4gICAgICAgICAgICBjb25zdCBjb3N0TGFiZWwgPSBjb3N0Tm9kZSA/IGNvc3ROb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkgOiBudWxsO1xyXG4gICAgICAgICAgICBpZiAoY29zdExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICBjb3N0TGFiZWwuc3RyaW5nID0gYCR7YWNoaWV2ZURhdGEucmV3YXJkR29sZH1gO1xyXG4gICAgICAgICAgICAgICAgY29zdExhYmVsLmZvbnRTaXplID0gMjg7XHJcbiAgICAgICAgICAgICAgICBjb3N0TGFiZWwubGluZUhlaWdodCA9IDM0O1xyXG4gICAgICAgICAgICAgICAgY29zdE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI0MSwgMTgzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNsYWltQnV0dG9uICYmIHRoaXMuY2xhaW1IYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIGNsYWltQnV0dG9uLm5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XHJcbiAgICAgICAgICAgIGNsYWltQnV0dG9uLm5vZGUub3BhY2l0eSA9IDI1NTtcclxuICAgICAgICAgICAgaWYgKGFjaGlldmVEYXRhLmlzQ2xhaW1lZCkge1xyXG4gICAgICAgICAgICAgICAgY2xhaW1CdXR0b24ubm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChjbGFpbWVkTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYWltZWROb2RlLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWNoaWV2ZURhdGEuaXNDb21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNsYWltQnV0dG9uLm5vZGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChjbGFpbWVkTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYWltZWROb2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2xhaW1CdXR0b24uaW50ZXJhY3RhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNsYWltQnV0dG9uLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uQ2xhaW1DbGljayhhY2hpZXZlRGF0YS5pZCksIHRoaXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2xhaW1CdXR0b24ubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsYWltZWROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhaW1lZE5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbGFpbUJ1dHRvbi5pbnRlcmFjdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNsYWltQnV0dG9uLm5vZGUub3BhY2l0eSA9IDE4NTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkanVzdENvbnRhaW5lclNpemUoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbFZpZXcgfHwgIXRoaXMuc2Nyb2xsVmlldy5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Njcm9sbFZpZXcgb3IgY29udGVudCBub2RlIG5vdCBhc3NpZ25lZCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLnNjcm9sbFZpZXcuY29udGVudDtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlbjtcclxuXHJcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpdGVtID0gY2hpbGRyZW5bMF07XHJcbiAgICAgICAgY29uc3QgaXRlbVdpZHRoID0gaXRlbS53aWR0aCB8fCAyNDM7XHJcbiAgICAgICAgY29uc3QgaXRlbUhlaWdodCA9IGl0ZW0uaGVpZ2h0IHx8IDI3ODtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuc2Nyb2xsVmlldy5ub2RlLmdldENoaWxkQnlOYW1lKCd2aWV3Jyk7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3ZpZXcgbm9kZSBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb2x1bW5zID0gMjtcclxuICAgICAgICBjb25zdCBjb2x1bW5TcGFjaW5nID0gMjQ7XHJcbiAgICAgICAgY29uc3Qgcm93U3BhY2luZyA9IDI0O1xyXG4gICAgICAgIGNvbnN0IHRvcFBhZGRpbmcgPSA4O1xyXG4gICAgICAgIGNvbnN0IGJvdHRvbVBhZGRpbmcgPSAyNDtcclxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSBNYXRoLm1heCh2aWV3LndpZHRoLCBjb2x1bW5zICogaXRlbVdpZHRoICsgY29sdW1uU3BhY2luZyk7XHJcbiAgICAgICAgY29uc3Qgcm93cyA9IE1hdGguY2VpbChjaGlsZHJlbi5sZW5ndGggLyBjb2x1bW5zKTtcclxuICAgICAgICBjb25zdCB0b3RhbEhlaWdodCA9IHJvd3MgKiBpdGVtSGVpZ2h0ICsgTWF0aC5tYXgoMCwgcm93cyAtIDEpICogcm93U3BhY2luZyArIHRvcFBhZGRpbmcgKyBib3R0b21QYWRkaW5nO1xyXG5cclxuICAgICAgICBjb250YWluZXIud2lkdGggPSB2aWV3V2lkdGg7XHJcbiAgICAgICAgY29udGFpbmVyLmhlaWdodCA9IE1hdGgubWF4KHZpZXcuaGVpZ2h0LCB0b3RhbEhlaWdodCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5hbmNob3JYID0gMC41O1xyXG4gICAgICAgIGNvbnRhaW5lci5hbmNob3JZID0gMTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhcnRYID0gLSgoY29sdW1ucyAtIDEpICogKGl0ZW1XaWR0aCArIGNvbHVtblNwYWNpbmcpKSAvIDI7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBjb2wgPSBpICUgY29sdW1ucztcclxuICAgICAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpIC8gY29sdW1ucyk7XHJcbiAgICAgICAgICAgIGNoaWxkLnggPSBzdGFydFggKyBjb2wgKiAoaXRlbVdpZHRoICsgY29sdW1uU3BhY2luZyk7XHJcbiAgICAgICAgICAgIGNoaWxkLnkgPSAtdG9wUGFkZGluZyAtIGl0ZW1IZWlnaHQgLyAyIC0gcm93ICogKGl0ZW1IZWlnaHQgKyByb3dTcGFjaW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbFZpZXcuc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDAuMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25DbGFpbUNsaWNrKGFjaGlldmVJZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYWNoaWV2ZSA9IHRoaXMuYWNoaWV2ZXMuZmluZChhID0+IGEuaWQgPT09IGFjaGlldmVJZCk7XHJcbiAgICAgICAgaWYgKCFhY2hpZXZlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghYWNoaWV2ZS5pc0NvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWNoaWV2ZW1lbnQgbm90IGNvbXBsZXRlZCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYWNoaWV2ZS5pc0NsYWltZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FjaGlldmVtZW50IGFscmVhZHkgY2xhaW1lZCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdpdmVSZXdhcmQoYWNoaWV2ZSk7XHJcblxyXG4gICAgICAgIGFjaGlldmUuaXNDbGFpbWVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1hcmtBY2hpZXZlQ2xhaW1lZChhY2hpZXZlSWQpO1xyXG5cclxuICAgICAgICB0aGlzLnJlZnJlc2hTY3JvbGxWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoYOiOt+W+lyR7YWNoaWV2ZS5yZXdhcmRHb2xkfemSu+efs+OAgmApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2l2ZVJld2FyZChhY2hpZXZlOiBBY2hpZXZlbWVudEl0ZW1EYXRhKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGFjaGlldmUucmV3YXJkR29sZCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1HYW1lRGF0YS5hZGRHb2xkKGFjaGlldmUucmV3YXJkR29sZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNsb3NlQ2xpY2soKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd1RvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIFRpcHNNYW5hZ2VyLnNob3cobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmNsYWltSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLmNsYWltSGFuZGxlciA9IChhY2hpZXZlSWQ6IG51bWJlcikgPT4gdGhpcy5vbkNsYWltQ2xpY2soYWNoaWV2ZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoQWNoaWV2ZW1lbnRzKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdSZWxvYWQgYWNoaWV2ZW1lbnQgY29uZmlnIGZhaWxlZDonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxufVxyXG4iXX0=