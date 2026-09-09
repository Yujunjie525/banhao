"use strict";
cc._RF.push(module, 'ef3346zcfxILbOEq3sEo/PS', 'DailyRewardManager');
// Scripts/Manager/DailyRewardManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TipsManager_1 = require("../Load/TipsManager");
var OnlineTimeManager_1 = require("./OnlineTimeManager");
var GameData_1 = require("../Load/GameData");
var UserDataSyncManager_1 = require("./UserDataSyncManager");
var DailyRewardManager = /** @class */ (function (_super) {
    __extends(DailyRewardManager, _super);
    function DailyRewardManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.closeButton = null;
        _this.dailyPanel = null;
        _this.dailyRewards = [];
        _this.onlineRewardConfigs = [];
        _this.isConfigLoaded = false;
        _this.loadConfigPromise = null;
        _this.todayDate = '';
        _this.rewardItemTemplate = null;
        _this.rewardItemNodes = [];
        _this.rewardContent = null;
        _this.rewardScrollView = null;
        _this.dailyRewardDateKey = "dailyRewardDate";
        _this.dailyRewardClaimedKey = "dailyRewardClaimed";
        _this.dailyOnlineMinutesKey = "dailyOnlineMinutes";
        return _this;
    }
    DailyRewardManager.prototype.getUserId = function () {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    };
    DailyRewardManager.prototype.getKeyWithUserId = function (baseKey) {
        var userId = this.getUserId();
        if (userId) {
            return baseKey + "_" + userId;
        }
        return baseKey;
    };
    DailyRewardManager.prototype.getClaimedRewards = function () {
        var claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        var claimedStr = cc.sys.localStorage.getItem(claimedKey);
        if (!claimedStr) {
            return [];
        }
        try {
            var parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            console.error('Parse daily claimed data failed:', error);
            return [];
        }
    };
    DailyRewardManager.prototype.saveClaimedRewards = function (claimedList) {
        var claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        cc.sys.localStorage.setItem(claimedKey, JSON.stringify(claimedList));
        UserDataSyncManager_1.default.requestUpload();
    };
    DailyRewardManager.prototype.onLoad = function () {
        var _this = this;
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
        this.loadOnlineRewardConfig().then(function () {
            _this.initDailyRewards();
            _this.updateDailyRewardUI();
            _this.schedule(function () {
                _this.updateDailyRewardsStatus();
            }, 1);
        }).catch(function (error) {
            console.error('Load online reward config failed:', error);
        });
    };
    DailyRewardManager.prototype.onDestroy = function () {
    };
    DailyRewardManager.prototype.loadOnlineRewardConfig = function () {
        var _this = this;
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }
        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }
        this.loadConfigPromise = new Promise(function (resolve, reject) {
            cc.loader.loadRes('config/onlineReward', cc.JsonAsset, function (err, jsonAsset) {
                if (err) {
                    reject(err);
                    return;
                }
                var rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                _this.onlineRewardConfigs = rawConfigs.map(function (config) { return ({
                    id: Number(config.id) || 0,
                    time: Number(config.time) || 0,
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
    DailyRewardManager.prototype.initDailyRewards = function () {
        var _this = this;
        this.updateTodayDate();
        this.checkNewDay();
        this.dailyRewards = this.onlineRewardConfigs.map(function (config) {
            var isClaimed = _this.checkRewardClaimed(config.id);
            var isAvailable = !isClaimed && _this.getOnlineMinutes() >= config.time;
            return __assign(__assign({}, config), { isClaimed: isClaimed,
                isAvailable: isAvailable, requiredMinutes: config.time });
        });
    };
    DailyRewardManager.prototype.updateTodayDate = function () {
        var today = new Date();
        this.todayDate = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
    };
    DailyRewardManager.prototype.checkNewDay = function () {
        var rewardDateKey = this.getKeyWithUserId(this.dailyRewardDateKey);
        var todayDate = cc.sys.localStorage.getItem(rewardDateKey);
        if (!todayDate || todayDate !== this.todayDate) {
            cc.sys.localStorage.setItem(rewardDateKey, this.todayDate);
            this.saveClaimedRewards([]);
            var onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
            cc.sys.localStorage.setItem(onlineMinutesKey, "0");
            UserDataSyncManager_1.default.requestUpload();
        }
    };
    DailyRewardManager.prototype.getOnlineMinutes = function () {
        if (OnlineTimeManager_1.default.Instance) {
            return OnlineTimeManager_1.default.Instance.getOnlineMinutes();
        }
        return 0;
    };
    DailyRewardManager.prototype.checkRewardClaimed = function (rewardId) {
        var claimedList = this.getClaimedRewards();
        return claimedList.includes(rewardId);
    };
    DailyRewardManager.prototype.markRewardClaimed = function (rewardId) {
        var claimedList = this.getClaimedRewards();
        if (!claimedList.includes(rewardId)) {
            claimedList.push(rewardId);
            this.saveClaimedRewards(claimedList);
        }
    };
    DailyRewardManager.prototype.giveReward = function (reward) {
        if (reward.rewardNum <= 0) {
            return;
        }
        GameData_1.default.addGold(reward.rewardNum);
    };
    DailyRewardManager.prototype.updateDailyRewardsStatus = function () {
        var onlineMinutes = this.getOnlineMinutes();
        this.dailyRewards.forEach(function (reward) {
            reward.isAvailable = !reward.isClaimed && onlineMinutes >= reward.requiredMinutes;
        });
        this.updateDailyRewardUI();
    };
    DailyRewardManager.prototype.updateDailyRewardUI = function () {
        if (!this.dailyPanel) {
            console.error('Daily panel not assigned');
            return;
        }
        if (!this.ensureRewardScrollList()) {
            return;
        }
        this.dailyRewards.sort(function (a, b) { return a.id - b.id; });
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
        var rowCount = Math.ceil(this.dailyRewards.length / columnCount);
        var totalHeight = rowCount * itemLayoutHeight + Math.max(0, rowCount - 1) * verticalSpacing + paddingTop + paddingBottom;
        var gridWidth = columnCount * layoutItemWidth + (columnCount - 1) * horizontalSpacing;
        var startX = -gridWidth / 2 + layoutItemWidth / 2;
        var shouldScrollToTop = this.rewardContent.children.length === 0;
        var activeItemNames = {};
        this.rewardContent.width = viewWidth;
        this.rewardContent.height = Math.max(viewHeight + 1, totalHeight);
        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;
        for (var i = 0; i < this.dailyRewards.length; i++) {
            var rewardData = this.dailyRewards[i];
            var row = Math.floor(i / columnCount);
            var col = i % columnCount;
            var itemName = "dailyRewardItem" + rewardData.id;
            var itemNode = this.rewardItemNodes[i];
            if (!itemNode) {
                itemNode = this.rewardContent.getChildByName(itemName);
            }
            if (!itemNode) {
                itemNode = cc.instantiate(this.rewardItemTemplate);
                itemNode.name = itemName;
                itemNode.parent = this.rewardContent;
                this.rewardItemNodes[i] = itemNode;
            }
            activeItemNames[itemName] = true;
            itemNode.active = true;
            itemNode.width = itemSize.width;
            itemNode.height = itemSize.height;
            itemNode.scale = itemScale;
            itemNode.x = startX + col * (layoutItemWidth + horizontalSpacing);
            itemNode.y = -paddingTop - layoutItemHeight / 2 - row * (itemLayoutHeight + verticalSpacing);
            this.setRewardItemData(itemNode, rewardData);
        }
        for (var i = this.rewardItemNodes.length - 1; i >= this.dailyRewards.length; i--) {
            if (this.rewardItemNodes[i]) {
                this.rewardItemNodes[i].active = false;
            }
        }
        for (var i = this.rewardContent.children.length - 1; i >= 0; i--) {
            var child = this.rewardContent.children[i];
            if (child.name.indexOf('dailyRewardItem') === 0 && !activeItemNames[child.name]) {
                child.removeFromParent();
                child.destroy();
            }
        }
        if (shouldScrollToTop && this.rewardScrollView.scrollToTop) {
            this.rewardContent.y = viewHeight / 2;
            this.rewardScrollView.scrollToTop(0);
        }
        else {
            var minY = viewHeight / 2;
            var maxY = Math.max(minY, this.rewardContent.height - viewHeight / 2);
            this.rewardContent.y = Math.min(Math.max(this.rewardContent.y, minY), maxY);
        }
    };
    DailyRewardManager.prototype.ensureRewardScrollList = function () {
        var _this = this;
        var panel = this.dailyPanel || this.node;
        var frameNode = panel.getChildByName('jiemiankuang') || panel;
        if (!this.rewardItemTemplate) {
            this.rewardItemTemplate = this.findRewardItemTemplate(frameNode, panel);
            if (!this.rewardItemTemplate) {
                console.error('Daily reward item template dayN not found');
                return false;
            }
        }
        var scrollNode = frameNode.getChildByName('DailyRewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('DailyRewardScrollView');
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
        if (this.rewardContent.children.length === 0) {
            this.rewardContent.y = viewHeight / 2;
        }
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
    DailyRewardManager.prototype.collectRewardItemNodes = function (frameNode, panel) {
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
    DailyRewardManager.prototype.findRewardItemTemplate = function (frameNode, panel) {
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
    DailyRewardManager.prototype.getRewardItemIndex = function (itemNode) {
        var match = itemNode && itemNode.name ? itemNode.name.match(/^day(\d+)$/) : null;
        return match ? Number(match[1]) : 999;
    };
    DailyRewardManager.prototype.getRewardItemSize = function (itemNode) {
        return cc.size(Math.max(itemNode.width, 120), Math.max(itemNode.height, 160));
    };
    DailyRewardManager.prototype.setRewardItemData = function (dayNode, rewardData) {
        var _this = this;
        var labelNode = dayNode.getChildByName('Label');
        if (labelNode) {
            var label = labelNode.getComponent(cc.Label);
            if (label) {
                label.string = rewardData.name;
            }
        }
        var rewardString = "x" + rewardData.rewardNum;
        var reward1Node = dayNode.getChildByName('reward1');
        if (reward1Node) {
            var rewardLabel_1 = reward1Node.getChildByName('Label');
            if (rewardLabel_1) {
                var label = rewardLabel_1.getComponent(cc.Label);
                if (label) {
                    label.string = rewardString;
                }
            }
        }
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
        var spriteComponent = backgroundNode.getComponent(cc.Sprite);
        var backgroundCache = backgroundNode;
        if (spriteComponent && !backgroundCache.dailyRewardNormalSpriteCaptured) {
            backgroundCache.dailyRewardNormalSpriteFrame = spriteComponent.spriteFrame;
            backgroundCache.dailyRewardNormalSpriteCaptured = true;
        }
        backgroundNode.off(cc.Node.EventType.TOUCH_END);
        if (rewardData.isClaimed) {
            rewardNode.active = true;
            gotNode.active = false;
            if (spriteComponent && !backgroundCache.dailyRewardClaimedSpriteLoaded && !backgroundCache.dailyRewardClaimedSpriteLoading) {
                backgroundCache.dailyRewardClaimedSpriteLoading = true;
                var iconPath_1 = "zzImg/anniuyilingqu";
                cc.loader.loadRes(iconPath_1, cc.SpriteFrame, function (err, spriteFrame) {
                    backgroundCache.dailyRewardClaimedSpriteLoading = false;
                    if (err) {
                        console.error("Load " + iconPath_1 + " failed:", err);
                    }
                    else {
                        spriteComponent.spriteFrame = spriteFrame;
                        backgroundCache.dailyRewardClaimedSpriteLoaded = true;
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
            backgroundCache.dailyRewardClaimedSpriteLoaded = false;
            backgroundCache.dailyRewardClaimedSpriteLoading = false;
            if (spriteComponent && backgroundCache.dailyRewardNormalSpriteCaptured) {
                spriteComponent.spriteFrame = backgroundCache.dailyRewardNormalSpriteFrame;
            }
            if (rewardLabel) {
                rewardLabel.string = '';
                rewardLabel.node.active = false;
            }
            backgroundNode.on(cc.Node.EventType.TOUCH_END, function () { return _this.onClaimClick(rewardData.id); }, this);
        }
        else {
            rewardNode.active = false;
            gotNode.active = true;
            backgroundCache.dailyRewardClaimedSpriteLoaded = false;
            backgroundCache.dailyRewardClaimedSpriteLoading = false;
            if (spriteComponent && backgroundCache.dailyRewardNormalSpriteCaptured) {
                spriteComponent.spriteFrame = backgroundCache.dailyRewardNormalSpriteFrame;
            }
            var newLabelNode = gotNode.getChildByName('New Label');
            var label = newLabelNode ? newLabelNode.getComponent(cc.Label) : null;
            if (label) {
                var onlineMinutes = this.getOnlineMinutes();
                var remainingMinutes = Math.max(0, rewardData.requiredMinutes - onlineMinutes);
                label.string = remainingMinutes + "\u5206\u949F\u540E\u53EF\u9886\u53D6";
            }
        }
    };
    DailyRewardManager.prototype.onClaimClick = function (rewardId) {
        var reward = this.dailyRewards.find(function (r) { return r.id === rewardId; });
        if (!reward)
            return;
        if (!reward.isAvailable)
            return;
        if (reward.isClaimed)
            return;
        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateDailyRewardUI();
        this.showToast("\u83B7\u5F97" + reward.rewardNum + "\u94BB\u77F3\u3002");
    };
    DailyRewardManager.prototype.onCloseClick = function () {
        this.node.active = false;
    };
    DailyRewardManager.prototype.showToast = function (message) {
        TipsManager_1.default.show(message);
    };
    DailyRewardManager.prototype.show = function () {
        var _this = this;
        this.node.active = true;
        this.loadOnlineRewardConfig().then(function () {
            _this.initDailyRewards();
            _this.updateDailyRewardUI();
        }).catch(function (error) {
            console.error('Reload online reward config failed:', error);
        });
    };
    DailyRewardManager.prototype.hide = function () {
        this.node.active = false;
    };
    DailyRewardManager.prototype.getCurrentOnlineMinutes = function () {
        return this.getOnlineMinutes();
    };
    __decorate([
        property(cc.Button)
    ], DailyRewardManager.prototype, "closeButton", void 0);
    __decorate([
        property(cc.Node)
    ], DailyRewardManager.prototype, "dailyPanel", void 0);
    DailyRewardManager = __decorate([
        ccclass
    ], DailyRewardManager);
    return DailyRewardManager;
}(cc.Component));
exports.default = DailyRewardManager;

cc._RF.pop();