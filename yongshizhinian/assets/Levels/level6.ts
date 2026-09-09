import { IEnitiy, ILevel, ISpikes } from '.';
import { TILE_TYPE_ENUM, DIRECTION_ENUM, ENTITY_STATE_ENUM, ENITIY_TYPE_ENUM } from '../Enum';
const mapInfo = [
    [
        {
            src: 16,
            type: TILE_TYPE_ENUM.WALL_LEFT_TOP,
        },
        {
            src: 5,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 23,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 22,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 5,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 13,
            type: TILE_TYPE_ENUM.WALL_LEFT_BOTTOM,
        },
        {
            src: 18,
            type: TILE_TYPE_ENUM.CLIFF_LEFT,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
        {
            src: null,
            type: null,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
        {
            src: null,
            type: null,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
    ],
    [
        {
            src: 15,
            type: TILE_TYPE_ENUM.WALL_RIGHT_TOP,
        },
        {
            src: 5,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 23,
            type: TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 22,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 5,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        },
        {
            src: 14,
            type: TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM,
        },
        {
            src: 19,
            type: TILE_TYPE_ENUM.CLIFF_RIGHT,
        },
    ],
];


const player: IEnitiy = {
    x: 0,
    y: 3,
    direction: DIRECTION_ENUM.RIGHT,
    state: ENTITY_STATE_ENUM.IDLE,
    type: ENITIY_TYPE_ENUM.PLAYER,
};

const enemies: Array<IEnitiy> = [
    {
        x: 5,
        y: 2,
        direction: DIRECTION_ENUM.LEFT,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.WOODEN,
    },
    {
        x: 5,
        y: 5,
        direction: DIRECTION_ENUM.LEFT,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.WOODEN,
    },
];

const spikes: Array<ISpikes> = [];

const bursts: Array<IEnitiy> = [];

const door: IEnitiy = {
    x: 8,
    y: 3,
    direction: DIRECTION_ENUM.LEFT,
    state: ENTITY_STATE_ENUM.IDLE,
    type: ENITIY_TYPE_ENUM.DOOR,
};

const level: ILevel = {
    mapInfo,
    player,
    enemies,
    spikes,
    bursts,
    door,
};
export default level;
