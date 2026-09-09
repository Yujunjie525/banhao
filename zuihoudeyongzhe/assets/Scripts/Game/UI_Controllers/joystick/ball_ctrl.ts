import joystick from "./joystick"

const {ccclass, property} = cc._decorator;

@ccclass
export default class ball_ctrl extends cc.Component {

    @property(joystick)
    stick: joystick = null;

    @property
    speed: number = 200;

    @property(cc.Node)
    camera: cc.Node = null;

   private offset: cc.Vec2 = cc.v2(0, 0);
   private body: cc.RigidBody = null;
    
    onLoad () {
    	this.body = this.getComponent(cc.RigidBody);
    }

    start () {
    	// offset = camrea - tank的位置---> offset; 
    	// camrea = offset + tank;
    	if (this.camera !== null) {
    		this.offset = this.camera.getPosition().sub(this.node.getPosition());
    	}
    }

    update (dt) {
    	if (this.camera !== null) {
    		this.camera.x = this.node.x + this.offset.x;
    		this.camera.y = this.node.y + this.offset.y;
    	}

    	if (this.stick.dir.x === 0 && this.stick.dir.y === 0) {
			//this.node.setPosition(cc.v2(0,0))
 	this.body.linearVelocity = cc.v2(0, 0);
    		return;
    	}

    	var vx: number = this.speed * this.stick.dir.x;
		var vy: number = this.speed * this.stick.dir.y;
		
		//    this.node.x+=this.stick.dir.x
		//    this.node.y+=this.stick.dir.y



		this.body.linearVelocity = cc.v2(vx, vy);
	// 	if (this.node.x < -290) {
	// this.node.x=-290
	// //	this.body.linearVelocity = cc.v2(0, 0);
	// 	} else if (this.node.x > 290) {
	// 		this.node.x=290
	// 	//	this.body.linearVelocity = cc.v2(0, 0);
	// 	}
	// 	if (this.node.y < -530) {
	// 	this.node.y=-530
	// 		//this.body.linearVelocity = cc.v2(0, 0);
	// 	} else if (this.node.y > 530) {
	// 	this.node.y=530
	// 	//	this.body.linearVelocity = cc.v2(0, 0);

	// 	}


    	// var r: number = Math.atan2(this.stick.dir.y, this.stick.dir.x);
    	// var degree: number = r * 180 / Math.PI;

    	// rotation 顺时针
    	/*
    	degree = 360 - degree;
    	degree = degree + 90;
    	this.node.rotation = degree;*/


    //	this.node.angle = degree - 90;

    }
}
