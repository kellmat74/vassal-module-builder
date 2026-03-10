/**
 * Game Concept Taxonomy — seed data for the semantic normalization layer.
 *
 * Defines game design concepts (problems designers solve) and the known
 * implementation patterns (how they solve them in VASSAL).
 *
 * Each pattern has a `signature` — composable detection rules that can be
 * matched against the deep-extracted corpus data.
 */

// ── Signature Types ──────────────────────────────────────────────────────

export interface SignatureRule {
  /** Trait exists in any prototype or piece */
  trait_exists?: string;
  /** Trait params match pattern (regex) */
  params_match?: string;
  /** Component tag exists in tree (suffix match) */
  component_exists?: string;
  /** Component attribute matches pattern */
  attribute_match?: { tag_suffix: string; attr: string; pattern: string };
  /** Property exists with given name pattern */
  property_match?: { name_pattern: string; scope?: string };
  /** Expression contains pattern */
  expression_match?: string;
  /** Scope constraint */
  in_scope?: 'prototype' | 'piece' | 'module' | 'map';
}

export interface PatternSignature {
  all_of?: SignatureRule[];
  any_of?: SignatureRule[];
  none_of?: SignatureRule[];
}

// ── Data Types ───────────────────────────────────────────────────────────

export interface GameConceptSeed {
  name: string;
  category: string;
  description: string;
  children?: string[];  // child concept names (for taxonomy)
}

export interface ImplementationPatternSeed {
  concept: string;       // references GameConceptSeed.name
  pattern_name: string;
  description: string;
  signature: PatternSignature;
  quality_score: number; // 1-5
}

// ── Game Concept Taxonomy ────────────────────────────────────────────────

export const gameConceptSeeds: GameConceptSeed[] = [
  // ═══ MOVEMENT ═══
  {
    name: 'movement',
    category: 'movement',
    description: 'Top-level: all movement-related concepts',
    children: ['movement-tracking', 'movement-trails', 'send-to-location', 'return-to-deck', 'movement-restriction', 'piece-spawning'],
  },
  {
    name: 'movement-tracking',
    category: 'movement',
    description: 'Visually indicate which pieces have moved this turn',
  },
  {
    name: 'movement-trails',
    category: 'movement',
    description: 'Show a trail/path of where a piece has been',
  },
  {
    name: 'send-to-location',
    category: 'movement',
    description: 'Move a piece to a specific named location or coordinates',
  },
  {
    name: 'return-to-deck',
    category: 'movement',
    description: 'Send a piece back to a draw pile or off-map box',
  },
  {
    name: 'movement-restriction',
    category: 'movement',
    description: 'Prevent or limit piece movement (immobilized, restricted access)',
  },
  {
    name: 'piece-spawning',
    category: 'movement',
    description: 'Create new pieces on the map from existing pieces (PlaceMarker, Clone)',
  },

  // ═══ COMBAT ═══
  {
    name: 'combat',
    category: 'combat',
    description: 'Top-level: all combat-related concepts',
    children: ['combat-resolution', 'step-reduction', 'elimination', 'odds-calculation', 'dice-rolling'],
  },
  {
    name: 'combat-resolution',
    category: 'combat',
    description: 'Automated or semi-automated combat results (CRT lookups, dice resolution)',
  },
  {
    name: 'step-reduction',
    category: 'combat',
    description: 'Units take losses by flipping or reducing (multi-step)',
  },
  {
    name: 'elimination',
    category: 'combat',
    description: 'Removing pieces from play (delete, send to eliminated box)',
  },
  {
    name: 'odds-calculation',
    category: 'combat',
    description: 'Automatically compute combat odds from attacker/defender strengths',
  },
  {
    name: 'dice-rolling',
    category: 'combat',
    description: 'Dice buttons and random number generation for combat resolution and events',
  },

  // ═══ VISIBILITY ═══
  {
    name: 'visibility',
    category: 'visibility',
    description: 'Top-level: controlling what players can see',
    children: ['fog-of-war', 'limited-intelligence', 'block-hiding'],
  },
  {
    name: 'fog-of-war',
    category: 'visibility',
    description: 'Hide piece identity from opposing players',
  },
  {
    name: 'limited-intelligence',
    category: 'visibility',
    description: 'Partially reveal information (show type but not strength)',
  },
  {
    name: 'block-hiding',
    category: 'visibility',
    description: 'Block game face-down mechanic (pieces only visible to owner)',
  },

  // ═══ INFORMATION DISPLAY ═══
  {
    name: 'information',
    category: 'information',
    description: 'Top-level: displaying game state information',
    children: ['stack-inspection', 'piece-info-overlay', 'inventory-tracking', 'chart-reference'],
  },
  {
    name: 'stack-inspection',
    category: 'information',
    description: 'View details of stacked pieces (mouse-over viewer)',
  },
  {
    name: 'piece-info-overlay',
    category: 'information',
    description: 'Show text labels or calculated values on pieces',
  },
  {
    name: 'inventory-tracking',
    category: 'information',
    description: 'List all pieces by category, side, or location',
  },
  {
    name: 'chart-reference',
    category: 'information',
    description: 'In-module reference charts, tables, or rulebook pages',
  },

  // ═══ STATE TRACKING ═══
  {
    name: 'state-tracking',
    category: 'state',
    description: 'Top-level: tracking game state on pieces',
    children: ['unit-status', 'supply-status', 'activation-marking', 'vp-tracking'],
  },
  {
    name: 'unit-status',
    category: 'state',
    description: 'Track unit state via layers (flipped, disrupted, entrenched, etc.)',
  },
  {
    name: 'supply-status',
    category: 'state',
    description: 'Track or calculate supply state for units',
  },
  {
    name: 'activation-marking',
    category: 'state',
    description: 'Mark pieces that have activated/acted this phase',
  },
  {
    name: 'vp-tracking',
    category: 'state',
    description: 'Track victory points via properties or counters',
  },

  // ═══ TURN STRUCTURE ═══
  {
    name: 'turn-structure',
    category: 'turn',
    description: 'Top-level: game turn and phase management',
    children: ['igo-ugo-turns', 'impulse-turns', 'card-driven-activation', 'random-events', 'deck-management', 'scenario-setup'],
  },
  {
    name: 'igo-ugo-turns',
    category: 'turn',
    description: 'Alternating player turns with defined phases (Move/Combat/Exploit)',
  },
  {
    name: 'impulse-turns',
    category: 'turn',
    description: 'Players alternate individual actions within a turn',
  },
  {
    name: 'card-driven-activation',
    category: 'turn',
    description: 'Cards determine order of play, activation, or events',
  },
  {
    name: 'random-events',
    category: 'turn',
    description: 'Random event tables or card draws during a turn',
  },
  {
    name: 'deck-management',
    category: 'turn',
    description: 'Draw piles, discard piles, and card cycling mechanics (DrawPile + ReturnToDeck)',
  },
  {
    name: 'scenario-setup',
    category: 'turn',
    description: 'Predefined game setups and scenario selection at game start',
  },

  // ═══ ORGANIZATION ═══
  {
    name: 'organization',
    category: 'organization',
    description: 'Top-level: organizing pieces and access',
    children: ['side-based-access', 'force-organization', 'reinforcement-scheduling', 'mat-cargo-grouping', 'attachment-binding', 'sub-menu-organization'],
  },
  {
    name: 'side-based-access',
    category: 'organization',
    description: 'Restrict piece manipulation by player side',
  },
  {
    name: 'force-organization',
    category: 'organization',
    description: 'Categorize units by side, formation, type via markers',
  },
  {
    name: 'reinforcement-scheduling',
    category: 'organization',
    description: 'Manage reinforcement pools, entry timing, and placement',
  },
  {
    name: 'mat-cargo-grouping',
    category: 'organization',
    description: 'Physical piece grouping via Mat/MatCargo traits (3.6) — carriers, transports, formations on a surface',
  },
  {
    name: 'attachment-binding',
    category: 'organization',
    description: 'Logical piece binding via Attachment trait (3.7) — HQ→subordinates, leader→stack targeting',
  },
  {
    name: 'sub-menu-organization',
    category: 'organization',
    description: 'Organize piece right-click commands into nested sub-menus for cleaner UI',
  },

  // ═══ AUTOMATION ═══
  {
    name: 'automation',
    category: 'automation',
    description: 'Top-level: automating game operations',
    children: ['auto-reporting', 'triggered-actions', 'global-commands', 'calculated-properties', 'solitaire-automation'],
  },
  {
    name: 'auto-reporting',
    category: 'automation',
    description: 'Automatically log actions to the chat window',
  },
  {
    name: 'triggered-actions',
    category: 'automation',
    description: 'Chain multiple actions from a single command (macro/trigger)',
  },
  {
    name: 'global-commands',
    category: 'automation',
    description: 'Apply commands to multiple pieces at once (GKC/MKC)',
  },
  {
    name: 'calculated-properties',
    category: 'automation',
    description: 'Auto-compute values from piece or game state (formulas)',
  },
  {
    name: 'solitaire-automation',
    category: 'automation',
    description: 'Complex TriggerAction chains that automate opponent behavior for solo play (avg 1,800+ triggers in top solitaire modules)',
  },

  // ═══ MAP FEATURES ═══
  {
    name: 'map-features',
    category: 'map',
    description: 'Top-level: map display and interaction',
    children: ['minimap', 'zoom-controls', 'los-checking', 'map-shading', 'flare-ping'],
  },
  {
    name: 'minimap',
    category: 'map',
    description: 'Small overview map for navigation',
  },
  {
    name: 'zoom-controls',
    category: 'map',
    description: 'Zoom in/out of the map',
  },
  {
    name: 'los-checking',
    category: 'map',
    description: 'Line of sight thread tool',
  },
  {
    name: 'map-shading',
    category: 'map',
    description: 'Overlay shading on map regions (supply zones, control areas)',
  },
  {
    name: 'flare-ping',
    category: 'map',
    description: 'Visual ping to draw attention to a map location',
  },
];

// ── Implementation Pattern Seeds ─────────────────────────────────────────

export const implementationPatternSeeds: ImplementationPatternSeed[] = [

  // ═══ MOVEMENT TRACKING ═══
  {
    concept: 'movement-tracking',
    pattern_name: 'markmoved-trait',
    description: 'Uses the built-in MovementMarkable trait to highlight moved pieces',
    signature: { all_of: [{ trait_exists: 'markmoved' }] },
    quality_score: 4,
  },
  {
    concept: 'movement-tracking',
    pattern_name: 'highlight-last-moved-component',
    description: 'Map-level HighlightLastMoved component draws border on most recently moved piece',
    signature: { all_of: [{ component_exists: 'HighlightLastMoved' }] },
    quality_score: 4,
  },
  {
    concept: 'movement-tracking',
    pattern_name: 'emb2-moved-marker',
    description: 'Embellishment layer showing "Moved" marker, toggled by DynamicProperty',
    signature: {
      all_of: [
        { trait_exists: 'emb2', params_match: '[Mm]oved' },
        { trait_exists: 'DYNPROP', params_match: '[Mm]oved' },
      ],
    },
    quality_score: 3,
  },

  // ═══ MOVEMENT TRAILS ═══
  {
    concept: 'movement-trails',
    pattern_name: 'footprint-trait',
    description: 'Uses the Footprint trait to show movement trail breadcrumbs',
    signature: { all_of: [{ trait_exists: 'footprint' }] },
    quality_score: 5,
  },

  // ═══ SEND TO LOCATION ═══
  {
    concept: 'send-to-location',
    pattern_name: 'sendto-trait',
    description: 'Uses SendToLocation trait for moving pieces to named locations',
    signature: { all_of: [{ trait_exists: 'sendto' }] },
    quality_score: 5,
  },

  // ═══ RETURN TO DECK ═══
  {
    concept: 'return-to-deck',
    pattern_name: 'returntodeck-trait',
    description: 'Uses ReturnToDeck trait to send pieces back to draw piles',
    signature: { all_of: [{ trait_exists: 'returnToDeck' }] },
    quality_score: 5,
  },

  // ═══ MOVEMENT RESTRICTION ═══
  {
    concept: 'movement-restriction',
    pattern_name: 'immobilized-trait',
    description: 'Uses Immobilized trait to prevent piece movement',
    signature: { all_of: [{ trait_exists: 'immob' }] },
    quality_score: 4,
  },
  {
    concept: 'movement-restriction',
    pattern_name: 'restricted-access',
    description: 'Uses Restricted trait to limit which side can move a piece',
    signature: { all_of: [{ trait_exists: 'restrict' }] },
    quality_score: 4,
  },

  // ═══ STEP REDUCTION ═══
  {
    concept: 'step-reduction',
    pattern_name: 'emb2-flip-reduce',
    description: 'Embellishment layers for multi-step units (flip to show reduced side)',
    signature: {
      all_of: [
        { trait_exists: 'emb2', params_match: '[Rr]educ|[Ff]lip|[Ss]tep|[Ss]trength' },
      ],
    },
    quality_score: 4,
  },
  {
    concept: 'step-reduction',
    pattern_name: 'replace-reduced',
    description: 'Replace piece with reduced-strength version',
    signature: { all_of: [{ trait_exists: 'replace' }] },
    quality_score: 3,
  },

  // ═══ ELIMINATION ═══
  {
    concept: 'elimination',
    pattern_name: 'delete-trait',
    description: 'Uses Delete trait to remove pieces from play',
    signature: { all_of: [{ trait_exists: 'delete' }] },
    quality_score: 4,
  },
  {
    concept: 'elimination',
    pattern_name: 'sendto-eliminated-box',
    description: 'SendToLocation to an eliminated/dead pile rather than deleting',
    signature: {
      all_of: [
        { trait_exists: 'sendto', params_match: '[Ee]lim|[Dd]ead|[Cc]asualt|[Rr]emov' },
      ],
    },
    quality_score: 5,
  },

  // ═══ FOG OF WAR ═══
  {
    concept: 'fog-of-war',
    pattern_name: 'hideable-trait',
    description: 'Uses Hideable trait — piece invisible to other players',
    signature: { all_of: [{ trait_exists: 'hide' }] },
    quality_score: 4,
  },
  {
    concept: 'fog-of-war',
    pattern_name: 'obscurable-trait',
    description: 'Uses Obscurable trait — piece shows mask image to opponents',
    signature: { all_of: [{ trait_exists: 'obs' }] },
    quality_score: 5,
  },

  // ═══ BLOCK HIDING ═══
  {
    concept: 'block-hiding',
    pattern_name: 'obscurable-block',
    description: 'Obscurable trait used for block game face-down (shows back of block)',
    signature: {
      all_of: [
        { trait_exists: 'obs' },
        { trait_exists: 'restrict' },
      ],
    },
    quality_score: 5,
  },

  // ═══ STACK INSPECTION ═══
  {
    concept: 'stack-inspection',
    pattern_name: 'counter-detail-viewer',
    description: 'CounterDetailViewer component for mouse-over stack popup',
    signature: { all_of: [{ component_exists: 'CounterDetailViewer' }] },
    quality_score: 5,
  },

  // ═══ PIECE INFO OVERLAY ═══
  {
    concept: 'piece-info-overlay',
    pattern_name: 'labeler-trait',
    description: 'Uses Labeler trait to show text on pieces',
    signature: { all_of: [{ trait_exists: 'label' }] },
    quality_score: 5,
  },

  // ═══ INVENTORY TRACKING ═══
  {
    concept: 'inventory-tracking',
    pattern_name: 'inventory-component',
    description: 'Uses Inventory window component to list all pieces',
    signature: { all_of: [{ component_exists: 'Inventory' }] },
    quality_score: 5,
  },

  // ═══ CHART REFERENCE ═══
  {
    concept: 'chart-reference',
    pattern_name: 'chart-window',
    description: 'ChartWindow component with reference chart images',
    signature: { all_of: [{ component_exists: 'ChartWindow' }] },
    quality_score: 5,
  },

  // ═══ UNIT STATUS ═══
  {
    concept: 'unit-status',
    pattern_name: 'emb2-status-layers',
    description: 'Multiple Embellishment layers for unit states (disrupted, entrenched, etc.)',
    signature: {
      all_of: [
        { trait_exists: 'emb2', params_match: '[Dd]isrupt|[Ee]ntrench|[Dd]isorg|[Ss]uppl|[Ff]atigu|[Oo]ut.of|[Ss]haken' },
      ],
    },
    quality_score: 4,
  },
  {
    concept: 'unit-status',
    pattern_name: 'dynprop-status',
    description: 'DynamicProperty alone for status tracking (no automation backing — consider dynprop-with-trigger instead)',
    signature: { all_of: [{ trait_exists: 'DYNPROP' }] },
    quality_score: 2,
  },

  // ═══ ACTIVATION MARKING ═══
  {
    concept: 'activation-marking',
    pattern_name: 'emb2-activated',
    description: 'Embellishment layer showing activation/spent status',
    signature: {
      all_of: [
        { trait_exists: 'emb2', params_match: '[Aa]ctivat|[Ss]pent|[Oo]perat|[Ff]ired|[Uu]sed' },
      ],
    },
    quality_score: 4,
  },

  // ═══ TURN STRUCTURE ═══
  {
    concept: 'igo-ugo-turns',
    pattern_name: 'turn-tracker-counter-list',
    description: 'TurnTracker with Counter (turn number) and List (phases)',
    signature: {
      all_of: [
        { component_exists: 'TurnTracker' },
        { component_exists: 'CounterTurnLevel' },
        { component_exists: 'ListTurnLevel' },
      ],
    },
    quality_score: 5,
  },
  {
    concept: 'card-driven-activation',
    pattern_name: 'draw-pile-hand',
    description: 'DrawPile + PlayerHand components for card-driven game',
    signature: {
      all_of: [
        { component_exists: 'DrawPile' },
        { component_exists: 'PlayerHand' },
      ],
    },
    quality_score: 5,
  },

  // ═══ SIDE-BASED ACCESS ═══
  {
    concept: 'side-based-access',
    pattern_name: 'player-roster',
    description: 'PlayerRoster component defines sides; Restricted trait limits access',
    signature: {
      all_of: [
        { component_exists: 'PlayerRoster' },
      ],
    },
    quality_score: 5,
  },

  // ═══ FORCE ORGANIZATION ═══
  {
    concept: 'force-organization',
    pattern_name: 'marker-traits',
    description: 'Static Marker traits categorizing pieces (Side, Formation, UnitType)',
    signature: {
      all_of: [
        { trait_exists: 'mark', params_match: '[Ss]ide|[Nn]ation|[Ff]orce|[Ff]ormation|[Cc]orps|[Aa]rmy|[Tt]ype' },
      ],
    },
    quality_score: 5,
  },

  // ═══ AUTO-REPORTING ═══
  {
    concept: 'auto-reporting',
    pattern_name: 'report-trait',
    description: 'ReportState trait for logging piece actions to chat',
    signature: { all_of: [{ trait_exists: 'report' }] },
    quality_score: 5,
  },

  // ═══ TRIGGERED ACTIONS ═══
  {
    concept: 'triggered-actions',
    pattern_name: 'trigger-macro',
    description: 'TriggerAction (macro) trait for chaining commands',
    signature: { all_of: [{ trait_exists: 'macro' }] },
    quality_score: 5,
  },

  // ═══ GLOBAL COMMANDS ═══
  {
    concept: 'global-commands',
    pattern_name: 'module-gkc',
    description: 'Module-level GlobalKeyCommand for applying commands to all matching pieces',
    signature: { all_of: [{ component_exists: 'GlobalKeyCommand' }] },
    quality_score: 5,
  },
  {
    concept: 'global-commands',
    pattern_name: 'map-mkc',
    description: 'Map-level MassKeyCommand for within-map batch operations',
    signature: { all_of: [{ component_exists: 'MassKeyCommand' }] },
    quality_score: 4,
  },
  {
    concept: 'global-commands',
    pattern_name: 'piece-gkc',
    description: 'Piece-level CounterGlobalKeyCommand for piece-to-piece commands',
    signature: { all_of: [{ trait_exists: 'globalkey' }] },
    quality_score: 4,
  },

  // ═══ MAP FEATURES ═══
  {
    concept: 'minimap',
    pattern_name: 'global-map',
    description: 'GlobalMap component for minimap overview',
    signature: { all_of: [{ component_exists: 'GlobalMap' }] },
    quality_score: 5,
  },
  {
    concept: 'zoom-controls',
    pattern_name: 'zoomer',
    description: 'Zoomer component for map zoom',
    signature: { all_of: [{ component_exists: 'Zoomer' }] },
    quality_score: 5,
  },
  {
    concept: 'los-checking',
    pattern_name: 'los-thread',
    description: 'LOS_Thread component for line of sight checking',
    signature: { all_of: [{ component_exists: 'LOS_Thread' }] },
    quality_score: 5,
  },
  {
    concept: 'map-shading',
    pattern_name: 'map-shader',
    description: 'MapShader component for overlay shading',
    signature: { all_of: [{ component_exists: 'MapShader' }] },
    quality_score: 5,
  },
  {
    concept: 'flare-ping',
    pattern_name: 'flare-component',
    description: 'Flare component for visual location pinging',
    signature: { all_of: [{ component_exists: 'Flare' }] },
    quality_score: 5,
  },

  // ═══ CALCULATED PROPERTIES ═══
  {
    concept: 'calculated-properties',
    pattern_name: 'calcprop-trait',
    description: 'CalculatedProperty trait for expression-computed values',
    signature: { all_of: [{ trait_exists: 'calcProp' }] },
    quality_score: 5,
  },
  {
    concept: 'calculated-properties',
    pattern_name: 'setprop-global',
    description: 'SetGlobalProperty trait for updating game-wide computed state',
    signature: { all_of: [{ trait_exists: 'setprop' }] },
    quality_score: 4,
  },

  // ═══ DICE ROLLING (corpus: 763 Random() expressions) ═══
  {
    concept: 'dice-rolling',
    pattern_name: 'dice-button',
    description: 'Module-level DiceButton component for toolbar dice rolling',
    signature: { all_of: [{ component_exists: 'DiceButton' }] },
    quality_score: 5,
  },
  {
    concept: 'dice-rolling',
    pattern_name: 'symbolic-dice',
    description: 'SpecialDiceButton with custom die face images',
    signature: { all_of: [{ component_exists: 'SpecialDiceButton' }] },
    quality_score: 5,
  },

  // ═══ PIECE SPAWNING (Team 1: archetype #14, 1.3%) ═══
  {
    concept: 'piece-spawning',
    pattern_name: 'placemark-spawn',
    description: 'PlaceMarker trait to spawn new pieces from existing ones (markers, reinforcements)',
    signature: { all_of: [{ trait_exists: 'placemark' }] },
    quality_score: 5,
  },
  {
    concept: 'piece-spawning',
    pattern_name: 'clone-piece',
    description: 'Clone trait to duplicate a piece in place',
    signature: { all_of: [{ trait_exists: 'clone' }] },
    quality_score: 3,
  },

  // ═══ DECK MANAGEMENT (Team 3: card-driven distinctive pattern) ═══
  {
    concept: 'deck-management',
    pattern_name: 'drawpile-deck',
    description: 'DrawPile component for card draw mechanics',
    signature: { all_of: [{ component_exists: 'DrawPile' }] },
    quality_score: 5,
  },
  {
    concept: 'deck-management',
    pattern_name: 'return-to-hand',
    description: 'ReturnToDeck trait for cycling cards back to hand/deck (82% adoption in card-driven games)',
    signature: { all_of: [{ trait_exists: 'returnToDeck' }] },
    quality_score: 5,
  },

  // ═══ MAT/CARGO GROUPING (Team 1: 66 prototypes, VASSAL 3.6) ═══
  {
    concept: 'mat-cargo-grouping',
    pattern_name: 'mat-surface',
    description: 'Mat + MatCargo traits for physical piece grouping (carriers, transports). VASSAL 3.6+ feature.',
    signature: {
      all_of: [{ trait_exists: 'mat' }],
      any_of: [{ trait_exists: 'matCargo' }],
    },
    quality_score: 5,
  },

  // ═══ ATTACHMENT BINDING (Team 1: near-zero adoption, VASSAL 3.7) ═══
  {
    concept: 'attachment-binding',
    pattern_name: 'attachment-logical-binding',
    description: 'Attachment trait for logical piece-to-piece binding (3.7). Enables targeted GKCs to bound pieces.',
    signature: { all_of: [{ trait_exists: 'attachment' }] },
    quality_score: 5,
  },

  // ═══ SCENARIO SETUP (46% prevalence) ═══
  {
    concept: 'scenario-setup',
    pattern_name: 'predefined-setup',
    description: 'PredefinedSetup component for saved game states as scenario starters',
    signature: { all_of: [{ component_exists: 'PredefinedSetup' }] },
    quality_score: 5,
  },

  // ═══ SOLITAIRE AUTOMATION (Team 2: top trigger modules are solitaire) ═══
  {
    concept: 'solitaire-automation',
    pattern_name: 'trigger-chain-automation',
    description: 'Deep TriggerAction chains (100+ triggers) automating opponent behavior. Found in Western Front Ace (2,759), Fields of Fire (2,090).',
    signature: {
      all_of: [
        { trait_exists: 'macro' },
        { trait_exists: 'globalkey' },
        { trait_exists: 'DYNPROP' },
      ],
    },
    quality_score: 5,
  },

  // ═══ SUB-MENU ORGANIZATION (Team 1: top-20 archetype) ═══
  {
    concept: 'sub-menu-organization',
    pattern_name: 'submenu-command-org',
    description: 'SubMenu trait to nest commands into organized groups on the right-click menu',
    signature: { all_of: [{ trait_exists: 'submenu' }] },
    quality_score: 4,
  },

  // ═══ ADDITIONAL PATTERNS FROM CORPUS (Team 1 archetypes + Team 4 quality) ═══
  {
    concept: 'unit-status',
    pattern_name: 'dynprop-with-trigger',
    description: 'DynamicProperty backed by TriggerAction for automated state changes (Team 1 archetype #3)',
    signature: {
      all_of: [
        { trait_exists: 'DYNPROP' },
        { trait_exists: 'macro' },
      ],
    },
    quality_score: 5,
  },
  {
    concept: 'unit-status',
    pattern_name: 'emb2-multi-layer-status',
    description: 'Multiple Embellishment layers for rich visual state display (Team 1 archetype #2)',
    signature: {
      all_of: [
        { trait_exists: 'emb2' },
        { trait_exists: 'mark' },
      ],
    },
    quality_score: 4,
  },
  {
    concept: 'piece-info-overlay',
    pattern_name: 'label-calculated-display',
    description: 'Labeler + CalculatedProperty combo for dynamic text display on pieces',
    signature: {
      all_of: [
        { trait_exists: 'label' },
        { trait_exists: 'calcProp' },
      ],
    },
    quality_score: 5,
  },
  {
    concept: 'side-based-access',
    pattern_name: 'restrict-commands-conditional',
    description: 'RestrictCommands trait for conditionally hiding commands based on game state',
    signature: { all_of: [{ trait_exists: 'restrictCommands' }] },
    quality_score: 4,
  },
];
