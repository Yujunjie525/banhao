const fs = require('fs');

const filePath = 'assets/resources/config/game3_levels.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const RECT_WIDTH = 180;
const RECT_HEIGHT = 140;
const SAFE_X = 195;
const SAFE_Y = 155;

const targetPatterns = {
    early: {
        2: [
            [{ x: -170, y: -150 }, { x: -10, y: 170 }],
            [{ x: 150, y: -150 }, { x: 0, y: 170 }],
            [{ x: -110, y: -150 }, { x: 160, y: 160 }],
            [{ x: 110, y: -150 }, { x: -160, y: 160 }],
            [{ x: -40, y: -160 }, { x: 160, y: 150 }],
            [{ x: 40, y: -160 }, { x: -160, y: 150 }],
        ],
        3: [
            [{ x: -170, y: -170 }, { x: 40, y: 10 }, { x: 170, y: 230 }],
            [{ x: 170, y: -170 }, { x: -40, y: 10 }, { x: -170, y: 230 }],
            [{ x: -110, y: -180 }, { x: 170, y: 0 }, { x: -20, y: 240 }],
            [{ x: 110, y: -180 }, { x: -170, y: 0 }, { x: 20, y: 240 }],
        ],
    },
    easyMid: {
        2: [
            [{ x: -180, y: -170 }, { x: 40, y: 170 }],
            [{ x: 180, y: -170 }, { x: -40, y: 170 }],
            [{ x: -130, y: -160 }, { x: 170, y: 150 }],
            [{ x: 130, y: -160 }, { x: -170, y: 150 }],
            [{ x: -20, y: -170 }, { x: 180, y: 180 }],
            [{ x: 20, y: -170 }, { x: -180, y: 180 }],
        ],
        3: [
            [{ x: -180, y: -180 }, { x: 20, y: -10 }, { x: 180, y: 240 }],
            [{ x: 180, y: -180 }, { x: -20, y: -10 }, { x: -180, y: 240 }],
            [{ x: -140, y: -180 }, { x: 160, y: 10 }, { x: 0, y: 250 }],
            [{ x: 140, y: -180 }, { x: -160, y: 10 }, { x: 0, y: 250 }],
        ],
    },
    medium: {
        2: [
            [{ x: -190, y: -180 }, { x: 70, y: 180 }],
            [{ x: 190, y: -180 }, { x: -70, y: 180 }],
            [{ x: -150, y: -170 }, { x: 190, y: 160 }],
            [{ x: 150, y: -170 }, { x: -190, y: 160 }],
            [{ x: -60, y: -180 }, { x: 190, y: 200 }],
            [{ x: 60, y: -180 }, { x: -190, y: 200 }],
        ],
        3: [
            [{ x: -190, y: -190 }, { x: 60, y: -20 }, { x: 190, y: 250 }],
            [{ x: 190, y: -190 }, { x: -60, y: -20 }, { x: -190, y: 250 }],
            [{ x: -150, y: -190 }, { x: 190, y: 0 }, { x: -30, y: 260 }],
            [{ x: 150, y: -190 }, { x: -190, y: 0 }, { x: 30, y: 260 }],
        ],
    },
    hard: {
        2: [
            [{ x: -200, y: -190 }, { x: 90, y: 190 }],
            [{ x: 200, y: -190 }, { x: -90, y: 190 }],
            [{ x: -170, y: -180 }, { x: 200, y: 170 }],
            [{ x: 170, y: -180 }, { x: -200, y: 170 }],
            [{ x: -80, y: -190 }, { x: 200, y: 210 }],
            [{ x: 80, y: -190 }, { x: -200, y: 210 }],
        ],
        3: [
            [{ x: -200, y: -200 }, { x: 70, y: -20 }, { x: 200, y: 260 }],
            [{ x: 200, y: -200 }, { x: -70, y: -20 }, { x: -200, y: 260 }],
            [{ x: -170, y: -200 }, { x: 200, y: 0 }, { x: -40, y: 270 }],
            [{ x: 170, y: -200 }, { x: -200, y: 0 }, { x: 40, y: 270 }],
        ],
    },
};

const fillerCandidates = {
    early: [
        { x: -240, y: 300 }, { x: 240, y: 300 }, { x: -220, y: 80 }, { x: 220, y: 80 },
        { x: 0, y: 310 }, { x: -230, y: -40 }, { x: 230, y: -40 }, { x: 0, y: 70 },
        { x: -120, y: 250 }, { x: 120, y: 250 }, { x: -120, y: 40 }, { x: 120, y: 40 },
    ],
    easyMid: [
        { x: -250, y: 320 }, { x: 250, y: 320 }, { x: -230, y: 110 }, { x: 230, y: 110 },
        { x: 0, y: 330 }, { x: -240, y: -30 }, { x: 240, y: -30 }, { x: 0, y: 90 },
        { x: -130, y: 270 }, { x: 130, y: 270 }, { x: -130, y: 30 }, { x: 130, y: 30 },
    ],
    medium: [
        { x: -250, y: 330 }, { x: 250, y: 330 }, { x: -230, y: 140 }, { x: 230, y: 140 },
        { x: 0, y: 340 }, { x: -240, y: -20 }, { x: 240, y: -20 }, { x: 0, y: 110 },
        { x: -140, y: 290 }, { x: 140, y: 290 }, { x: -140, y: 20 }, { x: 140, y: 20 },
        { x: -70, y: 220 }, { x: 70, y: 220 },
    ],
    hard: [
        { x: -260, y: 340 }, { x: 260, y: 340 }, { x: -240, y: 160 }, { x: 240, y: 160 },
        { x: 0, y: 350 }, { x: -250, y: -10 }, { x: 250, y: -10 }, { x: 0, y: 130 },
        { x: -150, y: 300 }, { x: 150, y: 300 }, { x: -150, y: 10 }, { x: 150, y: 10 },
        { x: -80, y: 230 }, { x: 80, y: 230 }, { x: -80, y: 40 }, { x: 80, y: 40 },
    ],
};

const fillerChars = ['风', '云', '山', '月', '江', '海', '天', '雨', '雷', '霜', '雪', '潮', '舟', '星', '花', '松', '泉', '石', '柳', '雁'];

function getBucket(level) {
    if (level <= 10) return 'early';
    if (level <= 25) return 'easyMid';
    if (level <= 50) return 'medium';
    return 'hard';
}

function desiredEnemyCount(level, targetCount) {
    if (level <= 5) return targetCount + 2;
    if (level <= 10) return targetCount + 3;
    if (level <= 20) return targetCount + 4;
    if (level <= 40) return targetCount + 5;
    if (level <= 60) return targetCount + 6;
    if (level <= 80) return targetCount + 7;
    return targetCount + 8;
}

function rectConflict(a, b) {
    return Math.abs(a.x - b.x) < SAFE_X && Math.abs(a.y - b.y) < SAFE_Y;
}

for (const stage of data.stages) {
    const targets = stage.enemies.filter((enemy) => enemy.isTarget);
    const fillersOld = stage.enemies.filter((enemy) => !enemy.isTarget);
    const bucket = getBucket(stage.level);
    const patterns = targetPatterns[bucket][targets.length];
    const variant = patterns[(stage.level - 1) % patterns.length];
    const targetCount = targets.length;
    const needCount = desiredEnemyCount(stage.level, targetCount);
    const fillerPool = fillerChars.filter((char) => !targets.some((enemy) => enemy.char === char));

    for (let i = 0; i < targetCount; i++) {
        targets[i].position = { ...variant[i] };
    }

    const chosen = targets.map((enemy) => enemy.position);
    const newEnemies = [...targets];
    const candidates = fillerCandidates[bucket];
    let fillerIndex = 0;

    for (let i = 0; i < candidates.length && newEnemies.length < needCount; i++) {
        const candidate = candidates[(i + stage.level) % candidates.length];
        if (chosen.some((position) => rectConflict(position, candidate))) {
            continue;
        }
        if (newEnemies.filter((enemy) => !enemy.isTarget).some((enemy) => rectConflict(enemy.position, candidate))) {
            continue;
        }
        const old = fillersOld[fillerIndex];
        newEnemies.push({
            id: old ? old.id : `M${(stage.level - 1).toString().padStart(2, '0')}${(newEnemies.length + 1).toString().padStart(2, '0')}`,
            char: old?.char || fillerPool[fillerIndex % fillerPool.length],
            position: { ...candidate },
        });
        fillerIndex += 1;
    }

    stage.enemies = newEnemies;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
