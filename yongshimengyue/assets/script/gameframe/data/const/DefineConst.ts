/**打包的类型
 * 0:开发过程中
 * 1:提供给app使用的web包
 * 2:打包成微信小游戏
 * 3:普通的web包
 */
export class Package {
    static TYPE = 1;  //切记不可随意修改
}

export class PackageType {
    static DEV = 0;
    static APP = 1;
    static WX = 2;
    static WEB = 3;
}