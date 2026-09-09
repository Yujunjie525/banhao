import GameState, { getProgress, loadProgress, saveProgress } from './GameState';
import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
import {
    calculateThunderWarriorStars,
    getThunderHeroByIndex,
    getThunderMonster,
    getThunderRune,
    getThunderWarriorLevelConfig,
    getThunderWarriorTotalLevels,
    THUNDER_GLOBAL_CONFIG,
    THUNDER_RACE_CONFIG,
    ThunderWarriorLevelConfig,
    ThunderHeroConfig,
    ThunderMonsterConfig,
    ThunderRaceStageConfig,
} from './ThunderWarriorLevelConfig';
import UserDataSyncManager from '../Manager/UserDataSyncManager';
import TipsManager from '../Load/TipsManager';

const { ccclass, property } = cc._decorator;

const BOARD_SIZE = 6;
const CELL_SIZE = 93;
const BOARD_GAP = 2;
const SWIPE_THRESHOLD = 18;
const HP_FILL_WIDTH = 258;
const ENERGY_FILL_WIDTH = 460;
const LAST_GOLD_KEY = 'ThunderWarriorLastGold';
const RACE_PROGRESS_KEY = 'ThunderWarriorRaceProgress';
const BATTLE_BACKGROUND_COUNT = 5;
const LEVELS_PER_BATTLE_BACKGROUND = 20;
// Keep idle and attack animations at the same, slower playback speed.
const FIGURE_FRAME_DURATION = 0.12;
const BACKGROUND_OVERSCAN = 24;

type BattleState = 'loading' | 'playing' | 'paused' | 'over';

interface MatchResult {
    cells: number[];
}

interface RuneFallMove {
    index: number;
    runeId: string;
    sourceRow: number;
    targetRow: number;
    col: number;
}

@ccclass
export default class ThunderWarriorController extends cc.Component {
    @property(cc.AudioClip)
    battleBgm: cc.AudioClip = null;

    @property(cc.AudioClip)
    clickSfx: cc.AudioClip = null;

    private bgmAudioId: number = -1;
    private canvas: cc.Node = null;
    private root: cc.Node = null;
    private battleLayer: cc.Node = null;
    private boardLayer: cc.Node = null;
    private popupLayer: cc.Node = null;
    private heroHpLabel: cc.Label = null;
    private enemyHpLabel: cc.Label = null;
    private levelLabel: cc.Label = null;
    private timerLabel: cc.Label = null;
    private energyLabel: cc.Label = null;
    private comboLabel: cc.Label = null;
    private skillCooldownLabel: cc.Label = null;
    private skillFlash: cc.Node = null;
    private skillCooldownMask: cc.Node = null;
    private skillCooldownGraphics: cc.Graphics = null;
    private calloutLabel: cc.Label = null;
    private shieldLabel: cc.Label = null;
    private heroHpFill: cc.Node = null;
    private enemyHpFill: cc.Node = null;
    private timerFill: cc.Node = null;
    private energyFill: cc.Node = null;
    private skillButton: cc.Node = null;
    private abandonButton: cc.Node = null;
    private pauseButton: cc.Node = null;
    private popupTitle: cc.Label = null;
    private popupInfo: cc.Label = null;
    private popupGold: cc.Label = null;
    private popupPrimary: cc.Node = null;
    private popupSecondary: cc.Node = null;
    private winResultPopup: cc.Node = null;
    private loseResultPopup: cc.Node = null;
    private gameOverPopup: cc.Node = null;
    private runeNodes: cc.Node[] = [];
    private artFrames: { [path: string]: cc.SpriteFrame } = {};
    private heroFigure: cc.Node = null;
    private monsterFigure: cc.Node = null;
    private heroIdleFrames: cc.SpriteFrame[] = [];
    private heroAttackFrames: cc.SpriteFrame[] = [];
    private monsterIdleFrames: cc.SpriteFrame[] = [];
    private monsterAttackFrames: cc.SpriteFrame[] = [];
    private entityAnimationKey = '';
    private heroAnimationFrames: cc.SpriteFrame[] = [];
    private monsterAnimationFrames: cc.SpriteFrame[] = [];
    private heroAnimationIndex = 0;
    private monsterAnimationIndex = 0;
    private heroAnimationElapsed = 0;
    private monsterAnimationElapsed = 0;
    private heroAnimationIsAttack = false;
    private monsterAnimationIsAttack = false;

    private levelId = 1;
    private levelConfig: ThunderWarriorLevelConfig = null;
    private hero: ThunderHeroConfig = null;
    private monster: ThunderMonsterConfig = null;
    private board: string[] = [];
    private swipeStartIndex = -1;
    private swipeStartPosition = cc.v2();
    private playerHp = 0;
    private enemyHp = 0;
    private thunderEnergy = 0;
    private attackRemaining = 0;
    private skillCooldown = 0;
    private shieldPending = 0;
    private state: BattleState = 'loading';
    private initialized = false;
    private boardLocked = false;
    private resultSaved = false;
    private currentRewardGold = 0;
    private currentStars = 0;
    private pendingPopupMode: 'win' | 'lose' | 'pause' | 'raceAbandon' = 'pause';
    private pendingOutcome: 'win' | 'lose' | 'raceWin' = null;
    private isRaceMode = false;
    private raceStageIndex = 0;
    private raceStage: ThunderRaceStageConfig = null;
    private raceElapsed = 0;
    private raceWeaknessStacks = 0;
    private raceWeaknessRemaining = 0;
    private raceTransitionRemaining = 0;
    private raceSwapCount = 0;
    private raceMaxCombo = 0;
    private raceMaxWeakness = 0;
    private raceRunId = '';
    private raceRandomState = 1;
    private raceMonsterLoadId = 0;
    private raceDefeatedHp = 0;
    private raceScoreReported = false;
    private guideLayer: cc.Node = null;
    private guideEnergyTarget: cc.Node = null;
    private guideFinger: cc.Node = null;

    onLoad() {
        StateBridge.syncForStartScene();
        if (mGameData.isBGMOn && this.battleBgm) {
            this.bgmAudioId = cc.audioEngine.play(this.battleBgm, true, 1);
        }
        this.canvas = this.node.parent || this.node;
        this._loadBattleConfig();
        this._buildScene();
        this._loadArt(() => {
            if (!cc.isValid(this.node)) return;
            this._buildScene();
            this.initialized = true;
            this._startBattle();
        });
    }

    onDestroy() {
        if (this.bgmAudioId >= 0) {
            cc.audioEngine.stop(this.bgmAudioId);
            this.bgmAudioId = -1;
        }
    }

    private playClick() {
        if (mGameData.isSoundOn && this.clickSfx) {
            cc.audioEngine.play(this.clickSfx, false, 1);
        }
    }

    private _loadArt(done: () => void) {
        const names = [
            'beijing', 'beijing2', 'beijing3', 'beijing4', 'beijing5',
            'dikuang', 'dikuang2', 'gongji', 'juese1', 'juese2',
            'xuetiao1', 'xuetiao2', 'xuetiao3', 'xuetiaodi', 'zanting1', 'zanting2',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
            'resultStarFull', 'resultStarGray', 'popupContinue', 'popupRetry',
        ];
        const paths = names.map((name) => {
            if (name === 'resultStarFull') return '2Main1/xingxing1';
            if (name === 'resultStarGray') return '2Main1/xingxing2';
            if (name === 'popupContinue') return '2Main1/anniujixuyouxi';
            if (name === 'popupRetry') return '2Main1/anniuchognxintiaozhan';
            return '3game/' + name;
        });
        cc.loader.loadResArray(paths, cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[]) => {
            if (error) {
                cc.error('[ThunderWarrior] failed to load 3game art', error);
                this._loadEntityAnimations(done);
                return;
            }
            for (let i = 0; i < frames.length; i++) {
                this.artFrames[names[i]] = frames[i];
            }
            this._loadEntityAnimations(done);
        });
    }

    update(dt: number) {
        if (!this.initialized || this.state !== 'playing') return;
        dt = Math.max(0, dt);
        this._updateFigureAnimations(dt);
        if (this.isRaceMode) {
            this._updateRace(dt);
            this._updateHud();
            return;
        }
        dt = Math.min(0.08, dt);
        this.skillCooldown = Math.max(0, this.skillCooldown - dt);
        this.attackRemaining -= dt;
        if (this.attackRemaining <= 0 && !this.boardLocked) {
            this._resolveEnemyAttack();
        }
        this._updateHud();
    }

    private _loadBattleConfig() {
        loadProgress();
        this.isRaceMode = !!mGameData.isInfiniteMode;
        const total = getThunderWarriorTotalLevels();
        const selected = Math.max(1, Math.floor(Number(GameState.selectedLevel || mGameData.currentLevel || 1) || 1));
        this.levelId = Math.max(1, Math.min(total, selected));
        GameState.selectedLevel = this.levelId;
        this.levelConfig = getThunderWarriorLevelConfig(this.levelId);
        this.hero = getThunderHeroByIndex(mGameData.currentRole || 0);
        if (this.isRaceMode) {
            this.raceStageIndex = 0;
            this.raceStage = THUNDER_RACE_CONFIG.raceStages[0];
            this.monster = getThunderMonster(this.raceStage.monsterId);
        } else {
            mGameData.currentLevel = this.levelId;
            this.monster = getThunderMonster(this.levelConfig.monsterId);
        }
    }

    private _startBattle() {
        this.raceMonsterLoadId += 1;
        this.state = 'playing';
        this.boardLocked = false;
        this.resultSaved = false;
        this.swipeStartIndex = -1;
        this.playerHp = this.isRaceMode ? 0 : this.levelConfig.playerHp;
        this.enemyHp = this.isRaceMode ? this.raceStage.enemyHp : this.levelConfig.enemyHp;
        this.thunderEnergy = 0;
        this.attackRemaining = this.isRaceMode ? 0 : this.levelConfig.attackInterval;
        this.skillCooldown = 0;
        this.shieldPending = 0;
        this.currentRewardGold = 0;
        this.currentStars = 0;
        this.pendingOutcome = null;
        if (this.isRaceMode) this._resetRaceRun();
        this.board = this._createBoard();
        this._applyAvailableArtVisibility();
        this.popupLayer.active = false;
        [this.winResultPopup, this.loseResultPopup, this.gameOverPopup].forEach((popup) => {
            if (!popup) return;
            this._updatePopupStars(popup, 0);
            popup.active = false;
        });
        this._renderBoard();
        this._showCallout(this.isRaceMode ? '雷霆追猎开始，满20能量自动攻击。' : '风暴逼近，滑动符文蓄雷。');
        this._updateHud();
        this._setupGuide();
        this._loadEntityAnimations(() => {
            this._playHeroIdle();
            this._playMonsterIdle();
        });
    }

    private _setupGuide() {
        this.guideLayer = this._findDeep(this.canvas, 'GuideLayer');
        if (!this.guideLayer) return;

        this.guideEnergyTarget = this.guideLayer.getChildByName('EnergyBarBg');
        this.guideFinger = this.guideLayer.getChildByName('shouzhi');
        const guideCompleted = UserDataSyncManager.hasThunderWarriorGuideCompleted(this.isRaceMode);
        if (!this.guideEnergyTarget || guideCompleted) {
            this.guideLayer.active = false;
            if (this.guideFinger) {
                this.guideFinger.stopAllActions();
                this.guideFinger.active = false;
            }
            return;
        }

        this.guideEnergyTarget.off(cc.Node.EventType.TOUCH_END, this._onGuideEnergyClick, this);
        this.guideEnergyTarget.on(cc.Node.EventType.TOUCH_END, this._onGuideEnergyClick, this);
        this.guideLayer.active = true;
        this.boardLocked = true;
        if (this.guideFinger) {
            this.guideFinger.active = true;
            this.guideFinger.stopAllActions();
            this.guideFinger.scale = 1;
            this.guideFinger.runAction(cc.repeatForever(cc.sequence(
                cc.scaleTo(0.45, 1.12),
                cc.scaleTo(0.45, 1)
            )));
        }
    }

    private _onGuideEnergyClick() {
        if (!this.guideLayer || !this.guideLayer.active) return;
        UserDataSyncManager.completeThunderWarriorGuide(this.isRaceMode);
        this.guideLayer.active = false;
        if (this.guideFinger) {
            this.guideFinger.stopAllActions();
            this.guideFinger.active = false;
        }
        this.boardLocked = false;
        this._updateHud();
    }

    private _loadEntityAnimations(done: () => void) {
        const roleIndex = Math.max(0, Math.min(4, Math.floor(Number(mGameData.currentRole) || 0)));
        const monsterMatch = String(this.monster && this.monster.entityId || '').match(/(\d+)/);
        const monsterIndex = Math.max(1, Math.min(6, monsterMatch ? Number(monsterMatch[1]) : 1));
        const key = roleIndex + ':' + monsterIndex;
        if (this.entityAnimationKey === key) {
            done();
            return;
        }

        const loaded: { [name: string]: cc.SpriteFrame[] } = {};
        const requests = [
            { name: 'heroIdle', path: 'anim/role/' + (roleIndex + 1) + '/idle' },
            { name: 'heroAttack', path: 'anim/role/' + (roleIndex + 1) + '/attack' },
            { name: 'monsterIdle', path: 'anim/monster/' + monsterIndex + '/idle' },
            { name: 'monsterAttack', path: 'anim/monster/' + monsterIndex + '/attack' },
        ];
        let remaining = requests.length;
        const finish = () => {
            remaining -= 1;
            if (remaining > 0) return;
            this.heroIdleFrames = loaded.heroIdle || [];
            this.heroAttackFrames = loaded.heroAttack || [];
            this.monsterIdleFrames = loaded.monsterIdle || [];
            this.monsterAttackFrames = loaded.monsterAttack || [];
            this.entityAnimationKey = key;
            done();
        };

        requests.forEach((request) => {
            cc.loader.loadResDir(request.path, cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
                if (error || !frames || frames.length <= 0) {
                    cc.warn('[ThunderWarrior] failed to load figure animation:', request.path, error);
                    loaded[request.name] = [];
                    finish();
                    return;
                }
                loaded[request.name] = frames
                    .map((frame, index) => ({ frame, url: urls && urls[index] ? urls[index] : frame.name }))
                    .sort((a, b) => this._getAnimationFrameSortValue(a.url) - this._getAnimationFrameSortValue(b.url))
                    .map((item) => item.frame);
                finish();
            });
        });
    }

    private _getAnimationFrameSortValue(url: string): number {
        const match = String(url || '').match(/(\d+)(?!.*\d)/);
        return match ? Number(match[1]) : 0;
    }

    private _getAttackAnimationRemaining(frames: cc.SpriteFrame[], index: number, elapsed: number, isAttack: boolean): number {
        if (!isAttack || !frames || frames.length <= 0) return 0;
        return Math.max(0, (frames.length - index - 1) * FIGURE_FRAME_DURATION
            + Math.max(0, FIGURE_FRAME_DURATION - elapsed));
    }

    private _getPendingOutcomeAnimationDuration(): number {
        return Math.max(
            this._getAttackAnimationRemaining(this.heroAnimationFrames, this.heroAnimationIndex, this.heroAnimationElapsed, this.heroAnimationIsAttack),
            this._getAttackAnimationRemaining(this.monsterAnimationFrames, this.monsterAnimationIndex, this.monsterAnimationElapsed, this.monsterAnimationIsAttack)
        );
    }

    private _playHeroIdle() {
        this._playFigureAnimation(this.heroFigure, this.heroIdleFrames, false);
    }

    private _playHeroAttack() {
        this._playFigureAnimation(this.heroFigure, this.heroAttackFrames, true);
    }

    private _playMonsterIdle() {
        this._playFigureAnimation(this.monsterFigure, this.monsterIdleFrames, false);
    }

    private _playMonsterAttack() {
        this._playFigureAnimation(this.monsterFigure, this.monsterAttackFrames, true);
    }

    private _playFigureAnimation(node: cc.Node, frames: cc.SpriteFrame[], attack: boolean) {
        if (!node || !frames || frames.length <= 0) return;
        const isHero = node === this.heroFigure;
        if (isHero) {
            this.heroAnimationFrames = frames;
            this.heroAnimationIndex = 0;
            this.heroAnimationElapsed = 0;
            this.heroAnimationIsAttack = attack;
        } else {
            this.monsterAnimationFrames = frames;
            this.monsterAnimationIndex = 0;
            this.monsterAnimationElapsed = 0;
            this.monsterAnimationIsAttack = attack;
        }
        this._applyFigureFrame(node, frames[0]);
    }

    private _applyFigureFrame(node: cc.Node, frame: cc.SpriteFrame) {
        if (!node || !frame) return;
        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        sprite.spriteFrame = frame;
        sprite.trim = false;
        // Animation frames keep their imported/original canvas size.
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    private _updateFigureAnimations(dt: number) {
        this._advanceFigureAnimation(this.heroFigure, this.heroAnimationFrames, true, dt);
        this._advanceFigureAnimation(this.monsterFigure, this.monsterAnimationFrames, false, dt);
    }

    private _advanceFigureAnimation(node: cc.Node, frames: cc.SpriteFrame[], isHero: boolean, dt: number) {
        if (!node || !frames || frames.length <= 1) return;
        let elapsed = isHero ? this.heroAnimationElapsed : this.monsterAnimationElapsed;
        let index = isHero ? this.heroAnimationIndex : this.monsterAnimationIndex;
        const isAttack = isHero ? this.heroAnimationIsAttack : this.monsterAnimationIsAttack;
        elapsed += dt;
        while (elapsed >= FIGURE_FRAME_DURATION) {
            elapsed -= FIGURE_FRAME_DURATION;
            index += 1;
            if (index >= frames.length) {
                if (isAttack) {
                    this._playFigureAnimation(node, isHero ? this.heroIdleFrames : this.monsterIdleFrames, false);
                    return;
                }
                index = 0;
            }
        }
        if (isHero) {
            this.heroAnimationElapsed = elapsed;
            this.heroAnimationIndex = index;
        } else {
            this.monsterAnimationElapsed = elapsed;
            this.monsterAnimationIndex = index;
        }
        this._applyFigureFrame(node, frames[index]);
    }

    private _buildScene() {
        this.root = this._node('ThunderWarriorScene', this.canvas, 720, 1280, cc.v2(0, 0));
        this.battleLayer = this._node('BattleLayer', this.root, 720, 1280, cc.v2(0, 0));

        const backgroundLayer = this._node('BackgroundLayer', this.battleLayer, 720, 1280, cc.v2(0, 0));
        this._sprite('LowerBackground', backgroundLayer, 'beijing2', 720, 803, cc.v2(0, -238.5));
        this._sprite('BattleBackground', backgroundLayer, this._getBattleBackgroundName(), 720, 484, cc.v2(0, 398));
        this._sprite('TopFrame', backgroundLayer, 'dikuang', 720, 90, cc.v2(0, 595));

        this._buildTopArea();
        this._buildConsoleArea();
        this._buildBoardArea();
        this._buildPopup();
        this._applyViewportLayout();
    }

    private _getBattleBackgroundName(): string {
        const level = Math.max(1, Math.floor(Number(this.levelId) || 1));
        const backgroundIndex = Math.max(
            1,
            Math.min(BATTLE_BACKGROUND_COUNT, Math.ceil(level / LEVELS_PER_BATTLE_BACKGROUND))
        );
        return backgroundIndex === 1 ? 'beijing' : 'beijing' + backgroundIndex;
    }

    private _buildTopArea() {
        this._label('Title', this.battleLayer, '', 34, cc.v2(0, 590), cc.Color.WHITE);
        this.levelLabel = this._label('LevelLabel', this.battleLayer, '', 22, cc.v2(0, 553), new cc.Color(255, 96, 96, 255));
        this.pauseButton = this._button('PauseButton', this.battleLayer, '', 66, 66, cc.v2(270, 578), () => this._pauseBattle(), cc.Color.WHITE, 'zanting1');

        const stage = this._node('CombatStage', this.battleLayer, 720, 484, cc.v2(0, 398));
        this.heroFigure = this._makeHeroFigure(stage, 'HeroFigure', cc.v2(-225, -78), 'juese1', 265, 224);
        this.monsterFigure = this._makeHeroFigure(stage, 'MonsterFigure', cc.v2(225, -78), 'juese2', 257, 213);

        this.heroHpLabel = this._label('HeroHpLabel', stage, '', 30, cc.v2(-185, 93), new cc.Color(22, 196, 55, 255));
        this.enemyHpLabel = this._label('EnemyHpLabel', stage, '', 30, cc.v2(185, 93), new cc.Color(231, 68, 207, 255));
        this.heroHpFill = this._bar('HeroHp', stage, HP_FILL_WIDTH, 280, cc.v2(-185, 63), 'xuetiao1');
        this.enemyHpFill = this._bar('EnemyHp', stage, HP_FILL_WIDTH, 280, cc.v2(185, 63), 'xuetiao2');
        this.calloutLabel = this._label('Callout', stage, '', 22, cc.v2(0, -216), new cc.Color(255, 232, 174, 255));
        this.calloutLabel.node.width = 600;
        this.calloutLabel.node.height = 54;
        this.calloutLabel.node.zIndex = 20;
        this.calloutLabel.overflow = cc.Label.Overflow.SHRINK;
        this.calloutLabel.node.active = false;
    }

    private _buildConsoleArea() {
        const consoleArea = this._node('ConsoleArea', this.battleLayer, 720, 170, cc.v2(0, 0));

        const timerTitle = this._label('TimerTitle', consoleArea, '', 19, cc.v2(0, 0), cc.Color.WHITE);
        timerTitle.node.active = false;
        this.timerLabel = this._label('TimerLabel', consoleArea, '', 22, cc.v2(0, 0), cc.Color.WHITE);
        this.timerLabel.node.active = false;
        const timerBg = consoleArea.getChildByName('TimerBarBg');
        this.timerFill = timerBg && timerBg.getChildByName('TimerBarFill');
        if (timerBg) timerBg.active = false;

        const energyTitle = this._label('EnergyTitle', consoleArea, '', 19, cc.v2(0, 0), cc.Color.WHITE);
        energyTitle.node.active = false;
        this.energyLabel = this._label('EnergyLabel', consoleArea, '', 18, cc.v2(-72, 134), cc.Color.WHITE);
        this.energyLabel.node.active = false;
        this.energyFill = this._bar('EnergyBar', consoleArea, ENERGY_FILL_WIDTH, 499, cc.v2(-72, 103), 'xuetiao3');
        this._label('Thresholds', consoleArea, '', 23, cc.v2(-72, 137), cc.Color.WHITE).node.active = false;
        this._label('EnergyMark0', consoleArea, '0', 23, cc.v2(-285, 137), cc.Color.WHITE);
        this._label('EnergyMark10', consoleArea, '10', 23, cc.v2(-72, 137), cc.Color.WHITE);
        this._label('EnergyMark20', consoleArea, '20', 23, cc.v2(143, 137), cc.Color.WHITE);

        const comboNode = consoleArea.getChildByName('ComboLabel');
        this.comboLabel = comboNode && comboNode.getComponent(cc.Label);
        if (this.comboLabel) this.comboLabel.node.active = false;
        const shieldNode = consoleArea.getChildByName('ShieldLabel');
        this.shieldLabel = shieldNode && shieldNode.getComponent(cc.Label);
        if (this.shieldLabel) this.shieldLabel.node.active = false;
        this.skillButton = this._button('SkillButton', consoleArea, '', 110, 119, cc.v2(275, 145), () => this._useSkill(), cc.Color.WHITE, 'gongji');
        this.skillFlash = this._sprite('SkillFlash', this.skillButton, 'gongji', 110, 119, cc.v2(0, 0));
        this.skillFlash.zIndex = 4;
        this.skillFlash.active = false;
        this.skillCooldownMask = this._node('SkillCooldownMask', this.skillButton, 120, 120, cc.v2(0, 0));
        this.skillCooldownMask.width = 120;
        this.skillCooldownMask.height = 120;
        this.skillCooldownMask.setPosition(0, 0);
        this.skillCooldownMask.zIndex = 3;
        this.skillCooldownGraphics = this.skillCooldownMask.getComponent(cc.Graphics) || this.skillCooldownMask.addComponent(cc.Graphics);
        this.skillCooldownMask.active = false;
        this.skillCooldownLabel = this._label('SkillCooldown', this.skillButton, '', 18, cc.v2(0, -50), cc.Color.WHITE);
        this.skillCooldownLabel.node.width = 100;
        this.skillCooldownLabel.node.height = 30;
        this.skillCooldownLabel.node.zIndex = 3;
        this.skillCooldownLabel.node.active = false;

        this.abandonButton = this._node('anniufangqi', consoleArea, 137, 64, cc.v2(263.548, 115.24));
        this.abandonButton.off(cc.Node.EventType.TOUCH_END, this._onAbandonRaceClick, this);
        this.abandonButton.on(cc.Node.EventType.TOUCH_END, () => {
            this.playClick();
            this._onAbandonRaceClick();
        }, this);
    }

    private _buildBoardArea() {
        const shell = this._sprite('BoardShell', this.battleLayer, 'dikuang2', 688, 711, cc.v2(0, -268), true);
        this.boardLayer = this._node('RuneBoard', shell, 570, 570, cc.v2(0, 2));
        this.runeNodes.length = 0;
        for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
            const row = Math.floor(i / BOARD_SIZE);
            const col = i % BOARD_SIZE;
            const x = (col - (BOARD_SIZE - 1) / 2) * (CELL_SIZE + BOARD_GAP);
            const y = ((BOARD_SIZE - 1) / 2 - row) * (CELL_SIZE + BOARD_GAP);
            const cell = this._node('RuneCell' + i, this.boardLayer, CELL_SIZE, CELL_SIZE, cc.v2(x, y));
            cell.width = CELL_SIZE;
            cell.height = CELL_SIZE;
            cell.setPosition(x, y);
            this._setSprite(cell, '1', false, false);
            const label = this._label('RuneLabel', cell, '', 30, cc.v2(0, 6), cc.Color.WHITE);
            label.node.width = CELL_SIZE;
            label.node.height = CELL_SIZE;
            label.node.active = false;
            cell.off(cc.Node.EventType.TOUCH_START);
            cell.off(cc.Node.EventType.TOUCH_MOVE);
            cell.off(cc.Node.EventType.TOUCH_END);
            cell.off(cc.Node.EventType.TOUCH_CANCEL);
            cell.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => this._onRuneTouchStart(i, event), this);
            cell.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => this._onRuneTouchMove(i, event), this);
            cell.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => this._onRuneTouchEnd(i, event), this);
            cell.on(cc.Node.EventType.TOUCH_CANCEL, () => this._onRuneTouchCancel(i), this);
            this.runeNodes.push(cell);
        }
    }

    private _buildPopup() {
        this.popupLayer = this._findDeep(this.canvas, 'PopupLayer') || this._node('PopupLayer', this.canvas, 720, 1280, cc.v2(0, 0));
        this._drawPanel(this.popupLayer, 720, 1280, new cc.Color(0, 0, 0, 178), new cc.Color(0, 0, 0, 0));
        const panel = this.popupLayer.getChildByName('Panel') || this._node('Panel', this.popupLayer, 560, 430, cc.v2(0, 0));
        this._drawPanel(panel, 560, 430, new cc.Color(21, 34, 42, 255), new cc.Color(185, 251, 255, 255));
        this.popupTitle = this._label('Title', panel, '', 34, cc.v2(0, 150), cc.Color.WHITE);
        this.popupInfo = this._label('Info', panel, '', 23, cc.v2(0, 64), new cc.Color(217, 227, 231, 255));
        this.popupInfo.node.width = 480;
        this.popupInfo.node.height = 44;
        this.popupInfo.node.setPosition(0, -92);
        this.popupInfo.node.color = new cc.Color(104, 55, 28, 255);
        this.popupInfo.fontSize = 30;
        this.popupInfo.lineHeight = 36;
        this.popupInfo.overflow = cc.Label.Overflow.SHRINK;
        this.popupInfo.enableWrapText = true;
        this.popupGold = this._label('Gold', panel, '', 24, cc.v2(0, -28), new cc.Color(241, 196, 83, 255));
        this.popupGold.node.width = 480;
        this.popupGold.overflow = cc.Label.Overflow.SHRINK;
        this.popupSecondary = this._button('BackBtn', panel, '返回主界面', 210, 64, cc.v2(-122, -146), () => this._onPopupSecondary(), new cc.Color(54, 72, 82, 255));
        this.popupPrimary = this._button('PrimaryBtn', panel, '再试一次', 210, 64, cc.v2(122, -146), () => this._onPopupPrimary(), new cc.Color(98, 228, 235, 255));
        this._bindLegacyResultPopups();
        this.popupLayer.active = false;
    }

    private _bindLegacyResultPopups() {
        this.winResultPopup = this._findDeep(this.canvas, 'WinResultPopup');
        this.loseResultPopup = this._findDeep(this.canvas, 'LoseResultPopup');
        this.gameOverPopup = this._findDeep(this.canvas, 'GameOverPopup');
        [this.winResultPopup, this.loseResultPopup, this.gameOverPopup].forEach((popup) => {
            if (popup) popup.active = false;
        });
        this._bindPopupNode(this.winResultPopup, 'nextBtn', () => this._onPopupPrimary());
        this._bindPopupNode(this.winResultPopup, 'backBtn', () => this._onPopupSecondary());
        this._bindPopupNode(this.loseResultPopup, 'retryBtn', () => this._onPopupPrimary());
        this._bindPopupNode(this.loseResultPopup, 'backBtn', () => this._onPopupSecondary());
        this._bindPopupNode(this.gameOverPopup, 'retryBtn', () => this._onPopupPrimary());
        this._bindPopupNode(this.gameOverPopup, 'backBtn', () => this._onPopupSecondary());
    }

    private _bindPopupNode(popup: cc.Node, buttonName: string, callback: () => void) {
        const panel = popup && (popup.getChildByName('panel') || popup.getChildByName('Panel'));
        const button = panel && panel.getChildByName(buttonName);
        if (!button) return;
        button.off(cc.Node.EventType.TOUCH_END);
        button.on(cc.Node.EventType.TOUCH_END, () => {
            this.playClick();
            callback();
        }, this);
    }

    private _onRuneTouchStart(index: number, event: cc.Event.EventTouch) {
        if (this.state !== 'playing' || this.boardLocked) return;
        this.swipeStartIndex = index;
        this.swipeStartPosition = event.getLocation();
    }

    private _onRuneTouchEnd(index: number, event: cc.Event.EventTouch) {
        if (!this._finishRuneSwipe(index, event)) this.swipeStartIndex = -1;
    }

    private _onRuneTouchMove(index: number, event: cc.Event.EventTouch) {
        this._finishRuneSwipe(index, event);
    }

    private _onRuneTouchCancel(index: number) {
        if (this.swipeStartIndex === index && !this.boardLocked) this.swipeStartIndex = -1;
    }

    private _finishRuneSwipe(index: number, event: cc.Event.EventTouch): boolean {
        if (this.state !== 'playing' || this.boardLocked || this.swipeStartIndex !== index) return false;
        const startIndex = this.swipeStartIndex;
        const end = event.getLocation();
        const dx = end.x - this.swipeStartPosition.x;
        const dy = end.y - this.swipeStartPosition.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return false;
        this.swipeStartIndex = -1;

        const row = Math.floor(startIndex / BOARD_SIZE);
        const col = startIndex % BOARD_SIZE;
        let targetRow = row;
        let targetCol = col;
        if (Math.abs(dx) > Math.abs(dy)) targetCol += dx > 0 ? 1 : -1;
        else targetRow += dy > 0 ? -1 : 1;
        if (targetRow < 0 || targetRow >= BOARD_SIZE || targetCol < 0 || targetCol >= BOARD_SIZE) return true;
        this._trySwap(startIndex, targetRow * BOARD_SIZE + targetCol);
        return true;
    }

    private _trySwap(from: number, to: number) {
        if (!this._isAdjacent(from, to)) return;
        if (this.isRaceMode) this.raceSwapCount += 1;
        this.boardLocked = true;
        const fromNode = this.runeNodes[from];
        const toNode = this.runeNodes[to];
        const fromPosition = fromNode.getPosition();
        const toPosition = toNode.getPosition();
        const valid = this._swapCreatesMatch(this.board, from, to);
        const finish = () => {
            fromNode.setPosition(fromPosition);
            toNode.setPosition(toPosition);
            if (!valid) {
                this.boardLocked = false;
                this._showCallout('未形成三连，符文弹回。');
                return;
            }
            this._swap(from, to);
            this._renderBoard();
            this._resolveMatches();
        };
        if (!valid) {
            fromNode.runAction(cc.sequence(cc.moveTo(0.08, toPosition), cc.moveTo(0.08, fromPosition), cc.callFunc(finish)));
            toNode.runAction(cc.sequence(cc.moveTo(0.08, fromPosition), cc.moveTo(0.08, toPosition)));
        } else {
            fromNode.runAction(cc.sequence(cc.moveTo(0.1, toPosition), cc.callFunc(finish)));
            toNode.runAction(cc.moveTo(0.1, fromPosition));
        }
    }

    private _resolveMatches(combo: number = 0, totalEnergy: number = 0) {
        if (this.state !== 'playing' && this.state !== 'paused') return;
        this.boardLocked = true;
        const result = this._findMatches();
        if (result.cells.length <= 0) {
            this.thunderEnergy = Math.max(0, this.thunderEnergy + totalEnergy);
            if (this.isRaceMode) this.raceMaxCombo = Math.max(this.raceMaxCombo, combo);
            if (totalEnergy > 0) {
                this._showCallout(combo > 1 ? '雷霆连消 x' + combo + '，蓄雷 +' + totalEnergy + '。' : '符文消除，蓄雷 +' + totalEnergy + '。');
                this.comboLabel.string = combo > 1 ? 'Combo x' + combo + '  +' + totalEnergy : '蓄雷 +' + totalEnergy;
            }
            this._ensurePossibleBoard();
            this._renderBoard();
            this.boardLocked = false;
            this._saveBattleCheckpoint();
            if (this.isRaceMode && this.state === 'playing') this._processRaceAttacks();
            this._updateHud();
            return;
        }

        const nextCombo = combo + 1;
        const nextEnergy = totalEnergy + result.cells.length + (nextCombo > 1 ? THUNDER_GLOBAL_CONFIG.thunderComboBonus : 0);
        for (let i = 0; i < result.cells.length; i++) {
            this.runeNodes[result.cells[i]].runAction(cc.spawn(cc.scaleTo(0.12, 0.82), cc.fadeTo(0.12, 0)));
        }
        this.scheduleOnce(() => {
            // Pausing freezes battle timers, but an in-flight board animation must finish and release boardLocked.
            if (this.state !== 'playing' && this.state !== 'paused') return;
            for (let i = 0; i < result.cells.length; i++) this.board[result.cells[i]] = '';
            const fallMoves = this._collapseAndFillBoard();
            this._animateBoardFall(fallMoves, () => this._resolveMatches(nextCombo, nextEnergy));
        }, 0.12);
    }

    private _applyAvailableArtVisibility() {
        // Reuse the available battle figures as placeholders until per-entity art is delivered.
        if (this.heroFigure) this.heroFigure.active = true;
        if (this.monsterFigure) this.monsterFigure.active = true;
        [
            this.heroHpFill && this.heroHpFill.parent,
            this.enemyHpFill && this.enemyHpFill.parent,
            this.heroHpLabel && this.heroHpLabel.node,
            this.enemyHpLabel && this.enemyHpLabel.node,
        ].forEach((node: cc.Node) => {
            if (!node) return;
            node.stopAllActions();
            node.opacity = 255;
            node.active = true;
        });
        if (this.skillButton) this.skillButton.active = !this.isRaceMode;
        if (this.abandonButton) this.abandonButton.active = this.isRaceMode;
        if (this.heroHpLabel) this.heroHpLabel.node.active = !this.isRaceMode;
        if (this.heroHpFill && this.heroHpFill.parent) this.heroHpFill.parent.active = !this.isRaceMode;
        if (this.comboLabel) this.comboLabel.node.active = this.isRaceMode;
        if (this.shieldLabel) this.shieldLabel.node.active = this.isRaceMode;
    }

    private _applyViewportLayout() {
        if (!this.root || !this.battleLayer) return;
        const visible = cc.view.getVisibleSize();
        const viewportHeight = visible.width > 0 ? visible.height * 720 / visible.width : 1280;
        const extraHeight = Math.max(0, viewportHeight - 1280);
        this.root.height = Math.max(1280, viewportHeight);
        this.battleLayer.height = this.root.height;

        const backgroundLayer = this.battleLayer.getChildByName('BackgroundLayer');
        const lowerBackground = backgroundLayer && backgroundLayer.getChildByName('LowerBackground');
        const battleBackground = backgroundLayer && backgroundLayer.getChildByName('BattleBackground');
        if (backgroundLayer) backgroundLayer.height = this.root.height;
        if (lowerBackground) {
            const baseHeight = 803 + extraHeight / 2;
            // Extend below the viewport so rounding and device safe-area differences cannot expose the clear color.
            lowerBackground.height = baseHeight + BACKGROUND_OVERSCAN;
            lowerBackground.y = -238.5 - extraHeight / 4 - BACKGROUND_OVERSCAN / 2;
        }
        if (battleBackground) {
            battleBackground.height = 484 + extraHeight / 2;
            battleBackground.y = 398 + extraHeight / 4;
        }
    }

    private _resolveEnemyAttack() {
        if (this.state !== 'playing') return;
        this.attackRemaining = this.levelConfig.attackInterval;
        this._playMonsterAttack();
        if (this.shieldPending > 0) {
            this.shieldPending -= 1;
            this._showCallout('不灭雷盾：免费格挡。');
        } else if (this.thunderEnergy >= THUNDER_GLOBAL_CONFIG.thunderCounterCost) {
            this.thunderEnergy -= THUNDER_GLOBAL_CONFIG.thunderCounterCost;
            this.enemyHp = Math.max(0, this.enemyHp - this.levelConfig.thunderCounterDamage);
            this._playHeroAttack();
            this._showCallout('天雷反击，造成 ' + this.levelConfig.thunderCounterDamage + ' 伤害。');
        } else if (this.thunderEnergy >= THUNDER_GLOBAL_CONFIG.stormShieldCost) {
            this.thunderEnergy -= THUNDER_GLOBAL_CONFIG.stormShieldCost;
            this._showCallout('雷盾格挡，免疫本次伤害。');
        } else {
            this.playerHp = Math.max(0, this.playerHp - this.levelConfig.monsterAttack);
            this._showCallout('破甲受击，生命 -' + this.levelConfig.monsterAttack + '。');
        }
        this._saveBattleCheckpoint();
        if (this.enemyHp <= 0) {
            this._finishWin();
        } else if (this.playerHp <= 0) {
            this._finishLose();
        } else {
            this._updateHud();
        }
    }

    private _resetRaceRun() {
        this.raceStageIndex = 0;
        this.raceStage = THUNDER_RACE_CONFIG.raceStages[0];
        this.monster = getThunderMonster(this.raceStage.monsterId);
        this.enemyHp = this.raceStage.enemyHp;
        this.raceElapsed = 0;
        this.raceWeaknessStacks = 0;
        this.raceWeaknessRemaining = 0;
        this.raceTransitionRemaining = 0;
        this.raceSwapCount = 0;
        this.raceMaxCombo = 0;
        this.raceMaxWeakness = 0;
        this.raceRunId = THUNDER_RACE_CONFIG.configVersion + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        this.raceRandomState = this._seedToNumber(THUNDER_RACE_CONFIG.fixedSeed);
        this.raceDefeatedHp = 0;
        this.raceScoreReported = false;
    }

    private _updateRace(dt: number) {
        this.raceElapsed += dt;
        if (this.raceWeaknessRemaining > 0) {
            this.raceWeaknessRemaining = Math.max(0, this.raceWeaknessRemaining - dt);
            if (this.raceWeaknessRemaining <= 0) this.raceWeaknessStacks = 0;
        }

        if (this.raceTransitionRemaining > 0) {
            this.raceTransitionRemaining = Math.max(0, this.raceTransitionRemaining - dt);
            if (this.raceTransitionRemaining <= 0) this._enterCurrentRaceStage();
            return;
        }

        if (!this.boardLocked && this.thunderEnergy >= THUNDER_RACE_CONFIG.energyCostPerAttack) {
            this._processRaceAttacks();
        }
    }

    private _processRaceAttacks() {
        if (!this.isRaceMode || this.state !== 'playing' || this.raceTransitionRemaining > 0 || !this.raceStage) return;
        const energyCost = THUNDER_RACE_CONFIG.energyCostPerAttack;
        let lastDamage = 0;
        let attackCount = 0;
        while (this.thunderEnergy >= energyCost && this.state === 'playing' && this.raceTransitionRemaining <= 0) {
            this.thunderEnergy -= energyCost;
            lastDamage = Math.floor(this.raceStage.attackDamage * (1 + this.raceWeaknessStacks * THUNDER_RACE_CONFIG.weaknessDamagePerStack));
            this.enemyHp = Math.max(0, this.enemyHp - lastDamage);
            attackCount += 1;
            this._playHeroAttack();
            this._playRaceAttackEffect(attackCount);

            if (this.enemyHp <= 0) {
                this.raceDefeatedHp += Math.max(0, Math.floor(Number(this.raceStage.enemyHp) || 0));
                if (this.raceStageIndex >= THUNDER_RACE_CONFIG.raceStages.length - 1) {
                    this._finishRaceWin();
                } else {
                    this._beginRaceMonsterTransition();
                }
                break;
            }

            this.raceWeaknessStacks += 1;
            this.raceWeaknessRemaining = THUNDER_RACE_CONFIG.weaknessDurationSec;
            this.raceMaxWeakness = Math.max(this.raceMaxWeakness, this.raceWeaknessStacks);
        }

        if (attackCount > 0 && this.state === 'playing') {
            const suffix = attackCount > 1 ? '，连续攻击' + attackCount + '次。' : '。';
            this._showCallout('满能落雷，最后造成' + lastDamage + '伤害' + suffix);
        }
        this._updateHud();
    }

    private _playRaceAttackEffect(order: number) {
        if (!this.monsterFigure) return;
        const delay = Math.max(0, order - 1) * 0.15;
        this.monsterFigure.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.scaleTo(0.06, 1.08),
            cc.scaleTo(0.09, 1)
        ));
    }

    private _beginRaceMonsterTransition() {
        if (!this.isRaceMode) return;
        this.raceStageIndex += 1;
        this.raceWeaknessStacks = 0;
        this.raceWeaknessRemaining = 0;
        this.raceTransitionRemaining = THUNDER_RACE_CONFIG.monsterTransitionSec;
        this.boardLocked = true;
        this.enemyHp = 0;
        if (this.monsterFigure) this.monsterFigure.runAction(cc.fadeOut(0.18));
        this._showCallout('目标击破，下一只怪物正在入场。');
    }

    private _enterCurrentRaceStage() {
        if (!this.isRaceMode) return;
        this.raceStage = THUNDER_RACE_CONFIG.raceStages[this.raceStageIndex];
        this.monster = getThunderMonster(this.raceStage.monsterId);
        this.enemyHp = this.raceStage.enemyHp;
        this.boardLocked = true;
        const loadId = ++this.raceMonsterLoadId;
        if (this.monsterFigure) {
            this.monsterFigure.stopAllActions();
            this.monsterFigure.active = true;
            this.monsterFigure.opacity = 0;
        }
        this._loadEntityAnimations(() => {
            if (!cc.isValid(this.node) || loadId !== this.raceMonsterLoadId || this.state !== 'playing') return;
            this._playMonsterIdle();
            if (this.monsterFigure) this.monsterFigure.runAction(cc.fadeIn(0.2));
            this.boardLocked = false;
            this._showCallout(this.monster.name + '进入战场。');
            this._updateHud();
            this._processRaceAttacks();
        });
    }

    private _finishRaceWin() {
        if (this.state === 'over' || this.pendingOutcome) return;
        this._queueOutcome('raceWin');
    }

    private _finishRaceWinNow() {
        if (this.state === 'over') return;
        this.state = 'over';
        this.boardLocked = true;
        this.pendingPopupMode = 'win';
        this.currentRewardGold = this._settleRaceResult();
        const info = '本局总用时：' + this._formatRaceTime(this.raceElapsed)
            + '\n总交换次数：' + this.raceSwapCount + '  最大连消：x' + this.raceMaxCombo
            + '  最高虚弱：' + this.raceMaxWeakness + '层。'
            + '\n累计击杀血量：' + this.raceDefeatedHp + '。';
        this._reportRaceScore();
        this._setSprite(this.popupPrimary, 'popupRetry');
        this._showPopup('竞速完成', info, '通关奖励：+' + this.currentRewardGold + '钻石。');
    }

    private _queueOutcome(outcome: 'win' | 'lose' | 'raceWin') {
        if (this.pendingOutcome || this.state === 'over') return;
        this.pendingOutcome = outcome;
        this.boardLocked = true;
        this.swipeStartIndex = -1;
        this._updateHud();
        const wait = this._getPendingOutcomeAnimationDuration();
        if (wait <= 0) {
            this._completePendingOutcome();
        } else {
            this.scheduleOnce(() => this._completePendingOutcome(), wait);
        }
    }

    private _completePendingOutcome() {
        if (!this.pendingOutcome) return;
        const outcome = this.pendingOutcome;
        this.pendingOutcome = null;
        if (outcome === 'win') this._finishWinNow();
        else if (outcome === 'lose') this._finishLoseNow();
        else this._finishRaceWinNow();
    }

    private _settleRaceResult(): number {
        if (this.resultSaved) return this.currentRewardGold;
        this.resultSaved = true;
        const key = this._getScopedStorageKey(RACE_PROGRESS_KEY);
        let saved: any = {};
        try {
            saved = JSON.parse(cc.sys.localStorage.getItem(key) || '{}');
        } catch (_) {
            saved = {};
        }
        if (saved.lastSettledRaceRunId === this.raceRunId) return 0;

        const reward = THUNDER_RACE_CONFIG.clearReward.amount;
        const next = {
            raceClearCount: Math.max(0, Math.floor(Number(saved.raceClearCount) || 0)) + 1,
            lastSettledRaceRunId: this.raceRunId,
            configVersion: THUNDER_RACE_CONFIG.configVersion,
        };
        cc.sys.localStorage.setItem(key, JSON.stringify(next));
        mGameData.currentGold += reward;
        mGameData.totalGoldEarned += reward;
        if (mGameData.SaveGoldData) mGameData.SaveGoldData();
        cc.director.emit('goldUpdated');
        StateBridge.syncNewToOld();
        return reward;
    }

    private _reportRaceScore() {
        if (this.raceScoreReported || !this.isRaceMode) return;
        this.raceScoreReported = true;
        const score = this._getRaceScore();
        if (score <= 0) return;
        if (!this._saveRaceBestScore(score)) return;
        UserDataSyncManager.postPassLevel(score, 3).catch((error) => {
            cc.warn('[ThunderWarrior] endless score upload failed', error);
        });
    }

    private _getRaceScore(): number {
        let score = Math.max(0, Math.floor(Number(this.raceDefeatedHp) || 0));
        if (this.raceStage && this.enemyHp > 0) {
            const damagedHp = Math.max(0, Math.floor(Number(this.raceStage.enemyHp) || 0) - Math.floor(Number(this.enemyHp) || 0));
            score += damagedHp;
        }
        return score;
    }

    private _saveRaceBestScore(score: number): boolean {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const key = userId ? 'ThunderWarriorRaceBestHp_' + userId : 'ThunderWarriorRaceBestHp';
        const previous = Math.max(0, Math.floor(Number(cc.sys.localStorage.getItem(key)) || 0));
        if (score <= previous) return false;
        cc.sys.localStorage.setItem(key, String(score));
        return true;
    }

    private _getScopedStorageKey(baseKey: string): string {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return userId ? baseKey + '_' + userId : baseKey;
    }

    private _useSkill() {
        if (this.isRaceMode) {
            TipsManager.show('竞速模式禁用主动技能。');
            return;
        }
        if (this.state !== 'playing' || this.boardLocked || this.skillCooldown > 0) {
            TipsManager.show(this.skillCooldown > 0 ? '技能冷却中。' : '当前不能释放技能。');
            return;
        }
        const skill = this.hero.skill;
        let resolveNaturalCascade = false;
        let feedback = '';
        if (skill.effectType === 'add_thunder_energy') {
            this.thunderEnergy += skill.value;
            feedback = '雷霆能量 +' + skill.value + '。';
        } else if (skill.effectType === 'shuffle_board') {
            this.board = this._createBoard();
            feedback = '棋盘已重新排列。';
        } else if (skill.effectType === 'grant_free_storm_shield') {
            this.shieldPending += skill.value;
            feedback = '获得 ' + skill.value + ' 层免费雷盾。';
        } else if (skill.effectType === 'clear_most_common_rune') {
            const cleared = this._clearMostCommonRune();
            resolveNaturalCascade = true;
            feedback = '共鸣消除 ' + cleared + ' 枚符文。';
        } else if (skill.effectType === 'extend_attack_timer') {
            const before = this.attackRemaining;
            this.attackRemaining = Math.min(this.levelConfig.attackInterval, this.attackRemaining + skill.value);
            feedback = '攻击倒计时 +' + Math.max(0, Math.round((this.attackRemaining - before) * 10) / 10) + '秒。';
        }
        this.skillCooldown = skill.cooldownSec;
        this._playSkillReleaseEffect(skill.name, feedback, skill.effectType);
        if (resolveNaturalCascade) {
            this.boardLocked = true;
            const fallMoves = this._collapseAndFillBoard();
            this._animateBoardFall(fallMoves, () => this._resolveMatches(1, 0));
            return;
        }
        this._ensurePossibleBoard();
        this._renderBoard();
        this._saveBattleCheckpoint();
        this._updateHud();
    }

    private _clearMostCommonRune(): number {
        const counts: { [runeId: string]: number } = {};
        for (let i = 0; i < this.board.length; i++) {
            const id = this.board[i];
            counts[id] = (counts[id] || 0) + 1;
        }
        let target = this._getRunePool()[0];
        let amount = 0;
        Object.keys(counts).sort().forEach((id) => {
            if (counts[id] > amount) {
                target = id;
                amount = counts[id];
            }
        });
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === target) this.board[i] = '';
        }
        this.thunderEnergy += amount;
        return amount;
    }

    private _finishWin() {
        if (this.state === 'over' || this.pendingOutcome) return;
        this._queueOutcome('win');
    }

    private _finishWinNow() {
        if (this.state === 'over') return;
        this.state = 'over';
        this.currentStars = this._calculateStars();
        this.pendingPopupMode = 'win';
        this._showResultPopup(this.winResultPopup, '关卡胜利', this.currentStars, 0);
        this._settleWinResult();
    }

    private _finishLose() {
        if (this.state === 'over' || this.pendingOutcome) return;
        this._queueOutcome('lose');
    }

    private _finishLoseNow() {
        if (this.state === 'over') return;
        this.state = 'over';
        this._showLoseResult();
    }

    private _showLoseResult() {
        this.resultSaved = true;
        this.pendingPopupMode = 'lose';
        this._showResultPopup(this.loseResultPopup, '战斗失败', 0, 0);
    }

    private _onAbandonRaceClick() {
        if (!this.isRaceMode || this.state !== 'playing') return;
        this.state = 'over';
        this.boardLocked = true;
        this.swipeStartIndex = -1;
        this.pendingPopupMode = 'raceAbandon';
        this._reportRaceScore();
        this._setSprite(this.popupPrimary, 'popupRetry');
        this._showPopup('结束本局', '本次成绩：' + this._getRaceScore(), '');
    }

    private _pauseBattle() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        this._setSprite(this.pauseButton, 'zanting2');
        this.pendingPopupMode = 'pause';
        this._setSprite(this.popupPrimary, 'popupContinue');
        this._showPopup('暂停', '当前战斗已暂停。', '');
    }

    private _showPopup(title: string, info: string, gold: string) {
        if (!this.popupLayer || !cc.isValid(this.popupLayer)) this._buildPopup();
        if (this.popupTitle) this.popupTitle.string = title;
        if (this.popupInfo) {
            this.popupInfo.string = info;
            this.popupInfo.node.active = !!info;
        }
        if (this.popupGold) {
            this.popupGold.string = gold;
            this.popupGold.node.active = !!gold;
        }
        if (!this.popupLayer) {
            cc.error('[ThunderWarrior] fallback popup layer is missing');
            return;
        }
        this.popupLayer.active = true;
    }

    private _showResultPopup(popup: cc.Node, title: string, stars: number, gold: number) {
        if (!popup || !cc.isValid(popup)) {
            const popupName = this.pendingPopupMode === 'win' ? 'WinResultPopup' : 'LoseResultPopup';
            popup = this._findDeep(this.canvas, popupName);
            if (this.pendingPopupMode === 'win') this.winResultPopup = popup;
            else this.loseResultPopup = popup;
        }
        if (!popup) {
            this._showPopup(title, stars > 0 ? '已完成当前关卡。' : '雷铠被击穿。', '获得钻石：' + gold + '。');
            return;
        }
        const panel = popup.getChildByName('panel') || popup.getChildByName('Panel');
        this._setPopupLabel(panel, 'title', title);
        this._setPopupLabel(panel, 'DistanceLabel', stars > 0 ? '第 ' + this.levelId + ' 关完成。' : '可重新挑战当前关卡。');
        this._setPopupLabel(panel, 'GoldLabel', '获得钻石：' + gold + '。');
        this._updatePopupStars(popup, stars);
        popup.active = true;
    }

    private _updatePopupStars(popup: cc.Node, stars: number) {
        if (!popup) return;
        const panel = popup.getChildByName('panel') || popup.getChildByName('Panel');
        const starsNode = panel && panel.getChildByName('Stars');
        if (!starsNode) return;
        const safeStars = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
        for (let i = 0; i < starsNode.childrenCount; i++) {
            const starNode = starsNode.children[i];
            starNode.active = true;
            const sprite = starNode.getComponent(cc.Sprite);
            if (!sprite) continue;
            const frame = this.artFrames[i < safeStars ? 'resultStarFull' : 'resultStarGray'];
            if (frame) sprite.spriteFrame = frame;
        }
    }

    private _setPopupLabel(parent: cc.Node, nodeName: string, text: string) {
        const node = parent && this._findDeep(parent, nodeName);
        const label = node && node.getComponent(cc.Label);
        if (label) label.string = text;
    }

    private _findDeep(root: cc.Node, nodeName: string): cc.Node {
        if (!root) return null;
        if (root.name === nodeName) return root;
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this._findDeep(root.children[i], nodeName);
            if (found) return found;
        }
        return null;
    }

    private _onPopupPrimary() {
        if (this.pendingPopupMode === 'pause') {
            this.popupLayer.active = false;
            this.state = 'playing';
            this._setSprite(this.pauseButton, 'zanting1');
            if (this.isRaceMode && !this.boardLocked) this._processRaceAttacks();
            return;
        }
        if (this.pendingPopupMode === 'raceAbandon') {
            if (!this._consumeStaminaForLevelEntry()) {
                this._returnToStart();
                return;
            }
            this._loadBattleConfig();
            this._startBattle();
            return;
        }
        if (this.pendingPopupMode === 'win') {
            if (this.isRaceMode) {
                if (!this._consumeStaminaForLevelEntry()) {
                    this._returnToStart();
                    return;
                }
                this._loadBattleConfig();
                this._startBattle();
                return;
            }
            if (this.levelId >= getThunderWarriorTotalLevels()) {
                this._returnToStart();
                return;
            }
            if (!this._consumeStaminaForLevelEntry()) {
                this._returnToStart();
                return;
            }
            GameState.selectedLevel = this.levelId + 1;
            mGameData.currentLevel = GameState.selectedLevel;
            this._loadBattleConfig();
            this._startBattle();
            return;
        }
        if (!this._consumeStaminaForLevelEntry()) {
            this._returnToStart();
            return;
        }
        this._loadBattleConfig();
        this._startBattle();
    }

    private _onPopupSecondary() {
        this._returnToStart(false);
    }

    private _returnToStart(openLevelSelect: boolean = false) {
        StateBridge.syncNewToOld();
        mGameData.shouldOpenLevelSelect = openLevelSelect;
        cc.director.loadScene('Start');
    }

    private _consumeStaminaForLevelEntry(): boolean {
        if (StateBridge.consumeStamina()) return true;
        this._showCallout('体力不足。');
        return false;
    }

    private _settleWinResult() {
        if (this.resultSaved) return;
        loadProgress();
        const p = getProgress();
        p.level_stars = p.level_stars || {};
        const key = String(this.levelId);
        const previousStars = Math.max(0, Math.floor(Number(p.level_stars[key]) || 0));
        const targetStars = Math.max(previousStars, this.currentStars);
        const rewardGold = this._calculateRewardGold(previousStars, targetStars);
        const settlementRequest = UserDataSyncManager.postPassLevel(this.levelId, targetStars, {
            grantGold: rewardGold,
            targetBestStars: targetStars,
        });

        this._applyLocalWinResult(previousStars, targetStars, rewardGold);
        this._showResultPopup(this.winResultPopup, '关卡胜利', this.currentStars, this.currentRewardGold);

        settlementRequest
            .then(() => UserDataSyncManager.flushUpload())
            .catch((error) => {
                UserDataSyncManager.requestUpload();
                cc.warn('[ThunderWarrior] background level settlement failed', error);
            });
    }

    private _applyLocalWinResult(previousStars: number, targetStars: number, rewardGold: number) {
        if (this.resultSaved) return;
        this.resultSaved = true;
        loadProgress();
        const p = getProgress();
        p.level_stars = p.level_stars || {};
        const key = String(this.levelId);
        const previousUnlocked = Math.max(1, Math.floor(Number(p.unlocked_level) || 1));
        p.level_stars[key] = Math.max(previousStars, targetStars);
        p.unlocked_level = Math.max(previousUnlocked, Math.min(getThunderWarriorTotalLevels(), this.levelId + 1));
        GameState.lastStars = this.currentStars;
        GameState.selectedLevel = this.levelId;
        mGameData.currentLevel = this.levelId;
        mGameData.unlockedLevel = p.unlocked_level;
        this.currentRewardGold = rewardGold;
        if (rewardGold > 0) {
            mGameData.currentGold += rewardGold;
            mGameData.totalGoldEarned += rewardGold;
            if (mGameData.SaveGoldData) mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        cc.sys.localStorage.setItem(LAST_GOLD_KEY, String(rewardGold));
        saveProgress();
        StateBridge.syncNewToOld();
    }

    private _calculateRewardGold(previousStars: number, currentStars: number): number {
        const rates: any = THUNDER_GLOBAL_CONFIG.starGoldRewardRates;
        const oldRate = rates[previousStars] || 0;
        const newRate = rates[currentStars] || 0;
        const oldGold = Math.floor(this.levelConfig.goldRewardBase * oldRate);
        const newGold = Math.floor(this.levelConfig.goldRewardBase * newRate);
        return Math.max(0, newGold - oldGold);
    }

    private _calculateStars(): number {
        return calculateThunderWarriorStars(this.playerHp, this.levelConfig.playerHp);
    }

    private _saveBattleCheckpoint() {
        if (this.isRaceMode) return;
        const key = 'ThunderWarriorBattle_' + this.levelId;
        const data = {
            playerHp: this.playerHp,
            enemyHp: this.enemyHp,
            thunderEnergy: this.thunderEnergy,
            attackRemaining: this.attackRemaining,
            skillCooldown: this.skillCooldown,
            shieldPending: this.shieldPending,
        };
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    private _getRunePool(): string[] {
        return this.isRaceMode ? THUNDER_RACE_CONFIG.runePool : this.levelConfig.runePool;
    }

    private _seedToNumber(seed: string): number {
        let value = 7;
        for (let i = 0; i < seed.length; i++) {
            value = (value * 31 + seed.charCodeAt(i)) % 2147483647;
        }
        return Math.max(1, value);
    }

    private _nextRandom(): number {
        if (!this.isRaceMode) return Math.random();
        this.raceRandomState = this.raceRandomState * 16807 % 2147483647;
        return (this.raceRandomState - 1) / 2147483646;
    }

    private _createBoard(): string[] {
        const pool = this._getRunePool();
        for (let attempt = 0; attempt < 80; attempt++) {
            const next: string[] = [];
            for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
                const row = Math.floor(i / BOARD_SIZE);
                const col = i % BOARD_SIZE;
                let candidates = pool.slice();
                if (col >= 2 && next[i - 1] === next[i - 2]) {
                    candidates = candidates.filter((id) => id !== next[i - 1]);
                }
                if (row >= 2 && next[i - BOARD_SIZE] === next[i - BOARD_SIZE * 2]) {
                    candidates = candidates.filter((id) => id !== next[i - BOARD_SIZE]);
                }
                next.push(candidates[Math.floor(this._nextRandom() * candidates.length)]);
            }
            if (this._hasPossibleMove(next)) return next;
        }
        return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => pool[index % pool.length]);
    }

    private _ensurePossibleBoard() {
        if (!this._hasPossibleMove(this.board)) {
            this.board = this._createBoard();
            this._showCallout('棋盘重排。');
        }
    }

    private _findMatches(board: string[] = this.board): MatchResult {
        const matched: { [index: number]: boolean } = {};
        for (let row = 0; row < BOARD_SIZE; row++) {
            let start = 0;
            for (let col = 1; col <= BOARD_SIZE; col++) {
                const current = col < BOARD_SIZE ? board[row * BOARD_SIZE + col] : '';
                const first = board[row * BOARD_SIZE + start];
                if (current !== first) {
                    if (first && col - start >= 3) {
                        for (let c = start; c < col; c++) matched[row * BOARD_SIZE + c] = true;
                    }
                    start = col;
                }
            }
        }
        for (let col = 0; col < BOARD_SIZE; col++) {
            let start = 0;
            for (let row = 1; row <= BOARD_SIZE; row++) {
                const current = row < BOARD_SIZE ? board[row * BOARD_SIZE + col] : '';
                const first = board[start * BOARD_SIZE + col];
                if (current !== first) {
                    if (first && row - start >= 3) {
                        for (let r = start; r < row; r++) matched[r * BOARD_SIZE + col] = true;
                    }
                    start = row;
                }
            }
        }
        return { cells: Object.keys(matched).map((key) => Number(key)) };
    }

    private _collapseAndFillBoard(): RuneFallMove[] {
        const pool = this._getRunePool();
        const moves: RuneFallMove[] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const kept: Array<{ runeId: string; sourceRow: number }> = [];
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const value = this.board[row * BOARD_SIZE + col];
                if (value) kept.push({ runeId: value, sourceRow: row });
            }
            let spawnRow = -1;
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const index = row * BOARD_SIZE + col;
                const existing = kept.length > 0 ? kept.shift() : null;
                const runeId = existing ? existing.runeId : pool[Math.floor(this._nextRandom() * pool.length)];
                const sourceRow = existing ? existing.sourceRow : spawnRow--;
                this.board[index] = runeId;
                moves.push({ index, runeId, sourceRow, targetRow: row, col });
            }
        }
        return moves;
    }

    private _animateBoardFall(moves: RuneFallMove[], done: () => void) {
        let moving = 0;
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const cell = this.runeNodes[move.index];
            if (!cell) continue;
            const start = this._boardCellPosition(move.sourceRow, move.col);
            const target = this._boardCellPosition(move.targetRow, move.col);
            const distanceRows = Math.abs(move.targetRow - move.sourceRow);
            cell.stopAllActions();
            this._applyRuneVisual(cell, move.runeId);
            cell.setPosition(start);
            cell.opacity = 255;
            cell.scale = 1;

            if (distanceRows <= 0) {
                cell.setPosition(target);
                continue;
            }

            moving++;
            const duration = Math.min(0.36, 0.1 + distanceRows * 0.055);
            const fallAction = cc.moveTo(duration, target).easing(cc.easeCubicActionOut());
            cell.runAction(cc.sequence(fallAction, cc.callFunc(() => {
                moving--;
                if (moving <= 0) done();
            })));
        }

        if (moving <= 0) this.scheduleOnce(done, 0);
    }

    private _hasPossibleMove(board: string[]): boolean {
        for (let i = 0; i < board.length; i++) {
            const row = Math.floor(i / BOARD_SIZE);
            const col = i % BOARD_SIZE;
            if (col < BOARD_SIZE - 1 && this._swapCreatesMatch(board, i, i + 1)) return true;
            if (row < BOARD_SIZE - 1 && this._swapCreatesMatch(board, i, i + BOARD_SIZE)) return true;
        }
        return false;
    }

    private _swapCreatesMatch(board: string[], a: number, b: number): boolean {
        const next = board.slice();
        const temp = next[a];
        next[a] = next[b];
        next[b] = temp;
        return this._findMatches(next).cells.length > 0;
    }

    private _isAdjacent(a: number, b: number): boolean {
        const ar = Math.floor(a / BOARD_SIZE);
        const ac = a % BOARD_SIZE;
        const br = Math.floor(b / BOARD_SIZE);
        const bc = b % BOARD_SIZE;
        return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
    }

    private _swap(a: number, b: number) {
        const temp = this.board[a];
        this.board[a] = this.board[b];
        this.board[b] = temp;
    }

    private _renderBoard() {
        if (!this.board || this.board.length < BOARD_SIZE * BOARD_SIZE) return;
        for (let i = 0; i < this.runeNodes.length; i++) {
            const cell = this.runeNodes[i];
            if (!cell || !this.board[i]) continue;
            const row = Math.floor(i / BOARD_SIZE);
            const col = i % BOARD_SIZE;
            cell.stopAllActions();
            cell.setPosition(this._boardCellPosition(row, col));
            this._applyRuneVisual(cell, this.board[i]);
            cell.scale = 1;
            cell.opacity = 255;
        }
    }

    private _boardCellPosition(row: number, col: number): cc.Vec2 {
        return cc.v2(
            (col - (BOARD_SIZE - 1) / 2) * (CELL_SIZE + BOARD_GAP),
            ((BOARD_SIZE - 1) / 2 - row) * (CELL_SIZE + BOARD_GAP)
        );
    }

    private _applyRuneVisual(cell: cc.Node, runeId: string) {
        const rune = getThunderRune(runeId);
        const runeNumber = Math.max(1, Math.min(10, Number(runeId.replace('r', '')) || 1));
        cell.width = CELL_SIZE;
        cell.height = CELL_SIZE;
        this._setSprite(cell, String(runeNumber), false, false);
        const labelNode = cell.getChildByName('RuneLabel');
        const label = labelNode && labelNode.getComponent(cc.Label);
        if (label) label.string = rune.glyph;
    }

    private _updateHud() {
        if (!this.initialized || !this.battleLayer || !this.levelConfig) return;
        const titleNode = this.battleLayer.getChildByName('Title');
        const title = titleNode && titleNode.getComponent(cc.Label);
        if (this.isRaceMode) {
            if (title) title.string = '雷霆追猎';
            if (this.levelLabel) {
                this.levelLabel.string = '本局用时 ' + this._formatRaceTime(this.raceElapsed)
                    + '  ·  怪物 ' + Math.min(THUNDER_RACE_CONFIG.raceStages.length, this.raceStageIndex + 1)
                    + '/' + THUNDER_RACE_CONFIG.raceStages.length;
            }
            if (this.heroHpLabel) this.heroHpLabel.node.active = false;
            if (this.heroHpFill && this.heroHpFill.parent) this.heroHpFill.parent.active = false;
            if (this.enemyHpLabel) this.enemyHpLabel.string = String(this.enemyHp);
            if (this.comboLabel) {
                this.comboLabel.node.active = true;
                this.comboLabel.string = '基础攻击 ' + (this.raceStage ? this.raceStage.attackDamage : 0);
            }
            if (this.shieldLabel) {
                this.shieldLabel.node.active = true;
                this.shieldLabel.string = this.raceWeaknessStacks > 0
                    ? '虚弱 ' + this.raceWeaknessStacks + '层 / ' + this.raceWeaknessRemaining.toFixed(1) + '秒'
                    : '虚弱 0层';
            }
            if (this.skillButton) this.skillButton.active = false;
            const enemyMaxHp = this.raceStage ? this.raceStage.enemyHp : 1;
            this._setFill(this.enemyHpFill, this.enemyHp / enemyMaxHp, HP_FILL_WIDTH);
            this._setFill(this.energyFill, Math.min(1, this.thunderEnergy / THUNDER_RACE_CONFIG.energyCostPerAttack), ENERGY_FILL_WIDTH);
            return;
        }
        if (title) title.string = '第' + this._levelNumberText(this.levelId) + '关';
        if (this.levelLabel) this.levelLabel.string = '下次攻击：' + Math.max(0, Math.ceil(this.attackRemaining)) + '秒';
        if (this.heroHpLabel) this.heroHpLabel.string = String(this.playerHp);
        if (this.enemyHpLabel) this.enemyHpLabel.string = String(this.enemyHp);
        if (this.timerLabel) this.timerLabel.string = Math.max(0, this.attackRemaining).toFixed(1) + 's';
        if (this.energyLabel) this.energyLabel.string = '';
        if (this.skillCooldownLabel) {
            this.skillCooldownLabel.string = '';
            this.skillCooldownLabel.node.active = false;
        }
        if (this.shieldLabel) this.shieldLabel.string = this.shieldPending > 0 ? '雷盾 x' + this.shieldPending : '';
        this._setFill(this.heroHpFill, this.playerHp / this.levelConfig.playerHp, HP_FILL_WIDTH);
        this._setFill(this.enemyHpFill, this.enemyHp / this.levelConfig.enemyHp, HP_FILL_WIDTH);
        this._setFill(this.energyFill, Math.min(1, this.thunderEnergy / THUNDER_GLOBAL_CONFIG.thunderCounterCost), ENERGY_FILL_WIDTH);
        if (this.skillButton) this.skillButton.opacity = this.boardLocked ? 150 : 255;
        this._updateSkillCooldownMask();
    }

    private _formatRaceTime(seconds: number): string {
        const totalSeconds = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(totalSeconds / 60);
        const wholeSeconds = totalSeconds % 60;
        return String(minutes).padStart(2, '0') + ':'
            + String(wholeSeconds).padStart(2, '0');
    }

    private _levelNumberText(level: number): string {
        const texts = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        return texts[level] || String(level);
    }

    private _setFill(node: cc.Node, ratio: number, fullWidth: number) {
        if (!node) return;
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        node.anchorX = 0;
        node.scaleX = 1;
        node.width = fullWidth * clampedRatio;
        node.x = -fullWidth / 2;
    }

    private _showCallout(text: string) {
        if (!this.calloutLabel) return;
        this.calloutLabel.string = text;
        this.calloutLabel.node.stopAllActions();
        this.calloutLabel.node.active = true;
        this.calloutLabel.node.opacity = 0;
        this.calloutLabel.node.scale = 0.88;
        this.calloutLabel.node.runAction(cc.sequence(
            cc.spawn(cc.fadeTo(0.12, 255), cc.scaleTo(0.12, 1.06)),
            cc.scaleTo(0.08, 1),
            cc.delayTime(1.05),
            cc.fadeOut(0.25),
            cc.callFunc(() => { this.calloutLabel.node.active = false; })
        ));
    }

    private _playSkillReleaseEffect(skillName: string, feedback: string, effectType: string) {
        this._showCallout(skillName + '：' + feedback);
        if (this.skillButton) {
            this.skillButton.stopAllActions();
            this.skillButton.scale = 1;
            this.skillButton.runAction(cc.sequence(
                cc.scaleTo(0.07, 0.9),
                cc.scaleTo(0.12, 1.08),
                cc.scaleTo(0.1, 1)
            ));
        }
        if (this.skillFlash) {
            this.skillFlash.stopAllActions();
            this.skillFlash.active = true;
            this.skillFlash.opacity = 220;
            this.skillFlash.scale = 0.9;
            this.skillFlash.runAction(cc.sequence(
                cc.spawn(cc.scaleTo(0.28, 1.42), cc.fadeOut(0.28)),
                cc.callFunc(() => { this.skillFlash.active = false; })
            ));
        }

        let target: cc.Node = null;
        if (effectType === 'add_thunder_energy') target = this.energyFill && this.energyFill.parent;
        else if (effectType === 'shuffle_board' || effectType === 'clear_most_common_rune') target = this.boardLayer;
        else if (effectType === 'grant_free_storm_shield') target = this.heroFigure;
        else if (effectType === 'extend_attack_timer') target = this.levelLabel && this.levelLabel.node;
        if (target) {
            target.stopAllActions();
            target.scale = 1;
            target.runAction(cc.sequence(cc.scaleTo(0.12, 1.06), cc.scaleTo(0.18, 1)));
        }
    }

    private _updateSkillCooldownMask() {
        if (!this.skillCooldownMask || !this.skillCooldownGraphics || !this.hero || !this.hero.skill) return;
        const duration = Math.max(0.01, this.hero.skill.cooldownSec);
        const remainingRatio = Math.max(0, Math.min(1, this.skillCooldown / duration));
        this.skillCooldownGraphics.clear();
        if (remainingRatio <= 0) {
            this.skillCooldownMask.active = false;
            return;
        }

        this.skillCooldownMask.active = true;
        const radius = 60;
        const startAngle = Math.PI * 0.5;
        const progress = 1 - remainingRatio;
        const boundaryAngle = startAngle - progress * Math.PI * 2;
        const remainingAngle = remainingRatio * Math.PI * 2;
        const steps = Math.max(3, Math.ceil(64 * remainingRatio));
        const graphics = this.skillCooldownGraphics;
        graphics.fillColor = new cc.Color(0, 0, 0, 190);
        graphics.moveTo(0, 0);
        for (let i = 0; i <= steps; i++) {
            const angle = boundaryAngle - remainingAngle * i / steps;
            graphics.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        graphics.close();
        graphics.fill();
    }

    private _node(name: string, parent: cc.Node, width: number, height: number, pos: cc.Vec2): cc.Node {
        const existing = parent.getChildByName(name);
        if (existing) return existing;
        const node = new cc.Node(name);
        node.width = width;
        node.height = height;
        node.setPosition(pos);
        parent.addChild(node);
        return node;
    }

    private _label(name: string, parent: cc.Node, text: string, size: number, pos: cc.Vec2, color: cc.Color): cc.Label {
        const existingNode = parent.getChildByName(name);
        const node = this._node(name, parent, 300, 44, pos);
        const existingLabel = node.getComponent(cc.Label);
        const label = existingLabel || node.addComponent(cc.Label);
        label.string = text;
        if (!existingNode || !existingLabel) {
            label.fontSize = size;
            label.lineHeight = Math.floor(size * 1.25);
            (label as any).horizontalAlign = (cc.Label.HorizontalAlign as any).CENTER || 1;
            (label as any).verticalAlign = (cc.Label.VerticalAlign as any).CENTER || 1;
            node.color = color;
        }
        return label;
    }

    private _button(name: string, parent: cc.Node, text: string, width: number, height: number, pos: cc.Vec2, callback: () => void, color: cc.Color, artName?: string): cc.Node {
        const node = this._node(name, parent, width, height, pos);
        if (artName) this._setSprite(node, artName);
        else this._drawPanel(node, width, height, color, new cc.Color(230, 245, 245, 255));
        const hasButtonArt = !!node.getComponent(cc.Sprite);
        const existingLabelNode = node.getChildByName('Label');
        if (hasButtonArt) {
            if (existingLabelNode) {
                const existingLabel = existingLabelNode.getComponent(cc.Label);
                if (existingLabel) existingLabel.string = '';
                existingLabelNode.active = false;
            }
        } else {
            const label = this._label('Label', node, text, 20, cc.v2(0, 0), cc.Color.WHITE);
            label.node.width = width;
            label.node.active = true;
        }
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, () => {
            this.playClick();
            callback();
        }, this);
        return node;
    }

    private _bar(name: string, parent: cc.Node, fillWidth: number, frameWidth: number, pos: cc.Vec2, fillArt: string): cc.Node {
        const bg = this._node(name + 'Bg', parent, frameWidth, 31, pos);
        this._setSprite(bg, 'xuetiaodi');
        const fill = this._node(name + 'Fill', bg, fillWidth, 15, cc.v2(0, 0));
        this._setSprite(fill, fillArt);
        return fill;
    }

    private _makeHeroFigure(parent: cc.Node, nodeName: string, pos: cc.Vec2, artName: string, width: number, height: number): cc.Node {
        return this._sprite(nodeName, parent, artName, width, height, pos);
    }

    private _sprite(name: string, parent: cc.Node, artName: string, width: number, height: number, pos: cc.Vec2, rawSize: boolean = false): cc.Node {
        const node = this._node(name, parent, width, height, pos);
        this._setSprite(node, artName, rawSize);
        return node;
    }

    private _setSprite(node: cc.Node, artName: string, rawSize: boolean = false, trim?: boolean) {
        if (!node) return;
        const frame = this.artFrames[artName];
        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        if (frame) sprite.spriteFrame = frame;
        sprite.sizeMode = rawSize ? cc.Sprite.SizeMode.RAW : cc.Sprite.SizeMode.CUSTOM;
        if (typeof trim === 'boolean') sprite.trim = trim;
        const graphics = node.getComponent(cc.Graphics);
        if (graphics) graphics.clear();
    }

    private _drawPanel(node: cc.Node, width: number, height: number, fill: cc.Color, stroke: cc.Color) {
        // Transplanted popup nodes already carry their original Sprite artwork.
        if (node.getComponent(cc.Sprite)) return;
        let graphics = node.getComponent(cc.Graphics);
        if (!graphics) graphics = node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = fill;
        graphics.strokeColor = stroke;
        graphics.lineWidth = 2;
        graphics.roundRect(-width / 2, -height / 2, width, height, 10);
        graphics.fill();
        if (!stroke || stroke.getA() > 0) graphics.stroke();
    }
}
