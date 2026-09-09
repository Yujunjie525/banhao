// config.ts

export default {
    stamina: {
        max: 30,
        rechargePerMinute: 1,
        rechargeIntervalSec: 600,
        adReward: 5,
    },
    levelCost: 1,
    defaultProgress: {
        unlocked_level: 1,
        level_stars: {},
        failed_levels: [],
        best_distance: 0,
        stamina: 30,
        last_stamina_time: 0,
    },
    levels:[
    {
        "level_id": 1,
        "unique_solution": [
            6,
            2,
            1,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 6,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_1_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_1_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_1_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_1_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 2,
        "unique_solution": [
            4,
            2,
            6,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 3,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_2_0",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_2_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_2_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_2_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 3,
        "unique_solution": [
            4,
            5,
            1,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 3,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_3_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_3_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_3_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_3_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_3_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 4,
        "unique_solution": [
            2,
            4,
            1,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 8,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_4_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_4_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_4_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_4_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_4_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 5,
        "unique_solution": [
            5,
            3,
            2,
            4,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 1,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_5_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_5_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_5_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_5_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_5_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 6,
        "unique_solution": [
            1,
            5,
            3,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 3,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_6_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_6_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_6_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_6_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_6_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            }
        ]
    },
    {
        "level_id": 7,
        "unique_solution": [
            4,
            5,
            1,
            2,
            3
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 3
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_7_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_7_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_7_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_7_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_7_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 8,
        "unique_solution": [
            5,
            2,
            3,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 4,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 3
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 1,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_8_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_8_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_8_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_8_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 9,
        "unique_solution": [
            2,
            5,
            4,
            1,
            3
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 6
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 2,
                "y": 3
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_9_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_9_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_9_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_9_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_9_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            }
        ]
    },
    {
        "level_id": 10,
        "unique_solution": [
            1,
            4,
            3,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 7,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_10_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_10_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_10_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_10_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 11,
        "unique_solution": [
            2,
            3,
            5,
            1,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 2,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_11_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_11_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_11_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_11_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_11_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_11_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 12,
        "unique_solution": [
            1,
            5,
            4,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 7,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_12_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_12_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_12_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_12_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 13,
        "unique_solution": [
            6,
            1,
            2,
            3
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 5,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_13_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_13_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_13_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_13_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 14,
        "unique_solution": [
            1,
            3,
            2,
            5,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_14_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_14_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_14_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_14_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_14_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 15,
        "unique_solution": [
            3,
            2,
            4,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 3
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_15_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_15_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_15_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_15_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 16,
        "unique_solution": [
            6,
            2,
            4,
            3,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 5,
                "y": 6
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 1,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_16_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_16_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_16_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_16_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_16_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_16_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 17,
        "unique_solution": [
            1,
            3,
            4,
            2,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_17_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_17_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_17_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_17_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_17_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_17_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 18,
        "unique_solution": [
            2,
            5,
            3,
            4,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_18_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_18_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_18_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_18_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_18_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_18_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 19,
        "unique_solution": [
            5,
            3,
            1,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_19_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_19_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_19_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_19_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            }
        ]
    },
    {
        "level_id": 20,
        "unique_solution": [
            2,
            6,
            3,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_20_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_20_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_20_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_20_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 21,
        "unique_solution": [
            7,
            1,
            8,
            6,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_21_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_21_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_21_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_21_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_21_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_21_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 22,
        "unique_solution": [
            6,
            4,
            3,
            1,
            5,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 5,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 2,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_22_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_22_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_22_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_22_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_22_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_22_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_22_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_22_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 23,
        "unique_solution": [
            4,
            2,
            6,
            1,
            3
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 1,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 3,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_23_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_23_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_23_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_23_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_23_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_23_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_23_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 24,
        "unique_solution": [
            3,
            4,
            7,
            2,
            1,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_24_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_24_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_24_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_24_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_24_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_24_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_24_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 25,
        "unique_solution": [
            3,
            5,
            4,
            8,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 4,
                "y": 9
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_25_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_25_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_25_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_25_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_25_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_25_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_25_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            }
        ]
    },
    {
        "level_id": 26,
        "unique_solution": [
            1,
            7,
            6,
            3,
            5,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 5,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_26_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_26_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_26_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_26_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_26_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_26_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_26_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 27,
        "unique_solution": [
            1,
            4,
            7,
            6,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 1,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 3
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_27_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_27_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_27_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_27_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_27_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_27_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 28,
        "unique_solution": [
            6,
            5,
            7,
            3,
            2,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 3
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 5,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_28_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_28_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_28_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_28_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_28_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_28_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_28_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 29,
        "unique_solution": [
            1,
            6,
            3,
            5,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 6,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_29_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_29_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_29_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_29_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_29_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_29_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_29_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 30,
        "unique_solution": [
            3,
            1,
            2,
            6,
            5,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 2,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 1,
                "y": 8
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_30_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_30_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_30_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_30_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_30_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_30_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_30_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 31,
        "unique_solution": [
            5,
            6,
            1,
            3,
            7,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_31_0",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_31_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_31_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_31_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_31_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_31_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_31_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 32,
        "unique_solution": [
            6,
            1,
            3,
            2,
            5,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 6
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 1,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_32_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_32_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_32_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_32_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_32_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_32_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_32_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 33,
        "unique_solution": [
            4,
            6,
            2,
            1,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 9,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_33_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_33_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_33_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_33_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_33_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_33_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_33_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 34,
        "unique_solution": [
            3,
            2,
            5,
            4,
            6,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 8,
                "y": 6
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 6
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 4,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_34_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_34_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_34_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_34_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_34_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_34_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_34_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_34_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 35,
        "unique_solution": [
            3,
            4,
            2,
            6,
            5,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 6,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 1,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_35_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_35_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_35_2",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_35_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_35_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_35_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_35_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 36,
        "unique_solution": [
            1,
            7,
            8,
            6,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 1,
                "y": 3
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_36_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_36_1",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_36_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_36_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_36_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_36_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 37,
        "unique_solution": [
            7,
            3,
            5,
            6,
            4,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 7,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_37_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_37_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_37_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_37_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_37_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_37_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_37_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 38,
        "unique_solution": [
            4,
            6,
            1,
            5,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 4,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 2,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_38_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_38_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_38_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_38_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_38_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_38_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 39,
        "unique_solution": [
            4,
            2,
            5,
            7,
            3
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 1,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 7,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_39_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_39_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_39_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_39_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_39_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_39_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 40,
        "unique_solution": [
            6,
            7,
            3,
            2,
            1,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 3,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_40_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_40_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_40_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_40_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_40_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_40_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_40_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_40_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 41,
        "unique_solution": [
            1,
            7,
            4,
            2,
            6,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 2,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_41_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_41_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_41_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_41_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_41_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_41_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_41_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_41_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 42,
        "unique_solution": [
            3,
            4,
            7,
            5,
            1,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_42_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_42_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_42_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_42_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_42_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_42_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_42_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 43,
        "unique_solution": [
            4,
            1,
            3,
            2,
            6,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 4,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_43_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_43_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_43_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_43_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_43_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_43_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_43_6",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 44,
        "unique_solution": [
            5,
            4,
            2,
            6,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 6,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 6,
                "y": 9
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_44_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_44_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_44_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_44_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_44_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_44_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 45,
        "unique_solution": [
            6,
            8,
            4,
            1,
            5,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 3,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 6,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 3,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_45_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_45_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_45_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_45_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_45_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_45_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_45_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 46,
        "unique_solution": [
            1,
            2,
            7,
            6,
            3,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 1,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 2,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_46_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_46_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_46_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_46_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_46_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_46_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_46_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_46_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 47,
        "unique_solution": [
            6,
            7,
            2,
            4,
            3,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_47_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_47_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_47_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_47_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_47_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_47_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_47_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 48,
        "unique_solution": [
            4,
            2,
            6,
            1,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 1,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_48_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_48_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_48_2",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_48_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_48_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_48_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_48_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 49,
        "unique_solution": [
            5,
            8,
            7,
            1,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_49_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_49_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_49_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_49_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_49_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_49_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 50,
        "unique_solution": [
            7,
            6,
            4,
            8,
            3
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 7,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 5,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_50_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_50_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_50_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_50_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_50_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_50_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_50_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 51,
        "unique_solution": [
            5,
            2,
            1,
            6,
            7,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 3,
                "y": 4
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 1,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_51_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_51_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_51_2",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_51_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_51_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_51_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_51_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_51_7",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_51_8",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 52,
        "unique_solution": [
            6,
            8,
            5,
            1,
            4,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_52_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_52_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_52_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_52_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_52_4",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_52_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_52_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_52_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 53,
        "unique_solution": [
            6,
            9,
            1,
            3,
            10,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 7,
                "y": 6
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 5,
                "y": 9
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 5,
                "y": 4
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 9,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_53_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_53_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_53_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_53_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_53_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_53_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_53_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_53_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            }
        ]
    },
    {
        "level_id": 54,
        "unique_solution": [
            1,
            4,
            2,
            8,
            9,
            6,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 4,
                "y": 9
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_54_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_54_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_54_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_54_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_54_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_54_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_54_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_54_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_54_8",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 55,
        "unique_solution": [
            1,
            5,
            10,
            9,
            6,
            7,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 6
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 1,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_55_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_55_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_55_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_55_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_55_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_55_5",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_55_6",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_55_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_55_8",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_55_9",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 56,
        "unique_solution": [
            4,
            3,
            7,
            6,
            2,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 2,
                "y": 3
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_56_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_56_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_56_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_56_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_56_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_56_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_56_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_56_7",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 57,
        "unique_solution": [
            8,
            3,
            6,
            1,
            2,
            7,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 3,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_57_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_57_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_57_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_57_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_57_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_57_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_57_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_57_7",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_57_8",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 58,
        "unique_solution": [
            3,
            1,
            4,
            6,
            5,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 7,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_58_0",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_58_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_58_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_58_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_58_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_58_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_58_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_58_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 59,
        "unique_solution": [
            5,
            4,
            9,
            1,
            8,
            3,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 3,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 5,
                "y": 9
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 6,
                "y": 6
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 8,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_59_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_59_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_59_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_59_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_59_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_59_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_59_6",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_59_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_59_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 60,
        "unique_solution": [
            2,
            4,
            9,
            8,
            6,
            10
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 1,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 1,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_60_0",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_60_1",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_60_2",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_60_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_60_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_60_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_60_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_60_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_60_8",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 61,
        "unique_solution": [
            8,
            2,
            5,
            4,
            3,
            6,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 3,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_61_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_61_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_61_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_61_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_61_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_61_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_61_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_61_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_61_8",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_61_9",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 62,
        "unique_solution": [
            2,
            1,
            6,
            4,
            3,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 9,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_62_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_62_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_62_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_62_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_62_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_62_5",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_62_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_62_7",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 63,
        "unique_solution": [
            3,
            1,
            5,
            10,
            4,
            8,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 1,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 7,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 1,
                "y": 9
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 6,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_63_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_63_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_63_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_63_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_63_4",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_63_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_63_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_63_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_63_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_63_9",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 64,
        "unique_solution": [
            5,
            8,
            6,
            2,
            1,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 7,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_64_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_64_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_64_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_64_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_64_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_64_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_64_6",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_64_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_64_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 65,
        "unique_solution": [
            3,
            8,
            2,
            9,
            10,
            1,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 4,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_65_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_65_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_65_2",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_65_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_65_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_65_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_65_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_65_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_65_8",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 66,
        "unique_solution": [
            8,
            10,
            9,
            3,
            5,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 8,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 7,
                "y": 6
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 9,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_66_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_66_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_66_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_66_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_66_4",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_66_5",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_66_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_66_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_66_8",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 67,
        "unique_solution": [
            1,
            5,
            2,
            9,
            4,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 2,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 2,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 5,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_67_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_67_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_67_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_67_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_67_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_67_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_67_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_67_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_67_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 68,
        "unique_solution": [
            4,
            1,
            7,
            6,
            5,
            3,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 6,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 8,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 8,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 9,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_68_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_68_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_68_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_68_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_68_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_68_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_68_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_68_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_68_8",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 69,
        "unique_solution": [
            3,
            5,
            6,
            1,
            2,
            4,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 5,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_69_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_69_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_69_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_69_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_69_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_69_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_69_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_69_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_69_8",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_69_9",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 70,
        "unique_solution": [
            2,
            3,
            1,
            4,
            8,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 1
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 8,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_70_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_70_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_70_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_70_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_70_4",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_70_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_70_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_70_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            }
        ]
    },
    {
        "level_id": 71,
        "unique_solution": [
            1,
            4,
            10,
            6,
            7,
            9,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 7,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 5,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_71_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_71_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_71_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_71_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_71_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_71_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_71_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_71_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_71_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_71_9",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 72,
        "unique_solution": [
            2,
            10,
            6,
            5,
            7,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 7,
                "y": 6
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 3,
                "y": 6
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_72_0",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_72_1",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_72_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_72_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_72_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_72_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_72_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_72_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 73,
        "unique_solution": [
            1,
            10,
            8,
            7,
            9,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 4,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 1,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 7,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 1,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_73_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_73_1",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_73_2",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_73_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_73_4",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_73_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_73_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_73_7",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_73_8",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 74,
        "unique_solution": [
            2,
            8,
            5,
            6,
            7,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 2,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 8,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 7
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_74_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_74_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_74_2",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_74_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_74_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_74_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_74_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_74_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_74_8",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 75,
        "unique_solution": [
            5,
            6,
            10,
            8,
            7,
            3,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 2,
                "y": 10
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 4,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_75_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_75_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_75_2",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_75_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_75_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_75_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_75_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_75_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_75_8",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 76,
        "unique_solution": [
            6,
            9,
            4,
            10,
            7,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 5,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 1,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 6,
                "y": 7
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 3,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_76_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_76_1",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_76_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_76_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_76_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_76_5",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_76_6",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_76_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 77,
        "unique_solution": [
            5,
            8,
            3,
            1,
            4,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 8
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 7,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 8
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 1,
                "y": 8
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 9
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 9,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_77_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_77_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_77_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_77_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_77_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_77_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_77_6",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_77_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_77_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 78,
        "unique_solution": [
            2,
            6,
            3,
            8,
            4,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 1,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_78_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_78_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_78_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_78_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_78_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_78_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_78_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_78_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_78_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 79,
        "unique_solution": [
            4,
            2,
            6,
            7,
            5,
            3,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 8,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_79_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_79_1",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_79_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_79_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_79_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_79_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_79_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_79_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_79_8",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_79_9",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 80,
        "unique_solution": [
            10,
            9,
            6,
            8,
            7,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 2,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 6
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 4,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_80_0",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_80_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_80_2",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_80_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_80_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_80_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_80_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_80_7",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            }
        ]
    },
    {
        "level_id": 81,
        "unique_solution": [
            2,
            7,
            1,
            9,
            8,
            10,
            4,
            11
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 6,
                "y": 7
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 12,
                "camp": 0,
                "x": 2,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_81_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_81_1",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_81_2",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_81_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_81_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_81_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_81_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_81_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_81_8",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_81_9",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_81_10",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_81_11",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_81_12",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 82,
        "unique_solution": [
            7,
            6,
            4,
            9,
            3,
            2,
            10
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 9,
                "y": 8
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 3,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 11,
                "camp": 0,
                "x": 4,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_82_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_82_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_82_2",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_82_3",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_82_4",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_82_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_82_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_82_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_82_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_82_9",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_82_10",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_82_11",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 83,
        "unique_solution": [
            1,
            9,
            10,
            3,
            6,
            5,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 4,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 6,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 8,
                "y": 8
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 1,
                "y": 8
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 6,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_83_0",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_83_1",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_83_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_83_3",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_83_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_83_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_83_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_83_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_83_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_83_9",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            }
        ]
    },
    {
        "level_id": 84,
        "unique_solution": [
            5,
            4,
            7,
            3,
            6,
            9,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 9,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 1,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 3,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 2,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 7,
                "y": 3
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 8,
                "y": 8
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_84_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_84_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_84_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_84_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_84_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_84_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_84_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_84_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_84_8",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_84_9",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_84_10",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    },
    {
        "level_id": 85,
        "unique_solution": [
            10,
            6,
            3,
            7,
            2,
            1,
            4,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 2,
                "y": 5
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_85_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 2
                }
            },
            {
                "plank_id": "p_85_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_85_2",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_85_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_85_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_85_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_85_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_85_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_85_8",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_85_9",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_85_10",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_85_11",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_85_12",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 86,
        "unique_solution": [
            6,
            8,
            11,
            10,
            9,
            2,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 2,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 5,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 9,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_86_0",
                "locked_edge": {
                    "node_a": 10,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_86_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_86_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_86_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_86_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_86_5",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_86_6",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_86_7",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_86_8",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_86_9",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 87,
        "unique_solution": [
            2,
            8,
            6,
            10,
            3,
            9,
            11,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 1,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 2,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 8,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 8,
                "y": 8
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 4,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_87_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_87_1",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_87_2",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_87_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_87_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_87_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_87_6",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_87_7",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_87_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_87_9",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_87_10",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 88,
        "unique_solution": [
            5,
            7,
            11,
            10,
            3,
            9,
            1,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 9,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 6,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 4,
                "y": 2
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 7,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 7,
                "y": 8
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 4,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_88_0",
                "locked_edge": {
                    "node_a": 10,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_88_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_88_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_88_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_88_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_88_5",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_88_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_88_7",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_88_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_88_9",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_88_10",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_88_11",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_88_12",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 89,
        "unique_solution": [
            2,
            6,
            5,
            11,
            10,
            7,
            3,
            4
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 2
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 8,
                "y": 3
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 4,
                "y": 6
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 2,
                "y": 10
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 3,
                "y": 8
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 12,
                "camp": 0,
                "x": 4,
                "y": 4
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_89_0",
                "locked_edge": {
                    "node_a": 10,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_89_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_89_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_89_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_89_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_89_5",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_89_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_89_7",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_89_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_89_9",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_89_10",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 90,
        "unique_solution": [
            6,
            5,
            7,
            9,
            3,
            8,
            4,
            10
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 8,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 5,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 6,
                "y": 8
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 3,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 3,
                "y": 8
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 1,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_90_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_90_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_90_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_90_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_90_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_90_5",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_90_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_90_7",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_90_8",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_90_9",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_90_10",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_90_11",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 91,
        "unique_solution": [
            7,
            6,
            2,
            8,
            5,
            9,
            10,
            1
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 3
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 8
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 1,
                "y": 8
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 4,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_91_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_91_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_91_2",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_91_3",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_91_4",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_91_5",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_91_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_91_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_91_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_91_9",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_91_10",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_91_11",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_91_12",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 92,
        "unique_solution": [
            7,
            1,
            9,
            2,
            8,
            3,
            5,
            6
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 8,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 3,
                "y": 6
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 3,
                "y": 8
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 7,
                "camp": 0,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 6,
                "y": 9
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 8,
                "y": 6
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_92_0",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_92_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_92_2",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_92_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_92_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_92_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_92_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_92_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_92_8",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_92_9",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_92_10",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_92_11",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 93,
        "unique_solution": [
            3,
            10,
            6,
            1,
            7,
            2,
            9,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 1,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 7,
                "y": 2
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 10
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 8,
                "y": 8
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 3,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_93_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_93_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_93_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_93_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_93_4",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_93_5",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_93_6",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_93_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_93_8",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_93_9",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_93_10",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_93_11",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 94,
        "unique_solution": [
            1,
            11,
            4,
            7,
            10,
            9,
            12
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 1,
                "y": 9
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 7,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 8,
                "y": 4
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 3,
                "y": 6
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 3,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 3,
                "y": 3
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 5,
                "y": 9
            },
            {
                "node_id": 12,
                "camp": 1,
                "x": 7,
                "y": 2
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_94_0",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_94_1",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_94_2",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_94_3",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_94_4",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 12
                }
            },
            {
                "plank_id": "p_94_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_94_6",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_94_7",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_94_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_94_9",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 12
                }
            },
            {
                "plank_id": "p_94_10",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_94_11",
                "locked_edge": {
                    "node_a": 9,
                    "node_b": 12
                }
            }
        ]
    },
    {
        "level_id": 95,
        "unique_solution": [
            9,
            1,
            8,
            6,
            4,
            2,
            5,
            7
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 9,
                "y": 1
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 3,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 1,
                "y": 9
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 9,
                "y": 7
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_95_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_95_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_95_2",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_95_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_95_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_95_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_95_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_95_7",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_95_8",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_95_9",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_95_10",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 96,
        "unique_solution": [
            10,
            7,
            3,
            1,
            9,
            4,
            6,
            2
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 2,
                "y": 4
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 8,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 4,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 9,
                "y": 5
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 4,
                "y": 3
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 2,
                "y": 6
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 8,
                "y": 9
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 8,
                "y": 2
            },
            {
                "node_id": 11,
                "camp": 0,
                "x": 2,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_96_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_96_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_96_2",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_96_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_96_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_96_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_96_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_96_7",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_96_8",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_96_9",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_96_10",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_96_11",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_96_12",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 97,
        "unique_solution": [
            2,
            7,
            10,
            3,
            6,
            4,
            9
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 7,
                "y": 4
            },
            {
                "node_id": 2,
                "camp": 0,
                "x": 9,
                "y": 7
            },
            {
                "node_id": 3,
                "camp": 1,
                "x": 3,
                "y": 9
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 2,
                "y": 2
            },
            {
                "node_id": 5,
                "camp": 0,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 3,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 5,
                "y": 8
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 4,
                "y": 4
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 9,
                "y": 9
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_97_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_97_1",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_97_2",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_97_3",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_97_4",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_97_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_97_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_97_7",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_97_8",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_97_9",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_97_10",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 10
                }
            }
        ]
    },
    {
        "level_id": 98,
        "unique_solution": [
            3,
            2,
            7,
            6,
            4,
            11,
            5,
            8
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 3,
                "y": 2
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 4
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 6,
                "y": 9
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 1,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 7,
                "y": 6
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 9,
                "y": 4
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 2,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 4,
                "y": 7
            },
            {
                "node_id": 10,
                "camp": 0,
                "x": 9,
                "y": 10
            },
            {
                "node_id": 11,
                "camp": 1,
                "x": 3,
                "y": 10
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_98_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_98_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_98_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_98_3",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_98_4",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 3
                }
            },
            {
                "plank_id": "p_98_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_98_6",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_98_7",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_98_8",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_98_9",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_98_10",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 99,
        "unique_solution": [
            11,
            7,
            8,
            9,
            2,
            4,
            5,
            10
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 0,
                "x": 2,
                "y": 10
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 6,
                "y": 5
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 8,
                "y": 6
            },
            {
                "node_id": 4,
                "camp": 1,
                "x": 3,
                "y": 4
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 5,
                "y": 7
            },
            {
                "node_id": 6,
                "camp": 0,
                "x": 1,
                "y": 2
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 8,
                "y": 1
            },
            {
                "node_id": 8,
                "camp": 1,
                "x": 9,
                "y": 3
            },
            {
                "node_id": 9,
                "camp": 1,
                "x": 6,
                "y": 3
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 2,
                "y": 7
            },
            {
                "node_id": 11,
                "camp": 0,
                "x": 5,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_99_0",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_99_1",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_99_2",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_99_3",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_99_4",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_99_5",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 4
                }
            },
            {
                "plank_id": "p_99_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_99_7",
                "locked_edge": {
                    "node_a": 7,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_99_8",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_99_9",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 5
                }
            },
            {
                "plank_id": "p_99_10",
                "locked_edge": {
                    "node_a": 6,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_99_11",
                "locked_edge": {
                    "node_a": 8,
                    "node_b": 9
                }
            }
        ]
    },
    {
        "level_id": 100,
        "unique_solution": [
            4,
            7,
            2,
            6,
            1,
            10,
            5
        ],
        "nodes_config": [
            {
                "node_id": 1,
                "camp": 1,
                "x": 1,
                "y": 5
            },
            {
                "node_id": 2,
                "camp": 1,
                "x": 7,
                "y": 1
            },
            {
                "node_id": 3,
                "camp": 0,
                "x": 9,
                "y": 8
            },
            {
                "node_id": 4,
                "camp": 0,
                "x": 3,
                "y": 7
            },
            {
                "node_id": 5,
                "camp": 1,
                "x": 3,
                "y": 10
            },
            {
                "node_id": 6,
                "camp": 1,
                "x": 2,
                "y": 3
            },
            {
                "node_id": 7,
                "camp": 1,
                "x": 5,
                "y": 5
            },
            {
                "node_id": 8,
                "camp": 0,
                "x": 8,
                "y": 5
            },
            {
                "node_id": 9,
                "camp": 0,
                "x": 7,
                "y": 7
            },
            {
                "node_id": 10,
                "camp": 1,
                "x": 1,
                "y": 8
            },
            {
                "node_id": 11,
                "camp": 0,
                "x": 1,
                "y": 1
            }
        ],
        "planks_config": [
            {
                "plank_id": "p_100_0",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 11
                }
            },
            {
                "plank_id": "p_100_1",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_100_2",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_100_3",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 6
                }
            },
            {
                "plank_id": "p_100_4",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 7
                }
            },
            {
                "plank_id": "p_100_5",
                "locked_edge": {
                    "node_a": 3,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_100_6",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_100_7",
                "locked_edge": {
                    "node_a": 1,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_100_8",
                "locked_edge": {
                    "node_a": 2,
                    "node_b": 8
                }
            },
            {
                "plank_id": "p_100_9",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 10
                }
            },
            {
                "plank_id": "p_100_10",
                "locked_edge": {
                    "node_a": 5,
                    "node_b": 9
                }
            },
            {
                "plank_id": "p_100_11",
                "locked_edge": {
                    "node_a": 4,
                    "node_b": 7
                }
            }
        ]
    }
]
    ,
};
