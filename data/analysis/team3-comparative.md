# Team 3 — Comparative Analysis: Game Types & Cross-Pollination

*Generated: 2026-03-10T02:36:21.518Z*

---

## 1. Game Type Classification (562 modules)

Classification is based on structural signals (grid types, trait distributions, deck counts) — NOT module names.

| Game Type | Count | % |
|---|---|---|
| **hex-and-counter** | 260 | 46% |
| **card-driven** | 231 | 41% |
| **area-p2p** | 32 | 6% |
| **square-grid** | 15 | 3% |
| **other** | 14 | 2% |
| **block** | 6 | 1% |
| **naval-air** | 4 | 1% |

**Key finding:** Hex-and-counter dominates at 260 modules (46%), but there are 302 non-hex modules worth studying.

### Publisher Distribution by Game Type

- **hex-and-counter**: GMT Games (106), Multi-Man Publishing (75), Compass Games (56)
- **card-driven**: GMT Games (122), Compass Games (74), Multi-Man Publishing (18)
- **area-p2p**: Multi-Man Publishing (14), Compass Games (13), GMT Games (5)
- **square-grid**: Compass Games (8), GMT Games (4), Multi-Man Publishing (3)
- **other**: Multi-Man Publishing (6), GMT Games (3), Decision Games (3)
- **block**: Compass Games (3), GMT Games (2), Multi-Man Publishing (1)
- **naval-air**: GMT Games (2), Decision Games (1), Multi-Man Publishing (1)

---
## 2. Distinctive Trait Profiles per Game Type

TF-IDF style: traits that are frequent in this cohort relative to others. Ratio = cohort% / other%.

### hex-and-counter (260 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `AreaOfEffect` | 27% | 13% | 2.1x |
| `false` | 23% | 13% | 1.7x |
| `markmoved` | 78% | 47% | 1.6x |
| `rotate` | 65% | 42% | 1.6x |
| `footprint` | 52% | 37% | 1.4x |
| `hide` | 18% | 14% | 1.3x |
| `restrict` | 12% | 9% | 1.3x |
| `clone` | 77% | 68% | 1.1x |
| `true` | 31% | 27% | 1.1x |
| `prototype` | 89% | 85% | 1.0x |

### card-driven (231 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `globalhotkey` | 29% | 8% | 3.5x |
| `return` | 82% | 24% | 3.3x |
| `button` | 46% | 15% | 3.2x |
| `menuSeparator` | 17% | 6% | 2.7x |
| `globalkey` | 66% | 27% | 2.5x |
| `setprop` | 54% | 23% | 2.4x |
| `calcProp` | 16% | 7% | 2.3x |
| `obs` | 80% | 39% | 2.1x |
| `hideCmd` | 52% | 25% | 2.0x |
| `PROP` | 70% | 40% | 1.7x |

### area-p2p (32 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `nonRect` | 19% | 7% | 2.6x |
| `calcProp` | 19% | 10% | 1.8x |
| `setprop` | 44% | 35% | 1.2x |
| `menuSeparator` | 13% | 11% | 1.2x |
| `translate` | 16% | 14% | 1.1x |
| `sendto` | 84% | 77% | 1.1x |
| `mark` | 69% | 66% | 1.0x |
| `macro` | 53% | 53% | 1.0x |
| `piece` | 100% | 100% | 1.0x |
| `report` | 59% | 60% | 1.0x |

### square-grid (15 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `nonRect` | 20% | 7% | 2.7x |
| `submenu` | 53% | 37% | 1.4x |
| `translate` | 20% | 14% | 1.4x |
| `macro` | 73% | 52% | 1.4x |
| `placemark` | 80% | 62% | 1.3x |
| `report` | 73% | 59% | 1.2x |
| `prototype` | 100% | 87% | 1.2x |
| `PROP` | 60% | 52% | 1.1x |
| `label` | 73% | 65% | 1.1x |
| `false` | 20% | 18% | 1.1x |

### other (14 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `clone` | 79% | 72% | 1.1x |
| `piece` | 100% | 100% | 1.0x |
| `true` | 29% | 29% | 1.0x |
| `delete` | 93% | 95% | 1.0x |
| `footprint` | 36% | 44% | 0.8x |
| `markmoved` | 43% | 62% | 0.7x |
| `label` | 43% | 65% | 0.7x |
| `obs` | 36% | 56% | 0.6x |
| `sendto` | 36% | 79% | 0.5x |
| `emb2` | 43% | 96% | 0.4x |

### block (6 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `false` | 50% | 17% | 2.9x |
| `nonRect` | 17% | 8% | 2.2x |
| `obs` | 100% | 55% | 1.8x |
| `restrict` | 17% | 10% | 1.7x |
| `menuSeparator` | 17% | 11% | 1.5x |
| `footprint` | 67% | 44% | 1.5x |
| `report` | 67% | 60% | 1.1x |
| `markmoved` | 67% | 61% | 1.1x |
| `sendto` | 83% | 78% | 1.1x |
| `piece` | 100% | 100% | 1.0x |

### naval-air (4 modules)

| Trait | Cohort % | Others % | Ratio |
|---|---|---|---|
| `submenu` | 75% | 37% | 2.0x |
| `rotate` | 100% | 52% | 1.9x |
| `replace` | 50% | 30% | 1.7x |
| `markmoved` | 100% | 61% | 1.6x |
| `false` | 25% | 18% | 1.4x |
| `clone` | 100% | 72% | 1.4x |
| `label` | 75% | 65% | 1.2x |
| `footprint` | 50% | 44% | 1.1x |
| `emb2` | 100% | 94% | 1.1x |
| `delete` | 100% | 95% | 1.1x |

---
## 3. Complexity by Game Type

| Game Type | N | Avg Traits | Avg Expressions | Avg GKCs | Avg Properties | Avg Macros | Avg Pieces |
|---|---|---|---|---|---|---|---|
| **naval-air** | 4 | 2742 | 17 | 2.3 | 0 | 3 | 496 |
| **area-p2p** | 32 | 2616 | 74 | 13.4 | 12.5 | 109 | 537 |
| **card-driven** | 231 | 2275 | 149 | 56.6 | 15.3 | 67 | 418 |
| **hex-and-counter** | 260 | 2223 | 123 | 26.5 | 6.5 | 33 | 462 |
| **square-grid** | 15 | 1875 | 101 | 2.7 | 1 | 90 | 456 |
| **block** | 6 | 1593 | 129 | 0.8 | 1.3 | 2 | 318 |
| **other** | 14 | 295 | 4 | 0.1 | 0.6 | 0 | 106 |

### Top 10 Most Automated Modules (any type)

| Module | Type | Expressions | GKCs | Macros | Publisher |
|---|---|---|---|---|---|
| SCS Day of Days | hex-and-counter | 7813 | 663 | 0 | Multi-Man Publishing |
| Western Front Ace | area-p2p | 33 | 26 | 2759 | Compass Games |
| Steel Wolves | card-driven | 95 | 1479 | 410 | Compass Games |
| Wild Blue Yonder | card-driven | 1495 | 720 | 493 | GMT Games |
| Fields of Fire PUBLIC | card-driven | 259 | 13 | 2090 | GMT Games |
| OCS - CB & GBII | hex-and-counter | 1589 | 853 | 0 | Multi-Man Publishing |
| OCS - Ostfront | card-driven | 1413 | 800 | 0 | Multi-Man Publishing |
| OCS - The Third Winter | hex-and-counter | 1235 | 611 | 0 | Multi-Man Publishing |
| Silent War 2.0 + IJN | card-driven | 672 | 584 | 136 | Compass Games |
| Operation Mercury | hex-and-counter | 1037 | 204 | 517 | GMT Games |

---
## 4. Cross-Pollination Opportunities

Traits with high usage in one cohort but low in another — where the pattern would likely be useful.

| Trait | High in | % | Low in | % | Gap |
|---|---|---|---|---|---|
| `prototype` | square-grid | 100% | other | 21% | 79pp |
| `rotate` | naval-air | 100% | other | 21% | 79pp |
| `obs` | block | 100% | naval-air | 25% | 75pp |
| `return` | card-driven | 82% | other | 7% | 75pp |
| `clone` | naval-air | 100% | block | 33% | 67pp |
| `placemark` | square-grid | 80% | other | 14% | 66pp |
| `immob` | card-driven | 80% | other | 14% | 65pp |
| `mark` | card-driven | 81% | other | 21% | 59pp |
| `report` | square-grid | 73% | other | 14% | 59pp |
| `emb2` | square-grid | 100% | other | 43% | 57pp |
| `markmoved` | naval-air | 100% | other | 43% | 57pp |
| `macro` | square-grid | 73% | block | 17% | 57pp |
| `submenu` | naval-air | 75% | area-p2p | 19% | 56pp |
| `PROP` | card-driven | 70% | other | 14% | 55pp |
| `sendto` | card-driven | 91% | other | 36% | 55pp |
| `globalkey` | card-driven | 66% | square-grid | 13% | 53pp |
| `setprop` | card-driven | 54% | other | 7% | 47pp |
| `false` | block | 50% | other | 7% | 43pp |
| `label` | naval-air | 75% | block | 33% | 42pp |
| `footprint` | block | 67% | area-p2p | 25% | 42pp |

### Actionable Cross-Pollination Recommendations

**`rotate`** (naval-air 100% → other 21%): FreeRotator is essential for naval/air games (facing matters). Hex wargames with ZOC or directional combat could use rotation to indicate unit facing instead of separate embellishment layers.

**`obs`** (block 100% → naval-air 25%): Obscurable (fog-of-war) is the signature trait of block games but rare in hex games. Hex wargames with hidden unit mechanics (e.g., inverted counters) should use obs instead of manual image-swapping embellishments.

**`return`** (card-driven 82% → other 7%): ReturnToDeck enables card cycling and discard mechanics. Area-movement games with event decks could benefit from proper deck management instead of ad-hoc piece movement.

---
## 5. Minority Cohort Deep Dives

### card-driven (231 modules)

#### OCS - Ostfront
- **Publisher:** Multi-Man Publishing | **VASSAL:** 3.7.15
- **Pieces:** 3121 | **Draw Piles:** 9 | **Prototypes:** 85
- **Automation:** 1413 expressions, 800 GKCs, 0 macros
- **Top traits:** `prototype`(3845), `piece`(3206), `emb2`(3028), `sendto`(1591), `globalkey`(799), `mark`(765), `placemark`(179), `AreaOfEffect`(112)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)

#### Fields of Fire PUBLIC
- **Publisher:** GMT Games | **VASSAL:** 3.7.16
- **Pieces:** 2990 | **Draw Piles:** 66 | **Prototypes:** 616
- **Automation:** 259 expressions, 13 GKCs, 2090 macros
- **Top traits:** `prototype`(7024), `piece`(3593), `macro`(2090), `replace`(1697), `placemark`(394), `submenu`(306), `label`(265), `delete`(224)
- **Sample expressions:**
  - `{Pinned ==1}` (beanshell)
  - `{Pinned ==1}` (beanshell)
  - `{Pinned ==1}` (beanshell)

#### Wild Blue Yonder
- **Publisher:** GMT Games | **VASSAL:** 3.4.12
- **Pieces:** 1022 | **Draw Piles:** 6 | **Prototypes:** 49
- **Automation:** 1495 expressions, 720 GKCs, 493 macros
- **Top traits:** `prototype`(1191), `piece`(1066), `mark`(750), `macro`(493), `globalkey`(340), `emb2`(260), `setprop`(234), `delete`(221)
- **Sample expressions:**
  - `{PlayerSide == "Allied\/Blue Player IV" && CurrentMap == "Unit Control"}` (beanshell)
  - `{PlayerSide == "Allied\/Blue Player III" && CurrentMap == "Unit Control"}` (beanshell)
  - `{PlayerSide == "Allied\/Blue Player II" && CurrentMap == "Unit Control"}` (beanshell)

#### TDP Balkans
- **Publisher:** Compass Games | **VASSAL:** 3.6.19
- **Pieces:** 2019 | **Draw Piles:** 13 | **Prototypes:** 290
- **Automation:** 494 expressions, 19 GKCs, 55 macros
- **Top traits:** `prototype`(6402), `piece`(2309), `emb2`(1534), `mark`(1058), `report`(278), `placemark`(178), `footprint`(127), `false`(99)
- **Sample expressions:**
  - `{Moved==true}` (beanshell)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$oldLocation$: $newPieceName$ was eliminated` (oldstyle)

#### Barbarossa: Army Group Center and North 1941
- **Publisher:** GMT Games | **VASSAL:** 3.6.7
- **Pieces:** 4816 | **Draw Piles:** 19 | **Prototypes:** 133
- **Automation:** 455 expressions, 4 GKCs, 31 macros
- **Top traits:** `piece`(4949), `emb2`(2598), `prototype`(696), `label`(609), `submenu`(242), `sendto`(121), `AreaOfEffect`(89), `placemark`(89)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)

### block (6 modules)

#### High Seas Fleet
- **Publisher:** Compass Games | **VASSAL:** 3.7.15
- **Pieces:** 293 | **Draw Piles:** 2 | **Prototypes:** 3
- **Automation:** 657 expressions, 1 GKCs, 0 macros
- **Top traits:** `sendto`(1257), `placemark`(460), `piece`(296), `obs`(282), `prototype`(275), `submenu`(164), `emb2`(21), `delete`(8)
- **Sample expressions:**
  - `{"Entente Ship Yard"}` (beanshell)
  - `{"Entente Shipyard"}` (beanshell)
  - `The $oldPieceName$ is under repair in $location$` (oldstyle)

#### Manoeuvre
- **Publisher:** GMT Games | **VASSAL:** 3.1.0-beta1
- **Pieces:** 1051 | **Draw Piles:** 20 | **Prototypes:** 4
- **Automation:** 6 expressions, 3 GKCs, 0 macros
- **Top traits:** `piece`(1055), `obs`(960), `emb2`(65), `sendto`(8), `delete`(2), `mark`(2), `report`(2), `return`(2)
- **Sample expressions:**
  - `$playerSide$ sends $oldPieceName$ $oldLocation$ to $menuCommand$ *` (oldstyle)
  - `$playerSide$ flips $oldPieceName$ $oldLocation$ to $newPieceName$ *` (oldstyle)
  - `$LocationName$` (oldstyle)

#### Schutztruppe_Heia Safari_1914-18 (2024)
- **Publisher:** Compass Games | **VASSAL:** 3.7.15
- **Pieces:** 429 | **Draw Piles:** 0 | **Prototypes:** 27
- **Automation:** 46 expressions, 0 GKCs, 10 macros
- **Top traits:** `prototype`(844), `piece`(431), `obs`(235), `emb2`(44), `immob`(41), `hideCmd`(32), `menuSeparator`(29), `sendto`(14)
- **Sample expressions:**
  - `{BasicName=="NLPlacemarker"}` (beanshell)
  - `{BasicName=="CombatPlacemarker"}` (beanshell)
  - `{BasicName=="DRMarker"}` (beanshell)

#### The Late Unpleasantness:If it takes all Summer
- **Publisher:** Compass Games | **VASSAL:** 3.6.5
- **Pieces:** 79 | **Draw Piles:** 1 | **Prototypes:** 4
- **Automation:** 58 expressions, 1 GKCs, 0 macros
- **Top traits:** `piece`(83), `prototype`(74), `nonRect`(73), `obs`(72), `report`(72), `emb2`(59), `sendto`(2), `delete`(1)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `{"Eliminated Units"}` (beanshell)
  - `{"Eliminated Units"}` (beanshell)

#### OCS - Reluctant Enemies
- **Publisher:** Multi-Man Publishing | **VASSAL:** 3.2.15
- **Pieces:** 4 | **Draw Piles:** 2 | **Prototypes:** 4
- **Automation:** 8 expressions, 0 GKCs, 0 macros
- **Top traits:** `piece`(8), `delete`(6), `label`(6), `markmoved`(3), `obs`(3), `clone`(2), `footprint`(2), `sendto`(2)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)

### naval-air (4 modules)

#### GBoH II: SPQR Deluxe
- **Publisher:** GMT Games | **VASSAL:** 3.6.7
- **Pieces:** 1768 | **Draw Piles:** 0 | **Prototypes:** 33
- **Automation:** 44 expressions, 6 GKCs, 0 macros
- **Top traits:** `prototype`(3293), `piece`(1792), `emb2`(1420), `rotate`(1356), `mark`(36), `label`(33), `placemark`(33), `delete`(13)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)

#### Front Toward Enemy
- **Publisher:** Multi-Man Publishing | **VASSAL:** 3.2.17
- **Pieces:** 95 | **Draw Piles:** 1 | **Prototypes:** 12
- **Automation:** 15 expressions, 3 GKCs, 11 macros
- **Top traits:** `piece`(107), `prototype`(78), `placemark`(49), `emb2`(42), `rotate`(31), `sendto`(16), `macro`(11), `submenu`(8)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `{ObscuredToOthers=="true"}` (beanshell)
  - `$pieceName$ ($label$)` (oldstyle)

#### Rappahannock Station
- **Publisher:** GMT Games | **VASSAL:** 3.7.18
- **Pieces:** 80 | **Draw Piles:** 3 | **Prototypes:** 11
- **Automation:** 6 expressions, 0 GKCs, 0 macros
- **Top traits:** `emb2`(91), `piece`(91), `delete`(72), `clone`(28), `rotate`(23), `submenu`(10), `markmoved`(8), `prototype`(6)
- **Sample expressions:**
  - `$pieceName$ ` (oldstyle)
  - `$pieceName$ ` (oldstyle)
  - `$pieceName$ ` (oldstyle)

#### Clontarf
- **Publisher:** Decision Games | **VASSAL:** 3.6.3
- **Pieces:** 40 | **Draw Piles:** 0 | **Prototypes:** 0
- **Automation:** 2 expressions, 0 GKCs, 0 macros
- **Top traits:** `clone`(40), `piece`(40), `delete`(37), `markmoved`(35), `rotate`(32), `sendto`(28), `emb2`(3)
- **Sample expressions:**
  - `** $name$ = $result$ *** &lt;$PlayerName$&gt;` (oldstyle)
  - `$LocationName$` (oldstyle)

### area-p2p (32 modules)

#### Western Front Ace
- **Publisher:** Compass Games | **VASSAL:** 3.7.4
- **Pieces:** 3912 | **Draw Piles:** 2 | **Prototypes:** 69
- **Automation:** 33 expressions, 26 GKCs, 2759 macros
- **Top traits:** `piece`(3980), `macro`(2759), `emb2`(2164), `hideCmd`(1839), `nonRect2`(1071), `sendto`(240), `prototype`(135), `PROP`(36)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)

#### GTS The Greatest Day
- **Publisher:** Multi-Man Publishing | **VASSAL:** 3.7.14
- **Pieces:** 3321 | **Draw Piles:** 1 | **Prototypes:** 747
- **Automation:** 314 expressions, 27 GKCs, 73 macros
- **Top traits:** `prototype`(6405), `piece`(4067), `emb2`(1834), `mark`(895), `ratings`(617), `label`(142), `PROP`(128), `macro`(73)
- **Sample expressions:**
  - `{GlobalPropertyName}` (beanshell)
  - `{GetProperty($DefenceOverlay$-$DefenceType$)}` (mixed)
  - `{If(GetProperty("Overlay-Utah")=="2","Utah Planned","Utah Actual")}` (beanshell)

#### Europe Engulfed
- **Publisher:** GMT Games | **VASSAL:** 3.7.20
- **Pieces:** 903 | **Draw Piles:** 0 | **Prototypes:** 52
- **Automation:** 1205 expressions, 87 GKCs, 519 macros
- **Top traits:** `prototype`(1547), `mark`(1217), `piece`(949), `PROP`(822), `label`(576), `macro`(519), `report`(375), `sendto`(351)
- **Sample expressions:**
  - `{((Side == "Axis" && Freeze == "true" && Strength > 1 && Nation != "Finland") ? "true" \: "false")}` (beanshell)
  - `{FreezeCheck == "true"}` (beanshell)
  - `{cost_cadre}` (beanshell)

#### The Greatest Day: Sword, Juno and Gold Beaches
- **Publisher:** Multi-Man Publishing | **VASSAL:** 3.6.7
- **Pieces:** 1635 | **Draw Piles:** 1 | **Prototypes:** 423
- **Automation:** 97 expressions, 18 GKCs, 28 macros
- **Top traits:** `prototype`(3343), `piece`(2057), `emb2`(1014), `mark`(504), `ratings`(236), `report`(54), `PROP`(40), `immob`(31)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `Weather: $Weather$ Daily Air Allocation: $Air-Allocation$` (oldstyle)

#### GBoH Interactive Map
- **Publisher:** GMT Games | **VASSAL:** 3.7.18
- **Pieces:** 437 | **Draw Piles:** 0 | **Prototypes:** 1
- **Automation:** 77 expressions, 154 GKCs, 0 macros
- **Top traits:** `mark`(2302), `piece`(438), `emb2`(436), `prototype`(427)
- **Sample expressions:**
  - `{War Elephant or SPQR Deluxe}` (beanshell)
  - `{Barbarian}` (beanshell)
  - `{Africanus SPQR Deluxe}` (beanshell)

### square-grid (15 modules)

#### Wing Leader
- **Publisher:** GMT Games | **VASSAL:** 3.5.7
- **Pieces:** 1171 | **Draw Piles:** 0 | **Prototypes:** 50
- **Automation:** 790 expressions, 11 GKCs, 53 macros
- **Top traits:** `piece`(1216), `replace`(1113), `emb2`(881), `PROP`(808), `prototype`(490), `macro`(53), `label`(24), `placemark`(18)
- **Sample expressions:**
  - `{GetProperty("Sun Arc")=="Left Horizon"}` (beanshell)
  - `{GetProperty("Sun Arc")=="Left Upper"}` (beanshell)
  - `{GetProperty("Sun Arc")=="Above"}` (beanshell)

#### American Tank Ace
- **Publisher:** Compass Games | **VASSAL:** 3.6.14
- **Pieces:** 1605 | **Draw Piles:** 0 | **Prototypes:** 33
- **Automation:** 139 expressions, 2 GKCs, 681 macros
- **Top traits:** `piece`(1637), `macro`(681), `emb2`(444), `hideCmd`(340), `prototype`(289), `sendto`(176), `replace`(160), `immob`(121)
- **Sample expressions:**
  - `{CurrentZone=="Load"||CurrentZone=="Used"}` (beanshell)
  - `{CurrentZone=="Ready"||CurrentZone=="Used"}` (beanshell)
  - `{CurrentZone=="Ready"}` (beanshell)

#### British Tank Ace
- **Publisher:** Compass Games | **VASSAL:** 3.7.18
- **Pieces:** 1112 | **Draw Piles:** 0 | **Prototypes:** 53
- **Automation:** 275 expressions, 7 GKCs, 181 macros
- **Top traits:** `piece`(1164), `placemark`(612), `hideCmd`(511), `emb2`(243), `prototype`(193), `macro`(181), `submenu`(170), `sendto`(163)
- **Sample expressions:**
  - `{RandomEvent==5}` (beanshell)
  - `{RandomEvent==4}` (beanshell)
  - `{RandomEvent==3}` (beanshell)

#### Down In Flames Series
- **Publisher:** GMT Games | **VASSAL:** 3.2.15
- **Pieces:** 826 | **Draw Piles:** 2 | **Prototypes:** 15
- **Automation:** 4 expressions, 0 GKCs, 364 macros
- **Top traits:** `prototype`(954), `piece`(841), `emb2`(374), `delete`(365), `macro`(364), `button`(20), `label`(16), `submenu`(9)
- **Sample expressions:**
  - `$PlayerSide$ $BasicName$ is damaged` (oldstyle)
  - `$PlayerSide$ $BasicName$ is shot down` (oldstyle)
  - `$LocationName$` (oldstyle)

#### Gringo
- **Publisher:** GMT Games | **VASSAL:** 3.1.18
- **Pieces:** 528 | **Draw Piles:** 3 | **Prototypes:** 16
- **Automation:** 1 expressions, 1 GKCs, 0 macros
- **Top traits:** `emb2`(575), `piece`(544), `placemark`(29), `submenu`(22), `delete`(16), `markmoved`(12), `prototype`(9), `clone`(4)
- **Sample expressions:**
  - `$LocationName$` (oldstyle)

### other (14 modules)

#### Samurai
- **Publisher:** GMT Games | **VASSAL:** 3.1.4
- **Pieces:** 462 | **Draw Piles:** 1 | **Prototypes:** 5
- **Automation:** 6 expressions, 2 GKCs, 0 macros
- **Top traits:** `piece`(459), `emb2`(125), `label`(4), `rotate`(4), `footprint`(3), `true`(3), `delete`(2), `mark`(1)
- **Sample expressions:**
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)

#### Blitz! A World In Conflict
- **Publisher:** Compass Games | **VASSAL:** 3.6.2
- **Pieces:** 366 | **Draw Piles:** 0 | **Prototypes:** 13
- **Automation:** 2 expressions, 0 GKCs, 0 macros
- **Top traits:** `piece`(379), `prototype`(232), `sendto`(26), `delete`(12), `rotate`(11), `markmoved`(10), `clone`(1)
- **Sample expressions:**
  - `$LocationName$` (oldstyle)
  - `** $name$ = $result$ *** <$PlayerName$>` (oldstyle)

#### Vinegar Joe's War
- **Publisher:** Decision Games | **VASSAL:** 
- **Pieces:** 180 | **Draw Piles:** 0 | **Prototypes:** 0
- **Automation:** 2 expressions, 0 GKCs, 0 macros
- **Top traits:** `piece`(178), `delete`(156), `emb2`(66), `clone`(1), `markmoved`(1)
- **Sample expressions:**
  - `** $name$ = $result$ *** <$playerName$>` (oldstyle)
  - `$LocationName$` (oldstyle)

#### Zeppelin Raider
- **Publisher:** Compass Games | **VASSAL:** 3.2.17
- **Pieces:** 89 | **Draw Piles:** 0 | **Prototypes:** 3
- **Automation:** 7 expressions, 0 GKCs, 0 macros
- **Top traits:** `piece`(92), `emb2`(33), `immob`(22), `button`(20), `PROP`(17), `setprop`(13), `prototype`(10), `label`(5)
- **Sample expressions:**
  - `Rank adjusted to $newPieceName$` (oldstyle)
  - `$pieceName$ ($label$)` (oldstyle)
  - `Rank adjusted to $newPieceName$` (oldstyle)

#### Starvation Island
- **Publisher:** Multi-Man Publishing | **VASSAL:** 3.1.20
- **Pieces:** 125 | **Draw Piles:** 0 | **Prototypes:** 0
- **Automation:** 2 expressions, 0 GKCs, 0 macros
- **Top traits:** `piece`(110), `clone`(3), `delete`(2), `emb2`(2)
- **Sample expressions:**
  - `** $name$ = $result$ *** <$playerName$>` (oldstyle)
  - `$LocationName$` (oldstyle)

---
## 6. VASSAL Version Distribution by Game Type

| Game Type | N | Avg Version | % v3.7+ | % v3.6 | % pre-3.6 | New Feature Users |
|---|---|---|---|---|---|---|
| **naval-air** | 4 | 3.53 | 25% | 50% | 25% | 0 |
| **card-driven** | 231 | 3.48 | 32% | 22% | 46% | 11 |
| **square-grid** | 15 | 3.48 | 33% | 25% | 42% | 0 |
| **hex-and-counter** | 260 | 3.44 | 30% | 17% | 52% | 8 |
| **area-p2p** | 32 | 3.44 | 28% | 25% | 47% | 0 |
| **block** | 6 | 3.43 | 33% | 17% | 50% | 0 |
| **other** | 14 | 3.29 | 0% | 27% | 73% | 0 |

### Modules Using 3.6-3.7 Features (Mat, Attachment, MultiLocation)

- **Dominant Species** (card-driven): `mat` — GMT Games
- **Hubris** (card-driven): `mat` — GMT Games
- **Infernal Machine** (card-driven): `mat` — GMT Games
- **Inferno** (card-driven): `mat` — GMT Games
- **Nevsky** (card-driven): `mat` — GMT Games
- **Plantagenet** (card-driven): `mat` — GMT Games
- **Seas of Thunder** (card-driven): `mat` — GMT Games
- **Virgin Queen** (card-driven): `mat` — GMT Games
- **End of Empire** (hex-and-counter): `mat` — Compass Games
- **Stellar Horizons 2: Galatic Frontier** (card-driven): `mat` — Compass Games
- **The Third World War** (card-driven): `mat` — Compass Games
- **Mirages '40 '41** (hex-and-counter): `mat` — VUCA Simulations
- **BCS-Arracourt** (hex-and-counter): `mat` — Multi-Man Publishing
- **BCS-Baptism_by_Fire** (card-driven): `mat` — Multi-Man Publishing
- **BCS-Brazen Chariots** (hex-and-counter): `mat` — Multi-Man Publishing
- **BCS-Inflection Point** (hex-and-counter): `mat` — Multi-Man Publishing
- **BCS-Last Blitzkrieg** (hex-and-counter): `mat` — Multi-Man Publishing
- **BCS-Panzers Last Stand** (hex-and-counter): `mat` — Multi-Man Publishing
- **BCS-Valley of Tears** (hex-and-counter): `mat` — Multi-Man Publishing

---
## 7. Top 5 Most Sophisticated Modules per Game Type

Scored by: traits + expressions*5 + GKCs*10 + macros*3

### hex-and-counter

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| SCS Day of Days | Multi-Man Publishing | 67404 | 21709 | 7813 | 663 |
| OCS - CB & GBII | Multi-Man Publishing | 31204 | 14729 | 1589 | 853 |
| OCS - The Third Winter | Multi-Man Publishing | 22107 | 9822 | 1235 | 611 |
| A Time for Trumpets | GMT Games | 19835 | 12945 | 802 | 144 |
| GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022) | GMT Games | 19753 | 18128 | 203 | 61 |

### area-p2p

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| Western Front Ace | Compass Games | 25045 | 16343 | 33 | 26 |
| GTS The Greatest Day | Multi-Man Publishing | 20866 | 18807 | 314 | 27 |
| Europe Engulfed | GMT Games | 16590 | 8138 | 1205 | 87 |
| The Greatest Day: Sword, Juno and Gold Beaches | Multi-Man Publishing | 10305 | 9556 | 97 | 18 |
| GBoH Interactive Map | GMT Games | 5966 | 4041 | 77 | 154 |

### card-driven

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| OCS - Ostfront | Multi-Man Publishing | 32082 | 17017 | 1413 | 800 |
| Fields of Fire PUBLIC | GMT Games | 27539 | 19844 | 259 | 13 |
| Steel Wolves | Compass Games | 23249 | 6754 | 95 | 1479 |
| Wild Blue Yonder | GMT Games | 22685 | 6531 | 1495 | 720 |
| Silent War 2.0 + IJN | Compass Games | 18003 | 8395 | 672 | 584 |

### square-grid

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| Wing Leader | GMT Games | 10092 | 5873 | 790 | 11 |
| American Tank Ace | Compass Games | 8665 | 5907 | 139 | 2 |
| British Tank Ace | Compass Games | 6741 | 4753 | 275 | 7 |
| Down In Flames Series | GMT Games | 4913 | 3801 | 4 | 0 |
| Gringo | GMT Games | 1773 | 1758 | 1 | 1 |

### block

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| High Seas Fleet | Compass Games | 6652 | 3357 | 657 | 1 |
| Manoeuvre | GMT Games | 3215 | 3155 | 6 | 3 |
| Schutztruppe_Heia Safari_1914-18 (2024) | Compass Games | 2650 | 2390 | 46 | 0 |
| The Late Unpleasantness:If it takes all Summer | Compass Games | 898 | 598 | 58 | 1 |
| OCS - Reluctant Enemies | Multi-Man Publishing | 85 | 45 | 8 | 0 |

### naval-air

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| GBoH II: SPQR Deluxe | GMT Games | 10073 | 9793 | 44 | 6 |
| Front Toward Enemy | Multi-Man Publishing | 627 | 489 | 15 | 3 |
| Rappahannock Station | GMT Games | 462 | 432 | 6 | 0 |
| Clontarf | Decision Games | 265 | 255 | 2 | 0 |

### other

| Module | Publisher | Score | Traits | Exprs | GKCs |
|---|---|---|---|---|---|
| Samurai | GMT Games | 1110 | 1060 | 6 | 2 |
| Blitz! A World In Conflict | Compass Games | 1060 | 1050 | 2 | 0 |
| Vinegar Joe's War | Decision Games | 590 | 580 | 2 | 0 |
| Zeppelin Raider | Compass Games | 346 | 311 | 7 | 0 |
| Starvation Island | Multi-Man Publishing | 237 | 227 | 2 | 0 |

---
## 8. Key Findings & Recommendations for Feature Catalog


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
