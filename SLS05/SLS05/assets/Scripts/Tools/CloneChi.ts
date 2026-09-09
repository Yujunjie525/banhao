
const {ccclass, property} = cc._decorator;
var ins;
@ccclass
export default class CloneChi extends cc.Component {
    @property([cc.Node])
    ss:cc.Node[] = [];
    
    totalPool:cc.NodePool = null;
    static GetIns(){
        return ins;
    }
    
    onLoad () {
        ins = this;
        this.totalPool = new cc.NodePool();
        cc.game.addPersistRootNode(this.node);
    }

    start () {
        // cc.game.addPersistRootNode(this.node);
    }
    /**
     * 创造节点的接口
     * @param pre 
     */
    CreateNode(pre:cc.Prefab){
        var clones = this.CheckthePool(pre);
        var nums = this.ss.length;
        for(let i = 0;i < nums;i++){
            this.BacktoPool(this.ss[i]);
        }
        this.ss = [];
        return clones;
    }
    /**
     * 检查池子里有无想要的东西并返回
     * @param pre 
     */
    // update (dt) {}
    CheckthePool(pre:cc.Prefab){
        var poolLen = this.totalPool.size();
        if(poolLen == 0){
            var a = cc.instantiate(pre);
            return a;
        }else{
            for(let i = 0;i < poolLen;i++){
                var b = null;
                b = this.totalPool.get();
                if(b.name == pre.name){
                    return b;
                }else{
                    this.ss.push(b);
                    if(i == poolLen - 1){
                        var c = cc.instantiate(pre);
                        return c;
                    }
                }
            }
        }
    }

    /**
     * 暂时不用的节点放回缓存池
     * @param pre 
     */
    BacktoPool(pre){
        this.totalPool.put(pre);
    }
}
