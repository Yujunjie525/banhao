class LYXMath {

    /**
     * 将数字转化为时间
     * @param num 
     */
    public formatNumToTime(num: number): string {
        let s: number = num % 60;
        let m: number = Math.floor(num / 60);

        let sStr: string = s + "";
        if (s < 10) {
            sStr = "0" + sStr;
        }

        let mStr: string = m + "";
        if (m < 10) {
            mStr = "0" + mStr;
        }

        return mStr + ":" + sStr;
    }

    /**
     * 保留几位小数
     * @param val 
     * @param fractionDigits 
     */
    public toFixed(val: number, fractionDigits: number = 2): number {
        return Number(val.toFixed(fractionDigits));
    }

    /**
     * 计算两个整数之间的随机整数值
     * @param a 
     * @param b 
     */
    public randomInt(n: number, m: number) {
        let random = Math.floor(Math.random() * (m - n + 1) + n);
        return random;
    }

    /**
     * 从数组中随机一个元素
     * @param arr 
     */
    public randomOneFromArr(arr: any): any {
        if (!arr) {
            cc.warn("arr is wrong!");
            return;
        }

        let index: number = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    /**
     * 从数组中随机n个不同元素
     * @param arr 
     * @param n 
     */
    public randomFromArr(arr: any, n: number): any {
        if (!arr || !n) {
            cc.warn("arr or n is wrong!");
            return;
        }

        if (arr.length < n) {
            cc.warn("arr's length is lesser than n!");
            return;
        }

        let indexArr: number[] = [];
        arr.forEach((e, i) => {
            indexArr.push(i);
        });

        let randomIndexArr: number[] = [];
        for (let i: number = 0; i < n; i++) {
            let index: number = Math.floor(Math.random() * indexArr.length);
            randomIndexArr.push(indexArr.splice(index, 1)[0]);
        }

        let newArr = [];
        for (let i: number = 0; i < randomIndexArr.length; i++) {
            newArr.push(arr[randomIndexArr[i]]);
        }

        return newArr;
    }

    /**
     * 从数组中随机n个元素（有可能重复）
     * @param arr 
     * @param n 
     */
    public createFromArr(arr: any, n: number): any {
        if (!arr || !n) {
            cc.warn("arr or n is wrong!");
            return;
        }

        let randomIndexArr: number[] = [];
        for (let i: number = 0; i < n; i++) {
            let index: number = Math.floor(Math.random() * arr.length);
            randomIndexArr.push(arr[index]);
        }

        return randomIndexArr;
    }

    /**
     * 根据权重随机出其中一个
     */
    public getRandomByWeight(args) {
        let sum_weight = 0;
        for (var i in args) {
            sum_weight += args[i]["weight"];
        }

        var random = Math.ceil(Math.random() * sum_weight);
        var total = 0;
        var item = null;
        for (var j in args) {
            total += args[j]["weight"];
            if (random <= total && random > total - args[j]["weight"]) {
                item = args[j]
                break;
            }
        }
        return item;
    }

    /**
     * 根据权重随机出其中一个index
     */
    public getRandomIndexByWeight(args) {
        let sum_weight = 0;
        for (var i in args) {
            sum_weight += args[i]["weight"];
        }

        var random = Math.ceil(Math.random() * sum_weight);
        var total = 0;
        var index = 0;
        for (let j = 0; j < args.length; j++) {
            total += args[j]["weight"];
            if (random <= total && random > total - args[j]["weight"]) {
                index = j;
                break;
            }
        }
        return index;
    }

    /** 
     * 根据权重随机出其中n个
     */
    public getRandomsByWeight(args, n) {
        if (n >= args.length) {
            return args;
        }

        var items = [];
        for (let i = 0; i < n; i++) {
            if (args.length <= 0) {
                return items;
            }
            let index = this.getRandomIndexByWeight(args);
            items.push(args[index]);
            args.splice(index, 1);
        }

        return items;
    }

    /**
     * 数组乱序
     */
    public randomArray(arr) {
        let newArr = [];
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            var index = Math.floor(Math.random() * arr.length);//随机下标                     
            newArr.push(arr[index]);//将随机出的元素，存放新数组newArr中去                     
            arr.splice(index, 1);//    将随机出的元素在arr中删除                        
        }
        return [...newArr, ...arr];
    }

     /**
     * 概率生成
     * @param prob 
     * @param base 
     */
    public calProbability(prob: number, base: number = 100): boolean {
        let num: number = Math.random() * base;
        return num < prob;
    }

    /**
     * 根据两点坐标计算出夹角
     * @param startPos 
     * @param endPos 
     */
    public getDegreeBypos(startPos, endPos: cc.Vec2): number {
        let dx = endPos.x - startPos.x;
        let dy = startPos.y - endPos.y;
        let dir = new cc.Vec2(dx, dy);
        //根据朝向计算出夹角弧度
        let v1 = cc.v2(dir);
        let v2 = cc.v2(1, 0);
        if (v1.x == v2.x && v1.y == v2.y) {
            return 0;
        }
        let angle = cc.v2(dir).signAngle(cc.v2(1, 0));

        let degree = Math.floor(cc.misc.radiansToDegrees(angle));

        return degree;
    }

    /**
     * 根据两点坐标 获取对应的向量坐标
     * @param startPos 
     * @param endPos 
     */
    public getRadianBypos(startPos, endPos: cc.Vec2): cc.Vec2 {
        return endPos.sub(startPos).normalizeSelf();
    }
}

export let lyx_math: LYXMath = new LYXMath();