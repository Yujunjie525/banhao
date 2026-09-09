const { ccclass } = cc._decorator;

import GameState from './GameState';
import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
import UserDataSyncManager from '../Manager/UserDataSyncManager';
import { APP_ID } from '../Common/AppConfig';
import BgmMgr from '../Managers/BgmMgr';
import SoundMgr from '../Managers/SoundMgr';

const property = cc._decorator.property;
const ACTOR_DISPLAY_SCALE = 2 / 3;
const PLAYER_DISPLAY_SCALE = ACTOR_DISPLAY_SCALE;
const MONSTER_DISPLAY_SCALE = ACTOR_DISPLAY_SCALE;
const SHOW_HITBOX_DEBUG = false;
//调整碰撞圈UI大小的系数
const HITBOX_RADIUS_SCALE = 1.50;
const HITBOX_CONTACT_INSET = 6;
const PLAYER_GRAZE_RADIUS_OFFSET = 30;
const MONSTER_SPAWN_LEFT_OFFSET = 35;
const MONSTER_SPAWN_VERTICAL_INSET = 95;
const HITBOX_DEBUG_LINE_WIDTH = 5;
const HITBOX_DEBUG_STROKE_COLOR = cc.color(220, 0, 0, 255);
const HITBOX_DEBUG_FILL_COLOR = cc.color(255, 0, 0, 45);
const GRAZE_DEBUG_LINE_WIDTH = 4;
const GRAZE_DEBUG_STROKE_COLOR = cc.color(255, 185, 0, 255);
const GRAZE_DEBUG_FILL_COLOR = cc.color(255, 185, 0, 25);
const LEVEL_DURATION = 120;
const LEVEL_STAR_TIMES = [30, 60, 90];
const LEVEL_CLEAR_REWARD = 100;

interface EnemyData {
    node: cc.Node;
    monsterIndex: number;
    speed: number;
    radius: number;
    grazeEntered: boolean;
    frames: cc.SpriteFrame[];
    frameIndex: number;
    frameTimer: number;
}

interface StarPickupData {
    node: cc.Node;
    index: number;
}

@ccclass
export default class YouxiController extends cc.Component {
    @property(cc.AudioClip)
    battleBgm: cc.AudioClip = null;

    @property(cc.AudioClip)
    clickEffect: cc.AudioClip = null;

    @property(cc.SpriteFrame)
    playerHitboxFrameAsset: cc.SpriteFrame = null;

    @property(cc.JsonAsset)
    characterTraitsAsset: cc.JsonAsset = null;

    private _background: cc.Node = null;
    private _hud: cc.Node = null;
    private _popupLayer: cc.Node = null;
    private _player: cc.Node = null;
    private _shieldFx: cc.Node = null;
    private _enemyLayer: cc.Node = null;
    private _pickupLayer: cc.Node = null;
    private _enemyTemplate: cc.Node = null;
    private _joystick: cc.Node = null;
    private _joystickKnob: cc.Node = null;
    private _shieldBtn: cc.Node = null;
    private _pauseBtn: cc.Node = null;
    private _guideNode: cc.Node = null;
    private _guideStep1: cc.Node = null;
    private _guideStep2: cc.Node = null;
    private _guideJoystick: cc.Node = null;
    private _guideShield: cc.Node = null;
    private _guideFinger1: cc.Node = null;
    private _guideFinger2: cc.Node = null;
    private _guideFingerTween: cc.Tween = null;
    private _guideFinger1ControlOffset: cc.Vec2 = null;
    private _guideFinger2ControlOffset: cc.Vec2 = null;
    private _newbieNode: cc.Node = null;
    private _newbieOn: cc.Node = null;
    private _newbieOff: cc.Node = null;
    private _blackHole: cc.Node = null;
    private _coinNode: cc.Node = null;
    private _starNode: cc.Node = null;
    private _coinNodeEditorOffset: cc.Vec2 = null;
    private _newbiePauseOffsetX = 220;
    private _blackHoleRightOffset = 68;
    private _popupPause: cc.Node = null;
    private _popupRevive: cc.Node = null;
    private _popupResult: cc.Node = null;
    private _popupWinResult: cc.Node = null;
    private _winStarNode: cc.Node = null;
    private _hitboxDebugLayer: cc.Node = null;
    private _hitboxDebugGraphics: cc.Graphics = null;

    private _timeLabel: cc.Label = null;
    private _scoreLabel: cc.Label = null;
    private _coinLabel: cc.Label = null;
    private _energyLabel: cc.Label = null;
    private _shieldCdLabel: cc.Label = null;
    private _reviveDiamondLabel: cc.Label = null;
    private _resultDiamondLabel: cc.Label = null;
    private _winDiamondLabel: cc.Label = null;

    private _monsterFrames: cc.SpriteFrame[][] = [];
    private _roleFrames: { [key: string]: cc.SpriteFrame } = {};
    private _coinFrame: cc.SpriteFrame = null;
    private _playerHitboxFrame: cc.SpriteFrame = null;
    private _enemyHitboxFrame: cc.SpriteFrame = null;
    private _explosionFrames: cc.SpriteFrame[] = [];
    private _earnedStarFrame: cc.SpriteFrame = null;
    private _emptyStarFrame: cc.SpriteFrame = null;
    private _characterTraits: any[] = [];
    private _monsterCollisionConfigs: any[] = [];
    private _currentTrait: any = null;
    private _currentRoleIndex = 0;
    private _currentRoleReady = false;

    private _input = cc.v2(0, 0);
    private _elapsed = 0;
    private _score = 0;
    private _distanceScore = 0;
    private _grazeScore = 0;
    private _coins = 0;
    private _energy = 0;
    private _shieldTime = 0;
    private _distance = 0;
    private _enemyTimer = 0;
    private _pickupTimer = 0;
    private _specialWaveTimer = 0;
    private _difficultyTimer = 0;
    private _enemyInterval = 2.5;
    private _enemySpeed = 170;
    private _paused = false;
    private _ended = false;
    private _revived = false;
    private _guideStep = 0;
    private _newbieMode = true;
    private _shieldCost = 10;
    private _isLevelMode = false;
    private _levelConfig: any = null;
    private _starsCollected = 0;
    private _starSpawned: boolean[] = [false, false, false];

    private _enemies: EnemyData[] = [];
    private _pickups: cc.Node[] = [];
    private _starPickups: StarPickupData[] = [];

    private readonly _specialWaveInterval = 30;
    private readonly _blackHoleSafeDistance = 100;
    private _visibleWidth = 1280;
    private _visibleHeight = 720;
    private _halfVisibleWidth = 640;
    private _halfVisibleHeight = 360;

    onLoad() {
        SoundMgr.bindButtonClicks(this.node.parent || this.node, this.clickEffect);
        BgmMgr.play(this.battleBgm);
        if (mGameData.GetLevelData) mGameData.GetLevelData();
        this._isLevelMode = !mGameData.isInfiniteMode;
        this._levelConfig = this._isLevelMode && mGameData.getCurrentLevelConfig
            ? mGameData.getCurrentLevelConfig()
            : null;
        this._syncCurrentRoleIndex();
        this._playerHitboxFrame = this.playerHitboxFrameAsset;
        if (this.characterTraitsAsset) this._applyCharacterTraitsConfig(this.characterTraitsAsset);
        this._bindSceneNodes();
        this._configureGameMode();
        this._fitBackground();
        this.scheduleOnce(() => this._fitBackground(), 0);
        this._loadRuntimeAssets();
        this._bindJoystick();
        this._bindButtons();
        this._setupFirstTimeGuide();
        this._refreshHud();
        this._createHitboxDebugLayer();
        this._drawHitboxDebug();
    }

    update(dt: number) {
        this._syncVisibleLayout();
        if (this._paused || this._ended) {
            this._drawHitboxDebug();
            return;
        }

        this._elapsed += dt;
        if (this._isLevelMode) {
            this._spawnDueLevelStars();
            if (this._elapsed >= LEVEL_DURATION) {
                this._completeLevel();
                this._refreshHud();
                return;
            }
        }
        this._difficultyTimer += dt;
        if (this._difficultyTimer >= 8) {
            this._difficultyTimer = 0;
            this._enemySpeed += 12;
            this._enemyInterval = Math.max(1.04, this._enemyInterval - 0.12);
        }

        this._distance += this._enemySpeed * dt;
        this._distanceScore = Math.floor(this._distance / 10);
        this._score = this._distanceScore + this._grazeScore;

        this._updatePlayer(dt);
        this._updateShield(dt);
        this._updateEnemyAnimations(dt);
        this._updateEnemies(dt);
        this._updatePickups(dt);
        this._updateStarPickups(dt);
        this._spawnTimers(dt);
        this._refreshHud();
        this._drawHitboxDebug();
    }

    private _bindSceneNodes() {
        this._background = cc.find('Background', this.node);
        this._hud = cc.find('HUD', this.node);
        this._popupLayer = cc.find('PopupLayer', this.node);
        this._enemyLayer = cc.find('EnemyLayer', this.node);
        this._pickupLayer = cc.find('PickupLayer', this.node);
        this._enemyTemplate = cc.find('EnemyLayer/EnemyTemplate', this.node);
        this._player = cc.find('Player', this.node);
        if (this._player) this._player.scale = PLAYER_DISPLAY_SCALE;
        this._shieldFx = cc.find('Player/ShieldFx', this.node);
        this._joystick = cc.find('HUD/Joystick', this.node);
        this._joystickKnob = cc.find('HUD/Joystick/JoystickKnob', this.node);
        this._shieldBtn = cc.find('HUD/ShieldButton', this.node);
        this._pauseBtn = cc.find('HUD/PauseButton', this.node);
        this._guideNode = cc.find('GuideNode', this.node);
        this._guideStep1 = cc.find('GuideNode/node1', this.node);
        this._guideStep2 = cc.find('GuideNode/node2', this.node);
        this._guideJoystick = cc.find('GuideNode/node1/fangxiangpan', this.node);
        this._guideShield = cc.find('GuideNode/node2/hudun', this.node);
        this._guideFinger1 = cc.find('GuideNode/node1/shouzhi', this.node);
        this._guideFinger2 = cc.find('GuideNode/node2/shouzhi', this.node);
        if (this._guideJoystick && this._guideFinger1) {
            this._guideFinger1ControlOffset = cc.v2(
                this._guideFinger1.x - this._guideJoystick.x,
                this._guideFinger1.y - this._guideJoystick.y
            );
        }
        if (this._guideShield && this._guideFinger2) {
            this._guideFinger2ControlOffset = cc.v2(
                this._guideFinger2.x - this._guideShield.x,
                this._guideFinger2.y - this._guideShield.y
            );
        }
        this._newbieNode = cc.find('HUD/xinshouNode', this.node);
        this._newbieOn = cc.find('HUD/xinshouNode/on', this.node);
        this._newbieOff = cc.find('HUD/xinshouNode/off', this.node);
        this._blackHole = cc.find('HUD/heidong', this.node);
        this._coinNode = cc.find('HUD/CoinNode', this.node);
        this._starNode = cc.find('HUD/StarNode', this.node);
        this._popupPause = cc.find('PopupLayer/PopupPause', this.node);
        this._popupRevive = cc.find('PopupLayer/PopupRevive', this.node);
        this._popupResult = cc.find('PopupLayer/PopupResult', this.node);
        this._popupWinResult = cc.find('PopupLayer/PopupWinResult', this.node);
        this._winStarNode = cc.find('PopupLayer/PopupWinResult/StarNode', this.node);

        this._timeLabel = this._label('HUD/TimerIcon/TimeLabel');
        this._scoreLabel = this._label('HUD/ScoreLabel');
        this._coinLabel = this._label('HUD/CoinNode/CoinLabel');
        this._energyLabel = this._label('HUD/EnergyLabel');
        this._shieldCdLabel = this._label('HUD/ShieldCdLabel');
        this._reviveDiamondLabel = this._label('PopupLayer/PopupRevive/DiamondLabel');
        this._resultDiamondLabel = this._label('PopupLayer/PopupResult/DiamondLabel');
        this._winDiamondLabel = this._label('PopupLayer/PopupWinResult/DiamondLabel');

        const timerIcon = cc.find('HUD/TimerIcon', this.node);
        if (this._coinNode && timerIcon) {
            this._coinNodeEditorOffset = this._coinNode.position.sub(timerIcon.position);
        }
        if (this._newbieNode && this._pauseBtn) {
            this._newbiePauseOffsetX = this._pauseBtn.x - this._newbieNode.x;
        }
        if (this._blackHole) {
            this._blackHoleRightOffset = this._halfVisibleWidth - this._blackHole.x;
        }

        if (mGameData.GetGoldData) mGameData.GetGoldData();
        if (this._shieldCdLabel && this._shieldCdLabel.node) {
            this._shieldCdLabel.string = '';
            this._shieldCdLabel.node.active = false;
        }
        if (this._shieldFx) this._shieldFx.opacity = 0;
        if (this._enemyTemplate) this._enemyTemplate.active = false;
        if (this._popupPause) this._popupPause.active = false;
        if (this._popupRevive) this._popupRevive.active = false;
        if (this._popupResult) this._popupResult.active = false;
        if (this._popupWinResult) this._popupWinResult.active = false;
        if (this._guideNode) this._guideNode.active = false;
        this._refreshNewbieVisuals();
    }

    private _configureGameMode() {
        if (this._coinNode) this._coinNode.active = !this._isLevelMode;
        if (this._coinLabel && this._coinLabel.node) this._coinLabel.node.active = !this._isLevelMode;
        if (this._starNode) this._starNode.active = this._isLevelMode;
        if (this._isLevelMode && this._levelConfig) {
            const speedMultiplier = Math.max(0.5, Number(this._levelConfig.speed) || 1);
            this._enemySpeed = 170 * speedMultiplier;
        }
        this._refreshStarDisplays();
    }

    private _createHitboxDebugLayer() {
        if (!SHOW_HITBOX_DEBUG || this._hitboxDebugLayer) return;

        this._hitboxDebugLayer = new cc.Node('HitboxDebugLayer');
        this.node.addChild(this._hitboxDebugLayer);
        this._hitboxDebugLayer.zIndex = 50;
        if (this._popupLayer) this._popupLayer.zIndex = 100;
        this._hitboxDebugLayer.setPosition(0, 0);
        this._hitboxDebugLayer.setContentSize(this._visibleWidth, this._visibleHeight);

        this._hitboxDebugGraphics = this._hitboxDebugLayer.addComponent(cc.Graphics);
        this._hitboxDebugGraphics.lineWidth = HITBOX_DEBUG_LINE_WIDTH;
        this._hitboxDebugGraphics.strokeColor = HITBOX_DEBUG_STROKE_COLOR;
        this._hitboxDebugGraphics.fillColor = HITBOX_DEBUG_FILL_COLOR;
    }

    private _label(path: string): cc.Label {
        const node = cc.find(path, this.node);
        return node ? node.getComponent(cc.Label) : null;
    }

    private _loadRuntimeAssets() {
        cc.loader.loadResDir('zzImg2', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (!err && frames) {
                frames.forEach((frame: cc.SpriteFrame) => this._roleFrames[frame.name] = frame);
                this._earnedStarFrame = this._roleFrames['五角星1'] || null;
                this._emptyStarFrame = this._roleFrames['五角星2'] || null;
                this._applyLevelBackground();
                this._applySelectedRoleSprite();
                this._refreshStarDisplays();
            }
        });

        cc.loader.loadRes('zzImg/zuanshi', cc.SpriteFrame, (err: any, frame: cc.SpriteFrame) => {
            if (!err && frame) this._coinFrame = frame;
        });

        if (!this._playerHitboxFrame) {
            cc.loader.loadRes('zzImg2/huduntexiao2', cc.SpriteFrame, (err: any, frame: cc.SpriteFrame) => {
                if (err || !frame) return;
                this._playerHitboxFrame = frame;
                this._refreshNewbieVisuals();
            });
        }

        cc.loader.loadRes('zzImg2/huduntexiao3', cc.SpriteFrame, (err: any, frame: cc.SpriteFrame) => {
            if (err || !frame) return;
            this._enemyHitboxFrame = frame;
            this._refreshNewbieVisuals();
        });

        cc.loader.loadResDir('Anim2/boom', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (err || !frames) return;
            this._explosionFrames = frames.sort((a, b) => Number(a.name) - Number(b.name));
        });

        if (!this.characterTraitsAsset) {
            cc.loader.loadRes('config/characterTraits', cc.JsonAsset, (err: any, json: cc.JsonAsset) => {
                if (!err && json) this._applyCharacterTraitsConfig(json);
            });
        }

        for (let i = 1; i <= 6; i++) {
            const monsterIndex = i - 1;
            cc.loader.loadResDir(`Anim2/master${i}`, cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
                if (err || !frames || frames.length === 0) return;
                this._monsterFrames[monsterIndex] = frames.sort((a, b) => a.name.localeCompare(b.name));
                if (this._enemyTemplate && monsterIndex === 0) {
                    this._setMonsterSpriteFrame(this._enemyTemplate, this._monsterFrames[monsterIndex][0]);
                }
            });
        }
    }

    private _applySelectedRoleSprite() {
        if (!this._player) return;
        this._syncCurrentRoleIndex();
        const frame = this._roleFrames[String(this._currentRoleIndex + 1)] || this._roleFrames['1'];
        if (frame) this._setSpriteFrame(this._player, frame);
        this._applySelectedRoleTrait();
    }

    private _syncCurrentRoleIndex() {
        if (mGameData.GetCurrentRoleData) mGameData.GetCurrentRoleData();
        this._currentRoleIndex = cc.misc.clampf(Number(mGameData.currentRole) || 0, 0, 4);
        this._currentRoleReady = true;
    }

    private _applyLevelBackground() {
        if (!this._background) return;
        const level = this._isLevelMode ? Math.max(1, mGameData.currentLevel || 1) : 1;
        this._setLevelBackgroundForLevel(level);
    }

    private _setLevelBackgroundForLevel(level: number) {
        if (!this._background) return;
        const group = Math.max(1, Math.min(5, Math.ceil(level / 20)));
        const frame = this._roleFrames[`beijingditu${group}`] || this._roleFrames['beijingditu1'];
        if (!frame) return;
        this._setSpriteFrame(this._background, frame);
        this._fitBackground();
    }

    private _applySelectedRoleTrait() {
        if (!this._characterTraits || this._characterTraits.length === 0) return;
        this._currentTrait = this._characterTraits.find((cfg: any) => Number(cfg.role_index) === this._currentRoleIndex)
            || this._characterTraits[0];
        this._refreshNewbieVisuals();
    }

    private _applyCharacterTraitsConfig(json: cc.JsonAsset) {
        const cfg = json && json.json ? json.json : {};
        if (Array.isArray(cfg)) {
            this._characterTraits = cfg.filter((item: any) => !item || item.enabled !== false);
            this._monsterCollisionConfigs = [];
        } else {
            this._characterTraits = (cfg.characters || []).filter((item: any) => !item || item.enabled !== false);
            this._monsterCollisionConfigs = (cfg.monsters || []).filter((item: any) => !item || item.enabled !== false);
        }
        this._applySelectedRoleTrait();
        this._refreshEnemyCollisionRadii();
    }

    private _setSpriteFrame(node: cc.Node, frame: cc.SpriteFrame) {
        if (!node || !frame) return;
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = frame;
    }

    private _setMonsterSpriteFrame(node: cc.Node, frame: cc.SpriteFrame) {
        if (!node || !frame) return;
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = frame;

        const size = frame.getOriginalSize ? frame.getOriginalSize() : null;
        const rect = !size && frame.getRect ? frame.getRect() : null;
        if (size) {
            node.setContentSize(size.width, size.height);
        } else if (rect) {
            node.setContentSize(rect.width, rect.height);
        }
        node.scale = MONSTER_DISPLAY_SCALE;
    }

    private _fitBackground() {
        this._syncVisibleLayout(true);
    }

    private _syncVisibleLayout(force: boolean = false) {
        const canvasSize = this.node.getContentSize();
        const viewSize = cc.view && cc.view.getVisibleSize ? cc.view.getVisibleSize() : null;
        const activeSize = this._pickActiveVisibleSize(canvasSize, viewSize);
        if (!force
            && Math.abs(activeSize.width - this._visibleWidth) < 1
            && Math.abs(activeSize.height - this._visibleHeight) < 1) {
            return;
        }

        this._visibleWidth = activeSize.width;
        this._visibleHeight = activeSize.height;
        this._halfVisibleWidth = this._visibleWidth * 0.5;
        this._halfVisibleHeight = this._visibleHeight * 0.5;

        if (this._hud) this._hud.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._popupLayer) this._popupLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._enemyLayer) this._enemyLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._pickupLayer) this._pickupLayer.setContentSize(this._visibleWidth, this._visibleHeight);
        if (this._hitboxDebugLayer) this._hitboxDebugLayer.setContentSize(this._visibleWidth, this._visibleHeight);

        if (this._background) {
            this._background.setPosition(0, 0);
            const designRatio = 1280 / 720;
            const canvasRatio = this._visibleWidth / this._visibleHeight;
            if (canvasRatio >= designRatio) {
                this._background.setContentSize(this._visibleWidth, this._visibleWidth / designRatio);
            } else {
                this._background.setContentSize(this._visibleHeight * designRatio, this._visibleHeight);
            }
        }

        const leftX = -this._halfVisibleWidth;
        const rightX = this._halfVisibleWidth;
        const topY = this._halfVisibleHeight;
        const bottomY = -this._halfVisibleHeight;

        const timerIcon = cc.find('HUD/TimerIcon', this.node);
        this._setNodePosition(timerIcon, leftX + 117, topY - 66);
        if (this._scoreLabel && this._scoreLabel.node) this._scoreLabel.node.setPosition(0, topY - 67);
        if (this._coinNode && timerIcon && this._coinNodeEditorOffset) {
            this._coinNode.setPosition(timerIcon.x + this._coinNodeEditorOffset.x, timerIcon.y + this._coinNodeEditorOffset.y);
        }
        this._setNodePosition(this._starNode, leftX + 330, topY - 70);
        this._setNodePosition(this._pauseBtn, rightX - 86, topY - 68);
        if (this._newbieNode && this._pauseBtn) {
            this._newbieNode.setPosition(this._pauseBtn.x - this._newbiePauseOffsetX, this._pauseBtn.y);
        }
        if (this._blackHole) this._blackHole.setPosition(rightX - this._blackHoleRightOffset, this._blackHole.y);
        this._setNodePosition(this._joystick, leftX + 144, bottomY + 106);
        this._setNodePosition(this._shieldBtn, rightX - 224, bottomY + 106);
        if (this._energyLabel && this._energyLabel.node) this._energyLabel.node.setPosition(rightX - 224, bottomY + 170);
        if (this._shieldCdLabel && this._shieldCdLabel.node) this._shieldCdLabel.node.setPosition(rightX - 214, bottomY + 108);
        this._alignGuideStepsToControls();
    }

    private _pickActiveVisibleSize(canvasSize: cc.Size, viewSize: cc.Size | null): cc.Size {
        if (!viewSize) return canvasSize;
        const canvasRatio = canvasSize.height > 0 ? canvasSize.width / canvasSize.height : 0;
        const viewRatio = viewSize.height > 0 ? viewSize.width / viewSize.height : 0;
        if (viewSize.width > 0 && viewSize.height > 0 && viewRatio > canvasRatio + 0.01) {
            return viewSize;
        }
        return canvasSize;
    }

    private _setNodePosition(node: cc.Node, x: number, y: number) {
        if (node) node.setPosition(x, y);
    }

    private _drawHitboxDebug() {
        if (!SHOW_HITBOX_DEBUG || !this._hitboxDebugGraphics) return;

        const g = this._hitboxDebugGraphics;
        g.clear();
        g.lineWidth = HITBOX_DEBUG_LINE_WIDTH;
        g.strokeColor = HITBOX_DEBUG_STROKE_COLOR;
        g.fillColor = HITBOX_DEBUG_FILL_COLOR;

        if (this._player && this._player.active) {
            const p = this._nodePositionInHitboxLayer(this._player);
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
        for (const enemy of this._enemies) {
            if (!enemy || !enemy.node || !enemy.node.isValid || !enemy.node.active) continue;
            const p = this._nodePositionInHitboxLayer(enemy.node);
            g.circle(p.x, p.y, enemy.radius);
            g.fill();
            g.stroke();
        }
    }

    private _nodePositionInHitboxLayer(node: cc.Node): cc.Vec2 {
        if (!node || !this._hitboxDebugLayer) return cc.v2(0, 0);
        const world = node.convertToWorldSpaceAR(cc.v2(0, 0));
        return this._hitboxDebugLayer.convertToNodeSpaceAR(world);
    }

    private _randomGameplayY(): number {
        const bounds = this._blackHoleSpawnBounds(60);
        const minY = bounds.minY;
        const maxY = bounds.maxY;
        if (minY >= maxY) return 0;
        return cc.misc.lerp(minY, maxY, Math.random());
    }

    private _rightSpawnX(): number {
        if (this._blackHole && this._enemyLayer) {
            const world = this._blackHole.convertToWorldSpaceAR(cc.v2(0, 0));
            return this._enemyLayer.convertToNodeSpaceAR(world).x;
        }
        return this._halfVisibleWidth + 70;
    }

    private _monsterSpawnX(): number {
        return this._rightSpawnX() - MONSTER_SPAWN_LEFT_OFFSET;
    }

    private _randomMonsterSpawnY(): number {
        const bounds = this._blackHoleSpawnBounds(MONSTER_SPAWN_VERTICAL_INSET);
        if (bounds.minY >= bounds.maxY) return 0;
        return cc.misc.lerp(bounds.minY, bounds.maxY, Math.random());
    }

    private _leftDespawnX(): number {
        return -this._halfVisibleWidth - 90;
    }

    private _playerMinX(): number {
        return -this._halfVisibleWidth + 70;
    }

    private _playerMaxX(): number {
        if (this._blackHole && this._player && this._player.parent) {
            const localLeft = -this._blackHole.anchorX * this._blackHole.width;
            const world = this._blackHole.convertToWorldSpaceAR(cc.v2(localLeft, 0));
            const leftX = this._player.parent.convertToNodeSpaceAR(world).x;
            return Math.min(
                this._halfVisibleWidth - 70,
                leftX - this._blackHoleSafeDistance - this._getPlayerCollisionRadius()
            );
        }
        return this._halfVisibleWidth - 70;
    }

    private _playerMinY(): number {
        return -this._halfVisibleHeight + 90;
    }

    private _playerMaxY(): number {
        return this._halfVisibleHeight - 95;
    }

    private _bindJoystick() {
        if (!this._joystick || !this._joystickKnob) return;

        const updateInput = (event: cc.Event.EventTouch) => {
            const local = this._joystick.convertToNodeSpaceAR(event.getLocation());
            let v = cc.v2(local.x, local.y);
            const radius = 70;
            if (v.mag() > radius) v = v.normalize().mul(radius);
            this._joystickKnob.setPosition(v);
            this._input = v.mag() > 4 ? v.normalize() : cc.v2(0, 0);
        };
        const reset = () => {
            this._input = cc.v2(0, 0);
            this._joystickKnob.setPosition(0, 0);
        };

        this._joystick.on(cc.Node.EventType.TOUCH_START, updateInput, this);
        this._joystick.on(cc.Node.EventType.TOUCH_MOVE, updateInput, this);
        this._joystick.on(cc.Node.EventType.TOUCH_END, reset, this);
        this._joystick.on(cc.Node.EventType.TOUCH_CANCEL, reset, this);
    }

    private _bindButtons() {
        if (this._shieldBtn) {
            this._shieldBtn.on(cc.Node.EventType.TOUCH_END, this._activateShield, this);
        }
        if (this._pauseBtn) {
            this._pauseBtn.on(cc.Node.EventType.TOUCH_END, this._showPause, this);
        }
        if (this._newbieNode) {
            this._newbieNode.on(cc.Node.EventType.TOUCH_END, this._toggleNewbieMode, this);
        }
        this._bindPopup(this._popupPause, () => {
            this._popupPause.active = false;
            this._paused = false;
        }, () => this._exitToStart());
        this._bindPopup(this._popupRevive, () => {
            this._popupRevive.active = false;
            this._shieldTime = 3;
            this._paused = false;
        }, () => {
            this._popupRevive.active = false;
            this._gameOver();
            this._exitToStart();
        });
        this._bindPopup(this._popupResult, () => this._restart(), () => this._exitToStart());
        this._bindPopup(this._popupWinResult, () => this._startNextLevel(), () => this._exitToStart());
    }

    private _setupFirstTimeGuide() {
        if (!this._guideNode || !this._guideStep1 || !this._guideStep2
            || !this._guideJoystick || !this._guideShield
            || UserDataSyncManager.isNewbieGuideCompleted()) {
            if (this._guideNode) this._guideNode.active = false;
            return;
        }

        this._paused = true;
        this._guideStep = 1;
        this._input = cc.v2(0, 0);
        if (this._joystickKnob) this._joystickKnob.setPosition(0, 0);
        this._guideStep1.active = true;
        this._guideStep2.active = false;
        this._guideNode.active = true;
        this._startGuideFingerAnimation(this._guideFinger1);

        this._guideJoystick.on(cc.Node.EventType.TOUCH_END, this._completeGuideStep1, this);
        this._guideShield.on(cc.Node.EventType.TOUCH_END, this._completeGuideStep2, this);
        this._alignGuideStepsToControls();
    }

    private _completeGuideStep1() {
        if (this._guideStep !== 1) return;

        this._guideStep = 2;
        this._stopGuideFingerAnimation(this._guideFinger1);
        this._guideStep1.active = false;
        this._guideStep2.active = true;
        this._startGuideFingerAnimation(this._guideFinger2);
        this._energy = Math.max(this._energy, this._shieldCost);
        this._refreshHud();
    }

    private _completeGuideStep2() {
        if (this._guideStep !== 2) return;

        this._energy = Math.max(this._energy, this._shieldCost);
        this._activateShield();
        UserDataSyncManager.markNewbieGuideCompleted();
        this._stopGuideFingerAnimation(this._guideFinger2);
        this._guideStep = 0;
        this._guideNode.active = false;
        this._paused = false;
    }

    private _startGuideFingerAnimation(finger: cc.Node) {
        if (!finger) return;

        if (this._guideFingerTween) this._guideFingerTween.stop();
        finger.scale = 1;
        this._guideFingerTween = cc.tween(finger)
            .repeatForever(
                cc.tween()
                    .to(0.45, { scale: 0.82 }, { easing: 'sineInOut' })
                    .to(0.45, { scale: 1 }, { easing: 'sineInOut' })
            );
        this._guideFingerTween.start();
    }

    onDestroy() {
        BgmMgr.pause();
    }

    private _stopGuideFingerAnimation(finger: cc.Node) {
        if (!finger) return;

        if (this._guideFingerTween) {
            this._guideFingerTween.stop();
            this._guideFingerTween = null;
        }
        finger.scale = 1;
    }

    private _alignGuideStepsToControls() {
        if (!this._guideNode) return;
        if (this._guideStep1) this._guideStep1.setPosition(0, 0);
        if (this._guideStep2) this._guideStep2.setPosition(0, 0);
        this._alignGuideControl(
            this._guideJoystick,
            this._guideFinger1,
            this._joystick,
            this._guideFinger1ControlOffset
        );
        this._alignGuideControl(
            this._guideShield,
            this._guideFinger2,
            this._shieldBtn,
            this._guideFinger2ControlOffset
        );
    }

    private _alignGuideControl(
        guideControl: cc.Node,
        guideFinger: cc.Node,
        hudControl: cc.Node,
        fingerOffset: cc.Vec2
    ) {
        if (!guideControl || !hudControl || !hudControl.parent) return;

        const hudWorldPosition = hudControl.parent.convertToWorldSpaceAR(hudControl.position);
        const guidePosition = this._guideNode.convertToNodeSpaceAR(hudWorldPosition);
        guideControl.setPosition(guidePosition);
        if (guideFinger && fingerOffset) {
            guideFinger.setPosition(
                guidePosition.x + fingerOffset.x,
                guidePosition.y + fingerOffset.y
            );
        }
    }

    private _bindPopup(panel: cc.Node, primary: () => void, secondary: () => void) {
        if (!panel) return;
        const primaryBtn = panel.getChildByName('Primary');
        const secondaryBtn = panel.getChildByName('Secondary');
        if (primaryBtn) primaryBtn.on(cc.Node.EventType.TOUCH_END, primary, this);
        if (secondaryBtn) secondaryBtn.on(cc.Node.EventType.TOUCH_END, secondary, this);
    }

    private _updatePlayer(dt: number) {
        if (!this._player) return;
        const speed = 285 * this._getTraitNumber('speed_multiplier', 1);
        const x = cc.misc.clampf(this._player.x + this._input.x * speed * dt, this._playerMinX(), this._playerMaxX());
        const y = cc.misc.clampf(this._player.y + this._input.y * speed * dt, this._playerMinY(), this._playerMaxY());
        this._player.setPosition(x, y);
    }

    private _updateShield(dt: number) {
        if (this._shieldTime <= 0) return;
        this._shieldTime = Math.max(0, this._shieldTime - dt);
        if (this._shieldFx) {
            this._shieldFx.opacity = this._shieldTime > 0
                ? 150 + Math.sin(Date.now() / 80) * 70
                : 0;
        }
        if (this._shieldCdLabel) {
            this._shieldCdLabel.string = '';
        }
    }

    private _updateEnemyAnimations(dt: number) {
        for (const enemy of this._enemies) {
            if (!enemy.frames || enemy.frames.length <= 1) continue;
            enemy.frameTimer += dt;
            if (enemy.frameTimer < 0.08) continue;
            enemy.frameTimer = 0;
            enemy.frameIndex = (enemy.frameIndex + 1) % enemy.frames.length;
            this._setMonsterSpriteFrame(enemy.node, enemy.frames[enemy.frameIndex]);
        }
    }

    private _updateEnemies(dt: number) {
        for (let i = this._enemies.length - 1; i >= 0; i--) {
            const enemy = this._enemies[i];
            enemy.node.x -= enemy.speed * dt;
            enemy.node.y += Math.sin(Date.now() / 250 + i) * 10 * dt;

            const dist = enemy.node.position.sub(this._player.position).mag();
            const playerRadius = this._getPlayerCollisionRadius();
            const grazeRadius = this._getPlayerGrazeRadius();
            const collisionDistance = Math.max(
                0,
                playerRadius + enemy.radius - HITBOX_CONTACT_INSET * ACTOR_DISPLAY_SCALE
            );
            const grazeDistance = grazeRadius + enemy.radius;

            if (dist <= collisionDistance) {
                if (this._shieldTime > 0) {
                    if (!this._isLevelMode) this._addDiamond(1, enemy.node.position);
                    enemy.node.destroy();
                    this._enemies.splice(i, 1);
                } else {
                    enemy.node.destroy();
                    this._enemies.splice(i, 1);
                    this._showReviveOrGameOver();
                }
                continue;
            }

            if (this._shieldTime > 0) {
                enemy.grazeEntered = false;
            } else if (dist < grazeDistance) {
                enemy.grazeEntered = true;
            } else if (enemy.grazeEntered) {
                this._addEnergy(10);
                this._grazeScore += 30;
                this._score = this._distanceScore + this._grazeScore;
                this._playExplosion(enemy.node.position);
                enemy.node.destroy();
                this._enemies.splice(i, 1);
                continue;
            }

            if (enemy.node.x < this._leftDespawnX()) {
                enemy.node.destroy();
                this._enemies.splice(i, 1);
            }
        }
    }

    private _updatePickups(dt: number) {
        for (let i = this._pickups.length - 1; i >= 0; i--) {
            const node = this._pickups[i];
            node.x -= 120 * dt;
            node.angle += 80 * dt;
            const dist = node.position.sub(this._player.position).mag();
            if (dist < 52) {
                this._addDiamond(1, node.position);
                node.destroy();
                this._pickups.splice(i, 1);
            } else if (node.x < this._leftDespawnX()) {
                node.destroy();
                this._pickups.splice(i, 1);
            }
        }
    }

    private _updateStarPickups(dt: number) {
        for (let i = this._starPickups.length - 1; i >= 0; i--) {
            const pickup = this._starPickups[i];
            const node = pickup.node;
            node.x -= 120 * dt;
            node.angle += 55 * dt;
            const dist = node.position.sub(this._player.position).mag();
            if (dist < 52) {
                this._starsCollected = Math.min(3, this._starsCollected + 1);
                this._refreshStarDisplays();
                this._floatText('获得星星', node.position, cc.color(255, 226, 72));
                node.destroy();
                this._starPickups.splice(i, 1);
            } else if (node.x < this._leftDespawnX()) {
                node.destroy();
                this._starPickups.splice(i, 1);
            }
        }
    }

    private _spawnTimers(dt: number) {
        this._enemyTimer += dt;
        if (this._enemyTimer >= this._enemyInterval) {
            this._enemyTimer = 0;
            this._spawnEnemy();
        }

        if (!this._isLevelMode) {
            this._pickupTimer += dt;
            if (this._pickupTimer >= 4.5) {
                this._pickupTimer = 0;
                this._spawnCoin();
            }
        }

        this._specialWaveTimer += dt;
        if (this._specialWaveTimer >= this._specialWaveInterval) {
            this._specialWaveTimer -= this._specialWaveInterval;
            this._spawnSpecialWave();
        }
    }

    private _spawnEnemy(spawnY?: number, monsterIndexOverride?: number, speedOverride?: number) {
        if (!this._enemyTemplate || !this._enemyLayer) return;
        const monsterPool = this._getMonsterPool();
        const monsterIndex = monsterIndexOverride == null
            ? monsterPool[Math.floor(Math.random() * monsterPool.length)]
            : cc.misc.clampf(Math.floor(monsterIndexOverride), 0, 5);
        const frames = this._monsterFrames[monsterIndex] || this._monsterFrames[0] || [];
        const enemy = cc.instantiate(this._enemyTemplate);
        enemy.active = true;
        enemy.parent = this._enemyLayer;
        enemy.setPosition(this._monsterSpawnX(), spawnY == null ? this._randomMonsterSpawnY() : spawnY);
        enemy.scale = MONSTER_DISPLAY_SCALE;
        if (frames.length > 0) this._setMonsterSpriteFrame(enemy, frames[0]);
        const data: EnemyData = {
            node: enemy,
            monsterIndex,
            speed: speedOverride == null ? this._enemySpeed + Math.random() * 70 : speedOverride,
            radius: this._getMonsterRadius(monsterIndex),
            grazeEntered: false,
            frames,
            frameIndex: 0,
            frameTimer: 0
        };
        this._enemies.push(data);
        this._ensureEnemyHitboxVisual(data);
    }

    private _spawnSpecialWave() {
        const count = 6;
        const bounds = this._blackHoleSpawnBounds(MONSTER_SPAWN_VERTICAL_INSET);
        const speed = this._enemySpeed + 35;
        const monsterPool = this._getMonsterPool();
        for (let i = 0; i < count; i++) {
            const y = cc.misc.lerp(bounds.minY, bounds.maxY, i / (count - 1));
            const monsterIndex = this._isLevelMode ? monsterPool[i % monsterPool.length] : i;
            this._spawnEnemy(y, monsterIndex, speed);
        }
    }

    private _getMonsterPool(): number[] {
        if (!this._isLevelMode || !this._levelConfig || !Array.isArray(this._levelConfig.Monster)) {
            return [0, 1, 2, 3, 4, 5];
        }
        const pool = this._levelConfig.Monster
            .map((value: any) => Math.floor(Number(value)))
            .filter((value: number) => !isNaN(value) && value >= 0 && value <= 5);
        return pool.length > 0 ? pool : [0];
    }

    private _getTraitNumber(key: string, fallback: number): number {
        if (!this._currentTrait || this._currentTrait[key] == null) return fallback;
        const value = Number(this._currentTrait[key]);
        return isNaN(value) ? fallback : value;
    }

    private _getScaledRadius(key: string, fallback: number): number {
        const specRadius = this._getTraitNumber(key, -1);
        if (specRadius < 0) return fallback;
        return specRadius * 4;
    }

    private _getPlayerCollisionRadius(): number {
        const radiusPx = this._getTraitNumber('hitbox_radius_px', -1);
        const radius = radiusPx >= 0
            ? radiusPx
            : this._getScaledRadius('hitbox_radius', 22);
        return radius * HITBOX_RADIUS_SCALE * ACTOR_DISPLAY_SCALE;
    }

    private _getPlayerGrazeRadius(): number {
        return this._getPlayerCollisionRadius() + PLAYER_GRAZE_RADIUS_OFFSET * ACTOR_DISPLAY_SCALE;
    }

    private _getMonsterRadius(monsterIndex: number): number {
        const cfg = this._monsterCollisionConfigs
            ? this._monsterCollisionConfigs.find((item: any) => Number(item.monster_index) === monsterIndex)
            : null;
        if (cfg && cfg.radius_px != null) {
            const radius = Number(cfg.radius_px);
            if (!isNaN(radius) && radius >= 0) {
                return radius * HITBOX_RADIUS_SCALE * ACTOR_DISPLAY_SCALE;
            }
        }
        return 34 * HITBOX_RADIUS_SCALE * ACTOR_DISPLAY_SCALE;
    }

    private _spawnCoin() {
        if (!this._pickupLayer || !this._coinFrame) return;
        const node = new cc.Node('CoinPickup');
        this._pickupLayer.addChild(node);
        node.setPosition(this._rightSpawnX(), this._randomGameplayY());
        node.setContentSize(55, 53);
        this._setSpriteFrame(node, this._coinFrame);
        this._pickups.push(node);
    }

    private _spawnDueLevelStars() {
        for (let i = 0; i < LEVEL_STAR_TIMES.length; i++) {
            if (!this._starSpawned[i] && this._elapsed >= LEVEL_STAR_TIMES[i]) {
                this._starSpawned[i] = this._spawnLevelStar(i);
            }
        }
    }

    private _spawnLevelStar(index: number): boolean {
        if (!this._pickupLayer || !this._earnedStarFrame) return false;
        const node = new cc.Node(`LevelStar_${index + 1}`);
        this._pickupLayer.addChild(node);
        node.setPosition(this._rightSpawnX(), this._randomGameplayY());
        node.setContentSize(59, 58);
        this._setSpriteFrame(node, this._earnedStarFrame);
        this._starPickups.push({ node, index });
        return true;
    }

    private _refreshStarDisplays() {
        this._applyStarFrames(this._starNode);
        this._applyStarFrames(this._winStarNode);
    }

    private _applyStarFrames(root: cc.Node) {
        if (!root || !this._earnedStarFrame || !this._emptyStarFrame) return;
        for (let i = 0; i < 3; i++) {
            const star = root.getChildByName(`star${i + 1}`);
            if (!star) continue;
            this._setSpriteFrame(star, i < this._starsCollected ? this._earnedStarFrame : this._emptyStarFrame);
        }
    }

    private _completeLevel() {
        if (!this._isLevelMode || this._ended) return;
        this._ended = true;
        this._paused = true;

        const level = Math.max(1, mGameData.currentLevel || 1);
        const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : mGameData.levelConfigs.length;
        if (mGameData.saveLevelStarsByLevel) {
            mGameData.saveLevelStarsByLevel(level, this._starsCollected);
        }

        const levelId = String(level);
        GameState.levelStars[levelId] = Math.max(GameState.levelStars[levelId] || 0, this._starsCollected);
        GameState.selectedLevelIdx = level - 1;
        GameState.selectedLevelId = levelId;
        GameState.maxUnlockedLevel = Math.max(
            GameState.maxUnlockedLevel || 0,
            Math.min(totalLevels - 1, level)
        );
        GameState.lastResult = {
            stars: this._starsCollected,
            shenpoEarned: 0,
            shardsEarned: 0,
            wavesCleared: Math.floor(this._distance / 100)
        };
        GameState.save();

        const levelReward = this._claimLevelClearReward(level);
        StateBridge.syncNewToOld();
        this._reportLevelPass(level, this._starsCollected);
        this._refreshStarDisplays();

        if (this._winDiamondLabel) {
            this._winDiamondLabel.string = levelReward > 0
                ? `本局获得钻石：${levelReward}`
                : '你已经领取过该关通关奖励。';
        }
        if (this._popupWinResult) this._popupWinResult.active = true;
    }

    private _reportLevelPass(level: number, stars: number) {
        const username = cc.sys.localStorage.getItem('SLS_USERNAME');
        if (!username) {
            console.warn('未找到登录账号，跳过通关数据上报');
            return;
        }

        this.postPass(APP_ID, username, level, stars)
            .then((result) => {
                console.log('通关数据上报成功:', result);
                UserDataSyncManager.flushUpload()
                    .catch((error) => console.error('通关后云存档刷新失败:', error));
            })
            .catch((error) => console.error('通关数据上报失败:', error));
    }

    async postPass(appid: string, username: string, rank: number, star: number): Promise<any> {
        const url = 'https://pay.szvi-bo.com/v1/testapp/PassLevel';
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 10000;

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (error) {
                        const message = error && (error as any).message ? (error as any).message : error;
                        reject(new Error(`JSON解析错误: ${message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.ontimeout = () => reject(new Error('网络请求超时'));
            xhr.send(JSON.stringify({ appid, username, rank, star }));
        });
    }

    private _claimLevelClearReward(level: number): number {
        if (!UserDataSyncManager.markLevelClearRewardClaimed(level)) return 0;

        if (mGameData.addGold) {
            mGameData.addGold(LEVEL_CLEAR_REWARD);
        } else {
            mGameData.currentGold = Math.max(0, (mGameData.currentGold || 0) + LEVEL_CLEAR_REWARD);
            if (mGameData.SaveGoldData) mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        return LEVEL_CLEAR_REWARD;
    }

    private _activateShield() {
        if (this._energy < this._shieldCost || this._shieldTime > 0 || this._ended) return;
        this._energy -= this._shieldCost;
        this._shieldCost += 10;
        this._shieldTime = 5;
        if (this._shieldFx) this._shieldFx.opacity = 220;
        if (this._shieldBtn) {
            cc.tween(this._shieldBtn).to(0.08, { scale: 1.12 }).to(0.1, { scale: 1 }).start();
        }
        this._refreshHud();
    }

    private _addEnergy(value: number) {
        if (this._shieldTime > 0) return;
        this._energy = Math.max(0, this._energy + value);
        if (this._shieldBtn) {
            cc.tween(this._shieldBtn).to(0.08, { scale: 1.06 }).to(0.08, { scale: 1 }).start();
        }
    }

    private _showPause() {
        if (this._ended || !this._popupPause) return;
        this._paused = true;
        this._popupPause.active = true;
    }

    private _showReviveOrGameOver() {
        this._paused = true;
        if (!this._revived && this._popupRevive) {
            this._revived = true;
            const score = this._label('PopupLayer/PopupRevive/ScoreLabel');
            if (score) score.string = `分数：${this._score}`;
            const diamond = this._reviveDiamondLabel || this._label('PopupLayer/PopupRevive/DiamondLabel');
            if (diamond) {
                this._reviveDiamondLabel = diamond;
                diamond.node.active = !this._isLevelMode;
                if (!this._isLevelMode) diamond.string = `本局获得钻石：${this._coins}`;
            }
            this._popupRevive.active = true;
            return;
        }
        this._gameOver();
    }

    private _gameOver() {
        this._ended = true;
        this._paused = true;
        if (this._score > (mGameData.BestScore || 0)) {
            mGameData.BestScore = this._score;
            mGameData.SaveBestScoreData();
        }
        GameState.lastResult = {
            stars: 0,
            shenpoEarned: this._coins,
            shardsEarned: 0,
            wavesCleared: Math.floor(this._distance / 100)
        };
        GameState.save();
        StateBridge.syncNewToOld();

        if (this._popupResult) {
            const score = this._label('PopupLayer/PopupResult/ScoreLabel');
            if (score) score.string = `分数：${this._score}`;
            const diamond = this._resultDiamondLabel || this._label('PopupLayer/PopupResult/DiamondLabel');
            if (diamond) {
                this._resultDiamondLabel = diamond;
                diamond.node.active = !this._isLevelMode;
                if (!this._isLevelMode) diamond.string = `本局获得钻石：${this._coins}`;
            }
            this._popupResult.active = true;
        }
    }

    private _restart() {
        if (!StateBridge.consumeStamina()) {
            this._floatText('体力不足', cc.v2(0, 0), cc.Color.RED);
            return;
        }
        cc.director.loadScene('youxi');
    }

    private _startNextLevel() {
        const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : mGameData.levelConfigs.length;
        const nextLevel = (mGameData.currentLevel || 1) + 1;
        if (nextLevel > totalLevels) {
            this._exitToStart();
            return;
        }
        if (!StateBridge.consumeStamina()) {
            this._floatText('体力不足', cc.v2(0, 0), cc.Color.RED);
            return;
        }

        mGameData.isInfiniteMode = false;
        mGameData.currentLevel = nextLevel;
        if (mGameData.SaveLevelData) mGameData.SaveLevelData();
        GameState.selectedLevelIdx = nextLevel - 1;
        GameState.selectedLevelId = String(nextLevel);
        GameState.save();
        cc.director.loadScene('youxi');
    }

    private _exitToStart() {
        StateBridge.syncNewToOld();
        cc.director.loadScene('Start');
    }

    private _refreshHud() {
        if (this._timeLabel) {
            const seconds = this._isLevelMode ? Math.max(0, LEVEL_DURATION - this._elapsed) : this._elapsed;
            this._timeLabel.string = this._formatTime(seconds);
        }
        if (this._scoreLabel) this._scoreLabel.string = `当前能量：${this._energy}`;
        if (this._coinLabel) this._coinLabel.string = `${mGameData.currentGold}`;
        if (this._energyLabel) this._energyLabel.string = `消耗${this._shieldCost}能量开启护盾`;
        if (this._shieldBtn) this._shieldBtn.opacity = this._energy >= this._shieldCost ? 255 : 150;
        if (this._shieldCdLabel) this._shieldCdLabel.string = '';
    }

    private _toggleNewbieMode() {
        this._newbieMode = !this._newbieMode;
        this._refreshNewbieVisuals();
    }

    private _refreshNewbieVisuals() {
        if (this._newbieOn) this._newbieOn.active = this._newbieMode;
        if (this._newbieOff) this._newbieOff.active = !this._newbieMode;

        if (this._player && this._playerHitboxFrame && this._currentTrait && this._currentRoleReady) {
            const visual = this._ensureHitboxVisual(
                this._player,
                'NewbiePlayerHitbox',
                this._playerHitboxFrame,
                this._getPlayerGrazeRadius()
            );
            visual.active = this._newbieMode;
        }
        for (const enemy of this._enemies) this._ensureEnemyHitboxVisual(enemy);
    }

    private _ensureEnemyHitboxVisual(enemy: EnemyData) {
        if (!enemy || !enemy.node || !enemy.node.isValid || !this._enemyHitboxFrame) return;
        const visual = this._ensureHitboxVisual(enemy.node, 'NewbieEnemyHitbox', this._enemyHitboxFrame, enemy.radius);
        visual.active = this._newbieMode;
    }

    private _refreshEnemyCollisionRadii() {
        for (const enemy of this._enemies) {
            enemy.radius = this._getMonsterRadius(enemy.monsterIndex);
            this._ensureEnemyHitboxVisual(enemy);
        }
    }

    private _ensureHitboxVisual(parent: cc.Node, name: string, frame: cc.SpriteFrame, radius: number): cc.Node {
        let visual = parent.getChildByName(name);
        if (!visual) {
            visual = new cc.Node(name);
            visual.active = false;
            parent.addChild(visual);
            visual.zIndex = 20;
        }
        visual.active = false;
        this._setSpriteFrame(visual, frame);
        const parentScale = Math.max(0.001, Math.abs(parent.scale || 1));
        const diameter = Math.max(1, radius * 2 / parentScale);
        visual.setContentSize(diameter, diameter);
        visual.setPosition(0, 0);
        return visual;
    }

    private _blackHoleSpawnBounds(radius: number): { minY: number; maxY: number } {
        if (!this._blackHole || !this._enemyLayer) {
            return {
                minY: -this._halfVisibleHeight + 120,
                maxY: this._halfVisibleHeight - 120
            };
        }
        const bottom = -this._blackHole.anchorY * this._blackHole.height;
        const top = (1 - this._blackHole.anchorY) * this._blackHole.height;
        const bottomWorld = this._blackHole.convertToWorldSpaceAR(cc.v2(0, bottom));
        const topWorld = this._blackHole.convertToWorldSpaceAR(cc.v2(0, top));
        const bottomY = this._enemyLayer.convertToNodeSpaceAR(bottomWorld).y;
        const topY = this._enemyLayer.convertToNodeSpaceAR(topWorld).y;
        const minY = Math.min(bottomY, topY) + radius;
        const maxY = Math.max(bottomY, topY) - radius;
        return minY <= maxY ? { minY, maxY } : { minY: 0, maxY: 0 };
    }

    private _playExplosion(pos: cc.Vec2) {
        if (!this._enemyLayer || this._explosionFrames.length === 0) return;
        const effect = new cc.Node('GrazeExplosion');
        this._enemyLayer.addChild(effect);
        effect.setPosition(pos);
        effect.zIndex = 30;
        this._setSpriteFrame(effect, this._explosionFrames[0]);
        effect.setContentSize(150, 150);

        let tween = cc.tween(effect);
        for (const frame of this._explosionFrames) {
            tween = tween.call(() => {
                if (effect && effect.isValid) this._setSpriteFrame(effect, frame);
            }).delay(0.065);
        }
        tween.call(() => {
            if (effect && effect.isValid) effect.destroy();
        }).start();
    }

    private _addDiamond(amount: number, pos: cc.Vec2) {
        const gain = Math.max(0, Math.floor(amount || 0));
        if (gain <= 0) return;

        this._coins += gain;
        if (mGameData.addGold) {
            mGameData.addGold(gain);
        } else {
            mGameData.currentGold = Math.max(0, (mGameData.currentGold || 0) + gain);
            if (mGameData.SaveGoldData) mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        GameState.shenpo = Math.max(0, (GameState.shenpo || 0) + gain);
        GameState.save();
        this._floatText(`+${gain}`, pos, cc.color(255, 228, 80));
        this._refreshHud();
    }

    private _formatTime(seconds: number): string {
        const total = Math.max(0, Math.floor(seconds));
        const mm = Math.floor(total / 60);
        const ss = total % 60;
        return `${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`;
    }

    private _floatText(text: string, pos: cc.Vec2, color: cc.Color) {
        const labelNode = new cc.Node('FloatText');
        this.node.addChild(labelNode);
        labelNode.setPosition(pos);
        const label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 24;
        label.lineHeight = 28;
        labelNode.color = color;
        cc.tween(labelNode)
            .by(0.65, { y: 42, opacity: -180 })
            .call(() => labelNode.destroy())
            .start();
    }
}
