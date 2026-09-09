import mGameData from "../Data/GameData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WallManager extends cc.Component {
    /**
     * 玩家和墙壁的碰撞
     * @param other 
     * @param self 
     */
    onCollisionEnter(other,self){
        if(other.node.group == 'player'){
            if(mGameData.playerBuff){
                mGameData.playerHudun.y = 0;
                mGameData.playerBuff = false;
                mGameData.BgMoveSpeed = 8;
                mGameData.playerLoc = -1;
            }
        }
    }
}
