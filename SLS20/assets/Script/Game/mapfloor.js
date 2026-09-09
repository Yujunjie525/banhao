const Global = require('Global');
var Config = require("Config");
cc.Class({
    extends: cc.Component,

    properties: {
        prop: {
            default: null,
            type: cc.Node,
        },

        floorSp:cc.Sprite,
        propSp:cc.Sprite,
        Atlas:cc.SpriteAtlas,
    },

    // 倒计时跌落地板
    countDownMove:function(x, y) {
        var actionOut = cc.moveBy(0.5, 0, -1000);
        actionOut.easing(cc.easeIn(3));
        var act1 = cc.moveBy(0.2, 10, -5);
        var act2 = cc.moveBy(0.2, -10, 0);
        var act3 = cc.moveBy(0.2, 12, 0);
        var act4 = cc.moveBy(0.1, -12, 0);
        var act5 = cc.moveBy(0.1, 15, -5);
        var act6 = cc.moveBy(0.1, -15, 0);
        this.node.runAction(cc.sequence(
            act1,
            act2,
            act3,
            act4,
            act5,
            act6,
            cc.callFunc(() => {
                // Global.game.playerSize.x 可以试着用这个参数去作为判定，或许player就可以加动画移动了
                if (Global.game.playerSize.x == x && Global.game.playerSize.y == y) {
                    Global.game.gameOver(3);
                } else {
                    Global.map.createSingle();
                }
                this.node.color = Global.hexToColor('#8c8c8c');
            }), 
            actionOut
        ));
    },

    setFloorSp:function(spName){
        this.floorSp.spriteFrame = this.Atlas.getSpriteFrame(spName);
    },

    setPropSp:function(spName){
        this.propSp.spriteFrame = this.Atlas.getSpriteFrame(spName);
    },

    // 初始化
    initFloor:function() {
        let floor = this.node;
        let data = this.node.floorData;
        this.node.stopAllActions();
        this.node.color = Global.hexToColor('#ffffff');

        floor.floorData.overMove = false;
        floor.floorData.countDown = 0;
        
        switch (data.type) {
            case 'base':
                this.floorSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.base);
                //floor.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.base;
                break;
            case 'floor':
                this.floorSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.floor);
                //floor.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.floor;
                break;
        }

        // 是否第一格
        if (data.first) {
            this.floorSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.start);
            //floor.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.start;
        }
        
        // 判断道具类型
        switch (data.prop) {
            case 'ice1':
                this.propSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.ice_1);
                //this.prop.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.ice_1;
                break;
            case 'ice2':
                this.propSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.ice_2);
                //this.prop.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.ice_2;
                break;
            case 'ice3':
                this.propSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.ice_3);
                //this.prop.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.ice_3;
                break;
            case 'gem':
                this.propSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.gem);
                //this.prop.getComponent(cc.Sprite).spriteFrame = this.gemImg;
                break;
            case 'force':
                this.propSp.spriteFrame = ""//this.Atlas.getSpriteFrame(Config.gameSpNames.force);
                //this.prop.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.force;
                break;
            case 'reverse':
                this.propSp.spriteFrame = ""//this.Atlas.getSpriteFrame(Config.gameSpNames.reverse);
                //this.prop.getComponent(cc.Sprite).spriteFrame = Global.gameInfo.images.reverse;
                break;
            case 'trap':
                this.propSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.trap);
                //this.prop.getComponent(cc.Sprite).spriteFrame = null;
                
                console.log(this.node.floorData);
                
                var trap = cc.instantiate(Global.map.trap);
                if (this.node.floorData.d == 'left') {
                    trap.scaleX = -1;
                } 
                trap.parent = this.node;
                break;
            default:
                this.propSp.spriteFrame = this.Atlas.getSpriteFrame(Config.gameSpNames.trap);
                break;
        }
    },

    update (dt) {
        if (this.node.floorData.countDown != 0 && !this.node.floorData.overMove && this.node.floorData.type == 'floor' && Global.gameInfo.state != 'over') {
            this.node.floorData.countDown -= 1;
            if (this.node.floorData.countDown == 0) {
                this.countDownMove(this.node.x, this.node.y);
            }
        }
    },

});
