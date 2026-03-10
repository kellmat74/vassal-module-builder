/**
 * generate-report.ts — Generates a self-contained HTML report with Chart.js
 * visualizations for the VASSAL module corpus.
 *
 * Usage:  npx tsx src/tools/generate-report.ts
 * Output: data/analysis/report.html
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';
import { openDb, initSchema } from './corpus-db.js';

const OUT_DIR = join(process.cwd(), 'data', 'analysis');
const OUT_FILE = join(OUT_DIR, 'report.html');

// ── Helpers ─────────────────────────────────────────────────────────

function jsonForHtml(data: unknown): string {
  return JSON.stringify(data).replace(/<\//g, '<\\/');
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Map a 0-1 ratio to a green↔red hex color. */
function heatColor(ratio: number): string {
  // 0 = #b71c1c (red), 1 = #2e7d32 (green)
  const r = Math.round(183 + (46 - 183) * ratio);
  const g = Math.round(28 + (125 - 28) * ratio);
  const b = Math.round(28 + (50 - 28) * ratio);
  return `rgb(${r},${g},${b})`;
}

// ── Data queries ────────────────────────────────────────────────────

function gatherData(db: Database.Database) {
  // 1. Corpus overview
  const totalModules = (db.prepare('SELECT COUNT(*) as n FROM modules').get() as any).n as number;
  const publisherCounts = db.prepare(
    `SELECT COALESCE(publisher, 'Unknown') as publisher, COUNT(*) as n
     FROM modules GROUP BY publisher ORDER BY n DESC`
  ).all() as { publisher: string; n: number }[];
  const avgTraits = (db.prepare(
    `SELECT ROUND(AVG(total), 1) as avg FROM (
       SELECT module_id, SUM(count) as total FROM trait_counts GROUP BY module_id
     )`
  ).get() as any)?.avg ?? 0;

  // 2. Trait prevalence (top 30)
  const traitPrevalence = db.prepare(
    `SELECT trait_id, SUM(count) as total
     FROM trait_counts GROUP BY trait_id ORDER BY total DESC LIMIT 30`
  ).all() as { trait_id: string; total: number }[];

  // 3. Concept coverage heatmap
  const concepts = db.prepare('SELECT id, name, category FROM game_concepts ORDER BY category, name').all() as { id: number; name: string; category: string }[];
  const publishers = publisherCounts.map(p => p.publisher);
  // module count per publisher
  const pubModCount: Record<string, number> = {};
  for (const p of publisherCounts) pubModCount[p.publisher] = p.n;
  // concept×publisher counts
  const conceptPubRows = db.prepare(
    `SELECT gc.id as concept_id, COALESCE(m.publisher, 'Unknown') as publisher, COUNT(DISTINCT mc.module_id) as n
     FROM module_concepts mc
     JOIN game_concepts gc ON gc.id = mc.concept_id
     JOIN modules m ON m.id = mc.module_id
     GROUP BY gc.id, publisher`
  ).all() as { concept_id: number; publisher: string; n: number }[];
  const conceptPubMap: Record<string, Record<string, number>> = {};
  for (const r of conceptPubRows) {
    if (!conceptPubMap[r.concept_id]) conceptPubMap[r.concept_id] = {};
    conceptPubMap[r.concept_id][r.publisher] = r.n;
  }

  // 4. Pattern variants per concept
  const patternRows = db.prepare(
    `SELECT gc.name as concept_name, ip.pattern_name, COUNT(DISTINCT mc.module_id) as n
     FROM module_concepts mc
     JOIN game_concepts gc ON gc.id = mc.concept_id
     JOIN implementation_patterns ip ON ip.id = mc.pattern_id
     GROUP BY gc.id, ip.id
     ORDER BY gc.name, n DESC`
  ).all() as { concept_name: string; pattern_name: string; n: number }[];
  // Group by concept, keep only concepts with 2+ patterns
  const patternsByConcept: Record<string, { pattern: string; count: number }[]> = {};
  for (const r of patternRows) {
    if (!patternsByConcept[r.concept_name]) patternsByConcept[r.concept_name] = [];
    patternsByConcept[r.concept_name].push({ pattern: r.pattern_name, count: r.n });
  }
  const multiPatternConcepts = Object.entries(patternsByConcept).filter(([, ps]) => ps.length >= 2);

  // 5. Prototype complexity distribution
  const protoComplexity = db.prepare(
    'SELECT trait_count FROM prototype_definitions WHERE trait_count IS NOT NULL'
  ).all() as { trait_count: number }[];

  // 6. Expression function usage
  const exprFunctions = db.prepare(
    'SELECT functions_used FROM expressions WHERE functions_used IS NOT NULL AND functions_used != \'[]\''
  ).all() as { functions_used: string }[];
  const funcCounts: Record<string, number> = {};
  for (const row of exprFunctions) {
    try {
      const fns = JSON.parse(row.functions_used) as string[];
      for (const fn of fns) {
        funcCounts[fn] = (funcCounts[fn] || 0) + 1;
      }
    } catch { /* skip bad JSON */ }
  }
  const topFunctions = Object.entries(funcCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);

  // 7. VASSAL version distribution
  const vassalVersions = db.prepare(
    `SELECT COALESCE(vassal_version, 'Unknown') as ver, COUNT(*) as n
     FROM modules GROUP BY vassal_version ORDER BY n DESC`
  ).all() as { ver: string; n: number }[];

  return {
    totalModules, publisherCounts, avgTraits,
    traitPrevalence,
    concepts, publishers, pubModCount, conceptPubMap,
    multiPatternConcepts,
    protoComplexity,
    topFunctions,
    vassalVersions,
  };
}

// ── HTML builder ────────────────────────────────────────────────────

function buildHtml(d: ReturnType<typeof gatherData>): string {
  // Build histogram bins for prototype complexity
  const maxTraitCount = Math.max(...d.protoComplexity.map(r => r.trait_count), 0);
  const binSize = Math.max(1, Math.ceil(maxTraitCount / 20));
  const bins: Record<number, number> = {};
  for (const r of d.protoComplexity) {
    const bin = Math.floor(r.trait_count / binSize) * binSize;
    bins[bin] = (bins[bin] || 0) + 1;
  }
  const histLabels = Object.keys(bins).map(Number).sort((a, b) => a - b);
  const histValues = histLabels.map(b => bins[b]);

  // Heatmap table HTML
  const topPubs = d.publishers.slice(0, 10);
  let heatmapHtml = `<table class="heatmap"><thead><tr><th>Concept</th>`;
  for (const pub of topPubs) heatmapHtml += `<th>${escHtml(pub)}</th>`;
  heatmapHtml += `</tr></thead><tbody>`;
  for (const c of d.concepts) {
    heatmapHtml += `<tr><td>${escHtml(c.name)}</td>`;
    const cpMap = d.conceptPubMap[c.id] || {};
    for (const pub of topPubs) {
      const count = cpMap[pub] || 0;
      const total = d.pubModCount[pub] || 1;
      const ratio = count / total;
      const color = heatColor(ratio);
      const pct = Math.round(ratio * 100);
      heatmapHtml += `<td style="background:${color};color:#fff;text-align:center" title="${count}/${total}">${pct}%</td>`;
    }
    heatmapHtml += `</tr>`;
  }
  heatmapHtml += `</tbody></table>`;

  // Pattern variant chart configs
  const patternCharts = d.multiPatternConcepts.map(([concept, patterns], i) => {
    const id = `patternChart${i}`;
    return {
      id,
      concept,
      config: {
        type: 'bar',
        data: {
          labels: patterns.map(p => p.pattern),
          datasets: [{ label: 'Modules', data: patterns.map(p => p.count), backgroundColor: '#42a5f5' }],
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          plugins: { legend: { display: false }, title: { display: true, text: concept, color: '#ccc' } },
          scales: { x: { ticks: { color: '#aaa' }, grid: { color: '#333' } }, y: { ticks: { color: '#aaa' }, grid: { color: '#333' } } },
        },
      },
    };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VASSAL Module Corpus Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #121212; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 1400px; margin: 0 auto; }
  h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #90caf9; }
  h2 { font-size: 1.4rem; margin: 2.5rem 0 0.5rem; color: #90caf9; border-bottom: 1px solid #333; padding-bottom: 0.3rem; }
  p.desc { color: #999; margin-bottom: 1rem; font-size: 0.9rem; }
  .stats { display: flex; gap: 2rem; margin: 1.5rem 0; }
  .stat-card { background: #1e1e1e; border-radius: 8px; padding: 1.2rem 1.5rem; flex: 1; text-align: center; }
  .stat-card .val { font-size: 2rem; font-weight: 700; color: #fff; }
  .stat-card .lbl { font-size: 0.85rem; color: #888; margin-top: 0.3rem; }
  .chart-row { display: flex; gap: 2rem; flex-wrap: wrap; }
  .chart-box { background: #1e1e1e; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
  .chart-box.half { flex: 1; min-width: 400px; }
  .chart-box canvas { max-height: 500px; }
  table.heatmap { border-collapse: collapse; font-size: 0.8rem; width: 100%; }
  table.heatmap th, table.heatmap td { padding: 4px 8px; border: 1px solid #333; }
  table.heatmap th { background: #1e1e1e; position: sticky; top: 0; }
  table.heatmap td:first-child { background: #1e1e1e; white-space: nowrap; }
  .pattern-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 1rem; }
  .pattern-grid .chart-box canvas { max-height: 250px; }
  .timestamp { color: #555; font-size: 0.8rem; margin-top: 3rem; }
</style>
</head>
<body>

<h1>VASSAL Module Corpus Analysis</h1>
<p class="desc">Auto-generated report from module-corpus.db</p>

<!-- 1. Corpus Overview -->
<h2>1. Corpus Overview</h2>
<div class="stats">
  <div class="stat-card"><div class="val">${d.totalModules}</div><div class="lbl">Total Modules</div></div>
  <div class="stat-card"><div class="val">${d.avgTraits}</div><div class="lbl">Avg Traits / Module</div></div>
  <div class="stat-card"><div class="val">${d.publishers.length}</div><div class="lbl">Publishers</div></div>
</div>
<div class="chart-row">
  <div class="chart-box half"><canvas id="publisherChart"></canvas></div>
</div>

<!-- 2. Trait Prevalence -->
<h2>2. Trait Prevalence (Top 30)</h2>
<p class="desc">Total trait instance count across all modules.</p>
<div class="chart-box"><canvas id="traitChart"></canvas></div>

<!-- 3. Concept Coverage Heatmap -->
<h2>3. Concept Coverage by Publisher</h2>
<p class="desc">Percentage of each publisher's modules that implement each game concept. Green = high, red = low.</p>
<div class="chart-box" style="overflow-x:auto">${heatmapHtml}</div>

<!-- 4. Pattern Variants -->
<h2>4. Pattern Variant Comparison</h2>
<p class="desc">For concepts with multiple implementation patterns, showing how many modules use each variant.</p>
<div class="pattern-grid">
  ${patternCharts.map(p => `<div class="chart-box"><canvas id="${p.id}"></canvas></div>`).join('\n  ')}
</div>

<!-- 5. Prototype Complexity -->
<h2>5. Prototype Complexity Distribution</h2>
<p class="desc">Distribution of trait counts per prototype definition.</p>
<div class="chart-box"><canvas id="protoChart"></canvas></div>

<!-- 6. Expression Functions -->
<h2>6. Expression Function Usage</h2>
<p class="desc">Most-used BeanShell functions across all expressions.</p>
<div class="chart-box"><canvas id="funcChart"></canvas></div>

<!-- 7. VASSAL Version -->
<h2>7. VASSAL Version Distribution</h2>
<div class="chart-row"><div class="chart-box half"><canvas id="versionChart"></canvas></div></div>

<p class="timestamp">Generated ${new Date().toISOString()}</p>

<script>
const chartColors = ['#42a5f5','#ef5350','#66bb6a','#ffa726','#ab47bc','#26c6da','#ec407a','#8d6e63','#78909c','#d4e157','#5c6bc0','#29b6f6','#ff7043','#9ccc65','#7e57c2'];
Chart.defaults.color = '#aaa';
Chart.defaults.borderColor = '#333';

// 1. Publisher doughnut
new Chart(document.getElementById('publisherChart'), {
  type: 'doughnut',
  data: {
    labels: ${jsonForHtml(d.publisherCounts.map(p => p.publisher))},
    datasets: [{ data: ${jsonForHtml(d.publisherCounts.map(p => p.n))}, backgroundColor: chartColors }]
  },
  options: { responsive: true, plugins: { title: { display: true, text: 'Modules by Publisher', color: '#ccc' }, legend: { position: 'right', labels: { color: '#aaa' } } } }
});

// 2. Trait prevalence
new Chart(document.getElementById('traitChart'), {
  type: 'bar',
  data: {
    labels: ${jsonForHtml(d.traitPrevalence.map(t => t.trait_id))},
    datasets: [{ label: 'Count', data: ${jsonForHtml(d.traitPrevalence.map(t => t.total))}, backgroundColor: '#42a5f5' }]
  },
  options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#aaa' }, grid: { color: '#333' } }, y: { ticks: { color: '#aaa' }, grid: { color: '#333' } } } }
});

// 4. Pattern variant charts
${patternCharts.map(p => `new Chart(document.getElementById('${p.id}'), ${jsonForHtml(p.config)});`).join('\n')}

// 5. Prototype complexity histogram
new Chart(document.getElementById('protoChart'), {
  type: 'bar',
  data: {
    labels: ${jsonForHtml(histLabels.map(b => `${b}-${b + binSize - 1}`))},
    datasets: [{ label: 'Prototypes', data: ${jsonForHtml(histValues)}, backgroundColor: '#66bb6a' }]
  },
  options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Trait Count per Prototype', color: '#ccc' } }, scales: { x: { title: { display: true, text: 'Trait Count', color: '#aaa' }, ticks: { color: '#aaa' }, grid: { color: '#333' } }, y: { title: { display: true, text: 'Prototypes', color: '#aaa' }, ticks: { color: '#aaa' }, grid: { color: '#333' } } } }
});

// 6. Expression function usage
new Chart(document.getElementById('funcChart'), {
  type: 'bar',
  data: {
    labels: ${jsonForHtml(d.topFunctions.map(f => f[0]))},
    datasets: [{ label: 'Occurrences', data: ${jsonForHtml(d.topFunctions.map(f => f[1]))}, backgroundColor: '#ffa726' }]
  },
  options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#aaa' }, grid: { color: '#333' } }, y: { ticks: { color: '#aaa' }, grid: { color: '#333' } } } }
});

// 7. VASSAL version pie
new Chart(document.getElementById('versionChart'), {
  type: 'pie',
  data: {
    labels: ${jsonForHtml(d.vassalVersions.map(v => v.ver))},
    datasets: [{ data: ${jsonForHtml(d.vassalVersions.map(v => v.n))}, backgroundColor: chartColors }]
  },
  options: { responsive: true, plugins: { title: { display: true, text: 'VASSAL Version Distribution', color: '#ccc' }, legend: { position: 'right', labels: { color: '#aaa' } } } }
});
</script>
</body>
</html>`;
}

// ── Main ────────────────────────────────────────────────────────────

function main() {
  const db = openDb();
  initSchema(db);

  const data = gatherData(db);

  mkdirSync(OUT_DIR, { recursive: true });
  const html = buildHtml(data);
  writeFileSync(OUT_FILE, html, 'utf-8');

  console.log(`Report generated: ${OUT_FILE}`);
  console.log(`  Modules: ${data.totalModules}`);
  console.log(`  Publishers: ${data.publishers.length}`);
  console.log(`  Concepts: ${data.concepts.length}`);
  console.log(`  Trait types: ${data.traitPrevalence.length}`);
  console.log(`  Prototype definitions: ${data.protoComplexity.length}`);
  console.log(`  Expression functions tracked: ${data.topFunctions.length}`);
  console.log(`  VASSAL versions: ${data.vassalVersions.length}`);
  console.log(`  Pattern variant charts: ${data.multiPatternConcepts.length}`);

  db.close();
}

main();
