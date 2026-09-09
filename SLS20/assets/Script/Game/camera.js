const Global = require('Global');
//游戏摄像机跟随
cc.Class({
    extends: cc.Component,

    properties: {
        // 设置一个目标为摄像机的中心点
        targetNode: cc.Node,
        // 画面移动速度
        moveSpeed: 0.2,
    },

    cameraMove:function() {
        if (this.node.x > this.targetNode.x) {
            this.node.x -= (this.node.x - this.targetNode.x) * this.moveSpeed;
            if (Math.round(this.node.x) == Math.round(this.targetNode.x)) {
                this.node.x = this.targetNode.x;
            }
        } else if (this.node.x < this.targetNode.x) {
            this.node.x += (this.targetNode.x - this.node.x) * this.moveSpeed;
            // console.log('执行x2', this.node.x);
            if (Math.round(this.node.x) == Math.round(this.targetNode.x)) {
                this.node.x = this.targetNode.x;
            }
        }
        
        if (this.node.y < this.targetNode.y + 246) {
            this.node.y += (this.targetNode.y + 246 - this.node.y) * this.moveSpeed;
            if (Math.round(this.node.y) == Math.round(this.targetNode.y + 246)) {
                this.node.y = this.targetNode.y + 246;
            }
        }
    },

    update (dt) {
        if (Global.game.DieFly) {
            this.cameraMove();
        }
        if (Global.gameInfo.state != 'over') {
            this.cameraMove();
        }
    },
});
