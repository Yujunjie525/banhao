
const Global = require('Global');
var skinItem = cc.Class({
    extends: cc.Component,

    properties: {
        // dragonAni:dragonBones.ArmatureDisplay,
        playerAnimation: cc.Animation, // 新增 Animation 组件引用
        txtLbl:cc.Label,

        onBtnNode:cc.Node,
        offBtnNode:cc.Node,
        
        skinIndex: 0, // 角色索引
    },

    updateUIUnLock:function(hasUnLock){
        // 先判断解锁
        if (hasUnLock) {
            this.onBtnNode.active = true;
            this.offBtnNode.active = false;
        } else {
            this.onBtnNode.active = false;
            this.offBtnNode.active = true;
        }
    },

    updateUIBeChoosed:function(beChoosed){
        // 再判断选中
        if (beChoosed) {
            this.txtLbl.string = '使用中';
            // 获取角色名称
            const skinName = Global.gameInfo.skinName[this.skinIndex];
            // 播放对应的庆祝动画
            this.playerAnimation.play(skinName + '_celebrate');
            // 放大节点到1.2倍
            this.playerAnimation.node.scale = 1;
            // 设置 onBtnNode 精灵为 shop
            if (this.onBtnNode) {
                const sprite = this.onBtnNode.getComponent(cc.Sprite);
                if (sprite) {
                    cc.loader.loadRes('zImg/shopdi', cc.SpriteFrame, (err, res) => {
                        if (!err) {
                            sprite.spriteFrame = res;
                        }
                    });
                }
            }
        } else {
            this.txtLbl.string = '使用';
            // 获取角色名称
            const skinName = Global.gameInfo.skinName[this.skinIndex];
            // 播放对应的站立动画
            this.playerAnimation.play(skinName + '_stand');
            // 缩小节点到0.8倍
            this.playerAnimation.node.scale = 0.8;
            // 设置 onBtnNode 精灵为 resources/zImg/youxizanting
            if (this.onBtnNode) {
                const sprite = this.onBtnNode.getComponent(cc.Sprite);
                if (sprite) {
                    cc.loader.loadRes('zImg/zijipaiming', cc.SpriteFrame, (err, res) => {
                        if (!err) {
                            sprite.spriteFrame = res;
                        }
                    });
                }
            }
        }
    },
    
});
module.exports = skinItem;
