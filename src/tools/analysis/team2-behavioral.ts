#!/usr/bin/env npx tsx
/**
 * Team 2 — Behavioral Analysis
 * Analyzes game logic: expressions, triggers, GKCs, properties, automation patterns.
 */
import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../../data/module-corpus.db');
const OUT_PATH = path.resolve(__dirname, '../../../data/analysis/team2-behavioral.md');

const db = new Database(DB_PATH, { readonly: true });
db.pragma('journal_mode = WAL');

const lines: string[] = [];
function log(s: string = '') { lines.push(s); }
function heading(level: number, text: string) { log(`${'#'.repeat(level)} ${text}`); log(); }

// ─── Task 1: Expression Template Extraction ───────────────────────────

function task1_expressionTemplates() {
  heading(2, 'Task 1: Expression Template Extraction');

  const rows = db.prepare(`
    SELECT expression_text, expr_type, context, source_name, module_id
    FROM expressions
    WHERE expression_text IS NOT NULL AND length(expression_text) > 2
  `).all() as any[];

  log(`Total expressions analyzed: **${rows.length.toLocaleString()}**`);
  log();

  // Templatize: replace property names in GetProperty() with <PROP>, numbers with <N>, quoted strings with <STR>
  function templatize(expr: string): string {
    let t = expr;
    // Replace quoted strings (double and single)
    t = t.replace(/"[^"]*"/g, '<STR>');
    t = t.replace(/'[^']*'/g, '<STR>');
    // Replace GetProperty(<STR>) already handled, but also bare property refs like $PropName$
    t = t.replace(/\$[A-Za-z_][A-Za-z0-9_]*\$/g, '<$PROP$>');
    // Replace integers/decimals but not inside identifiers
    t = t.replace(/(?<![A-Za-z_])\d+(\.\d+)?/g, '<N>');
    return t;
  }

  const templateMap = new Map<string, { count: number; examples: string[]; contexts: Set<string> }>();

  for (const row of rows) {
    const tmpl = templatize(row.expression_text);
    let entry = templateMap.get(tmpl);
    if (!entry) {
      entry = { count: 0, examples: [], contexts: new Set() };
      templateMap.set(tmpl, entry);
    }
    entry.count++;
    if (entry.examples.length < 3) entry.examples.push(row.expression_text);
    entry.contexts.add(row.context || 'unknown');
  }

  const sorted = [...templateMap.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 50);

  log(`Unique templates: **${templateMap.size.toLocaleString()}**`);
  log();

  // Categorize templates by game concept
  function inferConcept(tmpl: string, examples: string[]): string {
    const t = tmpl.toLowerCase();
    const ex = examples.join(' ').toLowerCase();
    if (t.includes('currentmap') && t.includes('deck')) return 'Deck/Card location check';
    if (t.includes('currentmap')) return 'Map location check';
    if (t.includes('deckname')) return 'Deck membership test';
    if (t.includes('moved') || ex.includes('moved')) return 'Movement tracking';
    if (t.includes('playerside') || t.includes('playername')) return 'Player/side identity';
    if (t.includes('getproperty') && t.includes('>')) return 'Property comparison';
    if (t.includes('getproperty')) return 'Property lookup';
    if (t.includes('sumstack') || t.includes('sum(') || t.includes('count(')) return 'Aggregation/counting';
    if (t.includes('locationname') || t.includes('currentzone')) return 'Location/zone check';
    if (t.includes('basicname') || t.includes('piecename')) return 'Piece identity';
    if (t.includes('oldlocationname') || t.includes('oldmap')) return 'Movement origin tracking';
    if (ex.includes('strength') || ex.includes('attack') || ex.includes('defense')) return 'Combat values';
    if (ex.includes('step') || ex.includes('hit')) return 'Step loss / damage';
    if (ex.includes('supply') || ex.includes('oos')) return 'Supply status';
    if (t.includes('<str>')) return 'String literal / label';
    return 'General logic';
  }

  log('### Top 50 Expression Templates');
  log();
  log('| Rank | Count | Template | Concept | Example |');
  log('|------|-------|----------|---------|---------|');

  for (let i = 0; i < sorted.length; i++) {
    const [tmpl, data] = sorted[i];
    const concept = inferConcept(tmpl, data.examples);
    const example = data.examples[0].replace(/\|/g, '\\|').substring(0, 80);
    const tmplDisplay = tmpl.replace(/\|/g, '\\|').substring(0, 60);
    log(`| ${i + 1} | ${data.count.toLocaleString()} | \`${tmplDisplay}\` | ${concept} | \`${example}\` |`);
  }
  log();

  // Expression type breakdown
  const typeCounts = db.prepare(`
    SELECT expr_type, count(*) as cnt FROM expressions GROUP BY expr_type ORDER BY cnt DESC
  `).all() as any[];
  log('### Expression Type Breakdown');
  log();
  for (const r of typeCounts) {
    log(`- **${r.expr_type || 'null'}**: ${r.cnt.toLocaleString()}`);
  }
  log();

  // Context breakdown
  const ctxCounts = db.prepare(`
    SELECT context, count(*) as cnt FROM expressions GROUP BY context ORDER BY cnt DESC
  `).all() as any[];
  log('### Expression Context Breakdown');
  log();
  for (const r of ctxCounts) {
    log(`- **${r.context || 'null'}**: ${r.cnt.toLocaleString()}`);
  }
  log();

  // Most referenced properties
  const allProps: Map<string, number> = new Map();
  for (const row of rows) {
    if (row.properties_referenced) {
      try {
        const props = JSON.parse(row.properties_referenced);
        for (const p of props) {
          allProps.set(p, (allProps.get(p) || 0) + 1);
        }
      } catch { /* skip */ }
    }
  }
  const topProps = [...allProps.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  log('### Top 30 Properties Referenced in Expressions');
  log();
  log('| Property | References |');
  log('|----------|-----------|');
  for (const [prop, cnt] of topProps) {
    log(`| ${prop} | ${cnt.toLocaleString()} |`);
  }
  log();

  // Most used functions
  const allFuncs: Map<string, number> = new Map();
  for (const row of rows) {
    if (row.functions_used) {
      try {
        const funcs = JSON.parse(row.functions_used);
        for (const f of funcs) {
          allFuncs.set(f, (allFuncs.get(f) || 0) + 1);
        }
      } catch { /* skip */ }
    }
  }
  const topFuncs = [...allFuncs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  log('### Top Functions Used in Expressions');
  log();
  for (const [func, cnt] of topFuncs) {
    log(`- **${func}**: ${cnt.toLocaleString()}`);
  }
  log();
}

// ─── Task 2: TriggerAction Chain Analysis ─────────────────────────────

function task2_triggerChains() {
  heading(2, 'Task 2: TriggerAction Chain Analysis');

  // Count prototypes/pieces with macro traits
  const macroSources = db.prepare(`
    SELECT DISTINCT module_id, source_type, source_name
    FROM trait_chains WHERE trait_id = 'macro'
  `).all() as any[];
  log(`Sources (prototypes/pieces) containing TriggerAction: **${macroSources.length.toLocaleString()}**`);
  log();

  // Count total macro traits
  const macroCount = db.prepare(`SELECT count(*) as cnt FROM trait_chains WHERE trait_id = 'macro'`).get() as any;
  log(`Total TriggerAction traits: **${macroCount.cnt.toLocaleString()}**`);
  log();

  // Modules with most TriggerActions
  const topMacroModules = db.prepare(`
    SELECT m.name, m.publisher, count(*) as cnt
    FROM trait_chains tc
    JOIN modules m ON m.id = tc.module_id
    WHERE tc.trait_id = 'macro'
    GROUP BY tc.module_id
    ORDER BY cnt DESC
    LIMIT 20
  `).all() as any[];

  log('### Top 20 Modules by TriggerAction Count');
  log();
  log('| Module | Publisher | TriggerActions |');
  log('|--------|-----------|---------------|');
  for (const r of topMacroModules) {
    log(`| ${r.name} | ${r.publisher || ''} | ${r.cnt} |`);
  }
  log();

  // Analyze what keys TriggerActions fire — extract from params_json
  // TriggerAction params: [name, watchKeys, actionKeys, ...]
  // Let's sample and understand the param structure
  const macroSamples = db.prepare(`
    SELECT params_json, source_name, module_id
    FROM trait_chains WHERE trait_id = 'macro' AND params_json IS NOT NULL
    LIMIT 500
  `).all() as any[];

  // Parse macro params to understand key patterns
  const watchKeyFreq = new Map<string, number>();
  const actionKeyFreq = new Map<string, number>();
  let parsedCount = 0;

  for (const row of macroSamples) {
    try {
      const params = JSON.parse(row.params_json);
      if (params.length >= 3) {
        // params[0] = name, params[1] = ?, params[2] = watch keys (comma-separated keystrokes)
        // params[5] = action keys typically
        const name = params[0] || '';
        const watchStr = params[2] || '';
        const actionStr = params[5] || '';

        // Count watch/action key patterns
        if (watchStr) {
          const simplified = watchStr.replace(/\d+,\d+,/g, 'KEY,');
          watchKeyFreq.set(simplified, (watchKeyFreq.get(simplified) || 0) + 1);
        }
        parsedCount++;
      }
    } catch { /* skip */ }
  }

  // Analyze co-occurring traits in sources that have macros
  // What other traits appear alongside TriggerAction?
  const coTraits = db.prepare(`
    SELECT tc2.trait_id, count(*) as cnt
    FROM trait_chains tc1
    JOIN trait_chains tc2 ON tc1.module_id = tc2.module_id
      AND tc1.source_type = tc2.source_type
      AND tc1.source_name = tc2.source_name
      AND tc2.trait_id != 'macro'
    WHERE tc1.trait_id = 'macro'
    GROUP BY tc2.trait_id
    ORDER BY cnt DESC
    LIMIT 20
  `).all() as any[];

  log('### Traits Co-occurring with TriggerAction');
  log();
  log('These traits appear in the same prototype/piece as TriggerAction, revealing what triggers automate:');
  log();
  log('| Trait | Co-occurrences | Role |');
  log('|-------|---------------|------|');
  const traitRoles: Record<string, string> = {
    'piece': 'Base piece', 'emb2': 'State layer (visual)', 'mark': 'Static property',
    'DYNPROP': 'Mutable state', 'prototype': 'Prototype ref', 'report': 'Chat notification',
    'globalkey': 'Piece-level GKC', 'label': 'Text overlay', 'sendto': 'Move to location',
    'hide': 'Visibility', 'obs': 'Fog of war', 'restrict': 'Access control',
    'restrictCommands': 'Conditional commands', 'globalhotkey': 'Global hotkey',
    'playSound': 'Audio feedback', 'setprop': 'Set global property',
    'returnToDeck': 'Return to deck', 'delete': 'Remove piece', 'replace': 'Swap piece',
    'placemark': 'Spawn piece', 'clone': 'Duplicate', 'calcProp': 'Calculated value',
    'submenu': 'Menu organization', 'menuSep': 'Menu separator',
    'immob': 'Movement lock', 'deselect': 'Deselect after action',
    'translate': 'Offset move', 'action': 'Clickable button',
    'footprint': 'Movement trail', 'markmoved': 'Moved marker',
  };
  for (const r of coTraits) {
    log(`| ${r.trait_id} | ${r.cnt.toLocaleString()} | ${traitRoles[r.trait_id] || ''} |`);
  }
  log();

  // Chains: how many macros per source (indicates chaining depth)
  const chainDepth = db.prepare(`
    SELECT macro_count, count(*) as sources
    FROM (
      SELECT source_name, count(*) as macro_count
      FROM trait_chains
      WHERE trait_id = 'macro'
      GROUP BY module_id, source_type, source_name
    )
    GROUP BY macro_count
    ORDER BY macro_count
  `).all() as any[];

  log('### TriggerAction Chaining Depth');
  log();
  log('How many TriggerActions exist per prototype/piece (more = deeper automation):');
  log();
  log('| Triggers per Source | Source Count |');
  log('|--------------------:|------------:|');
  for (const r of chainDepth) {
    log(`| ${r.macro_count} | ${r.sources} |`);
  }
  log();

  // Most complex sources (most macros)
  const complexSources = db.prepare(`
    SELECT m.name as module_name, tc.source_name, count(*) as macro_count
    FROM trait_chains tc
    JOIN modules m ON m.id = tc.module_id
    WHERE tc.trait_id = 'macro'
    GROUP BY tc.module_id, tc.source_type, tc.source_name
    ORDER BY macro_count DESC
    LIMIT 15
  `).all() as any[];

  log('### Most Complex TriggerAction Sources (deepest automation)');
  log();
  log('| Module | Source | Trigger Count |');
  log('|--------|--------|--------------|');
  for (const r of complexSources) {
    log(`| ${r.module_name} | ${r.source_name || '(unnamed)'} | ${r.macro_count} |`);
  }
  log();
}

// ─── Task 3: GKC Targeting Pattern Analysis ───────────────────────────

function task3_gkcPatterns() {
  heading(2, 'Task 3: GKC Targeting Pattern Analysis');

  const total = db.prepare(`SELECT count(*) as cnt FROM gkc_definitions`).get() as any;
  log(`Total GKC definitions: **${total.cnt.toLocaleString()}**`);
  log();

  // Level breakdown
  const levels = db.prepare(`
    SELECT level, count(*) as cnt FROM gkc_definitions GROUP BY level ORDER BY cnt DESC
  `).all() as any[];
  log('### GKC Level Breakdown');
  log();
  for (const r of levels) {
    log(`- **${r.level}**: ${r.cnt.toLocaleString()}`);
  }
  log();

  // Analyze target expressions
  const targets = db.prepare(`
    SELECT target_expression, count(*) as cnt
    FROM gkc_definitions
    WHERE target_expression IS NOT NULL AND length(target_expression) > 1
    GROUP BY target_expression
    ORDER BY cnt DESC
    LIMIT 40
  `).all() as any[];

  log('### Top 40 GKC Target Expressions');
  log();

  function classifyTarget(expr: string): string {
    const e = expr.toLowerCase();
    if (e.includes('currentmap')) return 'Map-scoped';
    if (e.includes('locationname') || e.includes('currentzone')) return 'Location/Zone-scoped';
    if (e.includes('side') || e.includes('nationality') || e.includes('faction')) return 'Side/Faction filter';
    if (e.includes('formation') || e.includes('corps') || e.includes('division')) return 'Formation filter';
    if (e.includes('type') || e.includes('unittype')) return 'Unit type filter';
    if (e.includes('basicname') || e.includes('piecename')) return 'Piece name filter';
    if (e.includes('mark') || e.includes('marker')) return 'Marker-based';
    if (e.includes('moved') || e.includes('move')) return 'Movement-related';
    if (e.includes('selected') || e.includes('select')) return 'Selection-based';
    if (e.includes('deckname') || e.includes('deck')) return 'Deck filter';
    if (e.includes('prototype')) return 'Prototype filter';
    if (e.includes('true') || e === '{true}') return 'Match all';
    return 'Custom property';
  }

  log('| Count | Target Expression | Category |');
  log('|------:|-------------------|----------|');
  for (const r of targets) {
    const cat = classifyTarget(r.target_expression);
    const expr = (r.target_expression || '').replace(/\|/g, '\\|').substring(0, 80);
    log(`| ${r.cnt} | \`${expr}\` | ${cat} |`);
  }
  log();

  // Category aggregation
  const allTargets = db.prepare(`
    SELECT target_expression FROM gkc_definitions WHERE target_expression IS NOT NULL AND length(target_expression) > 1
  `).all() as any[];

  const catCounts = new Map<string, number>();
  for (const r of allTargets) {
    const cat = classifyTarget(r.target_expression);
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  }
  const sortedCats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);

  log('### GKC Targeting Categories (aggregated)');
  log();
  for (const [cat, cnt] of sortedCats) {
    log(`- **${cat}**: ${cnt.toLocaleString()}`);
  }
  log();

  // Modules with most GKCs
  const topGkcModules = db.prepare(`
    SELECT m.name, m.publisher, count(*) as cnt
    FROM gkc_definitions g
    JOIN modules m ON m.id = g.module_id
    GROUP BY g.module_id
    ORDER BY cnt DESC
    LIMIT 15
  `).all() as any[];

  log('### Modules with Most GKC Definitions');
  log();
  log('| Module | Publisher | GKCs |');
  log('|--------|-----------|------|');
  for (const r of topGkcModules) {
    log(`| ${r.name} | ${r.publisher || ''} | ${r.cnt} |`);
  }
  log();

  // Most sophisticated targeting (longest/most complex expressions)
  const complexTargets = db.prepare(`
    SELECT m.name, g.target_expression, g.name as gkc_name
    FROM gkc_definitions g
    JOIN modules m ON m.id = g.module_id
    WHERE length(g.target_expression) > 50
    ORDER BY length(g.target_expression) DESC
    LIMIT 15
  `).all() as any[];

  log('### Most Complex GKC Target Expressions');
  log();
  for (const r of complexTargets) {
    log(`- **${r.name}** — \`${r.gkc_name || '(unnamed)'}\`:`);
    log(`  \`${(r.target_expression || '').substring(0, 150)}\``);
  }
  log();
}

// ─── Task 4: Property Ecosystem Mapping ───────────────────────────────

function task4_propertyEcosystem() {
  heading(2, 'Task 4: Property Ecosystem Mapping');

  const total = db.prepare(`SELECT count(*) as cnt FROM properties`).get() as any;
  log(`Total property definitions: **${total.cnt.toLocaleString()}**`);
  log();

  // Scope breakdown
  const scopes = db.prepare(`
    SELECT scope, prop_type, count(*) as cnt FROM properties GROUP BY scope, prop_type ORDER BY cnt DESC
  `).all() as any[];
  log('### Property Scope x Type');
  log();
  log('| Scope | Type | Count |');
  log('|-------|------|------:|');
  for (const r of scopes) {
    log(`| ${r.scope} | ${r.prop_type} | ${r.cnt} |`);
  }
  log();

  // Most common property names across modules
  const commonNames = db.prepare(`
    SELECT name, count(DISTINCT module_id) as modules, count(*) as total,
           GROUP_CONCAT(DISTINCT scope) as scopes,
           GROUP_CONCAT(DISTINCT prop_type) as types
    FROM properties
    GROUP BY name
    HAVING modules > 3
    ORDER BY modules DESC
    LIMIT 50
  `).all() as any[];

  log('### Cross-Module Property Vocabulary (names appearing in 4+ modules)');
  log();
  log('| Property Name | Modules | Total | Scopes | Types |');
  log('|---------------|--------:|------:|--------|-------|');
  for (const r of commonNames) {
    log(`| ${r.name} | ${r.modules} | ${r.total} | ${r.scopes} | ${r.types} |`);
  }
  log();

  // Modules with most properties (most stateful)
  const statefulModules = db.prepare(`
    SELECT m.name, m.publisher, count(*) as prop_count,
           sum(case when p.prop_type='dynamic' then 1 else 0 end) as dynamic_cnt,
           sum(case when p.prop_type='calculated' then 1 else 0 end) as calc_cnt,
           sum(case when p.prop_type='global' then 1 else 0 end) as global_cnt
    FROM properties p
    JOIN modules m ON m.id = p.module_id
    GROUP BY p.module_id
    ORDER BY prop_count DESC
    LIMIT 20
  `).all() as any[];

  log('### Most Stateful Modules (by property count)');
  log();
  log('| Module | Publisher | Total | Dynamic | Calculated | Global |');
  log('|--------|-----------|------:|--------:|-----------:|-------:|');
  for (const r of statefulModules) {
    log(`| ${r.name} | ${r.publisher || ''} | ${r.prop_count} | ${r.dynamic_cnt} | ${r.calc_cnt} | ${r.global_cnt} |`);
  }
  log();

  // Calculated property expressions (the most sophisticated)
  const calcProps = db.prepare(`
    SELECT m.name as module_name, p.name as prop_name, p.expression
    FROM properties p
    JOIN modules m ON m.id = p.module_id
    WHERE p.prop_type = 'calculated' AND p.expression IS NOT NULL AND length(p.expression) > 10
    ORDER BY length(p.expression) DESC
    LIMIT 15
  `).all() as any[];

  log('### Most Complex Calculated Properties');
  log();
  for (const r of calcProps) {
    log(`- **${r.module_name}** — \`${r.prop_name}\`:`);
    log(`  \`${(r.expression || '').substring(0, 200)}\``);
  }
  log();
}

// ─── Task 5: Automation Completeness Scoring ──────────────────────────

function task5_automationScoring() {
  heading(2, 'Task 5: Automation Completeness Scoring');

  // For each module, count: TriggerActions, GKCs, ReportState, CalculatedProperties, expressions
  const scores = db.prepare(`
    SELECT
      m.id, m.name, m.publisher,
      COALESCE(tc_macro.cnt, 0) as triggers,
      COALESCE(gkc.cnt, 0) as gkcs,
      COALESCE(tc_report.cnt, 0) as reports,
      COALESCE(calc.cnt, 0) as calc_props,
      COALESCE(expr.cnt, 0) as expressions,
      COALESCE(tc_dynprop.cnt, 0) as dyn_props
    FROM modules m
    LEFT JOIN (SELECT module_id, count(*) as cnt FROM trait_chains WHERE trait_id='macro' GROUP BY module_id) tc_macro ON tc_macro.module_id = m.id
    LEFT JOIN (SELECT module_id, count(*) as cnt FROM gkc_definitions GROUP BY module_id) gkc ON gkc.module_id = m.id
    LEFT JOIN (SELECT module_id, count(*) as cnt FROM trait_chains WHERE trait_id='report' GROUP BY module_id) tc_report ON tc_report.module_id = m.id
    LEFT JOIN (SELECT module_id, count(*) as cnt FROM properties WHERE prop_type='calculated' GROUP BY module_id) calc ON calc.module_id = m.id
    LEFT JOIN (SELECT module_id, count(*) as cnt FROM expressions GROUP BY module_id) expr ON expr.module_id = m.id
    LEFT JOIN (SELECT module_id, count(*) as cnt FROM trait_chains WHERE trait_id='DYNPROP' GROUP BY module_id) tc_dynprop ON tc_dynprop.module_id = m.id
    ORDER BY (COALESCE(tc_macro.cnt,0)*3 + COALESCE(gkc.cnt,0)*2 + COALESCE(tc_report.cnt,0) + COALESCE(calc.cnt,0)*4 + COALESCE(expr.cnt,0) + COALESCE(tc_dynprop.cnt,0)*2) DESC
  `).all() as any[];

  // Compute composite score
  const scored = scores.map(r => ({
    ...r,
    score: r.triggers * 3 + r.gkcs * 2 + r.reports + r.calc_props * 4 + r.expressions + r.dyn_props * 2
  }));

  log('### Top 25 Most Automated Modules');
  log();
  log('Scoring: Triggers×3 + GKCs×2 + Reports×1 + CalcProps×4 + Expressions×1 + DynProps×2');
  log();
  log('| Rank | Module | Publisher | Score | Triggers | GKCs | Reports | CalcProps | DynProps | Expressions |');
  log('|-----:|--------|-----------|------:|---------:|-----:|--------:|----------:|--------:|------------:|');
  for (let i = 0; i < 25 && i < scored.length; i++) {
    const r = scored[i];
    log(`| ${i + 1} | ${r.name} | ${r.publisher || ''} | ${r.score} | ${r.triggers} | ${r.gkcs} | ${r.reports} | ${r.calc_props} | ${r.dyn_props} | ${r.expressions} |`);
  }
  log();

  // Distribution stats
  const zeroAuto = scored.filter(r => r.score === 0).length;
  const lowAuto = scored.filter(r => r.score > 0 && r.score < 50).length;
  const medAuto = scored.filter(r => r.score >= 50 && r.score < 500).length;
  const highAuto = scored.filter(r => r.score >= 500).length;

  log('### Automation Distribution Across Corpus');
  log();
  log(`- **Zero automation** (score=0): ${zeroAuto} modules (${(zeroAuto / scored.length * 100).toFixed(1)}%)`);
  log(`- **Low automation** (1-49): ${lowAuto} modules (${(lowAuto / scored.length * 100).toFixed(1)}%)`);
  log(`- **Medium automation** (50-499): ${medAuto} modules (${(medAuto / scored.length * 100).toFixed(1)}%)`);
  log(`- **High automation** (500+): ${highAuto} modules (${(highAuto / scored.length * 100).toFixed(1)}%)`);
  log();

  // What do the top modules do differently?
  log('### What Top Modules Do Differently');
  log();
  const top10 = scored.slice(0, 10);
  const avgTriggers = top10.reduce((s, r) => s + r.triggers, 0) / 10;
  const avgGkcs = top10.reduce((s, r) => s + r.gkcs, 0) / 10;
  const avgReports = top10.reduce((s, r) => s + r.reports, 0) / 10;
  const avgCalc = top10.reduce((s, r) => s + r.calc_props, 0) / 10;
  const avgExpr = top10.reduce((s, r) => s + r.expressions, 0) / 10;
  const corpusAvgT = scored.reduce((s, r) => s + r.triggers, 0) / scored.length;
  const corpusAvgG = scored.reduce((s, r) => s + r.gkcs, 0) / scored.length;
  const corpusAvgR = scored.reduce((s, r) => s + r.reports, 0) / scored.length;

  log(`| Metric | Top 10 Average | Corpus Average | Multiplier |`);
  log(`|--------|---------------:|---------------:|-----------:|`);
  log(`| TriggerActions | ${avgTriggers.toFixed(0)} | ${corpusAvgT.toFixed(1)} | ${(avgTriggers / Math.max(corpusAvgT, 0.1)).toFixed(0)}x |`);
  log(`| GKCs | ${avgGkcs.toFixed(0)} | ${corpusAvgG.toFixed(1)} | ${(avgGkcs / Math.max(corpusAvgG, 0.1)).toFixed(0)}x |`);
  log(`| ReportStates | ${avgReports.toFixed(0)} | ${corpusAvgR.toFixed(1)} | ${(avgReports / Math.max(corpusAvgR, 0.1)).toFixed(0)}x |`);
  log(`| CalcProps | ${avgCalc.toFixed(1)} | ${(scored.reduce((s, r) => s + r.calc_props, 0) / scored.length).toFixed(2)} | ${(avgCalc / Math.max(scored.reduce((s, r) => s + r.calc_props, 0) / scored.length, 0.01)).toFixed(0)}x |`);
  log(`| Expressions | ${avgExpr.toFixed(0)} | ${(scored.reduce((s, r) => s + r.expressions, 0) / scored.length).toFixed(1)} | ${(avgExpr / Math.max(scored.reduce((s, r) => s + r.expressions, 0) / scored.length, 0.1)).toFixed(0)}x |`);
  log();
}

// ─── Task 6: Automation Recipes ───────────────────────────────────────

function task6_automationRecipes() {
  heading(2, 'Task 6: Automation Recipes');

  log('Automation recipes are recurring multi-trait patterns that together implement a game mechanic.');
  log();

  // For each prototype, get its trait set (unique trait_ids)
  const protoTraits = db.prepare(`
    SELECT module_id, source_name, GROUP_CONCAT(DISTINCT trait_id) as traits
    FROM trait_chains
    WHERE source_type = 'prototype'
    GROUP BY module_id, source_name
  `).all() as any[];

  // Define recipe signatures to look for
  const recipes = [
    { name: 'State Change + Notification', required: ['DYNPROP', 'macro', 'report'], desc: 'DynamicProperty changed by TriggerAction, reported to chat' },
    { name: 'Cascade Command (piece-level GKC)', required: ['macro', 'globalkey'], desc: 'Trigger fires, then piece-level GKC propagates to other pieces' },
    { name: 'Auto-Move (Trigger + SendTo)', required: ['macro', 'sendto'], desc: 'TriggerAction fires SendToLocation for automated movement' },
    { name: 'Spawn/Replace Automation', required: ['macro', 'placemark'], desc: 'Trigger spawns new pieces (reinforcements, markers)' },
    { name: 'Conditional Visibility', required: ['macro', 'emb2', 'restrictCommands'], desc: 'Trigger controls Embellishment state with conditional command access' },
    { name: 'Full Automation Loop', required: ['macro', 'globalkey', 'report', 'DYNPROP'], desc: 'Complete loop: trigger → state change → propagate → report' },
    { name: 'Calculated Display', required: ['calcProp', 'label'], desc: 'Calculated property shown via Labeler text overlay' },
    { name: 'Sound + Action', required: ['macro', 'playSound'], desc: 'Trigger fires audio feedback' },
    { name: 'Deck Automation', required: ['macro', 'returnToDeck'], desc: 'Trigger returns pieces to deck (card discard, reinforcement pool)' },
    { name: 'Delete/Remove Automation', required: ['macro', 'delete'], desc: 'Trigger removes pieces (elimination, step loss)' },
    { name: 'Multi-State Piece', required: ['DYNPROP', 'emb2', 'macro', 'mark'], desc: 'Piece with mutable state, visual layers, triggers, and static markers' },
    { name: 'Property Propagation', required: ['macro', 'setprop'], desc: 'Trigger sets global properties (phase tracking, score updates)' },
  ];

  const recipeCounts: { name: string; desc: string; count: number; modules: Set<number>; examples: string[] }[] =
    recipes.map(r => ({ ...r, count: 0, modules: new Set(), examples: [] }));

  for (const proto of protoTraits) {
    const traitSet = new Set(proto.traits.split(','));
    for (const recipe of recipeCounts) {
      if (recipe.required.every(t => traitSet.has(t))) {
        recipe.count++;
        recipe.modules.add(proto.module_id);
        if (recipe.examples.length < 3) {
          recipe.examples.push(proto.source_name);
        }
      }
    }
  }

  recipeCounts.sort((a, b) => b.count - a.count);

  log('### Detected Automation Recipes');
  log();
  log('| Recipe | Prototypes | Modules | Required Traits | Description |');
  log('|--------|----------:|--------:|-----------------|-------------|');
  for (const r of recipeCounts) {
    log(`| **${r.name}** | ${r.count.toLocaleString()} | ${r.modules.size} | ${r.required.join(' + ')} | ${r.desc} |`);
  }
  log();

  // Show example prototypes for top recipes
  log('### Recipe Examples');
  log();
  for (const r of recipeCounts.slice(0, 6)) {
    if (r.count > 0) {
      // Get real examples with module names
      const examples = db.prepare(`
        SELECT DISTINCT m.name as module_name, tc.source_name
        FROM trait_chains tc
        JOIN modules m ON m.id = tc.module_id
        WHERE tc.source_type = 'prototype'
          AND tc.trait_id = 'macro'
          AND EXISTS (SELECT 1 FROM trait_chains t2 WHERE t2.module_id = tc.module_id AND t2.source_type = tc.source_type AND t2.source_name = tc.source_name AND t2.trait_id = ?)
        LIMIT 5
      `).all(r.required.find(t => t !== 'macro') || 'DYNPROP') as any[];

      log(`**${r.name}** (${r.count} prototypes across ${r.modules.size} modules):`);
      for (const ex of examples) {
        log(`- ${ex.module_name} → \`${ex.source_name}\``);
      }
      log();
    }
  }

  // Piece-level patterns (non-prototype)
  const pieceMacros = db.prepare(`
    SELECT count(DISTINCT source_name) as cnt
    FROM trait_chains
    WHERE trait_id = 'macro' AND source_type = 'piece'
  `).get() as any;
  log(`Note: ${pieceMacros.cnt} individual pieces also contain TriggerActions (not in prototypes).`);
  log();

  // Advanced: Find modules using looping triggers
  const loopingTriggers = db.prepare(`
    SELECT m.name, tc.source_name, tc.params_json
    FROM trait_chains tc
    JOIN modules m ON m.id = tc.module_id
    WHERE tc.trait_id = 'macro' AND tc.params_json LIKE '%while%'
    LIMIT 10
  `).all() as any[];

  if (loopingTriggers.length > 0) {
    log('### Looping TriggerActions (advanced iteration)');
    log();
    for (const r of loopingTriggers) {
      log(`- **${r.name}** → \`${r.source_name}\``);
    }
    log();
  }

  // Check for counted/until loops in macro params
  const countedLoops = db.prepare(`
    SELECT m.name, count(*) as cnt
    FROM trait_chains tc
    JOIN modules m ON m.id = tc.module_id
    WHERE tc.trait_id = 'macro' AND (tc.params_json LIKE '%counted%' OR tc.params_json LIKE '%until%')
    GROUP BY tc.module_id
    ORDER BY cnt DESC
    LIMIT 10
  `).all() as any[];

  if (countedLoops.length > 0) {
    log('### Modules Using Looping Triggers (counted/until)');
    log();
    log('| Module | Loop-Capable Triggers |');
    log('|--------|-----------------------:|');
    for (const r of countedLoops) {
      log(`| ${r.name} | ${r.cnt} |`);
    }
    log();
  }
}

// ─── Run All Tasks ────────────────────────────────────────────────────

heading(1, 'Team 2: Behavioral Analysis — Game Logic & Automation');
log(`*Analysis of ${562} VASSAL modules from corpus database*`);
log(`*Generated: ${new Date().toISOString()}*`);
log();

log('---');
log();

task1_expressionTemplates();
task2_triggerChains();
task3_gkcPatterns();
task4_propertyEcosystem();
task5_automationScoring();
task6_automationRecipes();

// Write output
const output = lines.join('\n');
writeFileSync(OUT_PATH, output, 'utf-8');
console.log(`Report written to ${OUT_PATH} (${(output.length / 1024).toFixed(1)} KB)`);

db.close();
