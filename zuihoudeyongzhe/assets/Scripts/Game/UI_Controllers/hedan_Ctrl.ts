

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private nodeDestroy(){

        this.node.destroy()
      
    
      }

    start () {
        var ts =this.node.getComponent("FrameAnim")
        if(ts){
            ts.playOnce(this.nodeDestroy,this)
        }
    }

    // update (dt) {}
}
