const {ccclass, property} = cc._decorator;

@ccclass
export default class FrameAnim extends cc.Component {

    @property({type: [cc.SpriteFrame], tooltip:"帧动画图片数组"})
    spriteFrames : Array<cc.SpriteFrame> = [];

    @property({tooltip:"每一帧的时长"})
    duration : number = 0.1;


    @property({tooltip:"动画缩放比例"})
    node_scale : number = 1;


    // @property({tooltip:"缩放比例"})
    // spriteScale : number = 1;

    @property({tooltip:"是否循环播放"})
    loop : boolean = false;
    
    @property({tooltip:"是否在加载的时候就开始播放"})
    playOnload : boolean = false;

    // 播放完后的回调函数
    private endFunc : any = null;
    // 动画播放需要的精灵组件
    private sprite : cc.Sprite;
    // 动画播放的状态，正在播放还是停止
    private isPlaying : boolean = false;
    // 记录已经播放的时间
    private playTime : number = 0;
    private caller:any=null


  // public firstSpriteFrame:cc.SpriteFrame=null//起始的图片

   // private selfSprite:cc.SpriteFrame=null

   // private startScale=null;

    onLoad () {

        // 获取当前动画组件挂载的节点上的Sprite组件，如果没有则添加
        this.sprite = this.node.getComponent(cc.Sprite);
        if(!this.sprite){
            this.sprite = this.node.addComponent(cc.Sprite);
        }
        
    //    this.firstSpriteFrame= this.sprite.spriteFrame.clone()//把默认子弹图标记录进去
     //   console.log("子弹图标：",this.firstSpriteFrame);
        
        // 判断是否是预加载播放
        if(this.playOnload){
            if(this.loop){
                this.playLoop();        // 循环播放
            }else{
                this.playOnce(this.caller,null);    // 只播放一次
            }
        }
    }
    // public setIsPlay(isPlay:boolean){
    //       if(isPlay){
    //           this.isPlaying=true
    //       }else{
    //           this.isPlaying=false
    //       }
    // }


    public playLoop() : void {
        this.initFrame(true, null);
    }   

    public playOnce(endf : any,caller?:any) : void {
        this.caller=caller
        this.initFrame(false, endf);
    }

    private initFrame(loop:boolean, endf : any) : void{
        if(this.spriteFrames.length <= 0){
            return;
        }
        this.isPlaying = true;
        this.playTime = 0;
        this.sprite.spriteFrame = this.spriteFrames[0];
        this.loop = loop;
        this.endFunc = endf;
    }

    start () {

    }

    update (dt) {
   

        if(!this.isPlaying){
            return;
        }

        // 累计时间，通过时间计算应该取哪一张图片展示
        this.playTime += dt;
        let index : number = Math.floor(this.playTime / this.duration);
     
          this.node.scale=this.node_scale
    
        if(this.loop){  // 循环播放
            if(index >= this.spriteFrames.length){
                index -= this.spriteFrames.length;
                this.playTime -= (this.duration * this.spriteFrames.length);
            }
            this.sprite.spriteFrame = this.spriteFrames[index];
        }else{          // 播放一次
            if(index >= this.spriteFrames.length){
              
                this.isPlaying = false;
                // 如果有回调函数的处理，则调用回调函数
                if(this.endFunc){
                 //   this.node.scale=this.startScale
                    this.endFunc.call(this.caller);

                }
            }else{
                this.sprite.spriteFrame = this.spriteFrames[index];
            }
        }
    }
}
