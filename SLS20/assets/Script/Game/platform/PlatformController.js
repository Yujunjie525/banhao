
var PlatformController = cc.Class({
    statics:{
    	IsScreenRecord:false,
        wxSubContextViewLock:0,
        //微信 wx
        //头条 tt
        //百度 baidu
        // uc
        //qg oppo vivo 等
        platform:"qg_vivo",
        //震动是否开启
        QuakeState:1,

        Init:function () {
        	//if(!window.wx && !window.tt && !window.swan && !window.uc)
            //	this.platform="pc";
        },
        //百度 头条等先判定是否登陆了
        IsLoginSync:function(){
        	if(this.platform == "baidu")
        	{
        		var result = swan.isLoginSync();
    			if(result.isLogin)
    			{
    				console.log("已经有登陆了");
    				return true;
    			}
    			return false;
        	}
        	return true;
        },

        CheckTTSession:function(func){
        	tt.checkSession({
			    success (res) {
			    	func(true);
			        console.log(`session未过期`);
			    },
			    fail (res) {
			        console.log(`session已过期，需要重新登录`);
			        func(false);
			    }
			});
        },

        Login:function(){
        	var self = this;
        	if(this.platform == "baidu")
        	{
        		swan.login({
			        success: function () {
			            self.setUserCloudStorage(cc.Mgr.UserData.getHighScore());
			        },
			        fail: function () {
			            swan.showModal({
			                title: "登录失败",
			                content: "是否重新登录？",
			                cancelText: "退出游戏",
			                success: function (res) {
			                    if (res.confirm) {
			                        console.log("点击了确定");
			                        self.Login();
			                    }
			                    else if (res.cancel) {
			                        console.log("点击了取消");
			                        swan.exit();
			                    }
			                }
			            })
			        }
			    });
        	}
        	else if(this.platform == "tt")
        	{
        		tt.login({
			        success: function () {
			            self.setUserCloudStorage(cc.Mgr.UserDataMgr.HistoryHighAssets);
			        },
			        fail: function () {
			            tt.showModal({
			                title: "登录失败",
			                content: "是否重新登录？",
			                cancelText: "退出游戏",
			                success: function (res) {
			                    if (res.confirm) {
			                        console.log("点击了确定");
			                        self.Login();
			                    }
			                    else if (res.cancel) {
			                        console.log("点击了取消");
			                        tt.exitMiniProgram({

			                        });
			                    }
			                }
			            })
			        }
			    })
        	}
        },

        //游戏圈按钮
        CreateGameClub:function(){
        	if(this.platform == "wx")
        	{
        		var winSize = cc.view.getVisibleSize();
        		var leftRatio = 68 / winSize.width;
        		var topRatio = 275 / winSize.height;

        		var sysInfo = wx.getSystemInfoSync();

        		this.leftPos = sysInfo.windowWidth * leftRatio;
        		this.topPos = sysInfo.windowHeight * topRatio;

        		console.log(this.topPos + "  ================创建游戏圈按钮===============" + this.leftPos);

        		var self = this;
        		this.gameClubBtn = wx.createGameClubButton({
        			icon:'green',
        			text:"游戏圈",
        			style:{
        				left:self.leftPos - 20,
        				top:self.topPos - 20,
        				width: 45,
        				height: 45,
        			}
        		});
        	}
        },

        ShowClubButton:function(flag = false)
        {
        	if(this.platform == "wx" && this.gameClubBtn != null)
        	{
        		if(flag == true)
        			this.gameClubBtn.show();
        		else
        			this.gameClubBtn.hide();
        	}
        },

        //右上角的转发按钮
        ShareTopNav:function(){
        	var index = Math.floor(Math.random()*4);
	        let info = cc.Mgr.ShareInfos.getShareInfos(index);
	        if(this.platform == "wx")
	        {
	            wx.showShareMenu({withShareTicket:true});
	            wx.onShareAppMessage(function () {
	                // 用户点击了“转发”按钮
	                return {
	                  title: info.text,
	                  //imageUrlId: '',
	                  imageUrl: info.url,
	                }
	            })
	        }
	        else if(this.platform == "tt")
	        {
	            tt.showShareMenu(false);
	            tt.onShareAppMessage(function () {
	                // 用户点击了“转发”按钮
	                return {
	                  title: info.text,
	                  //imageUrlId: 'Ik14RZj7SV2BtigrtE3d1g',
	                  imageUrl: info.url,
	                }
	            })
	        }
	        else if(this.platform == "baidu")
	        {
	            swan.showShareMenu(false);
	            swan.onShareAppMessage(function () {
	                // 用户点击了“转发”按钮
	                return {
	                  title: info.text,
	                  imageUrl: info.url
	                }
	            })
	        }
        },

        //转发一段文本
        ShareToFriendTxt:function(str){
        	var index = Math.floor(Math.random() * 4);
        	var info = cc.Mgr.ShareInfos.getShareInfos(index);
        	if(this.platform == "wx")
	        {
	            console.log("点击了分享啊");
	            wx.shareAppMessage({
	                title: str,
	                imageUrl: info.url,
	            })
	        }
	        else if(this.platform == "tt")
	        {
	            tt.shareAppMessage({
	                title: str,
	                imageUrl: info.url,
	            })
	        }
	        else if(this.platform == "baidu")
	        {
	            console.log("点击了分享啊");
	            swan.shareAppMessage({
	                title: str,
	                imageUrl: info.url,
	            })
	        }
	        else if(this.platform == "uc")
	        {
	        	uc.shareAppMessage({
		        	title: str,   
		        	imageUrl: info.url, // 图片 URL   
		        	query: '' ,   // 查询字符串，必须是 key1=val1&key2=val2 的格式。                
		        	// 从这条转发消息进入后，可通过 uc.getLaunchOptionsSync() 获取启动参数中 的 query。   
		        	target: 'wechat',      // wechat:微信好友，qq: qq好友，不设置的话会调起分享面板   
		        	success: res => {
		        		console.log('shareAppMessage share success', JSON.stringify(res));   
		        	},   
		        	fail: err => {
		        		console.log('shareAppMessage share fail', JSON.stringify(err));   
		        	} 
	        	})
	        }
        },

        //自定义转发
        ShareToFriend:function(index, cb = null){
        	this.cb = null;
        	var self = this;
        	this.cb = cb;
        	var info = cc.Mgr.ShareInfos.getShareInfos(index);
	        if(this.platform == "wx")
	        {
	            console.log("点击了分享啊");
	            wx.shareAppMessage({
	                title: info.text,
	                imageUrl: info.url,
	            })
	        }
	        else if(this.platform == "tt")
	        {
	            tt.shareAppMessage({
	                title: info.text,
	                imageUrl: info.url,
	                success() {
					    if(self.cb != null)
					    	self.cb(0);
					  },
					  fail(e) {
					    console.log('分享视频失败');
					  }
	            })
	        }
	        else if(this.platform == "baidu")
	        {
	            console.log("点击了分享啊");
	            swan.shareAppMessage({
	                title: info.text,
	                imageUrl: info.url,
	                success() {
					    if(self.cb != null)
					    	self.cb(0);
					  },
					  fail(e) {
					    console.log('分享视频失败');
					  }
	            })
	        }
	        else if(this.platform == "uc")
	        {
	        	uc.shareAppMessage({
		        	title: info.text,   
		        	imageUrl: info.url, // 图片 URL   
		        	query: '' ,   // 查询字符串，必须是 key1=val1&key2=val2 的格式。                
		        	// 从这条转发消息进入后，可通过 uc.getLaunchOptionsSync() 获取启动参数中 的 query。   
		        	//target: 'wechat',      // wechat:微信好友，qq: qq好友，不设置的话会调起分享面板   
		        	success: res => {
		        		console.log('shareAppMessage share success', JSON.stringify(res));   
		        	},   
		        	fail: err => {
		        		console.log('shareAppMessage share fail', JSON.stringify(err));   
		        	} 
	        	})
	        }
        },
 		//显示平台的小弹窗 回调用
        showToast:function(text)
	    {
	        cc.log(text);
	        if(this.platform == "wx")
	        {
	            wx.showToast({
	                title: text,
	                icon: 'none',
	                duration: 2000
	            })
	        }
	        else if(this.platform == "tt")
	        {
	            tt.showToast({
	                title: text,
	                icon: 'none',
	                duration: 2000
	            })
	        }
	        else if(this.platform == "baidu")
	        {
	            swan.showToast({
	                title: text,
	                icon: 'none',
	                duration: 2000
	            })
	        }  
	    },
	    //微信开放数据存储 score 代表当前要保存的东西
	    setUserCloudStorage:function(socre) 
	    {
	        console.log("setUserCloudStorage socre = " + socre);
	        if(this.platform == "wx")
	        {
	            var kvData={};
	            kvData.wxgame={};
	            kvData.wxgame.score = socre;
	            kvData.wxgame.update_time =  new Date().getTime();
	            console.log(JSON.stringify(kvData));

	            var kvDataList = new Array();
	            kvDataList.push({key: "jzScore", value: JSON.stringify(kvData)});
	            wx.setUserCloudStorage({
		            KVDataList: kvDataList,
		            success: res => {
		                console.log("success:" + JSON.stringify(res))
		            },
		            fail: res => {
		                console.log("fail : " + res);
		            }
	            });
	        }
	        if(this.platform == "baidu")
	        {
	            var kvData={};
	            kvData.wxgame={};
	            kvData.wxgame.score = socre;
	            kvData.wxgame.update_time =  new Date().getTime();
	            console.log(JSON.stringify(kvData));

	            var kvDataList = new Array();
	            kvDataList.push({key: "jzScore", value: JSON.stringify(kvData)});
	            swan.setUserCloudStorage({
		            KVDataList: kvDataList,
		            success: res => {
		                console.log("success:" + JSON.stringify(res))
		            },
		            fail: res => {
		                console.log("fail : " + res);
		            }
	            });
	        }
	    },

	    //是否支持排行功能
	    IsSupportRank:function()
	    {
	        if(this.platform == "wx")
	            return true;

	        return false;
	    },

	    //显示子域
	    showSubContentView:function()
	    {
	        if(this.platform != "wx")
	        {
	            return;
	        }
	        this.wxSubContextViewLock++;
	        console.log("showSubContentView   " + this.wxSubContextViewLock);
	    },

	    hideSubContentView:function()
	    {
	        if(this.platform != "wx")
	        {
	            return;
	        }
	        this.wxSubContextViewLock--;
	        console.log("hideSubContentView   " + this.wxSubContextViewLock);
	    },

	    SendMessageToSubView:function(code,curScore=0)
	    {
	        var msg={};
	        msg.code = code;
	        msg.curScore = curScore;
	        if(this.platform == "wx")
	        {
	            wx.getOpenDataContext().postMessage({
	                message: msg
	            });
	        }
	        else if(this.platform == "baidu")
	        {
	        	swan.getOpenDataContext().postMessage({
	                message: msg
	            });
	        }
	    },
	    
	    //震屏功能  长震动还是短震动
	    QuakeScreen:function(long = true){
	    	if(this.QuakeState != 1)
	    	{
	    		return;
	    	}
	    	if(this.platform != "pc")
	    	{
	    		if(long == true)
	    		{
	    			if(this.platform == "tt")
		    		{
		    			tt.vibrateLong({
						    success (res) {
						        console.log(`${res}`);
						    },
						    fail (res) {
						        console.log(`vibrateLong调用失败`);
						    }
						});
		    		}
		    		else if(this.platform == "baidu")
		    		{
		    			swan.vibrateLong({
						    success (res) {
						        console.log(`${res}`);
						    },
						    fail (res) {
						        console.log(`vibrateLong调用失败`);
						    }
						});
		    		}
		    		else if(this.platform == "wx")
		    		{
		    			wx.vibrateLong({
						    success (res) {
						        console.log(`${res}`);
						    },
						    fail (res) {
						        console.log(`vibrateLong调用失败`);
						    }
						});
		    		}
		    		else if(this.platform == "qg_oppo")
		    		{
		    			qg.vibrateLong({
						    success: function(res) {},
						    fail: function(res) {},
						    complete: function(res) {}
						});
		    		}
	    		}
	    		else
	    		{
	    			if(this.platform == "tt")
		    		{
		    			tt.vibrateShort({
						    success (res) {
						        console.log(`${res}`);
						    },
						    fail (res) {
						        console.log(`vibrateShort调用失败`);
						    }
						});
		    		}
		    		else if(this.platform == "baidu")
		    		{
		    			swan.vibrateShort({
						    success (res) {
						        console.log(`${res}`);
						    },
						    fail (res) {
						        console.log(`vibrateShort调用失败`);
						    }
						});
		    		}
		    		else if(this.platform == "wx")
		    		{
		    			wx.vibrateShort({
						    success (res) {
						        console.log(`${res}`);
						    },
						    fail (res) {
						        console.log(`vibrateLong调用失败`);
						    }
						});
		    		}
		    		else if(this.platform == "qg_oppo")
		    		{
		    			qg.vibrateShort({
						    success: function(res) {},
						    fail: function(res) {},
						    complete: function(res) {}
						});
		    		}
	    		}
	    	}
	    },

	    SetQuakeState:function(){
	    	this.QuakeState = (this.QuakeState + 1) % 2;
	    },
	    GetQuakeState:function(){
	    	return this.QuakeState;
	    },
	    //是否支持录屏
	    IsSupportRecordScreen:function()
	    {
	        if(this.platform == "tt")
	            return true;
	        else if(this.platform == "baidu")
	        {
	        	if(this.CompareSdkVesrion(swan.getSystemInfoSync().SDKVersion, "1.4.1"))
	        		return true;
	        	else
	            	return false;
	        }

	        return false;
	    },

	    //sdk 版本比较
	    CompareSdkVesrion:function(sdkV, needV){
	    	var out1 = sdkV.split('.');
	    	var out2 = needV.split('.');

	    	const len = Math.max(out1.length, out2.length);

			while (out1.length < len) {
				out1.push('0')
			}

			while (out2.length < len) {
				out2.push('0')
			}

	    	for (var i = 0; i < len; i++) {
	    		if(parseInt(out1[i]) < parseInt(out2[i]))
	    		{
	    			return 0;
	    		}
	    		else if(parseInt(out1[i]) > parseInt(out2[i]))
	    		{
	    			return 1;
	    		}
	    	}
	    	return 1;
	    },

	    //开始录屏
	    StartRecordScreen:function()
	    {
	        var self = this;
	        this.videoPath = "";
	        this.IsScreenRecord = true;
	        this.showToast("开始录制");

	        cc.Mgr.Global.screenStartTime = cc.Mgr.Utils.GetSysTime();

	        if(this.platform == "tt")
	        {
	            if(this.recorderManager == null)
	            {
	                this.recorderManager = tt.getGameRecorderManager();
	                
	                this.recorderManager.onStart(res =>{
	                    console.log("录制开始了: "+res);
	                });

	                this.recorderManager.onStop(res =>{
	                	self.showToast("结束录制");
	                    console.log("录制结束了: "+res.videoPath);
	                    self.IsScreenRecord = false;
	                    cc.director.emit("ScreenOver", {});
	                    self.videoPath = res.videoPath;
	                    self.ShareRecordScreen();
	                });
	                
	                this.recorderManager.onPause(() =>{
	                    console.log("录制暂停了");
	                });
	                
	                this.recorderManager.onResume(() =>{
	                    console.log("录制恢复了");
	                });

	                this.recorderManager.onError(errMsg =>{
	                    console.log("录制出错了:" + errMsg);
	                    self.IsScreenRecord = false;
	                });
	            }

	            this.recorderManager.start({
	                duration: 30,//基础录制30秒
	            });
	        }
	        else if(this.platform == "baidu")
	        {
	            if(this.recorderManager == null)
	            {
	                this.recorderManager = swan.getVideoRecorderManager();
	                
	                this.recorderManager.onStart(res =>{
	                    console.log("录制开始了: "+res);
	                });

	                this.recorderManager.onStop(res =>{
	                    console.log("录制结束了: "+res.videoPath);
	                    self.IsScreenRecord = false;
	                    self.videoPath = res.videoPath;
	                    cc.director.emit("ScreenOver", {});
	                    self.ShareRecordScreen();
	                });
	                
	                this.recorderManager.onPause(() =>{
	                    console.log("录制暂停了");
	                });
	                
	                this.recorderManager.onResume(() =>{
	                    console.log("录制恢复了");
	                });

	                this.recorderManager.onError(errMsg =>{
	                    console.log("录制出错了:" + errMsg);
	                    self.IsScreenRecord = false;
	                });
	            }
	            this.recorderManager.start({
	                duration: 30,
	                microphoneEnabled: true,//是否支持麦克风
	            });
	        }
	    },
	    //停止录屏
	    StopRecordScreen:function()
	    {
	    	this.IsScreenRecord = false;
	        if(this.platform == "tt")
	        {
	            if(this.recorderManager == null)
	            {
	                return;
	            }
	            console.log("停止录制");
	            this.recorderManager.stop();
	        }

	        else if(this.platform == "baidu")
	        {
	            if(this.recorderManager == null)
	            {
	                return;
	            }
	            console.log("停止录制");
	            this.recorderManager.stop();
	        }
	    },
	    //分享录制的视频
	    ShareRecordScreen:function()
	    {
	    	var self = this;
	    	if(cc.Mgr.Utils.GetSysTime() - cc.Mgr.Global.screenStartTime <= 3)
        	{
        		cc.Mgr.Global.screenStartTime = 0;
        		this.showToast("录制时间少于三秒,未能成功保存视频");
        		cc.director.emit("ShareVideoOver", {resumeNow:true});
        		return;
        	}
        	this.showToast("结束录屏");

	        if(this.platform == "tt")
	        {
	            if(this.recorderManager == null || this.videoPath == "")
	            {
	                return;
	            }
	            console.log("分享录制的视频");
	            tt.shareVideo({
	                videoPath: `${this.videoPath}`,
	                success () {
	                	self.showToast("分享录制视频成功！");
	                },
	                fail (e) {
			            self.showToast("分享录制视频失败！");
	                }
	            });
	        }
	        else if(this.platform == "baidu")
	        {
	            if(this.recorderManager == null || this.videoPath == null)
	            {
	                return;
	            }

	            console.log("分享录制的视频");
	            swan.shareVideo({
	                videoPath: `${this.videoPath}`,
	                success () {
	                console.log("分享成功！");
	                },
	                fail (e) {
	                console.log("分享失败！" + e);
	                }
	            });
	        }
	    },

	    InstallShortCut:function(){
	    	if(this.platform == "qg_vivo" || this.platform == "qg_oppo")
	    	{
	    		if(qg.hasShortcutInstalled({
				  	success: function(status) {
					    if(status) {
					        qg.showToast({
						        message: "已经创建桌面成功",
						    })
					    }else{
					        qg.installShortcut({
							  	success: function() {
							    	qg.showToast({
								        message: "创建桌面成功",
								    })
							  	},
							})
					    }
				  	}
				}));
	    	}
	    },

	    //跳转到其他小程序
	    JumpToOtherApp:function(Id = "", pkgStr = ""){//头条和微信类似
	    	if(this.platform == "wx")
	    	{
	    		wx.navigateToMiniProgram({
					appId:Id,
					envVersion:'release',
					success(res) {
						console.log("成功打开了其他小程序");
					}
				});
	    	}
	    	else if(this.platform == "baidu")
	    	{
	    		swan.navigateToMiniProgram({
				    appKey: Id,
				    extraData: {},
				    success: (res) => {
				        console.log('百度跳转 success', res);
				    },
				    fail: (error) => {
				        console.log('百度跳转 fail', error);
				    }
				});
	    	}
	    	else if(this.platform == "tt")
	    	{
	    		tt.navigateToMiniProgram({
				    appId: Id,
				    extraData: {},
				    success: (res) => {
				        console.log(' success', res);
				    },
				    fail: (error) => {
				        console.log(' fail', error);
				    }
				});
	    	}
	    	else if(this.platform == "qg_oppo")
	    	{
	    		qg.navigateToMiniGame({
				    pkgName: pkgStr,
				    success: function(){
				    },
				    fail: function(res){
				        console.log(JSON.stringify(res));
				    }
				});
	    	}
	    },
    },
});
module.exports = PlatformController;
