import { saveProgress, getProgress } from './GameState';
import GameState from './GameState';
import cfg from './config';
import StateBridge from './StateBridge';
const { ccclass, property } = cc._decorator;

@ccclass
export default class ShibaiController extends cc.Component {

    @property(cc.Node)
    retryBtnNode: cc.Node = null;

    @property(cc.Node)
    backBtnNode: cc.Node = null;

    private _sp: Record<string, cc.SpriteFrame> = {};

    onLoad() {
        StateBridge.syncForStartScene();
        const canvas = this.node.parent;

        const retryBtn = canvas.getChildByName('retryBtn');
        if (retryBtn) retryBtn.on(cc.Node.EventType.TOUCH_END, this._onRetry, this);

        const backBtn = canvas.getChildByName('backBtn');
        if (backBtn) backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);

        cc.loader.loadResDir('textures/shibai', cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Shibai] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._applyAssets();
        });
    }

    private _applyAssets() {
        const canvas = this.node.parent;
        this._setSp(canvas.getChildByName('title'),      'ui_5');
        this._setSp(canvas.getChildByName('leftPanel'),  'ui_4');
        this._setSp(canvas.getChildByName('rightPanel'), 'ui_3');
        this._setSp(canvas.getChildByName('retryBtn'),   'ui_2');
        this._setSp(canvas.getChildByName('backBtn'),    'ui_1');
    }

    private _setSp(node: cc.Node, key: string) {
        if (!node || !this._sp[key]) return;
        const s = node.getComponent(cc.Sprite);
        if (!s) return;
        s.spriteFrame = this._sp[key];
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    private _onRetry() {
        const p = getProgress();
        if (p.stamina < cfg.levelCost) {
            cc.director.loadScene('Start');
            return;
        }
        p.stamina -= cfg.levelCost;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        // Keep selectedLevel unchanged, retry same level
        cc.director.loadScene('WarriorRun');
    }

    private _onBack() {
        cc.director.loadScene('Start');
    }
}
