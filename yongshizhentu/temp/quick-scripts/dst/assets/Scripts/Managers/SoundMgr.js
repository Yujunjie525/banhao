
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Managers/SoundMgr.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlcnNcXFNvdW5kTWdyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEI7QUFDOUIsNkNBQXlDO0FBQ25DLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBRTVDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUduQjtJQUFzQyw0QkFBWTtJQUFsRDtRQUFBLHFFQXFKQztRQWxKVyxnQkFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixpQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixtQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixrQkFBWSxHQUFXLENBQUMsQ0FBQztRQUV6QixjQUFRLEdBQW1CLElBQUksQ0FBQztRQUNoQyxlQUFTLEdBQTBCLEVBQUUsQ0FBQztRQUN0QyxZQUFNLEdBQVcsQ0FBQyxDQUFDOztJQTJJL0IsQ0FBQztpQkFySm9CLFFBQVE7SUFZekIseUJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxVQUFRLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEQsVUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDNUI7YUFDSTtZQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDekMsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FD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Q0FBQztJQUVELDZCQUFVLEdBQVY7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCw4QkFBVyxHQUFYLFVBQVksR0FBRztRQUNYLElBQUksQ0FBQyxrQkFBUyxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBQ2pDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxNQUFNLEVBQUcsQ0FBQztRQUNmLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxVQUFVLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDbkI7UUFFRCxFQUFFLENBQUMsSUFBSSxHQUFHLGdCQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO1lBQ1QsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2I7YUFDSTtZQUNELEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDN0M7SUFDTCxDQUFDOztJQW5KYSxpQkFBUSxHQUFhLElBQUksQ0FBQztJQUR2QixRQUFRO1FBRDVCLE9BQU87T0FDYSxRQUFRLENBcUo1QjtJQUFELGVBQUM7Q0FySkQsQUFxSkMsQ0FySnFDLEVBQUUsQ0FBQyxTQUFTLEdBcUpqRDtrQkFySm9CLFFBQVEiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVzTWdyIGZyb20gXCIuL1Jlc01nclwiO1xyXG5pbXBvcnQgbUdhbWVEYXRhIGZyb20gXCIuLi9Mb2FkL0dhbWVEYXRhXCI7XHJcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XHJcblxyXG52YXIgRUZGRUNUX05VTSA9IDg7XHJcblxyXG5AY2NjbGFzc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZE1nciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XHJcbiAgICBwdWJsaWMgc3RhdGljIEluc3RhbmNlOiBTb3VuZE1nciA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBtdXNpY19tdXRlOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBlZmZlY3RfbXV0ZTogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgZWZmZWN0X3ZvbHVtZTogbnVtYmVyID0gMTtcclxuICAgIHByaXZhdGUgbXVzaWNfdm9sdW1lOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIHByaXZhdGUgbXVzaWNfYXM6IGNjLkF1ZGlvU291cmNlID0gbnVsbDtcclxuICAgIHByaXZhdGUgZWZmZWN0X2FzOiBBcnJheTxjYy5BdWRpb1NvdXJjZT4gPSBbXTtcclxuICAgIHByaXZhdGUgY3VyX2FzOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIG9uTG9hZCgpIHtcclxuICAgICAgICBpZiAoIVNvdW5kTWdyLkluc3RhbmNlIHx8ICFjYy5pc1ZhbGlkKFNvdW5kTWdyLkluc3RhbmNlKSkge1xyXG4gICAgICAgICAgICBTb3VuZE1nci5JbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tdXNpY19hcyA9IHRoaXMubm9kZS5hZGRDb21wb25lbnQoY2MuQXVkaW9Tb3VyY2UpO1xyXG4gICAgICAgIHRoaXMubXVzaWNfYXMudm9sdW1lID0gdGhpcy5tdXNpY192b2x1bWU7XHJcbiAgICAgICAgaWYgKHRoaXMubXVzaWNfbXV0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljX2FzLnZvbHVtZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgRUZGRUNUX05VTTsgaSArKykge1xyXG4gICAgICAgICAgICB2YXIgYXMgPSB0aGlzLm5vZGUuYWRkQ29tcG9uZW50KGNjLkF1ZGlvU291cmNlKTtcclxuICAgICAgICAgICAgdGhpcy5lZmZlY3RfYXMucHVzaChhcyk7XHJcbiAgICAgICAgICAgIGFzLnZvbHVtZSA9IHRoaXMuZWZmZWN0X3ZvbHVtZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZWZmZWN0X211dGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGFzLnZvbHVtZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VyX2FzID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBvbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKFNvdW5kTWdyLkluc3RhbmNlID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgIFNvdW5kTWdyLkluc3RhbmNlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0X211c2ljX3ZvbHVtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tdXNpY192b2x1bWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0X211c2ljX3ZvbHVtZSh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMubXVzaWNfdm9sdW1lID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5tdXNpY19hcy52b2x1bWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXVzaWNfdm9sdW1lXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRfbXVzaWNfbXV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tdXNpY19tdXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldF9tdXNpY19tdXRlKGJfbXV0ZSkge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IChiX211dGUpID8gMSA6IDA7XHJcbiAgICAgICAgaWYgKHRoaXMubXVzaWNfbXV0ZSA9PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm11c2ljX211dGUgPSB2YWx1ZTtcclxuICAgICAgICAvLyB0aGlzLm11c2ljX2FzLm11dGUgPSBiX211dGU7XHJcbiAgICAgICAgaWYgKHRoaXMubXVzaWNfbXV0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLm11c2ljX2FzLnZvbHVtZSA9IDA7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tdXNpY19hcy52b2x1bWUgPSB0aGlzLm11c2ljX3ZvbHVtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm11c2ljX211dGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldF9lZmZlY3Rfdm9sdW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVmZmVjdF92b2x1bWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0X2VmZmVjdF92b2x1bWUodmFsdWUpIHtcclxuXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZWZmZWN0X2FzLmxlbmd0aDsgaSArKykge1xyXG4gICAgICAgICAgICB0aGlzLmVmZmVjdF9hc1tpXS52b2x1bWUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWZmZWN0X3ZvbHVtZSA9IHZhbHVlO1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImVmZmVjdF92b2x1bWVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldF9lZmZlY3RfbXV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lZmZlY3RfbXV0ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRfZWZmZWN0X211dGUoYl9tdXRlKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gKGJfbXV0ZSkgPyAxIDogMDtcclxuICAgICAgICBpZiAodGhpcy5lZmZlY3RfbXV0ZSA9PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5lZmZlY3RfYXMubGVuZ3RoOyBpICsrKSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZWZmZWN0X2FzW2ldLm11dGUgPSBiX211dGU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVmZmVjdF9tdXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVmZmVjdF9hc1tpXS52b2x1bWUgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lZmZlY3RfYXNbaV0udm9sdW1lID0gdGhpcy5lZmZlY3Rfdm9sdW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVmZmVjdF9tdXRlID0gdmFsdWU7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiZWZmZWN0X211dGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlfbXVzaWModXJsLCBsb29wKSB7XHJcbiAgICAgICAgaWYgKCFtR2FtZURhdGEuaXNCR01PbikgcmV0dXJuO1xyXG4gICAgICAgIGxvb3AgPSAobG9vcCkgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tdXNpY19hcy5sb29wID0gbG9vcDtcclxuICAgICAgICB0aGlzLm11c2ljX2FzLmNsaXAgPSBSZXNNZ3IuSW5zdGFuY2UuZ2V0QXNzZXQoXCJTb3VuZHNcIix1cmwpO1xyXG4gICAgICAgIGlmICh0aGlzLm11c2ljX2FzLmNsaXApIHtcclxuICAgICAgICAgICAgdGhpcy5tdXNpY19hcy5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjYy5lcnJvcihcIm11c2ljIGF1ZGlvIGNsaXAgbnVsbDogXCIsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0b3BfbXVzaWMoKSB7XHJcbiAgICAgICAgdGhpcy5tdXNpY19hcy5zdG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheV9lZmZlY3QodXJsKSB7XHJcbiAgICAgICAgaWYgKCFtR2FtZURhdGEuaXNTb3VuZE9uKSByZXR1cm47XHJcbiAgICAgICAgdmFyIGFzID0gdGhpcy5lZmZlY3RfYXNbdGhpcy5jdXJfYXNdO1xyXG4gICAgICAgIHRoaXMuY3VyX2FzICsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cl9hcyA+PSBFRkZFQ1RfTlVNKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyX2FzID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzLmNsaXAgPSBSZXNNZ3IuSW5zdGFuY2UuZ2V0QXNzZXQoXCJTb3VuZHNcIix1cmwpO1xyXG4gICAgICAgIGlmIChhcy5jbGlwKSB7XHJcbiAgICAgICAgICAgIGFzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNjLmVycm9yKFwiZWZmZWN0IGF1ZGlvIGNsaXAgbnVsbDogXCIsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==