var AdsParam = require("AdsParam");
const Global = require('Global');
var self = null;
var AdsMgr = cc.Class({
    statics:{
    	openAds:false,
    	//微信 wx
        //头条 tt
        //百度 baidu
        // uc
        //qg_vivo
        platform:"qg_vivo",
        qgAdsOK:false,

        //对应的平台的  bannerId  采用加后缀的方式
        bannerId_baidu:"6305713",
        bannerId_wx:"adunit-311d38abaf841420",
        bannerId_tt:"250aiflknbj73iksh9",

        insertId_wx_1:"adunit-b06de84558864b20",
        insertId_wx_2:"adunit-0c8930d8d7844439",


        oppo_banner:"124566",
        oppo_Insert:"124590",
        oppo_Insert2:"127313",

        vivo_banner:"d6957938dcb04ceebee6983b2ce2c744",
        vivo_Insert:"fd1501b8f9a1425fb4dcc2af42033650",

        //百度广告id  激励视频
        bdVideoId_1:"6305753",
        bdVideoId_2:"6305781",
        bdVideoId_3:"6305782",
        bdVideoId_4:"6305784",
        bdVideoId_5:"6305786",
        bdVideoId_6:"6305788",
        bdVideoId_7:"6305753",
        bdVideoId_8:"6305753",
        bdVideoId_9:"6305753",
        bdVideoId_10:"6305753",
        //微信广告id  激励视频
        wxVideoId_1:"adunit-d0919208c0081929",
        wxVideoId_2:"adunit-75613bd9529e3a2f",
        wxVideoId_3:"adunit-ae93eda18cd2fb27",
        wxVideoId_4:"adunit-91976342f43ee018",


        wxVideoId_5:"adunit-827d9d0f6f67011c",
        wxVideoId_6:"adunit-503baddcdc515459",
        wxVideoId_7:"adunit-503baddcdc515459",
        wxVideoId_8:"adunit-503baddcdc515459",
        wxVideoId_9:"adunit-503baddcdc515459",
        wxVideoId_10:"adunit-503baddcdc515459",

        //头条广告
        ttVideoId_1:"i51qrh06e29794fhj9",
        ttVideoId_2:"4504klmi07ka7p0h6i",
        ttVideoId_3:"2a8a7i3djo191ke140",
        ttVideoId_4:"2a8a7i3djo191ke140",
        ttVideoId_5:"2a8a7i3djo191ke140",
        ttVideoId_6:"i51qrh06e29794fhj9",
        ttVideoId_7:"",
        ttVideoId_8:"",
        ttVideoId_9:"",
        ttVideoId_10:"",

        oppoVideo_1:"125701",
        oppoVideo_2:"127314",
        oppoVideo_3:"125701",
        oppoVideo_4:"127314",
        oppoVideo_5:"125701",
        oppoVideo_6:"127314",
        oppoVideo_7:"125701",
        oppoVideo_8:"127314",
        oppoVideo_9:"125701",
        oppoVideo_10:"125701",

        vivoVideo_1:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_2:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_3:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_4:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_5:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_6:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_7:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_8:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_9:"5a6ade2c30b74009a15b2ceef670e35b",
        vivoVideo_10:"5a6ade2c30b74009a15b2ceef670e35b",

        allScreen:false,
        hasReSizeBanner:false,
        resizeTime:0,

    	//首先确定使用的平台
    	Init:function () {
        	//if(!window.wx && !window.tt && !window.swan && !window.uc)
            //	this.platform="pc";
            // console.log("选择平台 = " + this.platform);
            this.allScreen = false;
            cc.Mgr.Utils.onVideoAds = false;
            self = this;
            if(this.platform == "qg_oppo")
            {
            	if(this.openAds == false)
            		return;
            	console.log("初始化oppo广告 ====== ");
            	qg.initAdService({
				    appId:"30195312",//填写分配的Id
					isDebug:false,
					success:function(res) {
						console.log("Ads  success");
						self.setQgGameAdsState();
						self.initNativeAd();
						//self.ShowBannerAds();
					},
					fail:function(res) {
						console.log("fail:" + res.code + res.msg);
					},
					complete:function(res) {
						console.log("complete");
					}
				})
            }
            else if(this.platform == "qg_vivo")
	        {
	        	if(this.openAds == false)
            		return;

            	Global.gameInfo.lastVideoTime = 0; //cc.Mgr.Utils.GetSysTime();
	        	if (qg.getSystemInfoSync().platformVersionCode < 1031) {
				    // 不支持广告
				}
				else {
				    self.setQgGameAdsState();
				    self.initNativeAd();
				}
			}	
        },

        setQgGameAdsState:function(){
        	this.qgAdsOK = true;
        },

    	//获取广告点ID
	    getBannerAdId:function()
	    {
	        if(this.platform == "wx")
	        {
	            return this.bannerId_wx;
	        }
	        else if(this.platform == "baidu")
	        {
	            return this.bannerId_baidu;
	        }
	        else if(this.platform == "tt")
	        {
	        	return this.bannerId_tt;
	        }
	        else if(this.platform == "qg_oppo")
	        {
	        	return this.oppo_banner;
	        }
	        else if(this.platform == "qg_vivo")
	        {
	        	return this.vivo_banner;
	        }
	        return null;
	    },

	    //获取广告点ID
	    getInsertAdId:function(adName)
	    {
	        if(this.platform == "wx")
	        {
	        	if(adName == 1)
	            	return this.insertId_wx_1;
	            else if(adName == 2)
	            	return this.insertId_wx_2;
	        }
	        else if(this.platform == "baidu")
	        {
	            
	        }
	        else if(this.platform == "tt")
	        {
	        	
	        }
	        else if(this.platform == "qg_oppo")
	    	{
	    		if(adName == 1)
	    			return this.oppo_Insert;
	    		else
	    			return this.oppo_Insert2;
	    	}
	    	else if(this.platform == "qg_vivo")
	    	{
	    		return this.vivo_Insert;
	    	}
	        return null;
	    },

	    getNativeAdId:function(){
	    	if(this.platform == "qg_oppo")
	    		return "139678";
	    	else if(this.platform == "qg_vivo")
	    		return "52a052d5698746278f7ea4a7c94efc97";
	    },

	    //获取广告点ID  这里配置 视频奖励广告 Id 由于会有多个广告点  根据后台设置来顶
	    getVideoAdId:function(adName)
	    {
	        var adId = "";
	        if(this.platform == "wx")
	        {
	            switch(adName)
	            {
	                case AdsParam.PointA:
	                    adId = this.wxVideoId_1;
	                    break;
	                case AdsParam.PointB:
	                    adId = this.wxVideoId_2;
	                    break;
	                case AdsParam.PointC:
	                    adId = this.wxVideoId_3;
	                    break;
	                case AdsParam.PointD:
	                    adId = this.wxVideoId_4;
	                    break;
	                case AdsParam.PointE:
	                    adId = this.wxVideoId_5;
	                    break;
	                case AdsParam.PointF:
	                    adId = this.wxVideoId_6;
	                    break;
	                case AdsParam.PointG:
	                    adId = this.wxVideoId_7;
	                    break;
	                case AdsParam.PointH:
	                    adId = this.wxVideoId_8;
	                    break;
	                case AdsParam.PointI:
	                    adId = this.wxVideoId_9;
	                    break;
	                case AdsParam.PointJ:
	                    adId = this.wxVideoId_10;
	                    break;
	            }
	        }
	        else if(this.platform == "baidu")
	        {
	            switch(adName)
	            {
	                case AdsParam.PointA:
	                    adId = this.bdVideoId_1;
	                    break;
	                case AdsParam.PointB:
	                    adId = this.bdVideoId_2;
	                    break;
	                case AdsParam.PointC:
	                    adId = this.bdVideoId_3;
	                    break;
	                case AdsParam.PointD:
	                    adId = this.bdVideoId_4;
	                    break;
	                case AdsParam.PointE:
	                    adId = this.bdVideoId_5;
	                    break;
	                case AdsParam.PointF:
	                    adId = this.bdVideoId_6;
	                    break;
	                case AdsParam.PointG:
	                    adId = this.bdVideoId_7;
	                    break;
	                case AdsParam.PointH:
	                    adId = this.bdVideoId_8;
	                    break;
	                case AdsParam.PointI:
	                    adId = this.bdVideoId_9;
	                    break;
	                case AdsParam.PointJ:
	                    adId = this.bdVideoId_10;
	                    break;
	            }
	        }
	        else if(this.platform == "tt")
	        {
	            switch(adName)
	            {
	                case AdsParam.PointA:
	                    adId = this.ttVideoId_1;
	                    break;
	                case AdsParam.PointB:
	                    adId = this.ttVideoId_2;
	                    break;
	                case AdsParam.PointC:
	                    adId = this.ttVideoId_3;
	                    break;
	                case AdsParam.PointD:
	                    adId = this.ttVideoId_4;
	                    break;
	                case AdsParam.PointE:
	                    adId = this.ttVideoId_5;
	                    break;
	                case AdsParam.PointF:
	                    adId = this.ttVideoId_6;
	                    break;
	                case AdsParam.PointG:
	                    adId = this.ttVideoId_7;
	                    break;
	                case AdsParam.PointH:
	                    adId = this.ttVideoId_8;
	                    break;
	                case AdsParam.PointI:
	                    adId = this.ttVideoId_9;
	                    break;
	                case AdsParam.PointJ:
	                    adId = this.ttVideoId_10;
	                    break;
	            }
	        }
	        else if(this.platform == "qg_oppo")
	        {
	        	switch(adName)
	            {
	                case AdsParam.PointA:
	                    adId = this.oppoVideo_1;
	                    break;
	                case AdsParam.PointB:
	                    adId = this.oppoVideo_2;
	                    break;
	                case AdsParam.PointC:
	                    adId = this.oppoVideo_3;
	                    break;
	                case AdsParam.PointD:
	                    adId = this.oppoVideo_4;
	                    break;
	                case AdsParam.PointE:
	                    adId = this.oppoVideo_5;
	                    break;
	                case AdsParam.PointF:
	                    adId = this.oppoVideo_6;
	                    break;
	                case AdsParam.PointG:
	                    adId = this.oppoVideo_7;
	                    break;
	                case AdsParam.PointH:
	                    adId = this.oppoVideo_8;
	                    break;
	                case AdsParam.PointI:
	                    adId = this.oppoVideo_9;
	                    break;
	                case AdsParam.PointJ:
	                    adId = this.oppoVideo_10;
	                    break;
	            }
	        }
	        else if(this.platform == "qg_vivo")
	        {
	        	switch(adName)
	            {
	                case AdsParam.PointA:
	                    adId = this.vivoVideo_1;
	                    break;
	                case AdsParam.PointB:
	                    adId = this.vivoVideo_2;
	                    break;
	                case AdsParam.PointC:
	                    adId = this.vivoVideo_3;
	                    break;
	                case AdsParam.PointD:
	                    adId = this.vivoVideo_4;
	                    break;
	                case AdsParam.PointE:
	                    adId = this.vivoVideo_5;
	                    break;
	                case AdsParam.PointF:
	                    adId = this.vivoVideo_6;
	                    break;
	                case AdsParam.PointG:
	                    adId = this.vivoVideo_7;
	                    break;
	                case AdsParam.PointH:
	                    adId = this.vivoVideo_8;
	                    break;
	                case AdsParam.PointI:
	                    adId = this.vivoVideo_9;
	                    break;
	                case AdsParam.PointJ:
	                    adId = this.vivoVideo_10;
	                    break;
	            }
	        }
	        return adId;
	    },

	    ShowBannerAds:function()
	    {
	    	if(this.openAds == false)
	    	{
	    		return;
	    	}
	    	if(this.qgAdsOK == false)
	    		return;

	        if(this.platform == "qg_oppo") 
	        {
	        	if(this.bannerAdCtrl !=null)
	                this.bannerAdCtrl.destroy();

	            console.log("创建广告 === banner  Id = " + self.getBannerAdId());
	        	this.bannerAdCtrl = qg.createBannerAd({
				    posId:self.getBannerAdId(),
				});

				this.bannerAdCtrl.show();
	        }
	        else if(this.platform == "qg_vivo") 
	        {
	        	
	        }
	        else if(this.platform == "wx")
	        {
	            
	        }
	        else if(this.platform == "baidu")
	        {
	           
	        }
	        else if(this.platform == "tt")
	        {
	        	
	        }
	        else if(this.platform == "uc")
	        {
	        	
	        }
	    },

	    HideBannerAd:function(){
	    	// console.log("隐藏banner");
	    	if(this.openAds == false)
	    	{
	    		return;
	    	}
	    	if(this.bannerAdCtrl != null)
	    	{
	    		if(this.platform == "qg_vivo")
	    		{
		    		
	    		}
	    		else
	    		{
	    			
	    		}
	    	}

	    	this.DestroyBanner();
	    },

	    RecoverShowBanner:function(){
	    	if(this.openAds == false)
	    	{
	    		return;
	    	}
	    	console.log("重开banner");
	    	if(this.platform == "qg_vivo")
	    	{
	    		this.ShowBannerAds();
	    	}
	    	else
	    	{
		    	
		    	this.ShowBannerAds();
	    	}
	    },

	    DestroyBanner:function(){
	    	if(this.openAds == false)
	    	{
	    		return;
	    	}
	    	if(this.platform == "qg_vivo")
	    	{
	    		if(this.bannerAdCtrl != null)
	    		{
		    		
	    		}
	    	}
	    	else
	    	{
		    	
	    	}

	        this.bannerAdCtrl = null;
	    },

	    initNativeAd:function(){
			if(!this.openAds || !this.qgAdsOK)
			{
				return;
			}
			if(this.platform != "qg_vivo" && this.platform != "qg_oppo")
				return;

			
	    },

	    //adName 1 原生插屏，2原生视频
		showNativeAds(adName = 1,cb=null)
		{
			if(!this.openAds || !this.qgAdsOK)
			{
				return;
			}

			
		},

		reportAdShow(adId)
		{
			
		},
		reportAdClick(adId)
		{
			
		},


	    ShowInsertAds:function(adName){
	    	if(this.openAds == false)
	    	{
	    		return;
	    	}
	    	
	    },

	    //cb 回调参数 0 播放完成，1 不放未完成 ，-1 视频加载出错
	    ShowVideoAds:function(adName,cb)
	    {
	    	// if(this.openAds == false)
	    	// {
	    	// 	cc.Mgr.PlatformController.showToast("广告功能暂未开放")
	    	// 	return;
	    	// }
			if(cb) cb(0);
	    },
    }, 
});
module.exports = AdsMgr;
