class HttpServer {
    private url_main: string = "http://gameuat.xixingjia.com/api/";
    private token: string = "jj0X6XMenxf9FHDXNWCGixXvsxQbPABbEgK82LD3ixDwboCxpyO2M03d9GfrtbtcnHDVib6KVpIJdEk0Ze4tFB97c9e8VCOLbnqs559e1Oo=";

    public setMainUrl(url_main: string): void {
        this.url_main = url_main;
    }

    public setToken(token: string): void {
        this.token = token;
    }

    /**
     * 向服务器发送请求
     * @param args 发送的参数
     * @param callback 回调函数
     * @param thisobj 回调函数作用域
     */
    httpGet(url: string, callback: Function = null, thisobj: any = null, errorFun: any = null) {
        //异步编程的解决方案
        return new Promise((resolve, reject) => {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.onload = function () {
                let respone: any[] = JSON.parse(xhr.response);
                callback && callback.apply(thisobj, [respone]);
                callback = null;
                thisobj = null;
                xhr.abort();
            }.bind(this);

            xhr.onerror = () => {
                cc.log("网络连接错误", url);
                errorFun && errorFun.apply(thisobj, []);
                errorFun = null;
                thisobj = null;
            }

            url = this.url_main + url;

            let timeout = 3000;
            xhr.open("GET", url, true);
            xhr.timeout = timeout;
            xhr.setRequestHeader("contentType", "application/json;charset=UTF-8");
            xhr.setRequestHeader("Authorization", this.token);
            xhr.send();
        })
    }

    /**
     * 向服务器发送请求
     * @param args 发送的参数
     * @param callback 回调函数
     * @param thisobj 回调函数作用域
     */
    httpPost(url: string, args: string, callback: Function = null, thisobj: any = null, errorFun: any = null) {
        //异步编程的解决方案
        return new Promise((resolve, reject) => {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.onload = function () {
                let respone: any[] = JSON.parse(xhr.response);
                if (!respone[1]) {

                    return;
                }
                callback && callback.apply(thisobj, [respone[1]]);
                callback = null;
                thisobj = null;
                xhr.abort();
            }.bind(this);

            xhr.onerror = () => {
                cc.log("网络连接错误");
                errorFun && errorFun.apply(thisobj, []);
                errorFun = null;
                thisobj = null;
            }

            let url_args = "sid=" + "" + "&vid=" + "" + "&s=" + "" + "&r=" + "" + "&m=" + "&a="/* + StringUtil.strToUStr(args)*/;
            this.url_main += "9235//upTrainingLesson/getTrainPlanRecordList"

            let timeout = 3000;
            let header_name = "Content-Type";
            let header_value = "application/x-www-form-urlencoded";
            xhr.open("POST", this.url_main, true);
            xhr.timeout = timeout;
            xhr.setRequestHeader(header_name, header_value);
            xhr.setRequestHeader(header_name, header_value);
            xhr.send(url_args);
        })
    }

}

export let httpServer: HttpServer = new HttpServer();