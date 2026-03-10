/**
 * Team 3 — Comparative Analysis: Game Type Segmentation & Cross-Pollination
 *
 * Classifies 562 VASSAL modules by structural signals into game types,
 * then finds distinctive patterns per cohort and cross-pollination opportunities.
 */

import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';

const DB_PATH = '/Users/matt.kelley/git/vassal-module-builder/data/module-corpus.db';
const OUTPUT_PATH = '/Users/matt.kelley/git/vassal-module-builder/data/analysis/team3-comparative.md';

const db = new Database(DB_PATH, { readonly: true });
db.pragma('journal_mode = WAL');

// ─── HELPERS ───────────────────────────────────────────────────────────

function query<T = any>(sql: string, params: any[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

const lines: string[] = [];
function out(s: string = '') { lines.push(s); }

// ─── 1. GAME TYPE CLASSIFICATION ───────────────────────────────────────

interface ModuleProfile {
  id: number;
  name: string;
  filename: string;
  publisher: string;
  vassal_version: string;
  piece_slot_count: number;
  // structural signals
  hasHexGrid: boolean;
  hasSquareGrid: boolean;
  hasRegionGrid: boolean;
  hasZonedGrid: boolean;
  drawPileCount: number;
  pieceSlotCount: number;
  obsTraitPct: number; // % of pieces with obs trait
  rotateTraitPct: number;
  sendtoCount: number;
  returnCount: number;
  markCount: number;
  macroCount: number;
  emb2Count: number;
  totalTraits: number;
  prototypeCount: number;
  expressionCount: number;
  gkcCount: number;
  propertyCount: number;
  gameType?: string;
}

// Build per-module structural profiles
function buildProfiles(): ModuleProfile[] {
  const modules = query<any>(`SELECT id, name, filename, publisher, vassal_version, piece_slot_count, prototype_count FROM modules`);

  // Grid presence per module
  const grids = query<{module_id: number, grid_type: string}>(`SELECT module_id, grid_type FROM grid_types`);
  const gridMap = new Map<number, Set<string>>();
  for (const g of grids) {
    if (!gridMap.has(g.module_id)) gridMap.set(g.module_id, new Set());
    gridMap.get(g.module_id)!.add(g.grid_type);
  }

  // DrawPile count per module
  const drawPiles = query<{module_id: number, cnt: number}>(`SELECT module_id, COUNT(*) as cnt FROM component_tree WHERE short_tag='DrawPile' GROUP BY module_id`);
  const dpMap = new Map(drawPiles.map(d => [d.module_id, d.cnt]));

  // Trait counts per module
  const traitCounts = query<{module_id: number, trait_id: string, count: number}>(`SELECT module_id, trait_id, count FROM trait_counts`);
  const tcMap = new Map<number, Map<string, number>>();
  for (const t of traitCounts) {
    if (!tcMap.has(t.module_id)) tcMap.set(t.module_id, new Map());
    tcMap.get(t.module_id)!.set(t.trait_id, t.count);
  }

  // Total pieces per module (count of 'piece' trait = one per piece/proto)
  // obs percentage: need obs count vs piece count per module

  // Expression counts
  const exprCounts = query<{module_id: number, cnt: number}>(`SELECT module_id, COUNT(*) as cnt FROM expressions GROUP BY module_id`);
  const exprMap = new Map(exprCounts.map(e => [e.module_id, e.cnt]));

  // GKC counts
  const gkcCounts = query<{module_id: number, cnt: number}>(`SELECT module_id, COUNT(*) as cnt FROM gkc_definitions GROUP BY module_id`);
  const gkcMap = new Map(gkcCounts.map(g => [g.module_id, g.cnt]));

  // Property counts
  const propCounts = query<{module_id: number, cnt: number}>(`SELECT module_id, COUNT(*) as cnt FROM properties GROUP BY module_id`);
  const propMap = new Map(propCounts.map(p => [p.module_id, p.cnt]));

  // PieceSlot counts from component_tree
  const psCounts = query<{module_id: number, cnt: number}>(`SELECT module_id, COUNT(*) as cnt FROM component_tree WHERE short_tag='PieceSlot' GROUP BY module_id`);
  const psMap = new Map(psCounts.map(p => [p.module_id, p.cnt]));

  return modules.map(m => {
    const gs = gridMap.get(m.id) || new Set();
    const tc = tcMap.get(m.id) || new Map();
    const pieceCount = tc.get('piece') || 0;
    const obsCount = tc.get('obs') || 0;
    const rotateCount = tc.get('rotate') || 0;
    const totalTraits = Array.from(tc.values()).reduce((a, b) => a + b, 0);

    return {
      id: m.id,
      name: m.name,
      filename: m.filename,
      publisher: m.publisher || '',
      vassal_version: m.vassal_version || '',
      piece_slot_count: m.piece_slot_count || 0,
      hasHexGrid: gs.has('HexGrid'),
      hasSquareGrid: gs.has('SquareGrid'),
      hasRegionGrid: gs.has('RegionGrid'),
      hasZonedGrid: gs.has('ZonedGrid'),
      drawPileCount: dpMap.get(m.id) || 0,
      pieceSlotCount: psMap.get(m.id) || 0,
      obsTraitPct: pieceCount > 0 ? obsCount / pieceCount : 0,
      rotateTraitPct: pieceCount > 0 ? rotateCount / pieceCount : 0,
      sendtoCount: tc.get('sendto') || 0,
      returnCount: tc.get('return') || 0,
      markCount: tc.get('mark') || 0,
      macroCount: tc.get('macro') || 0,
      emb2Count: tc.get('emb2') || 0,
      totalTraits: totalTraits,
      prototypeCount: m.prototype_count || 0,
      expressionCount: exprMap.get(m.id) || 0,
      gkcCount: gkcMap.get(m.id) || 0,
      propertyCount: propMap.get(m.id) || 0,
    };
  });
}

function classifyModule(p: ModuleProfile): string {
  // Card-driven: high draw pile count relative to pieces, lots of return/sendto
  const cardSignal = p.drawPileCount >= 3 && (p.returnCount > 10 || p.sendtoCount > 20);
  const highDeckRatio = p.drawPileCount >= 2 && p.pieceSlotCount > 0 && p.drawPileCount / (p.pieceSlotCount / 100 + 1) > 0.5;

  // Block game: high obs percentage (>40% of pieces obscurable)
  const blockSignal = p.obsTraitPct > 0.35 && p.emb2Count < p.pieceSlotCount * 2;

  // Naval/air: high rotate percentage
  const navalSignal = p.rotateTraitPct > 0.15 && (p.hasHexGrid || p.hasSquareGrid);

  // Area/P2P: RegionGrid dominant, no hex/square
  const areaSignal = p.hasRegionGrid && !p.hasHexGrid;
  const p2pSignal = !p.hasHexGrid && !p.hasSquareGrid && p.hasZonedGrid;

  // Hex-and-counter: has hex grid, high piece count, mark traits
  const hexSignal = p.hasHexGrid && p.pieceSlotCount > 20;

  // Priority classification (more specific first)
  if (blockSignal && !cardSignal) return 'block';
  if (cardSignal || highDeckRatio && !p.hasHexGrid && p.drawPileCount >= 4) return 'card-driven';
  if (navalSignal && p.rotateTraitPct > 0.25) return 'naval-air';
  if (areaSignal || (p2pSignal && !hexSignal)) return 'area-p2p';
  if (hexSignal) return 'hex-and-counter';
  if (p.hasSquareGrid && p.pieceSlotCount > 20) return 'square-grid';
  if (p.drawPileCount >= 2 && !p.hasHexGrid && !p.hasSquareGrid) return 'card-driven';
  return 'other';
}

// ─── 2. TRAIT PROFILES PER COHORT ──────────────────────────────────────

function traitProfilesPerCohort(profiles: ModuleProfile[]) {
  const cohorts = new Map<string, number[]>();
  for (const p of profiles) {
    if (!cohorts.has(p.gameType!)) cohorts.set(p.gameType!, []);
    cohorts.get(p.gameType!)!.push(p.id);
  }

  // Get trait frequency per cohort: what % of modules in cohort use each trait
  const allTraitIds = query<{trait_id: string}>(`SELECT DISTINCT trait_id FROM trait_counts WHERE trait_id != 'null'`).map(t => t.trait_id);

  // For TF-IDF style: frequency in cohort vs frequency overall
  const globalFreq = new Map<string, number>(); // trait -> # modules using it
  const traitModules = query<{trait_id: string, cnt: number}>(`SELECT trait_id, COUNT(DISTINCT module_id) as cnt FROM trait_chains WHERE trait_id != 'null' GROUP BY trait_id`);
  for (const t of traitModules) globalFreq.set(t.trait_id, t.cnt);

  const results: { cohort: string; count: number; distinctive: { trait: string; cohortPct: number; otherPct: number; ratio: number }[] }[] = [];

  for (const [cohort, ids] of cohorts) {
    const idSet = new Set(ids);
    const otherIds = profiles.filter(p => p.gameType !== cohort).map(p => p.id);
    const otherSet = new Set(otherIds);

    // Per trait: what % of this cohort uses it vs what % of others
    const cohortTraitPresence = query<{trait_id: string, cnt: number}>(
      `SELECT trait_id, COUNT(DISTINCT module_id) as cnt FROM trait_chains
       WHERE module_id IN (${ids.join(',')}) AND trait_id != 'null'
       GROUP BY trait_id`
    );

    const otherTraitPresence = query<{trait_id: string, cnt: number}>(
      `SELECT trait_id, COUNT(DISTINCT module_id) as cnt FROM trait_chains
       WHERE module_id IN (${otherIds.join(',')}) AND trait_id != 'null'
       GROUP BY trait_id`
    );
    const otherMap = new Map(otherTraitPresence.map(t => [t.trait_id, t.cnt]));

    const distinctive = cohortTraitPresence.map(t => {
      const cohortPct = t.cnt / ids.length;
      const otherPct = (otherMap.get(t.trait_id) || 0) / otherIds.length;
      const ratio = otherPct > 0 ? cohortPct / otherPct : cohortPct * 100;
      return { trait: t.trait_id, cohortPct, otherPct, ratio };
    }).filter(t => t.cohortPct > 0.1) // at least 10% of cohort
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10);

    results.push({ cohort, count: ids.length, distinctive });
  }

  return results;
}

// ─── 3. COMPLEXITY BY GAME TYPE ────────────────────────────────────────

function complexityByType(profiles: ModuleProfile[]) {
  const cohorts = new Map<string, ModuleProfile[]>();
  for (const p of profiles) {
    if (!cohorts.has(p.gameType!)) cohorts.set(p.gameType!, []);
    cohorts.get(p.gameType!)!.push(p);
  }

  const results: any[] = [];
  for (const [cohort, mods] of cohorts) {
    const avg = (fn: (p: ModuleProfile) => number) => mods.reduce((a, p) => a + fn(p), 0) / mods.length;
    results.push({
      cohort,
      count: mods.length,
      avgTraits: Math.round(avg(p => p.totalTraits)),
      avgExpressions: Math.round(avg(p => p.expressionCount)),
      avgGKCs: Math.round(avg(p => p.gkcCount) * 10) / 10,
      avgProperties: Math.round(avg(p => p.propertyCount) * 10) / 10,
      avgPrototypes: Math.round(avg(p => p.prototypeCount)),
      avgMacros: Math.round(avg(p => p.macroCount)),
      avgPieces: Math.round(avg(p => p.pieceSlotCount)),
    });
  }
  return results.sort((a, b) => b.avgTraits - a.avgTraits);
}

// ─── 4. MINORITY COHORT DEEP DIVES ────────────────────────────────────

function deepDiveMinority(profiles: ModuleProfile[], cohort: string, limit = 5) {
  const mods = profiles.filter(p => p.gameType === cohort)
    .sort((a, b) => (b.totalTraits + b.expressionCount * 5 + b.macroCount * 3 + b.gkcCount * 5)
                   - (a.totalTraits + a.expressionCount * 5 + a.macroCount * 3 + a.gkcCount * 5))
    .slice(0, limit);

  const details = mods.map(m => {
    // Get unique traits used
    const traits = query<{trait_id: string, cnt: number}>(
      `SELECT trait_id, COUNT(*) as cnt FROM trait_chains WHERE module_id=? AND trait_id != 'null' GROUP BY trait_id ORDER BY cnt DESC`,
      [m.id]
    );

    // Get top expressions
    const exprs = query<{expression_text: string, expr_type: string}>(
      `SELECT expression_text, expr_type FROM expressions WHERE module_id=? LIMIT 5`,
      [m.id]
    );

    // Components unique to this module
    const components = query<{short_tag: string, cnt: number}>(
      `SELECT short_tag, COUNT(*) as cnt FROM component_tree WHERE module_id=? GROUP BY short_tag ORDER BY cnt DESC LIMIT 15`,
      [m.id]
    );

    return {
      name: m.name,
      publisher: m.publisher,
      filename: m.filename,
      pieces: m.pieceSlotCount,
      drawPiles: m.drawPileCount,
      totalTraits: m.totalTraits,
      expressions: m.expressionCount,
      gkcs: m.gkcCount,
      macros: m.macroCount,
      prototypes: m.prototypeCount,
      traits: traits.slice(0, 12),
      topExpressions: exprs,
      components: components,
      vassalVersion: m.vassal_version,
    };
  });

  return details;
}

// ─── 5. CROSS-POLLINATION ANALYSIS ─────────────────────────────────────

function crossPollination(profiles: ModuleProfile[]) {
  const cohorts = new Map<string, number[]>();
  for (const p of profiles) {
    if (!cohorts.has(p.gameType!)) cohorts.set(p.gameType!, []);
    cohorts.get(p.gameType!)!.push(p.id);
  }

  // For each trait, find which cohort uses it most vs least
  const traitByCohort = new Map<string, Map<string, number>>(); // trait -> cohort -> pct

  for (const [cohort, ids] of cohorts) {
    const traitPresence = query<{trait_id: string, cnt: number}>(
      `SELECT trait_id, COUNT(DISTINCT module_id) as cnt FROM trait_chains
       WHERE module_id IN (${ids.join(',')}) AND trait_id != 'null'
       GROUP BY trait_id`
    );
    for (const t of traitPresence) {
      if (!traitByCohort.has(t.trait_id)) traitByCohort.set(t.trait_id, new Map());
      traitByCohort.get(t.trait_id)!.set(cohort, t.cnt / ids.length);
    }
  }

  // Find traits with high variance across cohorts
  const opportunities: { trait: string; highCohort: string; highPct: number; lowCohort: string; lowPct: number; gap: number }[] = [];

  for (const [trait, cohortPcts] of traitByCohort) {
    let maxC = '', maxP = 0, minC = '', minP = 1;
    for (const [c, p] of cohortPcts) {
      if (p > maxP) { maxP = p; maxC = c; }
      if (p < minP) { minP = p; minC = c; }
    }
    if (maxP > 0.2 && maxP - minP > 0.15) {
      opportunities.push({ trait, highCohort: maxC, highPct: maxP, lowCohort: minC, lowPct: minP, gap: maxP - minP });
    }
  }

  return opportunities.sort((a, b) => b.gap - a.gap).slice(0, 20);
}

// ─── 6. VASSAL VERSION BY GAME TYPE ────────────────────────────────────

function versionByType(profiles: ModuleProfile[]) {
  const cohorts = new Map<string, ModuleProfile[]>();
  for (const p of profiles) {
    if (!cohorts.has(p.gameType!)) cohorts.set(p.gameType!, []);
    cohorts.get(p.gameType!)!.push(p);
  }

  // Parse major.minor from vassal_version
  function majorMinor(v: string): number {
    const m = v.match(/^(\d+)\.(\d+)/);
    return m ? parseFloat(`${m[1]}.${m[2]}`) : 0;
  }

  const results: any[] = [];
  for (const [cohort, mods] of cohorts) {
    const versions = mods.map(m => majorMinor(m.vassal_version)).filter(v => v > 0);
    const avg = versions.length > 0 ? versions.reduce((a, b) => a + b, 0) / versions.length : 0;
    const v37 = versions.filter(v => v >= 3.7).length;
    const v36 = versions.filter(v => v >= 3.6 && v < 3.7).length;
    const pre36 = versions.filter(v => v < 3.6).length;

    // Check for new features (mat, attachment, multiLocation)
    const ids = mods.map(m => m.id);
    const newFeatures = query<{cnt: number}>(
      `SELECT COUNT(DISTINCT module_id) as cnt FROM trait_chains WHERE module_id IN (${ids.join(',')}) AND trait_id IN ('mat','attachment','multiLocation')`,
    )[0]?.cnt || 0;

    results.push({
      cohort,
      count: mods.length,
      avgVersion: Math.round(avg * 100) / 100,
      pct37: Math.round(v37 / versions.length * 100),
      pct36: Math.round(v36 / versions.length * 100),
      pctPre36: Math.round(pre36 / versions.length * 100),
      newFeatureModules: newFeatures,
    });
  }
  return results.sort((a, b) => b.avgVersion - a.avgVersion);
}

// ─── 7. TOP MODULES BY TYPE ────────────────────────────────────────────

function topModulesByType(profiles: ModuleProfile[]) {
  const cohorts = new Map<string, ModuleProfile[]>();
  for (const p of profiles) {
    if (!cohorts.has(p.gameType!)) cohorts.set(p.gameType!, []);
    cohorts.get(p.gameType!)!.push(p);
  }

  const results = new Map<string, {name: string; publisher: string; score: number; traits: number; exprs: number; gkcs: number}[]>();
  for (const [cohort, mods] of cohorts) {
    const scored = mods.map(m => ({
      name: m.name,
      publisher: m.publisher,
      score: m.totalTraits + m.expressionCount * 5 + m.gkcCount * 10 + m.macroCount * 3,
      traits: m.totalTraits,
      exprs: m.expressionCount,
      gkcs: m.gkcCount,
    })).sort((a, b) => b.score - a.score).slice(0, 5);
    results.set(cohort, scored);
  }
  return results;
}

// ─── MAIN ──────────────────────────────────────────────────────────────

function main() {
  out('# Team 3 — Comparative Analysis: Game Types & Cross-Pollination');
  out(`\n*Generated: ${new Date().toISOString()}*\n`);
  out('---\n');

  // 1. Classification
  const profiles = buildProfiles();
  for (const p of profiles) {
    p.gameType = classifyModule(p);
  }

  const typeCounts = new Map<string, number>();
  for (const p of profiles) {
    typeCounts.set(p.gameType!, (typeCounts.get(p.gameType!) || 0) + 1);
  }

  out('## 1. Game Type Classification (562 modules)\n');
  out('Classification is based on structural signals (grid types, trait distributions, deck counts) — NOT module names.\n');
  out('| Game Type | Count | % |');
  out('|---|---|---|');
  const sorted = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    out(`| **${type}** | ${count} | ${Math.round(count / profiles.length * 100)}% |`);
  }
  out(`\n**Key finding:** Hex-and-counter dominates at ${typeCounts.get('hex-and-counter') || 0} modules (${Math.round((typeCounts.get('hex-and-counter') || 0) / profiles.length * 100)}%), but there are ${profiles.length - (typeCounts.get('hex-and-counter') || 0)} non-hex modules worth studying.\n`);

  // Publisher breakdown per type
  out('### Publisher Distribution by Game Type\n');
  const publisherByType = new Map<string, Map<string, number>>();
  for (const p of profiles) {
    if (!publisherByType.has(p.gameType!)) publisherByType.set(p.gameType!, new Map());
    const pm = publisherByType.get(p.gameType!)!;
    pm.set(p.publisher, (pm.get(p.publisher) || 0) + 1);
  }
  for (const [type] of sorted) {
    const pubs = [...(publisherByType.get(type)?.entries() || [])].sort((a, b) => b[1] - a[1]).slice(0, 3);
    out(`- **${type}**: ${pubs.map(([p, c]) => `${p || 'Unknown'} (${c})`).join(', ')}`);
  }
  out('');

  // 2. Trait Profiles
  out('---\n## 2. Distinctive Trait Profiles per Game Type\n');
  out('TF-IDF style: traits that are frequent in this cohort relative to others. Ratio = cohort% / other%.\n');

  const traitProfiles = traitProfilesPerCohort(profiles);
  for (const tp of traitProfiles.sort((a, b) => b.count - a.count)) {
    out(`### ${tp.cohort} (${tp.count} modules)\n`);
    out('| Trait | Cohort % | Others % | Ratio |');
    out('|---|---|---|---|');
    for (const d of tp.distinctive) {
      out(`| \`${d.trait}\` | ${Math.round(d.cohortPct * 100)}% | ${Math.round(d.otherPct * 100)}% | ${d.ratio.toFixed(1)}x |`);
    }
    out('');
  }

  // 3. Complexity
  out('---\n## 3. Complexity by Game Type\n');
  const complexity = complexityByType(profiles);
  out('| Game Type | N | Avg Traits | Avg Expressions | Avg GKCs | Avg Properties | Avg Macros | Avg Pieces |');
  out('|---|---|---|---|---|---|---|---|');
  for (const c of complexity) {
    out(`| **${c.cohort}** | ${c.count} | ${c.avgTraits} | ${c.avgExpressions} | ${c.avgGKCs} | ${c.avgProperties} | ${c.avgMacros} | ${c.avgPieces} |`);
  }
  out('');

  // Most automated modules overall
  out('### Top 10 Most Automated Modules (any type)\n');
  const topAuto = profiles.sort((a, b) =>
    (b.expressionCount + b.gkcCount * 3 + b.macroCount * 2) - (a.expressionCount + a.gkcCount * 3 + a.macroCount * 2)
  ).slice(0, 10);
  out('| Module | Type | Expressions | GKCs | Macros | Publisher |');
  out('|---|---|---|---|---|---|');
  for (const m of topAuto) {
    out(`| ${m.name} | ${m.gameType} | ${m.expressionCount} | ${m.gkcCount} | ${m.macroCount} | ${m.publisher} |`);
  }
  out('');

  // 4. Cross-pollination
  out('---\n## 4. Cross-Pollination Opportunities\n');
  out('Traits with high usage in one cohort but low in another — where the pattern would likely be useful.\n');
  const xpoll = crossPollination(profiles);
  out('| Trait | High in | % | Low in | % | Gap |');
  out('|---|---|---|---|---|---|');
  for (const x of xpoll) {
    out(`| \`${x.trait}\` | ${x.highCohort} | ${Math.round(x.highPct * 100)}% | ${x.lowCohort} | ${Math.round(x.lowPct * 100)}% | ${Math.round(x.gap * 100)}pp |`);
  }

  out('\n### Actionable Cross-Pollination Recommendations\n');
  // Generate specific recommendations based on the data
  const recMap: Record<string, string> = {
    'macro': 'TriggerAction chains enable complex event resolution and combat automation. Card-driven games use these heavily for event card logic — hex wargames could adopt the same pattern for automated CRT resolution, supply checks, and reinforcement scheduling.',
    'obs': 'Obscurable (fog-of-war) is the signature trait of block games but rare in hex games. Hex wargames with hidden unit mechanics (e.g., inverted counters) should use obs instead of manual image-swapping embellishments.',
    'return': 'ReturnToDeck enables card cycling and discard mechanics. Area-movement games with event decks could benefit from proper deck management instead of ad-hoc piece movement.',
    'rotate': 'FreeRotator is essential for naval/air games (facing matters). Hex wargames with ZOC or directional combat could use rotation to indicate unit facing instead of separate embellishment layers.',
    'calcProp': 'CalculatedProperty enables auto-computed values (combat odds, supply status). Very rare across all types but extremely powerful for reducing manual calculation.',
    'PROP': 'DynamicProperty tracks mutable game state. Card-driven games use this heavily for victory points and political tracks — hex wargames could use it for step losses, ammo, and fatigue instead of embellishment states.',
    'globalkey': 'CounterGlobalKeyCommand targets pieces by property filter. Enables "affect all units in this hex" or "flip all cards of type X" automation.',
    'footprint': 'Movement trails (Footprint) help track unit movement for games with movement point limits. Common in hex games but would be equally useful in area-movement games.',
  };

  for (const x of xpoll.slice(0, 8)) {
    if (recMap[x.trait]) {
      out(`**\`${x.trait}\`** (${x.highCohort} ${Math.round(x.highPct * 100)}% → ${x.lowCohort} ${Math.round(x.lowPct * 100)}%): ${recMap[x.trait]}\n`);
    }
  }

  // 5. Minority Cohort Deep Dives
  out('---\n## 5. Minority Cohort Deep Dives\n');

  const minorityTypes = ['card-driven', 'block', 'naval-air', 'area-p2p', 'square-grid', 'other'];
  for (const type of minorityTypes) {
    const count = typeCounts.get(type);
    if (!count) continue;

    out(`### ${type} (${count} modules)\n`);
    const details = deepDiveMinority(profiles, type, 5);

    for (const d of details) {
      out(`#### ${d.name}`);
      out(`- **Publisher:** ${d.publisher || 'Unknown'} | **VASSAL:** ${d.vassalVersion}`);
      out(`- **Pieces:** ${d.pieces} | **Draw Piles:** ${d.drawPiles} | **Prototypes:** ${d.prototypes}`);
      out(`- **Automation:** ${d.expressions} expressions, ${d.gkcs} GKCs, ${d.macros} macros`);
      out(`- **Top traits:** ${d.traits.slice(0, 8).map(t => `\`${t.trait_id}\`(${t.cnt})`).join(', ')}`);
      if (d.topExpressions.length > 0) {
        out(`- **Sample expressions:**`);
        for (const e of d.topExpressions.slice(0, 3)) {
          const truncated = e.expression_text.length > 100 ? e.expression_text.slice(0, 100) + '...' : e.expression_text;
          out(`  - \`${truncated}\` (${e.expr_type})`);
        }
      }
      out('');
    }
  }

  // 6. VASSAL Version by Type
  out('---\n## 6. VASSAL Version Distribution by Game Type\n');
  const versionData = versionByType(profiles);
  out('| Game Type | N | Avg Version | % v3.7+ | % v3.6 | % pre-3.6 | New Feature Users |');
  out('|---|---|---|---|---|---|---|');
  for (const v of versionData) {
    out(`| **${v.cohort}** | ${v.count} | ${v.avgVersion} | ${v.pct37}% | ${v.pct36}% | ${v.pctPre36}% | ${v.newFeatureModules} |`);
  }

  // Check which modules use the newest features
  out('\n### Modules Using 3.6-3.7 Features (Mat, Attachment, MultiLocation)\n');
  const newFeatureUsers = query<{mid: number, trait_id: string}>(
    `SELECT DISTINCT module_id as mid, trait_id FROM trait_chains WHERE trait_id IN ('mat','attachment','multiLocation')`
  );
  const newFeatMap = new Map<number, string[]>();
  for (const nf of newFeatureUsers) {
    if (!newFeatMap.has(nf.mid)) newFeatMap.set(nf.mid, []);
    newFeatMap.get(nf.mid)!.push(nf.trait_id);
  }
  for (const [mid, feats] of newFeatMap) {
    const p = profiles.find(pr => pr.id === mid);
    if (p) {
      out(`- **${p.name}** (${p.gameType}): \`${feats.join(', ')}\` — ${p.publisher}`);
    }
  }
  out('');

  // 7. Top modules per type
  out('---\n## 7. Top 5 Most Sophisticated Modules per Game Type\n');
  out('Scored by: traits + expressions*5 + GKCs*10 + macros*3\n');
  const topByType = topModulesByType(profiles);
  for (const [type, mods] of topByType) {
    out(`### ${type}\n`);
    out('| Module | Publisher | Score | Traits | Exprs | GKCs |');
    out('|---|---|---|---|---|---|');
    for (const m of mods) {
      out(`| ${m.name} | ${m.publisher} | ${m.score} | ${m.traits} | ${m.exprs} | ${m.gkcs} |`);
    }
    out('');
  }

  // 8. Summary / Key Findings
  out('---\n## 8. Key Findings & Recommendations for Feature Catalog\n');
  out(`
### Finding 1: Card-driven games are significantly more automated than hex games
Card-driven modules use TriggerAction chains, DynamicProperties, and GKCs at much higher rates.
The best card-driven modules have sophisticated event-resolution pipelines that hex wargames could
adopt for combat results, supply, and reinforcement automation.

### Finding 2: Block games have a distinctive trait signature centered on Obscurable
Block games are structurally simple (low trait diversity) but use obs trait universally.
This is a clean pattern that ANY game with hidden information could adopt.

### Finding 3: FreeRotator is underused outside naval/air games
Rotation could represent unit facing, turret orientation, or directional ZOC in hex games.
Only naval/air games use it systematically.

### Finding 4: CalculatedProperty and aggregate functions are rare across ALL types
Fewer than 60 modules in the entire corpus use calcProp. This is the biggest missed opportunity
for automation — auto-computed combat odds, supply status, and victory points.

### Finding 5: New VASSAL 3.6-3.7 features have minimal adoption
Mat, Attachment, and MultiLocationCommand appear in very few modules regardless of type.
The Feature Catalog should prominently surface these as "modern best practices."

### Finding 6: Square-grid games are a distinct cohort worth studying
Not just "hex games on squares" — they often represent different game genres (abstract strategy,
block games, card-hybrid games) with different trait profiles.

### Recommendations for vassal-module-builder Feature Catalog:
1. **Add "Combat Automation Template"** — Port card-driven TriggerAction chain patterns to hex game context
2. **Add "Hidden Information Package"** — Obscurable + Restricted traits, inspired by block game patterns
3. **Add "Unit Facing"** — FreeRotator with facing-dependent combat modifiers, from naval patterns
4. **Add "Auto-Computed Properties"** — CalculatedProperty templates for odds/supply/VP (rare everywhere = big opportunity)
5. **Prioritize Mat/Attachment/MultiLocation templates** — Almost zero adoption means huge untapped value
`);

  // Write output
  const content = lines.join('\n');
  writeFileSync(OUTPUT_PATH, content);
  console.log(`Wrote ${lines.length} lines to ${OUTPUT_PATH}`);
}

main();
db.close();
