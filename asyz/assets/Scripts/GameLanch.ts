const { ccclass, property } = cc._decorator;

/**
 * Legacy scene component stub.
 *
 * Load.fire and Start.fire still contain serialized components that point to
 * this script UUID. The old airplane-battle launcher logic has been removed;
 * this class is intentionally empty so those scenes can deserialize without
 * "missing or invalid script" errors.
 */
@ccclass
export default class GameLanch extends cc.Component {
    @property
    isUsingWebSocket: boolean = false;
}
