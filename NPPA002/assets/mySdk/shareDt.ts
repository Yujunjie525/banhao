

export class shareDt{
    private static data={
        shareContent:{
            en:"清洁小能手",
            zh:"清洁小能手"
        },
        shareTitle:{
            en:"一起来清理垃圾吧",
            zh:"一起来清理垃圾吧"
        },
        appName:{
            en:"清理大师",
            zh:"清理大师"
        }
    }


    public static getShareContent(){
        return this.data.shareContent.zh;
    }
    
    public static getShareTitle(){

        return this.data.shareTitle.zh;
    }

    public static getAppName(){

        return this.data.appName.zh;

    }
}

