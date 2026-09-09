import { _decorator, Component, director, Label, log, Node, Tween, tween, Vec2, Vec3 } from 'cc';
import { audioTool } from '../utils/audioTool';
import { nodePool } from '../utils/nodePool';
import { emits, localData } from '../data/enums';
import { gameConfig } from '../data/gameConfig';
import { getTime, load, save } from '../utils/tools';
import { wxAd } from '../AD/wxAd';
import { bgmName } from '../../scripts/data/enmus';
const { ccclass, property } = _decorator;

@ccclass('homeView')
export class homeView extends Component {
    // 商店
    @property(Node) shopNode: Node = null
    // 体力值显示
    @property(Label) tiliNum: Label = null
    // 最高记录
    @property(Label) maxJuliNum: Label = null
    private fuliNode: Node = null
    start() {
        this.init()
        // 微信广告
        wxAd.ins.topZhuanfa()
        // 微信
        wxAd.ins.loadGeziAd1()
        wxAd.ins.showGezi1()
        wxAd.ins.hideGezi2()
        wxAd.ins.bgmZd(() => {
            audioTool.ins.playMusic(bgmName.music_bg)
        })
    }
    init() {
        // 首页根节点
        gameConfig.homeRoot = this.node
        gameConfig.isGame = 0
        this.fuliNode = this.node.getChildByName('dayFl')
        audioTool.ins.playMusic(bgmName.music_bg)
        director.emit(emits.jinbiNum)
        this.initTili()
        this.homeTw()
        this.maxJuli()
        director.on(emits.initNum, this.initTili, this)
        director.on(emits.initHomeIcon, this.homeIcon, this)
        this.homeIcon()
    }
    protected onDestroy(): void {
        director.off(emits.initNum, this.initTili, this)
        director.off(emits.initHomeIcon, this.homeIcon, this)
    }
    /**
     * 开始游戏
     */
    playGameBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        if (gameConfig.tiliNum >= 5) {
            audioTool.ins.stopMusic()
            gameConfig.tiliNum -= 5
            this.initTili()
            director.loadScene('game')
        } else {
            nodePool.ins.getPoolNode('tips', this.node, new Vec3(0, 60, 0))
            director.emit(emits.tips, '体力不足')
        }

    }
    /**
    * 打开商店
    */
    openShop() {
        audioTool.ins.playSound(bgmName.sound_btn)
        this.shopNode.active = true
    }
    /**
    * 打开设置
    */
    settingBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        nodePool.ins.getPoolNode('settings', this.node)
        director.emit(emits.backIsShow)
    }
    /**
     * 每日礼包
     */
    dayFl() {
        audioTool.ins.playSound(bgmName.sound_btn)
        const isLingqu = getTime()
        if (isLingqu >= 24) {
            nodePool.ins.getPoolNode('fuli', this.node)
        } else {
            nodePool.ins.getPoolNode('tips', this.node, new Vec3(0, 60, 0))
            director.emit(emits.tips, '今天已领过了')
        }
    }
    /**
     * 排行榜
     */
    paihangBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        nodePool.ins.getPoolNode('tips', this.node, new Vec3(0, 60, 0))
        director.emit(emits.tips, '功能暂未开放')
    }
    // 刷新体力
    initTili() {
        this.tiliNum.string = String(gameConfig.tiliNum)
        save(localData.tiliNum, gameConfig.tiliNum)
    }
    // 获取体力
    getTili() {
        nodePool.ins.getPoolNode('tili', this.node)
    }
    // 首页图标状态
    homeIcon() {
        // 首页福利领取
        if (getTime() >= 24) {
            this.fuliNode.getChildByName('tishi').active = true
            tween(this.fuliNode).by(0.5, { scale: new Vec3(0.1, 0.1, 0) }).by(0.5, { scale: new Vec3(-0.1, -0.1, 0) }).union().repeatForever().start()
        } else {
            this.fuliNode.getChildByName('tishi').active = false
            // 停止该节点下的所有缓动
            Tween.stopAllByTarget(this.fuliNode);
        }
    }
    // 首页动画缓动
    homeTw() {
        let homeDh = this.node.getChildByName('homeDh')
        tween(homeDh).by(1.5, { position: new Vec3(-40, 50, 0) }).by(1.5, { position: new Vec3(40, -50, 0) }).union().repeatForever().start()
    }
    // 最高分数
    maxJuli() {
        this.maxJuliNum.string = gameConfig.maxJuli + ''
    }
}


