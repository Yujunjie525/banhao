
const {ccclass, property} = cc._decorator;
import mGameData from '../Data/GameData';
@ccclass
export default class BgMove extends cc.Component {

    @property(cc.Node)
    Bg01:cc.Node = null;

    @property(cc.Node)
    Bg02:cc.Node = null;

    @property(cc.Sprite)
    GameBg:cc.Sprite = null;

    @property(cc.SpriteFrame)
    gamebg_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    gamebg_2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    gamebg_3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    gamebg_4: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    gamebg_5: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    gamebg_6: cc.SpriteFrame = null;

    // 关卡模式柱子图片 - 对应gamebg_1
    @property(cc.SpriteFrame)
    pillar_level_1_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_level_1_y: cc.SpriteFrame = null;

    // 关卡模式柱子图片 - 对应gamebg_2
    @property(cc.SpriteFrame)
    pillar_level_2_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_level_2_y: cc.SpriteFrame = null;

    // 关卡模式柱子图片 - 对应gamebg_3
    @property(cc.SpriteFrame)
    pillar_level_3_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_level_3_y: cc.SpriteFrame = null;
    // 关卡模式柱子图片 - 对应gamebg_4
    @property(cc.SpriteFrame)
    pillar_level_4_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_level_4_y: cc.SpriteFrame = null;
    // 关卡模式柱子图片 - 对应gamebg_5
    @property(cc.SpriteFrame)
    pillar_level_5_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_level_5_y: cc.SpriteFrame = null;
    // 关卡模式柱子图片 - 对应gamebg_6
    @property(cc.SpriteFrame)
    pillar_level_6_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_level_6_y: cc.SpriteFrame = null;

    // 当前使用的背景图名称
    private currentBgName: string = "gamebg_1";

    // 无尽模式柱子图片
    @property(cc.SpriteFrame)
    pillar_infinite_x: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    pillar_infinite_y: cc.SpriteFrame = null;
    
    update (dt) {
        this.BGMove();
    }
    /**
     * 背景移动方法
     */
    onLoad() {
        let spriteFrame;
        if (mGameData.isInfiniteMode) {
            // 无限模式使用原逻辑
            spriteFrame = this.gamebg_2;
        } else {
            // 关卡模式根据配置选择背景图
            const levelConfig = mGameData.getCurrentLevelConfig();
            if (levelConfig && levelConfig.bg) {
                // 根据bg字段选择对应的背景图资源
                const bgName = levelConfig.bg;
                this.currentBgName = bgName;
                if (bgName === "gamebg_1") {
                    spriteFrame = this.gamebg_1;
                } else if (bgName === "gamebg_2") {
                    spriteFrame = this.gamebg_2;
                } else if (bgName === "gamebg_3") {
                    spriteFrame = this.gamebg_3;
                } else if (bgName === "gamebg_4") {
                    spriteFrame = this.gamebg_4;
                } else if (bgName === "gamebg_5") {
                    spriteFrame = this.gamebg_5;
                } else if (bgName === "gamebg_6") {
                    spriteFrame = this.gamebg_6;
                } else {
                    // 默认使用gamebg_1
                    spriteFrame = this.gamebg_1;
                    this.currentBgName = "gamebg_1";
                }
            } else {
                // 默认使用gamebg_1
                spriteFrame = this.gamebg_1;
                this.currentBgName = "gamebg_1";
            }
        }
        this.GameBg.spriteFrame = spriteFrame;
        
        // 根据游戏模式选择不同的柱子图片
        this.updateAllPillars();
    }
    
    /**
     * 更新所有柱子的图片
     */
    updateAllPillars() {
        let pillarX: cc.SpriteFrame;
        let pillarY: cc.SpriteFrame;
        
        if (mGameData.isInfiniteMode) {
            // 无限模式使用固定的柱子图片
            pillarX = this.pillar_infinite_x;
            pillarY = this.pillar_infinite_y;
        } else {
            // 关卡模式根据当前背景图选择对应的柱子图片
            switch (this.currentBgName) {
                case "gamebg_1":
                    pillarX = this.pillar_level_1_x;
                    pillarY = this.pillar_level_1_y;
                    break;
                case "gamebg_2":
                    pillarX = this.pillar_level_2_x;
                    pillarY = this.pillar_level_2_y;
                    break;
                case "gamebg_3":
                    pillarX = this.pillar_level_3_x;
                    pillarY = this.pillar_level_3_y;
                    break;
                case "gamebg_4":
                    pillarX = this.pillar_level_4_x;
                    pillarY = this.pillar_level_4_y;
                    break;
                case "gamebg_5":
                    pillarX = this.pillar_level_5_x;
                    pillarY = this.pillar_level_5_y;
                    break;
                case "gamebg_6":
                    pillarX = this.pillar_level_6_x;
                    pillarY = this.pillar_level_6_y;
                    break;
                default:
                    // 默认使用gamebg_1对应的柱子图片
                    pillarX = this.pillar_level_1_x;
                    pillarY = this.pillar_level_1_y;
            }
        }
        
        // 更新Bg01和Bg02下的所有柱子
        this.updatePillarsInNode(this.Bg01, pillarX, pillarY);
        this.updatePillarsInNode(this.Bg02, pillarX, pillarY);
    }
    
    /**
     * 更新指定节点下的柱子图片
     */
    updatePillarsInNode(node: cc.Node, pillarX: cc.SpriteFrame, pillarY: cc.SpriteFrame) {
        // 查找x1, x2, y1, y2节点并更新图片
        const x1 = node.getChildByName('x1');
        const x2 = node.getChildByName('x2');
        const y1 = node.getChildByName('y1');
        const y2 = node.getChildByName('y2');
        
        // 更新x方向柱子（x1, x2）
        if (x1) this.updatePillarSprite(x1, pillarX);
        if (x2) this.updatePillarSprite(x2, pillarX);
        
        // 更新y方向柱子（y1, y2）
        if (y1) this.updatePillarSprite(y1, pillarY);
        if (y2) this.updatePillarSprite(y2, pillarY);
    }
    
    /**
     * 更新单个柱子的SpriteFrame
     */
    updatePillarSprite(pillarNode: cc.Node, spriteFrame: cc.SpriteFrame) {
        const sprite = pillarNode.getComponent(cc.Sprite);
        if (sprite) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    BGMove(){    
        //背景运动
        if(mGameData.isGameBegin){
            var speed = mGameData.BgMoveSpeed;
            this.Bg01.y -= speed;
            if(this.Bg01.y <= -1600){
                this.Bg01.y += 1600 * 2;
            }
            this.Bg02.y -= speed;
            if(this.Bg02.y <= -1600){
                this.Bg02.y += 1600 * 2;
            }
        }
        //变颜色
        if(mGameData.playerBuff){
            // this.GameBg.getComponent(cc.Sprite).setState(1);
            this.GameBg.node.color = new cc.Color(192, 192, 192);
        }else{
            // this.GameBg.getComponent(cc.Sprite).setState(0);
            this.GameBg.node.color = new cc.Color(255, 255, 255);
        }
    }
}
