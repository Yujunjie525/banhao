const { ccclass, property } = cc._decorator;

@ccclass
export default class RankPanel extends cc.Component {

    @property(cc.Node)
    private main: cc.Node = null;

    @property(cc.Node)
    private closeBtnNode: cc.Node = null;

    @property(cc.Node)
    private openBtnNode: cc.Node = null;

    // @property(cc.Node)
    // private openBtnNode2: cc.Node = null;




  

    // @property(cc.Node)
    // private over: cc.Node = null;

   // private static instance: RankPanel = null;

    protected onLoad() {
        this.main.active = false
    
      //  RankPanel.instance = this;
      // this.setScore(100);
    //  this.getRank();
      //  this.hide();
  // this.main.zIndex=2
      //  this.over.active=false;
        this.main.active=false;
        this.closeBtnNode.on('touchend',this.hide, this);
        this.openBtnNode.on('touchend', this.show, this);
     //   this.openBtnNode2.on('touchend', this.show, this);


    }

    protected onDestroy() {
        this.closeBtnNode.off('touchend', this.hide, this);
    }

    public show() {
         cc.director.resume()
      //  this.main.getComponent("PopDialogCtrl").showDialog()
         
         this.main.active = true;
        //  this.main.zIndex=1



        this.getRank();
        
    }




    public hide() {
        // if(this.over.active){
        //   this.over.active=false;
        // }else{
        //    // this.over.active=true
        // }
        //  cc.director.resume()
        // this.main.getComponent("PopDialogCtrl").hideDialog()
       this.main.active = false;
       cc.director.pause()
    }

    /**
     * 设置用户的分数
     * @param value
     */
    public  setScore(value: number) {
        console.log("上传分数："+value)
        wx.postMessage({
            event: 'setScore',
            score: value
        });
    }



        /**
     * 修改分数 任意填写
     * @param value
     */
    public  upScore(value: number) {
        console.log("我上传了分数是：：：："+value)
        wx.postMessage({
            event: 'update',
            score: value
        });
    }

    /**
     * 获取排行榜
     */
    public  getRank() {
        wx.postMessage({
            event: 'getRank'
        });
    }

}