import { saveProgress, getProgress } from './GameState';
import cfg from './config';
import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
import TipsManager from '../Load/TipsManager';
const { ccclass } = cc._decorator;

@ccclass
export default class MainController extends cc.Component {

    private _sp: Record<string, cc.SpriteFrame> = {};
    private _staminaTimer: number = 0;
    private _countdownTimer: number = 0;

    private _canvas: cc.Node = null;
    private _bgSprite: cc.Sprite = null;
    private _staminaSprite: cc.Sprite = null;
    private _staminaLabel: cc.Label = null;
    private _countdownLabel: cc.Label = null;
    private _settingsSprite: cc.Sprite = null;
    private _logoSprite: cc.Sprite = null;
    private _levelTipSprite: cc.Sprite = null;
    private _levelTipLabel: cc.Label = null;
    private _goldLabel: cc.Label = null;
    private _startBtnSprite: cc.Sprite = null;
    private _startBtnNode: cc.Node = null;
    private _settingsNode: cc.Node = null;
    private _addStaminaNode: cc.Node = null;
    private _staminaLabelNode: cc.Node = null;

    onLoad() {
        this._canvas = this.node.parent;
        const c = this._canvas;

        this._bgSprite        = c.getChildByName('bg')       && c.getChildByName('bg').getComponent(cc.Sprite);
        this._staminaSprite   = c.getChildByName('stamina')  && c.getChildByName('stamina').getComponent(cc.Sprite);
        this._settingsSprite  = c.getChildByName('settings') && c.getChildByName('settings').getComponent(cc.Sprite);
        this._logoSprite      = c.getChildByName('logo')     && c.getChildByName('logo').getComponent(cc.Sprite);
        this._levelTipSprite  = c.getChildByName('levelTip') && c.getChildByName('levelTip').getComponent(cc.Sprite);
        this._startBtnSprite  = c.getChildByName('startBtn') && c.getChildByName('startBtn').getComponent(cc.Sprite);
        this._settingsNode    = c.getChildByName('settings');
        this._startBtnNode    = c.getChildByName('startBtn');
        this._addStaminaNode  = c.getChildByName('addStamina');

        const staminaNode = c.getChildByName('stamina');
        if (staminaNode) {
            this._staminaLabelNode = staminaNode.getChildByName('staminaLabel');
            this._staminaLabel = this._staminaLabelNode && this._staminaLabelNode.getComponent(cc.Label);
            const cdNode = staminaNode.getChildByName('countdownLabel');
            this._countdownLabel = cdNode && cdNode.getComponent(cc.Label);
        }

        const levelTipNode = c.getChildByName('levelTip');
        this._levelTipLabel = levelTipNode && levelTipNode.getChildByName('levelTipLabel') && levelTipNode.getChildByName('levelTipLabel').getComponent(cc.Label);
        const bgNode = c.getChildByName('Bg');
        const goldNode = (bgNode && bgNode.getChildByName('gold_lb'))
            || c.getChildByName('gold_lb')
            || cc.find('Canvas/Bg/gold_lb')
            || cc.find('Canvas/gold_lb');
        this._goldLabel = goldNode && goldNode.getComponent(cc.Label);

        StateBridge.syncForStartScene();
        cc.loader.loadResDir('textures/main', cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Main] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._applyAssets();
            this._refresh();
        });
        this._bindEvents();
    }

    update(dt: number) {
        this._updateStaminaRecharge(dt);
        this._countdownTimer += dt;
        if (this._countdownTimer >= 1) {
            this._countdownTimer = 0;
            this._refreshCountdown();
        }
    }

    // ── Assets ───────────────────────────────────────────────────────────────

    private _applyAssets() {
        this._setSp(this._bgSprite,       'ui_6');
        this._setSp(this._staminaSprite,  'ui_5');
        this._setSp(this._settingsSprite, 'ui_4');
        this._setSp(this._logoSprite,     'ui_3');
        this._setSp(this._levelTipSprite, 'ui_2');
        this._setSp(this._startBtnSprite, 'ui_1');
    }

    private _setSp(sprite: cc.Sprite, key: string) {
        if (!sprite || !this._sp[key]) return;
        sprite.spriteFrame = this._sp[key];
    }

    // ── Refresh ──────────────────────────────────────────────────────────────

    private _refresh() {
        this._refreshStamina();
        this._refreshCountdown();
        this._refreshLevelTip();
        this._refreshGold();
    }

    private _refreshStamina() {
        const p = getProgress();
        if (this._staminaLabel) {
            this._staminaLabel.string = String(p.stamina);
        }
    }

    private _refreshCountdown() {
        if (!this._countdownLabel) return;
        const p = getProgress();
        if (p.stamina >= cfg.stamina.max) {
            this._countdownLabel.node.active = false;
            return;
        }
        this._countdownLabel.node.active = true;
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - p.last_stamina_time;
        const remaining = cfg.stamina.rechargeIntervalSec - (elapsed % cfg.stamina.rechargeIntervalSec);
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        this._countdownLabel.string = `下次虎符恢复：${m}:${s < 10 ? '0' : ''}${s}`;
    }

    private _refreshLevelTip() {
        const p = getProgress();
        if (this._levelTipLabel) {
            const nextLevel = Math.max(
                1,
                Math.floor(Number(p.unlocked_level) || 1),
                Math.floor(Number(mGameData.unlockedLevel) || 1)
            );
            this._levelTipLabel.string = '当前关卡：' + nextLevel;
        }
    }

    private _refreshGold() {
        if (!this._goldLabel) return;
        if (mGameData.GetGoldData) mGameData.GetGoldData();
        this._goldLabel.node.active = true;
        this._goldLabel.string = String(Math.max(0, Math.floor(Number(mGameData.currentGold) || 0)));
    }

    // ── Stamina recharge ─────────────────────────────────────────────────────

    private _updateStaminaRecharge(dt: number) {
        const p = getProgress();
        if (p.stamina >= cfg.stamina.max) return;

        this._staminaTimer += dt;
        if (this._staminaTimer < 1) return;
        this._staminaTimer = 0;

        const now = Math.floor(Date.now() / 1000);
        const gained = Math.floor((now - p.last_stamina_time) / cfg.stamina.rechargeIntervalSec);
        if (gained > 0) {
            p.stamina = Math.min(cfg.stamina.max, p.stamina + gained);
            p.last_stamina_time += gained * cfg.stamina.rechargeIntervalSec;
            saveProgress();
            StateBridge.syncNewToOld();
            this._refreshStamina();
            this._refreshCountdown();
            this._playStaminaBounce();
        }
    }

    // ── Events ───────────────────────────────────────────────────────────────

    private _bindEvents() {
        if (this._startBtnNode)    this._addButton(this._startBtnNode,    this._onStartBtn.bind(this));
        if (this._settingsNode)    this._addButton(this._settingsNode,    this._onSettings.bind(this));
        if (this._addStaminaNode)  this._addButton(this._addStaminaNode,  this._onAddStamina.bind(this));
        // Click staminaLabel to open stamina panel
        if (this._staminaLabelNode) {
            this._staminaLabelNode.on(cc.Node.EventType.TOUCH_END, this._onStaminaLabel.bind(this), this);
        }
    }

    private _addButton(node: cc.Node, cb: () => void) {
        let btn = node.getComponent(cc.Button);
        if (!btn) btn = node.addComponent(cc.Button);
        btn.transition = cc.Button.Transition.SCALE;
        btn.zoomScale = 0.95;
        node.on('click', cb, this);
    }

    private _onStartBtn() {
        const btn = this._startBtnNode;
        btn.stopAllActions();
        btn.runAction(cc.sequence(
            cc.scaleTo(0.1, 0.95),
            cc.scaleTo(0.05, 1.0),
            cc.callFunc(() => this._startRunDirectly())
        ));
    }

    private _startRunDirectly() {
        if (!StateBridge.consumeStamina()) {
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
        mGameData.isInfiniteMode = true;
        mGameData.shouldOpenLevelSelect = false;
        this._fadeToScene('ThunderWarrior');
    }

    private _openLevelSelectPanel() {
        StateBridge.prepareLevelSelection();
        mGameData.isInfiniteMode = false;
        mGameData.shouldOpenLevelSelect = false;

        const panel = (this._canvas && this._canvas.getChildByName('LevelSelectPanel')) || cc.find('Canvas/LevelSelectPanel');
        if (panel) {
            const manager = panel.getComponent('LevelSelectManager') as any;
            if (manager && manager.show) {
                manager.show();
            } else {
                panel.active = true;
            }
            return;
        }

        mGameData.shouldOpenLevelSelect = false;
        this._fadeToScene('Start');
    }

    private _onSettings() {
        this._fadeToScene('shengli');
    }

    private _onAddStamina() {
        this._fadeToScene('Start');
    }

    private _onStaminaLabel() {
        this._fadeToScene('Start');
    }

    // ── Animations ───────────────────────────────────────────────────────────

    private _playStaminaBounce() {
        const node = this._staminaSprite && this._staminaSprite.node;
        if (!node) return;
        node.stopAllActions();
        node.runAction(cc.sequence(cc.scaleTo(0.1, 1.2), cc.scaleTo(0.15, 1.0)));
    }

    private _playStaminaFlyAnim() {
        const target = this._staminaSprite && this._staminaSprite.node;
        if (!target) return;
        for (let i = 0; i < 5; i++) {
            const icon = new cc.Node('tallyFly');
            icon.width = 30; icon.height = 30; icon.zIndex = 200;
            this._canvas.addChild(icon);
            icon.runAction(cc.sequence(
                cc.delayTime(i * 0.08),
                cc.spawn(
                    cc.moveTo(0.6, target.x, target.y),
                    cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.3, 0.5))
                ),
                cc.callFunc(() => icon.destroy())
            ));
        }
    }

    private _fadeToScene(sceneName: string) {
        const mask = new cc.Node('fadeMask');
        mask.width = this._canvas.width;
        mask.height = this._canvas.height;
        mask.color = cc.Color.BLACK;
        mask.opacity = 0;
        mask.zIndex = 999;
        this._canvas.addChild(mask);
        mask.runAction(cc.sequence(
            cc.fadeTo(0.2, 255),
            cc.callFunc(() => cc.director.loadScene(sceneName))
        ));
    }
}
