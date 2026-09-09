import { AnimationClip } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_TYPE } from "../../../Enum";
import DirectionSubStateMachine from "../../Base/DirectionSubStateMachine";
import { StateMachine } from "../../Base/SateMachine";
import State from "../../Base/State";
import { SubStateMachine } from "../../Base/SubStateMachine";


const BASE_URL = 'texture/woodenskeleton/death/'
const BASE_END = '/death'
export default class DeathWoodenSubStateMachine extends DirectionSubStateMachine {
    constructor(fsm: StateMachine) {
        super(fsm)

        this.stateMachine.set(DIRECTION_ENUM.TOP, new State(fsm, `${BASE_URL}top` + BASE_END,))
        this.stateMachine.set(DIRECTION_ENUM.BOTTOM, new State(fsm, `${BASE_URL}bottom` + BASE_END,))
        this.stateMachine.set(DIRECTION_ENUM.LEFT, new State(fsm, `${BASE_URL}left` + BASE_END,))
        this.stateMachine.set(DIRECTION_ENUM.RIGHT, new State(fsm, `${BASE_URL}right` + BASE_END,))
    }
}