/**
 * upload-assets.js
 * ─────────────────
 * Uploads all INFT stage and item images to 0G Storage.
 * Prints the resulting root hashes so you can paste them into .env.
 *
 * Usage:
 *   node scripts/upload-assets.js
 *
 * Prerequisites:
 *   - .env must have PRIVATE_KEY set with testnet OG tokens
 *   - beyond-the-fog-next/public/assets/images/ must exist (sibling directory)
 */

import dotenv from 'dotenv';
dotenv.config();

import { INFTManager } from '../INFTManager.js';

async function main() {
    console.log('🚀 Starting asset upload to 0G Storage...\n');

    const manager = new INFTManager();

    // Give the storage manager a moment to initialise
    await new Promise(r => setTimeout(r, 2000));

    const results = await manager.uploadGameAssets();

    console.log('\n✅ Upload complete. Add the following to your .env:\n');

    const envLines = [];
    for (const [stage, hash] of Object.entries(results.stageImages)) {
        if (hash) envLines.push(`${stage.toUpperCase()}_IMAGE_CID=${hash}`);
    }
    for (const [item, hash] of Object.entries(results.itemImages)) {
        if (hash) envLines.push(`ITEM_${item.toUpperCase()}_CID=${hash}`);
    }

    console.log(envLines.join('\n'));
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Asset upload failed:', err);
    process.exit(1);
});
