import { AnimationClip } from "cc";
import { PARAMS_NAME_TYPE, SPIKE_COUNT_ENUM } from "../../Enum";
import { StateMachine } from "../Base/SateMachine";
import State from "../Base/State";
import { SubStateMachine } from "../Base/SubStateMachine";
import SpikesSubStateMachine from "./SpikesSubStateMahine";



const BASE_URL = 'texture/spikes/spikesone/'
export default class SpikesOneSubStateMachine extends SpikesSubStateMachine {
    constructor(fsm: StateMachine) {
        super(fsm)

        this.stateMachine.set(SPIKE_COUNT_ENUM.ZERO, new State(fsm, `${BASE_URL}zero/zero`))
        this.stateMachine.set(SPIKE_COUNT_ENUM.ONE, new State(fsm, `${BASE_URL}one/one`))
        this.stateMachine.set(SPIKE_COUNT_ENUM.TWO, new State(fsm, `${BASE_URL}two/two`))
    }
}