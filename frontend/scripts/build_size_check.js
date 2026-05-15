import fs from 'fs';
import path from 'path';

// [R6] Build Governance: Critical Main Chunk Size Limit
const MAX_MAIN_CHUNK_SIZE_KB = 600;

const distAssetsPath = path.resolve(process.cwd(), 'dist', 'assets');

if (!fs.existsSync(distAssetsPath)) {
  console.error("Error: dist/assets not found. Run 'npm run build' first.");
  process.exit(1);
}

const files = fs.readdirSync(distAssetsPath);
// Find the main index chunk, usually named index-[hash].js
const mainChunkFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

if (!mainChunkFile) {
  console.warn("Warning: Could not identify main index chunk. Bypassing size check.");
  process.exit(0);
}

const mainChunkPath = path.join(distAssetsPath, mainChunkFile);
const stats = fs.statSync(mainChunkPath);
const sizeKb = stats.size / 1024;

console.log(`[R6 Governance] Main Chunk Size: ${sizeKb.toFixed(2)} KB`);

if (sizeKb > MAX_MAIN_CHUNK_SIZE_KB) {
  console.error(
    `\n❌ GOVERNANCE FAILURE: Critical Main Chunk exceeds ${MAX_MAIN_CHUNK_SIZE_KB}KB limit!`
  );
  console.error(
    `Current size: ${sizeKb.toFixed(2)} KB. ` +
    `You must lazy-load heavier dependencies or update 'manualChunks' in vite.config.ts.\n`
  );
  process.exit(1);
} else {
  console.log(`✅ GOVERNANCE PASSED: Main Chunk is within limits.\n`);
  process.exit(0);
}
