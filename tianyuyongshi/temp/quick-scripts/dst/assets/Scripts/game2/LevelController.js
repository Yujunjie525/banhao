
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game2/LevelController.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ad2a5YfDRVHeqQ2TFlTKomA', 'LevelController');
// Scripts/game2/LevelController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("./Constants");
var GameState_1 = require("./GameState");
var StateBridge_1 = require("./StateBridge");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
// 每个 LevelNode 行高（与编辑器里 LevelNode1 的高度一致）
var ROW_H = 200;
var ROW_GAP = 20;
var SF_CLEARED = '1b2fb13f-da3a-4385-a2fa-d60ac517f6ac'; // ui_2 已通关
var SF_CURRENT = '64cc429b-124a-456a-9405-89bc06e2d0ae'; // ui_4 当前选中
var SF_LOCKED = '09861065-928b-4cc4-b26f-dbe425b55cfc'; // ui_6 未解锁
var SF_STAR = 'ddd8fa7f-b741-47bb-83b7-77e915e6591b'; // ui_3 单颗星
var LevelController = /** @class */ (function (_super) {
    __extends(LevelController, _super);
    function LevelController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.topBar = null;
        _this.levelNode1 = null;
        _this.levelNode2 = null;
        _this.levelNode3 = null;
        _this.infoPanel = null;
        _this.levelNameLabel = null;
        _this.waveLabel = null;
        _this.dropIcon1 = null;
        _this.dropIcon2 = null;
        _this.dropIcon3 = null;
        _this.dropIcon4 = null;
        _this.dropIcon5 = null;
        _this.startBtn = null;
        _this.backBtn = null;
        _this.scrollViewNode = null;
        _this.levelItemTemplate = null;
        _this.levelNodeTemplate = null;
        _this.arrow1 = null;
        _this.arrow2 = null;
        _this.arrow3 = null;
        // icon 图集（textures/icon 目录）
        _this._iconSp = {};
        _this._sfMap = {};
        _this._sp = {};
        _this._zzImgSp = {};
        _this._selectedIdx = 0;
        _this._rowNodes = []; // 每关对应的 LevelNode 节点
        _this._starting = false;
        return _this;
    }
    LevelController.prototype.onLoad = function () {
        var _this = this;
        Constants_1.loadConfig(require('config'));
        this._selectedIdx = GameState_1.default.maxUnlockedLevel;
        if (this.scrollViewNode)
            this.scrollViewNode.active = false;
        if (this.levelNode2)
            this.levelNode2.active = false;
        if (this.levelNode3)
            this.levelNode3.active = false;
        if (this.arrow1)
            this.arrow1.active = false;
        if (this.arrow2)
            this.arrow2.active = false;
        if (this.arrow3)
            this.arrow3.active = false;
        cc.loader.loadResDir('textures/level', cc.SpriteFrame, function (err, frames) {
            if (err) {
                cc.error('[Level] level 贴图加载失败', err);
                return;
            }
            frames.forEach(function (f) { _this._sp[f.name] = f; });
            _this._buildSfMap();
            _this._applyStaticAssets();
            // 加载 icon 目录后再构建列表
            cc.loader.loadResDir('textures/icon', cc.SpriteFrame, function (err2, iconFrames) {
                if (!err2 && iconFrames) {
                    iconFrames.forEach(function (f) { _this._iconSp[f.name] = f; });
                }
                _this._loadNewLevelAssets(function () {
                    _this._buildList();
                    _this._selectLevel(_this._selectedIdx, false);
                });
            });
        });
        this._bindButtons();
    };
    LevelController.prototype._loadNewLevelAssets = function (done) {
        var _this = this;
        cc.loader.loadResDir('zzImg', cc.SpriteFrame, function (err, frames) {
            if (!err && frames)
                frames.forEach(function (f) { _this._zzImgSp[f.name] = f; });
            done();
        });
    };
    LevelController.prototype._buildSfMap = function () {
        var map = {
            'ui_2': SF_CLEARED, 'ui_4': SF_CURRENT,
            'ui_6': SF_LOCKED, 'ui_3': SF_STAR,
        };
        for (var name in map) {
            if (this._sp[name])
                this._sfMap[map[name]] = this._sp[name];
        }
    };
    LevelController.prototype._applyStaticAssets = function () {
        this._setSp(this.topBar, 'ui_1');
        this._setSp(this.infoPanel, 'ui_7');
        this._setSp(this.startBtn, 'ui_15');
    };
    LevelController.prototype._setSp = function (node, key) {
        if (!node || !this._sp[key])
            return;
        var s = node.getComponent(cc.Sprite);
        if (!s)
            s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = this._sp[key];
    };
    LevelController.prototype._setSpByUuid = function (node, uuid) {
        if (!node)
            return;
        var sf = this._sfMap[uuid];
        if (!sf)
            return;
        var s = node.getComponent(cc.Sprite);
        if (!s)
            s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = sf;
        // ui_2（已通关）图片原尺寸偏大，整体缩小到 80%
        node.scale = (uuid === SF_CLEARED) ? 0.8 : 1.0;
    };
    // ---- 构建列表 ----
    LevelController.prototype._buildList = function () {
        var sv = this.scrollViewNode
            ? this.scrollViewNode.getComponent(cc.ScrollView) : null;
        if (!sv || !sv.content)
            return;
        this.scrollViewNode.active = false;
        var tmpl = this.levelItemTemplate; // LevelItemTemplate 作为行模板
        if (!tmpl)
            return;
        var levels = Constants_1.CFG.levels;
        if (!levels || levels.length === 0) {
            cc.warn('[Level] CFG.levels 为空');
            return;
        }
        this._selectedIdx = Math.max(0, Math.min(this._selectedIdx, levels.length - 1));
        var maxUnlocked = GameState_1.default.maxUnlockedLevel;
        var rowH = (tmpl.height || ROW_H) + ROW_GAP;
        var totalH = levels.length * rowH;
        this._rowNodes = [];
        sv.content.children.slice().forEach(function (child) {
            if (child !== tmpl)
                child.destroy();
        });
        tmpl.parent = sv.content;
        tmpl.active = true;
        // content 高度
        sv.content.setContentSize(sv.content.width, totalH);
        for (var i = 0; i < levels.length; i++) {
            var row = i === 0 ? tmpl : cc.instantiate(tmpl);
            row.active = true;
            row.parent = sv.content;
            this._setupRow(row, i, levels[i], maxUnlocked);
            this._rowNodes.push(row);
        }
        // 排列所有行：content anchor=(0.5,0.5)，第 i 行从顶部往下
        for (var i = 0; i < this._rowNodes.length; i++) {
            this._rowNodes[i].y = totalH / 2 - i * rowH - rowH / 2;
            this._rowNodes[i].x = 0;
        }
        this._scrollToIdx(this._selectedIdx, true);
        this.scrollViewNode.active = true;
    };
    LevelController.prototype._setupRow = function (row, i, lv, maxUnlocked) {
        var _this = this;
        var locked = i > maxUnlocked;
        var view = this._getRowView(row);
        row.scale = 1;
        row.opacity = 255;
        view.opacity = 255;
        this._setSpriteFrame(view, this._zzImgSp[this._getLevelImageName(i)]);
        // LevelIdLabel
        var idLabel = this._findChild(row, 'LevelIdLabel');
        if (idLabel) {
            var lb = idLabel.getComponent(cc.Label);
            if (lb) {
                lb.string = "\u7B2C" + lv.level_id + "\u5173";
            }
            idLabel.opacity = 255;
        }
        var monsterIcon = this._findChild(view, 'MonsterIcon');
        if (monsterIcon)
            monsterIcon.active = false;
        var lock = this._findChild(row, 'Lock');
        if (lock)
            lock.active = locked;
        // Arrow1/2/3（星级）：未获得的星显示灰星
        var cleared = i < maxUnlocked;
        var levelId = String(lv.level_id);
        var stars = cleared ? (GameState_1.default.levelStars[levelId] || 0) : 0;
        var starNodes = [
            this._findChild(row, 'Arrow1'),
            this._findChild(row, 'Arrow2'),
            this._findChild(row, 'Arrow3'),
        ];
        for (var n = 0; n < starNodes.length; n++) {
            var star = starNodes[n];
            if (!star)
                continue;
            star.active = true;
            this._setSpriteFrame(star, this._zzImgSp[n < stars ? 'xingji' : 'xingjihui']);
            star.opacity = 255;
        }
        // 点击事件
        row.off(cc.Node.EventType.TOUCH_END);
        var idx = i;
        row.on(cc.Node.EventType.TOUCH_END, function (e) {
            e.stopPropagation();
            if (!locked) {
                _this._selectLevel(idx, false);
                _this._onStart();
            }
        }, this);
    };
    LevelController.prototype._scrollToIdx = function (idx, instant) {
        if (instant === void 0) { instant = false; }
        var sv = this.scrollViewNode
            ? this.scrollViewNode.getComponent(cc.ScrollView) : null;
        if (!sv || !sv.content)
            return;
        var rowH = this.levelItemTemplate ? ((this.levelItemTemplate.height || ROW_H) + ROW_GAP) : ROW_H;
        var totalH = Constants_1.CFG.levels.length * rowH;
        var viewH = this.scrollViewNode.height;
        // 第 idx 行中心距 content 顶部的距离
        var rowCenter = idx * rowH + rowH / 2;
        // 让该行居中：content 需要向上滚动的距离
        var offset = rowCenter - viewH / 2;
        var maxOffset = Math.max(0, totalH - viewH);
        var finalOffset = Math.max(0, Math.min(offset, maxOffset));
        sv.stopAutoScroll();
        if (instant) {
            sv.scrollToOffset(cc.v2(0, finalOffset), 0);
        }
        else {
            sv.scrollToOffset(cc.v2(0, finalOffset), 0.3);
        }
    };
    LevelController.prototype._getRowView = function (row) {
        return row.getChildByName('LevelNode1') || row;
    };
    LevelController.prototype._findChild = function (parent, name) {
        if (!parent)
            return null;
        if (parent.name === name)
            return parent;
        for (var i = 0; i < parent.children.length; i++) {
            var found = this._findChild(parent.children[i], name);
            if (found)
                return found;
        }
        return null;
    };
    LevelController.prototype._setSpriteFrame = function (node, sf) {
        if (!node || !sf)
            return;
        var sp = node.getComponent(cc.Sprite);
        if (!sp)
            sp = node.addComponent(cc.Sprite);
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.spriteFrame = sf;
    };
    LevelController.prototype._getLevelImageName = function (idx) {
        var group = Math.floor(idx / 20) + 1;
        var imageIdx = Math.max(1, Math.min(5, group));
        return "guanqiapeitu" + imageIdx;
    };
    // ---- 选中 ----
    LevelController.prototype._selectLevel = function (idx, scroll) {
        var levels = Constants_1.CFG.levels;
        if (!levels || idx < 0 || idx >= levels.length)
            return;
        if (idx > GameState_1.default.maxUnlockedLevel)
            return;
        // 恢复上一个
        var prev = this._rowNodes[this._selectedIdx];
        if (prev)
            prev.scale = 1;
        this._selectedIdx = idx;
        GameState_1.default.selectedLevelIdx = idx;
        GameState_1.default.selectedLevelId = String(levels[idx].level_id);
        // 高亮当前
        var cur = this._rowNodes[idx];
        if (cur)
            cur.scale = 1;
        this._refreshInfoPanel(levels[idx]);
        if (scroll)
            this._scrollToIdx(idx);
    };
    LevelController.prototype._refreshInfoPanel = function (lv) {
        if (this.levelNameLabel)
            this.levelNameLabel.string = "\u7B2C " + lv.level_id + " \u5173";
        if (this.waveLabel)
            this.waveLabel.string = String(lv.total_waves);
        var dropNodes = [this.dropIcon1, this.dropIcon2, this.dropIcon3, this.dropIcon4, this.dropIcon5];
        dropNodes.forEach(function (n) { if (n)
            n.active = false; });
        var slot = 0;
        // DropIcon1：fixed_rewards 的 currency_id
        if (lv.fixed_rewards && lv.fixed_rewards.length && slot < dropNodes.length && dropNodes[slot]) {
            var iconName = this._getIconName(lv.fixed_rewards[0].currency_id);
            this._setIconSp(dropNodes[slot], iconName);
            dropNodes[slot].active = false;
            slot++;
        }
        // DropIcon2~5：random_rewards 的每个 item_id
        if (lv.random_rewards) {
            for (var i = 0; i < lv.random_rewards.length && slot < dropNodes.length; i++) {
                if (!dropNodes[slot]) {
                    slot++;
                    continue;
                }
                var iconName = this._getIconName(lv.random_rewards[i].item_id);
                this._setIconSp(dropNodes[slot], iconName);
                dropNodes[slot].active = false;
                slot++;
            }
        }
    };
    LevelController.prototype._getIconName = function (itemId) {
        for (var i = 0; i < Constants_1.CFG.itemConfig.length; i++) {
            if (Constants_1.CFG.itemConfig[i].id === itemId) {
                var icon = Constants_1.CFG.itemConfig[i].icon || '';
                return icon.replace(/\.[^.]+$/, '');
            }
        }
        return '';
    };
    LevelController.prototype._setIconSp = function (node, name) {
        if (!node || !name)
            return;
        var sf = this._iconSp[name];
        if (!sf)
            return;
        var s = node.getComponent(cc.Sprite);
        if (!s)
            s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = sf;
    };
    // ---- 按钮 ----
    LevelController.prototype._bindButtons = function () {
        if (this.startBtn)
            this.startBtn.on(cc.Node.EventType.TOUCH_END, this._onStart, this);
        if (this.backBtn)
            this.backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);
    };
    LevelController.prototype._onStart = function () {
        if (this._starting)
            return;
        this._starting = true;
        if (!StateBridge_1.default.consumeStamina()) {
            cc.log('[Level] 体力不足');
            this._starting = false;
            return;
        }
        var levels = Constants_1.CFG.levels;
        var lv = levels[this._selectedIdx];
        if (!lv) {
            this._starting = false;
            return;
        }
        // 记录进入的关卡
        GameState_1.default.selectedLevelId = String(lv.level_id);
        GameState_1.default.selectedLevelIdx = this._selectedIdx;
        var btn = (this.startBtn && this.startBtn.active) ? this.startBtn : this._rowNodes[this._selectedIdx];
        if (btn) {
            cc.tween(btn)
                .to(0.05, { scale: 0.96 })
                .to(0.05, { scale: 1.0 })
                .call(function () {
                cc.director.loadScene(Constants_1.Scene.Youxi);
            })
                .start();
        }
        else {
            cc.director.loadScene(Constants_1.Scene.Youxi);
        }
    };
    LevelController.prototype._onBack = function () {
        StateBridge_1.default.syncNewToOld();
        cc.director.loadScene('Start');
    };
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "topBar", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "levelNode1", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "levelNode2", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "levelNode3", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "infoPanel", void 0);
    __decorate([
        property(cc.Label)
    ], LevelController.prototype, "levelNameLabel", void 0);
    __decorate([
        property(cc.Label)
    ], LevelController.prototype, "waveLabel", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "dropIcon1", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "dropIcon2", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "dropIcon3", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "dropIcon4", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "dropIcon5", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "startBtn", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "backBtn", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "scrollViewNode", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "levelItemTemplate", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "levelNodeTemplate", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "arrow1", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "arrow2", void 0);
    __decorate([
        property(cc.Node)
    ], LevelController.prototype, "arrow3", void 0);
    LevelController = __decorate([
        ccclass
    ], LevelController);
    return LevelController;
}(cc.Component));
exports.default = LevelController;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZTJcXExldmVsQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBQWtFO0FBQ2xFLHlDQUFvQztBQUNwQyw2Q0FBd0M7QUFFbEMsSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFFNUMsMENBQTBDO0FBQzFDLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNsQixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFFbkIsSUFBTSxVQUFVLEdBQUcsc0NBQXNDLENBQUMsQ0FBRSxXQUFXO0FBQ3ZFLElBQU0sVUFBVSxHQUFHLHNDQUFzQyxDQUFDLENBQUUsWUFBWTtBQUN4RSxJQUFNLFNBQVMsR0FBSSxzQ0FBc0MsQ0FBQyxDQUFFLFdBQVc7QUFDdkUsSUFBTSxPQUFPLEdBQU0sc0NBQXNDLENBQUMsQ0FBRSxXQUFXO0FBR3ZFO0lBQTZDLG1DQUFZO0lBQXpEO1FBQUEscUVBZ1lDO1FBOVh1QixZQUFNLEdBQVksSUFBSSxDQUFDO1FBQ3ZCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBQzNCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBQzNCLGdCQUFVLEdBQVksSUFBSSxDQUFDO1FBQzNCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsb0JBQWMsR0FBYSxJQUFJLENBQUM7UUFDaEMsZUFBUyxHQUFhLElBQUksQ0FBQztRQUMzQixlQUFTLEdBQVksSUFBSSxDQUFDO1FBQzFCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsZUFBUyxHQUFZLElBQUksQ0FBQztRQUMxQixlQUFTLEdBQVksSUFBSSxDQUFDO1FBQzFCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsY0FBUSxHQUFZLElBQUksQ0FBQztRQUN6QixhQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLG9CQUFjLEdBQVksSUFBSSxDQUFDO1FBQy9C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UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7c0RBQTRCO0lBQzFCO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3NEQUE0QjtJQUMxQjtRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztzREFBNEI7SUFDMUI7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7c0RBQTRCO0lBQzFCO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO3FEQUEyQjtJQUN6QjtRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztvREFBMEI7SUFDeEI7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7MkRBQWlDO0lBQy9CO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDOzhEQUFvQztJQUNsQztRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzs4REFBb0M7SUFDbEM7UUFBbkIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7bURBQXlCO0lBQ3ZCO1FBQW5CLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO21EQUF5QjtJQUN2QjtRQUFuQixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFBeUI7SUFyQjFCLGVBQWU7UUFEbkMsT0FBTztPQUNhLGVBQWUsQ0FnWW5DO0lBQUQsc0JBQUM7Q0FoWUQsQUFnWUMsQ0FoWTRDLEVBQUUsQ0FBQyxTQUFTLEdBZ1l4RDtrQkFoWW9CLGVBQWUiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkQ29uZmlnLCBDRkcsIFNjZW5lLCBnZXRJdGVtSWNvbiB9IGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCBHYW1lU3RhdGUgZnJvbSAnLi9HYW1lU3RhdGUnO1xuaW1wb3J0IFN0YXRlQnJpZGdlIGZyb20gJy4vU3RhdGVCcmlkZ2UnO1xuXG5jb25zdCB7IGNjY2xhc3MsIHByb3BlcnR5IH0gPSBjYy5fZGVjb3JhdG9yO1xuXG4vLyDmr4/kuKogTGV2ZWxOb2RlIOihjOmrmO+8iOS4jue8lui+keWZqOmHjCBMZXZlbE5vZGUxIOeahOmrmOW6puS4gOiHtO+8iVxuY29uc3QgUk9XX0ggPSAyMDA7XG5jb25zdCBST1dfR0FQID0gMjA7XG5cbmNvbnN0IFNGX0NMRUFSRUQgPSAnMWIyZmIxM2YtZGEzYS00Mzg1LWEyZmEtZDYwYWM1MTdmNmFjJzsgIC8vIHVpXzIg5bey6YCa5YWzXG5jb25zdCBTRl9DVVJSRU5UID0gJzY0Y2M0MjliLTEyNGEtNDU2YS05NDA1LTg5YmMwNmUyZDBhZSc7ICAvLyB1aV80IOW9k+WJjemAieS4rVxuY29uc3QgU0ZfTE9DS0VEICA9ICcwOTg2MTA2NS05MjhiLTRjYzQtYjI2Zi1kYmU0MjViNTVjZmMnOyAgLy8gdWlfNiDmnKrop6PplIFcbmNvbnN0IFNGX1NUQVIgICAgPSAnZGRkOGZhN2YtYjc0MS00N2JiLTgzYjctNzdlOTE1ZTY1OTFiJzsgIC8vIHVpXzMg5Y2V6aKX5pifXG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbENvbnRyb2xsZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICB0b3BCYXI6IGNjLk5vZGUgPSBudWxsO1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgbGV2ZWxOb2RlMTogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBsZXZlbE5vZGUyOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBAcHJvcGVydHkoY2MuTm9kZSkgIGxldmVsTm9kZTM6IGNjLk5vZGUgPSBudWxsO1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgaW5mb1BhbmVsOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBAcHJvcGVydHkoY2MuTGFiZWwpIGxldmVsTmFtZUxhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLkxhYmVsKSB3YXZlTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBAcHJvcGVydHkoY2MuTm9kZSkgIGRyb3BJY29uMTogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBkcm9wSWNvbjI6IGNjLk5vZGUgPSBudWxsO1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgZHJvcEljb24zOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBAcHJvcGVydHkoY2MuTm9kZSkgIGRyb3BJY29uNDogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBkcm9wSWNvbjU6IGNjLk5vZGUgPSBudWxsO1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgc3RhcnRCdG46IGNjLk5vZGUgPSBudWxsO1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgYmFja0J0bjogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBzY3JvbGxWaWV3Tm9kZTogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBsZXZlbEl0ZW1UZW1wbGF0ZTogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBsZXZlbE5vZGVUZW1wbGF0ZTogY2MuTm9kZSA9IG51bGw7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpICBhcnJvdzE6IGNjLk5vZGUgPSBudWxsO1xuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKSAgYXJyb3cyOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBAcHJvcGVydHkoY2MuTm9kZSkgIGFycm93MzogY2MuTm9kZSA9IG51bGw7XG5cbiAgICAvLyBpY29uIOWbvumbhu+8iHRleHR1cmVzL2ljb24g55uu5b2V77yJXG4gICAgcHJpdmF0ZSBfaWNvblNwOiB7IFtuYW1lOiBzdHJpbmddOiBjYy5TcHJpdGVGcmFtZSB9ID0ge307XG5cbiAgICBwcml2YXRlIF9zZk1hcDogeyBbdXVpZDogc3RyaW5nXTogY2MuU3ByaXRlRnJhbWUgfSA9IHt9O1xuICAgIHByaXZhdGUgX3NwOiB7IFtuYW1lOiBzdHJpbmddOiBjYy5TcHJpdGVGcmFtZSB9ID0ge307XG4gICAgcHJpdmF0ZSBfenpJbWdTcDogeyBbbmFtZTogc3RyaW5nXTogY2MuU3ByaXRlRnJhbWUgfSA9IHt9O1xuICAgIHByaXZhdGUgX3NlbGVjdGVkSWR4OiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX3Jvd05vZGVzOiBjYy5Ob2RlW10gPSBbXTsgICAvLyDmr4/lhbPlr7nlupTnmoQgTGV2ZWxOb2RlIOiKgueCuVxuICAgIHByaXZhdGUgX3N0YXJ0aW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIGxvYWRDb25maWcocmVxdWlyZSgnY29uZmlnJykpO1xuICAgICAgICB0aGlzLl9zZWxlY3RlZElkeCA9IEdhbWVTdGF0ZS5tYXhVbmxvY2tlZExldmVsO1xuXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbFZpZXdOb2RlKSB0aGlzLnNjcm9sbFZpZXdOb2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5sZXZlbE5vZGUyKSB0aGlzLmxldmVsTm9kZTIuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmxldmVsTm9kZTMpIHRoaXMubGV2ZWxOb2RlMy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuYXJyb3cxKSB0aGlzLmFycm93MS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuYXJyb3cyKSB0aGlzLmFycm93Mi5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuYXJyb3czKSB0aGlzLmFycm93My5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcigndGV4dHVyZXMvbGV2ZWwnLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogYW55LCBmcmFtZXM6IGNjLlNwcml0ZUZyYW1lW10pID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHsgY2MuZXJyb3IoJ1tMZXZlbF0gbGV2ZWwg6LS05Zu+5Yqg6L295aSx6LSlJywgZXJyKTsgcmV0dXJuOyB9XG4gICAgICAgICAgICBmcmFtZXMuZm9yRWFjaChmID0+IHsgdGhpcy5fc3BbZi5uYW1lXSA9IGY7IH0pO1xuICAgICAgICAgICAgdGhpcy5fYnVpbGRTZk1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fYXBwbHlTdGF0aWNBc3NldHMoKTtcblxuICAgICAgICAgICAgLy8g5Yqg6L29IGljb24g55uu5b2V5ZCO5YaN5p6E5bu65YiX6KGoXG4gICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcigndGV4dHVyZXMvaWNvbicsIGNjLlNwcml0ZUZyYW1lLCAoZXJyMjogYW55LCBpY29uRnJhbWVzOiBjYy5TcHJpdGVGcmFtZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIyICYmIGljb25GcmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWNvbkZyYW1lcy5mb3JFYWNoKGYgPT4geyB0aGlzLl9pY29uU3BbZi5uYW1lXSA9IGY7IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkTmV3TGV2ZWxBc3NldHMoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9idWlsZExpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0TGV2ZWwodGhpcy5fc2VsZWN0ZWRJZHgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9iaW5kQnV0dG9ucygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2xvYWROZXdMZXZlbEFzc2V0cyhkb25lOiBGdW5jdGlvbikge1xuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcignenpJbWcnLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogYW55LCBmcmFtZXM6IGNjLlNwcml0ZUZyYW1lW10pID0+IHtcbiAgICAgICAgICAgIGlmICghZXJyICYmIGZyYW1lcykgZnJhbWVzLmZvckVhY2goZiA9PiB7IHRoaXMuX3p6SW1nU3BbZi5uYW1lXSA9IGY7IH0pO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9idWlsZFNmTWFwKCkge1xuICAgICAgICBjb25zdCBtYXA6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgICAgICAgICAgJ3VpXzInOiBTRl9DTEVBUkVELCAndWlfNCc6IFNGX0NVUlJFTlQsXG4gICAgICAgICAgICAndWlfNic6IFNGX0xPQ0tFRCwgICd1aV8zJzogU0ZfU1RBUixcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIG1hcCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3NwW25hbWVdKSB0aGlzLl9zZk1hcFttYXBbbmFtZV1dID0gdGhpcy5fc3BbbmFtZV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBseVN0YXRpY0Fzc2V0cygpIHtcbiAgICAgICAgdGhpcy5fc2V0U3AodGhpcy50b3BCYXIsICAgICd1aV8xJyk7XG4gICAgICAgIHRoaXMuX3NldFNwKHRoaXMuaW5mb1BhbmVsLCAndWlfNycpO1xuICAgICAgICB0aGlzLl9zZXRTcCh0aGlzLnN0YXJ0QnRuLCAgJ3VpXzE1Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0U3Aobm9kZTogY2MuTm9kZSwga2V5OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8ICF0aGlzLl9zcFtrZXldKSByZXR1cm47XG4gICAgICAgIGxldCBzID0gbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgaWYgKCFzKSBzID0gbm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgcy5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIHMuc3ByaXRlRnJhbWUgPSB0aGlzLl9zcFtrZXldO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldFNwQnlVdWlkKG5vZGU6IGNjLk5vZGUsIHV1aWQ6IHN0cmluZykge1xuICAgICAgICBpZiAoIW5vZGUpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2YgPSB0aGlzLl9zZk1hcFt1dWlkXTtcbiAgICAgICAgaWYgKCFzZikgcmV0dXJuO1xuICAgICAgICBsZXQgcyA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGlmICghcykgcyA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIHMuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICBzLnNwcml0ZUZyYW1lID0gc2Y7XG4gICAgICAgIC8vIHVpXzLvvIjlt7LpgJrlhbPvvInlm77niYfljp/lsLrlr7jlgY/lpKfvvIzmlbTkvZPnvKnlsI/liLAgODAlXG4gICAgICAgIG5vZGUuc2NhbGUgPSAodXVpZCA9PT0gU0ZfQ0xFQVJFRCkgPyAwLjggOiAxLjA7XG4gICAgfVxuXG4gICAgLy8gLS0tLSDmnoTlu7rliJfooaggLS0tLVxuXG4gICAgcHJpdmF0ZSBfYnVpbGRMaXN0KCkge1xuICAgICAgICBjb25zdCBzdiA9IHRoaXMuc2Nyb2xsVmlld05vZGVcbiAgICAgICAgICAgID8gdGhpcy5zY3JvbGxWaWV3Tm9kZS5nZXRDb21wb25lbnQoY2MuU2Nyb2xsVmlldykgOiBudWxsO1xuICAgICAgICBpZiAoIXN2IHx8ICFzdi5jb250ZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMuc2Nyb2xsVmlld05vZGUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgdG1wbCA9IHRoaXMubGV2ZWxJdGVtVGVtcGxhdGU7ICAgLy8gTGV2ZWxJdGVtVGVtcGxhdGUg5L2c5Li66KGM5qih5p2/XG4gICAgICAgIGlmICghdG1wbCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGxldmVscyA9IENGRy5sZXZlbHM7XG4gICAgICAgIGlmICghbGV2ZWxzIHx8IGxldmVscy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNjLndhcm4oJ1tMZXZlbF0gQ0ZHLmxldmVscyDkuLrnqbonKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkSWR4ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4odGhpcy5fc2VsZWN0ZWRJZHgsIGxldmVscy5sZW5ndGggLSAxKSk7XG5cbiAgICAgICAgY29uc3QgbWF4VW5sb2NrZWQgPSBHYW1lU3RhdGUubWF4VW5sb2NrZWRMZXZlbDtcbiAgICAgICAgY29uc3Qgcm93SCA9ICh0bXBsLmhlaWdodCB8fCBST1dfSCkgKyBST1dfR0FQO1xuICAgICAgICBjb25zdCB0b3RhbEggPSBsZXZlbHMubGVuZ3RoICogcm93SDtcblxuICAgICAgICB0aGlzLl9yb3dOb2RlcyA9IFtdO1xuICAgICAgICBzdi5jb250ZW50LmNoaWxkcmVuLnNsaWNlKCkuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZCAhPT0gdG1wbCkgY2hpbGQuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0bXBsLnBhcmVudCA9IHN2LmNvbnRlbnQ7XG4gICAgICAgIHRtcGwuYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAvLyBjb250ZW50IOmrmOW6plxuICAgICAgICBzdi5jb250ZW50LnNldENvbnRlbnRTaXplKHN2LmNvbnRlbnQud2lkdGgsIHRvdGFsSCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZXZlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IGkgPT09IDAgPyB0bXBsIDogY2MuaW5zdGFudGlhdGUodG1wbCk7XG4gICAgICAgICAgICByb3cuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJvdy5wYXJlbnQgPSBzdi5jb250ZW50O1xuICAgICAgICAgICAgdGhpcy5fc2V0dXBSb3cocm93LCBpLCBsZXZlbHNbaV0sIG1heFVubG9ja2VkKTtcbiAgICAgICAgICAgIHRoaXMuX3Jvd05vZGVzLnB1c2gocm93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaOkuWIl+aJgOacieihjO+8mmNvbnRlbnQgYW5jaG9yPSgwLjUsMC41Ke+8jOesrCBpIOihjOS7jumhtumDqOW+gOS4i1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3Jvd05vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9yb3dOb2Rlc1tpXS55ID0gdG90YWxIIC8gMiAtIGkgKiByb3dIIC0gcm93SCAvIDI7XG4gICAgICAgICAgICB0aGlzLl9yb3dOb2Rlc1tpXS54ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Njcm9sbFRvSWR4KHRoaXMuX3NlbGVjdGVkSWR4LCB0cnVlKTtcbiAgICAgICAgdGhpcy5zY3JvbGxWaWV3Tm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldHVwUm93KHJvdzogY2MuTm9kZSwgaTogbnVtYmVyLCBsdjogYW55LCBtYXhVbmxvY2tlZDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGxvY2tlZCA9IGkgPiBtYXhVbmxvY2tlZDtcblxuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fZ2V0Um93Vmlldyhyb3cpO1xuICAgICAgICByb3cuc2NhbGUgPSAxO1xuICAgICAgICByb3cub3BhY2l0eSA9IDI1NTtcbiAgICAgICAgdmlldy5vcGFjaXR5ID0gMjU1O1xuICAgICAgICB0aGlzLl9zZXRTcHJpdGVGcmFtZSh2aWV3LCB0aGlzLl96ekltZ1NwW3RoaXMuX2dldExldmVsSW1hZ2VOYW1lKGkpXSk7XG5cbiAgICAgICAgLy8gTGV2ZWxJZExhYmVsXG4gICAgICAgIGNvbnN0IGlkTGFiZWwgPSB0aGlzLl9maW5kQ2hpbGQocm93LCAnTGV2ZWxJZExhYmVsJyk7XG4gICAgICAgIGlmIChpZExhYmVsKSB7XG4gICAgICAgICAgICBjb25zdCBsYiA9IGlkTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIGlmIChsYikge1xuICAgICAgICAgICAgICAgIGxiLnN0cmluZyA9IGDnrKwke2x2LmxldmVsX2lkfeWFs2A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZExhYmVsLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb25zdGVySWNvbiA9IHRoaXMuX2ZpbmRDaGlsZCh2aWV3LCAnTW9uc3Rlckljb24nKTtcbiAgICAgICAgaWYgKG1vbnN0ZXJJY29uKSBtb25zdGVySWNvbi5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBsb2NrID0gdGhpcy5fZmluZENoaWxkKHJvdywgJ0xvY2snKTtcbiAgICAgICAgaWYgKGxvY2spIGxvY2suYWN0aXZlID0gbG9ja2VkO1xuXG4gICAgICAgIC8vIEFycm93MS8yLzPvvIjmmJ/nuqfvvInvvJrmnKrojrflvpfnmoTmmJ/mmL7npLrngbDmmJ9cbiAgICAgICAgY29uc3QgY2xlYXJlZCA9IGkgPCBtYXhVbmxvY2tlZDtcbiAgICAgICAgY29uc3QgbGV2ZWxJZCA9IFN0cmluZyhsdi5sZXZlbF9pZCk7XG4gICAgICAgIGNvbnN0IHN0YXJzID0gY2xlYXJlZCA/IChHYW1lU3RhdGUubGV2ZWxTdGFyc1tsZXZlbElkXSB8fCAwKSA6IDA7XG4gICAgICAgIGNvbnN0IHN0YXJOb2RlcyA9IFtcbiAgICAgICAgICAgIHRoaXMuX2ZpbmRDaGlsZChyb3csICdBcnJvdzEnKSxcbiAgICAgICAgICAgIHRoaXMuX2ZpbmRDaGlsZChyb3csICdBcnJvdzInKSxcbiAgICAgICAgICAgIHRoaXMuX2ZpbmRDaGlsZChyb3csICdBcnJvdzMnKSxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBzdGFyTm9kZXMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXIgPSBzdGFyTm9kZXNbbl07XG4gICAgICAgICAgICBpZiAoIXN0YXIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgc3Rhci5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fc2V0U3ByaXRlRnJhbWUoc3RhciwgdGhpcy5fenpJbWdTcFtuIDwgc3RhcnMgPyAneGluZ2ppJyA6ICd4aW5namlodWknXSk7XG4gICAgICAgICAgICBzdGFyLm9wYWNpdHkgPSAyNTU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDngrnlh7vkuovku7ZcbiAgICAgICAgcm93Lm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQpO1xuICAgICAgICBjb25zdCBpZHggPSBpO1xuICAgICAgICByb3cub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCAoZTogY2MuRXZlbnQuRXZlbnRUb3VjaCkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGlmICghbG9ja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0TGV2ZWwoaWR4LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25TdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zY3JvbGxUb0lkeChpZHg6IG51bWJlciwgaW5zdGFudDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IHN2ID0gdGhpcy5zY3JvbGxWaWV3Tm9kZVxuICAgICAgICAgICAgPyB0aGlzLnNjcm9sbFZpZXdOb2RlLmdldENvbXBvbmVudChjYy5TY3JvbGxWaWV3KSA6IG51bGw7XG4gICAgICAgIGlmICghc3YgfHwgIXN2LmNvbnRlbnQpIHJldHVybjtcblxuICAgICAgICBjb25zdCByb3dIID0gdGhpcy5sZXZlbEl0ZW1UZW1wbGF0ZSA/ICgodGhpcy5sZXZlbEl0ZW1UZW1wbGF0ZS5oZWlnaHQgfHwgUk9XX0gpICsgUk9XX0dBUCkgOiBST1dfSDtcbiAgICAgICAgY29uc3QgdG90YWxIID0gQ0ZHLmxldmVscy5sZW5ndGggKiByb3dIO1xuICAgICAgICBjb25zdCB2aWV3SCA9IHRoaXMuc2Nyb2xsVmlld05vZGUuaGVpZ2h0O1xuXG4gICAgICAgIC8vIOesrCBpZHgg6KGM5Lit5b+D6LedIGNvbnRlbnQg6aG26YOo55qE6Led56a7XG4gICAgICAgIGNvbnN0IHJvd0NlbnRlciA9IGlkeCAqIHJvd0ggKyByb3dIIC8gMjtcbiAgICAgICAgLy8g6K6p6K+l6KGM5bGF5Lit77yaY29udGVudCDpnIDopoHlkJHkuIrmu5rliqjnmoTot53nprtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gcm93Q2VudGVyIC0gdmlld0ggLyAyO1xuICAgICAgICBjb25zdCBtYXhPZmZzZXQgPSBNYXRoLm1heCgwLCB0b3RhbEggLSB2aWV3SCk7XG4gICAgICAgIGNvbnN0IGZpbmFsT2Zmc2V0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4ob2Zmc2V0LCBtYXhPZmZzZXQpKTtcblxuICAgICAgICBzdi5zdG9wQXV0b1Njcm9sbCgpO1xuICAgICAgICBpZiAoaW5zdGFudCkge1xuICAgICAgICAgICAgc3Yuc2Nyb2xsVG9PZmZzZXQoY2MudjIoMCwgZmluYWxPZmZzZXQpLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN2LnNjcm9sbFRvT2Zmc2V0KGNjLnYyKDAsIGZpbmFsT2Zmc2V0KSwgMC4zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFJvd1ZpZXcocm93OiBjYy5Ob2RlKTogY2MuTm9kZSB7XG4gICAgICAgIHJldHVybiByb3cuZ2V0Q2hpbGRCeU5hbWUoJ0xldmVsTm9kZTEnKSB8fCByb3c7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZmluZENoaWxkKHBhcmVudDogY2MuTm9kZSwgbmFtZTogc3RyaW5nKTogY2MuTm9kZSB7XG4gICAgICAgIGlmICghcGFyZW50KSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKHBhcmVudC5uYW1lID09PSBuYW1lKSByZXR1cm4gcGFyZW50O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmVudC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZm91bmQgPSB0aGlzLl9maW5kQ2hpbGQocGFyZW50LmNoaWxkcmVuW2ldLCBuYW1lKTtcbiAgICAgICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldFNwcml0ZUZyYW1lKG5vZGU6IGNjLk5vZGUsIHNmOiBjYy5TcHJpdGVGcmFtZSkge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIXNmKSByZXR1cm47XG4gICAgICAgIGxldCBzcCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGlmICghc3ApIHNwID0gbm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgc3Auc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICBzcC5zcHJpdGVGcmFtZSA9IHNmO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldExldmVsSW1hZ2VOYW1lKGlkeDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBNYXRoLmZsb29yKGlkeCAvIDIwKSArIDE7XG4gICAgICAgIGNvbnN0IGltYWdlSWR4ID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oNSwgZ3JvdXApKTtcbiAgICAgICAgcmV0dXJuIGBndWFucWlhcGVpdHUke2ltYWdlSWR4fWA7XG4gICAgfVxuXG4gICAgLy8gLS0tLSDpgInkuK0gLS0tLVxuXG4gICAgcHJpdmF0ZSBfc2VsZWN0TGV2ZWwoaWR4OiBudW1iZXIsIHNjcm9sbDogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBsZXZlbHMgPSBDRkcubGV2ZWxzO1xuICAgICAgICBpZiAoIWxldmVscyB8fCBpZHggPCAwIHx8IGlkeCA+PSBsZXZlbHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGlmIChpZHggPiBHYW1lU3RhdGUubWF4VW5sb2NrZWRMZXZlbCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIOaBouWkjeS4iuS4gOS4qlxuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5fcm93Tm9kZXNbdGhpcy5fc2VsZWN0ZWRJZHhdO1xuICAgICAgICBpZiAocHJldikgcHJldi5zY2FsZSA9IDE7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRJZHggPSBpZHg7XG4gICAgICAgIEdhbWVTdGF0ZS5zZWxlY3RlZExldmVsSWR4ID0gaWR4O1xuICAgICAgICBHYW1lU3RhdGUuc2VsZWN0ZWRMZXZlbElkID0gU3RyaW5nKGxldmVsc1tpZHhdLmxldmVsX2lkKTtcblxuICAgICAgICAvLyDpq5jkuq7lvZPliY1cbiAgICAgICAgY29uc3QgY3VyID0gdGhpcy5fcm93Tm9kZXNbaWR4XTtcbiAgICAgICAgaWYgKGN1cikgY3VyLnNjYWxlID0gMTtcblxuICAgICAgICB0aGlzLl9yZWZyZXNoSW5mb1BhbmVsKGxldmVsc1tpZHhdKTtcbiAgICAgICAgaWYgKHNjcm9sbCkgdGhpcy5fc2Nyb2xsVG9JZHgoaWR4KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWZyZXNoSW5mb1BhbmVsKGx2OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMubGV2ZWxOYW1lTGFiZWwpIHRoaXMubGV2ZWxOYW1lTGFiZWwuc3RyaW5nID0gYOesrCAke2x2LmxldmVsX2lkfSDlhbNgO1xuICAgICAgICBpZiAodGhpcy53YXZlTGFiZWwpICAgICAgdGhpcy53YXZlTGFiZWwuc3RyaW5nID0gU3RyaW5nKGx2LnRvdGFsX3dhdmVzKTtcblxuICAgICAgICBjb25zdCBkcm9wTm9kZXMgPSBbdGhpcy5kcm9wSWNvbjEsIHRoaXMuZHJvcEljb24yLCB0aGlzLmRyb3BJY29uMywgdGhpcy5kcm9wSWNvbjQsIHRoaXMuZHJvcEljb241XTtcbiAgICAgICAgZHJvcE5vZGVzLmZvckVhY2gobiA9PiB7IGlmIChuKSBuLmFjdGl2ZSA9IGZhbHNlOyB9KTtcblxuICAgICAgICBsZXQgc2xvdCA9IDA7XG5cbiAgICAgICAgLy8gRHJvcEljb24x77yaZml4ZWRfcmV3YXJkcyDnmoQgY3VycmVuY3lfaWRcbiAgICAgICAgaWYgKGx2LmZpeGVkX3Jld2FyZHMgJiYgbHYuZml4ZWRfcmV3YXJkcy5sZW5ndGggJiYgc2xvdCA8IGRyb3BOb2Rlcy5sZW5ndGggJiYgZHJvcE5vZGVzW3Nsb3RdKSB7XG4gICAgICAgICAgICBjb25zdCBpY29uTmFtZSA9IHRoaXMuX2dldEljb25OYW1lKGx2LmZpeGVkX3Jld2FyZHNbMF0uY3VycmVuY3lfaWQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0SWNvblNwKGRyb3BOb2Rlc1tzbG90XSwgaWNvbk5hbWUpO1xuICAgICAgICAgICAgZHJvcE5vZGVzW3Nsb3RdLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2xvdCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJvcEljb24yfjXvvJpyYW5kb21fcmV3YXJkcyDnmoTmr4/kuKogaXRlbV9pZFxuICAgICAgICBpZiAobHYucmFuZG9tX3Jld2FyZHMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbHYucmFuZG9tX3Jld2FyZHMubGVuZ3RoICYmIHNsb3QgPCBkcm9wTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRyb3BOb2Rlc1tzbG90XSkgeyBzbG90Kys7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgY29uc3QgaWNvbk5hbWUgPSB0aGlzLl9nZXRJY29uTmFtZShsdi5yYW5kb21fcmV3YXJkc1tpXS5pdGVtX2lkKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uU3AoZHJvcE5vZGVzW3Nsb3RdLCBpY29uTmFtZSk7XG4gICAgICAgICAgICAgICAgZHJvcE5vZGVzW3Nsb3RdLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNsb3QrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEljb25OYW1lKGl0ZW1JZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBDRkcuaXRlbUNvbmZpZy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKENGRy5pdGVtQ29uZmlnW2ldLmlkID09PSBpdGVtSWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpY29uOiBzdHJpbmcgPSBDRkcuaXRlbUNvbmZpZ1tpXS5pY29uIHx8ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBpY29uLnJlcGxhY2UoL1xcLlteLl0rJC8sICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0SWNvblNwKG5vZGU6IGNjLk5vZGUsIG5hbWU6IHN0cmluZykge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5hbWUpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2YgPSB0aGlzLl9pY29uU3BbbmFtZV07XG4gICAgICAgIGlmICghc2YpIHJldHVybjtcbiAgICAgICAgbGV0IHMgPSBub2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBpZiAoIXMpIHMgPSBub2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBzLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgcy5zcHJpdGVGcmFtZSA9IHNmO1xuICAgIH1cblxuICAgIC8vIC0tLS0g5oyJ6ZKuIC0tLS1cblxuICAgIHByaXZhdGUgX2JpbmRCdXR0b25zKCkge1xuICAgICAgICBpZiAodGhpcy5zdGFydEJ0bikgdGhpcy5zdGFydEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMuX29uU3RhcnQsIHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5iYWNrQnRuKSAgdGhpcy5iYWNrQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5fb25CYWNrLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vblN0YXJ0KCkge1xuICAgICAgICBpZiAodGhpcy5fc3RhcnRpbmcpIHJldHVybjtcbiAgICAgICAgdGhpcy5fc3RhcnRpbmcgPSB0cnVlO1xuXG4gICAgICAgIGlmICghU3RhdGVCcmlkZ2UuY29uc3VtZVN0YW1pbmEoKSkge1xuICAgICAgICAgICAgY2MubG9nKCdbTGV2ZWxdIOS9k+WKm+S4jei2sycpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxldmVscyA9IENGRy5sZXZlbHM7XG4gICAgICAgIGNvbnN0IGx2ID0gbGV2ZWxzW3RoaXMuX3NlbGVjdGVkSWR4XTtcbiAgICAgICAgaWYgKCFsdikge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiusOW9lei/m+WFpeeahOWFs+WNoVxuICAgICAgICBHYW1lU3RhdGUuc2VsZWN0ZWRMZXZlbElkID0gU3RyaW5nKGx2LmxldmVsX2lkKTtcbiAgICAgICAgR2FtZVN0YXRlLnNlbGVjdGVkTGV2ZWxJZHggPSB0aGlzLl9zZWxlY3RlZElkeDtcblxuICAgICAgICBjb25zdCBidG4gPSAodGhpcy5zdGFydEJ0biAmJiB0aGlzLnN0YXJ0QnRuLmFjdGl2ZSkgPyB0aGlzLnN0YXJ0QnRuIDogdGhpcy5fcm93Tm9kZXNbdGhpcy5fc2VsZWN0ZWRJZHhdO1xuICAgICAgICBpZiAoYnRuKSB7XG4gICAgICAgICAgICBjYy50d2VlbihidG4pXG4gICAgICAgICAgICAgICAgLnRvKDAuMDUsIHsgc2NhbGU6IDAuOTYgfSlcbiAgICAgICAgICAgICAgICAudG8oMC4wNSwgeyBzY2FsZTogMS4wIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoU2NlbmUuWW91eGkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoU2NlbmUuWW91eGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfb25CYWNrKCkge1xuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jTmV3VG9PbGQoKTtcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdTdGFydCcpO1xuICAgIH1cbn1cbiJdfQ==