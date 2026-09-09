
const { ccclass, property } = cc._decorator;

@ccclass
export default class EquippedData extends cc.Component {
    public static Instance: EquippedData = null;

    private userDataStr: string = "mEquippedDataPlane_A"
    public equippedData = {}
    private equippedData_first = {}


    onLoad() {
        if (!EquippedData.Instance || !cc.isValid(EquippedData.Instance)) {
            EquippedData.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
      //  console.log("获取装备数据");

        this.equippedData_first = {
            "planeName": [
                {
                    id: 0,
                    name: "狐狸1号",
                    url: "player1",
                    title: "小试牛刀的战机",
                    hp: 5,
                    attack: 1,//攻击力
                    price: 0,//价格，
                    emitter: "player1_emitter",
                    emitterStr: "重机枪",
                    isBuy: true,
                    isChoice: true

                },


                {
                    id: 1,
                    name: "蓝胖子",
                    url: "player2",
                    title: "我是大块头",
                    hp: 10,
                    attack: 2,//攻击力
                    price: 1200,//价格，
                    emitter: "player2_emitter",
                    emitterStr: "双加特林",
                    isBuy: false,
                    isChoice: false

                },
                {
                    id: 2,
                    name: "天王巨星",
                    url: "player3",
                    title: "我绚丽无比",
                    hp: 12,
                    attack: 5,//攻击力
                    price: 2900,//价格，
                    emitter: "player3_emitter",
                    emitterStr: "火焰弹",
                    isBuy: false,
                    isChoice: false

                },
                {
                    id: 3,
                    name: "收割者1号",
                    url: "player4",
                    title: "收割收割还是收割",
                    hp: 18,
                    attack: 8,//攻击力
                    price: 4500,//价格，
                    emitter: "player4_emitter",
                    emitterStr: "三排加强火炮",
                    isBuy: false,
                    isChoice: false

                },
                {
                    id: 4,
                    name: "吞噬者",
                    url: "player5",
                    title: "毁灭你，与你何干",
                    hp: 20,
                    attack: 10,//攻击力
                    price: 6200,//价格，
                    emitter: "player5_emitter",
                    emitterStr: "粒子炮",
                    isBuy: false,
                    isChoice: false

                },

          

            ]







            ,
            "equippedName": [


                {
                    id: 1,
                    name: "普通导弹",
                    url: "skill_1",
                    title: "一颗一颗发射",

                    price: 180,//价格，


                },

                {
                    id: 2,
                    name: "寒冰导弹",
                    url: "skill_2",
                    title: "集群发射，并且跟踪目标",

                    price: 380,//价格，


                },

                {
                    id: 3,
                    name: "防护钢板",
                    url: "shield",
                    title: "防护力+3",

                    price: 800,//价格，


                },

                {
                    id: 4,
                    name: "穿甲弹技术",
                    url: "power",
                    title: "攻击力+1",

                    price: 1200,//价格，


                },

                {
                    id: 5,
                    name: "核弹",
                    url: "hedan",
                    title: "对所有敌人造成毁灭性伤害",

                    price: 260,//价格，


                },

              


             



            ],




            "petName": [


                {
                    id: 0,
                    name: "完美号",
                    url: "pet_1",
                    title: "拥有两架僚机，辅助你消灭敌人",
                    isBuy: false,
                    isChoice: false,
                    price: 500,//价格，


                },

                {
                    id: 1,
                    name: "护卫者号",
                    url: "pet_2",
                    title: "向前方和两翼发射弹丸",
                    isBuy: false,
                    isChoice: false,
                    price: 680,//价格，


                },

                {
                    id: 2,
                    name: "H/PJ防御机炮",
                    url: "pet_3",
                    title: "装备智能加特林火炮，自动锁定目标",
                    isBuy: false,
                    isChoice: false,
                    price: 950,//价格，


                },

                {
                    id: 3,
                    name: "黑天使",
                    url: "pet_4",
                    title: "对敌人发射跟踪暗影导弹，并发射治疗波每秒恢复玩家10%生命",
                    isBuy: false,
                    isChoice: false,
                    price: 1280,//价格，


                },

     
              
             




            ]


        }
        this.getUserData()

    }

     public getUserData(){
        if (cc.sys.localStorage.getItem(this.userDataStr)) {
            this.equippedData = JSON.parse(cc.sys.localStorage.getItem(this.userDataStr))
        }else{
            this.equippedData=this.equippedData_first
            this.saveUserData()
        }
     }
         //存储用户数据到本地
    public saveUserData() {
        cc.sys.localStorage.setItem(this.userDataStr, JSON.stringify(this.equippedData));
    }




    
    // //得到用户信息
    // public getUserData2() {

    //     if (cc.sys.localStorage.getItem(this.userDataStr)) {

    //         this.equippedData = JSON.parse(cc.sys.localStorage.getItem(this.userDataStr))
         
    //         console.log("创建成功我是装备表：", this.equippedData)

    //         var ishave: boolean = false
    //         var key_first
         
    //         for (key_first in this.equippedData_first) {//遍历原始表


             
               
    //             var key
    //             for (key in this.equippedData) {//遍历拿到的
                   
    //                 if (key == key_first) {
    //                     ishave = true  //如果走一圈没找到就是默认的false
    //                     var i_biao_first = 0
    //                     var length = this.equippedData_first[key_first].length;
                  
    //                     for (i_biao_first = 0; i_biao_first < length; i_biao_first++) {//第二层是数组

    //                         if (this.equippedData[key][i_biao_first] == null) {

    //                             this.equippedData[key].push(this.equippedData_first[key_first][i_biao_first])
    //                             console.log("添加后的数组>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + "this.equippedData[key]", this.equippedData[key][i_biao_first])
    //                             // this.saveUserData()
    //                         }
    //                         else {
    //                            // console.log("这个装备表没问题");



    //                             //  第三层是表
    //                             // this.equippedData_first[key_first][i_biao_first]//遍历此表






    //                         }




    //                     }


    //                 }
    //             }
    //             if (ishave) {
    //                   //length等于原始表的长度
    //                 if (length < this.equippedData[key].length) {
    //                    //  console.log("多了一个",key,this.equippedData[key].length,length);
                       
                         
    //                       //多的查少的 拿到的表对比原始表
    //                      var lenght_e=this.equippedData[key].length
                         
    //                      for(let i=0;i<lenght_e;i++){

    //                         var isHave:boolean=false

    //                          for(let i2=0;i2<length;i2++){
    //                              let id_first:number=this.equippedData_first[key_first][i2]["id"]
    //                              let id_e:number=this.equippedData[key][i]["id"]
    //                              if(id_first==id_e){
    //                                  isHave=true
                                     
    //                              }
    //                          }
                    
                     
    //                            if(!isHave){
    //                                console.log("多出的");
    //                                console.log("id",this.equippedData[key][i]["id"]);
    //                                let id:number=this.equippedData[key][i]["id"]
    //                                let arr= this.equippedData[key]
    //                                arr.splice(arr.findIndex(e => e.id === id), 1)
                                   
    //                            }

                           
    //                      }
                         
    //                 }
                 

    //             } else {
               
    //                 this.equippedData[key_first] = this.equippedData_first[key_first]
    //             }





    //         }

    //         this.saveUserData()
    //         this.equippedData = JSON.parse(cc.sys.localStorage.getItem(this.userDataStr))
    //     } else {
    //         console.log("我直接走了else：", this.equippedData)

    //         this.equippedData = this.equippedData_first
    //         this.saveUserData()


    //     }
    // }







































    onDestroy() {
        if (EquippedData.Instance === this) {
            EquippedData.Instance = null;
        }
    }
}





















