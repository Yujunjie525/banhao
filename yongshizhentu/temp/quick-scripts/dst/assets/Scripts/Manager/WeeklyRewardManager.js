
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/WeeklyRewardManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcV2Vla2x5UmV3YXJkTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFDMUMsbURBQThDO0FBQzlDLDZDQUF5QztBQUN6Qyw2REFBd0Q7QUFtQnhEO0lBQWlELHVDQUFZO0lBQTdEO1FBQUEscUVBcWVDO1FBbmVHLGlCQUFXLEdBQWMsSUFBSSxDQUFDO1FBRzlCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFFbEIsbUJBQWEsR0FBdUIsRUFBRSxDQUFDO1FBQ3ZDLHlCQUFtQixHQUF5QixFQUFFLENBQUM7UUFDL0Msb0JBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIsdUJBQWlCLEdBQXlCLElBQUksQ0FBQztRQUMvQyxzQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO1FBQ3ZDLHdCQUFrQixHQUFZLElBQUksQ0FBQztRQUMxQix1QkFBaUIsR0FBVyxDQUFDLENBQUM7UUFDOUIsMEJBQW9CLEdBQVcsQ0FBQyxDQUFDO1FBQ2pDLHNCQUFnQixHQUFXLEVBQUUsQ0FBQztRQUM5Qix5QkFBbUIsR0FBVyxFQUFFLENBQUM7UUFDakMsNkJBQXVCLEdBQVcsRUFBRSxDQUFDO1FBRTlDLG1CQUFhLEdBQVcsRUFBRSxDQUFDO1FBRWxCLDhCQUF3QixHQUFXLHVCQUF1QixDQUFDO1FBQzNELDRCQUFzQixHQUFXLHFCQUFxQixDQUFDOztJQStjNUUsQ0FBQztJQTdjVyx1Q0FBUyxHQUFqQjtRQUNJLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTyw4Q0FBZ0IsR0FBeEIsVUFBeUIsT0FBZTtRQUNwQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEMsSUFBSSxNQUFNLEVBQUU7WUFDUixPQUFVLE9BQU8sU0FBSSxNQUFRLENBQUM7U0FDakM7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU8sK0NBQWlCLEdBQXpCO1FBQ0ksSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RFLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUNELElBQUk7WUFDQSxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDOUM7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUQsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFTyxnREFBa0IsR0FBMUIsVUFBMkIsV0FBcUI7UUFDNUMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLDZCQUFtQixDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFUyxvQ0FBTSxHQUFoQjtRQUNJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDOUQ7SUFDTCxDQUFDO0lBRU8sb0RBQXNCLEdBQTlCO1FBQUEsaUJBK0JDO1FBOUJHLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtRQUVELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ2pDO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDakQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFDLEdBQVUsRUFBRSxTQUF1QjtnQkFDckYsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNaLE9BQU87aUJBQ1Y7Z0JBRUQsSUFBTSxVQUFVLEdBQUcsU0FBUyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BGLEtBQUksQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBVyxJQUFLLE9BQUEsQ0FBQztvQkFDeEQsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvQkFDMUIsSUFBSSxFQUFFLE1BQUcsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUU7b0JBQzVCLElBQUksRUFBRSxNQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFFO29CQUM1QixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUM5QixRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUN0QyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2lCQUMzQyxDQUFDLEVBUHlELENBT3pELENBQUMsQ0FBQztnQkFDSixLQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDM0IsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDbEMsQ0FBQztJQUVPLCtDQUFpQixHQUF6QjtRQUFBLGlCQXFCQztRQXBCRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN6QixJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU07WUFDcEQsSUFBTSxTQUFTLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQztZQUM1QyxJQUFNLFFBQVEsR0FBRyxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUNyRCxJQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFFOUQsNkJBQ08sTUFBTSxLQUNULFNBQVMsV0FBQTtnQkFDVCxXQUFXLGFBQUE7Z0JBQ1gsUUFBUSxVQUFBO2dCQUNSLGtCQUFrQixvQkFBQSxJQUNwQjtRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGlEQUFtQixHQUEzQjtRQUNJLElBQU0sS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDekIsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxhQUFhLEdBQU0sU0FBUyxDQUFDLFdBQVcsRUFBRSxTQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUcsQ0FBQztJQUMzSixDQUFDO0lBRU8sMENBQVksR0FBcEI7UUFDSSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDMUUsSUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLGdCQUFnQixJQUFJLGdCQUFnQixLQUFLLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDOUQsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLDZCQUFtQixDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVPLGdEQUFrQixHQUExQixVQUEyQixRQUFnQjtRQUN2QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QyxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVPLCtDQUFpQixHQUF6QixVQUEwQixRQUFnQjtRQUN0QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNqQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUFFTyx3Q0FBVSxHQUFsQixVQUFtQixNQUF3QjtRQUN2QyxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLE9BQU87U0FDVjtRQUVELGtCQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU8sa0RBQW9CLEdBQTVCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3pDLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRU8sZ0RBQWtCLEdBQTFCLFVBQTJCLEtBQWE7UUFDcEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztTQUN0QjtRQUVELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVELElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMvQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFwQixDQUFvQixDQUFDLENBQUM7U0FDekQ7UUFFRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkcsSUFBSSxTQUFTLEVBQUU7WUFDWCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUNsRDtRQUVELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRCxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVyQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDckQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ25FLENBQUM7SUFFTywrQ0FBaUIsR0FBekI7UUFBQSxpQkF5Q0M7UUF4Q0csSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDdEYsT0FBTztTQUNWO1FBRUQsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUM5QyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDbEMsSUFBSSxLQUFLLEtBQUssS0FBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUNuQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNuQjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFdkMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDNUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ3JHLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsTCxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQ3JCLFVBQVUsRUFDVixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FDL0gsQ0FBQztRQUVGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoRCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1lBQ3RCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUk7Z0JBQ0EsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM1RDtTQUNKO1FBRUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFO1lBQ25DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUM7SUFDTCxDQUFDO0lBRU8sNkNBQWUsR0FBdkIsVUFBd0IsSUFBYSxFQUFFLFVBQTRCO1FBQW5FLGlCQTZDQztRQTVDRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUVqRixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN2RSxJQUFJLFVBQVUsRUFBRTtZQUNaLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRSxJQUFJLFdBQVcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBRyxVQUFVLENBQUMsU0FBVyxDQUFDO1NBQ2xEO1FBRUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxVQUFVLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUN6QixXQUFXLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUUxQixJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7WUFDbkMsTUFBTSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQ3RCLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzFCLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQzdCO2FBQU07WUFDSCxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUN6QixXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUMzQixJQUFJLE1BQU0sRUFBRTtnQkFDUixNQUFNLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7YUFDaEQ7WUFDRCxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3hCLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBaEMsQ0FBZ0MsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM1RjtTQUNKO0lBQ0wsQ0FBQztJQUVPLDRDQUFjLEdBQXRCLFVBQXVCLEVBQVU7UUFDN0IsSUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0lBQzFFLENBQUM7SUFFTyxtREFBcUIsR0FBN0I7UUFDSSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDN0MsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQ3RDO1FBQ0QsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFdEIsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztZQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5QjtRQUVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDdEIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRCxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUN0QixPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztTQUN2QjtRQUVELElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixVQUFVLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkQ7UUFDRCxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM3QixVQUFVLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUM5QixVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUMzQixVQUFVLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUMxQixVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN4QixPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRU8sMkRBQTZCLEdBQXJDO1FBQ0ksSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7UUFDdkUsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM3RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDL0QsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFO2dCQUNyQixRQUFRLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQzthQUM3QjtTQUNKO1FBQ0QsSUFBSSxRQUFRLEVBQUU7WUFDVixRQUFRLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUN4QixPQUFPLFFBQVEsQ0FBQztTQUNuQjtRQUVELFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM3QyxRQUFRLENBQUMsTUFBTSxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzVDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFFdkIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUcsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN0RDtRQUNELFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQzVCLFlBQVksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLFlBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFFdkIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0csSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0QsSUFBSSxhQUFhLEVBQUU7WUFDZixhQUFhLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztTQUNqQztRQUVELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUN6RixLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztRQUN4QixLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU5QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDL0YsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFFMUIsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVPLG1EQUFxQixHQUE3QixVQUE4QixLQUFhO1FBQ3ZDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN4SDtRQUVELElBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLElBQUksS0FBSyxFQUFFO1lBQ1AsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDckIsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDcEIsS0FBSyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7WUFDeEQsS0FBSyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7U0FDdkQ7UUFDRCxTQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxQyxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRU8sbURBQXFCLEdBQTdCLFVBQThCLEtBQWE7UUFDdkMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUM7UUFDNUIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2xHLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNyRyxJQUFNLFVBQVUsR0FBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDN0YsSUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDL0MsSUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNoRSxJQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFTyw4Q0FBZ0IsR0FBeEIsVUFBeUIsSUFBWSxFQUFFLEtBQWEsRUFBRSxNQUFjLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxVQUFrQjtRQUMxRyxJQUFNLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLGtEQUFvQixHQUE1QixVQUE2QixNQUFlLEVBQUUsSUFBWSxFQUFFLElBQVksRUFBRSxRQUFnQixFQUFFLEtBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQzVKLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7UUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNwQixLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixLQUFLLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUMxQixLQUFLLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztRQUN4RCxLQUFLLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUNwRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sNENBQWMsR0FBdEIsVUFBdUIsSUFBYSxFQUFFLFVBQWtCO1FBQ3BELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPO1NBQ1Y7UUFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsT0FBTztTQUNWO1FBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxHQUFVLEVBQUUsV0FBMkI7WUFDbEYsSUFBSSxDQUFDLEdBQUcsSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDckMsTUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQy9DO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sMENBQVksR0FBcEIsVUFBcUIsUUFBZ0I7UUFDakMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsRUFBRSxLQUFLLFFBQVEsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7WUFBRSxPQUFPO1FBQ2hDLElBQUksTUFBTSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRTdCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQUssTUFBTSxDQUFDLFNBQVMsdUJBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTywwQ0FBWSxHQUFwQjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBRU8sdUNBQVMsR0FBakIsVUFBa0IsT0FBZTtRQUM3QixxQkFBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0sa0NBQUksR0FBWDtRQUFBLGlCQVNDO1FBUkcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsSUFBSSxDQUFDO1lBQy9CLEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3pCLEtBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzVCLEtBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1RCxLQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sa0NBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBbGVEO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7NERBQ1U7SUFHOUI7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzswREFDUTtJQUxULG1CQUFtQjtRQUR2QyxPQUFPO09BQ2EsbUJBQW1CLENBcWV2QztJQUFELDBCQUFDO0NBcmVELEFBcWVDLENBcmVnRCxFQUFFLENBQUMsU0FBUyxHQXFlNUQ7a0JBcmVvQixtQkFBbUIiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcclxuaW1wb3J0IFRpcHNNYW5hZ2VyIGZyb20gJy4uL0xvYWQvVGlwc01hbmFnZXInO1xyXG5pbXBvcnQgbUdhbWVEYXRhIGZyb20gJy4uL0xvYWQvR2FtZURhdGEnO1xyXG5pbXBvcnQgVXNlckRhdGFTeW5jTWFuYWdlciBmcm9tICcuL1VzZXJEYXRhU3luY01hbmFnZXInO1xyXG5cclxuaW50ZXJmYWNlIFdlZWtseVJld2FyZENvbmZpZyB7XHJcbiAgICBpZDogbnVtYmVyO1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZGVzYzogc3RyaW5nO1xyXG4gICAgaWNvbjogbnVtYmVyO1xyXG4gICAgcmV3YXJkSWQ6IG51bWJlcjtcclxuICAgIHJld2FyZE51bTogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgV2Vla2x5UmV3YXJkSXRlbSBleHRlbmRzIFdlZWtseVJld2FyZENvbmZpZyB7XHJcbiAgICBpc0NsYWltZWQ6IGJvb2xlYW47XHJcbiAgICBpc0F2YWlsYWJsZTogYm9vbGVhbjtcclxuICAgIGlzTWlzc2VkOiBib29sZWFuO1xyXG4gICAgZGF5c1VudGlsQXZhaWxhYmxlOiBudW1iZXI7XHJcbn1cclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlZWtseVJld2FyZE1hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG4gICAgQHByb3BlcnR5KGNjLkJ1dHRvbilcclxuICAgIGNsb3NlQnV0dG9uOiBjYy5CdXR0b24gPSBudWxsO1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHdlZWtQYW5lbDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBwcml2YXRlIHdlZWtseVJld2FyZHM6IFdlZWtseVJld2FyZEl0ZW1bXSA9IFtdO1xuICAgIHByaXZhdGUgd2Vla2x5UmV3YXJkQ29uZmlnczogV2Vla2x5UmV3YXJkQ29uZmlnW10gPSBbXTtcbiAgICBwcml2YXRlIGlzQ29uZmlnTG9hZGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBsb2FkQ29uZmlnUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmV3YXJkU2Nyb2xsVmlldzogY2MuU2Nyb2xsVmlldyA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXdhcmRJdGVtVGVtcGxhdGU6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmV3YXJkTGlzdENvbHVtbnM6IG51bWJlciA9IDI7XG4gICAgcHJpdmF0ZSByZWFkb25seSByZXdhcmRMaXN0VG9wUGFkZGluZzogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJld2FyZExpc3RSb3dHYXA6IG51bWJlciA9IDIwO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmV3YXJkTGlzdENvbHVtbkdhcDogbnVtYmVyID0gMTg7XG4gICAgcHJpdmF0ZSByZWFkb25seSByZXdhcmRMaXN0Qm90dG9tUGFkZGluZzogbnVtYmVyID0gMjQ7XG5cclxuICAgIHByaXZhdGUgd2Vla1N0YXJ0RGF0ZTogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSB3ZWVrbHlSZXdhcmRXZWVrU3RhcnRLZXk6IHN0cmluZyA9IFwid2Vla2x5UmV3YXJkV2Vla1N0YXJ0XCI7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdlZWtseVJld2FyZENsYWltZWRLZXk6IHN0cmluZyA9IFwid2Vla2x5UmV3YXJkQ2xhaW1lZFwiO1xyXG5cclxuICAgIHByaXZhdGUgZ2V0VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1NMU19VU0VSX0lEJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRLZXlXaXRoVXNlcklkKGJhc2VLZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcclxuICAgICAgICBpZiAodXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlS2V5fV8ke3VzZXJJZH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZUtleTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENsYWltZWRSZXdhcmRzKCk6IG51bWJlcltdIHtcclxuICAgICAgICBjb25zdCBjbGFpbWVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMud2Vla2x5UmV3YXJkQ2xhaW1lZEtleSk7XHJcbiAgICAgICAgY29uc3QgY2xhaW1lZFN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShjbGFpbWVkS2V5KTtcclxuICAgICAgICBpZiAoIWNsYWltZWRTdHIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNsYWltZWRTdHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShwYXJzZWQpID8gcGFyc2VkIDogW107XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUGFyc2Ugd2Vla2x5IGNsYWltZWQgZGF0YSBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2F2ZUNsYWltZWRSZXdhcmRzKGNsYWltZWRMaXN0OiBudW1iZXJbXSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy53ZWVrbHlSZXdhcmRDbGFpbWVkS2V5KTtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oY2xhaW1lZEtleSwgSlNPTi5zdHJpbmdpZnkoY2xhaW1lZExpc3QpKTtcclxuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Mb2FkKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jbG9zZUJ1dHRvbikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5ub2RlLm9uKCdjbGljaycsIHRoaXMub25DbG9zZUNsaWNrLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxyXG4gICAgcHJpdmF0ZSBsb2FkV2Vla2x5UmV3YXJkQ29uZmlnKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ29uZmlnTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxvYWRDb25maWdQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRDb25maWdQcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2FkQ29uZmlnUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ2NvbmZpZy93ZWVrUmV3YXJkJywgY2MuSnNvbkFzc2V0LCAoZXJyOiBFcnJvciwganNvbkFzc2V0OiBjYy5Kc29uQXNzZXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29uZmlncyA9IGpzb25Bc3NldCAmJiBBcnJheS5pc0FycmF5KGpzb25Bc3NldC5qc29uKSA/IGpzb25Bc3NldC5qc29uIDogW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLndlZWtseVJld2FyZENvbmZpZ3MgPSByYXdDb25maWdzLm1hcCgoY29uZmlnOiBhbnkpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IE51bWJlcihjb25maWcuaWQpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYCR7Y29uZmlnLm5hbWUgfHwgJyd9YCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjOiBgJHtjb25maWcuZGVzYyB8fCAnJ31gLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IE51bWJlcihjb25maWcuaWNvbikgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICByZXdhcmRJZDogTnVtYmVyKGNvbmZpZy5yZXdhcmRJZCkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICByZXdhcmROdW06IE51bWJlcihjb25maWcucmV3YXJkTnVtKSB8fCAwXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29uZmlnTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRDb25maWdQcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdFdlZWtseVJld2FyZHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVXZWVrU3RhcnREYXRlKCk7XHJcbiAgICAgICAgdGhpcy5jaGVja05ld1dlZWsoKTtcclxuXHJcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGNvbnN0IGRheU9mV2VlayA9IHRvZGF5LmdldERheSgpIHx8IDc7XHJcblxyXG4gICAgICAgIHRoaXMud2Vla2x5UmV3YXJkcyA9IHRoaXMud2Vla2x5UmV3YXJkQ29uZmlncy5tYXAoY29uZmlnID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaXNDbGFpbWVkID0gdGhpcy5jaGVja1Jld2FyZENsYWltZWQoY29uZmlnLmlkKTtcclxuICAgICAgICAgICAgY29uc3QgaXNBdmFpbGFibGUgPSBjb25maWcuaWQgPT09IGRheU9mV2VlaztcclxuICAgICAgICAgICAgY29uc3QgaXNNaXNzZWQgPSAhaXNDbGFpbWVkICYmIGNvbmZpZy5pZCA8IGRheU9mV2VlaztcclxuICAgICAgICAgICAgY29uc3QgZGF5c1VudGlsQXZhaWxhYmxlID0gTWF0aC5tYXgoMCwgY29uZmlnLmlkIC0gZGF5T2ZXZWVrKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAuLi5jb25maWcsXHJcbiAgICAgICAgICAgICAgICBpc0NsYWltZWQsXHJcbiAgICAgICAgICAgICAgICBpc0F2YWlsYWJsZSxcclxuICAgICAgICAgICAgICAgIGlzTWlzc2VkLFxyXG4gICAgICAgICAgICAgICAgZGF5c1VudGlsQXZhaWxhYmxlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVXZWVrU3RhcnREYXRlKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKSB8fCA3O1xyXG4gICAgICAgIGNvbnN0IHdlZWtTdGFydCA9IG5ldyBEYXRlKHRvZGF5KTtcclxuICAgICAgICB3ZWVrU3RhcnQuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSAoZGF5T2ZXZWVrIC0gMSkpO1xyXG4gICAgICAgIHRoaXMud2Vla1N0YXJ0RGF0ZSA9IGAke3dlZWtTdGFydC5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyh3ZWVrU3RhcnQuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKHdlZWtTdGFydC5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9YDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrTmV3V2VlaygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB3ZWVrU3RhcnRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy53ZWVrbHlSZXdhcmRXZWVrU3RhcnRLZXkpO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRXZWVrU3RhcnQgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0od2Vla1N0YXJ0S2V5KTtcclxuICAgICAgICBpZiAoIWN1cnJlbnRXZWVrU3RhcnQgfHwgY3VycmVudFdlZWtTdGFydCAhPT0gdGhpcy53ZWVrU3RhcnREYXRlKSB7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh3ZWVrU3RhcnRLZXksIHRoaXMud2Vla1N0YXJ0RGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZUNsYWltZWRSZXdhcmRzKFtdKTtcclxuICAgICAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tSZXdhcmRDbGFpbWVkKHJld2FyZElkOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBjbGFpbWVkTGlzdCA9IHRoaXMuZ2V0Q2xhaW1lZFJld2FyZHMoKTtcclxuICAgICAgICByZXR1cm4gY2xhaW1lZExpc3QuaW5jbHVkZXMocmV3YXJkSWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbWFya1Jld2FyZENsYWltZWQocmV3YXJkSWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGNsYWltZWRMaXN0ID0gdGhpcy5nZXRDbGFpbWVkUmV3YXJkcygpO1xyXG4gICAgICAgIGlmICghY2xhaW1lZExpc3QuaW5jbHVkZXMocmV3YXJkSWQpKSB7XHJcbiAgICAgICAgICAgIGNsYWltZWRMaXN0LnB1c2gocmV3YXJkSWQpO1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVDbGFpbWVkUmV3YXJkcyhjbGFpbWVkTGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2l2ZVJld2FyZChyZXdhcmQ6IFdlZWtseVJld2FyZEl0ZW0pOiB2b2lkIHtcclxuICAgICAgICBpZiAocmV3YXJkLnJld2FyZE51bSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1HYW1lRGF0YS5hZGRHb2xkKHJld2FyZC5yZXdhcmROdW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlV2Vla2x5UmV3YXJkVUkoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLndlZWtQYW5lbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdXZWVrIHBhbmVsIG5vdCBhc3NpZ25lZCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVuc3VyZVJld2FyZExheW91dCgn5q+P5ZGo5aWW5YqxJyk7XG4gICAgICAgIHRoaXMucmVidWlsZFJld2FyZExpc3QoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuc3VyZVJld2FyZExheW91dCh0aXRsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSB0aGlzLndlZWtQYW5lbC5nZXRDaGlsZEJ5TmFtZSgn6YGu572pJyk7XG4gICAgICAgIGlmIChtYXNrKSB7XG4gICAgICAgICAgICBtYXNrLm9wYWNpdHkgPSAxOTA7XG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhbWUgPSB0aGlzLndlZWtQYW5lbC5nZXRDaGlsZEJ5TmFtZSgnamllbWlhbmt1YW5nJyk7XHJcbiAgICAgICAgaWYgKGZyYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ByaXRlRnJhbWUoZnJhbWUsICcxTG9hZC90YW5jaHVhbmczJyk7XHJcbiAgICAgICAgICAgIGZyYW1lLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQuYWN0aXZlID0gZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xvc2VOb2RlID0gdGhpcy5jbG9zZUJ1dHRvbiA/IHRoaXMuY2xvc2VCdXR0b24ubm9kZSA6IHRoaXMud2Vla1BhbmVsLmdldENoaWxkQnlOYW1lKCdidG5jbG9zZScpO1xyXG4gICAgICAgIGlmIChjbG9zZU5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTcHJpdGVGcmFtZShjbG9zZU5vZGUsICcxTG9hZC9ndWFuYmknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRpdGxlTm9kZSA9IHRoaXMuZ2V0T3JDcmVhdGVQYW5lbFRpdGxlKHRpdGxlKTtcclxuICAgICAgICB0aXRsZU5vZGUuekluZGV4ID0gNTtcblxuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcgPSB0aGlzLmdldE9yQ3JlYXRlU2Nyb2xsVmlldygpO1xuICAgICAgICB0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSA9IHRoaXMuZ2V0T3JDcmVhdGVSZXdhcmRJdGVtVGVtcGxhdGUoKTtcbiAgICB9XG5cclxuICAgIHByaXZhdGUgcmVidWlsZFJld2FyZExpc3QoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnJld2FyZFNjcm9sbFZpZXcgfHwgIXRoaXMucmV3YXJkU2Nyb2xsVmlldy5jb250ZW50IHx8ICF0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmNvbnRlbnQ7XHJcbiAgICAgICAgY29udGVudC5jaGlsZHJlbi5zbGljZSgpLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgIT09IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmVGcm9tUGFyZW50KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCBjb2x1bW5zID0gTWF0aC5tYXgoMSwgdGhpcy5yZXdhcmRMaXN0Q29sdW1ucyB8fCAxKTtcbiAgICAgICAgY29uc3Qgcm93cyA9IE1hdGguY2VpbCh0aGlzLndlZWtseVJld2FyZHMubGVuZ3RoIC8gY29sdW1ucyk7XG4gICAgICAgIGNvbnN0IGl0ZW1IZWlnaHQgPSB0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZS5oZWlnaHQgfHwgdGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUuZ2V0Q29udGVudFNpemUoKS5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IHZpZXdIZWlnaHQgPSB0aGlzLnJld2FyZFNjcm9sbFZpZXcubm9kZS5oZWlnaHQgfHwgKHRoaXMucmV3YXJkU2Nyb2xsVmlldy5jb250ZW50ICYmIHRoaXMucmV3YXJkU2Nyb2xsVmlldy5jb250ZW50LnBhcmVudCA/IHRoaXMucmV3YXJkU2Nyb2xsVmlldy5jb250ZW50LnBhcmVudC5oZWlnaHQgOiAwKTtcbiAgICAgICAgY29udGVudC5oZWlnaHQgPSBNYXRoLm1heChcbiAgICAgICAgICAgIHZpZXdIZWlnaHQsXG4gICAgICAgICAgICB0aGlzLnJld2FyZExpc3RUb3BQYWRkaW5nICsgcm93cyAqIGl0ZW1IZWlnaHQgKyBNYXRoLm1heCgwLCByb3dzIC0gMSkgKiB0aGlzLnJld2FyZExpc3RSb3dHYXAgKyB0aGlzLnJld2FyZExpc3RCb3R0b21QYWRkaW5nXG4gICAgICAgICk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLndlZWtseVJld2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSk7XG4gICAgICAgICAgICBpdGVtLm5hbWUgPSBgUmV3YXJkSXRlbSR7aSArIDF9YDtcbiAgICAgICAgICAgIGl0ZW0uYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXRlbS5wYXJlbnQgPSBjb250ZW50O1xyXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0UmV3YXJkSXRlbVBvc2l0aW9uKGkpO1xyXG4gICAgICAgICAgICBpdGVtLnggPSBwb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBpdGVtLnkgPSBwb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVJld2FyZEl0ZW0oaXRlbSwgdGhpcy53ZWVrbHlSZXdhcmRzW2ldKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FwcGx5IHdlZWtseSByZXdhcmQgaXRlbSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmV3YXJkU2Nyb2xsVmlldy5zY3JvbGxUb1RvcCkge1xuICAgICAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDAuMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5UmV3YXJkSXRlbShpdGVtOiBjYy5Ob2RlLCByZXdhcmREYXRhOiBXZWVrbHlSZXdhcmRJdGVtKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2V0U3ByaXRlRnJhbWUoaXRlbS5nZXRDaGlsZEJ5TmFtZSgnQ2xhaW1CdXR0b24nKSwgJzJtYWluL2Fubml1bGluZ3F1Jyk7XG4gICAgICAgIHRoaXMuc2V0U3ByaXRlRnJhbWUoaXRlbS5nZXRDaGlsZEJ5TmFtZSgnQ2xhaW1lZEJ1dHRvbicpLCAnMm1haW4vYW5uaXV5aWxpbmdxdScpO1xuXHJcbiAgICAgICAgY29uc3QgdGl0bGVOb2RlID0gaXRlbS5nZXRDaGlsZEJ5TmFtZSgnVGl0bGUnKTtcclxuICAgICAgICBjb25zdCB0aXRsZUxhYmVsID0gdGl0bGVOb2RlID8gdGl0bGVOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkgOiBudWxsO1xyXG4gICAgICAgIGlmICh0aXRsZUxhYmVsKSB7XG4gICAgICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IHRoaXMuZ2V0V2Vla0RheU5hbWUocmV3YXJkRGF0YS5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbW91bnROb2RlID0gaXRlbS5nZXRDaGlsZEJ5TmFtZSgnQW1vdW50Jyk7XG4gICAgICAgIGNvbnN0IGFtb3VudExhYmVsID0gYW1vdW50Tm9kZSA/IGFtb3VudE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSA6IG51bGw7XG4gICAgICAgIGlmIChhbW91bnRMYWJlbCkge1xuICAgICAgICAgICAgYW1vdW50TGFiZWwuc3RyaW5nID0gYCR7cmV3YXJkRGF0YS5yZXdhcmROdW19YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJ1dHRvbk5vZGUgPSBpdGVtLmdldENoaWxkQnlOYW1lKCdDbGFpbUJ1dHRvbicpO1xuICAgICAgICBjb25zdCBjbGFpbWVkTm9kZSA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ0NsYWltZWRCdXR0b24nKTtcclxuICAgICAgICBpZiAoIWJ1dHRvbk5vZGUgfHwgIWNsYWltZWROb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJ1dHRvbk5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgIGJ1dHRvbk5vZGUub3BhY2l0eSA9IDI1NTtcbiAgICAgICAgY2xhaW1lZE5vZGUub3BhY2l0eSA9IDI1NTtcblxuICAgICAgICBjb25zdCBidXR0b24gPSBidXR0b25Ob2RlLmdldENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBpZiAoYnV0dG9uKSB7XG4gICAgICAgICAgICBidXR0b24uZW5hYmxlQXV0b0dyYXlFZmZlY3QgPSB0cnVlO1xuICAgICAgICAgICAgYnV0dG9uLmRpc2FibGVkQ29sb3IgPSBjYy5jb2xvcigxNjAsIDE2MCwgMTYwLCAyNTUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJld2FyZERhdGEuaXNDbGFpbWVkKSB7XG4gICAgICAgICAgICBidXR0b25Ob2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgY2xhaW1lZE5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbk5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsYWltZWROb2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGJ1dHRvbikge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5pbnRlcmFjdGFibGUgPSByZXdhcmREYXRhLmlzQXZhaWxhYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJld2FyZERhdGEuaXNBdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoKSA9PiB0aGlzLm9uQ2xhaW1DbGljayhyZXdhcmREYXRhLmlkKSwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRXZWVrRGF5TmFtZShpZDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IFsn5ZGo5LiAJywgJ+WRqOS6jCcsICflkajkuIknLCAn5ZGo5ZubJywgJ+WRqOS6lCcsICflkajlha0nLCAn5ZGo5pelJ107XHJcbiAgICAgICAgcmV0dXJuIG5hbWVzW01hdGgubWF4KDAsIE1hdGgubWluKG5hbWVzLmxlbmd0aCAtIDEsIGlkIC0gMSkpXSB8fCAn5ZGo5LiAJztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE9yQ3JlYXRlU2Nyb2xsVmlldygpOiBjYy5TY3JvbGxWaWV3IHtcbiAgICAgICAgbGV0IHNjcm9sbE5vZGUgPSB0aGlzLndlZWtQYW5lbC5nZXRDaGlsZEJ5TmFtZSgnUmV3YXJkU2Nyb2xsVmlldycpO1xuICAgICAgICBpZiAoIXNjcm9sbE5vZGUpIHtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUgPSBuZXcgY2MuTm9kZSgnUmV3YXJkU2Nyb2xsVmlldycpO1xuICAgICAgICAgICAgc2Nyb2xsTm9kZS5wYXJlbnQgPSB0aGlzLndlZWtQYW5lbDtcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxOb2RlLnpJbmRleCA9IDQ7XG5cbiAgICAgICAgbGV0IHZpZXcgPSBzY3JvbGxOb2RlLmdldENoaWxkQnlOYW1lKCd2aWV3Jyk7XG4gICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IGNjLk5vZGUoJ3ZpZXcnKTtcclxuICAgICAgICAgICAgdmlldy5wYXJlbnQgPSBzY3JvbGxOb2RlO1xuICAgICAgICAgICAgdmlldy5hZGRDb21wb25lbnQoY2MuTWFzayk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29udGVudCA9IHZpZXcuZ2V0Q2hpbGRCeU5hbWUoJ2NvbnRlbnQnKTtcbiAgICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgICAgICBjb250ZW50ID0gbmV3IGNjLk5vZGUoJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgIGNvbnRlbnQucGFyZW50ID0gdmlldztcbiAgICAgICAgICAgIGNvbnRlbnQuc2V0Q29udGVudFNpemUodmlldy53aWR0aCwgdmlldy5oZWlnaHQpO1xuICAgICAgICAgICAgY29udGVudC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgICAgIGNvbnRlbnQuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIGNvbnRlbnQuYW5jaG9yWSA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2Nyb2xsVmlldyA9IHNjcm9sbE5vZGUuZ2V0Q29tcG9uZW50KGNjLlNjcm9sbFZpZXcpO1xuICAgICAgICBpZiAoIXNjcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHNjcm9sbFZpZXcgPSBzY3JvbGxOb2RlLmFkZENvbXBvbmVudChjYy5TY3JvbGxWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2Nyb2xsVmlldy5jb250ZW50ID0gY29udGVudDtcclxuICAgICAgICBzY3JvbGxWaWV3Lmhvcml6b250YWwgPSBmYWxzZTtcclxuICAgICAgICBzY3JvbGxWaWV3LnZlcnRpY2FsID0gdHJ1ZTtcclxuICAgICAgICBzY3JvbGxWaWV3LmluZXJ0aWEgPSB0cnVlO1xyXG4gICAgICAgIHNjcm9sbFZpZXcuYnJha2UgPSAwLjc1O1xuICAgICAgICByZXR1cm4gc2Nyb2xsVmlldztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE9yQ3JlYXRlUmV3YXJkSXRlbVRlbXBsYXRlKCk6IGNjLk5vZGUge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5yZXdhcmRTY3JvbGxWaWV3ICYmIHRoaXMucmV3YXJkU2Nyb2xsVmlldy5jb250ZW50O1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSBjb250ZW50ID8gY29udGVudC5nZXRDaGlsZEJ5TmFtZSgnUmV3YXJkSXRlbVRlbXBsYXRlJykgOiBudWxsO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMud2Vla1BhbmVsLmdldENoaWxkQnlOYW1lKCdSZXdhcmRJdGVtVGVtcGxhdGUnKTtcclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlICYmIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlLnBhcmVudCA9IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGVtcGxhdGUgPSBuZXcgY2MuTm9kZSgnUmV3YXJkSXRlbVRlbXBsYXRlJyk7XG4gICAgICAgIHRlbXBsYXRlLnBhcmVudCA9IGNvbnRlbnQgfHwgdGhpcy53ZWVrUGFuZWw7XG4gICAgICAgIHRlbXBsYXRlLnNldENvbnRlbnRTaXplKDI1MCwgMjYwKTtcbiAgICAgICAgdGVtcGxhdGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHRlbXBsYXRlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjYXJkID0gdGhpcy5jcmVhdGVTcHJpdGVOb2RlKCdDYXJkJywgMTc1LCAyMzIsIDAsIDgsICcybWFpbi9kaWt1YW5nNicpO1xuICAgICAgICBjYXJkLnBhcmVudCA9IHRlbXBsYXRlO1xuXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5nZXRPckNyZWF0ZUxhYmVsTm9kZSh0ZW1wbGF0ZSwgJ1RpdGxlJywgJ+WRqOS4gCcsIDQwLCBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KSwgMCwgODAsIDEwMCwgNTQpO1xuICAgICAgICBsZXQgdGl0bGVPdXRsaW5lID0gdGl0bGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIGlmICghdGl0bGVPdXRsaW5lKSB7XG4gICAgICAgICAgICB0aXRsZU91dGxpbmUgPSB0aXRsZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgfVxyXG4gICAgICAgIHRpdGxlT3V0bGluZS5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICB0aXRsZU91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigzMSwgMTIwLCAxODUpO1xuICAgICAgICB0aXRsZU91dGxpbmUud2lkdGggPSAzO1xuXG4gICAgICAgIGNvbnN0IGNvaW4gPSB0aGlzLmNyZWF0ZVNwcml0ZU5vZGUoJ0NvaW4nLCA1NiwgNTYsIC0zNSwgMTIsICcybWFpbi9qaW5iaScpO1xuICAgICAgICBjb2luLnBhcmVudCA9IHRlbXBsYXRlO1xuXG4gICAgICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuZ2V0T3JDcmVhdGVMYWJlbE5vZGUodGVtcGxhdGUsICdBbW91bnQnLCAnMTAwJywgMjgsIGNjLmNvbG9yKDQ1LCAzNSwgMTI2KSwgMzIsIDE0LCA3MiwgMzgpO1xuICAgICAgICBjb25zdCBhbW91bnRPdXRsaW5lID0gYW1vdW50LmdldENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpO1xuICAgICAgICBpZiAoYW1vdW50T3V0bGluZSkge1xuICAgICAgICAgICAgYW1vdW50T3V0bGluZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFpbSA9IHRoaXMuY3JlYXRlU3ByaXRlTm9kZSgnQ2xhaW1CdXR0b24nLCAyNDAsIDg4LCAwLCAtODIsICcybWFpbi9hbm5pdWxpbmdxdScpO1xuICAgICAgICBjbGFpbS5wYXJlbnQgPSB0ZW1wbGF0ZTtcbiAgICAgICAgY2xhaW0uYWRkQ29tcG9uZW50KGNjLkJ1dHRvbik7XG5cbiAgICAgICAgY29uc3QgY2xhaW1lZCA9IHRoaXMuY3JlYXRlU3ByaXRlTm9kZSgnQ2xhaW1lZEJ1dHRvbicsIDI0MCwgODgsIDAsIC04MiwgJzJtYWluL2Fubml1eWlsaW5ncXUnKTtcbiAgICAgICAgY2xhaW1lZC5wYXJlbnQgPSB0ZW1wbGF0ZTtcblxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuXHJcbiAgICBwcml2YXRlIGdldE9yQ3JlYXRlUGFuZWxUaXRsZSh0aXRsZTogc3RyaW5nKTogY2MuTm9kZSB7XHJcbiAgICAgICAgY29uc3QgdGl0bGVOb2RlID0gdGhpcy53ZWVrUGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ1Jld2FyZFRpdGxlJyk7XHJcbiAgICAgICAgaWYgKCF0aXRsZU5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3JDcmVhdGVMYWJlbE5vZGUodGhpcy53ZWVrUGFuZWwsICdSZXdhcmRUaXRsZScsIHRpdGxlLCA0MiwgY2MuY29sb3IoMjU1LCAyNTUsIDI1NSksIDAsIDM1MiwgMjYwLCA1Nik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsYWJlbCA9IHRpdGxlTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xyXG4gICAgICAgIGlmIChsYWJlbCkge1xyXG4gICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSB0aXRsZTtcclxuICAgICAgICAgICAgbGFiZWwuZm9udFNpemUgPSA0MjtcclxuICAgICAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcclxuICAgICAgICAgICAgbGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcclxuICAgICAgICByZXR1cm4gdGl0bGVOb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmV3YXJkSXRlbVBvc2l0aW9uKGluZGV4OiBudW1iZXIpOiBjYy5WZWMyIHtcbiAgICAgICAgY29uc3QgY29sdW1ucyA9IE1hdGgubWF4KDEsIHRoaXMucmV3YXJkTGlzdENvbHVtbnMgfHwgMSk7XG4gICAgICAgIGNvbnN0IGNvbCA9IGluZGV4ICUgY29sdW1ucztcbiAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpbmRleCAvIGNvbHVtbnMpO1xuICAgICAgICBjb25zdCBpdGVtV2lkdGggPSB0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZS53aWR0aCB8fCB0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZS5nZXRDb250ZW50U2l6ZSgpLndpZHRoO1xuICAgICAgICBjb25zdCBpdGVtSGVpZ2h0ID0gdGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUuaGVpZ2h0IHx8IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLmdldENvbnRlbnRTaXplKCkuaGVpZ2h0O1xuICAgICAgICBjb25zdCB0b3RhbFdpZHRoID0gY29sdW1ucyAqIGl0ZW1XaWR0aCArIE1hdGgubWF4KDAsIGNvbHVtbnMgLSAxKSAqIHRoaXMucmV3YXJkTGlzdENvbHVtbkdhcDtcbiAgICAgICAgY29uc3Qgc3RhcnRYID0gLXRvdGFsV2lkdGggLyAyICsgaXRlbVdpZHRoIC8gMjtcbiAgICAgICAgY29uc3QgeCA9IHN0YXJ0WCArIGNvbCAqIChpdGVtV2lkdGggKyB0aGlzLnJld2FyZExpc3RDb2x1bW5HYXApO1xuICAgICAgICBjb25zdCB5ID0gLXRoaXMucmV3YXJkTGlzdFRvcFBhZGRpbmcgLSBpdGVtSGVpZ2h0IC8gMiAtIHJvdyAqIChpdGVtSGVpZ2h0ICsgdGhpcy5yZXdhcmRMaXN0Um93R2FwKTtcbiAgICAgICAgcmV0dXJuIGNjLnYyKHgsIHkpO1xuICAgIH1cblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVTcHJpdGVOb2RlKG5hbWU6IHN0cmluZywgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBzcHJpdGVQYXRoOiBzdHJpbmcpOiBjYy5Ob2RlIHtcclxuICAgICAgICBjb25zdCBub2RlID0gbmV3IGNjLk5vZGUobmFtZSk7XHJcbiAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICBub2RlLnNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcclxuICAgICAgICB0aGlzLnNldFNwcml0ZUZyYW1lKG5vZGUsIHNwcml0ZVBhdGgpO1xyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0T3JDcmVhdGVMYWJlbE5vZGUocGFyZW50OiBjYy5Ob2RlLCBuYW1lOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgZm9udFNpemU6IG51bWJlciwgY29sb3I6IGNjLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBjYy5Ob2RlIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHBhcmVudC5nZXRDaGlsZEJ5TmFtZShuYW1lKTtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgbm9kZSA9IG5ldyBjYy5Ob2RlKG5hbWUpO1xyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICAgICAgbm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlLnNldENvbnRlbnRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIG5vZGUuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgbm9kZS5jb2xvciA9IGNvbG9yO1xyXG5cclxuICAgICAgICBjb25zdCBsYWJlbCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcclxuICAgICAgICBsYWJlbC5zdHJpbmcgPSB0ZXh0O1xyXG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xyXG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFNwcml0ZUZyYW1lKG5vZGU6IGNjLk5vZGUsIHNwcml0ZVBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XHJcbiAgICAgICAgaWYgKCFzcHJpdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYy5sb2FkZXIubG9hZFJlcyhzcHJpdGVQYXRoLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogRXJyb3IsIHNwcml0ZUZyYW1lOiBjYy5TcHJpdGVGcmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSAmJiBub2RlLmlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25DbGFpbUNsaWNrKHJld2FyZElkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCByZXdhcmQgPSB0aGlzLndlZWtseVJld2FyZHMuZmluZChyID0+IHIuaWQgPT09IHJld2FyZElkKTtcclxuICAgICAgICBpZiAoIXJld2FyZCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghcmV3YXJkLmlzQXZhaWxhYmxlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHJld2FyZC5pc0NsYWltZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5naXZlUmV3YXJkKHJld2FyZCk7XHJcbiAgICAgICAgcmV3YXJkLmlzQ2xhaW1lZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXJrUmV3YXJkQ2xhaW1lZChyZXdhcmRJZCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVXZWVrbHlSZXdhcmRVSSgpO1xyXG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGDojrflvpcke3Jld2FyZC5yZXdhcmROdW196ZK755+z44CCYCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNsb3NlQ2xpY2soKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd1RvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIFRpcHNNYW5hZ2VyLnNob3cobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKTogdm9pZCB7XG4gICAgICAgIHRoaXMubG9hZFdlZWtseVJld2FyZENvbmZpZygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbml0V2Vla2x5UmV3YXJkcygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVXZWVrbHlSZXdhcmRVSSgpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUmVsb2FkIHdlZWtseSByZXdhcmQgY29uZmlnIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXHJcbiAgICBwdWJsaWMgaGlkZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuIl19