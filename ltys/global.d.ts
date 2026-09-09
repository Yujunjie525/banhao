// 全局类型声明文件
declare global {
    const require: any;
    const tt: any;
    const wx: any;

    interface Window {
        tt?: any;
        wx?: any;
    }
}

export {};
