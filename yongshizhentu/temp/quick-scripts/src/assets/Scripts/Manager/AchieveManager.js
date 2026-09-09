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