import {LQHttpDataType, LQHttpRequestType} from "../data/lq_const";

export class LQHttpOption {
    public request_type: LQHttpRequestType = LQHttpRequestType.Get;
    public data_type: LQHttpDataType = LQHttpDataType.Text;
    public content_type: string;

    constructor(request_type?: LQHttpRequestType, content_type?: string, data_type?: LQHttpDataType) {
        if (request_type) {
            this.request_type = request_type;
        }
        if (content_type) {
            this.content_type = content_type;
        }
        if (data_type) {
            this.data_type = data_type;
        }
    }

    public static get(): LQHttpOption {
        return new LQHttpOption(LQHttpRequestType.Get);
    }

    public static post(): LQHttpOption {
        return new LQHttpOption(LQHttpRequestType.Post);
    }

    public static post_json(): LQHttpOption {
        return new LQHttpOption(LQHttpRequestType.Post, 'application/json');
    }

    public static form_post(): LQHttpOption {
        return new LQHttpOption(LQHttpRequestType.Post, 'application/x-www-form-urlencoded');
    }

    public static post_binary(): LQHttpOption {
        return new LQHttpOption(LQHttpRequestType.Post, 'application/octet-stream', LQHttpDataType.Binary);
    }
}


export class LQHttpUtil {
    public static request(url: string, cb: (code: number, data: any) => void, data?: string | Uint8Array, o?: LQHttpOption) {
        if (!o) {
            o = LQHttpOption.get();
        }
        const xhr = new XMLHttpRequest();
        let time = false;
        const timer = setTimeout(
            () => {
                time = true;
                xhr.abort();
                cb(0, undefined);
            },
            8000);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (time) {
                    return;
                }
                clearTimeout(timer);
                if ((xhr.status === 200 || xhr.status === 304)) {
                    if (o.data_type === LQHttpDataType.Binary && xhr.response.byteLength > 0) {
                        cb(200, new Uint8Array(xhr.response));
                    } else if (o.data_type === LQHttpDataType.Text && xhr.responseText.length > 0) {
                        cb(200, xhr.responseText);
                    } else {
                        cb(0, undefined);
                    }
                } else {
                    cb(0, undefined);
                }
            }
        };
        if (o.data_type === LQHttpDataType.Binary) {
            xhr.responseType = "arraybuffer";
        }
        xhr.open(o.request_type, url, true);
        if (o.content_type) {
            xhr.setRequestHeader('content-type', o.content_type);
        }
        xhr.send(data);
    }
}