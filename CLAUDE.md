# VASSAL Module Builder — Project Context

## Project Overview

This is a web-based, menu-driven tool for creating VASSAL game engine modules (.vmod files). VASSAL is a Java-based open-source platform for playing board games online, widely used by the hex-and-counter wargaming community (GMT Games, Decision Games, etc.).

**The key insight:** A .vmod file is just a ZIP archive containing XML + images. We do NOT need Java. We generate valid XML (buildFile.xml) and package it as a ZIP with a .vmod extension. The VASSAL Java runtime consumes these files.

**Owner:** Matt (GitHub: kellmat74)
**Repo:** https://github.com/kellmat74/vassal-module-builder

## Tech Stack

- **Frontend:** React (with Tailwind CSS for styling)
- **Backend:** Node.js/Express
- **Language:** TypeScript throughout (type safety is critical for the complex XML schema)
- **Build:** Vite (frontend), tsx/node (backend)
- **Testing:** Vitest
- **Module Output:** ZIP generation via `jszip` npm package

### Why This Stack
- JavaScript/TypeScript has excellent ZIP handling libraries for generating .vmod files
- The SequenceEncoder (VASSAL's trait serialization format) ports naturally to TypeScript
- React provides the component model needed for a complex wizard-style UI
- Single language across frontend and backend reduces context switching
- TypeScript interfaces will enforce the VASSAL component schema at compile time

## Architecture Decisions

- **No Java dependency** — we generate files that VASSAL's Java runtime reads, but our tool is 100% web-based
- **Schema-driven UI** — A TypeScript schema registry defines every VASSAL component, its attributes, allowed children, and defaults. The UI is generated from this schema.
- **Feature Catalog approach** — Phase 2 (Module Modder) uses a curated catalog of standardized VASSAL features that users can add to existing modules. Each feature has a template builder, parameter UI, and automatic detection of whether the module already has it.
- **Best-practices-first** — Templates encode patterns from the best existing modules, so users start with good defaults
- **Wizard-style flow (Phase 3)** — Future module-from-scratch builder will use: Game Info → Map Setup → Grid Configuration → Piece Definition → Game Logic → Charts/Tables → Package & Download

---

## VASSAL Module Format (.vmod) Reference

### File Structure
A .vmod is a ZIP archive at root level containing:
```
buildFile.xml     — Master XML config (all components, pieces, game logic)
moduledata        — Module metadata (name, version, VASSAL version, date)
images/           — All graphic assets (PNG, SVG, GIF, JPG — PNG/SVG preferred)
sounds/           — Optional audio files
help/             — Optional HTML help files
*.class           — Optional custom Java classes (rare/advanced)
```

### moduledata Format
```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<data version="1">
  <version>1.0</version>
  <extra1/>
  <extra2/>
  <VassalVersion>3.7.5</VassalVersion>
  <dateSaved>1701389383564</dateSaved>
  <description>Module description here</description>
  <name>Module Name</name>  <!-- Some modules use <n> instead of <name>; our parser handles both -->
</data>
```

### buildFile.xml Structure
- Root element: `<VASSAL.build.GameModule>` with attributes: name, description, version, VassalVersion, nextPieceSlotId, ModuleOther1, ModuleOther2
- **Every XML element tag is a fully-qualified Java class name** (e.g., `VASSAL.build.module.Map`)
- Attributes correspond to the class's configurable properties
- `nextPieceSlotId` must be incremented for each PieceSlot added (counter pieces)

### Minimal Valid buildFile.xml
```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<VASSAL.build.GameModule ModuleOther1="" ModuleOther2="" VassalVersion="3.7.5" description="" name="My Module" nextPieceSlotId="0" version="1.0">
    <VASSAL.build.module.BasicCommandEncoder/>
    <VASSAL.build.module.Documentation>
        <VASSAL.build.module.documentation.AboutScreen fileName="/images/Splash.png" title="About Module"/>
    </VASSAL.build.module.Documentation>
    <VASSAL.build.module.PlayerRoster buttonText="Retire" buttonToolTip="Switch sides"/>
    <VASSAL.build.module.GlobalOptions autoReport="Always" playerIdFormat="$PlayerName$"/>
    <VASSAL.build.module.Chatter/>
    <VASSAL.build.module.KeyNamer/>
    <VASSAL.i18n.Language/>
</VASSAL.build.GameModule>
```

---

## Component Hierarchy

This defines what can nest inside what. Our schema registry must enforce this.

### GameModule (root) accepts:
- ModuleSubFolder, Map, PieceWindow, ToolbarMenu, MultiActionButton, DoActionButton
- DiceButton, GlobalKeyCommand, StartupGlobalKeyCommand, Inventory
- RandomTextButton, SpecialDiceButton, PredefinedSetup, ChartWindow
- PrivateMap, PlayerHand, NotesWindow, TurnTracker, ChessClockControl

### Map accepts:
- MapSubFolder, GlobalMap, LOS_Thread, ToolbarMenu, MultiActionButton, DoActionButton
- HidePiecesButton, Zoomer, CounterDetailViewer, HighlightLastMoved
- LayeredPieceCollection, ImageSaver, TextSaver, DrawPile, SetupStack
- MassKeyCommand, MapShader, PieceRecenterer, Flare, MoveCameraButton

### Board/Grid hierarchy:
- Map → BoardPicker → Board → (one of:) HexGrid | SquareGrid | RegionGrid | ZonedGrid
- ZonedGrid → Zone → (sub-grid:) HexGrid | SquareGrid | RegionGrid
- HexGrid/SquareGrid → GridNumbering (HexGridNumbering / SquareGridNumbering)

### Key HexGrid Attributes:
- sideways (boolean — flat-top vs pointy-top)
- hex width/height, x/y offset
- snapTo, visible, dotsVisible, color

---

## Piece Trait System (Decorators)

Every game piece = BasicPiece wrapped in a chain of Decorator traits. **Order matters.**

### Complete Trait ID Registry (44 traits)
These are the serialization IDs used in buildFile.xml:

**Visual/Display:**
- `piece;` — BasicPiece (base image + name, always innermost)
- `emb2;` — Embellishment (multi-state image layers — the workhorse)
- `label;` — Labeler (text overlay)
- `rotate;` — FreeRotator
- `pivot;` — Pivot
- `nonRect2;` — NonRectangular (custom hit shape)
- `AreaOfEffect;` — AreaOfEffect (range circles, ZOC)
- `footprint;` — Footprint (movement trail)
- `markmoved;` — MovementMarkable
- `borderOutline;` — BorderOutline

**Visibility/Access:**
- `hide;` — Hideable (invisible to others)
- `obs;` — Obscurable (masked/face-down)
- `restrict;` — Restricted (side-based access)
- `restrictCommands;` — RestrictCommands (conditional command visibility)
- `immob;` — Immobilized

**Properties/Data:**
- `mark;` — Marker (static key-value, e.g. Nationality=German)
- `DYNPROP;` — DynamicProperty (mutable game state)
- `calcProp;` — CalculatedProperty (expression-computed)
- `setprop;` — SetGlobalProperty
- `setOtherProp;` — SetPieceProperty
- `basicName;` — BasicName
- `comment;` — Comment (designer note, no gameplay effect)
- `tableInfo;` — TableInfo (lookup table)
- `propertysheet;` — PropertySheet
- `transMsg;` — TranslatableMessage

**Actions/Commands:**
- `macro;` — TriggerAction (MACRO — fire key sequence, supports looping)
- `globalkey;` — CounterGlobalKeyCommand (piece-level GKC)
- `globalhotkey;` — GlobalHotKey
- `report;` — ReportState (chat log message)
- `playSound;` — PlaySound
- `action;` — ActionButton (clickable on piece)

**Movement/Placement:**
- `sendto;` — SendToLocation
- `returnToDeck;` — ReturnToDeck
- `translate;` — Translate (fixed offset move)
- `placemark;` — PlaceMarker (spawn new piece)
- `replace;` — Replace (swap piece definition)
- `clone;` — Clone
- `delete;` — Delete
- `multiLocation;` — MultiLocationCommand (NEW 3.7 — conditional destination)
- `deselect;` — Deselect

**Grouping/Organization:**
- `mat;` — Mat (surface for cargo pieces, NEW 3.6)
- `matCargo;` — MatCargo (snaps to Mat, NEW 3.6)
- `attachment;` — Attachment (logical piece binding, NEW 3.7)
- `prototype;` — UsePrototype (inherit from Prototype definition)
- `submenu;` — SubMenu
- `menuSep;` — MenuSeparator

### Trait Serialization (SequenceEncoder)
Traits serialize as semicolon-delimited strings: `[TraitID][encoded params]`
Parameters use VASSAL's SequenceEncoder with backslash escaping and comma/semicolon delimiters.
The SequenceEncoder has been ported to TypeScript (see `src/core/sequence-encoder.ts`, 41 tests).

### Trait Order Best Practices
- RestrictCommands / Restricted → near OUTSIDE (intercept commands first)
- Embellishments → ordered by draw layer (later = on top)
- TriggerAction → position matters for what it can "see"
- UsePrototype → injects sub-chain at its position

---

## Expression System

Two formats:
1. **BeanShell** (curly braces): `{GetProperty("Strength") > 3 && CurrentMap == "Main Map"}`
2. **Old-style** (dollar signs): `$PlayerName$ attacks $BasicName$ in $LocationName$`

Key functions: GetProperty(), SumStack(), Sum(), Count(), Alert()

### Property Scopes (cascade):
- Piece Properties (Marker, DynamicProperty, CalculatedProperty, system props)
- Zone Properties
- Map Properties (via GlobalProperties sub-component)
- Module Properties (top-level GlobalProperties)
- System Properties (PlayerName, PlayerSide, etc.)
- Scenario Properties (NEW 3.7 — configurable at game start)

---

## Underused Features to Surface

These are powerful features (mostly 3.6-3.7) that most modules don't use yet:

1. **Mat/MatCargo** (3.6) — pieces as surfaces for other pieces (carriers, transports)
2. **Attachment** (3.7) — logical piece bindings for GKC targeting (HQ→subordinates)
3. **MultiLocationCommand** (3.7) — conditional destination in one trait
4. **Scenario Properties** (3.7) — game-start dialog for variant options
5. **TriggerAction looping** — counted/while/until loops for iteration
6. **CalculatedProperty + aggregate functions** — auto combat odds, supply status
7. **Game Piece Image Definitions** — built-in counter generator from symbols/shapes

---

## Turn Tracker System

Multi-level nesting:
- **CounterTurnLevel** — numeric (Turn 1, 2, 3...)
- **ListTurnLevel** — named phases (Movement, Combat, Exploitation)
- **TurnGlobalHotkey** — fires hotkey at specific turn level

Common wargame patterns:
- IGO-UGO: Counter(Turn) → List(Player1/Player2) → List(Movement/Combat/Exploitation)
- Impulse: Counter(Turn) → Counter(Impulse) → List(Phases)
- Card-driven: Counter(Turn) → List(Card Play/Operations/Events)

---

## Codebase Stats (from source analysis)

- 255 Java files in build package (components + config)
- 101 Java files in counters package (traits + behavior)
- 44 Decorator (Trait) subclasses
- 21 top-level module components
- 20 Map sub-components
- 4 grid types (Hex, Square, Region, Zoned)
- 18 expression engine classes

---

## Development Phases

### Phase 0: Engine Deep Dive ✅ COMPLETE
- Cloned and analyzed VASSAL source from GitHub
- Documented complete component hierarchy
- Cataloged all 44 traits with serialization IDs
- Identified underused features (3.6-3.7)
- Created architecture document (see docs/VASSAL_Engine_Deep_Dive_Phase0.md)

### Phase 1: Foundation ✅ COMPLETE
1. Ported SequenceEncoder to TypeScript (41 tests, full escaping fidelity)
2. Built XML serializer for buildFile.xml generation
3. Implemented .vmod generator (ZIP packager with jszip)
4. Created minimal module factory, validated output in VASSAL 3.7.20
5. Help content documentation (concepts, components, traits, grids, expressions, best-practices)

### Phase 2: Module Modder (CURRENT — primary product feature)
The first user-facing feature: modify existing .vmod modules with enhancements.

**Core Flow:**
1. **Import** — User uploads a .vmod → parse buildFile.xml into ComponentNode tree, store images/assets server-side keyed by sessionId
2. **Browse Feature Catalog** — Curated list of standardized VASSAL features (17 currently), each with auto-detection of whether the module already has it. Features are categorized (map-enhancement, piece-enhancement, dice-and-randomness, etc.) and show prevalence stats.
3. **Add Features** — User configures parameters and adds features. UI distinguishes "✓ Present" (already in original module) vs "⊕ To be added" (queued this session).
4. **Save** — Output modded .vmod with preserved images, modded suffix in name/version, and embedded mod-manifest.json

**Feature Catalog** (`src/schema/feature-catalog.ts`):
- Each feature defines: id, name, description, category, target (module/each-map/first-map/prototype), detectTags, parameters with defaults, and a `buildTemplate()` function
- `moduleHasFeature()` scans the ComponentNode tree for detectTags to show what's already present
- Current features include: GlobalMap (minimap), Zoomer, CounterDetailViewer, Flare, HighlightLastMoved, Inventory, TurnTracker, DiceButton, PlayerRoster, and more

**Mod Manifest (mod-manifest.json inside .vmod):**
```json
{
  "basedOn": { "name": "Original Module", "version": "3.2" },
  "modifiedBy": "Player Name",
  "modifiedDate": "2026-03-08T...",
  "toolVersion": "vassal-module-builder 0.1.0",
  "changes": [
    { "type": "added", "component": "Footprint", "target": "all movable prototypes" },
    { "type": "modified", "component": "Zoomer", "detail": "added 150% zoom level" }
  ]
}
```

**Output Naming:** `OriginalName_v3.2_modded.vmod`

**Distribution Guidance:** Personal use focus. Clear messaging about respecting original designers. Do not upload modded modules to vassalengine.org library without permission.

**Sub-tasks:**
1. ✅ .vmod reader/importer (XML parser → ComponentNode tree) — `src/core/xml-parser.ts`, `src/core/vmod-reader.ts`
2. ⏸️ Module analyzer (deprioritized — replaced by Feature Catalog approach) — `src/core/module-analyzer.ts` exists but not central to UX
3. ✅ React UI for import → feature catalog → add → save flow — `src/client/App.tsx`, `src/client/components/`
4. 🔧 Trait injector (add traits to existing piece definitions/prototypes) — IN PROGRESS, currently shows "coming soon" alert for prototype-level features
5. ✅ Mod manifest generator — embedded in `src/core/vmod-writer.ts`
6. ✅ Output packager (re-ZIP with modifications, images preserved via server-side session store) — `src/server/index.ts`
7. In-module "Mod Settings" toolbar — inject a settings button into modded modules so users can adjust configurable feature params (e.g. minimap scale) at runtime without re-modding. Use GlobalProperty + DoActionButton.
8. Toolbar Button Config UI — visual editor for toolbar button order, icon upload, and sizing. Addresses issues with injected buttons (e.g. minimap) appearing too small or overlapping existing buttons. Should allow reordering, custom icons, and consistent sizing across all toolbar items.
9. Auto-tag pieces from PieceWindow structure — Walk the PieceWindow widget tree (TabWidget/PanelWidget/ListWidget nesting) and infer Marker traits from entryName attributes (e.g. "Russians" → mark;Side;RU, "1 MR BTG" → mark;Formation;1 MR BTG). Inject mark; traits into each PieceSlot so the Inventory window can group by Side/Formation/UnitType. Prerequisite for making Inventory useful on modules that lack Marker traits (which is most of them).

### Phase 3: Module Builder from Scratch
- React wizard-style interface for new modules
- Menu-driven component/trait selection
- Best-practice defaults and templates (leverages Phase 2 UI components)

### Phase 4: Game Logic Templates
- Pre-built automation patterns (CRT, supply, reinforcements)
- Common wargame type starters (hex, CDG, block, P2P)

### Phase 5: Module Analysis & Pattern Extraction
- ✅ Downloaded and extracted 65 modules from vassalengine.org (corpus in `vassal-reference/`)
- Extract patterns into templates and feature catalog rules

---

## Conventions

- All source code in TypeScript (strict mode)
- Use interfaces for VASSAL component schemas
- Test trait serialization against known .vmod files for validation
- Commit messages: `type(scope): description` (conventional commits)
- Branch strategy: `main` for stable, `dev` for active work, feature branches as needed

---

## Key VASSAL Resources

- Source: https://github.com/vassalengine/vassal
- Module template: https://github.com/vassalengine/vassal-module-template
- Reference manual: https://vassalengine.org/doc/latest/ReferenceManual/Concepts.html
- Designer's guide: https://vassalengine.org/doc/3.6.19/designerguide/designerguide.pdf
- Javadoc: https://vassalengine.org/javadoc/latest/
- Module library: https://vassalengine.org/wiki/Category:Modules
- Forum: https://forum.vassalengine.org/
