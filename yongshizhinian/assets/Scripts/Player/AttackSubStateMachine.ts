import { AnimationClip } from "cc";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_TYPE, SHAKE_TYPE_ENUM } from "../../Enum";
import DirectionSubStateMachine from "../Base/DirectionSubStateMachine";
import { StateMachine } from "../Base/SateMachine";
import State, { ANIMATION_SPEED } from "../Base/State";
import { SubStateMachine } from "../Base/SubStateMachine";
import { gameConfig } from "../gameConfig";

export default class AttackSubStateMachine extends DirectionSubStateMachine {
    constructor(fsm: StateMachine) {
        super(fsm)
        const playerId = gameConfig.getCurrentPlayerId();
        const BASE_URL = `texture/player${playerId}/attack/`;
        const BASE_END = '/attack';

        this.stateMachine.set(DIRECTION_ENUM.TOP, new State(fsm, `${BASE_URL}top` + BASE_END, AnimationClip.WrapMode.Normal, [{
            frame: 0.1,
            func: 'onAttackShake',
            params: [SHAKE_TYPE_ENUM.TOP]
        }]))
        this.stateMachine.set(DIRECTION_ENUM.BOTTOM, new State(fsm, `${BASE_URL}bottom` + BASE_END, AnimationClip.WrapMode.Normal, [{
            frame: 0.1,
            func: 'onAttackShake',
            params: [SHAKE_TYPE_ENUM.BOTTOM]
        }]))
        this.stateMachine.set(DIRECTION_ENUM.LEFT, new State(fsm, `${BASE_URL}left` + BASE_END, AnimationClip.WrapMode.Normal, [{
            frame: 0.1,
            func: 'onAttackShake',
            params: [SHAKE_TYPE_ENUM.LEFT]
        }]))
        this.stateMachine.set(DIRECTION_ENUM.RIGHT, new State(fsm, `${BASE_URL}right` + BASE_END, AnimationClip.WrapMode.Normal, [{
            frame: 0.1,
            func: 'onAttackShake',
            params: [SHAKE_TYPE_ENUM.RIGHT]
        }]))
    }
}