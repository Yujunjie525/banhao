const { ccclass, property } = cc._decorator;
import UIMgr, { UICtrl } from "./../../Managers/UIMgr";
import EventMgr from "../../Managers/EventMgr";
import UserData from "../UserData"
import SoundMgr from "../../Managers/SoundMgr";
import TtMgr from"../../Managers/TtMgr"
import { symlinkSync } from "fs";
import WxMgr from "../../Managers/WxMgr";




@ccclass // 注意修改类名
export default class Over_UI_Ctrl extends UICtrl {
    private score:number=null
    private game_score_lishi=null
    onLoad() {
        super.onLoad();


        if(window.tt){
            this.add_button_listen("Content/info/colse_btn", this, this.fuhuo);//看视频复活

            this.add_button_listen("Content/info/luping", this, this.luping);//分享录屏

        }else if(cc.sys.platform === cc.sys.WECHAT_GAME){
            this.add_button_listen("Content/info/colse_btn", this, this.fuhuo);//看视频复活
            this.view["Content/info/luping"].active=false
            this.view["Content/info/qianghua"].setPosition(0,-66)
            // this.view["Content/info/rpaly_btn"].setPosition(0,-220)
        }
        else if(cc.sys.os==cc.sys.OS_ANDROID||cc.sys.isBrowser==true){
            //临时 如果是安卓隐藏复活和分享录屏按钮
            this.add_button_listen("Content/info/colse_btn", this, this.fuhuo);//看视频复活
           // this.view["Content/info/colse_btn"].active=false//复活按钮
            this.view["Content/info/luping"].active=false
            this.view["Content/info/qianghua"].setPosition(0,-66)
            // this.view["Content/info/rpaly_btn"].setPosition(0,-220)
        }else{
            this.add_button_listen("Content/info/colse_btn", this, this.fuhuo);//看视频复活
            this.add_button_listen("Content/info/luping", this, this.luping);//分享录屏
        }
       


        this.add_button_listen("Content/info/qianghua", this, this.qianghua);//强化战机页面
        this.add_button_listen("Content/info/rpaly_btn", this, this.replay);//重新开始
        this.add_button_listen("Content/info/backhome", this, this.backhome);//返回主界面

        this.score=UserData.Instance.userData["score"]
        this.game_score_lishi=UserData.Instance.userData["game_score_lishi"]
    }
    start() {
        SoundMgr.Instance.play_effect("gameOver")
        
        this.view["Content/info/score"].getComponent(cc.Label).string=this.score
        this.view["Content/info/game_score_lishi"].getComponent(cc.Label).string=this.game_score_lishi
     //刷新历史记录
     if(this.score>=this.game_score_lishi){
        UserData.Instance.userData["game_score_lishi"]=this.score
        UserData.Instance.saveUserData()
        console.log("我打破了历史记录")
    }

    }

    private luping(){//录屏复活
        TtMgr.Instance.shareVideo(this.colse,this)
    }
    private fuhuo(){//看视频复活
        if(window.tt){
            TtMgr.Instance.showVideoAd("fuhuo",this.colse,this)

        }if(cc.sys.platform === cc.sys.WECHAT_GAME){
            console.log("加载微信视频")
            WxMgr.Instance.showVideoAd("fuhuo",this.colse,this)
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "creatorShowAD", "(Ljava/lang/String;)V" ,'fuhuo');

        }else{
            this.colse()
        }
    }

    private qianghua() {
        cc.director.resume()//开始游戏

        console.log("我的ui应该被删除" + this.node.name)
        UIMgr.Instance.remove_ui(this.node.name)
        EventMgr.Instance.dispatch_event("qianghua", true)
    }
    private replay(){
        cc.director.resume()
        this.node.getComponent("PopDialogCtrl"). hideDialog()

      
        UIMgr.Instance.remove_ui(this.node.name)


        EventMgr.Instance.dispatch_event("replay", null)//重玩  

    
    }

    private backhome(){
        // 恢复游戏运行
        cc.director.resume();
        
        // 清理分数
        UserData.Instance.userData["score"] = 0;
        UserData.Instance.saveUserData();
        
        // 停止音乐
        if (SoundMgr) {
            SoundMgr.Instance.stop_music();
        }
        
        // 移除当前 UI
        UIMgr.Instance.remove_ui(this.node.name);
        
        // 直接跳转到 start 场景
        cc.director.loadScene("Start");
    }



   private  colse() {
        console.log("复活成功")
        cc.director.resume()
        this.node.getComponent("PopDialogCtrl"). hideDialog()
        UIMgr.Instance.remove_ui(this.node.name)

        
    
        EventMgr.Instance.dispatch_event("revive", null)//带防护盾复活


      


    }


    //安卓调用的复活
    public  static colse_android(msg:string) {
     
         cc.director.resume()
         EventMgr.Instance.dispatch_event("revive", null)//带防护盾复活
         UIMgr.Instance.remove_ui("Over_UI")
         
 
         
     
       
 
 
       
 
 
     }

}
