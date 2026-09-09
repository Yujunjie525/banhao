
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/LevelSelectManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcTGV2ZWxTZWxlY3RNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUU1QyxtREFBOEM7QUFDOUMsNkNBQXlDO0FBQ3pDLCtDQUF5RTtBQUN6RSxtREFBOEM7QUFDOUMseUNBQWlDO0FBQ2pDLDZEQUF3RDtBQUN4RCw2REFBd0Q7QUFHeEQ7SUFBZ0Qsc0NBQVk7SUFBNUQ7UUFBQSxxRUFpU0M7UUEvUkcscUJBQWUsR0FBa0IsSUFBSSxDQUFDO1FBR3RDLGFBQU8sR0FBWSxJQUFJLENBQUM7UUFHeEIscUJBQWUsR0FBYyxJQUFJLENBQUM7UUFHbEMsY0FBUSxHQUFZLElBQUksQ0FBQztRQUd6QixlQUFTLEdBQWEsSUFBSSxDQUFDO1FBRW5CLGlCQUFXLEdBQWMsRUFBRSxDQUFDO1FBQzVCLGNBQVEsR0FBbUMsRUFBRSxDQUFDO1FBQzlDLGtCQUFZLEdBQVksS0FBSyxDQUFDO1FBQzlCLFlBQU0sR0FBWSxLQUFLLENBQUM7UUFFZixlQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLFdBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsV0FBSyxHQUFXLEVBQUUsQ0FBQztRQUNuQixpQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUN6QixvQkFBYyxHQUFXLEVBQUUsQ0FBQzs7SUF3UWpELENBQUM7SUF0UUcsbUNBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQscUNBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxpQ0FBSSxHQUFKO1FBQ0kscUJBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3BDLGtCQUFTLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDeEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLDZDQUFnQixHQUF4QjtRQUFBLGlCQVNDO1FBUkcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxXQUFXLENBQUM7WUFDYixLQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsS0FBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLEtBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtDQUFLLEdBQUw7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVELDBDQUFhLEdBQWI7UUFDSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVPLDBDQUFhLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6RSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN2QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQy9FO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDakIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEU7SUFDTCxDQUFDO0lBRU8sNkNBQWdCLEdBQXhCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8sd0NBQVcsR0FBbkIsVUFBb0IsSUFBZ0I7UUFBcEMsaUJBK0JDO1FBOUJHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLEVBQUUsQ0FBQztZQUNQLE9BQU87U0FDVjtRQUVELElBQU0sS0FBSyxHQUFHO1lBQ1YsZUFBZTtZQUNmLGVBQWU7WUFDZixlQUFlO1lBQ2YsZUFBZTtZQUNmLGVBQWU7WUFDZixvQkFBb0I7WUFDcEIsb0JBQW9CO1NBQ3ZCLENBQUM7UUFDRixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFZO1lBQ3ZCLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsR0FBVSxFQUFFLFdBQTJCO2dCQUM1RSxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELElBQUksR0FBRyxFQUFFO29CQUNMLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUMzRDtxQkFBTTtvQkFDSCxLQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQztpQkFDcEM7Z0JBQ0QsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO29CQUNYLEtBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO29CQUN6QixJQUFJLEVBQUUsQ0FBQztpQkFDVjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sdUNBQVUsR0FBbEI7UUFBQSxpQkFxQ0M7UUFwQ0csSUFBSSxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hDLEVBQUUsQ0FBQyxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztZQUNoRixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFdEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BELElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDO1FBQ2xDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVqQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDMUUsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7Z0NBRXhHLEtBQUs7WUFDVixJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQUssZUFBZSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ2pDLElBQU0sS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBSyxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsT0FBSyxTQUFTLENBQUM7WUFDbkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsT0FBSyxLQUFLLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBSyxXQUFXLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsT0FBSyxLQUFLLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsU0FBUyxRQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQXpCLENBQXlCLFNBQU8sQ0FBQztZQUM1RSxPQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsT0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7UUFYaEMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssRUFBRSxLQUFLLEVBQUU7b0JBQWxDLEtBQUs7U0FZYjtRQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyx5Q0FBWSxHQUFwQjtRQUFBLGlCQWdCQztRQWZHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDekIscUJBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hDLGtCQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFekIsSUFBTSxRQUFRLEdBQUcsdUJBQVcsRUFBRSxDQUFDO1FBQy9CLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLElBQUksa0JBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9HLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBYSxFQUFFLEtBQWE7WUFDbEQsSUFBTSxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUN4QixJQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUcsYUFBYSxDQUFDO1lBQ3JDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RELEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlCLEtBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHdDQUFXLEdBQW5CLFVBQW9CLElBQWEsRUFBRSxLQUFhO1FBQzVDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsSUFBTSxNQUFNLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQU0sR0FBRyxHQUFHLE9BQU8sR0FBRyxVQUFVLENBQUM7UUFDakMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5QixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7U0FDL0M7SUFDTCxDQUFDO0lBRU8sNENBQWUsR0FBdkIsVUFBd0IsSUFBYSxFQUFFLEtBQWE7UUFDaEQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxJQUFNLEtBQUssR0FBRyxVQUFVLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUQsSUFBSSxLQUFLO1lBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUN4RCxDQUFDO0lBRU8scUNBQVEsR0FBaEIsVUFBaUIsSUFBYSxFQUFFLE1BQWU7UUFDM0MsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVE7WUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUMzQyxDQUFDO0lBRU8sc0NBQVMsR0FBakIsVUFBa0IsSUFBYSxFQUFFLEtBQWE7UUFDMUMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM5QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBaUIsRUFBRSxLQUFhO1lBQ3hELFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU87WUFDcEIsSUFBTSxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDbEQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1AsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQy9DO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sMENBQWEsR0FBckIsVUFBc0IsS0FBYTtRQUMvQixxQkFBVyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDaEMsa0JBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QixJQUFNLFFBQVEsR0FBRyx1QkFBVyxFQUFFLENBQUM7UUFDL0IsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsSUFBSSxrQkFBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFL0csSUFBSSxLQUFLLEdBQUcsYUFBYSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDekQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLFFBQVEsQ0FBQyxPQUFPLEdBQUcsZ0JBQUcsQ0FBQyxTQUFTLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QixPQUFPO1NBQ1Y7UUFFRCxrQkFBUyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDakMsa0JBQVMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQy9CLGtCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFMUIsbUJBQVMsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLFFBQVEsQ0FBQyxPQUFPLElBQUksZ0JBQUcsQ0FBQyxTQUFTLENBQUM7UUFDbEMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzNELHdCQUFZLEVBQUUsQ0FBQztRQUNmLDZCQUFtQixDQUFDLHFCQUFxQixDQUFDLGdCQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekQscUJBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQixFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTyxtREFBc0IsR0FBOUI7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFFcEYsSUFBTSxRQUFRLEdBQUcsdUJBQVcsRUFBRSxDQUFDO1FBQy9CLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLElBQUksa0JBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakosSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPO1FBRXhCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQztRQUNqRSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVPLDRDQUFlLEdBQXZCO1FBQ0ksT0FBTywwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFTywyQ0FBYyxHQUF0QixVQUF1QixLQUFhO1FBQ2hDLElBQU0sUUFBUSxHQUFHLHVCQUFXLEVBQUUsQ0FBQztRQUMvQixJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM1QyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLHFDQUFRLEdBQWhCLFVBQWlCLElBQVk7UUFDekIsd0JBQXdCO1FBQ3hCLHlDQUF5QztRQUN6QyxvQ0FBb0M7UUFDcEMsc0NBQXNDO1FBQ3RDLDZDQUE2QztRQUM3QyxXQUFXO1FBQ1AscUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSTtJQUNSLENBQUM7SUFFTyxxQ0FBUSxHQUFoQjtRQUNJLElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzNELENBQUM7SUE5UkQ7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQzsrREFDYztJQUd0QztRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3VEQUNNO0lBR3hCO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7K0RBQ2M7SUFHbEM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzt3REFDTztJQUd6QjtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO3lEQUNRO0lBZFYsa0JBQWtCO1FBRHRDLE9BQU87T0FDYSxrQkFBa0IsQ0FpU3RDO0lBQUQseUJBQUM7Q0FqU0QsQUFpU0MsQ0FqUytDLEVBQUUsQ0FBQyxTQUFTLEdBaVMzRDtrQkFqU29CLGtCQUFrQiIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbmltcG9ydCBUaXBzTWFuYWdlciBmcm9tICcuLi9Mb2FkL1RpcHNNYW5hZ2VyJztcbmltcG9ydCBtR2FtZURhdGEgZnJvbSAnLi4vTG9hZC9HYW1lRGF0YSc7XG5pbXBvcnQgR2FtZVN0YXRlLCB7IGdldFByb2dyZXNzLCBzYXZlUHJvZ3Jlc3MgfSBmcm9tICcuLi9nYW1lL0dhbWVTdGF0ZSc7XG5pbXBvcnQgU3RhdGVCcmlkZ2UgZnJvbSAnLi4vZ2FtZS9TdGF0ZUJyaWRnZSc7XG5pbXBvcnQgY2ZnIGZyb20gJy4uL2dhbWUvY29uZmlnJztcbmltcG9ydCB3YXJyaW9yUnVuQ29uZmlnIGZyb20gJy4uL2dhbWUvV2FycmlvclJ1bkNvbmZpZyc7XG5pbXBvcnQgVXNlckRhdGFTeW5jTWFuYWdlciBmcm9tICcuL1VzZXJEYXRhU3luY01hbmFnZXInO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxTZWxlY3RNYW5hZ2VyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcbiAgICBAcHJvcGVydHkoY2MuU2Nyb2xsVmlldylcbiAgICBsZXZlbFNjcm9sbFZpZXc6IGNjLlNjcm9sbFZpZXcgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpXG4gICAgY29udGVudDogY2MuTm9kZSA9IG51bGw7XG5cbiAgICBAcHJvcGVydHkoY2MuUHJlZmFiKVxuICAgIGxldmVsSXRlbVByZWZhYjogY2MuUHJlZmFiID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxuICAgIGNsb3NlQnRuOiBjYy5Ob2RlID0gbnVsbDtcblxuICAgIEBwcm9wZXJ0eShjYy5MYWJlbClcbiAgICB0aXBzTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcblxuICAgIHByaXZhdGUgX2xldmVsSXRlbXM6IGNjLk5vZGVbXSA9IFtdO1xuICAgIHByaXZhdGUgX3Nwcml0ZXM6IFJlY29yZDxzdHJpbmcsIGNjLlNwcml0ZUZyYW1lPiA9IHt9O1xuICAgIHByaXZhdGUgX2Fzc2V0c1JlYWR5OiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfYnVpbHQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbENvdW50OiBudW1iZXIgPSAyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2dhcFg6IG51bWJlciA9IDMwO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2dhcFk6IG51bWJlciA9IDIwO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BhZGRpbmdUb3A6IG51bWJlciA9IDIwO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BhZGRpbmdCb3R0b206IG51bWJlciA9IDIwO1xuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICB0aGlzLl9yZXNvbHZlTm9kZXMoKTtcbiAgICAgICAgdGhpcy5fYmluZENsb3NlQnV0dG9uKCk7XG4gICAgfVxuXG4gICAgb25FbmFibGUoKSB7XG4gICAgICAgIHRoaXMuX3Nob3dBY3RpdmVQYW5lbCgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIFN0YXRlQnJpZGdlLnByZXBhcmVMZXZlbFNlbGVjdGlvbigpO1xuICAgICAgICBtR2FtZURhdGEuc2hvdWxkT3BlbkxldmVsU2VsZWN0ID0gZmFsc2U7XG4gICAgICAgIGlmICghdGhpcy5ub2RlLmFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2hvd0FjdGl2ZVBhbmVsKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2hvd0FjdGl2ZVBhbmVsKCkge1xuICAgICAgICB0aGlzLl9yZXNvbHZlTm9kZXMoKTtcbiAgICAgICAgdGhpcy5fYmluZENsb3NlQnV0dG9uKCk7XG4gICAgICAgIGlmICh0aGlzLnRpcHNMYWJlbCkgdGhpcy50aXBzTGFiZWwubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbG9hZEFzc2V0cygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZExpc3QoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hMaXN0KCk7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxUb1VubG9ja2VkTGV2ZWwoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpbml0TGV2ZWxMaXN0KCkge1xuICAgICAgICB0aGlzLl9yZWZyZXNoTGlzdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Jlc29sdmVOb2RlcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNsb3NlQnRuKSB0aGlzLmNsb3NlQnRuID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKCdCdG5DbG9zZScpO1xuXG4gICAgICAgIGlmICghdGhpcy5sZXZlbFNjcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ0xldmVsU2Nyb2xsVmlldycpO1xuICAgICAgICAgICAgdGhpcy5sZXZlbFNjcm9sbFZpZXcgPSBzY3JvbGxOb2RlICYmIHNjcm9sbE5vZGUuZ2V0Q29tcG9uZW50KGNjLlNjcm9sbFZpZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbnRlbnQgJiYgdGhpcy5sZXZlbFNjcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudCA9IHRoaXMubGV2ZWxTY3JvbGxWaWV3LmNvbnRlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMudGlwc0xhYmVsKSB7XG4gICAgICAgICAgICBjb25zdCB0aXBzTm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZSgnVGlwcycpO1xuICAgICAgICAgICAgdGhpcy50aXBzTGFiZWwgPSB0aXBzTm9kZSAmJiB0aXBzTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYmluZENsb3NlQnV0dG9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuY2xvc2VCdG4pIHJldHVybjtcbiAgICAgICAgdGhpcy5jbG9zZUJ0bi5vZmYoY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLmNsb3NlLCB0aGlzKTtcbiAgICAgICAgdGhpcy5jbG9zZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMuY2xvc2UsIHRoaXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2xvYWRBc3NldHMoZG9uZTogKCkgPT4gdm9pZCkge1xuICAgICAgICBpZiAodGhpcy5fYXNzZXRzUmVhZHkpIHtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhdGhzID0gW1xuICAgICAgICAgICAgJ3p6ekltZy9wZWl0dTEnLFxuICAgICAgICAgICAgJ3p6ekltZy9wZWl0dTInLFxuICAgICAgICAgICAgJ3p6ekltZy9wZWl0dTMnLFxuICAgICAgICAgICAgJ3p6ekltZy9wZWl0dTQnLFxuICAgICAgICAgICAgJ3p6ekltZy9wZWl0dTUnLFxuICAgICAgICAgICAgJ3p6ekltZy93dWppYW94aW5nMScsXG4gICAgICAgICAgICAnenp6SW1nL3d1amlhb3hpbmcyJyxcbiAgICAgICAgXTtcbiAgICAgICAgbGV0IGxlZnQgPSBwYXRocy5sZW5ndGg7XG4gICAgICAgIHBhdGhzLmZvckVhY2goKHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMocGF0aCwgY2MuU3ByaXRlRnJhbWUsIChlcnI6IEVycm9yLCBzcHJpdGVGcmFtZTogY2MuU3ByaXRlRnJhbWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBwYXRoLnN1YnN0cmluZyhwYXRoLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLndhcm4oJ1tMZXZlbFNlbGVjdF0gbG9hZCBzcHJpdGUgZmFpbGVkOicsIHBhdGgsIGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlc1trZXldID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxlZnQtLTtcbiAgICAgICAgICAgICAgICBpZiAobGVmdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Fzc2V0c1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9idWlsZExpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLl9idWlsdCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuY29udGVudCB8fCAhdGhpcy5sZXZlbEl0ZW1QcmVmYWIpIHtcbiAgICAgICAgICAgIGNjLmVycm9yKCdbTGV2ZWxTZWxlY3RdIExldmVsU2Nyb2xsVmlldyBjb250ZW50IG9yIExldmVsSXRlbVByZWZhYiBpcyBtaXNzaW5nJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbnRlbnQucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5fbGV2ZWxJdGVtcyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHRvdGFsID0gdGhpcy5fZ2V0VG90YWxMZXZlbHMoKTtcbiAgICAgICAgY29uc3Qgc2FtcGxlID0gY2MuaW5zdGFudGlhdGUodGhpcy5sZXZlbEl0ZW1QcmVmYWIpO1xuICAgICAgICBjb25zdCBpdGVtVyA9IHNhbXBsZS53aWR0aCB8fCAyMjA7XG4gICAgICAgIGNvbnN0IGl0ZW1IID0gc2FtcGxlLmhlaWdodCB8fCAyNjI7XG4gICAgICAgIHNhbXBsZS5kZXN0cm95KCk7XG5cbiAgICAgICAgY29uc3Qgcm93cyA9IE1hdGguY2VpbCh0b3RhbCAvIHRoaXMuX2NvbENvdW50KTtcbiAgICAgICAgY29uc3QgdG90YWxXID0gdGhpcy5fY29sQ291bnQgKiBpdGVtVyArICh0aGlzLl9jb2xDb3VudCAtIDEpICogdGhpcy5fZ2FwWDtcbiAgICAgICAgY29uc3QgY29udGVudFcgPSBNYXRoLm1heCh0aGlzLmNvbnRlbnQud2lkdGgsIHRvdGFsVyk7XG4gICAgICAgIHRoaXMuY29udGVudC53aWR0aCA9IGNvbnRlbnRXO1xuICAgICAgICB0aGlzLmNvbnRlbnQuaGVpZ2h0ID0gdGhpcy5fcGFkZGluZ1RvcCArIHJvd3MgKiBpdGVtSCArIE1hdGgubWF4KDAsIHJvd3MgLSAxKSAqIHRoaXMuX2dhcFkgKyB0aGlzLl9wYWRkaW5nQm90dG9tO1xuXG4gICAgICAgIGZvciAobGV0IGxldmVsID0gMTsgbGV2ZWwgPD0gdG90YWw7IGxldmVsKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmxldmVsSXRlbVByZWZhYik7XG4gICAgICAgICAgICBpdGVtLm5hbWUgPSAnTGV2ZWxJdGVtXycgKyBsZXZlbDtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbGV2ZWwgLSAxO1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpbmRleCAvIHRoaXMuX2NvbENvdW50KTtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGluZGV4ICUgdGhpcy5fY29sQ291bnQ7XG4gICAgICAgICAgICBpdGVtLnggPSAtdG90YWxXIC8gMiArIGl0ZW1XIC8gMiArIGNvbCAqIChpdGVtVyArIHRoaXMuX2dhcFgpO1xuICAgICAgICAgICAgaXRlbS55ID0gLXRoaXMuX3BhZGRpbmdUb3AgLSBpdGVtSCAvIDIgLSByb3cgKiAoaXRlbUggKyB0aGlzLl9nYXBZKTtcbiAgICAgICAgICAgIGl0ZW0udGFyZ2V0T2ZmKHRoaXMpO1xuICAgICAgICAgICAgaXRlbS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsICgpID0+IHRoaXMuX29uQ2xpY2tMZXZlbChsZXZlbCksIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LmFkZENoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5fbGV2ZWxJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYnVpbHQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlZnJlc2hMaXN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuX2J1aWx0KSByZXR1cm47XG4gICAgICAgIFN0YXRlQnJpZGdlLnN5bmNGb3JTdGFydFNjZW5lKCk7XG4gICAgICAgIG1HYW1lRGF0YS5HZXRMZXZlbERhdGEoKTtcblxuICAgICAgICBjb25zdCBwcm9ncmVzcyA9IGdldFByb2dyZXNzKCk7XG4gICAgICAgIGNvbnN0IHVubG9ja2VkTGV2ZWwgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKE51bWJlcihwcm9ncmVzcy51bmxvY2tlZF9sZXZlbCB8fCBtR2FtZURhdGEudW5sb2NrZWRMZXZlbCkgfHwgMSkpO1xuICAgICAgICB0aGlzLl9sZXZlbEl0ZW1zLmZvckVhY2goKGl0ZW06IGNjLk5vZGUsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gaW5kZXggKyAxO1xuICAgICAgICAgICAgY29uc3QgbG9ja2VkID0gbGV2ZWwgPiB1bmxvY2tlZExldmVsO1xuICAgICAgICAgICAgY29uc3Qgc3RhcnMgPSBsb2NrZWQgPyAwIDogdGhpcy5fZ2V0TGV2ZWxTdGFycyhsZXZlbCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRMZXZlbEJnKGl0ZW0sIGxldmVsKTtcbiAgICAgICAgICAgIHRoaXMuX3NldExldmVsTnVtYmVyKGl0ZW0sIGxldmVsKTtcbiAgICAgICAgICAgIHRoaXMuX3NldExvY2soaXRlbSwgbG9ja2VkKTtcbiAgICAgICAgICAgIHRoaXMuX3NldFN0YXJzKGl0ZW0sIHN0YXJzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0TGV2ZWxCZyhpdGVtOiBjYy5Ob2RlLCBsZXZlbDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGxldmVsQmcgPSBpdGVtLmdldENoaWxkQnlOYW1lKCdMZXZlbEJnJyk7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IGxldmVsQmcgJiYgbGV2ZWxCZy5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgY29uc3QgZ3JvdXBTaXplID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKHRoaXMuX2dldFRvdGFsTGV2ZWxzKCkgLyA1KSk7XG4gICAgICAgIGNvbnN0IGdyb3VwSW5kZXggPSBNYXRoLm1heCgxLCBNYXRoLm1pbig1LCBNYXRoLmNlaWwobGV2ZWwgLyBncm91cFNpemUpKSk7XG4gICAgICAgIGNvbnN0IGtleSA9ICdwZWl0dScgKyBncm91cEluZGV4O1xuICAgICAgICBpZiAoc3ByaXRlICYmIHRoaXMuX3Nwcml0ZXNba2V5XSkge1xuICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gdGhpcy5fc3ByaXRlc1trZXldO1xuICAgICAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3NldExldmVsTnVtYmVyKGl0ZW06IGNjLk5vZGUsIGxldmVsOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgbnVtYmVyTm9kZSA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ0xldmVsTnVtYmVyJyk7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gbnVtYmVyTm9kZSAmJiBudW1iZXJOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGlmIChsYWJlbCkgbGFiZWwuc3RyaW5nID0gJ+esrCcgKyBTdHJpbmcobGV2ZWwpICsgJ+WFsyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0TG9jayhpdGVtOiBjYy5Ob2RlLCBsb2NrZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgbG9ja05vZGUgPSBpdGVtLmdldENoaWxkQnlOYW1lKCdzdW9CZycpO1xuICAgICAgICBpZiAobG9ja05vZGUpIGxvY2tOb2RlLmFjdGl2ZSA9IGxvY2tlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRTdGFycyhpdGVtOiBjYy5Ob2RlLCBzdGFyczogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHN0YXJzTm9kZSA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoJ1N0YXJzJyk7XG4gICAgICAgIGlmICghc3RhcnNOb2RlKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZnVsbFN0YXIgPSB0aGlzLl9zcHJpdGVzWyd3dWppYW94aW5nMSddO1xuICAgICAgICBjb25zdCBncmF5U3RhciA9IHRoaXMuX3Nwcml0ZXNbJ3d1amlhb3hpbmcyJ107XG4gICAgICAgIHN0YXJzTm9kZS5jaGlsZHJlbi5mb3JFYWNoKChzdGFyTm9kZTogY2MuTm9kZSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgc3Rhck5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZSA9IHN0YXJOb2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgaWYgKCFzcHJpdGUpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gaW5kZXggPCBzdGFycyA/IGZ1bGxTdGFyIDogZ3JheVN0YXI7XG4gICAgICAgICAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBmcmFtZTtcbiAgICAgICAgICAgICAgICBzcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbkNsaWNrTGV2ZWwobGV2ZWw6IG51bWJlcikge1xuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jRm9yU3RhcnRTY2VuZSgpO1xuICAgICAgICBtR2FtZURhdGEuR2V0TGV2ZWxEYXRhKCk7XG4gICAgICAgIGNvbnN0IHByb2dyZXNzID0gZ2V0UHJvZ3Jlc3MoKTtcbiAgICAgICAgY29uc3QgdW5sb2NrZWRMZXZlbCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoTnVtYmVyKHByb2dyZXNzLnVubG9ja2VkX2xldmVsIHx8IG1HYW1lRGF0YS51bmxvY2tlZExldmVsKSB8fCAxKSk7XG5cbiAgICAgICAgaWYgKGxldmVsID4gdW5sb2NrZWRMZXZlbCB8fCBsZXZlbCA+IHRoaXMuX2dldFRvdGFsTGV2ZWxzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dUaXAoJ+WFs+WNoeacquino+mUgeOAgicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyZXNzLnN0YW1pbmEgPCBjZmcubGV2ZWxDb3N0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93VGlwKCfkvZPlipvkuI3otrPvvIzml6Dms5XlvIDlp4vmuLjmiI/jgIInKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG1HYW1lRGF0YS5pc0luZmluaXRlTW9kZSA9IGZhbHNlO1xuICAgICAgICBtR2FtZURhdGEuY3VycmVudExldmVsID0gbGV2ZWw7XG4gICAgICAgIG1HYW1lRGF0YS5TYXZlTGV2ZWxEYXRhKCk7XG5cbiAgICAgICAgR2FtZVN0YXRlLnNlbGVjdGVkTGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgcHJvZ3Jlc3Muc3RhbWluYSAtPSBjZmcubGV2ZWxDb3N0O1xuICAgICAgICBwcm9ncmVzcy5sYXN0X3N0YW1pbmFfdGltZSA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgICAgICBzYXZlUHJvZ3Jlc3MoKTtcbiAgICAgICAgVXNlckRhdGFTeW5jTWFuYWdlci5yZWNvcmRDb25zdW1lZFN0YW1pbmEoY2ZnLmxldmVsQ29zdCk7XG4gICAgICAgIFN0YXRlQnJpZGdlLnN5bmNOZXdUb09sZCgpO1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS5zdG9wQWxsKCk7XG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnV2FycmlvclJ1bicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Njcm9sbFRvVW5sb2NrZWRMZXZlbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxldmVsU2Nyb2xsVmlldyB8fCAhdGhpcy5jb250ZW50IHx8IHRoaXMuX2xldmVsSXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBnZXRQcm9ncmVzcygpO1xuICAgICAgICBjb25zdCB1bmxvY2tlZExldmVsID0gTWF0aC5tYXgoMSwgTWF0aC5taW4odGhpcy5fZ2V0VG90YWxMZXZlbHMoKSwgTWF0aC5mbG9vcihOdW1iZXIocHJvZ3Jlc3MudW5sb2NrZWRfbGV2ZWwgfHwgbUdhbWVEYXRhLnVubG9ja2VkTGV2ZWwpIHx8IDEpKSk7XG4gICAgICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0aGlzLl9sZXZlbEl0ZW1zW3VubG9ja2VkTGV2ZWwgLSAxXTtcbiAgICAgICAgaWYgKCF0YXJnZXRJdGVtKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgdmlld0hlaWdodCA9IHRoaXMubGV2ZWxTY3JvbGxWaWV3Lm5vZGUuaGVpZ2h0O1xuICAgICAgICBjb25zdCBtYXhPZmZzZXRZID0gTWF0aC5tYXgoMCwgdGhpcy5jb250ZW50LmhlaWdodCAtIHZpZXdIZWlnaHQpO1xuICAgICAgICBjb25zdCB0YXJnZXRZID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4T2Zmc2V0WSwgLXRhcmdldEl0ZW0ueSAtIHZpZXdIZWlnaHQgKiAwLjUpKTtcbiAgICAgICAgdGhpcy5sZXZlbFNjcm9sbFZpZXcuc2Nyb2xsVG9PZmZzZXQoY2MudjIoMCwgdGFyZ2V0WSksIDAuMik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0VG90YWxMZXZlbHMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHdhcnJpb3JSdW5Db25maWcubGV2ZWxzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRMZXZlbFN0YXJzKGxldmVsOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBwcm9ncmVzcyA9IGdldFByb2dyZXNzKCk7XG4gICAgICAgIGNvbnN0IHN0YXJzTWFwID0gcHJvZ3Jlc3MubGV2ZWxfc3RhcnMgfHwge307XG4gICAgICAgIGNvbnN0IHN0YXJzID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIoc3RhcnNNYXBbU3RyaW5nKGxldmVsKV0gfHwgMCkpKTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKDMsIHN0YXJzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zaG93VGlwKHRleHQ6IHN0cmluZykge1xuICAgICAgICAvLyBpZiAodGhpcy50aXBzTGFiZWwpIHtcbiAgICAgICAgLy8gICAgIHRoaXMudGlwc0xhYmVsLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgLy8gICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IHRleHQ7XG4gICAgICAgIC8vICAgICB0aGlzLnVuc2NoZWR1bGUodGhpcy5faGlkZVRpcCk7XG4gICAgICAgIC8vICAgICB0aGlzLnNjaGVkdWxlT25jZSh0aGlzLl9oaWRlVGlwLCAxLjUpO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgVGlwc01hbmFnZXIuc2hvdyh0ZXh0KTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2hpZGVUaXAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpcHNMYWJlbCkgdGhpcy50aXBzTGFiZWwubm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59XG4iXX0=