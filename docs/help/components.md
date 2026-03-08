# Module Components Reference

Each entry explains **what** the component is, **when** you would use it, and gives a **concrete wargame example**.

---

## Maps

### Map

**What it is:** The primary playing surface. A Map combines one or more boards, a grid, and various sub-components (zoom controls, overview window, at-start stacks, decks). Most modules have at least one Map.

**When to use it:** Every module with a playing surface needs a Map. Use multiple Maps for games with separate strategic and tactical displays (e.g., a main map plus an off-map display).

**Example:** In *Paths of Glory*, the main Map holds the Western and Eastern front boards. Players move corps and armies across the hex grid on this map.

---

### PrivateMap

**What it is:** A Map that is only visible to one player side. Other players cannot see pieces on it.

**When to use it:** Hidden unit holding boxes, secret reserves, or planning maps where one player arranges forces before revealing them.

**Example:** In a game with hidden movement (like *Fortress Europa*), the German player has a private map showing actual unit positions, while the Allied player sees only dummy markers on the main map.

---

### PlayerHand

**What it is:** A special private map designed for card hands. Each player sees only their own hand. Cards display in a neat row rather than stacking.

**When to use it:** Any game with cards that players hold privately — card-driven games, event decks, or secret objective cards.

**Example:** In *Twilight Struggle*, each player holds a hand of strategy cards. The PlayerHand component keeps your cards private and displays them in a readable row.

---

## Piece Sources

### PieceWindow (Game Piece Palette)

**What it is:** The counter tray — a tabbed window where all available game pieces are organized for players to drag onto the map. Pieces are arranged in panels, lists, or scrollable areas.

**When to use it:** Every module needs at least one PieceWindow so players can access counters and markers. Organize pieces by type (units, markers, informational) or by nationality/faction.

**Example:** A WWII game might have tabs for "German Units," "Allied Units," and "Markers" in the palette. Players drag infantry counters from the tray onto the map to set up a scenario.

---

### SetupStack (At-Start Stack)

**What it is:** Pieces that are automatically placed on the map when a new game begins. Each At-Start Stack specifies a location and contains one or more pieces.

**When to use it:** Any piece that should be on the map from the start of a scenario — initial unit deployments, terrain markers, control markers.

**Example:** In a Bulge scenario, German panzer divisions start in specific hexes. Each starting position is an At-Start Stack containing the appropriate unit counter.

---

### DrawPile (Deck)

**What it is:** A face-down pile of pieces (usually cards) that players draw from. Supports shuffle, face-up/face-down toggle, and configurable access rules.

**When to use it:** Card decks, chit-pull cups, random event pools — any collection that players draw from during play.

**Example:** A CDG like *Hannibal* has a strategy deck. The DrawPile holds all strategy cards face-down. Players draw from it each turn. A second DrawPile serves as the discard pile.

---

## Windows and Displays

### ChartWindow

**What it is:** A separate window that displays reference charts, tables, or other images. Can contain multiple tabbed pages.

**When to use it:** CRTs (Combat Results Tables), TECs (Terrain Effects Charts), OOBs (Orders of Battle), reinforcement schedules, or any reference material players need during play.

**Example:** A hex wargame typically has a ChartWindow containing the CRT, TEC, and turn record track as separate tabs. Players open it when resolving combat.

---

### NotesWindow

**What it is:** A shared text area where players can type notes visible to all players (or keep private notes).

**When to use it:** House rules, scenario special rules, game logs, or any text players want to share.

**Example:** Players note agreed-upon house rules or track VP totals manually in the Notes window.

---

## Toolbar Controls

### DiceButton

**What it is:** A toolbar button that generates random numbers and reports results to the chat log. Configurable: number of dice, sides, plus/minus modifiers, and result format.

**When to use it:** Any time the game needs random number generation — combat resolution, random events, morale checks.

**Example:** A game using 2d6 for combat gets a DiceButton configured with 2 dice, 6 sides. Clicking it rolls and reports "** 2d6 = 8 (3,5)" in the chat.

---

### TurnTracker

**What it is:** A multi-level turn/phase tracking component. Displays the current turn, phase, and sub-phase on the toolbar. Players click to advance to the next step.

**When to use it:** Any game with a structured turn sequence. Supports numeric counters (Turn 1, 2, 3...) and named lists (Movement Phase, Combat Phase) nested to any depth.

**Example:** An IGO-UGO game has: Turn Counter (1-10) > Player (Axis/Allied) > Phase (Movement / Combat / Exploitation). The TurnTracker displays "Turn 3 — Axis — Combat Phase" and advances through the sequence.

---

### GlobalKeyCommand

**What it is:** A toolbar button that sends a key command to all pieces matching a filter expression. Fires a single action that affects many pieces at once.

**When to use it:** "Mark all units as not-moved," "flip all markers," "reset all step losses" — any global batch operation.

**Example:** At the start of each turn, a "Reset Movement" GKC sends a key command to all pieces with `Moved=true`, resetting their movement markers. One button click cleans up the entire map.

---

### Inventory

**What it is:** A searchable window that lists all pieces on a map (or all maps) with configurable grouping and filtering. Think of it as an automated Order of Battle.

**When to use it:** Force displays, VP tallying, unit tracking — any time players need a summary of what is on the map.

**Example:** An Inventory configured to group by CurrentZone and then by Nationality shows: "France > German: 3rd Panzer, 7th Infantry... Allied: 2nd Armored, 101st Airborne..."

---

### PredefinedSetup

**What it is:** A saved game state (.vsav) bundled inside the module. Players select it from the File menu to start a specific scenario with all pieces pre-placed.

**When to use it:** Multi-scenario modules where each scenario has a different starting setup. Saves players from manually placing dozens of counters.

**Example:** A module for *ASL Starter Kit* bundles a PredefinedSetup for each scenario. Selecting "Scenario S1" places all squads, leaders, and support weapons on the correct hexes.

---

## Less Common but Useful

### ToolbarMenu

Groups multiple toolbar buttons under a single dropdown menu. Keeps the toolbar clean when you have many buttons.

### MultiActionButton

Combines several toolbar buttons into one click. Useful for "advance turn" buttons that need to trigger multiple actions.

### DoActionButton

A toolbar button that fires one or more hotkeys and optionally plays a sound. Good for custom multi-step toolbar commands.

### ChessClockControl

Adds chess clock timers for timed play. Each player's clock runs during their actions.

### SpecialDiceButton

Like DiceButton, but uses custom images for die faces instead of numbers. Good for games with symbol dice (weather, action type).
