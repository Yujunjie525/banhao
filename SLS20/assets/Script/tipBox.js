
var tipBox = cc.Class({
    extends: cc.Component,

    properties: {
        desLbl:cc.Label,
    },

    showDes:function (des) {
        this.desLbl.string = des;
    },
});
