

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserData extends cc.Component {
    public static Instance: UserData = null;


    private userDataStr: string = "mUserDataStrPlane_A"
    public userData = {}

    private userData_first = {}//原始表

    onLoad() {
        console.log("获取用户数据")
        if (!UserData.Instance || !cc.isValid(UserData.Instance)) {


            UserData.Instance = this;
        }
        else {
            console.log("销毁一个单例")
            this.destroy();
            return;
        }


        this.userData_first = {


            "game_score_lishi": 0,//历史最高得分
            "game_gold":200,//游戏金币200
            "game_medal": 40,//游戏奖章 用于购买宠物40
            "score": 0,//玩家当前分数
            "Level": 1,//玩家打到了多少关
            "nowLevel": 1,//当前关卡

            "skill_1": 3,//技能1数量 ..普通导弹
            "skill_2": 4,//技能2数量 ..寒冰导弹
            "hedan": 3,//核弹

            "shield": 1,//防护力
            "power": 1,//攻击力
            "pet": null,

            //选飞机时候用plane表
            "plane": {

                player_name: "player1",

                emitter: "player1_emitter",

                hp: 5





            }






        }

        this.getUserData()


    }

//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999

    public getUserData(){
        if (cc.sys.localStorage.getItem(this.userDataStr)) {
            this.userData = JSON.parse(cc.sys.localStorage.getItem(this.userDataStr))
            console.log("用户表：",this.userData);
            
        }else{
            this.userData = this.userData_first
            this.saveUserData()
        }
    }
        //存储用户数据到本地
        public saveUserData() {
            cc.sys.localStorage.setItem(this.userDataStr, JSON.stringify(this.userData));
        }
    //得到用户信息
    // public getUserData() {

    //     if (cc.sys.localStorage.getItem(this.userDataStr)) {
    //         this.userData = JSON.parse(cc.sys.localStorage.getItem(this.userDataStr))
    //      //   console.log("看表里有啥：", this.userData)
    //         for (var key_first in this.userData_first) {//遍历原始表
    //             var ishave: boolean = false
    //             var key
    //             for (key in this.userData) {//遍历得到的表
    //                 if (key == key_first) {
    //                     ishave = true
    //                     break//可以跳出循环
    //                     //  console.log("检查表："+"userData_first-----"+key_first+":"+this.userData_first[key_first],"userData-----"+key+":"+this.userData[key])
    //                     //  continue
    //                 }
    //             }
    //             if (ishave) {
    //                 // console.log("这个数据没问题");
                     
    //             } else {
    //                 //如果发现有没有的就就加进去
    //               //  console.log("发现没有：" + key_first)
    //                 this.userData[key_first] = this.userData_first[key_first]
    //                 this.saveUserData()
    //                 this.userData = JSON.parse(cc.sys.localStorage.getItem(this.userDataStr))
    //             }
    //             //  console.log("key:"+key)
    //         }


    //     } else {
    //         this.userData = this.userData_first
    //         this.saveUserData()

    //     }


    // }





    onDestroy() {
        if (UserData.Instance === this) {
            UserData.Instance = null;
        }
    }

    // update (dt) {}
}
