const fs = require('fs');
const p = 'tools/rename_backups/meta-2026-04-18T02-56-17-939Z/rename-log.json';
if (!fs.existsSync(p)) { console.error('log not found', p); process.exit(1); }
const log = JSON.parse(fs.readFileSync(p, 'utf8'));
const counts = {};
log.forEach(o => counts[o.action] = (counts[o.action] || 0) + 1);
console.log('Log file:', p);
console.log('Total entries:', log.length);
console.log('Counts:', counts);
console.log('\nFirst 30 entries:');
log.slice(0, 30).forEach((e, i) => {
    console.log(`${i + 1}. [${e.map}] ${e.from} -> ${e.to} (${e.action}${e.reason ? ',' + e.reason : ''})`);
});
