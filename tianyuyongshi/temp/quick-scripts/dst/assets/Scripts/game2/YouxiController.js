
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game2/YouxiController.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'd15ecuRd8VB64uEwWmNMxTJ', 'YouxiController');
// Scripts/game2/YouxiController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ccclass = cc._decorator.ccclass;
var GameState_1 = require("./GameState");
var StateBridge_1 = require("./StateBridge");
var GameData_1 = require("../Load/GameData");
var MONSTER_DISPLAY_SCALE = 1;
var SHOW_HITBOX_DEBUG = false;
var HITBOX_DEBUG_LINE_WIDTH = 5;
var HITBOX_DEBUG_STROKE_COLOR = cc.color(220, 0, 0, 255);
var HITBOX_DEBUG_FILL_COLOR = cc.color(255, 0, 0, 45);
var GRAZE_DEBUG_LINE_WIDTH = 4;
var GRAZE_DEBUG_STROKE_COLOR = cc.color(255, 185, 0, 255);
var GRAZE_DEBUG_FILL_COLOR = cc.color(255, 185, 0, 25);
var YouxiController = /** @class */ (function (_super) {
    __extends(YouxiController, _super);
    function YouxiController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._background = null;
        _this._hud = null;
        _this._popupLayer = null;
        _this._player = null;
        _this._shieldFx = null;
        _this._enemyLayer = null;
        _this._pickupLayer = null;
        _this._enemyTemplate = null;
        _this._joystick = null;
        _this._joystickKnob = null;
        _this._shieldBtn = null;
        _this._pauseBtn = null;
        _this._coinNode = null;
        _this._coinNodeEditorOffset = null;
        _this._popupPause = null;
        _this._popupRevive = null;
        _this._popupResult = null;
        _this._hitboxDebugLayer = null;
        _this._hitboxDebugGraphics = null;
        _this._timeLabel = null;
        _this._scoreLabel = null;
        _this._coinLabel = null;
        _this._energyLabel = null;
        _this._shieldCdLabel = null;
        _this._reviveDiamondLabel = null;
        _this._resultDiamondLabel = null;
        _this._monsterFrames = [];
        _this._roleFrames = {};
        _this._coinFrame = null;
        _this._characterTraits = [];
        _this._monsterCollisionConfigs = [];
        _this._currentTrait = null;
        _this._currentRoleIndex = 0;
        _this._input = cc.v2(0, 0);
        _this._elapsed = 0;
        _this._score = 0;
        _this._distanceScore = 0;
        _this._grazeScore = 0;
        _this._coins = 0;
        _this._energy = 0;
        _this._shieldTime = 0;
        _this._distance = 0;
        _this._enemyTimer = 0;
        _this._pickupTimer = 0;
        _this._difficultyTimer = 0;
        _this._enemyInterval = 1.25;
        _this._enemySpeed = 170;
        _this._paused = false;
        _this._ended = false;
        _this._revived = false;
        _this._enemies = [];
        _this._pickups = [];
        _this._shieldMax = 30;
        _this._visibleWidth = 1280;
        _this._visibleHeight = 720;
        _this._halfVisibleWidth = 640;
        _this._halfVisibleHeight = 360;
        return _this;
    }
    YouxiController.prototype.onLoad = function () {
        var _this = this;
        this._bindSceneNodes();
        this._fitBackground();
        this.scheduleOnce(function () { return _this._fitBackground(); }, 0);
        this._loadRuntimeAssets();
        this._bindJoystick();
        this._bindButtons();
        this._refreshHud();
        this._createHitboxDebugLayer();
        this._drawHitboxDebug();
    };
    YouxiController.prototype.update = function (dt) {
        this._syncVisibleLayout();
        if (this._paused || this._ended) {
            this._drawHitboxDebug();
            return;
        }
        this._elapsed += dt;
        this._difficultyTimer += dt;
        if (this._difficultyTimer >= 8) {
            this._difficultyTimer = 0;
            this._enemySpeed += 12;
            this._enemyInterval = Math.max(0.52, this._enemyInterval - 0.06);
        }
        this._distance += this._enemySpeed * dt;
        this._distanceScore = Math.floor(this._distance / 10);
        this._score = this._distanceScore + this._grazeScore;
        this._updatePlayer(dt);
        this._updateShield(dt);
        this._updateEnemyAnimations(dt);
        this._updateEnemies(dt);
        this._updatePickups(dt);
        this._spawnTimers(dt);
        this._refreshHud();
        this._drawHitboxDebug();
    };
    YouxiController.prototype._bindSceneNodes = function () {
        this._background = cc.find('Background', this.node);
        this._hud = cc.find('HUD', this.node);
        this._popupLayer = cc.find('PopupLayer', this.node);
        this._enemyLayer = cc.find('EnemyLayer', this.node);
        this._pickupLayer = cc.find('PickupLayer', this.node);
        this._enemyTemplate = cc.find('EnemyLayer/EnemyTemplate', this.node);
        this._player = cc.find('Player', this.node);
        this._shieldFx = cc.find('Player/ShieldFx', this.node);
        this._joystick = cc.find('HUD/Joystick', this.node);
        this._joystickKnob = cc.find('HUD/Joystick/JoystickKnob', this.node);
        this._shieldBtn = cc.find('HUD/ShieldButton', this.node);
        this._pauseBtn = cc.find('HUD/PauseButton', this.node);
        this._coinNode = cc.find('HUD/CoinNode', this.node);
        this._popupPause = cc.find('PopupLayer/PopupPause', this.node);
        this._popupRevive = cc.find('PopupLayer/PopupRevive', this.node);
        this._popupResult = cc.find('PopupLayer/PopupResult', this.node);
        this._timeLabel = this._label('HUD/TimerIcon/TimeLabel');
        this._scoreLabel = this._label('HUD/ScoreLabel');
        this._coinLabel = this._label('HUD/CoinNode/CoinLabel');
        this._energyLabel = this._label('HUD/EnergyLabel');
        this._shieldCdLabel = this._label('HUD/ShieldCdLabel');
        this._reviveDiamondLabel = this._label('PopupLayer/PopupRevive/DiamondLabel');
        this._resultDiamondLabel = this._label('PopupLayer/PopupResult/DiamondLabel');
        var timerIcon = cc.find('HUD/TimerIcon', this.node);
        if (this._coinNode && timerIcon) {
            this._coinNodeEditorOffset = this._coinNode.position.sub(timerIcon.position);
        }
        if (GameData_1.default.GetGoldData)
            GameData_1.default.GetGoldData();
        if (this._coinNode)
            this._coinNode.active = true;
        if (this._coinLabel && this._coinLabel.node)
            this._coinLabel.node.active = true;
        if (this._shieldCdLabel && this._shieldCdLabel.node) {
            this._shieldCdLabel.string = '';
            this._shieldCdLabel.node.active = false;
        }
        if (this._shieldFx)
            this._shieldFx.opacity = 0;
        if (this._enemyTemplate)
            this._enemyTemplate.active = false;
        if (this._popupPause)
            this._popupPause.active = false;
        if (this._popupRevive)
            this._popupRevive.active = false;
        if (this._popupResult)
            this._popupResult.active = false;
    };
    YouxiController.prototype._createHitboxDebugLayer = function () {
        if (!SHOW_HITBOX_DEBUG || this._hitboxDebugLayer)
            return;
        this._hitboxDebugLayer = new cc.Node('HitboxDebugLayer');
        this.node.addChild(this._hitboxDebugLayer);
        this._hitboxDebugLayer.zIndex = 50;
        if (this._popupLayer)
            this._popupLayer.zIndex = 100;
        this._hitboxDebugLayer.setPosition(0, 0);
        this._hitboxDebugLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        this._hitboxDebugGraphics = this._hitboxDebugLayer.addComponent(cc.Graphics);
        this._hitboxDebugGraphics.lineWidth = HITBOX_DEBUG_LINE_WIDTH;
        this._hitboxDebugGraphics.strokeColor = HITBOX_DEBUG_STROKE_COLOR;
        this._hitboxDebugGraphics.fillColor = HITBOX_DEBUG_FILL_COLOR;
    };
    YouxiController.prototype._label = function (path) {
        var node = cc.find(path, this.node);
        return node ? node.getComponent(cc.Label) : null;
    };
    YouxiController.prototype._loadRuntimeAssets = function () {
        var _this = this;
        cc.loader.loadResDir('zzImg2', cc.SpriteFrame, function (err, frames) {
            if (!err && frames) {
                frames.forEach(function (frame) { return _this._roleFrames[frame.name] = frame; });
                _this._applySelectedRoleSprite();
            }
        });
        cc.loader.loadRes('zzImg/zuanshi', cc.SpriteFrame, function (err, frame) {
            if (!err && frame)
                _this._coinFrame = frame;
        });
        cc.loader.loadRes('config/characterTraits', cc.JsonAsset, function (err, json) {
            if (!err && json) {
                var cfg = json.json || {};
                if (Array.isArray(cfg)) {
                    _this._characterTraits = cfg.filter(function (item) { return !item || item.enabled !== false; });
                    _this._monsterCollisionConfigs = [];
                }
                else {
                    _this._characterTraits = (cfg.characters || []).filter(function (item) { return !item || item.enabled !== false; });
                    _this._monsterCollisionConfigs = (cfg.monsters || []).filter(function (item) { return !item || item.enabled !== false; });
                }
                _this._applySelectedRoleTrait();
            }
        });
        var _loop_1 = function (i) {
            var monsterIndex = i - 1;
            cc.loader.loadResDir("Anim2/master" + i, cc.SpriteFrame, function (err, frames) {
                if (err || !frames || frames.length === 0)
                    return;
                _this._monsterFrames[monsterIndex] = frames.sort(function (a, b) { return a.name.localeCompare(b.name); });
                if (_this._enemyTemplate && monsterIndex === 0) {
                    _this._setMonsterSpriteFrame(_this._enemyTemplate, _this._monsterFrames[monsterIndex][0]);
                }
            });
        };
        for (var i = 1; i <= 6; i++) {
            _loop_1(i);
        }
    };
    YouxiController.prototype._applySelectedRoleSprite = function () {
        if (!this._player)
            return;
        if (GameData_1.default.GetCurrentRoleData)
            GameData_1.default.GetCurrentRoleData();
        this._currentRoleIndex = cc.misc.clampf(Number(GameData_1.default.currentRole) || 0, 0, 4);
        var frame = this._roleFrames[String(this._currentRoleIndex + 1)] || this._roleFrames['1'];
        if (frame)
            this._setSpriteFrame(this._player, frame);
        this._applySelectedRoleTrait();
    };
    YouxiController.prototype._applySelectedRoleTrait = function () {
        var _this = this;
        if (!this._characterTraits || this._characterTraits.length === 0)
            return;
        this._currentTrait = this._characterTraits.find(function (cfg) { return Number(cfg.role_index) === _this._currentRoleIndex; })
            || this._characterTraits[0];
    };
    YouxiController.prototype._setSpriteFrame = function (node, frame) {
        if (!node || !frame)
            return;
        var sprite = node.getComponent(cc.Sprite);
        if (!sprite)
            sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = frame;
    };
    YouxiController.prototype._setMonsterSpriteFrame = function (node, frame) {
        if (!node || !frame)
            return;
        var sprite = node.getComponent(cc.Sprite);
        if (!sprite)
            sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = frame;
        var size = frame.getOriginalSize ? frame.getOriginalSize() : null;
        var rect = !size && frame.getRect ? frame.getRect() : null;
        if (size) {
            node.setContentSize(size.width, size.height);
        }
        else if (rect) {
            node.setContentSize(rect.width, rect.height);
        }
        node.scale = MONSTER_DISPLAY_SCALE;
    };
    YouxiController.prototype._fitBackground = function () {
        this._syncVisibleLayout(true);
    };
    YouxiController.prototype._syncVisibleLayout = function (force) {
        if (force === void 0) { force = false; }
        var canvasSize = this.node.getContentSize();
        var viewSize = cc.view && cc.view.getVisibleSize ? cc.view.getVisibleSize() : null;
        var activeSize = this._pickActiveVisibleSize(canvasSize, viewSize);
        if (!force
            && Math.abs(activeSize.width - this._visibleWidth) < 1
            && Math.abs(activeSize.height - this._visibleHeight) < 1) {
            return;
        }
        this._visibleWidth = activeSize.width;
        this._visibleHeight = activeSize.height;
        this._halfVisibleWidth = this._visibleWidth * 0.5;
        this._halfVisibleHeight = this._visibleHeight * 0.5;
        if (this._hud)
            this._hud.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._popupLayer)
            this._popupLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._enemyLayer)
            this._enemyLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._pickupLayer)
            this._pickupLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._hitboxDebugLayer)
            this._hitboxDebugLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._background) {
            this._background.setPosition(0, 0);
            var designRatio = 1280 / 720;
            var canvasRatio = this._visibleWidth / this._visibleHeight;
            if (canvasRatio >= designRatio) {
                this._background.setContentSize(this._visibleWidth, this._visibleWidth / designRatio);
            }
            else {
                this._background.setContentSize(this._visibleHeight * designRatio, this._visibleHeight);
            }
        }
        var leftX = -this._halfVisibleWidth;
        var rightX = this._halfVisibleWidth;
        var topY = this._halfVisibleHeight;
        var bottomY = -this._halfVisibleHeight;
        var timerIcon = cc.find('HUD/TimerIcon', this.node);
        this._setNodePosition(timerIcon, leftX + 117, topY - 66);
        if (this._scoreLabel && this._scoreLabel.node)
            this._scoreLabel.node.setPosition(0, topY - 67);
        if (this._coinNode && timerIcon && this._coinNodeEditorOffset) {
            this._coinNode.setPosition(timerIcon.x + this._coinNodeEditorOffset.x, timerIcon.y + this._coinNodeEditorOffset.y);
        }
        this._setNodePosition(this._pauseBtn, rightX - 86, topY - 68);
        this._setNodePosition(this._joystick, leftX + 144, bottomY + 106);
        this._setNodePosition(this._shieldBtn, rightX - 224, bottomY + 106);
        if (this._energyLabel && this._energyLabel.node)
            this._energyLabel.node.setPosition(rightX - 224, bottomY + 170);
        if (this._shieldCdLabel && this._shieldCdLabel.node)
            this._shieldCdLabel.node.setPosition(rightX - 214, bottomY + 108);
    };
    YouxiController.prototype._pickActiveVisibleSize = function (canvasSize, viewSize) {
        if (!viewSize)
            return canvasSize;
        var canvasRatio = canvasSize.height > 0 ? canvasSize.width / canvasSize.height : 0;
        var viewRatio = viewSize.height > 0 ? viewSize.width / viewSize.height : 0;
        if (viewSize.width > 0 && viewSize.height > 0 && viewRatio > canvasRatio + 0.01) {
            return viewSize;
        }
        return canvasSize;
    };
    YouxiController.prototype._setNodePosition = function (node, x, y) {
        if (node)
            node.setPosition(x, y);
    };
    YouxiController.prototype._drawHitboxDebug = function () {
        if (!SHOW_HITBOX_DEBUG || !this._hitboxDebugGraphics)
            return;
        var g = this._hitboxDebugGraphics;
        g.clear();
        g.lineWidth = HITBOX_DEBUG_LINE_WIDTH;
        g.strokeColor = HITBOX_DEBUG_STROKE_COLOR;
        g.fillColor = HITBOX_DEBUG_FILL_COLOR;
        if (this._player && this._player.active) {
            var p = this._nodePositionInHitboxLayer(this._player);
            g.lineWidth = GRAZE_DEBUG_LINE_WIDTH;
            g.strokeColor = GRAZE_DEBUG_STROKE_COLOR;
            g.fillColor = GRAZE_DEBUG_FILL_COLOR;
            g.circle(p.x, p.y, this._getPlayerGrazeRadius());
            g.fill();
            g.stroke();
            g.lineWidth = HITBOX_DEBUG_LINE_WIDTH;
            g.strokeColor = HITBOX_DEBUG_STROKE_COLOR;
            g.fillColor = HITBOX_DEBUG_FILL_COLOR;
            g.circle(p.x, p.y, this._getPlayerCollisionRadius());
            g.fill();
            g.stroke();
        }
        g.lineWidth = HITBOX_DEBUG_LINE_WIDTH;
        g.strokeColor = HITBOX_DEBUG_STROKE_COLOR;
        g.fillColor = HITBOX_DEBUG_FILL_COLOR;
        for (var _i = 0, _a = this._enemies; _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (!enemy || !enemy.node || !enemy.node.isValid || !enemy.node.active)
                continue;
            var p = this._nodePositionInHitboxLayer(enemy.node);
            g.circle(p.x, p.y, enemy.radius);
            g.fill();
            g.stroke();
        }
    };
    YouxiController.prototype._nodePositionInHitboxLayer = function (node) {
        if (!node || !this._hitboxDebugLayer)
            return cc.v2(0, 0);
        var world = node.convertToWorldSpaceAR(cc.v2(0, 0));
        return this._hitboxDebugLayer.convertToNodeSpaceAR(world);
    };
    YouxiController.prototype._randomGameplayY = function () {
        var minY = -this._halfVisibleHeight + 120;
        var maxY = this._halfVisibleHeight - 120;
        if (minY >= maxY)
            return 0;
        return cc.misc.lerp(minY, maxY, Math.random());
    };
    YouxiController.prototype._rightSpawnX = function () {
        return this._halfVisibleWidth + 70;
    };
    YouxiController.prototype._leftDespawnX = function () {
        return -this._halfVisibleWidth - 90;
    };
    YouxiController.prototype._playerMinX = function () {
        return -this._halfVisibleWidth + 70;
    };
    YouxiController.prototype._playerMaxX = function () {
        return this._halfVisibleWidth - 70;
    };
    YouxiController.prototype._playerMinY = function () {
        return -this._halfVisibleHeight + 90;
    };
    YouxiController.prototype._playerMaxY = function () {
        return this._halfVisibleHeight - 95;
    };
    YouxiController.prototype._bindJoystick = function () {
        var _this = this;
        if (!this._joystick || !this._joystickKnob)
            return;
        var updateInput = function (event) {
            var local = _this._joystick.convertToNodeSpaceAR(event.getLocation());
            var v = cc.v2(local.x, local.y);
            var radius = 70;
            if (v.mag() > radius)
                v = v.normalize().mul(radius);
            _this._joystickKnob.setPosition(v);
            _this._input = v.mag() > 4 ? v.normalize() : cc.v2(0, 0);
        };
        var reset = function () {
            _this._input = cc.v2(0, 0);
            _this._joystickKnob.setPosition(0, 0);
        };
        this._joystick.on(cc.Node.EventType.TOUCH_START, updateInput, this);
        this._joystick.on(cc.Node.EventType.TOUCH_MOVE, updateInput, this);
        this._joystick.on(cc.Node.EventType.TOUCH_END, reset, this);
        this._joystick.on(cc.Node.EventType.TOUCH_CANCEL, reset, this);
    };
    YouxiController.prototype._bindButtons = function () {
        var _this = this;
        if (this._shieldBtn) {
            this._shieldBtn.on(cc.Node.EventType.TOUCH_END, this._activateShield, this);
        }
        if (this._pauseBtn) {
            this._pauseBtn.on(cc.Node.EventType.TOUCH_END, this._showPause, this);
        }
        this._bindPopup(this._popupPause, function () {
            _this._popupPause.active = false;
            _this._paused = false;
        }, function () { return _this._exitToStart(); });
        this._bindPopup(this._popupRevive, function () {
            _this._popupRevive.active = false;
            _this._shieldTime = 3;
            _this._paused = false;
        }, function () {
            _this._popupRevive.active = false;
            _this._gameOver();
            _this._exitToStart();
        });
        this._bindPopup(this._popupResult, function () { return _this._restart(); }, function () { return _this._exitToStart(); });
    };
    YouxiController.prototype._bindPopup = function (panel, primary, secondary) {
        if (!panel)
            return;
        var primaryBtn = panel.getChildByName('Primary');
        var secondaryBtn = panel.getChildByName('Secondary');
        if (primaryBtn)
            primaryBtn.on(cc.Node.EventType.TOUCH_END, primary, this);
        if (secondaryBtn)
            secondaryBtn.on(cc.Node.EventType.TOUCH_END, secondary, this);
    };
    YouxiController.prototype._updatePlayer = function (dt) {
        if (!this._player)
            return;
        var speed = 285 * this._getTraitNumber('speed_multiplier', 1);
        var x = cc.misc.clampf(this._player.x + this._input.x * speed * dt, this._playerMinX(), this._playerMaxX());
        var y = cc.misc.clampf(this._player.y + this._input.y * speed * dt, this._playerMinY(), this._playerMaxY());
        this._player.setPosition(x, y);
    };
    YouxiController.prototype._updateShield = function (dt) {
        if (this._shieldTime <= 0)
            return;
        this._shieldTime = Math.max(0, this._shieldTime - dt);
        if (this._shieldFx) {
            this._shieldFx.opacity = this._shieldTime > 0
                ? 150 + Math.sin(Date.now() / 80) * 70
                : 0;
        }
        if (this._shieldCdLabel) {
            this._shieldCdLabel.string = '';
        }
    };
    YouxiController.prototype._updateEnemyAnimations = function (dt) {
        for (var _i = 0, _a = this._enemies; _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (!enemy.frames || enemy.frames.length <= 1)
                continue;
            enemy.frameTimer += dt;
            if (enemy.frameTimer < 0.08)
                continue;
            enemy.frameTimer = 0;
            enemy.frameIndex = (enemy.frameIndex + 1) % enemy.frames.length;
            this._setMonsterSpriteFrame(enemy.node, enemy.frames[enemy.frameIndex]);
        }
    };
    YouxiController.prototype._updateEnemies = function (dt) {
        for (var i = this._enemies.length - 1; i >= 0; i--) {
            var enemy = this._enemies[i];
            enemy.node.x -= enemy.speed * dt;
            enemy.node.y += Math.sin(Date.now() / 250 + i) * 10 * dt;
            var dist = enemy.node.position.sub(this._player.position).mag();
            var playerRadius = this._getPlayerCollisionRadius();
            var grazeRadius = this._getPlayerGrazeRadius();
            if (!enemy.grazed && dist < grazeRadius + enemy.radius && dist > playerRadius + enemy.radius - 2) {
                enemy.grazed = true;
                this._addEnergy(10);
                this._grazeScore += 30;
                this._score = this._distanceScore + this._grazeScore;
                this._floatText('完美躲避!', this._player.position.add(cc.v2(0, 80)), cc.color(255, 238, 110));
            }
            if (dist <= playerRadius + enemy.radius) {
                if (this._shieldTime > 0) {
                    this._addDiamond(1, enemy.node.position);
                    enemy.node.destroy();
                    this._enemies.splice(i, 1);
                }
                else {
                    enemy.node.destroy();
                    this._enemies.splice(i, 1);
                    this._showReviveOrGameOver();
                }
                continue;
            }
            if (enemy.node.x < this._leftDespawnX()) {
                enemy.node.destroy();
                this._enemies.splice(i, 1);
            }
        }
    };
    YouxiController.prototype._updatePickups = function (dt) {
        for (var i = this._pickups.length - 1; i >= 0; i--) {
            var node = this._pickups[i];
            node.x -= 120 * dt;
            node.angle += 80 * dt;
            var dist = node.position.sub(this._player.position).mag();
            if (dist < 52) {
                this._addDiamond(1, node.position);
                node.destroy();
                this._pickups.splice(i, 1);
            }
            else if (node.x < this._leftDespawnX()) {
                node.destroy();
                this._pickups.splice(i, 1);
            }
        }
    };
    YouxiController.prototype._spawnTimers = function (dt) {
        this._enemyTimer += dt;
        if (this._enemyTimer >= this._enemyInterval) {
            this._enemyTimer = 0;
            this._spawnEnemy();
        }
        this._pickupTimer += dt;
        if (this._pickupTimer >= 4.5) {
            this._pickupTimer = 0;
            this._spawnCoin();
        }
    };
    YouxiController.prototype._spawnEnemy = function () {
        if (!this._enemyTemplate || !this._enemyLayer)
            return;
        var monsterIndex = Math.floor(Math.random() * 6);
        var frames = this._monsterFrames[monsterIndex] || this._monsterFrames[0] || [];
        var enemy = cc.instantiate(this._enemyTemplate);
        enemy.active = true;
        enemy.parent = this._enemyLayer;
        enemy.setPosition(this._rightSpawnX(), this._randomGameplayY());
        enemy.scale = MONSTER_DISPLAY_SCALE;
        if (frames.length > 0)
            this._setMonsterSpriteFrame(enemy, frames[0]);
        this._enemies.push({
            node: enemy,
            speed: this._enemySpeed + Math.random() * 70,
            radius: this._getMonsterRadius(monsterIndex),
            grazed: false,
            frames: frames,
            frameIndex: 0,
            frameTimer: 0
        });
    };
    YouxiController.prototype._getTraitNumber = function (key, fallback) {
        if (!this._currentTrait || this._currentTrait[key] == null)
            return fallback;
        var value = Number(this._currentTrait[key]);
        return isNaN(value) ? fallback : value;
    };
    YouxiController.prototype._getScaledRadius = function (key, fallback) {
        var specRadius = this._getTraitNumber(key, -1);
        if (specRadius < 0)
            return fallback;
        return specRadius * 4;
    };
    YouxiController.prototype._getPlayerCollisionRadius = function () {
        var radiusPx = this._getTraitNumber('hitbox_radius_px', -1);
        if (radiusPx >= 0)
            return radiusPx;
        return this._getScaledRadius('hitbox_radius', 22);
    };
    YouxiController.prototype._getPlayerGrazeRadius = function () {
        var radiusPx = this._getTraitNumber('graze_radius_px', -1);
        if (radiusPx >= 0)
            return radiusPx;
        return this._getScaledRadius('graze_radius', 58);
    };
    YouxiController.prototype._getMonsterRadius = function (monsterIndex) {
        var cfg = this._monsterCollisionConfigs
            ? this._monsterCollisionConfigs.find(function (item) { return Number(item.monster_index) === monsterIndex; })
            : null;
        if (cfg && cfg.radius_px != null) {
            var radius = Number(cfg.radius_px);
            if (!isNaN(radius) && radius >= 0)
                return radius;
        }
        return 34;
    };
    YouxiController.prototype._spawnCoin = function () {
        if (!this._pickupLayer || !this._coinFrame)
            return;
        var node = new cc.Node('CoinPickup');
        this._pickupLayer.addChild(node);
        node.setPosition(this._rightSpawnX(), this._randomGameplayY());
        node.setContentSize(55, 53);
        this._setSpriteFrame(node, this._coinFrame);
        this._pickups.push(node);
    };
    YouxiController.prototype._activateShield = function () {
        if (this._energy < this._shieldMax || this._shieldTime > 0 || this._ended)
            return;
        this._energy = 0;
        this._shieldTime = 5;
        if (this._shieldFx)
            this._shieldFx.opacity = 220;
        if (this._shieldBtn) {
            cc.tween(this._shieldBtn).to(0.08, { scale: 1.12 }).to(0.1, { scale: 1 }).start();
        }
        this._refreshHud();
    };
    YouxiController.prototype._addEnergy = function (value) {
        this._energy = Math.min(this._shieldMax, this._energy + value);
        if (this._shieldBtn) {
            cc.tween(this._shieldBtn).to(0.08, { scale: 1.06 }).to(0.08, { scale: 1 }).start();
        }
    };
    YouxiController.prototype._showPause = function () {
        if (this._ended || !this._popupPause)
            return;
        this._paused = true;
        this._popupPause.active = true;
    };
    YouxiController.prototype._showReviveOrGameOver = function () {
        this._paused = true;
        if (!this._revived && this._popupRevive) {
            this._revived = true;
            var score = this._label('PopupLayer/PopupRevive/ScoreLabel');
            if (score)
                score.string = "\u5206\u6570\uFF1A" + this._score;
            var diamond = this._reviveDiamondLabel || this._label('PopupLayer/PopupRevive/DiamondLabel');
            if (diamond) {
                this._reviveDiamondLabel = diamond;
                diamond.string = "\u672C\u5C40\u83B7\u5F97\u94BB\u77F3\uFF1A" + this._coins;
            }
            this._popupRevive.active = true;
            return;
        }
        this._gameOver();
    };
    YouxiController.prototype._gameOver = function () {
        this._ended = true;
        this._paused = true;
        if (this._score > (GameData_1.default.BestScore || 0)) {
            GameData_1.default.BestScore = this._score;
            GameData_1.default.SaveBestScoreData();
        }
        GameState_1.default.lastResult = {
            stars: 0,
            shenpoEarned: this._coins,
            shardsEarned: 0,
            wavesCleared: Math.floor(this._distance / 100)
        };
        GameState_1.default.save();
        StateBridge_1.default.syncNewToOld();
        if (this._popupResult) {
            var score = this._label('PopupLayer/PopupResult/ScoreLabel');
            if (score)
                score.string = "\u5206\u6570\uFF1A" + this._score;
            var diamond = this._resultDiamondLabel || this._label('PopupLayer/PopupResult/DiamondLabel');
            if (diamond) {
                this._resultDiamondLabel = diamond;
                diamond.string = "\u672C\u5C40\u83B7\u5F97\u94BB\u77F3\uFF1A" + this._coins;
            }
            this._popupResult.active = true;
        }
    };
    YouxiController.prototype._restart = function () {
        if (!StateBridge_1.default.consumeStamina()) {
            this._floatText('体力不足', cc.v2(0, 0), cc.Color.RED);
            return;
        }
        cc.director.loadScene('youxi');
    };
    YouxiController.prototype._exitToStart = function () {
        StateBridge_1.default.syncNewToOld();
        cc.director.loadScene('Start');
    };
    YouxiController.prototype._refreshHud = function () {
        if (this._timeLabel)
            this._timeLabel.string = this._formatTime(this._elapsed);
        if (this._scoreLabel)
            this._scoreLabel.string = "\u5206\u6570\uFF1A" + this._score;
        if (this._coinLabel)
            this._coinLabel.string = "" + GameData_1.default.currentGold;
        if (this._energyLabel)
            this._energyLabel.string = "\u80FD\u91CF " + this._energy + "/" + this._shieldMax;
        if (this._shieldBtn)
            this._shieldBtn.opacity = this._energy >= this._shieldMax ? 255 : 150;
        if (this._shieldCdLabel)
            this._shieldCdLabel.string = '';
    };
    YouxiController.prototype._addDiamond = function (amount, pos) {
        var gain = Math.max(0, Math.floor(amount || 0));
        if (gain <= 0)
            return;
        this._coins += gain;
        if (GameData_1.default.addGold) {
            GameData_1.default.addGold(gain);
        }
        else {
            GameData_1.default.currentGold = Math.max(0, (GameData_1.default.currentGold || 0) + gain);
            if (GameData_1.default.SaveGoldData)
                GameData_1.default.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        GameState_1.default.shenpo = Math.max(0, (GameState_1.default.shenpo || 0) + gain);
        GameState_1.default.save();
        this._floatText("+" + gain, pos, cc.color(255, 228, 80));
        this._refreshHud();
    };
    YouxiController.prototype._formatTime = function (seconds) {
        var total = Math.max(0, Math.floor(seconds));
        var mm = Math.floor(total / 60);
        var ss = total % 60;
        return "" + (mm < 10 ? '0' : '') + mm + ":" + (ss < 10 ? '0' : '') + ss;
    };
    YouxiController.prototype._floatText = function (text, pos, color) {
        var labelNode = new cc.Node('FloatText');
        this.node.addChild(labelNode);
        labelNode.setPosition(pos);
        var label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 24;
        label.lineHeight = 28;
        labelNode.color = color;
        cc.tween(labelNode)
            .by(0.65, { y: 42, opacity: -180 })
            .call(function () { return labelNode.destroy(); })
            .start();
    };
    YouxiController = __decorate([
        ccclass
    ], YouxiController);
    return YouxiController;
}(cc.Component));
exports.default = YouxiController;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZTJcXFlvdXhpQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQVEsSUFBQSxPQUFPLEdBQUssRUFBRSxDQUFDLFVBQVUsUUFBbEIsQ0FBbUI7QUFFbEMseUNBQW9DO0FBQ3BDLDZDQUF3QztBQUN4Qyw2Q0FBeUM7QUFFekMsSUFBTSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7QUFDaEMsSUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFDaEMsSUFBTSx1QkFBdUIsR0FBRyxDQUFDLENBQUM7QUFDbEMsSUFBTSx5QkFBeUIsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzNELElBQU0sdUJBQXVCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxJQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQztBQUNqQyxJQUFNLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUQsSUFBTSxzQkFBc0IsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBYXpEO0lBQTZDLG1DQUFZO0lBQXpEO1FBQUEscUVBb3VCQztRQW51QlcsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFDNUIsVUFBSSxHQUFZLElBQUksQ0FBQztRQUNyQixpQkFBVyxHQUFZLElBQUksQ0FBQztRQUM1QixhQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLGVBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsaUJBQVcsR0FBWSxJQUFJLENBQUM7UUFDNUIsa0JBQVksR0FBWSxJQUFJLENB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bkM7SUFBRCxzQkFBQztDQXB1QkQsQUFvdUJDLENBcHVCNEMsRUFBRSxDQUFDLFNBQVMsR0FvdUJ4RDtrQkFwdUJvQixlQUFlIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgeyBjY2NsYXNzIH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4vR2FtZVN0YXRlJztcbmltcG9ydCBTdGF0ZUJyaWRnZSBmcm9tICcuL1N0YXRlQnJpZGdlJztcbmltcG9ydCBtR2FtZURhdGEgZnJvbSAnLi4vTG9hZC9HYW1lRGF0YSc7XG5cbmNvbnN0IE1PTlNURVJfRElTUExBWV9TQ0FMRSA9IDE7XG5jb25zdCBTSE9XX0hJVEJPWF9ERUJVRyA9IGZhbHNlO1xuY29uc3QgSElUQk9YX0RFQlVHX0xJTkVfV0lEVEggPSA1O1xuY29uc3QgSElUQk9YX0RFQlVHX1NUUk9LRV9DT0xPUiA9IGNjLmNvbG9yKDIyMCwgMCwgMCwgMjU1KTtcbmNvbnN0IEhJVEJPWF9ERUJVR19GSUxMX0NPTE9SID0gY2MuY29sb3IoMjU1LCAwLCAwLCA0NSk7XG5jb25zdCBHUkFaRV9ERUJVR19MSU5FX1dJRFRIID0gNDtcbmNvbnN0IEdSQVpFX0RFQlVHX1NUUk9LRV9DT0xPUiA9IGNjLmNvbG9yKDI1NSwgMTg1LCAwLCAyNTUpO1xuY29uc3QgR1JBWkVfREVCVUdfRklMTF9DT0xPUiA9IGNjLmNvbG9yKDI1NSwgMTg1LCAwLCAyNSk7XG5cbmludGVyZmFjZSBFbmVteURhdGEge1xuICAgIG5vZGU6IGNjLk5vZGU7XG4gICAgc3BlZWQ6IG51bWJlcjtcbiAgICByYWRpdXM6IG51bWJlcjtcbiAgICBncmF6ZWQ6IGJvb2xlYW47XG4gICAgZnJhbWVzOiBjYy5TcHJpdGVGcmFtZVtdO1xuICAgIGZyYW1lSW5kZXg6IG51bWJlcjtcbiAgICBmcmFtZVRpbWVyOiBudW1iZXI7XG59XG5cbkBjY2NsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBZb3V4aUNvbnRyb2xsZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIHByaXZhdGUgX2JhY2tncm91bmQ6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX2h1ZDogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcG9wdXBMYXllcjogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGxheWVyOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9zaGllbGRGeDogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfZW5lbXlMYXllcjogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGlja3VwTGF5ZXI6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX2VuZW15VGVtcGxhdGU6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX2pveXN0aWNrOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9qb3lzdGlja0tub2I6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3NoaWVsZEJ0bjogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGF1c2VCdG46IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX2NvaW5Ob2RlOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9jb2luTm9kZUVkaXRvck9mZnNldDogY2MuVmVjMiA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcG9wdXBQYXVzZTogY2MuTm9kZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcG9wdXBSZXZpdmU6IGNjLk5vZGUgPSBudWxsO1xuICAgIHByaXZhdGUgX3BvcHVwUmVzdWx0OiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9oaXRib3hEZWJ1Z0xheWVyOiBjYy5Ob2RlID0gbnVsbDtcbiAgICBwcml2YXRlIF9oaXRib3hEZWJ1Z0dyYXBoaWNzOiBjYy5HcmFwaGljcyA9IG51bGw7XG5cbiAgICBwcml2YXRlIF90aW1lTGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBwcml2YXRlIF9zY29yZUxhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfY29pbkxhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfZW5lcmd5TGFiZWw6IGNjLkxhYmVsID0gbnVsbDtcbiAgICBwcml2YXRlIF9zaGllbGRDZExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcmV2aXZlRGlhbW9uZExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcmVzdWx0RGlhbW9uZExhYmVsOiBjYy5MYWJlbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIF9tb25zdGVyRnJhbWVzOiBjYy5TcHJpdGVGcmFtZVtdW10gPSBbXTtcbiAgICBwcml2YXRlIF9yb2xlRnJhbWVzOiB7IFtrZXk6IHN0cmluZ106IGNjLlNwcml0ZUZyYW1lIH0gPSB7fTtcbiAgICBwcml2YXRlIF9jb2luRnJhbWU6IGNjLlNwcml0ZUZyYW1lID0gbnVsbDtcbiAgICBwcml2YXRlIF9jaGFyYWN0ZXJUcmFpdHM6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBfbW9uc3RlckNvbGxpc2lvbkNvbmZpZ3M6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBfY3VycmVudFRyYWl0OiBhbnkgPSBudWxsO1xuICAgIHByaXZhdGUgX2N1cnJlbnRSb2xlSW5kZXggPSAwO1xuXG4gICAgcHJpdmF0ZSBfaW5wdXQgPSBjYy52MigwLCAwKTtcbiAgICBwcml2YXRlIF9lbGFwc2VkID0gMDtcbiAgICBwcml2YXRlIF9zY29yZSA9IDA7XG4gICAgcHJpdmF0ZSBfZGlzdGFuY2VTY29yZSA9IDA7XG4gICAgcHJpdmF0ZSBfZ3JhemVTY29yZSA9IDA7XG4gICAgcHJpdmF0ZSBfY29pbnMgPSAwO1xuICAgIHByaXZhdGUgX2VuZXJneSA9IDA7XG4gICAgcHJpdmF0ZSBfc2hpZWxkVGltZSA9IDA7XG4gICAgcHJpdmF0ZSBfZGlzdGFuY2UgPSAwO1xuICAgIHByaXZhdGUgX2VuZW15VGltZXIgPSAwO1xuICAgIHByaXZhdGUgX3BpY2t1cFRpbWVyID0gMDtcbiAgICBwcml2YXRlIF9kaWZmaWN1bHR5VGltZXIgPSAwO1xuICAgIHByaXZhdGUgX2VuZW15SW50ZXJ2YWwgPSAxLjI1O1xuICAgIHByaXZhdGUgX2VuZW15U3BlZWQgPSAxNzA7XG4gICAgcHJpdmF0ZSBfcGF1c2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZW5kZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9yZXZpdmVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9lbmVtaWVzOiBFbmVteURhdGFbXSA9IFtdO1xuICAgIHByaXZhdGUgX3BpY2t1cHM6IGNjLk5vZGVbXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBfc2hpZWxkTWF4ID0gMzA7XG4gICAgcHJpdmF0ZSBfdmlzaWJsZVdpZHRoID0gMTI4MDtcbiAgICBwcml2YXRlIF92aXNpYmxlSGVpZ2h0ID0gNzIwO1xuICAgIHByaXZhdGUgX2hhbGZWaXNpYmxlV2lkdGggPSA2NDA7XG4gICAgcHJpdmF0ZSBfaGFsZlZpc2libGVIZWlnaHQgPSAzNjA7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMuX2JpbmRTY2VuZU5vZGVzKCk7XG4gICAgICAgIHRoaXMuX2ZpdEJhY2tncm91bmQoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoKCkgPT4gdGhpcy5fZml0QmFja2dyb3VuZCgpLCAwKTtcbiAgICAgICAgdGhpcy5fbG9hZFJ1bnRpbWVBc3NldHMoKTtcbiAgICAgICAgdGhpcy5fYmluZEpveXN0aWNrKCk7XG4gICAgICAgIHRoaXMuX2JpbmRCdXR0b25zKCk7XG4gICAgICAgIHRoaXMuX3JlZnJlc2hIdWQoKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSGl0Ym94RGVidWdMYXllcigpO1xuICAgICAgICB0aGlzLl9kcmF3SGl0Ym94RGVidWcoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoZHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9zeW5jVmlzaWJsZUxheW91dCgpO1xuICAgICAgICBpZiAodGhpcy5fcGF1c2VkIHx8IHRoaXMuX2VuZGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmF3SGl0Ym94RGVidWcoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2VsYXBzZWQgKz0gZHQ7XG4gICAgICAgIHRoaXMuX2RpZmZpY3VsdHlUaW1lciArPSBkdDtcbiAgICAgICAgaWYgKHRoaXMuX2RpZmZpY3VsdHlUaW1lciA+PSA4KSB7XG4gICAgICAgICAgICB0aGlzLl9kaWZmaWN1bHR5VGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5fZW5lbXlTcGVlZCArPSAxMjtcbiAgICAgICAgICAgIHRoaXMuX2VuZW15SW50ZXJ2YWwgPSBNYXRoLm1heCgwLjUyLCB0aGlzLl9lbmVteUludGVydmFsIC0gMC4wNik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kaXN0YW5jZSArPSB0aGlzLl9lbmVteVNwZWVkICogZHQ7XG4gICAgICAgIHRoaXMuX2Rpc3RhbmNlU2NvcmUgPSBNYXRoLmZsb29yKHRoaXMuX2Rpc3RhbmNlIC8gMTApO1xuICAgICAgICB0aGlzLl9zY29yZSA9IHRoaXMuX2Rpc3RhbmNlU2NvcmUgKyB0aGlzLl9ncmF6ZVNjb3JlO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVBsYXllcihkdCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNoaWVsZChkdCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUVuZW15QW5pbWF0aW9ucyhkdCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUVuZW1pZXMoZHQpO1xuICAgICAgICB0aGlzLl91cGRhdGVQaWNrdXBzKGR0KTtcbiAgICAgICAgdGhpcy5fc3Bhd25UaW1lcnMoZHQpO1xuICAgICAgICB0aGlzLl9yZWZyZXNoSHVkKCk7XG4gICAgICAgIHRoaXMuX2RyYXdIaXRib3hEZWJ1ZygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2JpbmRTY2VuZU5vZGVzKCkge1xuICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kID0gY2MuZmluZCgnQmFja2dyb3VuZCcsIHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuX2h1ZCA9IGNjLmZpbmQoJ0hVRCcsIHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuX3BvcHVwTGF5ZXIgPSBjYy5maW5kKCdQb3B1cExheWVyJywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fZW5lbXlMYXllciA9IGNjLmZpbmQoJ0VuZW15TGF5ZXInLCB0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLl9waWNrdXBMYXllciA9IGNjLmZpbmQoJ1BpY2t1cExheWVyJywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fZW5lbXlUZW1wbGF0ZSA9IGNjLmZpbmQoJ0VuZW15TGF5ZXIvRW5lbXlUZW1wbGF0ZScsIHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuX3BsYXllciA9IGNjLmZpbmQoJ1BsYXllcicsIHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuX3NoaWVsZEZ4ID0gY2MuZmluZCgnUGxheWVyL1NoaWVsZEZ4JywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fam95c3RpY2sgPSBjYy5maW5kKCdIVUQvSm95c3RpY2snLCB0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLl9qb3lzdGlja0tub2IgPSBjYy5maW5kKCdIVUQvSm95c3RpY2svSm95c3RpY2tLbm9iJywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fc2hpZWxkQnRuID0gY2MuZmluZCgnSFVEL1NoaWVsZEJ1dHRvbicsIHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuX3BhdXNlQnRuID0gY2MuZmluZCgnSFVEL1BhdXNlQnV0dG9uJywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fY29pbk5vZGUgPSBjYy5maW5kKCdIVUQvQ29pbk5vZGUnLCB0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLl9wb3B1cFBhdXNlID0gY2MuZmluZCgnUG9wdXBMYXllci9Qb3B1cFBhdXNlJywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fcG9wdXBSZXZpdmUgPSBjYy5maW5kKCdQb3B1cExheWVyL1BvcHVwUmV2aXZlJywgdGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5fcG9wdXBSZXN1bHQgPSBjYy5maW5kKCdQb3B1cExheWVyL1BvcHVwUmVzdWx0JywgdGhpcy5ub2RlKTtcblxuICAgICAgICB0aGlzLl90aW1lTGFiZWwgPSB0aGlzLl9sYWJlbCgnSFVEL1RpbWVySWNvbi9UaW1lTGFiZWwnKTtcbiAgICAgICAgdGhpcy5fc2NvcmVMYWJlbCA9IHRoaXMuX2xhYmVsKCdIVUQvU2NvcmVMYWJlbCcpO1xuICAgICAgICB0aGlzLl9jb2luTGFiZWwgPSB0aGlzLl9sYWJlbCgnSFVEL0NvaW5Ob2RlL0NvaW5MYWJlbCcpO1xuICAgICAgICB0aGlzLl9lbmVyZ3lMYWJlbCA9IHRoaXMuX2xhYmVsKCdIVUQvRW5lcmd5TGFiZWwnKTtcbiAgICAgICAgdGhpcy5fc2hpZWxkQ2RMYWJlbCA9IHRoaXMuX2xhYmVsKCdIVUQvU2hpZWxkQ2RMYWJlbCcpO1xuICAgICAgICB0aGlzLl9yZXZpdmVEaWFtb25kTGFiZWwgPSB0aGlzLl9sYWJlbCgnUG9wdXBMYXllci9Qb3B1cFJldml2ZS9EaWFtb25kTGFiZWwnKTtcbiAgICAgICAgdGhpcy5fcmVzdWx0RGlhbW9uZExhYmVsID0gdGhpcy5fbGFiZWwoJ1BvcHVwTGF5ZXIvUG9wdXBSZXN1bHQvRGlhbW9uZExhYmVsJyk7XG5cbiAgICAgICAgY29uc3QgdGltZXJJY29uID0gY2MuZmluZCgnSFVEL1RpbWVySWNvbicsIHRoaXMubm9kZSk7XG4gICAgICAgIGlmICh0aGlzLl9jb2luTm9kZSAmJiB0aW1lckljb24pIHtcbiAgICAgICAgICAgIHRoaXMuX2NvaW5Ob2RlRWRpdG9yT2Zmc2V0ID0gdGhpcy5fY29pbk5vZGUucG9zaXRpb24uc3ViKHRpbWVySWNvbi5wb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobUdhbWVEYXRhLkdldEdvbGREYXRhKSBtR2FtZURhdGEuR2V0R29sZERhdGEoKTtcbiAgICAgICAgaWYgKHRoaXMuX2NvaW5Ob2RlKSB0aGlzLl9jb2luTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fY29pbkxhYmVsICYmIHRoaXMuX2NvaW5MYWJlbC5ub2RlKSB0aGlzLl9jb2luTGFiZWwubm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fc2hpZWxkQ2RMYWJlbCAmJiB0aGlzLl9zaGllbGRDZExhYmVsLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NoaWVsZENkTGFiZWwuc3RyaW5nID0gJyc7XG4gICAgICAgICAgICB0aGlzLl9zaGllbGRDZExhYmVsLm5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZEZ4KSB0aGlzLl9zaGllbGRGeC5vcGFjaXR5ID0gMDtcbiAgICAgICAgaWYgKHRoaXMuX2VuZW15VGVtcGxhdGUpIHRoaXMuX2VuZW15VGVtcGxhdGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9wb3B1cFBhdXNlKSB0aGlzLl9wb3B1cFBhdXNlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5fcG9wdXBSZXZpdmUpIHRoaXMuX3BvcHVwUmV2aXZlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5fcG9wdXBSZXN1bHQpIHRoaXMuX3BvcHVwUmVzdWx0LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUhpdGJveERlYnVnTGF5ZXIoKSB7XG4gICAgICAgIGlmICghU0hPV19ISVRCT1hfREVCVUcgfHwgdGhpcy5faGl0Ym94RGVidWdMYXllcikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX2hpdGJveERlYnVnTGF5ZXIgPSBuZXcgY2MuTm9kZSgnSGl0Ym94RGVidWdMYXllcicpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQodGhpcy5faGl0Ym94RGVidWdMYXllcik7XG4gICAgICAgIHRoaXMuX2hpdGJveERlYnVnTGF5ZXIuekluZGV4ID0gNTA7XG4gICAgICAgIGlmICh0aGlzLl9wb3B1cExheWVyKSB0aGlzLl9wb3B1cExheWVyLnpJbmRleCA9IDEwMDtcbiAgICAgICAgdGhpcy5faGl0Ym94RGVidWdMYXllci5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgdGhpcy5faGl0Ym94RGVidWdMYXllci5zZXRDb250ZW50U2l6ZSh0aGlzLl92aXNpYmxlV2lkdGgsIHRoaXMuX3Zpc2libGVIZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuX2hpdGJveERlYnVnR3JhcGhpY3MgPSB0aGlzLl9oaXRib3hEZWJ1Z0xheWVyLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIHRoaXMuX2hpdGJveERlYnVnR3JhcGhpY3MubGluZVdpZHRoID0gSElUQk9YX0RFQlVHX0xJTkVfV0lEVEg7XG4gICAgICAgIHRoaXMuX2hpdGJveERlYnVnR3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBISVRCT1hfREVCVUdfU1RST0tFX0NPTE9SO1xuICAgICAgICB0aGlzLl9oaXRib3hEZWJ1Z0dyYXBoaWNzLmZpbGxDb2xvciA9IEhJVEJPWF9ERUJVR19GSUxMX0NPTE9SO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2xhYmVsKHBhdGg6IHN0cmluZyk6IGNjLkxhYmVsIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNjLmZpbmQocGF0aCwgdGhpcy5ub2RlKTtcbiAgICAgICAgcmV0dXJuIG5vZGUgPyBub2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkgOiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2xvYWRSdW50aW1lQXNzZXRzKCkge1xuICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcignenpJbWcyJywgY2MuU3ByaXRlRnJhbWUsIChlcnI6IGFueSwgZnJhbWVzOiBjYy5TcHJpdGVGcmFtZVtdKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVyciAmJiBmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBmcmFtZXMuZm9yRWFjaCgoZnJhbWU6IGNjLlNwcml0ZUZyYW1lKSA9PiB0aGlzLl9yb2xlRnJhbWVzW2ZyYW1lLm5hbWVdID0gZnJhbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U2VsZWN0ZWRSb2xlU3ByaXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKCd6ekltZy96dWFuc2hpJywgY2MuU3ByaXRlRnJhbWUsIChlcnI6IGFueSwgZnJhbWU6IGNjLlNwcml0ZUZyYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVyciAmJiBmcmFtZSkgdGhpcy5fY29pbkZyYW1lID0gZnJhbWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNjLmxvYWRlci5sb2FkUmVzKCdjb25maWcvY2hhcmFjdGVyVHJhaXRzJywgY2MuSnNvbkFzc2V0LCAoZXJyOiBhbnksIGpzb246IGNjLkpzb25Bc3NldCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcnIgJiYganNvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNmZyA9IGpzb24uanNvbiB8fCB7fTtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjZmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYXJhY3RlclRyYWl0cyA9IGNmZy5maWx0ZXIoKGl0ZW06IGFueSkgPT4gIWl0ZW0gfHwgaXRlbS5lbmFibGVkICE9PSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vbnN0ZXJDb2xsaXNpb25Db25maWdzID0gW107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhcmFjdGVyVHJhaXRzID0gKGNmZy5jaGFyYWN0ZXJzIHx8IFtdKS5maWx0ZXIoKGl0ZW06IGFueSkgPT4gIWl0ZW0gfHwgaXRlbS5lbmFibGVkICE9PSBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vbnN0ZXJDb2xsaXNpb25Db25maWdzID0gKGNmZy5tb25zdGVycyB8fCBbXSkuZmlsdGVyKChpdGVtOiBhbnkpID0+ICFpdGVtIHx8IGl0ZW0uZW5hYmxlZCAhPT0gZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseVNlbGVjdGVkUm9sZVRyYWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbW9uc3RlckluZGV4ID0gaSAtIDE7XG4gICAgICAgICAgICBjYy5sb2FkZXIubG9hZFJlc0RpcihgQW5pbTIvbWFzdGVyJHtpfWAsIGNjLlNwcml0ZUZyYW1lLCAoZXJyOiBhbnksIGZyYW1lczogY2MuU3ByaXRlRnJhbWVbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgfHwgIWZyYW1lcyB8fCBmcmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9uc3RlckZyYW1lc1ttb25zdGVySW5kZXhdID0gZnJhbWVzLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9lbmVteVRlbXBsYXRlICYmIG1vbnN0ZXJJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRNb25zdGVyU3ByaXRlRnJhbWUodGhpcy5fZW5lbXlUZW1wbGF0ZSwgdGhpcy5fbW9uc3RlckZyYW1lc1ttb25zdGVySW5kZXhdWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2FwcGx5U2VsZWN0ZWRSb2xlU3ByaXRlKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3BsYXllcikgcmV0dXJuO1xuICAgICAgICBpZiAobUdhbWVEYXRhLkdldEN1cnJlbnRSb2xlRGF0YSkgbUdhbWVEYXRhLkdldEN1cnJlbnRSb2xlRGF0YSgpO1xuICAgICAgICB0aGlzLl9jdXJyZW50Um9sZUluZGV4ID0gY2MubWlzYy5jbGFtcGYoTnVtYmVyKG1HYW1lRGF0YS5jdXJyZW50Um9sZSkgfHwgMCwgMCwgNCk7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gdGhpcy5fcm9sZUZyYW1lc1tTdHJpbmcodGhpcy5fY3VycmVudFJvbGVJbmRleCArIDEpXSB8fCB0aGlzLl9yb2xlRnJhbWVzWycxJ107XG4gICAgICAgIGlmIChmcmFtZSkgdGhpcy5fc2V0U3ByaXRlRnJhbWUodGhpcy5fcGxheWVyLCBmcmFtZSk7XG4gICAgICAgIHRoaXMuX2FwcGx5U2VsZWN0ZWRSb2xlVHJhaXQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBseVNlbGVjdGVkUm9sZVRyYWl0KCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NoYXJhY3RlclRyYWl0cyB8fCB0aGlzLl9jaGFyYWN0ZXJUcmFpdHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2N1cnJlbnRUcmFpdCA9IHRoaXMuX2NoYXJhY3RlclRyYWl0cy5maW5kKChjZmc6IGFueSkgPT4gTnVtYmVyKGNmZy5yb2xlX2luZGV4KSA9PT0gdGhpcy5fY3VycmVudFJvbGVJbmRleClcbiAgICAgICAgICAgIHx8IHRoaXMuX2NoYXJhY3RlclRyYWl0c1swXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRTcHJpdGVGcmFtZShub2RlOiBjYy5Ob2RlLCBmcmFtZTogY2MuU3ByaXRlRnJhbWUpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFmcmFtZSkgcmV0dXJuO1xuICAgICAgICBsZXQgc3ByaXRlID0gbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHNwcml0ZSA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IGZyYW1lO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldE1vbnN0ZXJTcHJpdGVGcmFtZShub2RlOiBjYy5Ob2RlLCBmcmFtZTogY2MuU3ByaXRlRnJhbWUpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFmcmFtZSkgcmV0dXJuO1xuICAgICAgICBsZXQgc3ByaXRlID0gbm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHNwcml0ZSA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IGZyYW1lO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSBmcmFtZS5nZXRPcmlnaW5hbFNpemUgPyBmcmFtZS5nZXRPcmlnaW5hbFNpemUoKSA6IG51bGw7XG4gICAgICAgIGNvbnN0IHJlY3QgPSAhc2l6ZSAmJiBmcmFtZS5nZXRSZWN0ID8gZnJhbWUuZ2V0UmVjdCgpIDogbnVsbDtcbiAgICAgICAgaWYgKHNpemUpIHtcbiAgICAgICAgICAgIG5vZGUuc2V0Q29udGVudFNpemUoc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgIG5vZGUuc2V0Q29udGVudFNpemUocmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuc2NhbGUgPSBNT05TVEVSX0RJU1BMQVlfU0NBTEU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZml0QmFja2dyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5fc3luY1Zpc2libGVMYXlvdXQodHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3luY1Zpc2libGVMYXlvdXQoZm9yY2U6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBjb25zdCBjYW52YXNTaXplID0gdGhpcy5ub2RlLmdldENvbnRlbnRTaXplKCk7XG4gICAgICAgIGNvbnN0IHZpZXdTaXplID0gY2MudmlldyAmJiBjYy52aWV3LmdldFZpc2libGVTaXplID8gY2Mudmlldy5nZXRWaXNpYmxlU2l6ZSgpIDogbnVsbDtcbiAgICAgICAgY29uc3QgYWN0aXZlU2l6ZSA9IHRoaXMuX3BpY2tBY3RpdmVWaXNpYmxlU2l6ZShjYW52YXNTaXplLCB2aWV3U2l6ZSk7XG4gICAgICAgIGlmICghZm9yY2VcbiAgICAgICAgICAgICYmIE1hdGguYWJzKGFjdGl2ZVNpemUud2lkdGggLSB0aGlzLl92aXNpYmxlV2lkdGgpIDwgMVxuICAgICAgICAgICAgJiYgTWF0aC5hYnMoYWN0aXZlU2l6ZS5oZWlnaHQgLSB0aGlzLl92aXNpYmxlSGVpZ2h0KSA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Zpc2libGVXaWR0aCA9IGFjdGl2ZVNpemUud2lkdGg7XG4gICAgICAgIHRoaXMuX3Zpc2libGVIZWlnaHQgPSBhY3RpdmVTaXplLmhlaWdodDtcbiAgICAgICAgdGhpcy5faGFsZlZpc2libGVXaWR0aCA9IHRoaXMuX3Zpc2libGVXaWR0aCAqIDAuNTtcbiAgICAgICAgdGhpcy5faGFsZlZpc2libGVIZWlnaHQgPSB0aGlzLl92aXNpYmxlSGVpZ2h0ICogMC41O1xuXG4gICAgICAgIGlmICh0aGlzLl9odWQpIHRoaXMuX2h1ZC5zZXRDb250ZW50U2l6ZSh0aGlzLl92aXNpYmxlV2lkdGgsIHRoaXMuX3Zpc2libGVIZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5fcG9wdXBMYXllcikgdGhpcy5fcG9wdXBMYXllci5zZXRDb250ZW50U2l6ZSh0aGlzLl92aXNpYmxlV2lkdGgsIHRoaXMuX3Zpc2libGVIZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5fZW5lbXlMYXllcikgdGhpcy5fZW5lbXlMYXllci5zZXRDb250ZW50U2l6ZSh0aGlzLl92aXNpYmxlV2lkdGgsIHRoaXMuX3Zpc2libGVIZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5fcGlja3VwTGF5ZXIpIHRoaXMuX3BpY2t1cExheWVyLnNldENvbnRlbnRTaXplKHRoaXMuX3Zpc2libGVXaWR0aCwgdGhpcy5fdmlzaWJsZUhlaWdodCk7XG4gICAgICAgIGlmICh0aGlzLl9oaXRib3hEZWJ1Z0xheWVyKSB0aGlzLl9oaXRib3hEZWJ1Z0xheWVyLnNldENvbnRlbnRTaXplKHRoaXMuX3Zpc2libGVXaWR0aCwgdGhpcy5fdmlzaWJsZUhlaWdodCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2JhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuX2JhY2tncm91bmQuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgICAgICBjb25zdCBkZXNpZ25SYXRpbyA9IDEyODAgLyA3MjA7XG4gICAgICAgICAgICBjb25zdCBjYW52YXNSYXRpbyA9IHRoaXMuX3Zpc2libGVXaWR0aCAvIHRoaXMuX3Zpc2libGVIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoY2FudmFzUmF0aW8gPj0gZGVzaWduUmF0aW8pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kLnNldENvbnRlbnRTaXplKHRoaXMuX3Zpc2libGVXaWR0aCwgdGhpcy5fdmlzaWJsZVdpZHRoIC8gZGVzaWduUmF0aW8pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kLnNldENvbnRlbnRTaXplKHRoaXMuX3Zpc2libGVIZWlnaHQgKiBkZXNpZ25SYXRpbywgdGhpcy5fdmlzaWJsZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsZWZ0WCA9IC10aGlzLl9oYWxmVmlzaWJsZVdpZHRoO1xuICAgICAgICBjb25zdCByaWdodFggPSB0aGlzLl9oYWxmVmlzaWJsZVdpZHRoO1xuICAgICAgICBjb25zdCB0b3BZID0gdGhpcy5faGFsZlZpc2libGVIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGJvdHRvbVkgPSAtdGhpcy5faGFsZlZpc2libGVIZWlnaHQ7XG5cbiAgICAgICAgY29uc3QgdGltZXJJY29uID0gY2MuZmluZCgnSFVEL1RpbWVySWNvbicsIHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuX3NldE5vZGVQb3NpdGlvbih0aW1lckljb24sIGxlZnRYICsgMTE3LCB0b3BZIC0gNjYpO1xuICAgICAgICBpZiAodGhpcy5fc2NvcmVMYWJlbCAmJiB0aGlzLl9zY29yZUxhYmVsLm5vZGUpIHRoaXMuX3Njb3JlTGFiZWwubm9kZS5zZXRQb3NpdGlvbigwLCB0b3BZIC0gNjcpO1xuICAgICAgICBpZiAodGhpcy5fY29pbk5vZGUgJiYgdGltZXJJY29uICYmIHRoaXMuX2NvaW5Ob2RlRWRpdG9yT2Zmc2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9jb2luTm9kZS5zZXRQb3NpdGlvbih0aW1lckljb24ueCArIHRoaXMuX2NvaW5Ob2RlRWRpdG9yT2Zmc2V0LngsIHRpbWVySWNvbi55ICsgdGhpcy5fY29pbk5vZGVFZGl0b3JPZmZzZXQueSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0Tm9kZVBvc2l0aW9uKHRoaXMuX3BhdXNlQnRuLCByaWdodFggLSA4NiwgdG9wWSAtIDY4KTtcbiAgICAgICAgdGhpcy5fc2V0Tm9kZVBvc2l0aW9uKHRoaXMuX2pveXN0aWNrLCBsZWZ0WCArIDE0NCwgYm90dG9tWSArIDEwNik7XG4gICAgICAgIHRoaXMuX3NldE5vZGVQb3NpdGlvbih0aGlzLl9zaGllbGRCdG4sIHJpZ2h0WCAtIDIyNCwgYm90dG9tWSArIDEwNik7XG4gICAgICAgIGlmICh0aGlzLl9lbmVyZ3lMYWJlbCAmJiB0aGlzLl9lbmVyZ3lMYWJlbC5ub2RlKSB0aGlzLl9lbmVyZ3lMYWJlbC5ub2RlLnNldFBvc2l0aW9uKHJpZ2h0WCAtIDIyNCwgYm90dG9tWSArIDE3MCk7XG4gICAgICAgIGlmICh0aGlzLl9zaGllbGRDZExhYmVsICYmIHRoaXMuX3NoaWVsZENkTGFiZWwubm9kZSkgdGhpcy5fc2hpZWxkQ2RMYWJlbC5ub2RlLnNldFBvc2l0aW9uKHJpZ2h0WCAtIDIxNCwgYm90dG9tWSArIDEwOCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGlja0FjdGl2ZVZpc2libGVTaXplKGNhbnZhc1NpemU6IGNjLlNpemUsIHZpZXdTaXplOiBjYy5TaXplIHwgbnVsbCk6IGNjLlNpemUge1xuICAgICAgICBpZiAoIXZpZXdTaXplKSByZXR1cm4gY2FudmFzU2l6ZTtcbiAgICAgICAgY29uc3QgY2FudmFzUmF0aW8gPSBjYW52YXNTaXplLmhlaWdodCA+IDAgPyBjYW52YXNTaXplLndpZHRoIC8gY2FudmFzU2l6ZS5oZWlnaHQgOiAwO1xuICAgICAgICBjb25zdCB2aWV3UmF0aW8gPSB2aWV3U2l6ZS5oZWlnaHQgPiAwID8gdmlld1NpemUud2lkdGggLyB2aWV3U2l6ZS5oZWlnaHQgOiAwO1xuICAgICAgICBpZiAodmlld1NpemUud2lkdGggPiAwICYmIHZpZXdTaXplLmhlaWdodCA+IDAgJiYgdmlld1JhdGlvID4gY2FudmFzUmF0aW8gKyAwLjAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlld1NpemU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbnZhc1NpemU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0Tm9kZVBvc2l0aW9uKG5vZGU6IGNjLk5vZGUsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGlmIChub2RlKSBub2RlLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2RyYXdIaXRib3hEZWJ1ZygpIHtcbiAgICAgICAgaWYgKCFTSE9XX0hJVEJPWF9ERUJVRyB8fCAhdGhpcy5faGl0Ym94RGVidWdHcmFwaGljcykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGcgPSB0aGlzLl9oaXRib3hEZWJ1Z0dyYXBoaWNzO1xuICAgICAgICBnLmNsZWFyKCk7XG4gICAgICAgIGcubGluZVdpZHRoID0gSElUQk9YX0RFQlVHX0xJTkVfV0lEVEg7XG4gICAgICAgIGcuc3Ryb2tlQ29sb3IgPSBISVRCT1hfREVCVUdfU1RST0tFX0NPTE9SO1xuICAgICAgICBnLmZpbGxDb2xvciA9IEhJVEJPWF9ERUJVR19GSUxMX0NPTE9SO1xuXG4gICAgICAgIGlmICh0aGlzLl9wbGF5ZXIgJiYgdGhpcy5fcGxheWVyLmFjdGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgcCA9IHRoaXMuX25vZGVQb3NpdGlvbkluSGl0Ym94TGF5ZXIodGhpcy5fcGxheWVyKTtcbiAgICAgICAgICAgIGcubGluZVdpZHRoID0gR1JBWkVfREVCVUdfTElORV9XSURUSDtcbiAgICAgICAgICAgIGcuc3Ryb2tlQ29sb3IgPSBHUkFaRV9ERUJVR19TVFJPS0VfQ09MT1I7XG4gICAgICAgICAgICBnLmZpbGxDb2xvciA9IEdSQVpFX0RFQlVHX0ZJTExfQ09MT1I7XG4gICAgICAgICAgICBnLmNpcmNsZShwLngsIHAueSwgdGhpcy5fZ2V0UGxheWVyR3JhemVSYWRpdXMoKSk7XG4gICAgICAgICAgICBnLmZpbGwoKTtcbiAgICAgICAgICAgIGcuc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgIGcubGluZVdpZHRoID0gSElUQk9YX0RFQlVHX0xJTkVfV0lEVEg7XG4gICAgICAgICAgICBnLnN0cm9rZUNvbG9yID0gSElUQk9YX0RFQlVHX1NUUk9LRV9DT0xPUjtcbiAgICAgICAgICAgIGcuZmlsbENvbG9yID0gSElUQk9YX0RFQlVHX0ZJTExfQ09MT1I7XG4gICAgICAgICAgICBnLmNpcmNsZShwLngsIHAueSwgdGhpcy5fZ2V0UGxheWVyQ29sbGlzaW9uUmFkaXVzKCkpO1xuICAgICAgICAgICAgZy5maWxsKCk7XG4gICAgICAgICAgICBnLnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZy5saW5lV2lkdGggPSBISVRCT1hfREVCVUdfTElORV9XSURUSDtcbiAgICAgICAgZy5zdHJva2VDb2xvciA9IEhJVEJPWF9ERUJVR19TVFJPS0VfQ09MT1I7XG4gICAgICAgIGcuZmlsbENvbG9yID0gSElUQk9YX0RFQlVHX0ZJTExfQ09MT1I7XG4gICAgICAgIGZvciAoY29uc3QgZW5lbXkgb2YgdGhpcy5fZW5lbWllcykge1xuICAgICAgICAgICAgaWYgKCFlbmVteSB8fCAhZW5lbXkubm9kZSB8fCAhZW5lbXkubm9kZS5pc1ZhbGlkIHx8ICFlbmVteS5ub2RlLmFjdGl2ZSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBwID0gdGhpcy5fbm9kZVBvc2l0aW9uSW5IaXRib3hMYXllcihlbmVteS5ub2RlKTtcbiAgICAgICAgICAgIGcuY2lyY2xlKHAueCwgcC55LCBlbmVteS5yYWRpdXMpO1xuICAgICAgICAgICAgZy5maWxsKCk7XG4gICAgICAgICAgICBnLnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbm9kZVBvc2l0aW9uSW5IaXRib3hMYXllcihub2RlOiBjYy5Ob2RlKTogY2MuVmVjMiB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhdGhpcy5faGl0Ym94RGVidWdMYXllcikgcmV0dXJuIGNjLnYyKDAsIDApO1xuICAgICAgICBjb25zdCB3b3JsZCA9IG5vZGUuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLnYyKDAsIDApKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpdGJveERlYnVnTGF5ZXIuY29udmVydFRvTm9kZVNwYWNlQVIod29ybGQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JhbmRvbUdhbWVwbGF5WSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBtaW5ZID0gLXRoaXMuX2hhbGZWaXNpYmxlSGVpZ2h0ICsgMTIwO1xuICAgICAgICBjb25zdCBtYXhZID0gdGhpcy5faGFsZlZpc2libGVIZWlnaHQgLSAxMjA7XG4gICAgICAgIGlmIChtaW5ZID49IG1heFkpIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gY2MubWlzYy5sZXJwKG1pblksIG1heFksIE1hdGgucmFuZG9tKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JpZ2h0U3Bhd25YKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYWxmVmlzaWJsZVdpZHRoICsgNzA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbGVmdERlc3Bhd25YKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAtdGhpcy5faGFsZlZpc2libGVXaWR0aCAtIDkwO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3BsYXllck1pblgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIC10aGlzLl9oYWxmVmlzaWJsZVdpZHRoICsgNzA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGxheWVyTWF4WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFsZlZpc2libGVXaWR0aCAtIDcwO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3BsYXllck1pblkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIC10aGlzLl9oYWxmVmlzaWJsZUhlaWdodCArIDkwO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3BsYXllck1heFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbGZWaXNpYmxlSGVpZ2h0IC0gOTU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYmluZEpveXN0aWNrKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2pveXN0aWNrIHx8ICF0aGlzLl9qb3lzdGlja0tub2IpIHJldHVybjtcblxuICAgICAgICBjb25zdCB1cGRhdGVJbnB1dCA9IChldmVudDogY2MuRXZlbnQuRXZlbnRUb3VjaCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9jYWwgPSB0aGlzLl9qb3lzdGljay5jb252ZXJ0VG9Ob2RlU3BhY2VBUihldmVudC5nZXRMb2NhdGlvbigpKTtcbiAgICAgICAgICAgIGxldCB2ID0gY2MudjIobG9jYWwueCwgbG9jYWwueSk7XG4gICAgICAgICAgICBjb25zdCByYWRpdXMgPSA3MDtcbiAgICAgICAgICAgIGlmICh2Lm1hZygpID4gcmFkaXVzKSB2ID0gdi5ub3JtYWxpemUoKS5tdWwocmFkaXVzKTtcbiAgICAgICAgICAgIHRoaXMuX2pveXN0aWNrS25vYi5zZXRQb3NpdGlvbih2KTtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0ID0gdi5tYWcoKSA+IDQgPyB2Lm5vcm1hbGl6ZSgpIDogY2MudjIoMCwgMCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc2V0ID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faW5wdXQgPSBjYy52MigwLCAwKTtcbiAgICAgICAgICAgIHRoaXMuX2pveXN0aWNrS25vYi5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9qb3lzdGljay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgdXBkYXRlSW5wdXQsIHRoaXMpO1xuICAgICAgICB0aGlzLl9qb3lzdGljay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9NT1ZFLCB1cGRhdGVJbnB1dCwgdGhpcyk7XG4gICAgICAgIHRoaXMuX2pveXN0aWNrLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgcmVzZXQsIHRoaXMpO1xuICAgICAgICB0aGlzLl9qb3lzdGljay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9DQU5DRUwsIHJlc2V0LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9iaW5kQnV0dG9ucygpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZEJ0bikge1xuICAgICAgICAgICAgdGhpcy5fc2hpZWxkQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5fYWN0aXZhdGVTaGllbGQsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9wYXVzZUJ0bikge1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCB0aGlzLl9zaG93UGF1c2UsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2JpbmRQb3B1cCh0aGlzLl9wb3B1cFBhdXNlLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9wb3B1cFBhdXNlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH0sICgpID0+IHRoaXMuX2V4aXRUb1N0YXJ0KCkpO1xuICAgICAgICB0aGlzLl9iaW5kUG9wdXAodGhpcy5fcG9wdXBSZXZpdmUsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3BvcHVwUmV2aXZlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fc2hpZWxkVGltZSA9IDM7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcG9wdXBSZXZpdmUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9nYW1lT3ZlcigpO1xuICAgICAgICAgICAgdGhpcy5fZXhpdFRvU3RhcnQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2JpbmRQb3B1cCh0aGlzLl9wb3B1cFJlc3VsdCwgKCkgPT4gdGhpcy5fcmVzdGFydCgpLCAoKSA9PiB0aGlzLl9leGl0VG9TdGFydCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9iaW5kUG9wdXAocGFuZWw6IGNjLk5vZGUsIHByaW1hcnk6ICgpID0+IHZvaWQsIHNlY29uZGFyeTogKCkgPT4gdm9pZCkge1xuICAgICAgICBpZiAoIXBhbmVsKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHByaW1hcnlCdG4gPSBwYW5lbC5nZXRDaGlsZEJ5TmFtZSgnUHJpbWFyeScpO1xuICAgICAgICBjb25zdCBzZWNvbmRhcnlCdG4gPSBwYW5lbC5nZXRDaGlsZEJ5TmFtZSgnU2Vjb25kYXJ5Jyk7XG4gICAgICAgIGlmIChwcmltYXJ5QnRuKSBwcmltYXJ5QnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgcHJpbWFyeSwgdGhpcyk7XG4gICAgICAgIGlmIChzZWNvbmRhcnlCdG4pIHNlY29uZGFyeUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIHNlY29uZGFyeSwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlUGxheWVyKGR0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9wbGF5ZXIpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc3BlZWQgPSAyODUgKiB0aGlzLl9nZXRUcmFpdE51bWJlcignc3BlZWRfbXVsdGlwbGllcicsIDEpO1xuICAgICAgICBjb25zdCB4ID0gY2MubWlzYy5jbGFtcGYodGhpcy5fcGxheWVyLnggKyB0aGlzLl9pbnB1dC54ICogc3BlZWQgKiBkdCwgdGhpcy5fcGxheWVyTWluWCgpLCB0aGlzLl9wbGF5ZXJNYXhYKCkpO1xuICAgICAgICBjb25zdCB5ID0gY2MubWlzYy5jbGFtcGYodGhpcy5fcGxheWVyLnkgKyB0aGlzLl9pbnB1dC55ICogc3BlZWQgKiBkdCwgdGhpcy5fcGxheWVyTWluWSgpLCB0aGlzLl9wbGF5ZXJNYXhZKCkpO1xuICAgICAgICB0aGlzLl9wbGF5ZXIuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2hpZWxkKGR0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZFRpbWUgPD0gMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9zaGllbGRUaW1lID0gTWF0aC5tYXgoMCwgdGhpcy5fc2hpZWxkVGltZSAtIGR0KTtcbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZEZ4KSB7XG4gICAgICAgICAgICB0aGlzLl9zaGllbGRGeC5vcGFjaXR5ID0gdGhpcy5fc2hpZWxkVGltZSA+IDBcbiAgICAgICAgICAgICAgICA/IDE1MCArIE1hdGguc2luKERhdGUubm93KCkgLyA4MCkgKiA3MFxuICAgICAgICAgICAgICAgIDogMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fc2hpZWxkQ2RMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5fc2hpZWxkQ2RMYWJlbC5zdHJpbmcgPSAnJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUVuZW15QW5pbWF0aW9ucyhkdDogbnVtYmVyKSB7XG4gICAgICAgIGZvciAoY29uc3QgZW5lbXkgb2YgdGhpcy5fZW5lbWllcykge1xuICAgICAgICAgICAgaWYgKCFlbmVteS5mcmFtZXMgfHwgZW5lbXkuZnJhbWVzLmxlbmd0aCA8PSAxKSBjb250aW51ZTtcbiAgICAgICAgICAgIGVuZW15LmZyYW1lVGltZXIgKz0gZHQ7XG4gICAgICAgICAgICBpZiAoZW5lbXkuZnJhbWVUaW1lciA8IDAuMDgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgZW5lbXkuZnJhbWVUaW1lciA9IDA7XG4gICAgICAgICAgICBlbmVteS5mcmFtZUluZGV4ID0gKGVuZW15LmZyYW1lSW5kZXggKyAxKSAlIGVuZW15LmZyYW1lcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLl9zZXRNb25zdGVyU3ByaXRlRnJhbWUoZW5lbXkubm9kZSwgZW5lbXkuZnJhbWVzW2VuZW15LmZyYW1lSW5kZXhdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUVuZW1pZXMoZHQ6IG51bWJlcikge1xuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZW5lbWllcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgZW5lbXkgPSB0aGlzLl9lbmVtaWVzW2ldO1xuICAgICAgICAgICAgZW5lbXkubm9kZS54IC09IGVuZW15LnNwZWVkICogZHQ7XG4gICAgICAgICAgICBlbmVteS5ub2RlLnkgKz0gTWF0aC5zaW4oRGF0ZS5ub3coKSAvIDI1MCArIGkpICogMTAgKiBkdDtcblxuICAgICAgICAgICAgY29uc3QgZGlzdCA9IGVuZW15Lm5vZGUucG9zaXRpb24uc3ViKHRoaXMuX3BsYXllci5wb3NpdGlvbikubWFnKCk7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJSYWRpdXMgPSB0aGlzLl9nZXRQbGF5ZXJDb2xsaXNpb25SYWRpdXMoKTtcbiAgICAgICAgICAgIGNvbnN0IGdyYXplUmFkaXVzID0gdGhpcy5fZ2V0UGxheWVyR3JhemVSYWRpdXMoKTtcbiAgICAgICAgICAgIGlmICghZW5lbXkuZ3JhemVkICYmIGRpc3QgPCBncmF6ZVJhZGl1cyArIGVuZW15LnJhZGl1cyAmJiBkaXN0ID4gcGxheWVyUmFkaXVzICsgZW5lbXkucmFkaXVzIC0gMikge1xuICAgICAgICAgICAgICAgIGVuZW15LmdyYXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkRW5lcmd5KDEwKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncmF6ZVNjb3JlICs9IDMwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njb3JlID0gdGhpcy5fZGlzdGFuY2VTY29yZSArIHRoaXMuX2dyYXplU2NvcmU7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmxvYXRUZXh0KCflroznvo7ourLpgb8hJywgdGhpcy5fcGxheWVyLnBvc2l0aW9uLmFkZChjYy52MigwLCA4MCkpLCBjYy5jb2xvcigyNTUsIDIzOCwgMTEwKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkaXN0IDw9IHBsYXllclJhZGl1cyArIGVuZW15LnJhZGl1cykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaGllbGRUaW1lID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGREaWFtb25kKDEsIGVuZW15Lm5vZGUucG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBlbmVteS5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5lbWllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5lbXkubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuZW1pZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93UmV2aXZlT3JHYW1lT3ZlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVuZW15Lm5vZGUueCA8IHRoaXMuX2xlZnREZXNwYXduWCgpKSB7XG4gICAgICAgICAgICAgICAgZW5lbXkubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5lbWllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVQaWNrdXBzKGR0OiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX3BpY2t1cHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9waWNrdXBzW2ldO1xuICAgICAgICAgICAgbm9kZS54IC09IDEyMCAqIGR0O1xuICAgICAgICAgICAgbm9kZS5hbmdsZSArPSA4MCAqIGR0O1xuICAgICAgICAgICAgY29uc3QgZGlzdCA9IG5vZGUucG9zaXRpb24uc3ViKHRoaXMuX3BsYXllci5wb3NpdGlvbikubWFnKCk7XG4gICAgICAgICAgICBpZiAoZGlzdCA8IDUyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkRGlhbW9uZCgxLCBub2RlLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9waWNrdXBzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS54IDwgdGhpcy5fbGVmdERlc3Bhd25YKCkpIHtcbiAgICAgICAgICAgICAgICBub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9waWNrdXBzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3NwYXduVGltZXJzKGR0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fZW5lbXlUaW1lciArPSBkdDtcbiAgICAgICAgaWYgKHRoaXMuX2VuZW15VGltZXIgPj0gdGhpcy5fZW5lbXlJbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5fZW5lbXlUaW1lciA9IDA7XG4gICAgICAgICAgICB0aGlzLl9zcGF3bkVuZW15KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9waWNrdXBUaW1lciArPSBkdDtcbiAgICAgICAgaWYgKHRoaXMuX3BpY2t1cFRpbWVyID49IDQuNSkge1xuICAgICAgICAgICAgdGhpcy5fcGlja3VwVGltZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5fc3Bhd25Db2luKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zcGF3bkVuZW15KCkge1xuICAgICAgICBpZiAoIXRoaXMuX2VuZW15VGVtcGxhdGUgfHwgIXRoaXMuX2VuZW15TGF5ZXIpIHJldHVybjtcbiAgICAgICAgY29uc3QgbW9uc3RlckluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNik7XG4gICAgICAgIGNvbnN0IGZyYW1lcyA9IHRoaXMuX21vbnN0ZXJGcmFtZXNbbW9uc3RlckluZGV4XSB8fCB0aGlzLl9tb25zdGVyRnJhbWVzWzBdIHx8IFtdO1xuICAgICAgICBjb25zdCBlbmVteSA9IGNjLmluc3RhbnRpYXRlKHRoaXMuX2VuZW15VGVtcGxhdGUpO1xuICAgICAgICBlbmVteS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBlbmVteS5wYXJlbnQgPSB0aGlzLl9lbmVteUxheWVyO1xuICAgICAgICBlbmVteS5zZXRQb3NpdGlvbih0aGlzLl9yaWdodFNwYXduWCgpLCB0aGlzLl9yYW5kb21HYW1lcGxheVkoKSk7XG4gICAgICAgIGVuZW15LnNjYWxlID0gTU9OU1RFUl9ESVNQTEFZX1NDQUxFO1xuICAgICAgICBpZiAoZnJhbWVzLmxlbmd0aCA+IDApIHRoaXMuX3NldE1vbnN0ZXJTcHJpdGVGcmFtZShlbmVteSwgZnJhbWVzWzBdKTtcbiAgICAgICAgdGhpcy5fZW5lbWllcy5wdXNoKHtcbiAgICAgICAgICAgIG5vZGU6IGVuZW15LFxuICAgICAgICAgICAgc3BlZWQ6IHRoaXMuX2VuZW15U3BlZWQgKyBNYXRoLnJhbmRvbSgpICogNzAsXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMuX2dldE1vbnN0ZXJSYWRpdXMobW9uc3RlckluZGV4KSxcbiAgICAgICAgICAgIGdyYXplZDogZmFsc2UsXG4gICAgICAgICAgICBmcmFtZXMsXG4gICAgICAgICAgICBmcmFtZUluZGV4OiAwLFxuICAgICAgICAgICAgZnJhbWVUaW1lcjogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRUcmFpdE51bWJlcihrZXk6IHN0cmluZywgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudFRyYWl0IHx8IHRoaXMuX2N1cnJlbnRUcmFpdFtrZXldID09IG51bGwpIHJldHVybiBmYWxsYmFjaztcbiAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy5fY3VycmVudFRyYWl0W2tleV0pO1xuICAgICAgICByZXR1cm4gaXNOYU4odmFsdWUpID8gZmFsbGJhY2sgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRTY2FsZWRSYWRpdXMoa2V5OiBzdHJpbmcsIGZhbGxiYWNrOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBzcGVjUmFkaXVzID0gdGhpcy5fZ2V0VHJhaXROdW1iZXIoa2V5LCAtMSk7XG4gICAgICAgIGlmIChzcGVjUmFkaXVzIDwgMCkgcmV0dXJuIGZhbGxiYWNrO1xuICAgICAgICByZXR1cm4gc3BlY1JhZGl1cyAqIDQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UGxheWVyQ29sbGlzaW9uUmFkaXVzKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHJhZGl1c1B4ID0gdGhpcy5fZ2V0VHJhaXROdW1iZXIoJ2hpdGJveF9yYWRpdXNfcHgnLCAtMSk7XG4gICAgICAgIGlmIChyYWRpdXNQeCA+PSAwKSByZXR1cm4gcmFkaXVzUHg7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRTY2FsZWRSYWRpdXMoJ2hpdGJveF9yYWRpdXMnLCAyMik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UGxheWVyR3JhemVSYWRpdXMoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcmFkaXVzUHggPSB0aGlzLl9nZXRUcmFpdE51bWJlcignZ3JhemVfcmFkaXVzX3B4JywgLTEpO1xuICAgICAgICBpZiAocmFkaXVzUHggPj0gMCkgcmV0dXJuIHJhZGl1c1B4O1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U2NhbGVkUmFkaXVzKCdncmF6ZV9yYWRpdXMnLCA1OCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TW9uc3RlclJhZGl1cyhtb25zdGVySW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGNmZyA9IHRoaXMuX21vbnN0ZXJDb2xsaXNpb25Db25maWdzXG4gICAgICAgICAgICA/IHRoaXMuX21vbnN0ZXJDb2xsaXNpb25Db25maWdzLmZpbmQoKGl0ZW06IGFueSkgPT4gTnVtYmVyKGl0ZW0ubW9uc3Rlcl9pbmRleCkgPT09IG1vbnN0ZXJJbmRleClcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgaWYgKGNmZyAmJiBjZmcucmFkaXVzX3B4ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1cyA9IE51bWJlcihjZmcucmFkaXVzX3B4KTtcbiAgICAgICAgICAgIGlmICghaXNOYU4ocmFkaXVzKSAmJiByYWRpdXMgPj0gMCkgcmV0dXJuIHJhZGl1cztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMzQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3Bhd25Db2luKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3BpY2t1cExheWVyIHx8ICF0aGlzLl9jb2luRnJhbWUpIHJldHVybjtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBjYy5Ob2RlKCdDb2luUGlja3VwJyk7XG4gICAgICAgIHRoaXMuX3BpY2t1cExheWVyLmFkZENoaWxkKG5vZGUpO1xuICAgICAgICBub2RlLnNldFBvc2l0aW9uKHRoaXMuX3JpZ2h0U3Bhd25YKCksIHRoaXMuX3JhbmRvbUdhbWVwbGF5WSgpKTtcbiAgICAgICAgbm9kZS5zZXRDb250ZW50U2l6ZSg1NSwgNTMpO1xuICAgICAgICB0aGlzLl9zZXRTcHJpdGVGcmFtZShub2RlLCB0aGlzLl9jb2luRnJhbWUpO1xuICAgICAgICB0aGlzLl9waWNrdXBzLnB1c2gobm9kZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWN0aXZhdGVTaGllbGQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmVyZ3kgPCB0aGlzLl9zaGllbGRNYXggfHwgdGhpcy5fc2hpZWxkVGltZSA+IDAgfHwgdGhpcy5fZW5kZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5fZW5lcmd5ID0gMDtcbiAgICAgICAgdGhpcy5fc2hpZWxkVGltZSA9IDU7XG4gICAgICAgIGlmICh0aGlzLl9zaGllbGRGeCkgdGhpcy5fc2hpZWxkRngub3BhY2l0eSA9IDIyMDtcbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZEJ0bikge1xuICAgICAgICAgICAgY2MudHdlZW4odGhpcy5fc2hpZWxkQnRuKS50bygwLjA4LCB7IHNjYWxlOiAxLjEyIH0pLnRvKDAuMSwgeyBzY2FsZTogMSB9KS5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlZnJlc2hIdWQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRFbmVyZ3kodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9lbmVyZ3kgPSBNYXRoLm1pbih0aGlzLl9zaGllbGRNYXgsIHRoaXMuX2VuZXJneSArIHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZEJ0bikge1xuICAgICAgICAgICAgY2MudHdlZW4odGhpcy5fc2hpZWxkQnRuKS50bygwLjA4LCB7IHNjYWxlOiAxLjA2IH0pLnRvKDAuMDgsIHsgc2NhbGU6IDEgfSkuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3Nob3dQYXVzZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VuZGVkIHx8ICF0aGlzLl9wb3B1cFBhdXNlKSByZXR1cm47XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3BvcHVwUGF1c2UuYWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zaG93UmV2aXZlT3JHYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLl9yZXZpdmVkICYmIHRoaXMuX3BvcHVwUmV2aXZlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXZpdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gdGhpcy5fbGFiZWwoJ1BvcHVwTGF5ZXIvUG9wdXBSZXZpdmUvU2NvcmVMYWJlbCcpO1xuICAgICAgICAgICAgaWYgKHNjb3JlKSBzY29yZS5zdHJpbmcgPSBg5YiG5pWw77yaJHt0aGlzLl9zY29yZX1gO1xuICAgICAgICAgICAgY29uc3QgZGlhbW9uZCA9IHRoaXMuX3Jldml2ZURpYW1vbmRMYWJlbCB8fCB0aGlzLl9sYWJlbCgnUG9wdXBMYXllci9Qb3B1cFJldml2ZS9EaWFtb25kTGFiZWwnKTtcbiAgICAgICAgICAgIGlmIChkaWFtb25kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmV2aXZlRGlhbW9uZExhYmVsID0gZGlhbW9uZDtcbiAgICAgICAgICAgICAgICBkaWFtb25kLnN0cmluZyA9IGDmnKzlsYDojrflvpfpkrvnn7PvvJoke3RoaXMuX2NvaW5zfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wb3B1cFJldml2ZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2dhbWVPdmVyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2FtZU92ZXIoKSB7XG4gICAgICAgIHRoaXMuX2VuZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX3Njb3JlID4gKG1HYW1lRGF0YS5CZXN0U2NvcmUgfHwgMCkpIHtcbiAgICAgICAgICAgIG1HYW1lRGF0YS5CZXN0U2NvcmUgPSB0aGlzLl9zY29yZTtcbiAgICAgICAgICAgIG1HYW1lRGF0YS5TYXZlQmVzdFNjb3JlRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIEdhbWVTdGF0ZS5sYXN0UmVzdWx0ID0ge1xuICAgICAgICAgICAgc3RhcnM6IDAsXG4gICAgICAgICAgICBzaGVucG9FYXJuZWQ6IHRoaXMuX2NvaW5zLFxuICAgICAgICAgICAgc2hhcmRzRWFybmVkOiAwLFxuICAgICAgICAgICAgd2F2ZXNDbGVhcmVkOiBNYXRoLmZsb29yKHRoaXMuX2Rpc3RhbmNlIC8gMTAwKVxuICAgICAgICB9O1xuICAgICAgICBHYW1lU3RhdGUuc2F2ZSgpO1xuICAgICAgICBTdGF0ZUJyaWRnZS5zeW5jTmV3VG9PbGQoKTtcblxuICAgICAgICBpZiAodGhpcy5fcG9wdXBSZXN1bHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gdGhpcy5fbGFiZWwoJ1BvcHVwTGF5ZXIvUG9wdXBSZXN1bHQvU2NvcmVMYWJlbCcpO1xuICAgICAgICAgICAgaWYgKHNjb3JlKSBzY29yZS5zdHJpbmcgPSBg5YiG5pWw77yaJHt0aGlzLl9zY29yZX1gO1xuICAgICAgICAgICAgY29uc3QgZGlhbW9uZCA9IHRoaXMuX3Jlc3VsdERpYW1vbmRMYWJlbCB8fCB0aGlzLl9sYWJlbCgnUG9wdXBMYXllci9Qb3B1cFJlc3VsdC9EaWFtb25kTGFiZWwnKTtcbiAgICAgICAgICAgIGlmIChkaWFtb25kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzdWx0RGlhbW9uZExhYmVsID0gZGlhbW9uZDtcbiAgICAgICAgICAgICAgICBkaWFtb25kLnN0cmluZyA9IGDmnKzlsYDojrflvpfpkrvnn7PvvJoke3RoaXMuX2NvaW5zfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wb3B1cFJlc3VsdC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVzdGFydCgpIHtcbiAgICAgICAgaWYgKCFTdGF0ZUJyaWRnZS5jb25zdW1lU3RhbWluYSgpKSB7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdFRleHQoJ+S9k+WKm+S4jei2sycsIGNjLnYyKDAsIDApLCBjYy5Db2xvci5SRUQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgneW91eGknKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9leGl0VG9TdGFydCgpIHtcbiAgICAgICAgU3RhdGVCcmlkZ2Uuc3luY05ld1RvT2xkKCk7XG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnU3RhcnQnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWZyZXNoSHVkKCkge1xuICAgICAgICBpZiAodGhpcy5fdGltZUxhYmVsKSB0aGlzLl90aW1lTGFiZWwuc3RyaW5nID0gdGhpcy5fZm9ybWF0VGltZSh0aGlzLl9lbGFwc2VkKTtcbiAgICAgICAgaWYgKHRoaXMuX3Njb3JlTGFiZWwpIHRoaXMuX3Njb3JlTGFiZWwuc3RyaW5nID0gYOWIhuaVsO+8miR7dGhpcy5fc2NvcmV9YDtcbiAgICAgICAgaWYgKHRoaXMuX2NvaW5MYWJlbCkgdGhpcy5fY29pbkxhYmVsLnN0cmluZyA9IGAke21HYW1lRGF0YS5jdXJyZW50R29sZH1gO1xuICAgICAgICBpZiAodGhpcy5fZW5lcmd5TGFiZWwpIHRoaXMuX2VuZXJneUxhYmVsLnN0cmluZyA9IGDog73ph48gJHt0aGlzLl9lbmVyZ3l9LyR7dGhpcy5fc2hpZWxkTWF4fWA7XG4gICAgICAgIGlmICh0aGlzLl9zaGllbGRCdG4pIHRoaXMuX3NoaWVsZEJ0bi5vcGFjaXR5ID0gdGhpcy5fZW5lcmd5ID49IHRoaXMuX3NoaWVsZE1heCA/IDI1NSA6IDE1MDtcbiAgICAgICAgaWYgKHRoaXMuX3NoaWVsZENkTGFiZWwpIHRoaXMuX3NoaWVsZENkTGFiZWwuc3RyaW5nID0gJyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkRGlhbW9uZChhbW91bnQ6IG51bWJlciwgcG9zOiBjYy5WZWMyKSB7XG4gICAgICAgIGNvbnN0IGdhaW4gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKGFtb3VudCB8fCAwKSk7XG4gICAgICAgIGlmIChnYWluIDw9IDApIHJldHVybjtcblxuICAgICAgICB0aGlzLl9jb2lucyArPSBnYWluO1xuICAgICAgICBpZiAobUdhbWVEYXRhLmFkZEdvbGQpIHtcbiAgICAgICAgICAgIG1HYW1lRGF0YS5hZGRHb2xkKGdhaW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbUdhbWVEYXRhLmN1cnJlbnRHb2xkID0gTWF0aC5tYXgoMCwgKG1HYW1lRGF0YS5jdXJyZW50R29sZCB8fCAwKSArIGdhaW4pO1xuICAgICAgICAgICAgaWYgKG1HYW1lRGF0YS5TYXZlR29sZERhdGEpIG1HYW1lRGF0YS5TYXZlR29sZERhdGEoKTtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmVtaXQoJ2dvbGRVcGRhdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgR2FtZVN0YXRlLnNoZW5wbyA9IE1hdGgubWF4KDAsIChHYW1lU3RhdGUuc2hlbnBvIHx8IDApICsgZ2Fpbik7XG4gICAgICAgIEdhbWVTdGF0ZS5zYXZlKCk7XG4gICAgICAgIHRoaXMuX2Zsb2F0VGV4dChgKyR7Z2Fpbn1gLCBwb3MsIGNjLmNvbG9yKDI1NSwgMjI4LCA4MCkpO1xuICAgICAgICB0aGlzLl9yZWZyZXNoSHVkKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZm9ybWF0VGltZShzZWNvbmRzOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0b3RhbCA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3Ioc2Vjb25kcykpO1xuICAgICAgICBjb25zdCBtbSA9IE1hdGguZmxvb3IodG90YWwgLyA2MCk7XG4gICAgICAgIGNvbnN0IHNzID0gdG90YWwgJSA2MDtcbiAgICAgICAgcmV0dXJuIGAke21tIDwgMTAgPyAnMCcgOiAnJ30ke21tfToke3NzIDwgMTAgPyAnMCcgOiAnJ30ke3NzfWA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZmxvYXRUZXh0KHRleHQ6IHN0cmluZywgcG9zOiBjYy5WZWMyLCBjb2xvcjogY2MuQ29sb3IpIHtcbiAgICAgICAgY29uc3QgbGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoJ0Zsb2F0VGV4dCcpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobGFiZWxOb2RlKTtcbiAgICAgICAgbGFiZWxOb2RlLnNldFBvc2l0aW9uKHBvcyk7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IHRleHQ7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMjQ7XG4gICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSAyODtcbiAgICAgICAgbGFiZWxOb2RlLmNvbG9yID0gY29sb3I7XG4gICAgICAgIGNjLnR3ZWVuKGxhYmVsTm9kZSlcbiAgICAgICAgICAgIC5ieSgwLjY1LCB7IHk6IDQyLCBvcGFjaXR5OiAtMTgwIH0pXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiBsYWJlbE5vZGUuZGVzdHJveSgpKVxuICAgICAgICAgICAgLnN0YXJ0KCk7XG4gICAgfVxufVxuIl19