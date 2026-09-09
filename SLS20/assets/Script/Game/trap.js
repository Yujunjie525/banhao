const Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        // 盖子
        cap: cc.Node,
        // 海豹
        seals: cc.Node,
        // 尾巴
        tail: cc.Node,
    },

    // 隐藏尾巴
    hideTail:function() {
        var act1 = cc.fadeOut(0.2);
        var act2 = cc.scaleTo(0.2, 0, 0);
        var act3 = cc.rotateTo(0.2, 0);
        var act4 = cc.moveTo(0.2, 31, -32.7);
        var actionOut = cc.spawn(act1, act2, act3, act4);
        this.tail.runAction(actionOut);
    },

    // 抖动盖子
    shakeCap:function() {
        var act1 = cc.rotateTo(0.1, 3);
        var act2 = cc.rotateTo(0.1, -3);
        var act3 = cc.rotateTo(0.1, 0);

        var actionOut = cc.sequence(
            act1, 
            act2,
            act1, 
            act2,
            act1, 
            act2,
            act1, 
            act2,
            act3,   
            cc.callFunc(() => {
                this.openCap();
        }));
        this.cap.runAction(actionOut);
    },

    // 出现尾巴
    showTail:function() {
        var act1 = cc.fadeIn(0.2);
        var act2 = cc.scaleTo(0.2, 1, 1);
        var act3 = cc.rotateTo(0.2, 30);
        var act4 = cc.moveTo(0.2, 15, -36);
        var act5 = cc.moveBy(1, 0, 0);

        var actionOut = cc.sequence(cc.spawn(act1, act2, act3, act4), act5, cc.callFunc(() => {
            this.hideTail();
        }));
        this.tail.runAction(actionOut);
    },

    // 出现海豹
    showSeals:function() {
        var act1 = cc.fadeIn(0.2);
        var act2 = cc.scaleTo(0.2, 1, 1);
        var act3 = cc.moveBy(1, 0, 0);
        var actionOut = cc.sequence(cc.spawn(act1, act2), act3, cc.callFunc(() => {
            this.hideSeals();
        }));
        this.seals.runAction(actionOut);
    },

    // 隐藏海豹
    hideSeals:function() {
        var act1 = cc.fadeOut(0.2);
        var act2 = cc.scaleTo(0.2, 1, 0);
        var actionOut = cc.spawn(act1, act2);
        this.seals.runAction(actionOut);
    },

    // 打开盖子
    openCap:function() {
        var act1 = cc.rotateTo(0.1, 95);
        var act2 = cc.moveTo(0.1, 36, -12.8);
        var act3 = cc.moveBy(1.4, 0, 0);
        var actionOut = cc.sequence(
            cc.spawn(act1, act2),
            cc.callFunc(() => {
                if (this.state == 'seals') {
                    this.node.parent.trapData = 'seals';
                    this.showSeals();
                } else {
                    this.node.parent.trapData = 'tail';
                    this.showTail();
                }
            }), 
            act3,
            cc.callFunc(() => {
                this.offCap();
            })
        );
        this.cap.runAction(actionOut);
    },

    // 关闭盖子 这里重置属性
    offCap:function() {
        var act1 = cc.rotateTo(0.1, 0);
        var act2 = cc.moveTo(0.1, 41.3, -12.8);
        var actionOut = cc.sequence(
            cc.spawn(act1, act2),
            cc.callFunc(() => {
                this.node.parent.trapData = 'none';
            }),
            cc.moveBy(0.5, 0, 0),
            cc.callFunc(() => {
                if (this.state == 'seals') {
                    this.state = 'tail';
                } else {
                    this.state = 'seals';
                }
                this.shakeCap();
            }) 
        );
        this.cap.runAction(actionOut);
    },  

    onLoad () {
        this.state = 'seals'; // 切换状态
        this.node.x = -3;
        this.node.y = 49.4;
        this.shakeCap();
    },
});
