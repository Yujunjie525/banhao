import { AnimationClip } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_TYPE } from "../../Enum";
import { StateMachine } from "../Base/SateMachine";
import State from "../Base/State";
import { SubStateMachine } from "../Base/SubStateMachine";

export default class DirectionSubStateMachine extends SubStateMachine {
    run() {
        const { value } = this.fsm.getParams(PARAMS_NAME_TYPE.DIRECTION)
        this.currentSate = this.stateMachine.get(DIRECTION_ORDER_ENUM[value as number])
    }
}