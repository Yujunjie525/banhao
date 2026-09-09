const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function hashFile(filePath) {
    const data = await fs.readFile(filePath);
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
}

async function ensureDir(dir) {
    try { await fs.mkdir(dir, { recursive: true }); } catch (e) { }
}

async function run() {
    const root = process.cwd();
    const mapsRoot = path.join(root, 'assets', 'subgame', 'map');
    const map1Dir = path.join(mapsRoot, 'map1');
    const targetMaps = ['map2', 'map3', 'map4', 'map5'];

    // gather map1 hashes
    const map1Files = await fs.readdir(map1Dir);
    const extWhitelist = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    const map1Hash = {}; // hash -> filename

    for (const f of map1Files) {
        const full = path.join(map1Dir, f);
        const stat = await fs.stat(full);
        if (!stat.isFile()) continue;
        if (f.endsWith('.meta')) continue;
        const ext = path.extname(f).toLowerCase();
        if (!extWhitelist.has(ext)) continue;
        const h = await hashFile(full);
        if (!map1Hash[h]) map1Hash[h] = f;
        else console.warn(`Warning: duplicate hash in map1 for ${f} and ${map1Hash[h]}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRoot = path.join(root, 'tools', 'rename_backups', timestamp);
    await ensureDir(backupRoot);

    const ops = [];

    for (const m of targetMaps) {
        const dir = path.join(mapsRoot, m);
        let files;
        try { files = await fs.readdir(dir); } catch (e) { console.error(`Skip ${m}: ${e.message}`); continue; }
        for (const f of files) {
            const full = path.join(dir, f);
            const stat = await fs.stat(full);
            if (!stat.isFile()) continue;
            if (f.endsWith('.meta')) continue;
            const ext = path.extname(f).toLowerCase();
            if (!extWhitelist.has(ext)) continue;
            const h = await hashFile(full);
            const targetName = map1Hash[h];
            if (!targetName) continue; // no matching shape in map1

            // if same name already, skip
            if (f === targetName) continue;

            const newFull = path.join(dir, targetName);
            // conflict handling
            let skip = false;
            try {
                const stat2 = await fs.stat(newFull);
                if (stat2.isFile()) {
                    const h2 = await hashFile(newFull);
                    if (h2 === h) {
                        // target exists and identical: remove old file and its meta
                        const backupDir = path.join(backupRoot, m);
                        await ensureDir(backupDir);
                        await fs.copyFile(full, path.join(backupDir, f));
                        // move meta as well if exists
                        if (await exists(full + '.meta')) {
                            await fs.copyFile(full + '.meta', path.join(backupDir, f + '.meta'));
                        }
                        await fs.unlink(full);
                        if (await exists(full + '.meta')) await fs.unlink(full + '.meta');
                        ops.push({ map: m, from: f, to: targetName, action: 'deleted-duplicate' });
                        continue;
                    } else {
                        console.warn(`Conflict: ${newFull} exists and differs. Skipping ${full}`);
                        ops.push({ map: m, from: f, to: targetName, action: 'conflict-skip' });
                        skip = true;
                    }
                }
            } catch (e) {
                // newFull does not exist -> proceed
            }
            if (skip) continue;

            // backup original
            const backupDir = path.join(backupRoot, m);
            await ensureDir(backupDir);
            await fs.copyFile(full, path.join(backupDir, f));
            if (await exists(full + '.meta')) await fs.copyFile(full + '.meta', path.join(backupDir, f + '.meta'));

            // move files (rename)
            await fs.rename(full, newFull);
            if (await exists(full + '.meta')) {
                const oldMeta = full + '.meta';
                const newMeta = newFull + '.meta';
                // if newMeta exists, ensure same content
                if (await exists(newMeta)) {
                    const hh1 = await hashFile(oldMeta);
                    const hh2 = await hashFile(newMeta);
                    if (hh1 !== hh2) {
                        console.warn(`Meta conflict for ${newMeta}; keeping existing meta, removing old meta`);
                        await fs.unlink(oldMeta);
                        ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-kept-target-meta' });
                    } else {
                        // identical meta => remove old meta
                        await fs.unlink(oldMeta);
                        ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-meta-merged' });
                    }
                } else {
                    await fs.rename(oldMeta, newMeta);
                    ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-and-meta' });
                }
            } else {
                ops.push({ map: m, from: f, to: targetName, action: 'renamed-file-no-meta' });
            }
        }
    }

    const logFile = path.join(backupRoot, 'rename-log.json');
    await fs.writeFile(logFile, JSON.stringify(ops, null, 2), 'utf8');
    console.log('Done. Backup and log at:', backupRoot);
}

async function exists(p) {
    try { await fs.access(p); return true; } catch (e) { return false; }
}

run().catch(err => { console.error(err); process.exit(1); });
