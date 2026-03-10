/**
 * Export SQLite corpus data to JSON format compatible with module-catalog.json.
 *
 * Usage:
 *   npx tsx src/tools/export-catalog-json.ts [output-file]
 *
 * Default output: data/module-catalog-full.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { openDb } from './corpus-db.js';
import type { ModuleFingerprint } from './extract-module-metadata.js';

const outFile = process.argv[2] ?? 'data/module-catalog-full.json';

function main() {
  const db = openDb();

  const modules = db.prepare('SELECT * FROM modules ORDER BY name').all() as any[];
  console.log(`📦 Exporting ${modules.length} modules from SQLite\n`);

  const catalog: ModuleFingerprint[] = modules.map(m => {
    // Features
    const featureRows = db.prepare(
      'SELECT feature_name, present FROM module_features WHERE module_id = ?'
    ).all(m.id) as { feature_name: string; present: number }[];
    const features: Record<string, boolean> = {};
    for (const row of featureRows) features[row.feature_name] = !!row.present;

    // Trait counts
    const traitRows = db.prepare(
      'SELECT trait_id, count FROM trait_counts WHERE module_id = ?'
    ).all(m.id) as { trait_id: string; count: number }[];
    const traitCounts: Record<string, number> = {};
    for (const row of traitRows) traitCounts[row.trait_id] = row.count;

    // Top-level components
    const compRows = db.prepare(
      'SELECT component_name FROM top_level_components WHERE module_id = ? ORDER BY position'
    ).all(m.id) as { component_name: string }[];

    // Maps
    const mapRows = db.prepare(
      'SELECT map_name, grid_type, board_count FROM maps WHERE module_id = ?'
    ).all(m.id) as { map_name: string; grid_type: string | null; board_count: number }[];

    // Grid types
    const gridRows = db.prepare(
      'SELECT grid_type FROM grid_types WHERE module_id = ?'
    ).all(m.id) as { grid_type: string }[];

    return {
      filename: m.filename,
      name: m.name,
      version: m.version,
      vassalVersion: m.vassal_version,
      description: m.description ?? '',
      publisher: m.publisher ?? undefined,
      sourceUrl: m.source_url ?? undefined,
      fileSizeBytes: m.file_size_bytes,
      xmlSizeBytes: m.xml_size_bytes,
      imageCount: m.image_count,
      topLevelComponents: compRows.map(r => r.component_name),
      maps: mapRows.map(r => ({
        name: r.map_name,
        subComponents: [],
        gridType: r.grid_type,
        boardCount: r.board_count,
      })),
      traitCounts,
      prototypeCount: m.prototype_count,
      pieceSlotCount: m.piece_slot_count,
      gridTypes: gridRows.map(r => r.grid_type),
      turnStructure: null, // not stored in DB currently
      features: features as any,
      extractedAt: m.extracted_at,
      extractionErrors: [],
    } satisfies ModuleFingerprint;
  });

  mkdirSync('data', { recursive: true });
  writeFileSync(outFile, JSON.stringify(catalog, null, 2));
  console.log(`✅ Exported to ${outFile}`);

  db.close();
}

main();
