
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/DailyRewardManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcRGFpbHlSZXdhcmRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQUMxQyxtREFBOEM7QUFDOUMseURBQW9EO0FBQ3BELDZDQUF5QztBQUN6Qyw2REFBd0Q7QUFtQnhEO0lBQWdELHNDQUFZO0lBQTVEO1FBQUEscUVBcWhCQztRQW5oQkcsaUJBQVcsR0FBYyxJQUFJLENBQUM7UUFHOUIsZ0JBQVUsR0FBWSxJQUFJLENBQUM7UUFFbkIsa0JBQVksR0FBdUIsRUFBRSxDQUFDO1FBQ3RDLHlCQUFtQixHQUF5QixFQUFFLENBQUM7UUFDL0Msb0JBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIsdUJBQWlCLEdBQXlCLElBQUksQ0FBQztRQUUvQyxlQUFTLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLHdCQUFrQixHQUFZLElBQUksQ0FBQztRQUNuQyxxQkFBZSxHQUFjLEVBQUUsQ0FBQztRQUNoQyxtQkFBYSxHQUFZLElBQUksQ0FBQztRQUM5QixzQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO1FBRTlCLHdCQUFrQixHQUFXLGlCQUFpQixDQUFDO1FBQy9DLDJCQUFxQixHQUFXLG9CQUFvQixDQUFDO1FBQ3JELDJCQUFxQixHQUFXLG9CQUFvQixDQUFDOztJQWlnQjFFLENBQUM7SUEvZlcsc0NBQVMsR0FBakI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sNkNBQWdCLEdBQXhCLFVBQXlCLE9BQWU7UUFDcEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBVSxPQUFPLFNBQUksTUFBUSxDQUFD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QkMsQ0FyaEIrQyxFQUFFLENBQUMsU0FBUyxHQXFoQjNEO2tCQXJoQm9CLGtCQUFrQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xuaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gJy4uL0xvYWQvVGlwc01hbmFnZXInO1xuaW1wb3J0IE9ubGluZVRpbWVNYW5hZ2VyIGZyb20gJy4vT25saW5lVGltZU1hbmFnZXInO1xuaW1wb3J0IG1HYW1lRGF0YSBmcm9tICcuLi9Mb2FkL0dhbWVEYXRhJztcbmltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gJy4vVXNlckRhdGFTeW5jTWFuYWdlcic7XG5cbmludGVyZmFjZSBPbmxpbmVSZXdhcmRDb25maWcge1xuICAgIGlkOiBudW1iZXI7XG4gICAgdGltZTogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjOiBzdHJpbmc7XG4gICAgaWNvbjogbnVtYmVyO1xuICAgIHJld2FyZElkOiBudW1iZXI7XG4gICAgcmV3YXJkTnVtOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBPbmxpbmVSZXdhcmRJdGVtIGV4dGVuZHMgT25saW5lUmV3YXJkQ29uZmlnIHtcbiAgICBpc0NsYWltZWQ6IGJvb2xlYW47XG4gICAgaXNBdmFpbGFibGU6IGJvb2xlYW47XG4gICAgcmVxdWlyZWRNaW51dGVzOiBudW1iZXI7XG59XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYWlseVJld2FyZE1hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pXG4gICAgY2xvc2VCdXR0b246IGNjLkJ1dHRvbiA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcbiAgICBkYWlseVBhbmVsOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIHByaXZhdGUgZGFpbHlSZXdhcmRzOiBPbmxpbmVSZXdhcmRJdGVtW10gPSBbXTtcbiAgICBwcml2YXRlIG9ubGluZVJld2FyZENvbmZpZ3M6IE9ubGluZVJld2FyZENvbmZpZ1tdID0gW107XG4gICAgcHJpdmF0ZSBpc0NvbmZpZ0xvYWRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9hZENvbmZpZ1Byb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcblxuICAgIHByaXZhdGUgdG9kYXlEYXRlOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIHJld2FyZEl0ZW1UZW1wbGF0ZTogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXdhcmRJdGVtTm9kZXM6IGNjLk5vZGVbXSA9IFtdO1xuICAgIHByaXZhdGUgcmV3YXJkQ29udGVudDogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXdhcmRTY3JvbGxWaWV3OiBjYy5TY3JvbGxWaWV3ID0gbnVsbDtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGFpbHlSZXdhcmREYXRlS2V5OiBzdHJpbmcgPSBcImRhaWx5UmV3YXJkRGF0ZVwiO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGFpbHlSZXdhcmRDbGFpbWVkS2V5OiBzdHJpbmcgPSBcImRhaWx5UmV3YXJkQ2xhaW1lZFwiO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGFpbHlPbmxpbmVNaW51dGVzS2V5OiBzdHJpbmcgPSBcImRhaWx5T25saW5lTWludXRlc1wiO1xuXG4gICAgcHJpdmF0ZSBnZXRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRLZXlXaXRoVXNlcklkKGJhc2VLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuZ2V0VXNlcklkKCk7XG4gICAgICAgIGlmICh1c2VySWQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlS2V5fV8ke3VzZXJJZH1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlS2V5O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2xhaW1lZFJld2FyZHMoKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCBjbGFpbWVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlSZXdhcmRDbGFpbWVkS2V5KTtcbiAgICAgICAgY29uc3QgY2xhaW1lZFN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShjbGFpbWVkS2V5KTtcbiAgICAgICAgaWYgKCFjbGFpbWVkU3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY2xhaW1lZFN0cik7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShwYXJzZWQpID8gcGFyc2VkIDogW107XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQYXJzZSBkYWlseSBjbGFpbWVkIGRhdGEgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2F2ZUNsYWltZWRSZXdhcmRzKGNsYWltZWRMaXN0OiBudW1iZXJbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGFpbWVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlSZXdhcmRDbGFpbWVkS2V5KTtcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGNsYWltZWRLZXksIEpTT04uc3RyaW5naWZ5KGNsYWltZWRMaXN0KSk7XG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbkxvYWQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNsb3NlQnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLm5vZGUub24oJ2NsaWNrJywgdGhpcy5vbkNsb3NlQ2xpY2ssIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2FkT25saW5lUmV3YXJkQ29uZmlnKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluaXREYWlseVJld2FyZHMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGFpbHlSZXdhcmRVSSgpO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYWlseVJld2FyZHNTdGF0dXMoKTtcbiAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvYWQgb25saW5lIHJld2FyZCBjb25maWcgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRPbmxpbmVSZXdhcmRDb25maWcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLmlzQ29uZmlnTG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5sb2FkQ29uZmlnUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9hZENvbmZpZ1Byb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRDb25maWdQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ2NvbmZpZy9vbmxpbmVSZXdhcmQnLCBjYy5Kc29uQXNzZXQsIChlcnI6IEVycm9yLCBqc29uQXNzZXQ6IGNjLkpzb25Bc3NldCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCByYXdDb25maWdzID0ganNvbkFzc2V0ICYmIEFycmF5LmlzQXJyYXkoanNvbkFzc2V0Lmpzb24pID8ganNvbkFzc2V0Lmpzb24gOiBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLm9ubGluZVJld2FyZENvbmZpZ3MgPSByYXdDb25maWdzLm1hcCgoY29uZmlnOiBhbnkpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBOdW1iZXIoY29uZmlnLmlkKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICB0aW1lOiBOdW1iZXIoY29uZmlnLnRpbWUpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke2NvbmZpZy5uYW1lIHx8ICcnfWAsXG4gICAgICAgICAgICAgICAgICAgIGRlc2M6IGAke2NvbmZpZy5kZXNjIHx8ICcnfWAsXG4gICAgICAgICAgICAgICAgICAgIGljb246IE51bWJlcihjb25maWcuaWNvbikgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkSWQ6IE51bWJlcihjb25maWcucmV3YXJkSWQpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZE51bTogTnVtYmVyKGNvbmZpZy5yZXdhcmROdW0pIHx8IDBcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbmZpZ0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRDb25maWdQcm9taXNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdERhaWx5UmV3YXJkcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51cGRhdGVUb2RheURhdGUoKTtcbiAgICAgICAgdGhpcy5jaGVja05ld0RheSgpO1xuXG4gICAgICAgIHRoaXMuZGFpbHlSZXdhcmRzID0gdGhpcy5vbmxpbmVSZXdhcmRDb25maWdzLm1hcChjb25maWcgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNDbGFpbWVkID0gdGhpcy5jaGVja1Jld2FyZENsYWltZWQoY29uZmlnLmlkKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXZhaWxhYmxlID0gIWlzQ2xhaW1lZCAmJiB0aGlzLmdldE9ubGluZU1pbnV0ZXMoKSA+PSBjb25maWcudGltZTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgICAgICAgICAgaXNDbGFpbWVkLFxuICAgICAgICAgICAgICAgIGlzQXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkTWludXRlczogY29uZmlnLnRpbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlVG9kYXlEYXRlKCk6IHZvaWQge1xuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMudG9kYXlEYXRlID0gYCR7dG9kYXkuZ2V0RnVsbFllYXIoKX0tJHtTdHJpbmcodG9kYXkuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKHRvZGF5LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tOZXdEYXkoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHJld2FyZERhdGVLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5kYWlseVJld2FyZERhdGVLZXkpO1xuICAgICAgICBjb25zdCB0b2RheURhdGUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0ocmV3YXJkRGF0ZUtleSk7XG4gICAgICAgIGlmICghdG9kYXlEYXRlIHx8IHRvZGF5RGF0ZSAhPT0gdGhpcy50b2RheURhdGUpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShyZXdhcmREYXRlS2V5LCB0aGlzLnRvZGF5RGF0ZSk7XG4gICAgICAgICAgICB0aGlzLnNhdmVDbGFpbWVkUmV3YXJkcyhbXSk7XG4gICAgICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlPbmxpbmVNaW51dGVzS2V5KTtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShvbmxpbmVNaW51dGVzS2V5LCBcIjBcIik7XG4gICAgICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0T25saW5lTWludXRlcygpOiBudW1iZXIge1xuICAgICAgICBpZiAoT25saW5lVGltZU1hbmFnZXIuSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBPbmxpbmVUaW1lTWFuYWdlci5JbnN0YW5jZS5nZXRPbmxpbmVNaW51dGVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja1Jld2FyZENsYWltZWQocmV3YXJkSWQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjbGFpbWVkTGlzdCA9IHRoaXMuZ2V0Q2xhaW1lZFJld2FyZHMoKTtcbiAgICAgICAgcmV0dXJuIGNsYWltZWRMaXN0LmluY2x1ZGVzKHJld2FyZElkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hcmtSZXdhcmRDbGFpbWVkKHJld2FyZElkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2xhaW1lZExpc3QgPSB0aGlzLmdldENsYWltZWRSZXdhcmRzKCk7XG4gICAgICAgIGlmICghY2xhaW1lZExpc3QuaW5jbHVkZXMocmV3YXJkSWQpKSB7XG4gICAgICAgICAgICBjbGFpbWVkTGlzdC5wdXNoKHJld2FyZElkKTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZUNsYWltZWRSZXdhcmRzKGNsYWltZWRMaXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2l2ZVJld2FyZChyZXdhcmQ6IE9ubGluZVJld2FyZEl0ZW0pOiB2b2lkIHtcbiAgICAgICAgaWYgKHJld2FyZC5yZXdhcmROdW0gPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbUdhbWVEYXRhLmFkZEdvbGQocmV3YXJkLnJld2FyZE51bSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVEYWlseVJld2FyZHNTdGF0dXMoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9ubGluZU1pbnV0ZXMgPSB0aGlzLmdldE9ubGluZU1pbnV0ZXMoKTtcbiAgICAgICAgdGhpcy5kYWlseVJld2FyZHMuZm9yRWFjaChyZXdhcmQgPT4ge1xuICAgICAgICAgICAgcmV3YXJkLmlzQXZhaWxhYmxlID0gIXJld2FyZC5pc0NsYWltZWQgJiYgb25saW5lTWludXRlcyA+PSByZXdhcmQucmVxdWlyZWRNaW51dGVzO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZURhaWx5UmV3YXJkVUkoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZURhaWx5UmV3YXJkVUkoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5kYWlseVBhbmVsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdEYWlseSBwYW5lbCBub3QgYXNzaWduZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5lbnN1cmVSZXdhcmRTY3JvbGxMaXN0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGFpbHlSZXdhcmRzLnNvcnQoKGEsIGIpID0+IGEuaWQgLSBiLmlkKTtcblxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSB0aGlzLnJld2FyZFNjcm9sbFZpZXcubm9kZS53aWR0aDtcbiAgICAgICAgY29uc3Qgdmlld0hlaWdodCA9IHRoaXMucmV3YXJkU2Nyb2xsVmlldy5ub2RlLmhlaWdodDtcbiAgICAgICAgY29uc3QgY29sdW1uQ291bnQgPSAzO1xuICAgICAgICBjb25zdCB2ZXJ0aWNhbFNwYWNpbmcgPSAyNjtcbiAgICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IDE2O1xuICAgICAgICBjb25zdCBwYWRkaW5nQm90dG9tID0gMjg7XG4gICAgICAgIGNvbnN0IGl0ZW1TaXplID0gdGhpcy5nZXRSZXdhcmRJdGVtU2l6ZSh0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSk7XG4gICAgICAgIGNvbnN0IGl0ZW1TY2FsZSA9IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLnNjYWxlIHx8IDE7XG4gICAgICAgIGNvbnN0IGxheW91dEl0ZW1XaWR0aCA9IGl0ZW1TaXplLndpZHRoICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBsYXlvdXRJdGVtSGVpZ2h0ID0gaXRlbVNpemUuaGVpZ2h0ICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBpdGVtTGF5b3V0SGVpZ2h0ID0gbGF5b3V0SXRlbUhlaWdodCArIDUwICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBob3Jpem9udGFsU3BhY2luZyA9IE1hdGgubWluKDU2LCBNYXRoLm1heCgwLCAodmlld1dpZHRoIC0gbGF5b3V0SXRlbVdpZHRoICogY29sdW1uQ291bnQpIC8gTWF0aC5tYXgoMSwgY29sdW1uQ291bnQgLSAxKSkpO1xuICAgICAgICBjb25zdCByb3dDb3VudCA9IE1hdGguY2VpbCh0aGlzLmRhaWx5UmV3YXJkcy5sZW5ndGggLyBjb2x1bW5Db3VudCk7XG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gcm93Q291bnQgKiBpdGVtTGF5b3V0SGVpZ2h0ICsgTWF0aC5tYXgoMCwgcm93Q291bnQgLSAxKSAqIHZlcnRpY2FsU3BhY2luZyArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuICAgICAgICBjb25zdCBncmlkV2lkdGggPSBjb2x1bW5Db3VudCAqIGxheW91dEl0ZW1XaWR0aCArIChjb2x1bW5Db3VudCAtIDEpICogaG9yaXpvbnRhbFNwYWNpbmc7XG4gICAgICAgIGNvbnN0IHN0YXJ0WCA9IC1ncmlkV2lkdGggLyAyICsgbGF5b3V0SXRlbVdpZHRoIC8gMjtcbiAgICAgICAgY29uc3Qgc2hvdWxkU2Nyb2xsVG9Ub3AgPSB0aGlzLnJld2FyZENvbnRlbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAwO1xuICAgICAgICBjb25zdCBhY3RpdmVJdGVtTmFtZXM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuXG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC53aWR0aCA9IHZpZXdXaWR0aDtcbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LmhlaWdodCA9IE1hdGgubWF4KHZpZXdIZWlnaHQgKyAxLCB0b3RhbEhlaWdodCk7XG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC5hbmNob3JYID0gMC41O1xuICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQuYW5jaG9yWSA9IDE7XG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC54ID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGFpbHlSZXdhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByZXdhcmREYXRhID0gdGhpcy5kYWlseVJld2FyZHNbaV07XG4gICAgICAgICAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBjb2x1bW5Db3VudCk7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSBpICUgY29sdW1uQ291bnQ7XG4gICAgICAgICAgICBjb25zdCBpdGVtTmFtZSA9IGBkYWlseVJld2FyZEl0ZW0ke3Jld2FyZERhdGEuaWR9YDtcbiAgICAgICAgICAgIGxldCBpdGVtTm9kZSA9IHRoaXMucmV3YXJkSXRlbU5vZGVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoIWl0ZW1Ob2RlKSB7XG4gICAgICAgICAgICAgICAgaXRlbU5vZGUgPSB0aGlzLnJld2FyZENvbnRlbnQuZ2V0Q2hpbGRCeU5hbWUoaXRlbU5hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWl0ZW1Ob2RlKSB7XG4gICAgICAgICAgICAgICAgaXRlbU5vZGUgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgaXRlbU5vZGUubmFtZSA9IGl0ZW1OYW1lO1xuICAgICAgICAgICAgICAgIGl0ZW1Ob2RlLnBhcmVudCA9IHRoaXMucmV3YXJkQ29udGVudDtcbiAgICAgICAgICAgICAgICB0aGlzLnJld2FyZEl0ZW1Ob2Rlc1tpXSA9IGl0ZW1Ob2RlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhY3RpdmVJdGVtTmFtZXNbaXRlbU5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIGl0ZW1Ob2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBpdGVtTm9kZS53aWR0aCA9IGl0ZW1TaXplLndpZHRoO1xuICAgICAgICAgICAgaXRlbU5vZGUuaGVpZ2h0ID0gaXRlbVNpemUuaGVpZ2h0O1xuICAgICAgICAgICAgaXRlbU5vZGUuc2NhbGUgPSBpdGVtU2NhbGU7XG4gICAgICAgICAgICBpdGVtTm9kZS54ID0gc3RhcnRYICsgY29sICogKGxheW91dEl0ZW1XaWR0aCArIGhvcml6b250YWxTcGFjaW5nKTtcbiAgICAgICAgICAgIGl0ZW1Ob2RlLnkgPSAtcGFkZGluZ1RvcCAtIGxheW91dEl0ZW1IZWlnaHQgLyAyIC0gcm93ICogKGl0ZW1MYXlvdXRIZWlnaHQgKyB2ZXJ0aWNhbFNwYWNpbmcpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFJld2FyZEl0ZW1EYXRhKGl0ZW1Ob2RlLCByZXdhcmREYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLnJld2FyZEl0ZW1Ob2Rlcy5sZW5ndGggLSAxOyBpID49IHRoaXMuZGFpbHlSZXdhcmRzLmxlbmd0aDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZXdhcmRJdGVtTm9kZXNbaV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJld2FyZEl0ZW1Ob2Rlc1tpXS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLnJld2FyZENvbnRlbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5yZXdhcmRDb250ZW50LmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUuaW5kZXhPZignZGFpbHlSZXdhcmRJdGVtJykgPT09IDAgJiYgIWFjdGl2ZUl0ZW1OYW1lc1tjaGlsZC5uYW1lXSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgICAgICAgICAgICBjaGlsZC5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2hvdWxkU2Nyb2xsVG9Ub3AgJiYgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKSB7XG4gICAgICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQueSA9IHZpZXdIZWlnaHQgLyAyO1xuICAgICAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWluWSA9IHZpZXdIZWlnaHQgLyAyO1xuICAgICAgICAgICAgY29uc3QgbWF4WSA9IE1hdGgubWF4KG1pblksIHRoaXMucmV3YXJkQ29udGVudC5oZWlnaHQgLSB2aWV3SGVpZ2h0IC8gMik7XG4gICAgICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQueSA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMucmV3YXJkQ29udGVudC55LCBtaW5ZKSwgbWF4WSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGVuc3VyZVJld2FyZFNjcm9sbExpc3QoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5kYWlseVBhbmVsIHx8IHRoaXMubm9kZTtcbiAgICAgICAgY29uc3QgZnJhbWVOb2RlID0gcGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ2ppZW1pYW5rdWFuZycpIHx8IHBhbmVsO1xuXG4gICAgICAgIGlmICghdGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlID0gdGhpcy5maW5kUmV3YXJkSXRlbVRlbXBsYXRlKGZyYW1lTm9kZSwgcGFuZWwpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0RhaWx5IHJld2FyZCBpdGVtIHRlbXBsYXRlIGRheU4gbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNjcm9sbE5vZGUgPSBmcmFtZU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ0RhaWx5UmV3YXJkU2Nyb2xsVmlldycpO1xuICAgICAgICBpZiAoIXNjcm9sbE5vZGUpIHtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUgPSBuZXcgY2MuTm9kZSgnRGFpbHlSZXdhcmRTY3JvbGxWaWV3Jyk7XG4gICAgICAgICAgICBzY3JvbGxOb2RlLnBhcmVudCA9IGZyYW1lTm9kZTtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gZnJhbWVOb2RlLmdldENoaWxkQnlOYW1lKCdzaGVuZGlrdWFuZycpO1xuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSBiYWNrZ3JvdW5kTm9kZSAmJiBiYWNrZ3JvdW5kTm9kZS53aWR0aCA+IDAgPyBiYWNrZ3JvdW5kTm9kZS53aWR0aCA6IDQ1NTtcbiAgICAgICAgY29uc3Qgdmlld0hlaWdodCA9IGJhY2tncm91bmROb2RlICYmIGJhY2tncm91bmROb2RlLmhlaWdodCA+IDAgPyBiYWNrZ3JvdW5kTm9kZS5oZWlnaHQgOiA0MzA7XG5cbiAgICAgICAgc2Nyb2xsTm9kZS53aWR0aCA9IHZpZXdXaWR0aDtcbiAgICAgICAgc2Nyb2xsTm9kZS5oZWlnaHQgPSB2aWV3SGVpZ2h0O1xuICAgICAgICBzY3JvbGxOb2RlLnggPSBiYWNrZ3JvdW5kTm9kZSA/IGJhY2tncm91bmROb2RlLnggOiAwO1xuICAgICAgICBzY3JvbGxOb2RlLnkgPSBiYWNrZ3JvdW5kTm9kZSA/IGJhY2tncm91bmROb2RlLnkgOiAtMzI7XG5cbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3ID0gc2Nyb2xsTm9kZS5nZXRDb21wb25lbnQoY2MuU2Nyb2xsVmlldykgfHwgc2Nyb2xsTm9kZS5hZGRDb21wb25lbnQoY2MuU2Nyb2xsVmlldyk7XG4gICAgICAgIHRoaXMucmV3YXJkU2Nyb2xsVmlldy5ob3Jpem9udGFsID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmV3YXJkU2Nyb2xsVmlldy52ZXJ0aWNhbCA9IHRydWU7XG4gICAgICAgIHRoaXMucmV3YXJkU2Nyb2xsVmlldy5pbmVydGlhID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmJyYWtlID0gMC43NTtcbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmVsYXN0aWMgPSB0cnVlO1xuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcuYm91bmNlRHVyYXRpb24gPSAwLjIzO1xuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcuY2FuY2VsSW5uZXJFdmVudHMgPSB0cnVlO1xuXG4gICAgICAgIGxldCB2aWV3Tm9kZSA9IHNjcm9sbE5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3ZpZXcnKTtcbiAgICAgICAgaWYgKCF2aWV3Tm9kZSkge1xuICAgICAgICAgICAgdmlld05vZGUgPSBuZXcgY2MuTm9kZSgndmlldycpO1xuICAgICAgICAgICAgdmlld05vZGUucGFyZW50ID0gc2Nyb2xsTm9kZTtcbiAgICAgICAgICAgIHZpZXdOb2RlLmFkZENvbXBvbmVudChjYy5NYXNrKTtcbiAgICAgICAgfVxuICAgICAgICB2aWV3Tm9kZS53aWR0aCA9IHZpZXdXaWR0aDtcbiAgICAgICAgdmlld05vZGUuaGVpZ2h0ID0gdmlld0hlaWdodDtcbiAgICAgICAgdmlld05vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgdmlld05vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmlld05vZGUueCA9IDA7XG4gICAgICAgIHZpZXdOb2RlLnkgPSAwO1xuXG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudCA9IHZpZXdOb2RlLmdldENoaWxkQnlOYW1lKCdjb250ZW50Jyk7XG4gICAgICAgIGlmICghdGhpcy5yZXdhcmRDb250ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQgPSBuZXcgY2MuTm9kZSgnY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LnBhcmVudCA9IHZpZXdOb2RlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC5hbmNob3JYID0gMC41O1xuICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQuYW5jaG9yWSA9IDE7XG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC54ID0gMDtcbiAgICAgICAgaWYgKHRoaXMucmV3YXJkQ29udGVudC5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucmV3YXJkQ29udGVudC55ID0gdmlld0hlaWdodCAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQgPSB0aGlzLnJld2FyZENvbnRlbnQ7XG4gICAgICAgIHRoaXMucmV3YXJkSXRlbU5vZGVzID0gdGhpcy5jb2xsZWN0UmV3YXJkSXRlbU5vZGVzKGZyYW1lTm9kZSwgcGFuZWwpO1xuICAgICAgICBpZiAodGhpcy5yZXdhcmRJdGVtTm9kZXMubGVuZ3RoID09PSAwICYmIHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnJld2FyZEl0ZW1Ob2RlcyA9IFt0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZV07XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtTm9kZSBvZiB0aGlzLnJld2FyZEl0ZW1Ob2Rlcykge1xuICAgICAgICAgICAgaXRlbU5vZGUucGFyZW50ID0gdGhpcy5yZXdhcmRDb250ZW50O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3YXJkSXRlbU5vZGVzLnNvcnQoKGEsIGIpID0+IHRoaXMuZ2V0UmV3YXJkSXRlbUluZGV4KGEpIC0gdGhpcy5nZXRSZXdhcmRJdGVtSW5kZXgoYikpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29sbGVjdFJld2FyZEl0ZW1Ob2RlcyhmcmFtZU5vZGU6IGNjLk5vZGUsIHBhbmVsOiBjYy5Ob2RlKTogY2MuTm9kZVtdIHtcbiAgICAgICAgY29uc3QgcmVzdWx0OiBjYy5Ob2RlW10gPSBbXTtcbiAgICAgICAgY29uc3Qgc2Vlbjoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gICAgICAgIGNvbnN0IGNvbGxlY3RGcm9tID0gKHBhcmVudDogY2MuTm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHJldHVybjtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDMxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXlOb2RlID0gcGFyZW50LmdldENoaWxkQnlOYW1lKGBkYXkke2l9YCk7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gZGF5Tm9kZSA/ICgoZGF5Tm9kZSBhcyBhbnkpLnV1aWQgfHwgYCR7ZGF5Tm9kZS5uYW1lfV8ke3Jlc3VsdC5sZW5ndGh9YCkgOiAnJztcbiAgICAgICAgICAgICAgICBpZiAoZGF5Tm9kZSAmJiAhc2VlbltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZW5ba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRheU5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb2xsZWN0RnJvbSh0aGlzLnJld2FyZENvbnRlbnQpO1xuICAgICAgICBjb2xsZWN0RnJvbShmcmFtZU5vZGUpO1xuICAgICAgICBpZiAoZnJhbWVOb2RlICE9PSBwYW5lbCkgY29sbGVjdEZyb20ocGFuZWwpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZFJld2FyZEl0ZW1UZW1wbGF0ZShmcmFtZU5vZGU6IGNjLk5vZGUsIHBhbmVsOiBjYy5Ob2RlKTogY2MuTm9kZSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBmcmFtZU5vZGUgPT09IHBhbmVsID8gW2ZyYW1lTm9kZV0gOiBbZnJhbWVOb2RlLCBwYW5lbF07XG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDMxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXlOb2RlID0gc291cmNlLmdldENoaWxkQnlOYW1lKGBkYXkke2l9YCk7XG4gICAgICAgICAgICAgICAgaWYgKGRheU5vZGUpIHJldHVybiBkYXlOb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmV3YXJkSXRlbUluZGV4KGl0ZW1Ob2RlOiBjYy5Ob2RlKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBpdGVtTm9kZSAmJiBpdGVtTm9kZS5uYW1lID8gaXRlbU5vZGUubmFtZS5tYXRjaCgvXmRheShcXGQrKSQvKSA6IG51bGw7XG4gICAgICAgIHJldHVybiBtYXRjaCA/IE51bWJlcihtYXRjaFsxXSkgOiA5OTk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZXdhcmRJdGVtU2l6ZShpdGVtTm9kZTogY2MuTm9kZSk6IGNjLlNpemUge1xuICAgICAgICByZXR1cm4gY2Muc2l6ZShcbiAgICAgICAgICAgIE1hdGgubWF4KGl0ZW1Ob2RlLndpZHRoLCAxMjApLFxuICAgICAgICAgICAgTWF0aC5tYXgoaXRlbU5vZGUuaGVpZ2h0LCAxNjApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRSZXdhcmRJdGVtRGF0YShkYXlOb2RlOiBjYy5Ob2RlLCByZXdhcmREYXRhOiBPbmxpbmVSZXdhcmRJdGVtKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGxhYmVsTm9kZSA9IGRheU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ0xhYmVsJyk7XG4gICAgICAgIGlmIChsYWJlbE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gbGFiZWxOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSByZXdhcmREYXRhLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXdhcmRTdHJpbmcgPSBgeCR7cmV3YXJkRGF0YS5yZXdhcmROdW19YDtcbiAgICAgICAgY29uc3QgcmV3YXJkMU5vZGUgPSBkYXlOb2RlLmdldENoaWxkQnlOYW1lKCdyZXdhcmQxJyk7XG4gICAgICAgIGlmIChyZXdhcmQxTm9kZSkge1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkTGFiZWwgPSByZXdhcmQxTm9kZS5nZXRDaGlsZEJ5TmFtZSgnTGFiZWwnKTtcbiAgICAgICAgICAgIGlmIChyZXdhcmRMYWJlbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gcmV3YXJkTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gcmV3YXJkU3RyaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGp1ZXNlMSA9IGRheU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ2p1ZXNlMScpO1xuICAgICAgICBjb25zdCBudW1MYWJlbCA9IGp1ZXNlMSAmJiBqdWVzZTEuZ2V0Q2hpbGRCeU5hbWUoJ251bScpXG4gICAgICAgICAgICA/IGp1ZXNlMS5nZXRDaGlsZEJ5TmFtZSgnbnVtJykuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICBpZiAobnVtTGFiZWwpIHtcbiAgICAgICAgICAgIG51bUxhYmVsLnN0cmluZyA9IHJld2FyZFN0cmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJld2FyZE5vZGUgPSBkYXlOb2RlLmdldENoaWxkQnlOYW1lKCdyZXdhcmQnKTtcbiAgICAgICAgY29uc3QgZ290Tm9kZSA9IGRheU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ2dvdCcpO1xuICAgICAgICBpZiAoIXJld2FyZE5vZGUgfHwgIWdvdE5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gcmV3YXJkTm9kZS5nZXRDaGlsZEJ5TmFtZSgnQmFja2dyb3VuZCcpO1xuICAgICAgICBpZiAoIWJhY2tncm91bmROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsYWJlbENoaWxkID0gYmFja2dyb3VuZE5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ0xhYmVsJyk7XG4gICAgICAgIGNvbnN0IHJld2FyZExhYmVsID0gbGFiZWxDaGlsZCA/IGxhYmVsQ2hpbGQuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSA6IG51bGw7XG4gICAgICAgIGNvbnN0IHNwcml0ZUNvbXBvbmVudCA9IGJhY2tncm91bmROb2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBjb25zdCBiYWNrZ3JvdW5kQ2FjaGUgPSBiYWNrZ3JvdW5kTm9kZSBhcyBhbnk7XG4gICAgICAgIGlmIChzcHJpdGVDb21wb25lbnQgJiYgIWJhY2tncm91bmRDYWNoZS5kYWlseVJld2FyZE5vcm1hbFNwcml0ZUNhcHR1cmVkKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ2FjaGUuZGFpbHlSZXdhcmROb3JtYWxTcHJpdGVGcmFtZSA9IHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZTtcbiAgICAgICAgICAgIGJhY2tncm91bmRDYWNoZS5kYWlseVJld2FyZE5vcm1hbFNwcml0ZUNhcHR1cmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBiYWNrZ3JvdW5kTm9kZS5vZmYoY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5EKTtcblxuICAgICAgICBpZiAocmV3YXJkRGF0YS5pc0NsYWltZWQpIHtcbiAgICAgICAgICAgIHJld2FyZE5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGdvdE5vZGUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChzcHJpdGVDb21wb25lbnQgJiYgIWJhY2tncm91bmRDYWNoZS5kYWlseVJld2FyZENsYWltZWRTcHJpdGVMb2FkZWQgJiYgIWJhY2tncm91bmRDYWNoZS5kYWlseVJld2FyZENsYWltZWRTcHJpdGVMb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENhY2hlLmRhaWx5UmV3YXJkQ2xhaW1lZFNwcml0ZUxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGljb25QYXRoID0gYHp6SW1nL2Fubml1eWlsaW5ncXVgO1xuICAgICAgICAgICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKGljb25QYXRoLCBjYy5TcHJpdGVGcmFtZSwgKGVyciwgc3ByaXRlRnJhbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENhY2hlLmRhaWx5UmV3YXJkQ2xhaW1lZFNwcml0ZUxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgTG9hZCAke2ljb25QYXRofSBmYWlsZWQ6YCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENhY2hlLmRhaWx5UmV3YXJkQ2xhaW1lZFNwcml0ZUxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJld2FyZExhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV3YXJkTGFiZWwubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChyZXdhcmREYXRhLmlzQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICByZXdhcmROb2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBnb3ROb2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgYmFja2dyb3VuZENhY2hlLmRhaWx5UmV3YXJkQ2xhaW1lZFNwcml0ZUxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgYmFja2dyb3VuZENhY2hlLmRhaWx5UmV3YXJkQ2xhaW1lZFNwcml0ZUxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHNwcml0ZUNvbXBvbmVudCAmJiBiYWNrZ3JvdW5kQ2FjaGUuZGFpbHlSZXdhcmROb3JtYWxTcHJpdGVDYXB0dXJlZCkge1xuICAgICAgICAgICAgICAgIHNwcml0ZUNvbXBvbmVudC5zcHJpdGVGcmFtZSA9IGJhY2tncm91bmRDYWNoZS5kYWlseVJld2FyZE5vcm1hbFNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmV3YXJkTGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXdhcmRMYWJlbC5zdHJpbmcgPSAnJztcbiAgICAgICAgICAgICAgICByZXdhcmRMYWJlbC5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYWNrZ3JvdW5kTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25DbGFpbUNsaWNrKHJld2FyZERhdGEuaWQpLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJld2FyZE5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBnb3ROb2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ2FjaGUuZGFpbHlSZXdhcmRDbGFpbWVkU3ByaXRlTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ2FjaGUuZGFpbHlSZXdhcmRDbGFpbWVkU3ByaXRlTG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoc3ByaXRlQ29tcG9uZW50ICYmIGJhY2tncm91bmRDYWNoZS5kYWlseVJld2FyZE5vcm1hbFNwcml0ZUNhcHR1cmVkKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlQ29tcG9uZW50LnNwcml0ZUZyYW1lID0gYmFja2dyb3VuZENhY2hlLmRhaWx5UmV3YXJkTm9ybWFsU3ByaXRlRnJhbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld0xhYmVsTm9kZSA9IGdvdE5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ05ldyBMYWJlbCcpO1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBuZXdMYWJlbE5vZGUgPyBuZXdMYWJlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSA6IG51bGw7XG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzID0gdGhpcy5nZXRPbmxpbmVNaW51dGVzKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nTWludXRlcyA9IE1hdGgubWF4KDAsIHJld2FyZERhdGEucmVxdWlyZWRNaW51dGVzIC0gb25saW5lTWludXRlcyk7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gYCR7cmVtYWluaW5nTWludXRlc33liIbpkp/lkI7lj6/pooblj5ZgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNsYWltQ2xpY2socmV3YXJkSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCByZXdhcmQgPSB0aGlzLmRhaWx5UmV3YXJkcy5maW5kKHIgPT4gci5pZCA9PT0gcmV3YXJkSWQpO1xuICAgICAgICBpZiAoIXJld2FyZCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXJld2FyZC5pc0F2YWlsYWJsZSkgcmV0dXJuO1xuICAgICAgICBpZiAocmV3YXJkLmlzQ2xhaW1lZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZ2l2ZVJld2FyZChyZXdhcmQpO1xuICAgICAgICByZXdhcmQuaXNDbGFpbWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYXJrUmV3YXJkQ2xhaW1lZChyZXdhcmRJZCk7XG4gICAgICAgIHRoaXMudXBkYXRlRGFpbHlSZXdhcmRVSSgpO1xuICAgICAgICB0aGlzLnNob3dUb2FzdChg6I635b6XJHtyZXdhcmQucmV3YXJkTnVtfemSu+efs+OAgmApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DbG9zZUNsaWNrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIFRpcHNNYW5hZ2VyLnNob3cobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvYWRPbmxpbmVSZXdhcmRDb25maWcoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdERhaWx5UmV3YXJkcygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYWlseVJld2FyZFVJKCk7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUmVsb2FkIG9ubGluZSByZXdhcmQgY29uZmlnIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWRlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEN1cnJlbnRPbmxpbmVNaW51dGVzKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE9ubGluZU1pbnV0ZXMoKTtcbiAgICB9XG59XG4iXX0=