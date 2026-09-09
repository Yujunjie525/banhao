import { IEnitiy, ILevel, ISpikes } from '.';
import { TILE_TYPE_ENUM, DIRECTION_ENUM, ENTITY_STATE_ENUM, ENITIY_TYPE_ENUM, ENITIY_TYPE_SPIKES_ENUM } from '../Enum';

const mapInfo = [
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
            src: 9,
            type: TILE_TYPE_ENUM.WALL_ROW,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
            src: 17,
            type: TILE_TYPE_ENUM.CLIFF_CENTER,
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
            src: 1,
            type: TILE_TYPE_ENUM.FLOOR,
        },
        {
            src: 14,
            type: TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM,
        }
    ]
];
const player: IEnitiy = {
    x: 3,
    y: 7,
    direction: DIRECTION_ENUM.RIGHT,
    state: ENTITY_STATE_ENUM.IDLE,
    type: ENITIY_TYPE_ENUM.PLAYER,
};

const enemies: Array<IEnitiy> = [
    {
        x: 3,
        y: 2,
        direction: DIRECTION_ENUM.TOP,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.IRON,
    },
    {
        x: 6,
        y: 3,
        direction: DIRECTION_ENUM.TOP,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.WOODEN,
    },
    {
        x: 6,
        y: 4,
        direction: DIRECTION_ENUM.BOTTOM,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.WOODEN,
    }
];

const spikes: Array<ISpikes> = [
    {
        x: 6,
        y: 4,
        count: 2,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    },
    {
        x: 6,
        y: 1,
        count: 2,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    },
    {
        x: 2,
        y: 2,
        count: 3,
        type: ENITIY_TYPE_SPIKES_ENUM.SPIKES_ONE,
    }
];

const bursts: Array<IEnitiy> = [
    {
        x: 7,
        y: 8,
        direction: DIRECTION_ENUM.TOP,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.BURST,
    },
    {
        x: 1,
        y: 2,
        direction: DIRECTION_ENUM.LEFT,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENITIY_TYPE_ENUM.BURST,
    }
];

const door: IEnitiy = {
    x: 9,
    y: 2,
    direction: DIRECTION_ENUM.RIGHT,
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
