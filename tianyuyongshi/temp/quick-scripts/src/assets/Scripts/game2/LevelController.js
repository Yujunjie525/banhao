"use strict";
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