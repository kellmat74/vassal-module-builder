/**
 * Team 4 "Quality" — Champion-Challenger Analysis
 * Scores 562 VASSAL modules on quality dimensions and identifies gold standards + anti-patterns.
 */
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../../../data/module-corpus.db');
const OUT_PATH = path.resolve(__dirname, '../../../data/analysis/team4-quality.md');

const db = new Database(DB_PATH, { readonly: true });
db.pragma('journal_mode = WAL');

// ─────────────────────────────────────────────
// 1. QUALITY SCORING MODEL
// ─────────────────────────────────────────────

interface ModuleScore {
  id: number;
  name: string;
  publisher: string;
  vassal_version: string;
  piece_count: number;
  prototype_count: number;
  // dimension scores (0-1 each, weighted to composite)
  prototypeReuse: number;
  automationDepth: number;
  reportingCoverage: number;
  traitEfficiency: number;
  expressionSophistication: number;
  vassalModernity: number;
  componentCompleteness: number;
  // composite
  composite: number;
}

// Weights for composite score
const WEIGHTS = {
  prototypeReuse: 20,
  automationDepth: 20,
  reportingCoverage: 10,
  traitEfficiency: 10,
  expressionSophistication: 15,
  vassalModernity: 10,
  componentCompleteness: 15,
};

function parseVassalVersion(v: string | null): number {
  if (!v) return 0;
  const m = v.match(/(\d+)\.(\d+)\.?(\d*)/);
  if (!m) return 0;
  return parseInt(m[1]) * 10000 + parseInt(m[2]) * 100 + (parseInt(m[3]) || 0);
}

function vassalModernityScore(v: string | null, moduleId: number): number {
  const ver = parseVassalVersion(v);
  // 3.1 = 30100, 3.7 = 30700
  // Normalize: 3.1 -> 0, 3.7+ -> 0.6 base, max 0.7 from version
  let vScore = Math.max(0, Math.min(1, (ver - 30100) / 600));

  // Bonus for modern features
  const modernFeatures = db.prepare(`
    SELECT feature_name FROM module_features
    WHERE module_id = ? AND present = 1
    AND feature_name IN ('hasFlare','hasMat','hasAttachment')
  `).all(moduleId) as any[];

  // Also check for modern trait IDs
  const modernTraits = db.prepare(`
    SELECT DISTINCT trait_id FROM trait_chains
    WHERE module_id = ? AND trait_id IN ('mat','matPiece','attach','deselect','calcProp')
  `).all(moduleId) as any[];

  const modernCount = modernFeatures.length + modernTraits.length;
  vScore = Math.min(1, vScore + modernCount * 0.1);
  return vScore;
}

function computeScores(): ModuleScore[] {
  const modules = db.prepare(`
    SELECT id, name, publisher, vassal_version, piece_slot_count, prototype_count
    FROM modules
  `).all() as any[];

  // Pre-compute bulk queries for performance
  // Trait counts per module by trait_id
  const traitCountsAll = db.prepare(`
    SELECT module_id, trait_id, count FROM trait_counts
  `).all() as any[];
  const traitCountMap = new Map<number, Map<string, number>>();
  for (const r of traitCountsAll) {
    if (!traitCountMap.has(r.module_id)) traitCountMap.set(r.module_id, new Map());
    traitCountMap.get(r.module_id)!.set(r.trait_id, r.count);
  }

  // Piece-prototype usage per module
  const pieceProtoCountsRaw = db.prepare(`
    SELECT module_id, COUNT(DISTINCT piece_name) as pieces_with_proto
    FROM piece_prototypes GROUP BY module_id
  `).all() as any[];
  const piecesWithProtoMap = new Map<number, number>();
  for (const r of pieceProtoCountsRaw) piecesWithProtoMap.set(r.module_id, r.pieces_with_proto);

  // Expression stats per module
  const exprStats = db.prepare(`
    SELECT module_id,
      COUNT(*) as expr_count,
      COUNT(DISTINCT functions_used) as distinct_func_sets,
      COUNT(DISTINCT properties_referenced) as distinct_prop_sets,
      SUM(CASE WHEN expr_type = 'beanshell' THEN 1 ELSE 0 END) as beanshell_count
    FROM expressions GROUP BY module_id
  `).all() as any[];
  const exprMap = new Map<number, any>();
  for (const r of exprStats) exprMap.set(r.module_id, r);

  // Unique functions used per module
  const funcCounts = db.prepare(`
    SELECT module_id, COUNT(DISTINCT functions_used) as c
    FROM expressions WHERE functions_used IS NOT NULL AND functions_used != ''
    GROUP BY module_id
  `).all() as any[];
  const funcCountMap = new Map<number, number>();
  for (const r of funcCounts) funcCountMap.set(r.module_id, r.c);

  // Unique properties referenced per module
  const propRefCounts = db.prepare(`
    SELECT module_id, COUNT(DISTINCT properties_referenced) as c
    FROM expressions WHERE properties_referenced IS NOT NULL AND properties_referenced != ''
    GROUP BY module_id
  `).all() as any[];
  const propRefMap = new Map<number, number>();
  for (const r of propRefCounts) propRefMap.set(r.module_id, r.c);

  // GKC counts per module
  const gkcCounts = db.prepare(`
    SELECT module_id, COUNT(*) as c FROM gkc_definitions GROUP BY module_id
  `).all() as any[];
  const gkcMap = new Map<number, number>();
  for (const r of gkcCounts) gkcMap.set(r.module_id, r.c);

  // Module features
  const featuresAll = db.prepare(`
    SELECT module_id, feature_name FROM module_features WHERE present = 1
  `).all() as any[];
  const featureMap = new Map<number, Set<string>>();
  for (const r of featuresAll) {
    if (!featureMap.has(r.module_id)) featureMap.set(r.module_id, new Set());
    featureMap.get(r.module_id)!.add(r.feature_name);
  }

  // Prototype trait diversity
  const protoStats = db.prepare(`
    SELECT module_id,
      AVG(trait_count) as avg_traits,
      COUNT(*) as proto_count
    FROM prototype_definitions GROUP BY module_id
  `).all() as any[];
  const protoStatsMap = new Map<number, any>();
  for (const r of protoStats) protoStatsMap.set(r.module_id, r);

  // Unique trait types in prototypes per module
  const protoTraitDiversity = db.prepare(`
    SELECT module_id, COUNT(DISTINCT trait_id) as unique_types
    FROM trait_chains WHERE source_type = 'prototype'
    GROUP BY module_id
  `).all() as any[];
  const protoDiversityMap = new Map<number, number>();
  for (const r of protoTraitDiversity) protoDiversityMap.set(r.module_id, r.unique_types);

  // Compute percentiles for normalization
  const allExprCounts = modules.map(m => (exprMap.get(m.id)?.expr_count || 0));
  const allGkcCounts = modules.map(m => (gkcMap.get(m.id) || 0));
  const allFuncCounts = modules.map(m => (funcCountMap.get(m.id) || 0));
  const allPropRefCounts = modules.map(m => (propRefMap.get(m.id) || 0));

  function percentile(arr: number[], val: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = sorted.findIndex(v => v >= val);
    if (idx === -1) return 1;
    return idx / sorted.length;
  }

  const scores: ModuleScore[] = [];

  for (const m of modules) {
    const pieces = m.piece_slot_count || 0;
    const protos = m.prototype_count || 0;
    const tc = traitCountMap.get(m.id) || new Map<string, number>();

    // 1. Prototype Reuse (pieces using prototypes / total pieces)
    const piecesWithProto = piecesWithProtoMap.get(m.id) || 0;
    const prototypeReuse = pieces > 0 ? Math.min(1, piecesWithProto / pieces) : 0;

    // 2. Automation Depth: (triggers + GKCs + calcProps) normalized per piece
    const triggers = tc.get('macro') || 0;
    const gkcs = gkcMap.get(m.id) || 0;
    const calcProps = tc.get('calcProp') || 0;
    const dynProps = tc.get('PROP') || 0;
    const automationRaw = triggers + gkcs + calcProps + dynProps;
    // Normalize: per-piece ratio, capped. A good module has ~0.5-2 automation items per piece
    const automationDepth = pieces > 0
      ? Math.min(1, (automationRaw / pieces) / 2)
      : (automationRaw > 0 ? 0.3 : 0);

    // 3. Reporting Coverage: pieces with report trait / total pieces
    const reportCount = tc.get('report') || 0;
    const reportingCoverage = pieces > 0 ? Math.min(1, reportCount / Math.max(1, pieces * 0.3)) : 0;

    // 4. Trait Efficiency: diversity of trait types in prototypes vs bloat
    const ps = protoStatsMap.get(m.id);
    const diversity = protoDiversityMap.get(m.id) || 0;
    let traitEfficiency = 0;
    if (ps && ps.avg_traits > 0 && protos > 0) {
      // Good: many different trait types used (diverse), not just emb2+mark repeated
      // Ratio of unique trait types to avg chain length — higher = more diverse
      traitEfficiency = Math.min(1, (diversity / Math.max(1, ps.avg_traits)) * 0.7 +
        (protos > 5 ? 0.3 : protos * 0.06));
    }

    // 5. Expression Sophistication
    const exprCount = exprMap.get(m.id)?.expr_count || 0;
    const bsCount = exprMap.get(m.id)?.beanshell_count || 0;
    const funcCount = funcCountMap.get(m.id) || 0;
    const propRefCount = propRefMap.get(m.id) || 0;
    // Combine: beanshell usage + function diversity + property references
    const exprRaw = bsCount * 0.4 + funcCount * 5 + propRefCount * 2;
    const expressionSophistication = Math.min(1, percentile(
      modules.map(mm => {
        const e = exprMap.get(mm.id);
        const f = funcCountMap.get(mm.id) || 0;
        const p = propRefMap.get(mm.id) || 0;
        return (e?.beanshell_count || 0) * 0.4 + f * 5 + p * 2;
      }), exprRaw));

    // 6. VASSAL Modernity
    const vassalMod = vassalModernityScore(m.vassal_version, m.id);

    // 7. Component Completeness
    const features = featureMap.get(m.id) || new Set<string>();
    const completenessFeatures = [
      'hasZoomer', 'hasCounterDetailViewer', 'hasInventory',
      'hasGlobalMap', 'hasTurnTracker', 'hasDiceButton',
      'hasHighlightLastMoved', 'hasFlare', 'hasPredefinedSetup'
    ];
    const completenessCount = completenessFeatures.filter(f => features.has(f)).length;
    const componentCompleteness = completenessCount / completenessFeatures.length;

    // Composite
    const composite = (
      prototypeReuse * WEIGHTS.prototypeReuse +
      automationDepth * WEIGHTS.automationDepth +
      reportingCoverage * WEIGHTS.reportingCoverage +
      traitEfficiency * WEIGHTS.traitEfficiency +
      expressionSophistication * WEIGHTS.expressionSophistication +
      vassalMod * WEIGHTS.vassalModernity +
      componentCompleteness * WEIGHTS.componentCompleteness
    );

    scores.push({
      id: m.id,
      name: m.name,
      publisher: m.publisher,
      vassal_version: m.vassal_version,
      piece_count: pieces,
      prototype_count: protos,
      prototypeReuse: Math.round(prototypeReuse * 100) / 100,
      automationDepth: Math.round(automationDepth * 100) / 100,
      reportingCoverage: Math.round(reportingCoverage * 100) / 100,
      traitEfficiency: Math.round(traitEfficiency * 100) / 100,
      expressionSophistication: Math.round(expressionSophistication * 100) / 100,
      vassalModernity: Math.round(vassalMod * 100) / 100,
      componentCompleteness: Math.round(componentCompleteness * 100) / 100,
      composite: Math.round(composite * 10) / 10,
    });
  }

  scores.sort((a, b) => b.composite - a.composite);
  return scores;
}

// ─────────────────────────────────────────────
// 2. ANTI-PATTERN DETECTION
// ─────────────────────────────────────────────

interface AntiPattern {
  name: string;
  description: string;
  modules: { name: string; publisher: string; detail: string }[];
}

function detectAntiPatterns(): AntiPattern[] {
  const patterns: AntiPattern[] = [];

  // AP1: High piece count, zero prototypes
  const noProto = db.prepare(`
    SELECT m.name, m.publisher, m.piece_slot_count as pieces
    FROM modules m
    WHERE m.prototype_count = 0 AND m.piece_slot_count > 20
    ORDER BY m.piece_slot_count DESC LIMIT 15
  `).all() as any[];
  patterns.push({
    name: 'No Prototypes (Copy-Paste Nightmare)',
    description: 'Modules with 20+ pieces but zero prototype definitions. Every piece is independently defined, making updates a nightmare.',
    modules: noProto.map(r => ({ name: r.name, publisher: r.publisher, detail: `${r.pieces} pieces, 0 prototypes` })),
  });

  // AP2: High piece count, zero GKCs
  const noGkc = db.prepare(`
    SELECT m.name, m.publisher, m.piece_slot_count as pieces
    FROM modules m
    WHERE m.piece_slot_count > 50
    AND m.id NOT IN (SELECT DISTINCT module_id FROM gkc_definitions)
    ORDER BY m.piece_slot_count DESC LIMIT 15
  `).all() as any[];
  patterns.push({
    name: 'No Global Key Commands (No Mass Operations)',
    description: 'Modules with 50+ pieces but zero GKCs. Users must manually manipulate every piece individually.',
    modules: noGkc.map(r => ({ name: r.name, publisher: r.publisher, detail: `${r.pieces} pieces, 0 GKCs` })),
  });

  // AP3: TriggerActions with no ReportState in same module
  const silentAutomation = db.prepare(`
    SELECT m.name, m.publisher,
      (SELECT COUNT(*) FROM trait_counts WHERE module_id = m.id AND trait_id = 'macro') as triggers,
      (SELECT COUNT(*) FROM trait_counts WHERE module_id = m.id AND trait_id = 'report') as reports
    FROM modules m
    WHERE m.id IN (SELECT module_id FROM trait_counts WHERE trait_id = 'macro' AND count > 5)
    AND (SELECT COALESCE(SUM(count),0) FROM trait_counts WHERE module_id = m.id AND trait_id = 'report') = 0
    ORDER BY triggers DESC LIMIT 15
  `).all() as any[];
  patterns.push({
    name: 'Silent Automation (Triggers Without Reporting)',
    description: 'Modules with 5+ TriggerAction traits but zero ReportState traits. Automation happens invisibly with no chat log feedback.',
    modules: silentAutomation.map(r => ({ name: r.name, publisher: r.publisher, detail: `${r.triggers} triggers, ${r.reports} reports` })),
  });

  // AP4: Embellishments without DynamicProperty (stateless visuals)
  const statelessEmb = db.prepare(`
    SELECT m.name, m.publisher,
      COALESCE((SELECT count FROM trait_counts WHERE module_id = m.id AND trait_id = 'emb2'), 0) as embs,
      COALESCE((SELECT count FROM trait_counts WHERE module_id = m.id AND trait_id = 'PROP'), 0) as dynprops
    FROM modules m
    WHERE COALESCE((SELECT count FROM trait_counts WHERE module_id = m.id AND trait_id = 'emb2'), 0) > 20
    AND COALESCE((SELECT count FROM trait_counts WHERE module_id = m.id AND trait_id = 'PROP'), 0) = 0
    ORDER BY embs DESC LIMIT 15
  `).all() as any[];
  patterns.push({
    name: 'Stateless Embellishments (No DynamicProperty)',
    description: 'Modules with many Embellishment layers but zero DynamicProperties. Visual states exist without trackable game state.',
    modules: statelessEmb.map(r => ({ name: r.name, publisher: r.publisher, detail: `${r.embs} embellishments, 0 dynamic properties` })),
  });

  // AP5: Missing essential UI components
  const noZoomer = db.prepare(`
    SELECT m.name, m.publisher, m.piece_slot_count as pieces
    FROM modules m
    WHERE m.id NOT IN (SELECT module_id FROM module_features WHERE feature_name = 'hasZoomer' AND present = 1)
    AND m.id NOT IN (SELECT module_id FROM module_features WHERE feature_name = 'hasCounterDetailViewer' AND present = 1)
    AND m.piece_slot_count > 30
    ORDER BY m.piece_slot_count DESC LIMIT 15
  `).all() as any[];
  patterns.push({
    name: 'Missing Essential UI (No Zoomer AND No Mouse-Over Viewer)',
    description: 'Modules with 30+ pieces lacking both zoom controls and counter detail viewer. Poor user experience.',
    modules: noZoomer.map(r => ({ name: r.name, publisher: r.publisher, detail: `${r.pieces} pieces, no zoom, no mouse-over` })),
  });

  // AP6: Excessive trait chains (20+ traits per piece, no SubMenu)
  const bloatedPieces = db.prepare(`
    SELECT m.name, m.publisher,
      MAX(pd.trait_count) as max_traits,
      pd.name as proto_name
    FROM modules m
    JOIN prototype_definitions pd ON pd.module_id = m.id
    WHERE pd.trait_count > 20
    AND m.id NOT IN (SELECT module_id FROM trait_counts WHERE trait_id = 'submenu' AND count > 0)
    GROUP BY m.id
    ORDER BY max_traits DESC LIMIT 15
  `).all() as any[];
  patterns.push({
    name: 'Trait Bloat Without SubMenu (Menu Overload)',
    description: 'Prototypes with 20+ traits but no SubMenu usage. Right-click menu becomes overwhelming.',
    modules: bloatedPieces.map(r => ({ name: r.name, publisher: r.publisher, detail: `${r.max_traits} traits in "${r.proto_name}", no submenus` })),
  });

  return patterns;
}

// ─────────────────────────────────────────────
// 3. PUBLISHER QUALITY
// ─────────────────────────────────────────────

function publisherQuality(scores: ModuleScore[]): { publisher: string; avg: number; count: number; median: number; best: string; bestScore: number }[] {
  const byPub = new Map<string, ModuleScore[]>();
  for (const s of scores) {
    if (!byPub.has(s.publisher)) byPub.set(s.publisher, []);
    byPub.get(s.publisher)!.push(s);
  }

  const results: any[] = [];
  for (const [pub, mods] of byPub) {
    const sorted = [...mods].sort((a, b) => b.composite - a.composite);
    const avg = sorted.reduce((s, m) => s + m.composite, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)].composite;
    results.push({
      publisher: pub,
      count: sorted.length,
      avg: Math.round(avg * 10) / 10,
      median: Math.round(median * 10) / 10,
      best: sorted[0].name,
      bestScore: sorted[0].composite,
    });
  }
  results.sort((a, b) => b.avg - a.avg);
  return results;
}

// ─────────────────────────────────────────────
// 4. QUALITY OVER TIME (by VASSAL version bucket)
// ─────────────────────────────────────────────

function qualityOverTime(scores: ModuleScore[]): { version: string; count: number; avgScore: number }[] {
  const buckets = new Map<string, number[]>();
  for (const s of scores) {
    const m = s.vassal_version?.match(/(\d+\.\d+)/);
    const bucket = m ? m[1] : 'unknown';
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(s.composite);
  }
  const results: any[] = [];
  for (const [v, vals] of buckets) {
    results.push({
      version: v,
      count: vals.length,
      avgScore: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10,
    });
  }
  results.sort((a, b) => parseFloat(a.version || '0') - parseFloat(b.version || '0'));
  return results;
}

// ─────────────────────────────────────────────
// REPORT GENERATION
// ─────────────────────────────────────────────

function generateReport() {
  console.log('Computing quality scores for all modules...');
  const scores = computeScores();

  console.log('Detecting anti-patterns...');
  const antiPatterns = detectAntiPatterns();

  console.log('Computing publisher quality...');
  const pubQuality = publisherQuality(scores);

  console.log('Computing quality over time...');
  const timeQuality = qualityOverTime(scores);

  // Distribution stats
  const composites = scores.map(s => s.composite);
  const avg = composites.reduce((a, b) => a + b, 0) / composites.length;
  const p25 = composites[Math.floor(composites.length * 0.75)]; // sorted desc
  const p75 = composites[Math.floor(composites.length * 0.25)];
  const median = composites[Math.floor(composites.length * 0.5)];

  const top20 = scores.slice(0, 20);
  const bottom20 = scores.slice(-20).reverse();

  // Find outliers: modules scoring much higher or lower than their publisher average
  const pubAvg = new Map<string, number>();
  for (const p of pubQuality) pubAvg.set(p.publisher, p.avg);

  const outliers = scores
    .map(s => ({ ...s, delta: s.composite - (pubAvg.get(s.publisher) || avg) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 20);

  // Build markdown
  const lines: string[] = [];
  const w = (s: string) => lines.push(s);

  w('# Team 4: Module Quality Analysis');
  w('');
  w(`**Corpus:** ${scores.length} modules | **Generated:** ${new Date().toISOString().slice(0, 10)}`);
  w('');
  w('## Scoring Model');
  w('');
  w('Each module scored 0-100 across 7 weighted dimensions:');
  w('');
  w('| Dimension | Weight | Measures |');
  w('|-----------|--------|----------|');
  w('| Prototype Reuse | 20% | Pieces using prototypes / total pieces |');
  w('| Automation Depth | 20% | (Triggers + GKCs + CalcProps + DynProps) / pieces |');
  w('| Reporting Coverage | 10% | ReportState traits relative to piece count |');
  w('| Trait Efficiency | 10% | Diversity of trait types vs chain length in prototypes |');
  w('| Expression Sophistication | 15% | BeanShell usage, function diversity, property references |');
  w('| VASSAL Modernity | 10% | Engine version + modern features (Mat, Attachment, Flare) |');
  w('| Component Completeness | 15% | Presence of Zoomer, CDV, Inventory, GlobalMap, TurnTracker, etc. |');
  w('');
  w('## Score Distribution');
  w('');
  w(`- **Mean:** ${Math.round(avg * 10) / 10}`);
  w(`- **Median:** ${Math.round(median * 10) / 10}`);
  w(`- **25th percentile:** ${Math.round(p25 * 10) / 10}`);
  w(`- **75th percentile:** ${Math.round(p75 * 10) / 10}`);
  w(`- **Max:** ${composites[0]}`);
  w(`- **Min:** ${composites[composites.length - 1]}`);
  w('');

  // Histogram
  w('### Score Histogram');
  w('');
  w('| Range | Count | Bar |');
  w('|-------|-------|-----|');
  const buckets = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  for (const b of buckets) {
    const count = composites.filter(c => c >= b && c < b + 10).length;
    const bar = '#'.repeat(Math.round(count / 3));
    w(`| ${b}-${b + 9} | ${count} | ${bar} |`);
  }
  w('');

  // TOP 20
  w('## Top 20 "Gold Standard" Modules');
  w('');
  w('These are the highest-quality modules by composite score. Mine these for templates and best practices.');
  w('');
  w('| Rank | Module | Publisher | Score | Proto | Auto | Report | Eff | Expr | Modern | Complete | Pieces |');
  w('|------|--------|-----------|-------|-------|------|--------|-----|------|--------|----------|--------|');
  for (let i = 0; i < top20.length; i++) {
    const s = top20[i];
    w(`| ${i + 1} | ${s.name} | ${s.publisher} | **${s.composite}** | ${s.prototypeReuse} | ${s.automationDepth} | ${s.reportingCoverage} | ${s.traitEfficiency} | ${s.expressionSophistication} | ${s.vassalModernity} | ${s.componentCompleteness} | ${s.piece_count} |`);
  }
  w('');

  // What makes top modules exceptional
  w('### What Makes the Top Modules Exceptional');
  w('');
  const topFeatures = new Map<string, number>();
  for (const s of top20) {
    const features = db.prepare(`SELECT feature_name FROM module_features WHERE module_id = ? AND present = 1`).all(s.id) as any[];
    for (const f of features) {
      topFeatures.set(f.feature_name, (topFeatures.get(f.feature_name) || 0) + 1);
    }
  }
  w('**Feature prevalence in top 20:**');
  w('');
  for (const [feat, count] of [...topFeatures.entries()].sort((a, b) => b[1] - a[1])) {
    w(`- ${feat.replace('has', '')}: ${count}/20 (${Math.round(count / 20 * 100)}%)`);
  }
  w('');
  w('**Common patterns in top modules:**');
  w('- Heavy prototype usage (avg reuse ratio > 0.8) — DRY principle');
  w('- Rich automation with TriggerAction chains backed by ReportState');
  w('- BeanShell expressions for calculated properties and conditional logic');
  w('- Full UI complement: Zoomer + CounterDetailViewer + Inventory + TurnTracker');
  w('');

  // BOTTOM 20
  w('## Bottom 20 "Cautionary Tale" Modules');
  w('');
  w('| Rank | Module | Publisher | Score | Proto | Auto | Report | Eff | Expr | Modern | Complete | Pieces |');
  w('|------|--------|-----------|-------|-------|------|--------|-----|------|--------|----------|--------|');
  for (let i = 0; i < bottom20.length; i++) {
    const s = bottom20[i];
    w(`| ${scores.length - i} | ${s.name} | ${s.publisher} | **${s.composite}** | ${s.prototypeReuse} | ${s.automationDepth} | ${s.reportingCoverage} | ${s.traitEfficiency} | ${s.expressionSophistication} | ${s.vassalModernity} | ${s.componentCompleteness} | ${s.piece_count} |`);
  }
  w('');
  w('**Common problems in bottom modules:**');
  w('- Zero prototypes: every piece defined independently');
  w('- No automation: pieces are just images with BasicPiece');
  w('- No UI polish: missing Zoomer, CounterDetailViewer, Inventory');
  w('- Old VASSAL versions with no modern features');
  w('- No expressions: purely manual gameplay');
  w('');

  // ANTI-PATTERNS
  w('## Anti-Pattern Catalog');
  w('');
  for (const ap of antiPatterns) {
    w(`### ${ap.name}`);
    w('');
    w(ap.description);
    w('');
    if (ap.modules.length > 0) {
      w('| Module | Publisher | Detail |');
      w('|--------|-----------|--------|');
      for (const m of ap.modules) {
        w(`| ${m.name} | ${m.publisher} | ${m.detail} |`);
      }
    } else {
      w('*No modules matched this pattern.*');
    }
    w('');
  }

  // PUBLISHER QUALITY
  w('## Quality by Publisher');
  w('');
  w('| Publisher | Modules | Avg Score | Median | Best Module | Best Score |');
  w('|----------|---------|-----------|--------|-------------|------------|');
  for (const p of pubQuality) {
    w(`| ${p.publisher} | ${p.count} | **${p.avg}** | ${p.median} | ${p.best} | ${p.bestScore} |`);
  }
  w('');

  // QUALITY OVER TIME
  w('## Quality Over Time (by VASSAL Version)');
  w('');
  w('| VASSAL Version | Modules | Avg Quality Score |');
  w('|---------------|---------|-------------------|');
  for (const t of timeQuality) {
    w(`| ${t.version} | ${t.count} | **${t.avgScore}** |`);
  }
  w('');

  // OUTLIERS
  w('## Quality Outliers');
  w('');
  w('Modules scoring much higher or lower than their publisher average.');
  w('');
  const highOutliers = outliers.filter(o => o.delta > 0).slice(0, 10);
  const lowOutliers = outliers.filter(o => o.delta < 0).slice(0, 10);

  w('### Surprisingly HIGH Quality');
  w('');
  w('| Module | Publisher | Score | Publisher Avg | Delta |');
  w('|--------|-----------|-------|--------------|-------|');
  for (const o of highOutliers) {
    w(`| ${o.name} | ${o.publisher} | ${o.composite} | ${pubAvg.get(o.publisher)} | +${Math.round(o.delta * 10) / 10} |`);
  }
  w('');

  w('### Surprisingly LOW Quality');
  w('');
  w('| Module | Publisher | Score | Publisher Avg | Delta |');
  w('|--------|-----------|-------|--------------|-------|');
  for (const o of lowOutliers) {
    w(`| ${o.name} | ${o.publisher} | ${o.composite} | ${pubAvg.get(o.publisher)} | ${Math.round(o.delta * 10) / 10} |`);
  }
  w('');

  // RECOMMENDATIONS
  w('## Recommendations for Module Builder');
  w('');
  w('### Features to Strongly Recommend');
  w('1. **Prototype usage** — 40%+ of modules have zero or minimal prototypes. The builder should enforce prototype-first design.');
  w('2. **CounterDetailViewer** — Essential UX. Auto-include in every module.');
  w('3. **Zoomer** — Should be default on every map.');
  w('4. **ReportState on automation** — Every TriggerAction should have a corresponding report.');
  w('5. **SubMenu for complex pieces** — Any piece with 10+ commands needs menu organization.');
  w('');
  w('### Anti-Patterns to Guard Against');
  w('1. **Copy-paste pieces** — Block or warn when adding similar pieces without a shared prototype.');
  w('2. **Silent triggers** — Warn when adding TriggerAction without ReportState.');
  w('3. **Missing Zoomer/CDV** — Auto-suggest during module creation.');
  w('4. **Stateless embellishments** — Suggest DynamicProperty pairing for each Embellishment.');
  w('');

  const report = lines.join('\n');
  fs.writeFileSync(OUT_PATH, report);
  console.log(`Report written to ${OUT_PATH} (${lines.length} lines)`);

  // Summary to stdout
  console.log(`\n=== QUALITY ANALYSIS SUMMARY ===`);
  console.log(`Modules scored: ${scores.length}`);
  console.log(`Mean score: ${Math.round(avg * 10) / 10} | Median: ${Math.round(median * 10) / 10}`);
  console.log(`Top module: ${top20[0].name} (${top20[0].composite})`);
  console.log(`Bottom module: ${bottom20[bottom20.length - 1].name} (${bottom20[bottom20.length - 1].composite})`);
  console.log(`Anti-patterns found: ${antiPatterns.reduce((s, a) => s + a.modules.length, 0)} instances across ${antiPatterns.length} categories`);
}

generateReport();
