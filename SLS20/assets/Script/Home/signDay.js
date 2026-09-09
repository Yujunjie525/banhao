
var signDay = cc.Class({
    extends: cc.Component,

    properties: {
        whiteBg:cc.Node,
        signTag:cc.Node,
    },

    updateUI:function(){
        whiteBg.opacity = 180;
        signTag.opacity = 255;
    },
});
