# Team 2: Behavioral Analysis — Game Logic & Automation

*Analysis of 562 VASSAL modules from corpus database*
*Generated: 2026-03-10T02:36:28.043Z*

---

## Task 1: Expression Template Extraction

Total expressions analyzed: **71,218**

Unique templates: **11,258**

### Top 50 Expression Templates

| Rank | Count | Template | Concept | Example |
|------|-------|----------|---------|---------|
| 1 | 6,247 | `{<STR>}` | String literal / label | `{"All Fire Markers cleared from all pieces"}` |
| 2 | 5,127 | `<$PROP$> (<$PROP$>)` | General logic | `$pieceName$ ($label$)` |
| 3 | 4,770 | `{Formation==<STR>}` | String literal / label | `{Formation=="Echelon Units"}` |
| 4 | 2,416 | `<$PROP$>` | General logic | `$LocationName$` |
| 5 | 2,006 | `{Div==<STR>}` | String literal / label | `{Div=="22.Pz"}` |
| 6 | 1,986 | `<$PROP$>: <$PROP$> to Graveyard *` | General logic | `$location$: $newPieceName$ to Graveyard *` |
| 7 | 836 | `{DeckName==<STR>}` | Deck membership test | `{DeckName=="FLN Guerrillas"}` |
| 8 | 820 | `<$PROP$> (<$PROP$>)<$PROP$>` | General logic | `$pieceName$ ($label$)$label$` |
| 9 | 763 | `{Random(<N>)}` | General logic | `{Random(6)}` |
| 10 | 569 | `{Formation ==<STR>}` | String literal / label | `{Formation =="WN StP"}` |
| 11 | 556 | `{CurrentZone!=<STR>}` | Location/zone check | `{CurrentZone!="Start Space"}` |
| 12 | 539 | `{Division==<STR>}` | String literal / label | `{Division=="WG5PzD-A"}` |
| 13 | 526 | `{BasicName==<STR>}` | Piece identity | `{BasicName=="Afrika HQ"}` |
| 14 | 504 | `{GetProperty(<STR>)==<N>}` | Property comparison | `{GetProperty("InspiredTokenSide")==2}` |
| 15 | 477 | `{ActivateUnit_Active==false}` | General logic | `{ActivateUnit_Active==false}` |
| 16 | 471 | `{<$PROP$>}` | General logic | `{$CurrentZone$}` |
| 17 | 455 | `{CurrentZone==<STR>}` | Location/zone check | `{CurrentZone=="Current Event"}` |
| 18 | 442 | `{Group==<STR>}` | String literal / label | `{Group=="Z"}` |
| 19 | 359 | `{GetProperty(<STR>)}` | Property comparison | `{GetProperty("BlueReportSide")}` |
| 20 | 356 | `<$PROP$>: <$PROP$> was eliminated` | General logic | `$oldLocation$: $newPieceName$ was eliminated` |
| 21 | 353 | `{LocationName}` | Location/zone check | `{LocationName}` |
| 22 | 338 | `<$PROP$> Attack Support changed decrease,<$PROP$> Attack Sup` | Combat values | `$newPieceName$ Attack Support changed decrease,$newPieceName$ Attack Support cha` |
| 23 | 336 | `{CurrentMap==<STR>}` | Map location check | `{CurrentMap=="Prussian Hand"}` |
| 24 | 320 | `<$PROP$>: <$PROP$> Graveyard *` | General logic | `$location$: $newPieceName$ Graveyard *` |
| 25 | 310 | `{Corps==<STR>}` | String literal / label | `{Corps=="Echelon Units"}` |
| 26 | 310 | `{Formation==<STR>\|\|Div_Number==<STR>}` | String literal / label | `{Formation=="Dio\/2\/DB"\|\|Div_Number=="Dio\/2\/DB"}` |
| 27 | 305 | `{OrderState}` | General logic | `{OrderState}` |
| 28 | 286 | `<$PROP$>: <$PROP$><STR>Flip` | String literal / label | `$location$: $newPieceName$"!"Flip` |
| 29 | 270 | `{OnMainMap!=<N>}` | General logic | `{OnMainMap!=1}` |
| 30 | 263 | `{StatusStielhandgranate==<N>}` | General logic | `{StatusStielhandgranate==1}` |
| 31 | 237 | `** <$PROP$> = <$PROP$> *** <<$PROP$>>` | General logic | `** $name$ = $result$ *** <$PlayerName$>` |
| 32 | 229 | `<$PROP$>: <$PROP$> *` | General logic | `$location$: $newPieceName$ *` |
| 33 | 227 | `{StatusKAR9<N>K==<N>}` | General logic | `{StatusKAR98K==1}` |
| 34 | 218 | `{Side_Level}` | General logic | `{Side_Level}` |
| 35 | 198 | `{CurrentMap!=<STR>}` | Map location check | `{CurrentMap!="Main Map"}` |
| 36 | 197 | `{<$PROP$>==<N>}` | General logic | `{$gpScenario$==6}` |
| 37 | 179 | `{CurrentBoard}` | General logic | `{CurrentBoard}` |
| 38 | 160 | `<$PROP$>: <$PROP$> <STR>Flip` | String literal / label | `$location$: $newPieceName$ "!"Flip` |
| 39 | 158 | `{-<N>}` | General logic | `{-1}` |
| 40 | 151 | `{Highlight==<STR>}` | String literal / label | `{Highlight=="ARail"}` |
| 41 | 150 | `<$PROP$>: <$PROP$> was removed` | Movement tracking | `$oldLocation$: $newPieceName$ was removed` |
| 42 | 148 | `{Status_Level==<N>}` | General logic | `{Status_Level==1}` |
| 43 | 141 | `{CurrentY}` | General logic | `{CurrentY}` |
| 44 | 141 | `{Moved}` | Movement tracking | `{Moved}` |
| 45 | 140 | `<$PROP$>: <$PROP$> * received replacements` | General logic | `$location$: $newPieceName$ * received replacements` |
| 46 | 138 | `<$PROP$>: <$PROP$> * is reduced` | General logic | `$location$: $newPieceName$ * is reduced` |
| 47 | 134 | `{CurrentX}` | General logic | `{CurrentX}` |
| 48 | 132 | `{DeckName!=<STR>}` | Deck membership test | `{DeckName!=""}` |
| 49 | 131 | `<$PROP$>: <$PROP$> was cloned` | General logic | `$location$: $newPieceName$ was cloned` |
| 50 | 124 | `<$PROP$> ` | General logic | `$pieceName$ ` |

### Expression Type Breakdown

- **beanshell**: 42,484
- **oldstyle**: 26,744
- **mixed**: 1,990

### Expression Context Breakdown

- **trait_param**: 42,224
- **report_format**: 24,618
- **attribute**: 4,376

### Top 30 Properties Referenced in Expressions

| Property | References |
|----------|-----------|

### Top Functions Used in Expressions


## Task 2: TriggerAction Chain Analysis

Sources (prototypes/pieces) containing TriggerAction: **7,448**

Total TriggerAction traits: **28,970**

### Top 20 Modules by TriggerAction Count

| Module | Publisher | TriggerActions |
|--------|-----------|---------------|
| Western Front Ace | Compass Games | 2759 |
| Fields of Fire PUBLIC | GMT Games | 2090 |
| American Tank Ace | Compass Games | 681 |
| Paths to Hell - Operation Barbarossa, June-December 1941 | Compass Games | 673 |
| Talon | GMT Games | 596 |
| Rhode Island | GMT Games | 568 |
| Combat Commander: Pacific | GMT Games | 548 |
| Europe Engulfed | GMT Games | 519 |
| Operation Mercury | GMT Games | 517 |
| Paths of Glory,[object Object] | GMT Games | 514 |
| Combat Commander: Europe | GMT Games | 513 |
| A las Barricades!  -  Second Edition | Compass Games | 501 |
| Stalingrad 42 | GMT Games | 494 |
| Wild Blue Yonder | GMT Games | 493 |
| A Time for Trumpets | GMT Games | 480 |
| Guilford | GMT Games | 468 |
| Steel Wolves | Compass Games | 410 |
| Savannah | GMT Games | 409 |
| Vietnam 1965-1975 GMT | GMT Games | 377 |
| Won by the Sword | GMT Games | 367 |

### Traits Co-occurring with TriggerAction

These traits appear in the same prototype/piece as TriggerAction, revealing what triggers automate:

| Trait | Co-occurrences | Role |
|-------|---------------|------|
| emb2 | 5,247,486 | State layer (visual) |
| hideCmd | 5,165,230 |  |
| null | 2,778,910 |  |
| piece | 2,777,813 | Base piece |
| nonRect2 | 2,610,917 |  |
| PROP | 140,885 |  |
| globalkey | 108,948 | Piece-level GKC |
| report | 108,090 | Chat notification |
| setprop | 76,872 | Set global property |
| label | 71,559 | Text overlay |
| mark | 69,860 | Static property |
| sendto | 43,289 | Move to location |
| immob | 41,355 | Movement lock |
| nonRect | 40,798 |  |
| submenu | 21,428 | Menu organization |
| prototype | 18,660 | Prototype ref |
| button | 18,451 |  |
| replace | 18,151 | Swap piece |
| placemark | 14,313 | Spawn piece |
| globalhotkey | 7,693 | Global hotkey |

### TriggerAction Chaining Depth

How many TriggerActions exist per prototype/piece (more = deeper automation):

| Triggers per Source | Source Count |
|--------------------:|------------:|
| 1 | 3207 |
| 2 | 1901 |
| 3 | 761 |
| 4 | 499 |
| 5 | 195 |
| 6 | 167 |
| 7 | 100 |
| 8 | 81 |
| 9 | 55 |
| 10 | 34 |
| 11 | 35 |
| 12 | 32 |
| 13 | 17 |
| 14 | 44 |
| 15 | 50 |
| 16 | 43 |
| 17 | 27 |
| 18 | 21 |
| 19 | 6 |
| 20 | 24 |
| 21 | 7 |
| 22 | 9 |
| 23 | 4 |
| 24 | 3 |
| 25 | 3 |
| 26 | 5 |
| 27 | 36 |
| 28 | 1 |
| 29 | 3 |
| 30 | 4 |
| 31 | 1 |
| 32 | 2 |
| 33 | 16 |
| 34 | 1 |
| 35 | 8 |
| 36 | 1 |
| 37 | 1 |
| 38 | 2 |
| 39 | 2 |
| 40 | 4 |
| 41 | 2 |
| 42 | 2 |
| 43 | 1 |
| 48 | 1 |
| 50 | 1 |
| 51 | 1 |
| 52 | 11 |
| 62 | 1 |
| 68 | 1 |
| 71 | 1 |
| 72 | 2 |
| 73 | 1 |
| 74 | 1 |
| 76 | 1 |
| 81 | 1 |
| 106 | 1 |
| 115 | 1 |
| 120 | 1 |
| 172 | 1 |
| 200 | 1 |
| 372 | 1 |
| 396 | 1 |
| 2742 | 1 |

### Most Complex TriggerAction Sources (deepest automation)

| Module | Source | Trigger Count |
|--------|--------|--------------|
| Western Front Ace | Blank | 2742 |
| Europe Engulfed | Factory | 396 |
| American Tank Ace | Empty | 372 |
| Wild Blue Yonder | sPinst | 200 |
| American Tank Ace | Mission | 172 |
| Trench Raid | Box | 120 |
| British Tank Ace | Turret | 115 |
| Savannah | British 2 Step Unit | 106 |
| A Time for Trumpets | Sequence of Play GKC Store | 81 |
| Steel Wolves | TDC | 76 |
| The American Revolution: Decision in America , 1775-1782 | Campaign Markers | 74 |
| Grant Takes Command II | Entrench CSA | 73 |
| Combat Commander: Pacific | Draw Button | 72 |
| Wild Blue Yonder | pilotDrawCards | 72 |
| Thunder on the Mississippi | Turn Marker Auto | 71 |

## Task 3: GKC Targeting Pattern Analysis

Total GKC definitions: **20,450**

### GKC Level Breakdown

- **piece**: 16,486
- **map**: 2,836
- **module**: 1,128

### Top 40 GKC Target Expressions

| Count | Target Expression | Category |
|------:|-------------------|----------|
| 67 | `{BasicName == "sPinst"}` | Piece name filter |
| 64 | `{BasicName == "pilotDrawCards"}` | Piece name filter |
| 48 | `140` | Custom property |
| 45 | `DeckName = Main Deck` | Deck filter |
| 36 | `DeckName = Investment Card` | Deck filter |
| 36 | `DeckName = Action Card` | Deck filter |
| 34 | `BasicName = dicetray` | Piece name filter |
| 30 | `12` | Custom property |
| 27 | `CurrentZone=Tribe` | Location/Zone-scoped |
| 27 | `BasicName = dicecache` | Piece name filter |
| 26 | `DeckName = RandomOttoman` | Deck filter |
| 26 | `DeckName = RandomFrance` | Deck filter |
| 24 | `{CurrentX >1200}` | Custom property |
| 24 | `Piece = Settings` | Custom property |
| 24 | `Card=1` | Custom property |
| 21 | `DeckName = RandomProtestant` | Deck filter |
| 21 | `DeckName = RandomEngland` | Deck filter |
| 20 | `{CurrentMap==$CurrentMap$}` | Map-scoped |
| 20 | `{CurrentMap=="hiddenMap"&&DeckName=="hiddenDeck"}` | Map-scoped |
| 20 | `CD=` | Custom property |
| 17 | `{Type=="Marker"&&InvisibleToOthers==true}` | Unit type filter |
| 17 | `{Type=="Marker"&&InvisibleToOthers==false}` | Unit type filter |
| 17 | `{DeckName=="French Untried"}` | Deck filter |
| 16 | `{DeckName=="FR Bonus War Tiles"}` | Deck filter |
| 16 | `{DeckName=="BR Bonus War Tiles"}` | Deck filter |
| 16 | `Type=Grannule && CurrentZone=Pellets && gpRelaunch=0` | Location/Zone-scoped |
| 15 | `{DeckName=="FR Basic War Tiles"}` | Deck filter |
| 15 | `{DeckName=="BR Basic War Tiles"}` | Deck filter |
| 14 | `{GetProperty("InspiredTokenSide")==1}` | Side/Faction filter |
| 14 | `{Cardtype=="Command"}` | Unit type filter |
| 14 | `DeckName = RandomSpain` | Deck filter |
| 14 | `DeckName = RandomHRE` | Deck filter |
| 12 | `{GetProperty("InspiredTokenSide")==2}` | Side/Faction filter |
| 12 | `Treas=1` | Custom property |
| 12 | `Moved = true` | Movement-related |
| 11 | `{ActivateUnit_Active!=false}` | Custom property |
| 10 | `{BasicName=="scenLoadSelect"}` | Piece name filter |
| 10 | `{(CurrentMap=="Main Map") && (BasicName=="Controller")}` | Map-scoped |
| 10 | `{$Layer$=="Combat Markers"}` | Marker-based |
| 10 | `Reseed = 1` | Custom property |

### GKC Targeting Categories (aggregated)

- **Custom property**: 814
- **Deck filter**: 630
- **Piece name filter**: 366
- **Unit type filter**: 250
- **Location/Zone-scoped**: 244
- **Map-scoped**: 241
- **Match all**: 193
- **Side/Faction filter**: 99
- **Marker-based**: 58
- **Movement-related**: 44
- **Formation filter**: 27
- **Selection-based**: 2

### Modules with Most GKC Definitions

| Module | Publisher | GKCs |
|--------|-----------|------|
| Steel Wolves | Compass Games | 1479 |
| OCS - CB & GBII | Multi-Man Publishing | 853 |
| OCS - Ostfront | Multi-Man Publishing | 800 |
| Wild Blue Yonder | GMT Games | 720 |
| SCS Day of Days | Multi-Man Publishing | 663 |
| OCS - The Third Winter | Multi-Man Publishing | 611 |
| Silent War 2.0 + IJN | Compass Games | 584 |
| LOB - None But Heroes | Multi-Man Publishing | 368 |
| Rhode Island | GMT Games | 363 |
| Virgin Queen | GMT Games | 323 |
| Red Strike | VUCA Simulations | 312 |
| Combat Commander: Europe | GMT Games | 272 |
| OCS - Hungarian Rhapsody | Multi-Man Publishing | 266 |
| Wolfpack | GMT Games | 261 |
| Guilford | GMT Games | 245 |

### Most Complex GKC Target Expressions

- **Wolfpack** — `ConvoyMovement`:
  `{PatrolStatus==""&&CurrentZone!="Large Convoy Approach A ASW Search Box"&&CurrentZone!="Large Convoy Approach B ASW Search Box"&&CurrentZone!="Large C`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP8`:
  `{TotalSenatorialRoutPoints==8&#9;||TotalSenatorialRoutPoints==18&#9;||TotalSenatorialRoutPoints==28&#9;||TotalSenatorialRoutPoints==38&#9;||TotalSenat`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP7`:
  `{TotalSenatorialRoutPoints==7&#9;||TotalSenatorialRoutPoints==17&#9;||TotalSenatorialRoutPoints==27&#9;||TotalSenatorialRoutPoints==37&#9;||TotalSenat`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP6`:
  `{TotalSenatorialRoutPoints==6&#9;||TotalSenatorialRoutPoints==16&#9;||TotalSenatorialRoutPoints==26&#9;||TotalSenatorialRoutPoints==36&#9;||TotalSenat`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP5`:
  `{TotalSenatorialRoutPoints==5&#9;||TotalSenatorialRoutPoints==15&#9;||TotalSenatorialRoutPoints==25&#9;||TotalSenatorialRoutPoints==35&#9;||TotalSenat`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP4`:
  `{TotalSenatorialRoutPoints==4&#9;||TotalSenatorialRoutPoints==14&#9;||TotalSenatorialRoutPoints==24&#9;||TotalSenatorialRoutPoints==34&#9;||TotalSenat`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP3`:
  `{TotalSenatorialRoutPoints==3||TotalSenatorialRoutPoints==13||TotalSenatorialRoutPoints==23||TotalSenatorialRoutPoints==33||TotalSenatorialRoutPoints=`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP9`:
  `{TotalSenatorialRoutPoints==9||TotalSenatorialRoutPoints==19||TotalSenatorialRoutPoints==29||TotalSenatorialRoutPoints==39||TotalSenatorialRoutPoints=`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP2`:
  `{TotalSenatorialRoutPoints==2||TotalSenatorialRoutPoints==12||TotalSenatorialRoutPoints==22||TotalSenatorialRoutPoints==32||TotalSenatorialRoutPoints=`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP1`:
  `{TotalSenatorialRoutPoints==1||TotalSenatorialRoutPoints==11||TotalSenatorialRoutPoints==21||TotalSenatorialRoutPoints==31||TotalSenatorialRoutPoints=`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `SRP0`:
  `{TotalSenatorialRoutPoints==0||TotalSenatorialRoutPoints==10||TotalSenatorialRoutPoints==20||TotalSenatorialRoutPoints==30||TotalSenatorialRoutPoints=`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `CRP8`:
  `{TotalCaesarianRoutPoints==8&#9;||TotalCaesarianRoutPoints==18&#9;||TotalCaesarianRoutPoints==28&#9;||TotalCaesarianRoutPoints==38&#9;||TotalCaesarian`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `CRP7`:
  `{TotalCaesarianRoutPoints==7&#9;||TotalCaesarianRoutPoints==17&#9;||TotalCaesarianRoutPoints==27&#9;||TotalCaesarianRoutPoints==37&#9;||TotalCaesarian`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `CRP6`:
  `{TotalCaesarianRoutPoints==6&#9;||TotalCaesarianRoutPoints==16&#9;||TotalCaesarianRoutPoints==26&#9;||TotalCaesarianRoutPoints==36&#9;||TotalCaesarian`
- **GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022)** — `CRP5`:
  `{TotalCaesarianRoutPoints==5&#9;||TotalCaesarianRoutPoints==15&#9;||TotalCaesarianRoutPoints==25&#9;||TotalCaesarianRoutPoints==35&#9;||TotalCaesarian`

## Task 4: Property Ecosystem Mapping

Total property definitions: **5,656**

### Property Scope x Type

| Scope | Type | Count |
|-------|------|------:|
| module | global | 3379 |
| piece | calculated | 1414 |
| map | global | 863 |

### Cross-Module Property Vocabulary (names appearing in 4+ modules)

| Property Name | Modules | Total | Scopes | Types |
|---------------|--------:|------:|--------|-------|
| Turn | 19 | 22 | module,map | global |
| Weather | 14 | 18 | module,map | global |
| Unit Manpower | 11 | 11 | module | global |
| USA Demoralized | 11 | 11 | module | global |
| OOS | 11 | 11 | module | global |
| Fatigue | 11 | 11 | module | global |
| Disorganized | 11 | 11 | module | global |
| CardNum | 11 | 11 | module | global |
| DestinationY | 9 | 9 | module | global |
| DestinationX | 9 | 9 | module | global |
| ThisBoard | 8 | 8 | module | global |
| RRP | 8 | 8 | map | global |
| ORP | 8 | 8 | map | global |
| Entrenchment | 8 | 8 | module | global |
| DestY | 8 | 8 | module | global |
| DestX | 8 | 8 | module | global |
| Demoralized | 8 | 8 | module | global |
| CardDest | 8 | 8 | module | global |
| British Momentum | 8 | 8 | map | global |
| BitLocationOld | 8 | 8 | module | global |
| BitLocationCurrent | 8 | 8 | module | global |
| ActiveFormation | 8 | 8 | module | global |
| Release | 7 | 7 | module | global |
| General | 7 | 7 | module | global |
| TotalSupport | 6 | 6 | module | global |
| TotalOppose | 6 | 6 | module | global |
| PhaseNumber | 6 | 9 | map | global |
| InCommandFormation | 6 | 6 | module | global |
| InCommandDivision | 6 | 6 | module | global |
| EasterEggValue | 6 | 6 | module | global |
| ActiveDivision | 6 | 6 | module | global |
| Year | 5 | 5 | module | global |
| YLoc | 5 | 5 | module | global |
| XLoc | 5 | 5 | module | global |
| VP | 5 | 5 | module | global |
| Time | 5 | 5 | module | global |
| SideName | 5 | 5 | piece | calculated |
| HexLoc | 5 | 5 | module | global |
| GlobalTrails | 5 | 5 | module | global |
| GameTurn | 5 | 5 | module | global |
| Destination | 5 | 5 | module | global |
| ButtonLocation | 5 | 5 | module | global |
| American Momentum | 5 | 5 | map | global |
| yPos2 | 4 | 8 | piece | calculated |
| xPos2 | 4 | 8 | piece | calculated |
| VPs | 4 | 9 | module,piece | global,calculated |
| TopString | 4 | 4 | piece | calculated |
| Sorties | 4 | 4 | module | global |
| ShouldTrails | 4 | 4 | piece | calculated |
| ShouldClearTrails | 4 | 4 | piece | calculated |

### Most Stateful Modules (by property count)

| Module | Publisher | Total | Dynamic | Calculated | Global |
|--------|-----------|------:|--------:|-----------:|-------:|
| Space Empires 4x | GMT Games | 540 | 0 | 326 | 214 |
| GMT Games - Great Battles of Julius Caesar: Deluxe Edition: GMT (2022) | GMT Games | 208 | 0 | 46 | 162 |
| Trench Raid | Compass Games | 201 | 0 | 10 | 191 |
| SCS Day of Days | Multi-Man Publishing | 197 | 0 | 0 | 197 |
| Europe in Turmoil II: The Interbellum Years 1920-1939 | Compass Games | 192 | 0 | 189 | 3 |
| Triumph & Tragedy (2nd Edition) | GMT Games | 190 | 0 | 3 | 187 |
| Wild Blue Yonder | GMT Games | 161 | 0 | 16 | 145 |
| Talon | GMT Games | 150 | 0 | 95 | 55 |
| Great Battles of Alexander: Deluxe Edition | GMT Games | 144 | 0 | 6 | 138 |
| Combat Commander: Europe | GMT Games | 105 | 0 | 0 | 105 |
| Europe Engulfed | GMT Games | 98 | 0 | 9 | 89 |
| Plantagenet | GMT Games | 95 | 0 | 66 | 29 |
| Paths of Glory,[object Object] | GMT Games | 93 | 0 | 55 | 38 |
| Operation Mercury | GMT Games | 91 | 0 | 18 | 73 |
| Prelude to Rebellion | Compass Games | 86 | 0 | 3 | 83 |
| Flying Colors | GMT Games | 80 | 0 | 12 | 68 |
| The Greatest Day: Sword, Juno and Gold Beaches | Multi-Man Publishing | 80 | 0 | 1 | 79 |
| Vietnam 1965-1975 GMT | GMT Games | 78 | 0 | 0 | 78 |
| Nevsky | GMT Games | 77 | 0 | 50 | 27 |
| Inferno | GMT Games | 76 | 0 | 53 | 23 |

### Most Complex Calculated Properties

- **Talon** — `FCchargeYellow`:
  `{GetProperty("Fusion Cannon (yellow)_Level") > 6 ? "<span style:color="#fde910">&#9644;&#9644;&#9644;&#9644;&#9644;&#9644;</span>" : (GetProperty("Fusion Cannon (yellow)_Level") > 5 ? "<span style:col`
- **Talon** — `FCchargeYellow`:
  `{GetProperty("Fusion Cannon (yellow)_Level") > 6 ? "<span style:color="#fde910">&#9644;&#9644;&#9644;&#9644;&#9644;&#9644;</span>" : (GetProperty("Fusion Cannon (yellow)_Level") > 5 ? "<span style:col`
- **Talon** — `FCchargeYellow`:
  `{GetProperty("Fusion Cannon (yellow)_Level") > 6 ? "<span style:color="#fde910">&#9644;&#9644;&#9644;&#9644;&#9644;&#9644;</span>" : (GetProperty("Fusion Cannon (yellow)_Level") > 5 ? "<span style:col`
- **Talon** — `CriticalDamage2`:
  `{Critical2levelREAL == 2 ? "<img src="helm down.png" width=32 height=32>" : (Critical2levelCritical1levelREAL == 3 ? "<img src="power down.png" width=32 height=32>" : (Critical2levelREAL == 4 ? "<img `
- **Talon** — `CriticalDamage2`:
  `{Critical2levelREAL == 2 ? "<img src="helm down.png" width=32 height=32>" : (Critical2levelCritical1levelREAL == 3 ? "<img src="power down.png" width=32 height=32>" : (Critical2levelREAL == 4 ? "<img `
- **Talon** — `CriticalDamage2`:
  `{Critical2levelREAL == 2 ? "<img src="helm down.png" width=32 height=32>" : (Critical2levelCritical1levelREAL == 3 ? "<img src="power down.png" width=32 height=32>" : (Critical2levelREAL == 4 ? "<img `
- **Against the Iron Ring: The fate of the 6th Army in Stalingrad** — `statusEffect`:
  `{(OoSLevel == 2 && Disrupted == 1) ? "½-x1 | ½" : (OoSLevel == 3 && Disrupted == 1) ? "¼-½ | ¼" : (OoSLevel == 4 && Disrupted == 1 && size != "Korpus") ? "NO ZOC | 0-1 | 1" : (OoSLevel == 4 && Disrupt`
- **Talon** — `CriticalDamage1`:
  `{Critical1levelREAL == 2 ? "<img src="helm down.png" width=32 height=32>" : (Critical1levelREAL == 3 ? "<img src="power down.png" width=32 height=32>" : (Critical1levelREAL == 4 ? "<img src="shields d`
- **Talon** — `CriticalDamage1`:
  `{Critical1levelREAL == 2 ? "<img src="helm down.png" width=32 height=32>" : (Critical1levelREAL == 3 ? "<img src="power down.png" width=32 height=32>" : (Critical1levelREAL == 4 ? "<img src="shields d`
- **Talon** — `CriticalDamage1`:
  `{Critical1levelREAL == 2 ? "<img src="helm down.png" width=32 height=32>" : (Critical1levelREAL == 3 ? "<img src="power down.png" width=32 height=32>" : (Critical1levelREAL == 4 ? "<img src="shields d`
- **Space Empires 4x** — `repRPCalc`:
  `{GetProperty("     SC/F/R/Mine")+GetProperty("     DD/Base/Flag")+GetProperty("     CA")+GetProperty("     BC")+GetProperty("     BB")+GetProperty("     DN")+GetProperty("     TN")+GetProperty("     A`
- **Talon** — `WMGchargeYellow`:
  `{GetProperty("Wave Motion Gun (yellow)_Level") > 5 ? "<span style:color="#fde910">&#9644;&#9644;&#9644;&#9644;&#9644;</span>" : (GetProperty("Wave Motion Gun (yellow)_Level") > 4 ? "<span style:color=`
- **Talon** — `WMGchargeYellow`:
  `{GetProperty("Wave Motion Gun (yellow)_Level") > 5 ? "<span style:color="#fde910">&#9644;&#9644;&#9644;&#9644;&#9644;</span>" : (GetProperty("Wave Motion Gun (yellow)_Level") > 4 ? "<span style:color=`
- **Talon** — `WMGchargeYellow`:
  `{GetProperty("Wave Motion Gun (yellow)_Level") > 5 ? "<span style:color="#fde910">&#9644;&#9644;&#9644;&#9644;&#9644;</span>" : (GetProperty("Wave Motion Gun (yellow)_Level") > 4 ? "<span style:color=`
- **Hitler's Reich** — `CompleteValue`:
  `{If(AxisSaboteurActive, If(AlliedConflictCardValue>=AlliedConflictCardValue2,1,AlliedConflictCardValue), AlliedConflictCardValue) + If(AxisSaboteurActive, If(AlliedConflictCardValue2>AlliedConflictCar`

## Task 5: Automation Completeness Scoring

### Top 25 Most Automated Modules

Scoring: Triggers×3 + GKCs×2 + Reports×1 + CalcProps×4 + Expressions×1 + DynProps×2

| Rank | Module | Publisher | Score | Triggers | GKCs | Reports | CalcProps | DynProps | Expressions |
|-----:|--------|-----------|------:|---------:|-----:|--------:|----------:|--------:|------------:|
| 1 | SCS Day of Days | Multi-Man Publishing | 11650 | 0 | 663 | 2511 | 0 | 0 | 7813 |
| 2 | Western Front Ace | Compass Games | 8362 | 2759 | 26 | 0 | 0 | 0 | 33 |
| 3 | Fields of Fire PUBLIC | GMT Games | 6558 | 2090 | 13 | 3 | 0 | 0 | 259 |
| 4 | Wild Blue Yonder | GMT Games | 4660 | 493 | 720 | 182 | 16 | 0 | 1495 |
| 5 | Steel Wolves | Compass Games | 4319 | 410 | 1479 | 28 | 2 | 0 | 95 |
| 6 | Talon | GMT Games | 3807 | 596 | 91 | 326 | 95 | 0 | 1131 |
| 7 | Operation Mercury | GMT Games | 3400 | 517 | 204 | 332 | 18 | 0 | 1037 |
| 8 | Europe Engulfed | GMT Games | 3347 | 519 | 87 | 375 | 9 | 0 | 1205 |
| 9 | Paths of Glory,[object Object] | GMT Games | 3322 | 514 | 206 | 190 | 55 | 0 | 958 |
| 10 | OCS - CB & GBII | Multi-Man Publishing | 3295 | 0 | 853 | 0 | 0 | 0 | 1589 |
| 11 | Stalingrad 42 | GMT Games | 3240 | 494 | 143 | 489 | 0 | 0 | 983 |
| 12 | Space Empires 4x | GMT Games | 3146 | 230 | 203 | 23 | 326 | 0 | 723 |
| 13 | OCS - Ostfront | Multi-Man Publishing | 3013 | 0 | 800 | 0 | 0 | 0 | 1413 |
| 14 | A Time for Trumpets | GMT Games | 2965 | 480 | 144 | 435 | 0 | 0 | 802 |
| 15 | Combat Commander: Pacific | GMT Games | 2921 | 548 | 240 | 429 | 0 | 0 | 368 |
| 16 | Combat Commander: Europe | GMT Games | 2844 | 513 | 272 | 405 | 0 | 0 | 356 |
| 17 | Rhode Island | GMT Games | 2740 | 568 | 363 | 192 | 0 | 0 | 118 |
| 18 | Paths to Hell - Operation Barbarossa, June-December 1941 | Compass Games | 2696 | 673 | 9 | 123 | 0 | 0 | 536 |
| 19 | OCS - The Third Winter | Multi-Man Publishing | 2457 | 0 | 611 | 0 | 0 | 0 | 1235 |
| 20 | Virgin Queen | GMT Games | 2344 | 317 | 323 | 266 | 13 | 0 | 429 |
| 21 | A las Barricades!  -  Second Edition | Compass Games | 2304 | 501 | 13 | 40 | 0 | 0 | 735 |
| 22 | Guilford | GMT Games | 2289 | 468 | 245 | 219 | 0 | 0 | 176 |
| 23 | Silent War 2.0 + IJN | Compass Games | 2263 | 136 | 584 | 3 | 3 | 0 | 672 |
| 24 | American Tank Ace | Compass Games | 2186 | 681 | 2 | 0 | 0 | 0 | 139 |
| 25 | Here I Stand (500th Anniversary Edition) | GMT Games | 1967 | 236 | 225 | 215 | 0 | 0 | 594 |

### Automation Distribution Across Corpus

- **Zero automation** (score=0): 1 modules (0.2%)
- **Low automation** (1-49): 246 modules (43.8%)
- **Medium automation** (50-499): 198 modules (35.2%)
- **High automation** (500+): 117 modules (20.8%)

### What Top Modules Do Differently

| Metric | Top 10 Average | Corpus Average | Multiplier |
|--------|---------------:|---------------:|-----------:|
| TriggerActions | 790 | 51.5 | 15x |
| GKCs | 434 | 36.4 | 12x |
| ReportStates | 395 | 36.0 | 11x |
| CalcProps | 19.5 | 2.52 | 8x |
| Expressions | 1562 | 126.7 | 12x |

## Task 6: Automation Recipes

Automation recipes are recurring multi-trait patterns that together implement a game mechanic.

### Detected Automation Recipes

| Recipe | Prototypes | Modules | Required Traits | Description |
|--------|----------:|--------:|-----------------|-------------|
| **Auto-Move (Trigger + SendTo)** | 1,255 | 179 | macro + sendto | TriggerAction fires SendToLocation for automated movement |
| **Property Propagation** | 1,092 | 122 | macro + setprop | Trigger sets global properties (phase tracking, score updates) |
| **Cascade Command (piece-level GKC)** | 889 | 110 | macro + globalkey | Trigger fires, then piece-level GKC propagates to other pieces |
| **Spawn/Replace Automation** | 574 | 100 | macro + placemark | Trigger spawns new pieces (reinforcements, markers) |
| **Delete/Remove Automation** | 536 | 131 | macro + delete | Trigger removes pieces (elimination, step loss) |
| **Calculated Display** | 80 | 20 | calcProp + label | Calculated property shown via Labeler text overlay |
| **Sound + Action** | 20 | 7 | macro + playSound | Trigger fires audio feedback |
| **State Change + Notification** | 0 | 0 | DYNPROP + macro + report | DynamicProperty changed by TriggerAction, reported to chat |
| **Conditional Visibility** | 0 | 0 | macro + emb2 + restrictCommands | Trigger controls Embellishment state with conditional command access |
| **Full Automation Loop** | 0 | 0 | macro + globalkey + report + DYNPROP | Complete loop: trigger → state change → propagate → report |
| **Deck Automation** | 0 | 0 | macro + returnToDeck | Trigger returns pieces to deck (card discard, reinforcement pool) |
| **Multi-State Piece** | 0 | 0 | DYNPROP + emb2 + macro + mark | Piece with mutable state, visual layers, triggers, and static markers |

### Recipe Examples

**Auto-Move (Trigger + SendTo)** (1255 prototypes across 179 modules):
- Caesar in Gaul → `Strategy Cards`
- Caesar in Gaul → `Legate`
- Charioteer → `Tokens Fan`
- Charioteer → `Cards Move`
- China's War → `NAT Guerrilla`

**Property Propagation** (1092 prototypes across 122 modules):
- Clash of Sovereigns: The War of the Austrian Succession 1740-48 → `TriggerWidgetMap`
- Clash of Sovereigns: The War of the Austrian Succession 1740-48 → `WidgetPiedmontAllied`
- Colonial Twilight → `Terror`
- Colonial Twilight → `Support-Opposition`
- Colonial Twilight → `Momentum`

**Cascade Command (piece-level GKC)** (889 prototypes across 110 modules):
- By Swords & Bayonets [GBACW] → `Leader - Brigadier`
- By Swords & Bayonets [GBACW] → `Leader - Division Commander`
- By Swords & Bayonets [GBACW] → `Combat Unit - Artillery`
- By Swords & Bayonets [GBACW] → `Combat Unit - Cavalry - Mounted`
- By Swords & Bayonets [GBACW] → `Combat Unit - Infantry`

**Spawn/Replace Automation** (574 prototypes across 100 modules):
- By Swords & Bayonets [GBACW] → `Combat Unit - Artillery`
- By Swords & Bayonets [GBACW] → `Combat Unit - Cavalry - Mounted`
- By Swords & Bayonets [GBACW] → `Combat Unit - Infantry`
- Colonial Twilight → `Base Space`
- Commands & Colors Medieval → `Leader`

**Delete/Remove Automation** (536 prototypes across 131 modules):
- By Swords & Bayonets [GBACW] → `Leader - Brigadier`
- By Swords & Bayonets [GBACW] → `Leader - Division Commander`
- By Swords & Bayonets [GBACW] → `Combat Unit - Artillery`
- By Swords & Bayonets [GBACW] → `Combat Unit - Cavalry - Mounted`
- By Swords & Bayonets [GBACW] → `Combat Unit - Infantry`

**Calculated Display** (80 prototypes across 20 modules):
- Commands & Colors Medieval → `Leader`
- Dominant Species → `Initiative Marker`
- Dominant Species → `Advanced_Tile`
- Empire of the Sun (2nd Edition) → `Nation Overlay Command`
- Empire of the Sun (2nd Edition) → `Progress of War`

Note: 2991 individual pieces also contain TriggerActions (not in prototypes).

### Looping TriggerActions (advanced iteration)

- **Colonial Twilight** → `Support-Opposition`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `FrenchChit`
- **Congress of Vienna 4-playersgame** → `AlliedChit`
- **Congress of Vienna 4-playersgame** → `AlliedChit`

### Modules Using Looping Triggers (counted/until)

| Module | Loop-Capable Triggers |
|--------|-----------------------:|
| Western Front Ace | 2759 |
| Fields of Fire PUBLIC | 2090 |
| American Tank Ace | 681 |
| Paths to Hell - Operation Barbarossa, June-December 1941 | 673 |
| Talon | 596 |
| Rhode Island | 568 |
| Europe Engulfed | 519 |
| Operation Mercury | 517 |
| Paths of Glory,[object Object] | 514 |
| A las Barricades!  -  Second Edition | 501 |
