import ResMgr from "./ResMgr";
const { ccclass, property } = cc._decorator;


 
/**
 * 预制体对象池
 * @author chenkai 2020.6.11
 */
@ccclass
export default class PrefabPool {
    /**对象池列表 */
    private static poolList = {};
 
    /**
     * 获取对象
     * @param prefabUrl        预制体路径
     * @param poolHandlerComp  reuse绑定函数
     */
    public static get(prefabUrl:string, poolHandlerComp:Function = null){
        //创建对象池数组
        if(this.poolList[prefabUrl] == null){
            this.poolList[prefabUrl] = [];
        }
        //从对象池获取对象，没有则创建
        let pool = this.poolList[prefabUrl];
        let obj;
        if (pool.length == 0) {
             obj = cc.instantiate(ResMgr.Instance.getAsset("GUI",prefabUrl));
            (obj as any).poolKey = prefabUrl;
        }else{
            obj = pool.pop();
        }
        //执行reuse
        var handler = poolHandlerComp ? obj.getComponent(poolHandlerComp) : null;
        if (handler && handler.reuse) {
            handler.reuse.apply(handler, arguments);
        }
        //返回对象
        return obj;
    }
 
    /**
     * 回收对象
     * @param obj              实体
     * @param poolHandlerComp  unuse绑定函数
     */
    public static put(obj:cc.Node, poolHandlerComp:Function = null){
        let pool = this.poolList[(obj as any).poolKey];
        //判断对象池存在
        if (pool && pool.indexOf(obj) == -1) {
            console.log("我移除了")
            //移除舞台
           // obj.destroy()
           obj.removeFromParent(false);
            //执行unuse
            var handler = poolHandlerComp ? obj.getComponent(poolHandlerComp) : null;
            if (handler && handler.unuse) {
                handler.unuse();
            }
            //存放对象
            console.log("我put了")
            pool.push(obj);
        }
    }
 
    /**
     * 清理对象池
     * @param prefabUrl 预制体路径
     */
    public static clear(prefabUrl:string){
        let pool = this.poolList[prefabUrl];
        if(pool){
            for (let i = 0,len=pool.length; i < len; i++) {
                pool[i].destroy();
            }
            pool.length = 0;
        }
    }
 
    /**清理所有对象池 */
    public static clearAll(){
        for(let key in this.poolList){
            this.clear(key);
        }
    }
 
    /**
     * 对象池长度
     * @param prefabUrl 预制体路径
     */
    public static size(prefabUrl:string) {
        let pool = this.poolList[prefabUrl];
        if(pool){
            return pool.length;
        }
        return 0;
    }
}