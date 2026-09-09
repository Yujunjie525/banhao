

const {ccclass, property} = cc._decorator;

@ccclass
export default class shipei extends cc.Component {


   onLoad () {
  this.  resetSize(this.node)
   }

    start () {

    }
          /** 调整屏幕适配 */
          private adjust_screen() {
            // 注意cc.winSize只有在适配后(修改fitHeight/fitWidth后)才能获取到正确的值,因此使用cc.getFrameSize()来获取初始的屏幕大小
            let screen_size = cc.view.getFrameSize().width / cc.view.getFrameSize().height
            let design_size = cc.Canvas.instance.designResolution.width / cc.Canvas.instance.designResolution.height
            let f = screen_size >= design_size
            cc.Canvas.instance.fitHeight = f
            cc.Canvas.instance.fitWidth = !f
        }


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
           // this.fitScreen(cav, designSize);
        }
       /**
     * 背景适配
     * @param canvasnode 
     * @param designSize 
     */
    fitScreen(canvasnode, designSize) {
        let scaleW = canvasnode.width / designSize.width;
        let scaleH = canvasnode.height / designSize.height;

        let bgNode = canvasnode.getChildByName('background');
        let bgScale = canvasnode.height / bgNode.height;
        bgNode.width *= bgScale;
        bgNode.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = canvasnode.width / bgNode.width;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
        }
    }
    // update (dt) {}
}
