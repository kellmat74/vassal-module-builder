# Corpus Analysis Methodology — Detailed Reference

*562 modules · 5 publishers · 4 analysis teams · March 2026*

This document describes in detail the methods, data sources, algorithms, and scoring models used by each of the four analysis teams. It is intended both as a transparency reference ("how did we reach these conclusions?") and as a runbook for re-executing this analysis with additional modules.

---

## Table of Contents

1. [Infrastructure & Data Pipeline](#1-infrastructure--data-pipeline)
2. [Team 1: Structural — Archetype Prototype Mining](#2-team-1-structural)
3. [Team 2: Behavioral — Expression & Automation Mining](#3-team-2-behavioral)
4. [Team 3: Comparative — Game Type Cohort Analysis](#4-team-3-comparative)
5. [Team 4: Quality — Anti-Pattern & Best-Practice Mining](#5-team-4-quality)
6. [Cross-Team Synthesis Method](#6-cross-team-synthesis)
7. [Known Limitations & Bias Warnings](#7-known-limitations)
8. [Re-Execution Guide](#8-re-execution-guide)

---

## 1. Infrastructure & Data Pipeline

### 1.1 Corpus Source

Modules were downloaded from vassalengine.org's public module library using the download-and-extract pipeline (`src/tools/download-and-extract.ts`). The corpus covers 5 publishers:

| Publisher | Modules | % of Corpus |
|-----------|---------|-------------|
| GMT Games | 244 | 43.4% |
| Compass Games | 156 | 27.8% |
| Multi-Man Publishing | 118 | 21.0% |
| Decision Games | 30 | 5.3% |
| VUCA Simulations | 14 | 2.5% |

### 1.2 Data Extraction Pipeline (Three Layers)

Each .vmod file is a ZIP archive containing `buildFile.xml` (the module definition) and assets (images, sounds). The pipeline extracts structured data across three layers:

#### Layer 1 — Raw Extraction (`extract-deep-metadata.ts`)

Eight extraction functions run against each module's `buildFile.xml`:

1. **`extractTraitChains()`** — Parses every piece definition and prototype definition, decodes the SequenceEncoder-formatted trait strings into individual trait records. Each trait record contains: `module_id`, `source_type` (piece/prototype), `source_name`, `trait_id` (one of 44 known trait IDs), `position` (order in the decorator chain), and `params_json` (decoded parameters as JSON array). **Result: 1,240,010 rows in `trait_chains` table.**

2. **`extractExpressions()`** — Scans all trait parameters for BeanShell expressions (wrapped in `{ }`) and old-style property references (wrapped in `$ $`). Records: `module_id`, `expression_text`, `expr_type` (beanshell/oldstyle/mixed), `context` (trait_param/report_format/attribute), `source_name`, `functions_used` (JSON array of function names like GetProperty, SumStack), `properties_referenced` (JSON array of property names). **Result: 71,218 rows in `expressions` table.**

3. **`extractPrototypeDefinitions()`** — For each `VASSAL.build.module.PrototypeDefinition` element, records: `module_id`, `name`, `trait_chain_json` (the fully decoded trait chain as a JSON array), `trait_count`. **Result: 24,534 rows in `prototype_definitions` table.**

4. **`extractPiecePrototypes()`** — Maps which pieces reference which prototypes by scanning for `UsePrototype` traits in piece definitions. Records: `module_id`, `piece_name`, `prototype_name`. **Result: 229,355 rows in `piece_prototypes` table.**

5. **`extractComponentTree()`** — Flattens the full XML hierarchy into a table. Each XML element becomes a row with: `module_id`, `component_path` (full path from root), `short_tag` (Java class name without package prefix, e.g., "Map", "DrawPile", "PieceSlot"), `depth`, `parent_path`, and a JSON blob of all XML attributes. **Result: 667,815 rows in `component_tree` table.**

6. **`extractGKCDefinitions()`** — Extracts Global Key Command definitions from three levels: module-level (`StartupGlobalKeyCommand`, `GlobalKeyCommand`), map-level (`MassKeyCommand`), and piece-level (`CounterGlobalKeyCommand` in trait chains). Records: `module_id`, `name`, `level` (module/map/piece), `target_expression` (the filter expression that selects which pieces the GKC affects), `key_stroke`, `scope`. **Result: 20,450 rows in `gkc_definitions` table.**

7. **`extractProperties()`** — Extracts all property definitions: `GlobalProperty` (module/map scope), `DynamicProperty` (piece scope), `CalculatedProperty` (piece scope with BeanShell expression). Records: `module_id`, `name`, `scope`, `prop_type`, `expression` (for calculated), `initial_value`. **Result: 5,656 rows in `properties` table.**

8. **`extractGridTypes()`** — Records which grid types are present per module by scanning for `HexGrid`, `SquareGrid`, `RegionGrid`, `ZonedGrid` elements. **Result: `grid_types` table.**

In addition, two derived tables are computed:

- **`trait_counts`** — Aggregated count of each trait_id per module (precomputed from `trait_chains` for performance).
- **`module_features`** — Boolean feature presence flags per module: `hasZoomer`, `hasCounterDetailViewer`, `hasInventory`, `hasGlobalMap`, `hasTurnTracker`, `hasDiceButton`, `hasHighlightLastMoved`, `hasFlare`, `hasPredefinedSetup`, `hasNotesWindow`, `hasLOS`, `hasPlayerHand`, `hasPrivateMap`, `hasMapShader`, `hasMat`, `hasSpecialDiceButton`, `hasFootprint`, `hasMovementMarkable`. Detected by scanning `component_tree` for the corresponding VASSAL component class names. **Result: `module_features` table.**

#### Layer 2 — Structural Analysis

Uses the Layer 1 tables to compute structural relationships: prototype inheritance depth, piece-to-prototype mapping ratios, trait chain complexity statistics.

#### Layer 3 — Semantic Classification (`semantic-classifier.ts`)

Maps modules to game concepts using a taxonomy of 45 concepts and 38 implementation patterns, each defined by composable `PatternSignature` rules:

```
PatternSignature = {
  all_of: Rule[],   // every rule must match
  any_of: Rule[],   // at least one must match
  none_of: Rule[]   // none may match
}

Rule types:
- trait_exists(trait_id) — module has at least one instance of this trait
- params_match(trait_id, param_index, regex) — a trait's parameter matches a pattern
- component_exists(short_tag) — module has this component in component_tree
- expression_match(regex) — module has an expression matching this pattern
```

**Result: 28,254 rows in `module_concept_matches` table.**

### 1.3 Database

All data is stored in a single SQLite database (`data/module-corpus.db`, ~620MB) with 18 tables. The database is opened read-only by all analysis scripts to prevent cross-contamination.

---

## 2. Team 1: Structural — Archetype Prototype Mining

**Script:** `src/tools/analysis/team1-structural.ts`
**Output:** `data/analysis/team1-structural.md`
**Focus:** What trait combinations recur across prototypes, regardless of game type?

### 2.1 Fingerprinting Algorithm

For each of the 24,382 prototype definitions, the team:

1. **Parsed the trait chain JSON** — Converted `trait_chain_json` (stored as a JSON array of `{trait_id, params}` objects) into a list of trait IDs, filtering out `null` entries.

2. **Generated a canonical fingerprint** — Computed a sorted, deduplicated representation of the trait set as `trait_id:count` pairs joined by `|`. Example: a prototype with traits `[piece, mark, emb2, mark]` would fingerprint as `emb2:1|mark:2|piece:1`. This ignores trait ordering and parameter values — two prototypes with the same set of trait types (with same multiplicities) get the same fingerprint regardless of how those traits are configured.

3. **Grouped by fingerprint** — All prototypes sharing the same fingerprint are grouped into an "archetype." This yielded **4,545 unique fingerprints**.

### 2.2 Archetype Analysis

For each archetype (fingerprint group), the team computed:

- **Prototype count** — How many prototypes share this fingerprint
- **Module count** — How many distinct modules contain at least one prototype with this fingerprint (computed via `new Set(protos.map(p => p.module_id)).size`)
- **Average trait count** — Mean number of traits per prototype in this group
- **Typical names** — The most common prototype names within the group (normalized to lowercase, non-alpha characters removed, counted, and top 6-8 reported)
- **Publisher distribution** — Count of distinct modules per publisher that use this archetype
- **VASSAL version distribution** — Count of distinct modules per major.minor VASSAL version
- **Example modules** — First 5 module names that contain this archetype

The top 20 archetypes by prototype count were reported in detail.

### 2.3 Prototype Inheritance Depth Analysis

To measure how deep prototype inheritance chains go:

1. **Built a reference graph** — For each prototype whose trait chain contains a `prototype` trait (i.e., `UsePrototype`), recorded the referenced prototype name(s) from `params[0]`.

2. **Computed max depth per module** — For every prototype in every module, recursively walked the reference graph counting depth (with cycle detection via a visited set). The maximum depth found across all prototypes in a module was recorded.

3. **Distribution** — Tabulated how many modules have max depth 0, 1, 2, etc.

**Key finding:** Maximum depth across the entire corpus is 1 — no module uses deep prototype inheritance.

### 2.4 Piece-to-Prototype Usage Statistics

Queried the `piece_prototypes` table to compute:

- Average number of pieces referencing each prototype (14.2)
- Maximum pieces referencing a single prototype (1,097)
- Total piece→prototype links (229,355)

### 2.5 Modern Feature Detection

Filtered prototypes whose trait IDs include any of: `mat`, `matCargo`, `attachment`, `multiLocation`. Grouped results by trait and module, reporting which modules use these 3.6-3.7 features and how many prototypes employ them.

### 2.6 Trait Ordering Analysis

For each of the top 20 archetypes, the team checked whether prototypes with the same fingerprint always use the same trait order:

1. **Generated ordered signatures** — The full trait ID sequence (preserving order) as a comma-separated string, e.g., `emb2,prototype,piece`
2. **Counted distinct orderings** per archetype
3. **Reported the most common ordering** and its percentage of the group

Most archetypes show only 1-2 orderings, with the dominant ordering covering 65-100% of instances.

### 2.7 Rare Archetype Discovery

Prototypes not matching any top-20 fingerprint (63.2% of all prototypes) were further analyzed:

- Fingerprints with 3-50 occurrences were extracted as "rare archetypes"
- The top 15 by count were reported with example names, module counts, and publishers

---

## 3. Team 2: Behavioral — Expression & Automation Mining

**Script:** `src/tools/analysis/team2-behavioral.ts`
**Output:** `data/analysis/team2-behavioral.md`
**Focus:** How do modules implement game LOGIC — expressions, triggers, GKCs, and property ecosystems?

### 3.1 Expression Template Extraction (Task 1)

**Goal:** Reduce 71,218 raw expressions to a manageable set of parameterized templates.

**Templatization algorithm:**

1. Queried all rows from `expressions` where `expression_text IS NOT NULL AND length(expression_text) > 2`
2. Applied three regex-based normalizations in order:
   - **Quoted strings → `<STR>`**: Replaced `"..."` and `'...'` with `<STR>`
   - **Property references → `<$PROP$>`**: Replaced `$PropertyName$` patterns with `<$PROP$>`
   - **Numbers → `<N>`**: Replaced standalone integers/decimals (not preceded by letter/underscore) with `<N>`
3. Grouped by resulting template string, counted occurrences, and collected up to 3 raw examples per template

**Concept inference:** Each template was classified into a concept category using a rule-based classifier that checks the template string for known patterns:
- `currentmap` + `deck` → "Deck/Card location check"
- `deckname` → "Deck membership test"
- `getproperty` + `>` → "Property comparison"
- `locationname` or `currentzone` → "Location/zone check"
- `basicname` or `piecename` → "Piece identity"
- Content containing `strength`/`attack`/`defense` → "Combat values"
- Fallback → "General logic"

**Additional breakdowns:**
- Expression type distribution (beanshell/oldstyle/mixed) — via `GROUP BY expr_type`
- Context distribution (trait_param/report_format/attribute) — via `GROUP BY context`
- Top referenced properties — parsed from `properties_referenced` JSON column
- Top functions — parsed from `functions_used` JSON column

### 3.2 TriggerAction Chain Analysis (Task 2)

**Goal:** Understand how modules use TriggerAction (`macro`) traits for automation.

**Methods:**

1. **Source counting** — Counted distinct `(module_id, source_type, source_name)` tuples where `trait_id = 'macro'` in `trait_chains`. This gives the number of prototypes/pieces that contain at least one TriggerAction.

2. **Module ranking** — Grouped by module, counted total `macro` traits, sorted descending.

3. **Trait co-occurrence analysis** — Performed a self-join on `trait_chains`: for every source (prototype/piece) containing a `macro` trait, counted what OTHER trait IDs appear in the same source. This reveals what triggers automate (e.g., `emb2` = visual state changes, `sendto` = movement, `report` = chat notifications).

4. **Chaining depth** — Grouped `macro` traits by `(module_id, source_type, source_name)`, counted how many TriggerActions exist per source. More triggers in a single source = deeper automation chain. Reported distribution: 3,207 sources have 1 trigger, 1,901 have 2, etc., up to one source with 2,742 triggers (Western Front Ace).

5. **Most complex sources** — The top 15 prototype/piece definitions by trigger count were reported as "deepest automation" examples.

### 3.3 GKC Targeting Pattern Analysis (Task 3)

**Goal:** Understand how Global Key Commands target pieces and what automation patterns they enable.

**Methods:**

1. **Level breakdown** — Grouped `gkc_definitions` by `level` (module/map/piece). Piece-level GKCs (16,486) dominate, followed by map-level (2,836) and module-level (1,128).

2. **Target expression analysis** — Grouped by `target_expression`, counted occurrences. The top 40 most common targeting patterns were reported.

3. **Target classification** — Each target expression was classified into a category using keyword-based rules:
   - Contains `currentmap` → "Map-scoped"
   - Contains `currentzone`/`locationname` → "Location/Zone-scoped"
   - Contains `side`/`nationality`/`faction` → "Side/Faction filter"
   - Contains `formation`/`corps`/`division` → "Formation filter"
   - Contains `type`/`unittype` → "Unit type filter"
   - Contains `basicname`/`piecename` → "Piece name filter"
   - Contains `deckname`/`deck` → "Deck filter"
   - Contains `true` or equals `{true}` → "Match all"
   - Fallback → "Custom property"

4. **Module ranking** — Top 15 modules by GKC count. Steel Wolves leads with 1,479 GKCs.

5. **Complexity analysis** — Reported the longest target expressions (by character count) as examples of sophisticated targeting logic.

### 3.4 Property Ecosystem Mapping (Task 4)

**Goal:** Understand the property landscape — what state do modules track?

**Methods:**

1. **Scope × type breakdown** — Cross-tabulated `scope` (module/map/piece) against `prop_type` (global/calculated/dynamic).

2. **Cross-module vocabulary** — Found property names appearing in 4+ modules (`GROUP BY name HAVING COUNT(DISTINCT module_id) > 3`). This identifies de facto standard property names across the community (e.g., "Turn" appears in 19 modules, "Weather" in 14).

3. **Most stateful modules** — Ranked modules by total property count, broken down by type.

4. **Complex calculated properties** — Found the longest `expression` values in `properties WHERE prop_type = 'calculated'` as examples of sophisticated computed game state.

### 3.5 Automation Completeness Scoring (Task 5)

**Goal:** Score each module's automation level on a single axis.

**Scoring formula:**

```
Score = Triggers × 3 + GKCs × 2 + Reports × 1 + CalcProps × 4 + Expressions × 1 + DynProps × 2
```

The weights reflect the relative sophistication each automation type represents:
- **CalcProps (×4):** Most sophisticated — computed game state
- **Triggers (×3):** Automated action chains
- **GKCs (×2) and DynProps (×2):** Mass operations and mutable state
- **Reports and Expressions (×1):** Useful but simpler

**Data source:** A single query joining `modules` with six LEFT JOINed subqueries counting each automation type from `trait_chains`, `gkc_definitions`, `properties`, and `expressions`.

**Distribution buckets:**
- Zero automation (score=0): 1 module
- Low (1-49): 246 modules (43.8%)
- Medium (50-499): 198 modules (35.2%)
- High (500+): 117 modules (20.8%)

### 3.6 Automation Recipe Detection (Task 6)

**Goal:** Find recurring multi-trait patterns that together implement specific game mechanics.

**Method:**

1. **Defined 12 recipe signatures** — Each recipe is a set of required trait IDs that must ALL be present in a single prototype. Examples:
   - "Auto-Move": requires `macro` + `sendto`
   - "Cascade Command": requires `macro` + `globalkey`
   - "Full Automation Loop": requires `macro` + `globalkey` + `report` + `DYNPROP`

2. **Scanned all prototypes** — For each prototype in `trait_chains WHERE source_type = 'prototype'`, aggregated its unique trait IDs via `GROUP_CONCAT(DISTINCT trait_id)`. Checked each recipe signature against the trait set.

3. **Counted matches** — Reported how many prototypes and how many distinct modules match each recipe.

4. **Looping trigger detection** — Searched for TriggerActions with loop keywords (`while`, `counted`, `until`) in their `params_json` to identify advanced iteration patterns.

---

## 4. Team 3: Comparative — Game Type Cohort Analysis

**Script:** `src/tools/analysis/team3-comparative.ts`
**Output:** `data/analysis/team3-comparative.md`
**Focus:** How do different game types solve the same problems differently?

### 4.1 Game Type Classification Algorithm

Every module was classified into one of 7 game types using structural signals from the database — **not module names or publisher metadata**. This is a rule-based classifier, not ML.

**Input features per module (the "ModuleProfile"):**

| Feature | Source Table | Description |
|---------|------------|-------------|
| `hasHexGrid` | `grid_types` | Module contains at least one HexGrid element |
| `hasSquareGrid` | `grid_types` | Module contains at least one SquareGrid element |
| `hasRegionGrid` | `grid_types` | Module contains at least one RegionGrid element |
| `hasZonedGrid` | `grid_types` | Module contains at least one ZonedGrid element |
| `drawPileCount` | `component_tree` | Count of DrawPile components |
| `pieceSlotCount` | `component_tree` | Count of PieceSlot components |
| `obsTraitPct` | `trait_counts` | `obs` trait count / `piece` trait count |
| `rotateTraitPct` | `trait_counts` | `rotate` trait count / `piece` trait count |
| `sendtoCount` | `trait_counts` | Total SendToLocation traits |
| `returnCount` | `trait_counts` | Total ReturnToDeck traits |
| `markCount` | `trait_counts` | Total Marker traits |
| `macroCount` | `trait_counts` | Total TriggerAction traits |
| `emb2Count` | `trait_counts` | Total Embellishment traits |
| `totalTraits` | `trait_counts` | Sum of all trait counts |
| `prototypeCount` | `modules` | Prototype definition count |
| `expressionCount` | `expressions` | Total expression count |
| `gkcCount` | `gkc_definitions` | Total GKC count |
| `propertyCount` | `properties` | Total property definition count |

**Classification rules (evaluated in priority order):**

1. **Block game** — `obsTraitPct > 0.35` AND `emb2Count < pieceSlotCount × 2` AND NOT card-driven. High Obscurable usage relative to pieces, with low embellishment counts (block games are visually simple).

2. **Card-driven** — Either:
   - `drawPileCount >= 3` AND (`returnCount > 10` OR `sendtoCount > 20`) — multiple deck components with significant card movement
   - OR `drawPileCount >= 4` AND high deck-to-piece ratio AND no hex grid — lots of decks relative to pieces

3. **Naval-air** — `rotateTraitPct > 0.25` AND has hex or square grid. Very high FreeRotator usage indicating facing/orientation mechanics.

4. **Area/P2P** — `hasRegionGrid` AND NOT `hasHexGrid`, OR (`hasZonedGrid` AND NOT hex/square). Uses Region or Zoned grids without hex overlay.

5. **Hex-and-counter** — `hasHexGrid` AND `pieceSlotCount > 20`. Standard hex grid with significant counter count.

6. **Square-grid** — `hasSquareGrid` AND `pieceSlotCount > 20`.

7. **Other** — Default fallback.

**Important note:** Many modules classified as "card-driven" (231, or 41%) are actually hex wargames with significant card mechanics (CDG hybrids like Paths of Glory, Twilight Struggle). The classification captures the STRUCTURAL presence of card infrastructure, not the game's primary genre identity.

### 4.2 TF-IDF Style Distinctive Trait Profiling

For each game type cohort, the team identified which traits are **disproportionately common** relative to the rest of the corpus:

1. **For each trait**, computed:
   - `cohortPct` = number of modules in this cohort using the trait / total modules in cohort
   - `otherPct` = number of modules NOT in this cohort using the trait / total non-cohort modules
   - `ratio` = `cohortPct / otherPct`

2. **Filtered** to traits where `cohortPct > 10%` (at least 10% of the cohort uses it, avoiding noise from very rare traits)

3. **Sorted** by ratio descending, reported top 10 per cohort

This is analogous to TF-IDF in information retrieval: traits that are common in a cohort but rare elsewhere get high ratios.

### 4.3 Complexity Metrics by Game Type

For each cohort, computed average values of: total traits, expressions, GKCs, properties, TriggerActions (macros), and piece counts. Sorted by average total traits descending.

### 4.4 Cross-Pollination Opportunity Detection

**Goal:** Find traits that are heavily used in one game type but underused in another, where the pattern would likely be valuable.

**Method:**

1. Built a matrix of `trait × cohort → usage percentage`
2. For each trait, found the cohort with the highest usage (`highCohort`, `highPct`) and the cohort with the lowest usage (`lowCohort`, `lowPct`)
3. Computed `gap = highPct - lowPct`
4. Filtered to traits where `highPct > 20%` and `gap > 15 percentage points`
5. Sorted by gap descending, reported top 20

Each opportunity was annotated with a recommendation explaining WHY the low-usage cohort would benefit from adopting the pattern.

### 4.5 Minority Cohort Deep Dives

For each non-hex game type (card-driven, block, naval-air, area-p2p, square-grid, other):

1. Ranked modules within the cohort by a sophistication score: `totalTraits + expressionCount × 5 + gkcCount × 5 + macroCount × 3`
2. For the top 5 modules, queried:
   - Per-module trait distribution (top 8 traits by count)
   - Sample expressions (first 3)
   - Component breakdown
3. Reported as individual deep-dive profiles

### 4.6 VASSAL Version Distribution by Game Type

For each cohort:
- Parsed major.minor version from `vassal_version` string
- Computed average version number, percentage on 3.7+, 3.6, and pre-3.6
- Counted modules using modern features (mat/attachment/multiLocation)

---

## 5. Team 4: Quality — Anti-Pattern & Best-Practice Mining

**Script:** `src/tools/analysis/team4-quality.ts`
**Output:** `data/analysis/team4-quality.md`
**Focus:** What separates good modules from bad ones?

### 5.1 Quality Scoring Model

Each module receives a composite score from 0 to 100, computed as a weighted sum of 7 normalized dimension scores (each 0.0 to 1.0):

| Dimension | Weight | How Computed |
|-----------|--------|-------------|
| **Prototype Reuse** | 20% | `min(1, piecesWithPrototype / totalPieces)` — from `piece_prototypes` table, count distinct piece names referencing any prototype, divided by total piece count |
| **Automation Depth** | 20% | `min(1, (triggers + GKCs + calcProps + dynProps) / (pieces × 2))` — raw automation item count normalized per piece, capped at 1. A "good" module has ~0.5-2.0 automation items per piece. |
| **Reporting Coverage** | 10% | `min(1, reportTraitCount / (pieces × 0.3))` — `report` trait count from `trait_counts`, normalized against 30% of piece count (assuming good coverage means ~1 report per 3 pieces) |
| **Trait Efficiency** | 10% | `min(1, (uniqueTraitTypes / avgTraitChainLength) × 0.7 + protoCountBonus)` — Ratio of unique trait type diversity in prototypes vs average chain length. Higher diversity relative to length = better. Small bonus for having >5 prototypes (0.3 max). Source: `trait_chains WHERE source_type = 'prototype'` grouped by module. |
| **Expression Sophistication** | 15% | Percentile-based: `beanshellCount × 0.4 + funcDiversity × 5 + propRefDiversity × 2`. Computed for every module, then the target module's position in the sorted distribution is its score. This rewards BeanShell usage (modern expression format), diversity of functions called, and diversity of properties referenced. |
| **VASSAL Modernity** | 10% | Base: linear interpolation from VASSAL 3.1 (0.0) to 3.7 (0.7). Bonus: +0.1 per modern feature detected (Flare, Mat, Attachment, calcProp, deselect) in `module_features` and `trait_chains`. Capped at 1.0. |
| **Component Completeness** | 15% | Count of 9 standard components present (from `module_features`): Zoomer, CounterDetailViewer, Inventory, GlobalMap, TurnTracker, DiceButton, HighlightLastMoved, Flare, PredefinedSetup. Score = count / 9. |

**Composite formula:**

```
composite = prototypeReuse × 20 + automationDepth × 20 + reportingCoverage × 10
          + traitEfficiency × 10 + expressionSophistication × 15
          + vassalModernity × 10 + componentCompleteness × 15
```

This yields a 0-100 score.

### 5.2 Design Decisions in the Scoring Model

**Why these weights?**
- Prototype Reuse and Automation Depth get the highest weights (20% each) because they represent the most impactful design decisions: DRY principle compliance and gameplay automation.
- Expression Sophistication and Component Completeness (15% each) reward modules that use VASSAL's full capabilities.
- Reporting Coverage, Trait Efficiency, and VASSAL Modernity (10% each) are important but less differentiating.

**Why percentile-based for Expression Sophistication?**
Raw expression counts vary enormously (0 to 7,813). Percentile ranking normalizes this automatically without choosing arbitrary caps. A module with more sophisticated expressions than 90% of the corpus scores 0.9.

**Why NOT weight by module size?**
We deliberately do not penalize or reward module size. A 50-piece module with perfect prototype reuse and full automation scores the same as a 2,000-piece module with the same ratios. This prevents large modules from automatically dominating.

### 5.3 Anti-Pattern Detection

Six anti-patterns were defined and detected via targeted queries:

1. **No Prototypes (Copy-Paste Nightmare)** — `modules WHERE prototype_count = 0 AND piece_slot_count > 20`. Found 12 modules with 40-392 pieces and zero prototypes.

2. **No Global Key Commands** — `modules WHERE piece_slot_count > 50 AND id NOT IN (SELECT DISTINCT module_id FROM gkc_definitions)`. Found 15 modules with 725-2,406 pieces and zero GKCs.

3. **Silent Automation** — Modules with `macro` trait count > 5 (from `trait_counts`) but `report` trait count = 0 in the same module. Found 15 modules with triggers but no chat reporting.

4. **Stateless Embellishments** — Modules with `emb2` count > 20 but `PROP` (DynamicProperty) count = 0. Visual states without trackable game state. Found 15 modules with up to 5,095 embellishments and zero dynamic properties.

5. **Missing Essential UI** — Modules with 30+ pieces lacking both `hasZoomer` and `hasCounterDetailViewer` in `module_features`. No modules matched (all modules with 30+ pieces have at least one of these).

6. **Trait Bloat Without SubMenu** — Prototypes with `trait_count > 20` (from `prototype_definitions`) in modules with zero `submenu` traits. Found 15 modules with up to 123 traits in a single prototype and no menu organization.

### 5.4 Publisher Quality Analysis

Grouped all scores by publisher, computed mean, median, and identified the best module per publisher.

### 5.5 Quality Over Time

Parsed `vassal_version` to major.minor buckets (3.1, 3.2, ... 3.7, unknown). Computed average composite score per bucket to show quality trends.

### 5.6 Outlier Detection

For each module, computed `delta = composite - publisherAverage`. Sorted by |delta| to find modules that score much higher or lower than their publisher's norm. Reported top 10 in each direction.

---

## 6. Cross-Team Synthesis Method

After all four teams produced independent reports, synthesis was performed by:

1. **Identifying agreements** — Findings reported by 3+ teams were classified as "high confidence." All four teams agreed on: modern features are underused, prototype reuse is the strongest quality signal, ~44% of modules have minimal automation, and ReportState is the #1 missing feature.

2. **Identifying divergences** — Findings where teams reached different or complementary conclusions. Example: Team 3's card-driven classification (41%) seemed high but was validated by Team 2's finding that card-driven modules are 2.5x more automated — the structural signals genuinely detect card infrastructure.

3. **Extracting unique insights** — Each team had discoveries the others missed:
   - Team 1: 4,545 fingerprint reduction, shallow inheritance universality
   - Team 2: Solitaire games as automation leaders, 11,258 expression templates
   - Team 3: Cross-pollination matrix, game-type-specific trait profiles
   - Team 4: Gold standard module rankings, anti-pattern catalog with specific module examples

4. **Merging into actionable recommendations** — Combined findings into product-relevant categories (immediate Module Modder features, near-term templates, future Phase 3-4 work).

---

## 7. Known Limitations & Bias Warnings

### 7.1 Corpus Bias

The corpus is heavily skewed toward hex-and-counter wargames from 5 publishers. GMT Games alone represents 43.4%. This means:

- **Prevalence is NOT a quality signal.** The "most common" pattern is just "how hex wargamers do it."
- **Rare patterns may be superior.** A card-driven game with 1 module might have better automation than 200 hex wargames.
- **Game type diversity is limited.** We have 6 block games, 4 naval-air games, and 14 "other." These cohorts are too small for statistical significance — their findings are directional, not definitive.

### 7.2 Classification Limitations

- The game type classifier uses structural heuristics, not game knowledge. A hex wargame with many card decks (e.g., CDG-hybrid) may be classified as "card-driven."
- Modules with no grid type (pure card games, for example) default to "other" or "card-driven" depending on deck count.
- The classifier cannot distinguish between a game that genuinely IS card-driven and one that merely uses cards as a secondary mechanic.

### 7.3 Quality Scoring Limitations

- The scoring model weights were chosen by informed judgment, not validated against expert ratings. Different weights would produce different rankings.
- "Component Completeness" checks for 9 specific components — modules using alternative approaches (e.g., custom toolbar instead of TurnTracker) may be penalized.
- Prototype reuse ratio can be misleading for very small modules (5 pieces, 1 prototype = 20% reuse).
- The model rewards BeanShell over old-style expressions, which may unfairly penalize older but well-designed modules.

### 7.4 Expression Template Limitations

- The templatization is regex-based, not AST-based. Complex nested expressions may not templatize cleanly.
- The `<STR>` replacement is greedy — `"value1" + "value2"` becomes `<STR> + <STR>`, losing the multi-string structure.
- Property names inside BeanShell (without `$...$` syntax) are not detected by the `<$PROP$>` replacement.

### 7.5 TriggerAction Analysis Limitations

- The "looping trigger" detection searches for keywords (`while`, `counted`, `until`) in the `params_json` string. This may produce false positives if these words appear in unrelated parameter values.
- Co-occurrence counts use a self-join that may inflate counts for sources with many traits.

---

## 8. Re-Execution Guide

To re-run this analysis with additional modules:

### 8.1 Adding New Modules to the Corpus

```bash
# 1. Download and extract new modules
npx tsx src/tools/download-and-extract.ts --publisher "New Publisher" --reprocess

# 2. Re-run deep metadata extraction for new modules
npx tsx src/tools/extract-deep-metadata.ts

# 3. Re-run semantic classification
npx tsx src/tools/semantic-classifier.ts --classify

# 4. Verify new data
sqlite3 data/module-corpus.db "SELECT publisher, COUNT(*) FROM modules GROUP BY publisher"
```

### 8.2 Re-Running Analysis Teams

Each team script is self-contained and reads from the same database:

```bash
# Team 1: Structural
npx tsx src/tools/analysis/team1-structural.ts

# Team 2: Behavioral
npx tsx src/tools/analysis/team2-behavioral.ts

# Team 3: Comparative
npx tsx src/tools/analysis/team3-comparative.ts

# Team 4: Quality
npx tsx src/tools/analysis/team4-quality.ts
```

All scripts open the database in read-only mode and write to `data/analysis/team{N}-{name}.md`.

### 8.3 Regenerating the HTML Report

```bash
npx tsx src/tools/generate-report.ts
# Opens data/analysis/report.html
```

### 8.4 What to Watch For With New Data

- **Team 3 classification may need tuning** if new publishers have different game type distributions. The card-driven detection threshold (`drawPileCount >= 3`) may need adjustment.
- **Team 4 quality scores will shift** as the percentile-based Expression Sophistication score is recalculated against the new corpus distribution.
- **New trait IDs** from future VASSAL versions should be added to Team 1's modern feature set and Team 4's modernity scoring.
- **Publisher list expansion** in Team 1's bias warning and Team 4's publisher quality table.

### 8.5 Files Involved

| File | Purpose |
|------|---------|
| `src/tools/download-and-extract.ts` | Module download/extraction pipeline |
| `src/tools/extract-deep-metadata.ts` | 8 extraction functions → Layer 1 tables |
| `src/tools/semantic-classifier.ts` | Layer 3 concept classification |
| `src/tools/corpus-db.ts` | 18-table schema definition |
| `src/schema/game-concepts.ts` | 45 concepts + 38 pattern signatures |
| `src/tools/analysis/team1-structural.ts` | Team 1 analysis script |
| `src/tools/analysis/team2-behavioral.ts` | Team 2 analysis script |
| `src/tools/analysis/team3-comparative.ts` | Team 3 analysis script |
| `src/tools/analysis/team4-quality.ts` | Team 4 analysis script |
| `src/tools/generate-report.ts` | Chart.js HTML report generator |
| `data/module-corpus.db` | SQLite database (~620MB) |
| `data/analysis/team{N}-{name}.md` | Team output reports |
| `data/analysis/synthesis.md` | Cross-team synthesis |
| `data/analysis/report.html` | Interactive HTML report |
| `data/analysis/data-model.html` | ER diagram of database schema |
