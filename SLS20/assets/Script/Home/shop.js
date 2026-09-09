const Global = require('Global');
var skinItem = require("skinItem");
const { mGameData } = require('../GameData');
cc.Class({
    extends: cc.Component,

    properties: {
        gemLabel: cc.Label,

        content: cc.Node,

        selectNode: cc.Node,

        prompt: cc.Prefab,

        items:[skinItem],

        tipAdsNode:cc.Node,

        confirmUI: cc.Node, // 购买确认弹窗
        
        confirmType: 0, // 确认类型：1-角色购买，5-体力购买
    },

    closeTipAds:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        this.tipAdsNode.active = false;
    },

    useOnceByAds:function(){
        cc.Mgr.AudioMgr.playSFX("click");
        this.tipAdsNode.active = false;
        this.showPrompt('该角色只能通过钻石购买。');
    },

    closeBtn:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        this.node.active = false;
        // 保存一下数据
        Global.saveData();
    },
    
    // 显示购买确认弹窗
    showConfirmUI:function(type) {
        console.log("显示购买确认弹窗", type);
        this.confirmType = type;
        if(this.confirmUI) {
            this.confirmUI.active = true;
        }
    },
    
     cancelBuy:function() {
        if(this.confirmUI) {
            this.confirmUI.active = false;
        }
     },

    // 确认购买
    confirmBuy:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        if(this.confirmUI) {
            this.confirmUI.active = false;
        }
        
        // 根据确认类型执行购买逻辑
        switch (this.confirmType) {
            case 1:
                // 购买黄黄
                Global.userData.gem -= 4000;
                Global.userData.skin = 1;
                Global.userData.skinList.push(1);
                this.updataItemUI();
                break;
            case 2:
                // 购买绿绿
                Global.userData.gem -= 5000;
                Global.userData.skin = 2;
                Global.userData.skinList.push(2);
                this.updataItemUI();
                break;
            case 3:
                // 购买紫紫
                Global.userData.gem -= 6000;
                Global.userData.skin = 3;
                Global.userData.skinList.push(3);
                this.updataItemUI();
                break;
            case 4:
                // 购买橙橙
                Global.userData.gem -= 8000;
                Global.userData.skin = 4;
                Global.userData.skinList.push(4);
                this.updataItemUI();
                break;
            case 5:
                // 购买体力
                Global.userData.gem -= 100;
                mGameData.currentStamina = Math.min(mGameData.currentStamina + 10, mGameData.maxStamina);
                mGameData.SaveStaminaData();
                this.updataItemUI();
                this.showPrompt('购买成功，体力已增加10点。');
                if (Global.home && Global.home.UpdateStaminaLabel) {
                    Global.home.UpdateStaminaLabel();
                }
                break;
        }
    },
    
    // 取消购买
    cancelBuy:function() {
        cc.Mgr.AudioMgr.playSFX("click");
        if(this.confirmUI) {
            this.confirmUI.active = false;
        }
    },

    // 提示
    showPrompt:function(str) {
        let tipBox = cc.instantiate(this.prompt)
        tipBox.y = -(this.node.height / 2 - tipBox.height / 2);
        tipBox.parent = this.node;
        tipBox.getComponent("tipBox").showDes(str);
        var act1 = cc.moveBy(0.3, 0, 150);
        var act2 = cc.moveBy(0.5, 0, 0);
        var act3 = cc.moveBy(0.3, 0, 150);
        var act4 = cc.fadeOut(0.3);
        tipBox.runAction(cc.sequence(act1, act2, cc.callFunc(() => {
            tipBox.runAction(cc.sequence(cc.spawn(act3, act4), cc.callFunc(() => {
                tipBox.destroy();
            })))
        })));
    },

    // 选择按钮
    selectBtn:function(e, num) {
        // 对于体力购买项，先检查是否可购买
        if (Number(num) === 5) {
            const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
            const isGemEnough = Global.userData.gem >= 100;
            
            if (isStaminaFull || !isGemEnough) {
                // 不可购买，直接返回
                return;
            }
        }
        
        cc.Mgr.AudioMgr.playSFX("click");
        if (Global.userData.skin == Number(num))
        {
            var CnameList = ["蓝蓝", "黄黄", "绿绿", "紫紫", "橙橙"];
        
            //cc.log( CnameList[num] + "=================== " + Number(num));
            return this.showPrompt(CnameList[num]+'已经上阵就绪啦。');
        }
        
        switch (Number(num)) {
            case 0:
                Global.userData.skin = Number(num);
                this.updataItemUI();
                break;
            case 1:
                if (Global.userData.skinList.some(item => item == 1)) {
                    Global.userData.skin = Number(num);
                    this.updataItemUI();
                } else {
                    if (Global.userData.gem >= 4000) {
                        // 显示购买确认弹窗
                        this.showConfirmUI(1);
                    } else {
                        this.showPrompt('钻石不足，购买失败。');
                    }
                }
                break;
            case 2:
                if (Global.userData.skinList.some(item => item == 2)) {
                    Global.userData.skin = Number(num);
                    this.updataItemUI();
                } else {
                    if (Global.userData.gem >= 5000) {
                        // 显示购买确认弹窗
                        this.showConfirmUI(2);
                    } else {
                        this.showPrompt('钻石不足，购买失败。');
                    }
                }
                break;
            case 3:
                if (Global.userData.skinList.some(item => item == 3)) {
                    Global.userData.skin = Number(num);
                    this.updataItemUI();
                } else {
                    if (Global.userData.gem >= 6000) {
                        // 显示购买确认弹窗
                        this.showConfirmUI(3);
                    } else {
                        this.showPrompt('钻石不足，购买失败。');
                    }
                }
                break;
            case 4:
                if (Global.userData.skinList.some(item => item == 4)) {
                    Global.userData.skin = Number(num);
                    this.updataItemUI();
                } else {
                    if (Global.userData.gem >= 8000) {
                        // 显示购买确认弹窗
                        this.showConfirmUI(4);
                    } else {
                        this.showPrompt('钻石不足，购买失败。');
                    }
                }
                break;
            case 5:
                // 购买体力
                if (mGameData.currentStamina >= mGameData.maxStamina) {
                    this.showPrompt('体力已满，无需购买。');
                } else if (Global.userData.gem >= 100) {
                    // 显示购买确认弹窗
                    this.showConfirmUI(5);
                } else {
                    this.showPrompt('钻石不足，购买失败。');
                }
                break;
        }
    },

    // 更新视图
    formatGemCount:function(value) {
        const gemCount = Number(value) || 0;
        if (gemCount >= 100000000) {
            return (gemCount / 100000000).toFixed(1) + '\u4ebf';
        }
        if (gemCount >= 10000) {
            return (gemCount / 10000).toFixed(1) + '\u4e07';
        }
        return String(gemCount);
    },

    refreshGemLabel:function() {
        this.gemLabel.string = this.formatGemCount(Global.userData.gem);
    },

    updataItemUI:function() {
        this.refreshGemLabel();
        for (let i = 0; i < this.items.length; i++) {
            // 设置皮肤索引
            if (i < 5) { // 前5个是皮肤，第6个是体力购买
                this.items[i].skinIndex = i;
            }
            // 处理体力购买按钮（第六项商品）
            if (i === 5) {
                // 检查体力是否已满或钻石是否不足
                const isStaminaFull = mGameData.currentStamina >= mGameData.maxStamina;
                const isGemEnough = Global.userData.gem >= 100;
                
                // 如果体力已满或钻石不足，按钮置灰
                if (isStaminaFull || !isGemEnough) {
                    // 这里需要根据实际的按钮组件结构来设置置灰状态
                    // 假设每个 item 有一个按钮组件可以设置禁用状态
                    if (this.items[i] && this.items[i].node) {
                        const button = this.items[i].node.getComponent(cc.Button);
                        if (button) {
                            button.interactable = false;
                        }
                    }
                } else {
                    // 否则启用按钮
                    if (this.items[i] && this.items[i].node) {
                        const button = this.items[i].node.getComponent(cc.Button);
                        if (button) {
                            button.interactable = true;
                        }
                    }
                }
            } else {
                // 处理其他皮肤项
                // 先判断解锁
                if (Global.userData.skinList.some(item => item == i)) {
                    this.items[i].updateUIUnLock(true);
                } else {
                    this.items[i].updateUIUnLock(false);
                }

                // 再判断选中
                if (Global.userData.skin == i) {
                    this.selectNode.stopAllActions();
                    this.selectNode.runAction(cc.moveTo(0.2, this.items[i].node.x, this.items[i].node.y));
                    this.items[i].updateUIBeChoosed(true);
                    if(Global.gameInfo.gameScene == "home")
                        Global.home.skinSelect();
                } else {
                    this.items[i].updateUIBeChoosed(false);
                }
            }
        }
        // 保存数据
        Global.saveData();
    },

    AdsGetGem:function(){
        var self = this;
        cc.Mgr.AudioMgr.playSFX("click");
        if(cc.Mgr.Utils.GetSysTime() - Global.gameInfo.lastVideoTime <= 60)
        {
            this.showPrompt("广告资源尚未准备就绪。");
            return;
        }
        cc.Mgr.AdsMgr.ShowVideoAds(1, function(out){
            if(out == 0)
            {
                Global.userData.gem += 500;
                self.refreshGemLabel();
                Global.saveData();
                cc.Mgr.PlatformController.showToast("获得500钻石奖励。");
                self.showPrompt("获得500钻石奖励。");
            }
        });
    },

    onLoad() {
        if (this.tipAdsNode) {
            this.tipAdsNode.active = false;
        }
        this.updataItemUI();
    },
});
