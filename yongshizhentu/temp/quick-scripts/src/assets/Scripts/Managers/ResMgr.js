"use strict";
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