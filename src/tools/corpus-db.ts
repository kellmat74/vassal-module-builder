/**
 * SQLite database helper for the VASSAL module corpus.
 *
 * Uses better-sqlite3 for synchronous, fast access.
 *
 * Three-layer schema:
 *   Layer 1 (Raw): raw_xml, trait_chains, expressions, properties, gkc_definitions
 *   Layer 2 (Structural): prototype_definitions, piece_prototypes, piece_organization, component_tree
 *   Layer 3 (Semantic): game_concepts, implementation_patterns, module_concepts, concept_taxonomy
 *   Legacy: modules, module_features, trait_counts, top_level_components, maps, grid_types
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import type { ModuleFingerprint } from './extract-module-metadata.js';

const DB_PATH = join(process.cwd(), 'data', 'module-corpus.db');

export function openDb(dbPath = DB_PATH): Database.Database {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY,
      filename TEXT UNIQUE,
      name TEXT,
      version TEXT,
      vassal_version TEXT,
      description TEXT,
      file_size_bytes INTEGER,
      xml_size_bytes INTEGER,
      image_count INTEGER,
      prototype_count INTEGER,
      piece_slot_count INTEGER,
      publisher TEXT,
      source_url TEXT,
      page_description TEXT,
      contributors TEXT,
      extracted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS module_features (
      module_id INTEGER REFERENCES modules(id),
      feature_name TEXT,
      present INTEGER,
      PRIMARY KEY (module_id, feature_name)
    );

    CREATE TABLE IF NOT EXISTS trait_counts (
      module_id INTEGER REFERENCES modules(id),
      trait_id TEXT,
      count INTEGER,
      PRIMARY KEY (module_id, trait_id)
    );

    CREATE TABLE IF NOT EXISTS top_level_components (
      module_id INTEGER REFERENCES modules(id),
      component_name TEXT,
      position INTEGER
    );

    CREATE TABLE IF NOT EXISTS maps (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      map_name TEXT,
      grid_type TEXT,
      board_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS grid_types (
      module_id INTEGER REFERENCES modules(id),
      grid_type TEXT
    );

    -- ═══════════════════════════════════════════════════════════════
    -- LAYER 1: RAW DATA (preserved forever, enables future analysis)
    -- ═══════════════════════════════════════════════════════════════

    -- Full buildFile.xml text so we never need to re-download
    CREATE TABLE IF NOT EXISTS raw_xml (
      module_id INTEGER PRIMARY KEY REFERENCES modules(id),
      xml_text TEXT NOT NULL
    );

    -- Full decoded trait chains from prototypes and piece slots
    CREATE TABLE IF NOT EXISTS trait_chains (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      source_type TEXT NOT NULL,      -- 'prototype' | 'piece'
      source_name TEXT,               -- prototype name or piece entryName
      position INTEGER NOT NULL,      -- 0-based index in decorator chain
      trait_id TEXT NOT NULL,          -- e.g. 'emb2', 'mark', 'piece'
      params_json TEXT                -- JSON array of decoded SequenceEncoder params
    );
    CREATE INDEX IF NOT EXISTS idx_trait_chains_module ON trait_chains(module_id);
    CREATE INDEX IF NOT EXISTS idx_trait_chains_trait ON trait_chains(module_id, trait_id);

    -- All expressions found in the module (BeanShell and old-style)
    CREATE TABLE IF NOT EXISTS expressions (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      context TEXT,                   -- 'trait_param' | 'gkc_filter' | 'calculated_property' | 'report_format' | 'attribute'
      source_name TEXT,               -- which prototype/piece/component contains it
      expression_text TEXT NOT NULL,
      expr_type TEXT,                 -- 'beanshell' | 'oldstyle' | 'mixed'
      functions_used TEXT,            -- JSON array: ['GetProperty', 'SumStack', ...]
      properties_referenced TEXT      -- JSON array: ['Strength', 'CurrentMap', ...]
    );
    CREATE INDEX IF NOT EXISTS idx_expressions_module ON expressions(module_id);

    -- Property definitions at all scopes
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      name TEXT NOT NULL,
      scope TEXT NOT NULL,            -- 'module' | 'map' | 'zone' | 'piece'
      prop_type TEXT NOT NULL,        -- 'marker' | 'dynamic' | 'calculated' | 'global'
      initial_value TEXT,
      expression TEXT                 -- for calculated properties
    );
    CREATE INDEX IF NOT EXISTS idx_properties_module ON properties(module_id);

    -- Global Key Command definitions
    CREATE TABLE IF NOT EXISTS gkc_definitions (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      level TEXT NOT NULL,            -- 'module' | 'map' | 'piece'
      name TEXT,
      target_expression TEXT,
      key_command TEXT,
      params_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_gkc_module ON gkc_definitions(module_id);

    -- ═══════════════════════════════════════════════════════════════
    -- LAYER 2: STRUCTURAL EXTRACTION (normalized components)
    -- ═══════════════════════════════════════════════════════════════

    -- Prototype definitions with full trait chains
    CREATE TABLE IF NOT EXISTS prototype_definitions (
      module_id INTEGER REFERENCES modules(id),
      name TEXT NOT NULL,
      trait_chain_json TEXT,          -- JSON array of {trait_id, params}
      trait_count INTEGER,
      PRIMARY KEY (module_id, name)
    );

    -- Piece → prototype inheritance mapping
    CREATE TABLE IF NOT EXISTS piece_prototypes (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      piece_name TEXT,
      prototype_name TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_piece_proto_module ON piece_prototypes(module_id);

    -- PieceWindow widget tree structure
    CREATE TABLE IF NOT EXISTS piece_organization (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      widget_path TEXT,               -- slash-delimited: 'Forces/US/Infantry'
      entry_name TEXT,
      piece_count INTEGER
    );

    -- Full component tree flattened for arbitrary queries
    CREATE TABLE IF NOT EXISTS component_tree (
      id INTEGER PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id),
      node_id INTEGER NOT NULL,       -- sequential ID within this module
      parent_id INTEGER,              -- NULL for root
      tag TEXT NOT NULL,              -- full Java class tag
      short_tag TEXT,                 -- last segment: 'Map', 'Zoomer', etc.
      depth INTEGER NOT NULL,
      attributes_json TEXT            -- JSON object of all attributes
    );
    CREATE INDEX IF NOT EXISTS idx_comp_tree_module ON component_tree(module_id);
    CREATE INDEX IF NOT EXISTS idx_comp_tree_tag ON component_tree(module_id, short_tag);

    -- ═══════════════════════════════════════════════════════════════
    -- LAYER 3: SEMANTIC NORMALIZATION (game concepts)
    -- ═══════════════════════════════════════════════════════════════

    -- Taxonomy of game problems / design concepts
    CREATE TABLE IF NOT EXISTS game_concepts (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,      -- e.g. 'movement-tracking'
      category TEXT NOT NULL,         -- e.g. 'movement', 'combat', 'visibility'
      description TEXT
    );

    -- Hierarchical concept relationships
    CREATE TABLE IF NOT EXISTS concept_taxonomy (
      parent_id INTEGER REFERENCES game_concepts(id),
      child_id INTEGER REFERENCES game_concepts(id),
      PRIMARY KEY (parent_id, child_id)
    );

    -- Named implementation patterns that solve each concept
    CREATE TABLE IF NOT EXISTS implementation_patterns (
      id INTEGER PRIMARY KEY,
      concept_id INTEGER REFERENCES game_concepts(id),
      pattern_name TEXT NOT NULL,     -- e.g. 'footprint-trait', 'emb2-moved-marker'
      description TEXT,
      signature_json TEXT NOT NULL,   -- composable detection rules
      quality_score INTEGER DEFAULT 3, -- 1-5 stars
      example_module_id INTEGER REFERENCES modules(id)
    );

    -- Which modules use which pattern for which concept
    CREATE TABLE IF NOT EXISTS module_concepts (
      module_id INTEGER REFERENCES modules(id),
      concept_id INTEGER REFERENCES game_concepts(id),
      pattern_id INTEGER REFERENCES implementation_patterns(id),
      confidence REAL DEFAULT 1.0,    -- 0.0-1.0
      evidence_json TEXT,             -- JSON: what matched
      PRIMARY KEY (module_id, concept_id, pattern_id)
    );
  `);
}

export interface InsertModuleOptions {
  pageDescription?: string;
  contributors?: string[];
}

export function insertModule(db: Database.Database, fp: ModuleFingerprint, opts?: InsertModuleOptions): number {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO modules (filename, name, version, vassal_version, description,
      file_size_bytes, xml_size_bytes, image_count, prototype_count, piece_slot_count,
      publisher, source_url, page_description, contributors, extracted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    fp.filename, fp.name, fp.version, fp.vassalVersion, fp.description,
    fp.fileSizeBytes, fp.xmlSizeBytes, fp.imageCount, fp.prototypeCount, fp.pieceSlotCount,
    fp.publisher ?? null, fp.sourceUrl ?? null,
    opts?.pageDescription ?? null,
    opts?.contributors ? JSON.stringify(opts.contributors) : null,
    fp.extractedAt
  );

  const moduleId = Number(result.lastInsertRowid);

  // Features
  const insertFeature = db.prepare(
    'INSERT OR REPLACE INTO module_features (module_id, feature_name, present) VALUES (?, ?, ?)'
  );
  for (const [key, val] of Object.entries(fp.features)) {
    insertFeature.run(moduleId, key, val ? 1 : 0);
  }

  // Trait counts
  const insertTrait = db.prepare(
    'INSERT OR REPLACE INTO trait_counts (module_id, trait_id, count) VALUES (?, ?, ?)'
  );
  for (const [traitId, count] of Object.entries(fp.traitCounts)) {
    insertTrait.run(moduleId, traitId, count);
  }

  // Top-level components
  const insertComp = db.prepare(
    'INSERT INTO top_level_components (module_id, component_name, position) VALUES (?, ?, ?)'
  );
  // Clean old entries first
  db.prepare('DELETE FROM top_level_components WHERE module_id = ?').run(moduleId);
  fp.topLevelComponents.forEach((comp, i) => insertComp.run(moduleId, comp, i));

  // Maps
  const insertMap = db.prepare(
    'INSERT INTO maps (module_id, map_name, grid_type, board_count) VALUES (?, ?, ?, ?)'
  );
  db.prepare('DELETE FROM maps WHERE module_id = ?').run(moduleId);
  for (const map of fp.maps) {
    insertMap.run(moduleId, map.name, map.gridType, map.boardCount);
  }

  // Grid types
  const insertGrid = db.prepare(
    'INSERT INTO grid_types (module_id, grid_type) VALUES (?, ?)'
  );
  db.prepare('DELETE FROM grid_types WHERE module_id = ?').run(moduleId);
  for (const gt of fp.gridTypes) {
    insertGrid.run(moduleId, gt);
  }

  return moduleId;
}

// ── Deep Data Types ──────────────────────────────────────────────────

export interface TraitChainRow {
  source_type: 'prototype' | 'piece';
  source_name: string;
  position: number;
  trait_id: string;
  params_json: string;  // JSON array
}

export interface ExpressionRow {
  context: string;
  source_name: string;
  expression_text: string;
  expr_type: 'beanshell' | 'oldstyle' | 'mixed';
  functions_used: string;   // JSON array
  properties_referenced: string;  // JSON array
}

export interface PropertyRow {
  name: string;
  scope: 'module' | 'map' | 'zone' | 'piece';
  prop_type: 'marker' | 'dynamic' | 'calculated' | 'global';
  initial_value: string | null;
  expression: string | null;
}

export interface GKCRow {
  level: 'module' | 'map' | 'piece';
  name: string;
  target_expression: string | null;
  key_command: string | null;
  params_json: string | null;
}

export interface PrototypeDefRow {
  name: string;
  trait_chain_json: string;
  trait_count: number;
}

export interface PiecePrototypeRow {
  piece_name: string;
  prototype_name: string;
}

export interface PieceOrgRow {
  widget_path: string;
  entry_name: string;
  piece_count: number;
}

export interface ComponentTreeRow {
  node_id: number;
  parent_id: number | null;
  tag: string;
  short_tag: string;
  depth: number;
  attributes_json: string;
}

export interface DeepData {
  rawXml: string;
  traitChains: TraitChainRow[];
  expressions: ExpressionRow[];
  properties: PropertyRow[];
  gkcDefinitions: GKCRow[];
  prototypeDefs: PrototypeDefRow[];
  piecePrototypes: PiecePrototypeRow[];
  pieceOrganization: PieceOrgRow[];
  componentTree: ComponentTreeRow[];
}

/**
 * Clear all deep data for a module (for re-processing).
 */
export function clearDeepData(db: Database.Database, moduleId: number): void {
  const tables = [
    'raw_xml', 'trait_chains', 'expressions', 'properties',
    'gkc_definitions', 'prototype_definitions', 'piece_prototypes',
    'piece_organization', 'component_tree', 'module_concepts',
  ];
  for (const table of tables) {
    db.prepare(`DELETE FROM ${table} WHERE module_id = ?`).run(moduleId);
  }
}

/**
 * Insert all deep extracted data for a module.
 */
export function insertDeepData(db: Database.Database, moduleId: number, data: DeepData): void {
  // Wrap in transaction for speed
  const tx = db.transaction(() => {
    // Raw XML
    db.prepare('INSERT OR REPLACE INTO raw_xml (module_id, xml_text) VALUES (?, ?)')
      .run(moduleId, data.rawXml);

    // Trait chains
    const insertChain = db.prepare(
      'INSERT INTO trait_chains (module_id, source_type, source_name, position, trait_id, params_json) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const row of data.traitChains) {
      insertChain.run(moduleId, row.source_type, row.source_name, row.position, row.trait_id, row.params_json);
    }

    // Expressions
    const insertExpr = db.prepare(
      'INSERT INTO expressions (module_id, context, source_name, expression_text, expr_type, functions_used, properties_referenced) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const row of data.expressions) {
      insertExpr.run(moduleId, row.context, row.source_name, row.expression_text, row.expr_type, row.functions_used, row.properties_referenced);
    }

    // Properties
    const insertProp = db.prepare(
      'INSERT INTO properties (module_id, name, scope, prop_type, initial_value, expression) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const row of data.properties) {
      insertProp.run(moduleId, row.name, row.scope, row.prop_type, row.initial_value, row.expression);
    }

    // GKC definitions
    const insertGKC = db.prepare(
      'INSERT INTO gkc_definitions (module_id, level, name, target_expression, key_command, params_json) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const row of data.gkcDefinitions) {
      insertGKC.run(moduleId, row.level, row.name, row.target_expression, row.key_command, row.params_json);
    }

    // Prototype definitions
    const insertProto = db.prepare(
      'INSERT OR REPLACE INTO prototype_definitions (module_id, name, trait_chain_json, trait_count) VALUES (?, ?, ?, ?)'
    );
    for (const row of data.prototypeDefs) {
      insertProto.run(moduleId, row.name, row.trait_chain_json, row.trait_count);
    }

    // Piece → prototype links
    const insertPieceProto = db.prepare(
      'INSERT INTO piece_prototypes (module_id, piece_name, prototype_name) VALUES (?, ?, ?)'
    );
    for (const row of data.piecePrototypes) {
      insertPieceProto.run(moduleId, row.piece_name, row.prototype_name);
    }

    // Piece organization
    const insertOrg = db.prepare(
      'INSERT INTO piece_organization (module_id, widget_path, entry_name, piece_count) VALUES (?, ?, ?, ?)'
    );
    for (const row of data.pieceOrganization) {
      insertOrg.run(moduleId, row.widget_path, row.entry_name, row.piece_count);
    }

    // Component tree
    const insertTree = db.prepare(
      'INSERT INTO component_tree (module_id, node_id, parent_id, tag, short_tag, depth, attributes_json) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const row of data.componentTree) {
      insertTree.run(moduleId, row.node_id, row.parent_id, row.tag, row.short_tag, row.depth, row.attributes_json);
    }
  });

  tx();
}

/**
 * Check if a module has deep data extracted.
 */
export function hasDeepData(db: Database.Database, moduleId: number): boolean {
  const row = db.prepare('SELECT 1 FROM raw_xml WHERE module_id = ?').get(moduleId);
  return !!row;
}

/**
 * Get module ID by filename.
 */
export function getModuleId(db: Database.Database, filename: string): number | null {
  const row = db.prepare('SELECT id FROM modules WHERE filename = ?').get(filename) as { id: number } | undefined;
  return row?.id ?? null;
}

/**
 * Get all modules with their source_url for re-processing.
 */
export function getModulesForReprocess(db: Database.Database): { id: number; filename: string; source_url: string }[] {
  return db.prepare(`
    SELECT m.id, m.filename, m.source_url
    FROM modules m
    LEFT JOIN raw_xml r ON r.module_id = m.id
    WHERE r.module_id IS NULL AND m.source_url IS NOT NULL
  `).all() as { id: number; filename: string; source_url: string }[];
}

export function hasModule(db: Database.Database, filename: string): boolean {
  const row = db.prepare('SELECT 1 FROM modules WHERE filename = ?').get(filename);
  return !!row;
}

export function getModuleCount(db: Database.Database): number {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM modules').get() as { cnt: number };
  return row.cnt;
}
