
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcV2Vla2x5UmV3YXJkTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFDMUMsbURBQThDO0FBQzlDLDZDQUF5QztBQUN6Qyw2REFBd0Q7QUFtQnhEO0lBQWlELHVDQUFZO0lBQTdEO1FBQUEscUVBd2VDO1FBdGVHLGlCQUFXLEdBQWMsSUFBSSxDQUFDO1FBRzlCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFFbEIsbUJBQWEsR0FBdUIsRUFBRSxDQUFDO1FBQ3ZDLHlCQUFtQixHQUF5QixFQUFFLENBQUM7UUFDL0Msb0JBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIsdUJBQWlCLEdBQXlCLElBQUksQ0FBQztRQUMvQyxtQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQix3QkFBa0IsR0FBWSxJQUFJLENBQUM7UUFDbkMscUJBQWUsR0FBYyxFQUFFLENBQUM7UUFDaEMsbUJBQWEsR0FBWSxJQUFJLENBQUM7UUFDOUIsc0JBQWdCLEdBQWtCLElBQUksQ0FBQztRQUU5Qiw4QkFBd0IsR0FBVyx1QkFBdUIsQ0FBQztRQUMzRCw0QkFBc0IsR0FBVyxxQkFBcUIsQ0FBQzs7SUFzZDVFLENBQUM7SUFwZFcsdUNBQVMsR0FBakI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sOENBQWdCLEdBQXhCLFVBQXlCLE9BQWU7UUFDcEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBVSxPQUFPLFNBQUksTUFBUSxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVPLCtD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SSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSztZQUNwQyxPQUFPLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGtDQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQXJlRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDOzREQUNVO0lBRzlCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7MERBQ1E7SUFMVCxtQkFBbUI7UUFEdkMsT0FBTztPQUNhLG1CQUFtQixDQXdldkM7SUFBRCwwQkFBQztDQXhlRCxBQXdlQyxDQXhlZ0QsRUFBRSxDQUFDLFNBQVMsR0F3ZTVEO2tCQXhlb0IsbUJBQW1CIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XG5pbXBvcnQgVGlwc01hbmFnZXIgZnJvbSAnLi4vTG9hZC9UaXBzTWFuYWdlcic7XG5pbXBvcnQgbUdhbWVEYXRhIGZyb20gJy4uL0xvYWQvR2FtZURhdGEnO1xuaW1wb3J0IFVzZXJEYXRhU3luY01hbmFnZXIgZnJvbSAnLi9Vc2VyRGF0YVN5bmNNYW5hZ2VyJztcblxuaW50ZXJmYWNlIFdlZWtseVJld2FyZENvbmZpZyB7XG4gICAgaWQ6IG51bWJlcjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGVzYzogc3RyaW5nO1xuICAgIGljb246IG51bWJlcjtcbiAgICByZXdhcmRJZDogbnVtYmVyO1xuICAgIHJld2FyZE51bTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgV2Vla2x5UmV3YXJkSXRlbSBleHRlbmRzIFdlZWtseVJld2FyZENvbmZpZyB7XG4gICAgaXNDbGFpbWVkOiBib29sZWFuO1xuICAgIGlzQXZhaWxhYmxlOiBib29sZWFuO1xuICAgIGlzTWlzc2VkOiBib29sZWFuO1xuICAgIGRheXNVbnRpbEF2YWlsYWJsZTogbnVtYmVyO1xufVxuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2Vla2x5UmV3YXJkTWFuYWdlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgQHByb3BlcnR5KGNjLkJ1dHRvbilcbiAgICBjbG9zZUJ1dHRvbjogY2MuQnV0dG9uID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIHdlZWtQYW5lbDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBwcml2YXRlIHdlZWtseVJld2FyZHM6IFdlZWtseVJld2FyZEl0ZW1bXSA9IFtdO1xuICAgIHByaXZhdGUgd2Vla2x5UmV3YXJkQ29uZmlnczogV2Vla2x5UmV3YXJkQ29uZmlnW10gPSBbXTtcbiAgICBwcml2YXRlIGlzQ29uZmlnTG9hZGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBsb2FkQ29uZmlnUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgd2Vla1N0YXJ0RGF0ZTogc3RyaW5nID0gJyc7XG4gICAgcHJpdmF0ZSByZXdhcmRJdGVtVGVtcGxhdGU6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgcmV3YXJkSXRlbU5vZGVzOiBjYy5Ob2RlW10gPSBbXTtcbiAgICBwcml2YXRlIHJld2FyZENvbnRlbnQ6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgcmV3YXJkU2Nyb2xsVmlldzogY2MuU2Nyb2xsVmlldyA9IG51bGw7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHdlZWtseVJld2FyZFdlZWtTdGFydEtleTogc3RyaW5nID0gJ3dlZWtseVJld2FyZFdlZWtTdGFydCc7XG4gICAgcHJpdmF0ZSByZWFkb25seSB3ZWVrbHlSZXdhcmRDbGFpbWVkS2V5OiBzdHJpbmcgPSAnd2Vla2x5UmV3YXJkQ2xhaW1lZCc7XG5cbiAgICBwcml2YXRlIGdldFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEtleVdpdGhVc2VySWQoYmFzZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcbiAgICAgICAgaWYgKHVzZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VLZXl9XyR7dXNlcklkfWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VLZXk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGFpbWVkUmV3YXJkcygpOiBudW1iZXJbXSB7XG4gICAgICAgIGNvbnN0IGNsYWltZWRLZXkgPSB0aGlzLmdldEtleVdpdGhVc2VySWQodGhpcy53ZWVrbHlSZXdhcmRDbGFpbWVkS2V5KTtcbiAgICAgICAgY29uc3QgY2xhaW1lZFN0ciA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShjbGFpbWVkS2V5KTtcbiAgICAgICAgaWYgKCFjbGFpbWVkU3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjbGFpbWVkU3RyKTtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBhcnNlZCkgPyBwYXJzZWQgOiBbXTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BhcnNlIHdlZWtseSBjbGFpbWVkIGRhdGEgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2F2ZUNsYWltZWRSZXdhcmRzKGNsYWltZWRMaXN0OiBudW1iZXJbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGFpbWVkS2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMud2Vla2x5UmV3YXJkQ2xhaW1lZEtleSk7XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShjbGFpbWVkS2V5LCBKU09OLnN0cmluZ2lmeShjbGFpbWVkTGlzdCkpO1xuICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgb25Mb2FkKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jbG9zZUJ1dHRvbikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5ub2RlLm9uKCdjbGljaycsIHRoaXMub25DbG9zZUNsaWNrLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVmcmVzaFdlZWtseVJld2FyZHMoKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvYWQgd2Vla2x5IHJld2FyZCBjb25maWcgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uRW5hYmxlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlZnJlc2hXZWVrbHlSZXdhcmRzKCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdSZWZyZXNoIHdlZWtseSByZXdhcmQgY29uZmlnIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVmcmVzaFdlZWtseVJld2FyZHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IHRoaXMubG9hZFdlZWtseVJld2FyZENvbmZpZygpO1xuICAgICAgICB0aGlzLmluaXRXZWVrbHlSZXdhcmRzKCk7XG4gICAgICAgIHRoaXMudXBkYXRlV2Vla2x5UmV3YXJkVUkoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRXZWVrbHlSZXdhcmRDb25maWcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLmlzQ29uZmlnTG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5sb2FkQ29uZmlnUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9hZENvbmZpZ1Byb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRDb25maWdQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMoJ2NvbmZpZy93ZWVrUmV3YXJkJywgY2MuSnNvbkFzc2V0LCAoZXJyOiBFcnJvciwganNvbkFzc2V0OiBjYy5Kc29uQXNzZXQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29uZmlncyA9IGpzb25Bc3NldCAmJiBBcnJheS5pc0FycmF5KGpzb25Bc3NldC5qc29uKSA/IGpzb25Bc3NldC5qc29uIDogW107XG4gICAgICAgICAgICAgICAgdGhpcy53ZWVrbHlSZXdhcmRDb25maWdzID0gcmF3Q29uZmlncy5tYXAoKGNvbmZpZzogYW55KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBpZDogTnVtYmVyKGNvbmZpZy5pZCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYCR7Y29uZmlnLm5hbWUgfHwgJyd9YCxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogYCR7Y29uZmlnLmRlc2MgfHwgJyd9YCxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogTnVtYmVyKGNvbmZpZy5pY29uKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICByZXdhcmRJZDogTnVtYmVyKGNvbmZpZy5yZXdhcmRJZCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkTnVtOiBOdW1iZXIoY29uZmlnLnJld2FyZE51bSkgfHwgMFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29uZmlnTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZENvbmZpZ1Byb21pc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0V2Vla2x5UmV3YXJkcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51cGRhdGVXZWVrU3RhcnREYXRlKCk7XG4gICAgICAgIHRoaXMuY2hlY2tOZXdXZWVrKCk7XG5cbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKSB8fCA3O1xuXG4gICAgICAgIHRoaXMud2Vla2x5UmV3YXJkcyA9IHRoaXMud2Vla2x5UmV3YXJkQ29uZmlncy5tYXAoY29uZmlnID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzQ2xhaW1lZCA9IHRoaXMuY2hlY2tSZXdhcmRDbGFpbWVkKGNvbmZpZy5pZCk7XG4gICAgICAgICAgICBjb25zdCBpc0F2YWlsYWJsZSA9IGNvbmZpZy5pZCA9PT0gZGF5T2ZXZWVrO1xuICAgICAgICAgICAgY29uc3QgaXNNaXNzZWQgPSAhaXNDbGFpbWVkICYmIGNvbmZpZy5pZCA8IGRheU9mV2VlaztcbiAgICAgICAgICAgIGNvbnN0IGRheXNVbnRpbEF2YWlsYWJsZSA9IE1hdGgubWF4KDAsIGNvbmZpZy5pZCAtIGRheU9mV2Vlayk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICAgICAgICAgIGlzQ2xhaW1lZCxcbiAgICAgICAgICAgICAgICBpc0F2YWlsYWJsZSxcbiAgICAgICAgICAgICAgICBpc01pc3NlZCxcbiAgICAgICAgICAgICAgICBkYXlzVW50aWxBdmFpbGFibGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlV2Vla1N0YXJ0RGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCBkYXlPZldlZWsgPSB0b2RheS5nZXREYXkoKSB8fCA3O1xuICAgICAgICBjb25zdCB3ZWVrU3RhcnQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgICAgIHdlZWtTdGFydC5zZXREYXRlKHRvZGF5LmdldERhdGUoKSAtIChkYXlPZldlZWsgLSAxKSk7XG4gICAgICAgIHRoaXMud2Vla1N0YXJ0RGF0ZSA9IGAke3dlZWtTdGFydC5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyh3ZWVrU3RhcnQuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKHdlZWtTdGFydC5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9YDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrTmV3V2VlaygpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgd2Vla1N0YXJ0S2V5ID0gdGhpcy5nZXRLZXlXaXRoVXNlcklkKHRoaXMud2Vla2x5UmV3YXJkV2Vla1N0YXJ0S2V5KTtcbiAgICAgICAgY29uc3QgY3VycmVudFdlZWtTdGFydCA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh3ZWVrU3RhcnRLZXkpO1xuICAgICAgICBpZiAoIWN1cnJlbnRXZWVrU3RhcnQgfHwgY3VycmVudFdlZWtTdGFydCAhPT0gdGhpcy53ZWVrU3RhcnREYXRlKSB7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0od2Vla1N0YXJ0S2V5LCB0aGlzLndlZWtTdGFydERhdGUpO1xuICAgICAgICAgICAgdGhpcy5zYXZlQ2xhaW1lZFJld2FyZHMoW10pO1xuICAgICAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZXF1ZXN0VXBsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrUmV3YXJkQ2xhaW1lZChyZXdhcmRJZDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNsYWltZWRMaXN0ID0gdGhpcy5nZXRDbGFpbWVkUmV3YXJkcygpO1xuICAgICAgICByZXR1cm4gY2xhaW1lZExpc3QuaW5jbHVkZXMocmV3YXJkSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFya1Jld2FyZENsYWltZWQocmV3YXJkSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGFpbWVkTGlzdCA9IHRoaXMuZ2V0Q2xhaW1lZFJld2FyZHMoKTtcbiAgICAgICAgaWYgKCFjbGFpbWVkTGlzdC5pbmNsdWRlcyhyZXdhcmRJZCkpIHtcbiAgICAgICAgICAgIGNsYWltZWRMaXN0LnB1c2gocmV3YXJkSWQpO1xuICAgICAgICAgICAgdGhpcy5zYXZlQ2xhaW1lZFJld2FyZHMoY2xhaW1lZExpc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnaXZlUmV3YXJkKHJld2FyZDogV2Vla2x5UmV3YXJkSXRlbSk6IHZvaWQge1xuICAgICAgICBpZiAocmV3YXJkLnJld2FyZE51bSA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtR2FtZURhdGEuYWRkR29sZChyZXdhcmQucmV3YXJkTnVtKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVdlZWtseVJld2FyZFVJKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMud2Vla1BhbmVsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdXZWVrIHBhbmVsIG5vdCBhc3NpZ25lZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmVuc3VyZVJld2FyZFNjcm9sbExpc3QoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53ZWVrbHlSZXdhcmRzLnNvcnQoKGEsIGIpID0+IGEuaWQgLSBiLmlkKTtcblxuICAgICAgICBjb25zdCB2aWV3V2lkdGggPSB0aGlzLnJld2FyZFNjcm9sbFZpZXcubm9kZS53aWR0aDtcbiAgICAgICAgY29uc3Qgdmlld0hlaWdodCA9IHRoaXMucmV3YXJkU2Nyb2xsVmlldy5ub2RlLmhlaWdodDtcbiAgICAgICAgY29uc3QgY29sdW1uQ291bnQgPSAzO1xuICAgICAgICBjb25zdCB2ZXJ0aWNhbFNwYWNpbmcgPSAyNjtcbiAgICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IDE2O1xuICAgICAgICBjb25zdCBwYWRkaW5nQm90dG9tID0gMjg7XG4gICAgICAgIGNvbnN0IGl0ZW1TaXplID0gdGhpcy5nZXRSZXdhcmRJdGVtU2l6ZSh0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSk7XG4gICAgICAgIGNvbnN0IGl0ZW1TY2FsZSA9IHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlLnNjYWxlIHx8IDE7XG4gICAgICAgIGNvbnN0IGxheW91dEl0ZW1XaWR0aCA9IGl0ZW1TaXplLndpZHRoICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBsYXlvdXRJdGVtSGVpZ2h0ID0gaXRlbVNpemUuaGVpZ2h0ICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBpdGVtTGF5b3V0SGVpZ2h0ID0gbGF5b3V0SXRlbUhlaWdodCArIDUwICogaXRlbVNjYWxlO1xuICAgICAgICBjb25zdCBob3Jpem9udGFsU3BhY2luZyA9IE1hdGgubWluKDU2LCBNYXRoLm1heCgwLCAodmlld1dpZHRoIC0gbGF5b3V0SXRlbVdpZHRoICogY29sdW1uQ291bnQpIC8gTWF0aC5tYXgoMSwgY29sdW1uQ291bnQgLSAxKSkpO1xuICAgICAgICBjb25zdCByb3dDb3VudCA9IE1hdGguY2VpbCh0aGlzLndlZWtseVJld2FyZHMubGVuZ3RoIC8gY29sdW1uQ291bnQpO1xuICAgICAgICBjb25zdCB0b3RhbEhlaWdodCA9IHJvd0NvdW50ICogaXRlbUxheW91dEhlaWdodCArIE1hdGgubWF4KDAsIHJvd0NvdW50IC0gMSkgKiB2ZXJ0aWNhbFNwYWNpbmcgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcbiAgICAgICAgY29uc3QgZ3JpZFdpZHRoID0gY29sdW1uQ291bnQgKiBsYXlvdXRJdGVtV2lkdGggKyAoY29sdW1uQ291bnQgLSAxKSAqIGhvcml6b250YWxTcGFjaW5nO1xuICAgICAgICBjb25zdCBzdGFydFggPSAtZ3JpZFdpZHRoIC8gMiArIGxheW91dEl0ZW1XaWR0aCAvIDI7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW1OYW1lczoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG5cbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LndpZHRoID0gdmlld1dpZHRoO1xuICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQuaGVpZ2h0ID0gTWF0aC5tYXgodmlld0hlaWdodCArIDEsIHRvdGFsSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC5hbmNob3JZID0gMTtcbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LnggPSAwO1xuICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQueSA9IHZpZXdIZWlnaHQgLyAyO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy53ZWVrbHlSZXdhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByZXdhcmREYXRhID0gdGhpcy53ZWVrbHlSZXdhcmRzW2ldO1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpIC8gY29sdW1uQ291bnQpO1xuICAgICAgICAgICAgY29uc3QgY29sID0gaSAlIGNvbHVtbkNvdW50O1xuICAgICAgICAgICAgbGV0IGl0ZW1Ob2RlID0gdGhpcy5yZXdhcmRJdGVtTm9kZXNbaV07XG5cbiAgICAgICAgICAgIGlmICghaXRlbU5vZGUpIHtcbiAgICAgICAgICAgICAgICBpdGVtTm9kZSA9IHRoaXMucmV3YXJkQ29udGVudC5nZXRDaGlsZEJ5TmFtZShgd2Vla1Jld2FyZEl0ZW0ke3Jld2FyZERhdGEuaWR9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaXRlbU5vZGUpIHtcbiAgICAgICAgICAgICAgICBpdGVtTm9kZSA9IGNjLmluc3RhbnRpYXRlKHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICBpdGVtTm9kZS5uYW1lID0gYHdlZWtSZXdhcmRJdGVtJHtyZXdhcmREYXRhLmlkfWA7XG4gICAgICAgICAgICAgICAgaXRlbU5vZGUucGFyZW50ID0gdGhpcy5yZXdhcmRDb250ZW50O1xuICAgICAgICAgICAgICAgIHRoaXMucmV3YXJkSXRlbU5vZGVzW2ldID0gaXRlbU5vZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFjdGl2ZUl0ZW1OYW1lc1tpdGVtTm9kZS5uYW1lXSA9IHRydWU7XG4gICAgICAgICAgICBpdGVtTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgaXRlbU5vZGUucGFyZW50ID0gdGhpcy5yZXdhcmRDb250ZW50O1xuICAgICAgICAgICAgaXRlbU5vZGUud2lkdGggPSBpdGVtU2l6ZS53aWR0aDtcbiAgICAgICAgICAgIGl0ZW1Ob2RlLmhlaWdodCA9IGl0ZW1TaXplLmhlaWdodDtcbiAgICAgICAgICAgIGl0ZW1Ob2RlLnNjYWxlID0gaXRlbVNjYWxlO1xuICAgICAgICAgICAgaXRlbU5vZGUueCA9IHN0YXJ0WCArIGNvbCAqIChsYXlvdXRJdGVtV2lkdGggKyBob3Jpem9udGFsU3BhY2luZyk7XG4gICAgICAgICAgICBpdGVtTm9kZS55ID0gLXBhZGRpbmdUb3AgLSBsYXlvdXRJdGVtSGVpZ2h0IC8gMiAtIHJvdyAqIChpdGVtTGF5b3V0SGVpZ2h0ICsgdmVydGljYWxTcGFjaW5nKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRSZXdhcmRJdGVtRGF0YShpdGVtTm9kZSwgcmV3YXJkRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5yZXdhcmRJdGVtTm9kZXMubGVuZ3RoIC0gMTsgaSA+PSB0aGlzLndlZWtseVJld2FyZHMubGVuZ3RoOyBpLS0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJld2FyZEl0ZW1Ob2Rlc1tpXSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmV3YXJkSXRlbU5vZGVzW2ldLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMucmV3YXJkQ29udGVudC5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnJld2FyZENvbnRlbnQuY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoY2hpbGQubmFtZS5pbmRleE9mKCd3ZWVrUmV3YXJkSXRlbScpID09PSAwICYmICFhY3RpdmVJdGVtTmFtZXNbY2hpbGQubmFtZV0pIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmV3YXJkU2Nyb2xsVmlldy5zY3JvbGxUb1RvcCkge1xuICAgICAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnN1cmVSZXdhcmRTY3JvbGxMaXN0KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMud2Vla1BhbmVsIHx8IHRoaXMubm9kZTtcbiAgICAgICAgY29uc3QgZnJhbWVOb2RlID0gcGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ2ppZW1pYW5rdWFuZycpIHx8IHBhbmVsO1xuXG4gICAgICAgIGlmICghdGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucmV3YXJkSXRlbVRlbXBsYXRlID0gdGhpcy5maW5kUmV3YXJkSXRlbVRlbXBsYXRlKGZyYW1lTm9kZSwgcGFuZWwpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnJld2FyZEl0ZW1UZW1wbGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1dlZWtseSByZXdhcmQgaXRlbSB0ZW1wbGF0ZSBkYXlOIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzY3JvbGxOb2RlID0gZnJhbWVOb2RlLmdldENoaWxkQnlOYW1lKCdXZWVrUmV3YXJkU2Nyb2xsVmlldycpO1xuICAgICAgICBpZiAoIXNjcm9sbE5vZGUpIHtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUgPSBuZXcgY2MuTm9kZSgnV2Vla1Jld2FyZFNjcm9sbFZpZXcnKTtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUucGFyZW50ID0gZnJhbWVOb2RlO1xuICAgICAgICAgICAgc2Nyb2xsTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICAgICAgc2Nyb2xsTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBmcmFtZU5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3NoZW5kaWt1YW5nJyk7XG4gICAgICAgIGNvbnN0IHZpZXdXaWR0aCA9IGJhY2tncm91bmROb2RlICYmIGJhY2tncm91bmROb2RlLndpZHRoID4gMCA/IGJhY2tncm91bmROb2RlLndpZHRoIDogNDU1O1xuICAgICAgICBjb25zdCB2aWV3SGVpZ2h0ID0gYmFja2dyb3VuZE5vZGUgJiYgYmFja2dyb3VuZE5vZGUuaGVpZ2h0ID4gMCA/IGJhY2tncm91bmROb2RlLmhlaWdodCA6IDQzMDtcblxuICAgICAgICBzY3JvbGxOb2RlLndpZHRoID0gdmlld1dpZHRoO1xuICAgICAgICBzY3JvbGxOb2RlLmhlaWdodCA9IHZpZXdIZWlnaHQ7XG4gICAgICAgIHNjcm9sbE5vZGUueCA9IGJhY2tncm91bmROb2RlID8gYmFja2dyb3VuZE5vZGUueCA6IDA7XG4gICAgICAgIHNjcm9sbE5vZGUueSA9IGJhY2tncm91bmROb2RlID8gYmFja2dyb3VuZE5vZGUueSA6IC0zMjtcblxuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcgPSBzY3JvbGxOb2RlLmdldENvbXBvbmVudChjYy5TY3JvbGxWaWV3KSB8fCBzY3JvbGxOb2RlLmFkZENvbXBvbmVudChjYy5TY3JvbGxWaWV3KTtcbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3Lmhvcml6b250YWwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LnZlcnRpY2FsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZXdhcmRTY3JvbGxWaWV3LmluZXJ0aWEgPSB0cnVlO1xuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcuYnJha2UgPSAwLjc1O1xuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcuZWxhc3RpYyA9IHRydWU7XG4gICAgICAgIHRoaXMucmV3YXJkU2Nyb2xsVmlldy5ib3VuY2VEdXJhdGlvbiA9IDAuMjM7XG4gICAgICAgIHRoaXMucmV3YXJkU2Nyb2xsVmlldy5jYW5jZWxJbm5lckV2ZW50cyA9IHRydWU7XG5cbiAgICAgICAgbGV0IHZpZXdOb2RlID0gc2Nyb2xsTm9kZS5nZXRDaGlsZEJ5TmFtZSgndmlldycpO1xuICAgICAgICBpZiAoIXZpZXdOb2RlKSB7XG4gICAgICAgICAgICB2aWV3Tm9kZSA9IG5ldyBjYy5Ob2RlKCd2aWV3Jyk7XG4gICAgICAgICAgICB2aWV3Tm9kZS5wYXJlbnQgPSBzY3JvbGxOb2RlO1xuICAgICAgICAgICAgdmlld05vZGUuYWRkQ29tcG9uZW50KGNjLk1hc2spO1xuICAgICAgICB9XG4gICAgICAgIHZpZXdOb2RlLndpZHRoID0gdmlld1dpZHRoO1xuICAgICAgICB2aWV3Tm9kZS5oZWlnaHQgPSB2aWV3SGVpZ2h0O1xuICAgICAgICB2aWV3Tm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICB2aWV3Tm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICB2aWV3Tm9kZS54ID0gMDtcbiAgICAgICAgdmlld05vZGUueSA9IDA7XG5cbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50ID0gdmlld05vZGUuZ2V0Q2hpbGRCeU5hbWUoJ2NvbnRlbnQnKTtcbiAgICAgICAgaWYgKCF0aGlzLnJld2FyZENvbnRlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucmV3YXJkQ29udGVudCA9IG5ldyBjYy5Ob2RlKCdjb250ZW50Jyk7XG4gICAgICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQucGFyZW50ID0gdmlld05vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRoaXMucmV3YXJkQ29udGVudC5hbmNob3JZID0gMTtcbiAgICAgICAgdGhpcy5yZXdhcmRDb250ZW50LnggPSAwO1xuICAgICAgICB0aGlzLnJld2FyZENvbnRlbnQueSA9IHZpZXdIZWlnaHQgLyAyO1xuICAgICAgICB0aGlzLnJld2FyZFNjcm9sbFZpZXcuY29udGVudCA9IHRoaXMucmV3YXJkQ29udGVudDtcbiAgICAgICAgdGhpcy5yZXdhcmRJdGVtTm9kZXMgPSB0aGlzLmNvbGxlY3RSZXdhcmRJdGVtTm9kZXMoZnJhbWVOb2RlLCBwYW5lbCk7XG4gICAgICAgIGlmICh0aGlzLnJld2FyZEl0ZW1Ob2Rlcy5sZW5ndGggPT09IDAgJiYgdGhpcy5yZXdhcmRJdGVtVGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucmV3YXJkSXRlbU5vZGVzID0gW3RoaXMucmV3YXJkSXRlbVRlbXBsYXRlXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW1Ob2RlIG9mIHRoaXMucmV3YXJkSXRlbU5vZGVzKSB7XG4gICAgICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSB0aGlzLnJld2FyZENvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdhcmRJdGVtTm9kZXMuc29ydCgoYSwgYikgPT4gdGhpcy5nZXRSZXdhcmRJdGVtSW5kZXgoYSkgLSB0aGlzLmdldFJld2FyZEl0ZW1JbmRleChiKSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb2xsZWN0UmV3YXJkSXRlbU5vZGVzKGZyYW1lTm9kZTogY2MuTm9kZSwgcGFuZWw6IGNjLk5vZGUpOiBjYy5Ob2RlW10ge1xuICAgICAgICBjb25zdCByZXN1bHQ6IGNjLk5vZGVbXSA9IFtdO1xuICAgICAgICBjb25zdCBzZWVuOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcbiAgICAgICAgY29uc3QgY29sbGVjdEZyb20gPSAocGFyZW50OiBjYy5Ob2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBhcmVudCkgcmV0dXJuO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMzE7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRheU5vZGUgPSBwYXJlbnQuZ2V0Q2hpbGRCeU5hbWUoYGRheSR7aX1gKTtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBkYXlOb2RlID8gKChkYXlOb2RlIGFzIGFueSkudXVpZCB8fCBgJHtkYXlOb2RlLm5hbWV9XyR7cmVzdWx0Lmxlbmd0aH1gKSA6ICcnO1xuICAgICAgICAgICAgICAgIGlmIChkYXlOb2RlICYmICFzZWVuW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VlbltrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZGF5Tm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbGxlY3RGcm9tKHRoaXMucmV3YXJkQ29udGVudCk7XG4gICAgICAgIGNvbGxlY3RGcm9tKGZyYW1lTm9kZSk7XG4gICAgICAgIGlmIChmcmFtZU5vZGUgIT09IHBhbmVsKSBjb2xsZWN0RnJvbShwYW5lbCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUmV3YXJkSXRlbVRlbXBsYXRlKGZyYW1lTm9kZTogY2MuTm9kZSwgcGFuZWw6IGNjLk5vZGUpOiBjYy5Ob2RlIHtcbiAgICAgICAgY29uc3Qgc291cmNlcyA9IGZyYW1lTm9kZSA9PT0gcGFuZWwgPyBbZnJhbWVOb2RlXSA6IFtmcmFtZU5vZGUsIHBhbmVsXTtcbiAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc291cmNlcykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMzE7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRheU5vZGUgPSBzb3VyY2UuZ2V0Q2hpbGRCeU5hbWUoYGRheSR7aX1gKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF5Tm9kZSkgcmV0dXJuIGRheU5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZXdhcmRJdGVtSW5kZXgoaXRlbU5vZGU6IGNjLk5vZGUpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBtYXRjaCA9IGl0ZW1Ob2RlICYmIGl0ZW1Ob2RlLm5hbWUgPyBpdGVtTm9kZS5uYW1lLm1hdGNoKC9eZGF5KFxcZCspJC8pIDogbnVsbDtcbiAgICAgICAgcmV0dXJuIG1hdGNoID8gTnVtYmVyKG1hdGNoWzFdKSA6IDk5OTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJld2FyZEl0ZW1TaXplKGl0ZW1Ob2RlOiBjYy5Ob2RlKTogY2MuU2l6ZSB7XG4gICAgICAgIHJldHVybiBjYy5zaXplKFxuICAgICAgICAgICAgTWF0aC5tYXgoaXRlbU5vZGUud2lkdGgsIDEyMCksXG4gICAgICAgICAgICBNYXRoLm1heChpdGVtTm9kZS5oZWlnaHQsIDE2MClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFJld2FyZEl0ZW1EYXRhKGRheU5vZGU6IGNjLk5vZGUsIHJld2FyZERhdGE6IFdlZWtseVJld2FyZEl0ZW0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbGFiZWxOb2RlID0gZGF5Tm9kZS5nZXRDaGlsZEJ5TmFtZSgnTGFiZWwnKTtcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBsYWJlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IHJld2FyZERhdGEubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJld2FyZFN0cmluZyA9IGB4JHtyZXdhcmREYXRhLnJld2FyZE51bX1gO1xuICAgICAgICBjb25zdCBqdWVzZTEgPSBkYXlOb2RlLmdldENoaWxkQnlOYW1lKCdqdWVzZTEnKTtcbiAgICAgICAgY29uc3QgbnVtTGFiZWwgPSBqdWVzZTEgJiYganVlc2UxLmdldENoaWxkQnlOYW1lKCdudW0nKVxuICAgICAgICAgICAgPyBqdWVzZTEuZ2V0Q2hpbGRCeU5hbWUoJ251bScpLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgaWYgKG51bUxhYmVsKSB7XG4gICAgICAgICAgICBudW1MYWJlbC5zdHJpbmcgPSByZXdhcmRTdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXdhcmROb2RlID0gZGF5Tm9kZS5nZXRDaGlsZEJ5TmFtZSgncmV3YXJkJyk7XG4gICAgICAgIGNvbnN0IGdvdE5vZGUgPSBkYXlOb2RlLmdldENoaWxkQnlOYW1lKCdnb3QnKTtcbiAgICAgICAgaWYgKCFyZXdhcmROb2RlIHx8ICFnb3ROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IHJld2FyZE5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ0JhY2tncm91bmQnKTtcbiAgICAgICAgaWYgKCFiYWNrZ3JvdW5kTm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGFiZWxDaGlsZCA9IGJhY2tncm91bmROb2RlLmdldENoaWxkQnlOYW1lKCdMYWJlbCcpO1xuICAgICAgICBjb25zdCByZXdhcmRMYWJlbCA9IGxhYmVsQ2hpbGQgPyBsYWJlbENoaWxkLmdldENvbXBvbmVudChjYy5MYWJlbCkgOiBudWxsO1xuICAgICAgICBiYWNrZ3JvdW5kTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgYmFja2dyb3VuZE5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG5cbiAgICAgICAgaWYgKHJld2FyZERhdGEuaXNDbGFpbWVkKSB7XG4gICAgICAgICAgICByZXdhcmROb2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBnb3ROb2RlLmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICBjb25zdCBzcHJpdGVDb21wb25lbnQgPSBiYWNrZ3JvdW5kTm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgIGlmIChzcHJpdGVDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpY29uUGF0aCA9IGB6ekltZy9hbm5pdXlpbGluZ3F1YDtcbiAgICAgICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlcyhpY29uUGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnIsIHNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYExvYWQgJHtpY29uUGF0aH0gZmFpbGVkOmAsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGVDb21wb25lbnQuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmV3YXJkTGFiZWwpIHtcbiAgICAgICAgICAgICAgICByZXdhcmRMYWJlbC5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJld2FyZERhdGEuaXNBdmFpbGFibGUpIHtcbiAgICAgICAgICAgIHJld2FyZE5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGdvdE5vZGUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChyZXdhcmRMYWJlbCkge1xuICAgICAgICAgICAgICAgIHJld2FyZExhYmVsLnN0cmluZyA9ICcnO1xuICAgICAgICAgICAgICAgIHJld2FyZExhYmVsLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhY2tncm91bmROb2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgKCkgPT4gdGhpcy5vbkNsYWltQ2xpY2socmV3YXJkRGF0YS5pZCksIHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHJld2FyZERhdGEuaXNNaXNzZWQpIHtcbiAgICAgICAgICAgIHJld2FyZE5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGdvdE5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMjgsIDEyOCwgMTI4KTtcblxuICAgICAgICAgICAgaWYgKHJld2FyZExhYmVsKSB7XG4gICAgICAgICAgICAgICAgcmV3YXJkTGFiZWwuc3RyaW5nID0gJyc7XG4gICAgICAgICAgICAgICAgcmV3YXJkTGFiZWwubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJld2FyZE5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBnb3ROb2RlLmFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld0xhYmVsTm9kZSA9IGdvdE5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ05ldyBMYWJlbCcpO1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBuZXdMYWJlbE5vZGUgPyBuZXdMYWJlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSA6IG51bGw7XG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBgJHtyZXdhcmREYXRhLmRheXNVbnRpbEF2YWlsYWJsZX3lpKnlkI7lj6/pooblj5ZgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNsYWltQ2xpY2socmV3YXJkSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCByZXdhcmQgPSB0aGlzLndlZWtseVJld2FyZHMuZmluZChyID0+IHIuaWQgPT09IHJld2FyZElkKTtcbiAgICAgICAgaWYgKCFyZXdhcmQpIHJldHVybjtcbiAgICAgICAgaWYgKCFyZXdhcmQuaXNBdmFpbGFibGUpIHJldHVybjtcbiAgICAgICAgaWYgKHJld2FyZC5pc0NsYWltZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmdpdmVSZXdhcmQocmV3YXJkKTtcbiAgICAgICAgcmV3YXJkLmlzQ2xhaW1lZCA9IHRydWU7XG4gICAgICAgIHRoaXMubWFya1Jld2FyZENsYWltZWQocmV3YXJkSWQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVdlZWtseVJld2FyZFVJKCk7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGDojrflvpcke3Jld2FyZC5yZXdhcmROdW196ZK755+z44CCYCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNsb3NlQ2xpY2soKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dUb2FzdChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgVGlwc01hbmFnZXIuc2hvdyhtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvdygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMucmVmcmVzaFdlZWtseVJld2FyZHMoKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlbG9hZCB3ZWVrbHkgcmV3YXJkIGNvbmZpZyBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbn1cbiJdfQ==