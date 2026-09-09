"use strict";
cc._RF.push(module, '5ec69uMSdZFX57EMsd4yjkp', 'RankPanel');
// Scripts/RankPanel.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var RankPanel = /** @class */ (function (_super) {
    __extends(RankPanel, _super);
    function RankPanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.main = null;
        _this.closeBtnNode = null;
        _this.openBtnNode = null;
        return _this;
    }
    // @property(cc.Node)
    // private openBtnNode2: cc.Node = null;
    // @property(cc.Node)
    // private over: cc.Node = null;
    // private static instance: RankPanel = null;
    RankPanel.prototype.onLoad = function () {
        this.main.active = false;
        //  RankPanel.instance = this;
        // this.setScore(100);
        //  this.getRank();
        //  this.hide();
        // this.main.zIndex=2
        //  this.over.active=false;
        this.main.active = false;
        this.closeBtnNode.on('touchend', this.hide, this);
        this.openBtnNode.on('touchend', this.show, this);
        //   this.openBtnNode2.on('touchend', this.show, this);
    };
    RankPanel.prototype.onDestroy = function () {
        this.closeBtnNode.off('touchend', this.hide, this);
    };
    RankPanel.prototype.show = function () {
        cc.director.resume();
        //  this.main.getComponent("PopDialogCtrl").showDialog()
        this.main.active = true;
        //  this.main.zIndex=1
        this.getRank();
    };
    RankPanel.prototype.hide = function () {
        // if(this.over.active){
        //   this.over.active=false;
        // }else{
        //    // this.over.active=true
        // }
        //  cc.director.resume()
        // this.main.getComponent("PopDialogCtrl").hideDialog()
        this.main.active = false;
        cc.director.pause();
    };
    /**
     * 设置用户的分数
     * @param value
     */
    RankPanel.prototype.setScore = function (value) {
        console.log("上传分数：" + value);
        wx.postMessage({
            event: 'setScore',
            score: value
        });
    };
    /**
 * 修改分数 任意填写
 * @param value
 */
    RankPanel.prototype.upScore = function (value) {
        console.log("我上传了分数是：：：：" + value);
        wx.postMessage({
            event: 'update',
            score: value
        });
    };
    /**
     * 获取排行榜
     */
    RankPanel.prototype.getRank = function () {
        wx.postMessage({
            event: 'getRank'
        });
    };
    __decorate([
        property(cc.Node)
    ], RankPanel.prototype, "main", void 0);
    __decorate([
        property(cc.Node)
    ], RankPanel.prototype, "closeBtnNode", void 0);
    __decorate([
        property(cc.Node)
    ], RankPanel.prototype, "openBtnNode", void 0);
    RankPanel = __decorate([
        ccclass
    ], RankPanel);
    return RankPanel;
}(cc.Component));
exports.default = RankPanel;

cc._RF.pop();