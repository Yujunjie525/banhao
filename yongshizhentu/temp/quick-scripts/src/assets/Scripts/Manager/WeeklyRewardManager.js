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
        _this.rewardScrollView = null;
        _this.rewardItemTemplate = null;
        _this.rewardListColumns = 2;
        _this.rewardListTopPadding = 0;
        _this.rewardListRowGap = 20;
        _this.rewardListColumnGap = 18;
        _this.rewardListBottomPadding = 24;
        _this.weekStartDate = '';
        _this.weeklyRewardWeekStartKey = "weeklyRewardWeekStart";
        _this.weeklyRewardClaimedKey = "weeklyRewardClaimed";
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
        this.ensureRewardLayout('每周奖励');
        this.rebuildRewardList();
    };
    WeeklyRewardManager.prototype.ensureRewardLayout = function (title) {
        var mask = this.weekPanel.getChildByName('遮罩');
        if (mask) {
            mask.opacity = 190;
        }
        var frame = this.weekPanel.getChildByName('jiemiankuang');
        if (frame) {
            this.setSpriteFrame(frame, '1Load/tanchuang3');
            frame.children.forEach(function (child) { return child.active = false; });
        }
        var closeNode = this.closeButton ? this.closeButton.node : this.weekPanel.getChildByName('btnclose');
        if (closeNode) {
            this.setSpriteFrame(closeNode, '1Load/guanbi');
        }
        var titleNode = this.getOrCreatePanelTitle(title);
        titleNode.zIndex = 5;
        this.rewardScrollView = this.getOrCreateScrollView();
        this.rewardItemTemplate = this.getOrCreateRewardItemTemplate();
    };
    WeeklyRewardManager.prototype.rebuildRewardList = function () {
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
        var rows = Math.ceil(this.weeklyRewards.length / columns);
        var itemHeight = this.rewardItemTemplate.height || this.rewardItemTemplate.getContentSize().height;
        var viewHeight = this.rewardScrollView.node.height || (this.rewardScrollView.content && this.rewardScrollView.content.parent ? this.rewardScrollView.content.parent.height : 0);
        content.height = Math.max(viewHeight, this.rewardListTopPadding + rows * itemHeight + Math.max(0, rows - 1) * this.rewardListRowGap + this.rewardListBottomPadding);
        for (var i = 0; i < this.weeklyRewards.length; i++) {
            var item = cc.instantiate(this.rewardItemTemplate);
            item.name = "RewardItem" + (i + 1);
            item.active = true;
            item.parent = content;
            var position = this.getRewardItemPosition(i);
            item.x = position.x;
            item.y = position.y;
            try {
                this.applyRewardItem(item, this.weeklyRewards[i]);
            }
            catch (error) {
                console.error('Apply weekly reward item failed:', error);
            }
        }
        if (this.rewardScrollView.scrollToTop) {
            this.rewardScrollView.scrollToTop(0.1);
        }
    };
    WeeklyRewardManager.prototype.applyRewardItem = function (item, rewardData) {
        var _this = this;
        this.setSpriteFrame(item.getChildByName('ClaimButton'), '2main/anniulingqu');
        this.setSpriteFrame(item.getChildByName('ClaimedButton'), '2main/anniuyilingqu');
        var titleNode = item.getChildByName('Title');
        var titleLabel = titleNode ? titleNode.getComponent(cc.Label) : null;
        if (titleLabel) {
            titleLabel.string = this.getWeekDayName(rewardData.id);
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
                button.interactable = rewardData.isAvailable;
            }
            if (rewardData.isAvailable) {
                buttonNode.on(cc.Node.EventType.TOUCH_END, function () { return _this.onClaimClick(rewardData.id); }, this);
            }
        }
    };
    WeeklyRewardManager.prototype.getWeekDayName = function (id) {
        var names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return names[Math.max(0, Math.min(names.length - 1, id - 1))] || '周一';
    };
    WeeklyRewardManager.prototype.getOrCreateScrollView = function () {
        var scrollNode = this.weekPanel.getChildByName('RewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('RewardScrollView');
            scrollNode.parent = this.weekPanel;
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
    WeeklyRewardManager.prototype.getOrCreateRewardItemTemplate = function () {
        var content = this.rewardScrollView && this.rewardScrollView.content;
        var template = content ? content.getChildByName('RewardItemTemplate') : null;
        if (!template) {
            template = this.weekPanel.getChildByName('RewardItemTemplate');
            if (template && content) {
                template.parent = content;
            }
        }
        if (template) {
            template.active = false;
            return template;
        }
        template = new cc.Node('RewardItemTemplate');
        template.parent = content || this.weekPanel;
        template.setContentSize(250, 260);
        template.setPosition(0, 0);
        template.active = false;
        var card = this.createSpriteNode('Card', 175, 232, 0, 8, '2main/dikuang6');
        card.parent = template;
        var title = this.getOrCreateLabelNode(template, 'Title', '周一', 40, cc.color(255, 255, 255), 0, 80, 100, 54);
        var titleOutline = title.getComponent(cc.LabelOutline);
        if (!titleOutline) {
            titleOutline = title.addComponent(cc.LabelOutline);
        }
        titleOutline.enabled = true;
        titleOutline.color = cc.color(31, 120, 185);
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
    WeeklyRewardManager.prototype.getOrCreatePanelTitle = function (title) {
        var titleNode = this.weekPanel.getChildByName('RewardTitle');
        if (!titleNode) {
            return this.getOrCreateLabelNode(this.weekPanel, 'RewardTitle', title, 42, cc.color(255, 255, 255), 0, 352, 260, 56);
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
    WeeklyRewardManager.prototype.getRewardItemPosition = function (index) {
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
    WeeklyRewardManager.prototype.createSpriteNode = function (name, width, height, x, y, spritePath) {
        var node = new cc.Node(name);
        node.setContentSize(width, height);
        node.setPosition(x, y);
        var sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.setSpriteFrame(node, spritePath);
        return node;
    };
    WeeklyRewardManager.prototype.getOrCreateLabelNode = function (parent, name, text, fontSize, color, x, y, width, height) {
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
    WeeklyRewardManager.prototype.setSpriteFrame = function (node, spritePath) {
        if (!node) {
            return;
        }
        var sprite = node.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        cc.loader.loadRes(spritePath, cc.SpriteFrame, function (err, spriteFrame) {
            if (!err && spriteFrame && node.isValid) {
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
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
        var _this = this;
        this.loadWeeklyRewardConfig().then(function () {
            _this.initWeeklyRewards();
            _this.updateWeeklyRewardUI();
            _this.node.active = true;
        }).catch(function (error) {
            console.error('Reload weekly reward config failed:', error);
            _this.node.active = true;
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