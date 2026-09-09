
const {ccclass, property} = cc._decorator;
import GameManager from '../Manager/GameManager';
import CloneChi from '../Tools/CloneChi';
@ccclass
export default class YunMove extends cc.Component {

    
    onLoad () {
        this.CloneHuli();
    }
    
    onEnable() {
        // 当节点被启用时（包括从对象池取出时），重新创建狐狸
        this.CloneHuli();
    }
    /**
     * 克隆狐狸
     */
    CloneHuli(){
        // 先清理所有现有的狐狸子节点
        if (this.node && this.node.isValid) {
            for (let i = this.node.childrenCount - 1; i >= 0; i--) {
                const child = this.node.children[i];
                if (child && child.isValid) {
                    // 如果是狐狸节点，移除并放回节点池
                    const moster3 = child.getComponent('Moster3');
                    if (moster3) {
                        moster3.resetState();
                        child.removeFromParent(false);
                        CloneChi.GetIns().BacktoPool(child);
                    }
                }
            }
        }
        
        // 创建新的狐狸节点
        var huli_1 = GameManager.GetIns().huli;
        var huli = CloneChi.GetIns().CreateNode(huli_1);
        
        if (huli && this.node && this.node.isValid) {
            huli.parent = this.node;
            
            const moster3 = huli.getComponent('Moster3');
            if (moster3) {
                moster3.inithuli();
            }
        }
    }


    update (dt) {
        var speed = GameManager.GetIns().getSpeed() - 4;
        this.node.y -= speed;
        if(this.node.y < -890){
            // 重置所有子节点状态
            if (this.node && this.node.isValid) {
                for (let i = this.node.childrenCount - 1; i >= 0; i--) {
                    const child = this.node.children[i];
                    if (child && child.isValid) {
                        // 查找狐狸组件并重置
                        const moster3 = child.getComponent('Moster3');
                        if (moster3) {
                            moster3.resetState();
                        }
                    }
                }
            }
            CloneChi.GetIns().BacktoPool(this.node);
        }
    }
}
