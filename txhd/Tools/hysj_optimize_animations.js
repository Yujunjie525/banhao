/*
 * Non-destructive animation optimizer for Hysj.
 *
 * Usage:
 *   node hysj_optimize_animations.js --sharp C:/path/to/node_modules/sharp \
 *     --source ../Assets/Resources/HysjLegacy/anim \
 *     --output ../Assets/HysjOptimized/anim
 *
 * The optimizer keeps the original frame folders untouched. It samples each
 * sequence using frame-to-frame image differences, then writes palette PNGs
 * and a manifest containing the original frame indices and durations.
 */

const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const sharpModule = arg('--sharp', process.env.HYSJ_SHARP);
if (!sharpModule) {
  throw new Error('Pass --sharp with the absolute path to the sharp module.');
}
const sharp = require(sharpModule);

const sourceRoot = path.resolve(arg('--source', path.join(__dirname, '..', 'Assets/Resources/HysjLegacy/anim')));
// Keep generated copies outside Resources until their visual parity is accepted;
// otherwise Unity would package both the original and optimized frames.
const outputRoot = path.resolve(arg('--output', path.join(__dirname, '..', 'Assets/HysjOptimized/anim')));
const sourceFps = Number(arg('--fps', '24'));
const dryRun = process.argv.includes('--dry-run');
const maxFramesByType = { role: 32, flower: 16, laoshu: 12 };

function numericFrame(file) {
  const match = file.match(/_(\d+)\.png$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function allPngFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.png$/i.test(entry.name))
    .map(entry => path.join(directory, entry.name))
    .sort((left, right) => numericFrame(left) - numericFrame(right) || left.localeCompare(right));
}

function allSequenceDirectories(root, relative = '') {
  const absolute = path.join(root, relative);
  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  const result = [];
  if (entries.some(entry => entry.isFile() && /\.png$/i.test(entry.name))) result.push(relative);
  for (const entry of entries) {
    if (entry.isDirectory()) result.push(...allSequenceDirectories(root, path.join(relative, entry.name)));
  }
  return result;
}

async function metric(file) {
  const result = await sharp(file)
    .resize({ width: 32, height: 32, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return result;
}

function difference(left, right) {
  const count = Math.min(left.data.length, right.data.length);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.abs(left.data[i] - right.data[i]);
  return count === 0 ? 0 : total / (count * 255);
}

function chooseFrames(differences, target) {
  const frameCount = differences.length + 1;
  if (frameCount <= target) return Array.from({ length: frameCount }, (_, index) => index);

  const selected = new Set([0, frameCount - 1]);
  const candidates = [];
  for (let index = 1; index < frameCount - 1; index++) {
    const score = differences[index - 1];
    const before = differences[index - 2] || 0;
    const after = differences[index] || 0;
    candidates.push({ index, score, peak: score >= before && score >= after });
  }
  candidates.sort((left, right) => Number(right.peak) - Number(left.peak) || right.score - left.score);

  const minimumSpacing = Math.max(1, Math.floor(frameCount / target / 2));
  for (const candidate of candidates) {
    if (selected.size >= target) break;
    const tooClose = [...selected].some(existing => Math.abs(existing - candidate.index) < minimumSpacing);
    if (!tooClose) selected.add(candidate.index);
  }

  for (let slot = 1; selected.size < target && slot < target; slot++) {
    const index = Math.round(slot * (frameCount - 1) / (target - 1));
    selected.add(index);
  }
  return [...selected].sort((left, right) => left - right);
}

async function optimizeSequence(relative) {
  const sourceDirectory = path.join(sourceRoot, relative);
  const files = allPngFiles(sourceDirectory);
  if (files.length === 0) return null;

  const type = relative.split(path.sep)[0].toLowerCase();
  const target = Math.min(files.length, maxFramesByType[type] || 16);
  const metrics = [];
  for (const file of files) metrics.push(await metric(file));
  const differences = [];
  for (let index = 1; index < metrics.length; index++) differences.push(difference(metrics[index - 1], metrics[index]));
  const selected = chooseFrames(differences, target);
  const outputDirectory = path.join(outputRoot, relative);
  const frames = [];

  for (let selectedIndex = 0; selectedIndex < selected.length; selectedIndex++) {
    const sourceIndex = selected[selectedIndex];
    const sourceFile = files[sourceIndex];
    const outputFile = path.join(outputDirectory, path.basename(sourceFile));
    const durationFrames = (selected[selectedIndex + 1] ?? files.length) - sourceIndex;
    if (!dryRun) {
      fs.mkdirSync(outputDirectory, { recursive: true });
      await sharp(sourceFile)
        .png({ palette: true, colours: 256, quality: 90, compressionLevel: 9, adaptiveFiltering: true })
        .toFile(outputFile);
    }
    frames.push({
      file: path.basename(sourceFile),
      sourceIndex,
      durationFrames,
      durationSeconds: Number((durationFrames / sourceFps).toFixed(6)),
      changeScore: Number((sourceIndex === 0 ? 0 : differences[sourceIndex - 1]).toFixed(6))
    });
  }

  return {
    type,
    source: relative.split(path.sep).join('/'),
    sourceFrameCount: files.length,
    optimizedFrameCount: selected.length,
    sourceFps,
    frames
  };
}

async function main() {
  if (!fs.existsSync(sourceRoot)) throw new Error(`Source directory not found: ${sourceRoot}`);
  const sequences = allSequenceDirectories(sourceRoot);
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceRoot: 'Assets/Resources/HysjLegacy/anim',
    outputRoot: 'Assets/HysjOptimized/anim',
    sampling: maxFramesByType,
    sequences: []
  };

  for (const sequence of sequences) {
    const result = await optimizeSequence(sequence);
    if (result) manifest.sequences.push(result);
  }

  if (!dryRun) {
    fs.mkdirSync(outputRoot, { recursive: true });
    fs.writeFileSync(path.join(outputRoot, 'animation_manifest.json'), JSON.stringify(manifest, null, 2));
  }

  const sourceFrames = manifest.sequences.reduce((total, item) => total + item.sourceFrameCount, 0);
  const optimizedFrames = manifest.sequences.reduce((total, item) => total + item.optimizedFrameCount, 0);
  console.log(JSON.stringify({ sequences: manifest.sequences.length, sourceFrames, optimizedFrames, outputRoot }, null, 2));
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
