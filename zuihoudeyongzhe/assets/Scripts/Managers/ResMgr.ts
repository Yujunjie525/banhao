const {ccclass, property} = cc._decorator;

@ccclass
export default class ResMgr extends cc.Component {
    public static Instance: ResMgr = null;

    private abBunds: any = {};
    private total: number = 0;
    private now: number = 0;
    private progressFunc: Function = null;
    private endFunc: Function = null;

    private nowAb: number = 0;
    private totalAb: number = 0;
    
    // @property([cc.AudioClip])
    // private preloadSounds: Array<cc.AudioClip> = [];

    // @property([cc.Prefab])
    // private preloadScenes: Array<cc.Prefab> = [];

    // @property([cc.Prefab])
    // private preloadCharactors: Array<cc.Prefab> = [];

    // @property([cc.Prefab])
    // private preloadUIPrefabs: Array<cc.Prefab> = [];

    // @property([cc.SpriteAtlas])
    // private preloadUIAtalas: Array<cc.SpriteAtlas> = [];
    
    private loadAssetsBundle(abName: string, endFunc: Function): void {

        cc.assetManager.loadBundle(abName, (err, bundle)=>{
            if(err !== null) {
                console.log("[ResMgr]:Load AssetsBundle Error: " + abName);
                this.abBunds[abName] = null;
            } 
            else {
                console.log("[ResMgr]:Load AssetsBundle Success: " + abName);
                this.abBunds[abName] = bundle;
            }
            if(endFunc) {
                endFunc();
            }

        });
    }

    onLoad(): void {
        if(ResMgr.Instance === null) {
            ResMgr.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
    }
    
    private loadRes(abBundle, url, typeClasss): void {
       
        abBundle.load(url, typeClasss, (error, asset)=>{
            this.now ++;
            if (error) {
                console.log("load Res " + url + " error: " + error);
            }
            else {
                console.log("load Res " + url + " success!");
            }

            if (this.progressFunc) {
                this.progressFunc(this.now, this.total);
            }

            console.log(this.now, this.total);
            if (this.now >= this.total) {   
                
                if (this.endFunc !== null) {
                    this.endFunc();
                }
            }
        });
    }

    public getAsset(abName: string, resUrl: string): any {
        var bondule = cc.assetManager.getBundle(abName);
        if (bondule === null) {
            console.log("[error]: " + abName + " AssetsBundle not loaded !!!");
            return null;
        }
        
        return bondule.get(resUrl);
    }


    public getBundle(abName: string): any {
        var bondule = cc.assetManager.getBundle(abName);
        if (bondule === null) {
            console.log("[error]: " + abName + " AssetsBundle not loaded !!!");
            return null;
        }
        
        return bondule
    }

    public releaseResPackage(resPkg: object) {
        for(var key in resPkg) {
            var urlSet = resPkg[key].urls;
            for(var i = 0; i < urlSet.length; i ++) {
                cc.assetManager.releaseAsset(urlSet[i]);                
            }
        }
    }

    private loadAssetsInAssetsBundle(resPkg): void {
        
        for(var key in resPkg) {
            var urlSet = resPkg[key].urls;
            var typeClass = resPkg[key].assetType;

            
            for(var i = 0; i < urlSet.length; i ++) {
                this.loadRes(this.abBunds[key], urlSet[i], typeClass);
            }
        }
    }

    // { GUI: {assetType: cc.Prefab, urls: []}, }
    public preloadResPackage(resPkg, progressFunc, endFunc): void {
        this.total = 0;
        this.now = 0;
        this.totalAb = 0;
        this.nowAb = 0;

        this.progressFunc = progressFunc;
        this.endFunc = endFunc;

        for(var key in resPkg) {//获取所有AssetsBundle总个数 和文件总个数
            this.totalAb ++;
            this.total += resPkg[key].urls.length; 
        }

        for(var key in resPkg) {
            //先遍历AssetsBundle
            this.loadAssetsBundle(key, ()=>{
                //遍历里面的文件
                this.nowAb ++;
                if (this.nowAb === this.totalAb) {
                    this.loadAssetsInAssetsBundle(resPkg);
                }
            });
            
        }
    }

    onDestroy() {
        if (ResMgr.Instance === this) {
            ResMgr.Instance = null;
        }
    }
}
