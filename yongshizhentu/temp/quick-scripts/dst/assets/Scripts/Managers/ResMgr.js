
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/ResMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'f8583YU/v9IxpBQmOdxPiFN', 'ResMgr');
// Scripts/Managers/ResMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ResMgr = /** @class */ (function (_super) {
    __extends(ResMgr, _super);
    function ResMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.abBunds = {};
        _this.total = 0;
        _this.now = 0;
        _this.progressFunc = null;
        _this.endFunc = null;
        _this.nowAb = 0;
        _this.totalAb = 0;
        return _this;
    }
    ResMgr_1 = ResMgr;
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
    ResMgr.prototype.loadAssetsBundle = function (abName, endFunc) {
        var _this = this;
        cc.assetManager.loadBundle(abName, function (err, bundle) {
            if (err !== null) {
                console.log("[ResMgr]:Load AssetsBundle Error: " + abName);
                _this.abBunds[abName] = null;
            }
            else {
                console.log("[ResMgr]:Load AssetsBundle Success: " + abName);
                _this.abBunds[abName] = bundle;
            }
            if (endFunc) {
                endFunc();
            }
        });
    };
    ResMgr.prototype.onLoad = function () {
        if (ResMgr_1.Instance === null) {
            ResMgr_1.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
    };
    ResMgr.prototype.loadRes = function (abBundle, url, typeClasss) {
        var _this = this;
        abBundle.load(url, typeClasss, function (error, asset) {
            _this.now++;
            if (error) {
                console.log("load Res " + url + " error: " + error);
            }
            else {
                console.log("load Res " + url + " success!");
            }
            if (_this.progressFunc) {
                _this.progressFunc(_this.now, _this.total);
            }
            console.log(_this.now, _this.total);
            if (_this.now >= _this.total) {
                if (_this.endFunc !== null) {
                    _this.endFunc();
                }
            }
        });
    };
    ResMgr.prototype.getAsset = function (abName, resUrl) {
        var bondule = cc.assetManager.getBundle(abName);
        if (bondule === null) {
            console.log("[error]: " + abName + " AssetsBundle not loaded !!!");
            return null;
        }
        return bondule.get(resUrl);
    };
    ResMgr.prototype.getBundle = function (abName) {
        var bondule = cc.assetManager.getBundle(abName);
        if (bondule === null) {
            console.log("[error]: " + abName + " AssetsBundle not loaded !!!");
            return null;
        }
        return bondule;
    };
    ResMgr.prototype.releaseResPackage = function (resPkg) {
        for (var key in resPkg) {
            var urlSet = resPkg[key].urls;
            for (var i = 0; i < urlSet.length; i++) {
                cc.assetManager.releaseAsset(urlSet[i]);
            }
        }
    };
    ResMgr.prototype.loadAssetsInAssetsBundle = function (resPkg) {
        for (var key in resPkg) {
            var urlSet = resPkg[key].urls;
            var typeClass = resPkg[key].assetType;
            for (var i = 0; i < urlSet.length; i++) {
                this.loadRes(this.abBunds[key], urlSet[i], typeClass);
            }
        }
    };
    // { GUI: {assetType: cc.Prefab, urls: []}, }
    ResMgr.prototype.preloadResPackage = function (resPkg, progressFunc, endFunc) {
        var _this = this;
        this.total = 0;
        this.now = 0;
        this.totalAb = 0;
        this.nowAb = 0;
        this.progressFunc = progressFunc;
        this.endFunc = endFunc;
        for (var key in resPkg) { //获取所有AssetsBundle总个数 和文件总个数
            this.totalAb++;
            this.total += resPkg[key].urls.length;
        }
        for (var key in resPkg) {
            //先遍历AssetsBundle
            this.loadAssetsBundle(key, function () {
                //遍历里面的文件
                _this.nowAb++;
                if (_this.nowAb === _this.totalAb) {
                    _this.loadAssetsInAssetsBundle(resPkg);
                }
            });
        }
    };
    ResMgr.prototype.onDestroy = function () {
        if (ResMgr_1.Instance === this) {
            ResMgr_1.Instance = null;
        }
    };
    var ResMgr_1;
    ResMgr.Instance = null;
    ResMgr = ResMgr_1 = __decorate([
        ccclass
    ], ResMgr);
    return ResMgr;
}(cc.Component));
exports.default = ResMgr;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFJlc01nci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUFzQixFQUFFLENBQUMsVUFBVSxFQUFsQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWlCLENBQUM7QUFHMUM7SUFBb0MsMEJBQVk7SUFBaEQ7UUFBQSxxRUE0SkM7UUF6SlcsYUFBTyxHQUFRLEVBQUUsQ0FBQztRQUNsQixXQUFLLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLFNBQUcsR0FBVyxDQUFDLENBQUM7UUFDaEIsa0JBQVksR0FBYSxJQUFJLENBQUM7UUFDOUIsYUFBTyxHQUFhLElBQUksQ0FBQztRQUV6QixXQUFLLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLGFBQU8sR0FBVyxDQUFDLENBQUM7O0lBa0poQyxDQUFDO2VBNUpvQixNQUFNO0lBWXZCLDRCQUE0QjtJQUM1QixtREFBbUQ7SUFFbkQseUJBQXlCO0lBQ3pCLGdEQUFnRDtJQUVoRCx5QkFBeUI7SUFDekIsb0RBQW9EO0lBRXBELHlCQUF5QjtJQUN6QixtREFBbUQ7SUFFbkQsOEJBQThCO0lBQzlCLHVEQUF1RDtJQUUvQyxpQ0FBZ0IsR0FBeEIsVUFBeUIsTUFBYyxFQUFFLE9BQWlCO1FBQTFELGlCQWdCQztRQWRHLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFDLEdBQUcsRUFBRSxNQUFNO1lBQzNDLElBQUcsR0FBRyxLQUFLLElBQUksRUFBRTtnQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUMzRCxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQzthQUMvQjtpQkFDSTtnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUM3RCxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FB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Q2QsSUFBSSxLQUFJLENBQUMsS0FBSyxLQUFLLEtBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQzdCLEtBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDekM7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUVOO0lBQ0wsQ0FBQztJQUVELDBCQUFTLEdBQVQ7UUFDSSxJQUFJLFFBQU0sQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQzFCLFFBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQzFCO0lBQ0wsQ0FBQzs7SUExSmEsZUFBUSxHQUFXLElBQUksQ0FBQztJQURyQixNQUFNO1FBRDFCLE9BQU87T0FDYSxNQUFNLENBNEoxQjtJQUFELGFBQUM7Q0E1SkQsQUE0SkMsQ0E1Sm1DLEVBQUUsQ0FBQyxTQUFTLEdBNEovQztrQkE1Sm9CLE1BQU0iLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7Y2NjbGFzcywgcHJvcGVydHl9ID0gY2MuX2RlY29yYXRvcjtcclxuXHJcbkBjY2NsYXNzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc01nciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBSZXNNZ3IgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgYWJCdW5kczogYW55ID0ge307XHJcbiAgICBwcml2YXRlIHRvdGFsOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBub3c6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIHByb2dyZXNzRnVuYzogRnVuY3Rpb24gPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBlbmRGdW5jOiBGdW5jdGlvbiA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBub3dBYjogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgdG90YWxBYjogbnVtYmVyID0gMDtcclxuICAgIFxyXG4gICAgLy8gQHByb3BlcnR5KFtjYy5BdWRpb0NsaXBdKVxyXG4gICAgLy8gcHJpdmF0ZSBwcmVsb2FkU291bmRzOiBBcnJheTxjYy5BdWRpb0NsaXA+ID0gW107XHJcblxyXG4gICAgLy8gQHByb3BlcnR5KFtjYy5QcmVmYWJdKVxyXG4gICAgLy8gcHJpdmF0ZSBwcmVsb2FkU2NlbmVzOiBBcnJheTxjYy5QcmVmYWI+ID0gW107XHJcblxyXG4gICAgLy8gQHByb3BlcnR5KFtjYy5QcmVmYWJdKVxyXG4gICAgLy8gcHJpdmF0ZSBwcmVsb2FkQ2hhcmFjdG9yczogQXJyYXk8Y2MuUHJlZmFiPiA9IFtdO1xyXG5cclxuICAgIC8vIEBwcm9wZXJ0eShbY2MuUHJlZmFiXSlcclxuICAgIC8vIHByaXZhdGUgcHJlbG9hZFVJUHJlZmFiczogQXJyYXk8Y2MuUHJlZmFiPiA9IFtdO1xyXG5cclxuICAgIC8vIEBwcm9wZXJ0eShbY2MuU3ByaXRlQXRsYXNdKVxyXG4gICAgLy8gcHJpdmF0ZSBwcmVsb2FkVUlBdGFsYXM6IEFycmF5PGNjLlNwcml0ZUF0bGFzPiA9IFtdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGxvYWRBc3NldHNCdW5kbGUoYWJOYW1lOiBzdHJpbmcsIGVuZEZ1bmM6IEZ1bmN0aW9uKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkQnVuZGxlKGFiTmFtZSwgKGVyciwgYnVuZGxlKT0+e1xyXG4gICAgICAgICAgICBpZihlcnIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Jlc01ncl06TG9hZCBBc3NldHNCdW5kbGUgRXJyb3I6IFwiICsgYWJOYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWJCdW5kc1thYk5hbWVdID0gbnVsbDtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltSZXNNZ3JdOkxvYWQgQXNzZXRzQnVuZGxlIFN1Y2Nlc3M6IFwiICsgYWJOYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWJCdW5kc1thYk5hbWVdID0gYnVuZGxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGVuZEZ1bmMpIHtcclxuICAgICAgICAgICAgICAgIGVuZEZ1bmMoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvbkxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgaWYoUmVzTWdyLkluc3RhbmNlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIFJlc01nci5JbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBsb2FkUmVzKGFiQnVuZGxlLCB1cmwsIHR5cGVDbGFzc3MpOiB2b2lkIHtcclxuICAgICAgIFxyXG4gICAgICAgIGFiQnVuZGxlLmxvYWQodXJsLCB0eXBlQ2xhc3NzLCAoZXJyb3IsIGFzc2V0KT0+e1xyXG4gICAgICAgICAgICB0aGlzLm5vdyArKztcclxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImxvYWQgUmVzIFwiICsgdXJsICsgXCIgZXJyb3I6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsb2FkIFJlcyBcIiArIHVybCArIFwiIHN1Y2Nlc3MhXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9ncmVzc0Z1bmMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NGdW5jKHRoaXMubm93LCB0aGlzLnRvdGFsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5ub3csIHRoaXMudG90YWwpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ub3cgPj0gdGhpcy50b3RhbCkgeyAgIFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbmRGdW5jICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmRGdW5jKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QXNzZXQoYWJOYW1lOiBzdHJpbmcsIHJlc1VybDogc3RyaW5nKTogYW55IHtcclxuICAgICAgICB2YXIgYm9uZHVsZSA9IGNjLmFzc2V0TWFuYWdlci5nZXRCdW5kbGUoYWJOYW1lKTtcclxuICAgICAgICBpZiAoYm9uZHVsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltlcnJvcl06IFwiICsgYWJOYW1lICsgXCIgQXNzZXRzQnVuZGxlIG5vdCBsb2FkZWQgISEhXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGJvbmR1bGUuZ2V0KHJlc1VybCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBnZXRCdW5kbGUoYWJOYW1lOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgIHZhciBib25kdWxlID0gY2MuYXNzZXRNYW5hZ2VyLmdldEJ1bmRsZShhYk5hbWUpO1xyXG4gICAgICAgIGlmIChib25kdWxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW2Vycm9yXTogXCIgKyBhYk5hbWUgKyBcIiBBc3NldHNCdW5kbGUgbm90IGxvYWRlZCAhISFcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gYm9uZHVsZVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZWxlYXNlUmVzUGFja2FnZShyZXNQa2c6IG9iamVjdCkge1xyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHJlc1BrZykge1xyXG4gICAgICAgICAgICB2YXIgdXJsU2V0ID0gcmVzUGtnW2tleV0udXJscztcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHVybFNldC5sZW5ndGg7IGkgKyspIHtcclxuICAgICAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5yZWxlYXNlQXNzZXQodXJsU2V0W2ldKTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBsb2FkQXNzZXRzSW5Bc3NldHNCdW5kbGUocmVzUGtnKTogdm9pZCB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gcmVzUGtnKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmxTZXQgPSByZXNQa2dba2V5XS51cmxzO1xyXG4gICAgICAgICAgICB2YXIgdHlwZUNsYXNzID0gcmVzUGtnW2tleV0uYXNzZXRUeXBlO1xyXG5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB1cmxTZXQubGVuZ3RoOyBpICsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRSZXModGhpcy5hYkJ1bmRzW2tleV0sIHVybFNldFtpXSwgdHlwZUNsYXNzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB7IEdVSToge2Fzc2V0VHlwZTogY2MuUHJlZmFiLCB1cmxzOiBbXX0sIH1cclxuICAgIHB1YmxpYyBwcmVsb2FkUmVzUGFja2FnZShyZXNQa2csIHByb2dyZXNzRnVuYywgZW5kRnVuYyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudG90YWwgPSAwO1xyXG4gICAgICAgIHRoaXMubm93ID0gMDtcclxuICAgICAgICB0aGlzLnRvdGFsQWIgPSAwO1xyXG4gICAgICAgIHRoaXMubm93QWIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnByb2dyZXNzRnVuYyA9IHByb2dyZXNzRnVuYztcclxuICAgICAgICB0aGlzLmVuZEZ1bmMgPSBlbmRGdW5jO1xyXG5cclxuICAgICAgICBmb3IodmFyIGtleSBpbiByZXNQa2cpIHsvL+iOt+WPluaJgOaciUFzc2V0c0J1bmRsZeaAu+S4quaVsCDlkozmlofku7bmgLvkuKrmlbBcclxuICAgICAgICAgICAgdGhpcy50b3RhbEFiICsrO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsICs9IHJlc1BrZ1trZXldLnVybHMubGVuZ3RoOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHJlc1BrZykge1xyXG4gICAgICAgICAgICAvL+WFiOmBjeWOhkFzc2V0c0J1bmRsZVxyXG4gICAgICAgICAgICB0aGlzLmxvYWRBc3NldHNCdW5kbGUoa2V5LCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgLy/pgY3ljobph4zpnaLnmoTmlofku7ZcclxuICAgICAgICAgICAgICAgIHRoaXMubm93QWIgKys7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ub3dBYiA9PT0gdGhpcy50b3RhbEFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkQXNzZXRzSW5Bc3NldHNCdW5kbGUocmVzUGtnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKFJlc01nci5JbnN0YW5jZSA9PT0gdGhpcykge1xyXG4gICAgICAgICAgICBSZXNNZ3IuSW5zdGFuY2UgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=