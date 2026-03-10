/**
 * Corpus analysis — runs SQL queries and outputs a human-readable report.
 *
 * Usage:
 *   npx tsx src/tools/analyze-corpus.ts
 */

import { openDb } from './corpus-db.js';

function bar(pct: number, width = 20): string {
  const filled = Math.round(pct / (100 / width));
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
}

function main() {
  const db = openDb();

  const totalModules = (db.prepare('SELECT COUNT(*) as cnt FROM modules').get() as any).cnt;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  VASSAL Module Corpus Analysis — ${totalModules} modules`);
  console.log(`${'='.repeat(70)}\n`);

  // ── Feature Prevalence ──
  console.log('── Feature Prevalence ──\n');
  const features = db.prepare(`
    SELECT feature_name, SUM(present) as count
    FROM module_features
    GROUP BY feature_name
    ORDER BY count DESC
  `).all() as { feature_name: string; count: number }[];

  for (const f of features) {
    const pct = Math.round(100 * f.count / totalModules);
    console.log(`  ${f.feature_name.padEnd(30)} ${bar(pct)} ${f.count}/${totalModules} (${pct}%)`);
  }

  // ── Top 20 Traits by Total Usage ──
  console.log('\n── Top 20 Traits by Total Usage ──\n');
  const traits = db.prepare(`
    SELECT trait_id, SUM(count) as total, COUNT(DISTINCT module_id) as modules
    FROM trait_counts
    GROUP BY trait_id
    ORDER BY total DESC
    LIMIT 20
  `).all() as { trait_id: string; total: number; modules: number }[];

  for (const t of traits) {
    const pct = Math.round(100 * t.modules / totalModules);
    console.log(`  ${t.trait_id.padEnd(20)} total: ${String(t.total).padStart(6)}  in ${t.modules}/${totalModules} modules (${pct}%)`);
  }

  // ── VASSAL Version Distribution ──
  console.log('\n── VASSAL Version Distribution ──\n');
  const versions = db.prepare(`
    SELECT
      CASE
        WHEN vassal_version LIKE '3.7%' THEN '3.7.x'
        WHEN vassal_version LIKE '3.6%' THEN '3.6.x'
        WHEN vassal_version LIKE '3.5%' THEN '3.5.x'
        WHEN vassal_version LIKE '3.4%' THEN '3.4.x'
        WHEN vassal_version LIKE '3.3%' THEN '3.3.x'
        WHEN vassal_version LIKE '3.2%' THEN '3.2.x'
        WHEN vassal_version LIKE '3.1%' THEN '3.1.x'
        ELSE 'other'
      END as version_band,
      COUNT(*) as count
    FROM modules
    GROUP BY version_band
    ORDER BY version_band DESC
  `).all() as { version_band: string; count: number }[];

  for (const v of versions) {
    const pct = Math.round(100 * v.count / totalModules);
    console.log(`  ${v.version_band.padEnd(10)} ${bar(pct)} ${v.count} (${pct}%)`);
  }

  // ── Grid Type Distribution ──
  console.log('\n── Grid Type Distribution ──\n');
  const grids = db.prepare(`
    SELECT grid_type, COUNT(DISTINCT module_id) as count
    FROM grid_types
    GROUP BY grid_type
    ORDER BY count DESC
  `).all() as { grid_type: string; count: number }[];

  for (const g of grids) {
    const pct = Math.round(100 * g.count / totalModules);
    console.log(`  ${g.grid_type.padEnd(20)} ${bar(pct)} ${g.count} (${pct}%)`);
  }

  // ── Module Size Stats ──
  console.log('\n── Module Size Stats ──\n');
  const sizeStats = db.prepare(`
    SELECT
      ROUND(AVG(piece_slot_count)) as avg_pieces,
      MIN(piece_slot_count) as min_pieces,
      MAX(piece_slot_count) as max_pieces,
      ROUND(AVG(prototype_count)) as avg_protos,
      ROUND(AVG(image_count)) as avg_images,
      ROUND(AVG(file_size_bytes) / 1048576.0, 1) as avg_size_mb
    FROM modules
  `).get() as any;

  console.log(`  Avg pieces/module:     ${sizeStats.avg_pieces}`);
  console.log(`  Min/Max pieces:        ${sizeStats.min_pieces} / ${sizeStats.max_pieces}`);
  console.log(`  Avg prototypes/module: ${sizeStats.avg_protos}`);
  console.log(`  Avg images/module:     ${sizeStats.avg_images}`);
  console.log(`  Avg file size:         ${sizeStats.avg_size_mb} MB`);

  // ── Feature Co-occurrence (top pairs) ──
  console.log('\n── Feature Co-occurrence (top 15 pairs where both present) ──\n');
  const cooccurrence = db.prepare(`
    SELECT a.feature_name as feat_a, b.feature_name as feat_b, COUNT(*) as count
    FROM module_features a
    JOIN module_features b ON a.module_id = b.module_id AND a.feature_name < b.feature_name
    WHERE a.present = 1 AND b.present = 1
    GROUP BY a.feature_name, b.feature_name
    ORDER BY count DESC
    LIMIT 15
  `).all() as { feat_a: string; feat_b: string; count: number }[];

  for (const c of cooccurrence) {
    const pct = Math.round(100 * c.count / totalModules);
    console.log(`  ${(c.feat_a + ' + ' + c.feat_b).padEnd(55)} ${c.count} (${pct}%)`);
  }

  // ── Publisher breakdown ──
  console.log('\n── Publishers ──\n');
  const publishers = db.prepare(`
    SELECT publisher, COUNT(*) as count
    FROM modules
    WHERE publisher IS NOT NULL
    GROUP BY publisher
    ORDER BY count DESC
    LIMIT 10
  `).all() as { publisher: string; count: number }[];

  for (const p of publishers) {
    console.log(`  ${(p.publisher ?? '(unknown)').padEnd(30)} ${p.count} modules`);
  }

  console.log(`\n${'='.repeat(70)}\n`);
  db.close();
}

main();
