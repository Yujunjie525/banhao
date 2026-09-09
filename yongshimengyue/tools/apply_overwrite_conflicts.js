const fs = require('fs').promises;
const path = require('path');

async function ensureDir(dir) {
    try { await fs.mkdir(dir, { recursive: true }); } catch (e) { }
}
async function exists(p) { try { await fs.access(p); return true; } catch (e) { return false; } }

async function run() {
    const root = process.cwd();
    const logPath = process.argv[2] || 'tools/rename_backups/meta-2026-04-18T02-56-17-939Z/rename-log.json';
    if (!await exists(logPath)) {
        console.error('Log not found:', logPath);
        process.exit(1);
    }

    const log = JSON.parse(await fs.readFile(logPath, 'utf8'));
    const conflicts = log.filter(e => e.action === 'conflict-skip' && e.to);
    if (!conflicts.length) {
        console.log('No conflict-skip entries found.');
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRoot = path.join(root, 'tools', 'rename_backups', 'overwrite-' + timestamp);
    await ensureDir(backupRoot);

    const mapsRoot = path.join(root, 'assets', 'subgame', 'map');
    const applyLog = [];

    for (const e of conflicts) {
        const mapDir = path.join(mapsRoot, e.map);
        const src = path.join(mapDir, e.from);
        const dst = path.join(mapDir, e.to);
        const mapBackupDir = path.join(backupRoot, e.map);
        await ensureDir(mapBackupDir);

        if (!await exists(src)) {
            applyLog.push({ map: e.map, from: e.from, to: e.to, status: 'src-missing' });
            continue;
        }

        try {
            // backup existing dst
            if (await exists(dst)) {
                await fs.copyFile(dst, path.join(mapBackupDir, path.basename(dst)));
                if (await exists(dst + '.meta')) await fs.copyFile(dst + '.meta', path.join(mapBackupDir, path.basename(dst + '.meta')));
                await fs.unlink(dst);
            }

            // rename src -> dst
            await fs.rename(src, dst);

            // handle meta
            const srcMeta = src + '.meta';
            const dstMeta = dst + '.meta';
            if (await exists(srcMeta)) {
                if (await exists(dstMeta)) await fs.unlink(dstMeta);
                await fs.rename(srcMeta, dstMeta);
            }

            applyLog.push({ map: e.map, from: e.from, to: e.to, status: 'overwritten' });
        } catch (err) {
            applyLog.push({ map: e.map, from: e.from, to: e.to, status: 'error', message: String(err) });
        }
    }

    const outFile = path.join(backupRoot, 'apply-overwrite-log.json');
    await fs.writeFile(outFile, JSON.stringify(applyLog, null, 2), 'utf8');
    console.log('Done. Backup & apply log at:', backupRoot);
}

run().catch(err => { console.error(err); process.exit(1); });
