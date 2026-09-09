import { loadConfig, CFG, Scene } from './Constants';
import GameState from './GameState';
import StateBridge from './StateBridge';

const { ccclass, property } = cc._decorator;

// 设计稿尺寸（与 data.json original_size 一致）
const DESIGN_W = 941;
const DESIGN_H = 1672;
// Canvas 设计分辨率
const CANVAS_W = 750;
const CANVAS_H = 1334;

@ccclass
export default class MainController extends cc.Component {

    // --- 编辑器拖拽绑定 ---
    @property(cc.Node)
    staminaPanel: cc.Node = null;

    @property(cc.Node)
    currencyPanel: cc.Node = null;

    @property(cc.Node)
    logoTitle: cc.Node = null;

    @property(cc.Node)
    coreDisplay: cc.Node = null;

    @property(cc.Node)
    upgradeBtn: cc.Node = null;

    @property(cc.Node)
    coreBtn: cc.Node = null;

    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Node)
    shopBtn: cc.Node = null;

    @property(cc.Label)
    staminaLabel: cc.Label = null;

    @property(cc.Label)
    currencyLabel: cc.Label = null;

    // --- 私有 ---
    private _sp: { [key: string]: cc.SpriteFrame } = {};
    onLoad() {
        // 1. 同步加载配置（早于任何异步操作）
        loadConfig(require('config'));
        StateBridge.syncOldToNew();

        // 2. 异步加载贴图
        cc.loader.loadResDir('textures/main', cc.SpriteFrame, (err: any, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Main] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._applyAssets();
            this._refresh();
        });

        // 3. 绑定按钮事件
        this._bindButtons();
    }

    // ---- 私有方法 ----

    private _applyAssets() {
        this._setSp(this.staminaPanel,  'ui_1');
        this._setSp(this.currencyPanel, 'ui_2');
        this._setSp(this.logoTitle,     'ui_3');
        this._setSp(this.coreDisplay,   'ui_4');
        this._setSp(this.upgradeBtn,    'ui_5');
        this._setSp(this.coreBtn,       'ui_6');
        this._setSp(this.startBtn,      'ui_7');
        this._setSp(this.shopBtn,       'ui_8');
    }

    private _setSp(node: cc.Node, key: string) {
        if (!node || !this._sp[key]) return;
        let s = node.getComponent(cc.Sprite);
        if (!s) s = node.addComponent(cc.Sprite);
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        s.spriteFrame = this._sp[key];
    }

    private _refresh() {
        this._refreshStamina();
        this._refreshCurrency();
    }

    private _refreshStamina() {
        if (this.staminaLabel) {
            this.staminaLabel.string = `${GameState.stamina}/${CFG.stamina.max}`;
        }
    }

    private _refreshCurrency() {
        if (this.currencyLabel) {
            // 千位分隔符格式，如 50,000
            const n = GameState.shenpo;
            let s = '';
            const str = String(n);
            for (let i = 0; i < str.length; i++) {
                if (i > 0 && (str.length - i) % 3 === 0) s += ',';
                s += str[i];
            }
            this.currencyLabel.string = s;
        }
    }

    private _bindButtons() {
        this._addTap(this.startBtn,   this._onStartBtn.bind(this));
        this._addTap(this.upgradeBtn, this._onUpgradeBtn.bind(this));
        this._addTap(this.coreBtn,    this._onCoreBtn.bind(this));
        this._addTap(this.shopBtn,    this._onShopBtn.bind(this));
    }

    private _addTap(node: cc.Node, cb: () => void) {
        if (!node) return;
        node.on(cc.Node.EventType.TOUCH_END, cb, this);
    }

    private _onStartBtn() {
        cc.tween(this.startBtn)
            .to(0.05, { scale: 0.9 })
            .to(0.05, { scale: 1.0 })
            .call(() => {
                StateBridge.syncOldToNew();
                if (StateBridge.consumeStamina()) {
                    cc.director.loadScene(Scene.Youxi);
                } else {
                    cc.log('[Main] 体力不足，无法开始游戏。');
                }
            })
            .start();
    }

    private _onUpgradeBtn() {
        StateBridge.syncNewToOld();
        cc.director.loadScene(Scene.Upgrade);
    }

    private _onCoreBtn() {
        StateBridge.syncNewToOld();
        cc.director.loadScene(Scene.Upgrade);
    }

    private _onShopBtn() {
        // 商店界面（后续实现）
        cc.log('[Main] 商店按钮');
    }
}
