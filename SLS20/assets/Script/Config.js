
var Config = cc.Class({
    extends: cc.Component,

    statics: {
       homeMap:[
        {"type":"base","prop":"","d":"left","bottom":true},
        {"type":"base","prop":"","d":"left","bottom":true},
        {"type":"base","prop":"","d":"left","bottom":true},
        {"type":"base","prop":"","d":"left"},
        {"type":"base","prop":"","d":"right"},
        {"type":"base","prop":"none","d":"right"},
        {"type":"base","prop":"none","d":"right"},
        {"type":"base","prop":"","d":"left"},
        {"type":"base","prop":"","d":"left","bottom":true},
        {"type":"base","prop":"none","d":"left","bottom":true},
        {"type":"base","prop":"none","d":"left","bottom":true},
        {"type":"base","prop":"","d":"left"},
        {"type":"base","prop":"","d":"right"},
        {"type":"base","prop":"","d":"right"},
        {"type":"base","prop":"","d":"right"},
        {"type":"base","prop":"","d":"right","fork":[{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"}]},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"right","fork":[{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"left"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"},{"type":"floor","prop":"","d":"right"}]},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"right"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"},
        {"type":"floor","prop":"","d":"left"}
       ],

       gameSpNames:{
            base:"base",
            floor:"floor",
            start:"start",
            ice_1:"ice_1",
            ice_2:"ice_2",
            ice_3:"ice_3",
            force:"force",
            trap:"trap",
            reverse:"reverse",
            gem:"gem"
       },

       gameBgScoreLv_1:300,
       gameBgScoreLv_2:600,
    },
});
module.exports = Config;
