import { _decorator, Component, Director, director, Node, PhysicsSystem2D, profiler, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { nodePool } from '../utils/nodePool';
import { emits } from '../data/enums';
import { audioTool } from '../utils/audioTool';
import { wxAd } from '../AD/wxAd';
const { ccclass, property } = _decorator;

@ccclass('gameView')
export class gameView extends Component {
    // 敌人生成节点
    @property(Node) enemyNode: Node;
    // 玩家生成节点
    @property(Node) playerNode: Node;
    // 游戏根节点
    @property(Node) gameRoot: Node;
    // 玩家生成节点
    start() {
        profiler.hideStats();
        this.init()
        // 微信广告
        wxAd.ins.loadGeziAd2()
        wxAd.ins.topZhuanfa()
        wxAd.ins.showGezi2()
        wxAd.ins.hideGezi1()
        wxAd.ins.bgmZd(() => {
            audioTool.ins.playMusic('gameBgm')
        })
    }
    protected onEnable(): void {
        this.createPlayer()
        // 监听游戏结束
        director.on(emits.gameover, this.gameOver, this)
    }
    init() {
        audioTool.ins.playMusic('gameBgm')
        gameConfig.enemyNode = this.enemyNode
        gameConfig.gameRoot = this.gameRoot
        gameConfig.isGame = 1
        // 每关重置复活次数
        gameConfig.fuhuoNum = 1
        // 复活监听
        director.on(emits.fuhuo, this.fuhuo, this)
        director.on(emits.gamePause, this.gamePause, this)
    }
    // 生成人物
    createPlayer() {
        nodePool.ins.getPoolNode(`player${gameConfig.slectType}`, this.playerNode, new Vec3(0, 0, 0))
    }
    // 游戏结束
    gameOver() {
        director.once(Director.EVENT_AFTER_PHYSICS, () => {
            this.playerNode.removeAllChildren()
        });
        audioTool.ins.stopMusic()
        if (gameConfig.fuhuoNum >= 1) {
            nodePool.ins.getPoolNode('gameOver1', this.node)
        } else {
            nodePool.ins.getPoolNode('gameOver2', this.node)
        }
    }
    // 复活角色
    fuhuo() {
        this.createPlayer()
        gameConfig.ifFuhuo = 1
        this.scheduleOnce(() => {
            gameConfig.ifFuhuo = 0
        }, 2)
    }
    // 游戏暂停
    gamePause() {
        if (gameConfig.gamePause == 1) {
            PhysicsSystem2D.instance.enable = false;
        } else {
            PhysicsSystem2D.instance.enable = true;
        }
    }
    // 销毁组件
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
}


