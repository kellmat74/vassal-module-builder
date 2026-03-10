# Team 4: Module Quality Analysis

**Corpus:** 562 modules | **Generated:** 2026-03-10

## Scoring Model

Each module scored 0-100 across 7 weighted dimensions:

| Dimension | Weight | Measures |
|-----------|--------|----------|
| Prototype Reuse | 20% | Pieces using prototypes / total pieces |
| Automation Depth | 20% | (Triggers + GKCs + CalcProps + DynProps) / pieces |
| Reporting Coverage | 10% | ReportState traits relative to piece count |
| Trait Efficiency | 10% | Diversity of trait types vs chain length in prototypes |
| Expression Sophistication | 15% | BeanShell usage, function diversity, property references |
| VASSAL Modernity | 10% | Engine version + modern features (Mat, Attachment, Flare) |
| Component Completeness | 15% | Presence of Zoomer, CDV, Inventory, GlobalMap, TurnTracker, etc. |

## Score Distribution

- **Mean:** 44.9
- **Median:** 44.5
- **25th percentile:** 32.4
- **75th percentile:** 56.4
- **Max:** 90.9
- **Min:** 5

### Score Histogram

| Range | Count | Bar |
|-------|-------|-----|
| 0-9 | 3 | # |
| 10-19 | 25 | ######## |
| 20-29 | 83 | ############################ |
| 30-39 | 111 | ##################################### |
| 40-49 | 124 | ######################################### |
| 50-59 | 107 | #################################### |
| 60-69 | 77 | ########################## |
| 70-79 | 23 | ######## |
| 80-89 | 8 | ### |
| 90-99 | 1 |  |

## Top 20 "Gold Standard" Modules

These are the highest-quality modules by composite score. Mine these for templates and best practices.

| Rank | Module | Publisher | Score | Proto | Auto | Report | Eff | Expr | Modern | Complete | Pieces |
|------|--------|-----------|-------|-------|------|--------|-----|------|--------|----------|--------|
| 1 | Flashpoint: South China Sea | GMT Games | **90.9** | 1 | 1 | 1 | 1 | 0.95 | 1 | 0.44 | 70 |
| 2 | A las Barricades!  -  Second Edition | Compass Games | **85.6** | 0.66 | 1 | 1 | 1 | 0.98 | 0.95 | 0.56 | 105 |
| 3 | Plantagenet | GMT Games | **82.7** | 1 | 0.62 | 0.73 | 1 | 0.98 | 1 | 0.56 | 266 |
| 4 | Inferno | GMT Games | **82.4** | 1 | 0.73 | 0.49 | 1 | 0.97 | 1 | 0.56 | 236 |
| 5 | Nevsky | GMT Games | **82.2** | 1 | 0.7 | 0.53 | 1 | 0.96 | 1 | 0.56 | 231 |
| 6 | Prelude to Rebellion | Compass Games | **81.8** | 0.51 | 1 | 1 | 1 | 0.88 | 1 | 0.56 | 115 |
| 7 | Vietnam 1965-1975 GMT | GMT Games | **81.7** | 0.75 | 0.56 | 0.82 | 1 | 0.92 | 1 | 0.89 | 672 |
| 8 | Commands & Colors Samurai Battles | GMT Games | **80.5** | 0.54 | 0.78 | 1 | 1 | 0.87 | 0.95 | 0.78 | 87 |
| 9 | Versailles 1919 | GMT Games | **80** | 1 | 0.77 | 0.65 | 1 | 0.91 | 0.6 | 0.56 | 97 |
| 10 | Talon | GMT Games | **79.9** | 0.25 | 1 | 1 | 1 | 0.99 | 1 | 0.67 | 238 |
| 11 | Combat Commander: Europe | GMT Games | **79.4** | 0.5 | 1 | 1 | 1 | 0.73 | 1 | 0.56 | 614 |
| 12 | Paths to Hell - Operation Barbarossa, June-December 1941 | Compass Games | **79.1** | 0.63 | 1 | 1 | 0.91 | 0.93 | 0.51 | 0.56 | 173 |
| 13 | Combat!3 | Compass Games | **78.7** | 0.92 | 0.16 | 1 | 1 | 0.91 | 1 | 0.89 | 283 |
| 14 | SCS Day of Days | Multi-Man Publishing | **78.7** | 1 | 0.12 | 1 | 1 | 1 | 0.97 | 0.78 | 2674 |
| 15 | Won by the Sword | GMT Games | **78.1** | 0.64 | 0.91 | 1 | 1 | 0.94 | 0.3 | 0.67 | 218 |
| 16 | Commands & Colors Medieval | GMT Games | **76.6** | 0.99 | 0.41 | 0.41 | 1 | 0.85 | 1 | 0.78 | 123 |
| 17 | A Time for Trumpets | GMT Games | **76.4** | 0.92 | 0.18 | 0.71 | 1 | 0.97 | 0.95 | 0.89 | 2044 |
| 18 | Europe Engulfed | GMT Games | **75.6** | 0.16 | 0.8 | 1 | 1 | 0.99 | 1 | 0.78 | 903 |
| 19 | Triumph & Tragedy (2nd Edition) | GMT Games | **75.1** | 0.48 | 1 | 1 | 1 | 0.95 | 0.3 | 0.56 | 199 |
| 20 | Combat Commander: Pacific | GMT Games | **75** | 0.41 | 1 | 1 | 1 | 0.7 | 0.78 | 0.56 | 424 |

### What Makes the Top Modules Exceptional

**Feature prevalence in top 20:**

- CounterDetailViewer: 20/20 (100%)
- HighlightLastMoved: 20/20 (100%)
- Prototypes: 20/20 (100%)
- Zoomer: 20/20 (100%)
- ChartWindow: 18/20 (90%)
- DrawPile: 16/20 (80%)
- Flare: 16/20 (80%)
- NotesWindow: 16/20 (80%)
- Footprint: 14/20 (70%)
- PredefinedSetup: 14/20 (70%)
- MovementMarkable: 12/20 (60%)
- DiceButton: 11/20 (55%)
- LOS: 9/20 (45%)
- PlayerHand: 7/20 (35%)
- GlobalMap: 7/20 (35%)
- Inventory: 7/20 (35%)
- SpecialDiceButton: 6/20 (30%)
- PrivateMap: 5/20 (25%)
- Mat: 4/20 (20%)
- TurnTracker: 3/20 (15%)
- MapShader: 1/20 (5%)

**Common patterns in top modules:**
- Heavy prototype usage (avg reuse ratio > 0.8) — DRY principle
- Rich automation with TriggerAction chains backed by ReportState
- BeanShell expressions for calculated properties and conditional logic
- Full UI complement: Zoomer + CounterDetailViewer + Inventory + TurnTracker

## Bottom 20 "Cautionary Tale" Modules

| Rank | Module | Publisher | Score | Proto | Auto | Report | Eff | Expr | Modern | Complete | Pieces |
|------|--------|-----------|-------|-------|------|--------|-----|------|--------|----------|--------|
| 562 | Espinosa | Multi-Man Publishing | **5** | 0 | 0 | 0 | 0 | 0 | 0 | 0.33 | 67 |
| 561 | Starvation Island | Multi-Man Publishing | **7.6** | 0 | 0 | 0 | 0 | 0.04 | 0.03 | 0.44 | 125 |
| 560 | Vinegar Joe's War | Decision Games | **8.9** | 0 | 0 | 0 | 0 | 0.04 | 0 | 0.56 | 180 |
| 559 | Lords Of The Sierra Madre | Decision Games | **10.8** | 0 | 0 | 0 | 0 | 0.04 | 0.19 | 0.56 | 133 |
| 558 | Price of Freedom | Compass Games | **11.9** | 0 | 0.18 | 0 | 0 | 0 | 0 | 0.56 | 229 |
| 557 | Germania (S&T) | Decision Games | **12.5** | 0 | 0.02 | 0 | 0.48 | 0.04 | 0 | 0.44 | 21 |
| 556 | Justinian | GMT Games | **12.6** | 0 | 0 | 0 | 0.76 | 0 | 0 | 0.33 | 100 |
| 555 | Operation Jubilee: Dieppe, August 1942 | Decision Games | **14.1** | 0 | 0 | 0 | 0 | 0.04 | 0.52 | 0.56 | 52 |
| 554 | Fort Sumter | GMT Games | **14.8** | 0 | 0 | 0 | 0.64 | 0 | 0.34 | 0.33 | 54 |
| 553 | Aspern-Essling | Multi-Man Publishing | **14.9** | 0 | 0 | 0 | 0.76 | 0.04 | 0 | 0.44 | 238 |
| 552 | The Battle Of Armageddon | Compass Games | **16.3** | 0 | 0 | 0 | 0 | 0 | 0.96 | 0.44 | 222 |
| 551 | Dead of winter | GMT Games | **16.5** | 0.02 | 0 | 0 | 0.7 | 0.15 | 0.02 | 0.44 | 568 |
| 550 | Tarawa: Red Beach One | Decision Games | **16.9** | 0 | 0 | 0 | 0 | 0.04 | 0.97 | 0.44 | 66 |
| 549 | Tide at Sunrise | Multi-Man Publishing | **17.2** | 0.01 | 0 | 0 | 1 | 0 | 0.03 | 0.44 | 74 |
| 548 | FAB Sicily | GMT Games | **17.5** | 0.01 | 0.01 | 0 | 1 | 0 | 0.03 | 0.44 | 212 |
| 547 | Clash of Giants III - Gettysburg | GMT Games | **17.8** | 0.01 | 0 | 0 | 1 | 0.04 | 0.19 | 0.33 | 158 |
| 546 | Talavera & Vimeiro | Multi-Man Publishing | **18.2** | 0 | 0 | 0 | 0.76 | 0.04 | 0 | 0.67 | 193 |
| 545 | An Attrition of Souls | Compass Games | **18.3** | 0 | 0 | 0 | 0 | 0.04 | 0.78 | 0.67 | 84 |
| 544 | Fury in the East | Multi-Man Publishing | **18.5** | 0 | 0 | 0 | 1 | 0 | 0.18 | 0.44 | 17 |
| 543 | A Victory Complete | Multi-Man Publishing | **18.7** | 0.05 | 0.01 | 0.05 | 1 | 0 | 0.03 | 0.44 | 122 |

**Common problems in bottom modules:**
- Zero prototypes: every piece defined independently
- No automation: pieces are just images with BasicPiece
- No UI polish: missing Zoomer, CounterDetailViewer, Inventory
- Old VASSAL versions with no modern features
- No expressions: purely manual gameplay

## Anti-Pattern Catalog

### No Prototypes (Copy-Paste Nightmare)

Modules with 20+ pieces but zero prototype definitions. Every piece is independently defined, making updates a nightmare.

| Module | Publisher | Detail |
|--------|-----------|--------|
| Invasion: Norway | GMT Games | 392 pieces, 0 prototypes |
| Price of Freedom | Compass Games | 229 pieces, 0 prototypes |
| The Battle Of Armageddon | Compass Games | 222 pieces, 0 prototypes |
| Vinegar Joe's War | Decision Games | 180 pieces, 0 prototypes |
| Lords Of The Sierra Madre | Decision Games | 133 pieces, 0 prototypes |
| Starvation Island | Multi-Man Publishing | 125 pieces, 0 prototypes |
| An Attrition of Souls | Compass Games | 84 pieces, 0 prototypes |
| Second Fallujah | Compass Games | 67 pieces, 0 prototypes |
| Espinosa | Multi-Man Publishing | 67 pieces, 0 prototypes |
| Tarawa: Red Beach One | Decision Games | 66 pieces, 0 prototypes |
| Operation Jubilee: Dieppe, August 1942 | Decision Games | 52 pieces, 0 prototypes |
| Clontarf | Decision Games | 40 pieces, 0 prototypes |

### No Global Key Commands (No Mass Operations)

Modules with 50+ pieces but zero GKCs. Users must manually manipulate every piece individually.

| Module | Publisher | Detail |
|--------|-----------|--------|
| The War: Pacific_v1.2 | Compass Games | 2406 pieces, 0 GKCs |
| Fatal Alliances DIF | Compass Games | 2297 pieces, 0 GKCs |
| OCS - GBII | Multi-Man Publishing | 1594 pieces, 0 GKCs |
| Absolute Victory | Compass Games | 1521 pieces, 0 GKCs |
| Task Force Carrier Battles in the Pacific | VUCA Simulations | 1491 pieces, 0 GKCs |
| Fatal Alliances | Compass Games | 1469 pieces, 0 GKCs |
| Gathering Storm | GMT Games | 1356 pieces, 0 GKCs |
| A World At War | GMT Games | 1218 pieces, 0 GKCs |
| Great War in Europe | GMT Games | 1171 pieces, 0 GKCs |
| Red Star Rising | Multi-Man Publishing | 1143 pieces, 0 GKCs |
| Gallipoli 1915 | GMT Games | 1074 pieces, 0 GKCs |
| Desert Fox Deluxe (Boxed edition, 2019) | Decision Games | 989 pieces, 0 GKCs |
| Three Days of Gettysburg | GMT Games | 935 pieces, 0 GKCs |
| Down In Flames Series | GMT Games | 826 pieces, 0 GKCs |
| Fall Blau: AGS, June-Dec 1942 | Compass Games | 725 pieces, 0 GKCs |

### Silent Automation (Triggers Without Reporting)

Modules with 5+ TriggerAction traits but zero ReportState traits. Automation happens invisibly with no chat log feedback.

| Module | Publisher | Detail |
|--------|-----------|--------|
| The Hunted: Twilight of the U-Boats 1943-45 | GMT Games | 1 triggers, 0 reports |
| Skies Above Britain | GMT Games | 1 triggers, 0 reports |
| The Spanish Civil War | GMT Games | 1 triggers, 0 reports |
| American Tank Ace | Compass Games | 1 triggers, 0 reports |
| Atlantic Sentinels: North Atlantic Convoy Escort, 1942-43 | Compass Games | 1 triggers, 0 reports |
| British Tank Ace | Compass Games | 1 triggers, 0 reports |
| Europe in Turmoil II: The Interbellum Years 1920-1939 | Compass Games | 1 triggers, 0 reports |
| Fall of Tobruk | Compass Games | 1 triggers, 0 reports |
| La Bataille de France, 1940 | Compass Games | 1 triggers, 0 reports |
| The Last Gamble DSE | Compass Games | 1 triggers, 0 reports |
| Lebensraum | Compass Games | 1 triggers, 0 reports |
| Price of Freedom | Compass Games | 1 triggers, 0 reports |
| Silent War | Compass Games | 1 triggers, 0 reports |
| Silent War2.0 | Compass Games | 1 triggers, 0 reports |
| The War for the Union | Compass Games | 1 triggers, 0 reports |

### Stateless Embellishments (No DynamicProperty)

Modules with many Embellishment layers but zero DynamicProperties. Visual states exist without trackable game state.

| Module | Publisher | Detail |
|--------|-----------|--------|
| SCS Day of Days | Multi-Man Publishing | 5095 embellishments, 0 dynamic properties |
| GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022) | GMT Games | 2362 embellishments, 0 dynamic properties |
| OCS - GBII | Multi-Man Publishing | 1522 embellishments, 0 dynamic properties |
| GBoH II: SPQR Deluxe | GMT Games | 1420 embellishments, 0 dynamic properties |
| Red Strike | VUCA Simulations | 1335 embellishments, 0 dynamic properties |
| Task Force Carrier Battles in the Pacific | VUCA Simulations | 1223 embellishments, 0 dynamic properties |
| Great Battles of Alexander: Deluxe Edition | GMT Games | 1160 embellishments, 0 dynamic properties |
| OCS - Beyond the Rhine | Multi-Man Publishing | 1141 embellishments, 0 dynamic properties |
| SCS Iron Curtain | Multi-Man Publishing | 1039 embellishments, 0 dynamic properties |
| A Victory Awaits | Multi-Man Publishing | 834 embellishments, 0 dynamic properties |
| SCS_It Never Snows | Multi-Man Publishing | 819 embellishments, 0 dynamic properties |
| Balance of Powers | Compass Games | 817 embellishments, 0 dynamic properties |
| LOB - None But Heroes | Multi-Man Publishing | 776 embellishments, 0 dynamic properties |
| OCS - Tunisia II | Multi-Man Publishing | 774 embellishments, 0 dynamic properties |
| Nations in Arms | Compass Games | 724 embellishments, 0 dynamic properties |

### Missing Essential UI (No Zoomer AND No Mouse-Over Viewer)

Modules with 30+ pieces lacking both zoom controls and counter detail viewer. Poor user experience.

*No modules matched this pattern.*

### Trait Bloat Without SubMenu (Menu Overload)

Prototypes with 20+ traits but no SubMenu usage. Right-click menu becomes overwhelming.

| Module | Publisher | Detail |
|--------|-----------|--------|
| The American Revolution: Decision in America , 1775-1782 | Decision Games | 123 traits in "Campaign Markers", no submenus |
| Dominant Species | GMT Games | 73 traits in "Advanced_Tile", no submenus |
| Paths of Glory,[object Object] | GMT Games | 72 traits in "VP Marker", no submenus |
| Labyrinth + Awakening | GMT Games | 66 traits in "Nigeria", no submenus |
| Time of Crisis | GMT Games | 54 traits in "Influence Card Any", no submenus |
| Commands & Colors Samurai Battles | GMT Games | 47 traits in "CommandCard", no submenus |
| Triumph & Tragedy (2nd Edition) | GMT Games | 46 traits in "WildBlock_German", no submenus |
| The Conquistadors | Compass Games | 41 traits in "Conquistadors_Def", no submenus |
| Pendragon | GMT Games | 40 traits in "Event Cards", no submenus |
| A Gest of Robin Hood | GMT Games | 38 traits in "ButtonBuildBalladDeck", no submenus |
| Flashpoint: South China Sea | GMT Games | 37 traits in "Lord Cylinder", no submenus |
| Tank Duel | GMT Games | 35 traits in "Tank Mat Axis", no submenus |
| Congress of Vienna 4-playersgame | GMT Games | 35 traits in "Event Cards", no submenus |
| Liberty or Death (GMT) | GMT Games | 34 traits in "Cards", no submenus |
| Hitler's Reich | GMT Games | 34 traits in "Axis DA", no submenus |

## Quality by Publisher

| Publisher | Modules | Avg Score | Median | Best Module | Best Score |
|----------|---------|-----------|--------|-------------|------------|
| VUCA Simulations | 14 | **50.8** | 52.9 | Traces of Hubris | 62.2 |
| GMT Games | 244 | **46.7** | 44.9 | Flashpoint: South China Sea | 90.9 |
| Compass Games | 156 | **44.6** | 45 | A las Barricades!  -  Second Edition | 85.6 |
| Multi-Man Publishing | 118 | **44** | 43.8 | SCS Day of Days | 78.7 |
| Decision Games | 30 | **32.3** | 30.1 | WWII-PTO (DG) | 73.6 |

## Quality Over Time (by VASSAL Version)

| VASSAL Version | Modules | Avg Quality Score |
|---------------|---------|-------------------|
| 3.1 | 49 | **30** |
| 3.2 | 152 | **37.6** |
| 3.3 | 6 | **43** |
| 3.4 | 20 | **49.6** |
| 3.5 | 37 | **45.8** |
| 3.6 | 109 | **52.1** |
| 3.7 | 162 | **54** |
| unknown | 27 | **24.6** |

## Quality Outliers

Modules scoring much higher or lower than their publisher average.

### Surprisingly HIGH Quality

| Module | Publisher | Score | Publisher Avg | Delta |
|--------|-----------|-------|--------------|-------|
| Flashpoint: South China Sea | GMT Games | 90.9 | 46.7 | +44.2 |
| WWII-PTO (DG) | Decision Games | 73.6 | 32.3 | +41.3 |
| A las Barricades!  -  Second Edition | Compass Games | 85.6 | 44.6 | +41 |
| Prelude to Rebellion | Compass Games | 81.8 | 44.6 | +37.2 |
| Plantagenet | GMT Games | 82.7 | 46.7 | +36 |
| Inferno | GMT Games | 82.4 | 46.7 | +35.7 |
| Nevsky | GMT Games | 82.2 | 46.7 | +35.5 |
| Vietnam 1965-1975 GMT | GMT Games | 81.7 | 46.7 | +35 |
| SCS Day of Days | Multi-Man Publishing | 78.7 | 44 | +34.7 |
| Paths to Hell - Operation Barbarossa, June-December 1941 | Compass Games | 79.1 | 44.6 | +34.5 |

### Surprisingly LOW Quality

| Module | Publisher | Score | Publisher Avg | Delta |
|--------|-----------|-------|--------------|-------|
| Espinosa | Multi-Man Publishing | 5 | 44 | -39 |
| Starvation Island | Multi-Man Publishing | 7.6 | 44 | -36.4 |
| Justinian | GMT Games | 12.6 | 46.7 | -34.1 |
| Price of Freedom | Compass Games | 11.9 | 44.6 | -32.7 |
| Fort Sumter | GMT Games | 14.8 | 46.7 | -31.9 |

## Recommendations for Module Builder

### Features to Strongly Recommend
1. **Prototype usage** — 40%+ of modules have zero or minimal prototypes. The builder should enforce prototype-first design.
2. **CounterDetailViewer** — Essential UX. Auto-include in every module.
3. **Zoomer** — Should be default on every map.
4. **ReportState on automation** — Every TriggerAction should have a corresponding report.
5. **SubMenu for complex pieces** — Any piece with 10+ commands needs menu organization.

### Anti-Patterns to Guard Against
1. **Copy-paste pieces** — Block or warn when adding similar pieces without a shared prototype.
2. **Silent triggers** — Warn when adding TriggerAction without ReportState.
3. **Missing Zoomer/CDV** — Auto-suggest during module creation.
4. **Stateless embellishments** — Suggest DynamicProperty pairing for each Embellishment.
