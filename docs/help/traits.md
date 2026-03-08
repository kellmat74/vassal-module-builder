# Piece Traits Reference

Every game piece in VASSAL is built by stacking **traits** on top of a BasicPiece. Each trait adds one capability. This reference covers all 44 traits, grouped by category.

Traits marked with **★** are the most commonly used — if you are new, start with these.

---

## Visual / Display

### ★ BasicPiece
**ID:** `piece;`

The foundation of every game piece. Holds the piece's **name** and **base image** (typically the front of the counter). Every piece must have exactly one BasicPiece, and it is always the innermost trait.

**When to use:** Always — it is required. Set the piece name to something descriptive ("3rd Panzer Division") and assign the front counter image.

---

### ★ Embellishment (Layer)
**ID:** `emb2;`

Adds additional image layers that can be toggled or cycled through. This is the **workhorse trait** for showing different piece states: full-strength/reduced, in-supply/out-of-supply, disrupted/routed, or any visual change.

**When to use:** Whenever a piece needs to show different visual states. An infantry unit with a full-strength and reduced side uses one Embellishment with two images. A unit that can be disrupted, routed, or eliminated might use multiple Embellishments for independent status indicators.

**Example:** A counter with a "Disrupted" marker overlay. The Embellishment has two states: active (no overlay) and disrupted (shows a "D" marker image on top). Players toggle it with a right-click menu command.

---

### Label (Text Label)
**ID:** `label;`

Draws a text label directly on the piece. The text can be static or dynamic (using expressions to show property values).

**When to use:** Showing a piece's current strength value, a unit ID number, or any text that should appear on the counter image itself.

**Example:** A label showing `{GetProperty("Strength")}` displays the current strength number on the counter, updating automatically when the value changes.

---

### FreeRotator
**ID:** `rotate;`

Allows the piece to be rotated to any angle (or to fixed angles like 60-degree increments for hex facings).

**When to use:** Pieces that need to face a direction — ships, aircraft, units with a facing in tactical games.

---

### Pivot
**ID:** `pivot;`

Rotates the piece around a fixed point offset from its center. Used for movement arcs and turning templates.

**When to use:** Ship turning gauges, aircraft maneuver templates, or any piece that pivots around one end.

---

### NonRectangular
**ID:** `nonRect2;`

Defines a custom shape for click detection. By default, any click within the piece's rectangular bounding box selects it. This trait uses a shape image to narrow the clickable area.

**When to use:** Irregularly shaped pieces (like area maps or non-square tokens) where you do not want clicks on transparent areas to select the piece.

---

### Area of Effect
**ID:** `AreaOfEffect;`

Draws a colored circle or highlight on the map around the piece, representing range or zone of control.

**When to use:** Showing artillery range, ZOC boundaries, or supply radius. Toggle it on/off with a key command.

**Example:** An artillery unit with a 3-hex range. Toggling Area of Effect shows a shaded circle covering all hexes within range.

---

### Footprint (Movement Trail)
**ID:** `footprint;`

Draws a line showing the path a piece has traveled during the current turn. Clears when the turn advances.

**When to use:** Games where seeing movement paths matters — verifying movement allowances, showing approach routes.

---

### Movement Markable
**ID:** `markmoved;`

Automatically marks pieces that have moved (shows a small icon or changed border). Resets via a Global Key Command.

**When to use:** Any game where you need to track which pieces have moved this turn.

---

### Border Outline
**ID:** `borderOutline;`

Draws a colored border around the piece for visual highlighting.

**When to use:** Highlighting selected pieces, marking activated units, or any temporary visual emphasis.

---

## Visibility / Access

### ★ Hideable
**ID:** `hide;`

Makes the piece invisible to other players. The owning player sees a faded version; opponents see nothing at all.

**When to use:** True hidden movement — units that are completely invisible until revealed. One side's submarines, hidden fortifications, or concealed reserves.

**Example:** In a game with fog of war, German units behind their lines are Hideable. The Allied player cannot see them until they enter an adjacent hex.

---

### ★ Obscurable
**ID:** `obs;`

Shows a generic "masked" image to other players while the owner sees the real piece. Unlike Hideable, opponents know *something* is there — they just cannot see what.

**When to use:** Face-down cards, block games (where you see the block but not its label), fog-of-war with visible but unknown units.

**Example:** In a block wargame, each block uses Obscurable. The owning player sees the unit label; the opponent sees only a plain colored block.

---

### Restricted Access
**ID:** `restrict;`

Limits which player sides can select, move, or modify the piece.

**When to use:** Preventing players from accidentally (or intentionally) moving the other side's pieces.

---

### ★ Restrict Commands
**ID:** `restrictCommands;`

Conditionally hides or disables specific right-click menu commands based on an expression. Commands still exist but become invisible or grayed out when the condition is met.

**When to use:** Hiding menu options that do not apply in the current game state. For example, hiding "Fire" when a unit has already fired, or disabling "Move" when a unit is out of supply.

**Example:** A "Fire" command is hidden when `{Fired == "true"}`. After the unit fires (setting Fired to true), the Fire option disappears from the right-click menu until the next turn resets it.

---

### Immobilized
**ID:** `immob;`

Prevents the piece from being selected or moved. It is essentially nailed to the map.

**When to use:** Terrain markers, permanent map overlays, or any piece that should never be picked up.

---

## Properties / Data

### ★ Marker
**ID:** `mark;`

Sets a static **key-value property** on the piece that never changes during play. Think of it as a permanent label.

**When to use:** Categorizing pieces — Nationality, UnitType, Class, MovementAllowance. Any fact about the piece that is fixed at design time.

**Example:** `Nationality=German`, `UnitType=Infantry`, `AttackStrength=6`. These values can be read by expressions and used in filters.

---

### ★ Dynamic Property
**ID:** `DYNPROP;`

A mutable property whose value changes during play via key commands. This is the backbone of tracking game state on individual pieces.

**When to use:** Anything that changes — current strength, supply status, ammunition count, moved/not-moved, activated/spent.

**Example:** A "Steps" Dynamic Property starts at 4. Each time the unit takes a hit, a key command decreases Steps by 1. When Steps reaches 0, a Trigger fires the Delete trait to remove the piece.

---

### Calculated Property
**ID:** `calcProp;`

A property whose value is computed automatically from an expression. It recalculates whenever referenced — you never set it manually.

**When to use:** Derived values. A "CombatStrength" that equals `{AttackStrength + TerrainModifier}`, or an "IsEliminated" flag that returns `{Steps <= 0}`.

---

### Set Global Property
**ID:** `setprop;`

Allows the piece to change a Global Property (module-level, map-level, or zone-level variable) when a key command fires.

**When to use:** Pieces that affect global game state — capturing a VP hex, changing the weather, incrementing a kill count.

---

### Set Piece Property
**ID:** `setOtherProp;`

Allows the piece to change a property on a *different* piece.

**When to use:** Advanced piece-to-piece interaction without using Global Key Commands.

---

### BasicName
**ID:** `basicName;`

Overrides the piece name shown in reports and displays, separately from the BasicPiece name.

**When to use:** When you need the display name to differ from the internal piece name, or to make the name dynamic.

---

### Comment
**ID:** `comment;`

A designer note that has no effect on gameplay. Only visible in the module editor.

**When to use:** Documenting complex piece designs for yourself or other module maintainers.

---

### Table Info
**ID:** `tableInfo;`

Attaches lookup table data to a piece.

**When to use:** Pieces that reference tabular data (e.g., looking up combat results based on odds).

---

### Property Sheet
**ID:** `propertysheet;`

Adds a multi-field property editor that players can open and modify during play.

**When to use:** Complex units with many trackable stats that would clutter the right-click menu.

---

### Translatable Message
**ID:** `transMsg;`

A text property that supports localization/translation.

**When to use:** Modules intended for multiple languages.

---

## Actions / Commands

### ★ Trigger Action (Macro)
**ID:** `macro;`

The **primary automation engine**. Fires a sequence of key commands when triggered, optionally with conditions, loops, and pre/post actions. Can execute counted loops, while-loops, or until-loops.

**When to use:** Any multi-step automated action. "When a unit takes a hit: decrease strength, check if eliminated, report result, play sound." Any time you need "if this, then do that" logic on a piece.

**Example:** A "Take Hit" Trigger: (1) decreases Steps by 1, (2) checks if Steps == 0, (3) if so fires Delete and ReportState "Unit eliminated." All from a single right-click command.

---

### Counter Global Key Command
**ID:** `globalkey;`

Sends a key command from this piece to other pieces matching a filter. Like GlobalKeyCommand on the toolbar, but initiated by a piece.

**When to use:** A piece affecting other nearby pieces — an HQ giving bonuses to units in the same zone, an artillery piece supporting adjacent defenders.

**Example:** An HQ piece with a "Rally Subordinates" command that sends a Rally key to all pieces where `{Nationality == "German" && CurrentZone == myZone}`.

---

### Global HotKey
**ID:** `globalhotkey;`

Fires a module-level hotkey (the kind that toolbar buttons listen to) from a piece action.

**When to use:** A piece action that needs to trigger toolbar-level components, like advancing the turn tracker or opening a chart window.

---

### ★ Report Action
**ID:** `report;`

Posts a formatted message to the chat log when a key command fires. Uses `$property$` substitution for dynamic text.

**When to use:** Logging game actions — "3rd Panzer moved from hex 2011 to hex 2012," "2d6 combat roll = 8." Essential for PBEM play where opponents need to see what happened.

**Example:** Format string: `$PlayerName$ moves $BasicName$ from $OldLocationName$ to $LocationName$` produces "Matt moves 3rd Panzer from 2011 to 2012" in chat.

---

### Play Sound
**ID:** `playSound;`

Plays an audio file when triggered.

**When to use:** Sound effects for combat, dice rolls, phase changes — adds atmosphere but is purely optional.

---

### Action Button
**ID:** `action;`

Draws a clickable button directly on the piece image.

**When to use:** When you want a visible, clickable control on the piece itself rather than a right-click menu option.

---

## Movement / Placement

### ★ Send to Location
**ID:** `sendto;`

Teleports the piece to a named location, grid coordinates, zone, or another piece's position.

**When to use:** "Return to base," "go to the dead pile," "enter as reinforcement at hex X" — any instant relocation.

**Example:** A "Return to Dead Pile" command sends the eliminated piece to a named zone called "Eliminated Units."

---

### Return to Deck
**ID:** `returnToDeck;`

Sends the piece back to a specific Deck (DrawPile).

**When to use:** Cards that get discarded — "Discard" sends the card to the discard pile deck.

---

### Translate
**ID:** `translate;`

Moves the piece by a fixed pixel offset (not to a named location).

**When to use:** Formation movement, nudging pieces, or precise positional adjustments.

---

### ★ Place Marker
**ID:** `placemark;`

Creates a new piece at the current piece's location.

**When to use:** Spawning informational markers (explosion markers, control flags), creating reinforcements, dropping status tokens.

**Example:** When a unit is hit, Place Marker creates a "Hit" marker on top of it.

---

### ★ Replace
**ID:** `replace;`

Removes the current piece and puts a different piece in its place, optionally carrying over property values.

**When to use:** Step reduction (replace full-strength counter with reduced counter), unit promotion, or any transformation that changes the piece definition entirely.

**Example:** A full-strength infantry division is replaced by its reduced-strength version when it takes a hit.

---

### Clone
**ID:** `clone;`

Creates an exact duplicate of the piece at the same location.

**When to use:** Splitting units, creating copies for organizational purposes.

---

### ★ Delete
**ID:** `delete;`

Removes the piece from the game entirely.

**When to use:** Eliminated units, discarded single-use markers, consumed supply tokens.

---

### Multi-Location Command
**ID:** `multiLocation;`
*(New in VASSAL 3.7)*

Sends the piece to one of several locations based on expression evaluation. Replaces complex chains of Trigger + SendToLocation.

**When to use:** Conditional destinations — reinforcements entering at different hexes based on the current turn, retreating in different directions based on terrain.

---

### Deselect
**ID:** `deselect;`

Forces the piece to be deselected after an action completes.

**When to use:** Preventing accidental drag after an automated action, or ensuring clean state after complex macros.

---

## Grouping / Organization

### ★ Prototype (Use Prototype)
**ID:** `prototype;`

Inherits all traits from a named **Prototype definition**. Prototypes are reusable trait templates — define a set of traits once, then apply them to many pieces.

**When to use:** Always, for any shared behavior. If 50 infantry units all need the same traits (Embellishment, markers, movement), define those traits in a Prototype and add a single UsePrototype trait to each piece.

**Example:** A "Standard NATO Unit" prototype defines: Embellishment (reduced side), Marker (Type), Dynamic Property (Moved), Movement Markable, Report Action. Every combat unit uses this prototype instead of duplicating those traits.

---

### Mat
**ID:** `mat;`
*(New in VASSAL 3.6)*

Designates a piece as a **surface** that other pieces can ride on. When the Mat moves, its cargo moves with it.

**When to use:** Aircraft carriers (planes ride on the carrier), transports (units ride in the transport), game boards within game boards.

---

### Mat Cargo
**ID:** `matCargo;`
*(New in VASSAL 3.6)*

Designates a piece as **cargo** that snaps to and moves with a Mat piece.

**When to use:** Paired with Mat — the planes that sit on the carrier, the units loaded in the transport.

---

### Attachment
**ID:** `attachment;`
*(New in VASSAL 3.7)*

Creates a named logical binding between pieces based on matching criteria. Attached pieces can be targeted as a group by Global Key Commands.

**When to use:** HQ-to-subordinate command chains, supply source-to-unit links, formation groupings — any logical relationship between pieces that is not based on physical location.

---

### Sub Menu
**ID:** `submenu;`

Groups multiple right-click commands into a nested sub-menu.

**When to use:** Pieces with many commands. Instead of a long flat list, group related commands: "Combat > Fire / Defend / Retreat" and "Status > Disrupt / Rally / Eliminate."

---

### Menu Separator
**ID:** `menuSep;`

Adds a visual divider line in the right-click menu.

**When to use:** Organizing a long command list into logical sections.
