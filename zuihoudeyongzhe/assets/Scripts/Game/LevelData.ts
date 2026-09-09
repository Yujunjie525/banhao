var levelData = [
  //下标0位空
  {},


  //第1关
  {
    enemyTimeDelayed: 0.3,//刷新敌机间隔
    enemyNum: 1,//敌机个数
    passScore: 30,//通过分数条件

    boss: ["boss2"],

    enemy: [
   
      "enemy2", //发生三个子弹的白色飞机
    
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机

    ],

    //随机数
    enemyRandomNUm: [

      10,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],    boxRandomNUm: [
      2,
      2.7,
      3.4,
      4.8,
      6.5,
      9.2,
      11.5,
      20,
      50,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg1"


  },


  //第2关

  {
    enemyTimeDelayed: 0.3,//刷新敌机间隔
    enemyNum: 1,//敌机个数
    passScore: 60,//通过分数条件

    boss: ["boss1"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      //  "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机
    ],

    //随机数
    enemyRandomNUm: [
      2,
      //  3,
      4,
      9,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      2,
      2.7,
      3.4,
      4.8,
      6.5,
      9.2,
      11.5,
      20,
      50,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg2"


  },

  //第3关
  {
    enemyTimeDelayed: 0.3,//刷新敌机间隔
    enemyNum: 1,//敌机个数
    passScore: 90,//通过分数条件

    boss: ["boss3"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机

    ],

    //随机数
    enemyRandomNUm: [
      2,
      3,
      4,
      9,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      2,
      2.7,
      3.4,
      4.8,
      6.5,
      9.2,
      11.5,
      20,
      50,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg3"


  },
  //第4关


  {
    enemyTimeDelayed: 0.4,//刷新敌机间隔
    enemyNum: 2,//敌机个数
    passScore: 120,//通过分数条件

    boss: ["boss4"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机
    ],

    //随机数
    enemyRandomNUm: [
      2,
      3,
      4,
      9,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      2,
      2.7,
      3.4,
      4.8,
      6.5,
      9.2,
      11.5,
      20,
      50,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg4"


  },
  //第5关

  {
    enemyTimeDelayed: 0.6,//刷新敌机间隔
    enemyNum: 3,//敌机个数
    passScore: 150,//通过分数条件

    boss: ["boss5"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机
    ],

    //随机数
    enemyRandomNUm: [
      2,
      3,
      4,
      9,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      2,
      2.7,
      3.4,
      4.8,
      6.5,
      9.2,
      11.5,
      15,
      30,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg5"


  },
  //第6关


  {
    enemyTimeDelayed: 0.5,//刷新敌机间隔
    enemyNum: 3,//敌机个数
    passScore: 180,//通过分数条件

    boss: ["boss6"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机
    ],

    //随机数
    enemyRandomNUm: [
      2,
      3,
      4,
      9,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      0.2,

      0.4,
      0.5,

      0.79,
      0.85,
      1,

      2,

      15,
      30,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg6"


  },
  //第7关

  {
    enemyTimeDelayed: 0.2,//刷新敌机间隔
    enemyNum: 2,//敌机个数
    passScore: 210,//通过分数条件

    boss: ["boss7"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机
    ],

    //随机数
    enemyRandomNUm: [
      2,
      3,
      4,
      9,
      10,
      45
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      0.2,

      0.4,
      0.5,

      0.79,
      0.85,
      1,

      2,

      15,
      30,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg1"


  },

  //第8关
  {
    enemyTimeDelayed: 0.3,//刷新敌机间隔
    enemyNum: 4,//敌机个数
    passScore: 240,//通过分数条件

    boss: ["boss8"],

    enemy: [
      "enemy3", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的黄色飞机
      "enemy2", //发生三个子弹的白色飞机
      "enemy4", //直升机
      "enemy5", //拖尾蓝色飞机
      "enemy1"  //小飞机
    ],

    //随机数
    enemyRandomNUm: [
      2,
      3,
      4,
      9,
      22,
      100
    ],
    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],
    boxRandomNUm: [
      0.2,

      0.4,
      0.5,

      0.79,
      0.85,
      1,

      2,

      15,
      30,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔  、、
    boxNum: 1,//补给个数

    maps: "gameBg2"


  },



  //第9关
  {
    enemyTimeDelayed: 0.5,//刷新敌机间隔
    enemyNum: 6,//敌机个数
    passScore: 270,//通过分数条件
    boss: ["boss9"],
    enemy: [
      "enemy9", //发生弹幕的大飞机
      "enemy6", //瞄准玩家的飞机

      "enemy10", //直升机
      "enemy8", //三个子弹
   
      "enemy11", //拖尾飞机
      "enemy7", //小飞机

    

    ],

    //随机数
    enemyRandomNUm: [
 
      2,
      4,
      10,
      16,
      22,
      100
    ],

    box: [
      "hedan_award",//核弹直接爆炸

      "skill_1award",//技能1普通导弹
      "skill_2award",//技能2寒冰导弹


      "box3",//技能3  一排子弹技能
      "box2",//技能2  三个粉色圆圈技能
      "box1",//技能1  粒子特效技能

      "box4",//红心
      "game_medal",
      "game_gold",
    ],

    boxRandomNUm: [
      0.2,

      0.4,
      0.5,

      0.79,
      0.85,
      1,

      2,

      10,
      20,
    ],//随机数   //从小到大判断 数越大概率越大

    boxTimeDelayed: 10,//刷新补给间隔
    boxNum: 1,//补给个数

    maps: "gameBg2"


  },
  
  // 第10-75关
  ...Array.from({ length: 66 }, (_, i) => {
    const level = i + 10;
    const passScore = 30 + level * 10; // 每关增加10分
    const enemyTimeDelayed = Math.max(0.1, 0.3 - (level - 1) * 0.002); // 逐渐减少刷新间隔
    const enemyNum = Math.min(8, 1 + Math.floor((level - 1) / 5)); // 每5关增加1个敌机
    const bossIndex = (level - 1) % 9 + 1; // 循环使用boss1-9
    const mapIndex = (level - 1) % 6 + 1; // 循环使用gameBg1-6
    
    return {
      enemyTimeDelayed: enemyTimeDelayed,
      enemyNum: enemyNum,
      passScore: passScore,
      boss: [`boss${bossIndex}`],
      enemy: [
        "enemy3", // 发生弹幕的大飞机
        "enemy6", // 瞄准玩家的黄色飞机
        "enemy2", // 发生三个子弹的白色飞机
        "enemy4", // 直升机
        "enemy5", // 拖尾蓝色飞机
        "enemy1"  // 小飞机
      ],
      enemyRandomNUm: [2, 3, 4, 9, 22, 100],
      box: [
        "hedan_award",//核弹直接爆炸
        "skill_1award",//技能1普通导弹
        "skill_2award",//技能2寒冰导弹
        "box3",//技能3  一排子弹技能
        "box2",//技能2  三个粉色圆圈技能
        "box1",//技能1  粒子特效技能
        "box4",//红心
        "game_medal",
        "game_gold",
      ],
      boxRandomNUm: [0.2, 0.4, 0.5, 0.79, 0.85, 1, 2, 15, 30],
      boxTimeDelayed: 10,
      boxNum: 1,
      maps: `gameBg${mapIndex}`
    };
  })
];






export default levelData;