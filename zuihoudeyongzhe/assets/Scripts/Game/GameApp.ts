
const { ccclass, property } = cc._decorator;

import ResMgr from "../Managers/ResMgr";
import UIMgr from "../Managers/UIMgr";
import EventMgr from "../Managers/EventMgr";
import GameResPkg from "./GameResPkg";
import LoginResPkg from "./LoginResPkg";
import ResLoading from "./ResLoadingPkg"
import LevelsPkg from "./LevelsPkg"
import EquippedPkg from "./EquippedPkg"
import LevelData from "./LevelData"
import UserData from "./UserData"
import mGameData from "../Load/GameData"


@ccclass
export default class GameApp extends cc.Component {
    public static Instance: GameApp = null;

    private resLoading: cc.Node = null;


    onLoad() {
        if (!GameApp.Instance || !cc.isValid(GameApp.Instance)) {
            GameApp.Instance = this;
        }
        else {
            this.destroy();
            return;
        }


    }
    //进度条回调
    private onResLoadProgress(now, total): void {
        var per = now / total;
        per = (per < 0) ? 0 : per;
        per = (per > 1) ? 1 : per;

        EventMgr.Instance.dispatch_event("ResLoadProgress", per);
    }


    //入口
    public EnterGame(): void {

        console.log("EnterGame");


        ResMgr.Instance.preloadResPackage(ResLoading, this.onResLoadProgress.bind(this), function () {

            // this.resLoading = UIMgr.Instance.show_ui("ResLoading");
            
            // 直接进入游戏场景，跳过登录界面
            //this.enterLoginScene()
            this.enterGameScene();

        }.bind(this));

    }


    //带按钮的页面
    public enterLoginScene() {

        console.log("游戏带按钮的页面");


        // UIMgr.Instance.clearAll();//在游戏页面内部写了
        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }


        ResMgr.Instance.preloadResPackage(LoginResPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LevelsPkg);

                ResMgr.Instance.releaseResPackage(GameResPkg);
                UIMgr.Instance.clearAll();
                this.resLoading = null;
                UIMgr.Instance.show_ui("LoginUI");
            }, 0.5);

        }.bind(this));
    }

    // 开始游戏
    public enterGameScene(): void {


        ResMgr.Instance.releaseResPackage(GameResPkg);     //先释放自己    


        var Level_num = mGameData.currentLevel
        var enemy = LevelData[Level_num].enemy
        var boss = LevelData[Level_num].boss
        var box = LevelData[Level_num].box
        var map = LevelData[Level_num].maps



        for (let i = 0; i < boss.length; i++) {
            console.log("boss:" + boss[i] + "关卡" + Level_num)
            GameResPkg["Gui"].urls.push("boss/" + boss[i])

        }
        for (let i = 0; i < box.length; i++) {
            console.log("box:" + box[i] + "关卡" + Level_num)
            GameResPkg["Gui"].urls.push("box/" + box[i])

        }

        for (let i = 0; i < enemy.length; i++) {
            console.log("enemy:" + enemy[i] + "关卡" + Level_num)
            GameResPkg["Gui"].urls.push("enemy/" + enemy[i])
        }
        GameResPkg["Maps"].urls.push(map)



        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }

        ResMgr.Instance.preloadResPackage(GameResPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LoginResPkg);
                ResMgr.Instance.releaseResPackage(LevelsPkg);

                UIMgr.Instance.clearAll()
                this.resLoading = null;
                UIMgr.Instance.show_ui("GameUI");
            }, 0.5);

        }.bind(this));

    }

    //游戏结束页面
    public gameOver(): void {

        UIMgr.Instance.show_ui("Over_UI")
    }

    //关卡页面
    public levelsPage() {



        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }

        ResMgr.Instance.preloadResPackage(LevelsPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LoginResPkg);
                ResMgr.Instance.releaseResPackage(GameResPkg);

                UIMgr.Instance.clearAll()
                this.resLoading = null;
                UIMgr.Instance.show_ui("Levels_UI")
            }, 0.5);

        }.bind(this));

    }

    //购买装备页面
    public equippedPage() {
        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }

        ResMgr.Instance.preloadResPackage(EquippedPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LoginResPkg);
                ResMgr.Instance.releaseResPackage(GameResPkg);

                UIMgr.Instance.clearAll()
                this.resLoading = null;
                //  var parent=this.node.parent.getChildByName("gameUI")

                UIMgr.Instance.show_ui("Equipped_UI")
            }, 0.5);

        }.bind(this));
    }

    //打开飞机页签
    public planePage() {
        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }

        ResMgr.Instance.preloadResPackage(EquippedPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LoginResPkg);
                ResMgr.Instance.releaseResPackage(GameResPkg);

                UIMgr.Instance.clearAll()
                this.resLoading = null;

                let equippedUI = UIMgr.Instance.show_ui("Equipped_UI");
                if (equippedUI && equippedUI.getComponent("Equipped_UI_Ctrl")) {
                    equippedUI.getComponent("Equipped_UI_Ctrl").setDefaultPage(1);
                }
            }, 0.5);

        }.bind(this));
    }

    //打开装备页签
    public equipmentPage() {
        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }

        ResMgr.Instance.preloadResPackage(EquippedPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LoginResPkg);
                ResMgr.Instance.releaseResPackage(GameResPkg);

                UIMgr.Instance.clearAll()
                this.resLoading = null;

                let equippedUI = UIMgr.Instance.show_ui("Equipped_UI");
                if (equippedUI && equippedUI.getComponent("Equipped_UI_Ctrl")) {
                    equippedUI.getComponent("Equipped_UI_Ctrl").setDefaultPage(2);
                }
            }, 0.5);

        }.bind(this));
    }

    //打开宠物页签
    public petPage() {
        if (this.resLoading === null) {
            this.resLoading = UIMgr.Instance.show_ui("ResLoading");
        }

        ResMgr.Instance.preloadResPackage(EquippedPkg, this.onResLoadProgress.bind(this), function () {
            this.scheduleOnce(function () {
                ResMgr.Instance.releaseResPackage(LoginResPkg);
                ResMgr.Instance.releaseResPackage(GameResPkg);

                UIMgr.Instance.clearAll()
                this.resLoading = null;

                let equippedUI = UIMgr.Instance.show_ui("Equipped_UI");
                if (equippedUI && equippedUI.getComponent("Equipped_UI_Ctrl")) {
                    equippedUI.getComponent("Equipped_UI_Ctrl").setDefaultPage(3);
                }
            }, 0.5);

        }.bind(this));
    }

    //胜利页面
    public isShowingVictory: boolean = false; // 防止重复显示胜利弹窗
    
    public victory(stars: number = 1): void {
        // 如果正在显示胜利弹窗，直接返回
        if (this.isShowingVictory) {
            console.warn('胜利弹窗正在显示中，忽略重复调用');
            return;
        }
        
        this.isShowingVictory = true;
        UIMgr.Instance.show_ui("Victory_UI", { stars: stars })
    }
    onDestroy() {
        if (GameApp.Instance === this) {
            GameApp.Instance = null;
        }
    }
}
