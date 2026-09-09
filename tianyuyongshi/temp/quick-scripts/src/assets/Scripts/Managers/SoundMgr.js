"use strict";
cc._RF.push(module, 'e56b0Tore9O6pTEg3DgnLQC', 'SoundMgr');
// Scripts/Managers/SoundMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ResMgr_1 = require("./ResMgr");
var GameData_1 = require("../Load/GameData");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var EFFECT_NUM = 8;
var SoundMgr = /** @class */ (function (_super) {
    __extends(SoundMgr, _super);
    function SoundMgr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.music_mute = 0;
        _this.effect_mute = 0;
        _this.effect_volume = 1;
        _this.music_volume = 1;
        _this.music_as = null;
        _this.effect_as = [];
        _this.cur_as = 0;
        return _this;
    }
    SoundMgr_1 = SoundMgr;
    SoundMgr.prototype.onLoad = function () {
        if (!SoundMgr_1.Instance || !cc.isValid(SoundMgr_1.Instance)) {
            SoundMgr_1.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
        this.music_as = this.node.addComponent(cc.AudioSource);
        this.music_as.volume = this.music_volume;
        if (this.music_mute === 1) {
            this.music_as.volume = 0;
        }
        for (var i = 0; i < EFFECT_NUM; i++) {
            var as = this.node.addComponent(cc.AudioSource);
            this.effect_as.push(as);
            as.volume = this.effect_volume;
            if (this.effect_mute === 1) {
                as.volume = 0;
            }
        }
        this.cur_as = 0;
    };
    SoundMgr.prototype.onDestroy = function () {
        if (SoundMgr_1.Instance === this) {
            SoundMgr_1.Instance = null;
        }
    };
    SoundMgr.prototype.get_music_volume = function () {
        return this.music_volume;
    };
    SoundMgr.prototype.set_music_volume = function (value) {
        this.music_volume = value;
        this.music_as.volume = value;
        cc.sys.localStorage.setItem("music_volume", value);
    };
    SoundMgr.prototype.get_music_mute = function () {
        return this.music_mute;
    };
    SoundMgr.prototype.set_music_mute = function (b_mute) {
        var value = (b_mute) ? 1 : 0;
        if (this.music_mute == value) {
            return;
        }
        this.music_mute = value;
        // this.music_as.mute = b_mute;
        if (this.music_mute === 1) {
            this.music_as.volume = 0;
        }
        else {
            this.music_as.volume = this.music_volume;
        }
        cc.sys.localStorage.setItem("music_mute", value);
    };
    SoundMgr.prototype.get_effect_volume = function () {
        return this.effect_volume;
    };
    SoundMgr.prototype.set_effect_volume = function (value) {
        for (var i = 0; i < this.effect_as.length; i++) {
            this.effect_as[i].volume = value;
        }
        this.effect_volume = value;
        cc.sys.localStorage.setItem("effect_volume", value);
    };
    SoundMgr.prototype.get_effect_mute = function () {
        return this.effect_mute;
    };
    SoundMgr.prototype.set_effect_mute = function (b_mute) {
        var value = (b_mute) ? 1 : 0;
        if (this.effect_mute == value) {
            return;
        }
        for (var i = 0; i < this.effect_as.length; i++) {
            // this.effect_as[i].mute = b_mute;
            if (this.effect_mute === 1) {
                this.effect_as[i].volume = 0;
            }
            else {
                this.effect_as[i].volume = this.effect_volume;
            }
        }
        this.effect_mute = value;
        cc.sys.localStorage.setItem("effect_mute", value);
    };
    SoundMgr.prototype.play_music = function (url, loop) {
        if (!GameData_1.default.isBGMOn)
            return;
        loop = (loop) ? true : false;
        this.music_as.loop = loop;
        this.music_as.clip = ResMgr_1.default.Instance.getAsset("Sounds", url);
        if (this.music_as.clip) {
            this.music_as.play();
        }
        else {
            cc.error("music audio clip null: ", url);
        }
    };
    SoundMgr.prototype.stop_music = function () {
        this.music_as.stop();
    };
    SoundMgr.prototype.play_effect = function (url) {
        if (!GameData_1.default.isSoundOn)
            return;
        var as = this.effect_as[this.cur_as];
        this.cur_as++;
        if (this.cur_as >= EFFECT_NUM) {
            this.cur_as = 0;
        }
        as.clip = ResMgr_1.default.Instance.getAsset("Sounds", url);
        if (as.clip) {
            as.play();
        }
        else {
            cc.error("effect audio clip null: ", url);
        }
    };
    var SoundMgr_1;
    SoundMgr.Instance = null;
    SoundMgr = SoundMgr_1 = __decorate([
        ccclass
    ], SoundMgr);
    return SoundMgr;
}(cc.Component));
exports.default = SoundMgr;

cc._RF.pop();