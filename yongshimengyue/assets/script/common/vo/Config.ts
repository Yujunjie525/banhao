
export default class Config extends Object {

    public constructor(json?: any) {
        super(json);
    }

    gameConfig: {
        maxLevel: any;
        curLevel: any;
        titleConfig: {
            titleBgOpacity: any;
            titleTxtColor: any;
            titleBgColor: any;
        };
        myGameConfig: {
            itemDelayTime: any;
            DurationTime: any;
        };
        round: any;
        name: any;
        timedown: {
            val: any;
            color: any;
            musicStart: any;
            musicEnd: any;
        };
        guideMsg: {
            sound: any;
            content: any;
        }[];
        nameConfig: {
            nameBgColor: any;
            nameTxtColor: any;
            nameBgOpacity: any;
        };
        version: any;
        musicBg: any;
        timeout: any;
    };

    mapConfig: {
        mapId: any;
        mapIcon: any;
        time?: any;
        boss?: any;
        monster?: any;
        monster2?: any;
        road: any[];
        goods: any[];
        roadChange: any[];
        train: any[];
        trainCount?: any;
        goodsScore?: any;
        errorScore?: any;
        totalScore?: any;
        speedRed?: any;
        speedBlue?: any;
        showRedGoods?: any;
    }[];
}
