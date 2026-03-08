**VASSAL Engine Deep Dive**

Phase 0: Architecture Analysis for Module Builder Project

Prepared: March 2026 \| Source: vassalengine/vassal (GitHub, LGPL v2)

1\. Executive Summary

This document captures the results of a deep-dive analysis of the VASSAL
game engine source code (v3.7.x) from the official GitHub repository.
The goal is to build a comprehensive understanding of the engine\'s
architecture, component hierarchy, piece trait system, and extensibility
points --- knowledge that will serve as the foundation for building a
web-based, menu-driven VASSAL module creation tool.

**Key Finding:** A .vmod module file is simply a ZIP archive containing
an XML configuration file (buildFile.xml), a metadata file (moduledata),
and asset folders (images, sounds, help). The XML uses fully-qualified
Java class names as element tags, and trait definitions are stored as
semicolon-delimited strings. This means our tool can generate valid
modules in any language --- no Java required --- as long as we produce
correctly structured XML and package it as a ZIP with a .vmod extension.

2\. Module File Format (.vmod)

Understanding the physical file structure is the foundation of
everything. A .vmod file is a standard ZIP archive at the root level
containing the following:

  ----------------- -----------------------------------------------------
  **File/Folder**   **Purpose**

  buildFile.xml     The master configuration --- defines all components,
                    maps, pieces, and game logic. Every XML element tag
                    is a fully-qualified Java class name.

  moduledata        Module metadata displayed in the Module Manager:
                    name, version, VASSAL version, description, date
                    saved.

  images/           All graphic assets: map images, counter images,
                    icons. Supports SVG, PNG, GIF, JPG (PNG and SVG
                    preferred).

  sounds/           Optional sound files referenced by PlaySound traits.

  help/             Optional HTML help files for in-module documentation.

  \*.class          Optional custom Java classes for extending VASSAL
                    behavior (rare, advanced usage).
  ----------------- -----------------------------------------------------

2.1 buildFile.xml Structure

The buildFile is a hierarchical XML document. The root element is always
VASSAL.build.GameModule with attributes for module name, description,
version, VASSAL version, and a critical nextPieceSlotId counter that
must be incremented for each PieceSlot added. Every child element uses a
fully-qualified Java class name as its tag, and attributes correspond to
the class\'s configurable properties.

**Critical Implication:** Since the XML tag names ARE the Java class
names, our module builder must maintain a precise mapping of class names
to their valid attributes, allowed child components, and serialization
formats. This is the schema our tool must enforce.

2.2 moduledata Format

A simple XML file with a fixed structure:

\<data version=\"1\"\> \<version\>1.0\</version\>
\<VassalVersion\>3.7.x\</VassalVersion\>
\<dateSaved\>\[timestamp\]\</dateSaved\>
\<description\>\...\</description\> \<n\>\[module name\]\</n\> \</data\>

3\. Component Hierarchy

VASSAL uses a tree-based component architecture. Each component class
declares which child component types it will accept via
getAllowableConfigureComponents(). This hierarchy IS the buildFile XML
nesting structure. Understanding it is critical for our builder\'s menu
system.

3.1 Top-Level Components (Children of GameModule)

The root GameModule accepts these direct children, which form the main
structural elements of any module:

  ------------------------- ------------------------------ --------------------
  **Component**             **Purpose**                    **Wargame Use**

  Map                       Primary playing surface ---    Main map, strategic
                            combines boards, grids, zones  map

  PrivateMap                Map visible only to specific   Hidden unit holding
                            player sides                   boxes

  PlayerHand                Card hand visible only to      CDG card hands
                            owning player                  

  PieceWindow               Game Piece Palette --- where   Counter trays,
                            pieces are defined and         reinforcement pools
                            organized                      

  ChartWindow               Reference charts/tables        CRT, TEC, OOB charts
                            displayed in separate windows  

  DiceButton                Toolbar button to roll dice    Combat dice, random
                            with configurable reporting    events

  SpecialDiceButton         Custom dice with image faces   Weather dice, custom
                                                           combat dice

  TurnTracker               Multi-level turn/phase         Turn/phase/segment
                            tracking with advancement      tracking
                            buttons                        

  GlobalKeyCommand          Toolbar button that sends key  Mark all units, flip
                            commands to matching pieces    all markers

  StartupGlobalKeyCommand   Fires key commands             Initialize game
                            automatically on game          state
                            start/load                     

  Inventory                 Searchable piece inventory     OOB displays, force
                            window                         lists

  PredefinedSetup           Saved game scenarios bundled   Historical scenarios
                            with the module                

  NotesWindow               Shared notes for players       Game notes, house
                                                           rules

  ToolbarMenu               Drop-down menu grouping        Organize complex
                            toolbar buttons                toolbars

  DoActionButton            Button that fires multiple     Complex multi-step
                            hotkeys and plays sounds       actions

  MultiActionButton         Combines multiple toolbar      Compound commands
                            buttons into one               

  ChessClockControl         Chess clock timers for timed   Tournament play
                            play                           

  PrototypesContainer       Defines reusable piece trait   Shared unit
                            templates                      behaviors

  GlobalProperties          Module-level variables         VP tracks, weather
                            accessible by all components   state
  ------------------------- ------------------------------ --------------------

3.2 Map Sub-Components

Each Map component accepts a rich set of sub-components that control map
behavior:

- **BoardPicker** --- Manages board selection and multi-board layout.
  Contains Board definitions.

- **SetupStack (At-Start Stack)** --- Pieces pre-placed on the map when
  a new game starts. Critical for scenario setup.

- **DrawPile (Deck)** --- Card decks or draw piles with configurable
  visibility and shuffle options.

- **Zoomer** --- Map zoom controls with configurable zoom levels.

- **GlobalMap (Overview)** --- Miniature overview window showing entire
  map with viewport indicator.

- **LOS_Thread** --- Line of sight tool for checking visibility between
  hexes.

- **MapShader** --- Overlay shading on map regions (fog of war, turn of
  year effects).

- **MassKeyCommand (Map GKC)** --- GKC scoped to pieces on this specific
  map.

- **CounterDetailViewer** --- Mouseover popup showing piece details and
  stack contents.

- **Flare** --- Click-to-flash visual indicator for pointing out
  locations to opponents.

- **HighlightLastMoved** --- Visual highlight on the most recently moved
  piece.

- **StackMetrics** --- Controls how stacked pieces display (offsets,
  expansion).

- **LayeredPieceCollection** --- Controls piece draw order by game piece
  layer.

3.3 Board / Grid Architecture

The board and grid system is where the hex-and-counter magic happens.
The hierarchy is: Map → BoardPicker → Board → Grid. VASSAL supports
several grid types:

  --------------- ------------------------------------ ------------------
  **Grid Type**   **Description**                      **Key Attributes**

  HexGrid         Standard hex grid (flat-top or       hex size, x/y
                  pointy-top). Core of hex-and-counter offset, sideways,
                  wargaming.                           snap-to, color,
                                                       visible

  SquareGrid      Standard square grid.                cell size, x/y
                                                       offset, snap-to,
                                                       color, visible

  RegionGrid      Irregular regions defined by named   Region definitions
                  areas (point-to-point maps).         with coordinates

  ZonedGrid       Container for Zones, which can each  Zone definitions
                  contain their own sub-grid. Enables  with polygonal
                  mixed-grid maps.                     boundaries
  --------------- ------------------------------------ ------------------

**Key Detail:** ZonedGrid is particularly powerful for wargames. A
single board can have a ZonedGrid containing multiple Zones, each with
their own HexGrid, SquareGrid, or RegionGrid. This enables maps with a
hex main area, a point-to-point strategic display zone, and box-based
holding areas --- all on one board. Each Zone can also have Zone
Properties that affect pieces within it.

**Grid Numbering:** Both HexGrid and SquareGrid support GridNumbering
sub-components (HexGridNumbering, SquareGridNumbering) that define how
grid locations are labeled. Numbering can start from any corner, use
alphabetic or numeric systems, and support custom separators ---
essential for matching published game hex numbering.

4\. The Piece Trait System (Decorators)

This is the heart of VASSAL. Every game piece is constructed from a
BasicPiece wrapped in a chain of Decorator traits, each adding or
modifying behavior. VASSAL 3.7 provides 44 distinct trait types.
Understanding this system is essential because the trait chain IS the
piece definition, and the order of traits matters (traits earlier in the
chain can mask or override later ones).

4.1 Complete Trait Registry

Every trait has a unique ID string used for serialization. These are the
strings that appear in the buildFile. Here is the complete registry from
BasicCommandEncoder:

  ------------------------- ------------------- -------------------------------------------
  **Trait Class**           **ID**              **Purpose**

  **VISUAL / DISPLAY**                          

  BasicPiece                piece;              Core piece: base image, name. Always the
                                                innermost element.

  Embellishment             emb2;               Layer system: multi-state images (flipped,
                                                disrupted, eliminated). The workhorse of
                                                counter display.

  Labeler                   label;              Text label overlay on piece. Can use
                                                expressions for dynamic text.

  FreeRotator               rotate;             Allows piece rotation to arbitrary angles.

  Pivot                     pivot;              Rotation around a fixed pivot point (for
                                                ship/vehicle movement).

  NonRectangular            nonRect2;           Custom piece shape for selection/hit
                                                detection.

  AreaOfEffect              AreaOfEffect;       Highlights area around piece (range
                                                circles, ZOC display).

  Footprint                 footprint;          Movement trail --- shows path piece has
                                                traveled.

  MovementMarkable          markmoved;          Marks pieces that have moved this turn.

  BorderOutline             borderOutline;      Draws colored border around piece for
                                                visual highlighting.

  **VISIBILITY / ACCESS**                       

  Hideable                  hide;               Invisible to other players (fog of war /
                                                hidden units).

  Obscurable                obs;                Mask piece --- show generic back to other
                                                players (like face-down cards).

  Restricted                restrict;           Restricts which player sides can access the
                                                piece.

  RestrictCommands          restrictCommands;   Conditionally hide/disable specific menu
                                                commands.

  Immobilized               immob;              Prevents piece from being moved or
                                                selected.

  **PROPERTIES / DATA**                         

  Marker                    mark;               Static key-value property. Immutable during
                                                play. Used for unit type, nationality, etc.

  DynamicProperty           DYNPROP;            Mutable property that can change during
                                                play. The backbone of game state tracking.

  CalculatedProperty        calcProp;           Expression-computed property. Recalculated
                                                automatically. Derived values.

  SetGlobalProperty         setprop;            Allows piece to modify global/zone/map
                                                properties.

  SetPieceProperty          setOtherProp;       Allows piece to modify properties on OTHER
                                                pieces.

  BasicName                 basicName;          Separate configurable name for the piece.

  Comment                   comment;            Designer comment --- no gameplay effect.
                                                Documentation only.

  TableInfo                 tableInfo;          Lookup table --- piece can reference
                                                tabular data.

  PropertySheet             propertysheet;      Multi-field property editor accessible in
                                                play.

  TranslatableMessage       transMsg;           Localizable text message property.

  **ACTIONS / COMMANDS**                        

  TriggerAction             macro;              MACRO --- fires sequence of key commands.
                                                Supports looping and conditional execution.
                                                The primary automation engine.

  CounterGlobalKeyCommand   globalkey;          Piece-level GKC: sends commands to other
                                                matching pieces.

  GlobalHotKey              globalhotkey;       Fires a module-level hotkey from a piece
                                                action.

  ReportState               report;             Posts formatted message to chat log when
                                                triggered.

  PlaySound                 playSound;          Plays audio file when triggered.

  ActionButton              action;             Clickable button drawn directly on the
                                                piece.

  DoActionButton (trait)    doAction;           \[Note: this is the module-level component,
                                                not a trait\]

  **MOVEMENT / PLACEMENT**                      

  SendToLocation            sendto;             Teleports piece to named location, grid
                                                coordinates, or another piece\'s location.

  ReturnToDeck              returnToDeck;       Returns piece to a specific Deck.

  Translate                 translate;          Moves piece by fixed offset (for formation
                                                movement).

  PlaceMarker               placemark;          Creates a new piece at current location
                                                (spawn informational markers, etc.).

  Replace                   replace;            Replaces piece with a different piece
                                                definition (step reduction, promotion).

  Clone                     clone;              Creates an exact duplicate of the piece.

  Delete                    delete;             Removes piece from game.

  MultiLocationCommand      multiLocation;      Sends piece to one of multiple locations
                                                based on conditions (NEW in 3.7).

  Deselect                  deselect;           Forces piece deselection.

  **GROUPING /                                  
  ORGANIZATION**                                

  Mat                       mat;                Designates piece as a Mat --- other pieces
                                                placed on it move with it (NEW in 3.6).

  MatCargo                  matCargo;           Designates piece as cargo that snaps to and
                                                moves with a Mat (NEW in 3.6).

  Attachment                attachment;         Creates logical attachments between pieces
                                                for GKC targeting (NEW in 3.7).

  UsePrototype              prototype;          Inherits traits from a named Prototype
                                                definition. Essential for maintainability.

  SubMenu                   submenu;            Groups piece commands into a right-click
                                                sub-menu.

  MenuSeparator             menuSep;            Visual separator line in right-click menu.
  ------------------------- ------------------- -------------------------------------------

4.2 Trait Serialization Format

Traits are serialized as semicolon-delimited strings within the
buildFile. The format is: \[TraitID\]\[encoded parameters\]. Parameters
are encoded using VASSAL\'s SequenceEncoder class which handles escaping
of special characters. For example, a Marker trait defining nationality
might serialize as:

mark;Nationality=German

A TriggerAction (macro) with looping would be a much longer string
encoding the trigger conditions, action keys, loop parameters, and
property filters. The SequenceEncoder uses backslash escaping and
comma/semicolon delimiters internally.

**For our builder:** We need to implement a SequenceEncoder-compatible
serializer. The encoding rules are deterministic and documented in the
Java source. This is a one-time effort that unlocks correct generation
of all trait definitions.

4.3 Trait Order Matters

The Decorator pattern means traits wrap each other like layers. When
VASSAL processes a command or draws a piece, it traverses the chain from
outermost to innermost. This means:

- Traits that restrict access (Restricted, RestrictCommands) should be
  near the outside so they intercept commands before they reach inner
  traits.

- Embellishments (visual layers) are processed in order, with later ones
  drawing on top of earlier ones.

- TriggerAction macros fire actions against the piece as-configured at
  their position in the chain.

- UsePrototype essentially injects a sub-chain of traits at its
  position.

**Builder opportunity:** Our tool can enforce best-practice trait
ordering automatically, preventing common pitfalls that trip up new
module designers. This is one of the most impactful \'best practices\'
features we can offer.

5\. The Expression & Property System

VASSAL has a sophisticated expression evaluation system that is
essential for automation. There are two expression formats, plus a rich
property namespace.

5.1 Expression Types

**BeanShell Expressions** (enclosed in {curly braces}): Full programming
expressions supporting arithmetic, string manipulation, comparison
operators, and function calls. Example: {GetProperty(\"Strength\") \> 3
&& CurrentMap == \"Main Map\"}

**Old-Style Formatted Strings** (using \$dollar signs\$): Simple
property substitution. Example: \$PlayerName\$ attacks \$BasicName\$ in
\$LocationName\$. Still widely used in report formats.

The BeanShell engine supports a wide range of functions including:
GetProperty(), SumStack(), Sum(), Count(), Alert(), and more. It can
reference any piece property, system property, or global property.

5.2 Property Namespaces

Properties cascade through multiple scopes:

- **Piece Properties:** Defined by traits (Marker, DynamicProperty,
  CalculatedProperty) and system properties (BasicName, LocationName,
  CurrentMap, CurrentZone, CurrentBoard, OldLocationName, etc.)

- **Zone Properties:** Defined on Zone components. Accessible to pieces
  in that zone.

- **Map Properties:** Defined on Map components via GlobalProperties
  sub-component.

- **Module Properties:** Top-level GlobalProperties. Accessible
  everywhere.

- **System Properties:** Built-in properties like PlayerName,
  PlayerSide, etc.

- **Scenario Properties (NEW 3.7):** Configurable at game start via a
  dialog. Types: Boolean, Number, String, List. Allows scenario-specific
  setup without separate save files.

**Builder opportunity:** Scenario Properties are brand new (2023) and
likely underused. Our builder could make them a first-class feature for
scenario configuration, replacing the common pattern of separate .vsav
files for each scenario variation.

6\. Turn Tracking System

The TurnTracker is a multi-level system that models game turn
structures. It supports nested levels:

- **CounterTurnLevel:** Numeric counter (Turn 1, 2, 3\...). Configurable
  start, maximum, and wrap-around.

- **ListTurnLevel:** Named list (Movement Phase, Combat Phase,
  Exploitation Phase). Cycles through defined items.

- **TurnGlobalHotkey:** Fires a hotkey when a specific turn level is
  reached. Enables automated phase-change effects.

Multiple levels can be nested, e.g., a CounterTurnLevel for game turns
containing a ListTurnLevel for phases, containing another ListTurnLevel
for sub-phases. Each level can trigger hotkeys on change, enabling
automated turn sequence events.

**Builder opportunity:** We can pre-configure common wargame turn
structures: IGO-UGO (Player 1 movement, combat, exploitation, then
Player 2), impulse-based, card-driven activation, operations-based, and
chit-pull systems. This alone saves hours of module design time.

7\. Underused & Advanced Features

Based on the source code analysis, several powerful features are likely
underutilized in the existing module library. These represent
opportunities for our builder to surface capabilities that most module
designers haven\'t explored.

7.1 Mat / MatCargo System (Added 3.6, 2021)

Designed for pieces that act as surfaces for other pieces. When a Mat
moves, all its Cargo pieces move with it. This is ideal for: aircraft
carriers with planes, transport units carrying cargo, game boards within
game boards, or any container/contents relationship. Most hex wargame
modules pre-date this feature.

7.2 Attachment System (Added 3.7, 2023)

Creates logical bindings between pieces that can be targeted by GKCs. An
Attachment defines a named relationship and matching criteria. Attached
pieces can then be targeted as a group. This enables: HQ-to-subordinate
command chains, supply lines between depot and unit, formation
groupings, and parent-child piece relationships.

7.3 MultiLocationCommand (Added 3.7, 2023)

Allows a piece to send itself to one of several locations based on
expression evaluation. This is a single trait replacing what previously
required multiple TriggerAction + SendToLocation combinations. Ideal
for: conditional reinforcement entry points, retreat result movement, or
any situation where a piece\'s destination depends on game state.

7.4 Scenario Properties (Added 3.7, 2023)

Configurable properties presented to players in a dialog when starting a
new game. Supports Boolean (checkboxes), Number (spinners), String (text
fields), and List (dropdowns). These let module designers create
scenario variants without separate saved game files. Use cases: optional
rules toggles, handicap settings, scenario selection within a single
module.

7.5 TriggerAction Looping

Many module designers use TriggerAction as a simple macro, but it
supports counted loops, while-expression loops, and until-expression
loops with pre/post-loop key commands. This enables: iterating over
stacked pieces, repeating combat for multi-round battles, processing
supply chains, and any repetitive game operation.

7.6 CalculatedProperty + Expression Engine

CalculatedProperty can reference any property and perform arbitrary
BeanShell calculations. Combined with SumStack(), Count(), and other
aggregate functions, this enables: automatic combat odds calculation,
supply status computation, stacking limit enforcement display, and
real-time unit capability summaries --- all without custom Java code.

7.7 Game Piece Image Definitions

VASSAL includes a built-in counter image generator (GamePieceImage,
GamePieceLayout) that can create pieces from NATO symbols, colored
shapes, text items, and other primitives without external image editing.
While basic, this could be a rapid prototyping feature in our builder.

8\. Codebase Statistics

A snapshot of the VASSAL engine codebase scope:

  -------------------------------------- --------------------------------
  **Area**                               **Count**

  Build package classes (components +    255 Java files
  configuration)                         

  Counters package (piece traits +       101 Java files
  behavior)                              

  Distinct Decorator (Trait) subclasses  44 trait types

  Top-level module components            21 component types

  Map sub-components                     20 component types

  Grid types                             4 (Hex, Square, Region, Zoned)

  Expression engine classes              18 Java files

  Turn tracker component types           5 classes
  -------------------------------------- --------------------------------

9\. Implications for the Module Builder Tool

Based on this analysis, here are the key architectural decisions and
priorities for our web-based module builder:

9.1 What We Must Build

- **SequenceEncoder port:** A JavaScript/Python implementation of
  VASSAL\'s SequenceEncoder that can serialize trait definitions
  identically to the Java version. This is the most critical piece ---
  without it, we can\'t generate valid piece definitions.

- **Component schema registry:** A complete mapping of every Buildable
  component to its allowed attributes, attribute types, default values,
  and valid child components. This drives the menu system.

- **Trait chain builder:** A visual/guided interface for assembling
  piece traits in correct order with proper serialization. Should
  enforce best-practice ordering.

- **XML generator:** Produces valid buildFile.xml from the component
  tree.

- **ZIP packager:** Assembles the final .vmod from buildFile.xml,
  moduledata, and asset folders.

9.2 Best-Practice Templates We Can Offer

- **Hex wargame starter:** Pre-configured with hex grid, CRT chart
  window, turn tracker, OOB inventory, and standard piece prototypes
  (infantry, armor, artillery, HQ with common traits).

- **Card-Driven Game (CDG):** PlayerHands, card decks, discard piles,
  event card prototypes with play/discard actions.

- **Block wargame:** Pieces using Obscurable for block fog-of-war, with
  rotation for step losses.

- **Point-to-point:** RegionGrid with named locations and movement along
  defined connections.

- **Multi-map operational:** Multiple Map components with inter-map
  movement and strategic/tactical layers.

9.3 Automation Patterns to Encode

- **Combat Resolution:** DynamicProperty for strength/defense,
  CalculatedProperty for odds, TriggerAction for CRT lookup, and
  Replace/Embellishment for results (step loss, retreat, elimination).

- **Supply checking:** Attachment system linking supply sources to
  units, with CalculatedProperty showing supply status and
  RestrictCommands disabling unsupplied actions.

- **Reinforcement scheduling:** TurnTracker with TurnGlobalHotkey
  triggering StartupGlobalKeyCommand patterns to reveal reinforcement
  pieces at correct turns.

- **Stacking limits:** CalculatedProperty using SumStack() with
  RestrictCommands to prevent overstacking.

- **Victory point tracking:** GlobalProperties for VP counters,
  SetGlobalProperty on piece traits for VP-contributing units, and
  Inventory for automatic VP tallying.

10\. Next Steps: Phase 1 Plan

With this foundation in place, Phase 1 development should proceed in
this order:

1.  **1. Port SequenceEncoder to JavaScript.** Study the Java
    SequenceEncoder class, implement an identical encoder/decoder in JS,
    and validate against known module trait strings extracted from real
    .vmod files.

2.  **2. Build the Component Schema Registry.** Extract all
    getAllowableConfigureComponents() and
    getAttributeNames()/getAttributeTypes() from the source into a JSON
    schema definition that drives the builder UI.

3.  **3. Implement the .vmod generator.** Write the XML serializer and
    ZIP packager. Validate output by opening generated modules in
    VASSAL\'s Module Editor.

4.  **4. Build the React web UI.** Start with a wizard-style flow: Game
    Type → Map Setup → Piece Definition → Game Logic → Package &
    Download.

5.  **5. Download and analyze 10-20 high-quality modules** from the
    VASSAL library to extract best-practice patterns for our templates.
    Priority titles: Paths of Glory, Twilight Struggle, Combat
    Commander, A Distant Plain, and other well-regarded implementations.

*This document will be updated as we progress through each phase. The
source code analysis captured here serves as our reference specification
for the VASSAL module format.*
