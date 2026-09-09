const Global = require('Global');
const MAP = require('mapdata');

cc.Class({
    extends: cc.Component,

    properties: {
        hasInit:false,

        maxIndex: 9999,
        player: {
            default: null,
            type: cc.Node,
        },
        floor: {
            default: null,
            type: cc.Prefab,
        },
        // 陷阱
        trap: {
            default: null,
            type: cc.Prefab,
        },
        floorTotal: 60,
    },

    // 掉落动画
    floorDownMove:function(floor) {
        if (floor.getChildByName('trap')) {
            floor.getChildByName('trap').destroy();
        }
        let action = cc.moveBy(0.5, 0, -1000);
        action.easing(cc.easeIn(3));
        floor.floorData.overMove = true;
        floor.color = Global.hexToColor('#8c8c8c');
        floor.runAction(cc.sequence(action, cc.callFunc(() => {
            this.floorPool.put(floor);
            this.createSingle();
            // 这里做继续生成地图判断
            if (this.mapFloorList.length - 100 < this.floorRecord.num) {
                console.log('继续生成地图数据==============>');
                let key = 'r' + (parseInt(7 * Math.random()) + 4);
                this.mapFloorList.push(...MAP[key]);
            } 
        })));
    },

    // 地板超出屏幕掉落
    fallDownFloor:function() {
        // console.log(this.player.scaleX); // 向右 => 1
        let nodes = this.node.children.filter(item => !item.floorData.overMove);
        for (let i = 0; i < nodes.length; i++) {
            if (this.player.x - this.node.width / 2 + 50 > nodes[i].x && nodes[i].y < this.player.y && this.player.scaleX > 0) {
                this.floorDownMove(nodes[i]);
                this.createSingle();
            }
            if (this.player.x + this.node.width / 2 - 50 < nodes[i].x && nodes[i].y < this.player.y && this.player.scaleX < 0) {
                this.floorDownMove(nodes[i]);
                this.createSingle();
            }
            if (this.player.y - this.node.height / 2 + 300 > nodes[i].y) {
                this.floorDownMove(nodes[i]);
                this.createSingle();
            }
        }
    },

    // 创建对象池
    createFloorPool:function() {
        this.floorPool = new cc.NodePool();
        for (let i = 0; i < this.floorTotal; i++) {
            let floor = cc.instantiate(this.floor); 
            this.floorPool.put(floor);
        }
    },

    // 获取地板
    getFloor:function() {
        let enemy = null;
        if (this.floorPool.size() > 0) {
            enemy = this.floorPool.get();
        } else {
            enemy = cc.instantiate(this.floor);
        }
        return enemy;
    },

    // 输出地板
    outPutOneFloor:function(obj) {
        let floor = this.getFloor();

        // 判断分岔
        if (obj.fork) {
            if (obj.fork[0].d == 'right') {
                this.floorForkRecord.x = this.floorRecord.x + 60;
            } else {
                this.floorForkRecord.x = this.floorRecord.x - 60;
            }
            this.floorForkRecord.y = this.floorRecord.y + 35;
            for (let i = 0; i < obj.fork.length; i++) {
                this.outPutOneFork(obj.fork[i], i);
            }
        }

        // 设置地板属性
        floor.floorData = obj;
        // 脚本初始化
        floor.getComponent('mapfloor').initFloor();

        floor.zIndex = this.maxIndex;
        floor.x = this.floorRecord.x;
        floor.y = this.floorRecord.y;
        floor.parent = this.node;

        // 更新下一个地板出现的位置 (记录数据)
        switch (obj.d) {
            case 'right':
                this.floorRecord.x += 60;
                break;
            case 'left':
                this.floorRecord.x -= 60;
                break;
        }
        if (obj.bottom) {
            this.floorRecord.y -= 35;
        } else {
            this.floorRecord.y += 35;
            this.maxIndex -= 1;
        }

        this.floorRecord.num += 1;
    },

    // 一开始随机拼接地图
    randomFloorList:function() {
        this.mapFloorList = [];
        this.mapFloorList.push(...MAP.base);
        let randomList = array => {
            let tmp, current, top = array.length;
            if (top) while (--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
            return array;
        }
        let r1 = ['r1','r2','r3'], r2 = ['r4','r5','r6'], r3 = ['r7','r8','r9'];
        let newList = [...randomList(r1), ...randomList(r2), ...randomList(r3)];

        for (let i = 0; i < newList.length; i++) {
            this.mapFloorList.push(...MAP[newList[i]]);
        }
    },

    // 输出分岔
    outPutOneFork:function(obj, index) {
        let floor = this.getFloor();

        // 设置地板属性
        floor.floorData = obj;
        // 脚本初始化
        floor.getComponent('mapfloor').initFloor();

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

        // this.floorRecord.num += 1; 暂定
    },

    // 将掉落的地板放到最后
    createSingle:function(num = 0) {
        if (num != 0) {
            // 执行起飞的时候执行
            for (let i = 0; i < num; i++) {
                this.outPutOneFloor(this.mapFloorList[this.floorRecord.num]);
            }
        } else {
            if (this.mapFloorList[this.floorRecord.num] && this.node.children.length < this.floorTotal + Global.gameInfo.isMaxPhone) {
                this.outPutOneFloor(this.mapFloorList[this.floorRecord.num]);
            }
        }
    },

    start(){
        this.hasInit = false;
    },

    onLoad() {
        Global.map = this;
        this.randomFloorList();
        // 拼接道路（三个档位）
        //this.mapFloorList = [...MAP.base, ...MAP.r1, ...MAP.r2, ...MAP.r3];

        // 上次铺展地板记录
        this.floorRecord = {
            num: 0,
            x: 180, // 0    60
            y: -141 // -246  -71
        }
        // 上次铺展地板地板分岔记录
        this.floorForkRecord = {
            x: 0,
            y: 0
        }
        this.createFloorPool()
        // 主角一开场出现的位置 => (0, -246);
        for (let i = 0; i < this.floorTotal; i++) {
            this.outPutOneFloor(this.mapFloorList[i]);
        }

    },
});
