
var Utils = cc.Class({
    extends: cc.Component,

    statics: {
        onVideoAds:false,
        
        sceneA:true,

        //输入一个数值 将这个数值转换为 时间格式
        FormatNumToTime:function (num) {
            var hour = Math.floor(num / 3600); //时
            var min = Math.floor((num - hour * 3600) / 60);//分
            var sec = Math.floor(num - hour * 3600 - min *60); //秒
            var str1 = hour;
            var str2 = min;
            var str3 = sec;
            if(hour < 10)
            {
                str1 = "0" + hour;
            }
            if(min < 10)
            {
                str2 = "0" + min;
            }
            if(sec < 10)
            {
                str3 = "0" + sec;
            }
            var out = str1 + ":" + str2 + ":" + str3;

            return out;
        },

        GetSysTime:function(){
            var timestamp = Math.round(new Date() / 1000) - (3600 * 24 * 365 * 49);
            return timestamp;
        },
    },
});
module.exports = Utils;
