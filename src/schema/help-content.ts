/**
 * Structured help content for the VASSAL Module Builder UI.
 *
 * Provides tooltip summaries, full descriptions, examples, and tips
 * for components, traits, and concepts. The React UI consumes these
 * entries to render contextual help panels, tooltips, and sidebar content.
 */

export interface HelpEntry {
  id: string;
  title: string;
  summary: string;
  description: string;
  examples?: string[];
  tips?: string[];
  seeAlso?: string[];
}

// ---------------------------------------------------------------------------
// Component Help
// ---------------------------------------------------------------------------

export const componentHelp: Map<string, HelpEntry> = new Map([
  [
    'Map',
    {
      id: 'Map',
      title: 'Map',
      summary: 'The primary playing surface that combines boards, grids, and game pieces.',
      description:
        'A Map is the main playing area of your module. It holds one or more Boards (each with a grid), ' +
        'plus sub-components like At-Start Stacks, Decks, zoom controls, and an overview window. ' +
        'Most modules have at least one Map. Use multiple Maps for games with separate strategic and tactical displays.',
      examples: [
        'A hex wargame with a single main map showing the full battlefield.',
        'An operational game with a main map and a separate off-map reinforcement display.',
      ],
      tips: [
        'Add a Zoomer sub-component so players can zoom in and out.',
        'Add a CounterDetailViewer so players can mouse over stacks to see contents.',
      ],
      seeAlso: ['PrivateMap', 'PlayerHand', 'HexGrid', 'SetupStack'],
    },
  ],
  [
    'PrivateMap',
    {
      id: 'PrivateMap',
      title: 'Private Map',
      summary: 'A map visible only to one player side, used for hidden units or secret planning.',
      description:
        'A PrivateMap works like a regular Map but is restricted to a specific player side. ' +
        'Other players cannot see any pieces on it. Use it for hidden unit holding boxes, ' +
        'secret reserves, or planning areas.',
      examples: [
        'A hidden movement game where one side places actual units on a private map while dummy markers appear on the main map.',
      ],
      seeAlso: ['Map', 'PlayerHand'],
    },
  ],
  [
    'PlayerHand',
    {
      id: 'PlayerHand',
      title: 'Player Hand',
      summary: 'A private card hand visible only to its owning player.',
      description:
        'PlayerHand is a special private map designed for card hands. Cards display in a readable row ' +
        'rather than stacking. Each player sees only their own hand. Essential for card-driven games.',
      examples: [
        'In a CDG, each player holds strategy cards privately. The PlayerHand keeps them hidden from the opponent.',
      ],
      seeAlso: ['Map', 'PrivateMap', 'DrawPile'],
    },
  ],
  [
    'PieceWindow',
    {
      id: 'PieceWindow',
      title: 'Game Piece Palette',
      summary: 'The counter tray where players find and drag pieces onto the map.',
      description:
        'The PieceWindow (Game Piece Palette) is a tabbed window containing all available game pieces. ' +
        'Players drag counters and markers from here onto the map. Organize pieces into panels by type, ' +
        'nationality, or function. Every module needs at least one.',
      examples: [
        'Tabs for "German Units," "Allied Units," and "Markers" with counters organized in scrollable lists.',
      ],
      tips: [
        'Group pieces logically — by nationality, unit type, or scenario.',
        'Include generic markers (hit markers, control flags) in a separate tab.',
      ],
      seeAlso: ['SetupStack', 'DrawPile'],
    },
  ],
  [
    'ChartWindow',
    {
      id: 'ChartWindow',
      title: 'Chart Window',
      summary: 'Displays reference charts and tables (CRT, TEC) in a separate window.',
      description:
        'ChartWindow opens a separate window with reference material — images of charts and tables ' +
        'that players consult during play. Supports multiple tabbed pages. Add chart images as tab contents.',
      examples: [
        'A CRT (Combat Results Table), TEC (Terrain Effects Chart), and reinforcement schedule as three tabs.',
      ],
      seeAlso: ['Map'],
    },
  ],
  [
    'DiceButton',
    {
      id: 'DiceButton',
      title: 'Dice Button',
      summary: 'A toolbar button that rolls dice and reports results to the chat log.',
      description:
        'DiceButton adds a button to the toolbar that generates random numbers. Configure the number of dice, ' +
        'number of sides, and any modifiers. Results are reported to the chat log automatically.',
      examples: [
        '2d6 for combat resolution.',
        '1d10 for morale checks with a +2 modifier.',
      ],
      seeAlso: ['GlobalKeyCommand'],
    },
  ],
  [
    'TurnTracker',
    {
      id: 'TurnTracker',
      title: 'Turn Tracker',
      summary: 'Tracks the current game turn, phase, and sub-phase with a toolbar display.',
      description:
        'TurnTracker is a multi-level component that models your game\'s turn structure. ' +
        'Nest numeric counters (Turn 1, 2, 3...) and named lists (Movement Phase, Combat Phase) ' +
        'to any depth. Players click to advance. Can fire hotkeys at specific turn levels for automation.',
      examples: [
        'IGO-UGO: Turn Counter > Player (Axis/Allied) > Phase (Movement/Combat/Exploitation).',
        'Impulse game: Turn Counter > Impulse Counter > Phase List.',
      ],
      tips: [
        'Add TurnGlobalHotkey sub-components to fire automated actions at phase changes.',
      ],
      seeAlso: ['GlobalKeyCommand'],
    },
  ],
  [
    'DrawPile',
    {
      id: 'DrawPile',
      title: 'Deck (Draw Pile)',
      summary: 'A face-down pile of cards or chits that players draw from during play.',
      description:
        'DrawPile creates a deck on the map that players draw from. Supports shuffle, ' +
        'face-up/face-down display, and configurable access rules (who can look, who can draw). ' +
        'Place it on a Map as a sub-component.',
      examples: [
        'A strategy card deck in a CDG — players draw cards each turn.',
        'A chit-pull cup for activation — draw chits to determine which formation activates.',
      ],
      tips: ['Create a second DrawPile as a discard pile and use ReturnToDeck traits on cards.'],
      seeAlso: ['PlayerHand', 'SetupStack'],
    },
  ],
  [
    'SetupStack',
    {
      id: 'SetupStack',
      title: 'At-Start Stack',
      summary: 'Pieces automatically placed on the map when a new game begins.',
      description:
        'SetupStack defines pieces that appear on the map at game start. Specify a map location ' +
        'and add one or more pieces. When a player starts a new game, these pieces are already in place.',
      examples: [
        'German panzer divisions starting in their historical hexes for a Bulge scenario.',
      ],
      tips: ['Use PredefinedSetup for complex multi-scenario setups instead of many At-Start Stacks.'],
      seeAlso: ['PieceWindow', 'PredefinedSetup'],
    },
  ],
  [
    'GlobalKeyCommand',
    {
      id: 'GlobalKeyCommand',
      title: 'Global Key Command',
      summary: 'A toolbar button that sends a command to all pieces matching a filter.',
      description:
        'GlobalKeyCommand adds a toolbar button that, when clicked, sends a key command to every piece ' +
        'matching a BeanShell filter expression. Use it for batch operations that affect many pieces at once.',
      examples: [
        '"Reset Movement" — sends a reset command to all pieces where {HasMoved == "true"}.',
        '"Flip All Markers" — toggles all informational markers on the map.',
      ],
      seeAlso: ['TurnTracker', 'DiceButton'],
    },
  ],
  [
    'Inventory',
    {
      id: 'Inventory',
      title: 'Inventory (Piece List)',
      summary: 'A searchable window listing all pieces on the map, grouped and filtered.',
      description:
        'Inventory opens a window showing a categorized list of all pieces. Configure grouping ' +
        '(by zone, nationality, type) and filtering. Useful as an automated Order of Battle display.',
      examples: [
        'An OOB window grouping units by Nationality, then by CurrentZone.',
      ],
      seeAlso: ['GlobalKeyCommand'],
    },
  ],
  [
    'PredefinedSetup',
    {
      id: 'PredefinedSetup',
      title: 'Predefined Setup (Scenario)',
      summary: 'A saved game state bundled in the module for one-click scenario setup.',
      description:
        'PredefinedSetup includes a .vsav saved game file inside the module. Players select it from ' +
        'the File menu to instantly set up a specific scenario with all pieces pre-placed. ' +
        'Essential for modules with multiple scenarios.',
      examples: [
        'A module with 5 scenarios — each PredefinedSetup places the correct units for that scenario.',
      ],
      tips: ['Create the setup by playing a new game, placing all pieces, then saving it as a .vsav.'],
      seeAlso: ['SetupStack'],
    },
  ],
]);

// ---------------------------------------------------------------------------
// Trait Help
// ---------------------------------------------------------------------------

export const traitHelp: Map<string, HelpEntry> = new Map([
  [
    'BasicPiece',
    {
      id: 'BasicPiece',
      title: 'Basic Piece',
      summary: 'The core of every piece — holds the name and base image.',
      description:
        'BasicPiece is the foundation of every game piece. It defines the piece\'s name and base image ' +
        '(the front of the counter). Every piece has exactly one BasicPiece as its innermost trait. ' +
        'All other traits wrap around it.',
      tips: ['Set the name to something descriptive that will appear in reports and inventory lists.'],
      seeAlso: ['Embellishment', 'Prototype'],
    },
  ],
  [
    'Embellishment',
    {
      id: 'Embellishment',
      title: 'Embellishment (Layer)',
      summary: 'Adds switchable image layers for showing different piece states.',
      description:
        'Embellishment is the workhorse visual trait. It adds image layers that can be toggled or cycled ' +
        'through key commands. Use it for full-strength/reduced sides, status overlays (disrupted, spent), ' +
        'or any visual change that does not replace the piece entirely.',
      examples: [
        'An infantry counter with full-strength and reduced-strength images.',
        'A "Disrupted" overlay that appears on top of the base counter image.',
      ],
      tips: [
        'For a simple two-sided counter, use one Embellishment with two levels.',
        'Multiple Embellishments on one piece work as independent layers (e.g., status + strength).',
      ],
      seeAlso: ['BasicPiece', 'Replace'],
    },
  ],
  [
    'Marker',
    {
      id: 'Marker',
      title: 'Marker (Static Property)',
      summary: 'Sets a permanent key-value property on the piece that never changes.',
      description:
        'Marker defines a static property — a name-value pair that is fixed at design time and cannot change ' +
        'during play. Use it for categorization: Nationality, UnitType, MovementAllowance, or any fact ' +
        'that is permanently true about the piece.',
      examples: [
        'Nationality=German — used in filter expressions to target German units.',
        'UnitType=Infantry — allows GKCs to affect only infantry.',
      ],
      seeAlso: ['DynamicProperty', 'CalculatedProperty'],
    },
  ],
  [
    'DynamicProperty',
    {
      id: 'DynamicProperty',
      title: 'Dynamic Property',
      summary: 'A mutable property whose value changes during play via key commands.',
      description:
        'DynamicProperty tracks changing game state on a piece. Define a property name, initial value, ' +
        'and key commands that modify it (increment, decrement, set to a specific value, or prompt the player). ' +
        'This is the backbone of per-piece state tracking.',
      examples: [
        'Steps=4, decreased by 1 each time the unit takes a hit.',
        'Status with values Fresh/Spent, toggled by a key command.',
      ],
      tips: ['Combine with Restrict Commands to disable actions based on property values.'],
      seeAlso: ['Marker', 'CalculatedProperty', 'TriggerAction'],
    },
  ],
  [
    'TriggerAction',
    {
      id: 'TriggerAction',
      title: 'Trigger Action (Macro)',
      summary: 'Fires a sequence of key commands, with optional conditions and loops.',
      description:
        'TriggerAction is the primary automation engine for pieces. When triggered by a key command, ' +
        'it checks an optional condition and then fires one or more key commands in sequence. ' +
        'Supports counted loops, while-loops, and until-loops for iteration. Use it to chain together ' +
        'multi-step actions.',
      examples: [
        'A "Take Hit" macro that decrements Steps, checks for elimination, and reports the result.',
        'A looping trigger that processes each piece in a stack sequentially.',
      ],
      tips: [
        'Break complex logic into multiple simple Triggers that call each other.',
        'Use the condition field to create if/else branching.',
      ],
      seeAlso: ['DynamicProperty', 'ReportState', 'Delete'],
    },
  ],
  [
    'Prototype',
    {
      id: 'Prototype',
      title: 'Use Prototype',
      summary: 'Inherits all traits from a reusable Prototype definition.',
      description:
        'UsePrototype inserts all traits from a named Prototype definition at this position in the trait stack. ' +
        'Prototypes are defined once in the PrototypesContainer and shared across many pieces. ' +
        'Change the Prototype, and every piece using it updates automatically.',
      examples: [
        'A "Standard NATO Unit" prototype shared by all 50 combat units in the module.',
      ],
      tips: [
        'Layer Prototypes: "Base Unit" > "NATO Counter" > "German Infantry" for maximum reuse.',
        'Always prefer Prototypes over copying traits between pieces.',
      ],
      seeAlso: ['BasicPiece', 'Embellishment'],
    },
  ],
  [
    'Hideable',
    {
      id: 'Hideable',
      title: 'Hideable (Invisible)',
      summary: 'Makes the piece completely invisible to other players.',
      description:
        'Hideable allows a piece to be hidden from other players. The owning player sees a faded version; ' +
        'opponents see nothing. Use it for true hidden movement where the opponent should not even know ' +
        'a piece exists at a location.',
      seeAlso: ['Obscurable', 'RestrictCommands'],
    },
  ],
  [
    'Obscurable',
    {
      id: 'Obscurable',
      title: 'Obscurable (Masked)',
      summary: 'Shows a generic back image to opponents while the owner sees the real piece.',
      description:
        'Obscurable displays a "masked" image to other players — they know something is there but cannot see ' +
        'what it is. The owning player sees the real piece. Used for face-down cards, block games, ' +
        'and fog-of-war with visible but unknown units.',
      examples: [
        'Block wargame pieces — opponent sees a plain colored block; owner sees the unit label.',
      ],
      seeAlso: ['Hideable', 'RestrictCommands'],
    },
  ],
  [
    'RestrictCommands',
    {
      id: 'RestrictCommands',
      title: 'Restrict Commands',
      summary: 'Conditionally hides or disables right-click menu commands based on game state.',
      description:
        'RestrictCommands uses a BeanShell expression to hide or disable specific menu commands. ' +
        'When the condition is true, the named commands become invisible or grayed out. ' +
        'Place this trait near the outside of the trait stack so it intercepts commands early.',
      examples: [
        'Hide the "Fire" command when {HasFired == "true"} — re-enable it when the turn resets.',
      ],
      tips: ['Place near the outermost position in the trait stack for reliable command interception.'],
      seeAlso: ['DynamicProperty', 'TriggerAction'],
    },
  ],
  [
    'SendToLocation',
    {
      id: 'SendToLocation',
      title: 'Send to Location',
      summary: 'Teleports the piece to a named location, grid reference, or another piece.',
      description:
        'SendToLocation instantly moves the piece to a specified destination: a named zone, ' +
        'grid coordinates, a specific board location, or the position of another piece. ' +
        'Triggered by a key command.',
      examples: [
        'A "Return to Dead Pile" command that sends eliminated units to a holding zone.',
        'A "Deploy as Reinforcement" command that sends the piece to a specific hex.',
      ],
      seeAlso: ['ReturnToDeck', 'Delete'],
    },
  ],
  [
    'PlaceMarker',
    {
      id: 'PlaceMarker',
      title: 'Place Marker',
      summary: 'Creates a new piece at the current piece\'s location.',
      description:
        'PlaceMarker spawns a new piece (defined in the module) at the location of the piece that triggers it. ' +
        'Use it to drop informational markers, spawn reinforcements, or create status tokens.',
      examples: [
        'When a unit is hit, Place Marker creates a "Hit" marker on top of it.',
        'An HQ "Deploy" action that spawns a supply depot at the HQ\'s location.',
      ],
      seeAlso: ['Replace', 'Delete', 'Clone'],
    },
  ],
  [
    'Replace',
    {
      id: 'Replace',
      title: 'Replace With Other',
      summary: 'Removes this piece and puts a different piece definition in its place.',
      description:
        'Replace swaps the current piece for a completely different piece definition, optionally ' +
        'carrying over specified property values. Use it when a piece transforms into something ' +
        'fundamentally different.',
      examples: [
        'A full-strength division replaced by its reduced-strength version (different counter, different stats).',
        'An infantry unit that promotes to elite status with different capabilities.',
      ],
      tips: ['For simple image changes (flip/reduce), prefer Embellishment over Replace.'],
      seeAlso: ['Embellishment', 'Delete', 'PlaceMarker'],
    },
  ],
  [
    'Delete',
    {
      id: 'Delete',
      title: 'Delete',
      summary: 'Removes the piece from the game entirely.',
      description:
        'Delete permanently removes the piece when triggered by a key command. ' +
        'Use it for eliminated units, consumed supply tokens, or discarded single-use markers. ' +
        'The piece is gone — there is no undo.',
      tips: ['Place Report Action before Delete in the trait stack so the report fires before the piece is removed.'],
      seeAlso: ['Replace', 'SendToLocation'],
    },
  ],
  [
    'ReportState',
    {
      id: 'ReportState',
      title: 'Report Action',
      summary: 'Posts a formatted message to the chat log when triggered.',
      description:
        'ReportState sends a message to the chat log using $property$ substitution for dynamic text. ' +
        'Essential for PBEM (play-by-email) so opponents can see what actions were taken.',
      examples: [
        '"$PlayerName$ moves $BasicName$ from $OldLocationName$ to $LocationName$"',
        '"$BasicName$ fires at $target$ — result: $CombatResult$"',
      ],
      tips: ['Add Report Action to every meaningful player action for PBEM compatibility.'],
      seeAlso: ['TriggerAction', 'DynamicProperty'],
    },
  ],
  [
    'Label',
    {
      id: 'Label',
      title: 'Text Label',
      summary: 'Draws a text overlay on the piece, optionally using dynamic expressions.',
      description:
        'Label draws text directly on the piece image. The text can be static or dynamic ' +
        '(using expressions like $Strength$ or {GetProperty("Strength")} to show current values). ' +
        'Configure font, size, color, and position.',
      examples: [
        'A strength value displayed in the bottom-right corner of the counter.',
        'A unit ID label that updates when the piece is renamed.',
      ],
      seeAlso: ['Embellishment', 'DynamicProperty'],
    },
  ],
]);

// ---------------------------------------------------------------------------
// Concept Help (Grids, Expressions, General Concepts)
// ---------------------------------------------------------------------------

export const conceptHelp: Map<string, HelpEntry> = new Map([
  [
    'HexGrid',
    {
      id: 'HexGrid',
      title: 'Hex Grid',
      summary: 'A hexagonal grid — the standard for hex-and-counter wargames.',
      description:
        'HexGrid overlays hexagonal cells on a board. Pieces snap to hex centers. ' +
        'Supports flat-top (default, most wargames) and pointy-top (sideways=true) orientations. ' +
        'Configure hex size, offset, visibility, and grid numbering to match your map image.',
      examples: [
        'Flat-top hexes for a standard GMT wargame map.',
        'Pointy-top hexes for a Commands & Colors style game.',
      ],
      tips: [
        'Measure hex width in pixels from your map image to set the correct hex size.',
        'Use Grid Numbering to match the printed hex numbers on your map.',
      ],
      seeAlso: ['SquareGrid', 'ZonedGrid', 'GridNumbering'],
    },
  ],
  [
    'SquareGrid',
    {
      id: 'SquareGrid',
      title: 'Square Grid',
      summary: 'A rectangular grid of square cells for tactical or area games.',
      description:
        'SquareGrid overlays a regular grid of square cells. Pieces snap to cell centers. ' +
        'Configure cell size, offset, visibility, and optional grid numbering.',
      examples: ['A tactical game like Panzer Leader with square-cell movement.'],
      seeAlso: ['HexGrid', 'ZonedGrid'],
    },
  ],
  [
    'RegionGrid',
    {
      id: 'RegionGrid',
      title: 'Region Grid (Point-to-Point)',
      summary: 'An irregular grid of named locations for point-to-point movement games.',
      description:
        'RegionGrid defines named points at specific pixel coordinates on the map. ' +
        'There are no regular cells — each region is a named snap-to location. ' +
        'Used for point-to-point maps where pieces move between cities, bases, or strategic points.',
      examples: [
        'A map of the Mediterranean with named cities (Rome, Carthage, Alexandria) as regions.',
      ],
      seeAlso: ['HexGrid', 'ZonedGrid'],
    },
  ],
  [
    'ZonedGrid',
    {
      id: 'ZonedGrid',
      title: 'Zoned Grid',
      summary: 'Divides a board into zones, each with its own sub-grid type.',
      description:
        'ZonedGrid is a container that divides a board into polygonal Zones. Each Zone can have its own ' +
        'sub-grid (HexGrid, SquareGrid, or RegionGrid) and Zone Properties. ' +
        'Use it for maps that mix grid types: a hex main area with box-based holding areas.',
      examples: [
        'A board with a hex battlefield zone, a turn track zone (square grid), and a dead pile zone (single region).',
      ],
      tips: ['Zone Properties let you define terrain effects that automatically apply to pieces in that zone.'],
      seeAlso: ['HexGrid', 'SquareGrid', 'RegionGrid'],
    },
  ],
  [
    'GridNumbering',
    {
      id: 'GridNumbering',
      title: 'Grid Numbering',
      summary: 'Configures how grid locations are labeled to match printed hex or cell numbers.',
      description:
        'Grid Numbering controls the text labels for hex or square grid locations. ' +
        'Configure starting numbers, starting corner, row/column order, digit count, separators, ' +
        'and alphabetic vs. numeric axes. Essential for matching the printed numbers on your game map.',
      tips: [
        'Find hex 0101 on your printed map and note which corner it is in — configure the starting corner to match.',
        'Verify several hexes across the map after configuring to catch row/column order mistakes.',
      ],
      seeAlso: ['HexGrid', 'SquareGrid'],
    },
  ],
  [
    'BeanShellExpressions',
    {
      id: 'BeanShellExpressions',
      title: 'BeanShell Expressions',
      summary: 'The {curly brace} expression format for conditions, math, and logic.',
      description:
        'BeanShell expressions are enclosed in curly braces and support arithmetic, comparisons, ' +
        'string operations, function calls, and the ternary operator. ' +
        'Use them for filter expressions, calculated properties, and conditional logic.',
      examples: [
        '{Strength > 3 && Nationality == "German"}',
        '{GetProperty("Steps") > 0 ? "Active" : "Eliminated"}',
        '{SumStack("AttackStrength")}',
      ],
      tips: [
        'Use == for comparisons, not =.',
        'Strings must be in double quotes inside BeanShell.',
        'Empty/missing properties return "" — check with != "" rather than null.',
      ],
      seeAlso: ['OldStyleExpressions', 'PropertyScopes'],
    },
  ],
  [
    'OldStyleExpressions',
    {
      id: 'OldStyleExpressions',
      title: 'Old-Style $Property$ Substitution',
      summary: 'Simple text substitution using $dollar signs$ around property names.',
      description:
        'Old-style expressions wrap property names in dollar signs: $PropertyName$. ' +
        'VASSAL replaces each token with the property\'s current value. No math or logic — just substitution. ' +
        'Use for Report Action message formats and text labels.',
      examples: [
        '$PlayerName$ moves $BasicName$ from $OldLocationName$ to $LocationName$',
      ],
      seeAlso: ['BeanShellExpressions', 'ReportState'],
    },
  ],
  [
    'PropertyScopes',
    {
      id: 'PropertyScopes',
      title: 'Property Scopes',
      summary: 'How VASSAL searches for property values: piece, zone, map, module, system.',
      description:
        'When an expression references a property name, VASSAL searches in order: ' +
        '(1) piece traits, (2) current zone, (3) current map, (4) module globals, (5) system properties. ' +
        'The first match wins. A piece property named "Status" shadows a zone property with the same name.',
      tips: [
        'Prefix global properties with scope hints (VP_Allied, Weather_Current) to avoid name collisions.',
        'Use GetProperty() with explicit scope when you need a specific level.',
      ],
      seeAlso: ['BeanShellExpressions', 'Marker', 'DynamicProperty'],
    },
  ],
]);
