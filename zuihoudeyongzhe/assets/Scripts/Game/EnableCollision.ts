const {ccclass, property} = cc._decorator;

@ccclass
export default class EnableCollision extends cc.Component {

    @property({tooltip:"是否开启碰撞检测系统"})
    isEnable: boolean = true;

    @property({tooltip:"是否开启碰撞检测系统"})
    isDebug: boolean = true;

    private manager : cc.CollisionManager ;

    onLoad () {
        if(this.isEnable){
            this.manager = cc.director.getCollisionManager();

	// step1 开启物理引擎
    cc.director.getPhysicsManager().enabled = true;



            this.manager.enabled = this.isEnable;
            if(this.isDebug){
                this.manager.enabledDebugDraw = true;
            }
        }
    }
}
