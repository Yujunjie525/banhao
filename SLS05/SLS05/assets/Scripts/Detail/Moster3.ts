
const {ccclass, property} = cc._decorator;
import CloneChi from '../Tools/CloneChi';
@ccclass
export default class Moster3 extends cc.Component {
    Ismove:boolean = false;
    anim:cc.Animation = null;
    isMoving:boolean = false;
    moveSpeed:number = 150;
    
    /**
     * 碰撞检测
     * @param other 
     * @param self 
     */
    onCollisionEnter(other,self){
        switch(other.node.group){
            case 'wall':
                this.Ismove = !this.Ismove;
                this.HuliMove();
                break;
            case 'player':
                this.resetState();
                // 先将狐狸从父节点移除，再放回节点池
                if (this.node && this.node.parent) {
                    this.node.removeFromParent(false);
                }
                CloneChi.GetIns().BacktoPool(this.node);
                break;
        }
    }
    
    /**
     * 重置狐狸状态，确保回收时状态正确
     */
    resetState() {
        this.Ismove = false;
        this.isMoving = false;
        
        if (this.node && this.node.isValid) {
            this.node.stopAllActions();
            this.node.setPosition(cc.v2(212, 47));
        }
        
        // 停止所有调度器
        this.unscheduleAllCallbacks();
        
        // 重置动画组件引用
        this.anim = null;
    }
    /**
     * 狐狸移动
     */
    HuliMove(){
        if(this.Ismove){
            this.anim.play('huliz');
            var a1 = cc.moveTo(2,cc.v2(250,47));
            this.node.runAction(a1);
        }else{
            this.anim.play('huliy');
            var a1 = cc.moveTo(2,cc.v2(-250,47));
            this.node.runAction(a1);
        }
    }
    /**
     * 初始化狐狸
     */
    onLoad() {
        // 确保脚本被正确加载，update函数能被调用
        console.log('Moster3 onLoad called, node:', this.node.name);
    }
    
    start() {
        console.log('Moster3 start called, isMoving:', this.isMoving);
    }
    
    inithuli() {
        // 强制重置所有状态
        this.Ismove = false;
        this.isMoving = true;
        
        // 确保节点和动画组件存在
        if (!this.node || !this.node.isValid) {
            console.log('Moster3 inithuli: node invalid');
            return;
        }
        
        console.log('Moster3 inithuli called, setting position to (212, 47), isMoving:', this.isMoving);
        
        // 停止所有现有动作和调度器
        this.node.stopAllActions();
        this.unscheduleAllCallbacks();
        
        // 重置位置到右侧起点
        this.node.setPosition(cc.v2(212, 47));
        
        // 确保动画组件存在并播放正确的动画
        this.anim = this.getComponent(cc.Animation);
        if (this.anim) {
            this.anim.stop();
            this.anim.play("huliy");
        }
        
        // 直接调用移动函数，确保移动能开始
        this.forceMove();
    }
    
    /**
     * 强制开始移动
     */
    forceMove() {
        if (!this.node || !this.node.isValid) {
            return;
        }
        
        console.log('Moster3 forceMove called, current position:', this.node.position);
        
        // 立即移动一小段距离，确保移动能被看到
        this.node.x -= 1;
        
        // 使用延迟调用确保移动能持续
        this.scheduleOnce(function() {
            this.isMoving = true;
        }, 0.1);
    }
    
    update(dt: number) {
        // 移除所有条件检查，直接执行移动
        if (this.node && this.node.isValid) {
            // 每帧向左移动，不管状态
            this.node.x -= dt * this.moveSpeed;
            
            // 边界检查
            if (this.node.x <= -250) {
                this.node.x = -250;
            }
        }
    }
}
