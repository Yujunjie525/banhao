"use strict";
cc._RF.push(module, 'a286aiWv+ROMJQPWnb+sAOP', 'WeeklyRewardManager');
// Scripts/Manager/WeeklyRewardManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TipsManager_1 = require("../Load/TipsManager");
var GameData_1 = require("../Load/GameData");
var UserDataSyncManager_1 = require("./UserDataSyncManager");
var WeeklyRewardManager = /** @class */ (function (_super) {
    __extends(WeeklyRewardManager, _super);
    function WeeklyRewardManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.closeButton = null;
        _this.weekPanel = null;
        _this.weeklyRewards = [];
        _this.weeklyRewardConfigs = [];
        _this.isConfigLoaded = false;
        _this.loadConfigPromise = null;
        _this.weekStartDate = '';
        _this.rewardItemTemplate = null;
        _this.rewardItemNodes = [];
        _this.rewardContent = null;
        _this.rewardScrollView = null;
        _this.weeklyRewardWeekStartKey = 'weeklyRewardWeekStart';
        _this.weeklyRewardClaimedKey = 'weeklyRewardClaimed';
        return _this;
    }
    WeeklyRewardManager.prototype.getUserId = function () {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    };
    WeeklyRewardManager.prototype.getKeyWithUserId = function (baseKey) {
        var userId = this.getUserId();
        if (userId) {
            return baseKey + "_" + userId;
        }
        return baseKey;
    };
    WeeklyRewardManager.prototype.getClaimedRewards = function () {
        var claimedKey = this.getKeyWithUserId(this.weeklyRewardClaimedKey);
        var claimedStr = cc.sys.localStorage.getItem(claimedKey);
        if (!claimedStr) {
            return [];
        }
        try {
            var parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            console.error('Parse weekly claimed data failed:', error);
            return [];
        }
    };
    WeeklyRewardManager.prototype.saveClaimedRewards = function (claimedList) {
        var claimedKey = this.getKeyWithUserId(this.weeklyRewardClaimedKey);
        cc.sys.localStorage.setItem(claimedKey, JSON.stringify(claimedList));
        UserDataSyncManager_1.default.requestUpload();
    };
    WeeklyRewardManager.prototype.onLoad = function () {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
        this.refreshWeeklyRewards().catch(function (error) {
            console.error('Load weekly reward config failed:', error);
        });
    };
    WeeklyRewardManager.prototype.onEnable = function () {
        this.refreshWeeklyRewards().catch(function (error) {
            console.error('Refresh weekly reward config failed:', error);
        });
    };
    WeeklyRewardManager.prototype.refreshWeeklyRewards = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadWeeklyRewardConfig()];
                    case 1:
                        _a.sent();
                        this.initWeeklyRewards();
                        this.updateWeeklyRewardUI();
                        return [2 /*return*/];
                }
            });
        });
    };
    WeeklyRewardManager.prototype.loadWeeklyRewardConfig = function () {
        var _this = this;
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }
        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }
        this.loadConfigPromise = new Promise(function (resolve, reject) {
            cc.loader.loadRes('config/weekReward', cc.JsonAsset, function (err, jsonAsset) {
                if (err) {
                    reject(err);
                    return;
                }
                var rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                _this.weeklyRewardConfigs = rawConfigs.map(function (config) { return ({
                    id: Number(config.id) || 0,
                    name: "" + (config.name || ''),
                    desc: "" + (config.desc || ''),
                    icon: Number(config.icon) || 0,
                    rewardId: Number(config.rewardId) || 0,
                    rewardNum: Number(config.rewardNum) || 0
                }); });
                _this.isConfigLoaded = true;
                resolve();
            });
        });
        return this.loadConfigPromise;
    };
    WeeklyRewardManager.prototype.initWeeklyRewards = function () {
        var _this = this;
        this.updateWeekStartDate();
        this.checkNewWeek();
        var today = new Date();
        var dayOfWeek = today.getDay() || 7;
        this.weeklyRewards = this.weeklyRewardConfigs.map(function (config) {
            var isClaimed = _this.checkRewardClaimed(config.id);
            var isAvailable = config.id === dayOfWeek;
            var isMissed = !isClaimed && config.id < dayOfWeek;
            var daysUntilAvailable = Math.max(0, config.id - dayOfWeek);
            return __assign(__assign({}, config), { isClaimed: isClaimed,
                isAvailable: isAvailable,
                isMissed: isMissed,
                daysUntilAvailable: daysUntilAvailable });
        });
    };
    WeeklyRewardManager.prototype.updateWeekStartDate = function () {
        var today = new Date();
        var dayOfWeek = today.getDay() || 7;
        var weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (dayOfWeek - 1));
        this.weekStartDate = weekStart.getFullYear() + "-" + String(weekStart.getMonth() + 1).padStart(2, '0') + "-" + String(weekStart.getDate()).padStart(2, '0');
    };
    WeeklyRewardManager.prototype.checkNewWeek = function () {
        var weekStartKey = this.getKeyWithUserId(this.weeklyRewardWeekStartKey);
        var currentWeekStart = cc.sys.localStorage.getItem(weekStartKey);
        if (!currentWeekStart || currentWeekStart !== this.weekStartDate) {
            cc.sys.localStorage.setItem(weekStartKey, this.weekStartDate);
            this.saveClaimedRewards([]);
            UserDataSyncManager_1.default.requestUpload();
        }
    };
    WeeklyRewardManager.prototype.checkRewardClaimed = function (rewardId) {
        var claimedList = this.getClaimedRewards();
        return claimedList.includes(rewardId);
    };
    WeeklyRewardManager.prototype.markRewardClaimed = function (rewardId) {
        var claimedList = this.getClaimedRewards();
        if (!claimedList.includes(rewardId)) {
            claimedList.push(rewardId);
            this.saveClaimedRewards(claimedList);
        }
    };
    WeeklyRewardManager.prototype.giveReward = function (reward) {
        if (reward.rewardNum <= 0) {
            return;
        }
        GameData_1.default.addGold(reward.rewardNum);
    };
    WeeklyRewardManager.prototype.updateWeeklyRewardUI = function () {
        if (!this.weekPanel) {
            console.error('Week panel not assigned');
            return;
        }
        if (!this.ensureRewardScrollList()) {
            return;
        }
        this.weeklyRewards.sort(function (a, b) { return a.id - b.id; });
        var viewWidth = this.rewardScrollView.node.width;
        var viewHeight = this.rewardScrollView.node.height;
        var columnCount = 3;
        var verticalSpacing = 26;
        var paddingTop = 16;
        var paddingBottom = 28;
        var itemSize = this.getRewardItemSize(this.rewardItemTemplate);
        var itemScale = this.rewardItemTemplate.scale || 1;
        var layoutItemWidth = itemSize.width * itemScale;
        var layoutItemHeight = itemSize.height * itemScale;
        var itemLayoutHeight = layoutItemHeight + 50 * itemScale;
        var horizontalSpacing = Math.min(56, Math.max(0, (viewWidth - layoutItemWidth * columnCount) / Math.max(1, columnCount - 1)));
        var rowCount = Math.ceil(this.weeklyRewards.length / columnCount);
        var totalHeight = rowCount * itemLayoutHeight + Math.max(0, rowCount - 1) * verticalSpacing + paddingTop + paddingBottom;
        var gridWidth = columnCount * layoutItemWidth + (columnCount - 1) * horizontalSpacing;
        var startX = -gridWidth / 2 + layoutItemWidth / 2;
        var activeItemNames = {};
        this.rewardContent.width = viewWidth;
        this.rewardContent.height = Math.max(viewHeight + 1, totalHeight);
        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;
        this.rewardContent.y = viewHeight / 2;
        for (var i = 0; i < this.weeklyRewards.length; i++) {
            var rewardData = this.weeklyRewards[i];
            var row = Math.floor(i / columnCount);
            var col = i % columnCount;
            var itemNode = this.rewardItemNodes[i];
            if (!itemNode) {
                itemNode = this.rewardContent.getChildByName("weekRewardItem" + rewardData.id);
            }
            if (!itemNode) {
                itemNode = cc.instantiate(this.rewardItemTemplate);
                itemNode.name = "weekRewardItem" + rewardData.id;
                itemNode.parent = this.rewardContent;
                this.rewardItemNodes[i] = itemNode;
            }
            activeItemNames[itemNode.name] = true;
            itemNode.active = true;
            itemNode.parent = this.rewardContent;
            itemNode.width = itemSize.width;
            itemNode.height = itemSize.height;
            itemNode.scale = itemScale;
            itemNode.x = startX + col * (layoutItemWidth + horizontalSpacing);
            itemNode.y = -paddingTop - layoutItemHeight / 2 - row * (itemLayoutHeight + verticalSpacing);
            this.setRewardItemData(itemNode, rewardData);
        }
        for (var i = this.rewardItemNodes.length - 1; i >= this.weeklyRewards.length; i--) {
            if (this.rewardItemNodes[i]) {
                this.rewardItemNodes[i].active = false;
            }
        }
        for (var i = this.rewardContent.children.length - 1; i >= 0; i--) {
            var child = this.rewardContent.children[i];
            if (child.name.indexOf('weekRewardItem') === 0 && !activeItemNames[child.name]) {
                child.removeFromParent();
                child.destroy();
            }
        }
        if (this.rewardScrollView.scrollToTop) {
            this.rewardScrollView.scrollToTop(0);
        }
    };
    WeeklyRewardManager.prototype.ensureRewardScrollList = function () {
        var _this = this;
        var panel = this.weekPanel || this.node;
        var frameNode = panel.getChildByName('jiemiankuang') || panel;
        if (!this.rewardItemTemplate) {
            this.rewardItemTemplate = this.findRewardItemTemplate(frameNode, panel);
            if (!this.rewardItemTemplate) {
                console.error('Weekly reward item template dayN not found');
                return false;
            }
        }
        var scrollNode = frameNode.getChildByName('WeekRewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('WeekRewardScrollView');
            scrollNode.parent = frameNode;
            scrollNode.anchorX = 0.5;
            scrollNode.anchorY = 0.5;
        }
        var backgroundNode = frameNode.getChildByName('shendikuang');
        var viewWidth = backgroundNode && backgroundNode.width > 0 ? backgroundNode.width : 455;
        var viewHeight = backgroundNode && backgroundNode.height > 0 ? backgroundNode.height : 430;
        scrollNode.width = viewWidth;
        scrollNode.height = viewHeight;
        scrollNode.x = backgroundNode ? backgroundNode.x : 0;
        scrollNode.y = backgroundNode ? backgroundNode.y : -32;
        this.rewardScrollView = scrollNode.getComponent(cc.ScrollView) || scrollNode.addComponent(cc.ScrollView);
        this.rewardScrollView.horizontal = false;
        this.rewardScrollView.vertical = true;
        this.rewardScrollView.inertia = true;
        this.rewardScrollView.brake = 0.75;
        this.rewardScrollView.elastic = true;
        this.rewardScrollView.bounceDuration = 0.23;
        this.rewardScrollView.cancelInnerEvents = true;
        var viewNode = scrollNode.getChildByName('view');
        if (!viewNode) {
            viewNode = new cc.Node('view');
            viewNode.parent = scrollNode;
            viewNode.addComponent(cc.Mask);
        }
        viewNode.width = viewWidth;
        viewNode.height = viewHeight;
        viewNode.anchorX = 0.5;
        viewNode.anchorY = 0.5;
        viewNode.x = 0;
        viewNode.y = 0;
        this.rewardContent = viewNode.getChildByName('content');
        if (!this.rewardContent) {
            this.rewardContent = new cc.Node('content');
            this.rewardContent.parent = viewNode;
        }
        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;
        this.rewardContent.y = viewHeight / 2;
        this.rewardScrollView.content = this.rewardContent;
        this.rewardItemNodes = this.collectRewardItemNodes(frameNode, panel);
        if (this.rewardItemNodes.length === 0 && this.rewardItemTemplate) {
            this.rewardItemNodes = [this.rewardItemTemplate];
        }
        for (var _i = 0, _a = this.rewardItemNodes; _i < _a.length; _i++) {
            var itemNode = _a[_i];
            itemNode.parent = this.rewardContent;
        }
        this.rewardItemNodes.sort(function (a, b) { return _this.getRewardItemIndex(a) - _this.getRewardItemIndex(b); });
        return true;
    };
    WeeklyRewardManager.prototype.collectRewardItemNodes = function (frameNode, panel) {
        var result = [];
        var seen = {};
        var collectFrom = function (parent) {
            if (!parent)
                return;
            for (var i = 1; i <= 31; i++) {
                var dayNode = parent.getChildByName("day" + i);
                var key = dayNode ? (dayNode.uuid || dayNode.name + "_" + result.length) : '';
                if (dayNode && !seen[key]) {
                    seen[key] = true;
                    result.push(dayNode);
                }
            }
        };
        collectFrom(this.rewardContent);
        collectFrom(frameNode);
        if (frameNode !== panel)
            collectFrom(panel);
        return result;
    };
    WeeklyRewardManager.prototype.findRewardItemTemplate = function (frameNode, panel) {
        var sources = frameNode === panel ? [frameNode] : [frameNode, panel];
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            for (var i = 1; i <= 31; i++) {
                var dayNode = source.getChildByName("day" + i);
                if (dayNode)
                    return dayNode;
            }
        }
        return null;
    };
    WeeklyRewardManager.prototype.getRewardItemIndex = function (itemNode) {
        var match = itemNode && itemNode.name ? itemNode.name.match(/^day(\d+)$/) : null;
        return match ? Number(match[1]) : 999;
    };
    WeeklyRewardManager.prototype.getRewardItemSize = function (itemNode) {
        return cc.size(Math.max(itemNode.width, 120), Math.max(itemNode.height, 160));
    };
    WeeklyRewardManager.prototype.setRewardItemData = function (dayNode, rewardData) {
        var _this = this;
        var labelNode = dayNode.getChildByName('Label');
        if (labelNode) {
            var label = labelNode.getComponent(cc.Label);
            if (label) {
                label.string = rewardData.name;
            }
        }
        var rewardString = "x" + rewardData.rewardNum;
        var juese1 = dayNode.getChildByName('juese1');
        var numLabel = juese1 && juese1.getChildByName('num')
            ? juese1.getChildByName('num').getComponent(cc.Label)
            : null;
        if (numLabel) {
            numLabel.string = rewardString;
        }
        var rewardNode = dayNode.getChildByName('reward');
        var gotNode = dayNode.getChildByName('got');
        if (!rewardNode || !gotNode) {
            return;
        }
        var backgroundNode = rewardNode.getChildByName('Background');
        if (!backgroundNode) {
            return;
        }
        var labelChild = backgroundNode.getChildByName('Label');
        var rewardLabel = labelChild ? labelChild.getComponent(cc.Label) : null;
        backgroundNode.color = new cc.Color(255, 255, 255);
        backgroundNode.off(cc.Node.EventType.TOUCH_END);
        if (rewardData.isClaimed) {
            rewardNode.active = true;
            gotNode.active = false;
            var spriteComponent_1 = backgroundNode.getComponent(cc.Sprite);
            if (spriteComponent_1) {
                var iconPath_1 = "zzImg/anniuyilingqu";
                cc.loader.loadRes(iconPath_1, cc.SpriteFrame, function (err, spriteFrame) {
                    if (err) {
                        console.error("Load " + iconPath_1 + " failed:", err);
                    }
                    else {
                        spriteComponent_1.spriteFrame = spriteFrame;
                    }
                });
            }
            if (rewardLabel) {
                rewardLabel.node.active = false;
            }
        }
        else if (rewardData.isAvailable) {
            rewardNode.active = true;
            gotNode.active = false;
            if (rewardLabel) {
                rewardLabel.string = '';
                rewardLabel.node.active = false;
            }
            backgroundNode.on(cc.Node.EventType.TOUCH_END, function () { return _this.onClaimClick(rewardData.id); }, this);
        }
        else if (rewardData.isMissed) {
            rewardNode.active = true;
            gotNode.active = false;
            backgroundNode.color = new cc.Color(128, 128, 128);
            if (rewardLabel) {
                rewardLabel.string = '';
                rewardLabel.node.active = false;
            }
        }
        else {
            rewardNode.active = false;
            gotNode.active = true;
            var newLabelNode = gotNode.getChildByName('New Label');
            var label = newLabelNode ? newLabelNode.getComponent(cc.Label) : null;
            if (label) {
                label.string = rewardData.daysUntilAvailable + "\u5929\u540E\u53EF\u9886\u53D6";
            }
        }
    };
    WeeklyRewardManager.prototype.onClaimClick = function (rewardId) {
        var reward = this.weeklyRewards.find(function (r) { return r.id === rewardId; });
        if (!reward)
            return;
        if (!reward.isAvailable)
            return;
        if (reward.isClaimed)
            return;
        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateWeeklyRewardUI();
        this.showToast("\u83B7\u5F97" + reward.rewardNum + "\u94BB\u77F3\u3002");
    };
    WeeklyRewardManager.prototype.onCloseClick = function () {
        this.node.active = false;
    };
    WeeklyRewardManager.prototype.showToast = function (message) {
        TipsManager_1.default.show(message);
    };
    WeeklyRewardManager.prototype.show = function () {
        this.node.active = true;
        this.refreshWeeklyRewards().catch(function (error) {
            console.error('Reload weekly reward config failed:', error);
        });
    };
    WeeklyRewardManager.prototype.hide = function () {
        this.node.active = false;
    };
    __decorate([
        property(cc.Button)
    ], WeeklyRewardManager.prototype, "closeButton", void 0);
    __decorate([
        property(cc.Node)
    ], WeeklyRewardManager.prototype, "weekPanel", void 0);
    WeeklyRewardManager = __decorate([
        ccclass
    ], WeeklyRewardManager);
    return WeeklyRewardManager;
}(cc.Component));
exports.default = WeeklyRewardManager;

cc._RF.pop();