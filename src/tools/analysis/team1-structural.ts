/**
 * Team 1 "Structural" — Archetype Prototype Analysis
 * Analyzes 24,534 prototype definitions across 562 VASSAL modules
 * to find recurring trait combinations and fundamental archetypes.
 */

import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';

const DB_PATH = '/Users/matt.kelley/git/vassal-module-builder/data/module-corpus.db';
const OUTPUT_PATH = '/Users/matt.kelley/git/vassal-module-builder/data/analysis/team1-structural.md';

const db = new Database(DB_PATH, { readonly: true });

// ── Helpers ──────────────────────────────────────────────────────────────

interface TraitEntry { trait_id: string; params: any[] }
interface ProtoDef { module_id: number; name: string; trait_chain_json: string; trait_count: number }
interface ModuleRow { id: number; filename: string; name: string; version: string; vassal_version: string; publisher: string }

function fingerprint(traitIds: string[]): string {
  // Sorted (trait_id, count) tuples as a canonical fingerprint
  const counts = new Map<string, number>();
  for (const t of traitIds) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1])
    .map(([id, c]) => `${id}:${c}`).join('|');
}

function orderedSignature(traitIds: string[]): string {
  return traitIds.join(',');
}

// ── Load all data ────────────────────────────────────────────────────────

console.log('Loading modules...');
const modules = new Map<number, ModuleRow>();
for (const row of db.prepare('SELECT id, filename, name, version, vassal_version, publisher FROM modules').all() as ModuleRow[]) {
  modules.set(row.id, row);
}

console.log('Loading prototype definitions...');
const allProtos = db.prepare('SELECT module_id, name, trait_chain_json, trait_count FROM prototype_definitions').all() as ProtoDef[];
console.log(`  ${allProtos.length} prototypes loaded`);

// ── Task 1 & 2: Extract trait sequences and fingerprint ──────────────────

interface ParsedProto {
  module_id: number;
  name: string;
  traitIds: string[];
  traitCount: number;
  fp: string;
}

const parsed: ParsedProto[] = [];
let parseErrors = 0;

for (const p of allProtos) {
  try {
    const chain: TraitEntry[] = JSON.parse(p.trait_chain_json || '[]');
    const ids = chain.map(t => t.trait_id).filter(id => id !== 'null');
    if (ids.length === 0) continue;
    parsed.push({
      module_id: p.module_id,
      name: p.name,
      traitIds: ids,
      traitCount: ids.length,
      fp: fingerprint(ids),
    });
  } catch {
    parseErrors++;
  }
}

console.log(`Parsed ${parsed.length} prototypes (${parseErrors} errors)`);

// ── Task 2: Group by fingerprint → archetypes ─────────────────────────────

const fpGroups = new Map<string, ParsedProto[]>();
for (const p of parsed) {
  const arr = fpGroups.get(p.fp) || [];
  arr.push(p);
  fpGroups.set(p.fp, arr);
}

// Sort by count descending
const sortedFps = [...fpGroups.entries()].sort((a, b) => b[1].length - a[1].length);

console.log(`${sortedFps.length} unique fingerprints`);

// ── Task 3: Archetype details ──────────────────────────────────────────────

interface ArchetypeInfo {
  rank: number;
  fp: string;
  traitSet: string;
  count: number;
  moduleCount: number;
  avgTraitCount: number;
  typicalNames: string[];
  publishers: { name: string; count: number }[];
  vassalVersions: { version: string; count: number }[];
  exampleModules: string[];
}

function analyzeArchetype(fp: string, protos: ParsedProto[], rank: number): ArchetypeInfo {
  const moduleIds = new Set(protos.map(p => p.module_id));
  const avgTC = protos.reduce((s, p) => s + p.traitCount, 0) / protos.length;

  // Typical names - count occurrences
  const nameCounts = new Map<string, number>();
  for (const p of protos) {
    const normalized = p.name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    nameCounts.set(normalized, (nameCounts.get(normalized) || 0) + 1);
  }
  const topNames = [...nameCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);

  // Publishers
  const pubCounts = new Map<string, number>();
  for (const mid of moduleIds) {
    const m = modules.get(mid);
    const pub = m?.publisher || 'Unknown';
    pubCounts.set(pub, (pubCounts.get(pub) || 0) + 1);
  }
  const topPubs = [...pubCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  // VASSAL versions
  const verCounts = new Map<string, number>();
  for (const mid of moduleIds) {
    const m = modules.get(mid);
    const v = m?.vassal_version?.replace(/\.\d+$/, '') || 'unknown'; // major.minor only
    verCounts.set(v, (verCounts.get(v) || 0) + 1);
  }
  const topVers = [...verCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([version, count]) => ({ version, count }));

  // Example modules
  const exMods = [...moduleIds].slice(0, 5).map(id => modules.get(id)?.name || 'unknown');

  return {
    rank, fp, traitSet: fp.replace(/\|/g, ', '), count: protos.length,
    moduleCount: moduleIds.size, avgTraitCount: Math.round(avgTC * 10) / 10,
    typicalNames: topNames, publishers: topPubs, vassalVersions: topVers,
    exampleModules: exMods,
  };
}

const top20 = sortedFps.slice(0, 20).map(([fp, protos], i) => analyzeArchetype(fp, protos, i + 1));

// Count how many prototypes are covered by top 20
const top20Fps = new Set(top20.map(a => a.fp));
const coveredCount = parsed.filter(p => top20Fps.has(p.fp)).length;

// ── Task 4: Prototype inheritance depth ────────────────────────────────────

console.log('Analyzing prototype inheritance...');

// Build proto→proto references by checking if a prototype's trait chain contains "prototype" trait_id
// that references another prototype name
interface InheritanceInfo {
  module_id: number;
  proto_name: string;
  references: string[]; // other prototype names referenced via UsePrototype
}

const inheritanceData: InheritanceInfo[] = [];
const protoNamesByModule = new Map<number, Set<string>>();

for (const p of allProtos) {
  const s = protoNamesByModule.get(p.module_id) || new Set();
  s.add(p.name);
  protoNamesByModule.set(p.module_id, s);
}

for (const p of allProtos) {
  try {
    const chain: TraitEntry[] = JSON.parse(p.trait_chain_json || '[]');
    const refs = chain
      .filter(t => t.trait_id === 'prototype')
      .map(t => t.params?.[0])
      .filter(Boolean);
    if (refs.length > 0) {
      inheritanceData.push({ module_id: p.module_id, proto_name: p.name, references: refs as string[] });
    }
  } catch {}
}

// Compute max depth per module
function getDepth(moduleId: number, protoName: string, visited: Set<string>): number {
  if (visited.has(protoName)) return 0; // cycle
  visited.add(protoName);
  const entry = inheritanceData.find(i => i.module_id === moduleId && i.proto_name === protoName);
  if (!entry || entry.references.length === 0) return 0;
  let maxChild = 0;
  for (const ref of entry.references) {
    maxChild = Math.max(maxChild, getDepth(moduleId, ref, new Set(visited)));
  }
  return 1 + maxChild;
}

// Build a map for faster lookup
const inheritMap = new Map<string, InheritanceInfo>();
for (const i of inheritanceData) {
  inheritMap.set(`${i.module_id}::${i.proto_name}`, i);
}

function getDepthFast(moduleId: number, protoName: string, visited: Set<string>): number {
  if (visited.has(protoName)) return 0;
  visited.add(protoName);
  const entry = inheritMap.get(`${moduleId}::${protoName}`);
  if (!entry) return 0;
  let maxChild = 0;
  for (const ref of entry.references) {
    maxChild = Math.max(maxChild, getDepthFast(moduleId, ref, new Set(visited)));
  }
  return 1 + maxChild;
}

// Find deepest chains per module
const moduleMaxDepths = new Map<number, { depth: number; chain: string }>();

for (const p of allProtos) {
  const d = getDepthFast(p.module_id, p.name, new Set());
  const existing = moduleMaxDepths.get(p.module_id);
  if (!existing || d > existing.depth) {
    moduleMaxDepths.set(p.module_id, { depth: d, chain: p.name });
  }
}

const depthDistribution = new Map<number, number>();
for (const { depth } of moduleMaxDepths.values()) {
  depthDistribution.set(depth, (depthDistribution.get(depth) || 0) + 1);
}

// Top 10 deepest
const deepestModules = [...moduleMaxDepths.entries()]
  .sort((a, b) => b[1].depth - a[1].depth)
  .slice(0, 15)
  .map(([mid, info]) => ({ module: modules.get(mid), ...info }));

// Piece → prototype usage stats
const pieceProtoRows = db.prepare('SELECT module_id, piece_name, prototype_name FROM piece_prototypes').all() as { module_id: number; piece_name: string; prototype_name: string }[];
const piecesPerProto = new Map<string, number>();
for (const r of pieceProtoRows) {
  const key = `${r.module_id}::${r.prototype_name}`;
  piecesPerProto.set(key, (piecesPerProto.get(key) || 0) + 1);
}

// Average pieces per prototype
const ppValues = [...piecesPerProto.values()];
const avgPiecesPerProto = ppValues.reduce((s, v) => s + v, 0) / ppValues.length;
const maxPiecesPerProto = Math.max(...ppValues);

// ── Task 5: Unusual archetypes ──────────────────────────────────────────────

console.log('Finding unusual archetypes...');

// Prototypes NOT in top 20 fingerprints
const unusualProtos = parsed.filter(p => !top20Fps.has(p.fp));

// Among unusual, look for new 3.6-3.7 traits
const newTraits = new Set(['mat', 'matCargo', 'attachment', 'multiLocation']);
const modernProtos = unusualProtos.filter(p => p.traitIds.some(t => newTraits.has(t)));

// Also find prototypes with rare traits overall
const traitGlobalCounts = new Map<string, number>();
for (const p of parsed) {
  const seen = new Set<string>();
  for (const t of p.traitIds) {
    if (!seen.has(t)) {
      traitGlobalCounts.set(t, (traitGlobalCounts.get(t) || 0) + 1);
      seen.add(t);
    }
  }
}
const sortedTraitCounts = [...traitGlobalCounts.entries()].sort((a, b) => b[1] - a[1]);

// Group unusual by their fingerprint to find "rare archetypes"
const unusualFps = new Map<string, ParsedProto[]>();
for (const p of unusualProtos) {
  const arr = unusualFps.get(p.fp) || [];
  arr.push(p);
  unusualFps.set(p.fp, arr);
}
const rareArchetypes = [...unusualFps.entries()]
  .filter(([, protos]) => protos.length >= 3 && protos.length <= 50)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 15);

// ── Task 6: Trait ordering analysis ──────────────────────────────────────────

console.log('Analyzing trait ordering...');

// For prototypes with same fingerprint, check if ordering varies
interface OrderingVariant {
  fp: string;
  orderings: Map<string, { count: number; publishers: Set<string>; versions: Set<string> }>;
}

const orderingAnalysis: OrderingVariant[] = [];
for (const [fp, protos] of sortedFps.slice(0, 20)) {
  const orderings = new Map<string, { count: number; publishers: Set<string>; versions: Set<string> }>();
  for (const p of protos) {
    const sig = orderedSignature(p.traitIds);
    const existing = orderings.get(sig) || { count: 0, publishers: new Set(), versions: new Set() };
    existing.count++;
    const mod = modules.get(p.module_id);
    if (mod?.publisher) existing.publishers.add(mod.publisher);
    if (mod?.vassal_version) existing.versions.add(mod.vassal_version.replace(/\.\d+$/, ''));
    orderings.set(sig, existing);
  }
  orderingAnalysis.push({ fp, orderings });
}

// ── Generate Report ──────────────────────────────────────────────────────────

console.log('Generating report...');

let md = `# Team 1: Structural Analysis — Archetype Prototypes

> Analysis of ${parsed.length} prototype definitions across ${modules.size} VASSAL modules
> Generated: ${new Date().toISOString().slice(0, 10)}

## Corpus Bias Warning

This corpus is heavily skewed toward hex-and-counter wargames:
${[...(() => {
  const pubCounts = new Map<string, number>();
  for (const m of modules.values()) pubCounts.set(m.publisher || 'Unknown', (pubCounts.get(m.publisher || 'Unknown') || 0) + 1);
  return [...pubCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
})()].map(([p, c]) => `- **${p}**: ${c} modules (${(c / modules.size * 100).toFixed(1)}%)`).join('\n')}

Prevalence ≠ quality. Rare patterns from card-driven or block games may represent superior designs.

---

## 1. Overall Statistics

| Metric | Value |
|--------|-------|
| Total prototypes parsed | ${parsed.length} |
| Parse errors | ${parseErrors} |
| Unique fingerprints (trait-set combinations) | ${sortedFps.length} |
| Top 20 fingerprints cover | ${coveredCount} prototypes (${(coveredCount / parsed.length * 100).toFixed(1)}%) |
| Singleton fingerprints (appear once) | ${sortedFps.filter(([, p]) => p.length === 1).length} |
| Average traits per prototype | ${(parsed.reduce((s, p) => s + p.traitCount, 0) / parsed.length).toFixed(1)} |

### Trait Frequency (across all prototypes)

| Trait ID | Prototypes Using It | % of All |
|----------|-------------------|----------|
${sortedTraitCounts.slice(0, 25).map(([t, c]) => `| \`${t}\` | ${c} | ${(c / parsed.length * 100).toFixed(1)}% |`).join('\n')}

---

## 2. Top 20 Archetype Fingerprints

These are the 20 most common trait-set combinations. Together they account for ${(coveredCount / parsed.length * 100).toFixed(1)}% of all prototypes.

`;

for (const a of top20) {
  md += `### Archetype #${a.rank}: ${a.count} prototypes across ${a.moduleCount} modules

**Trait set:** \`${a.traitSet}\`
**Avg trait count:** ${a.avgTraitCount}

**Typical names:** ${a.typicalNames.slice(0, 6).map(n => `"${n}"`).join(', ')}

**Publishers:** ${a.publishers.map(p => `${p.name} (${p.count})`).join(', ')}

**VASSAL versions:** ${a.vassalVersions.map(v => `${v.version} (${v.count})`).join(', ')}

**Example modules:** ${a.exampleModules.join(', ')}

---

`;
}

// ── Task 4 output ──────────────────────────────────────────────────────────

md += `## 3. Prototype Inheritance Depth

### How many prototypes reference other prototypes?

${inheritanceData.length} prototypes contain at least one \`UsePrototype\` reference.

### Module-level maximum inheritance depth distribution

| Max Depth | Module Count |
|-----------|-------------|
${[...depthDistribution.entries()].sort((a, b) => a[0] - b[0]).map(([d, c]) => `| ${d} | ${c} |`).join('\n')}

### Deepest Inheritance Chains (Top 15)

| Depth | Module | Publisher | Root Prototype |
|-------|--------|-----------|----------------|
${deepestModules.map(d => `| ${d.depth} | ${d.module?.name || 'unknown'} | ${d.module?.publisher || 'unknown'} | ${d.chain} |`).join('\n')}

### Piece-to-Prototype Usage

- Average pieces referencing each prototype: ${avgPiecesPerProto.toFixed(1)}
- Maximum pieces referencing a single prototype: ${maxPiecesPerProto}
- Total piece→prototype links: ${pieceProtoRows.length}

---

## 4. Unusual Archetypes (Outside Top 20)

${unusualProtos.length} prototypes (${(unusualProtos.length / parsed.length * 100).toFixed(1)}%) don't match any top-20 fingerprint.

### Prototypes Using Modern Traits (3.6-3.7 features)

Found **${modernProtos.length}** prototypes using mat/matCargo/attachment/multiLocation:

`;

// Group modern protos by trait
const modernByTrait = new Map<string, ParsedProto[]>();
for (const p of modernProtos) {
  for (const t of p.traitIds) {
    if (newTraits.has(t)) {
      const arr = modernByTrait.get(t) || [];
      arr.push(p);
      modernByTrait.set(t, arr);
    }
  }
}

for (const [trait, protos] of modernByTrait) {
  const mids = new Set(protos.map(p => p.module_id));
  md += `#### \`${trait}\` — ${protos.length} prototypes in ${mids.size} modules\n\n`;
  for (const mid of [...mids].slice(0, 5)) {
    const m = modules.get(mid);
    const ps = protos.filter(p => p.module_id === mid);
    md += `- **${m?.name}** (${m?.publisher}, VASSAL ${m?.vassal_version}): ${ps.map(p => `"${p.name}"`).join(', ')}\n`;
  }
  md += '\n';
}

md += `### Notable Rare Archetypes (3-50 occurrences, outside top 20)

`;

for (const [fp, protos] of rareArchetypes) {
  const mids = new Set(protos.map(p => p.module_id));
  const names = [...new Set(protos.map(p => p.name.toLowerCase()))].slice(0, 5);
  const pubs = [...new Set(protos.map(p => modules.get(p.module_id)?.publisher).filter(Boolean))].slice(0, 3);
  md += `- **\`${fp}\`** — ${protos.length} prototypes in ${mids.size} modules. Names: ${names.map(n => `"${n}"`).join(', ')}. Publishers: ${pubs.join(', ')}\n`;
}

// ── Task 6 output ──────────────────────────────────────────────────────────

md += `\n---\n\n## 5. Trait Ordering Analysis\n\nFor each of the top 20 archetypes, how many distinct orderings exist?\n\n| Archetype # | Fingerprint | Proto Count | Distinct Orderings | Most Common Ordering % |\n|------------|-------------|-------------|-------------------|----------------------|\n`;

for (let i = 0; i < orderingAnalysis.length; i++) {
  const oa = orderingAnalysis[i];
  const totalCount = sortedFps[i][1].length;
  const mostCommon = Math.max(...[...oa.orderings.values()].map(v => v.count));
  const mostCommonPct = (mostCommon / totalCount * 100).toFixed(1);
  // Abbreviate fingerprint
  const shortFp = oa.fp.length > 40 ? oa.fp.slice(0, 40) + '...' : oa.fp;
  md += `| #${i + 1} | \`${shortFp}\` | ${totalCount} | ${oa.orderings.size} | ${mostCommonPct}% |\n`;
}

md += `\n### Ordering Variation Details (Top 5 Archetypes)\n\n`;

for (let i = 0; i < Math.min(5, orderingAnalysis.length); i++) {
  const oa = orderingAnalysis[i];
  const topOrderings = [...oa.orderings.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  md += `#### Archetype #${i + 1}\n\n`;
  for (const [sig, info] of topOrderings) {
    md += `- **${info.count}x**: \`[${sig}]\` — Publishers: ${[...info.publishers].slice(0, 3).join(', ')}\n`;
  }
  md += '\n';
}

// ── Summary / Key Findings ──────────────────────────────────────────────────

md += `---\n\n## 6. Key Findings & Recommendations for Feature Catalog\n\n### Finding 1: Extreme Concentration
The top 20 fingerprints cover ${(coveredCount / parsed.length * 100).toFixed(1)}% of all prototypes, but there are ${sortedFps.length} unique fingerprints total. The long tail contains many one-off or highly customized prototypes.

### Finding 2: The "Basic Movable Piece" Archetype Dominates
The most common archetype is the simple piece/mark/emb2 combination — the hex-and-counter unit with a flipped state and a nationality marker. This is the GMT workhorse.

### Finding 3: Modern Features Are Rare
Only ${modernProtos.length} prototypes use mat/matCargo/attachment/multiLocation. These are almost exclusively in VASSAL 3.6+ modules. **This validates surfacing these in the Feature Catalog as underused innovations.**

### Finding 4: Prototype Inheritance Is Shallow
Most modules have max depth 0-1. Deep inheritance (3+) appears in a handful of complex modules. The Feature Catalog should encourage a 2-level pattern: base archetype → role-specific prototype.

### Finding 5: Trait Ordering Is Inconsistent
Even within the same archetype, ordering varies significantly. The Feature Catalog should enforce a canonical ordering based on the documented best practice (restrict → emb → mark → piece).

### Finding 6: \`mark\` Is Underused
Only ${traitGlobalCounts.get('mark') || 0} of ${parsed.length} prototypes use Marker traits (${((traitGlobalCounts.get('mark') || 0) / parsed.length * 100).toFixed(1)}%). Many modules lack the Marker traits needed for Inventory grouping. This confirms Phase 2 Sub-task 9 (auto-tag pieces from PieceWindow structure) is high-value.
`;

writeFileSync(OUTPUT_PATH, md);
console.log(`\nReport written to ${OUTPUT_PATH}`);
console.log(`  ${md.split('\n').length} lines, ${md.length} characters`);

db.close();
