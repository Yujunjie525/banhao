#!/usr/bin/env node
const fs = require('fs');

const inPath = process.argv[2];
const outPath = process.argv[3] || (inPath + '.formatted');
if (!inPath) {
    console.error('Usage: node format_json_compact_arrays.js <input.json> [output.json]');
    process.exit(1);
}

let text;
try { text = fs.readFileSync(inPath, 'utf8'); } catch (e) { console.error('Read error:', e.message); process.exit(2); }

let data;
try { data = JSON.parse(text); } catch (e) { console.error('JSON parse error:', e.message); process.exit(3); }

function isPrimitive(v) {
    const t = typeof v;
    return v === null || t === 'number' || t === 'string' || t === 'boolean';
}

function formatValue(v, level) {
    const indent = '  ';
    const pad = indent.repeat(level);
    if (Array.isArray(v)) {
        if (v.length === 0) return '[]';
        if (v.every(isPrimitive)) {
            return '[' + v.map(x => JSON.stringify(x)).join(',') + ']';
        }
        const inner = v.map(x => pad + indent + formatValue(x, level + 1)).join(',\n');
        return '[\n' + inner + '\n' + pad + ']';
    }
    if (v && typeof v === 'object') {
        const keys = Object.keys(v);
        if (keys.length === 0) return '{}';
        const inner = keys.map(k => pad + '  ' + JSON.stringify(k) + ': ' + formatValue(v[k], level + 1)).join(',\n');
        return '{\n' + inner + '\n' + pad + '}';
    }
    return JSON.stringify(v);
}

const out = formatValue(data, 0) + '\n';
try {
    fs.writeFileSync(outPath, out, 'utf8');
    console.log('WROTE', outPath);
} catch (e) {
    console.error('Write error:', e.message);
    process.exit(4);
}
