/**
 * Feature Catalog — the master list of features that can be added to a module.
 *
 * Each feature defines:
 *   - What it is (name, description, help)
 *   - Where it goes (target: which part of the component tree)
 *   - What it adds (template: the ComponentNode or trait string to inject)
 *   - When it's relevant (applicableTo: game types, prevalence from corpus)
 *   - Whether the module already has it (detect: function to check)
 *
 * Features are organized into categories for the UI.
 */

import type { ComponentNode } from '../core/xml-serializer.js';

// ── Types ────────────────────────────────────────────────────────────────

export type GameType =
  | 'hex-and-counter'
  | 'area-movement'
  | 'point-to-point'
  | 'block'
  | 'card-driven'
  | 'naval'
  | 'tactical'
  | 'operational'
  | 'strategic'
  | 'any';

export type FeatureCategory =
  | 'map-enhancement'
  | 'piece-enhancement'
  | 'dice-and-randomness'
  | 'turn-and-phase'
  | 'information-display'
  | 'multiplayer'
  | 'advanced';

export type FeatureTarget =
  | 'module'       // Add as child of GameModule root
  | 'each-map'     // Add to every Map in the module
  | 'first-map'    // Add to the first/main Map only
  | 'prototypes'   // Inject trait into all movable prototypes
  | 'custom';      // Requires user to pick a target (future)

export interface FeatureParam {
  id: string;
  label: string;
  description: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  default: string | number | boolean;
  options?: { label: string; value: string }[];  // For 'select' type
  min?: number;
  max?: number;
}

export interface CatalogFeature {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: FeatureCategory;
  target: FeatureTarget;
  applicableTo: GameType[];
  prevalence: number;           // 0-100, from corpus analysis
  vassalVersionRequired?: string;

  // Detection: how to know if the module already has this feature
  detectTags?: string[];        // If any of these tags exist, feature is present
  detectTraitId?: string;       // If this trait ID is found in prototypes

  // Template: what to inject (parameterized)
  params?: FeatureParam[];
  buildTemplate: (params: Record<string, string | number | boolean>) => ComponentNode | string;
  // Returns ComponentNode for component-level features,
  // or a trait string for prototype-level features
}

// ── Catalog ──────────────────────────────────────────────────────────────

export const featureCatalog: CatalogFeature[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // MAP ENHANCEMENTS
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'zoomer',
    name: 'Zoom Controls',
    description: 'Lets players zoom in and out of the map with toolbar buttons or mouse wheel.',
    category: 'map-enhancement',
    target: 'each-map',
    applicableTo: ['any'],
    prevalence: 100,
    detectTags: ['VASSAL.build.module.map.Zoomer'],
    params: [
      { id: 'maxZoom', label: 'Max Zoom Level', description: 'Highest zoom (e.g., 4.0 = 400%)', type: 'number', default: 4.0, min: 1, max: 10 },
      { id: 'minZoom', label: 'Min Zoom Level', description: 'Lowest zoom (e.g., 0.5 = 50%)', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.map.Zoomer',
      attributes: {
        zoomStart: '3',
        maxZoom: String(p.maxZoom ?? 4.0),
        minZoom: String(p.minZoom ?? 0.5),
      },
      children: [],
    }),
  },

  {
    id: 'counter-detail-viewer',
    name: 'Mouse-over Stack Viewer',
    description: 'Shows a popup with piece images and info when hovering over a stack.',
    category: 'map-enhancement',
    target: 'each-map',
    applicableTo: ['any'],
    prevalence: 100,
    detectTags: ['VASSAL.build.module.map.CounterDetailViewer'],
    params: [
      { id: 'delay', label: 'Hover Delay (ms)', description: 'Milliseconds before popup appears', type: 'number', default: 700, min: 100, max: 3000 },
      { id: 'zoomLevel', label: 'Popup Zoom', description: 'Zoom level for piece images in popup', type: 'number', default: 1.0, min: 0.5, max: 3.0 },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.map.CounterDetailViewer',
      attributes: {
        delay: String(p.delay ?? 700),
        graphicsZoom: String(p.zoomLevel ?? 1.0),
        showgraph: 'true',
        showtext: 'true',
        summaryReportFormat: '$LocationName$',
        counterReportFormat: '$PieceName$',
      },
      children: [],
    }),
  },

  {
    id: 'flare',
    name: 'Flare (Ping Location)',
    description: 'Alt+click on the map to send a visual ping, drawing other players\' attention to a spot.',
    category: 'map-enhancement',
    target: 'each-map',
    applicableTo: ['any'],
    prevalence: 58,
    detectTags: ['VASSAL.build.module.map.Flare'],
    buildTemplate: () => ({
      tag: 'VASSAL.build.module.map.Flare',
      attributes: {
        color: '255,0,0',
        key: '65,520',   // Alt+click
        pulses: '5',
        pulsesPerSec: '2',
        reportFormat: '$PlayerName$ flares at $LocationName$',
      },
      children: [],
    }),
  },

  {
    id: 'highlight-last-moved',
    name: 'Highlight Last Moved Piece',
    description: 'Draws a colored border around the most recently moved piece so opponents can see what changed.',
    category: 'map-enhancement',
    target: 'each-map',
    applicableTo: ['any'],
    prevalence: 100,
    detectTags: ['VASSAL.build.module.map.HighlightLastMoved'],
    params: [
      { id: 'color', label: 'Highlight Color', description: 'Color of the highlight (R,G,B)', type: 'string', default: '255,0,0' },
      { id: 'thickness', label: 'Line Thickness', description: 'Thickness of the border in pixels', type: 'number', default: 2, min: 1, max: 5 },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.map.HighlightLastMoved',
      attributes: {
        color: String(p.color ?? '255,0,0'),
        thickness: String(p.thickness ?? 2),
      },
      children: [],
    }),
  },

  {
    id: 'global-map',
    name: 'Overview Map (Minimap)',
    description: 'A small thumbnail overview window showing the entire map with a viewport indicator.',
    category: 'map-enhancement',
    target: 'each-map',
    applicableTo: ['any'],
    prevalence: 48,
    detectTags: ['VASSAL.build.module.map.GlobalMap'],
    params: [
      { id: 'scale', label: 'Scale', description: 'Fraction of the full map image size (e.g. 0.05 = 5%). Larger maps need smaller values — try 0.03–0.05 for big maps, 0.1+ for small ones.', type: 'number', default: 0.05, min: 0.02, max: 0.5 },
      { id: 'buttonText', label: 'Button Text', description: 'Text on the toolbar button (leave empty for icon only)', type: 'string', default: 'Map' },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.map.GlobalMap',
      attributes: {
        scale: String(p.scale ?? 0.05),
        buttonText: String(p.buttonText ?? 'Map'),
        tooltip: 'Show/Hide Overview Map',
        hotkey: '',
        icon: '',
      },
      children: [],
    }),
  },

  {
    id: 'los-thread',
    name: 'Line of Sight Thread',
    description: 'Draw a line between two hexes to check line of sight. Shows range in hexes.',
    category: 'map-enhancement',
    target: 'first-map',
    applicableTo: ['tactical', 'hex-and-counter'],
    prevalence: 51,
    detectTags: ['VASSAL.build.module.map.LOS_Thread'],
    buildTemplate: () => ({
      tag: 'VASSAL.build.module.map.LOS_Thread',
      attributes: {
        threadColor: '255,0,0',
        hotkey: '76,0',  // Ctrl+L
        iconName: '/images/los.gif',
        tooltip: 'Line of Sight',
        reportFormat: 'LOS from $FromLocation$ to $ToLocation$: $Range$ hexes',
        persistence: 'ctrl',
        snapLOS: 'true',
      },
      children: [],
    }),
  },

  {
    id: 'map-shader',
    name: 'Map Shading Overlay',
    description: 'Applies a semi-transparent color overlay to the map. Useful for weather, night, or fog of war effects.',
    category: 'map-enhancement',
    target: 'first-map',
    applicableTo: ['any'],
    prevalence: 23,
    detectTags: ['VASSAL.build.module.map.MapShader'],
    buildTemplate: () => ({
      tag: 'VASSAL.build.module.map.MapShader',
      attributes: {
        buttonText: 'Shading',
        tooltip: 'Toggle Map Shading',
        type: 'background',
        color: '0,0,0',
        opacity: '50',
      },
      children: [],
    }),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PIECE ENHANCEMENTS
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'movement-trails',
    name: 'Movement Trails (Footprint)',
    description: 'Shows a dotted line tracing each piece\'s movement path during the current turn. Can be toggled and cleared.',
    longDescription: 'The Footprint trait records each position a piece visits during movement and draws a connected trail. ' +
      'Players can toggle trails on/off and clear them at turn end (often via a Global Key Command). ' +
      'This is the feature you noticed in Salerno — only 38% of modules currently use it.',
    category: 'piece-enhancement',
    target: 'prototypes',
    applicableTo: ['hex-and-counter', 'tactical', 'operational'],
    prevalence: 38,
    detectTraitId: 'footprint',
    params: [
      { id: 'trailColor', label: 'Trail Color', description: 'Color of the movement trail line', type: 'string', default: '255,0,0' },
      { id: 'circleRadius', label: 'Circle Radius', description: 'Size of the dot at each stop', type: 'number', default: 10, min: 3, max: 30 },
    ],
    buildTemplate: (p) => `footprint;Footprint;255,0,0;${p.trailColor ?? '255,0,0'};${p.circleRadius ?? 10};true;65,520;75,520;true;0;0`,
  },

  {
    id: 'movement-marking',
    name: 'Mark When Moved',
    description: 'Automatically marks a piece when it moves (e.g., a small icon or dot). Helps enforce movement rules.',
    category: 'piece-enhancement',
    target: 'prototypes',
    applicableTo: ['hex-and-counter', 'tactical', 'operational'],
    prevalence: 80,
    detectTraitId: 'markmoved',
    buildTemplate: () => 'markmoved;MovementMarkable;moved.gif;*Moved*',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DICE & RANDOMNESS
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'dice-button-standard',
    name: 'Standard Dice Button',
    description: 'Adds a toolbar button to roll dice with results reported in the chat log.',
    category: 'dice-and-randomness',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 72,
    detectTags: ['VASSAL.build.module.DiceButton'],
    params: [
      { id: 'nDice', label: 'Number of Dice', description: 'How many dice to roll', type: 'number', default: 2, min: 1, max: 10 },
      { id: 'nSides', label: 'Sides per Die', description: 'Number of sides (6 for d6, 10 for d10, etc.)', type: 'number', default: 6, min: 2, max: 100 },
      { id: 'buttonText', label: 'Button Label', description: 'Text shown on the toolbar button', type: 'string', default: '2d6' },
      { id: 'reportTotal', label: 'Report Total', description: 'Show the sum instead of individual dice', type: 'boolean', default: true },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.DiceButton',
      attributes: {
        name: String(p.buttonText ?? '2d6'),
        text: String(p.buttonText ?? '2d6'),
        tooltip: `Roll ${p.nDice ?? 2}d${p.nSides ?? 6}`,
        nDice: String(p.nDice ?? 2),
        nSides: String(p.nSides ?? 6),
        reportTotal: String(p.reportTotal ?? true),
        reportFormat: `** $PlayerName$ rolls $nDice$d$nSides$ = $result$ ***`,
      },
      children: [],
    }),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TURN & PHASE TRACKING
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'turn-tracker-igo-ugo',
    name: 'Turn Tracker (IGO-UGO)',
    description: 'Automated turn/phase tracker: Turn number → Player side → Phase. Displays current state on the toolbar.',
    longDescription: 'Only 11% of modules use the built-in Turn Tracker — most rely on manual counters on a track image. ' +
      'The automated tracker advances through phases with a button click and can fire Global Key Commands at phase boundaries.',
    category: 'turn-and-phase',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 11,
    detectTags: ['VASSAL.build.module.turn.TurnTracker'],
    params: [
      { id: 'side1', label: 'Player 1 Name', description: 'First player side name', type: 'string', default: 'Axis' },
      { id: 'side2', label: 'Player 2 Name', description: 'Second player side name', type: 'string', default: 'Allied' },
      { id: 'phases', label: 'Phases (comma-separated)', description: 'Phase names within each player turn', type: 'string', default: 'Movement,Combat,Exploitation' },
    ],
    buildTemplate: (p) => {
      const phases = String(p.phases ?? 'Movement,Combat,Exploitation').split(',').map(s => s.trim());
      const tracker: ComponentNode = {
        tag: 'VASSAL.build.module.turn.TurnTracker',
        attributes: {
          buttonText: 'Turn',
          tooltip: 'Advance turn/phase',
          turnFormat: 'Turn $level1$ - $level2$ - $level3$',
          reportFormat: '* Turn advanced to $turnFormat$ *',
        },
        children: [
          {
            tag: 'VASSAL.build.module.turn.CounterTurnLevel',
            attributes: { turnFormat: '$level$', start: '1', incr: '1' },
            children: [],
          },
          {
            tag: 'VASSAL.build.module.turn.ListTurnLevel',
            attributes: {
              turnFormat: '$level$',
              list: `${p.side1 ?? 'Axis'},${p.side2 ?? 'Allied'}`,
            },
            children: [],
          },
          {
            tag: 'VASSAL.build.module.turn.ListTurnLevel',
            attributes: {
              turnFormat: '$level$',
              list: phases.join(','),
            },
            children: [],
          },
        ],
      };
      return tracker;
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INFORMATION DISPLAY
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'inventory',
    name: 'Piece Inventory (OOB)',
    description: 'A searchable window listing all pieces currently on maps, grouped by properties. Note: only shows pieces placed on maps, not pieces still in the Pieces window. For OOB grouping, pieces need Marker traits (e.g. Side, Formation).',
    category: 'information-display',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 31,
    detectTags: ['VASSAL.build.module.Inventory'],
    params: [
      { id: 'buttonText', label: 'Button Label', description: 'Toolbar button text', type: 'string', default: 'Inventory' },
      { id: 'groupBy', label: 'Group By Property', description: 'Property name to group pieces by (e.g. CurrentMap, Side)', type: 'string', default: 'CurrentMap' },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.Inventory',
      attributes: {
        name: String(p.buttonText ?? 'Inventory'),
        text: String(p.buttonText ?? 'Inventory'),
        tooltip: 'Show piece inventory',
        icon: '',
        include: '{PieceName != ""}',
        pieceFormat: '$PieceName$',
        sortFormat: '$PieceName$',
        groupBy: String(p.groupBy ?? 'CurrentMap'),
        centerOnPiece: 'true',
        forwardKeystroke: 'true',
        drawPieces: 'true',
        pieceZoom: '0.25',
        foldersOnly: 'false',
        launchFunction: 'functionLaunch',
        showTotal: 'true',
        totalFormat: '$sum$',
      },
      children: [],
    }),
  },

  {
    id: 'notes-window',
    name: 'Notes Window',
    description: 'A shared notepad where players can record game notes, house rules, or game log entries.',
    category: 'information-display',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 66,
    detectTags: ['VASSAL.build.module.NotesWindow'],
    buildTemplate: () => ({
      tag: 'VASSAL.build.module.NotesWindow',
      attributes: {
        buttonText: 'Notes',
        tooltip: 'Open game notes',
      },
      children: [],
    }),
  },

  {
    id: 'chart-window',
    name: 'Charts & Tables Window',
    description: 'A tabbed window for displaying CRT, TEC, reinforcement schedules, and other reference charts as images.',
    category: 'information-display',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 82,
    detectTags: ['VASSAL.build.module.ChartWindow'],
    buildTemplate: () => ({
      tag: 'VASSAL.build.module.ChartWindow',
      attributes: {
        name: 'Charts',
        buttonText: 'Charts',
        tooltip: 'Show charts and tables',
      },
      children: [],
    }),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MULTIPLAYER
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'private-map',
    name: 'Private Map (Hidden from Opponent)',
    description: 'A map visible only to one player side. Used for hidden movement, secret planning, or private force pools.',
    category: 'multiplayer',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 57,
    detectTags: ['VASSAL.build.module.PrivateMap'],
    params: [
      { id: 'mapName', label: 'Map Name', description: 'Name for this private map', type: 'string', default: 'Private Map' },
      { id: 'side', label: 'Visible to Side', description: 'Which player side can see this map', type: 'string', default: '' },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.PrivateMap',
      attributes: {
        mapName: String(p.mapName ?? 'Private Map'),
        side: String(p.side ?? ''),
        buttonText: String(p.mapName ?? 'Private Map'),
        tooltip: `Open ${p.mapName ?? 'Private Map'}`,
      },
      children: [],
    }),
  },

  {
    id: 'player-hand',
    name: 'Player Hand (Card Hand)',
    description: 'A private window for holding cards, visible only to the owning player. Essential for card-driven games.',
    category: 'multiplayer',
    target: 'module',
    applicableTo: ['card-driven'],
    prevalence: 5,
    detectTags: ['VASSAL.build.module.PlayerHand'],
    buildTemplate: () => ({
      tag: 'VASSAL.build.module.PlayerHand',
      attributes: {
        mapName: 'Hand',
        buttonText: 'Hand',
        tooltip: 'Show your card hand',
      },
      children: [],
    }),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADVANCED (newer VASSAL features, low adoption)
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'predefined-setup',
    name: 'Predefined Setup (Scenario)',
    description: 'A saved game state that places all pieces for a specific scenario. Players choose a scenario when starting a new game.',
    category: 'advanced',
    target: 'module',
    applicableTo: ['any'],
    prevalence: 46,
    detectTags: ['VASSAL.build.module.PredefinedSetup'],
    params: [
      { id: 'name', label: 'Scenario Name', description: 'Display name for this scenario', type: 'string', default: 'Standard Scenario' },
    ],
    buildTemplate: (p) => ({
      tag: 'VASSAL.build.module.PredefinedSetup',
      attributes: {
        name: String(p.name ?? 'Standard Scenario'),
        useFile: 'false',
      },
      children: [],
    }),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

export const featureCategories: { id: FeatureCategory; label: string }[] = [
  { id: 'map-enhancement', label: 'Map Enhancements' },
  { id: 'piece-enhancement', label: 'Piece Enhancements' },
  { id: 'dice-and-randomness', label: 'Dice & Randomness' },
  { id: 'turn-and-phase', label: 'Turn & Phase Tracking' },
  { id: 'information-display', label: 'Information Display' },
  { id: 'multiplayer', label: 'Multiplayer' },
  { id: 'advanced', label: 'Advanced' },
];

/** Check if a module already has a feature */
export function moduleHasFeature(tree: ComponentNode, feature: CatalogFeature): boolean {
  if (feature.detectTags) {
    const found = hasDescendantWithTag(tree, feature.detectTags);
    if (found) return true;
  }
  if (feature.detectTraitId) {
    return hasTraitInTree(tree, feature.detectTraitId);
  }
  return false;
}

function hasDescendantWithTag(node: ComponentNode, tags: string[]): boolean {
  const stack = [node];
  while (stack.length) {
    const current = stack.pop()!;
    if (tags.includes(current.tag)) return true;
    for (const child of current.children) stack.push(child);
  }
  return false;
}

function hasTraitInTree(node: ComponentNode, traitId: string): boolean {
  const stack = [node];
  while (stack.length) {
    const current = stack.pop()!;
    if (current.tag.endsWith('PrototypeDefinition') || current.tag.endsWith('PieceSlot')) {
      if (current.textContent?.includes(`${traitId};`)) return true;
    }
    for (const child of current.children) stack.push(child);
  }
  return false;
}
