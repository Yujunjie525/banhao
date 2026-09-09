import GameApp from "./Game/GameApp";
import ResMgr from "./Managers/ResMgr";
import EventMgr from "./Managers/EventMgr";
import SoundMgr from "./Managers/SoundMgr";
import NetMgr from "./Managers/Net/NetMgr";
import UIMgr from "./Managers/UIMgr";
import WxMgr from "./Managers/WxMgr";
import TtMgr from "./Managers/TtMgr"
import UserData from "./Game/UserData"
import EquippedData from "./Game/EquippedData"


import { LQCollideSystem } from "../lq_collide_system/lq_collide_system";
import { LQBulletSystem } from "../lq_bullet_system/lq_bullet_system";
import Victory_UI_Ctrl from "./Game/UI_Controllers/Victory_UI_Ctrl";
import Over_UI_Ctrl from "./Game/UI_Controllers/Over_UI_Ctrl";
import Equipped_UI_Ctrl from "./Game/UI_Controllers/Equipped_UI_Ctrl";
import LoginUI_Ctrl from "./Game/UI_Controllers/LoginUI_Ctrl";
//import { concat } from "../../build/wechatgame/wxSubContext/src/subdomain.json";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLanch extends cc.Component {
    public static Instance: GameLanch = null;

    @property
    private isUsingWebSocket: boolean = false;

    @property(cc.AudioClip)
    private gameplayBgm: cc.AudioClip = null;

    @property(cc.AudioClip)
    private buttonEffect: cc.AudioClip = null;

    private Sub_num: number = 0


    private Subpackage: string[] = [];






    onLoad() {



            console.log("onLoad");
            


        if (!GameLanch.Instance || !cc.isValid(GameLanch.Instance)) {
            GameLanch.Instance = this;
        }
        else {
            this.destroy();
            return;
        }



       this.Subpackage = ['Gui', 'Maps', 'Sounds', 'ui_prefabs']//分包
       // this.Subpackage = ['subpackages/Gui', 'subpackages/Maps', 'subpackages/Sounds', 'subpackages/ui_prefabs']//分包






//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999



        cc["Victory_UI_Ctrl"] = Victory_UI_Ctrl  //android调用的全局
        cc["Over_UI_Ctrl"] = Over_UI_Ctrl  //android调用的全局
        cc["Equipped_UI_Ctrl"] = Equipped_UI_Ctrl  //android调用的全局
        cc["LoginUI_Ctrl"] = LoginUI_Ctrl  //android调用的全局



        //碰撞系统开关
        LQCollideSystem.is_enable = true;//关闭 
        //子弹系统开关
        LQBulletSystem.is_bullet_enable = true;
        //发射器系统开关
        LQBulletSystem.is_emitter_enable = true;

        // 初始化框架
        // ResMgr.Instance.init(); // 初始化资源模块的代码;
        this.node.addComponent(ResMgr); // 初始化我们的资源管理模块
        this.node.addComponent(EventMgr); // 初始化我们的事件发布
        const soundMgr = this.node.addComponent(SoundMgr); // 初始化我们的声音管理模块
        soundMgr.configure(this.gameplayBgm, this.buttonEffect);
        this.node.addComponent(UIMgr); // 初始化我们的UI框架
        this.node.addComponent(WxMgr)//初始化微信相关逻辑
        this.node.addComponent(TtMgr)//初始化字节跳动相关逻辑
        this.node.addComponent(UserData)//用户数据
        this.node.addComponent(EquippedData)//武器数据
        if (this.isUsingWebSocket === true) {
            this.node.addComponent(NetMgr); // 初始化websocket管理模块;
        }
        // end

        // 初始化游戏入口模块
        this.node.addComponent(GameApp);
        // 进入游戏
        UserData.Instance.getUserData()//获取玩家数据
        EquippedData.Instance.getUserData()//获取玩家购买武器的数据
        GameApp.Instance.EnterGame();

        //暂时不用分包了
        // if (window.tt) {
        //     GameApp.Instance.EnterGame();
      
        //    // this.loadSubpackages(this.Subpackage[0])
        // } else {
        //     GameApp.Instance.EnterGame();
        // }
        // end 
    }

    onDestroy() {
        if (GameLanch.Instance === this) {
            GameLanch.Instance = null;
        }
    }

//     start() {
//    }





   //字节跳动分包加载
    private loadSubpackages(packageName: string) {
        const self = this
        const loadTask = (window as any).tt.loadSubpackage({
            name: packageName, // name 可以填 name 或者 root
            success: function (res) {
                self.Sub_num++
                console.log("加载成功" + res.errMsg + " name:" + packageName + " 编号：" + self.Sub_num);
                if (self.Sub_num === 4) {
                    GameApp.Instance.EnterGame();
                    console.log("已经加载全部分包");
                } else {
                    self.loadSubpackages(self.Subpackage[self.Sub_num])
                }
                // 分包加载成功后通过 success 回调
            },
            fail: function (res) {
                console.log("加载失败" + res.errMsg + " 分包：" + packageName);
                self.loadSubpackages(self.Subpackage[self.Sub_num])
                // 分包加载失败通过 fail 回调
            }
        });

        // loadTask.onProgressUpdate(res => {
        //     console.log('下载进度', res.progress+"包名："+packageName);
        //     console.log('已经下载的数据长度', res.totalBytesWritten+"包名："+packageName);
        //     console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite+"包名："+packageName);
        // });
    }


  

}
