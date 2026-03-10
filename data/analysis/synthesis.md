# Corpus Analysis Synthesis — Champion-Challenger Results

*562 modules from 5 publishers · 4 independent analysis teams · March 2026*

---

## Where All 4 Teams Agree (High Confidence)

### 1. Modern VASSAL features are almost completely unused
- **Mat/MatCargo** (3.6): Only 66 prototypes across the entire corpus use `mat`; zero use `attachment` or `multiLocation`
- **CalculatedProperty**: Only 60 modules (10.7%) use `calcProp` at all
- **Implication**: The Module Modder's biggest value-add is surfacing features that designers don't know exist

### 2. Prototype reuse is the strongest quality signal
- Team 1 found 32.3% of prototypes use `mark` traits and 30.2% use prototype inheritance
- Team 4 confirmed: prototype reuse ratio is the single best predictor of module quality (r=0.72 with overall score)
- Bottom 20 modules all have zero or near-zero prototype usage
- **Implication**: The #1 recommendation for any module should be "consolidate duplicate traits into prototypes"

### 3. ~44% of the corpus has minimal automation
- Team 2: 44% of modules classified as "low automation" (< 5 TriggerActions per 100 pieces)
- Team 4: Mean quality score is 44.9/100 with a long left tail
- Team 3: Hex-and-counter modules average 26.5 GKCs vs card-driven at 56.6
- **Implication**: Massive opportunity for Module Modder to inject basic automation (ReportState, Inventory, Triggers)

### 4. ReportState is the #1 missing feature across all game types
- Only 18% of prototypes include `report` traits
- Even top-20 modules only hit ~70% ReportState coverage
- 40% of modules have completely silent state changes
- **Implication**: Auto-injecting ReportState into existing prototypes is the single highest-impact Module Modder feature

---

## Where Teams Diverge (Interesting Findings)

### Game type classification reveals hidden structure
- Team 3 classified 41% of modules as "card-driven" (231 modules), far more than expected
- This isn't wrong — many hex wargames have significant card mechanics (CDG hybrids)
- **Card-driven modules are consistently more automated** (2.5x more GKCs, 3.3x more `return` traits, 2.3x more `calcProp`)
- **Cross-pollination opportunity**: Card-driven patterns like `return` (82% adoption in card games, only 24% elsewhere) and `obs` (80% vs 39%) should be promoted to hex-and-counter designers

### Solitaire games are automation leaders
- Team 2 found that the top TriggerAction modules are solitaire/solo games:
  - Western Front Ace: 2,759 triggers
  - Fields of Fire: 2,090 triggers
  - American Tank Ace: 681 triggers
- Makes sense — solitaire games MUST automate the opponent
- **Implication**: Mine solitaire modules for automation recipes even for non-solitaire games

### Prototype inheritance is universally shallow
- Team 1 found max inheritance depth = 1 across the entire corpus
- No module uses deep prototype chains (A → B → C)
- This may be a VASSAL UI limitation rather than a design choice
- **Implication**: Don't build complex inheritance hierarchies into templates — keep it flat

---

## Unique Insights by Team

### Team 1 (Structural): The "4,545 fingerprints" finding
- 24,382 prototypes reduce to only 4,545 unique trait-set combinations
- Top 20 fingerprints cover 36.8% of all prototypes
- The #1 archetype is just `piece` alone (2,953 prototypes) — utility/marker pieces
- **Product insight**: We can offer ~20 archetype templates that cover a third of all real-world prototypes

### Team 2 (Behavioral): Expression templates are highly extractable
- 71,218 expressions reduce to 11,258 templates
- Top 10 templates cover 25,000+ expressions (35%)
- Key patterns: `{Formation=="X"}` (unit filtering), `$pieceName$ ($label$)` (display), `{DeckName=="X"}` (deck targeting), `{Random(N)}` (dice)
- 60% BeanShell, 37% old-style, 3% mixed
- **Product insight**: Expression builder UI with 50 parameterized templates would cover most use cases

### Team 3 (Comparative): Cross-pollination opportunities
- `AreaOfEffect` is 2.1x more common in hex-and-counter — largely unknown to card game designers
- `globalhotkey` is 3.5x more common in card-driven — hex games should adopt global automation
- Block games use `obs` at 100% (by definition) — their masking patterns are the most sophisticated
- Area-movement games use `nonRect` at 2.6x the corpus average — custom shapes matter there
- **Product insight**: Feature recommendations should be game-type-aware

### Team 4 (Quality): Gold standard modules identified
**Top 5 modules to mine for templates:**

| Rank | Module | Score | Why |
|------|--------|-------|-----|
| 1 | Flashpoint: South China Sea | 90.9 | Perfect prototype reuse + full automation + modern features |
| 2 | A las Barricadas! 2nd Ed | 85.6 | Rich expressions + complete reporting |
| 3 | Plantagenet | 82.7 | Levy & Campaign series — clean inheritance, modern engine |
| 4 | Inferno | 82.4 | Same series as above, slightly larger |
| 5 | Nevsky | 82.2 | Same series, the original — well-established patterns |

**Anti-patterns identified:**
- 12 modules with 20+ pieces and zero prototypes (copy-paste nightmare)
- 15 modules with TriggerActions but no ReportState (silent automation)
- Bottom quartile averages score of 25/100 — mostly pre-3.3 modules never updated
- Quality trends upward: VASSAL 3.1 modules avg 30, VASSAL 3.7 modules avg 54

---

## Actionable Outcomes for the Product

### Immediate (Module Modder Phase 2)
1. **ReportState injection** — Add to all prototypes missing it. Highest-impact single feature.
2. **Inventory window** — Only 23% of modules have one. Auto-tag pieces from PieceWindow structure.
3. **Footprint/MovementMarkable** — 48% of modules lack movement tracking. Easy inject.
4. **Game-type-aware recommendations** — Show different feature suggestions for card-driven vs hex.

### Near-term (Templates & Patterns)
5. **20 archetype prototype templates** — Based on Team 1's fingerprint clustering.
6. **50 expression templates** — Based on Team 2's template extraction. Parameterized.
7. **Gold standard mining** — Extract full prototype definitions from top-5 modules as reference implementations.
8. **Automation recipes** — 3-5 common TriggerAction chains (activate→mark→report, combat→reduce→report, etc.)

### Future (Phase 3-4 Module Builder)
9. **Levy & Campaign pattern library** — The Plantagenet/Nevsky/Inferno series represents the highest-quality template source.
10. **Solitaire automation module** — Template system for AI-opponent automation chains.
11. **Quality scoring in Module Modder** — Show users their module's quality score and what to improve.

---

## Corpus Statistics Summary

| Metric | Value |
|--------|-------|
| Modules analyzed | 562 |
| Publishers | 5 (GMT, Compass, MMP, Decision, VUCA) |
| Total prototypes | 24,382 |
| Unique prototype fingerprints | 4,545 |
| Total expressions | 71,218 |
| Expression templates | 11,258 |
| TriggerAction traits | 28,970 |
| Game concepts classified | 45 |
| Module↔concept matches | 28,254 |
| Mean quality score | 44.9/100 |
| Gold standard module | Flashpoint: South China Sea (90.9) |
| Worst module | Espinosa (5.0) |
