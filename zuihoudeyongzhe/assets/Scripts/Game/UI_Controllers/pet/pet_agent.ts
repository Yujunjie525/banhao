

const {ccclass, property} = cc._decorator;

@ccclass
export default class pet_agent extends cc.Component {
    @property({tooltip:"速度"})
    speed: number = 500

    private is_walking: boolean = false
    private walk_time: number = 0
    private vx: number = 0
    private vy: number = 0
    private passed_time: number = 0
    private dir:cc.Vec2=cc.v2(0,0)
    // 自然而然就有了;
 public   walk_to(dst) {
        var src = this.node.getPosition();
        this. dir = dst.sub(src);
        var len =this. dir.mag();


        if (len <= 0) {
            return;
        }


        this.walk_time = len / this.speed;
        this.vx = this.speed * this.dir.x / len;
        this.vy = this.speed * this.dir.y / len;
        this.passed_time = 0;
        this.is_walking = true; 
    }
    start () {

    }

     update (dt) {
        if (this.is_walking === false) {

            return;
        } 
        this.passed_time += dt;
        if (this.passed_time > this.walk_time) {
            dt -= (this.passed_time - this.walk_time);
        }

        this.node.x += (this.vx * dt);
        this.node.y += (this.vy * dt);

        if (this.passed_time >= this.walk_time) {
            this.is_walking = false;
        }
       
     }
}
