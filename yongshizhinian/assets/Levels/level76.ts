import { IEnitiy, ILevel, ISpikes } from '.';
import { TILE_TYPE_ENUM, DIRECTION_ENUM, ENTITY_STATE_ENUM, ENITIY_TYPE_ENUM, ENITIY_TYPE_SPIKES_ENUM } from '../Enum';

const mapInfo = [
    [
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
            src: 19,
            type: TILE_TYPE_ENUM.CLIFF_RIGHT,
        }
    ],
    [
        {
            src: 18,
            type: TILE_TYPE_ENUM.CLIFF_LEFT,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
        }
    ],
    [
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
        }
    ],
    [
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
        }
    ],
    [
        {
            src: 18,
            type: TILE_TYPE_ENUM.CLIFF_LEFT,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        }
    ],
    [
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
        }
    ],
    [
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        }
    ],
    [
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
            src: 19,
            type: TILE_TYPE_ENUM.CLIFF_RIGHT,
        }
    ],
    [
        {
            src: 5,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
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
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 5,
            type: TILE_TYPE_ENUM.WALL_COLUMN,
        }
    ],
    [
        {
            src: 13,
            type: TILE_TYPE_ENUM.WALL_LEFT_BOTTOM,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
        },
        {
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
        },
        {
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
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
        }
    ]
];
const player: IEnitiy = {
    x: 2,
    y: 7,
    direction: DIRECTION_ENUM.TOP,
    state: ENTITY_STATE_ENUM.IDLE,
    type: ENITIY_TYPE_ENUM.PLAYER,
};

const enemies: Array<IEnitiy> = [
    {
        x: 2,
        y: 5,
        direction: DIRECTION_ENUM.TOP,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.IRON,
    },
    {
        x: 4,
        y: 6,
        direction: DIRECTION_ENUM.BOTTOM,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.IRON,
    },
    {
        x: 8,
        y: 7,
        direction: DIRECTION_ENUM.BOTTOM,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.IRON,
    },
    {
        x: 7,
        y: 2,
        direction: DIRECTION_ENUM.BOTTOM,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.WOODEN,
    }
];

const spikes: Array<ISpikes> = [
    {
        x: 8,
        y: 1,
        count: 1,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    },
    {
        x: 5,
        y: 2,
        count: 2,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    },
    {
        x: 4,
        y: 4,
        count: 1,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    },
    {
        x: 2,
        y: 2,
        count: 2,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    }
];

const bursts: Array<IEnitiy> = [
    {
        x: 7,
        y: 8,
        direction: DIRECTION_ENUM.LEFT,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.BURST,
    },
    {
        x: 2,
        y: 8,
        direction: DIRECTION_ENUM.LEFT,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.BURST,
    },
    {
        x: 8,
        y: 7,
        direction: DIRECTION_ENUM.TOP,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.BURST,
    }
];

const door: IEnitiy = {
    x: 9,
    y: 1,
    direction: DIRECTION_ENUM.BOTTOM,
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
