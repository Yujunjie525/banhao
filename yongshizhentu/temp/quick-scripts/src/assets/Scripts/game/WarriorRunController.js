"use strict";
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