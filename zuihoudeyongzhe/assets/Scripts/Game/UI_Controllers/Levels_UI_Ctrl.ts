const { ccclass, property } = cc._decorator;


import { UICtrl } from "./../../Managers/UIMgr";
import UserData from "../UserData"
import LevelData from "../LevelData"
import GameApp from "../GameApp";

import ResMgr from "../../Managers/ResMgr";
@ccclass // 注意修改类名
export default class LevelsUI_Ctrl extends UICtrl {
    private numLevelBest:number=null
    private bg:cc.Node=null
    onLoad() {
        super.onLoad();
  
        this.numLevelBest = UserData.Instance.userData["Level"]
        this.bg=this.view["bg"]
        this. resetSize(this.node.getParent())
        this.add_button_listen("backButton", this, this.back)


        var LevelLength=LevelData.length-1
        console.log("共计："+LevelLength)
        console.log("共计数组："+LevelData.length)
        if(UserData.Instance.userData["Level"]>LevelLength){
            UserData.Instance.userData["Level"]=LevelLength
        }
        this.addLevels()
        this.shuaXinLevels()
    }
    private back(){
         GameApp.Instance.enterLoginScene()
    }

        /**
     * 手机屏幕适配
     * @param cav 
     */
    resetSize(cav) {
            let frameSize = cc.view.getFrameSize();
            let designSize = cc.view.getDesignResolutionSize();
            if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
                cav.width = designSize.height * frameSize.width / frameSize.height;
                cav.height = designSize.height;
                cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
            } else {
                cav.width = designSize.width;
                cav.height = designSize.width * frameSize.height / frameSize.width;
                cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
            }
            this.fitScreen(cav, designSize,this.bg);
        }
        /**
         * 背景适配
         * @param canvasnode 
         * @param designSize 
         */
        fitScreen(canvasnode, designSize,bgNode) {
            let scaleW = canvasnode.width / designSize.width;
            let scaleH = canvasnode.height / designSize.height;
         //   let bgNode = canvasnode.getChildByName('background');
            let bgScale = canvasnode.height / bgNode.height;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
            if (scaleW > scaleH) {
                bgScale = canvasnode.width / bgNode.width;
                bgNode.width *= bgScale;
                bgNode.height *= bgScale;
            }
        }

        //添加所有关卡
   private  addLevels(){
              var node_content=this.view["pageView/view/content"]
            var children = node_content.children
            var i_numLevel = 0
            var f_jianGe = 40
    
            for (let k = 0; k < children.length; k++) {
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 4; j++) {//每行添加4个
                        i_numLevel++

                        var item_level = cc.instantiate(ResMgr.Instance.getAsset("Gui", "other/itemLevel"))
                        item_level.parent = children[k]
                        item_level.setPosition(cc.v2( -(f_jianGe/2*3 + 114/2*3) + (114+f_jianGe)*j,350-150*i))
                        var js_level = item_level.getComponent('itemLevel')
                        js_level.init(i_numLevel)

                        
                    }
                }
            }
        }
    
        //刷新所有的关卡
    private  shuaXinLevels(){
        var node_content=this.view["pageView/view/content"]
      //  var pageView=this.view["pageView"]
            var children_page = node_content.children
            
            for (let i = 0; i < children_page.length; i++) {
               var children_level = children_page[i].children
               for (let j = 0; j < children_level.length; j++) {
                   var js_level = children_level[j].getComponent('itemLevel')
                   var item_num = js_level.num_level
                   if (item_num <= this.numLevelBest) {//可以玩
                        js_level.canPlay(true)
                        




                   }else{//不可以玩
                        js_level.canPlay(false)
                   }
               }
                
            }
        }
}
