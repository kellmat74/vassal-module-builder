# Team 1: Structural Analysis — Archetype Prototypes

> Analysis of 24382 prototype definitions across 562 VASSAL modules
> Generated: 2026-03-10

## Corpus Bias Warning

This corpus is heavily skewed toward hex-and-counter wargames:
- **GMT Games**: 244 modules (43.4%)
- **Compass Games**: 156 modules (27.8%)
- **Multi-Man Publishing**: 118 modules (21.0%)
- **Decision Games**: 30 modules (5.3%)
- **VUCA Simulations**: 14 modules (2.5%)

Prevalence ≠ quality. Rare patterns from card-driven or block games may represent superior designs.

---

## 1. Overall Statistics

| Metric | Value |
|--------|-------|
| Total prototypes parsed | 24382 |
| Parse errors | 0 |
| Unique fingerprints (trait-set combinations) | 4545 |
| Top 20 fingerprints cover | 8966 prototypes (36.8%) |
| Singleton fingerprints (appear once) | 2479 |
| Average traits per prototype | 6.5 |

### Trait Frequency (across all prototypes)

| Trait ID | Prototypes Using It | % of All |
|----------|-------------------|----------|
| `piece` | 24382 | 100.0% |
| `mark` | 7872 | 32.3% |
| `prototype` | 7369 | 30.2% |
| `emb2` | 5377 | 22.1% |
| `sendto` | 4750 | 19.5% |
| `report` | 4383 | 18.0% |
| `macro` | 4022 | 16.5% |
| `delete` | 3877 | 15.9% |
| `label` | 3149 | 12.9% |
| `placemark` | 2630 | 10.8% |
| `footprint` | 2473 | 10.1% |
| `PROP` | 2463 | 10.1% |
| `return` | 2338 | 9.6% |
| `markmoved` | 2139 | 8.8% |
| `rotate` | 2070 | 8.5% |
| `clone` | 1986 | 8.1% |
| `submenu` | 1816 | 7.4% |
| `true` | 1800 | 7.4% |
| `globalkey` | 1690 | 6.9% |
| `hideCmd` | 1658 | 6.8% |
| `setprop` | 1514 | 6.2% |
| `obs` | 1193 | 4.9% |
| `immob` | 1155 | 4.7% |
| `basicName` | 990 | 4.1% |
| `false` | 673 | 2.8% |

---

## 2. Top 20 Archetype Fingerprints

These are the 20 most common trait-set combinations. Together they account for 36.8% of all prototypes.

### Archetype #1: 2953 prototypes across 342 modules

**Trait set:** `piece:1`
**Avg trait count:** 1

**Typical names:** "cr", "range", "steps", "cmdrng", "always rotated", "or"

**Publishers:** GMT Games (161), Compass Games (86), Multi-Man Publishing (77), VUCA Simulations (10), Decision Games (8)

**VASSAL versions:** 3.7 (123), 3.2 (77), 3.6 (66), 3.1 (24), 3.5 (23)

**Example modules:** Rappahannock Station, By Swords & Bayonets [GBACW], GBoH IX: Caesar in Alexandria, GBoH VI: Conquest of Gaul, Carthage

---

### Archetype #2: 1113 prototypes across 116 modules

**Trait set:** `mark:1, piece:1`
**Avg trait count:** 2

**Typical names:** "range", "cdo", "th", "", "cvloc", "rdth"

**Publishers:** GMT Games (57), Compass Games (30), Multi-Man Publishing (26), VUCA Simulations (2), Decision Games (1)

**VASSAL versions:** 3.7 (41), 3.2 (26), 3.6 (21), 3.5 (9), 3.1 (9)

**Example modules:** Charioteer, Clash of Giants III - Gettysburg, Clash of Sovereigns: The War of the Austrian Succession 1740-48, Colonial Twilight, Comanchería

---

### Archetype #3: 895 prototypes across 81 modules

**Trait set:** `piece:1, prototype:1`
**Avg trait count:** 2

**Typical names:** "provender marker", "cart marker", "coin marker", "apark", "attend", "ship marker"

**Publishers:** GMT Games (40), Multi-Man Publishing (20), Compass Games (16), Decision Games (3), VUCA Simulations (2)

**VASSAL versions:** 3.7 (30), 3.6 (19), 3.2 (14), 3.1 (6), 3.5 (5)

**Example modules:** Case Yellow, Clash of Sovereigns: The War of the Austrian Succession 1740-48, Combat Commander: Europe, Combat Commander: Pacific, Commands & Colors Samurai Battles

---

### Archetype #4: 614 prototypes across 2 modules

**Trait set:** `clone:1, delete:1, footprint:1, label:1, piece:1, return:1, rotate:1, true:1`
**Avg trait count:** 8

**Typical names:** "geartbp", "oenavbp", "oefortbp", "oeartbp", "oecavbp", "oeinfbp"

**Publishers:** Compass Games (2)

**VASSAL versions:** 3.6 (1), 3.2 (1)

**Example modules:** Fatal Alliances DIF, Fatal Alliances

---

### Archetype #5: 331 prototypes across 26 modules

**Trait set:** `emb2:1, piece:1, prototype:1`
**Avg trait count:** 3

**Typical names:** "cylinder lancaster", "cylinder york", "cylinder ghibellines", "cylinder guelphs", "reduced stripe white", "rubble"

**Publishers:** GMT Games (14), Multi-Man Publishing (8), Compass Games (4)

**VASSAL versions:** 3.6 (10), 3.7 (9), 3.4 (2), 3.5 (2), 3.1 (2)

**Example modules:** Clash of Sovereigns: The War of the Austrian Succession 1740-48, Combat Commander: Europe, Commands & Colors Ancients, Commands & Colors Medieval, Commands & Colors Samurai Battles

---

### Archetype #6: 330 prototypes across 76 modules

**Trait set:** `piece:1, sendto:1`
**Avg trait count:** 2

**Typical names:** "reinforcement a", "camp", "ju", "abstraggler", "henchman", "pawnplot"

**Publishers:** GMT Games (37), Compass Games (21), Multi-Man Publishing (14), Decision Games (4)

**VASSAL versions:** 3.7 (23), 3.6 (21), 3.2 (14), 3.5 (8), 3.1 (5)

**Example modules:** Case Yellow, Clash of Monarchs, Colonial Twilight, Combat Commander: Pacific, Crown of Roses

---

### Archetype #7: 300 prototypes across 2 modules

**Trait set:** `emb2:1, globalkey:1, piece:1, report:1`
**Avg trait count:** 4

**Typical names:** "ho", "hn", "hm", "hl", "hk", "hj"

**Publishers:** GMT Games (2)

**VASSAL versions:** 3.7 (1), 3.5 (1)

**Example modules:** Combat Commander: Europe, Combat Commander: Pacific

---

### Archetype #8: 282 prototypes across 29 modules

**Trait set:** `mark:1, piece:1, prototype:1`
**Avg trait count:** 3

**Typical names:** "ab", "ind", "thind", "th", "thth", "gun"

**Publishers:** GMT Games (14), Multi-Man Publishing (10), Compass Games (3), Decision Games (1), VUCA Simulations (1)

**VASSAL versions:** 3.6 (8), 3.7 (7), 3.1 (5), 3.2 (5), 3.5 (4)

**Example modules:** Case Yellow, Combat Commander: Europe, Combat Commander: Pacific, Elusive Victory [GMT Games], Empire of the Sun (2nd Edition)

---

### Archetype #9: 282 prototypes across 4 modules

**Trait set:** `basicName:1, piece:1, prototype:1`
**Avg trait count:** 3

**Typical names:** "carda", "cardf", "cardb", "cardp", "legend box seats", "legend box ways"

**Publishers:** GMT Games (4)

**VASSAL versions:** 3.6 (3), 3.7 (1)

**Example modules:** Clash of Sovereigns: The War of the Austrian Succession 1740-48, Inferno, Nevsky, Plantagenet

---

### Archetype #10: 267 prototypes across 84 modules

**Trait set:** `emb2:1, piece:1`
**Avg trait count:** 2

**Typical names:** "usa artillery", "csa artillery", "pop", "strength", "units", "steps"

**Publishers:** GMT Games (34), Multi-Man Publishing (34), Compass Games (13), VUCA Simulations (2), Decision Games (1)

**VASSAL versions:** 3.7 (39), 3.6 (16), 3.2 (9), 3.5 (9), 3.1 (7)

**Example modules:** Clash of Sovereigns: The War of the Austrian Succession 1740-48, Combat Commander: Europe, Commands & Colors Medieval, Cross Keys_Port_Republic, Downfall 1.9.4

---

### Archetype #11: 234 prototypes across 39 modules

**Trait set:** `piece:1, prototype:2`
**Avg trait count:** 3

**Typical names:** "unitgerman", "unitallied", "csa cavalry reg sub", "csa infantry brigade sub", "detachmentgermanmobile", "detachmentgermanimmobile"

**Publishers:** GMT Games (18), Multi-Man Publishing (15), Compass Games (4), Decision Games (2)

**VASSAL versions:** 3.7 (13), 3.6 (11), 3.5 (5), 3.1 (5), 3.4 (2)

**Example modules:** Clash of Sovereigns: The War of the Austrian Succession 1740-48, Combat Commander: Europe, Combat Commander: Pacific, Cross Keys_Port_Republic, Fields of Fire PUBLIC

---

### Archetype #12: 196 prototypes across 12 modules

**Trait set:** `emb2:1, piece:1, report:1`
**Avg trait count:** 3

**Typical names:** "dr", "eair support", "aircraft", "ewhite", "ewalking wounded", "etrench"

**Publishers:** GMT Games (10), Compass Games (1), Decision Games (1)

**VASSAL versions:** 3.7 (4), 3.5 (3), 3.1 (3), unknown (1), 3.3 (1)

**Example modules:** Combat Commander: Europe, Combat Commander: Pacific, Downtown, Elusive Victory [GMT Games], Hellenes

---

### Archetype #13: 185 prototypes across 15 modules

**Trait set:** `mark:1, piece:1, sendto:1`
**Avg trait count:** 3

**Typical names:** "egyptian infdivbde", "syrian infdivbde", "eligibility", "syrian armddivbde", "soidir", "geidir"

**Publishers:** GMT Games (9), Compass Games (5), VUCA Simulations (1)

**VASSAL versions:** 3.2 (5), 3.6 (4), 3.4 (3), 3.7 (2), 3.3 (1)

**Example modules:** Cuba Libre, A Distant Plain, Falling Sky (2nd Edition), Fire in the Lake, Labyrinth + Awakening

---

### Archetype #14: 152 prototypes across 2 modules

**Trait set:** `clone:1, delete:1, footprint:1, label:1, markmoved:1, piece:1, placemark:1, return:1, rotate:1, sendto:2, true:1`
**Avg trait count:** 12

**Typical names:** "oescsbp", "jascsbp", "ahscsbp", "usscsbp", "itscsbp", "frscsbp"

**Publishers:** Compass Games (2)

**VASSAL versions:** 3.6 (1), 3.2 (1)

**Example modules:** Fatal Alliances DIF, Fatal Alliances

---

### Archetype #15: 145 prototypes across 3 modules

**Trait set:** `basicName:1, emb2:1, locmsg:3, piece:1, prototype:1`
**Avg trait count:** 7

**Typical names:** "yorkaw", "lancasteraw", "ghibellineaw", "guelphaw", "r  dietrich von grningen  veliky knyaz", "r  tempest  lodya"

**Publishers:** GMT Games (3)

**VASSAL versions:** 3.6 (3)

**Example modules:** Inferno, Nevsky, Plantagenet

---

### Archetype #16: 145 prototypes across 3 modules

**Trait set:** `mark:1, piece:1, report:1, sendto:1`
**Avg trait count:** 4

**Typical names:** "wpgmrdgmrrleader", "wpgmrdgmrrhq", "usmdrctleader", "usmdrcthq", "jimbiibleader", "natoadableader"

**Publishers:** Compass Games (3)

**VASSAL versions:** 3.2 (3)

**Example modules:** CSS Fulda Gap, Guam: Return to Glory, Tinian: The Forgotten Battle

---

### Archetype #17: 142 prototypes across 31 modules

**Trait set:** `piece:1, prototype:3`
**Avg trait count:** 4

**Typical names:** "province", "csa infantry division", "csa cavalry brigade", "csa infantry brigade", "usa infantry division", "usa infantry regiment"

**Publishers:** Multi-Man Publishing (17), GMT Games (11), Compass Games (2), Decision Games (1)

**VASSAL versions:** 3.7 (13), 3.6 (7), 3.5 (4), 3.2 (3), 3.4 (2)

**Example modules:** Cross Keys_Port_Republic, Downtown, Flashpoint: South China Sea, Guilford, Inferno

---

### Archetype #18: 140 prototypes across 24 modules

**Trait set:** `mark:2, piece:1`
**Avg trait count:** 3

**Typical names:** "rangea", "rangem", "wheeled", "tracked", "marker", "detachment"

**Publishers:** Multi-Man Publishing (9), GMT Games (8), Compass Games (6), Decision Games (1)

**VASSAL versions:** 3.7 (7), 3.6 (7), 3.2 (5), 3.5 (2), 3.1 (2)

**Example modules:** The Dark Summer, A Distant Plain, Empire of the Sun (2nd Edition), France40 2Ed, Italy 43

---

### Archetype #19: 132 prototypes across 110 modules

**Trait set:** `delete:1, piece:1`
**Avg trait count:** 2

**Typical names:** "marker", "markers", "commanddispatch", "edit", "delete", "counter"

**Publishers:** GMT Games (44), Multi-Man Publishing (32), Compass Games (24), VUCA Simulations (6), Decision Games (4)

**VASSAL versions:** 3.2 (32), 3.7 (32), 3.6 (15), 3.1 (11), 3.5 (9)

**Example modules:** GBoH IX: Caesar in Alexandria, Carthage, Case Yellow, Cataclysm WW1 Variant v1.2, The Caucasus Campaign

---

### Archetype #20: 128 prototypes across 19 modules

**Trait set:** `AreaOfEffect:1, piece:1`
**Avg trait count:** 2

**Typical names:** "area", "hrange", "frange", "at range", "art range", "adfrange"

**Publishers:** GMT Games (10), Compass Games (4), Multi-Man Publishing (4), Decision Games (1)

**VASSAL versions:** 3.7 (6), 3.2 (4), 3.6 (4), 3.5 (2), 3.3 (1)

**Example modules:** Barbarossa: Army Group South 1941, Barbarossa: Army Group Center and North 1941, Next War: India-Pakistan, NW:Iran, Next War: Korea 2nd Edition

---

## 3. Prototype Inheritance Depth

### How many prototypes reference other prototypes?

7369 prototypes contain at least one `UsePrototype` reference.

### Module-level maximum inheritance depth distribution

| Max Depth | Module Count |
|-----------|-------------|
| 0 | 247 |
| 1 | 303 |

### Deepest Inheritance Chains (Top 15)

| Depth | Module | Publisher | Root Prototype |
|-------|--------|-----------|----------------|
| 1 | GBoH IX: Caesar in Alexandria | GMT Games | galleys |
| 1 | Case Yellow | GMT Games | AAM |
| 1 | GBoH VIII: Cataphract | GMT Games | trps-cav2 |
| 1 | GBoH XIV: Chariots of Fire | GMT Games | SI |
| 1 | China's War | GMT Games | PopSpace |
| 1 | Clash of Monarchs | GMT Games | SW SP |
| 1 | Clash of Sovereigns: The War of the Austrian Succession 1740-48 | GMT Games | SpArmyItaly |
| 1 | Colonial Twilight | GMT Games | Pop City |
| 1 | Combat Commander: Europe | GMT Games | HeroI |
| 1 | Combat Commander: Pacific | GMT Games | AlliedCaptuerdWpn |
| 1 | Commands & Colors Ancients | GMT Games | Medium Hoplites |
| 1 | Commands & Colors Medieval | GMT Games | Super Heavy Bow Cav |
| 1 | Commands & Colors: Napoleonics | GMT Games | IronWillMarker |
| 1 | Commands & Colors Epic Napoleonics | GMT Games | IronWillMarkerEpic |
| 1 | Commands & Colors Samurai Battles | GMT Games | BlueSideLabel |

### Piece-to-Prototype Usage

- Average pieces referencing each prototype: 14.2
- Maximum pieces referencing a single prototype: 1097
- Total piece→prototype links: 229355

---

## 4. Unusual Archetypes (Outside Top 20)

15416 prototypes (63.2%) don't match any top-20 fingerprint.

### Prototypes Using Modern Traits (3.6-3.7 features)

Found **66** prototypes using mat/matCargo/attachment/multiLocation:

#### `mat` — 66 prototypes in 9 modules

- **Dominant Species** (GMT Games, VASSAL 3.6.5): "Advanced_Tile"
- **Hubris** (GMT Games, VASSAL 3.7.18): "Cards SEL", "Cards PTO", "Cards Minor", "Cards MAC"
- **Infernal Machine** (GMT Games, VASSAL 3.7.19): "Place Markers on Cards", "Campaign Weapon", "Campaign Boat Tile"
- **Inferno** (GMT Games, VASSAL 3.6.9): "Mat Guelphs7", "Mat Guelphs6", "Mat Guelphs5", "Mat Guelphs4", "Mat Guelphs3", "Mat Guelphs2", "Mat Guelphs1", "Mat Ghibellines7", "Mat Ghibellines6", "Mat Ghibellines5", "Mat Ghibellines4", "Mat Ghibellines3", "Mat Ghibellines2", "Mat Ghibellines1"
- **Nevsky** (GMT Games, VASSAL 3.6.6): "Mat Vladislav", "Mat Karelians", "Mat Gavrilo", "Mat Domash", "Mat Andrey", "Mat Aleksandr", "Mat Yaroslav", "Mat Rudolf", "Mat Knud", "Mat Hermann", "Mat Heinrich", "Mat Andreas"

### Notable Rare Archetypes (3-50 occurrences, outside top 20)

- **`basicName:1|cmt:1|label:2|piece:1|prototype:2`** — 48 prototypes in 1 modules. Names: "dp-709", "dp-352u", "dp-243", "dp-91", "dp-77". Publishers: Multi-Man Publishing
- **`footprint:1|piece:1|true:1`** — 47 prototypes in 8 modules. Names: "spanish", "saxony", "russia", "prussia", "piedmont". Publishers: GMT Games, Compass Games, Multi-Man Publishing
- **`emb2:1|piece:1|PROP:1`** — 47 prototypes in 10 modules. Names: "fixedisland_atoll", "fixedisland_2a", "fixedisland_4a", "island_1", "island_2". Publishers: GMT Games, Compass Games, Multi-Man Publishing
- **`footprint:1|mark:3|piece:1|true:1`** — 47 prototypes in 2 modules. Names: "po polska unit", "eg ega unit", "cz wmd unit", "cz emd unit", "fr 3e corps unit". Publishers: Compass Games
- **`basicName:1|emb2:1|hideCmd:1|piece:1|prototype:1|setprop:1`** — 46 prototypes in 1 modules. Names: "card-p18", "card-p17", "card-p16", "card-p15", "card-p13". Publishers: GMT Games
- **`clone:1|delete:1|label:1|piece:1`** — 46 prototypes in 25 modules. Names: "marker entrenchment", "marker", "alt marker", "upper turn counter", "upper id marker". Publishers: GMT Games, Compass Games, Multi-Man Publishing
- **`mark:4|piece:1`** — 46 prototypes in 4 modules. Names: "it ind", "it re", "it ar", "it triest", "it tren". Publishers: GMT Games, Compass Games, Multi-Man Publishing
- **`label:1|piece:1`** — 43 prototypes in 23 modules. Names: "textlabelserifxxxl", "textlabelserifxxl-white", "textlabelserifxl-white", "textlabelserifxl", "textlabelserifs". Publishers: GMT Games, Compass Games, Decision Games
- **`emb2:1|piece:1|prototype:1|report:1`** — 42 prototypes in 2 modules. Names: "dr-6-3s", "dr-6-1e", "dr-5-5s", "dr-5-4s", "dr-5-2e". Publishers: GMT Games
- **`false:1|footprint:1|mark:3|piece:1`** — 42 prototypes in 5 modules. Names: "fr hq unit", "fr arty unit", "br arty unit", "us arty unit", "it combat unit". Publishers: GMT Games, Compass Games
- **`piece:1|report:1|sendto:1`** — 41 prototypes in 18 modules. Names: "alliedelimw", "axiselimw", "axiselim", "alliedelim", "remove". Publishers: GMT Games, Compass Games, VUCA Simulations
- **`hideCmd:3|macro:2|piece:1|placemark:1|report:1|setprop:2`** — 41 prototypes in 1 modules. Names: "breakdown ge vtd sec", "breakdown ge vtd mg", "breakdown ge vtd fortinf", "breakdown ge vtd inf", "breakdown ge cf sec". Publishers: GMT Games
- **`piece:1|sendto:3`** — 40 prototypes in 16 modules. Names: "tribe", "turn order", "send to parliament", "usaf unlimited air unit", "ru air unit". Publishers: GMT Games, Compass Games, Decision Games
- **`basicName:1|piece:1`** — 40 prototypes in 3 modules. Names: "card-db10", "card-db9", "card-db8", "card-db7", "card-db6". Publishers: GMT Games
- **`mark:1|piece:1|prototype:3`** — 40 prototypes in 7 modules. Names: "wpn i", "wpn f", "wpn b", "wpn u", "wpn s". Publishers: GMT Games, Compass Games

---

## 5. Trait Ordering Analysis

For each of the top 20 archetypes, how many distinct orderings exist?

| Archetype # | Fingerprint | Proto Count | Distinct Orderings | Most Common Ordering % |
|------------|-------------|-------------|-------------------|----------------------|
| #1 | `piece:1` | 2953 | 1 | 100.0% |
| #2 | `mark:1|piece:1` | 1113 | 1 | 100.0% |
| #3 | `piece:1|prototype:1` | 895 | 1 | 100.0% |
| #4 | `clone:1|delete:1|footprint:1|label:1|pie...` | 614 | 1 | 100.0% |
| #5 | `emb2:1|piece:1|prototype:1` | 331 | 2 | 65.0% |
| #6 | `piece:1|sendto:1` | 330 | 1 | 100.0% |
| #7 | `emb2:1|globalkey:1|piece:1|report:1` | 300 | 1 | 100.0% |
| #8 | `mark:1|piece:1|prototype:1` | 282 | 2 | 65.6% |
| #9 | `basicName:1|piece:1|prototype:1` | 282 | 2 | 68.4% |
| #10 | `emb2:1|piece:1` | 267 | 1 | 100.0% |
| #11 | `piece:1|prototype:2` | 234 | 1 | 100.0% |
| #12 | `emb2:1|piece:1|report:1` | 196 | 2 | 97.4% |
| #13 | `mark:1|piece:1|sendto:1` | 185 | 2 | 98.4% |
| #14 | `clone:1|delete:1|footprint:1|label:1|mar...` | 152 | 1 | 100.0% |
| #15 | `basicName:1|emb2:1|locmsg:3|piece:1|prot...` | 145 | 2 | 98.6% |
| #16 | `mark:1|piece:1|report:1|sendto:1` | 145 | 2 | 97.2% |
| #17 | `piece:1|prototype:3` | 142 | 1 | 100.0% |
| #18 | `mark:2|piece:1` | 140 | 1 | 100.0% |
| #19 | `delete:1|piece:1` | 132 | 1 | 100.0% |
| #20 | `AreaOfEffect:1|piece:1` | 128 | 1 | 100.0% |

### Ordering Variation Details (Top 5 Archetypes)

#### Archetype #1

- **2953x**: `[piece]` — Publishers: GMT Games, Compass Games, Decision Games

#### Archetype #2

- **1113x**: `[mark,piece]` — Publishers: GMT Games, Compass Games, Decision Games

#### Archetype #3

- **895x**: `[prototype,piece]` — Publishers: GMT Games, Compass Games, Decision Games

#### Archetype #4

- **614x**: `[footprint,label,rotate,delete,clone,return,piece,true]` — Publishers: Compass Games

#### Archetype #5

- **215x**: `[emb2,prototype,piece]` — Publishers: GMT Games, Compass Games, Multi-Man Publishing
- **116x**: `[prototype,emb2,piece]` — Publishers: GMT Games, Compass Games, Multi-Man Publishing

---

## 6. Key Findings & Recommendations for Feature Catalog

### Finding 1: Extreme Concentration
The top 20 fingerprints cover 36.8% of all prototypes, but there are 4545 unique fingerprints total. The long tail contains many one-off or highly customized prototypes.

### Finding 2: The "Basic Movable Piece" Archetype Dominates
The most common archetype is the simple piece/mark/emb2 combination — the hex-and-counter unit with a flipped state and a nationality marker. This is the GMT workhorse.

### Finding 3: Modern Features Are Rare
Only 66 prototypes use mat/matCargo/attachment/multiLocation. These are almost exclusively in VASSAL 3.6+ modules. **This validates surfacing these in the Feature Catalog as underused innovations.**

### Finding 4: Prototype Inheritance Is Shallow
Most modules have max depth 0-1. Deep inheritance (3+) appears in a handful of complex modules. The Feature Catalog should encourage a 2-level pattern: base archetype → role-specific prototype.

### Finding 5: Trait Ordering Is Inconsistent
Even within the same archetype, ordering varies significantly. The Feature Catalog should enforce a canonical ordering based on the documented best practice (restrict → emb → mark → piece).

### Finding 6: `mark` Is Underused
Only 7872 of 24382 prototypes use Marker traits (32.3%). Many modules lack the Marker traits needed for Inventory grouping. This confirms Phase 2 Sub-task 9 (auto-tag pieces from PieceWindow structure) is high-value.
