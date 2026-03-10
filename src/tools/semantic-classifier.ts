/**
 * Semantic Classifier — maps VASSAL module implementations to game concepts.
 *
 * Three phases:
 *   A. Seed the concept taxonomy into the database
 *   B. Classify all modules against known patterns
 *   C. Report unmatched modules for pattern discovery
 *
 * Usage:
 *   npx tsx src/tools/semantic-classifier.ts [--seed] [--classify] [--discover] [--all]
 */

import Database from 'better-sqlite3';
import { openDb, initSchema } from './corpus-db.js';
import {
  gameConceptSeeds,
  implementationPatternSeeds,
  type PatternSignature,
  type SignatureRule,
} from '../schema/game-concepts.js';

// ── Phase A: Seed Taxonomy ───────────────────────────────────────────────

function seedTaxonomy(db: Database.Database) {
  console.log('🌱 Seeding game concept taxonomy...\n');

  const insertConcept = db.prepare(
    'INSERT OR IGNORE INTO game_concepts (name, category, description) VALUES (?, ?, ?)'
  );
  const insertTaxonomy = db.prepare(
    'INSERT OR IGNORE INTO concept_taxonomy (parent_id, child_id) VALUES (?, ?)'
  );
  const insertPattern = db.prepare(
    'INSERT OR IGNORE INTO implementation_patterns (concept_id, pattern_name, description, signature_json, quality_score) VALUES (?, ?, ?, ?, ?)'
  );
  const getConcept = db.prepare('SELECT id FROM game_concepts WHERE name = ?');

  // Insert concepts
  for (const concept of gameConceptSeeds) {
    insertConcept.run(concept.name, concept.category, concept.description);
  }
  console.log(`  Inserted ${gameConceptSeeds.length} game concepts`);

  // Insert taxonomy relationships
  let taxCount = 0;
  for (const concept of gameConceptSeeds) {
    if (!concept.children) continue;
    const parent = getConcept.get(concept.name) as { id: number } | undefined;
    if (!parent) continue;
    for (const childName of concept.children) {
      const child = getConcept.get(childName) as { id: number } | undefined;
      if (child) {
        insertTaxonomy.run(parent.id, child.id);
        taxCount++;
      }
    }
  }
  console.log(`  Inserted ${taxCount} taxonomy relationships`);

  // Insert patterns
  for (const pattern of implementationPatternSeeds) {
    const concept = getConcept.get(pattern.concept) as { id: number } | undefined;
    if (!concept) {
      console.log(`  ⚠️ Concept not found: ${pattern.concept}`);
      continue;
    }
    insertPattern.run(
      concept.id,
      pattern.pattern_name,
      pattern.description,
      JSON.stringify(pattern.signature),
      pattern.quality_score
    );
  }
  console.log(`  Inserted ${implementationPatternSeeds.length} implementation patterns\n`);
}

// ── Phase B: Classify Modules ────────────────────────────────────────────

interface ModuleData {
  id: number;
  filename: string;
  traitIds: Set<string>;
  traitParams: Map<string, string[]>;  // trait_id → array of params_json
  componentTags: Set<string>;
  propertyNames: Set<string>;
  expressions: string[];
}

function loadModuleData(db: Database.Database, moduleId: number): ModuleData | null {
  const mod = db.prepare('SELECT id, filename FROM modules WHERE id = ?').get(moduleId) as { id: number; filename: string } | undefined;
  if (!mod) return null;

  const data: ModuleData = {
    id: mod.id,
    filename: mod.filename,
    traitIds: new Set<string>(),
    traitParams: new Map<string, string[]>(),
    componentTags: new Set<string>(),
    propertyNames: new Set<string>(),
    expressions: [],
  };

  // Load trait IDs and params
  const traits = db.prepare('SELECT trait_id, params_json FROM trait_chains WHERE module_id = ?').all(moduleId) as { trait_id: string; params_json: string }[];
  for (const t of traits) {
    data.traitIds.add(t.trait_id);
    if (!data.traitParams.has(t.trait_id)) data.traitParams.set(t.trait_id, []);
    data.traitParams.get(t.trait_id)!.push(t.params_json);
  }

  // Load component tags
  const comps = db.prepare('SELECT DISTINCT short_tag FROM component_tree WHERE module_id = ?').all(moduleId) as { short_tag: string }[];
  for (const c of comps) {
    data.componentTags.add(c.short_tag);
  }

  // Load property names
  const props = db.prepare('SELECT DISTINCT name FROM properties WHERE module_id = ?').all(moduleId) as { name: string }[];
  for (const p of props) {
    data.propertyNames.add(p.name);
  }

  // Load expressions
  const exprs = db.prepare('SELECT expression_text FROM expressions WHERE module_id = ?').all(moduleId) as { expression_text: string }[];
  data.expressions = exprs.map(e => e.expression_text);

  return data;
}

function matchesRule(data: ModuleData, rule: SignatureRule): boolean {
  if (rule.trait_exists) {
    if (!data.traitIds.has(rule.trait_exists)) return false;
    // If params_match is specified, check params
    if (rule.params_match) {
      const re = new RegExp(rule.params_match);
      const allParams = data.traitParams.get(rule.trait_exists) ?? [];
      if (!allParams.some(p => re.test(p))) return false;
    }
  }

  if (rule.component_exists) {
    if (!data.componentTags.has(rule.component_exists)) return false;
  }

  if (rule.property_match) {
    const re = new RegExp(rule.property_match.name_pattern);
    let found = false;
    for (const name of data.propertyNames) {
      if (re.test(name)) { found = true; break; }
    }
    if (!found) return false;
  }

  if (rule.expression_match) {
    const re = new RegExp(rule.expression_match);
    if (!data.expressions.some(e => re.test(e))) return false;
  }

  return true;
}

function matchesSignature(data: ModuleData, sig: PatternSignature): boolean {
  if (sig.all_of) {
    if (!sig.all_of.every(r => matchesRule(data, r))) return false;
  }
  if (sig.any_of) {
    if (!sig.any_of.some(r => matchesRule(data, r))) return false;
  }
  if (sig.none_of) {
    if (sig.none_of.some(r => matchesRule(data, r))) return false;
  }
  return true;
}

function classifyModules(db: Database.Database) {
  console.log('🔍 Classifying modules against concept taxonomy...\n');

  // Get all modules with deep data
  const modules = db.prepare(`
    SELECT m.id FROM modules m
    INNER JOIN raw_xml r ON r.module_id = m.id
  `).all() as { id: number }[];

  console.log(`  ${modules.length} modules with deep data\n`);

  // Get all patterns
  const patterns = db.prepare(`
    SELECT ip.id, ip.concept_id, ip.pattern_name, ip.signature_json, gc.name as concept_name
    FROM implementation_patterns ip
    JOIN game_concepts gc ON gc.id = ip.concept_id
  `).all() as { id: number; concept_id: number; pattern_name: string; signature_json: string; concept_name: string }[];

  // Clear old classifications
  db.prepare('DELETE FROM module_concepts').run();

  const insertMatch = db.prepare(
    'INSERT INTO module_concepts (module_id, concept_id, pattern_id, confidence, evidence_json) VALUES (?, ?, ?, ?, ?)'
  );

  let totalMatches = 0;
  const conceptCounts: Record<string, number> = {};

  for (const mod of modules) {
    const data = loadModuleData(db, mod.id);
    if (!data) continue;

    for (const pattern of patterns) {
      const sig: PatternSignature = JSON.parse(pattern.signature_json);
      if (matchesSignature(data, sig)) {
        insertMatch.run(mod.id, pattern.concept_id, pattern.id, 1.0, JSON.stringify({ pattern: pattern.pattern_name }));
        totalMatches++;
        conceptCounts[pattern.concept_name] = (conceptCounts[pattern.concept_name] || 0) + 1;
      }
    }
  }

  console.log(`  Total matches: ${totalMatches}\n`);

  // Report concept coverage
  console.log('── Concept Coverage ──\n');
  const sorted = Object.entries(conceptCounts).sort((a, b) => b[1] - a[1]);
  for (const [concept, count] of sorted) {
    const pct = Math.round(100 * count / modules.length);
    const filled = Math.min(20, Math.round(pct / 5));
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
    console.log(`  ${concept.padEnd(30)} ${bar} ${count}/${modules.length} (${pct}%)`);
  }
}

// ── Phase C: Pattern Discovery ──────────────────────────────────────────

function discoverPatterns(db: Database.Database) {
  console.log('\n🔬 Discovering unmatched patterns...\n');

  // Get all modules with deep data
  const modules = db.prepare(`
    SELECT m.id, m.filename FROM modules m
    INNER JOIN raw_xml r ON r.module_id = m.id
  `).all() as { id: number; filename: string }[];

  // Get leaf concepts (ones without children)
  const leafConcepts = db.prepare(`
    SELECT gc.id, gc.name FROM game_concepts gc
    WHERE gc.id NOT IN (SELECT parent_id FROM concept_taxonomy)
    AND gc.id IN (SELECT concept_id FROM implementation_patterns)
  `).all() as { id: number; name: string }[];

  for (const concept of leafConcepts) {
    // Find modules that match NO pattern for this concept
    const matchedModules = db.prepare(`
      SELECT DISTINCT module_id FROM module_concepts WHERE concept_id = ?
    `).all(concept.id) as { module_id: number }[];
    const matchedSet = new Set(matchedModules.map(m => m.module_id));

    const unmatched = modules.filter(m => !matchedSet.has(m.id));
    if (unmatched.length > 0 && unmatched.length < modules.length * 0.8) {
      // Only interesting if some match and some don't
      const matchPct = Math.round(100 * matchedModules.length / modules.length);
      if (matchPct > 5 && matchPct < 95) {
        console.log(`  ${concept.name}: ${matchedModules.length}/${modules.length} matched (${matchPct}%), ${unmatched.length} unmatched`);
      }
    }
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const doSeed = args.includes('--seed') || args.includes('--all');
  const doClassify = args.includes('--classify') || args.includes('--all');
  const doDiscover = args.includes('--discover') || args.includes('--all');

  if (!doSeed && !doClassify && !doDiscover) {
    console.log('Usage: npx tsx src/tools/semantic-classifier.ts [--seed] [--classify] [--discover] [--all]');
    process.exit(1);
  }

  const db = openDb();
  initSchema(db);

  if (doSeed) seedTaxonomy(db);
  if (doClassify) classifyModules(db);
  if (doDiscover) discoverPatterns(db);

  db.close();
}

main();
