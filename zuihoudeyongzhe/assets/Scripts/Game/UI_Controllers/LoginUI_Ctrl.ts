const { ccclass, property } = cc._decorator;

import UIMgr, { UICtrl } from "./../../Managers/UIMgr";
import GameApp from "../GameApp";
import TtMgr from "../../Managers/TtMgr"
import EventMgr from "../../Managers/EventMgr";
import { save } from "../../Load/tools";

@ccclass
export default class LoginUI_Ctrl extends UICtrl {
    private gameStart: boolean = false
    private bg: cc.Node = null
    private isAgree_data = {}
    private localStorage_isAgree = "m_localStorage_isAgree"//判断用户是否同意隐私政策  安卓用 其他平台无视

    onLoad() {

        super.onLoad();
        //    cc["LoginUI_Ctrl"]=LoginUI_Ctrl  //android调用的全局
        this.isAgree_data = {

            "isAgree": false
        }

        if (cc.sys.localStorage.getItem(this.localStorage_isAgree)) {


            this.isAgree_data = JSON.parse(cc.sys.localStorage.getItem(this.localStorage_isAgree))

        } else {



            cc.sys.localStorage.setItem(this.localStorage_isAgree, JSON.stringify(this.isAgree_data));
            this.isAgree_data = JSON.parse(cc.sys.localStorage.getItem(this.localStorage_isAgree))



        }



        this.bg = this.view["bg"]
        // 使用 cc.find("Canvas") 确保获取到正确的 Canvas 节点
        const canvasNode = cc.find("Canvas");
        if (canvasNode) {
            this.resetSize(canvasNode)//背景适配
        }
        this.view["isLogin_UI"].active = false
        this.view["login_btn"].active = false
        //由于对接了字节跳动 抖音平台得先判断是否登录才能显示按钮
        if (window.tt) {
            this.get_login()
        } else {
            this.login(true)//如果不是抖音平台就直接显示按钮
        }

        EventMgr.Instance.add_event_listenner("startGame_android", this, this.startIsOK)




    }

    start() {




        if (window.tt || window.wx) {
            console.log("非安卓平台不用弹出隐私政策");
            this.view["yinsiBtn_index"].active = false//隐私政策连接按钮隐藏
        } else {
            this.add_button_listen("yinsi/yinsiBtn", this, this.yinsiActivity)
            this.add_button_listen("yinsiBtn_index", this, this.yinsiActivity)
            // if (this.isAgree_data["isAgree"]) {
            //     console.log("同意隐私政策");
            //     if (cc.sys.os == cc.sys.OS_ANDROID) {
            //         jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "YSDKinit", "()V")
            //     }
                
            // } else {

            //     this.view["yinsi"].getComponent("PopDialogCtrl").showDialog()

            //     this.add_button_listen("yinsi/agree", this, this.agree)
            //     this.add_button_listen("yinsi/reject", this, this.reject)
            // }

            // 默认隐藏隐私协议弹窗
            this.view["yinsi"].active = false;
            this.view["mask"].active = false;
            // 自动设置为已同意
            this.isAgree_data["isAgree"] = true;
            cc.sys.localStorage.setItem(this.localStorage_isAgree, JSON.stringify(this.isAgree_data));
            console.log("同意隐私政策");
            // if (cc.sys.os == cc.sys.OS_ANDROID) {
                // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "YSDKinit", "()V")
            // }
        }







    }


    public static CocosFun(msg: string) {
        console.log("我是来自cocos的回调：" + msg);

    }

    private yinsiActivity() {
        console.log("点击了隐私按钮");
        //该按钮调用安卓方法跳转隐私政策activity，如果是字节跳动和微信平台此按钮失效
        if (window.tt || window.wx) {
    
            return
        }
        else if (cc.sys.os == cc.sys.OS_ANDROID) {
            //调用安卓方法
            this.initYinsi()
        }
    }

    private agree() {


        this.isAgree_data["isAgree"] = true
        cc.sys.localStorage.setItem(this.localStorage_isAgree, JSON.stringify(this.isAgree_data));
        this.view["yinsi"].getComponent("PopDialogCtrl").hideDialog()
        //调用一下安卓实名认证初始化
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "YSDKinit", "()V")
        }
    }

    private reject() {
        this.view["yinsi"].getComponent("PopDialogCtrl").hideDialog()
        if (window.tt || window.wx) {

            return
        }
        else if (cc.sys.os == cc.sys.OS_ANDROID) {
            this.exitGame()
        }
    }
    private get_login2() {//强制拉起
        TtMgr.Instance.login_app(true, this.login, this)
    }
    private get_login() {//不强制拉起
        TtMgr.Instance.login_app(false, this.login, this)
    }

    //根据登录状态显示按钮
    private login(isLogin: boolean) {
        if (isLogin) {
            this.view["login_btn"].active = false
            this.view["isLogin_UI"].active = true
            console.log("我不是安卓0");

            if (window.tt || window.wx) {
                this.view["isLogin_UI"].y-=90;//改坐标
                console.log("我不是安卓1");
                //如果是自己跳动和微信隐藏退出按钮
                this.view["isLogin_UI/exitBtn"].active = false
                //开始游戏按钮事件
                this.add_button_listen("isLogin_UI/startGame", this, this.onGameStartClick);
                //选择关卡按钮事件
                this.add_button_listen("isLogin_UI/levelBtn", this, this.onlevelsClick);
                //我的机库按钮事件
                this.add_button_listen("isLogin_UI/equippedBtn", this, this.onEquippedClick)
            } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                console.log("我不是安卓2");
                this.view["isLogin_UI/exitBtn"].active = true
                this.add_button_listen("isLogin_UI/exitBtn", this, this.exitGame)
                //开始游戏按钮事件
                this.add_button_listen("isLogin_UI/startGame", this, this.onGameStartClick);
                //选择关卡按钮事件
                this.add_button_listen("isLogin_UI/levelBtn", this, this.onlevelsClick);
                //我的机库按钮事件
                this.add_button_listen("isLogin_UI/equippedBtn", this, this.onEquippedClick)
            }else{

                console.log("我不是安卓3");
                this.view["isLogin_UI/exitBtn"].active = true
                this.add_button_listen("isLogin_UI/exitBtn", this, this.exitGame)
               //开始游戏按钮事件
                this.add_button_listen("isLogin_UI/startGame", this, this.onGameStartClick);
                //选择关卡按钮事件
                this.add_button_listen("isLogin_UI/levelBtn", this, this.onlevelsClick);
                //我的机库按钮事件
                this.add_button_listen("isLogin_UI/equippedBtn", this, this.onEquippedClick)    
            }


        } else {
            //字节跳动审核要求不登录状态可以开始游戏。所以也显示游戏按钮 这个根据自己需求来
            this.view["login_btn"].active = true
            this.view["isLogin_UI"].active = true
            this.add_button_listen("isLogin_UI/startGame", this, this.onGameStartClick);
            this.add_button_listen("isLogin_UI/levelBtn", this, this.onlevelsClick);
            this.add_button_listen("isLogin_UI/equippedBtn", this, this.onEquippedClick)
            this.add_button_listen("login_btn", this, this.get_login2);


        }
    }


    private exitGame() {
        // if (cc.sys.os == cc.sys.OS_ANDROID) {
        //     jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "exitGame", "()V")
        // }
        
        localStorage.removeItem('SLS_USERNAME');
        localStorage.removeItem('SLS_PASSWORD');
        localStorage.removeItem('SLS_USER_ID');
        save('SLS_REALNAME', 'false');
        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');
        cc.director.loadScene('Load');
    }

    private initYinsi() {
        console.log("进入安卓隐私政策");
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "yinsi", "()V")

        }
    }

    private onGameStartClick(): void {
        // if (cc.sys.os == cc.sys.OS_ANDROID){
        //     jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "startGame", "()V")
        // }


        cc.director.resume()

        UIMgr.Instance.remove_ui(this.node.name)
        GameApp.Instance.enterGameScene();
    }
    private onlevelsClick(): void {
        // if (cc.sys.os == cc.sys.OS_ANDROID){
        //     jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "startGame", "()V")
        // }
        cc.director.resume()

        UIMgr.Instance.remove_ui(this.node.name)
        GameApp.Instance.levelsPage()
    }
    private onEquippedClick(): void {
        // if (cc.sys.os == cc.sys.OS_ANDROID){
        //     jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "startGame", "()V")
        // }
        cc.director.resume()

        UIMgr.Instance.remove_ui(this.node.name)
        GameApp.Instance.equippedPage()
    }

    /**
 * 手机屏幕适配
 * @param cav 
 */
    resetSize(cav) {
        let frameSize = cc.view.getFrameSize();
        let designSize = cc.view.getDesignResolutionSize();
        if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
            cav.width = designSize.height * frameSize.width / frameSize.height;
            cav.height = designSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        } else {
            cav.width = designSize.width;
            cav.height = designSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        this.fitScreen(cav, designSize, this.bg);
    }
    /**
     * 背景适配
     * @param canvasnode 
     * @param designSize 
     */
    fitScreen(canvasnode, designSize, bgNode) {
        let scaleW = canvasnode.width / designSize.width;
        let scaleH = canvasnode.height / designSize.height;
        //   let bgNode = canvasnode.getChildByName('background');
        let bgScale = canvasnode.height / bgNode.height;
        bgNode.width *= bgScale;
        bgNode.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = canvasnode.width / bgNode.width;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
        }
    }

    public static startGame_android(msg: boolean) {
        EventMgr.Instance.dispatch_event("startGame_android", msg)
    }
    private startIsOK(type, data) {
        console.log("已经实名认证可以开始游戏了！！！"+data);

        this.gameStart = data
        this.login(true)
    }
    onDestroy() {
        if (EventMgr.Instance) {
            EventMgr.Instance.remove_event_listenner("startGame_android", this, this.startIsOK)
        }
    }
}
