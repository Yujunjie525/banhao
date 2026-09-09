var Global = require("Global");
// 声明 TipsWndManager 变量
var TipsWndManager;
var UIMgr = cc.Class({
    extends: cc.Component,

    properties: {
        uiRoot:cc.Node,

        signUIBox:cc.Prefab,
        shopUIBox:cc.Prefab,
        rankUIBox:cc.Prefab,
        settingUIBox:cc.Prefab,



        promptPre: cc.Prefab,

        MsNode:cc.Node,
        FkNode:cc.Node,

        moreGameBtn:cc.Node,

        moreGameNode:cc.Node,

        nativeAdNode:cc.Node,
        
        // 剧情弹窗节点
        Story_node: {
            default: null,
            type: cc.Node
        },
        // 剧情文本节点
        r_story: {
            default: null,
            type: cc.RichText
        },
        // 跳过按钮节点
        btn_jump: {
            default: null,
            type: cc.Node
        },
        
        // 九点退出游戏弹窗节点
        NO18Panel: {
            default: null,
            type: cc.Node
        },

        NO18tips_label: {
            default: null,
            type: cc.Node
        },

        NO18btn_qd: {
            default: null,
            type: cc.Node
        },
    },

    start(){
        if(cc.Mgr.PlatformController.platform == "qg_oppo"){
            if(qg.getSystemInfoSync().platformVersionCode < 1050)
            {
                this.MsNode.active = false;
                this.FkNode.active = false;
            }
            else
            {
                this.MsNode.active = true;
                this.FkNode.active = true;
            }

        }
        else{
            this.MsNode.active = false;
            this.FkNode.active = false;
        }

        this.moreGameBtn.active = false;
        if(cc.Mgr.PlatformController.platform == "qg_oppo")
        {
            this.moreGameBtn.active = true;
        }

        var self = this;
        cc.director.on("NativeAdOpen", function(data){
            console.log("原生广告信息收到了");
            self.openNativeAd(data);
        });
    },

    openNativeAd(param)
    {
        this.nativeAdNode.zIndex = 250;
        this.nativeAdNode.active = true;
        this.nativeAdNode.getComponent("NativeAd").showUI(param);     
    },

    colseNativeAd()
    {
        this.nativeAdNode.active = false;
    },

    onDestroy()
    {
        cc.director.off("NativeAdOpen");
    },

    openMoreGameNode:function(){
        this.moreGameNode.active = true;
    },

    closeMoreGameNode:function(){
        this.moreGameNode.active = false;
    },

    // 提示
    showPrompt:function(str) {
        var tipBox = cc.instantiate(this.promptPre)
        tipBox.y = -(this.node.height / 2 - tipBox.height / 2);
        tipBox.parent = this.node;
        tipBox.getComponent("tipBox").showDes(str);
        var act1 = cc.moveBy(0.2, 0, 150);
        var act2 = cc.moveBy(0.8, 0, 0);
        var act3 = cc.moveBy(0.2, 0, 150);
        var act4 = cc.fadeOut(0.2);
        tipBox.runAction(cc.sequence(act1, act2, cc.callFunc(() => {
            tipBox.runAction(cc.sequence(cc.spawn(act3, act4), cc.callFunc(() => {
                tipBox.destroy();
            })))
        })));
    },

    openRankUI:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.rankUI) {
            this.rankUI.active = true;
        } else {
            this.rankUI = cc.instantiate(this.rankUIBox);
            this.rankUI.parent = this.uiRoot;
        }
    },

    // 打开签到
    openSignUI:function() {
        cc.Mgr.AdsMgr.RecoverShowBanner();
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.signUI) {
            this.signUI.active = true;
            this.signUI.getComponent("sign").showPanel();
        } else {
            this.signUI = cc.instantiate(this.signUIBox);
            this.signUI.parent = this.uiRoot;
        }

    },

    // 打开设置
    openSettingUI:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.settingUI) {
            this.settingUI.active = true;
        } else {
            this.settingUI = cc.instantiate(this.settingUIBox);
            this.settingUI.parent = this.uiRoot;
        }
    },

    JumpAppMS:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.msxxl.nearme.gamecenter");
    },

    JumpAppFK:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.fkqgz.nearme.gamecenter");
    },

    JumpAppQB:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.qbtw.qh.gamecenter");
    },

    JumpAppZXC:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.creazybike.net.nearme.gamecenter");
    },

    JumpAppCG:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.xfs.qmcg.nearme.gamecenter");
    },

    JumpAppGC:function(){
        cc.Mgr.PlatformController.JumpToOtherApp("", "com.cszs.scqd.nearme.gamecenter");
    },

    //判定是否需要打开签到
    JudeAutoOpenSign:function(){
        var today = Global.getDate();
        if(today - Global.userData.lastSignTime >= 1)
        {
            this.signUI = cc.instantiate(this.signUIBox);
            this.signUI.parent = this.uiRoot;
        }
        // else
        // {
        //     if (this.shopUI) {
        //         this.shopUI.active = true;
        //         this.shopUI.getComponent('shop').gemLabel.string = Global.userData.gem;
        //     } else {
        //         this.shopUI = cc.instantiate(this.shopUIBox);
        //         this.shopUI.parent = this.uiRoot;
        //     }
        // }
    },

    // 打开商店
    openShopUI:function() {
        cc.Mgr.AdsMgr.ShowInsertAds(1);
        cc.Mgr.AdsMgr.RecoverShowBanner();
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.shopUI) {
            this.shopUI.active = true;
            this.shopUI.getComponent('shop').refreshGemLabel();
        } else {
            this.shopUI = cc.instantiate(this.shopUIBox);
            this.shopUI.parent = this.uiRoot;
        }
    },

    // 打开充值界面
    openChargeUI:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        if (this.chargeUI) {
            this.chargeUI.active = true;
            this.chargeUI.zIndex = 100;
            this.chargeUI.getComponent('charge').refreshGemLabel();
            return;
        }
        if (this.chargeUILoading) {
            return;
        }

        this.chargeUILoading = true;
        cc.loader.loadRes('prefab/charge', cc.Prefab, (err, prefab) => {
            this.chargeUILoading = false;
            if (err) {
                console.error('加载充值界面失败:', err);
                this.showPrompt('充值界面加载失败，请重试。');
                return;
            }
            this.chargeUI = cc.instantiate(prefab);
            this.chargeUI.parent = this.uiRoot;
            this.chargeUI.zIndex = 100;
        });
    },

    shareGame:function(){
        if(cc.Mgr.PlatformController.platform == "qg_oppo" || cc.Mgr.PlatformController.platform == "qg_vivo")
        {
            this.showPrompt("功能暂未开放");
            return;
        }
        cc.Mgr.AudioMgr.playSFX("click");
        var seed = Math.floor(Math.random() * 4);
        cc.Mgr.PlatformController.ShareToFriend(seed);
    },
    
    onLoad: function() {
        // 剧情弹窗相关属性初始化
        this.storyPopupShownKey = 'StoryPopupShown';
        this.storyLines = [];
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.textTimers = [];
        this.jumpButtonTimer = null;
        this.charInterval = 0.05; // 每个字符显示的间隔时间（秒）
        this.lineInterval = 1; // 每行显示完成后等待的时间（秒）
        
        // 防沉迷检查相关属性
        this.hasShownTimePopup = false;
        
        // 初始化 TipsWndManager
        this.initTipsWndManager();
        
        // 初始化心跳检测
        this.initHeartbeat();
        
        // 给NO18btn_qd节点添加点击事件
        if(this.NO18btn_qd){
            this.NO18btn_qd.on('touchend', this.onConfirmNo18, this);
        }
        this.NO18Panel.active = false;
    },
    
    /**
     * 初始化 TipsWndManager
     */
    initTipsWndManager: function() {
        // 只使用从模块导入的方式获取 TipsWndManager
        try {
            if (typeof require !== 'undefined') {
                const TipsWndModule = require('./Load/TipsWnd');
                if (TipsWndModule && TipsWndModule.default) {
                    TipsWndManager = TipsWndModule.default;
                    console.log('从模块导入获取 TipsWndManager成功');
                } else {
                    console.warn('TipsWnd 模块导入成功，但没有 default 属性');
                }
            } else {
                console.warn('require 未定义，无法导入 TipsWnd 模块');
            }
        } catch (e) {
            console.error('初始化 TipsWndManager 时出错:', e);
        }
    },
    
    /**
     * 检查剧情弹窗是否已显示
     * @returns 是否已显示
     */
    isStoryPopupShown: function() {
        const key = this.getKeyWithUserId(this.storyPopupShownKey);
        const value = cc.sys.localStorage.getItem(key);
        if (Global.userData && Global.userData.storyPopupShown === true) {
            return true;
        }

        if (value === 'true') {
            if (Global.userData) {
                Global.userData.storyPopupShown = true;
                Global.saveData();
            }
            return true;
        }

        return false;
    },
    
    /**
     * 生成带用户ID后缀的存储key
     * @param baseKey 基础key
     * @returns 带用户ID后缀的key
     */
    getKeyWithUserId: function(baseKey) {
        const userId = this.getUserId();
        if (userId) {
            return `${baseKey}_${userId}`;
        }
        return baseKey;
    },
    
    /**
     * 获取用户ID
     * @returns 用户ID
     */
    getUserId: function() {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return userId ? String(userId) : 'default';
    },
    
    /**
     * 初始化剧情弹窗
     */
    initStoryPopup: function() {
        // 显示剧情弹窗
        if(this.Story_node){
            this.Story_node.active = true;
        }
        
        // 初始化剧情文本数组
        this.storyLines = [
            "风沙卷着碎石掠过古老的石砖，头顶的岩壁正成片剥落，大地正在崩溃。",
            "“没时间犹豫了，勇士！”",
            "苍老的声音在遗迹的回廊里回荡，你脚下的平台正一寸寸碎裂。",
            "“抉择吧——是留在这里坐以待毙还是闯出一条生路？”",
            "脚下的石砖还在碎裂，是时候做出抉择：出发？还是留下？作为勇士的你一定会选择出发，那出发之后的方向就是等待你的其他抉择，选出你想走的路吧，一旦踏上征途，便再无回头路，稍有停留就会坠入万丈深渊。",
        ];
        
        // 重置当前行索引和字符索引
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        
        // 清空当前文本
        if(this.r_story){
            this.r_story.string = "";
        }
        
        // 开始逐行显示文本
        this.showNextLine();
        
        // 禁用跳过按钮
        if(this.btn_jump){
            this.btn_jump.active = false;
            // 3秒后启用跳过按钮
            this.jumpButtonTimer = setTimeout(()=>{
                this.btn_jump.active = true;
                this.btn_jump.on('touchend', this.skipStory, this);
            }, 3000); // setTimeout使用毫秒
        }
    },
    
    /**
     * 逐行逐字显示剧情文本
     */
    showNextLine: function(){
        if(this.currentLineIndex < this.storyLines.length && this.r_story){
            const currentLine = this.storyLines[this.currentLineIndex];
            
            if(this.currentCharIndex < currentLine.length){
                // 显示当前行的下一个字符
                this.r_story.string += currentLine.charAt(this.currentCharIndex);
                this.currentCharIndex++;
                
                // 调度显示下一个字符
                const timerId = setTimeout(() => {
                    this.showNextLine();
                }, this.charInterval * 1000); // setTimeout使用毫秒
                
                // 存储定时器ID，以便后续清除
                this.textTimers.push(timerId);
            } else {
                // 当前行显示完成，添加换行符（如果不是最后一行）
                if(this.currentLineIndex < this.storyLines.length - 1){
                    this.r_story.string += "<br/>";
                }
                
                // 重置字符索引，准备显示下一行
                this.currentCharIndex = 0;
                
                // 增加行索引
                this.currentLineIndex++;
                
                // 调度显示下一行
                if(this.currentLineIndex < this.storyLines.length){
                    const timerId = setTimeout(() => {
                        this.showNextLine();
                    }, this.lineInterval * 500); // setTimeout使用毫秒
                
                    // 存储定时器ID，以便后续清除
                    this.textTimers.push(timerId);
                } else {
                    // 所有文本显示完成，延迟1秒后自动开始游戏
                    const timerId = setTimeout(() => {
                        this.skipStory();
                    }, 1000);
                    this.textTimers.push(timerId);
                }
            }
        }
    },
    
    /**
     * 跳过剧情
     */
    skipStory: function(){
        // 清除所有JavaScript定时器
        this.textTimers.forEach(timerId => {
            clearTimeout(timerId);
        });
        this.textTimers = [];
        
        // 清除跳过按钮启用定时器
        if(this.jumpButtonTimer){
            clearTimeout(this.jumpButtonTimer);
            this.jumpButtonTimer = null;
        }
        
        // 隐藏剧情弹窗
        if(this.Story_node){
            this.Story_node.active = false;
        }
        
        // 移除跳过按钮的点击事件
        if(this.btn_jump){
            this.btn_jump.off('touchend', this.skipStory, this);
        }
        
        // 标记剧情弹窗已显示
        const key = this.getKeyWithUserId(this.storyPopupShownKey);
        cc.sys.localStorage.setItem(key, 'true');
        if (Global.userData) {
            Global.userData.storyPopupShown = true;
            Global.saveData();
        }
        
        // 自动进入游戏场景
        cc.Mgr.AdsMgr.HideBannerAd();
        cc.Mgr.AudioMgr.playSFX("click");
        cc.director.loadScene('Game');
    },
    
    /**
     * 发送心跳检测请求
     * @param appid 应用ID
     * @param username 用户名
     * @returns {Promise} 返回Promise对象
     */
    PostBreathe: function(appid, username) {
        const url = "https://pay.szvi-bo.com/v1/testapp/Breathe";  // 心跳检测接口
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error(`JSON解析错误: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP错误: ${xhr.status}`));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('网络请求失败'));
            };
            
            xhr.ontimeout = function() {
                reject(new Error('网络请求超时'));
            };
            
            xhr.send(JSON.stringify({ appid, username }));
        });
    },
    
    /**
     * 初始化心跳检测
     */
    initHeartbeat: function() {
        // 每5秒发送一次心跳检测
        this.schedule(this.sendHeartbeat, 5);
    },
    
    /**
     * 发送心跳检测
     */
    sendHeartbeat: function() {
        const appid = "app.yongshixunzhang1";
        const username = cc.sys.localStorage.getItem('SLS_USERNAME');
        
        this.PostBreathe(appid, username).then((result) => {
            console.log("心跳检测成功:", result);
            if (result.data && result.code === -1) {
                // 显示防沉迷提示面板
                if (this.NO18Panel) {
                    this.NO18Panel.active = true;
                    if (this.NO18tips_label) {
                        this.NO18tips_label.string = result.msg;
                    } else {
                        console.error('NO18tips_label节点未设置');
                    }
                } else {
                    console.error('NO18Panel节点未设置');
                }
                return;
            }
            // 处理防沉迷检查
            this.processAntiAddiction(result);
        }).catch((error) => {
            console.error("心跳检测失败:", error);
        });
    },
    
    /**
     * 处理防沉迷检查
     */
    processAntiAddiction: function(antiAddictionResult) {
        // 检查返回的时间是否到达二十点四十五分（仅未成年人检测）
        if (antiAddictionResult.data !== undefined && antiAddictionResult.data !== null) {
            // 读取年龄状态，仅未成年人执行检测
            const savedAgeStatus = cc.sys.localStorage.getItem('SLS_AGE_STATUS');
            if (savedAgeStatus !== '1') { // 1=成年人，其他=未成年人
                // 后端明确返回10位数数字时间戳，直接传递
                this.checkTimeAndShowPopup(antiAddictionResult.data);
            }
        }
    },
    
    /**
     * 防沉迷提示面板确定按钮点击事件
     */
    onConfirmNo18: function() {
        // 隐藏防沉迷提示面板
        if (this.NO18Panel) {
            this.NO18Panel.active = false;
        }
        
        // 清除用户登录状态，防止返回登录界面后自动登录
        cc.sys.localStorage.removeItem('SLS_USERNAME');
        cc.sys.localStorage.removeItem('SLS_PASSWORD');
        
        // 返回登录界面
        cc.director.loadScene('Load');
    },
    
    /**
     * 检查返回的时间是否到达二十点四十五分，如果到达则显示弹窗
     * @param timestamp 后端返回的10位数秒级时间戳
     */
    checkTimeAndShowPopup: function(timestamp) {
        try {
            // 后端确定返回的是10位数秒级时间戳，直接转换为毫秒级
            const milliseconds = timestamp * 1000;
            // 创建Date对象
            const date = new Date(milliseconds);
            
            const hours = date.getHours();
            const minutes = date.getMinutes();
            console.log(date, hours, minutes, "bbbbbbbbb");
            // 目标时间：二十点四十五分
            const targetHour = 20;
            const targetMinute = 45;
            
            // 超过二十点四十六分不再检查
            const endHour = 20;
            const endMinute = 46;
            
            // 如果时间超过二十点四十六分，直接返回
            if (hours > endHour || (hours === endHour && minutes > endMinute)) {
                console.log('时间已超过二十点四十六分，不再执行检查');
                return;
            }
            
            // 如果已经显示过弹窗，直接返回
            if (this.hasShownTimePopup) {
                console.log('已经显示过二十点四十五分弹窗，不再显示');
                return;
            }

            // 判断是否到达目标时间
            if (hours > targetHour || (hours === targetHour && minutes >= targetMinute)) {
                console.log('时间已到达二十点四十五分，显示弹窗');
                // 显示防沉迷弹窗
                try {
                    // 使用从模块导入的 TipsWndManager
                    if (TipsWndManager && TipsWndManager.show) {
                        // 直接调用静态方法
                        TipsWndManager.show('您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。');
                    } else {
                        throw new Error('TipsWndManager 未定义或没有 show 方法');
                    }
                } catch (e) {
                    console.error('使用 TipsWndManager 时出错:', e);
                    // 降级使用 showPrompt
                    this.showPrompt('您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。');
                }
                // 标记为已显示
                this.hasShownTimePopup = true;
            } else {
                console.log('时间尚未到达二十点四十五分');
            }
        } catch (error) {
            console.error('时间解析失败:', error);
        }
    },
});
module.exports = UIMgr;
