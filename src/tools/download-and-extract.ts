/**
 * Batch pipeline: Download .vmod files → Extract metadata → Load SQLite → Purge files.
 *
 * Processes modules from data/module-index.json in batches.
 * Resume-friendly: skips modules already in the database.
 *
 * Modes:
 *   Default:     Download new modules, extract fingerprints, load into DB
 *   --reprocess: Re-download ALL modules, extract deep metadata + store raw XML
 *
 * Usage:
 *   npx tsx src/tools/download-and-extract.ts [--batch-size 25] [--delay 1500]
 *   npx tsx src/tools/download-and-extract.ts --reprocess [--batch-size 25] [--delay 1500]
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join, basename } from 'path';
import JSZip from 'jszip';
import { parseBuildFile } from '../core/xml-parser.js';
import { openDb, initSchema, insertModule, hasModule, getModuleCount, hasDeepData, getModuleId, getModulesForReprocess, clearDeepData, insertDeepData, type InsertModuleOptions } from './corpus-db.js';
import { extractOne } from './extract-module-metadata.js';
import { extractDeep } from './extract-deep-metadata.js';
import type { ModuleIndexEntry } from './scrape-module-library.js';

const INDEX_PATH = join(process.cwd(), 'data', 'module-index.json');
const TMP_DIR = join(process.cwd(), 'data', 'vmods-tmp');
const LOG_PATH = join(process.cwd(), 'data', 'pipeline-log.json');

interface PipelineLog {
  startedAt: string;
  lastBatchAt: string;
  totalProcessed: number;
  totalErrors: number;
  errors: { filename: string; error: string }[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let batchSize = 25;
  let delay = 1500;
  let reprocess = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch-size' && args[i + 1]) batchSize = parseInt(args[++i]);
    if (args[i] === '--delay' && args[i + 1]) delay = parseInt(args[++i]);
    if (args[i] === '--reprocess') reprocess = true;
  }

  return { batchSize, delay, reprocess };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(destPath, buffer);
}

function pickLatestDownload(entry: ModuleIndexEntry): { url: string; filename: string } | null {
  if (entry.downloads.length === 0) return null;

  // Sort by version descending (simple string sort — works for most version formats)
  const sorted = [...entry.downloads].sort((a, b) => {
    // Try numeric comparison of version parts
    const aParts = a.version.split('.').map(Number);
    const bParts = b.version.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const av = aParts[i] ?? 0;
      const bv = bParts[i] ?? 0;
      if (bv !== av) return bv - av;
    }
    return 0;
  });

  return { url: sorted[0].url, filename: sorted[0].filename };
}

/**
 * Extract deep metadata from a .vmod file.
 * Returns the raw XML + deep data, or null on failure.
 */
async function extractDeepFromVmod(tmpPath: string): Promise<{ rawXml: string; deep: ReturnType<typeof extractDeep> } | null> {
  const buffer = readFileSync(tmpPath);
  const zip = await JSZip.loadAsync(buffer);
  const buildEntry = zip.file('buildFile.xml') ?? zip.file('buildFile');
  if (!buildEntry) return null;

  const rawXml = await buildEntry.async('string');
  const tree = parseBuildFile(rawXml);
  const deep = extractDeep(tree, rawXml);
  return { rawXml, deep };
}

/**
 * Reprocess mode: re-download modules that don't have deep data yet,
 * extract deep metadata, store raw XML, and purge .vmod.
 */
async function reprocessMain(batchSize: number, delay: number) {
  mkdirSync('data', { recursive: true });
  mkdirSync(TMP_DIR, { recursive: true });

  const db = openDb();
  initSchema(db);

  // Find modules needing deep extraction
  const modules = getModulesForReprocess(db);
  console.log(`🔄 ${modules.length} modules need deep extraction\n`);

  if (modules.length === 0) {
    console.log('✅ All modules already have deep data!');
    db.close();
    return;
  }

  // Also load index for download URLs
  let index: ModuleIndexEntry[] = [];
  if (existsSync(INDEX_PATH)) {
    index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
  }

  // Build URL lookup from index
  const urlMap = new Map<string, string>();
  for (const entry of index) {
    for (const dl of entry.downloads) {
      urlMap.set(dl.filename, dl.url);
    }
  }

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < modules.length; i += batchSize) {
    const batch = modules.slice(i, i + batchSize);
    console.log(`\n── Batch ${Math.floor(i / batchSize) + 1} (${batch.length} modules) ──\n`);

    for (const mod of batch) {
      process.stdout.write(`  ${mod.filename}... `);

      // Find download URL
      let downloadUrl = urlMap.get(mod.filename);
      if (!downloadUrl && mod.source_url) {
        // Try to find in index by source_url
        const entry = index.find(e => e.pageUrl === mod.source_url);
        if (entry) {
          const dl = pickLatestDownload(entry);
          if (dl) downloadUrl = dl.url;
        }
      }

      if (!downloadUrl) {
        console.log('❌ no download URL found');
        errors++;
        continue;
      }

      const tmpPath = join(TMP_DIR, mod.filename);

      try {
        process.stdout.write('downloading... ');
        await downloadFile(downloadUrl, tmpPath);

        process.stdout.write('deep-extracting... ');
        const result = await extractDeepFromVmod(tmpPath);
        if (!result) {
          console.log('❌ no buildFile.xml');
          errors++;
          try { unlinkSync(tmpPath); } catch {}
          continue;
        }

        process.stdout.write('loading... ');
        clearDeepData(db, mod.id);
        insertDeepData(db, mod.id, result.deep);

        // Purge
        try { unlinkSync(tmpPath); } catch {}

        processed++;
        const chainCount = result.deep.traitChains.length;
        const exprCount = result.deep.expressions.length;
        console.log(`✅ (${chainCount} traits, ${exprCount} exprs, ${result.deep.prototypeDefs.length} protos)`);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        errors++;
        console.log(`❌ ${errMsg}`);
        try { unlinkSync(tmpPath); } catch {}
      }

      await sleep(delay);
    }

    console.log(`\n   Batch complete. ${processed} processed so far.`);
  }

  db.close();
  console.log(`\n📊 Reprocess complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
}

async function main() {
  const { batchSize, delay, reprocess } = parseArgs();

  if (reprocess) {
    return reprocessMain(batchSize, delay);
  }

  // Load index
  if (!existsSync(INDEX_PATH)) {
    console.error(`❌ Module index not found at ${INDEX_PATH}`);
    console.error('   Run "npm run scrape:index" first.');
    process.exit(1);
  }

  const index: ModuleIndexEntry[] = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
  console.log(`📋 Loaded ${index.length} modules from index`);

  // Init DB
  mkdirSync('data', { recursive: true });
  const db = openDb();
  initSchema(db);
  const existingCount = getModuleCount(db);
  console.log(`💾 Database has ${existingCount} modules already\n`);

  // Init tmp dir
  mkdirSync(TMP_DIR, { recursive: true });

  // Load or create pipeline log
  let log: PipelineLog = {
    startedAt: new Date().toISOString(),
    lastBatchAt: '',
    totalProcessed: 0,
    totalErrors: 0,
    errors: [],
  };
  if (existsSync(LOG_PATH)) {
    try { log = JSON.parse(readFileSync(LOG_PATH, 'utf-8')); } catch { /* fresh log */ }
  }

  // Filter to unprocessed modules
  const toProcess = index.filter(entry => {
    const dl = pickLatestDownload(entry);
    return dl && !hasModule(db, dl.filename);
  });

  console.log(`🔄 ${toProcess.length} modules to process (${index.length - toProcess.length} already done)\n`);

  if (toProcess.length === 0) {
    console.log('✅ All modules already processed!');
    db.close();
    return;
  }

  // Process in batches
  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize);
    console.log(`\n── Batch ${Math.floor(i / batchSize) + 1} (${batch.length} modules) ──\n`);

    for (const entry of batch) {
      const dl = pickLatestDownload(entry)!;
      const tmpPath = join(TMP_DIR, dl.filename);

      process.stdout.write(`  ${dl.filename}... `);

      try {
        // Download
        process.stdout.write('downloading... ');
        await downloadFile(dl.url, tmpPath);

        // Extract
        process.stdout.write('extracting... ');
        const fingerprint = await extractOne(tmpPath);
        fingerprint.publisher = entry.publisher;
        fingerprint.sourceUrl = entry.pageUrl;

        // Load into DB with page metadata
        process.stdout.write('loading... ');
        const metaOpts: InsertModuleOptions = {
          pageDescription: entry.pageMetadata?.description,
          contributors: entry.pageMetadata?.contributors,
        };
        insertModule(db, fingerprint, metaOpts);

        // Purge
        try { unlinkSync(tmpPath); } catch { /* ok if already gone */ }

        log.totalProcessed++;
        console.log(`✅ (${fingerprint.pieceSlotCount} pieces, ${fingerprint.prototypeCount} protos)`);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        log.totalErrors++;
        log.errors.push({ filename: dl.filename, error: errMsg });
        console.log(`❌ ${errMsg}`);

        // Clean up failed download
        try { unlinkSync(tmpPath); } catch { /* ok */ }
      }

      // Rate limiting
      await sleep(delay);
    }

    // Save log after each batch
    log.lastBatchAt = new Date().toISOString();
    writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
    console.log(`\n   Batch complete. DB now has ${getModuleCount(db)} modules.`);
  }

  db.close();
  console.log(`\n📊 Pipeline complete!`);
  console.log(`   Processed: ${log.totalProcessed}`);
  console.log(`   Errors: ${log.totalErrors}`);
  console.log(`   Log: ${LOG_PATH}`);
}

main().catch(console.error);
