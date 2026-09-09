
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Load/TipsManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '62b00W77fNC8JmzaoUNQ+D/', 'TipsManager');
// Scripts/Load/TipsManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ins;
var DEFAULT_TIPS_PREFAB_UUID = "a1554dd1-995f-4d8c-afbb-fc79a3012fa5";
var PERSIST_TIPS_NODE_NAME = "__GlobalTipsManager";
var TipsManager = /** @class */ (function (_super) {
    __extends(TipsManager, _super);
    function TipsManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //Tips预制体
        _this.TipsPrefab = null;
        //文本组件名
        _this.textComponentName = "tips_label";
        //背景图组件名
        _this.backgroundComponentName = "tips_bg";
        // 上一次显示Tips的时间
        _this.lastShowTime = 0;
        return _this;
    }
    TipsManager_1 = TipsManager;
    TipsManager.GetIns = function () {
        return ins;
    };
    TipsManager.prototype.onLoad = function () {
        ins = this;
        //将节点设置为常驻节点，确保在场景切换时不会被销毁
        // cc.game.addPersistRootNode(this.node);
    };
    TipsManager.isValidInstance = function (instance) {
        return !!(instance && instance.node && cc.isValid(instance.node));
    };
    TipsManager.ensureInstance = function () {
        if (TipsManager_1.isValidInstance(ins)) {
            ins.attachToCurrentCanvas();
            return ins;
        }
        ins = null;
        var node = new cc.Node(PERSIST_TIPS_NODE_NAME);
        var manager = node.addComponent(TipsManager_1);
        manager.attachToCurrentCanvas();
        ins = manager;
        return manager;
    };
    TipsManager.prototype.attachToCurrentCanvas = function () {
        if (!this.node || !cc.isValid(this.node)) {
            return;
        }
        var scene = cc.director.getScene();
        var canvas = scene ? scene.getChildByName("Canvas") : null;
        var targetParent = canvas || scene;
        if (targetParent && this.node.parent !== targetParent) {
            this.node.parent = targetParent;
        }
        this.node.setPosition(0, 0);
        this.node.zIndex = 10000;
    };
    TipsManager.prototype.start = function () {
    };
    // update (dt) {}
    TipsManager.prototype.loadDefaultTipsPrefab = function (callback) {
        var _this = this;
        if (this.TipsPrefab) {
            callback();
            return;
        }
        cc.loader.load({ uuid: DEFAULT_TIPS_PREFAB_UUID }, function (err, prefab) {
            if (err || !prefab) {
                console.warn("Load default TipsPrefab failed:", err);
                callback();
                return;
            }
            _this.TipsPrefab = prefab;
            callback();
        });
    };
    TipsManager.prototype.showFallbackTips = function (content, moveDistance, displayDuration) {
        if (!this.node || !cc.isValid(this.node)) {
            return;
        }
        var tipsNode = new cc.Node("Tips");
        this.node.addChild(tipsNode);
        tipsNode.setPosition(0, 0);
        tipsNode.zIndex = 10000;
        var bgNode = new cc.Node(this.backgroundComponentName);
        bgNode.opacity = 150;
        var bgWidth = Math.max(content.length * 20 + 60, 160);
        var bgHeight = 44;
        bgNode.setContentSize(bgWidth, bgHeight);
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = cc.Color.BLACK;
        bgGraphics.rect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
        bgGraphics.fill();
        tipsNode.addChild(bgNode);
        var labelNode = new cc.Node(this.textComponentName);
        var label = labelNode.addComponent(cc.Label);
        label.string = content;
        label.fontSize = 24;
        label.lineHeight = 30;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = cc.Color.WHITE;
        tipsNode.addChild(labelNode);
        var sequence = cc.sequence(cc.fadeIn(0.3), cc.delayTime(Math.max(displayDuration, 0.1)), cc.spawn(cc.moveBy(0.3, cc.v2(0, moveDistance)), cc.fadeOut(0.3)), cc.callFunc(function () { return tipsNode.destroy(); }));
        tipsNode.runAction(sequence);
    };
    /**
     * 显示Tips
     * @param content Tips内容
     * @param duration 显示总时长（秒），默认1.3秒（包含淡入0.3秒 + 显示0.7秒 + 淡出上移0.3秒）
     * @param moveDistance 上移距离，默认100
     * @param displayDuration 中间显示时长（秒），默认0.7秒（可单独设置，优先级高于duration）
     * @param cd 冷却时间（秒），默认0.5秒，在该时间内相同内容的Tips不会重复显示
     */
    TipsManager.prototype.showTips = function (content, duration, moveDistance, displayDuration, cd) {
        var _this = this;
        if (duration === void 0) { duration = 1.3; }
        if (moveDistance === void 0) { moveDistance = 100; }
        if (displayDuration === void 0) { displayDuration = 0.5; }
        if (cd === void 0) { cd = 0.5; }
        if (!this.node || !cc.isValid(this.node)) {
            TipsManager_1.show(content, duration, moveDistance, displayDuration, cd);
            return;
        }
        this.attachToCurrentCanvas();
        if (!this.TipsPrefab) {
            this.loadDefaultTipsPrefab(function () {
                if (_this.TipsPrefab) {
                    _this.showTips(content, duration, moveDistance, displayDuration, cd);
                }
                else {
                    _this.showFallbackTips(content, moveDistance, displayDuration);
                }
            });
            return;
        }
        // CD检查：防止短时间内重复显示相同内容的Tips
        var currentTime = Date.now();
        if (currentTime - this.lastShowTime < cd * 1000) {
            return;
        }
        this.lastShowTime = currentTime;
        //直接使用cc.instantiate创建Tips节点
        var tipsNode = cc.instantiate(this.TipsPrefab);
        //将Tips节点添加到当前节点
        this.node.addChild(tipsNode);
        //设置Tips节点位置在屏幕中央
        tipsNode.setPosition(0, 0);
        //设置Tips节点层级
        tipsNode.zIndex = 10000;
        //查找文本组件并设置内容
        var textComponent = tipsNode.getChildByName(this.textComponentName);
        if (textComponent) {
            var label = textComponent.getComponent(cc.Label);
            if (label) {
                label.string = content;
                //计算文本的实际宽度
                var textWidth = 0;
                label.overflow = cc.Label.Overflow.NONE; //确保不自动换行
                //使用类型断言避免TypeScript错误
                var anyLabel = label;
                var anyNode = label.node;
                //强制更新渲染数据
                if (anyNode._forceUpdateRenderData) {
                    anyNode._forceUpdateRenderData();
                }
                else if (anyLabel._forceUpdateRenderData) {
                    anyLabel._forceUpdateRenderData();
                }
                else {
                }
                //尝试多种方式获取文本宽度
                //方法1: getBoundingBox
                var bbWidth = anyNode.getBoundingBox().width;
                //方法2: getBoundingBoxToWorld
                var bbwWidth = anyNode.getBoundingBoxToWorld().width;
                //方法3: label._contentWidth
                var contentWidth = anyLabel._contentWidth || 0;
                //方法4: label._width
                var labelWidth = anyLabel._width || 0;
                //方法5: 估算宽度
                var estimatedWidth = content.length * label.fontSize * 0.5;
                //选择最大的有效宽度
                textWidth = Math.max(bbWidth, bbwWidth, contentWidth, labelWidth, estimatedWidth);
                //查找背景图组件并调整宽度
                var backgroundComponent = tipsNode.getChildByName(this.backgroundComponentName);
                if (backgroundComponent) {
                    //根据文本宽度调整背景图宽度，添加适当的边距
                    var padding = 40; //左右各20px边距
                    var minWidth = 100; //最小宽度
                    var newWidth = Math.max(textWidth + padding, minWidth);
                    //设置背景图新的宽度，保持高度不变
                    backgroundComponent.width = newWidth;
                    //如果需要，也可以调整背景图的缩放模式
                    var sprite = backgroundComponent.getComponent(cc.Sprite);
                    if (sprite) {
                        sprite.type = cc.Sprite.Type.SLICED;
                    }
                }
            }
            else {
                console.warn("Text component does not have cc.Label component!");
            }
        }
        else {
            console.warn("Text component not found in TipsPrefab!");
        }
        //创建动画序列
        var fadeIn = cc.fadeIn(0.3);
        //计算中间显示时长：优先使用displayDuration参数，如果未设置则从总时长中减去淡入淡出时间
        var actualDisplayDuration = displayDuration > 0 ? displayDuration : (duration - 0.6);
        //确保显示时长不会为负数
        actualDisplayDuration = Math.max(actualDisplayDuration, 0.1);
        var displayDelay = cc.delayTime(actualDisplayDuration);
        //上移动画和淡出动画同时进行（时长0.3秒）
        var moveUp = cc.moveBy(0.3, cc.v2(0, moveDistance));
        var fadeOut = cc.fadeOut(0.3);
        var moveAndFadeOut = cc.spawn(moveUp, fadeOut);
        var removeSelf = cc.callFunc(function () {
            //直接销毁节点
            tipsNode.destroy();
        });
        //执行动画
        var sequence = cc.sequence(fadeIn, //淡入（0.3秒）
        displayDelay, //中间显示时长（由displayDuration参数控制）
        moveAndFadeOut, //同时执行上移和淡出动画（0.3秒）
        removeSelf //销毁节点
        );
        // console.log(`Tips动画时间设置：总时长≈${0.3 + actualDisplayDuration + 0.3}秒（淡入0.3秒 + 显示${actualDisplayDuration}秒 + 淡出上移0.3秒）`);
        tipsNode.runAction(sequence);
    };
    /**
     * 全局静态方法，方便其他类直接调用
     * @param content Tips内容
     * @param duration 显示总时长（秒），默认1.3秒
     * @param moveDistance 上移距离，默认100
     * @param displayDuration 中间显示时长（秒），默认0.7秒（可单独设置，优先级高于duration）
     * @param cd 冷却时间（秒），默认0.5秒，在该时间内相同内容的Tips不会重复显示
     */
    TipsManager.show = function (content, duration, moveDistance, displayDuration, cd) {
        if (duration === void 0) { duration = 1.3; }
        if (moveDistance === void 0) { moveDistance = 100; }
        if (displayDuration === void 0) { displayDuration = 0.5; }
        if (cd === void 0) { cd = 0.5; }
        TipsManager_1.ensureInstance().showTips(content, duration, moveDistance, displayDuration, cd);
    };
    /**
     * 静态方法：计算文本宽度
     * 不需要挂在节点上也能调用，用于调整背景图长度
     * @param content 文本内容
     * @param fontName 字体名称
     * @param fontSize 字体大小
     * @param lineHeight 行高
     * @returns 文本宽度
     */
    TipsManager.calculateTextWidth = function (content, fontName, fontSize, lineHeight) {
        if (fontName === void 0) { fontName = ""; }
        if (fontSize === void 0) { fontSize = 20; }
        if (lineHeight === void 0) { lineHeight = 24; }
        //创建一个临时节点
        var tempNode = new cc.Node();
        //添加Label组件
        var label = tempNode.addComponent(cc.Label);
        //设置文本内容和样式
        label.string = content;
        if (fontName) {
            label.font = cc.loader.getRes(fontName, cc.Font);
        }
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        //获取文本宽度 - 使用boundingBox方法获取
        var textWidth = label.node.getBoundingBox().width;
        //销毁临时节点
        tempNode.destroy();
        return textWidth;
    };
    /**
     * 静态方法：调整背景图长度以适应文本
     * 不需要挂在节点上也能调用
     * @param backgroundNode 背景图节点
     * @param textContent 文本内容
     * @param fontName 字体名称
     * @param fontSize 字体大小
     * @param lineHeight 行高
     * @param padding 边距
     */
    TipsManager.adjustBackgroundToText = function (backgroundNode, textContent, fontName, fontSize, lineHeight, padding) {
        if (fontName === void 0) { fontName = ""; }
        if (fontSize === void 0) { fontSize = 20; }
        if (lineHeight === void 0) { lineHeight = 24; }
        if (padding === void 0) { padding = 20; }
        if (!backgroundNode) {
            console.error("Background node is null!");
            return;
        }
        //计算文本宽度
        var textWidth = this.calculateTextWidth(textContent, fontName, fontSize, lineHeight);
        //调整背景图宽度
        var newWidth = textWidth + padding;
        backgroundNode.width = newWidth;
        //确保背景图使用SLICED模式以正确拉伸
        var sprite = backgroundNode.getComponent(cc.Sprite);
        if (sprite) {
            sprite.type = cc.Sprite.Type.SLICED;
        }
    };
    var TipsManager_1;
    __decorate([
        property(cc.Prefab)
    ], TipsManager.prototype, "TipsPrefab", void 0);
    TipsManager = TipsManager_1 = __decorate([
        ccclass
    ], TipsManager);
    return TipsManager;
}(cc.Component));
exports.default = TipsManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTG9hZFxcVGlwc01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUNNLElBQUEsS0FBc0IsRUFBRSxDQUFDLFVBQVUsRUFBbEMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFpQixDQUFDO0FBRTFDLElBQUksR0FBRyxDQUFDO0FBQ1IsSUFBTSx3QkFBd0IsR0FBRyxzQ0FBc0MsQ0FBQztBQUN4RSxJQUFNLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDO0FBR3JEO0lBQXlDLCtCQUFZO0lBQXJEO1FBQUEscUVBMlVDO1FBMVVHLFNBQVM7UUFFVCxnQkFBVSxHQUFjLElBQUksQ0FBQztRQUM3QixPQUFPO1FBQ1AsdUJBQWlCLEdBQVcsWUFBWSxDQUFDO1FBQ3pDLFFBQVE7UUFDUiw2QkFBdUIsR0FBVyxTQUFTLENBQUM7UUFFNUMsZUFBZTtRQUNQLGtCQUFZLEdBQVcsQ0FBQyxDQUFDOztJQWlVckMsQ0FBQztvQkEzVW9CLFdBQVc7SUFZckIsa0JBQU0sR0FBYjtRQUNJLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELDRCQUFNLEdBQU47UUFDSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ1gsMEJBQTBCO1FBQzFCLHlDQUF5QztJQUM3QyxDQUFDO0lBRWMsMkJBQWUsR0FBOUIsVUFBK0IsUUFBcUI7UUFDaEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFYywwQkFBYyxHQUE3QjtRQUNJLElBQUksYUFBVyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM1QixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBRUQsR0FBRyxHQUFHLElBQUksQ0FBQztRQUNYLElBQU0s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QUFDLEtBQUssR0FBRyxRQUFRLENBQUM7UUFFaEMsc0JBQXNCO1FBQ3RCLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDdkM7SUFDTCxDQUFDOztJQXZVRDtRQURDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO21EQUNTO0lBSFosV0FBVztRQUQvQixPQUFPO09BQ2EsV0FBVyxDQTJVL0I7SUFBRCxrQkFBQztDQTNVRCxBQTJVQyxDQTNVd0MsRUFBRSxDQUFDLFNBQVMsR0EyVXBEO2tCQTNVb0IsV0FBVyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3Qge2NjY2xhc3MsIHByb3BlcnR5fSA9IGNjLl9kZWNvcmF0b3I7XG5cbnZhciBpbnM7XG5jb25zdCBERUZBVUxUX1RJUFNfUFJFRkFCX1VVSUQgPSBcImExNTU0ZGQxLTk5NWYtNGQ4Yy1hZmJiLWZjNzlhMzAxMmZhNVwiO1xuY29uc3QgUEVSU0lTVF9USVBTX05PREVfTkFNRSA9IFwiX19HbG9iYWxUaXBzTWFuYWdlclwiO1xuXG5AY2NjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGlwc01hbmFnZXIgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuICAgIC8vVGlwc+mihOWItuS9k1xuICAgIEBwcm9wZXJ0eShjYy5QcmVmYWIpXG4gICAgVGlwc1ByZWZhYjogY2MuUHJlZmFiID0gbnVsbDtcbiAgICAvL+aWh+acrOe7hOS7tuWQjVxuICAgIHRleHRDb21wb25lbnROYW1lOiBzdHJpbmcgPSBcInRpcHNfbGFiZWxcIjtcbiAgICAvL+iDjOaZr+Wbvue7hOS7tuWQjVxuICAgIGJhY2tncm91bmRDb21wb25lbnROYW1lOiBzdHJpbmcgPSBcInRpcHNfYmdcIjtcbiAgICBcbiAgICAvLyDkuIrkuIDmrKHmmL7npLpUaXBz55qE5pe26Ze0XG4gICAgcHJpdmF0ZSBsYXN0U2hvd1RpbWU6IG51bWJlciA9IDA7XG4gICAgXG4gICAgc3RhdGljIEdldElucygpe1xuICAgICAgICByZXR1cm4gaW5zO1xuICAgIH1cbiAgICBcbiAgICBvbkxvYWQgKCkge1xuICAgICAgICBpbnMgPSB0aGlzO1xuICAgICAgICAvL+WwhuiKgueCueiuvue9ruS4uuW4uOmpu+iKgueCue+8jOehruS/neWcqOWcuuaZr+WIh+aNouaXtuS4jeS8muiiq+mUgOavgVxuICAgICAgICAvLyBjYy5nYW1lLmFkZFBlcnNpc3RSb290Tm9kZSh0aGlzLm5vZGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGlzVmFsaWRJbnN0YW5jZShpbnN0YW5jZTogVGlwc01hbmFnZXIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhKGluc3RhbmNlICYmIGluc3RhbmNlLm5vZGUgJiYgY2MuaXNWYWxpZChpbnN0YW5jZS5ub2RlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZW5zdXJlSW5zdGFuY2UoKTogVGlwc01hbmFnZXIge1xuICAgICAgICBpZiAoVGlwc01hbmFnZXIuaXNWYWxpZEluc3RhbmNlKGlucykpIHtcbiAgICAgICAgICAgIGlucy5hdHRhY2hUb0N1cnJlbnRDYW52YXMoKTtcbiAgICAgICAgICAgIHJldHVybiBpbnM7XG4gICAgICAgIH1cblxuICAgICAgICBpbnMgPSBudWxsO1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IGNjLk5vZGUoUEVSU0lTVF9USVBTX05PREVfTkFNRSk7XG4gICAgICAgIGNvbnN0IG1hbmFnZXIgPSBub2RlLmFkZENvbXBvbmVudChUaXBzTWFuYWdlcik7XG4gICAgICAgIG1hbmFnZXIuYXR0YWNoVG9DdXJyZW50Q2FudmFzKCk7XG4gICAgICAgIGlucyA9IG1hbmFnZXI7XG4gICAgICAgIHJldHVybiBtYW5hZ2VyO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXR0YWNoVG9DdXJyZW50Q2FudmFzKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhY2MuaXNWYWxpZCh0aGlzLm5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2VuZSA9IGNjLmRpcmVjdG9yLmdldFNjZW5lKCk7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IHNjZW5lID8gc2NlbmUuZ2V0Q2hpbGRCeU5hbWUoXCJDYW52YXNcIikgOiBudWxsO1xuICAgICAgICBjb25zdCB0YXJnZXRQYXJlbnQgPSBjYW52YXMgfHwgc2NlbmU7XG4gICAgICAgIGlmICh0YXJnZXRQYXJlbnQgJiYgdGhpcy5ub2RlLnBhcmVudCAhPT0gdGFyZ2V0UGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50ID0gdGFyZ2V0UGFyZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICB0aGlzLm5vZGUuekluZGV4ID0gMTAwMDA7XG4gICAgfVxuICAgIFxuICAgIHN0YXJ0ICgpIHtcbiAgICB9XG4gICAgXG4gICAgLy8gdXBkYXRlIChkdCkge31cblxuICAgIHByaXZhdGUgbG9hZERlZmF1bHRUaXBzUHJlZmFiKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLlRpcHNQcmVmYWIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYy5sb2FkZXIubG9hZCh7IHV1aWQ6IERFRkFVTFRfVElQU19QUkVGQUJfVVVJRCB9LCAoZXJyOiBhbnksIHByZWZhYjogY2MuUHJlZmFiKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyIHx8ICFwcmVmYWIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJMb2FkIGRlZmF1bHQgVGlwc1ByZWZhYiBmYWlsZWQ6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuVGlwc1ByZWZhYiA9IHByZWZhYjtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd0ZhbGxiYWNrVGlwcyhjb250ZW50OiBzdHJpbmcsIG1vdmVEaXN0YW5jZTogbnVtYmVyLCBkaXNwbGF5RHVyYXRpb246IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhY2MuaXNWYWxpZCh0aGlzLm5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aXBzTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGlwc1wiKTtcbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKHRpcHNOb2RlKTtcbiAgICAgICAgdGlwc05vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHRpcHNOb2RlLnpJbmRleCA9IDEwMDAwO1xuXG4gICAgICAgIGNvbnN0IGJnTm9kZSA9IG5ldyBjYy5Ob2RlKHRoaXMuYmFja2dyb3VuZENvbXBvbmVudE5hbWUpO1xuICAgICAgICBiZ05vZGUub3BhY2l0eSA9IDE1MDtcbiAgICAgICAgY29uc3QgYmdXaWR0aCA9IE1hdGgubWF4KGNvbnRlbnQubGVuZ3RoICogMjAgKyA2MCwgMTYwKTtcbiAgICAgICAgY29uc3QgYmdIZWlnaHQgPSA0NDtcbiAgICAgICAgYmdOb2RlLnNldENvbnRlbnRTaXplKGJnV2lkdGgsIGJnSGVpZ2h0KTtcbiAgICAgICAgY29uc3QgYmdHcmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBiZ0dyYXBoaWNzLmZpbGxDb2xvciA9IGNjLkNvbG9yLkJMQUNLO1xuICAgICAgICBiZ0dyYXBoaWNzLnJlY3QoLWJnV2lkdGggLyAyLCAtYmdIZWlnaHQgLyAyLCBiZ1dpZHRoLCBiZ0hlaWdodCk7XG4gICAgICAgIGJnR3JhcGhpY3MuZmlsbCgpO1xuICAgICAgICB0aXBzTm9kZS5hZGRDaGlsZChiZ05vZGUpO1xuXG4gICAgICAgIGNvbnN0IGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKHRoaXMudGV4dENvbXBvbmVudE5hbWUpO1xuICAgICAgICBjb25zdCBsYWJlbCA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSBjb250ZW50O1xuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDI0O1xuICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gMzA7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbGFiZWxOb2RlLmNvbG9yID0gY2MuQ29sb3IuV0hJVEU7XG4gICAgICAgIHRpcHNOb2RlLmFkZENoaWxkKGxhYmVsTm9kZSk7XG5cbiAgICAgICAgY29uc3Qgc2VxdWVuY2UgPSBjYy5zZXF1ZW5jZShcbiAgICAgICAgICAgIGNjLmZhZGVJbigwLjMpLFxuICAgICAgICAgICAgY2MuZGVsYXlUaW1lKE1hdGgubWF4KGRpc3BsYXlEdXJhdGlvbiwgMC4xKSksXG4gICAgICAgICAgICBjYy5zcGF3bihjYy5tb3ZlQnkoMC4zLCBjYy52MigwLCBtb3ZlRGlzdGFuY2UpKSwgY2MuZmFkZU91dCgwLjMpKSxcbiAgICAgICAgICAgIGNjLmNhbGxGdW5jKCgpID0+IHRpcHNOb2RlLmRlc3Ryb3koKSlcbiAgICAgICAgKTtcbiAgICAgICAgdGlwc05vZGUucnVuQWN0aW9uKHNlcXVlbmNlKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog5pi+56S6VGlwc1xuICAgICAqIEBwYXJhbSBjb250ZW50IFRpcHPlhoXlrrlcbiAgICAgKiBAcGFyYW0gZHVyYXRpb24g5pi+56S65oC75pe26ZW/77yI56eS77yJ77yM6buY6K6kMS4z56eS77yI5YyF5ZCr5reh5YWlMC4z56eSICsg5pi+56S6MC4356eSICsg5reh5Ye65LiK56e7MC4z56eS77yJXG4gICAgICogQHBhcmFtIG1vdmVEaXN0YW5jZSDkuIrnp7vot53nprvvvIzpu5jorqQxMDBcbiAgICAgKiBAcGFyYW0gZGlzcGxheUR1cmF0aW9uIOS4remXtOaYvuekuuaXtumVv++8iOenku+8ie+8jOm7mOiupDAuN+enku+8iOWPr+WNleeLrOiuvue9ru+8jOS8mOWFiOe6p+mrmOS6jmR1cmF0aW9u77yJXG4gICAgICogQHBhcmFtIGNkIOWGt+WNtOaXtumXtO+8iOenku+8ie+8jOm7mOiupDAuNeenku+8jOWcqOivpeaXtumXtOWGheebuOWQjOWGheWuueeahFRpcHPkuI3kvJrph43lpI3mmL7npLpcbiAgICAgKi9cbiAgICBzaG93VGlwcyhjb250ZW50OiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXIgPSAxLjMsIG1vdmVEaXN0YW5jZTogbnVtYmVyID0gMTAwLCBkaXNwbGF5RHVyYXRpb246IG51bWJlciA9IDAuNSwgY2Q6IG51bWJlciA9IDAuNSkge1xuICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhY2MuaXNWYWxpZCh0aGlzLm5vZGUpKSB7XG4gICAgICAgICAgICBUaXBzTWFuYWdlci5zaG93KGNvbnRlbnQsIGR1cmF0aW9uLCBtb3ZlRGlzdGFuY2UsIGRpc3BsYXlEdXJhdGlvbiwgY2QpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hdHRhY2hUb0N1cnJlbnRDYW52YXMoKTtcblxuICAgICAgICBpZiAoIXRoaXMuVGlwc1ByZWZhYikge1xuICAgICAgICAgICAgdGhpcy5sb2FkRGVmYXVsdFRpcHNQcmVmYWIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLlRpcHNQcmVmYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93VGlwcyhjb250ZW50LCBkdXJhdGlvbiwgbW92ZURpc3RhbmNlLCBkaXNwbGF5RHVyYXRpb24sIGNkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dGYWxsYmFja1RpcHMoY29udGVudCwgbW92ZURpc3RhbmNlLCBkaXNwbGF5RHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDROajgOafpe+8mumYsuatouefreaXtumXtOWGhemHjeWkjeaYvuekuuebuOWQjOWGheWuueeahFRpcHNcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAoY3VycmVudFRpbWUgLSB0aGlzLmxhc3RTaG93VGltZSA8IGNkICogMTAwMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFNob3dUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgIFxuICAgICAgICAvL+ebtOaOpeS9v+eUqGNjLmluc3RhbnRpYXRl5Yib5bu6VGlwc+iKgueCuVxuICAgICAgICBsZXQgdGlwc05vZGUgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLlRpcHNQcmVmYWIpO1xuICAgICAgICAvL+WwhlRpcHPoioLngrnmt7vliqDliLDlvZPliY3oioLngrlcbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKHRpcHNOb2RlKTtcbiAgICAgICAgLy/orr7nva5UaXBz6IqC54K55L2N572u5Zyo5bGP5bmV5Lit5aSuXG4gICAgICAgIHRpcHNOb2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICAvL+iuvue9rlRpcHPoioLngrnlsYLnuqdcbiAgICAgICAgdGlwc05vZGUuekluZGV4ID0gMTAwMDA7XG4gICAgICAgIFxuICAgICAgICAvL+afpeaJvuaWh+acrOe7hOS7tuW5tuiuvue9ruWGheWuuVxuICAgICAgICBsZXQgdGV4dENvbXBvbmVudCA9IHRpcHNOb2RlLmdldENoaWxkQnlOYW1lKHRoaXMudGV4dENvbXBvbmVudE5hbWUpO1xuICAgICAgICBpZiAodGV4dENvbXBvbmVudCkge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gdGV4dENvbXBvbmVudC5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gY29udGVudDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL+iuoeeul+aWh+acrOeahOWunumZheWuveW6plxuICAgICAgICAgICAgICAgIGxldCB0ZXh0V2lkdGggPSAwO1xuICAgICAgICAgICAgICAgIGxhYmVsLm92ZXJmbG93ID0gY2MuTGFiZWwuT3ZlcmZsb3cuTk9ORTsgLy/noa7kv53kuI3oh6rliqjmjaLooYxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL+S9v+eUqOexu+Wei+aWreiogOmBv+WFjVR5cGVTY3JpcHTplJnor69cbiAgICAgICAgICAgICAgICBjb25zdCBhbnlMYWJlbCA9IGxhYmVsIGFzIGFueTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbnlOb2RlID0gbGFiZWwubm9kZSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy/lvLrliLbmm7TmlrDmuLLmn5PmlbDmja5cbiAgICAgICAgICAgICAgICBpZiAoYW55Tm9kZS5fZm9yY2VVcGRhdGVSZW5kZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGFueU5vZGUuX2ZvcmNlVXBkYXRlUmVuZGVyRGF0YSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYW55TGFiZWwuX2ZvcmNlVXBkYXRlUmVuZGVyRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBhbnlMYWJlbC5fZm9yY2VVcGRhdGVSZW5kZXJEYXRhKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy/lsJ3or5XlpJrnp43mlrnlvI/ojrflj5bmlofmnKzlrr3luqZcbiAgICAgICAgICAgICAgICAvL+aWueazlTE6IGdldEJvdW5kaW5nQm94XG4gICAgICAgICAgICAgICAgbGV0IGJiV2lkdGggPSBhbnlOb2RlLmdldEJvdW5kaW5nQm94KCkud2lkdGg7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy/mlrnms5UyOiBnZXRCb3VuZGluZ0JveFRvV29ybGRcbiAgICAgICAgICAgICAgICBsZXQgYmJ3V2lkdGggPSBhbnlOb2RlLmdldEJvdW5kaW5nQm94VG9Xb3JsZCgpLndpZHRoO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8v5pa55rOVMzogbGFiZWwuX2NvbnRlbnRXaWR0aFxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50V2lkdGggPSBhbnlMYWJlbC5fY29udGVudFdpZHRoIHx8IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy/mlrnms5U0OiBsYWJlbC5fd2lkdGhcbiAgICAgICAgICAgICAgICBsZXQgbGFiZWxXaWR0aCA9IGFueUxhYmVsLl93aWR0aCB8fCAwO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8v5pa55rOVNTog5Lyw566X5a695bqmXG4gICAgICAgICAgICAgICAgbGV0IGVzdGltYXRlZFdpZHRoID0gY29udGVudC5sZW5ndGggKiBsYWJlbC5mb250U2l6ZSAqIDAuNTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL+mAieaLqeacgOWkp+eahOacieaViOWuveW6plxuICAgICAgICAgICAgICAgIHRleHRXaWR0aCA9IE1hdGgubWF4KGJiV2lkdGgsIGJid1dpZHRoLCBjb250ZW50V2lkdGgsIGxhYmVsV2lkdGgsIGVzdGltYXRlZFdpZHRoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL+afpeaJvuiDjOaZr+Wbvue7hOS7tuW5tuiwg+aVtOWuveW6plxuICAgICAgICAgICAgICAgIGxldCBiYWNrZ3JvdW5kQ29tcG9uZW50ID0gdGlwc05vZGUuZ2V0Q2hpbGRCeU5hbWUodGhpcy5iYWNrZ3JvdW5kQ29tcG9uZW50TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGJhY2tncm91bmRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/moLnmja7mlofmnKzlrr3luqbosIPmlbTog4zmma/lm77lrr3luqbvvIzmt7vliqDpgILlvZPnmoTovrnot51cbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZGRpbmcgPSA0MDsgLy/lt6blj7PlkIQyMHB46L656LedXG4gICAgICAgICAgICAgICAgICAgIGxldCBtaW5XaWR0aCA9IDEwMDsgLy/mnIDlsI/lrr3luqZcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1dpZHRoID0gTWF0aC5tYXgodGV4dFdpZHRoICsgcGFkZGluZywgbWluV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy/orr7nva7og4zmma/lm77mlrDnmoTlrr3luqbvvIzkv53mjIHpq5jluqbkuI3lj5hcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbXBvbmVudC53aWR0aCA9IG5ld1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzpnIDopoHvvIzkuZ/lj6/ku6XosIPmlbTog4zmma/lm77nmoTnvKnmlL7mqKHlvI9cbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwcml0ZSA9IGJhY2tncm91bmRDb21wb25lbnQuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0xJQ0VEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUZXh0IGNvbXBvbmVudCBkb2VzIG5vdCBoYXZlIGNjLkxhYmVsIGNvbXBvbmVudCFcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUZXh0IGNvbXBvbmVudCBub3QgZm91bmQgaW4gVGlwc1ByZWZhYiFcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8v5Yib5bu65Yqo55S75bqP5YiXXG4gICAgICAgIGxldCBmYWRlSW4gPSBjYy5mYWRlSW4oMC4zKTtcbiAgICAgICAgLy/orqHnrpfkuK3pl7TmmL7npLrml7bplb/vvJrkvJjlhYjkvb/nlKhkaXNwbGF5RHVyYXRpb27lj4LmlbDvvIzlpoLmnpzmnKrorr7nva7liJnku47mgLvml7bplb/kuK3lh4/ljrvmt6HlhaXmt6Hlh7rml7bpl7RcbiAgICAgICAgbGV0IGFjdHVhbERpc3BsYXlEdXJhdGlvbiA9IGRpc3BsYXlEdXJhdGlvbiA+IDAgPyBkaXNwbGF5RHVyYXRpb24gOiAoZHVyYXRpb24gLSAwLjYpO1xuICAgICAgICAvL+ehruS/neaYvuekuuaXtumVv+S4jeS8muS4uui0n+aVsFxuICAgICAgICBhY3R1YWxEaXNwbGF5RHVyYXRpb24gPSBNYXRoLm1heChhY3R1YWxEaXNwbGF5RHVyYXRpb24sIDAuMSk7XG4gICAgICAgIGxldCBkaXNwbGF5RGVsYXkgPSBjYy5kZWxheVRpbWUoYWN0dWFsRGlzcGxheUR1cmF0aW9uKTtcbiAgICAgICAgLy/kuIrnp7vliqjnlLvlkozmt6Hlh7rliqjnlLvlkIzml7bov5vooYzvvIjml7bplb8wLjPnp5LvvIlcbiAgICAgICAgbGV0IG1vdmVVcCA9IGNjLm1vdmVCeSgwLjMsIGNjLnYyKDAsIG1vdmVEaXN0YW5jZSkpO1xuICAgICAgICBsZXQgZmFkZU91dCA9IGNjLmZhZGVPdXQoMC4zKTtcbiAgICAgICAgbGV0IG1vdmVBbmRGYWRlT3V0ID0gY2Muc3Bhd24obW92ZVVwLCBmYWRlT3V0KTtcbiAgICAgICAgbGV0IHJlbW92ZVNlbGYgPSBjYy5jYWxsRnVuYygoKSA9PiB7XG4gICAgICAgICAgICAvL+ebtOaOpemUgOavgeiKgueCuVxuICAgICAgICAgICAgdGlwc05vZGUuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8v5omn6KGM5Yqo55S7XG4gICAgICAgIGxldCBzZXF1ZW5jZSA9IGNjLnNlcXVlbmNlKFxuICAgICAgICAgICAgZmFkZUluLCAgICAgICAgICAvL+a3oeWFpe+8iDAuM+enku+8iVxuICAgICAgICAgICAgZGlzcGxheURlbGF5LCAgICAvL+S4remXtOaYvuekuuaXtumVv++8iOeUsWRpc3BsYXlEdXJhdGlvbuWPguaVsOaOp+WItu+8iVxuICAgICAgICAgICAgbW92ZUFuZEZhZGVPdXQsICAvL+WQjOaXtuaJp+ihjOS4iuenu+WSjOa3oeWHuuWKqOeUu++8iDAuM+enku+8iVxuICAgICAgICAgICAgcmVtb3ZlU2VsZiAgICAgICAvL+mUgOavgeiKgueCuVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc29sZS5sb2coYFRpcHPliqjnlLvml7bpl7Torr7nva7vvJrmgLvml7bplb/iiYgkezAuMyArIGFjdHVhbERpc3BsYXlEdXJhdGlvbiArIDAuM33np5LvvIjmt6HlhaUwLjPnp5IgKyDmmL7npLoke2FjdHVhbERpc3BsYXlEdXJhdGlvbn3np5IgKyDmt6Hlh7rkuIrnp7swLjPnp5LvvIlgKTtcbiAgICAgICAgXG4gICAgICAgIHRpcHNOb2RlLnJ1bkFjdGlvbihzZXF1ZW5jZSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWFqOWxgOmdmeaAgeaWueazle+8jOaWueS+v+WFtuS7luexu+ebtOaOpeiwg+eUqFxuICAgICAqIEBwYXJhbSBjb250ZW50IFRpcHPlhoXlrrlcbiAgICAgKiBAcGFyYW0gZHVyYXRpb24g5pi+56S65oC75pe26ZW/77yI56eS77yJ77yM6buY6K6kMS4z56eSXG4gICAgICogQHBhcmFtIG1vdmVEaXN0YW5jZSDkuIrnp7vot53nprvvvIzpu5jorqQxMDBcbiAgICAgKiBAcGFyYW0gZGlzcGxheUR1cmF0aW9uIOS4remXtOaYvuekuuaXtumVv++8iOenku+8ie+8jOm7mOiupDAuN+enku+8iOWPr+WNleeLrOiuvue9ru+8jOS8mOWFiOe6p+mrmOS6jmR1cmF0aW9u77yJXG4gICAgICogQHBhcmFtIGNkIOWGt+WNtOaXtumXtO+8iOenku+8ie+8jOm7mOiupDAuNeenku+8jOWcqOivpeaXtumXtOWGheebuOWQjOWGheWuueeahFRpcHPkuI3kvJrph43lpI3mmL7npLpcbiAgICAgKi9cbiAgICBzdGF0aWMgc2hvdyhjb250ZW50OiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXIgPSAxLjMsIG1vdmVEaXN0YW5jZTogbnVtYmVyID0gMTAwLCBkaXNwbGF5RHVyYXRpb246IG51bWJlciA9IDAuNSwgY2Q6IG51bWJlciA9IDAuNSkge1xuICAgICAgICBUaXBzTWFuYWdlci5lbnN1cmVJbnN0YW5jZSgpLnNob3dUaXBzKGNvbnRlbnQsIGR1cmF0aW9uLCBtb3ZlRGlzdGFuY2UsIGRpc3BsYXlEdXJhdGlvbiwgY2QpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDpnZnmgIHmlrnms5XvvJrorqHnrpfmlofmnKzlrr3luqZcbiAgICAgKiDkuI3pnIDopoHmjILlnKjoioLngrnkuIrkuZ/og73osIPnlKjvvIznlKjkuo7osIPmlbTog4zmma/lm77plb/luqZcbiAgICAgKiBAcGFyYW0gY29udGVudCDmlofmnKzlhoXlrrlcbiAgICAgKiBAcGFyYW0gZm9udE5hbWUg5a2X5L2T5ZCN56ewXG4gICAgICogQHBhcmFtIGZvbnRTaXplIOWtl+S9k+Wkp+Wwj1xuICAgICAqIEBwYXJhbSBsaW5lSGVpZ2h0IOihjOmrmFxuICAgICAqIEByZXR1cm5zIOaWh+acrOWuveW6plxuICAgICAqL1xuICAgIHN0YXRpYyBjYWxjdWxhdGVUZXh0V2lkdGgoY29udGVudDogc3RyaW5nLCBmb250TmFtZTogc3RyaW5nID0gXCJcIiwgZm9udFNpemU6IG51bWJlciA9IDIwLCBsaW5lSGVpZ2h0OiBudW1iZXIgPSAyNCk6IG51bWJlciB7XG4gICAgICAgIC8v5Yib5bu65LiA5Liq5Li05pe26IqC54K5XG4gICAgICAgIGxldCB0ZW1wTm9kZSA9IG5ldyBjYy5Ob2RlKCk7XG4gICAgICAgIFxuICAgICAgICAvL+a3u+WKoExhYmVs57uE5Lu2XG4gICAgICAgIGxldCBsYWJlbCA9IHRlbXBOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIFxuICAgICAgICAvL+iuvue9ruaWh+acrOWGheWuueWSjOagt+W8j1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSBjb250ZW50O1xuICAgICAgICBpZiAoZm9udE5hbWUpIHtcbiAgICAgICAgICAgIGxhYmVsLmZvbnQgPSBjYy5sb2FkZXIuZ2V0UmVzKGZvbnROYW1lLCBjYy5Gb250KTtcbiAgICAgICAgfVxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IGZvbnRTaXplO1xuICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gbGluZUhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIC8v6I635Y+W5paH5pys5a695bqmIC0g5L2/55SoYm91bmRpbmdCb3jmlrnms5Xojrflj5ZcbiAgICAgICAgbGV0IHRleHRXaWR0aCA9IGxhYmVsLm5vZGUuZ2V0Qm91bmRpbmdCb3goKS53aWR0aDtcbiAgICAgICAgXG4gICAgICAgIC8v6ZSA5q+B5Li05pe26IqC54K5XG4gICAgICAgIHRlbXBOb2RlLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0ZXh0V2lkdGg7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIOmdmeaAgeaWueazle+8muiwg+aVtOiDjOaZr+WbvumVv+W6puS7pemAguW6lOaWh+acrFxuICAgICAqIOS4jemcgOimgeaMguWcqOiKgueCueS4iuS5n+iDveiwg+eUqFxuICAgICAqIEBwYXJhbSBiYWNrZ3JvdW5kTm9kZSDog4zmma/lm77oioLngrlcbiAgICAgKiBAcGFyYW0gdGV4dENvbnRlbnQg5paH5pys5YaF5a65XG4gICAgICogQHBhcmFtIGZvbnROYW1lIOWtl+S9k+WQjeensFxuICAgICAqIEBwYXJhbSBmb250U2l6ZSDlrZfkvZPlpKflsI9cbiAgICAgKiBAcGFyYW0gbGluZUhlaWdodCDooYzpq5hcbiAgICAgKiBAcGFyYW0gcGFkZGluZyDovrnot51cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRqdXN0QmFja2dyb3VuZFRvVGV4dChiYWNrZ3JvdW5kTm9kZTogY2MuTm9kZSwgdGV4dENvbnRlbnQ6IHN0cmluZywgZm9udE5hbWU6IHN0cmluZyA9IFwiXCIsIGZvbnRTaXplOiBudW1iZXIgPSAyMCwgbGluZUhlaWdodDogbnVtYmVyID0gMjQsIHBhZGRpbmc6IG51bWJlciA9IDIwKTogdm9pZCB7XG4gICAgICAgIGlmICghYmFja2dyb3VuZE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJCYWNrZ3JvdW5kIG5vZGUgaXMgbnVsbCFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8v6K6h566X5paH5pys5a695bqmXG4gICAgICAgIGxldCB0ZXh0V2lkdGggPSB0aGlzLmNhbGN1bGF0ZVRleHRXaWR0aCh0ZXh0Q29udGVudCwgZm9udE5hbWUsIGZvbnRTaXplLCBsaW5lSGVpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIC8v6LCD5pW06IOM5pmv5Zu+5a695bqmXG4gICAgICAgIGxldCBuZXdXaWR0aCA9IHRleHRXaWR0aCArIHBhZGRpbmc7XG4gICAgICAgIGJhY2tncm91bmROb2RlLndpZHRoID0gbmV3V2lkdGg7XG4gICAgICAgIFxuICAgICAgICAvL+ehruS/neiDjOaZr+WbvuS9v+eUqFNMSUNFROaooeW8j+S7peato+ehruaLieS8uFxuICAgICAgICBsZXQgc3ByaXRlID0gYmFja2dyb3VuZE5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgIHNwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0xJQ0VEO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19