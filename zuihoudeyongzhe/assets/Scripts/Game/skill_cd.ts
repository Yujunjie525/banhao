const {ccclass, property} = cc._decorator;

@ccclass
export default class skill_cd extends cc.Component {

    @property(cc.Sprite)
    skill:cc.Sprite = null;//技能精灵

    @property(cc.Label)
    time_label:cc.Label = null;//显示技能冷却剩余时间的文字

   

    @property
    isshow_label:boolean = true;//是否显示文字

    private endFunc : Function = null;
    private time:number=3

    onLoad(){
        this.skill.fillRange = 1;//游戏开始的时候技能的填充范围是1
        this.time_label.node.active = false;
    }
    start(){
        console.log("start技能冷却")
    }

    update(dt:number){
        if(this.skill.fillRange == 1){
            return
        }
        if(this.skill.fillRange != 1){//如果技能精灵的填充不为1 也就是说已经使用了技能
            this.skill.fillRange += dt / this.time;//恢复技能   每帧恢复的值为帧率 / 技能冷却时间
            this.time_label.string = Math.floor(((1 - this.skill.fillRange) * this.time)+1).toString();//每帧更新技能剩余时间
            //技能剩余时间首先1 - 技能精灵的填充度再 * 技能冷却时间，最后Math.floor取整

            if(this.isshow_label == true){//如果可以显示文字
                this.time_label.node.active = true;//显示技能冷却剩余时间
            }      
          }
        if(this.skill.fillRange == 1){//如果技能精灵的填充为1 也就是说技能还没被使用
         //   console.log("技能时间测试："+this.skill.fillRange )
            this.skill.getComponent(cc.Button).interactable = true;//启动按钮
            this.time_label.node.active = false;//隐藏技能冷却剩余时间
            if(this.endFunc){
                this.endFunc()
            }


        }
    }

    onbtn(actionTime : number, mEndFunc ?: Function){//按下技能按钮时的事件
        if(actionTime){
            this.time=actionTime

        }
        
        this.endFunc=mEndFunc
        this.skill.fillRange = 0;//技能填充范围设置为1
       // console.log("使用了技能");//打印log
        this.skill.getComponent(cc.Button).interactable = false;//禁用按钮
    }

}
