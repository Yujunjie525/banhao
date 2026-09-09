
cc.Class({
    extends: cc.Component,

    properties: {
        bg:cc.Node,
        daojishi:cc.Label,
        title:cc.Label,
        desc:cc.Label,
        buttonLabel:cc.Label,
        icon:cc.Sprite,
        closeButtonNode:cc.Node,
        timeNode:cc.Node,

        ditu:cc.Sprite,
    },


    showUI(param)
    {
        // ret.state = true;
        // ret.adId = "97b8eab5-40ca-43d3-975b-b291bbe94924";
        // ret.clickBtnTxt = "立即下载";
        // ret.icon = "https://cdopic0.oppomobile.com/img/201908/12/89abdba425172e51f63cd4734bc189c8.png";
        // ret.title = "英魂之刃";
        // ret.desc = "独创六角棋盘乐趣，对弈一触即发";
        // ret.creativeType = 3;
        console.log("原生广告信息收到了 ============ ");

        var self = this;
        this.bg.active = true;//param.isVedio;
        this.closeButtonNode.active = !param.isVedio;
        this.timeNode.active = param.isVedio;
        this.title.string = param.title || "";
        this.desc.string = param.desc || "";
        this.buttonLabel.string = "点击查看";
        this.adId = param.adId;
        this.callback = param.cb;

        this.recordeTime = cc.Mgr.Utils.GetSysTime();
        this.daojishi.string = "15s";
        this.isVedio = param.isVedio;

        console.log("原生广告图片没下载 ============ " + param.icon);

        cc.loader.load(param.imgUrl, function(err, texture){
            console.log("原生广告图片没下载 ============ " + param.icon);
            if(err) 
            {
                return;
            }
            console.log("原生广告图片下载完成 ============ " + param.icon);
            self.ditu.spriteFrame = new cc.SpriteFrame(texture);
        });

        /*cc.loader.load(param.icon, function(err, texture){
            console.log("原生广告图片没下载 ============ " + param.icon);
            if(err) 
            {
                return;
            }
            console.log("原生广告图片下载完成 ============ " + param.icon);
            self.icon.spriteFrame = new cc.SpriteFrame(texture);
        });*/

        cc.Mgr.AdsMgr.reportAdShow(this.adId);
    },

    start () {

    },

    update (dt) {

        if(!this.isVedio) return;

        var time = 15 - (cc.Mgr.Global.GetSysTime() - this.recordeTime);
        if(time < 0)
        {
            this.daojishi.string = 0 + "s";
            this.closeButtonNode.active = true;
        }
        else
        {
            this.daojishi.string = time + "s";
        }
        
    },

    sureOnClick()
    {
        cc.Mgr.AdsMgr.reportAdClick(this.adId);
    },

    colseOnClick()
    {
        if(this.callback) 
            this.callback(0);
        this.node.active = false;
        
    },
});
