import { saveProgress, getProgress } from './GameState';
import cfg from './config';
import StateBridge from './StateBridge';
const { ccclass, property } = cc._decorator;

@ccclass
export default class TiliController extends cc.Component {

    @property(cc.Label)
    countdownLabel: cc.Label = null;

    @property(cc.Node)
    staminaAreaNode: cc.Node = null;

    @property(cc.Node)
    tipNode: cc.Node = null;

    onLoad() {
        StateBridge.syncForStartScene();

        const canvas = this.node.parent;

        // 关闭
        if (this.staminaAreaNode) {
            this.staminaAreaNode.on(cc.Node.EventType.TOUCH_END, this._onClose, this);
        }

        // 看广告 - 逐一尝试所有可能的节点名
        const tryBind = (name: string, handler: () => void) => {
            const n = canvas.getChildByName(name);
            if (n) {
                n.on(cc.Node.EventType.TOUCH_END, handler, this);
                cc.log(`[Tili] bound "${name}"`);
            } else {
                cc.warn(`[Tili] node "${name}" NOT FOUND`);
            }
        };

        tryBind('backBtn', this._onBackBtn.bind(this));

        // tipNode 兜底：编辑器没绑则用 getChildByName
        if (!this.tipNode) {
            this.tipNode = canvas.getChildByName('tipNode') || canvas.getChildByName('tip') || canvas.getChildByName('tipLabel');
        }
        if (this.tipNode) {
            this.tipNode.active = false;
            cc.log('[Tili] tipNode found:', this.tipNode.name);
        } else {
            cc.warn('[Tili] tipNode is NULL');
        }
    }

    private _showTip(text: string) {
        if (!this.tipNode) return;
        this.tipNode.active = true;
        const lbl = this.tipNode.getComponent(cc.Label);
        if (lbl) lbl.string = text;
        this.scheduleOnce(() => {
            if (this.tipNode) this.tipNode.active = false;
        }, 1.5);
    }

    private _onClose() {
        cc.director.loadScene('Start');
    }

    private _onWatchAd() {
        const p = getProgress();
        if (p.stamina >= cfg.stamina.max) {
            this._showTip('虎符已经上限');
            return;
        }
        p.stamina = Math.min(cfg.stamina.max, p.stamina + cfg.stamina.adReward);
        if (p.last_stamina_time === 0) p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        this._showTip(`+${cfg.stamina.adReward}虎符`);
    }

    private _onBackBtn() {
        const p = getProgress();
        cc.log('[Tili] _onBackBtn stamina=', p.stamina, 'max=', cfg.stamina.max, 'tipNode=', this.tipNode ? this.tipNode.name : 'NULL');
        if (p.stamina >= cfg.stamina.max) {
            this._showTip('虎符已经上限');
            return;
        }
        p.stamina = Math.min(cfg.stamina.max, p.stamina + 5);
        if (p.last_stamina_time === 0) p.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        this._showTip('获得5虎符！');
    }
}
