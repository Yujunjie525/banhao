"use strict";
cc._RF.push(module, 'f9e40tjO61M7r2qGBtfEI+5', 'LevelSelectManager');
// Scripts/Manager/LevelSelectManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TipsManager_1 = require("../Load/TipsManager");
var GameData_1 = require("../Load/GameData");
var GameState_1 = require("../game/GameState");
var StateBridge_1 = require("../game/StateBridge");
var config_1 = require("../game/config");
var WarriorRunConfig_1 = require("../game/WarriorRunConfig");
var UserDataSyncManager_1 = require("./UserDataSyncManager");
var LevelSelectManager = /** @class */ (function (_super) {
    __extends(LevelSelectManager, _super);
    function LevelSelectManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.levelScrollView = null;
        _this.content = null;
        _this.levelItemPrefab = null;
        _this.closeBtn = null;
        _this.tipsLabel = null;
        _this._levelItems = [];
        _this._sprites = {};
        _this._assetsReady = false;
        _this._built = false;
        _this._colCount = 2;
        _this._gapX = 30;
        _this._gapY = 20;
        _this._paddingTop = 20;
        _this._paddingBottom = 20;
        return _this;
    }
    LevelSelectManager.prototype.onLoad = function () {
        this._resolveNodes();
        this._bindCloseButton();
    };
    LevelSelectManager.prototype.onEnable = function () {
        this._showActivePanel();
    };
    LevelSelectManager.prototype.show = function () {
        StateBridge_1.default.prepareLevelSelection();
        GameData_1.default.shouldOpenLevelSelect = false;
        if (!this.node.active) {
            this.node.active = true;
            return;
        }
        this._showActivePanel();
    };
    LevelSelectManager.prototype._showActivePanel = function () {
        var _this = this;
        this._resolveNodes();
        this._bindCloseButton();
        if (this.tipsLabel)
            this.tipsLabel.node.active = false;
        this._loadAssets(function () {
            _this._buildList();
            _this._refreshList();
            _this._scrollToUnlockedLevel();
        });
    };
    LevelSelectManager.prototype.close = function () {
        this.node.active = false;
    };
    LevelSelectManager.prototype.initLevelList = function () {
        this._refreshList();
    };
    LevelSelectManager.prototype._resolveNodes = function () {
        if (!this.closeBtn)
            this.closeBtn = this.node.getChildByName('BtnClose');
        if (!this.levelScrollView) {
            var scrollNode = this.node.getChildByName('LevelScrollView');
            this.levelScrollView = scrollNode && scrollNode.getComponent(cc.ScrollView);
        }
        if (!this.content && this.levelScrollView) {
            this.content = this.levelScrollView.content;
        }
        if (!this.tipsLabel) {
            var tipsNode = this.node.getChildByName('Tips');
            this.tipsLabel = tipsNode && tipsNode.getComponent(cc.Label);
        }
    };
    LevelSelectManager.prototype._bindCloseButton = function () {
        if (!this.closeBtn)
            return;
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.close, this);
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.close, this);
    };
    LevelSelectManager.prototype._loadAssets = function (done) {
        var _this = this;
        if (this._assetsReady) {
            done();
            return;
        }
        var paths = [
            'zzzImg/peitu1',
            'zzzImg/peitu2',
            'zzzImg/peitu3',
            'zzzImg/peitu4',
            'zzzImg/peitu5',
            'zzzImg/wujiaoxing1',
            'zzzImg/wujiaoxing2',
        ];
        var left = paths.length;
        paths.forEach(function (path) {
            cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
                var key = path.substring(path.lastIndexOf('/') + 1);
                if (err) {
                    cc.warn('[LevelSelect] load sprite failed:', path, err);
                }
                else {
                    _this._sprites[key] = spriteFrame;
                }
                left--;
                if (left <= 0) {
                    _this._assetsReady = true;
                    done();
                }
            });
        });
    };
    LevelSelectManager.prototype._buildList = function () {
        var _this = this;
        if (this._built)
            return;
        if (!this.content || !this.levelItemPrefab) {
            cc.error('[LevelSelect] LevelScrollView content or LevelItemPrefab is missing');
            return;
        }
        this.content.removeAllChildren();
        this._levelItems = [];
        var total = this._getTotalLevels();
        var sample = cc.instantiate(this.levelItemPrefab);
        var itemW = sample.width || 220;
        var itemH = sample.height || 262;
        sample.destroy();
        var rows = Math.ceil(total / this._colCount);
        var totalW = this._colCount * itemW + (this._colCount - 1) * this._gapX;
        var contentW = Math.max(this.content.width, totalW);
        this.content.width = contentW;
        this.content.height = this._paddingTop + rows * itemH + Math.max(0, rows - 1) * this._gapY + this._paddingBottom;
        var _loop_1 = function (level) {
            var item = cc.instantiate(this_1.levelItemPrefab);
            item.name = 'LevelItem_' + level;
            var index = level - 1;
            var row = Math.floor(index / this_1._colCount);
            var col = index % this_1._colCount;
            item.x = -totalW / 2 + itemW / 2 + col * (itemW + this_1._gapX);
            item.y = -this_1._paddingTop - itemH / 2 - row * (itemH + this_1._gapY);
            item.targetOff(this_1);
            item.on(cc.Node.EventType.TOUCH_END, function () { return _this._onClickLevel(level); }, this_1);
            this_1.content.addChild(item);
            this_1._levelItems.push(item);
        };
        var this_1 = this;
        for (var level = 1; level <= total; level++) {
            _loop_1(level);
        }
        this._built = true;
    };
    LevelSelectManager.prototype._refreshList = function () {
        var _this = this;
        if (!this._built)
            return;
        StateBridge_1.default.syncForStartScene();
        GameData_1.default.GetLevelData();
        var progress = GameState_1.getProgress();
        var unlockedLevel = Math.max(1, Math.floor(Number(progress.unlocked_level || GameData_1.default.unlockedLevel) || 1));
        this._levelItems.forEach(function (item, index) {
            var level = index + 1;
            var locked = level > unlockedLevel;
            var stars = locked ? 0 : _this._getLevelStars(level);
            _this._setLevelBg(item, level);
            _this._setLevelNumber(item, level);
            _this._setLock(item, locked);
            _this._setStars(item, stars);
        });
    };
    LevelSelectManager.prototype._setLevelBg = function (item, level) {
        var levelBg = item.getChildByName('LevelBg');
        var sprite = levelBg && levelBg.getComponent(cc.Sprite);
        var groupSize = Math.max(1, Math.ceil(this._getTotalLevels() / 5));
        var groupIndex = Math.max(1, Math.min(5, Math.ceil(level / groupSize)));
        var key = 'peitu' + groupIndex;
        if (sprite && this._sprites[key]) {
            sprite.spriteFrame = this._sprites[key];
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }
    };
    LevelSelectManager.prototype._setLevelNumber = function (item, level) {
        var numberNode = item.getChildByName('LevelNumber');
        var label = numberNode && numberNode.getComponent(cc.Label);
        if (label)
            label.string = '第' + String(level) + '关';
    };
    LevelSelectManager.prototype._setLock = function (item, locked) {
        var lockNode = item.getChildByName('suoBg');
        if (lockNode)
            lockNode.active = locked;
    };
    LevelSelectManager.prototype._setStars = function (item, stars) {
        var starsNode = item.getChildByName('Stars');
        if (!starsNode)
            return;
        var fullStar = this._sprites['wujiaoxing1'];
        var grayStar = this._sprites['wujiaoxing2'];
        starsNode.children.forEach(function (starNode, index) {
            starNode.active = true;
            var sprite = starNode.getComponent(cc.Sprite);
            if (!sprite)
                return;
            var frame = index < stars ? fullStar : grayStar;
            if (frame) {
                sprite.spriteFrame = frame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    };
    LevelSelectManager.prototype._onClickLevel = function (level) {
        StateBridge_1.default.syncForStartScene();
        GameData_1.default.GetLevelData();
        var progress = GameState_1.getProgress();
        var unlockedLevel = Math.max(1, Math.floor(Number(progress.unlocked_level || GameData_1.default.unlockedLevel) || 1));
        if (level > unlockedLevel || level > this._getTotalLevels()) {
            this._showTip('关卡未解锁。');
            return;
        }
        if (progress.stamina < config_1.default.levelCost) {
            this._showTip('体力不足，无法开始游戏。');
            return;
        }
        GameData_1.default.isInfiniteMode = false;
        GameData_1.default.currentLevel = level;
        GameData_1.default.SaveLevelData();
        GameState_1.default.selectedLevel = level;
        progress.stamina -= config_1.default.levelCost;
        progress.last_stamina_time = Math.floor(Date.now() / 1000);
        GameState_1.saveProgress();
        UserDataSyncManager_1.default.recordConsumedStamina(config_1.default.levelCost);
        StateBridge_1.default.syncNewToOld();
        cc.audioEngine.stopAll();
        cc.director.loadScene('WarriorRun');
    };
    LevelSelectManager.prototype._scrollToUnlockedLevel = function () {
        if (!this.levelScrollView || !this.content || this._levelItems.length === 0)
            return;
        var progress = GameState_1.getProgress();
        var unlockedLevel = Math.max(1, Math.min(this._getTotalLevels(), Math.floor(Number(progress.unlocked_level || GameData_1.default.unlockedLevel) || 1)));
        var targetItem = this._levelItems[unlockedLevel - 1];
        if (!targetItem)
            return;
        var viewHeight = this.levelScrollView.node.height;
        var maxOffsetY = Math.max(0, this.content.height - viewHeight);
        var targetY = Math.max(0, Math.min(maxOffsetY, -targetItem.y - viewHeight * 0.5));
        this.levelScrollView.scrollToOffset(cc.v2(0, targetY), 0.2);
    };
    LevelSelectManager.prototype._getTotalLevels = function () {
        return WarriorRunConfig_1.default.levels.length;
    };
    LevelSelectManager.prototype._getLevelStars = function (level) {
        var progress = GameState_1.getProgress();
        var starsMap = progress.level_stars || {};
        var stars = Math.max(0, Math.floor(Number(starsMap[String(level)] || 0)));
        return Math.min(3, stars);
    };
    LevelSelectManager.prototype._showTip = function (text) {
        // if (this.tipsLabel) {
        //     this.tipsLabel.node.active = true;
        //     this.tipsLabel.string = text;
        //     this.unschedule(this._hideTip);
        //     this.scheduleOnce(this._hideTip, 1.5);
        // } else {
        TipsManager_1.default.show(text);
        // }
    };
    LevelSelectManager.prototype._hideTip = function () {
        if (this.tipsLabel)
            this.tipsLabel.node.active = false;
    };
    __decorate([
        property(cc.ScrollView)
    ], LevelSelectManager.prototype, "levelScrollView", void 0);
    __decorate([
        property(cc.Node)
    ], LevelSelectManager.prototype, "content", void 0);
    __decorate([
        property(cc.Prefab)
    ], LevelSelectManager.prototype, "levelItemPrefab", void 0);
    __decorate([
        property(cc.Node)
    ], LevelSelectManager.prototype, "closeBtn", void 0);
    __decorate([
        property(cc.Label)
    ], LevelSelectManager.prototype, "tipsLabel", void 0);
    LevelSelectManager = __decorate([
        ccclass
    ], LevelSelectManager);
    return LevelSelectManager;
}(cc.Component));
exports.default = LevelSelectManager;

cc._RF.pop();