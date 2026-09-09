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