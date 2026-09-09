#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cfgPath = path.join(__dirname, '..', 'assets', 'resources', 'config', 'config.json');
if (!fs.existsSync(cfgPath)) {
    console.error('config.json not found at', cfgPath);
    process.exit(1);
}
const data = fs.readFileSync(cfgPath, 'utf8');
let cfg;
try {
    cfg = JSON.parse(data);
} catch (e) {
    console.error('Failed to parse JSON:', e.message);
    process.exit(1);
}

function findMapArray(obj) {
    if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && 'mapId' in val[0]) {
                if (val.every(it => it && typeof it === 'object' && ('mapId' in it))) return val;
            } else if (val && typeof val === 'object') {
                const res = findMapArray(val);
                if (res) return res;
            }
        }
    }
    return null;
}

const mapArr = findMapArray(cfg);
if (!mapArr) {
    console.error('mapConfig-like array not found in config.json');
    process.exit(1);
}

const backupPath = cfgPath + '.bak.' + new Date().toISOString().replace(/[:.]/g, '-');
fs.copyFileSync(cfgPath, backupPath);

let changed = 0;
for (let i = 0; i < mapArr.length; i++) {
    const item = mapArr[i];
    if (item && typeof item === 'object') {
        if (!Object.prototype.hasOwnProperty.call(item, 'mapIcon')) {
            const val = Math.floor(Math.random() * 5) + 1;
            const newObj = {};
            let inserted = false;
            for (const key of Object.keys(item)) {
                newObj[key] = item[key];
                if (key === 'addCount') {
                    newObj['mapIcon'] = val;
                    inserted = true;
                }
            }
            if (!inserted) {
                newObj['mapIcon'] = val;
            }
            mapArr[i] = newObj;
            changed++;
        }
    }
}

fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
console.log('Backup created at:', backupPath);
console.log('mapIcon added to', changed, 'mapConfig entries.');
