"use strict";
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