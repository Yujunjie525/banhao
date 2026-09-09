import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { nodePool } from './nodePool';
import { gameConfig } from '../data/gameConfig';
import { emits, localData } from '../data/enums';
import { audioTool } from './audioTool';
import { wxAd } from '../AD/wxAd';
import { addTotalEarnedGold, getUserScopedKey, load, save } from './tools';
import { bgmName } from '../../scripts/data/enmus';
const { ccclass, property } = _decorator;

@ccclass('gameOver1Tool')
export class gameOver1Tool extends Component {
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }
    init() {
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
        // 按钮监听
        const jujue = this.node.getChildByPath('popUI/jujue')
        jujue.on(NodeEventType.TOUCH_START, this.jujueBtn, this)
        const fuhuo = this.node.getChildByPath('popUI/fuhuo')
        fuhuo.on(NodeEventType.TOUCH_START, this.fuhuoBtn, this)
    }
    // 拒绝
    jujueBtn() {
        // nodePool.ins.huiShouNode(this.node)
        // nodePool.ins.getPoolNode('gameOver2', gameConfig.gameRoot)
        // 出场动画
        tween(this.popUI)
            .by(0.06, { scale: new Vec3(0.2, 0.2, 1) })
            .by(0.05, { scale: new Vec3(-0.2, -0.2, 1) })
            .to(0.02, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.jieSuan()
                audioTool.ins.stopMusic()
                gameConfig.gamePause = 0
                director.emit(emits.gamePause)
                director.loadScene('home2')
            })
            .start()
    }
    // 复活
    fuhuoBtn() {
        wxAd.ins.jiliAd(() => {
            gameConfig.fuhuoNum -= 1
            audioTool.ins.playMusic(bgmName.game_bg)
            nodePool.ins.huiShouNode(this.node)
            gameConfig.gamePause = 0
            director.emit(emits.gamePause)
            director.emit(emits.fuhuo)
            director.emit(emits.PHNum, 10)
            console.log('复活了');
        })

    }

    // 最终结算
    jieSuan() {
        // 金币
        gameConfig.jinbiNum = gameConfig.leveJinbiNum + Number(load(localData.jinbiNum))
        save(localData.jinbiNum, gameConfig.jinbiNum)
        addTotalEarnedGold(Math.max(0, gameConfig.leveJinbiNum))
        director.emit(emits.jinbiNum)

        // 最高记录
        if (gameConfig.juliNum > gameConfig.maxJuli) {
            gameConfig.maxJuli = gameConfig.juliNum
            save(getUserScopedKey(localData.maxJuli), gameConfig.maxJuli)
            void this.uploadMaxJuliRank(gameConfig.maxJuli)
        }
    }

    private async uploadMaxJuliRank(rank: number) {
        const username = load('SLS_USERNAME', 0)
        if (!username) {
            return
        }

        try {
            const result = await this.postPass(gameConfig.APP_ID, username, rank, 3)
            console.log('PassLevel success:', result)
        } catch (error) {
            console.error('PassLevel failed:', error)
        }
    }

    // 通关上报
    async postPass(appid: string, username: string, rank: number, star: number): Promise<any> {
        const url = 'https://pay.szvi-bo.com/v1/testapp/PassLevel';
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
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
}


