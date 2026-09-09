"use strict";
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