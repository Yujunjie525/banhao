
var ShareInfos = cc.Class({
    extends: cc.Component,
    statics:{
        init:function()
        {
            this.Infos = [
               {text:"原来2048还能这样玩,真的太爽了",url:"https://mmocgame.qpic.cn/wechatgame/VW5UT1uqQ5qbYINJIyoY5IBhzibWr9fHg9wt6LbOZ69KkicsVBgARRbJUkxnzYPTve/0"},
               {text:"2048发射！不一样得玩法,让你体验最好的2048",url:"https://mmocgame.qpic.cn/wechatgame/VW5UT1uqQ5qbYINJIyoY5IBhzibWr9fHg9wt6LbOZ69KkicsVBgARRbJUkxnzYPTve/0"},
               {text:"这恐怕是我玩过最好的泡泡龙",url:"https://mmocgame.qpic.cn/wechatgame/VW5UT1uqQ5qbYINJIyoY5IBhzibWr9fHg9wt6LbOZ69KkicsVBgARRbJUkxnzYPTve/0"},
               {text:"原来2048还能这样玩,真的太爽了",url:"https://mmocgame.qpic.cn/wechatgame/VW5UT1uqQ5qbYINJIyoY5IBhzibWr9fHg9wt6LbOZ69KkicsVBgARRbJUkxnzYPTve/0"},
            ];
        },

        getShareInfos:function(index){
            return this.Infos[index];
        },
    },
});
module.exports = ShareInfos;