import { saveProgress, getProgress } from './GameState';
import GameState from './GameState';
import cfg from './config';
import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
import { getThunderWarriorTotalLevels } from './ThunderWarriorLevelConfig';
const { ccclass } = cc._decorator;

@ccclass
export default class ShenliController extends cc.Component {

    private _sp: Record<string, cc.SpriteFrame> = {};

    onLoad() {
        StateBridge.syncForStartScene();
        const canvas = this.node.parent;

        const nextBtn = canvas.getChildByName('nextBtn');
        if (nextBtn) nextBtn.on(cc.Node.EventType.TOUCH_END, this._onNext, this);

        const backBtn = canvas.getChildByName('backBtn');
        if (backBtn) backBtn.on(cc.Node.EventType.TOUCH_END, this._onBack, this);

        // Hide decorative star nodes
        ['star1','star2','star3','star4'].forEach(name => {
            const n = canvas.getChildByName(name);
            if (n) n.active = false;
        });

        cc.loader.loadResDir('textures/shengli', cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[]) => {
            if (err) { cc.error('[Shengli] 贴图加载失败', err); return; }
            frames.forEach(f => { this._sp[f.name] = f; });
            this._applyAssets();
        });
    }

    private _applyAssets() {
        const c = this.node.parent;
        const stars = GameState.lastStars || 3;

        this._setSp(c.getChildByName('mainPanel'), 'ui_6');
        this._setSp(c.getChildByName('nextBtn'),   'ui_2');
        this._setSp(c.getChildByName('backBtn'),   'ui_1');

        // medalLeft=1st star, medalCenter=2nd, medalRight=3rd
        // ui_3=lit, ui_5=dark
        const medals = ['medalLeft', 'medalCenter', 'medalRight'];
        medals.forEach((name, idx) => {
            this._setSp(c.getChildByName(name), idx < stars ? 'ui_3' : 'ui_5');
        });
    }

    private _setSp(node: cc.Node, key: string) {
        if (!node || !this._sp[key]) return;
        const s = node.getComponent(cc.Sprite);
        if (!s) return;
        s.spriteFrame = this._sp[key];
        s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    private _onNext() {
        const nextLevel = (GameState.selectedLevel || 1) + 1;
        if (nextLevel > getThunderWarriorTotalLevels()) {
            StateBridge.syncNewToOld();
            mGameData.shouldOpenLevelSelect = false;
            cc.director.loadScene('Start');
            return;
        }

        const p = getProgress();
        if (p.stamina < cfg.levelCost) {
            cc.director.loadScene('Start');
            return;
        }
        GameState.selectedLevel = nextLevel;
        p.stamina -= cfg.levelCost;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        cc.director.loadScene('ThunderWarrior');
    }

    private _onBack() {
        StateBridge.syncNewToOld();
        cc.director.loadScene('Start');
    }
}
