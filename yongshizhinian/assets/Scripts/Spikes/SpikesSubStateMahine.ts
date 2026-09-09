import { AnimationClip } from "cc";
import { PARAMS_NAME_TYPE, SPIKE_COUNT_ENUM } from "../../Enum";
import { StateMachine } from "../Base/SateMachine";
import State from "../Base/State";
import { SubStateMachine } from "../Base/SubStateMachine";

export default class SpikesSubStateMachine extends SubStateMachine {
    constructor(fsm: StateMachine) {
        super(fsm)
    }

    run() {
        const value = this.fsm.getParams(PARAMS_NAME_TYPE.SPIKES_CUR_COUNT).value
        const totalCount = this.fsm.getParams(PARAMS_NAME_TYPE.SPIKES_TOTAL_COUNT).value
        let countKey: string;
        if (typeof value === 'number' && typeof totalCount === 'number') {
            switch (value) {
                case 0: countKey = SPIKE_COUNT_ENUM.ZERO; break;
                case 1: countKey = SPIKE_COUNT_ENUM.ONE; break;
                case 2: countKey = SPIKE_COUNT_ENUM.TWO; break;
                case 3: countKey = SPIKE_COUNT_ENUM.THREE; break;
                case 4: countKey = SPIKE_COUNT_ENUM.FOUR; break;
                case 5: countKey = SPIKE_COUNT_ENUM.FIVE; break;
                default: countKey = SPIKE_COUNT_ENUM.ZERO; break;
            }
            const state = this.stateMachine.get(countKey);
            if (state && value > 0 && value <= totalCount) {
                this.currentSate = state;
            } else if (state && value === 0) {
                // 初始化时count=0不播放动画，保持与之前行为一致
            } else {
                console.warn(`未找到对应的尖刺状态: ${countKey}`);
            }
        }
    }
}