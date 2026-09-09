
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/RankPanel.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcUmFua1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxJQUFBLEtBQXdCLEVBQUUsQ0FBQyxVQUFVLEVBQW5DLE9BQU8sYUFBQSxFQUFFLFFBQVEsY0FBa0IsQ0FBQztBQUc1QztJQUF1Qyw2QkFBWTtJQUFuRDtRQUFBLHFFQTRHQztRQXpHVyxVQUFJLEdBQVksSUFBSSxDQUFDO1FBR3JCLGtCQUFZLEdBQVksSUFBSSxDQUFDO1FBRzdCLGlCQUFXLEdBQVksSUFBSSxDQUFDOztJQW1HeEMsQ0FBQztJQWpHRyxxQkFBcUI7SUFDckIsd0NBQXdDO0lBT3hDLHFCQUFxQjtJQUNyQixnQ0FBZ0M7SUFFakMsNkNBQTZDO0lBRWxDLDBCQUFNLEdBQWhCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1FBRTFCLDhCQUE4QjtRQUM5QixzQkFBc0I7UUFDeEIsbUJBQW1CO1FBQ2pCLGdCQUFnQjtRQUNwQixxQkFBcUI7UUFDakIsMkJBQTJCO1FBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRCx1REFBdUQ7SUFHeEQsQ0FBQztJQUVTLDZCQUFTLEdBQW5CO1FBQ0ksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVNLHdCQUFJLEdBQVg7UUFDSyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ3ZCLHdEQUF3RDtRQUVyRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDekIsc0JBQXNCO1FBSXRCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVuQixDQUFDO0lBS00sd0JBQUksR0FBWDtRQUNJLHdCQUF3QjtRQUN4Qiw0QkFBNEI7UUFDNUIsU0FBUztRQUNULDhCQUE4QjtRQUM5QixJQUFJO1FBQ0osd0JBQXdCO1FBQ3hCLHVEQUF1RDtRQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDekIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssNEJBQVEsR0FBaEIsVUFBaUIsS0FBYTtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMxQixFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ1gsS0FBSyxFQUFFLFVBQVU7WUFDakIsS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBSUc7OztHQUdEO0lBQ0ssMkJBQU8sR0FBZixVQUFnQixLQUFhO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2hDLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDWCxLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ssMkJBQU8sR0FBZjtRQUNJLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDWCxLQUFLLEVBQUUsU0FBUztTQUNuQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBdkdEO1FBREMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7MkNBQ1c7SUFHN0I7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzttREFDbUI7SUFHckM7UUFEQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztrREFDa0I7SUFUbkIsU0FBUztRQUQ3QixPQUFPO09BQ2EsU0FBUyxDQTRHN0I7SUFBRCxnQkFBQztDQTVHRCxBQTRHQyxDQTVHc0MsRUFBRSxDQUFDLFNBQVMsR0E0R2xEO2tCQTVHb0IsU0FBUyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XHJcblxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSYW5rUGFuZWwgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xyXG5cclxuICAgIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgcHJpdmF0ZSBtYWluOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHByaXZhdGUgY2xvc2VCdG5Ob2RlOiBjYy5Ob2RlID0gbnVsbDtcclxuXHJcbiAgICBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIHByaXZhdGUgb3BlbkJ0bk5vZGU6IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcm9wZXJ0eShjYy5Ob2RlKVxyXG4gICAgLy8gcHJpdmF0ZSBvcGVuQnRuTm9kZTI6IGNjLk5vZGUgPSBudWxsO1xyXG5cclxuXHJcblxyXG5cclxuICBcclxuXHJcbiAgICAvLyBAcHJvcGVydHkoY2MuTm9kZSlcclxuICAgIC8vIHByaXZhdGUgb3ZlcjogY2MuTm9kZSA9IG51bGw7XHJcblxyXG4gICAvLyBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogUmFua1BhbmVsID0gbnVsbDtcclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Mb2FkKCkge1xyXG4gICAgICAgIHRoaXMubWFpbi5hY3RpdmUgPSBmYWxzZVxyXG4gICAgXHJcbiAgICAgIC8vICBSYW5rUGFuZWwuaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAvLyB0aGlzLnNldFNjb3JlKDEwMCk7XHJcbiAgICAvLyAgdGhpcy5nZXRSYW5rKCk7XHJcbiAgICAgIC8vICB0aGlzLmhpZGUoKTtcclxuICAvLyB0aGlzLm1haW4uekluZGV4PTJcclxuICAgICAgLy8gIHRoaXMub3Zlci5hY3RpdmU9ZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tYWluLmFjdGl2ZT1mYWxzZTtcclxuICAgICAgICB0aGlzLmNsb3NlQnRuTm9kZS5vbigndG91Y2hlbmQnLHRoaXMuaGlkZSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5vcGVuQnRuTm9kZS5vbigndG91Y2hlbmQnLCB0aGlzLnNob3csIHRoaXMpO1xyXG4gICAgIC8vICAgdGhpcy5vcGVuQnRuTm9kZTIub24oJ3RvdWNoZW5kJywgdGhpcy5zaG93LCB0aGlzKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZUJ0bk5vZGUub2ZmKCd0b3VjaGVuZCcsIHRoaXMuaGlkZSwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKSB7XHJcbiAgICAgICAgIGNjLmRpcmVjdG9yLnJlc3VtZSgpXHJcbiAgICAgIC8vICB0aGlzLm1haW4uZ2V0Q29tcG9uZW50KFwiUG9wRGlhbG9nQ3RybFwiKS5zaG93RGlhbG9nKClcclxuICAgICAgICAgXHJcbiAgICAgICAgIHRoaXMubWFpbi5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIC8vICB0aGlzLm1haW4uekluZGV4PTFcclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLmdldFJhbmsoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICBwdWJsaWMgaGlkZSgpIHtcclxuICAgICAgICAvLyBpZih0aGlzLm92ZXIuYWN0aXZlKXtcclxuICAgICAgICAvLyAgIHRoaXMub3Zlci5hY3RpdmU9ZmFsc2U7XHJcbiAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgLy8gICAgLy8gdGhpcy5vdmVyLmFjdGl2ZT10cnVlXHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vICBjYy5kaXJlY3Rvci5yZXN1bWUoKVxyXG4gICAgICAgIC8vIHRoaXMubWFpbi5nZXRDb21wb25lbnQoXCJQb3BEaWFsb2dDdHJsXCIpLmhpZGVEaWFsb2coKVxyXG4gICAgICAgdGhpcy5tYWluLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgY2MuZGlyZWN0b3IucGF1c2UoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u55So5oi355qE5YiG5pWwXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgcHVibGljICBzZXRTY29yZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCLkuIrkvKDliIbmlbDvvJpcIit2YWx1ZSlcclxuICAgICAgICB3eC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgIGV2ZW50OiAnc2V0U2NvcmUnLFxyXG4gICAgICAgICAgICBzY29yZTogdmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAqIOS/ruaUueWIhuaVsCDku7vmhI/loavlhplcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgIHVwU2NvcmUodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwi5oiR5LiK5Lyg5LqG5YiG5pWw5piv77ya77ya77ya77yaXCIrdmFsdWUpXHJcbiAgICAgICAgd3gucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICBldmVudDogJ3VwZGF0ZScsXHJcbiAgICAgICAgICAgIHNjb3JlOiB2YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5o6S6KGM5qacXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyAgZ2V0UmFuaygpIHtcclxuICAgICAgICB3eC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgIGV2ZW50OiAnZ2V0UmFuaydcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0iXX0=