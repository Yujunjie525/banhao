const {ccclass, property} = cc._decorator;

@ccclass
export default class ClockCtrl extends cc.Component {


   @property({type:cc.Node, tooltip:"技能ui"})
    gui :cc.Node = null;

    @property({type:cc.Node, tooltip:"冷却时间透明"})
    bar : cc.Node = null;



    @property({type:cc.Label, tooltip:"倒计时文字"})
    label :cc.Label = null;

   

    @property({tooltip:"是否逆时针"})
    clockWise : boolean = false;

    @property({tooltip:"计时方向"})
    reverse : boolean = false;  // false，由少变多

    @property({tooltip:"是否在加载的时候就开始计时"})
    playOnLoad : boolean = false;

    private nowTime : number = 0;   // 用于记录已经过去的时间

    private isRuning : boolean = false; // 计时器是否正在行走

    private sprite : cc.Sprite;

    private endFunc : Function = null;
    private actionTime : number = 10;


    onLoad () {
        this.label.node.active=false

       this. bar.active = false;
        // 获取子节点上的Sprite组件
        this.sprite =this. bar.getComponent(cc.Sprite);
        if(this.playOnLoad){
            
            this.startClockAction(this.actionTime, this.endFunc);
        }
    }

    startClockAction(actionTime : number, endFunc? : Function){
        if(actionTime <= 0){
            return;
        }
        this. gui.getComponent(cc.Button).interactable = false;//禁用按钮

        this.endFunc = endFunc;
        this. bar.active = true;
        this.label.node.active=true

        this.actionTime = actionTime;
        this.nowTime = 0;
        this.isRuning = true;
    }

    stopClockAction(){
        this. bar.active = false;
        this.isRuning = false;
        this. gui.getComponent(cc.Button).interactable = true;//禁用按钮

    }

    update (dt : number) {
        if(!this.isRuning){

            return;
        }

        this.nowTime += dt;
        // 将时间转换为百分比，设置给this.sprite的FillRange属性
        let per : number = this.nowTime/this.actionTime;
        this.label.string = Math.floor(((1 - per) * this.actionTime)+1).toString();//每帧更新技能剩余时间

        if(per >= 1){
            per = 1;
            this. bar.active = false;
            this.isRuning = false;
            this.label.node.active=false
            this. gui.getComponent(cc.Button).interactable = true;//禁用按钮

            if(this.endFunc){
                this.endFunc();
            }
        }

        // 进度条 由多变少的控制
        // per : 0  0.5 1 
        // 1-per:1  0.5 0
        if(this.reverse){
            per = 1 - per;
        }

        // 顺时针和逆时针的控制
        if(this.clockWise){
            per = -per;
        }

        this.sprite.fillRange = per;
    }
}
