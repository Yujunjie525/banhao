
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
        _this.rewardScrollView = null;
        _this.rewardItemTemplate = null;
        _this.rewardListColumns = 2;
        _this.rewardListTopPadding = 0;
        _this.rewardListRowGap = 20;
        _this.rewardListColumnGap = 18;
        _this.rewardListBottomPadding = 24;
        _this.lastRenderedOnlineMinutes = -1;
        _this.isStatusTimerScheduled = false;
        _this.todayDate = '';
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
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
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
        var changed = false;
        this.dailyRewards.forEach(function (reward) {
            var nextAvailable = !reward.isClaimed && onlineMinutes >= reward.requiredMinutes;
            if (reward.isAvailable !== nextAvailable) {
                changed = true;
            }
            reward.isAvailable = nextAvailable;
        });
        if (changed || onlineMinutes !== this.lastRenderedOnlineMinutes) {
            this.lastRenderedOnlineMinutes = onlineMinutes;
            this.refreshRewardListState();
        }
    };
    DailyRewardManager.prototype.updateDailyRewardUI = function () {
        if (!this.dailyPanel) {
            console.error('Daily panel not assigned');
            return;
        }
        this.ensureRewardLayout('在线奖励');
        this.rebuildRewardList();
    };
    DailyRewardManager.prototype.ensureRewardLayout = function (title) {
        var mask = this.dailyPanel.getChildByName('遮罩');
        if (mask) {
            mask.opacity = 190;
        }
        var frame = this.dailyPanel.getChildByName('jiemiankuang');
        if (frame) {
            this.setSpriteFrame(frame, '1Load/tanchuang3');
            frame.children.forEach(function (child) { return child.active = false; });
        }
        var closeNode = this.closeButton ? this.closeButton.node : this.dailyPanel.getChildByName('btnclose');
        if (closeNode) {
            this.setSpriteFrame(closeNode, '1Load/guanbi');
        }
        var titleNode = this.getOrCreatePanelTitle(title);
        titleNode.zIndex = 5;
        this.rewardScrollView = this.getOrCreateScrollView();
        this.rewardItemTemplate = this.getOrCreateRewardItemTemplate();
    };
    DailyRewardManager.prototype.rebuildRewardList = function () {
        var _this = this;
        if (!this.rewardScrollView || !this.rewardScrollView.content || !this.rewardItemTemplate) {
            return;
        }
        var content = this.rewardScrollView.content;
        content.children.slice().forEach(function (child) {
            if (child !== _this.rewardItemTemplate) {
                child.removeFromParent(false);
                child.destroy();
            }
        });
        this.rewardItemTemplate.active = false;
        var columns = Math.max(1, this.rewardListColumns || 1);
        var rows = Math.ceil(this.dailyRewards.length / columns);
        var itemHeight = this.rewardItemTemplate.height || this.rewardItemTemplate.getContentSize().height;
        var viewHeight = this.rewardScrollView.node.height || (this.rewardScrollView.content && this.rewardScrollView.content.parent ? this.rewardScrollView.content.parent.height : 0);
        content.height = Math.max(viewHeight, this.rewardListTopPadding + rows * itemHeight + Math.max(0, rows - 1) * this.rewardListRowGap + this.rewardListBottomPadding);
        for (var i = 0; i < this.dailyRewards.length; i++) {
            var item = cc.instantiate(this.rewardItemTemplate);
            item.name = "RewardItem" + (i + 1);
            item.active = true;
            item.parent = content;
            var position = this.getRewardItemPosition(i);
            item.x = position.x;
            item.y = position.y;
            try {
                this.applyRewardItem(item, this.dailyRewards[i]);
            }
            catch (error) {
                console.error('Apply online reward item failed:', error);
            }
        }
        if (this.rewardScrollView.scrollToTop) {
            this.rewardScrollView.scrollToTop(0.1);
        }
    };
    DailyRewardManager.prototype.refreshRewardListState = function () {
        if (!this.rewardScrollView || !this.rewardScrollView.content) {
            this.updateDailyRewardUI();
            return;
        }
        for (var i = 0; i < this.dailyRewards.length; i++) {
            var item = this.rewardScrollView.content.getChildByName("RewardItem" + (i + 1));
            if (!item) {
                this.updateDailyRewardUI();
                return;
            }
            this.applyRewardItem(item, this.dailyRewards[i]);
        }
    };
    DailyRewardManager.prototype.applyRewardItem = function (item, rewardData) {
        var _this = this;
        this.setSpriteFrame(item.getChildByName('ClaimedButton'), '2main/anniuyilingqu');
        var titleNode = item.getChildByName('Title');
        var titleLabel = titleNode ? titleNode.getComponent(cc.Label) : null;
        if (titleLabel) {
            titleLabel.string = rewardData.name;
        }
        var amountNode = item.getChildByName('Amount');
        var amountLabel = amountNode ? amountNode.getComponent(cc.Label) : null;
        if (amountLabel) {
            amountLabel.string = "" + rewardData.rewardNum;
        }
        var buttonNode = item.getChildByName('ClaimButton');
        var claimedNode = item.getChildByName('ClaimedButton');
        if (!buttonNode || !claimedNode) {
            return;
        }
        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.opacity = 255;
        claimedNode.opacity = 255;
        var button = buttonNode.getComponent(cc.Button);
        if (button) {
            button.enableAutoGrayEffect = true;
            button.disabledColor = cc.color(160, 160, 160, 255);
        }
        if (rewardData.isClaimed) {
            buttonNode.active = false;
            claimedNode.active = true;
        }
        else {
            buttonNode.active = true;
            claimedNode.active = false;
            if (button) {
                button.interactable = true;
            }
            if (rewardData.isAvailable) {
                this.setSpriteFrame(buttonNode, '2main/anniulingqu');
                this.setClaimButtonStateText(buttonNode, '');
                buttonNode.on(cc.Node.EventType.TOUCH_END, function () { return _this.onClaimClick(rewardData.id); }, this);
            }
            else {
                this.setSpriteFrame(buttonNode, '2main/anniukong');
                var remainingMinutes = Math.max(1, rewardData.requiredMinutes - this.getOnlineMinutes());
                this.setClaimButtonStateText(buttonNode, remainingMinutes + "\u5206\u949F\u540E\u53EF\u9886\u53D6");
            }
        }
    };
    DailyRewardManager.prototype.setClaimButtonStateText = function (buttonNode, text) {
        var labelNode = buttonNode.getChildByName('StateLabel');
        if (!labelNode) {
            labelNode = new cc.Node('StateLabel');
            labelNode.parent = buttonNode;
            labelNode.addComponent(cc.Label);
            labelNode.setContentSize(buttonNode.width, buttonNode.height);
            labelNode.setPosition(0, 0);
            labelNode.color = cc.color(64, 74, 96);
            var fallbackLabel = labelNode.getComponent(cc.Label);
            fallbackLabel.fontSize = 22;
            fallbackLabel.lineHeight = 28;
            fallbackLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            fallbackLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        }
        labelNode.active = text.length > 0;
        labelNode.zIndex = 10;
        var label = labelNode.getComponent(cc.Label);
        label.string = text;
    };
    DailyRewardManager.prototype.getOrCreateScrollView = function () {
        var scrollNode = this.dailyPanel.getChildByName('RewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('RewardScrollView');
            scrollNode.parent = this.dailyPanel;
        }
        scrollNode.zIndex = 4;
        var view = scrollNode.getChildByName('view');
        if (!view) {
            view = new cc.Node('view');
            view.parent = scrollNode;
            view.addComponent(cc.Mask);
        }
        var content = view.getChildByName('content');
        if (!content) {
            content = new cc.Node('content');
            content.parent = view;
            content.setContentSize(view.width, view.height);
            content.setPosition(0, 0);
            content.anchorX = 0.5;
            content.anchorY = 1;
        }
        var scrollView = scrollNode.getComponent(cc.ScrollView);
        if (!scrollView) {
            scrollView = scrollNode.addComponent(cc.ScrollView);
        }
        scrollView.content = content;
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.brake = 0.75;
        return scrollView;
    };
    DailyRewardManager.prototype.getOrCreateRewardItemTemplate = function () {
        var content = this.rewardScrollView && this.rewardScrollView.content;
        var template = content ? content.getChildByName('RewardItemTemplate') : null;
        if (!template) {
            template = this.dailyPanel.getChildByName('RewardItemTemplate');
            if (template && content) {
                template.parent = content;
            }
        }
        if (template) {
            template.active = false;
            return template;
        }
        template = new cc.Node('RewardItemTemplate');
        template.parent = content || this.dailyPanel;
        template.setContentSize(250, 260);
        template.setPosition(0, 0);
        template.active = false;
        var card = this.createSpriteNode('Card', 175, 232, 0, 8, '2main/dikuang7');
        card.parent = template;
        var title = this.getOrCreateLabelNode(template, 'Title', '周一', 40, cc.color(37, 128, 12), 0, 80, 100, 54);
        var titleOutline = title.getComponent(cc.LabelOutline);
        if (!titleOutline) {
            titleOutline = title.addComponent(cc.LabelOutline);
        }
        titleOutline.enabled = true;
        titleOutline.color = cc.color(255, 255, 255);
        titleOutline.width = 3;
        var coin = this.createSpriteNode('Coin', 56, 56, -35, 12, '2main/jinbi');
        coin.parent = template;
        var amount = this.getOrCreateLabelNode(template, 'Amount', '100', 28, cc.color(45, 35, 126), 32, 14, 72, 38);
        var amountOutline = amount.getComponent(cc.LabelOutline);
        if (amountOutline) {
            amountOutline.enabled = false;
        }
        var claim = this.createSpriteNode('ClaimButton', 240, 88, 0, -82, '2main/anniulingqu');
        claim.parent = template;
        claim.addComponent(cc.Button);
        var claimed = this.createSpriteNode('ClaimedButton', 240, 88, 0, -82, '2main/anniuyilingqu');
        claimed.parent = template;
        return template;
    };
    DailyRewardManager.prototype.getOrCreatePanelTitle = function (title) {
        var titleNode = this.dailyPanel.getChildByName('RewardTitle');
        if (!titleNode) {
            return this.getOrCreateLabelNode(this.dailyPanel, 'RewardTitle', title, 42, cc.color(255, 255, 255), 0, 352, 260, 56);
        }
        var label = titleNode.getComponent(cc.Label);
        if (label) {
            label.string = title;
            label.fontSize = 42;
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        }
        titleNode.color = cc.color(255, 255, 255);
        return titleNode;
    };
    DailyRewardManager.prototype.getRewardItemPosition = function (index) {
        var columns = Math.max(1, this.rewardListColumns || 1);
        var col = index % columns;
        var row = Math.floor(index / columns);
        var itemWidth = this.rewardItemTemplate.width || this.rewardItemTemplate.getContentSize().width;
        var itemHeight = this.rewardItemTemplate.height || this.rewardItemTemplate.getContentSize().height;
        var totalWidth = columns * itemWidth + Math.max(0, columns - 1) * this.rewardListColumnGap;
        var startX = -totalWidth / 2 + itemWidth / 2;
        var x = startX + col * (itemWidth + this.rewardListColumnGap);
        var y = -this.rewardListTopPadding - itemHeight / 2 - row * (itemHeight + this.rewardListRowGap);
        return cc.v2(x, y);
    };
    DailyRewardManager.prototype.createSpriteNode = function (name, width, height, x, y, spritePath) {
        var node = new cc.Node(name);
        node.setContentSize(width, height);
        node.setPosition(x, y);
        var sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.setSpriteFrame(node, spritePath);
        return node;
    };
    DailyRewardManager.prototype.getOrCreateLabelNode = function (parent, name, text, fontSize, color, x, y, width, height) {
        var node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            node.parent = parent;
            node.addComponent(cc.Label);
        }
        node.setContentSize(width, height);
        node.setPosition(x, y);
        node.color = color;
        var label = node.getComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = height;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return node;
    };
    DailyRewardManager.prototype.setSpriteFrame = function (node, spritePath) {
        if (!node) {
            return;
        }
        var sprite = node.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        if (node.__dailyRewardSpritePath === spritePath) {
            return;
        }
        node.__dailyRewardSpritePath = spritePath;
        cc.loader.loadRes(spritePath, cc.SpriteFrame, function (err, spriteFrame) {
            if (!err && spriteFrame && node.isValid) {
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
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
        this.refreshRewardListState();
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
        this.loadOnlineRewardConfig().then(function () {
            _this.initDailyRewards();
            _this.updateDailyRewardUI();
            _this.node.active = true;
            if (!_this.isStatusTimerScheduled) {
                _this.isStatusTimerScheduled = true;
                _this.schedule(function () {
                    _this.updateDailyRewardsStatus();
                }, 1);
            }
        }).catch(function (error) {
            console.error('Reload online reward config failed:', error);
            _this.node.active = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcRGFpbHlSZXdhcmRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQWxDLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBaUIsQ0FBQztBQUMxQyxtREFBOEM7QUFDOUMseURBQW9EO0FBQ3BELDZDQUF5QztBQUN6Qyw2REFBd0Q7QUFtQnhEO0lBQWdELHNDQUFZO0lBQTVEO1FBQUEscUVBb2pCQztRQWxqQkcsaUJBQVcsR0FBYyxJQUFJLENBQUM7UUFHOUIsZ0JBQVUsR0FBWSxJQUFJLENBQUM7UUFFbkIsa0JBQVksR0FBdUIsRUFBRSxDQUFDO1FBQ3RDLHlCQUFtQixHQUF5QixFQUFFLENBQUM7UUFDL0Msb0JBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIsdUJBQWlCLEdBQXlCLElBQUksQ0FBQztRQUMvQyxzQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO1FBQ3ZDLHdCQUFrQixHQUFZLElBQUksQ0FBQztRQUMxQix1QkFBaUIsR0FBVyxDQUFDLENBQUM7UUFDOUIsMEJBQW9CLEdBQVcsQ0FBQyxDQUFDO1FBQ2pDLHNCQUFnQixHQUFXLEVBQUUsQ0FBQztRQUM5Qix5QkFBbUIsR0FBVyxFQUFFLENBQUM7UUFDakMsNkJBQXVCLEdBQVcsRUFBRSxDQUFDO1FBQzlDLCtCQUF5QixHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLDRCQUFzQixHQUFZLEtBQUssQ0FBQztRQUV4QyxlQUFTLEdBQVcsRUFBRSxDQUFDO1FBRWQsd0JBQWtCLEdBQVcsaUJBQWlCLENBQUM7UUFDL0MsMkJBQXFCLEdBQVcsb0JBQW9CLENBQUM7UUFDckQsMkJBQXFCLEdBQVcsb0JBQW9CLENBQUM7O0lBMmhCMUUsQ0FBQztJQXpoQlcsc0NBQVMsR0FBakI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFh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UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVNLG9EQUF1QixHQUE5QjtRQUNJLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQWpqQkQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQzsyREFDVTtJQUc5QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzBEQUNTO0lBTFYsa0JBQWtCO1FBRHRDLE9BQU87T0FDYSxrQkFBa0IsQ0FvakJ0QztJQUFELHlCQUFDO0NBcGpCRCxBQW9qQkMsQ0FwakIrQyxFQUFFLENBQUMsU0FBUyxHQW9qQjNEO2tCQXBqQm9CLGtCQUFrQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHtjY2NsYXNzLCBwcm9wZXJ0eX0gPSBjYy5fZGVjb3JhdG9yO1xyXG5pbXBvcnQgVGlwc01hbmFnZXIgZnJvbSAnLi4vTG9hZC9UaXBzTWFuYWdlcic7XHJcbmltcG9ydCBPbmxpbmVUaW1lTWFuYWdlciBmcm9tICcuL09ubGluZVRpbWVNYW5hZ2VyJztcclxuaW1wb3J0IG1HYW1lRGF0YSBmcm9tICcuLi9Mb2FkL0dhbWVEYXRhJztcclxuaW1wb3J0IFVzZXJEYXRhU3luY01hbmFnZXIgZnJvbSAnLi9Vc2VyRGF0YVN5bmNNYW5hZ2VyJztcclxuXHJcbmludGVyZmFjZSBPbmxpbmVSZXdhcmRDb25maWcge1xyXG4gICAgaWQ6IG51bWJlcjtcclxuICAgIHRpbWU6IG51bWJlcjtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGRlc2M6IHN0cmluZztcclxuICAgIGljb246IG51bWJlcjtcclxuICAgIHJld2FyZElkOiBudW1iZXI7XHJcbiAgICByZXdhcmROdW06IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIE9ubGluZVJld2FyZEl0ZW0gZXh0ZW5kcyBPbmxpbmVSZXdhcmRDb25maWcge1xyXG4gICAgaXNDbGFpbWVkOiBib29sZWFuO1xyXG4gICAgaXNBdmFpbGFibGU6IGJvb2xlYW47XHJcbiAgICByZXF1aXJlZE1pbnV0ZXM6IG51bWJlcjtcclxufVxyXG5cclxuQGNjY2xhc3NcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGFpbHlSZXdhcmRNYW5hZ2VyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcclxuICAgIEBwcm9wZXJ0eShjYy5CdXR0b24pXHJcbiAgICBjbG9zZUJ1dHRvbjogY2MuQnV0dG9uID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIGRhaWx5UGFuZWw6IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgZGFpbHlSZXdhcmRzOiBPbmxpbmVSZXdhcmRJdGVtW10gPSBbXTtcbiAgICBwcml2YXRlIG9ubGluZVJld2FyZENvbmZpZ3M6IE9ubGluZVJld2FyZENvbmZpZ1tdID0gW107XG4gICAgcHJpdmF0ZSBpc0NvbmZpZ0xvYWRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9hZENvbmZpZ1Byb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJld2FyZFNjcm9sbFZpZXc6IGNjLlNjcm9sbFZpZXcgPSBudWxsO1xuICAgIHByaXZhdGUgcmV3YXJkSXRlbVRlbXBsYXRlOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJld2FyZExpc3RDb2x1bW5zOiBudW1iZXIgPSAyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmV3YXJkTGlzdFRvcFBhZGRpbmc6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSByZWFkb25seSByZXdhcmRMaXN0Um93R2FwOiBudW1iZXIgPSAyMDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJld2FyZExpc3RDb2x1bW5HYXA6IG51bWJlciA9IDE4O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmV3YXJkTGlzdEJvdHRvbVBhZGRpbmc6IG51bWJlciA9IDI0O1xuICAgIHByaXZhdGUgbGFzdFJlbmRlcmVkT25saW5lTWludXRlczogbnVtYmVyID0gLTE7XG4gICAgcHJpdmF0ZSBpc1N0YXR1c1RpbWVyU2NoZWR1bGVkOiBib29sZWFuID0gZmFsc2U7XG5cclxuICAgIHByaXZhdGUgdG9kYXlEYXRlOiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRhaWx5UmV3YXJkRGF0ZUtleTogc3RyaW5nID0gXCJkYWlseVJld2FyZERhdGVcIjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGFpbHlSZXdhcmRDbGFpbWVkS2V5OiBzdHJpbmcgPSBcImRhaWx5UmV3YXJkQ2xhaW1lZFwiO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBkYWlseU9ubGluZU1pbnV0ZXNLZXk6IHN0cmluZyA9IFwiZGFpbHlPbmxpbmVNaW51dGVzXCI7XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEtleVdpdGhVc2VySWQoYmFzZUtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldFVzZXJJZCgpO1xyXG4gICAgICAgIGlmICh1c2VySWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VLZXl9XyR7dXNlcklkfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBiYXNlS2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q2xhaW1lZFJld2FyZHMoKTogbnVtYmVyW10ge1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5kYWlseVJld2FyZENsYWltZWRLZXkpO1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRTdHIgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oY2xhaW1lZEtleSk7XHJcbiAgICAgICAgaWYgKCFjbGFpbWVkU3RyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjbGFpbWVkU3RyKTtcclxuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocGFyc2VkKSA/IHBhcnNlZCA6IFtdO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BhcnNlIGRhaWx5IGNsYWltZWQgZGF0YSBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2F2ZUNsYWltZWRSZXdhcmRzKGNsYWltZWRMaXN0OiBudW1iZXJbXSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy5kYWlseVJld2FyZENsYWltZWRLZXkpO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShjbGFpbWVkS2V5LCBKU09OLnN0cmluZ2lmeShjbGFpbWVkTGlzdCkpO1xyXG4gICAgICAgIFVzZXJEYXRhU3luY01hbmFnZXIucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkxvYWQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNsb3NlQnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLm5vZGUub24oJ2NsaWNrJywgdGhpcy5vbkNsb3NlQ2xpY2ssIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXHJcbiAgICBwcm90ZWN0ZWQgb25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbG9hZE9ubGluZVJld2FyZENvbmZpZygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAodGhpcy5pc0NvbmZpZ0xvYWRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5sb2FkQ29uZmlnUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2FkQ29uZmlnUHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9hZENvbmZpZ1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKCdjb25maWcvb25saW5lUmV3YXJkJywgY2MuSnNvbkFzc2V0LCAoZXJyOiBFcnJvciwganNvbkFzc2V0OiBjYy5Kc29uQXNzZXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29uZmlncyA9IGpzb25Bc3NldCAmJiBBcnJheS5pc0FycmF5KGpzb25Bc3NldC5qc29uKSA/IGpzb25Bc3NldC5qc29uIDogW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9ubGluZVJld2FyZENvbmZpZ3MgPSByYXdDb25maWdzLm1hcCgoY29uZmlnOiBhbnkpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IE51bWJlcihjb25maWcuaWQpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZTogTnVtYmVyKGNvbmZpZy50aW1lKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGAke2NvbmZpZy5uYW1lIHx8ICcnfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogYCR7Y29uZmlnLmRlc2MgfHwgJyd9YCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBOdW1iZXIoY29uZmlnLmljb24pIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkSWQ6IE51bWJlcihjb25maWcucmV3YXJkSWQpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkTnVtOiBOdW1iZXIoY29uZmlnLnJld2FyZE51bSkgfHwgMFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbmZpZ0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5sb2FkQ29uZmlnUHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXREYWlseVJld2FyZHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUb2RheURhdGUoKTtcclxuICAgICAgICB0aGlzLmNoZWNrTmV3RGF5KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZGFpbHlSZXdhcmRzID0gdGhpcy5vbmxpbmVSZXdhcmRDb25maWdzLm1hcChjb25maWcgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpc0NsYWltZWQgPSB0aGlzLmNoZWNrUmV3YXJkQ2xhaW1lZChjb25maWcuaWQpO1xyXG4gICAgICAgICAgICBjb25zdCBpc0F2YWlsYWJsZSA9ICFpc0NsYWltZWQgJiYgdGhpcy5nZXRPbmxpbmVNaW51dGVzKCkgPj0gY29uZmlnLnRpbWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgLi4uY29uZmlnLFxyXG4gICAgICAgICAgICAgICAgaXNDbGFpbWVkLFxyXG4gICAgICAgICAgICAgICAgaXNBdmFpbGFibGUsXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZE1pbnV0ZXM6IGNvbmZpZy50aW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVUb2RheURhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRoaXMudG9kYXlEYXRlID0gYCR7dG9kYXkuZ2V0RnVsbFllYXIoKX0tJHtTdHJpbmcodG9kYXkuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKHRvZGF5LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tOZXdEYXkoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcmV3YXJkRGF0ZUtleSA9IHRoaXMuZ2V0S2V5V2l0aFVzZXJJZCh0aGlzLmRhaWx5UmV3YXJkRGF0ZUtleSk7XHJcbiAgICAgICAgY29uc3QgdG9kYXlEYXRlID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHJld2FyZERhdGVLZXkpO1xyXG4gICAgICAgIGlmICghdG9kYXlEYXRlIHx8IHRvZGF5RGF0ZSAhPT0gdGhpcy50b2RheURhdGUpIHtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHJld2FyZERhdGVLZXksIHRoaXMudG9kYXlEYXRlKTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlQ2xhaW1lZFJld2FyZHMoW10pO1xyXG4gICAgICAgICAgICBjb25zdCBvbmxpbmVNaW51dGVzS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMuZGFpbHlPbmxpbmVNaW51dGVzS2V5KTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKG9ubGluZU1pbnV0ZXNLZXksIFwiMFwiKTtcclxuICAgICAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0T25saW5lTWludXRlcygpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChPbmxpbmVUaW1lTWFuYWdlci5JbnN0YW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25saW5lVGltZU1hbmFnZXIuSW5zdGFuY2UuZ2V0T25saW5lTWludXRlcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrUmV3YXJkQ2xhaW1lZChyZXdhcmRJZDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgY2xhaW1lZExpc3QgPSB0aGlzLmdldENsYWltZWRSZXdhcmRzKCk7XHJcbiAgICAgICAgcmV0dXJuIGNsYWltZWRMaXN0LmluY2x1ZGVzKHJld2FyZElkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1hcmtSZXdhcmRDbGFpbWVkKHJld2FyZElkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjbGFpbWVkTGlzdCA9IHRoaXMuZ2V0Q2xhaW1lZFJld2FyZHMoKTtcclxuICAgICAgICBpZiAoIWNsYWltZWRMaXN0LmluY2x1ZGVzKHJld2FyZElkKSkge1xyXG4gICAgICAgICAgICBjbGFpbWVkTGlzdC5wdXNoKHJld2FyZElkKTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlQ2xhaW1lZFJld2FyZHMoY2xhaW1lZExpc3QpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdpdmVSZXdhcmQocmV3YXJkOiBPbmxpbmVSZXdhcmRJdGVtKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHJld2FyZC5yZXdhcmROdW0gPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtR2FtZURhdGEuYWRkR29sZChyZXdhcmQucmV3YXJkTnVtKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZURhaWx5UmV3YXJkc1N0YXR1cygpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb25saW5lTWludXRlcyA9IHRoaXMuZ2V0T25saW5lTWludXRlcygpO1xuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRhaWx5UmV3YXJkcy5mb3JFYWNoKHJld2FyZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0QXZhaWxhYmxlID0gIXJld2FyZC5pc0NsYWltZWQgJiYgb25saW5lTWludXRlcyA+PSByZXdhcmQucmVxdWlyZWRNaW51dGVzO1xuICAgICAgICAgICAgaWYgKHJld2FyZC5pc0F2YWlsYWJsZSAhPT0gbmV4dEF2YWlsYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV3YXJkLmlzQXZhaWxhYmxlID0gbmV4dEF2YWlsYWJsZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGNoYW5nZWQgfHwgb25saW5lTWludXRlcyAhPT0gdGhpcy5sYXN0UmVuZGVyZWRPbmxpbmVNaW51dGVzKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RSZW5kZXJlZE9ubGluZU1pbnV0ZXMgPSBvbmxpbmVNaW51dGVzO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUmV3YXJkTGlzdFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cclxuICAgIHByaXZhdGUgdXBkYXRlRGFpbHlSZXdhcmRVSSgpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuZGFpbHlQYW5lbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdEYWlseSBwYW5lbCBub3QgYXNzaWduZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnN1cmVSZXdhcmRMYXlvdXQoJ+WcqOe6v+WlluWKsScpO1xyXG4gICAgICAgIHRoaXMucmVidWlsZFJld2FyZExpc3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZVJld2FyZExheW91dCh0aXRsZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbWFzayA9IHRoaXMuZGFpbHlQYW5lbC5nZXRDaGlsZEJ5TmFtZSgn6YGu572pJyk7XHJcbiAgICAgICAgaWYgKG1hc2spIHtcclxuICAgICAgICAgICAgbWFzay5vcGFjaXR5ID0gMTkwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhbWUgPSB0aGlzLmRhaWx5UGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ2ppZW1pYW5rdWFuZycpO1xyXG4gICAgICAgIGlmIChmcmFtZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFNwcml0ZUZyYW1lKGZyYW1lLCAnMUxvYWQvdGFuY2h1YW5nMycpO1xyXG4gICAgICAgICAgICBmcmFtZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IGNoaWxkLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsb3NlTm9kZSA9IHRoaXMuY2xvc2VCdXR0b24gPyB0aGlzLmNsb3NlQnV0dG9uLm5vZGUgOiB0aGlzLmRhaWx5UGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ2J0bmNsb3NlJyk7XHJcbiAgICAgICAgaWYgKGNsb3NlTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFNwcml0ZUZyYW1lKGNsb3NlTm9kZSwgJzFMb2FkL2d1YW5iaScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGl0bGVOb2RlID0gdGhpcy5nZXRPckNyZWF0ZVBhbmVsVGl0bGUodGl0bGUpO1xyXG4gICAgICAgIHRpdGxlTm9kZS56SW5kZXggPSA1O1xyXG5cclxuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcgPSB0aGlzLmdldE9yQ3JlYXRlU2Nyb2xsVmlldygpO1xyXG4gICAgICAgIHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlID0gdGhpcy5nZXRPckNyZWF0ZVJld2FyZEl0ZW1UZW1wbGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVidWlsZFJld2FyZExpc3QoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnJld2FyZFNjcm9sbFZpZXcgfHwgIXRoaXMucmV3YXJkU2Nyb2xsVmlldy5jb250ZW50IHx8ICF0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQ7XHJcbiAgICAgICAgY29udGVudC5jaGlsZHJlbi5zbGljZSgpLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgIT09IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmVGcm9tUGFyZW50KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCBjb2x1bW5zID0gTWF0aC5tYXgoMSwgdGhpcy5yZXdhcmRMaXN0Q29sdW1ucyB8fCAxKTtcclxuICAgICAgICBjb25zdCByb3dzID0gTWF0aC5jZWlsKHRoaXMuZGFpbHlSZXdhcmRzLmxlbmd0aCAvIGNvbHVtbnMpO1xyXG4gICAgICAgIGNvbnN0IGl0ZW1IZWlnaHQgPSB0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZS5oZWlnaHQgfHwgdGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUuZ2V0Q29udGVudFNpemUoKS5oZWlnaHQ7XHJcbiAgICAgICAgY29uc3Qgdmlld0hlaWdodCA9IHRoaXMucmV3YXJkU2Nyb2xsVmlldy5ub2RlLmhlaWdodCB8fCAodGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQgJiYgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQucGFyZW50ID8gdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQucGFyZW50LmhlaWdodCA6IDApO1xyXG4gICAgICAgIGNvbnRlbnQuaGVpZ2h0ID0gTWF0aC5tYXgoXHJcbiAgICAgICAgICAgIHZpZXdIZWlnaHQsXHJcbiAgICAgICAgICAgIHRoaXMucmV3YXJkTGlzdFRvcFBhZGRpbmcgKyByb3dzICogaXRlbUhlaWdodCArIE1hdGgubWF4KDAsIHJvd3MgLSAxKSAqIHRoaXMucmV3YXJkTGlzdFJvd0dhcCArIHRoaXMucmV3YXJkTGlzdEJvdHRvbVBhZGRpbmdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGFpbHlSZXdhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUpO1xuICAgICAgICAgICAgaXRlbS5uYW1lID0gYFJld2FyZEl0ZW0ke2kgKyAxfWA7XG4gICAgICAgICAgICBpdGVtLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGl0ZW0ucGFyZW50ID0gY29udGVudDtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldFJld2FyZEl0ZW1Qb3NpdGlvbihpKTtcclxuICAgICAgICAgICAgaXRlbS54ID0gcG9zaXRpb24ueDtcclxuICAgICAgICAgICAgaXRlbS55ID0gcG9zaXRpb24ueTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlSZXdhcmRJdGVtKGl0ZW0sIHRoaXMuZGFpbHlSZXdhcmRzW2ldKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FwcGx5IG9ubGluZSByZXdhcmQgaXRlbSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmV3YXJkU2Nyb2xsVmlldy5zY3JvbGxUb1RvcCkge1xuICAgICAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDAuMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZnJlc2hSZXdhcmRMaXN0U3RhdGUoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5yZXdhcmRTY3JvbGxWaWV3IHx8ICF0aGlzLnJld2FyZFNjcm9sbFZpZXcuY29udGVudCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYWlseVJld2FyZFVJKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGFpbHlSZXdhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQuZ2V0Q2hpbGRCeU5hbWUoYFJld2FyZEl0ZW0ke2kgKyAxfWApO1xuICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYWlseVJld2FyZFVJKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hcHBseVJld2FyZEl0ZW0oaXRlbSwgdGhpcy5kYWlseVJld2FyZHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseVJld2FyZEl0ZW0oaXRlbTogY2MuTm9kZSwgcmV3YXJkRGF0YTogT25saW5lUmV3YXJkSXRlbSk6IHZvaWQge1xuICAgICAgICB0aGlzLnNldFNwcml0ZUZyYW1lKGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ0NsYWltZWRCdXR0b24nKSwgJzJtYWluL2Fubml1eWlsaW5ncXUnKTtcblxuICAgICAgICBjb25zdCB0aXRsZU5vZGUgPSBpdGVtLmdldENoaWxkQnlOYW1lKCdUaXRsZScpO1xuICAgICAgICBjb25zdCB0aXRsZUxhYmVsID0gdGl0bGVOb2RlID8gdGl0bGVOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkgOiBudWxsO1xyXG4gICAgICAgIGlmICh0aXRsZUxhYmVsKSB7XHJcbiAgICAgICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gcmV3YXJkRGF0YS5uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYW1vdW50Tm9kZSA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ0Ftb3VudCcpO1xyXG4gICAgICAgIGNvbnN0IGFtb3VudExhYmVsID0gYW1vdW50Tm9kZSA/IGFtb3VudE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSA6IG51bGw7XHJcbiAgICAgICAgaWYgKGFtb3VudExhYmVsKSB7XHJcbiAgICAgICAgICAgIGFtb3VudExhYmVsLnN0cmluZyA9IGAke3Jld2FyZERhdGEucmV3YXJkTnVtfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBidXR0b25Ob2RlID0gaXRlbS5nZXRDaGlsZEJ5TmFtZSgnQ2xhaW1CdXR0b24nKTtcclxuICAgICAgICBjb25zdCBjbGFpbWVkTm9kZSA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ0NsYWltZWRCdXR0b24nKTtcclxuICAgICAgICBpZiAoIWJ1dHRvbk5vZGUgfHwgIWNsYWltZWROb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJ1dHRvbk5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XHJcbiAgICAgICAgYnV0dG9uTm9kZS5vcGFjaXR5ID0gMjU1O1xyXG4gICAgICAgIGNsYWltZWROb2RlLm9wYWNpdHkgPSAyNTU7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGJ1dHRvbk5vZGUuZ2V0Q29tcG9uZW50KGNjLkJ1dHRvbik7XHJcbiAgICAgICAgaWYgKGJ1dHRvbikge1xyXG4gICAgICAgICAgICBidXR0b24uZW5hYmxlQXV0b0dyYXlFZmZlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBidXR0b24uZGlzYWJsZWRDb2xvciA9IGNjLmNvbG9yKDE2MCwgMTYwLCAxNjAsIDI1NSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmV3YXJkRGF0YS5pc0NsYWltZWQpIHtcbiAgICAgICAgICAgIGJ1dHRvbk5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBjbGFpbWVkTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgY2xhaW1lZE5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoYnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmV3YXJkRGF0YS5pc0F2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ByaXRlRnJhbWUoYnV0dG9uTm9kZSwgJzJtYWluL2Fubml1bGluZ3F1Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDbGFpbUJ1dHRvblN0YXRlVGV4dChidXR0b25Ob2RlLCAnJyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMub25DbGFpbUNsaWNrKHJld2FyZERhdGEuaWQpLCB0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTcHJpdGVGcmFtZShidXR0b25Ob2RlLCAnMm1haW4vYW5uaXVrb25nJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nTWludXRlcyA9IE1hdGgubWF4KDEsIHJld2FyZERhdGEucmVxdWlyZWRNaW51dGVzIC0gdGhpcy5nZXRPbmxpbmVNaW51dGVzKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2xhaW1CdXR0b25TdGF0ZVRleHQoYnV0dG9uTm9kZSwgYCR7cmVtYWluaW5nTWludXRlc33liIbpkp/lkI7lj6/pooblj5ZgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0Q2xhaW1CdXR0b25TdGF0ZVRleHQoYnV0dG9uTm9kZTogY2MuTm9kZSwgdGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxldCBsYWJlbE5vZGUgPSBidXR0b25Ob2RlLmdldENoaWxkQnlOYW1lKCdTdGF0ZUxhYmVsJyk7XG4gICAgICAgIGlmICghbGFiZWxOb2RlKSB7XG4gICAgICAgICAgICBsYWJlbE5vZGUgPSBuZXcgY2MuTm9kZSgnU3RhdGVMYWJlbCcpO1xuICAgICAgICAgICAgbGFiZWxOb2RlLnBhcmVudCA9IGJ1dHRvbk5vZGU7XG4gICAgICAgICAgICBsYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zZXRDb250ZW50U2l6ZShidXR0b25Ob2RlLndpZHRoLCBidXR0b25Ob2RlLmhlaWdodCk7XG4gICAgICAgICAgICBsYWJlbE5vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5jb2xvcig2NCwgNzQsIDk2KTtcblxuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tMYWJlbCA9IGxhYmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgZmFsbGJhY2tMYWJlbC5mb250U2l6ZSA9IDIyO1xuICAgICAgICAgICAgZmFsbGJhY2tMYWJlbC5saW5lSGVpZ2h0ID0gMjg7XG4gICAgICAgICAgICBmYWxsYmFja0xhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgICAgICBmYWxsYmFja0xhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhYmVsTm9kZS5hY3RpdmUgPSB0ZXh0Lmxlbmd0aCA+IDA7XG4gICAgICAgIGxhYmVsTm9kZS56SW5kZXggPSAxMDtcblxuICAgICAgICBjb25zdCBsYWJlbCA9IGxhYmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSB0ZXh0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0T3JDcmVhdGVTY3JvbGxWaWV3KCk6IGNjLlNjcm9sbFZpZXcge1xuICAgICAgICBsZXQgc2Nyb2xsTm9kZSA9IHRoaXMuZGFpbHlQYW5lbC5nZXRDaGlsZEJ5TmFtZSgnUmV3YXJkU2Nyb2xsVmlldycpO1xyXG4gICAgICAgIGlmICghc2Nyb2xsTm9kZSkge1xyXG4gICAgICAgICAgICBzY3JvbGxOb2RlID0gbmV3IGNjLk5vZGUoJ1Jld2FyZFNjcm9sbFZpZXcnKTtcclxuICAgICAgICAgICAgc2Nyb2xsTm9kZS5wYXJlbnQgPSB0aGlzLmRhaWx5UGFuZWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjcm9sbE5vZGUuekluZGV4ID0gNDtcclxuXHJcbiAgICAgICAgbGV0IHZpZXcgPSBzY3JvbGxOb2RlLmdldENoaWxkQnlOYW1lKCd2aWV3Jyk7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgY2MuTm9kZSgndmlldycpO1xyXG4gICAgICAgICAgICB2aWV3LnBhcmVudCA9IHNjcm9sbE5vZGU7XHJcbiAgICAgICAgICAgIHZpZXcuYWRkQ29tcG9uZW50KGNjLk1hc2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSB2aWV3LmdldENoaWxkQnlOYW1lKCdjb250ZW50Jyk7XHJcbiAgICAgICAgaWYgKCFjb250ZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSBuZXcgY2MuTm9kZSgnY29udGVudCcpO1xyXG4gICAgICAgICAgICBjb250ZW50LnBhcmVudCA9IHZpZXc7XHJcbiAgICAgICAgICAgIGNvbnRlbnQuc2V0Q29udGVudFNpemUodmlldy53aWR0aCwgdmlldy5oZWlnaHQpO1xyXG4gICAgICAgICAgICBjb250ZW50LnNldFBvc2l0aW9uKDAsIDApO1xyXG4gICAgICAgICAgICBjb250ZW50LmFuY2hvclggPSAwLjU7XHJcbiAgICAgICAgICAgIGNvbnRlbnQuYW5jaG9yWSA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2Nyb2xsVmlldyA9IHNjcm9sbE5vZGUuZ2V0Q29tcG9uZW50KGNjLlNjcm9sbFZpZXcpO1xyXG4gICAgICAgIGlmICghc2Nyb2xsVmlldykge1xyXG4gICAgICAgICAgICBzY3JvbGxWaWV3ID0gc2Nyb2xsTm9kZS5hZGRDb21wb25lbnQoY2MuU2Nyb2xsVmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjcm9sbFZpZXcuY29udGVudCA9IGNvbnRlbnQ7XHJcbiAgICAgICAgc2Nyb2xsVmlldy5ob3Jpem9udGFsID0gZmFsc2U7XHJcbiAgICAgICAgc2Nyb2xsVmlldy52ZXJ0aWNhbCA9IHRydWU7XHJcbiAgICAgICAgc2Nyb2xsVmlldy5pbmVydGlhID0gdHJ1ZTtcclxuICAgICAgICBzY3JvbGxWaWV3LmJyYWtlID0gMC43NTtcclxuICAgICAgICByZXR1cm4gc2Nyb2xsVmlldztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE9yQ3JlYXRlUmV3YXJkSXRlbVRlbXBsYXRlKCk6IGNjLk5vZGUge1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnJld2FyZFNjcm9sbFZpZXcgJiYgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQ7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gY29udGVudCA/IGNvbnRlbnQuZ2V0Q2hpbGRCeU5hbWUoJ1Jld2FyZEl0ZW1UZW1wbGF0ZScpIDogbnVsbDtcclxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5kYWlseVBhbmVsLmdldENoaWxkQnlOYW1lKCdSZXdhcmRJdGVtVGVtcGxhdGUnKTtcclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlICYmIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlLnBhcmVudCA9IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0ZW1wbGF0ZSA9IG5ldyBjYy5Ob2RlKCdSZXdhcmRJdGVtVGVtcGxhdGUnKTtcclxuICAgICAgICB0ZW1wbGF0ZS5wYXJlbnQgPSBjb250ZW50IHx8IHRoaXMuZGFpbHlQYW5lbDtcclxuICAgICAgICB0ZW1wbGF0ZS5zZXRDb250ZW50U2l6ZSgyNTAsIDI2MCk7XHJcbiAgICAgICAgdGVtcGxhdGUuc2V0UG9zaXRpb24oMCwgMCk7XHJcbiAgICAgICAgdGVtcGxhdGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgY2FyZCA9IHRoaXMuY3JlYXRlU3ByaXRlTm9kZSgnQ2FyZCcsIDE3NSwgMjMyLCAwLCA4LCAnMm1haW4vZGlrdWFuZzcnKTtcclxuICAgICAgICBjYXJkLnBhcmVudCA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZ2V0T3JDcmVhdGVMYWJlbE5vZGUodGVtcGxhdGUsICdUaXRsZScsICflkajkuIAnLCA0MCwgY2MuY29sb3IoMzcsIDEyOCwgMTIpLCAwLCA4MCwgMTAwLCA1NCk7XG4gICAgICAgIGxldCB0aXRsZU91dGxpbmUgPSB0aXRsZS5nZXRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcclxuICAgICAgICBpZiAoIXRpdGxlT3V0bGluZSkge1xyXG4gICAgICAgICAgICB0aXRsZU91dGxpbmUgPSB0aXRsZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcclxuICAgICAgICB9XG4gICAgICAgIHRpdGxlT3V0bGluZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGl0bGVPdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIHRpdGxlT3V0bGluZS53aWR0aCA9IDM7XG5cclxuICAgICAgICBjb25zdCBjb2luID0gdGhpcy5jcmVhdGVTcHJpdGVOb2RlKCdDb2luJywgNTYsIDU2LCAtMzUsIDEyLCAnMm1haW4vamluYmknKTtcclxuICAgICAgICBjb2luLnBhcmVudCA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICBjb25zdCBhbW91bnQgPSB0aGlzLmdldE9yQ3JlYXRlTGFiZWxOb2RlKHRlbXBsYXRlLCAnQW1vdW50JywgJzEwMCcsIDI4LCBjYy5jb2xvcig0NSwgMzUsIDEyNiksIDMyLCAxNCwgNzIsIDM4KTtcclxuICAgICAgICBjb25zdCBhbW91bnRPdXRsaW5lID0gYW1vdW50LmdldENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpO1xyXG4gICAgICAgIGlmIChhbW91bnRPdXRsaW5lKSB7XHJcbiAgICAgICAgICAgIGFtb3VudE91dGxpbmUuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhaW0gPSB0aGlzLmNyZWF0ZVNwcml0ZU5vZGUoJ0NsYWltQnV0dG9uJywgMjQwLCA4OCwgMCwgLTgyLCAnMm1haW4vYW5uaXVsaW5ncXUnKTtcclxuICAgICAgICBjbGFpbS5wYXJlbnQgPSB0ZW1wbGF0ZTtcclxuICAgICAgICBjbGFpbS5hZGRDb21wb25lbnQoY2MuQnV0dG9uKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2xhaW1lZCA9IHRoaXMuY3JlYXRlU3ByaXRlTm9kZSgnQ2xhaW1lZEJ1dHRvbicsIDI0MCwgODgsIDAsIC04MiwgJzJtYWluL2Fubml1eWlsaW5ncXUnKTtcclxuICAgICAgICBjbGFpbWVkLnBhcmVudCA9IHRlbXBsYXRlO1xyXG5cclxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRPckNyZWF0ZVBhbmVsVGl0bGUodGl0bGU6IHN0cmluZyk6IGNjLk5vZGUge1xyXG4gICAgICAgIGNvbnN0IHRpdGxlTm9kZSA9IHRoaXMuZGFpbHlQYW5lbC5nZXRDaGlsZEJ5TmFtZSgnUmV3YXJkVGl0bGUnKTtcclxuICAgICAgICBpZiAoIXRpdGxlTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPckNyZWF0ZUxhYmVsTm9kZSh0aGlzLmRhaWx5UGFuZWwsICdSZXdhcmRUaXRsZScsIHRpdGxlLCA0MiwgY2MuY29sb3IoMjU1LCAyNTUsIDI1NSksIDAsIDM1MiwgMjYwLCA1Nik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsYWJlbCA9IHRpdGxlTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xyXG4gICAgICAgIGlmIChsYWJlbCkge1xyXG4gICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSB0aXRsZTtcclxuICAgICAgICAgICAgbGFiZWwuZm9udFNpemUgPSA0MjtcclxuICAgICAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcclxuICAgICAgICAgICAgbGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcclxuICAgICAgICByZXR1cm4gdGl0bGVOb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmV3YXJkSXRlbVBvc2l0aW9uKGluZGV4OiBudW1iZXIpOiBjYy5WZWMyIHtcclxuICAgICAgICBjb25zdCBjb2x1bW5zID0gTWF0aC5tYXgoMSwgdGhpcy5yZXdhcmRMaXN0Q29sdW1ucyB8fCAxKTtcclxuICAgICAgICBjb25zdCBjb2wgPSBpbmRleCAlIGNvbHVtbnM7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGNvbHVtbnMpO1xyXG4gICAgICAgIGNvbnN0IGl0ZW1XaWR0aCA9IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLndpZHRoIHx8IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLmdldENvbnRlbnRTaXplKCkud2lkdGg7XHJcbiAgICAgICAgY29uc3QgaXRlbUhlaWdodCA9IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLmhlaWdodCB8fCB0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZS5nZXRDb250ZW50U2l6ZSgpLmhlaWdodDtcclxuICAgICAgICBjb25zdCB0b3RhbFdpZHRoID0gY29sdW1ucyAqIGl0ZW1XaWR0aCArIE1hdGgubWF4KDAsIGNvbHVtbnMgLSAxKSAqIHRoaXMucmV3YXJkTGlzdENvbHVtbkdhcDtcclxuICAgICAgICBjb25zdCBzdGFydFggPSAtdG90YWxXaWR0aCAvIDIgKyBpdGVtV2lkdGggLyAyO1xyXG4gICAgICAgIGNvbnN0IHggPSBzdGFydFggKyBjb2wgKiAoaXRlbVdpZHRoICsgdGhpcy5yZXdhcmRMaXN0Q29sdW1uR2FwKTtcclxuICAgICAgICBjb25zdCB5ID0gLXRoaXMucmV3YXJkTGlzdFRvcFBhZGRpbmcgLSBpdGVtSGVpZ2h0IC8gMiAtIHJvdyAqIChpdGVtSGVpZ2h0ICsgdGhpcy5yZXdhcmRMaXN0Um93R2FwKTtcclxuICAgICAgICByZXR1cm4gY2MudjIoeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVTcHJpdGVOb2RlKG5hbWU6IHN0cmluZywgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBzcHJpdGVQYXRoOiBzdHJpbmcpOiBjYy5Ob2RlIHtcclxuICAgICAgICBjb25zdCBub2RlID0gbmV3IGNjLk5vZGUobmFtZSk7XHJcbiAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICBub2RlLnNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcclxuICAgICAgICB0aGlzLnNldFNwcml0ZUZyYW1lKG5vZGUsIHNwcml0ZVBhdGgpO1xyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0T3JDcmVhdGVMYWJlbE5vZGUocGFyZW50OiBjYy5Ob2RlLCBuYW1lOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgZm9udFNpemU6IG51bWJlciwgY29sb3I6IGNjLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBjYy5Ob2RlIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHBhcmVudC5nZXRDaGlsZEJ5TmFtZShuYW1lKTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgbm9kZSA9IG5ldyBjYy5Ob2RlKG5hbWUpO1xyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICAgICAgbm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlLnNldENvbnRlbnRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIG5vZGUuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgbm9kZS5jb2xvciA9IGNvbG9yO1xyXG5cclxuICAgICAgICBjb25zdCBsYWJlbCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcclxuICAgICAgICBsYWJlbC5zdHJpbmcgPSB0ZXh0O1xyXG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xyXG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFNwcml0ZUZyYW1lKG5vZGU6IGNjLk5vZGUsIHNwcml0ZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzcHJpdGUgPSBub2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBpZiAoIXNwcml0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICgobm9kZSBhcyBhbnkpLl9fZGFpbHlSZXdhcmRTcHJpdGVQYXRoID09PSBzcHJpdGVQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgKG5vZGUgYXMgYW55KS5fX2RhaWx5UmV3YXJkU3ByaXRlUGF0aCA9IHNwcml0ZVBhdGg7XG5cbiAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoc3ByaXRlUGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnI6IEVycm9yLCBzcHJpdGVGcmFtZTogY2MuU3ByaXRlRnJhbWUpID0+IHtcbiAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lICYmIG5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ2xhaW1DbGljayhyZXdhcmRJZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcmV3YXJkID0gdGhpcy5kYWlseVJld2FyZHMuZmluZChyID0+IHIuaWQgPT09IHJld2FyZElkKTtcclxuICAgICAgICBpZiAoIXJld2FyZCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghcmV3YXJkLmlzQXZhaWxhYmxlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHJld2FyZC5pc0NsYWltZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5naXZlUmV3YXJkKHJld2FyZCk7XG4gICAgICAgIHJld2FyZC5pc0NsYWltZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm1hcmtSZXdhcmRDbGFpbWVkKHJld2FyZElkKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUmV3YXJkTGlzdFN0YXRlKCk7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGDojrflvpcke3Jld2FyZC5yZXdhcmROdW196ZK755+z44CCYCk7XG4gICAgfVxuXHJcbiAgICBwcml2YXRlIG9uQ2xvc2VDbGljaygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgVGlwc01hbmFnZXIuc2hvdyhtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5sb2FkT25saW5lUmV3YXJkQ29uZmlnKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluaXREYWlseVJld2FyZHMoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGFpbHlSZXdhcmRVSSgpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNTdGF0dXNUaW1lclNjaGVkdWxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTdGF0dXNUaW1lclNjaGVkdWxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGFpbHlSZXdhcmRzU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUmVsb2FkIG9ubGluZSByZXdhcmQgY29uZmlnIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXHJcbiAgICBwdWJsaWMgaGlkZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRPbmxpbmVNaW51dGVzKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25saW5lTWludXRlcygpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==