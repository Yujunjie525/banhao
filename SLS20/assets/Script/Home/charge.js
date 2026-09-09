const Global = require('Global');
const TipsWndManager = require('../Load/TipsWnd').default;

const RECHARGE_CONFIG = {
    1: { price: 6, diamonds: 60 },
    2: { price: 30, diamonds: 300 },
    3: { price: 68, diamonds: 680 },
    4: { price: 198, diamonds: 1980 },
    5: { price: 328, diamonds: 3280 },
    6: { price: 648, diamonds: 6480 }
};
const DAILY_RECHARGE_LIMIT = 30;

cc.Class({
    extends: cc.Component,

    onLoad:function() {
        this.currentRechargeOption = null;
        this.isPaying = false;
        this.balanceLabel = this.findNodeByName(this.node, 'gem_num').getComponent(cc.Label);
        this.confirmPanel = this.findNodeByName(this.node, 'confirm_panel');
        this.confirmLabel = this.findNodeByName(this.confirmPanel, 'confirm_text').getComponent(cc.Label);

        this.bindTouch('btn_close', this.closeBtn);
        this.bindTouch('btn_cancel', this.cancelPurchase);
        this.bindTouch('btn_confirm', this.confirmPurchase);
        for (let i = 1; i <= 6; i++) {
            const button = this.findNodeByName(this.node, 'btn_' + i);
            if (button) {
                button.on(cc.Node.EventType.TOUCH_END, () => this.onRechargeBtnClick(i), this);
            }
        }

        this.confirmPanel.active = false;
        this.refreshGemLabel();
    },

    onEnable:function() {
        if (this.balanceLabel) {
            this.refreshGemLabel();
        }
    },

    findNodeByName:function(root, name) {
        if (!root) {
            return null;
        }
        if (root.name === name) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const result = this.findNodeByName(root.children[i], name);
            if (result) {
                return result;
            }
        }
        return null;
    },

    bindTouch:function(nodeName, handler) {
        const target = this.findNodeByName(this.node, nodeName);
        if (target) {
            target.on(cc.Node.EventType.TOUCH_END, handler, this);
        }
    },

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
        if (this.balanceLabel) {
            this.balanceLabel.string = this.formatGemCount(Global.userData.gem);
        }
    },

    getTodayKey:function() {
        const now = new Date();
        const month = ('0' + (now.getMonth() + 1)).slice(-2);
        const day = ('0' + now.getDate()).slice(-2);
        return now.getFullYear() + '-' + month + '-' + day;
    },

    getDailyRechargeCount:function() {
        const today = this.getTodayKey();
        if (!Global.userData.dailyRechargeDate || Global.userData.dailyRechargeDate !== today) {
            Global.userData.dailyRechargeDate = today;
            Global.userData.dailyRechargeCount = 0;
            Global.saveData(false);
        }
        return Math.max(0, Number(Global.userData.dailyRechargeCount) || 0);
    },

    recordRechargeSuccess:function() {
        Global.userData.dailyRechargeDate = this.getTodayKey();
        Global.userData.dailyRechargeCount = this.getDailyRechargeCount() + 1;
        Global.saveData();
    },

    closeBtn:function() {
        cc.Mgr.AudioMgr.playSFX('click');
        this.confirmPanel.active = false;
        this.node.active = false;
    },

    onRechargeBtnClick:function(buttonId) {
        cc.Mgr.AudioMgr.playSFX('click');
        this.currentRechargeOption = RECHARGE_CONFIG[buttonId];
        if (!this.currentRechargeOption) {
            return;
        }
        this.confirmLabel.string = '是否确认支付' + this.currentRechargeOption.price
            + '元人民币兑换' + this.currentRechargeOption.diamonds + '个钻石？';
        this.confirmPanel.active = true;
    },

    cancelPurchase:function() {
        cc.Mgr.AudioMgr.playSFX('click');
        this.currentRechargeOption = null;
        this.confirmPanel.active = false;
    },

    confirmPurchase:function() {
        if (!this.currentRechargeOption || this.isPaying) {
            return;
        }

        const username = Global.getUsername();
        if (!username) {
            this.showMessage('未获取到登录账号，请重新登录后再试。');
            return;
        }

        if (this.getDailyRechargeCount() >= DAILY_RECHARGE_LIMIT) {
            this.currentRechargeOption = null;
            this.confirmPanel.active = false;
            this.showMessage('今日充值次数已达上限。');
            return;
        }

        const option = this.currentRechargeOption;
        this.isPaying = true;
        this.confirmLabel.string = '正在处理，请稍候...';
        this.postPayDiamond(Global.cloudAppId, username, option.diamonds)
            .then((result) => {
                if (!result || result.code !== 0) {
                    throw new Error(result && result.msg ? result.msg : '充值失败');
                }
                Global.userData.gem += option.diamonds;
                this.recordRechargeSuccess();
                this.refreshGemLabel();
                if (Global.home && Global.home.UpdateGoldLabel) {
                    Global.home.UpdateGoldLabel(true);
                }
                this.currentRechargeOption = null;
                this.confirmPanel.active = false;
                this.showMessage('兑换成功！获得' + option.diamonds + '个钻石。');
            })
            .catch((error) => {
                console.error('充值过程中出错:', error);
                this.confirmPanel.active = false;
                TipsWndManager.show(error.message);
            })
            .then(() => {
                this.isPaying = false;
            });
    },

    postPayDiamond:function(appid, username, diamond) {
        return Global.requestCloudApi('PayDiamond', { appid, username, diamond });
    },

    showMessage:function(message) {
        if (Global.home && Global.home.uiMgr && Global.home.uiMgr.showPrompt) {
            Global.home.uiMgr.showPrompt(message);
        } else if (cc.Mgr.PlatformController && cc.Mgr.PlatformController.showToast) {
            cc.Mgr.PlatformController.showToast(message);
        }
    }
});
