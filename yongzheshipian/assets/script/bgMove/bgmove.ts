import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('bgmove')
export class bgmove extends Component {
    // 背景移动速度
    @property
    speed: number = 40;
    // 图片宽度
    @property
    width: number = 1280;
    start() { }
    update(deltaTime: number) {
        //获取当前节点的所有节点
        let allbg = this.node.children;
        //移动
        for (let i = 0; i < allbg.length; i++) {
            // 每张背景图的位置
            let position = allbg[i].position;
            // 移动的距离
            let moveAmount = this.speed * deltaTime;
            //实时更新每张背景图的位置
            allbg[i].position = new Vec3(position.x - moveAmount, position.y, 0);
            // 当这个背景的坐标小于负的宽度时
            if (allbg[i].position.x < -1440) {
                //  让该图片的X坐标变为：当前坐标 + 2倍宽度数
                allbg[i].position = new Vec3(
                    1598,
                    position.y,
                    0
                );
            }
        }
    }
}


