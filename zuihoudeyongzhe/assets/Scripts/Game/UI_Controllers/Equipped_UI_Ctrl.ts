const { ccclass, property } = cc._decorator;

import GameApp from "../GameApp";
import UIMgr, { UICtrl } from "./../../Managers/UIMgr";

import EquippedData from "../EquippedData"
import ResMgr from "../../Managers/ResMgr";
import UserData from "../UserData"
//import { LQPoolUtil } from "../../../lq_base/util/lq_pool_util";

import WxMgr from "../../Managers/WxMgr"
import TtMgr from "../../Managers/TtMgr"
import EventMgr from "../../Managers/EventMgr";
import mGameData from "../../Load/GameData";



@ccclass // 注意修改类名
export default  class  Equipped_UI_Ctrl extends UICtrl {
//   public static Instance: Equipped_UI_Ctrl = null;
    //  private Eqbtn:cc.Button=null
    private planeScrollView: cc.ScrollView = null
    private equippedScrollView: cc.ScrollView = null

    private petScrollView: cc.ScrollView = null
    private pageView: cc.PageView = null
    private playerPageBtnBg: cc.Node = null
    private eqPageBtnBg: cc.Node = null
    private petPageBtnBg: cc.Node = null
    private  game_gold: cc.Label = null
    private  game_medal: cc.Label = null;
    private bg: cc.Node = null
    private  Content: cc.Node = null
    private  shared_type: string = "game_gold"
    //private getBtn:cc.Node=null
    private defaultPage: number = 1; // 默认显示的页签，1:飞机, 2:装备, 3:宠物

    onLoad() {
        super.onLoad();
        // if (Equipped_UI_Ctrl.Instance === null) {
        //     Equipped_UI_Ctrl.Instance = this;
        // }
        // else {
        //     this.destroy();
        //     return;
        // }
        
     // cc["Equipped_UI_Ctrl"]=Equipped_UI_Ctrl  //android调用的全局

        EventMgr.Instance.add_event_listenner("addJiangli",this,this.getJiangLI2)//给安卓用
    
        this.Content = this.view["Content"]
        this.pageView = this.view["PageView"].getComponent(cc.PageView)

        this.planeScrollView = this.view["PageView/view/content/page_1/planeScrollView"].getComponent(cc.ScrollView)//飞机滚动
        this.equippedScrollView = this.view["PageView/view/content/page_2/equippedScrollView"].getComponent(cc.ScrollView)//装备滚动
        this.petScrollView = this.view["PageView/view/content/page_3/petScrollView"].getComponent(cc.ScrollView)//装备滚动

        this.game_gold = this.view["game_gold"].getComponent(cc.Label)
        this.game_medal = this.view["game_medal"].getComponent(cc.Label)
        this.playerPageBtnBg = this.view["playerPageBtn"].getChildByName("Background")
        this.eqPageBtnBg = this.view["eqPageBtn"].getChildByName("Background")
        this.petPageBtnBg = this.view["petPageBtn"].getChildByName("Background")
        this.bg = this.view["bg"]

        this.add_button_listen("backHomeBtn", this, this.backHomeOnClick);
        this.add_button_listen("startGameBtn", this, this.startGameOnClick);
        this.add_button_listen("Content/info/back", this, this.hidDialog);//隐藏对话框

        // 隐藏原有的三个页签按钮
        if (this.view["playerPageBtn"]) {
            this.view["playerPageBtn"].active = false;
        }
        if (this.view["eqPageBtn"]) {
            this.view["eqPageBtn"].active = false;
        }
        if (this.view["petPageBtn"]) {
            this.view["petPageBtn"].active = false;
        }

        // 添加外部三个按钮的事件监听
        this.add_button_listen("planeBtn", this, this.goPage1);
        this.add_button_listen("equipmentBtn", this, this.goPage2);
        this.add_button_listen("petBtn", this, this.goPage3);

        if (window.tt || window.wx) {
            this.add_button_listen("Content/info/jingliBtn", this, this.Shared);//点击获得金币或勋章按钮


        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            this.add_button_listen("Content/info/jingliBtn", this, this.Shared);//点击获得金币或勋章按钮
            // //临时删除三个图标
            // // this.view["Content/info/jingliBtn/Background/Label/jb"].active=false
            // // this.view["Content/info/jingliBtn/Background/Label/zx"].active=false
            // this.view["Content/info/jingliBtn/Background/pic"].active = false

            // this.view["Content/info/jingliBtn/Background/Label"].setPosition(0, 0)


        } else {
            this.view["Content/info/jingliBtn/Background/pic"].active = false
            this.add_button_listen("Content/info/jingliBtn", this, this.hidDialog);//点击获得金币或勋章按钮
            this.view["Content/info/jingliBtn/Background/Label"].setPosition(0, 0)
            console.log("我是pc");

        }





        this.game_gold.string = mGameData.currentGold.toString()
        this.game_medal.string = UserData.Instance.userData["game_medal"]
        // 根据默认页签显示对应的页面
        this.showDefaultPage()
        var clickEventHandler_pageView = new cc.Component.EventHandler();
        clickEventHandler_pageView.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler_pageView.component = "Equipped_UI_Ctrl";//这个是代码文件名
        clickEventHandler_pageView.handler = "viewcallBack";
        clickEventHandler_pageView.customEventData = ""//序列化表
        this.pageView.pageEvents.push(clickEventHandler_pageView)









    }

    upGame_gold(num: number) {
        this.game_gold.string = num.toString()
    }

    upGame_medal(num: number) {
        this.game_medal.string = num.toString()
    }

    getPageViewPageIndex() {
        let pageIndex = this.pageView.getCurrentPageIndex();
        console.log("当前翻页容器的页码 == ", pageIndex);
        return pageIndex;
    }

    viewcallBack(event, customEventData) {
        // console.log("当前是："+this. getPageViewPageIndex())
        var page = this.getPageViewPageIndex()
        // pageView 的索引从0开始，所以加1
        this.updateBtnState(page + 1)
    }
    goPage1() {
        this.init()
        this.pageView.scrollToPage(0, 0.2)
        this.updateBtnState(1)
        console.log("当前是：" + this.getPageViewPageIndex())


    }
    goPage2() {
        this.init2()
        this.pageView.scrollToPage(1, 0.5)
        this.updateBtnState(2)
        console.log("当前是：" + this.getPageViewPageIndex())
    }
    goPage3() {
        this.init3()
        this.pageView.scrollToPage(2, 0.5)
        this.updateBtnState(3)
        console.log("当前是：" + this.getPageViewPageIndex())
    }

    // 更新外部按钮的选中状态
    updateBtnState(pageIndex: number) {
        // 更新原有页签按钮的背景色（虽然隐藏了，但保持逻辑一致性）
        if (pageIndex == 1) {
            this.playerPageBtnBg.color = new cc.Color(255, 178, 178);
            this.eqPageBtnBg.color = new cc.Color(255, 255, 255);
            this.petPageBtnBg.color = new cc.Color(255, 255, 255);
        } else if (pageIndex == 2) {
            this.playerPageBtnBg.color = new cc.Color(255, 255, 255);
            this.petPageBtnBg.color = new cc.Color(255, 255, 255);
            this.eqPageBtnBg.color = new cc.Color(255, 178, 178);
        } else if (pageIndex == 3) {
            this.playerPageBtnBg.color = new cc.Color(255, 255, 255);
            this.eqPageBtnBg.color = new cc.Color(255, 255, 255);
            this.petPageBtnBg.color = new cc.Color(255, 178, 178);
        }

        // 更新外部按钮的显示状态（如果有的话）
        if (this.view["planeBtnBg"]) {
            this.view["planeBtnBg"].color = pageIndex == 1 ? new cc.Color(255, 178, 178) : new cc.Color(255, 255, 255);
        }
        if (this.view["equipmentBtnBg"]) {
            this.view["equipmentBtnBg"].color = pageIndex == 2 ? new cc.Color(255, 178, 178) : new cc.Color(255, 255, 255);
        }
        if (this.view["petBtnBg"]) {
            this.view["petBtnBg"].color = pageIndex == 3 ? new cc.Color(255, 178, 178) : new cc.Color(255, 255, 255);
        }
    }

    // 显示默认页签
    showDefaultPage() {
        switch (this.defaultPage) {
            case 1:
                this.goPage1();
                break;
            case 2:
                this.goPage2();
                break;
            case 3:
                this.goPage3();
                break;
            default:
                this.goPage1();
                break;
        }
    }

    // 设置默认页签（外部调用）
    setDefaultPage(pageIndex: number) {
        if (pageIndex >= 1 && pageIndex <= 3) {
            this.defaultPage = pageIndex;
        }
    }
    start() {
        this.resetSize(this.node.getParent())
        console.log("画布名字：" + this.node.getParent().name)
        // 使用默认页签，不再固定显示第一页
        //this.goPage1()
        //this.init()//买飞机
        //  this.init2()//买子弹
    }

    /**
         * 手机屏幕适配
         * @param cav 
         */
    resetSize(cav) {
        let frameSize = cc.view.getFrameSize();
        let designSize = cc.view.getDesignResolutionSize();
        console.log(" frameSize :" + frameSize.height + "/" + frameSize.width)
        console.log(" designSize :" + designSize.height + "/" + designSize.width)

        if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
            cav.width = designSize.height * frameSize.width / frameSize.height;
            cav.height = designSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        } else {
            cav.width = designSize.width;
            cav.height = designSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        this.fitScreen(cav, designSize);
    }
    /**
     * 背景适配
     * @param canvasnode 
     * @param designSize 
     */
    fitScreen(canvasnode, designSize) {
        let scaleW = canvasnode.width / designSize.width;
        let scaleH = canvasnode.height / designSize.height;

        let bgNode = this.bg
        let bgScale = canvasnode.height / bgNode.height;
        bgNode.width *= bgScale;
        bgNode.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = canvasnode.width / bgNode.width;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
        }
    }


    //购买宠物逻辑
    private init3() {
        if (this.petScrollView) {

            this.petScrollView.content.removeAllChildren()//先清空
            var content_height = 0

            console.log("滚动条：", this.petScrollView)

            var EqArr = EquippedData.Instance.equippedData["petName"]
            console.log("读取arr：", EquippedData.Instance.equippedData["petName"])

            var ileght = EqArr.length;
            for (let i = 0; i < ileght; i++) {
                let useritem = ResMgr.Instance.getAsset("Gui", "other/petItem")
                let playeritem = ResMgr.Instance.getAsset("Gui", "pet/" + EqArr[i].url)
                console.log("pet:" + EqArr[i].url)

                let _userItem: cc.Node = cc.instantiate(useritem);
                let _playeritem: cc.Node = cc.instantiate(playeritem)






                console.log(EqArr[i].url)
                _userItem.getChildByName("price").getComponent(cc.Label).string = "价格：" + EqArr[i].price
                _userItem.getChildByName("name").getComponent(cc.Label).string = "" + EqArr[i].name
                _userItem.getChildByName("title").getComponent(cc.Label).string = "" + EqArr[i].title

                if (EqArr[i].isChoice) {
                    _userItem.getChildByName("bg").color = new cc.Color(255, 0, 0);
                    //背景色

                } else {
                    _userItem.getChildByName("bg").color = new cc.Color(159, 159, 159);
                }

                this.petScrollView.content.addChild(_userItem);

                _userItem.getChildByName("planePic").getChildByName("mask1").addChild(_playeritem)

                //去掉跟踪飞机的组件

                _playeritem.removeComponent("pet_agent")
                _playeritem.removeComponent("pet_AI");


                var Child = _playeritem.children

                var Child_length = Child.length
                for (let i = 0; i < Child_length; i++) {
                    if (Child[i].name == "pao1") {
                        Child[i].removeComponent("pet_arms_Ctrl")
                        Child[i].getChildByName("w1").destroy()

                    }
                    if (Child[i].name == "emitter") {
                        Child[i].destroy()
                    }
                }





                var btn = _userItem.getChildByName("btn")
                var buyBtn = _userItem.getChildByName("buyBtn")

                if (EqArr[i].isBuy) {//如果买了
                    btn.active = true
                    buyBtn.active = false
                    var clickEventHandler = new cc.Component.EventHandler();
                    clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
                    clickEventHandler.component = "Equipped_UI_Ctrl";//这个是代码文件名
                    clickEventHandler.handler = "choicePet";
                    clickEventHandler.customEventData = i.toString();


                    btn.getComponent(cc.Button).clickEvents.push(clickEventHandler);
                } else {
                    btn.active = false
                    buyBtn.active = true
                    var clickEventHandler_buy = new cc.Component.EventHandler();
                    clickEventHandler_buy.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
                    clickEventHandler_buy.component = "Equipped_UI_Ctrl";//这个是代码文件名
                    clickEventHandler_buy.handler = "buyPet";
                    clickEventHandler_buy.customEventData = JSON.stringify(EqArr[i])//序列化表

                    buyBtn.getComponent(cc.Button).clickEvents.push(clickEventHandler_buy);

                }


                content_height += _userItem.height




            }
            this.petScrollView.content.height = content_height
            console.log("滚动条的高度：" + content_height, this.petScrollView.content)


        } else {
            console.log("宠物获取滚动条失败！" + content_height)

        }



    }
     //点击了获取金币按钮
    private Shared() {
        console.log("我要获取奖励类型：", this.shared_type)


        if (window.tt) {
            TtMgr.Instance.showVideoAd(this.shared_type, this.getJiangLI, this)

        } else if (window.wx) {
            WxMgr.Instance.showVideoAd(this.shared_type, this.getJiangLI, this)

        }else if(cc.sys.os == cc.sys.OS_ANDROID){
            console.log("我是安卓系统");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "creatorShowAD", "(Ljava/lang/String;)V" ,'addjiangli');
            //jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "creatorShowAD", "()V")

        }



        else {
            return
        }

    }

    //看完视频的回调
    private  getJiangLI(type, data) {





        console.log("收到的data：" + data, "收到的type", type)

        if (type == "game_medal") {
            UserData.Instance.userData[type] += data
            UserData.Instance.saveUserData()
            this.upGame_medal(UserData.Instance.userData[type])

        } else if (type == "game_gold") {
            mGameData.addGold(data);
            this.upGame_gold(mGameData.currentGold)
        }

        this.hidDialog()

    }


     //看完视频的回调
     private  getJiangLI2() {




       // console.log("收到的data：" + data, "收到的type", type)

        if (this.shared_type == "game_medal") {
            UserData.Instance.userData[this.shared_type] += 80
            UserData.Instance.saveUserData()
            this.upGame_medal(UserData.Instance.userData[this.shared_type])

        } else if (this.shared_type == "game_gold") {
            mGameData.addGold(300);
            this.upGame_gold(mGameData.currentGold)
        }

        this.hidDialog()

    }


    private hidDialog() {
        cc.director.resume()
        this.Content.getComponent("PopDialogCtrl").hideDialog()


    }

    private showDialog(type: string) {

        this.shared_type = type
        this.Content.getComponent("PopDialogCtrl").showDialog()
        this.view["Content/info/jingliBtn/Background/Label/jb"].active = false
        this.view["Content/info/jingliBtn/Background/Label/xz"].active = false

        switch (this.shared_type) {
            case "game_medal"://如果是缺勋章

                if (window.wx || window.tt) {
                    this.view["Content/info/jingliBtn/Background/Label/xz"].active = true
                    this.view["Content/info/title"].getComponent(cc.Label).string = "勋章不足，观看视频可立刻获得80勋章"
                    this.view["Content/info/jingliBtn/Background/Label"].getComponent(cc.Label).string = "+80勋章"


                } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                    this.view["Content/info/jingliBtn/Background/Label/xz"].active = true
                    this.view["Content/info/title"].getComponent(cc.Label).string = "勋章不足，观看视频可立刻获得80勋章"
                    this.view["Content/info/jingliBtn/Background/Label"].getComponent(cc.Label).string = "+80勋章"
                } else {
                    this.view["Content/info/title"].getComponent(cc.Label).string = "勋章不足"
                    this.view["Content/info/jingliBtn/Background/Label"].getComponent(cc.Label).string = "关闭"
                }




                break

            case "game_gold"://如果是缺金币

                if (window.wx || window.tt) {
                    this.view["Content/info/jingliBtn/Background/Label/jb"].active = true

                    this.view["Content/info/title"].getComponent(cc.Label).string = "金币不足，观看视频可立刻获得300金币"
                    this.view["Content/info/jingliBtn/Background/Label"].getComponent(cc.Label).string = "+300金币"
                } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                     this.view["Content/info/jingliBtn/Background/Label/jb"].active = true
                     this.view["Content/info/jingliBtn/Background/Label"].getComponent(cc.Label).string = "+300金币"

                    this.view["Content/info/title"].getComponent(cc.Label).string = "金币不足，观看视频可立刻获得300金币"
                } else {
                    this.view["Content/info/title"].getComponent(cc.Label).string = "金币不足"
                    this.view["Content/info/jingliBtn/Background/Label"].getComponent(cc.Label).string = "关闭"
                }






                break

            default:

                break
        }


    }
    //购买宠物
    private buyPet(event, customEventData) {
        var b = JSON.parse(customEventData)

        //var b=  eval( '(' + customEventData + ')' )
        console.log(b)

        if (UserData.Instance.userData["game_medal"] < b.price) {
            console.log("勋章不够" + UserData.Instance.userData["game_medal"])
            this.showDialog("game_medal")

        } else {


            EquippedData.Instance.equippedData["petName"][b.id].isBuy = true
            EquippedData.Instance.saveUserData()
            //  console.log("购买后状态："+ EquippedData.Instance.equippedData["petName"][b.id].isBuy)




            UserData.Instance.userData["game_medal"] -= b.price
            UserData.Instance.saveUserData()
            // console.log("金币还剩："+ UserData.Instance.userData["game_medal"])
            this.upGame_medal(UserData.Instance.userData["game_medal"])
            this.choicePet(null, b.id)
            this.init3()
        }

    }
    //选择了宠物
    private choicePet(event, customEventData) {

        var EqArr = EquippedData.Instance.equippedData["petName"]
        UserData.Instance.userData["pet"] = EqArr[customEventData].url


        UserData.Instance.saveUserData()
        for (let i = 0; i < EqArr.length; i++) {
            if (i == customEventData) {
                EqArr[i].isChoice = true

            } else {
                EqArr[i].isChoice = false

            }
            EquippedData.Instance.saveUserData()
        }
        this.init3()





    }
    private init() {
        //购买飞机逻辑

        if (this.planeScrollView) {
            this.planeScrollView.content.removeAllChildren()//先清空
            var content_height = 0


            console.log("滚动条：", this.planeScrollView)

            var EqArr = EquippedData.Instance.equippedData["planeName"]
            console.log("读取arr：", EquippedData.Instance.equippedData["planeName"])

            var ileght = EqArr.length;
            for (let i = 0; i < ileght; i++) {
                let useritem = ResMgr.Instance.getAsset("Gui", "other/playerItem")
                let playeritem = ResMgr.Instance.getAsset("Gui", "player/" + EqArr[i].url)
                console.log("player:" + EqArr[i].url)

                let _userItem: cc.Node = cc.instantiate(useritem);
                let _playeritem: cc.Node = cc.instantiate(playeritem)

                console.log(EqArr[i].url)
                _userItem.getChildByName("price").getComponent(cc.Label).string = "价格：" + EqArr[i].price
                _userItem.getChildByName("emitter").getComponent(cc.Label).string = "装备武器：" + EqArr[i].emitterStr
                _userItem.getChildByName("shield").getComponent(cc.Label).string = "防御力：" + (EqArr[i].hp + UserData.Instance.userData["shield"])
                _userItem.getChildByName("power").getComponent(cc.Label).string = "攻击力：" + (EqArr[i].attack + UserData.Instance.userData["power"])

                _userItem.getChildByName("name").getComponent(cc.Label).string = "" + EqArr[i].name
                _userItem.getChildByName("title").getComponent(cc.Label).string = "" + EqArr[i].title

                if (EqArr[i].isChoice) {
                    _userItem.getChildByName("bg").color = new cc.Color(255, 0, 0);
                    //背景色

                } else {
                    _userItem.getChildByName("bg").color = new cc.Color(159, 159, 159);
                }

                this.planeScrollView.content.addChild(_userItem);

                _userItem.getChildByName("planePic").getChildByName("mask1").addChild(_playeritem)

                var btn = _userItem.getChildByName("btn")
                var buyBtn = _userItem.getChildByName("buyBtn")

                if (EqArr[i].isBuy) {//如果买了
                    btn.active = true
                    buyBtn.active = false
                    var clickEventHandler = new cc.Component.EventHandler();
                    clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
                    clickEventHandler.component = "Equipped_UI_Ctrl";//这个是代码文件名
                    clickEventHandler.handler = "choicePlane";
                    clickEventHandler.customEventData = i.toString();


                    btn.getComponent(cc.Button).clickEvents.push(clickEventHandler);
                } else {
                    btn.active = false
                    buyBtn.active = true
                    var clickEventHandler_buy = new cc.Component.EventHandler();
                    clickEventHandler_buy.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
                    clickEventHandler_buy.component = "Equipped_UI_Ctrl";//这个是代码文件名
                    clickEventHandler_buy.handler = "byPlane";
                    clickEventHandler_buy.customEventData = JSON.stringify(EqArr[i])//序列化表

                    buyBtn.getComponent(cc.Button).clickEvents.push(clickEventHandler_buy);

                }


                content_height += _userItem.height


            }
            this.planeScrollView.content.height = content_height
        } else {
            console.log("飞机获取滚动条失败！")

        }









    }



    //选择战机
    private choicePlane(event, customEventData) {



        var EqArr = EquippedData.Instance.equippedData["planeName"]
        UserData.Instance.userData["plane"].player_name = EqArr[customEventData].url
        UserData.Instance.userData["plane"].hp = EqArr[customEventData].hp
        UserData.Instance.userData["plane"].emitter = EqArr[customEventData].emitter
        UserData.Instance.saveUserData()
        for (let i = 0; i < EqArr.length; i++) {
            if (i == customEventData) {
                EqArr[i].isChoice = true

            } else {
                EqArr[i].isChoice = false

            }
            EquippedData.Instance.saveUserData()
        }
        this.init()

    }


    //购买战机
    private byPlane(event, customEventData) {



        var b = JSON.parse(customEventData)



        if (mGameData.currentGold < b.price) {
            console.log("金币不够" + mGameData.currentGold)
            this.showDialog("game_gold")

        } else {


            EquippedData.Instance.equippedData["planeName"][b.id].isBuy = true
            EquippedData.Instance.saveUserData()
            console.log("购买后状态：" + EquippedData.Instance.equippedData["planeName"][b.id].isBuy)
            mGameData.currentGold -= b.price
            // UserData.Instance.saveUserData()
            // 保存钻石数据到本地
            mGameData.SaveGoldData();
            //自动选择
            this.choicePlane(null, b.id);
            this.upGame_gold(mGameData.currentGold)
            this.init()

        }



    }

    init2() {
        //装备购买逻辑
        if (this.equippedScrollView) {
            var content_height = 0
            this.equippedScrollView.content.removeAllChildren()//先清空


            var EqArr = EquippedData.Instance.equippedData["equippedName"]
            console.log("获得装备数组：", EqArr);
            var ileght = EqArr.length;
            for (let i = 0; i < ileght; i++) {
                let equippeditem = ResMgr.Instance.getAsset("Gui", "other/equippedItem")
                let pic_item = ResMgr.Instance.getAsset("Gui", "other/" + EqArr[i].url)//技能图标
                let _equippeditem: cc.Node = cc.instantiate(equippeditem);
                let _pic_item: cc.Node = cc.instantiate(pic_item)


                _equippeditem.getChildByName("price").getComponent(cc.Label).string = "价格：" + EqArr[i].price
                _equippeditem.getChildByName("name").getComponent(cc.Label).string = "" + EqArr[i].name
                _equippeditem.getChildByName("title").getComponent(cc.Label).string = "" + EqArr[i].title
                //  if(EqArr[i].name=="")
                if (EqArr[i].url == "shield" || EqArr[i].url == "power") {
                    _equippeditem.getChildByName("myNum").getComponent(cc.Label).string = "等级：" + UserData.Instance.userData[EqArr[i].url]

                } else {
                    _equippeditem.getChildByName("myNum").getComponent(cc.Label).string = "X" + UserData.Instance.userData[EqArr[i].url]

                }


                this.equippedScrollView.content.addChild(_equippeditem);
                _equippeditem.getChildByName("planePic").addChild(_pic_item)

                var buyEquipped_btn = _equippeditem.getChildByName("buyBtn")

                var clickEventHandler_buyEquipped = new cc.Component.EventHandler();
                clickEventHandler_buyEquipped.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
                clickEventHandler_buyEquipped.component = "Equipped_UI_Ctrl";//这个是代码文件名
                clickEventHandler_buyEquipped.handler = "buyEquipped";//方法名
                clickEventHandler_buyEquipped.customEventData = JSON.stringify(EqArr[i])//序列化表

                buyEquipped_btn.getComponent(cc.Button).clickEvents.push(clickEventHandler_buyEquipped);
                content_height += _equippeditem.height
                console.log("item高度：" + _equippeditem.height)

            }

            this.equippedScrollView.content.height = content_height



        } else {
            console.log("装备获取滚动条失败！")
        }
    }










    //购买武器
    private buyEquipped(event, customEventData) {
        var b = JSON.parse(customEventData)
        if (mGameData.currentGold < b.price) {
            //没钱
            this.showDialog("game_gold")
        } else {


            if (b.id == 1) {
                UserData.Instance.userData[b.url]++//普通导弹


            } else if (b.id == 2) {
                UserData.Instance.userData[b.url]++//寒冰导弹

            } else if (b.id == 3) {
                UserData.Instance.userData[b.url] += 3//防御力

            } else if (b.id == 4) {
                UserData.Instance.userData[b.url]++//攻击力

            } else if (b.id == 5) {
                UserData.Instance.userData[b.url]++//核弹
            }





            mGameData.currentGold -= b.price

            // UserData.Instance.saveUserData()
            // 保存钻石数据到本地
            mGameData.SaveGoldData();
            console.log(UserData.Instance.userData)
            this.upGame_gold(mGameData.currentGold)

            this.init2()
        }
    }





    onDestroy(){
        if (EventMgr.Instance) {
            EventMgr.Instance.remove_event_listenner("addJiangli",this,this.getJiangLI2)
        }
    }


    private backHomeOnClick() {
        // UIMgr.Instance.clearAll()
        GameApp.Instance.enterLoginScene()
    }
    private startGameOnClick() {
        //  UIMgr.Instance.clearAll()

        GameApp.Instance.enterGameScene()

    }




    //安卓加金币方法
    public static addJiangli(msg:string){
        EventMgr.Instance.dispatch_event("addJiangli",0)
    //  let self= this.Instance
    //  //   let self= cc["Equipped_UI_Ctrl"]
    //  cc.director.resume()
    //       if(self.shared_type=="game_medal"){
    //         UserData.Instance.userData[self.shared_type] += 80
    //         UserData.Instance.saveUserData()
    //         self.game_medal.string=UserData.Instance.userData[self.shared_type]


    //       }else if(self.shared_type=="game_gold"){
    //         UserData.Instance.userData[self.shared_type] += 300
    //         UserData.Instance.saveUserData()
    //         self.game_gold.string = UserData.Instance.userData[self.shared_type]
    //       }

         
    //       self.Content.getComponent("PopDialogCtrl").hideDialog()
          
        
    
    //     console.log("我是安卓加金币的方法："+msg);
      
        
     }



    // update(dt) {

    // }
}
