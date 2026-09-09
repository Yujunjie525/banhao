const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function readPngWH(filePath) {
    try {
        const fd = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(24);
        await fd.read(buffer, 0, 24, 0);
        await fd.close();
        // check PNG signature
        if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
            return null;
        }
        // width at offset 16..19, height 20..23 big-endian
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
    } catch (e) {
        return null;
    }
}

async function md5(filePath) {
    const data = await fs.readFile(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
}

async function ensureDir(dir) {
    try { await fs.mkdir(dir, { recursive: true }); } catch (e) { }
}

async function exists(p) {
    try { await fs.access(p); return true; } catch (e) { return false; }
}

async function run() {
    const root = process.cwd();
    const mapsRoot = path.join(root, 'assets', 'subgame', 'map');
    const map1Dir = path.join(mapsRoot, 'map1');
    const targetMaps = ['map2', 'map3', 'map4', 'map5'];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRoot = path.join(root, 'tools', 'rename_backups', 'meta-' + timestamp);
    await ensureDir(backupRoot);

    // read map1 metadata
    const map1Files = await fs.readdir(map1Dir);
    const extWhitelist = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    const map1Meta = {}; // md5 -> filename
    const map1ByExact = {}; // key dim-size -> [filename]
    const map1ByDim = {}; // key dim -> [filename]

    for (const f of map1Files) {
        const full = path.join(map1Dir, f);
        const stat = await fs.stat(full).catch(() => null);
        if (!stat || !stat.isFile()) continue;
        if (f.endsWith('.meta')) continue;
        const ext = path.extname(f).toLowerCase();
        if (!extWhitelist.has(ext)) continue;
        const size = stat.size;
        const wh = await readPngWH(full) || { width: 0, height: 0 };
        const keyExact = `${wh.width}x${wh.height}-${size}`;
        const keyDim = `${wh.width}x${wh.height}`;
        if (!map1ByExact[keyExact]) map1ByExact[keyExact] = [];
        map1ByExact[keyExact].push(f);
        if (!map1ByDim[keyDim]) map1ByDim[keyDim] = [];
        map1ByDim[keyDim].push(f);
        const h = await md5(full);
        map1Meta[h] = f;
    }

    const ops = [];

    for (const m of targetMaps) {
        const dir = path.join(mapsRoot, m);
        let files;
        try { files = await fs.readdir(dir); } catch (e) { console.error(`Skip ${m}: ${e.message}`); continue; }
        for (const f of files) {
            const full = path.join(dir, f);
            const stat = await fs.stat(full).catch(() => null);
            if (!stat || !stat.isFile()) continue;
            if (f.endsWith('.meta')) continue;
            const ext = path.extname(f).toLowerCase();
            if (!extWhitelist.has(ext)) continue;

            const size = stat.size;
            const wh = await readPngWH(full) || { width: 0, height: 0 };
            const keyExact = `${wh.width}x${wh.height}-${size}`;
            const keyDim = `${wh.width}x${wh.height}`;

            let targetName = null;
            let reason = null;

            // 1) exact size+dim match unique
            if (map1ByExact[keyExact] && map1ByExact[keyExact].length === 1) {
                targetName = map1ByExact[keyExact][0];
                reason = 'exact-dim-size-unique';
            }

            // 2) exact md5 match
            if (!targetName) {
                const h = await md5(full);
                if (map1Meta[h]) {
                    targetName = map1Meta[h];
                    reason = 'md5-match';
                }
            }

            // 3) unique dim match
            if (!targetName && map1ByDim[keyDim] && map1ByDim[keyDim].length === 1) {
                targetName = map1ByDim[keyDim][0];
                reason = 'unique-dim';
            }

            // 4) if multiple candidates by dim, try to disambiguate by file size closeness
            if (!targetName && map1ByDim[keyDim] && map1ByDim[keyDim].length > 1) {
                // choose candidate with closest size
                let best = null; let bestDiff = Infinity;
                for (const cand of map1ByDim[keyDim]) {
                    const candFull = path.join(map1Dir, cand);
                    const candStat = await fs.stat(candFull).catch(() => null);
                    if (!candStat) continue;
                    const diff = Math.abs(candStat.size - size);
                    if (diff < bestDiff) { bestDiff = diff; best = cand; }
                }
                if (best && bestDiff <= Math.max(1, size * 0.05)) { // within 5% size
                    targetName = best;
                    reason = 'dim-closest-size';
                }
            }

            if (!targetName) {
                ops.push({ map: m, from: f, to: null, action: 'no-match', dim: keyDim, size });
                continue;
            }

            if (f === targetName) {
                ops.push({ map: m, from: f, to: targetName, action: 'already-same' });
                continue;
            }

            const newFull = path.join(dir, targetName);
            // backup
            const backupDir = path.join(backupRoot, m);
            await ensureDir(backupDir);
            await fs.copyFile(full, path.join(backupDir, f));
            if (await exists(full + '.meta')) await fs.copyFile(full + '.meta', path.join(backupDir, f + '.meta'));

            // handle conflict if target exists
            let conflict = false;
            if (await exists(newFull)) {
                // if target exists and identical md5, remove old file
                const newMd5 = await md5(newFull).catch(() => null);
                const oldMd5 = await md5(full).catch(() => null);
                if (newMd5 && oldMd5 && newMd5 === oldMd5) {
                    // identical: remove original
                    await fs.unlink(full);
                    if (await exists(full + '.meta')) await fs.unlink(full + '.meta');
                    ops.push({ map: m, from: f, to: targetName, action: 'deleted-duplicate', reason });
                    continue;
                } else {
                    // conflict: skip
                    ops.push({ map: m, from: f, to: targetName, action: 'conflict-skip', reason });
                    conflict = true;
                }
            }
            if (conflict) continue;

            // rename file and meta
            await fs.rename(full, newFull);
            if (await exists(full + '.meta')) {
                const oldMeta = full + '.meta';
                const newMeta = newFull + '.meta';
                if (await exists(newMeta)) {
                    // if newMeta exists and content differs, keep newMeta and remove old
                    const hh1 = await md5(oldMeta).catch(() => null);
                    const hh2 = await md5(newMeta).catch(() => null);
                    if (hh1 && hh2 && hh1 !== hh2) {
                        await fs.unlink(oldMeta);
                        ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-kept-target-meta', reason });
                    } else {
                        await fs.unlink(oldMeta);
                        ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-meta-merged', reason });
                    }
                } else {
                    await fs.rename(oldMeta, newMeta);
                    ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-and-meta', reason });
                }
            } else {
                ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-no-meta', reason });
            }
        }
    }

    const logFile = path.join(backupRoot, 'rename-log.json');
    await fs.writeFile(logFile, JSON.stringify(ops, null, 2), 'utf8');
    console.log('Done. Backup and log at:', backupRoot);
}

run().catch(err => { console.error(err); process.exit(1); });
