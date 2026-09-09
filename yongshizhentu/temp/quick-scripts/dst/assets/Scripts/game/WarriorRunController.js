
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game/WarriorRunController.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '2b4b6pwLB1OX4oRcrjZ4DNB', 'WarriorRunController');
// Scripts/game/WarriorRunController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var StateBridge_1 = require("./StateBridge");
var GameData_1 = require("../Load/GameData");
var WarriorRunConfig_1 = require("./WarriorRunConfig");
var AppConfig_1 = require("../Common/AppConfig");
var UserDataSyncManager_1 = require("../Manager/UserDataSyncManager");
var ccclass = cc._decorator.ccclass;
var RUN_CONFIG = WarriorRunConfig_1.default;
var DISPLAY_DISTANCE_SCALE = 0.28;
var WarriorRunController = /** @class */ (function (_super) {
    __extends(WarriorRunController, _super);
    function WarriorRunController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._canvas = null;
        _this._gameLayer = null;
        _this._uiLayer = null;
        _this._popupLayer = null;
        _this._sprites = {};
        _this._laneXs = [-180, 0, 180];
        _this._viewW = 720;
        _this._viewH = 1280;
        _this._topY = 640;
        _this._bottomY = -640;
        _this._player = null;
        _this._playerLane = 1;
        _this._playerElement = 'wind';
        _this._playerRingOffsetY = 44;
        _this._bulletCount = 10;
        _this._baseBulletCount = 10;
        _this._dropPowerGain = 0;
        _this._character = RUN_CONFIG.characters[0];
        _this._levelConfig = null;
        _this._nextWaveDistance = 120; // 运行时记录下一波小怪的触发距离；调参请改下方 _firstWaveDistance / _waveGap*。
        _this._nextBossDistance = 1150; // 运行时记录下一个 Boss 的触发距离；调参请改下方 _firstBossDistance / _boss*。
        _this._waveIndex = 0;
        _this._entities = [];
        _this._distance = 0;
        _this._runSpeed = 95; // 角色跑动速度；所有“距离型刷怪参数”最终都会按这个速度换算成真实等待时间。
        _this._fireTimer = 0;
        _this._entitySeq = 0;
        _this._lockedId = '';
        _this._combo = 0;
        _this._bestCombo = 0;
        _this._monsterKills = 0;
        _this._bossKills = 0;
        _this._bossActive = false;
        _this._rewardGranted = false;
        _this._score = 0;
        _this._paused = false;
        _this._ended = false;
        _this._reviveUsed = false;
        _this._retrying = false;
        _this._touchStart = null;
        _this._scoreLabel = null;
        _this._distanceLabel = null;
        _this._comboLabel = null;
        _this._damageBuffLabel = null;
        _this._bulletLabel = null;
        _this._elementRing = null;
        _this._progressBar = null;
        _this._scoreBg = null;
        _this._pauseBtn = null;
        _this._playerUnitCount = 0;
        _this._lastProgressRatio = -1;
        _this._solidFrame = null;
        _this._bulletTrailPool = [];
        // 刷怪节奏调参：单位都是“跑动距离”，不是屏幕像素；数值越小，怪物出现越快。
        _this._firstWaveDistance = 120; // 第一波小怪出现距离，调小会更早遇到怪。
        _this._firstBossDistance = 1150; // 第一个 Boss 出现距离，调小会更早进入 Boss 节奏。
        _this._bossPrepareDistance = 150; // 距离 Boss 小于该值时暂停刷小怪，给 Boss 出场留空档。
        _this._waveDelayNearBoss = 170; // 接近 Boss 或 Boss 存活时，下一波小怪至少推迟这么远。
        _this._waveDelayStackNearBoss = 190; // 接近 Boss 时每次跳过刷怪额外累加的距离，用于避免小怪挤到 Boss 前。
        _this._waveDelayAfterBossSpawn = 260; // Boss 刚刷出后，小怪至少延后这么远再刷。
        _this._waveDelayAfterBossKill = 45; // Boss 被击杀后，小怪最快隔这么远补出来；调小可减少空屏。
        _this._bossBaseGap = 1450; // Boss 之间的基础距离间隔，调小 Boss 更频繁。
        _this._bossMinGap = 1100; // Boss 之间的最小距离间隔，防止后期 Boss 过密。
        _this._bossGapDecreasePerKill = 20; // 每击杀一个 Boss，下一次 Boss 间隔减少多少。
        _this._waveGapStart = 190; // 普通小怪波次初始间隔，调小小怪更密。
        _this._waveGapMin = 135; // 普通小怪波次最小间隔，后期不会低于这个值。
        _this._waveGapDecreasePerWave = 2; // 每刷一波小怪，后续波次间隔减少多少。
        _this._waveGapDifficultyDecrease = 8; // 难度每提升 1 点时，波次间隔额外减少多少。
        _this._difficultyDistanceStep = 900; // 跑多远算提升 1 点刷怪难度，调小会更快变密。
        _this._wavesPerExtraGroup = 7; // 每多少波小怪，单波多刷一路怪。
        _this._maxGroupsPerWave = 3; // 单波最多同时刷几路怪，最大 3 对应三条跑道。
        return _this;
    }
    WarriorRunController.prototype.onLoad = function () {
        var _this = this;
        StateBridge_1.default.syncForStartScene();
        this._canvas = this.node;
        this._setupCanvas();
        this._prepareInitialRuntimeNodes();
        this._loadAssets(function () { return _this._startRun(); });
    };
    WarriorRunController.prototype._setupCanvas = function () {
        var visible = cc.view && cc.view.getVisibleSize ? cc.view.getVisibleSize() : cc.winSize;
        this._viewH = Math.max(1280, Math.floor(visible.height || cc.winSize.height || 1280));
        var visibleW = Math.floor(visible.width || cc.winSize.width || 720);
        this._viewW = Math.max(720, Math.floor(visibleW * this._viewH / Math.max(1, visible.height || cc.winSize.height || 1280)));
        var laneGap = 195;
        this._laneXs = [-laneGap, 0, laneGap];
        this._topY = this._viewH / 2;
        this._bottomY = -this._viewH / 2;
        this._canvas.setContentSize(this._viewW, this._viewH);
        this._canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this._canvas.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    };
    WarriorRunController.prototype._prepareInitialRuntimeNodes = function () {
        var gameLayer = this._canvas && this._canvas.getChildByName('GameLayer');
        if (!gameLayer)
            return;
        var playerY = this._sceneY(-561.893);
        var ringY = this._sceneY(-518);
        var countY = this._sceneY(-395.75);
        var player = gameLayer.getChildByName('Player');
        var ring = gameLayer.getChildByName('PlayerElement');
        var count = gameLayer.getChildByName('BulletCount');
        if (player) {
            this._disableWidget(player);
            player.stopAllActions();
            player.setPosition(this._laneXs[this._playerLane], playerY);
            player.active = false;
        }
        if (ring) {
            this._disableWidget(ring);
            ring.stopAllActions();
            ring.setPosition(this._laneXs[this._playerLane], ringY);
            ring.active = false;
        }
        if (count) {
            this._disableWidget(count);
            count.stopAllActions();
            count.setPosition(this._laneXs[this._playerLane], countY);
            count.active = false;
        }
    };
    WarriorRunController.prototype._loadAssets = function (done) {
        var _this = this;
        cc.loader.loadResDir('3game', cc.SpriteFrame, function (err, frames) {
            if (err)
                cc.warn('[WarriorRun] 3game assets load failed', err);
            (frames || []).forEach(function (frame) { return _this._sprites[frame.name] = frame; });
            done();
        });
    };
    WarriorRunController.prototype._startRun = function () {
        if (GameData_1.default && GameData_1.default.GetCurrentRoleData)
            GameData_1.default.GetCurrentRoleData();
        this._character = this._getSelectedCharacter();
        this._levelConfig = RUN_CONFIG.levels[0];
        this._runSpeed = this._levelConfig.base_run_speed;
        this._bulletCount = Math.max(1, Math.floor(this._levelConfig.initial_bullet_count + (this._character.initial_bullet_bonus || 0)));
        this._baseBulletCount = this._bulletCount;
        this._dropPowerGain = 0;
        this._playerElement = this._character.initial_element || 'wind';
        this._nextWaveDistance = this._firstWaveDistance;
        this._nextBossDistance = this._firstBossDistance;
        this._waveIndex = 0;
        this._playerUnitCount = 0;
        this._buildScene();
        this._refreshHud();
    };
    WarriorRunController.prototype._getSelectedCharacter = function () {
        var maxIndex = Math.max(0, RUN_CONFIG.characters.length - 1);
        var index = Math.max(0, Math.min(maxIndex, Math.floor(Number(GameData_1.default.currentRole) || 0)));
        return RUN_CONFIG.characters[index] || RUN_CONFIG.characters[0];
    };
    WarriorRunController.prototype._getBossHp = function (boss, extraMultiplier) {
        if (extraMultiplier === void 0) { extraMultiplier = 1; }
        var isFirstBoss = this._bossKills === 0 && this._distance <= this._firstBossDistance + this._bossPrepareDistance;
        var safeExtraMultiplier = isFirstBoss ? Math.max(0.75, extraMultiplier) : Math.max(1, extraMultiplier);
        var firstBossEase = isFirstBoss ? 0.78 : 1;
        var multiplier = (this._levelConfig ? this._levelConfig.boss_hp_multiplier : 1)
            * safeExtraMultiplier
            * this._getBossDifficultyMultiplier()
            * firstBossEase;
        return Math.max(1, Math.floor(boss.base_hp * multiplier));
    };
    WarriorRunController.prototype._buildScene = function () {
        var _this = this;
        this._gameLayer = this._getOrAddNode('GameLayer', this._canvas, 0, 0, this._viewW, this._viewH);
        this._uiLayer = this._getOrAddNode('UILayer', this._canvas, 0, 0, this._viewW, this._viewH);
        this._popupLayer = this._getOrAddNode('PopupLayer', this._canvas, 0, 0, this._viewW, this._viewH);
        this._popupLayer.zIndex = 1000;
        this._clearRuntimeNodes();
        var bg = this._getOrAddSprite('bg', this._gameLayer, 'beijing', 0, 0, this._viewW, this._viewH, false);
        bg.zIndex = -10;
        this._drawLaneGuides();
        var playerY = this._sceneY(-561.893);
        this._player = this._getOrAddNode('Player', this._gameLayer, this._laneXs[this._playerLane], playerY, 220, 150);
        this._disableWidget(this._player);
        this._clearRuntimeChildren(this._player);
        var previewSprite = this._player.getComponent(cc.Sprite);
        if (previewSprite)
            previewSprite.enabled = false;
        this._player.scaleX = 1;
        this._player.scaleY = 1;
        this._player.zIndex = 20;
        this._elementRing = this._getOrAddSpriteOriginal('PlayerElement', this._gameLayer, 'fazhen1', this._player.x, this._sceneY(-518));
        this._disableWidget(this._elementRing);
        this._playerRingOffsetY = this._elementRing.y - this._player.y;
        this._elementRing.zIndex = 18;
        this._syncPlayerSquad();
        this._bulletLabel = this._getOrAddLabel('BulletCount', this._gameLayer, String(this._bulletCount), this._player.x, this._sceneY(-395.75), 38, cc.Color.WHITE);
        this._disableWidget(this._bulletLabel.node);
        this._stylePlayerCountLabel(this._bulletLabel);
        this._bulletLabel.node.zIndex = 30;
        this.scheduleOnce(function () { return _this._syncPlayerPresentation(); }, 0);
        this._scoreBg = this._getOrAddSprite('ScoreBg', this._uiLayer, 'dikuang1', 0, this._topYFromScene(582.085), 179, 95);
        this._scoreBg.zIndex = 10;
        this._scoreLabel = this._getOrAddLabel('ScoreLabel', this._uiLayer, '0', 0, this._topYFromScene(583.33), 38, cc.Color.YELLOW);
        this._distanceLabel = this._getOrAddLabel('DistanceLabel', this._uiLayer, '距离 0米', 0, this._topYFromScene(583.899), 22, cc.Color.WHITE);
        this._distanceLabel.node.zIndex = 12;
        this._comboLabel = this._getOrAddLabel('ComboLabel', this._uiLayer, 'COMBO 0!', this._sceneX(-238), this._topYFromScene(440), 34, cc.Color.YELLOW);
        this._damageBuffLabel = this._getOrAddLabel('BuffLabel', this._uiLayer, '+0% DMG', this._sceneX(-242), this._topYFromScene(402), 22, cc.Color.WHITE);
        this._comboLabel.node.active = false;
        this._damageBuffLabel.node.active = false;
        this._progressBar = this._getOrAddNode('ProgressBar', this._uiLayer, 0, this._topYFromScene(510), 420, 16);
        this._progressBar.active = false;
        this._pauseBtn = this._getOrAddSprite('PauseBtn', this._uiLayer, 'zanting1', this._sceneX(295), this._topYFromScene(581), 89, 88);
        this._pauseBtn.off(cc.Node.EventType.TOUCH_END, this._showPausePopup, this);
        this._pauseBtn.on(cc.Node.EventType.TOUCH_END, this._showPausePopup, this);
    };
    WarriorRunController.prototype._sceneX = function (baseX) {
        if (baseX > 0)
            return this._viewW / 2 - (360 - baseX);
        if (baseX < 0)
            return -this._viewW / 2 + (baseX + 360);
        return 0;
    };
    WarriorRunController.prototype._sceneY = function (baseY) {
        return this._bottomY + (baseY + 640);
    };
    WarriorRunController.prototype._topYFromScene = function (baseY) {
        return this._topY - (640 - baseY);
    };
    WarriorRunController.prototype._drawLaneGuides = function () {
        var _this = this;
        var gNode = this._getOrAddNode('LaneGuides', this._gameLayer, 0, 0, this._viewW, this._viewH);
        var oldGraphics = gNode.getComponent(cc.Graphics);
        if (oldGraphics)
            oldGraphics.destroy();
        var halfGap = Math.abs(this._laneXs[1] - this._laneXs[0]) * 0.5;
        [-halfGap, halfGap].forEach(function (x, index) {
            var guide = _this._getOrAddNode('Guide_' + index, gNode, x, 0, 4, _this._viewH - 60);
            _this._drawRect(guide, new cc.Color(130, 220, 255, 100));
        });
    };
    WarriorRunController.prototype._drawProgress = function (ratio) {
        ratio = Math.max(0, Math.min(1, ratio));
        if (Math.abs(ratio - this._lastProgressRatio) < 0.005)
            return;
        this._lastProgressRatio = ratio;
        var bg = this._getOrAddNode('ProgressBg', this._progressBar, 0, 0, 420, 16);
        this._drawRect(bg, new cc.Color(20, 35, 55, 190));
        var fill = this._getOrAddNode('ProgressFill', this._progressBar, -210 + 210 * ratio, 0, 420 * ratio, 16);
        this._drawRect(fill, new cc.Color(90, 230, 160, 230));
    };
    WarriorRunController.prototype.update = function (dt) {
        if (this._paused || this._ended || !this._player)
            return;
        this._distance += this._runSpeed * dt;
        this._spawnEndlessByDistance();
        this._updateEntities(dt);
        this._autoFire(dt);
        this._updateScore();
        this._refreshHud();
    };
    WarriorRunController.prototype._spawnEndlessByDistance = function () {
        while (this._distance >= this._nextWaveDistance) {
            if (this._nextBossDistance - this._distance < this._bossPrepareDistance || this._bossActive) {
                this._nextWaveDistance = Math.max(this._nextWaveDistance + this._waveDelayStackNearBoss, this._distance + this._waveDelayNearBoss);
                break;
            }
            this._spawnEndlessWave();
            this._nextWaveDistance += this._getNextWaveGap();
        }
        while (this._distance >= this._nextBossDistance) {
            if (!this._bossActive) {
                this._spawnEndlessBoss();
                this._nextWaveDistance = Math.max(this._nextWaveDistance, this._distance + this._waveDelayAfterBossSpawn);
            }
            this._nextBossDistance += Math.max(this._bossMinGap, this._bossBaseGap - this._bossKills * this._bossGapDecreasePerKill);
        }
    };
    WarriorRunController.prototype._spawnEndlessWave = function () {
        this._waveIndex++;
        var groupCount = Math.min(this._maxGroupsPerWave, 1 + Math.floor(this._waveIndex / this._wavesPerExtraGroup));
        var lanes = this._shuffleLanes();
        for (var i = 0; i < groupCount; i++) {
            var target = this._pickEndlessTarget();
            if (!target)
                continue;
            var spawn = {
                spawn_distance: this._distance,
                type: 'target',
                entity_id: target.entity_id,
                lane: lanes[i % lanes.length],
                element: this._pickEndlessElement(),
                unit_count_multiplier: this._getEndlessTargetMultiplier(i),
            };
            this._spawnEntity(spawn);
        }
    };
    WarriorRunController.prototype._spawnEndlessBoss = function () {
        var boss = RUN_CONFIG.bosses[0];
        if (!boss)
            return;
        this._spawnEntity({
            spawn_distance: this._distance,
            type: 'boss',
            entity_id: boss.entity_id,
            lane: Math.floor(Math.random() * 3),
            element: boss.element_type,
            unit_count_multiplier: this._getEndlessBossMultiplier(),
        });
    };
    WarriorRunController.prototype._spawnEntity = function (spawn) {
        if (spawn.type === 'boss') {
            var boss = this._findBoss(spawn.entity_id);
            if (!boss)
                return;
            this._bossActive = true;
            var bossHp = this._getBossHp(boss, spawn.unit_count_multiplier || 1);
            var node_1 = this._createBossNode(boss, spawn.lane, bossHp);
            this._entities.push({
                id: this._nextEntityId(spawn.entity_id),
                kind: 'boss',
                node: node_1,
                lane: spawn.lane,
                element: boss.element_type,
                hp: bossHp,
                maxHp: bossHp,
                bossConfig: boss,
                shiftTimer: boss.shift_interval_sec,
            });
            return;
        }
        var target = this._findTarget(spawn.entity_id);
        if (!target)
            return;
        var units = this._getClusterUnits(target, spawn);
        var hp = Math.max(1, units * target.hp_per_unit);
        var node = this._createTargetNode(target, spawn.lane, spawn.element, units);
        this._entities.push({
            id: this._nextEntityId(spawn.entity_id),
            kind: 'target',
            node: node,
            lane: spawn.lane,
            element: spawn.element,
            hp: hp,
            maxHp: hp,
            targetConfig: target,
            hpPerUnit: target.hp_per_unit,
            speedMultiplier: this._getTargetSpeedMultiplier(target, spawn),
        });
    };
    WarriorRunController.prototype._createTargetNode = function (target, lane, element, units) {
        var root = this._addNode(target.name, this._gameLayer, this._laneXs[lane], this._topY - 120, 190, 150);
        root.zIndex = 15;
        this._addSpriteOriginal('ElementRing', root, this._ringSprite(element), 0, -28);
        this._addClusterSprites(root, target, units);
        var hpLabel = this._addLabel('HpLabel', root, String(units), 0, 56, 30, cc.Color.WHITE);
        this._styleMonsterCountLabel(hpLabel);
        return root;
    };
    WarriorRunController.prototype._createBossNode = function (boss, lane, hp) {
        var root = this._addNode(boss.name, this._gameLayer, this._laneXs[lane], this._topY - 160, 220, 210);
        root.zIndex = 16;
        this._addSpriteOriginal('ElementRing', root, this._ringSprite(boss.element_type), 0, -34);
        var body = this._addSpriteOriginal('BossBody', root, 'boss', 0, -34);
        body.zIndex = 2;
        var bossLabel = this._addLabel('BossLabel', root, String(hp), 0, 82, 26, cc.Color.WHITE);
        this._styleMonsterCountLabel(bossLabel);
        return root;
    };
    WarriorRunController.prototype._addClusterSprites = function (root, target, units) {
        var _this = this;
        var count = this._getMonsterVisualCount(target, units);
        var positions = this._getSquadLayout('monster', count);
        var spriteKey = this._randomSmallMonsterSprite();
        positions.forEach(function (p, index) {
            var unit = _this._addSprite('Monster_' + index, root, spriteKey, p[0], p[1], 62, 76);
            unit.zIndex = index;
        });
    };
    WarriorRunController.prototype._getMonsterVisualCount = function (target, units) {
        if (!target || target.target_type === 'obstacle')
            return 1;
        var safeUnits = Math.max(1, units);
        if (safeUnits <= 15)
            return 1;
        if (safeUnits <= 30)
            return 2;
        if (safeUnits <= 50)
            return 3;
        if (safeUnits <= 75)
            return 4;
        return 5;
    };
    WarriorRunController.prototype._randomSmallMonsterSprite = function () {
        return 'xiaoguai' + (1 + Math.floor(Math.random() * 4));
    };
    WarriorRunController.prototype._pickEndlessTarget = function () {
        var clusters = RUN_CONFIG.targets.filter(function (target) { return target.target_type === 'cluster'; });
        if (!clusters.length)
            return null;
        return clusters[Math.floor(Math.random() * clusters.length)];
    };
    WarriorRunController.prototype._pickEndlessElement = function () {
        var elements = ['wind', 'fire', 'thunder'];
        return elements[Math.floor(Math.random() * elements.length)];
    };
    WarriorRunController.prototype._shuffleLanes = function () {
        var lanes = [0, 1, 2];
        for (var i = lanes.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = lanes[i];
            lanes[i] = lanes[j];
            lanes[j] = tmp;
        }
        return lanes;
    };
    WarriorRunController.prototype._getEndlessTargetMultiplier = function (offset) {
        var distanceTier = Math.floor(this._distance / 650);
        var waveTier = Math.floor(this._waveIndex / 4);
        var baseMultiplier = 0.55 + distanceTier * 0.05 + waveTier * 0.035 + offset * 0.06;
        return baseMultiplier * this._getTargetDifficultyMultiplier();
    };
    WarriorRunController.prototype._getEndlessBossMultiplier = function () {
        return this._clamp(0.75 + Math.floor(this._distance / 1100) * 0.08 + this._bossKills * 0.12, 0.75, 2.2);
    };
    WarriorRunController.prototype._getNextWaveGap = function () {
        if (this._waveIndex <= 2)
            return 120;
        return this._clamp(this._waveGapStart - this._waveIndex * this._waveGapDecreasePerWave - this._getDifficultyLevel() * this._waveGapDifficultyDecrease, this._waveGapMin, this._waveGapStart);
    };
    WarriorRunController.prototype._getEnemyMoveSpeed = function () {
        var speedMultiplier = Math.min(2.05, 1 + this._distance / 8500 + (this._getPowerPressureMultiplier() - 1) * 0.18);
        return this._runSpeed * speedMultiplier;
    };
    WarriorRunController.prototype._getBossMoveSpeed = function (boss) {
        var speedMultiplier = Math.min(1.8, 1 + this._distance / 11000 + this._bossKills * 0.025);
        return (boss.approach_speed_per_sec * 16) * speedMultiplier;
    };
    WarriorRunController.prototype._getDifficultyLevel = function () {
        return Math.max(0, this._distance / this._difficultyDistanceStep);
    };
    WarriorRunController.prototype._getPowerPressureMultiplier = function () {
        var baseBulletCount = Math.max(10, this._baseBulletCount || 10);
        var bulletRatio = Math.max(1, this._bulletCount / baseBulletCount);
        var gainRatio = Math.max(0, this._dropPowerGain / baseBulletCount);
        var pressureSeed = Math.max(0, bulletRatio - 1, gainRatio * 0.35);
        return this._clamp(1 + Math.pow(pressureSeed, 0.82) * 0.36, 1, 6.5);
    };
    WarriorRunController.prototype._getTargetDifficultyMultiplier = function () {
        var distance = Math.max(0, this._distance);
        var distancePressure = 1 + distance / 4200 + Math.pow(distance / 9000, 1.2);
        return this._clamp(distancePressure * this._getPowerPressureMultiplier(), 1, 18);
    };
    WarriorRunController.prototype._getBossDifficultyMultiplier = function () {
        var distance = Math.max(0, this._distance);
        var distancePressure = 1 + distance / 3600 + Math.pow(distance / 8000, 1.25);
        var powerPressure = 1 + (this._getPowerPressureMultiplier() - 1) * 0.95;
        return this._clamp(distancePressure * powerPressure, 1, 26);
    };
    WarriorRunController.prototype._updateEntities = function (dt) {
        for (var i = this._entities.length - 1; i >= 0; i--) {
            var entity = this._entities[i];
            if (!entity.node || !entity.node.isValid) {
                this._entities.splice(i, 1);
                continue;
            }
            if (entity.kind === 'boss') {
                this._updateBoss(entity, dt);
            }
            else {
                entity.node.y -= this._getEnemyMoveSpeed() * (entity.speedMultiplier || 1) * dt;
                if (entity.node.y < this._bottomY - 90 && !entity.passed) {
                    entity.passed = true;
                    this._entities.splice(i, 1);
                    entity.node.destroy();
                }
            }
        }
    };
    WarriorRunController.prototype._updateBoss = function (entity, dt) {
        var boss = entity.bossConfig;
        entity.node.y -= this._getBossMoveSpeed(boss) * dt;
        entity.shiftTimer -= dt;
        if (entity.shiftTimer <= 0) {
            entity.shiftTimer = boss.shift_interval_sec;
            var nextLane = this._pickBossLane(entity.lane);
            entity.lane = nextLane;
            entity.node.runAction(cc.moveTo(0.18, cc.v2(this._laneXs[nextLane], entity.node.y)));
        }
        if (entity.node.y <= this._player.y + 40) {
            this._gameOver();
        }
    };
    WarriorRunController.prototype._autoFire = function (dt) {
        this._fireTimer += dt;
        var interval = 1 / Math.max(1, this._character.fire_rate_per_sec);
        while (this._fireTimer >= interval) {
            this._fireTimer -= interval;
            this._shootOnce();
        }
    };
    WarriorRunController.prototype._shootOnce = function () {
        var target = this._findFirstTargetInLane(this._playerLane);
        if (!target) {
            this._resetCombo();
            this._drawBulletTrail(null);
            return;
        }
        if (this._lockedId === target.id) {
            this._combo = Math.min(RUN_CONFIG.global_configs.combo_max_limit, this._combo + 1);
        }
        else {
            this._lockedId = target.id;
            this._combo = 1;
        }
        this._bestCombo = Math.max(this._bestCombo, this._combo);
        var comboBuff = 1 + this._combo * (RUN_CONFIG.global_configs.combo_dmg_buff_per_hit + (this._character.combo_dmg_bonus_per_hit || 0));
        var elementMult = this._getElementMultiplier(this._playerElement, target.element);
        var damage = this._character.base_attack * this._bulletCount * comboBuff * elementMult;
        if (target.kind === 'boss')
            damage *= (this._character.boss_damage_multiplier || 1);
        this._showElementDamageText(target, damage, elementMult);
        target.hp -= damage;
        this._drawBulletTrail(target.node);
        this._refreshEntityHp(target);
        if (target.hp <= 0)
            this._killEntity(target);
    };
    WarriorRunController.prototype._findFirstTargetInLane = function (lane) {
        var _this = this;
        var candidates = this._entities.filter(function (entity) {
            return (entity.kind === 'target' || entity.kind === 'boss') &&
                entity.lane === lane &&
                entity.node &&
                entity.node.isValid &&
                entity.node.y > _this._player.y;
        });
        candidates.sort(function (a, b) { return a.node.y - b.node.y; });
        return candidates[0] || null;
    };
    WarriorRunController.prototype._killEntity = function (entity) {
        var index = this._entities.indexOf(entity);
        if (index !== -1)
            this._entities.splice(index, 1);
        if (entity.kind === 'boss') {
            this._bossKills++;
            this._bossActive = false;
            this._nextWaveDistance = Math.min(this._nextWaveDistance, this._distance + this._waveDelayAfterBossKill);
            entity.node.destroy();
            return;
        }
        this._monsterKills += Math.ceil(entity.maxHp / Math.max(1, entity.targetConfig.hp_per_unit));
        if (entity.targetConfig.drop_types.length > 0)
            this._spawnDrop(entity);
        entity.node.destroy();
    };
    WarriorRunController.prototype._spawnDrop = function (source) {
        var allowedTypes = this._getAllowedDropTypes(source.targetConfig);
        var pool = RUN_CONFIG.drop_packs.filter(function (pack) { return allowedTypes.indexOf(pack.pack_type) !== -1; });
        if (pool.length === 0)
            return;
        var drop = this._pickDropPack(pool);
        var root = this._addNode(drop.name, this._gameLayer, source.node.x, source.node.y, 110, 90);
        root.zIndex = 14;
        this._addDropGlow(root, drop);
        var dropLabel = this._addLabel('DropText', root, this._getDropDisplayText(drop), 0, -18, 34, cc.Color.WHITE);
        this._styleDropLabel(dropLabel, drop);
        this._entities.push({
            id: this._nextEntityId(drop.pack_id),
            kind: 'drop',
            node: root,
            lane: source.lane,
            element: drop.element_value,
            hp: 1,
            maxHp: 1,
            dropConfig: drop,
        });
    };
    WarriorRunController.prototype._pickDropPack = function (pool) {
        var _this = this;
        var totalWeight = 0;
        var weighted = pool.map(function (drop) {
            var weight = _this._getDropWeight(drop);
            totalWeight += weight;
            return { drop: drop, weight: weight };
        });
        if (totalWeight <= 0) {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        var roll = Math.random() * totalWeight;
        for (var i = 0; i < weighted.length; i++) {
            roll -= weighted[i].weight;
            if (roll <= 0) {
                return weighted[i].drop;
            }
        }
        return weighted[weighted.length - 1].drop;
    };
    WarriorRunController.prototype._getDropWeight = function (drop) {
        var isBeforeFirstBoss = this._bossKills === 0 && this._distance < this._firstBossDistance;
        if (drop.math_operator === 'multiply') {
            if (isBeforeFirstBoss)
                return this._bulletCount >= 55 ? 0.22 : 0.14;
            if (this._bulletCount < 50)
                return 0.16;
            if (this._bulletCount >= 220)
                return 0.05;
            if (this._bulletCount >= 120)
                return 0.12;
            return 0.28;
        }
        if (drop.math_operator === 'add') {
            if (drop.math_value >= 50) {
                if (isBeforeFirstBoss)
                    return this._bulletCount >= 70 ? 0.9 : 1.7;
                if (this._bulletCount >= 180)
                    return 0.4;
                if (this._bulletCount >= 100)
                    return 0.8;
                return 1.2;
            }
            return isBeforeFirstBoss ? 7 : 3.5;
        }
        if (drop.pack_type === 'math_debuff') {
            if (this._bulletCount >= 180)
                return 5;
            if (this._bulletCount >= 100)
                return 3.5;
            return isBeforeFirstBoss ? 1.2 : 2.2;
        }
        return isBeforeFirstBoss ? 4 : 2.5;
    };
    WarriorRunController.prototype._getAllowedDropTypes = function (target) {
        var types = (target && target.drop_types ? target.drop_types.slice() : []);
        if (types.indexOf('math_buff') !== -1 && this._bulletCount >= 80 && types.indexOf('math_debuff') === -1) {
            types.push('math_debuff');
        }
        return types;
    };
    WarriorRunController.prototype._addDropGlow = function (root, drop) {
        var glow = this._addNode('DropGlow', root, 0, -18, 92, 92);
        glow.zIndex = 1;
        var graphics = glow.addComponent(cc.Graphics);
        var color = this._getDropTextColor(drop);
        var r = color.r;
        var g = color.g;
        var b = color.b;
        graphics.fillColor = new cc.Color(r, g, b, 34);
        graphics.circle(0, 0, 42);
        graphics.fill();
        graphics.lineWidth = 8;
        graphics.strokeColor = new cc.Color(r, g, b, 72);
        graphics.circle(0, 0, 40);
        graphics.stroke();
        graphics.lineWidth = 3;
        graphics.strokeColor = new cc.Color(255, 255, 255, 150);
        graphics.circle(0, 0, 31);
        graphics.stroke();
    };
    WarriorRunController.prototype._checkDropPickup = function (entity) {
        if (entity.kind !== 'drop')
            return false;
        var hit = entity.lane === this._playerLane && Math.abs(entity.node.y - this._player.y) < 72;
        if (!hit)
            return false;
        this._applyDrop(entity.dropConfig);
        entity.node.destroy();
        return true;
    };
    WarriorRunController.prototype._applyDrop = function (drop) {
        if (drop.pack_type === 'element') {
            this._playerElement = drop.element_value;
            this._setSprite(this._elementRing, this._ringSprite(this._playerElement));
            return;
        }
        var beforeCount = this._bulletCount;
        if (drop.math_operator === 'add')
            this._bulletCount += drop.math_value;
        if (drop.math_operator === 'subtract')
            this._bulletCount -= drop.math_value;
        if (drop.math_operator === 'multiply')
            this._bulletCount *= drop.math_value;
        if (drop.math_operator === 'divide')
            this._bulletCount = Math.floor(this._bulletCount / Math.max(1, drop.math_value));
        this._bulletCount = Math.max(1, Math.min(this._getBulletCountLimit(), Math.floor(this._bulletCount)));
        this._recordDropPowerChange(beforeCount, this._bulletCount);
        this._syncPlayerSquad();
        this._pulseNode(this._bulletLabel.node, drop.pack_type === 'math_debuff');
    };
    WarriorRunController.prototype._recordDropPowerChange = function (beforeCount, afterCount) {
        var delta = afterCount - beforeCount;
        if (delta > 0) {
            this._dropPowerGain += delta;
        }
        else if (delta < 0) {
            this._dropPowerGain = Math.max(0, this._dropPowerGain + delta * 0.65);
        }
    };
    WarriorRunController.prototype._getBulletCountLimit = function () {
        if (this._bossKills <= 0)
            return 95;
        var distanceBonus = Math.floor(Math.max(0, this._distance - this._firstBossDistance) / 2200) * 30;
        return this._clamp(140 + this._bossKills * 45 + distanceBonus, 140, 360);
    };
    WarriorRunController.prototype._getDropDisplayText = function (drop) {
        if (drop.pack_type === 'element') {
            if (drop.element_value === 'fire')
                return '火';
            if (drop.element_value === 'thunder')
                return '雷';
            return '风';
        }
        return drop.name;
    };
    WarriorRunController.prototype._styleDropLabel = function (label, drop) {
        var color = this._getDropTextColor(drop);
        label.node.color = color;
        label.fontSize = drop.pack_type === 'element' ? 40 : 34;
        label.lineHeight = label.fontSize + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.SHRINK;
        label.node.setContentSize(96, 56);
        label.node.zIndex = 6;
        this._setLabelOutline(label, this._getDropOutlineColor(drop), drop.pack_type === 'element' ? 5 : 4);
        var shadow = label.node.getComponent(cc.LabelShadow);
        if (!shadow)
            shadow = label.node.addComponent(cc.LabelShadow);
        shadow.color = new cc.Color(color.r, color.g, color.b, 180);
        shadow.offset = cc.v2(0, 0);
        shadow.blur = drop.pack_type === 'element' ? 12 : 8;
    };
    WarriorRunController.prototype._getDropTextColor = function (drop) {
        if (drop.pack_type === 'math_debuff')
            return new cc.Color(255, 72, 72, 255);
        if (drop.pack_type === 'math_buff')
            return new cc.Color(86, 255, 112, 255);
        if (drop.element_value === 'fire')
            return new cc.Color(255, 126, 45, 255);
        if (drop.element_value === 'thunder')
            return new cc.Color(190, 120, 255, 255);
        return new cc.Color(92, 235, 255, 255);
    };
    WarriorRunController.prototype._getDropOutlineColor = function (drop) {
        if (drop.pack_type === 'math_debuff')
            return new cc.Color(76, 0, 0, 255);
        if (drop.pack_type === 'math_buff')
            return new cc.Color(8, 70, 18, 255);
        if (drop.element_value === 'fire')
            return new cc.Color(88, 26, 0, 255);
        if (drop.element_value === 'thunder')
            return new cc.Color(45, 14, 92, 255);
        return new cc.Color(0, 58, 78, 255);
    };
    WarriorRunController.prototype._syncPlayerSquad = function () {
        var _this = this;
        if (!this._player)
            return;
        var count = this._getPlayerUnitCount();
        var runtimeUnits = this._player.children.filter(function (child) { return child.name.indexOf('Runtime_PlayerUnit_') === 0; });
        var playerSpriteKey = this._getSelectedPlayerSpriteKey();
        this._playerUnitCount = count;
        runtimeUnits.forEach(function (child) {
            var rawIndex = Number(child.name.replace('Runtime_PlayerUnit_', ''));
            if (isNaN(rawIndex) || rawIndex >= count)
                child.destroy();
        });
        var positions = this._getSquadLayout('player', count);
        positions.forEach(function (pos, index) {
            var unit = _this._getOrAddSpriteOriginal('Runtime_PlayerUnit_' + index, _this._player, playerSpriteKey, pos[0], pos[1]);
            unit.zIndex = index;
        });
    };
    WarriorRunController.prototype._getSelectedPlayerSpriteKey = function () {
        var maxIndex = Math.max(0, RUN_CONFIG.characters.length - 1);
        var roleIndex = Math.max(0, Math.min(maxIndex, Math.floor(Number(GameData_1.default.currentRole) || 0)));
        var key = 'juese' + (roleIndex + 1);
        return this._sprites[key] ? key : 'juese1';
    };
    WarriorRunController.prototype._syncPlayerPresentation = function () {
        if (!this._player || !this._elementRing || !this._bulletLabel)
            return;
        var playerY = this._sceneY(-561.893);
        this._player.stopAllActions();
        this._elementRing.stopAllActions();
        this._bulletLabel.node.stopAllActions();
        this._disableWidget(this._player);
        this._disableWidget(this._elementRing);
        this._disableWidget(this._bulletLabel.node);
        this._player.setPosition(this._laneXs[this._playerLane], playerY);
        this._elementRing.setPosition(this._player.x, this._sceneY(-518));
        this._bulletLabel.node.setPosition(this._player.x, this._sceneY(-395.75));
        this._playerRingOffsetY = this._elementRing.y - this._player.y;
        this._syncPlayerSquad();
    };
    WarriorRunController.prototype._getPlayerUnitCount = function () {
        if (this._bulletCount >= 110)
            return 5;
        if (this._bulletCount >= 70)
            return 4;
        if (this._bulletCount >= 40)
            return 3;
        if (this._bulletCount >= 20)
            return 2;
        return 1;
    };
    WarriorRunController.prototype._getSquadLayout = function (kind, count) {
        if (count === void 0) { count = 5; }
        if (kind === 'player') {
            var cy = this._playerRingOffsetY;
            if (count <= 1)
                return [[0, cy - 22]];
            if (count === 2)
                return [[-28, cy - 22], [28, cy - 22]];
            if (count === 3)
                return [[-28, cy + 24], [28, cy + 24], [0, cy - 30]];
            if (count === 4)
                return [[-28, cy + 24], [28, cy + 24], [-28, cy - 30], [28, cy - 30]];
            return [[-28, cy + 26], [28, cy + 26], [-56, cy - 28], [0, cy - 28], [56, cy - 28]];
        }
        if (count <= 1)
            return [[0, -28]];
        if (count === 2)
            return [[-28, -28], [28, -28]];
        if (count === 3)
            return [[-56, -8], [0, -8], [56, -8]];
        if (count === 4)
            return [[-56, -8], [0, -8], [56, -8], [0, -58]];
        return [[-56, -8], [0, -8], [56, -8], [-28, -58], [28, -58]];
    };
    WarriorRunController.prototype._moveLane = function (dir) {
        if (this._paused || this._ended)
            return;
        var next = Math.max(0, Math.min(2, this._playerLane + dir));
        if (next === this._playerLane)
            return;
        this._playerLane = next;
        this._resetCombo();
        var targetX = this._laneXs[next];
        this._movePlayerPresentationToX(targetX, 0.1);
    };
    WarriorRunController.prototype._resetCombo = function () {
        this._lockedId = '';
        this._combo = 0;
    };
    WarriorRunController.prototype._movePlayerPresentationToX = function (targetX, duration) {
        var nodes = [
            this._player,
            this._elementRing,
            this._bulletLabel && this._bulletLabel.node,
        ].filter(function (node) { return !!node; });
        nodes.forEach(function (node) {
            node.stopAllActions();
            node.runAction(cc.sequence(cc.moveTo(duration, cc.v2(targetX, node.y)), cc.callFunc(function () { return node.x = targetX; })));
        });
    };
    WarriorRunController.prototype._onTouchStart = function (event) {
        this._touchStart = event.touch.getLocation();
    };
    WarriorRunController.prototype._onTouchEnd = function (event) {
        if (!this._touchStart)
            return;
        var end = event.touch.getLocation();
        var dx = end.x - this._touchStart.x;
        this._touchStart = null;
        if (Math.abs(dx) < 36)
            return;
        this._moveLane(dx > 0 ? 1 : -1);
    };
    WarriorRunController.prototype._refreshHud = function () {
        this._alignPlayerHudX();
        if (this._distanceLabel)
            this._distanceLabel.string = '距离 ' + this._getDisplayDistance() + '米';
        if (this._scoreLabel)
            this._scoreLabel.string = String(this._score);
        if (this._comboLabel)
            this._comboLabel.string = 'COMBO ' + this._combo + '!';
        if (this._damageBuffLabel)
            this._damageBuffLabel.string = '+' + this._combo + '% DMG';
        if (this._bulletLabel)
            this._bulletLabel.string = String(this._bulletCount);
        if (this._progressBar)
            this._progressBar.active = false;
        for (var i = this._entities.length - 1; i >= 0; i--) {
            if (this._checkDropPickup(this._entities[i]))
                this._entities.splice(i, 1);
        }
    };
    WarriorRunController.prototype._alignPlayerHudX = function () {
        if (!this._player)
            return;
        if (this._elementRing && Math.abs(this._elementRing.x - this._player.x) > 0.5) {
            this._elementRing.x = this._player.x;
        }
        if (this._bulletLabel && Math.abs(this._bulletLabel.node.x - this._player.x) > 0.5) {
            this._bulletLabel.node.x = this._player.x;
        }
    };
    WarriorRunController.prototype._refreshEntityHp = function (entity) {
        var labelNode = entity.node.getChildByName('HpLabel') || entity.node.getChildByName('BossLabel');
        var label = labelNode && labelNode.getComponent(cc.Label);
        if (!label)
            return;
        if (entity.kind === 'boss') {
            label.string = String(Math.max(0, Math.ceil(entity.hp)));
        }
        else {
            var hpPerUnit = entity.hpPerUnit || (entity.targetConfig && entity.targetConfig.hp_per_unit) || 1;
            label.string = String(Math.max(0, Math.ceil(entity.hp / Math.max(1, hpPerUnit))));
        }
    };
    WarriorRunController.prototype._updateScore = function () {
        this._score = this._getDisplayDistance() * RUN_CONFIG.global_configs.score_per_distance
            + this._monsterKills * RUN_CONFIG.global_configs.score_per_monster_kill
            + this._bestCombo * 100
            + this._bossKills * 5000;
    };
    WarriorRunController.prototype._gameOver = function () {
        if (this._ended)
            return;
        this._ended = true;
        this._paused = true;
        this._updateScore();
        this._saveBestDistance();
        this._showFailPopup();
    };
    WarriorRunController.prototype._showPausePopup = function () {
        var _this = this;
        if (this._ended)
            return;
        this._paused = true;
        if (this._showConfiguredPopup('PausePopup', [
            { name: 'continueBtn', cb: function () { _this._hidePopupLayer(); _this._paused = false; } },
            { name: 'backBtn', cb: function () { return _this._returnToStartWithReward(); } },
        ])) {
            return;
        }
        cc.warn('[WarriorRun] pause popup node not found: PausePopup');
    };
    WarriorRunController.prototype._showFailPopup = function () {
        if (cc.sys && cc.sys.platform === cc.sys.WECHAT_GAME && window.wx && window.wx.vibrateShort) {
            window.wx.vibrateShort({});
        }
        if (!this._reviveUsed && this._showRevivePopup()) {
            return;
        }
        if (this._showGameOverPopup()) {
            return;
        }
        cc.warn('[WarriorRun] game over popup node not found: GameOverPopup');
    };
    WarriorRunController.prototype._showRevivePopup = function () {
        var _this = this;
        return this._showConfiguredPopup('RevivePopup', [
            { name: 'continueBtn', cb: function () { return _this._reviveFromBoss(); } },
            { name: 'backBtn', cb: function () { if (!_this._showGameOverPopup())
                    _this._returnToStartWithReward(); } },
        ], '成绩： ' + this._getDisplayDistance());
    };
    WarriorRunController.prototype._showGameOverPopup = function () {
        var _this = this;
        return this._showConfiguredPopup('GameOverPopup', [
            { name: 'retryBtn', cb: function () { return _this._retryRun(); } },
            { name: 'backBtn', cb: function () { return _this._returnToStartWithReward(); } },
        ], '成绩： ' + this._getDisplayDistance());
    };
    WarriorRunController.prototype._retryRun = function () {
        if (this._retrying)
            return;
        this._retrying = true;
        StateBridge_1.default.syncForStartScene();
        if (!StateBridge_1.default.consumeStamina()) {
            this._returnToStartWithReward();
            return;
        }
        cc.director.loadScene('WarriorRun');
    };
    WarriorRunController.prototype._getDisplayDistance = function () {
        return Math.max(0, Math.floor(this._distance * DISPLAY_DISTANCE_SCALE));
    };
    WarriorRunController.prototype._getSettlementDiamond = function () {
        return Math.max(1, Math.floor(this._score / 300));
    };
    WarriorRunController.prototype._reviveFromBoss = function () {
        if (this._reviveUsed)
            return;
        this._reviveUsed = true;
        this._ended = false;
        this._paused = false;
        this._hidePopupLayer();
        this._entities.forEach(function (entity) {
            if (entity.kind === 'boss') {
                entity.node.stopAllActions();
                entity.node.y = Math.max(entity.node.y + 220, 250);
            }
        });
    };
    WarriorRunController.prototype._grantDiamond = function (amount) {
        if (this._rewardGranted) {
            cc.director.loadScene('Start');
            return;
        }
        this._rewardGranted = true;
        if (GameData_1.default && GameData_1.default.addGold) {
            GameData_1.default.addGold(amount);
        }
        StateBridge_1.default.syncNewToOld();
        cc.director.loadScene('Start');
    };
    WarriorRunController.prototype._returnToStartWithReward = function () {
        this._paused = true;
        this._ended = true;
        this._updateScore();
        this._saveBestDistance();
        this._grantDiamond(this._getSettlementDiamond());
    };
    WarriorRunController.prototype._showConfiguredPopup = function (popupName, buttons, body) {
        var _this = this;
        if (body === void 0) { body = ''; }
        if (!this._popupLayer)
            return false;
        var popup = this._popupLayer.getChildByName(popupName);
        if (!popup)
            return false;
        this._hidePopupLayer();
        popup.active = true;
        popup.zIndex = 1000;
        popup.setPosition(0, 0);
        popup.setContentSize(this._viewW, this._viewH);
        var mask = popup.getChildByName('Mask') || popup.getChildByName('遮罩');
        if (mask) {
            mask.setPosition(0, 0);
            mask.setContentSize(this._viewW, this._viewH);
            mask.scaleX = 1;
            mask.scaleY = 1;
        }
        var bodyLabel = this._findDeepLabel(popup, 'Body');
        if (bodyLabel) {
            bodyLabel.string = body;
            bodyLabel.node.active = !!body;
        }
        var diamondLabel = this._findDeepLabel(popup, 'DiamondBody');
        if (diamondLabel) {
            diamondLabel.string = '本局获得钻石：' + this._getSettlementDiamond();
            diamondLabel.node.active = true;
        }
        buttons.forEach(function (cfg) {
            var btn = _this._findDeep(popup, cfg.name);
            if (!btn)
                return;
            btn.active = true;
            btn.targetOff(_this);
            btn.off(cc.Node.EventType.TOUCH_END);
            btn.on(cc.Node.EventType.TOUCH_END, cfg.cb, _this);
        });
        return true;
    };
    WarriorRunController.prototype._hidePopupLayer = function () {
        this._popupLayer.children.forEach(function (child) {
            child.active = false;
        });
    };
    WarriorRunController.prototype._findDeep = function (root, name) {
        if (!root)
            return null;
        if (root.name === name)
            return root;
        for (var i = 0; i < root.childrenCount; i++) {
            var found = this._findDeep(root.children[i], name);
            if (found)
                return found;
        }
        return null;
    };
    WarriorRunController.prototype._findDeepLabel = function (root, name) {
        var node = this._findDeep(root, name);
        return node && node.getComponent(cc.Label);
    };
    WarriorRunController.prototype._stylePlayerCountLabel = function (label) {
        if (!label)
            return;
        label.node.color = new cc.Color(190, 255, 80, 255);
        this._setLabelOutline(label, new cc.Color(28, 45, 26, 255), 3);
    };
    WarriorRunController.prototype._styleMonsterCountLabel = function (label) {
        if (!label)
            return;
        label.node.color = new cc.Color(255, 218, 255, 255);
        this._setLabelOutline(label, new cc.Color(18, 10, 28, 255), 4);
    };
    WarriorRunController.prototype._showElementDamageText = function (target, damage, elementMult) {
        if (!target || !target.node || !target.node.isValid || !this._gameLayer)
            return;
        if (elementMult === 1)
            return;
        var isAdvantage = elementMult > 1;
        var value = this._getElementDamageTextValue(target, damage);
        var label = this._addLabel('ElementDamageText', this._gameLayer, (isAdvantage ? '克制-' : '抵制') + value, target.node.x, target.node.y + 82, 28, isAdvantage ? new cc.Color(255, 238, 82, 255) : new cc.Color(145, 206, 255, 255));
        label.node.setContentSize(180, 44);
        label.overflow = cc.Label.Overflow.SHRINK;
        label.node.zIndex = 120;
        this._setLabelOutline(label, isAdvantage ? new cc.Color(96, 42, 0, 255) : new cc.Color(9, 46, 96, 255), 4);
        var shadow = label.node.getComponent(cc.LabelShadow);
        if (!shadow)
            shadow = label.node.addComponent(cc.LabelShadow);
        shadow.color = isAdvantage ? new cc.Color(255, 164, 0, 170) : new cc.Color(40, 140, 255, 170);
        shadow.offset = cc.v2(0, 0);
        shadow.blur = 8;
        label.node.opacity = 255;
        label.node.scaleX = 0.92;
        label.node.scaleY = 0.92;
        label.node.runAction(cc.sequence(cc.spawn(cc.moveBy(0.48, cc.v2(0, 58)), cc.sequence(cc.scaleTo(0.08, 1.16), cc.scaleTo(0.4, 1)), cc.fadeOut(0.48)), cc.callFunc(function () {
            if (label.node && label.node.isValid)
                label.node.destroy();
        })));
    };
    WarriorRunController.prototype._getElementDamageTextValue = function (target, damage) {
        if (target.kind === 'boss') {
            return Math.max(1, Math.ceil(damage));
        }
        var hpPerUnit = target.hpPerUnit || (target.targetConfig && target.targetConfig.hp_per_unit) || 1;
        var safeHpPerUnit = Math.max(1, hpPerUnit);
        var beforeUnits = Math.max(0, Math.ceil(target.hp / safeHpPerUnit));
        var afterUnits = Math.max(0, Math.ceil(Math.max(0, target.hp - damage) / safeHpPerUnit));
        return Math.max(1, beforeUnits - afterUnits);
    };
    WarriorRunController.prototype._setLabelOutline = function (label, color, width) {
        var outline = label.node.getComponent(cc.LabelOutline);
        if (!outline)
            outline = label.node.addComponent(cc.LabelOutline);
        outline.color = color;
        outline.width = width;
    };
    WarriorRunController.prototype._drawBulletTrail = function (target) {
        var _this = this;
        if (target === void 0) { target = null; }
        var origins = this._getPlayerBulletOrigins();
        var total = Math.max(1, origins.length);
        origins.forEach(function (origin, index) {
            var targetX = origin.x;
            var targetY = target ? target.y - 34 : _this._getBulletOffscreenY();
            _this._drawSingleBulletTrail(origin, cc.v2(targetX, targetY), index, total);
        });
    };
    WarriorRunController.prototype._getBulletOffscreenY = function () {
        return this._topY + 120;
    };
    WarriorRunController.prototype._getPlayerBulletOrigins = function () {
        var _this = this;
        if (!this._player || !this._gameLayer)
            return [cc.v2(this._laneXs[this._playerLane], this._bottomY + 160)];
        var units = this._player.children
            .filter(function (child) { return child.active && child.name.indexOf('Runtime_PlayerUnit_') === 0; })
            .sort(function (a, b) { return Number(a.name.replace('Runtime_PlayerUnit_', '')) - Number(b.name.replace('Runtime_PlayerUnit_', '')); });
        if (!units.length)
            return [cc.v2(this._player.x, this._player.y + this._playerRingOffsetY + 70)];
        return units.map(function (unit) {
            var size = unit.getContentSize();
            var muzzleY = Math.max(54, size.height * 0.5 + 8);
            var world = unit.convertToWorldSpaceAR(cc.v2(0, muzzleY));
            return _this._gameLayer.convertToNodeSpaceAR(world);
        });
    };
    WarriorRunController.prototype._drawSingleBulletTrail = function (start, end, index, total) {
        var _this = this;
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        var bullet = this._getBulletTrailNode(start.x, start.y);
        bullet.zIndex = 80 + index;
        bullet.opacity = 255;
        bullet.angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
        var color = this._getBulletColor();
        var graphics = bullet.getComponent(cc.Graphics) || bullet.addComponent(cc.Graphics);
        graphics.clear();
        var curve = 0;
        graphics.lineCap = cc.Graphics.LineCap.ROUND;
        graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        graphics.lineWidth = 24;
        graphics.strokeColor = new cc.Color(color.r, color.g, color.b, 62);
        graphics.moveTo(curve * -0.7, -58);
        graphics.bezierCurveTo(curve, -26, -curve, 18, curve * 0.35, 48);
        graphics.stroke();
        graphics.lineWidth = 12;
        graphics.strokeColor = new cc.Color(color.r, color.g, color.b, 168);
        graphics.moveTo(curve * -0.4, -50);
        graphics.bezierCurveTo(curve, -22, -curve, 16, curve * 0.25, 42);
        graphics.stroke();
        graphics.lineWidth = 4;
        graphics.strokeColor = new cc.Color(255, 255, 255, 245);
        graphics.moveTo(0, -42);
        graphics.bezierCurveTo(curve * 0.5, -16, -curve * 0.4, 16, 0, 34);
        graphics.stroke();
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, 150);
        graphics.circle(0, 48, 15);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 255, 255, 245);
        graphics.circle(0, 48, 7);
        graphics.fill();
        var duration = Math.max(0.12, Math.min(0.24, len / 2600));
        bullet.runAction(cc.sequence(cc.spawn(cc.moveTo(duration, end), cc.sequence(cc.scaleTo(duration * 0.35, 1.12, 1.08), cc.scaleTo(duration * 0.65, 0.88, 0.98)), cc.sequence(cc.fadeTo(duration * 0.7, 235), cc.fadeOut(duration * 0.3))), cc.callFunc(function () { return _this._recycleBulletTrailNode(bullet); })));
    };
    WarriorRunController.prototype._getBulletTrailNode = function (x, y) {
        var bullet = null;
        while (this._bulletTrailPool.length > 0 && !bullet) {
            var cached = this._bulletTrailPool.pop();
            if (cached && cached.isValid) {
                bullet = cached;
            }
        }
        if (!bullet) {
            bullet = this._addNode('Runtime_BulletLine', this._gameLayer, x, y, 92, 140);
            bullet.addComponent(cc.Graphics);
        }
        else {
            if (bullet.parent !== this._gameLayer) {
                this._gameLayer.addChild(bullet);
            }
            bullet.setContentSize(92, 140);
            bullet.setPosition(x, y);
        }
        bullet.stopAllActions();
        bullet.active = true;
        bullet.opacity = 255;
        bullet.scaleX = 1;
        bullet.scaleY = 1;
        bullet.angle = 0;
        return bullet;
    };
    WarriorRunController.prototype._recycleBulletTrailNode = function (bullet) {
        if (!bullet || !bullet.isValid)
            return;
        bullet.stopAllActions();
        var graphics = bullet.getComponent(cc.Graphics);
        if (graphics)
            graphics.clear();
        bullet.active = false;
        bullet.opacity = 255;
        bullet.scaleX = 1;
        bullet.scaleY = 1;
        bullet.angle = 0;
        this._bulletTrailPool.push(bullet);
    };
    WarriorRunController.prototype._getBulletColor = function () {
        if (this._playerElement === 'fire')
            return new cc.Color(255, 126, 45, 255);
        if (this._playerElement === 'thunder')
            return new cc.Color(190, 120, 255, 255);
        return new cc.Color(92, 235, 255, 255);
    };
    WarriorRunController.prototype._pulseNode = function (node, bad) {
        var _this = this;
        node.color = bad ? cc.Color.RED : cc.Color.WHITE;
        node.stopAllActions();
        node.runAction(cc.sequence(cc.scaleTo(0.06, 1.25), cc.scaleTo(0.08, 1), cc.callFunc(function () {
            if (_this._bulletLabel && node === _this._bulletLabel.node) {
                _this._stylePlayerCountLabel(_this._bulletLabel);
            }
            else {
                node.color = cc.Color.WHITE;
            }
        })));
    };
    WarriorRunController.prototype._getElementMultiplier = function (attacker, defender) {
        if (attacker === 'none' || defender === 'none' || attacker === defender)
            return 1;
        var beats = { wind: 'fire', fire: 'thunder', thunder: 'wind' };
        if (beats[attacker] === defender)
            return RUN_CONFIG.global_configs.element_advantage_multiplier + (this._character.element_advantage_bonus || 0);
        if (beats[defender] === attacker)
            return RUN_CONFIG.global_configs.element_disadvantage_multiplier;
        return 1;
    };
    WarriorRunController.prototype._pickBossLane = function (current) {
        var lanes = [0, 1, 2].filter(function (lane) { return lane !== current; });
        return lanes[Math.floor(Math.random() * lanes.length)];
    };
    WarriorRunController.prototype._getClusterUnits = function (target, spawn) {
        var multiplier = spawn && spawn.unit_count_multiplier ? spawn.unit_count_multiplier : 1;
        return Math.max(1, Math.round((target.unit_count || 1) * multiplier));
    };
    WarriorRunController.prototype._getTargetSpeedMultiplier = function (target, spawn) {
        var multiplier = 1;
        if (target.target_type === 'obstacle') {
            multiplier *= 0.82;
        }
        else if (target.cluster_shape === 'column') {
            multiplier *= 1.1;
        }
        else if (target.cluster_shape === 'wide') {
            multiplier *= 0.92;
        }
        if (spawn.element === 'wind')
            multiplier *= 1.08;
        if (spawn.element === 'fire')
            multiplier *= 1.03;
        if (spawn.element === 'thunder')
            multiplier *= 0.97;
        var laneOffset = (spawn.lane - 1) * 0.03;
        var randomOffset = 0.88 + Math.random() * 0.26;
        return this._clamp(multiplier * randomOffset + laneOffset, 0.76, 1.28);
    };
    WarriorRunController.prototype._clamp = function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    };
    WarriorRunController.prototype._ringSprite = function (element) {
        if (element === 'fire')
            return 'fazhen2';
        if (element === 'thunder')
            return 'fazhen3';
        return 'fazhen1';
    };
    WarriorRunController.prototype._findTarget = function (id) {
        return RUN_CONFIG.targets.filter(function (target) { return target.entity_id === id; })[0] || null;
    };
    WarriorRunController.prototype._findBoss = function (id) {
        return RUN_CONFIG.bosses.filter(function (boss) { return boss.entity_id === id; })[0] || null;
    };
    WarriorRunController.prototype._nextEntityId = function (prefix) {
        this._entitySeq++;
        return prefix + '_' + this._entitySeq;
    };
    WarriorRunController.prototype._saveBestDistance = function () {
        var key = this._getBestDistanceKey();
        var oldValue = Math.max(0, Math.floor(Number(cc.sys.localStorage.getItem(key)) || 0));
        var nextValue = Math.max(oldValue, this._getDisplayDistance());
        if (nextValue > oldValue) {
            cc.sys.localStorage.setItem(key, String(nextValue));
            cc.sys.localStorage.setItem('WarriorRunBestDistance', String(nextValue));
            UserDataSyncManager_1.default.requestUpload();
            this._reportBestDistanceToServer(nextValue);
        }
    };
    WarriorRunController.prototype._reportBestDistanceToServer = function (bestDistance) {
        var username = cc.sys.localStorage.getItem('SLS_USERNAME') || '';
        if (!username || bestDistance <= 0) {
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://pay.szvi-bo.com/v1/testapp/PassLevel', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            if (xhr.status < 200 || xhr.status >= 300) {
                cc.warn('[WarriorRun] report best distance failed:', xhr.status, xhr.responseText);
                return;
            }
            try {
                var data = JSON.parse(xhr.responseText);
                if (data && data.code !== 0) {
                    cc.warn('[WarriorRun] report best distance rejected:', data);
                }
            }
            catch (error) {
                cc.warn('[WarriorRun] report best distance parse failed:', error);
            }
        };
        xhr.onerror = function () { return cc.warn('[WarriorRun] report best distance network error'); };
        xhr.ontimeout = function () { return cc.warn('[WarriorRun] report best distance timeout'); };
        xhr.send(JSON.stringify({
            appid: AppConfig_1.APP_ID,
            username: username,
            rank: bestDistance,
            star: 3
        }));
    };
    WarriorRunController.prototype._getBestDistanceKey = function () {
        var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return userId ? 'WarriorRunBestDistance_' + userId : 'WarriorRunBestDistance';
    };
    WarriorRunController.prototype._clearRuntimeNodes = function () {
        var runtimeNames = ['BulletTrail', 'Runtime_Bullet', 'Panel'];
        this._bulletTrailPool = [];
        [this._gameLayer, this._popupLayer].forEach(function (root) {
            if (!root)
                return;
            root.children.slice().forEach(function (child) {
                if (child.name.indexOf('Runtime_') === 0 || runtimeNames.indexOf(child.name) !== -1) {
                    child.removeFromParent(false);
                    child.destroy();
                }
            });
        });
    };
    WarriorRunController.prototype._clearRuntimeChildren = function (root) {
        if (!root)
            return;
        root.children.slice().forEach(function (child) {
            if (child.name.indexOf('Runtime_') === 0) {
                child.removeFromParent(false);
                child.destroy();
            }
        });
    };
    WarriorRunController.prototype._disableWidget = function (node) {
        if (!node)
            return;
        var widget = node.getComponent(cc.Widget);
        if (widget)
            widget.enabled = false;
    };
    WarriorRunController.prototype._getOrAddNode = function (name, parent, x, y, w, h) {
        var node = parent.getChildByName(name);
        if (!node) {
            node = this._addNode(name, parent, x, y, w, h);
        }
        else {
            node.setPosition(x, y);
            node.setContentSize(w, h);
            node.active = true;
        }
        return node;
    };
    WarriorRunController.prototype._getOrAddSprite = function (name, parent, key, x, y, w, h, keepRatio) {
        if (keepRatio === void 0) { keepRatio = true; }
        var node = this._getOrAddNode(name, parent, x, y, w, h);
        var sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        if (this._sprites[key])
            sprite.spriteFrame = this._sprites[key];
        this._applySpriteSize(node, sprite, w, h, keepRatio);
        return node;
    };
    WarriorRunController.prototype._getOrAddSpriteOriginal = function (name, parent, key, x, y) {
        var node = parent.getChildByName(name);
        if (!node) {
            node = this._addSpriteOriginal(name, parent, key, x, y);
        }
        else {
            node.setPosition(x, y);
            node.active = true;
            var sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
            if (this._sprites[key])
                sprite.spriteFrame = this._sprites[key];
            this._applySpriteOriginalSize(node, sprite);
        }
        return node;
    };
    WarriorRunController.prototype._getOrAddLabel = function (name, parent, text, x, y, size, color) {
        var node = this._getOrAddNode(name, parent, x, y, 360, size + 16);
        var label = node.getComponent(cc.Label) || node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = size + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color;
        return label;
    };
    WarriorRunController.prototype._addNode = function (name, parent, x, y, w, h) {
        var node = new cc.Node(name);
        node.setContentSize(w, h);
        node.setPosition(x, y);
        parent.addChild(node);
        return node;
    };
    WarriorRunController.prototype._addSprite = function (name, parent, key, x, y, w, h, keepRatio) {
        if (keepRatio === void 0) { keepRatio = true; }
        var node = this._addNode(name, parent, x, y, w, h);
        var sprite = node.addComponent(cc.Sprite);
        if (this._sprites[key])
            sprite.spriteFrame = this._sprites[key];
        this._applySpriteSize(node, sprite, w, h, keepRatio);
        return node;
    };
    WarriorRunController.prototype._addSpriteOriginal = function (name, parent, key, x, y) {
        var node = this._addNode(name, parent, x, y, 1, 1);
        var sprite = node.addComponent(cc.Sprite);
        if (this._sprites[key])
            sprite.spriteFrame = this._sprites[key];
        this._applySpriteOriginalSize(node, sprite);
        return node;
    };
    WarriorRunController.prototype._applySpriteOriginalSize = function (node, sprite) {
        if (!sprite)
            return;
        sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        var frame = sprite.spriteFrame;
        if (frame && frame.getOriginalSize) {
            var original = frame.getOriginalSize();
            node.setContentSize(original.width || 1, original.height || 1);
        }
        else if (frame && frame.getRect) {
            var rect = frame.getRect();
            node.setContentSize(rect.width || 1, rect.height || 1);
        }
        node.scaleX = 1;
        node.scaleY = 1;
    };
    WarriorRunController.prototype._applySpriteSize = function (node, sprite, targetW, targetH, keepRatio) {
        if (!sprite)
            return;
        if (!keepRatio) {
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            node.scaleX = 1;
            node.scaleY = 1;
            node.setContentSize(targetW, targetH);
            return;
        }
        sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        var frame = sprite.spriteFrame;
        var rawW = targetW;
        var rawH = targetH;
        if (frame && frame.getOriginalSize) {
            var original = frame.getOriginalSize();
            rawW = original.width || rawW;
            rawH = original.height || rawH;
        }
        else if (frame && frame.getRect) {
            var rect = frame.getRect();
            rawW = rect.width || rawW;
            rawH = rect.height || rawH;
        }
        node.setContentSize(rawW, rawH);
        var scale = Math.min(targetW / Math.max(1, rawW), targetH / Math.max(1, rawH));
        node.scaleX = scale;
        node.scaleY = scale;
    };
    WarriorRunController.prototype._setSprite = function (node, key) {
        var sprite = node && node.getComponent(cc.Sprite);
        if (sprite && this._sprites[key])
            sprite.spriteFrame = this._sprites[key];
    };
    WarriorRunController.prototype._addLabel = function (name, parent, text, x, y, size, color) {
        var node = this._addNode(name, parent, x, y, 360, size + 16);
        var label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = size + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color;
        return label;
    };
    WarriorRunController.prototype._drawRect = function (node, color) {
        var graphics = node.getComponent(cc.Graphics);
        if (graphics)
            graphics.destroy();
        var sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        sprite.spriteFrame = this._getSolidFrame();
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.color = new cc.Color(color.r, color.g, color.b);
        node.opacity = color.a;
        node.scaleX = 1;
        node.scaleY = 1;
    };
    WarriorRunController.prototype._getSolidFrame = function () {
        if (this._solidFrame)
            return this._solidFrame;
        var texture = new cc.Texture2D();
        var data = new Uint8Array([255, 255, 255, 255]);
        texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        this._solidFrame = new cc.SpriteFrame(texture);
        return this._solidFrame;
    };
    WarriorRunController = __decorate([
        ccclass
    ], WarriorRunController);
    return WarriorRunController;
}(cc.Component));
exports.default = WarriorRunController;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZVxcV2FycmlvclJ1bkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFDLDZDQUF3QztBQUN6Qyw2Q0FBeUM7QUFDekMsdURBQWtEO0FBQ2xELGlEQUE2QztBQUM3QyxzRUFBaUU7QUFFekQsSUFBQSxPQUFPLEdBQUssRUFBRSxDQUFDLFVBQVUsUUFBbEIsQ0FBbUI7QUFtRmxDLElBQU0sVUFBVSxHQUFHLDBCQUFnQixDQUFDO0FBQ3BDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBSXBDO0lBQWtELHdDQUFZO0lBQTlEO1FBQUEscUVBZ2tEQztRQS9qRFcsYUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixnQkFBVSxHQUFZLElBQUksQ0FBQztRQUMzQixjQUFRLEdBQVksSUFBSSxDQUFDO1FBQ3pCLGlCQUFXLEdBQVksSUFBSSxDQUFDO1FBQzVCLGNBQVEsR0FBbUMsRUFBRSxDQUFDO1FBQzlDLGFBQU8sR0FBYSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxZQUFNLEdBQVcsR0FBRyxDQUFDO1FBQ3JCLFlBQU0sR0FBVyxJQUFJLENBQUM7UUFDdEIsV0FBSyxHQUFXLEdBQUcsQ0FBQztRQUNwQixjQUFRLEdBQVcsQ0FBQyxHQUFHLENBQUM7UUFDeEIsYUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixpQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixvQkFBYyxHQUFnQixNQUFNLENBQUM7UUFDckMsd0JBQWtCLEdBQVcsRUFBRSxDQUFDO1FBQ2hDLGtCQUFZLEdBQVcsRUFBRSxDQUFDO1FBQzFCLHNCQUFnQixHQUFXLEVBQUUsQ0FBQztRQUM5QixvQkFBYyxHQUFXLENBQUMsQ0FBQztRQUMzQixnQkFBVSxHQUFvQixVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELGtCQUFZLEdBQWdCLElBQUks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QUksS0FBSyxLQUFLLENBQUM7Z0JBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RixPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN2RjtRQUNELElBQUksS0FBSyxJQUFJLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksS0FBSyxLQUFLLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFJLEtBQUssS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLEtBQUssS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxD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Q0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUMvQyxRQUFRLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUN4QixRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBRSxLQUFhLENBQUMsQ0FBQyxFQUFHLEtBQWEsQ0FBQyxDQUFDLEVBQUcsS0FBYSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixRQUFRLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUN4QixRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBRSxLQUFhLENBQUMsQ0FBQyxFQUFHLEtBQWEsQ0FBQyxDQUFDLEVBQUcsS0FBYSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNsQixRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUN2QixRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4RCxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUUsS0FBYSxDQUFDLENBQUMsRUFBRyxLQUFhLENBQUMsQ0FBQyxFQUFHLEtBQWEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0YsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RCxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWhCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FDeEIsRUFBRSxDQUFDLEtBQUssQ0FDSixFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFDeEIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEs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QzVCLENBQUM7SUEvakRnQixvQkFBb0I7UUFEeEMsT0FBTztPQUNhLG9CQUFvQixDQWdrRHhDO0lBQUQsMkJBQUM7Q0Foa0RELEFBZ2tEQyxDQWhrRGlELEVBQUUsQ0FBQyxTQUFTLEdBZ2tEN0Q7a0JBaGtEb0Isb0JBQW9CIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsi77u/aW1wb3J0IFN0YXRlQnJpZGdlIGZyb20gJy4vU3RhdGVCcmlkZ2UnO1xuaW1wb3J0IG1HYW1lRGF0YSBmcm9tICcuLi9Mb2FkL0dhbWVEYXRhJztcbmltcG9ydCB3YXJyaW9yUnVuQ29uZmlnIGZyb20gJy4vV2FycmlvclJ1bkNvbmZpZyc7XG5pbXBvcnQgeyBBUFBfSUQgfSBmcm9tICcuLi9Db21tb24vQXBwQ29uZmlnJztcbmltcG9ydCBVc2VyRGF0YVN5bmNNYW5hZ2VyIGZyb20gJy4uL01hbmFnZXIvVXNlckRhdGFTeW5jTWFuYWdlcic7XG5cbmNvbnN0IHsgY2NjbGFzcyB9ID0gY2MuX2RlY29yYXRvcjtcblxudHlwZSBFbGVtZW50VHlwZSA9ICdub25lJyB8ICd3aW5kJyB8ICdmaXJlJyB8ICd0aHVuZGVyJztcbnR5cGUgRW50aXR5S2luZCA9ICd0YXJnZXQnIHwgJ2Jvc3MnIHwgJ2Ryb3AnO1xuXG5pbnRlcmZhY2UgQ2hhcmFjdGVyQ29uZmlnIHtcbiAgICBlbnRpdHlfaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgYmFzZV9hdHRhY2s6IG51bWJlcjtcbiAgICBmaXJlX3JhdGVfcGVyX3NlYzogbnVtYmVyO1xuICAgIHVubG9ja19jb3N0OiBudW1iZXI7XG4gICAgaW5pdGlhbF9lbGVtZW50OiBFbGVtZW50VHlwZTtcbiAgICBpbml0aWFsX2J1bGxldF9ib251czogbnVtYmVyO1xuICAgIGNvbWJvX2RtZ19ib251c19wZXJfaGl0OiBudW1iZXI7XG4gICAgYm9zc19kYW1hZ2VfbXVsdGlwbGllcjogbnVtYmVyO1xuICAgIGVsZW1lbnRfYWR2YW50YWdlX2JvbnVzOiBudW1iZXI7XG4gICAgc3F1YWRfdGhyZXNob2xkX29mZnNldDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgRHJvcFBhY2tDb25maWcge1xuICAgIHBhY2tfaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgcGFja190eXBlOiAnZWxlbWVudCcgfCAnbWF0aF9idWZmJyB8ICdtYXRoX2RlYnVmZic7XG4gICAgZWxlbWVudF92YWx1ZTogRWxlbWVudFR5cGU7XG4gICAgbWF0aF9vcGVyYXRvcjogJ25vbmUnIHwgJ2FkZCcgfCAnc3VidHJhY3QnIHwgJ211bHRpcGx5JyB8ICdkaXZpZGUnO1xuICAgIG1hdGhfdmFsdWU6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRhcmdldENvbmZpZyB7XG4gICAgZW50aXR5X2lkOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHRhcmdldF90eXBlOiAnY2x1c3RlcicgfCAnb2JzdGFjbGUnO1xuICAgIGNsdXN0ZXJfc2hhcGU6ICdzcXVhcmUnIHwgJ2NvbHVtbicgfCAnd2lkZScgfCAnbnVsbCc7XG4gICAgaHBfcGVyX3VuaXQ6IG51bWJlcjtcbiAgICB1bml0X2NvdW50OiBudW1iZXI7XG4gICAgZHJvcF90eXBlczogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBCb3NzQ29uZmlnIHtcbiAgICBlbnRpdHlfaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgYmFzZV9ocDogbnVtYmVyO1xuICAgIGVsZW1lbnRfdHlwZTogRWxlbWVudFR5cGU7XG4gICAgbGFuZV9vY2N1cHk6IG51bWJlcjtcbiAgICBzaGlmdF9pbnRlcnZhbF9zZWM6IG51bWJlcjtcbiAgICBhcHByb2FjaF9zcGVlZF9wZXJfc2VjOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBTcGF3bkNvbmZpZyB7XG4gICAgc3Bhd25fZGlzdGFuY2U6IG51bWJlcjtcbiAgICB0eXBlOiAndGFyZ2V0JyB8ICdib3NzJztcbiAgICBlbnRpdHlfaWQ6IHN0cmluZztcbiAgICBsYW5lOiBudW1iZXI7XG4gICAgZWxlbWVudDogRWxlbWVudFR5cGU7XG4gICAgdW5pdF9jb3VudF9tdWx0aXBsaWVyPzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgTGV2ZWxDb25maWcge1xuICAgIGxldmVsX2lkOiBudW1iZXI7XG4gICAgZGlzdGFuY2VfdGFyZ2V0OiBudW1iZXI7XG4gICAgYmFzZV9ydW5fc3BlZWQ6IG51bWJlcjtcbiAgICBpbml0aWFsX2J1bGxldF9jb3VudDogbnVtYmVyO1xuICAgIGJvc3NfaHBfbXVsdGlwbGllcjogbnVtYmVyO1xuICAgIHNwYXduczogU3Bhd25Db25maWdbXTtcbn1cblxuaW50ZXJmYWNlIFJ1bkVudGl0eSB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBraW5kOiBFbnRpdHlLaW5kO1xuICAgIG5vZGU6IGNjLk5vZGU7XG4gICAgbGFuZTogbnVtYmVyO1xuICAgIGVsZW1lbnQ6IEVsZW1lbnRUeXBlO1xuICAgIGhwOiBudW1iZXI7XG4gICAgbWF4SHA6IG51bWJlcjtcbiAgICB0YXJnZXRDb25maWc/OiBUYXJnZXRDb25maWc7XG4gICAgYm9zc0NvbmZpZz86IEJvc3NDb25maWc7XG4gICAgZHJvcENvbmZpZz86IERyb3BQYWNrQ29uZmlnO1xuICAgIGhwUGVyVW5pdD86IG51bWJlcjtcbiAgICBwYXNzZWQ/OiBib29sZWFuO1xuICAgIHNoaWZ0VGltZXI/OiBudW1iZXI7XG4gICAgc3BlZWRNdWx0aXBsaWVyPzogbnVtYmVyO1xufVxuXG5jb25zdCBSVU5fQ09ORklHID0gd2FycmlvclJ1bkNvbmZpZztcbmNvbnN0IERJU1BMQVlfRElTVEFOQ0VfU0NBTEUgPSAwLjI4O1xuXG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXJyaW9yUnVuQ29udHJvbGxlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSBfY2FudmFzOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9nYW1lTGF5ZXI6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3VpTGF5ZXI6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3BvcHVwTGF5ZXI6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3Nwcml0ZXM6IFJlY29yZDxzdHJpbmcsIGNjLlNwcml0ZUZyYW1lPiA9IHt9O1xuICAgIHByaXZhdGUgX2xhbmVYczogbnVtYmVyW10gPSBbLTE4MCwgMCwgMTgwXTtcbiAgICBwcml2YXRlIF92aWV3VzogbnVtYmVyID0gNzIwO1xuICAgIHByaXZhdGUgX3ZpZXdIOiBudW1iZXIgPSAxMjgwO1xuICAgIHByaXZhdGUgX3RvcFk6IG51bWJlciA9IDY0MDtcbiAgICBwcml2YXRlIF9ib3R0b21ZOiBudW1iZXIgPSAtNjQwO1xuICAgIHByaXZhdGUgX3BsYXllcjogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGxheWVyTGFuZTogbnVtYmVyID0gMTtcbiAgICBwcml2YXRlIF9wbGF5ZXJFbGVtZW50OiBFbGVtZW50VHlwZSA9ICd3aW5kJztcbiAgICBwcml2YXRlIF9wbGF5ZXJSaW5nT2Zmc2V0WTogbnVtYmVyID0gNDQ7XG4gICAgcHJpdmF0ZSBfYnVsbGV0Q291bnQ6IG51bWJlciA9IDEwO1xuICAgIHByaXZhdGUgX2Jhc2VCdWxsZXRDb3VudDogbnVtYmVyID0gMTA7XG4gICAgcHJpdmF0ZSBfZHJvcFBvd2VyR2FpbjogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jaGFyYWN0ZXI6IENoYXJhY3RlckNvbmZpZyA9IFJVTl9DT05GSUcuY2hhcmFjdGVyc1swXTtcbiAgICBwcml2YXRlIF9sZXZlbENvbmZpZzogTGV2ZWxDb25maWcgPSBudWxsO1xuICAgIHByaXZhdGUgX25leHRXYXZlRGlzdGFuY2U6IG51bWJlciA9IDEyMDsgLy8g6L+Q6KGM5pe26K6w5b2V5LiL5LiA5rOi5bCP5oCq55qE6Kem5Y+R6Led56a777yb6LCD5Y+C6K+35pS55LiL5pa5IF9maXJzdFdhdmVEaXN0YW5jZSAvIF93YXZlR2FwKuOAglxuICAgIHByaXZhdGUgX25leHRCb3NzRGlzdGFuY2U6IG51bWJlciA9IDExNTA7IC8vIOi/kOihjOaXtuiusOW9leS4i+S4gOS4qiBCb3NzIOeahOinpuWPkei3neemu++8m+iwg+WPguivt+aUueS4i+aWuSBfZmlyc3RCb3NzRGlzdGFuY2UgLyBfYm9zcyrjgIJcbiAgICBwcml2YXRlIF93YXZlSW5kZXg6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfZW50aXRpZXM6IFJ1bkVudGl0eVtdID0gW107XG4gICAgcHJpdmF0ZSBfZGlzdGFuY2U6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfcnVuU3BlZWQ6IG51bWJlciA9IDk1OyAvLyDop5LoibLot5HliqjpgJ/luqbvvJvmiYDmnInigJzot53nprvlnovliLfmgKrlj4LmlbDigJ3mnIDnu4jpg73kvJrmjInov5nkuKrpgJ/luqbmjaLnrpfmiJDnnJ/lrp7nrYnlvoXml7bpl7TjgIJcbiAgICBwcml2YXRlIF9maXJlVGltZXI6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfZW50aXR5U2VxOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2xvY2tlZElkOiBzdHJpbmcgPSAnJztcbiAgICBwcml2YXRlIF9jb21ibzogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9iZXN0Q29tYm86IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfbW9uc3RlcktpbGxzOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2Jvc3NLaWxsczogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9ib3NzQWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfcmV3YXJkR3JhbnRlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgX3Njb3JlOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX3BhdXNlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2VuZGVkOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfcmV2aXZlVXNlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgX3JldHJ5aW5nOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfdG91Y2hTdGFydDogY2MuVmVjMiA9IG51bGw7XG4gICAgcHJpdmF0ZSBfc2NvcmVMYWJlbDogY2MuTGFiZWwgPSBudWxsO1xuICAgIHByaXZhdGUgX2Rpc3RhbmNlTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBwcml2YXRlIF9jb21ib0xhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfZGFtYWdlQnVmZkxhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfYnVsbGV0TGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBwcml2YXRlIF9lbGVtZW50UmluZzogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcHJvZ3Jlc3NCYXI6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3Njb3JlQmc6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3BhdXNlQnRuOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9wbGF5ZXJVbml0Q291bnQ6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfbGFzdFByb2dyZXNzUmF0aW86IG51bWJlciA9IC0xO1xuICAgIHByaXZhdGUgX3NvbGlkRnJhbWU6IGNjLlNwcml0ZUZyYW1lID0gbnVsbDtcbiAgICBwcml2YXRlIF9idWxsZXRUcmFpbFBvb2w6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgLy8g5Yi35oCq6IqC5aWP6LCD5Y+C77ya5Y2V5L2N6YO95piv4oCc6LeR5Yqo6Led56a74oCd77yM5LiN5piv5bGP5bmV5YOP57Sg77yb5pWw5YC86LaK5bCP77yM5oCq54mp5Ye6546w6LaK5b+r44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmlyc3RXYXZlRGlzdGFuY2U6IG51bWJlciA9IDEyMDsgLy8g56ys5LiA5rOi5bCP5oCq5Ye6546w6Led56a777yM6LCD5bCP5Lya5pu05pep6YGH5Yiw5oCq44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmlyc3RCb3NzRGlzdGFuY2U6IG51bWJlciA9IDExNTA7IC8vIOesrOS4gOS4qiBCb3NzIOWHuueOsOi3neemu++8jOiwg+Wwj+S8muabtOaXqei/m+WFpSBCb3NzIOiKguWlj+OAglxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Jvc3NQcmVwYXJlRGlzdGFuY2U6IG51bWJlciA9IDE1MDsgLy8g6Led56a7IEJvc3Mg5bCP5LqO6K+l5YC85pe25pqC5YGc5Yi35bCP5oCq77yM57uZIEJvc3Mg5Ye65Zy655WZ56m65qGj44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfd2F2ZURlbGF5TmVhckJvc3M6IG51bWJlciA9IDE3MDsgLy8g5o6l6L+RIEJvc3Mg5oiWIEJvc3Mg5a2Y5rS75pe277yM5LiL5LiA5rOi5bCP5oCq6Iez5bCR5o6o6L+f6L+Z5LmI6L+c44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfd2F2ZURlbGF5U3RhY2tOZWFyQm9zczogbnVtYmVyID0gMTkwOyAvLyDmjqXov5EgQm9zcyDml7bmr4/mrKHot7Pov4fliLfmgKrpop3lpJbntK/liqDnmoTot53nprvvvIznlKjkuo7pgb/lhY3lsI/mgKrmjKTliLAgQm9zcyDliY3jgIJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF93YXZlRGVsYXlBZnRlckJvc3NTcGF3bjogbnVtYmVyID0gMjYwOyAvLyBCb3NzIOWImuWIt+WHuuWQju+8jOWwj+aAquiHs+WwkeW7tuWQjui/meS5iOi/nOWGjeWIt+OAglxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3dhdmVEZWxheUFmdGVyQm9zc0tpbGw6IG51bWJlciA9IDQ1OyAvLyBCb3NzIOiiq+WHu+adgOWQju+8jOWwj+aAquacgOW/q+malOi/meS5iOi/nOihpeWHuuadpe+8m+iwg+Wwj+WPr+WHj+WwkeepuuWxj+OAglxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Jvc3NCYXNlR2FwOiBudW1iZXIgPSAxNDUwOyAvLyBCb3NzIOS5i+mXtOeahOWfuuehgOi3neemu+mXtOmalO+8jOiwg+WwjyBCb3NzIOabtOmikee5geOAglxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Jvc3NNaW5HYXA6IG51bWJlciA9IDExMDA7IC8vIEJvc3Mg5LmL6Ze055qE5pyA5bCP6Led56a76Ze06ZqU77yM6Ziy5q2i5ZCO5pyfIEJvc3Mg6L+H5a+G44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfYm9zc0dhcERlY3JlYXNlUGVyS2lsbDogbnVtYmVyID0gMjA7IC8vIOavj+WHu+adgOS4gOS4qiBCb3Nz77yM5LiL5LiA5qyhIEJvc3Mg6Ze06ZqU5YeP5bCR5aSa5bCR44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfd2F2ZUdhcFN0YXJ0OiBudW1iZXIgPSAxOTA7IC8vIOaZrumAmuWwj+aAquazouasoeWIneWni+mXtOmalO+8jOiwg+Wwj+Wwj+aAquabtOWvhuOAglxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3dhdmVHYXBNaW46IG51bWJlciA9IDEzNTsgLy8g5pmu6YCa5bCP5oCq5rOi5qyh5pyA5bCP6Ze06ZqU77yM5ZCO5pyf5LiN5Lya5L2O5LqO6L+Z5Liq5YC844CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfd2F2ZUdhcERlY3JlYXNlUGVyV2F2ZTogbnVtYmVyID0gMjsgLy8g5q+P5Yi35LiA5rOi5bCP5oCq77yM5ZCO57ut5rOi5qyh6Ze06ZqU5YeP5bCR5aSa5bCR44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfd2F2ZUdhcERpZmZpY3VsdHlEZWNyZWFzZTogbnVtYmVyID0gODsgLy8g6Zq+5bqm5q+P5o+Q5Y2HIDEg54K55pe277yM5rOi5qyh6Ze06ZqU6aKd5aSW5YeP5bCR5aSa5bCR44CCXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGlmZmljdWx0eURpc3RhbmNlU3RlcDogbnVtYmVyID0gOTAwOyAvLyDot5HlpJrov5znrpfmj5DljYcgMSDngrnliLfmgKrpmr7luqbvvIzosIPlsI/kvJrmm7Tlv6vlj5jlr4bjgIJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF93YXZlc1BlckV4dHJhR3JvdXA6IG51bWJlciA9IDc7IC8vIOavj+WkmuWwkeazouWwj+aAqu+8jOWNleazouWkmuWIt+S4gOi3r+aAquOAglxuICAgIHByaXZhdGUgcmVhZG9ubHkgX21heEdyb3Vwc1BlcldhdmU6IG51bWJlciA9IDM7IC8vIOWNleazouacgOWkmuWQjOaXtuWIt+WHoOi3r+aAqu+8jOacgOWkpyAzIOWvueW6lOS4ieadoei3kemBk+OAglxuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jRm9yU3RhcnRTY2VuZSgpO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSB0aGlzLm5vZGU7XG4gICAgICAgIHRoaXMuX3NldHVwQ2FudmFzKCk7XG4gICAgICAgIHRoaXMuX3ByZXBhcmVJbml0aWFsUnVudGltZU5vZGVzKCk7XG4gICAgICAgIHRoaXMuX2xvYWRBc3NldHMoKCkgPT4gdGhpcy5fc3RhcnRSdW4oKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0dXBDYW52YXMoKSB7XG4gICAgICAgIGNvbnN0IHZpc2libGUgPSBjYy52aWV3ICYmIGNjLnZpZXcuZ2V0VmlzaWJsZVNpemUgPyBjYy52aWV3LmdldFZpc2libGVTaXplKCkgOiBjYy53aW5TaXplO1xuICAgICAgICB0aGlzLl92aWV3SCA9IE1hdGgubWF4KDEyODAsIE1hdGguZmxvb3IodmlzaWJsZS5oZWlnaHQgfHwgY2Mud2luU2l6ZS5oZWlnaHQgfHwgMTI4MCkpO1xuICAgICAgICBjb25zdCB2aXNpYmxlVyA9IE1hdGguZmxvb3IodmlzaWJsZS53aWR0aCB8fCBjYy53aW5TaXplLndpZHRoIHx8IDcyMCk7XG4gICAgICAgIHRoaXMuX3ZpZXdXID0gTWF0aC5tYXgoNzIwLCBNYXRoLmZsb29yKHZpc2libGVXICogdGhpcy5fdmlld0ggLyBNYXRoLm1heCgxLCB2aXNpYmxlLmhlaWdodCB8fCBjYy53aW5TaXplLmhlaWdodCB8fCAxMjgwKSkpO1xuICAgICAgICBjb25zdCBsYW5lR2FwID0gMTk1O1xuICAgICAgICB0aGlzLl9sYW5lWHMgPSBbLWxhbmVHYXAsIDAsIGxhbmVHYXBdO1xuICAgICAgICB0aGlzLl90b3BZID0gdGhpcy5fdmlld0ggLyAyO1xuICAgICAgICB0aGlzLl9ib3R0b21ZID0gLXRoaXMuX3ZpZXdIIC8gMjtcbiAgICAgICAgdGhpcy5fY2FudmFzLnNldENvbnRlbnRTaXplKHRoaXMuX3ZpZXdXLCB0aGlzLl92aWV3SCk7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgdGhpcy5fb25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5fY2FudmFzLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5fb25Ub3VjaEVuZCwgdGhpcyk7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9DQU5DRUwsIHRoaXMuX29uVG91Y2hFbmQsIHRoaXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3ByZXBhcmVJbml0aWFsUnVudGltZU5vZGVzKCkge1xuICAgICAgICBjb25zdCBnYW1lTGF5ZXIgPSB0aGlzLl9jYW52YXMgJiYgdGhpcy5fY2FudmFzLmdldENoaWxkQnlOYW1lKCdHYW1lTGF5ZXInKTtcbiAgICAgICAgaWYgKCFnYW1lTGF5ZXIpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwbGF5ZXJZID0gdGhpcy5fc2NlbmVZKC01NjEuODkzKTtcbiAgICAgICAgY29uc3QgcmluZ1kgPSB0aGlzLl9zY2VuZVkoLTUxOCk7XG4gICAgICAgIGNvbnN0IGNvdW50WSA9IHRoaXMuX3NjZW5lWSgtMzk1Ljc1KTtcbiAgICAgICAgY29uc3QgcGxheWVyID0gZ2FtZUxheWVyLmdldENoaWxkQnlOYW1lKCdQbGF5ZXInKTtcbiAgICAgICAgY29uc3QgcmluZyA9IGdhbWVMYXllci5nZXRDaGlsZEJ5TmFtZSgnUGxheWVyRWxlbWVudCcpO1xuICAgICAgICBjb25zdCBjb3VudCA9IGdhbWVMYXllci5nZXRDaGlsZEJ5TmFtZSgnQnVsbGV0Q291bnQnKTtcblxuICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNhYmxlV2lkZ2V0KHBsYXllcik7XG4gICAgICAgICAgICBwbGF5ZXIuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgIHBsYXllci5zZXRQb3NpdGlvbih0aGlzLl9sYW5lWHNbdGhpcy5fcGxheWVyTGFuZV0sIHBsYXllclkpO1xuICAgICAgICAgICAgcGxheWVyLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNhYmxlV2lkZ2V0KHJpbmcpO1xuICAgICAgICAgICAgcmluZy5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgcmluZy5zZXRQb3NpdGlvbih0aGlzLl9sYW5lWHNbdGhpcy5fcGxheWVyTGFuZV0sIHJpbmdZKTtcbiAgICAgICAgICAgIHJpbmcuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvdW50KSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNhYmxlV2lkZ2V0KGNvdW50KTtcbiAgICAgICAgICAgIGNvdW50LnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgICAgICBjb3VudC5zZXRQb3NpdGlvbih0aGlzLl9sYW5lWHNbdGhpcy5fcGxheWVyTGFuZV0sIGNvdW50WSk7XG4gICAgICAgICAgICBjb3VudC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2xvYWRBc3NldHMoZG9uZTogKCkgPT4gdm9pZCkge1xuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcignM2dhbWUnLCBjYy5TcHJpdGVGcmFtZSwgKGVycjogRXJyb3IsIGZyYW1lczogY2MuU3ByaXRlRnJhbWVbXSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgY2Mud2FybignW1dhcnJpb3JSdW5dIDNnYW1lIGFzc2V0cyBsb2FkIGZhaWxlZCcsIGVycik7XG4gICAgICAgICAgICAoZnJhbWVzIHx8IFtdKS5mb3JFYWNoKChmcmFtZTogY2MuU3ByaXRlRnJhbWUpID0+IHRoaXMuX3Nwcml0ZXNbZnJhbWUubmFtZV0gPSBmcmFtZSk7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3N0YXJ0UnVuKCkge1xuICAgICAgICBpZiAobUdhbWVEYXRhICYmIG1HYW1lRGF0YS5HZXRDdXJyZW50Um9sZURhdGEpIG1HYW1lRGF0YS5HZXRDdXJyZW50Um9sZURhdGEoKTtcbiAgICAgICAgdGhpcy5fY2hhcmFjdGVyID0gdGhpcy5fZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTtcbiAgICAgICAgdGhpcy5fbGV2ZWxDb25maWcgPSBSVU5fQ09ORklHLmxldmVsc1swXTtcbiAgICAgICAgdGhpcy5fcnVuU3BlZWQgPSB0aGlzLl9sZXZlbENvbmZpZy5iYXNlX3J1bl9zcGVlZDtcbiAgICAgICAgdGhpcy5fYnVsbGV0Q291bnQgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHRoaXMuX2xldmVsQ29uZmlnLmluaXRpYWxfYnVsbGV0X2NvdW50ICsgKHRoaXMuX2NoYXJhY3Rlci5pbml0aWFsX2J1bGxldF9ib251cyB8fCAwKSkpO1xuICAgICAgICB0aGlzLl9iYXNlQnVsbGV0Q291bnQgPSB0aGlzLl9idWxsZXRDb3VudDtcbiAgICAgICAgdGhpcy5fZHJvcFBvd2VyR2FpbiA9IDA7XG4gICAgICAgIHRoaXMuX3BsYXllckVsZW1lbnQgPSB0aGlzLl9jaGFyYWN0ZXIuaW5pdGlhbF9lbGVtZW50IHx8ICd3aW5kJztcbiAgICAgICAgdGhpcy5fbmV4dFdhdmVEaXN0YW5jZSA9IHRoaXMuX2ZpcnN0V2F2ZURpc3RhbmNlO1xuICAgICAgICB0aGlzLl9uZXh0Qm9zc0Rpc3RhbmNlID0gdGhpcy5fZmlyc3RCb3NzRGlzdGFuY2U7XG4gICAgICAgIHRoaXMuX3dhdmVJbmRleCA9IDA7XG4gICAgICAgIHRoaXMuX3BsYXllclVuaXRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuX2J1aWxkU2NlbmUoKTtcbiAgICAgICAgdGhpcy5fcmVmcmVzaEh1ZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFNlbGVjdGVkQ2hhcmFjdGVyKCk6IENoYXJhY3RlckNvbmZpZyB7XG4gICAgICAgIGNvbnN0IG1heEluZGV4ID0gTWF0aC5tYXgoMCwgUlVOX0NPTkZJRy5jaGFyYWN0ZXJzLmxlbmd0aCAtIDEpO1xuICAgICAgICBjb25zdCBpbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG1heEluZGV4LCBNYXRoLmZsb29yKE51bWJlcihtR2FtZURhdGEuY3VycmVudFJvbGUpIHx8IDApKSk7XG4gICAgICAgIHJldHVybiBSVU5fQ09ORklHLmNoYXJhY3RlcnNbaW5kZXhdIHx8IFJVTl9DT05GSUcuY2hhcmFjdGVyc1swXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRCb3NzSHAoYm9zczogQm9zc0NvbmZpZywgZXh0cmFNdWx0aXBsaWVyOiBudW1iZXIgPSAxKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgaXNGaXJzdEJvc3MgPSB0aGlzLl9ib3NzS2lsbHMgPT09IDAgJiYgdGhpcy5fZGlzdGFuY2UgPD0gdGhpcy5fZmlyc3RCb3NzRGlzdGFuY2UgKyB0aGlzLl9ib3NzUHJlcGFyZURpc3RhbmNlO1xuICAgICAgICBjb25zdCBzYWZlRXh0cmFNdWx0aXBsaWVyID0gaXNGaXJzdEJvc3MgPyBNYXRoLm1heCgwLjc1LCBleHRyYU11bHRpcGxpZXIpIDogTWF0aC5tYXgoMSwgZXh0cmFNdWx0aXBsaWVyKTtcbiAgICAgICAgY29uc3QgZmlyc3RCb3NzRWFzZSA9IGlzRmlyc3RCb3NzID8gMC43OCA6IDE7XG4gICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSAodGhpcy5fbGV2ZWxDb25maWcgPyB0aGlzLl9sZXZlbENvbmZpZy5ib3NzX2hwX211bHRpcGxpZXIgOiAxKVxuICAgICAgICAgICAgKiBzYWZlRXh0cmFNdWx0aXBsaWVyXG4gICAgICAgICAgICAqIHRoaXMuX2dldEJvc3NEaWZmaWN1bHR5TXVsdGlwbGllcigpXG4gICAgICAgICAgICAqIGZpcnN0Qm9zc0Vhc2U7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGJvc3MuYmFzZV9ocCAqIG11bHRpcGxpZXIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9idWlsZFNjZW5lKCkge1xuICAgICAgICB0aGlzLl9nYW1lTGF5ZXIgPSB0aGlzLl9nZXRPckFkZE5vZGUoJ0dhbWVMYXllcicsIHRoaXMuX2NhbnZhcywgMCwgMCwgdGhpcy5fdmlld1csIHRoaXMuX3ZpZXdIKTtcbiAgICAgICAgdGhpcy5fdWlMYXllciA9IHRoaXMuX2dldE9yQWRkTm9kZSgnVUlMYXllcicsIHRoaXMuX2NhbnZhcywgMCwgMCwgdGhpcy5fdmlld1csIHRoaXMuX3ZpZXdIKTtcbiAgICAgICAgdGhpcy5fcG9wdXBMYXllciA9IHRoaXMuX2dldE9yQWRkTm9kZSgnUG9wdXBMYXllcicsIHRoaXMuX2NhbnZhcywgMCwgMCwgdGhpcy5fdmlld1csIHRoaXMuX3ZpZXdIKTtcbiAgICAgICAgdGhpcy5fcG9wdXBMYXllci56SW5kZXggPSAxMDAwO1xuICAgICAgICB0aGlzLl9jbGVhclJ1bnRpbWVOb2RlcygpO1xuXG4gICAgICAgIGNvbnN0IGJnID0gdGhpcy5fZ2V0T3JBZGRTcHJpdGUoJ2JnJywgdGhpcy5fZ2FtZUxheWVyLCAnYmVpamluZycsIDAsIDAsIHRoaXMuX3ZpZXdXLCB0aGlzLl92aWV3SCwgZmFsc2UpO1xuICAgICAgICBiZy56SW5kZXggPSAtMTA7XG4gICAgICAgIHRoaXMuX2RyYXdMYW5lR3VpZGVzKCk7XG5cbiAgICAgICAgY29uc3QgcGxheWVyWSA9IHRoaXMuX3NjZW5lWSgtNTYxLjg5Myk7XG4gICAgICAgIHRoaXMuX3BsYXllciA9IHRoaXMuX2dldE9yQWRkTm9kZSgnUGxheWVyJywgdGhpcy5fZ2FtZUxheWVyLCB0aGlzLl9sYW5lWHNbdGhpcy5fcGxheWVyTGFuZV0sIHBsYXllclksIDIyMCwgMTUwKTtcbiAgICAgICAgdGhpcy5fZGlzYWJsZVdpZGdldCh0aGlzLl9wbGF5ZXIpO1xuICAgICAgICB0aGlzLl9jbGVhclJ1bnRpbWVDaGlsZHJlbih0aGlzLl9wbGF5ZXIpO1xuICAgICAgICBjb25zdCBwcmV2aWV3U3ByaXRlID0gdGhpcy5fcGxheWVyLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBpZiAocHJldmlld1Nwcml0ZSkgcHJldmlld1Nwcml0ZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3BsYXllci5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLl9wbGF5ZXIuc2NhbGVZID0gMTtcbiAgICAgICAgdGhpcy5fcGxheWVyLnpJbmRleCA9IDIwO1xuICAgICAgICB0aGlzLl9lbGVtZW50UmluZyA9IHRoaXMuX2dldE9yQWRkU3ByaXRlT3JpZ2luYWwoJ1BsYXllckVsZW1lbnQnLCB0aGlzLl9nYW1lTGF5ZXIsICdmYXpoZW4xJywgdGhpcy5fcGxheWVyLngsIHRoaXMuX3NjZW5lWSgtNTE4KSk7XG4gICAgICAgIHRoaXMuX2Rpc2FibGVXaWRnZXQodGhpcy5fZWxlbWVudFJpbmcpO1xuICAgICAgICB0aGlzLl9wbGF5ZXJSaW5nT2Zmc2V0WSA9IHRoaXMuX2VsZW1lbnRSaW5nLnkgLSB0aGlzLl9wbGF5ZXIueTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFJpbmcuekluZGV4ID0gMTg7XG4gICAgICAgIHRoaXMuX3N5bmNQbGF5ZXJTcXVhZCgpO1xuICAgICAgICB0aGlzLl9idWxsZXRMYWJlbCA9IHRoaXMuX2dldE9yQWRkTGFiZWwoJ0J1bGxldENvdW50JywgdGhpcy5fZ2FtZUxheWVyLCBTdHJpbmcodGhpcy5fYnVsbGV0Q291bnQpLCB0aGlzLl9wbGF5ZXIueCwgdGhpcy5fc2NlbmVZKC0zOTUuNzUpLCAzOCwgY2MuQ29sb3IuV0hJVEUpO1xuICAgICAgICB0aGlzLl9kaXNhYmxlV2lkZ2V0KHRoaXMuX2J1bGxldExhYmVsLm5vZGUpO1xuICAgICAgICB0aGlzLl9zdHlsZVBsYXllckNvdW50TGFiZWwodGhpcy5fYnVsbGV0TGFiZWwpO1xuICAgICAgICB0aGlzLl9idWxsZXRMYWJlbC5ub2RlLnpJbmRleCA9IDMwO1xuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZSgoKSA9PiB0aGlzLl9zeW5jUGxheWVyUHJlc2VudGF0aW9uKCksIDApO1xuXG4gICAgICAgIHRoaXMuX3Njb3JlQmcgPSB0aGlzLl9nZXRPckFkZFNwcml0ZSgnU2NvcmVCZycsIHRoaXMuX3VpTGF5ZXIsICdkaWt1YW5nMScsIDAsIHRoaXMuX3RvcFlGcm9tU2NlbmUoNTgyLjA4NSksIDE3OSwgOTUpO1xuICAgICAgICB0aGlzLl9zY29yZUJnLnpJbmRleCA9IDEwO1xuICAgICAgICB0aGlzLl9zY29yZUxhYmVsID0gdGhpcy5fZ2V0T3JBZGRMYWJlbCgnU2NvcmVMYWJlbCcsIHRoaXMuX3VpTGF5ZXIsICcwJywgMCwgdGhpcy5fdG9wWUZyb21TY2VuZSg1ODMuMzMpLCAzOCwgY2MuQ29sb3IuWUVMTE9XKTtcbiAgICAgICAgdGhpcy5fZGlzdGFuY2VMYWJlbCA9IHRoaXMuX2dldE9yQWRkTGFiZWwoJ0Rpc3RhbmNlTGFiZWwnLCB0aGlzLl91aUxheWVyLCAn6Led56a7IDDnsbMnLCAwLCB0aGlzLl90b3BZRnJvbVNjZW5lKDU4My44OTkpLCAyMiwgY2MuQ29sb3IuV0hJVEUpO1xuICAgICAgICB0aGlzLl9kaXN0YW5jZUxhYmVsLm5vZGUuekluZGV4ID0gMTI7XG4gICAgICAgIHRoaXMuX2NvbWJvTGFiZWwgPSB0aGlzLl9nZXRPckFkZExhYmVsKCdDb21ib0xhYmVsJywgdGhpcy5fdWlMYXllciwgJ0NPTUJPIDAhJywgdGhpcy5fc2NlbmVYKC0yMzgpLCB0aGlzLl90b3BZRnJvbVNjZW5lKDQ0MCksIDM0LCBjYy5Db2xvci5ZRUxMT1cpO1xuICAgICAgICB0aGlzLl9kYW1hZ2VCdWZmTGFiZWwgPSB0aGlzLl9nZXRPckFkZExhYmVsKCdCdWZmTGFiZWwnLCB0aGlzLl91aUxheWVyLCAnKzAlIERNRycsIHRoaXMuX3NjZW5lWCgtMjQyKSwgdGhpcy5fdG9wWUZyb21TY2VuZSg0MDIpLCAyMiwgY2MuQ29sb3IuV0hJVEUpO1xuICAgICAgICB0aGlzLl9jb21ib0xhYmVsLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2RhbWFnZUJ1ZmZMYWJlbC5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9wcm9ncmVzc0JhciA9IHRoaXMuX2dldE9yQWRkTm9kZSgnUHJvZ3Jlc3NCYXInLCB0aGlzLl91aUxheWVyLCAwLCB0aGlzLl90b3BZRnJvbVNjZW5lKDUxMCksIDQyMCwgMTYpO1xuICAgICAgICB0aGlzLl9wcm9ncmVzc0Jhci5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9wYXVzZUJ0biA9IHRoaXMuX2dldE9yQWRkU3ByaXRlKCdQYXVzZUJ0bicsIHRoaXMuX3VpTGF5ZXIsICd6YW50aW5nMScsIHRoaXMuX3NjZW5lWCgyOTUpLCB0aGlzLl90b3BZRnJvbVNjZW5lKDU4MSksIDg5LCA4OCk7XG4gICAgICAgIHRoaXMuX3BhdXNlQnRuLm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHRoaXMuX3Nob3dQYXVzZVBvcHVwLCB0aGlzKTtcbiAgICAgICAgdGhpcy5fcGF1c2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLl9zaG93UGF1c2VQb3B1cCwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2NlbmVYKGJhc2VYOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAoYmFzZVggPiAwKSByZXR1cm4gdGhpcy5fdmlld1cgLyAyIC0gKDM2MCAtIGJhc2VYKTtcbiAgICAgICAgaWYgKGJhc2VYIDwgMCkgcmV0dXJuIC10aGlzLl92aWV3VyAvIDIgKyAoYmFzZVggKyAzNjApO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zY2VuZVkoYmFzZVk6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ib3R0b21ZICsgKGJhc2VZICsgNjQwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF90b3BZRnJvbVNjZW5lKGJhc2VZOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fdG9wWSAtICg2NDAgLSBiYXNlWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZHJhd0xhbmVHdWlkZXMoKSB7XG4gICAgICAgIGNvbnN0IGdOb2RlID0gdGhpcy5fZ2V0T3JBZGROb2RlKCdMYW5lR3VpZGVzJywgdGhpcy5fZ2FtZUxheWVyLCAwLCAwLCB0aGlzLl92aWV3VywgdGhpcy5fdmlld0gpO1xuICAgICAgICBjb25zdCBvbGRHcmFwaGljcyA9IGdOb2RlLmdldENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGlmIChvbGRHcmFwaGljcykgb2xkR3JhcGhpY3MuZGVzdHJveSgpO1xuICAgICAgICBjb25zdCBoYWxmR2FwID0gTWF0aC5hYnModGhpcy5fbGFuZVhzWzFdIC0gdGhpcy5fbGFuZVhzWzBdKSAqIDAuNTtcbiAgICAgICAgWy1oYWxmR2FwLCBoYWxmR2FwXS5mb3JFYWNoKCh4LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3VpZGUgPSB0aGlzLl9nZXRPckFkZE5vZGUoJ0d1aWRlXycgKyBpbmRleCwgZ05vZGUsIHgsIDAsIDQsIHRoaXMuX3ZpZXdIIC0gNjApO1xuICAgICAgICAgICAgdGhpcy5fZHJhd1JlY3QoZ3VpZGUsIG5ldyBjYy5Db2xvcigxMzAsIDIyMCwgMjU1LCAxMDApKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZHJhd1Byb2dyZXNzKHJhdGlvOiBudW1iZXIpIHtcbiAgICAgICAgcmF0aW8gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCByYXRpbykpO1xuICAgICAgICBpZiAoTWF0aC5hYnMocmF0aW8gLSB0aGlzLl9sYXN0UHJvZ3Jlc3NSYXRpbykgPCAwLjAwNSkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sYXN0UHJvZ3Jlc3NSYXRpbyA9IHJhdGlvO1xuICAgICAgICBjb25zdCBiZyA9IHRoaXMuX2dldE9yQWRkTm9kZSgnUHJvZ3Jlc3NCZycsIHRoaXMuX3Byb2dyZXNzQmFyLCAwLCAwLCA0MjAsIDE2KTtcbiAgICAgICAgdGhpcy5fZHJhd1JlY3QoYmcsIG5ldyBjYy5Db2xvcigyMCwgMzUsIDU1LCAxOTApKTtcbiAgICAgICAgY29uc3QgZmlsbCA9IHRoaXMuX2dldE9yQWRkTm9kZSgnUHJvZ3Jlc3NGaWxsJywgdGhpcy5fcHJvZ3Jlc3NCYXIsIC0yMTAgKyAyMTAgKiByYXRpbywgMCwgNDIwICogcmF0aW8sIDE2KTtcbiAgICAgICAgdGhpcy5fZHJhd1JlY3QoZmlsbCwgbmV3IGNjLkNvbG9yKDkwLCAyMzAsIDE2MCwgMjMwKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGR0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BhdXNlZCB8fCB0aGlzLl9lbmRlZCB8fCAhdGhpcy5fcGxheWVyKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2Rpc3RhbmNlICs9IHRoaXMuX3J1blNwZWVkICogZHQ7XG4gICAgICAgIHRoaXMuX3NwYXduRW5kbGVzc0J5RGlzdGFuY2UoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRW50aXRpZXMoZHQpO1xuICAgICAgICB0aGlzLl9hdXRvRmlyZShkdCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNjb3JlKCk7XG4gICAgICAgIHRoaXMuX3JlZnJlc2hIdWQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zcGF3bkVuZGxlc3NCeURpc3RhbmNlKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5fZGlzdGFuY2UgPj0gdGhpcy5fbmV4dFdhdmVEaXN0YW5jZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX25leHRCb3NzRGlzdGFuY2UgLSB0aGlzLl9kaXN0YW5jZSA8IHRoaXMuX2Jvc3NQcmVwYXJlRGlzdGFuY2UgfHwgdGhpcy5fYm9zc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX25leHRXYXZlRGlzdGFuY2UgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbmV4dFdhdmVEaXN0YW5jZSArIHRoaXMuX3dhdmVEZWxheVN0YWNrTmVhckJvc3MsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3RhbmNlICsgdGhpcy5fd2F2ZURlbGF5TmVhckJvc3NcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc3Bhd25FbmRsZXNzV2F2ZSgpO1xuICAgICAgICAgICAgdGhpcy5fbmV4dFdhdmVEaXN0YW5jZSArPSB0aGlzLl9nZXROZXh0V2F2ZUdhcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHRoaXMuX2Rpc3RhbmNlID49IHRoaXMuX25leHRCb3NzRGlzdGFuY2UpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fYm9zc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NwYXduRW5kbGVzc0Jvc3MoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXh0V2F2ZURpc3RhbmNlID0gTWF0aC5tYXgodGhpcy5fbmV4dFdhdmVEaXN0YW5jZSwgdGhpcy5fZGlzdGFuY2UgKyB0aGlzLl93YXZlRGVsYXlBZnRlckJvc3NTcGF3bik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9uZXh0Qm9zc0Rpc3RhbmNlICs9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgIHRoaXMuX2Jvc3NNaW5HYXAsXG4gICAgICAgICAgICAgICAgdGhpcy5fYm9zc0Jhc2VHYXAgLSB0aGlzLl9ib3NzS2lsbHMgKiB0aGlzLl9ib3NzR2FwRGVjcmVhc2VQZXJLaWxsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3Bhd25FbmRsZXNzV2F2ZSgpIHtcbiAgICAgICAgdGhpcy5fd2F2ZUluZGV4Kys7XG4gICAgICAgIGNvbnN0IGdyb3VwQ291bnQgPSBNYXRoLm1pbih0aGlzLl9tYXhHcm91cHNQZXJXYXZlLCAxICsgTWF0aC5mbG9vcih0aGlzLl93YXZlSW5kZXggLyB0aGlzLl93YXZlc1BlckV4dHJhR3JvdXApKTtcbiAgICAgICAgY29uc3QgbGFuZXMgPSB0aGlzLl9zaHVmZmxlTGFuZXMoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cENvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuX3BpY2tFbmRsZXNzVGFyZ2V0KCk7XG4gICAgICAgICAgICBpZiAoIXRhcmdldCkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBzcGF3bjogU3Bhd25Db25maWcgPSB7XG4gICAgICAgICAgICAgICAgc3Bhd25fZGlzdGFuY2U6IHRoaXMuX2Rpc3RhbmNlLFxuICAgICAgICAgICAgICAgIHR5cGU6ICd0YXJnZXQnLFxuICAgICAgICAgICAgICAgIGVudGl0eV9pZDogdGFyZ2V0LmVudGl0eV9pZCxcbiAgICAgICAgICAgICAgICBsYW5lOiBsYW5lc1tpICUgbGFuZXMubGVuZ3RoXSxcbiAgICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLl9waWNrRW5kbGVzc0VsZW1lbnQoKSxcbiAgICAgICAgICAgICAgICB1bml0X2NvdW50X211bHRpcGxpZXI6IHRoaXMuX2dldEVuZGxlc3NUYXJnZXRNdWx0aXBsaWVyKGkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX3NwYXduRW50aXR5KHNwYXduKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3NwYXduRW5kbGVzc0Jvc3MoKSB7XG4gICAgICAgIGNvbnN0IGJvc3MgPSBSVU5fQ09ORklHLmJvc3Nlc1swXTtcbiAgICAgICAgaWYgKCFib3NzKSByZXR1cm47XG4gICAgICAgIHRoaXMuX3NwYXduRW50aXR5KHtcbiAgICAgICAgICAgIHNwYXduX2Rpc3RhbmNlOiB0aGlzLl9kaXN0YW5jZSxcbiAgICAgICAgICAgIHR5cGU6ICdib3NzJyxcbiAgICAgICAgICAgIGVudGl0eV9pZDogYm9zcy5lbnRpdHlfaWQsXG4gICAgICAgICAgICBsYW5lOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSxcbiAgICAgICAgICAgIGVsZW1lbnQ6IGJvc3MuZWxlbWVudF90eXBlLFxuICAgICAgICAgICAgdW5pdF9jb3VudF9tdWx0aXBsaWVyOiB0aGlzLl9nZXRFbmRsZXNzQm9zc011bHRpcGxpZXIoKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3Bhd25FbnRpdHkoc3Bhd246IFNwYXduQ29uZmlnKSB7XG4gICAgICAgIGlmIChzcGF3bi50eXBlID09PSAnYm9zcycpIHtcbiAgICAgICAgICAgIGNvbnN0IGJvc3MgPSB0aGlzLl9maW5kQm9zcyhzcGF3bi5lbnRpdHlfaWQpO1xuICAgICAgICAgICAgaWYgKCFib3NzKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl9ib3NzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGJvc3NIcCA9IHRoaXMuX2dldEJvc3NIcChib3NzLCBzcGF3bi51bml0X2NvdW50X211bHRpcGxpZXIgfHwgMSk7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fY3JlYXRlQm9zc05vZGUoYm9zcywgc3Bhd24ubGFuZSwgYm9zc0hwKTtcbiAgICAgICAgICAgIHRoaXMuX2VudGl0aWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiB0aGlzLl9uZXh0RW50aXR5SWQoc3Bhd24uZW50aXR5X2lkKSxcbiAgICAgICAgICAgICAgICBraW5kOiAnYm9zcycsXG4gICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICBsYW5lOiBzcGF3bi5sYW5lLFxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGJvc3MuZWxlbWVudF90eXBlLFxuICAgICAgICAgICAgICAgIGhwOiBib3NzSHAsXG4gICAgICAgICAgICAgICAgbWF4SHA6IGJvc3NIcCxcbiAgICAgICAgICAgICAgICBib3NzQ29uZmlnOiBib3NzLFxuICAgICAgICAgICAgICAgIHNoaWZ0VGltZXI6IGJvc3Muc2hpZnRfaW50ZXJ2YWxfc2VjLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLl9maW5kVGFyZ2V0KHNwYXduLmVudGl0eV9pZCk7XG4gICAgICAgIGlmICghdGFyZ2V0KSByZXR1cm47XG4gICAgICAgIGNvbnN0IHVuaXRzID0gdGhpcy5fZ2V0Q2x1c3RlclVuaXRzKHRhcmdldCwgc3Bhd24pO1xuICAgICAgICBjb25zdCBocCA9IE1hdGgubWF4KDEsIHVuaXRzICogdGFyZ2V0LmhwX3Blcl91bml0KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX2NyZWF0ZVRhcmdldE5vZGUodGFyZ2V0LCBzcGF3bi5sYW5lLCBzcGF3bi5lbGVtZW50LCB1bml0cyk7XG4gICAgICAgIHRoaXMuX2VudGl0aWVzLnB1c2goe1xuICAgICAgICAgICAgaWQ6IHRoaXMuX25leHRFbnRpdHlJZChzcGF3bi5lbnRpdHlfaWQpLFxuICAgICAgICAgICAga2luZDogJ3RhcmdldCcsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgbGFuZTogc3Bhd24ubGFuZSxcbiAgICAgICAgICAgIGVsZW1lbnQ6IHNwYXduLmVsZW1lbnQsXG4gICAgICAgICAgICBocCxcbiAgICAgICAgICAgIG1heEhwOiBocCxcbiAgICAgICAgICAgIHRhcmdldENvbmZpZzogdGFyZ2V0LFxuICAgICAgICAgICAgaHBQZXJVbml0OiB0YXJnZXQuaHBfcGVyX3VuaXQsXG4gICAgICAgICAgICBzcGVlZE11bHRpcGxpZXI6IHRoaXMuX2dldFRhcmdldFNwZWVkTXVsdGlwbGllcih0YXJnZXQsIHNwYXduKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXRlVGFyZ2V0Tm9kZSh0YXJnZXQ6IFRhcmdldENvbmZpZywgbGFuZTogbnVtYmVyLCBlbGVtZW50OiBFbGVtZW50VHlwZSwgdW5pdHM6IG51bWJlcik6IGNjLk5vZGUge1xuICAgICAgICBjb25zdCByb290ID0gdGhpcy5fYWRkTm9kZSh0YXJnZXQubmFtZSwgdGhpcy5fZ2FtZUxheWVyLCB0aGlzLl9sYW5lWHNbbGFuZV0sIHRoaXMuX3RvcFkgLSAxMjAsIDE5MCwgMTUwKTtcbiAgICAgICAgcm9vdC56SW5kZXggPSAxNTtcbiAgICAgICAgdGhpcy5fYWRkU3ByaXRlT3JpZ2luYWwoJ0VsZW1lbnRSaW5nJywgcm9vdCwgdGhpcy5fcmluZ1Nwcml0ZShlbGVtZW50KSwgMCwgLTI4KTtcbiAgICAgICAgdGhpcy5fYWRkQ2x1c3RlclNwcml0ZXMocm9vdCwgdGFyZ2V0LCB1bml0cyk7XG4gICAgICAgIGNvbnN0IGhwTGFiZWwgPSB0aGlzLl9hZGRMYWJlbCgnSHBMYWJlbCcsIHJvb3QsIFN0cmluZyh1bml0cyksIDAsIDU2LCAzMCwgY2MuQ29sb3IuV0hJVEUpO1xuICAgICAgICB0aGlzLl9zdHlsZU1vbnN0ZXJDb3VudExhYmVsKGhwTGFiZWwpO1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVCb3NzTm9kZShib3NzOiBCb3NzQ29uZmlnLCBsYW5lOiBudW1iZXIsIGhwOiBudW1iZXIpOiBjYy5Ob2RlIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuX2FkZE5vZGUoYm9zcy5uYW1lLCB0aGlzLl9nYW1lTGF5ZXIsIHRoaXMuX2xhbmVYc1tsYW5lXSwgdGhpcy5fdG9wWSAtIDE2MCwgMjIwLCAyMTApO1xuICAgICAgICByb290LnpJbmRleCA9IDE2O1xuICAgICAgICB0aGlzLl9hZGRTcHJpdGVPcmlnaW5hbCgnRWxlbWVudFJpbmcnLCByb290LCB0aGlzLl9yaW5nU3ByaXRlKGJvc3MuZWxlbWVudF90eXBlKSwgMCwgLTM0KTtcbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMuX2FkZFNwcml0ZU9yaWdpbmFsKCdCb3NzQm9keScsIHJvb3QsICdib3NzJywgMCwgLTM0KTtcbiAgICAgICAgYm9keS56SW5kZXggPSAyO1xuICAgICAgICBjb25zdCBib3NzTGFiZWwgPSB0aGlzLl9hZGRMYWJlbCgnQm9zc0xhYmVsJywgcm9vdCwgU3RyaW5nKGhwKSwgMCwgODIsIDI2LCBjYy5Db2xvci5XSElURSk7XG4gICAgICAgIHRoaXMuX3N0eWxlTW9uc3RlckNvdW50TGFiZWwoYm9zc0xhYmVsKTtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkQ2x1c3RlclNwcml0ZXMocm9vdDogY2MuTm9kZSwgdGFyZ2V0OiBUYXJnZXRDb25maWcsIHVuaXRzOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLl9nZXRNb25zdGVyVmlzdWFsQ291bnQodGFyZ2V0LCB1bml0cyk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IHRoaXMuX2dldFNxdWFkTGF5b3V0KCdtb25zdGVyJywgY291bnQpO1xuICAgICAgICBjb25zdCBzcHJpdGVLZXkgPSB0aGlzLl9yYW5kb21TbWFsbE1vbnN0ZXJTcHJpdGUoKTtcbiAgICAgICAgcG9zaXRpb25zLmZvckVhY2goKHAsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1bml0ID0gdGhpcy5fYWRkU3ByaXRlKCdNb25zdGVyXycgKyBpbmRleCwgcm9vdCwgc3ByaXRlS2V5LCBwWzBdLCBwWzFdLCA2MiwgNzYpO1xuICAgICAgICAgICAgdW5pdC56SW5kZXggPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TW9uc3RlclZpc3VhbENvdW50KHRhcmdldDogVGFyZ2V0Q29uZmlnLCB1bml0czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKCF0YXJnZXQgfHwgdGFyZ2V0LnRhcmdldF90eXBlID09PSAnb2JzdGFjbGUnKSByZXR1cm4gMTtcbiAgICAgICAgY29uc3Qgc2FmZVVuaXRzID0gTWF0aC5tYXgoMSwgdW5pdHMpO1xuICAgICAgICBpZiAoc2FmZVVuaXRzIDw9IDE1KSByZXR1cm4gMTtcbiAgICAgICAgaWYgKHNhZmVVbml0cyA8PSAzMCkgcmV0dXJuIDI7XG4gICAgICAgIGlmIChzYWZlVW5pdHMgPD0gNTApIHJldHVybiAzO1xuICAgICAgICBpZiAoc2FmZVVuaXRzIDw9IDc1KSByZXR1cm4gNDtcbiAgICAgICAgcmV0dXJuIDU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmFuZG9tU21hbGxNb25zdGVyU3ByaXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAneGlhb2d1YWknICsgKDEgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGlja0VuZGxlc3NUYXJnZXQoKTogVGFyZ2V0Q29uZmlnIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJzID0gUlVOX0NPTkZJRy50YXJnZXRzLmZpbHRlcigodGFyZ2V0OiBUYXJnZXRDb25maWcpID0+IHRhcmdldC50YXJnZXRfdHlwZSA9PT0gJ2NsdXN0ZXInKTtcbiAgICAgICAgaWYgKCFjbHVzdGVycy5sZW5ndGgpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gY2x1c3RlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2x1c3RlcnMubGVuZ3RoKV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGlja0VuZGxlc3NFbGVtZW50KCk6IEVsZW1lbnRUeXBlIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHM6IEVsZW1lbnRUeXBlW10gPSBbJ3dpbmQnLCAnZmlyZScsICd0aHVuZGVyJ107XG4gICAgICAgIHJldHVybiBlbGVtZW50c1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBlbGVtZW50cy5sZW5ndGgpXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zaHVmZmxlTGFuZXMoKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCBsYW5lcyA9IFswLCAxLCAyXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IGxhbmVzLmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IHRtcCA9IGxhbmVzW2ldO1xuICAgICAgICAgICAgbGFuZXNbaV0gPSBsYW5lc1tqXTtcbiAgICAgICAgICAgIGxhbmVzW2pdID0gdG1wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYW5lcztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRFbmRsZXNzVGFyZ2V0TXVsdGlwbGllcihvZmZzZXQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlVGllciA9IE1hdGguZmxvb3IodGhpcy5fZGlzdGFuY2UgLyA2NTApO1xuICAgICAgICBjb25zdCB3YXZlVGllciA9IE1hdGguZmxvb3IodGhpcy5fd2F2ZUluZGV4IC8gNCk7XG4gICAgICAgIGNvbnN0IGJhc2VNdWx0aXBsaWVyID0gMC41NSArIGRpc3RhbmNlVGllciAqIDAuMDUgKyB3YXZlVGllciAqIDAuMDM1ICsgb2Zmc2V0ICogMC4wNjtcbiAgICAgICAgcmV0dXJuIGJhc2VNdWx0aXBsaWVyICogdGhpcy5fZ2V0VGFyZ2V0RGlmZmljdWx0eU11bHRpcGxpZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRFbmRsZXNzQm9zc011bHRpcGxpZXIoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsYW1wKDAuNzUgKyBNYXRoLmZsb29yKHRoaXMuX2Rpc3RhbmNlIC8gMTEwMCkgKiAwLjA4ICsgdGhpcy5fYm9zc0tpbGxzICogMC4xMiwgMC43NSwgMi4yKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXROZXh0V2F2ZUdhcCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fd2F2ZUluZGV4IDw9IDIpIHJldHVybiAxMjA7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGFtcChcbiAgICAgICAgICAgIHRoaXMuX3dhdmVHYXBTdGFydCAtIHRoaXMuX3dhdmVJbmRleCAqIHRoaXMuX3dhdmVHYXBEZWNyZWFzZVBlcldhdmUgLSB0aGlzLl9nZXREaWZmaWN1bHR5TGV2ZWwoKSAqIHRoaXMuX3dhdmVHYXBEaWZmaWN1bHR5RGVjcmVhc2UsXG4gICAgICAgICAgICB0aGlzLl93YXZlR2FwTWluLFxuICAgICAgICAgICAgdGhpcy5fd2F2ZUdhcFN0YXJ0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0RW5lbXlNb3ZlU3BlZWQoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgc3BlZWRNdWx0aXBsaWVyID0gTWF0aC5taW4oMi4wNSwgMSArIHRoaXMuX2Rpc3RhbmNlIC8gODUwMCArICh0aGlzLl9nZXRQb3dlclByZXNzdXJlTXVsdGlwbGllcigpIC0gMSkgKiAwLjE4KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1blNwZWVkICogc3BlZWRNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEJvc3NNb3ZlU3BlZWQoYm9zczogQm9zc0NvbmZpZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHNwZWVkTXVsdGlwbGllciA9IE1hdGgubWluKDEuOCwgMSArIHRoaXMuX2Rpc3RhbmNlIC8gMTEwMDAgKyB0aGlzLl9ib3NzS2lsbHMgKiAwLjAyNSk7XG4gICAgICAgIHJldHVybiAoYm9zcy5hcHByb2FjaF9zcGVlZF9wZXJfc2VjICogMTYpICogc3BlZWRNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldERpZmZpY3VsdHlMZXZlbCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgdGhpcy5fZGlzdGFuY2UgLyB0aGlzLl9kaWZmaWN1bHR5RGlzdGFuY2VTdGVwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRQb3dlclByZXNzdXJlTXVsdGlwbGllcigpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBiYXNlQnVsbGV0Q291bnQgPSBNYXRoLm1heCgxMCwgdGhpcy5fYmFzZUJ1bGxldENvdW50IHx8IDEwKTtcbiAgICAgICAgY29uc3QgYnVsbGV0UmF0aW8gPSBNYXRoLm1heCgxLCB0aGlzLl9idWxsZXRDb3VudCAvIGJhc2VCdWxsZXRDb3VudCk7XG4gICAgICAgIGNvbnN0IGdhaW5SYXRpbyA9IE1hdGgubWF4KDAsIHRoaXMuX2Ryb3BQb3dlckdhaW4gLyBiYXNlQnVsbGV0Q291bnQpO1xuICAgICAgICBjb25zdCBwcmVzc3VyZVNlZWQgPSBNYXRoLm1heCgwLCBidWxsZXRSYXRpbyAtIDEsIGdhaW5SYXRpbyAqIDAuMzUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fY2xhbXAoMSArIE1hdGgucG93KHByZXNzdXJlU2VlZCwgMC44MikgKiAwLjM2LCAxLCA2LjUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFRhcmdldERpZmZpY3VsdHlNdWx0aXBsaWVyKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5tYXgoMCwgdGhpcy5fZGlzdGFuY2UpO1xuICAgICAgICBjb25zdCBkaXN0YW5jZVByZXNzdXJlID0gMSArIGRpc3RhbmNlIC8gNDIwMCArIE1hdGgucG93KGRpc3RhbmNlIC8gOTAwMCwgMS4yKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsYW1wKGRpc3RhbmNlUHJlc3N1cmUgKiB0aGlzLl9nZXRQb3dlclByZXNzdXJlTXVsdGlwbGllcigpLCAxLCAxOCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0Qm9zc0RpZmZpY3VsdHlNdWx0aXBsaWVyKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5tYXgoMCwgdGhpcy5fZGlzdGFuY2UpO1xuICAgICAgICBjb25zdCBkaXN0YW5jZVByZXNzdXJlID0gMSArIGRpc3RhbmNlIC8gMzYwMCArIE1hdGgucG93KGRpc3RhbmNlIC8gODAwMCwgMS4yNSk7XG4gICAgICAgIGNvbnN0IHBvd2VyUHJlc3N1cmUgPSAxICsgKHRoaXMuX2dldFBvd2VyUHJlc3N1cmVNdWx0aXBsaWVyKCkgLSAxKSAqIDAuOTU7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGFtcChkaXN0YW5jZVByZXNzdXJlICogcG93ZXJQcmVzc3VyZSwgMSwgMjYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUVudGl0aWVzKGR0OiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2VudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLl9lbnRpdGllc1tpXTtcbiAgICAgICAgICAgIGlmICghZW50aXR5Lm5vZGUgfHwgIWVudGl0eS5ub2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbnRpdHkua2luZCA9PT0gJ2Jvc3MnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlQm9zcyhlbnRpdHksIGR0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW50aXR5Lm5vZGUueSAtPSB0aGlzLl9nZXRFbmVteU1vdmVTcGVlZCgpICogKGVudGl0eS5zcGVlZE11bHRpcGxpZXIgfHwgMSkgKiBkdDtcbiAgICAgICAgICAgICAgICBpZiAoZW50aXR5Lm5vZGUueSA8IHRoaXMuX2JvdHRvbVkgLSA5MCAmJiAhZW50aXR5LnBhc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBlbnRpdHkucGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW50aXRpZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBlbnRpdHkubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlQm9zcyhlbnRpdHk6IFJ1bkVudGl0eSwgZHQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBib3NzID0gZW50aXR5LmJvc3NDb25maWc7XG4gICAgICAgIGVudGl0eS5ub2RlLnkgLT0gdGhpcy5fZ2V0Qm9zc01vdmVTcGVlZChib3NzKSAqIGR0O1xuICAgICAgICBlbnRpdHkuc2hpZnRUaW1lciAtPSBkdDtcbiAgICAgICAgaWYgKGVudGl0eS5zaGlmdFRpbWVyIDw9IDApIHtcbiAgICAgICAgICAgIGVudGl0eS5zaGlmdFRpbWVyID0gYm9zcy5zaGlmdF9pbnRlcnZhbF9zZWM7XG4gICAgICAgICAgICBjb25zdCBuZXh0TGFuZSA9IHRoaXMuX3BpY2tCb3NzTGFuZShlbnRpdHkubGFuZSk7XG4gICAgICAgICAgICBlbnRpdHkubGFuZSA9IG5leHRMYW5lO1xuICAgICAgICAgICAgZW50aXR5Lm5vZGUucnVuQWN0aW9uKGNjLm1vdmVUbygwLjE4LCBjYy52Mih0aGlzLl9sYW5lWHNbbmV4dExhbmVdLCBlbnRpdHkubm9kZS55KSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRpdHkubm9kZS55IDw9IHRoaXMuX3BsYXllci55ICsgNDApIHtcbiAgICAgICAgICAgIHRoaXMuX2dhbWVPdmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9hdXRvRmlyZShkdDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX2ZpcmVUaW1lciArPSBkdDtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSAxIC8gTWF0aC5tYXgoMSwgdGhpcy5fY2hhcmFjdGVyLmZpcmVfcmF0ZV9wZXJfc2VjKTtcbiAgICAgICAgd2hpbGUgKHRoaXMuX2ZpcmVUaW1lciA+PSBpbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZVRpbWVyIC09IGludGVydmFsO1xuICAgICAgICAgICAgdGhpcy5fc2hvb3RPbmNlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zaG9vdE9uY2UoKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuX2ZpbmRGaXJzdFRhcmdldEluTGFuZSh0aGlzLl9wbGF5ZXJMYW5lKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0Q29tYm8oKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdCdWxsZXRUcmFpbChudWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9sb2NrZWRJZCA9PT0gdGFyZ2V0LmlkKSB7XG4gICAgICAgICAgICB0aGlzLl9jb21ibyA9IE1hdGgubWluKFJVTl9DT05GSUcuZ2xvYmFsX2NvbmZpZ3MuY29tYm9fbWF4X2xpbWl0LCB0aGlzLl9jb21ibyArIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9ja2VkSWQgPSB0YXJnZXQuaWQ7XG4gICAgICAgICAgICB0aGlzLl9jb21ibyA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYmVzdENvbWJvID0gTWF0aC5tYXgodGhpcy5fYmVzdENvbWJvLCB0aGlzLl9jb21ibyk7XG5cbiAgICAgICAgY29uc3QgY29tYm9CdWZmID0gMSArIHRoaXMuX2NvbWJvICogKFJVTl9DT05GSUcuZ2xvYmFsX2NvbmZpZ3MuY29tYm9fZG1nX2J1ZmZfcGVyX2hpdCArICh0aGlzLl9jaGFyYWN0ZXIuY29tYm9fZG1nX2JvbnVzX3Blcl9oaXQgfHwgMCkpO1xuICAgICAgICBjb25zdCBlbGVtZW50TXVsdCA9IHRoaXMuX2dldEVsZW1lbnRNdWx0aXBsaWVyKHRoaXMuX3BsYXllckVsZW1lbnQsIHRhcmdldC5lbGVtZW50KTtcbiAgICAgICAgbGV0IGRhbWFnZSA9IHRoaXMuX2NoYXJhY3Rlci5iYXNlX2F0dGFjayAqIHRoaXMuX2J1bGxldENvdW50ICogY29tYm9CdWZmICogZWxlbWVudE11bHQ7XG4gICAgICAgIGlmICh0YXJnZXQua2luZCA9PT0gJ2Jvc3MnKSBkYW1hZ2UgKj0gKHRoaXMuX2NoYXJhY3Rlci5ib3NzX2RhbWFnZV9tdWx0aXBsaWVyIHx8IDEpO1xuICAgICAgICB0aGlzLl9zaG93RWxlbWVudERhbWFnZVRleHQodGFyZ2V0LCBkYW1hZ2UsIGVsZW1lbnRNdWx0KTtcbiAgICAgICAgdGFyZ2V0LmhwIC09IGRhbWFnZTtcbiAgICAgICAgdGhpcy5fZHJhd0J1bGxldFRyYWlsKHRhcmdldC5ub2RlKTtcbiAgICAgICAgdGhpcy5fcmVmcmVzaEVudGl0eUhwKHRhcmdldCk7XG4gICAgICAgIGlmICh0YXJnZXQuaHAgPD0gMCkgdGhpcy5fa2lsbEVudGl0eSh0YXJnZXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2ZpbmRGaXJzdFRhcmdldEluTGFuZShsYW5lOiBudW1iZXIpOiBSdW5FbnRpdHkge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gdGhpcy5fZW50aXRpZXMuZmlsdGVyKChlbnRpdHkpID0+XG4gICAgICAgICAgICAoZW50aXR5LmtpbmQgPT09ICd0YXJnZXQnIHx8IGVudGl0eS5raW5kID09PSAnYm9zcycpICYmXG4gICAgICAgICAgICBlbnRpdHkubGFuZSA9PT0gbGFuZSAmJlxuICAgICAgICAgICAgZW50aXR5Lm5vZGUgJiZcbiAgICAgICAgICAgIGVudGl0eS5ub2RlLmlzVmFsaWQgJiZcbiAgICAgICAgICAgIGVudGl0eS5ub2RlLnkgPiB0aGlzLl9wbGF5ZXIueVxuICAgICAgICApO1xuICAgICAgICBjYW5kaWRhdGVzLnNvcnQoKGEsIGIpID0+IGEubm9kZS55IC0gYi5ub2RlLnkpO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlc1swXSB8fCBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2tpbGxFbnRpdHkoZW50aXR5OiBSdW5FbnRpdHkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9lbnRpdGllcy5pbmRleE9mKGVudGl0eSk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHRoaXMuX2VudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgaWYgKGVudGl0eS5raW5kID09PSAnYm9zcycpIHtcbiAgICAgICAgICAgIHRoaXMuX2Jvc3NLaWxscysrO1xuICAgICAgICAgICAgdGhpcy5fYm9zc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fbmV4dFdhdmVEaXN0YW5jZSA9IE1hdGgubWluKHRoaXMuX25leHRXYXZlRGlzdGFuY2UsIHRoaXMuX2Rpc3RhbmNlICsgdGhpcy5fd2F2ZURlbGF5QWZ0ZXJCb3NzS2lsbCk7XG4gICAgICAgICAgICBlbnRpdHkubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tb25zdGVyS2lsbHMgKz0gTWF0aC5jZWlsKGVudGl0eS5tYXhIcCAvIE1hdGgubWF4KDEsIGVudGl0eS50YXJnZXRDb25maWcuaHBfcGVyX3VuaXQpKTtcbiAgICAgICAgaWYgKGVudGl0eS50YXJnZXRDb25maWcuZHJvcF90eXBlcy5sZW5ndGggPiAwKSB0aGlzLl9zcGF3bkRyb3AoZW50aXR5KTtcbiAgICAgICAgZW50aXR5Lm5vZGUuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NwYXduRHJvcChzb3VyY2U6IFJ1bkVudGl0eSkge1xuICAgICAgICBjb25zdCBhbGxvd2VkVHlwZXMgPSB0aGlzLl9nZXRBbGxvd2VkRHJvcFR5cGVzKHNvdXJjZS50YXJnZXRDb25maWcpO1xuICAgICAgICBjb25zdCBwb29sID0gUlVOX0NPTkZJRy5kcm9wX3BhY2tzLmZpbHRlcigocGFjaykgPT4gYWxsb3dlZFR5cGVzLmluZGV4T2YocGFjay5wYWNrX3R5cGUpICE9PSAtMSk7XG4gICAgICAgIGlmIChwb29sLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBkcm9wID0gdGhpcy5fcGlja0Ryb3BQYWNrKHBvb2wpO1xuICAgICAgICBjb25zdCByb290ID0gdGhpcy5fYWRkTm9kZShkcm9wLm5hbWUsIHRoaXMuX2dhbWVMYXllciwgc291cmNlLm5vZGUueCwgc291cmNlLm5vZGUueSwgMTEwLCA5MCk7XG4gICAgICAgIHJvb3QuekluZGV4ID0gMTQ7XG4gICAgICAgIHRoaXMuX2FkZERyb3BHbG93KHJvb3QsIGRyb3ApO1xuICAgICAgICBjb25zdCBkcm9wTGFiZWwgPSB0aGlzLl9hZGRMYWJlbCgnRHJvcFRleHQnLCByb290LCB0aGlzLl9nZXREcm9wRGlzcGxheVRleHQoZHJvcCksIDAsIC0xOCwgMzQsIGNjLkNvbG9yLldISVRFKTtcbiAgICAgICAgdGhpcy5fc3R5bGVEcm9wTGFiZWwoZHJvcExhYmVsLCBkcm9wKTtcbiAgICAgICAgdGhpcy5fZW50aXRpZXMucHVzaCh7XG4gICAgICAgICAgICBpZDogdGhpcy5fbmV4dEVudGl0eUlkKGRyb3AucGFja19pZCksXG4gICAgICAgICAgICBraW5kOiAnZHJvcCcsXG4gICAgICAgICAgICBub2RlOiByb290LFxuICAgICAgICAgICAgbGFuZTogc291cmNlLmxhbmUsXG4gICAgICAgICAgICBlbGVtZW50OiBkcm9wLmVsZW1lbnRfdmFsdWUsXG4gICAgICAgICAgICBocDogMSxcbiAgICAgICAgICAgIG1heEhwOiAxLFxuICAgICAgICAgICAgZHJvcENvbmZpZzogZHJvcCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGlja0Ryb3BQYWNrKHBvb2w6IERyb3BQYWNrQ29uZmlnW10pOiBEcm9wUGFja0NvbmZpZyB7XG4gICAgICAgIGxldCB0b3RhbFdlaWdodCA9IDA7XG4gICAgICAgIGNvbnN0IHdlaWdodGVkID0gcG9vbC5tYXAoKGRyb3ApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdlaWdodCA9IHRoaXMuX2dldERyb3BXZWlnaHQoZHJvcCk7XG4gICAgICAgICAgICB0b3RhbFdlaWdodCArPSB3ZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4geyBkcm9wLCB3ZWlnaHQgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRvdGFsV2VpZ2h0IDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBwb29sW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvb2wubGVuZ3RoKV07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcm9sbCA9IE1hdGgucmFuZG9tKCkgKiB0b3RhbFdlaWdodDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3ZWlnaHRlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcm9sbCAtPSB3ZWlnaHRlZFtpXS53ZWlnaHQ7XG4gICAgICAgICAgICBpZiAocm9sbCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlaWdodGVkW2ldLmRyb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdlaWdodGVkW3dlaWdodGVkLmxlbmd0aCAtIDFdLmRyb3A7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0RHJvcFdlaWdodChkcm9wOiBEcm9wUGFja0NvbmZpZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGlzQmVmb3JlRmlyc3RCb3NzID0gdGhpcy5fYm9zc0tpbGxzID09PSAwICYmIHRoaXMuX2Rpc3RhbmNlIDwgdGhpcy5fZmlyc3RCb3NzRGlzdGFuY2U7XG4gICAgICAgIGlmIChkcm9wLm1hdGhfb3BlcmF0b3IgPT09ICdtdWx0aXBseScpIHtcbiAgICAgICAgICAgIGlmIChpc0JlZm9yZUZpcnN0Qm9zcykgcmV0dXJuIHRoaXMuX2J1bGxldENvdW50ID49IDU1ID8gMC4yMiA6IDAuMTQ7XG4gICAgICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPCA1MCkgcmV0dXJuIDAuMTY7XG4gICAgICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPj0gMjIwKSByZXR1cm4gMC4wNTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9idWxsZXRDb3VudCA+PSAxMjApIHJldHVybiAwLjEyO1xuICAgICAgICAgICAgcmV0dXJuIDAuMjg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyb3AubWF0aF9vcGVyYXRvciA9PT0gJ2FkZCcpIHtcbiAgICAgICAgICAgIGlmIChkcm9wLm1hdGhfdmFsdWUgPj0gNTApIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNCZWZvcmVGaXJzdEJvc3MpIHJldHVybiB0aGlzLl9idWxsZXRDb3VudCA+PSA3MCA/IDAuOSA6IDEuNztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPj0gMTgwKSByZXR1cm4gMC40O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9idWxsZXRDb3VudCA+PSAxMDApIHJldHVybiAwLjg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEuMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpc0JlZm9yZUZpcnN0Qm9zcyA/IDcgOiAzLjU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyb3AucGFja190eXBlID09PSAnbWF0aF9kZWJ1ZmYnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPj0gMTgwKSByZXR1cm4gNTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9idWxsZXRDb3VudCA+PSAxMDApIHJldHVybiAzLjU7XG4gICAgICAgICAgICByZXR1cm4gaXNCZWZvcmVGaXJzdEJvc3MgPyAxLjIgOiAyLjI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzQmVmb3JlRmlyc3RCb3NzID8gNCA6IDIuNTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRBbGxvd2VkRHJvcFR5cGVzKHRhcmdldDogVGFyZ2V0Q29uZmlnKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCB0eXBlcyA9ICh0YXJnZXQgJiYgdGFyZ2V0LmRyb3BfdHlwZXMgPyB0YXJnZXQuZHJvcF90eXBlcy5zbGljZSgpIDogW10pO1xuICAgICAgICBpZiAodHlwZXMuaW5kZXhPZignbWF0aF9idWZmJykgIT09IC0xICYmIHRoaXMuX2J1bGxldENvdW50ID49IDgwICYmIHR5cGVzLmluZGV4T2YoJ21hdGhfZGVidWZmJykgPT09IC0xKSB7XG4gICAgICAgICAgICB0eXBlcy5wdXNoKCdtYXRoX2RlYnVmZicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0eXBlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGREcm9wR2xvdyhyb290OiBjYy5Ob2RlLCBkcm9wOiBEcm9wUGFja0NvbmZpZykge1xuICAgICAgICBjb25zdCBnbG93ID0gdGhpcy5fYWRkTm9kZSgnRHJvcEdsb3cnLCByb290LCAwLCAtMTgsIDkyLCA5Mik7XG4gICAgICAgIGdsb3cuekluZGV4ID0gMTtcbiAgICAgICAgY29uc3QgZ3JhcGhpY3MgPSBnbG93LmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gdGhpcy5fZ2V0RHJvcFRleHRDb2xvcihkcm9wKTtcbiAgICAgICAgY29uc3QgciA9IChjb2xvciBhcyBhbnkpLnI7XG4gICAgICAgIGNvbnN0IGcgPSAoY29sb3IgYXMgYW55KS5nO1xuICAgICAgICBjb25zdCBiID0gKGNvbG9yIGFzIGFueSkuYjtcblxuICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IociwgZywgYiwgMzQpO1xuICAgICAgICBncmFwaGljcy5jaXJjbGUoMCwgMCwgNDIpO1xuICAgICAgICBncmFwaGljcy5maWxsKCk7XG5cbiAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gODtcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IociwgZywgYiwgNzIpO1xuICAgICAgICBncmFwaGljcy5jaXJjbGUoMCwgMCwgNDApO1xuICAgICAgICBncmFwaGljcy5zdHJva2UoKTtcblxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAzO1xuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1LCAxNTApO1xuICAgICAgICBncmFwaGljcy5jaXJjbGUoMCwgMCwgMzEpO1xuICAgICAgICBncmFwaGljcy5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jaGVja0Ryb3BQaWNrdXAoZW50aXR5OiBSdW5FbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5raW5kICE9PSAnZHJvcCcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgaGl0ID0gZW50aXR5LmxhbmUgPT09IHRoaXMuX3BsYXllckxhbmUgJiYgTWF0aC5hYnMoZW50aXR5Lm5vZGUueSAtIHRoaXMuX3BsYXllci55KSA8IDcyO1xuICAgICAgICBpZiAoIWhpdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLl9hcHBseURyb3AoZW50aXR5LmRyb3BDb25maWcpO1xuICAgICAgICBlbnRpdHkubm9kZS5kZXN0cm95KCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2FwcGx5RHJvcChkcm9wOiBEcm9wUGFja0NvbmZpZykge1xuICAgICAgICBpZiAoZHJvcC5wYWNrX3R5cGUgPT09ICdlbGVtZW50Jykge1xuICAgICAgICAgICAgdGhpcy5fcGxheWVyRWxlbWVudCA9IGRyb3AuZWxlbWVudF92YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NldFNwcml0ZSh0aGlzLl9lbGVtZW50UmluZywgdGhpcy5fcmluZ1Nwcml0ZSh0aGlzLl9wbGF5ZXJFbGVtZW50KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBiZWZvcmVDb3VudCA9IHRoaXMuX2J1bGxldENvdW50O1xuICAgICAgICBpZiAoZHJvcC5tYXRoX29wZXJhdG9yID09PSAnYWRkJykgdGhpcy5fYnVsbGV0Q291bnQgKz0gZHJvcC5tYXRoX3ZhbHVlO1xuICAgICAgICBpZiAoZHJvcC5tYXRoX29wZXJhdG9yID09PSAnc3VidHJhY3QnKSB0aGlzLl9idWxsZXRDb3VudCAtPSBkcm9wLm1hdGhfdmFsdWU7XG4gICAgICAgIGlmIChkcm9wLm1hdGhfb3BlcmF0b3IgPT09ICdtdWx0aXBseScpIHRoaXMuX2J1bGxldENvdW50ICo9IGRyb3AubWF0aF92YWx1ZTtcbiAgICAgICAgaWYgKGRyb3AubWF0aF9vcGVyYXRvciA9PT0gJ2RpdmlkZScpIHRoaXMuX2J1bGxldENvdW50ID0gTWF0aC5mbG9vcih0aGlzLl9idWxsZXRDb3VudCAvIE1hdGgubWF4KDEsIGRyb3AubWF0aF92YWx1ZSkpO1xuICAgICAgICB0aGlzLl9idWxsZXRDb3VudCA9IE1hdGgubWF4KDEsIE1hdGgubWluKHRoaXMuX2dldEJ1bGxldENvdW50TGltaXQoKSwgTWF0aC5mbG9vcih0aGlzLl9idWxsZXRDb3VudCkpKTtcbiAgICAgICAgdGhpcy5fcmVjb3JkRHJvcFBvd2VyQ2hhbmdlKGJlZm9yZUNvdW50LCB0aGlzLl9idWxsZXRDb3VudCk7XG4gICAgICAgIHRoaXMuX3N5bmNQbGF5ZXJTcXVhZCgpO1xuICAgICAgICB0aGlzLl9wdWxzZU5vZGUodGhpcy5fYnVsbGV0TGFiZWwubm9kZSwgZHJvcC5wYWNrX3R5cGUgPT09ICdtYXRoX2RlYnVmZicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlY29yZERyb3BQb3dlckNoYW5nZShiZWZvcmVDb3VudDogbnVtYmVyLCBhZnRlckNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBhZnRlckNvdW50IC0gYmVmb3JlQ291bnQ7XG4gICAgICAgIGlmIChkZWx0YSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2Ryb3BQb3dlckdhaW4gKz0gZGVsdGE7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLl9kcm9wUG93ZXJHYWluID0gTWF0aC5tYXgoMCwgdGhpcy5fZHJvcFBvd2VyR2FpbiArIGRlbHRhICogMC42NSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRCdWxsZXRDb3VudExpbWl0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9ib3NzS2lsbHMgPD0gMCkgcmV0dXJuIDk1O1xuICAgICAgICBjb25zdCBkaXN0YW5jZUJvbnVzID0gTWF0aC5mbG9vcihNYXRoLm1heCgwLCB0aGlzLl9kaXN0YW5jZSAtIHRoaXMuX2ZpcnN0Qm9zc0Rpc3RhbmNlKSAvIDIyMDApICogMzA7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGFtcCgxNDAgKyB0aGlzLl9ib3NzS2lsbHMgKiA0NSArIGRpc3RhbmNlQm9udXMsIDE0MCwgMzYwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXREcm9wRGlzcGxheVRleHQoZHJvcDogRHJvcFBhY2tDb25maWcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoZHJvcC5wYWNrX3R5cGUgPT09ICdlbGVtZW50Jykge1xuICAgICAgICAgICAgaWYgKGRyb3AuZWxlbWVudF92YWx1ZSA9PT0gJ2ZpcmUnKSByZXR1cm4gJ+eBqyc7XG4gICAgICAgICAgICBpZiAoZHJvcC5lbGVtZW50X3ZhbHVlID09PSAndGh1bmRlcicpIHJldHVybiAn6Zu3JztcbiAgICAgICAgICAgIHJldHVybiAn6aOOJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHJvcC5uYW1lO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3N0eWxlRHJvcExhYmVsKGxhYmVsOiBjYy5MYWJlbCwgZHJvcDogRHJvcFBhY2tDb25maWcpIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSB0aGlzLl9nZXREcm9wVGV4dENvbG9yKGRyb3ApO1xuICAgICAgICBsYWJlbC5ub2RlLmNvbG9yID0gY29sb3I7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gZHJvcC5wYWNrX3R5cGUgPT09ICdlbGVtZW50JyA/IDQwIDogMzQ7XG4gICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSBsYWJlbC5mb250U2l6ZSArIDg7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbGFiZWwub3ZlcmZsb3cgPSBjYy5MYWJlbC5PdmVyZmxvdy5TSFJJTks7XG4gICAgICAgIGxhYmVsLm5vZGUuc2V0Q29udGVudFNpemUoOTYsIDU2KTtcbiAgICAgICAgbGFiZWwubm9kZS56SW5kZXggPSA2O1xuICAgICAgICB0aGlzLl9zZXRMYWJlbE91dGxpbmUobGFiZWwsIHRoaXMuX2dldERyb3BPdXRsaW5lQ29sb3IoZHJvcCksIGRyb3AucGFja190eXBlID09PSAnZWxlbWVudCcgPyA1IDogNCk7XG5cbiAgICAgICAgbGV0IHNoYWRvdyA9IGxhYmVsLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsU2hhZG93KTtcbiAgICAgICAgaWYgKCFzaGFkb3cpIHNoYWRvdyA9IGxhYmVsLm5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsU2hhZG93KTtcbiAgICAgICAgc2hhZG93LmNvbG9yID0gbmV3IGNjLkNvbG9yKChjb2xvciBhcyBhbnkpLnIsIChjb2xvciBhcyBhbnkpLmcsIChjb2xvciBhcyBhbnkpLmIsIDE4MCk7XG4gICAgICAgIHNoYWRvdy5vZmZzZXQgPSBjYy52MigwLCAwKTtcbiAgICAgICAgc2hhZG93LmJsdXIgPSBkcm9wLnBhY2tfdHlwZSA9PT0gJ2VsZW1lbnQnID8gMTIgOiA4O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldERyb3BUZXh0Q29sb3IoZHJvcDogRHJvcFBhY2tDb25maWcpOiBjYy5Db2xvciB7XG4gICAgICAgIGlmIChkcm9wLnBhY2tfdHlwZSA9PT0gJ21hdGhfZGVidWZmJykgcmV0dXJuIG5ldyBjYy5Db2xvcigyNTUsIDcyLCA3MiwgMjU1KTtcbiAgICAgICAgaWYgKGRyb3AucGFja190eXBlID09PSAnbWF0aF9idWZmJykgcmV0dXJuIG5ldyBjYy5Db2xvcig4NiwgMjU1LCAxMTIsIDI1NSk7XG4gICAgICAgIGlmIChkcm9wLmVsZW1lbnRfdmFsdWUgPT09ICdmaXJlJykgcmV0dXJuIG5ldyBjYy5Db2xvcigyNTUsIDEyNiwgNDUsIDI1NSk7XG4gICAgICAgIGlmIChkcm9wLmVsZW1lbnRfdmFsdWUgPT09ICd0aHVuZGVyJykgcmV0dXJuIG5ldyBjYy5Db2xvcigxOTAsIDEyMCwgMjU1LCAyNTUpO1xuICAgICAgICByZXR1cm4gbmV3IGNjLkNvbG9yKDkyLCAyMzUsIDI1NSwgMjU1KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXREcm9wT3V0bGluZUNvbG9yKGRyb3A6IERyb3BQYWNrQ29uZmlnKTogY2MuQ29sb3Ige1xuICAgICAgICBpZiAoZHJvcC5wYWNrX3R5cGUgPT09ICdtYXRoX2RlYnVmZicpIHJldHVybiBuZXcgY2MuQ29sb3IoNzYsIDAsIDAsIDI1NSk7XG4gICAgICAgIGlmIChkcm9wLnBhY2tfdHlwZSA9PT0gJ21hdGhfYnVmZicpIHJldHVybiBuZXcgY2MuQ29sb3IoOCwgNzAsIDE4LCAyNTUpO1xuICAgICAgICBpZiAoZHJvcC5lbGVtZW50X3ZhbHVlID09PSAnZmlyZScpIHJldHVybiBuZXcgY2MuQ29sb3IoODgsIDI2LCAwLCAyNTUpO1xuICAgICAgICBpZiAoZHJvcC5lbGVtZW50X3ZhbHVlID09PSAndGh1bmRlcicpIHJldHVybiBuZXcgY2MuQ29sb3IoNDUsIDE0LCA5MiwgMjU1KTtcbiAgICAgICAgcmV0dXJuIG5ldyBjYy5Db2xvcigwLCA1OCwgNzgsIDI1NSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3luY1BsYXllclNxdWFkKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3BsYXllcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMuX2dldFBsYXllclVuaXRDb3VudCgpO1xuICAgICAgICBjb25zdCBydW50aW1lVW5pdHMgPSB0aGlzLl9wbGF5ZXIuY2hpbGRyZW4uZmlsdGVyKChjaGlsZDogY2MuTm9kZSkgPT4gY2hpbGQubmFtZS5pbmRleE9mKCdSdW50aW1lX1BsYXllclVuaXRfJykgPT09IDApO1xuICAgICAgICBjb25zdCBwbGF5ZXJTcHJpdGVLZXkgPSB0aGlzLl9nZXRTZWxlY3RlZFBsYXllclNwcml0ZUtleSgpO1xuXG4gICAgICAgIHRoaXMuX3BsYXllclVuaXRDb3VudCA9IGNvdW50O1xuICAgICAgICBydW50aW1lVW5pdHMuZm9yRWFjaCgoY2hpbGQ6IGNjLk5vZGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJhd0luZGV4ID0gTnVtYmVyKGNoaWxkLm5hbWUucmVwbGFjZSgnUnVudGltZV9QbGF5ZXJVbml0XycsICcnKSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4ocmF3SW5kZXgpIHx8IHJhd0luZGV4ID49IGNvdW50KSBjaGlsZC5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IHRoaXMuX2dldFNxdWFkTGF5b3V0KCdwbGF5ZXInLCBjb3VudCk7XG4gICAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3M6IG51bWJlcltdLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1bml0ID0gdGhpcy5fZ2V0T3JBZGRTcHJpdGVPcmlnaW5hbCgnUnVudGltZV9QbGF5ZXJVbml0XycgKyBpbmRleCwgdGhpcy5fcGxheWVyLCBwbGF5ZXJTcHJpdGVLZXksIHBvc1swXSwgcG9zWzFdKTtcbiAgICAgICAgICAgIHVuaXQuekluZGV4ID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFNlbGVjdGVkUGxheWVyU3ByaXRlS2V5KCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IG1heEluZGV4ID0gTWF0aC5tYXgoMCwgUlVOX0NPTkZJRy5jaGFyYWN0ZXJzLmxlbmd0aCAtIDEpO1xuICAgICAgICBjb25zdCByb2xlSW5kZXggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhJbmRleCwgTWF0aC5mbG9vcihOdW1iZXIobUdhbWVEYXRhLmN1cnJlbnRSb2xlKSB8fCAwKSkpO1xuICAgICAgICBjb25zdCBrZXkgPSAnanVlc2UnICsgKHJvbGVJbmRleCArIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5fc3ByaXRlc1trZXldID8ga2V5IDogJ2p1ZXNlMSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3luY1BsYXllclByZXNlbnRhdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9wbGF5ZXIgfHwgIXRoaXMuX2VsZW1lbnRSaW5nIHx8ICF0aGlzLl9idWxsZXRMYWJlbCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBwbGF5ZXJZID0gdGhpcy5fc2NlbmVZKC01NjEuODkzKTtcbiAgICAgICAgdGhpcy5fcGxheWVyLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRSaW5nLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgIHRoaXMuX2J1bGxldExhYmVsLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZGlzYWJsZVdpZGdldCh0aGlzLl9wbGF5ZXIpO1xuICAgICAgICB0aGlzLl9kaXNhYmxlV2lkZ2V0KHRoaXMuX2VsZW1lbnRSaW5nKTtcbiAgICAgICAgdGhpcy5fZGlzYWJsZVdpZGdldCh0aGlzLl9idWxsZXRMYWJlbC5ub2RlKTtcbiAgICAgICAgdGhpcy5fcGxheWVyLnNldFBvc2l0aW9uKHRoaXMuX2xhbmVYc1t0aGlzLl9wbGF5ZXJMYW5lXSwgcGxheWVyWSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRSaW5nLnNldFBvc2l0aW9uKHRoaXMuX3BsYXllci54LCB0aGlzLl9zY2VuZVkoLTUxOCkpO1xuICAgICAgICB0aGlzLl9idWxsZXRMYWJlbC5ub2RlLnNldFBvc2l0aW9uKHRoaXMuX3BsYXllci54LCB0aGlzLl9zY2VuZVkoLTM5NS43NSkpO1xuICAgICAgICB0aGlzLl9wbGF5ZXJSaW5nT2Zmc2V0WSA9IHRoaXMuX2VsZW1lbnRSaW5nLnkgLSB0aGlzLl9wbGF5ZXIueTtcbiAgICAgICAgdGhpcy5fc3luY1BsYXllclNxdWFkKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UGxheWVyVW5pdENvdW50KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9idWxsZXRDb3VudCA+PSAxMTApIHJldHVybiA1O1xuICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPj0gNzApIHJldHVybiA0O1xuICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPj0gNDApIHJldHVybiAzO1xuICAgICAgICBpZiAodGhpcy5fYnVsbGV0Q291bnQgPj0gMjApIHJldHVybiAyO1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRTcXVhZExheW91dChraW5kOiAncGxheWVyJyB8ICdtb25zdGVyJywgY291bnQ6IG51bWJlciA9IDUpOiBudW1iZXJbXVtdIHtcbiAgICAgICAgaWYgKGtpbmQgPT09ICdwbGF5ZXInKSB7XG4gICAgICAgICAgICBjb25zdCBjeSA9IHRoaXMuX3BsYXllclJpbmdPZmZzZXRZO1xuICAgICAgICAgICAgaWYgKGNvdW50IDw9IDEpIHJldHVybiBbWzAsIGN5IC0gMjJdXTtcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMikgcmV0dXJuIFtbLTI4LCBjeSAtIDIyXSwgWzI4LCBjeSAtIDIyXV07XG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDMpIHJldHVybiBbWy0yOCwgY3kgKyAyNF0sIFsyOCwgY3kgKyAyNF0sIFswLCBjeSAtIDMwXV07XG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDQpIHJldHVybiBbWy0yOCwgY3kgKyAyNF0sIFsyOCwgY3kgKyAyNF0sIFstMjgsIGN5IC0gMzBdLCBbMjgsIGN5IC0gMzBdXTtcbiAgICAgICAgICAgIHJldHVybiBbWy0yOCwgY3kgKyAyNl0sIFsyOCwgY3kgKyAyNl0sIFstNTYsIGN5IC0gMjhdLCBbMCwgY3kgLSAyOF0sIFs1NiwgY3kgLSAyOF1dO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb3VudCA8PSAxKSByZXR1cm4gW1swLCAtMjhdXTtcbiAgICAgICAgaWYgKGNvdW50ID09PSAyKSByZXR1cm4gW1stMjgsIC0yOF0sIFsyOCwgLTI4XV07XG4gICAgICAgIGlmIChjb3VudCA9PT0gMykgcmV0dXJuIFtbLTU2LCAtOF0sIFswLCAtOF0sIFs1NiwgLThdXTtcbiAgICAgICAgaWYgKGNvdW50ID09PSA0KSByZXR1cm4gW1stNTYsIC04XSwgWzAsIC04XSwgWzU2LCAtOF0sIFswLCAtNThdXTtcbiAgICAgICAgcmV0dXJuIFtbLTU2LCAtOF0sIFswLCAtOF0sIFs1NiwgLThdLCBbLTI4LCAtNThdLCBbMjgsIC01OF1dO1xuICAgIH1cblxuICAgIHByaXZhdGUgX21vdmVMYW5lKGRpcjogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLl9wYXVzZWQgfHwgdGhpcy5fZW5kZWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgbmV4dCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHRoaXMuX3BsYXllckxhbmUgKyBkaXIpKTtcbiAgICAgICAgaWYgKG5leHQgPT09IHRoaXMuX3BsYXllckxhbmUpIHJldHVybjtcbiAgICAgICAgdGhpcy5fcGxheWVyTGFuZSA9IG5leHQ7XG4gICAgICAgIHRoaXMuX3Jlc2V0Q29tYm8oKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0WCA9IHRoaXMuX2xhbmVYc1tuZXh0XTtcbiAgICAgICAgdGhpcy5fbW92ZVBsYXllclByZXNlbnRhdGlvblRvWCh0YXJnZXRYLCAwLjEpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Jlc2V0Q29tYm8oKSB7XG4gICAgICAgIHRoaXMuX2xvY2tlZElkID0gJyc7XG4gICAgICAgIHRoaXMuX2NvbWJvID0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9tb3ZlUGxheWVyUHJlc2VudGF0aW9uVG9YKHRhcmdldFg6IG51bWJlciwgZHVyYXRpb246IG51bWJlcikge1xuICAgICAgICBjb25zdCBub2RlcyA9IFtcbiAgICAgICAgICAgIHRoaXMuX3BsYXllcixcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRSaW5nLFxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0TGFiZWwgJiYgdGhpcy5fYnVsbGV0TGFiZWwubm9kZSxcbiAgICAgICAgXS5maWx0ZXIoKG5vZGU6IGNjLk5vZGUpID0+ICEhbm9kZSk7XG4gICAgICAgIG5vZGVzLmZvckVhY2goKG5vZGU6IGNjLk5vZGUpID0+IHtcbiAgICAgICAgICAgIG5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgICAgIG5vZGUucnVuQWN0aW9uKGNjLnNlcXVlbmNlKFxuICAgICAgICAgICAgICAgIGNjLm1vdmVUbyhkdXJhdGlvbiwgY2MudjIodGFyZ2V0WCwgbm9kZS55KSksXG4gICAgICAgICAgICAgICAgY2MuY2FsbEZ1bmMoKCkgPT4gbm9kZS54ID0gdGFyZ2V0WClcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vblRvdWNoU3RhcnQoZXZlbnQ6IGNjLkV2ZW50LkV2ZW50VG91Y2gpIHtcbiAgICAgICAgdGhpcy5fdG91Y2hTdGFydCA9IGV2ZW50LnRvdWNoLmdldExvY2F0aW9uKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfb25Ub3VjaEVuZChldmVudDogY2MuRXZlbnQuRXZlbnRUb3VjaCkge1xuICAgICAgICBpZiAoIXRoaXMuX3RvdWNoU3RhcnQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZW5kID0gZXZlbnQudG91Y2guZ2V0TG9jYXRpb24oKTtcbiAgICAgICAgY29uc3QgZHggPSBlbmQueCAtIHRoaXMuX3RvdWNoU3RhcnQueDtcbiAgICAgICAgdGhpcy5fdG91Y2hTdGFydCA9IG51bGw7XG4gICAgICAgIGlmIChNYXRoLmFicyhkeCkgPCAzNikgcmV0dXJuO1xuICAgICAgICB0aGlzLl9tb3ZlTGFuZShkeCA+IDAgPyAxIDogLTEpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlZnJlc2hIdWQoKSB7XG4gICAgICAgIHRoaXMuX2FsaWduUGxheWVySHVkWCgpO1xuICAgICAgICBpZiAodGhpcy5fZGlzdGFuY2VMYWJlbCkgdGhpcy5fZGlzdGFuY2VMYWJlbC5zdHJpbmcgPSAn6Led56a7ICcgKyB0aGlzLl9nZXREaXNwbGF5RGlzdGFuY2UoKSArICfnsbMnO1xuICAgICAgICBpZiAodGhpcy5fc2NvcmVMYWJlbCkgdGhpcy5fc2NvcmVMYWJlbC5zdHJpbmcgPSBTdHJpbmcodGhpcy5fc2NvcmUpO1xuICAgICAgICBpZiAodGhpcy5fY29tYm9MYWJlbCkgdGhpcy5fY29tYm9MYWJlbC5zdHJpbmcgPSAnQ09NQk8gJyArIHRoaXMuX2NvbWJvICsgJyEnO1xuICAgICAgICBpZiAodGhpcy5fZGFtYWdlQnVmZkxhYmVsKSB0aGlzLl9kYW1hZ2VCdWZmTGFiZWwuc3RyaW5nID0gJysnICsgdGhpcy5fY29tYm8gKyAnJSBETUcnO1xuICAgICAgICBpZiAodGhpcy5fYnVsbGV0TGFiZWwpIHRoaXMuX2J1bGxldExhYmVsLnN0cmluZyA9IFN0cmluZyh0aGlzLl9idWxsZXRDb3VudCk7XG4gICAgICAgIGlmICh0aGlzLl9wcm9ncmVzc0JhcikgdGhpcy5fcHJvZ3Jlc3NCYXIuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2VudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2hlY2tEcm9wUGlja3VwKHRoaXMuX2VudGl0aWVzW2ldKSkgdGhpcy5fZW50aXRpZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWxpZ25QbGF5ZXJIdWRYKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3BsYXllcikgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudFJpbmcgJiYgTWF0aC5hYnModGhpcy5fZWxlbWVudFJpbmcueCAtIHRoaXMuX3BsYXllci54KSA+IDAuNSkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFJpbmcueCA9IHRoaXMuX3BsYXllci54O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9idWxsZXRMYWJlbCAmJiBNYXRoLmFicyh0aGlzLl9idWxsZXRMYWJlbC5ub2RlLnggLSB0aGlzLl9wbGF5ZXIueCkgPiAwLjUpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1bGxldExhYmVsLm5vZGUueCA9IHRoaXMuX3BsYXllci54O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVmcmVzaEVudGl0eUhwKGVudGl0eTogUnVuRW50aXR5KSB7XG4gICAgICAgIGNvbnN0IGxhYmVsTm9kZSA9IGVudGl0eS5ub2RlLmdldENoaWxkQnlOYW1lKCdIcExhYmVsJykgfHwgZW50aXR5Lm5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ0Jvc3NMYWJlbCcpO1xuICAgICAgICBjb25zdCBsYWJlbCA9IGxhYmVsTm9kZSAmJiBsYWJlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgaWYgKCFsYWJlbCkgcmV0dXJuO1xuICAgICAgICBpZiAoZW50aXR5LmtpbmQgPT09ICdib3NzJykge1xuICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gU3RyaW5nKE1hdGgubWF4KDAsIE1hdGguY2VpbChlbnRpdHkuaHApKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBocFBlclVuaXQgPSBlbnRpdHkuaHBQZXJVbml0IHx8IChlbnRpdHkudGFyZ2V0Q29uZmlnICYmIGVudGl0eS50YXJnZXRDb25maWcuaHBfcGVyX3VuaXQpIHx8IDE7XG4gICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBTdHJpbmcoTWF0aC5tYXgoMCwgTWF0aC5jZWlsKGVudGl0eS5ocCAvIE1hdGgubWF4KDEsIGhwUGVyVW5pdCkpKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVTY29yZSgpIHtcbiAgICAgICAgdGhpcy5fc2NvcmUgPSB0aGlzLl9nZXREaXNwbGF5RGlzdGFuY2UoKSAqIFJVTl9DT05GSUcuZ2xvYmFsX2NvbmZpZ3Muc2NvcmVfcGVyX2Rpc3RhbmNlXG4gICAgICAgICAgICArIHRoaXMuX21vbnN0ZXJLaWxscyAqIFJVTl9DT05GSUcuZ2xvYmFsX2NvbmZpZ3Muc2NvcmVfcGVyX21vbnN0ZXJfa2lsbFxuICAgICAgICAgICAgKyB0aGlzLl9iZXN0Q29tYm8gKiAxMDBcbiAgICAgICAgICAgICsgdGhpcy5fYm9zc0tpbGxzICogNTAwMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nYW1lT3ZlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VuZGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2VuZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2NvcmUoKTtcbiAgICAgICAgdGhpcy5fc2F2ZUJlc3REaXN0YW5jZSgpO1xuICAgICAgICB0aGlzLl9zaG93RmFpbFBvcHVwKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2hvd1BhdXNlUG9wdXAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fc2hvd0NvbmZpZ3VyZWRQb3B1cCgnUGF1c2VQb3B1cCcsIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRpbnVlQnRuJywgY2I6ICgpID0+IHsgdGhpcy5faGlkZVBvcHVwTGF5ZXIoKTsgdGhpcy5fcGF1c2VkID0gZmFsc2U7IH0gfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2JhY2tCdG4nLCBjYjogKCkgPT4gdGhpcy5fcmV0dXJuVG9TdGFydFdpdGhSZXdhcmQoKSB9LFxuICAgICAgICBdKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNjLndhcm4oJ1tXYXJyaW9yUnVuXSBwYXVzZSBwb3B1cCBub2RlIG5vdCBmb3VuZDogUGF1c2VQb3B1cCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Nob3dGYWlsUG9wdXAoKSB7XG4gICAgICAgIGlmIChjYy5zeXMgJiYgY2Muc3lzLnBsYXRmb3JtID09PSBjYy5zeXMuV0VDSEFUX0dBTUUgJiYgKHdpbmRvdyBhcyBhbnkpLnd4ICYmICh3aW5kb3cgYXMgYW55KS53eC52aWJyYXRlU2hvcnQpIHtcbiAgICAgICAgICAgICh3aW5kb3cgYXMgYW55KS53eC52aWJyYXRlU2hvcnQoe30pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fcmV2aXZlVXNlZCAmJiB0aGlzLl9zaG93UmV2aXZlUG9wdXAoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9zaG93R2FtZU92ZXJQb3B1cCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2Mud2FybignW1dhcnJpb3JSdW5dIGdhbWUgb3ZlciBwb3B1cCBub2RlIG5vdCBmb3VuZDogR2FtZU92ZXJQb3B1cCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Nob3dSZXZpdmVQb3B1cCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dDb25maWd1cmVkUG9wdXAoJ1Jldml2ZVBvcHVwJywgW1xuICAgICAgICAgICAgeyBuYW1lOiAnY29udGludWVCdG4nLCBjYjogKCkgPT4gdGhpcy5fcmV2aXZlRnJvbUJvc3MoKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnYmFja0J0bicsIGNiOiAoKSA9PiB7IGlmICghdGhpcy5fc2hvd0dhbWVPdmVyUG9wdXAoKSkgdGhpcy5fcmV0dXJuVG9TdGFydFdpdGhSZXdhcmQoKTsgfSB9LFxuICAgICAgICBdLCAn5oiQ57up77yaICcgKyB0aGlzLl9nZXREaXNwbGF5RGlzdGFuY2UoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2hvd0dhbWVPdmVyUG9wdXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaG93Q29uZmlndXJlZFBvcHVwKCdHYW1lT3ZlclBvcHVwJywgW1xuICAgICAgICAgICAgeyBuYW1lOiAncmV0cnlCdG4nLCBjYjogKCkgPT4gdGhpcy5fcmV0cnlSdW4oKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnYmFja0J0bicsIGNiOiAoKSA9PiB0aGlzLl9yZXR1cm5Ub1N0YXJ0V2l0aFJld2FyZCgpIH0sXG4gICAgICAgIF0sICfmiJDnu6nvvJogJyArIHRoaXMuX2dldERpc3BsYXlEaXN0YW5jZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZXRyeVJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JldHJ5aW5nKSByZXR1cm47XG4gICAgICAgIHRoaXMuX3JldHJ5aW5nID0gdHJ1ZTtcbiAgICAgICAgU3RhdGVCcmlkZ2Uuc3luY0ZvclN0YXJ0U2NlbmUoKTtcbiAgICAgICAgaWYgKCFTdGF0ZUJyaWRnZS5jb25zdW1lU3RhbWluYSgpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXR1cm5Ub1N0YXJ0V2l0aFJld2FyZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnV2FycmlvclJ1bicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldERpc3BsYXlEaXN0YW5jZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcih0aGlzLl9kaXN0YW5jZSAqIERJU1BMQVlfRElTVEFOQ0VfU0NBTEUpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRTZXR0bGVtZW50RGlhbW9uZCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcih0aGlzLl9zY29yZSAvIDMwMCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Jldml2ZUZyb21Cb3NzKCkge1xuICAgICAgICBpZiAodGhpcy5fcmV2aXZlVXNlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9yZXZpdmVVc2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fZW5kZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2hpZGVQb3B1cExheWVyKCk7XG4gICAgICAgIHRoaXMuX2VudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVudGl0eS5raW5kID09PSAnYm9zcycpIHtcbiAgICAgICAgICAgICAgICBlbnRpdHkubm9kZS5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIGVudGl0eS5ub2RlLnkgPSBNYXRoLm1heChlbnRpdHkubm9kZS55ICsgMjIwLCAyNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ncmFudERpYW1vbmQoYW1vdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jld2FyZEdyYW50ZWQpIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnU3RhcnQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZXdhcmRHcmFudGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKG1HYW1lRGF0YSAmJiBtR2FtZURhdGEuYWRkR29sZCkge1xuICAgICAgICAgICAgbUdhbWVEYXRhLmFkZEdvbGQoYW1vdW50KTtcbiAgICAgICAgfVxuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jTmV3VG9PbGQoKTtcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdTdGFydCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JldHVyblRvU3RhcnRXaXRoUmV3YXJkKCkge1xuICAgICAgICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9lbmRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNjb3JlKCk7XG4gICAgICAgIHRoaXMuX3NhdmVCZXN0RGlzdGFuY2UoKTtcbiAgICAgICAgdGhpcy5fZ3JhbnREaWFtb25kKHRoaXMuX2dldFNldHRsZW1lbnREaWFtb25kKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Nob3dDb25maWd1cmVkUG9wdXAoXG4gICAgICAgIHBvcHVwTmFtZTogc3RyaW5nLFxuICAgICAgICBidXR0b25zOiB7IG5hbWU6IHN0cmluZzsgY2I6ICgpID0+IHZvaWQgfVtdLFxuICAgICAgICBib2R5OiBzdHJpbmcgPSAnJ1xuICAgICk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuX3BvcHVwTGF5ZXIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgcG9wdXAgPSB0aGlzLl9wb3B1cExheWVyLmdldENoaWxkQnlOYW1lKHBvcHVwTmFtZSk7XG4gICAgICAgIGlmICghcG9wdXApIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLl9oaWRlUG9wdXBMYXllcigpO1xuICAgICAgICBwb3B1cC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBwb3B1cC56SW5kZXggPSAxMDAwO1xuICAgICAgICBwb3B1cC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgcG9wdXAuc2V0Q29udGVudFNpemUodGhpcy5fdmlld1csIHRoaXMuX3ZpZXdIKTtcblxuICAgICAgICBjb25zdCBtYXNrID0gcG9wdXAuZ2V0Q2hpbGRCeU5hbWUoJ01hc2snKSB8fCBwb3B1cC5nZXRDaGlsZEJ5TmFtZSgn6YGu572pJyk7XG4gICAgICAgIGlmIChtYXNrKSB7XG4gICAgICAgICAgICBtYXNrLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICAgICAgbWFzay5zZXRDb250ZW50U2l6ZSh0aGlzLl92aWV3VywgdGhpcy5fdmlld0gpO1xuICAgICAgICAgICAgbWFzay5zY2FsZVggPSAxO1xuICAgICAgICAgICAgbWFzay5zY2FsZVkgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9keUxhYmVsID0gdGhpcy5fZmluZERlZXBMYWJlbChwb3B1cCwgJ0JvZHknKTtcbiAgICAgICAgaWYgKGJvZHlMYWJlbCkge1xuICAgICAgICAgICAgYm9keUxhYmVsLnN0cmluZyA9IGJvZHk7XG4gICAgICAgICAgICBib2R5TGFiZWwubm9kZS5hY3RpdmUgPSAhIWJvZHk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkaWFtb25kTGFiZWwgPSB0aGlzLl9maW5kRGVlcExhYmVsKHBvcHVwLCAnRGlhbW9uZEJvZHknKTtcbiAgICAgICAgaWYgKGRpYW1vbmRMYWJlbCkge1xuICAgICAgICAgICAgZGlhbW9uZExhYmVsLnN0cmluZyA9ICfmnKzlsYDojrflvpfpkrvnn7PvvJonICsgdGhpcy5fZ2V0U2V0dGxlbWVudERpYW1vbmQoKTtcbiAgICAgICAgICAgIGRpYW1vbmRMYWJlbC5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBidXR0b25zLmZvckVhY2goKGNmZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnRuID0gdGhpcy5fZmluZERlZXAocG9wdXAsIGNmZy5uYW1lKTtcbiAgICAgICAgICAgIGlmICghYnRuKSByZXR1cm47XG4gICAgICAgICAgICBidG4uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGJ0bi50YXJnZXRPZmYodGhpcyk7XG4gICAgICAgICAgICBidG4ub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBjZmcuY2IsIHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGlkZVBvcHVwTGF5ZXIoKSB7XG4gICAgICAgIHRoaXMuX3BvcHVwTGF5ZXIuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQ6IGNjLk5vZGUpID0+IHtcbiAgICAgICAgICAgIGNoaWxkLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maW5kRGVlcChyb290OiBjYy5Ob2RlLCBuYW1lOiBzdHJpbmcpOiBjYy5Ob2RlIHtcbiAgICAgICAgaWYgKCFyb290KSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKHJvb3QubmFtZSA9PT0gbmFtZSkgcmV0dXJuIHJvb3Q7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm9vdC5jaGlsZHJlbkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5fZmluZERlZXAocm9vdC5jaGlsZHJlbltpXSwgbmFtZSk7XG4gICAgICAgICAgICBpZiAoZm91bmQpIHJldHVybiBmb3VuZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maW5kRGVlcExhYmVsKHJvb3Q6IGNjLk5vZGUsIG5hbWU6IHN0cmluZyk6IGNjLkxhYmVsIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX2ZpbmREZWVwKHJvb3QsIG5hbWUpO1xuICAgICAgICByZXR1cm4gbm9kZSAmJiBub2RlLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3R5bGVQbGF5ZXJDb3VudExhYmVsKGxhYmVsOiBjYy5MYWJlbCkge1xuICAgICAgICBpZiAoIWxhYmVsKSByZXR1cm47XG4gICAgICAgIGxhYmVsLm5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTkwLCAyNTUsIDgwLCAyNTUpO1xuICAgICAgICB0aGlzLl9zZXRMYWJlbE91dGxpbmUobGFiZWwsIG5ldyBjYy5Db2xvcigyOCwgNDUsIDI2LCAyNTUpLCAzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zdHlsZU1vbnN0ZXJDb3VudExhYmVsKGxhYmVsOiBjYy5MYWJlbCkge1xuICAgICAgICBpZiAoIWxhYmVsKSByZXR1cm47XG4gICAgICAgIGxhYmVsLm5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMTgsIDI1NSwgMjU1KTtcbiAgICAgICAgdGhpcy5fc2V0TGFiZWxPdXRsaW5lKGxhYmVsLCBuZXcgY2MuQ29sb3IoMTgsIDEwLCAyOCwgMjU1KSwgNCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2hvd0VsZW1lbnREYW1hZ2VUZXh0KHRhcmdldDogUnVuRW50aXR5LCBkYW1hZ2U6IG51bWJlciwgZWxlbWVudE11bHQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Lm5vZGUgfHwgIXRhcmdldC5ub2RlLmlzVmFsaWQgfHwgIXRoaXMuX2dhbWVMYXllcikgcmV0dXJuO1xuICAgICAgICBpZiAoZWxlbWVudE11bHQgPT09IDEpIHJldHVybjtcblxuICAgICAgICBjb25zdCBpc0FkdmFudGFnZSA9IGVsZW1lbnRNdWx0ID4gMTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9nZXRFbGVtZW50RGFtYWdlVGV4dFZhbHVlKHRhcmdldCwgZGFtYWdlKTtcbiAgICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLl9hZGRMYWJlbChcbiAgICAgICAgICAgICdFbGVtZW50RGFtYWdlVGV4dCcsXG4gICAgICAgICAgICB0aGlzLl9nYW1lTGF5ZXIsXG4gICAgICAgICAgICAoaXNBZHZhbnRhZ2UgPyAn5YWL5Yi2LScgOiAn5oq15Yi2JykgKyB2YWx1ZSxcbiAgICAgICAgICAgIHRhcmdldC5ub2RlLngsXG4gICAgICAgICAgICB0YXJnZXQubm9kZS55ICsgODIsXG4gICAgICAgICAgICAyOCxcbiAgICAgICAgICAgIGlzQWR2YW50YWdlID8gbmV3IGNjLkNvbG9yKDI1NSwgMjM4LCA4MiwgMjU1KSA6IG5ldyBjYy5Db2xvcigxNDUsIDIwNiwgMjU1LCAyNTUpXG4gICAgICAgICk7XG4gICAgICAgIGxhYmVsLm5vZGUuc2V0Q29udGVudFNpemUoMTgwLCA0NCk7XG4gICAgICAgIGxhYmVsLm92ZXJmbG93ID0gY2MuTGFiZWwuT3ZlcmZsb3cuU0hSSU5LO1xuICAgICAgICBsYWJlbC5ub2RlLnpJbmRleCA9IDEyMDtcbiAgICAgICAgdGhpcy5fc2V0TGFiZWxPdXRsaW5lKFxuICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICBpc0FkdmFudGFnZSA/IG5ldyBjYy5Db2xvcig5NiwgNDIsIDAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoOSwgNDYsIDk2LCAyNTUpLFxuICAgICAgICAgICAgNFxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBzaGFkb3cgPSBsYWJlbC5ub2RlLmdldENvbXBvbmVudChjYy5MYWJlbFNoYWRvdyk7XG4gICAgICAgIGlmICghc2hhZG93KSBzaGFkb3cgPSBsYWJlbC5ub2RlLmFkZENvbXBvbmVudChjYy5MYWJlbFNoYWRvdyk7XG4gICAgICAgIHNoYWRvdy5jb2xvciA9IGlzQWR2YW50YWdlID8gbmV3IGNjLkNvbG9yKDI1NSwgMTY0LCAwLCAxNzApIDogbmV3IGNjLkNvbG9yKDQwLCAxNDAsIDI1NSwgMTcwKTtcbiAgICAgICAgc2hhZG93Lm9mZnNldCA9IGNjLnYyKDAsIDApO1xuICAgICAgICBzaGFkb3cuYmx1ciA9IDg7XG5cbiAgICAgICAgbGFiZWwubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgICAgICBsYWJlbC5ub2RlLnNjYWxlWCA9IDAuOTI7XG4gICAgICAgIGxhYmVsLm5vZGUuc2NhbGVZID0gMC45MjtcbiAgICAgICAgbGFiZWwubm9kZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UoXG4gICAgICAgICAgICBjYy5zcGF3bihcbiAgICAgICAgICAgICAgICBjYy5tb3ZlQnkoMC40OCwgY2MudjIoMCwgNTgpKSxcbiAgICAgICAgICAgICAgICBjYy5zZXF1ZW5jZShjYy5zY2FsZVRvKDAuMDgsIDEuMTYpLCBjYy5zY2FsZVRvKDAuNCwgMSkpLFxuICAgICAgICAgICAgICAgIGNjLmZhZGVPdXQoMC40OClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBjYy5jYWxsRnVuYygoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsLm5vZGUgJiYgbGFiZWwubm9kZS5pc1ZhbGlkKSBsYWJlbC5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEVsZW1lbnREYW1hZ2VUZXh0VmFsdWUodGFyZ2V0OiBSdW5FbnRpdHksIGRhbWFnZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRhcmdldC5raW5kID09PSAnYm9zcycpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCgxLCBNYXRoLmNlaWwoZGFtYWdlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBocFBlclVuaXQgPSB0YXJnZXQuaHBQZXJVbml0IHx8ICh0YXJnZXQudGFyZ2V0Q29uZmlnICYmIHRhcmdldC50YXJnZXRDb25maWcuaHBfcGVyX3VuaXQpIHx8IDE7XG4gICAgICAgIGNvbnN0IHNhZmVIcFBlclVuaXQgPSBNYXRoLm1heCgxLCBocFBlclVuaXQpO1xuICAgICAgICBjb25zdCBiZWZvcmVVbml0cyA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCh0YXJnZXQuaHAgLyBzYWZlSHBQZXJVbml0KSk7XG4gICAgICAgIGNvbnN0IGFmdGVyVW5pdHMgPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoTWF0aC5tYXgoMCwgdGFyZ2V0LmhwIC0gZGFtYWdlKSAvIHNhZmVIcFBlclVuaXQpKTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDEsIGJlZm9yZVVuaXRzIC0gYWZ0ZXJVbml0cyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0TGFiZWxPdXRsaW5lKGxhYmVsOiBjYy5MYWJlbCwgY29sb3I6IGNjLkNvbG9yLCB3aWR0aDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBvdXRsaW5lID0gbGFiZWwubm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgaWYgKCFvdXRsaW5lKSBvdXRsaW5lID0gbGFiZWwubm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgb3V0bGluZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICBvdXRsaW5lLndpZHRoID0gd2lkdGg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZHJhd0J1bGxldFRyYWlsKHRhcmdldDogY2MuTm9kZSA9IG51bGwpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2lucyA9IHRoaXMuX2dldFBsYXllckJ1bGxldE9yaWdpbnMoKTtcbiAgICAgICAgY29uc3QgdG90YWwgPSBNYXRoLm1heCgxLCBvcmlnaW5zLmxlbmd0aCk7XG4gICAgICAgIG9yaWdpbnMuZm9yRWFjaCgob3JpZ2luOiBjYy5WZWMyLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRYID0gb3JpZ2luLng7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRZID0gdGFyZ2V0ID8gdGFyZ2V0LnkgLSAzNCA6IHRoaXMuX2dldEJ1bGxldE9mZnNjcmVlblkoKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdTaW5nbGVCdWxsZXRUcmFpbChvcmlnaW4sIGNjLnYyKHRhcmdldFgsIHRhcmdldFkpLCBpbmRleCwgdG90YWwpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRCdWxsZXRPZmZzY3JlZW5ZKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl90b3BZICsgMTIwO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFBsYXllckJ1bGxldE9yaWdpbnMoKTogY2MuVmVjMltdIHtcbiAgICAgICAgaWYgKCF0aGlzLl9wbGF5ZXIgfHwgIXRoaXMuX2dhbWVMYXllcikgcmV0dXJuIFtjYy52Mih0aGlzLl9sYW5lWHNbdGhpcy5fcGxheWVyTGFuZV0sIHRoaXMuX2JvdHRvbVkgKyAxNjApXTtcbiAgICAgICAgY29uc3QgdW5pdHMgPSB0aGlzLl9wbGF5ZXIuY2hpbGRyZW5cbiAgICAgICAgICAgIC5maWx0ZXIoKGNoaWxkOiBjYy5Ob2RlKSA9PiBjaGlsZC5hY3RpdmUgJiYgY2hpbGQubmFtZS5pbmRleE9mKCdSdW50aW1lX1BsYXllclVuaXRfJykgPT09IDApXG4gICAgICAgICAgICAuc29ydCgoYTogY2MuTm9kZSwgYjogY2MuTm9kZSkgPT4gTnVtYmVyKGEubmFtZS5yZXBsYWNlKCdSdW50aW1lX1BsYXllclVuaXRfJywgJycpKSAtIE51bWJlcihiLm5hbWUucmVwbGFjZSgnUnVudGltZV9QbGF5ZXJVbml0XycsICcnKSkpO1xuICAgICAgICBpZiAoIXVuaXRzLmxlbmd0aCkgcmV0dXJuIFtjYy52Mih0aGlzLl9wbGF5ZXIueCwgdGhpcy5fcGxheWVyLnkgKyB0aGlzLl9wbGF5ZXJSaW5nT2Zmc2V0WSArIDcwKV07XG4gICAgICAgIHJldHVybiB1bml0cy5tYXAoKHVuaXQ6IGNjLk5vZGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSB1bml0LmdldENvbnRlbnRTaXplKCk7XG4gICAgICAgICAgICBjb25zdCBtdXp6bGVZID0gTWF0aC5tYXgoNTQsIHNpemUuaGVpZ2h0ICogMC41ICsgOCk7XG4gICAgICAgICAgICBjb25zdCB3b3JsZCA9IHVuaXQuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLnYyKDAsIG11enpsZVkpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nYW1lTGF5ZXIuY29udmVydFRvTm9kZVNwYWNlQVIod29ybGQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kcmF3U2luZ2xlQnVsbGV0VHJhaWwoc3RhcnQ6IGNjLlZlYzIsIGVuZDogY2MuVmVjMiwgaW5kZXg6IG51bWJlciwgdG90YWw6IG51bWJlcikge1xuICAgICAgICBjb25zdCBkeCA9IGVuZC54IC0gc3RhcnQueDtcbiAgICAgICAgY29uc3QgZHkgPSBlbmQueSAtIHN0YXJ0Lnk7XG4gICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KDEsIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkpO1xuICAgICAgICBjb25zdCBidWxsZXQgPSB0aGlzLl9nZXRCdWxsZXRUcmFpbE5vZGUoc3RhcnQueCwgc3RhcnQueSk7XG4gICAgICAgIGJ1bGxldC56SW5kZXggPSA4MCArIGluZGV4O1xuICAgICAgICBidWxsZXQub3BhY2l0eSA9IDI1NTtcbiAgICAgICAgYnVsbGV0LmFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpICogMTgwIC8gTWF0aC5QSSAtIDkwO1xuXG4gICAgICAgIGNvbnN0IGNvbG9yID0gdGhpcy5fZ2V0QnVsbGV0Q29sb3IoKTtcbiAgICAgICAgY29uc3QgZ3JhcGhpY3MgPSBidWxsZXQuZ2V0Q29tcG9uZW50KGNjLkdyYXBoaWNzKSB8fCBidWxsZXQuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgY29uc3QgY3VydmUgPSAwO1xuICAgICAgICBncmFwaGljcy5saW5lQ2FwID0gY2MuR3JhcGhpY3MuTGluZUNhcC5ST1VORDtcbiAgICAgICAgZ3JhcGhpY3MubGluZUpvaW4gPSBjYy5HcmFwaGljcy5MaW5lSm9pbi5ST1VORDtcbiAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gMjQ7XG4gICAgICAgIGdyYXBoaWNzLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKChjb2xvciBhcyBhbnkpLnIsIChjb2xvciBhcyBhbnkpLmcsIChjb2xvciBhcyBhbnkpLmIsIDYyKTtcbiAgICAgICAgZ3JhcGhpY3MubW92ZVRvKGN1cnZlICogLTAuNywgLTU4KTtcbiAgICAgICAgZ3JhcGhpY3MuYmV6aWVyQ3VydmVUbyhjdXJ2ZSwgLTI2LCAtY3VydmUsIDE4LCBjdXJ2ZSAqIDAuMzUsIDQ4KTtcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKCk7XG4gICAgICAgIGdyYXBoaWNzLmxpbmVXaWR0aCA9IDEyO1xuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigoY29sb3IgYXMgYW55KS5yLCAoY29sb3IgYXMgYW55KS5nLCAoY29sb3IgYXMgYW55KS5iLCAxNjgpO1xuICAgICAgICBncmFwaGljcy5tb3ZlVG8oY3VydmUgKiAtMC40LCAtNTApO1xuICAgICAgICBncmFwaGljcy5iZXppZXJDdXJ2ZVRvKGN1cnZlLCAtMjIsIC1jdXJ2ZSwgMTYsIGN1cnZlICogMC4yNSwgNDIpO1xuICAgICAgICBncmFwaGljcy5zdHJva2UoKTtcbiAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gNDtcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSwgMjQ1KTtcbiAgICAgICAgZ3JhcGhpY3MubW92ZVRvKDAsIC00Mik7XG4gICAgICAgIGdyYXBoaWNzLmJlemllckN1cnZlVG8oY3VydmUgKiAwLjUsIC0xNiwgLWN1cnZlICogMC40LCAxNiwgMCwgMzQpO1xuICAgICAgICBncmFwaGljcy5zdHJva2UoKTtcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKChjb2xvciBhcyBhbnkpLnIsIChjb2xvciBhcyBhbnkpLmcsIChjb2xvciBhcyBhbnkpLmIsIDE1MCk7XG4gICAgICAgIGdyYXBoaWNzLmNpcmNsZSgwLCA0OCwgMTUpO1xuICAgICAgICBncmFwaGljcy5maWxsKCk7XG4gICAgICAgIGdyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1LCAyNDUpO1xuICAgICAgICBncmFwaGljcy5jaXJjbGUoMCwgNDgsIDcpO1xuICAgICAgICBncmFwaGljcy5maWxsKCk7XG5cbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBNYXRoLm1heCgwLjEyLCBNYXRoLm1pbigwLjI0LCBsZW4gLyAyNjAwKSk7XG4gICAgICAgIGJ1bGxldC5ydW5BY3Rpb24oY2Muc2VxdWVuY2UoXG4gICAgICAgICAgICBjYy5zcGF3bihcbiAgICAgICAgICAgICAgICBjYy5tb3ZlVG8oZHVyYXRpb24sIGVuZCksXG4gICAgICAgICAgICAgICAgY2Muc2VxdWVuY2UoY2Muc2NhbGVUbyhkdXJhdGlvbiAqIDAuMzUsIDEuMTIsIDEuMDgpLCBjYy5zY2FsZVRvKGR1cmF0aW9uICogMC42NSwgMC44OCwgMC45OCkpLFxuICAgICAgICAgICAgICAgIGNjLnNlcXVlbmNlKGNjLmZhZGVUbyhkdXJhdGlvbiAqIDAuNywgMjM1KSwgY2MuZmFkZU91dChkdXJhdGlvbiAqIDAuMykpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgY2MuY2FsbEZ1bmMoKCkgPT4gdGhpcy5fcmVjeWNsZUJ1bGxldFRyYWlsTm9kZShidWxsZXQpKVxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRCdWxsZXRUcmFpbE5vZGUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBjYy5Ob2RlIHtcbiAgICAgICAgbGV0IGJ1bGxldDogY2MuTm9kZSA9IG51bGw7XG4gICAgICAgIHdoaWxlICh0aGlzLl9idWxsZXRUcmFpbFBvb2wubGVuZ3RoID4gMCAmJiAhYnVsbGV0KSB7XG4gICAgICAgICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLl9idWxsZXRUcmFpbFBvb2wucG9wKCk7XG4gICAgICAgICAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0ID0gY2FjaGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFidWxsZXQpIHtcbiAgICAgICAgICAgIGJ1bGxldCA9IHRoaXMuX2FkZE5vZGUoJ1J1bnRpbWVfQnVsbGV0TGluZScsIHRoaXMuX2dhbWVMYXllciwgeCwgeSwgOTIsIDE0MCk7XG4gICAgICAgICAgICBidWxsZXQuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChidWxsZXQucGFyZW50ICE9PSB0aGlzLl9nYW1lTGF5ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9nYW1lTGF5ZXIuYWRkQ2hpbGQoYnVsbGV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1bGxldC5zZXRDb250ZW50U2l6ZSg5MiwgMTQwKTtcbiAgICAgICAgICAgIGJ1bGxldC5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1bGxldC5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgICBidWxsZXQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgYnVsbGV0Lm9wYWNpdHkgPSAyNTU7XG4gICAgICAgIGJ1bGxldC5zY2FsZVggPSAxO1xuICAgICAgICBidWxsZXQuc2NhbGVZID0gMTtcbiAgICAgICAgYnVsbGV0LmFuZ2xlID0gMDtcbiAgICAgICAgcmV0dXJuIGJ1bGxldDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWN5Y2xlQnVsbGV0VHJhaWxOb2RlKGJ1bGxldDogY2MuTm9kZSkge1xuICAgICAgICBpZiAoIWJ1bGxldCB8fCAhYnVsbGV0LmlzVmFsaWQpIHJldHVybjtcbiAgICAgICAgYnVsbGV0LnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgICAgIGNvbnN0IGdyYXBoaWNzID0gYnVsbGV0LmdldENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGlmIChncmFwaGljcykgZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgYnVsbGV0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBidWxsZXQub3BhY2l0eSA9IDI1NTtcbiAgICAgICAgYnVsbGV0LnNjYWxlWCA9IDE7XG4gICAgICAgIGJ1bGxldC5zY2FsZVkgPSAxO1xuICAgICAgICBidWxsZXQuYW5nbGUgPSAwO1xuICAgICAgICB0aGlzLl9idWxsZXRUcmFpbFBvb2wucHVzaChidWxsZXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEJ1bGxldENvbG9yKCk6IGNjLkNvbG9yIHtcbiAgICAgICAgaWYgKHRoaXMuX3BsYXllckVsZW1lbnQgPT09ICdmaXJlJykgcmV0dXJuIG5ldyBjYy5Db2xvcigyNTUsIDEyNiwgNDUsIDI1NSk7XG4gICAgICAgIGlmICh0aGlzLl9wbGF5ZXJFbGVtZW50ID09PSAndGh1bmRlcicpIHJldHVybiBuZXcgY2MuQ29sb3IoMTkwLCAxMjAsIDI1NSwgMjU1KTtcbiAgICAgICAgcmV0dXJuIG5ldyBjYy5Db2xvcig5MiwgMjM1LCAyNTUsIDI1NSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcHVsc2VOb2RlKG5vZGU6IGNjLk5vZGUsIGJhZDogYm9vbGVhbikge1xuICAgICAgICBub2RlLmNvbG9yID0gYmFkID8gY2MuQ29sb3IuUkVEIDogY2MuQ29sb3IuV0hJVEU7XG4gICAgICAgIG5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICAgICAgbm9kZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UoXG4gICAgICAgICAgICBjYy5zY2FsZVRvKDAuMDYsIDEuMjUpLFxuICAgICAgICAgICAgY2Muc2NhbGVUbygwLjA4LCAxKSxcbiAgICAgICAgICAgIGNjLmNhbGxGdW5jKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fYnVsbGV0TGFiZWwgJiYgbm9kZSA9PT0gdGhpcy5fYnVsbGV0TGFiZWwubm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVBsYXllckNvdW50TGFiZWwodGhpcy5fYnVsbGV0TGFiZWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuY29sb3IgPSBjYy5Db2xvci5XSElURTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRFbGVtZW50TXVsdGlwbGllcihhdHRhY2tlcjogRWxlbWVudFR5cGUsIGRlZmVuZGVyOiBFbGVtZW50VHlwZSk6IG51bWJlciB7XG4gICAgICAgIGlmIChhdHRhY2tlciA9PT0gJ25vbmUnIHx8IGRlZmVuZGVyID09PSAnbm9uZScgfHwgYXR0YWNrZXIgPT09IGRlZmVuZGVyKSByZXR1cm4gMTtcbiAgICAgICAgY29uc3QgYmVhdHM6IFJlY29yZDxzdHJpbmcsIEVsZW1lbnRUeXBlPiA9IHsgd2luZDogJ2ZpcmUnLCBmaXJlOiAndGh1bmRlcicsIHRodW5kZXI6ICd3aW5kJyB9O1xuICAgICAgICBpZiAoYmVhdHNbYXR0YWNrZXJdID09PSBkZWZlbmRlcikgcmV0dXJuIFJVTl9DT05GSUcuZ2xvYmFsX2NvbmZpZ3MuZWxlbWVudF9hZHZhbnRhZ2VfbXVsdGlwbGllciArICh0aGlzLl9jaGFyYWN0ZXIuZWxlbWVudF9hZHZhbnRhZ2VfYm9udXMgfHwgMCk7XG4gICAgICAgIGlmIChiZWF0c1tkZWZlbmRlcl0gPT09IGF0dGFja2VyKSByZXR1cm4gUlVOX0NPTkZJRy5nbG9iYWxfY29uZmlncy5lbGVtZW50X2Rpc2FkdmFudGFnZV9tdWx0aXBsaWVyO1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9waWNrQm9zc0xhbmUoY3VycmVudDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgbGFuZXMgPSBbMCwgMSwgMl0uZmlsdGVyKChsYW5lKSA9PiBsYW5lICE9PSBjdXJyZW50KTtcbiAgICAgICAgcmV0dXJuIGxhbmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxhbmVzLmxlbmd0aCldO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldENsdXN0ZXJVbml0cyh0YXJnZXQ6IFRhcmdldENvbmZpZywgc3Bhd24/OiBTcGF3bkNvbmZpZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSBzcGF3biAmJiBzcGF3bi51bml0X2NvdW50X211bHRpcGxpZXIgPyBzcGF3bi51bml0X2NvdW50X211bHRpcGxpZXIgOiAxO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZCgodGFyZ2V0LnVuaXRfY291bnQgfHwgMSkgKiBtdWx0aXBsaWVyKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0VGFyZ2V0U3BlZWRNdWx0aXBsaWVyKHRhcmdldDogVGFyZ2V0Q29uZmlnLCBzcGF3bjogU3Bhd25Db25maWcpOiBudW1iZXIge1xuICAgICAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICAgICAgaWYgKHRhcmdldC50YXJnZXRfdHlwZSA9PT0gJ29ic3RhY2xlJykge1xuICAgICAgICAgICAgbXVsdGlwbGllciAqPSAwLjgyO1xuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5jbHVzdGVyX3NoYXBlID09PSAnY29sdW1uJykge1xuICAgICAgICAgICAgbXVsdGlwbGllciAqPSAxLjE7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmNsdXN0ZXJfc2hhcGUgPT09ICd3aWRlJykge1xuICAgICAgICAgICAgbXVsdGlwbGllciAqPSAwLjkyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNwYXduLmVsZW1lbnQgPT09ICd3aW5kJykgbXVsdGlwbGllciAqPSAxLjA4O1xuICAgICAgICBpZiAoc3Bhd24uZWxlbWVudCA9PT0gJ2ZpcmUnKSBtdWx0aXBsaWVyICo9IDEuMDM7XG4gICAgICAgIGlmIChzcGF3bi5lbGVtZW50ID09PSAndGh1bmRlcicpIG11bHRpcGxpZXIgKj0gMC45NztcblxuICAgICAgICBjb25zdCBsYW5lT2Zmc2V0ID0gKHNwYXduLmxhbmUgLSAxKSAqIDAuMDM7XG4gICAgICAgIGNvbnN0IHJhbmRvbU9mZnNldCA9IDAuODggKyBNYXRoLnJhbmRvbSgpICogMC4yNjtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsYW1wKG11bHRpcGxpZXIgKiByYW5kb21PZmZzZXQgKyBsYW5lT2Zmc2V0LCAwLjc2LCAxLjI4KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmluZ1Nwcml0ZShlbGVtZW50OiBFbGVtZW50VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIGlmIChlbGVtZW50ID09PSAnZmlyZScpIHJldHVybiAnZmF6aGVuMic7XG4gICAgICAgIGlmIChlbGVtZW50ID09PSAndGh1bmRlcicpIHJldHVybiAnZmF6aGVuMyc7XG4gICAgICAgIHJldHVybiAnZmF6aGVuMSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZmluZFRhcmdldChpZDogc3RyaW5nKTogVGFyZ2V0Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIFJVTl9DT05GSUcudGFyZ2V0cy5maWx0ZXIoKHRhcmdldCkgPT4gdGFyZ2V0LmVudGl0eV9pZCA9PT0gaWQpWzBdIHx8IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZmluZEJvc3MoaWQ6IHN0cmluZyk6IEJvc3NDb25maWcge1xuICAgICAgICByZXR1cm4gUlVOX0NPTkZJRy5ib3NzZXMuZmlsdGVyKChib3NzKSA9PiBib3NzLmVudGl0eV9pZCA9PT0gaWQpWzBdIHx8IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbmV4dEVudGl0eUlkKHByZWZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgdGhpcy5fZW50aXR5U2VxKys7XG4gICAgICAgIHJldHVybiBwcmVmaXggKyAnXycgKyB0aGlzLl9lbnRpdHlTZXE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2F2ZUJlc3REaXN0YW5jZSgpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fZ2V0QmVzdERpc3RhbmNlS2V5KCk7XG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIoY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpIHx8IDApKTtcbiAgICAgICAgY29uc3QgbmV4dFZhbHVlID0gTWF0aC5tYXgob2xkVmFsdWUsIHRoaXMuX2dldERpc3BsYXlEaXN0YW5jZSgpKTtcbiAgICAgICAgaWYgKG5leHRWYWx1ZSA+IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBTdHJpbmcobmV4dFZhbHVlKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ1dhcnJpb3JSdW5CZXN0RGlzdGFuY2UnLCBTdHJpbmcobmV4dFZhbHVlKSk7XG4gICAgICAgICAgICBVc2VyRGF0YVN5bmNNYW5hZ2VyLnJlcXVlc3RVcGxvYWQoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEJlc3REaXN0YW5jZVRvU2VydmVyKG5leHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZXBvcnRCZXN0RGlzdGFuY2VUb1NlcnZlcihiZXN0RGlzdGFuY2U6IG51bWJlcikge1xuICAgICAgICBjb25zdCB1c2VybmFtZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJOQU1FJykgfHwgJyc7XG4gICAgICAgIGlmICghdXNlcm5hbWUgfHwgYmVzdERpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB4aHIub3BlbignUE9TVCcsICdodHRwczovL3BheS5zenZpLWJvLmNvbS92MS90ZXN0YXBwL1Bhc3NMZXZlbCcsIHRydWUpO1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzIDwgMjAwIHx8IHhoci5zdGF0dXMgPj0gMzAwKSB7XG4gICAgICAgICAgICAgICAgY2Mud2FybignW1dhcnJpb3JSdW5dIHJlcG9ydCBiZXN0IGRpc3RhbmNlIGZhaWxlZDonLCB4aHIuc3RhdHVzLCB4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuY29kZSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjYy53YXJuKCdbV2FycmlvclJ1bl0gcmVwb3J0IGJlc3QgZGlzdGFuY2UgcmVqZWN0ZWQ6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjYy53YXJuKCdbV2FycmlvclJ1bl0gcmVwb3J0IGJlc3QgZGlzdGFuY2UgcGFyc2UgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiBjYy53YXJuKCdbV2FycmlvclJ1bl0gcmVwb3J0IGJlc3QgZGlzdGFuY2UgbmV0d29yayBlcnJvcicpO1xuICAgICAgICB4aHIub250aW1lb3V0ID0gKCkgPT4gY2Mud2FybignW1dhcnJpb3JSdW5dIHJlcG9ydCBiZXN0IGRpc3RhbmNlIHRpbWVvdXQnKTtcbiAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgYXBwaWQ6IEFQUF9JRCxcbiAgICAgICAgICAgIHVzZXJuYW1lLFxuICAgICAgICAgICAgcmFuazogYmVzdERpc3RhbmNlLFxuICAgICAgICAgICAgc3RhcjogM1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0QmVzdERpc3RhbmNlS2V5KCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnU0xTX1VTRVJfSUQnKTtcbiAgICAgICAgcmV0dXJuIHVzZXJJZCA/ICdXYXJyaW9yUnVuQmVzdERpc3RhbmNlXycgKyB1c2VySWQgOiAnV2FycmlvclJ1bkJlc3REaXN0YW5jZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2xlYXJSdW50aW1lTm9kZXMoKSB7XG4gICAgICAgIGNvbnN0IHJ1bnRpbWVOYW1lcyA9IFsnQnVsbGV0VHJhaWwnLCAnUnVudGltZV9CdWxsZXQnLCAnUGFuZWwnXTtcbiAgICAgICAgdGhpcy5fYnVsbGV0VHJhaWxQb29sID0gW107XG4gICAgICAgIFt0aGlzLl9nYW1lTGF5ZXIsIHRoaXMuX3BvcHVwTGF5ZXJdLmZvckVhY2goKHJvb3Q6IGNjLk5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuICAgICAgICAgICAgcm9vdC5jaGlsZHJlbi5zbGljZSgpLmZvckVhY2goKGNoaWxkOiBjYy5Ob2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUuaW5kZXhPZignUnVudGltZV8nKSA9PT0gMCB8fCBydW50aW1lTmFtZXMuaW5kZXhPZihjaGlsZC5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlRnJvbVBhcmVudChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2xlYXJSdW50aW1lQ2hpbGRyZW4ocm9vdDogY2MuTm9kZSkge1xuICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcbiAgICAgICAgcm9vdC5jaGlsZHJlbi5zbGljZSgpLmZvckVhY2goKGNoaWxkOiBjYy5Ob2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQubmFtZS5pbmRleE9mKCdSdW50aW1lXycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlRnJvbVBhcmVudChmYWxzZSk7XG4gICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kaXNhYmxlV2lkZ2V0KG5vZGU6IGNjLk5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHdpZGdldCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLldpZGdldCk7XG4gICAgICAgIGlmICh3aWRnZXQpIHdpZGdldC5lbmFibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0T3JBZGROb2RlKG5hbWU6IHN0cmluZywgcGFyZW50OiBjYy5Ob2RlLCB4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIpOiBjYy5Ob2RlIHtcbiAgICAgICAgbGV0IG5vZGUgPSBwYXJlbnQuZ2V0Q2hpbGRCeU5hbWUobmFtZSk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgbm9kZSA9IHRoaXMuX2FkZE5vZGUobmFtZSwgcGFyZW50LCB4LCB5LCB3LCBoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgICAgICBub2RlLnNldENvbnRlbnRTaXplKHcsIGgpO1xuICAgICAgICAgICAgbm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldE9yQWRkU3ByaXRlKG5hbWU6IHN0cmluZywgcGFyZW50OiBjYy5Ob2RlLCBrZXk6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyLCBrZWVwUmF0aW86IGJvb2xlYW4gPSB0cnVlKTogY2MuTm9kZSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRPckFkZE5vZGUobmFtZSwgcGFyZW50LCB4LCB5LCB3LCBoKTtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKSB8fCBub2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBpZiAodGhpcy5fc3ByaXRlc1trZXldKSBzcHJpdGUuc3ByaXRlRnJhbWUgPSB0aGlzLl9zcHJpdGVzW2tleV07XG4gICAgICAgIHRoaXMuX2FwcGx5U3ByaXRlU2l6ZShub2RlLCBzcHJpdGUsIHcsIGgsIGtlZXBSYXRpbyk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldE9yQWRkU3ByaXRlT3JpZ2luYWwobmFtZTogc3RyaW5nLCBwYXJlbnQ6IGNjLk5vZGUsIGtleTogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcik6IGNjLk5vZGUge1xuICAgICAgICBsZXQgbm9kZSA9IHBhcmVudC5nZXRDaGlsZEJ5TmFtZShuYW1lKTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5fYWRkU3ByaXRlT3JpZ2luYWwobmFtZSwgcGFyZW50LCBrZXksIHgsIHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgICAgIG5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSkgfHwgbm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zcHJpdGVzW2tleV0pIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHRoaXMuX3Nwcml0ZXNba2V5XTtcbiAgICAgICAgICAgIHRoaXMuX2FwcGx5U3ByaXRlT3JpZ2luYWxTaXplKG5vZGUsIHNwcml0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0T3JBZGRMYWJlbChuYW1lOiBzdHJpbmcsIHBhcmVudDogY2MuTm9kZSwgdGV4dDogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBjb2xvcjogY2MuQ29sb3IpOiBjYy5MYWJlbCB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9nZXRPckFkZE5vZGUobmFtZSwgcGFyZW50LCB4LCB5LCAzNjAsIHNpemUgKyAxNik7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gbm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpIHx8IG5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dDtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSBzaXplO1xuICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gc2l6ZSArIDg7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbm9kZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkTm9kZShuYW1lOiBzdHJpbmcsIHBhcmVudDogY2MuTm9kZSwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyKTogY2MuTm9kZSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgY2MuTm9kZShuYW1lKTtcbiAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZSh3LCBoKTtcbiAgICAgICAgbm9kZS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgcGFyZW50LmFkZENoaWxkKG5vZGUpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRTcHJpdGUobmFtZTogc3RyaW5nLCBwYXJlbnQ6IGNjLk5vZGUsIGtleTogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIsIGtlZXBSYXRpbzogYm9vbGVhbiA9IHRydWUpOiBjYy5Ob2RlIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX2FkZE5vZGUobmFtZSwgcGFyZW50LCB4LCB5LCB3LCBoKTtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gbm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgaWYgKHRoaXMuX3Nwcml0ZXNba2V5XSkgc3ByaXRlLnNwcml0ZUZyYW1lID0gdGhpcy5fc3ByaXRlc1trZXldO1xuICAgICAgICB0aGlzLl9hcHBseVNwcml0ZVNpemUobm9kZSwgc3ByaXRlLCB3LCBoLCBrZWVwUmF0aW8pO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRTcHJpdGVPcmlnaW5hbChuYW1lOiBzdHJpbmcsIHBhcmVudDogY2MuTm9kZSwga2V5OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKTogY2MuTm9kZSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9hZGROb2RlKG5hbWUsIHBhcmVudCwgeCwgeSwgMSwgMSk7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGlmICh0aGlzLl9zcHJpdGVzW2tleV0pIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHRoaXMuX3Nwcml0ZXNba2V5XTtcbiAgICAgICAgdGhpcy5fYXBwbHlTcHJpdGVPcmlnaW5hbFNpemUobm9kZSwgc3ByaXRlKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYXBwbHlTcHJpdGVPcmlnaW5hbFNpemUobm9kZTogY2MuTm9kZSwgc3ByaXRlOiBjYy5TcHJpdGUpIHtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHJldHVybjtcbiAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLlRSSU1NRUQ7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gc3ByaXRlLnNwcml0ZUZyYW1lO1xuICAgICAgICBpZiAoZnJhbWUgJiYgZnJhbWUuZ2V0T3JpZ2luYWxTaXplKSB7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbCA9IGZyYW1lLmdldE9yaWdpbmFsU2l6ZSgpO1xuICAgICAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZShvcmlnaW5hbC53aWR0aCB8fCAxLCBvcmlnaW5hbC5oZWlnaHQgfHwgMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZnJhbWUgJiYgZnJhbWUuZ2V0UmVjdCkge1xuICAgICAgICAgICAgY29uc3QgcmVjdCA9IGZyYW1lLmdldFJlY3QoKTtcbiAgICAgICAgICAgIG5vZGUuc2V0Q29udGVudFNpemUocmVjdC53aWR0aCB8fCAxLCByZWN0LmhlaWdodCB8fCAxKTtcbiAgICAgICAgfVxuICAgICAgICBub2RlLnNjYWxlWCA9IDE7XG4gICAgICAgIG5vZGUuc2NhbGVZID0gMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBseVNwcml0ZVNpemUobm9kZTogY2MuTm9kZSwgc3ByaXRlOiBjYy5TcHJpdGUsIHRhcmdldFc6IG51bWJlciwgdGFyZ2V0SDogbnVtYmVyLCBrZWVwUmF0aW86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHJldHVybjtcbiAgICAgICAgaWYgKCFrZWVwUmF0aW8pIHtcbiAgICAgICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgICAgICBub2RlLnNjYWxlWCA9IDE7XG4gICAgICAgICAgICBub2RlLnNjYWxlWSA9IDE7XG4gICAgICAgICAgICBub2RlLnNldENvbnRlbnRTaXplKHRhcmdldFcsIHRhcmdldEgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLlRSSU1NRUQ7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gc3ByaXRlLnNwcml0ZUZyYW1lO1xuICAgICAgICBsZXQgcmF3VyA9IHRhcmdldFc7XG4gICAgICAgIGxldCByYXdIID0gdGFyZ2V0SDtcbiAgICAgICAgaWYgKGZyYW1lICYmIGZyYW1lLmdldE9yaWdpbmFsU2l6ZSkge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSBmcmFtZS5nZXRPcmlnaW5hbFNpemUoKTtcbiAgICAgICAgICAgIHJhd1cgPSBvcmlnaW5hbC53aWR0aCB8fCByYXdXO1xuICAgICAgICAgICAgcmF3SCA9IG9yaWdpbmFsLmhlaWdodCB8fCByYXdIO1xuICAgICAgICB9IGVsc2UgaWYgKGZyYW1lICYmIGZyYW1lLmdldFJlY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBmcmFtZS5nZXRSZWN0KCk7XG4gICAgICAgICAgICByYXdXID0gcmVjdC53aWR0aCB8fCByYXdXO1xuICAgICAgICAgICAgcmF3SCA9IHJlY3QuaGVpZ2h0IHx8IHJhd0g7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZShyYXdXLCByYXdIKTtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBNYXRoLm1pbih0YXJnZXRXIC8gTWF0aC5tYXgoMSwgcmF3VyksIHRhcmdldEggLyBNYXRoLm1heCgxLCByYXdIKSk7XG4gICAgICAgIG5vZGUuc2NhbGVYID0gc2NhbGU7XG4gICAgICAgIG5vZGUuc2NhbGVZID0gc2NhbGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0U3ByaXRlKG5vZGU6IGNjLk5vZGUsIGtleTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9IG5vZGUgJiYgbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgaWYgKHNwcml0ZSAmJiB0aGlzLl9zcHJpdGVzW2tleV0pIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHRoaXMuX3Nwcml0ZXNba2V5XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRMYWJlbChuYW1lOiBzdHJpbmcsIHBhcmVudDogY2MuTm9kZSwgdGV4dDogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBjb2xvcjogY2MuQ29sb3IpOiBjYy5MYWJlbCB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9hZGROb2RlKG5hbWUsIHBhcmVudCwgeCwgeSwgMzYwLCBzaXplICsgMTYpO1xuICAgICAgICBjb25zdCBsYWJlbCA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dDtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSBzaXplO1xuICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gc2l6ZSArIDg7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbm9kZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZHJhd1JlY3Qobm9kZTogY2MuTm9kZSwgY29sb3I6IGNjLkNvbG9yKSB7XG4gICAgICAgIGNvbnN0IGdyYXBoaWNzID0gbm9kZS5nZXRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBpZiAoZ3JhcGhpY3MpIGdyYXBoaWNzLmRlc3Ryb3koKTtcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKSB8fCBub2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSB0aGlzLl9nZXRTb2xpZEZyYW1lKCk7XG4gICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIG5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoKGNvbG9yIGFzIGFueSkuciwgKGNvbG9yIGFzIGFueSkuZywgKGNvbG9yIGFzIGFueSkuYik7XG4gICAgICAgIG5vZGUub3BhY2l0eSA9IChjb2xvciBhcyBhbnkpLmE7XG4gICAgICAgIG5vZGUuc2NhbGVYID0gMTtcbiAgICAgICAgbm9kZS5zY2FsZVkgPSAxO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFNvbGlkRnJhbWUoKTogY2MuU3ByaXRlRnJhbWUge1xuICAgICAgICBpZiAodGhpcy5fc29saWRGcmFtZSkgcmV0dXJuIHRoaXMuX3NvbGlkRnJhbWU7XG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgY2MuVGV4dHVyZTJEKCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShbMjU1LCAyNTUsIDI1NSwgMjU1XSk7XG4gICAgICAgIHRleHR1cmUuaW5pdFdpdGhEYXRhKGRhdGEgYXMgYW55LCBjYy5UZXh0dXJlMkQuUGl4ZWxGb3JtYXQuUkdCQTg4ODgsIDEsIDEpO1xuICAgICAgICB0aGlzLl9zb2xpZEZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKHRleHR1cmUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fc29saWRGcmFtZTtcbiAgICB9XG59XG4iXX0=