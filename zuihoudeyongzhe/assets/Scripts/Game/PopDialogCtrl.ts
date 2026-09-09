const {ccclass, property} = cc._decorator;

@ccclass
export default class PopDialogCtrl extends cc.Component {

    @property({type:cc.Node, tooltip:"弹出式对话框的遮罩节点"})
    mask : cc.Node = null;

    @property({type:cc.Node, tooltip:"弹出式对话框的主体内容节点"})
    content : cc.Node = null;

    @property({tooltip:"弹出式对话框初始化时的透明度"})
    maskOpacity : number = 200;

    @property({tooltip:"是否直接弹出"})
   isShow : boolean = true;

    private isPause:boolean=false
    //回调方法
    private endFunc: any = null;//函数
    private caller: any = null//this
    onLoad(){
  
        this.content.active = false;
        this.mask.active=false
        this.mask.opacity = this.maskOpacity;
        if(this.isShow){
            this.showDialog()

        }

 
    }

    start() {

    //     console.log("弹出窗口")
    //  //   cc.delayTime(0.4)//休眠几秒

    //     this.scheduleOnce(function () {   //只执行一次回调

    //     }, 0.4)
    }
  

  public  showDialog( endf?: any, mcaller?) {
        this.content.active = true;
         this.mask.active=true

         if(endf!=null&&mcaller!=null){
             this.endFunc=endf
             this.caller=mcaller


         }
         


      

            // mask淡入
            this.mask.opacity = 0;
            let fIn: cc.Action = cc.fadeTo(0.1, this.maskOpacity);
            this.mask.runAction(fIn);
            // content缩放显示
            this.content.setScale(0, 0);
            let s: cc.Action = cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut());
            this.content.runAction(s);



            this.scheduleOnce(function () {   //只执行一次回调
                console.log("弹出窗口")
                 if(endf!=null&&mcaller!=null){
                     this.endFunc.call(mcaller)
                 }



               cc.director.pause()//游戏暂停


            }.bind(this), 0.4)

  



    }

  public  hideDialog(){
     //  cc.director.resume()
       this.node.active = false;
       this.mask.active=false
        // mask淡出
        //this.mask.opacity = 0;
        // let fOut : cc.Action = cc.fadeTo(0.3, 0);
        // this.mask.runAction(fOut);

        // // content缩放隐藏
        // let s : any = cc.scaleTo(0.4, 0, 0).easing(cc.easeBackIn());

        // let endf : any = cc.callFunc(function(){
        //   //  this.node.active = false;
        // }.bind(this));
        // let seq : cc.ActionInterval = cc.sequence([s, endf]);
        // this.content.runAction(seq);
    }
}
