/**
 * Deep analysis tool for the VASSAL module corpus stored in SQLite.
 *
 * Subcommands:
 *   --concepts     Concept coverage report
 *   --patterns     Pattern quality ranking
 *   --clusters     Trait chain clustering (cosine similarity, hierarchical)
 *   --prototypes   Prototype template mining
 *   --expressions  Expression template extraction
 *   --variants     Implementation variant comparison
 *   --gaps         Feature gap analysis
 *   --all          Run every analysis
 */

import Database from 'better-sqlite3';
import { openDb } from './corpus-db.js';

// ── helpers ──────────────────────────────────────────────────────────────

function bar(ratio: number, width = 30): string {
  const filled = Math.round(ratio * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function pct(n: number, total: number): string {
  if (total === 0) return '  0.0%';
  return ((n / total) * 100).toFixed(1).padStart(6) + '%';
}

function padR(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

function padL(s: string, n: number): string {
  return s.length >= n ? s : ' '.repeat(n - s.length) + s;
}

function heading(emoji: string, title: string): void {
  console.log(`\n${emoji}  ${title}`);
  console.log('─'.repeat(60));
}

// ── 1. Concept Coverage ─────────────────────────────────────────────────

function analyzeConceptCoverage(db: Database.Database): void {
  heading('📊', 'CONCEPT COVERAGE REPORT');

  const totalModules = (db.prepare('SELECT COUNT(*) AS c FROM modules').get() as any).c;
  console.log(`Total modules in corpus: ${totalModules}\n`);

  const rows = db.prepare(`
    SELECT
      gc.id,
      gc.name,
      gc.category,
      COUNT(DISTINCT mc.module_id) AS module_count
    FROM game_concepts gc
    LEFT JOIN module_concepts mc ON mc.concept_id = gc.id
    GROUP BY gc.id
    ORDER BY module_count DESC
  `).all() as any[];

  console.log(
    padR('Concept', 35) +
    padL('Modules', 8) +
    padL('Coverage', 9) +
    '  Distribution'
  );
  console.log('─'.repeat(85));

  for (const r of rows) {
    const ratio = totalModules > 0 ? r.module_count / totalModules : 0;
    console.log(
      padR(r.name, 35) +
      padL(String(r.module_count), 8) +
      pct(r.module_count, totalModules) +
      '  ' + bar(ratio, 20) +
      `  [${r.category}]`
    );
  }

  // Publisher breakdown for top 5
  const top5 = rows.slice(0, 5);
  if (top5.length > 0) {
    console.log('\n📌 Publisher breakdown (top 5 concepts):');
    for (const concept of top5) {
      const publishers = db.prepare(`
        SELECT m.publisher, COUNT(*) AS cnt
        FROM module_concepts mc
        JOIN modules m ON m.id = mc.module_id
        WHERE mc.concept_id = ?
        GROUP BY m.publisher
        ORDER BY cnt DESC
        LIMIT 5
      `).all(concept.id) as any[];

      if (publishers.length > 0) {
        console.log(`\n  ${concept.name}:`);
        for (const p of publishers) {
          console.log(`    ${padR(p.publisher || '(unknown)', 25)} ${p.cnt} modules`);
        }
      }
    }
  }
}

// ── 2. Pattern Quality Ranking ──────────────────────────────────────────

function analyzePatternQuality(db: Database.Database): void {
  heading('🏆', 'PATTERN QUALITY RANKING');

  const rows = db.prepare(`
    SELECT
      ip.id,
      ip.pattern_name,
      ip.quality_score,
      gc.name AS concept_name,
      COUNT(DISTINCT mc.module_id) AS usage_count,
      AVG(pd.trait_count) AS avg_trait_count
    FROM implementation_patterns ip
    JOIN game_concepts gc ON gc.id = ip.concept_id
    LEFT JOIN module_concepts mc ON mc.pattern_id = ip.id
    LEFT JOIN prototype_definitions pd ON pd.module_id = mc.module_id
    GROUP BY ip.id
    ORDER BY (usage_count * ip.quality_score) DESC
  `).all() as any[];

  console.log(
    padR('Pattern', 35) +
    padR('Concept', 22) +
    padL('Uses', 6) +
    padL('Quality', 9) +
    padL('Score', 9) +
    padL('AvgTraits', 10)
  );
  console.log('─'.repeat(91));

  for (const r of rows) {
    const compositeScore = (r.usage_count * (r.quality_score || 0)).toFixed(1);
    console.log(
      padR(r.pattern_name, 35) +
      padR(r.concept_name, 22) +
      padL(String(r.usage_count), 6) +
      padL((r.quality_score ?? 0).toFixed(2), 9) +
      padL(compositeScore, 9) +
      padL((r.avg_trait_count ?? 0).toFixed(1), 10)
    );
  }

  // Version correlation
  console.log('\n📈 VASSAL version vs. quality (avg quality_score by version):');
  const versionRows = db.prepare(`
    SELECT
      m.vassal_version,
      AVG(ip.quality_score) AS avg_quality,
      COUNT(DISTINCT mc.module_id) AS module_count
    FROM module_concepts mc
    JOIN implementation_patterns ip ON ip.id = mc.pattern_id
    JOIN modules m ON m.id = mc.module_id
    WHERE m.vassal_version IS NOT NULL
    GROUP BY m.vassal_version
    ORDER BY m.vassal_version
  `).all() as any[];

  for (const v of versionRows) {
    console.log(
      `  ${padR(v.vassal_version || '?', 12)} avg quality ${(v.avg_quality ?? 0).toFixed(2)}  (${v.module_count} modules)`
    );
  }
}

// ── 3. Trait Chain Clustering ────────────────────────────────────────────

function analyzeTraitClusters(db: Database.Database): void {
  heading('🔬', 'TRAIT CHAIN CLUSTERING');

  // Build bigram vectors per module
  const chains = db.prepare(`
    SELECT module_id, trait_id, position
    FROM trait_chains
    ORDER BY module_id, source_name, position
  `).all() as any[];

  // Group by module
  const moduleChains = new Map<number, string[]>();
  let prevModuleId = -1;
  let prevTraitId = '';

  for (const row of chains) {
    if (!moduleChains.has(row.module_id)) {
      moduleChains.set(row.module_id, []);
    }
    if (row.module_id === prevModuleId && prevTraitId) {
      moduleChains.get(row.module_id)!.push(`${prevTraitId}→${row.trait_id}`);
    }
    prevModuleId = row.module_id;
    prevTraitId = row.trait_id;
  }

  // Build vocabulary
  const vocabSet = new Set<string>();
  for (const bigrams of moduleChains.values()) {
    for (const bg of bigrams) vocabSet.add(bg);
  }
  const vocab = [...vocabSet];
  const vocabIdx = new Map(vocab.map((v, i) => [v, i]));

  // Build TF vectors
  const moduleIds = [...moduleChains.keys()];
  const vectors = new Map<number, Float64Array>();

  for (const mid of moduleIds) {
    const vec = new Float64Array(vocab.length);
    for (const bg of moduleChains.get(mid)!) {
      vec[vocabIdx.get(bg)!]++;
    }
    // Normalize to unit vector
    let mag = 0;
    for (let i = 0; i < vec.length; i++) mag += vec[i] * vec[i];
    mag = Math.sqrt(mag);
    if (mag > 0) for (let i = 0; i < vec.length; i++) vec[i] /= mag;
    vectors.set(mid, vec);
  }

  console.log(`Modules: ${moduleIds.length}, Bigram vocabulary: ${vocab.length}`);

  if (moduleIds.length < 2) {
    console.log('Not enough modules for clustering.');
    return;
  }

  // Cosine similarity
  function cosine(a: Float64Array, b: Float64Array): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot; // Already unit vectors
  }

  // Agglomerative clustering (average linkage)
  type Cluster = { ids: number[] };
  let clusters: Cluster[] = moduleIds.map(id => ({ ids: [id] }));
  const THRESHOLD = 0.3;

  while (clusters.length > 1) {
    let bestSim = -1;
    let bestI = 0;
    let bestJ = 1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        // Average linkage
        let simSum = 0;
        let count = 0;
        for (const a of clusters[i].ids) {
          for (const b of clusters[j].ids) {
            simSum += cosine(vectors.get(a)!, vectors.get(b)!);
            count++;
          }
        }
        const avgSim = simSum / count;
        if (avgSim > bestSim) {
          bestSim = avgSim;
          bestI = i;
          bestJ = j;
        }
      }
    }

    if (bestSim < THRESHOLD) break;

    // Merge
    clusters[bestI].ids.push(...clusters[bestJ].ids);
    clusters.splice(bestJ, 1);
  }

  // Sort by size, show top 5
  clusters.sort((a, b) => b.ids.length - a.ids.length);
  const topClusters = clusters.slice(0, 5);

  const moduleNameStmt = db.prepare('SELECT name, filename FROM modules WHERE id = ?');

  for (let ci = 0; ci < topClusters.length; ci++) {
    const c = topClusters[ci];
    console.log(`\n🔹 Cluster ${ci + 1} — ${c.ids.length} modules`);

    // Show member names (up to 5)
    for (const mid of c.ids.slice(0, 5)) {
      const m = moduleNameStmt.get(mid) as any;
      console.log(`   • ${m?.name || m?.filename || mid}`);
    }
    if (c.ids.length > 5) console.log(`   ... and ${c.ids.length - 5} more`);

    // Distinctive bigrams: aggregate bigram counts for this cluster
    const bigramCounts = new Map<string, number>();
    for (const mid of c.ids) {
      for (const bg of moduleChains.get(mid) || []) {
        bigramCounts.set(bg, (bigramCounts.get(bg) || 0) + 1);
      }
    }
    const topBigrams = [...bigramCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    console.log('   Top trait bigrams:');
    for (const [bg, cnt] of topBigrams) {
      console.log(`     ${padR(bg, 35)} ×${cnt}`);
    }
  }
}

// ── 4. Prototype Template Mining ────────────────────────────────────────

function analyzePrototypes(db: Database.Database): void {
  heading('🧬', 'PROTOTYPE TEMPLATE MINING');

  const rows = db.prepare(`
    SELECT module_id, name, trait_chain_json
    FROM prototype_definitions
    WHERE trait_chain_json IS NOT NULL
  `).all() as any[];

  // Extract trait_id-only sequences
  const seqCounts = new Map<string, { count: number; examples: string[] }>();

  for (const row of rows) {
    let chain: any[];
    try {
      chain = JSON.parse(row.trait_chain_json);
    } catch {
      continue;
    }

    const traitIds = chain.map((t: any) => t.trait_id || t.traitId || '?');

    // Extract all subsequences of length 3..min(8, len)
    for (let len = 3; len <= Math.min(8, traitIds.length); len++) {
      for (let start = 0; start <= traitIds.length - len; start++) {
        const subseq = traitIds.slice(start, start + len).join(' → ');
        const entry = seqCounts.get(subseq) || { count: 0, examples: [] };
        entry.count++;
        if (entry.examples.length < 3) entry.examples.push(row.name);
        seqCounts.set(subseq, entry);
      }
    }
  }

  // Rank by frequency, filter noise (must appear in 3+ prototypes)
  const ranked = [...seqCounts.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 30);

  console.log(`Prototype definitions analyzed: ${rows.length}`);
  console.log(`Unique subsequences (≥3 occurrences): ${ranked.length}\n`);

  console.log(padR('Trait Sequence', 55) + padL('Freq', 6) + '  Examples');
  console.log('─'.repeat(90));

  for (const [seq, data] of ranked) {
    console.log(
      padR(seq, 55) +
      padL(String(data.count), 6) +
      '  ' + data.examples.slice(0, 2).join(', ')
    );
  }

  // Try to map to concepts
  console.log('\n📎 Concept associations (top sequences → game_concepts):');
  const conceptStmt = db.prepare(`
    SELECT DISTINCT gc.name
    FROM prototype_definitions pd
    JOIN piece_prototypes pp ON pp.module_id = pd.module_id AND pp.prototype_name = pd.name
    JOIN module_concepts mc ON mc.module_id = pd.module_id
    JOIN game_concepts gc ON gc.id = mc.concept_id
    WHERE pd.name = ?
    LIMIT 3
  `);

  for (const [seq, data] of ranked.slice(0, 10)) {
    const concepts: string[] = [];
    for (const ex of data.examples) {
      const matches = conceptStmt.all(ex) as any[];
      for (const m of matches) {
        if (!concepts.includes(m.name)) concepts.push(m.name);
      }
    }
    if (concepts.length > 0) {
      console.log(`  ${padR(seq.slice(0, 50), 50)} → ${concepts.join(', ')}`);
    }
  }
}

// ── 5. Expression Template Extraction ───────────────────────────────────

function analyzeExpressions(db: Database.Database): void {
  heading('📝', 'EXPRESSION TEMPLATE EXTRACTION');

  const rows = db.prepare(`
    SELECT expression_text, expr_type, functions_used, properties_referenced, context
    FROM expressions
    WHERE expression_text IS NOT NULL AND expression_text != ''
  `).all() as any[];

  console.log(`Total expressions: ${rows.length}\n`);

  // Templatize: replace property names with <PROP>, numbers with <N>, strings with <STR>
  function templatize(expr: string): string {
    return expr
      // Replace quoted strings
      .replace(/"[^"]*"/g, '<STR>')
      .replace(/'[^']*'/g, '<STR>')
      // Replace $PropertyName$ patterns
      .replace(/\$[A-Za-z_][A-Za-z0-9_]*\$/g, '<PROP>')
      // Replace GetProperty("...") args
      .replace(/GetProperty\s*\(\s*<STR>\s*\)/g, 'GetProperty(<PROP>)')
      // Replace standalone numbers (but not inside identifiers)
      .replace(/(?<![A-Za-z_])\d+(?![A-Za-z_])/g, '<N>');
  }

  const templateCounts = new Map<string, { count: number; examples: string[]; types: Set<string> }>();

  for (const row of rows) {
    const tmpl = templatize(row.expression_text);
    const entry = templateCounts.get(tmpl) || { count: 0, examples: [], types: new Set() };
    entry.count++;
    if (entry.examples.length < 3) entry.examples.push(row.expression_text);
    if (row.expr_type) entry.types.add(row.expr_type);
    templateCounts.set(tmpl, entry);
  }

  const ranked = [...templateCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  console.log(padR('Template', 50) + padL('Count', 7) + '  Type');
  console.log('─'.repeat(75));

  for (const [tmpl, data] of ranked) {
    const types = [...data.types].join(',');
    console.log(
      padR(tmpl.slice(0, 50), 50) +
      padL(String(data.count), 7) +
      '  ' + types
    );
    for (const ex of data.examples.slice(0, 2)) {
      console.log(`    ex: ${ex.slice(0, 70)}`);
    }
  }

  // Function usage stats
  console.log('\n📊 Function usage frequency:');
  const funcCounts = new Map<string, number>();
  for (const row of rows) {
    if (!row.functions_used) continue;
    let funcs: string[];
    try {
      funcs = JSON.parse(row.functions_used);
    } catch {
      funcs = row.functions_used.split(',').map((s: string) => s.trim());
    }
    for (const f of funcs) {
      if (f) funcCounts.set(f, (funcCounts.get(f) || 0) + 1);
    }
  }

  const sortedFuncs = [...funcCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [fn, cnt] of sortedFuncs) {
    console.log(`  ${padR(fn, 30)} ${bar(cnt / (sortedFuncs[0]?.[1] || 1), 20)} ${cnt}`);
  }
}

// ── 6. Implementation Variant Report ────────────────────────────────────

function analyzeVariants(db: Database.Database): void {
  heading('🔀', 'IMPLEMENTATION VARIANT REPORT');

  // Find concepts with 2+ patterns
  const concepts = db.prepare(`
    SELECT gc.id, gc.name, gc.category, COUNT(ip.id) AS pattern_count
    FROM game_concepts gc
    JOIN implementation_patterns ip ON ip.concept_id = gc.id
    GROUP BY gc.id
    HAVING pattern_count >= 2
    ORDER BY pattern_count DESC
  `).all() as any[];

  console.log(`Concepts with multiple implementation patterns: ${concepts.length}\n`);

  const patternStmt = db.prepare(`
    SELECT ip.id, ip.pattern_name, ip.quality_score, ip.description,
           COUNT(DISTINCT mc.module_id) AS usage_count
    FROM implementation_patterns ip
    LEFT JOIN module_concepts mc ON mc.pattern_id = ip.id
    WHERE ip.concept_id = ?
    GROUP BY ip.id
    ORDER BY usage_count DESC
  `);

  const sampleXmlStmt = db.prepare(`
    SELECT rx.xml_text, m.name
    FROM module_concepts mc
    JOIN raw_xml rx ON rx.module_id = mc.module_id
    JOIN modules m ON m.id = mc.module_id
    WHERE mc.pattern_id = ?
    LIMIT 1
  `);

  for (const concept of concepts.slice(0, 10)) {
    console.log(`\n🔸 ${concept.name} (${concept.category}) — ${concept.pattern_count} patterns`);

    const patterns = patternStmt.all(concept.id) as any[];
    for (const p of patterns) {
      console.log(
        `  ${padR('▸ ' + p.pattern_name, 40)} ` +
        `${p.usage_count} modules  quality=${(p.quality_score ?? 0).toFixed(2)}`
      );
      if (p.description) {
        console.log(`    ${p.description.slice(0, 80)}`);
      }

      // Sample XML snippet
      const sample = sampleXmlStmt.get(p.id) as any;
      if (sample?.xml_text) {
        // Try to find a relevant snippet around a trait keyword
        const xml = sample.xml_text as string;
        const keywords = (p.pattern_name || '').split(/[\s_-]+/).filter((w: string) => w.length > 3);
        let snippetStart = 0;
        for (const kw of keywords) {
          const idx = xml.toLowerCase().indexOf(kw.toLowerCase());
          if (idx >= 0) {
            snippetStart = Math.max(0, idx - 50);
            break;
          }
        }
        const snippet = xml.slice(snippetStart, snippetStart + 500).replace(/\n/g, ' ').trim();
        console.log(`    📄 Sample (${sample.name}): ${snippet.slice(0, 120)}...`);
      }
    }
  }
}

// ── 7. Feature Gap Analysis ─────────────────────────────────────────────

function analyzeGaps(db: Database.Database): void {
  heading('🕳️', 'FEATURE GAP ANALYSIS');

  // Find modules with combat-related traits but lacking automation
  const moduleTraitProfiles = db.prepare(`
    SELECT
      m.id,
      m.name,
      m.filename,
      COUNT(DISTINCT tc.trait_id) AS unique_traits,
      SUM(CASE WHEN tc.trait_id = 'DYNPROP' THEN 1 ELSE 0 END) AS dynprop_count,
      SUM(CASE WHEN tc.trait_id = 'macro' THEN 1 ELSE 0 END) AS trigger_count,
      SUM(CASE WHEN tc.trait_id = 'globalkey' THEN 1 ELSE 0 END) AS gkc_count,
      SUM(CASE WHEN tc.trait_id = 'calcProp' THEN 1 ELSE 0 END) AS calcprop_count,
      SUM(CASE WHEN tc.trait_id = 'report' THEN 1 ELSE 0 END) AS report_count,
      SUM(CASE WHEN tc.trait_id = 'emb2' THEN 1 ELSE 0 END) AS embellishment_count
    FROM modules m
    LEFT JOIN trait_chains tc ON tc.module_id = m.id
    GROUP BY m.id
    ORDER BY unique_traits DESC
  `).all() as any[];

  // Identify modules missing key automation
  const gaps: { module: string; has: string[]; missing: string[]; filename: string }[] = [];

  for (const m of moduleTraitProfiles) {
    const has: string[] = [];
    const missing: string[] = [];

    if (m.dynprop_count > 0) has.push(`DynamicProperty(×${m.dynprop_count})`);
    if (m.embellishment_count > 0) has.push(`Embellishment(×${m.embellishment_count})`);
    if (m.trigger_count > 0) has.push(`TriggerAction(×${m.trigger_count})`);
    if (m.gkc_count > 0) has.push(`GKC(×${m.gkc_count})`);
    if (m.calcprop_count > 0) has.push(`CalculatedProperty(×${m.calcprop_count})`);
    if (m.report_count > 0) has.push(`ReportState(×${m.report_count})`);

    // Units with state (DynamicProperty) but no automation
    if (m.dynprop_count > 2 && m.trigger_count === 0 && m.gkc_count === 0) {
      missing.push('No TriggerAction or GKC automation despite stateful pieces');
    }
    // Embellishments but no report state
    if (m.embellishment_count > 5 && m.report_count === 0) {
      missing.push('No ReportState — state changes are silent in chat log');
    }
    // Has GKC but no CalculatedProperty
    if (m.gkc_count > 0 && m.calcprop_count === 0 && m.dynprop_count > 3) {
      missing.push('No CalculatedProperty — could auto-compute combat factors');
    }
    // No inventory despite many pieces
    if (m.unique_traits > 10) {
      const hasInventory = db.prepare(`
        SELECT 1 FROM component_tree
        WHERE module_id = ? AND short_tag LIKE '%Inventory%'
        LIMIT 1
      `).get(m.id);
      if (!hasInventory) {
        missing.push('No Inventory window for piece overview');
      }
    }

    if (missing.length > 0 && has.length > 0) {
      gaps.push({ module: m.name || m.filename, has, missing, filename: m.filename });
    }
  }

  console.log(`Modules analyzed: ${moduleTraitProfiles.length}`);
  console.log(`Modules with identified gaps: ${gaps.length}\n`);

  // Sort by number of gaps
  gaps.sort((a, b) => b.missing.length - a.missing.length);

  for (const g of gaps.slice(0, 20)) {
    console.log(`🔸 ${g.module}`);
    console.log(`  Has: ${g.has.join(', ')}`);
    for (const m of g.missing) {
      console.log(`  ⚠️  ${m}`);
    }
    console.log();
  }

  // Summary stats
  const gapTypes = new Map<string, number>();
  for (const g of gaps) {
    for (const m of g.missing) {
      const key = m.split('—')[0].trim();
      gapTypes.set(key, (gapTypes.get(key) || 0) + 1);
    }
  }

  console.log('📊 Most common gaps across corpus:');
  const sortedGaps = [...gapTypes.entries()].sort((a, b) => b[1] - a[1]);
  for (const [gap, cnt] of sortedGaps) {
    console.log(`  ${padL(String(cnt), 4)} modules — ${gap}`);
  }
}

// ── main ─────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);
  const flags = new Set(args.map(a => a.replace(/^--/, '')));

  const runAll = flags.has('all') || flags.size === 0;

  const db = openDb();

  try {
    if (runAll || flags.has('concepts'))    analyzeConceptCoverage(db);
    if (runAll || flags.has('patterns'))    analyzePatternQuality(db);
    if (runAll || flags.has('clusters'))    analyzeTraitClusters(db);
    if (runAll || flags.has('prototypes'))  analyzePrototypes(db);
    if (runAll || flags.has('expressions')) analyzeExpressions(db);
    if (runAll || flags.has('variants'))    analyzeVariants(db);
    if (runAll || flags.has('gaps'))        analyzeGaps(db);

    console.log('\n✅ Analysis complete.\n');
  } finally {
    db.close();
  }
}

main();
