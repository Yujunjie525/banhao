"use strict";
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