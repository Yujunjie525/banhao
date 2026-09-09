var Config = require("Config");
cc.Class({
    extends: cc.Component,

    properties: {
        maxIndex: 9999,
        floorPre: cc.Prefab,
    },
    // 平铺一块地板
    outPutOneFloor:function(obj) {
        let floor = cc.instantiate(this.floorPre);
        floor.getComponent('mapfloor').enabled = false;
        // 判断分岔
        if (obj.fork) {
            if (obj.fork[0].d == 'right') {
                this.floorForkRecord.x = this.record.x + 55;
            } else {
                this.floorForkRecord.x = this.record.x - 55;
            }
            this.floorForkRecord.y = this.record.y + 39;
            for (let i = 0; i < obj.fork.length; i++) {
                this.outPutOneFork(obj.fork[i], i);
            }
        }
        //设置
        floor.zIndex = this.maxIndex;
        floor.x = this.record.x;
        floor.y = this.record.y;
        floor.parent = this.node;

        floor.getChildByName('prop').destroy();

        // 更新下一个地板出现的位置 (记录数据)
        switch (obj.d) {
            case 'right':
                this.record.x += 60;
                break;
            case 'left':
                this.record.x -= 60;
                break;
        }
        if (obj.bottom) {
            this.record.y -= 35;
        } else {
            this.record.y += 35;
            this.maxIndex -= 1;
        }

        this.record.num += 1;
    },

    // 输出分岔
    outPutOneFork:function(obj, index) {
        let floor = cc.instantiate(this.floorPre);
        floor.getComponent('mapfloor').enabled = false;
        floor.getChildByName('prop').destroy();

        floor.zIndex = this.maxIndex - index;
        floor.x = this.floorForkRecord.x;
        floor.y = this.floorForkRecord.y;
        floor.parent = this.node;

        // 更新下一个地板出现的位置 (记录数据)
        switch (obj.d) {
            case 'right':
                this.floorForkRecord.x += 60;
                break;
            case 'left':
                this.floorForkRecord.x -= 60;
                break;
        }

        this.floorForkRecord.y += 35;
    },

    // 初始化主页地板
    initHomeFloor:function() {
        var homeMap = Config.homeMap;
        for (let i = 0; i < homeMap.length; i++) {
            this.outPutOneFloor(homeMap[i]);
        }
    },

    onLoad() {
        // 上一次地板分岔记录
        this.floorForkRecord = {
            x: 0,
            y: 0
        };
        // 上一次的地板记录
        this.record = {
            num: 0,
            x: 180, // 0    60
            y: -131 // -246  -71
        };
        this.initHomeFloor();
    },
});
