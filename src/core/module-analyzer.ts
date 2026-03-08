/**
 * Analyzes a VASSAL module component tree and produces suggestions
 * for missing best-practice features.
 */

import type { ComponentNode } from './xml-serializer.js';

export interface Suggestion {
  id: string;
  severity: 'info' | 'recommended' | 'warning';
  title: string;
  description: string;
  autoFixAvailable: boolean;
  category: 'map-feature' | 'piece-feature' | 'module-feature' | 'quality';
  fixData?: ComponentNode;
  targetPath?: string;
}

export function getDisplayName(node: ComponentNode): string {
  const short = node.tag.replace(/^VASSAL\.build\.module\./, '');
  const name = node.attributes.name ?? node.attributes.mapName;
  return name ? `${short} (${name})` : short;
}

type Checker = (tree: ComponentNode) => Suggestion[];

function findChildren(node: ComponentNode, tag: string): ComponentNode[] {
  return node.children.filter((c) => c.tag === tag);
}

function findAllDescendants(node: ComponentNode, tag: string): ComponentNode[] {
  const results: ComponentNode[] = [];
  for (const child of node.children) {
    if (child.tag === tag) results.push(child);
    results.push(...findAllDescendants(child, tag));
  }
  return results;
}

function getMaps(tree: ComponentNode): ComponentNode[] {
  return findChildren(tree, 'VASSAL.build.module.Map');
}

function mapHasChild(map: ComponentNode, tag: string): boolean {
  return map.children.some((c) => c.tag === tag);
}

const checkCounterDetailViewer: Checker = (tree) => {
  const suggestions: Suggestion[] = [];
  for (const map of getMaps(tree)) {
    if (!mapHasChild(map, 'VASSAL.build.module.map.CounterDetailViewer')) {
      suggestions.push({
        id: 'map-missing-counter-detail-viewer',
        severity: 'recommended',
        title: 'Add Mouse-over Stack Viewer',
        description:
          'CounterDetailViewer lets players mouse over stacks to see contents. Highly recommended for any map with stackable pieces.',
        autoFixAvailable: true,
        category: 'map-feature',
        targetPath: getDisplayName(map),
        fixData: {
          tag: 'VASSAL.build.module.map.CounterDetailViewer',
          attributes: {
            delay: '700',
            graphicsZoom: '1.0',
            showgraph: 'true',
            showtext: 'true',
            summaryReportFormat: '$LocationName$',
            counterReportFormat: '$PieceName$',
          },
          children: [],
        },
      });
    }
  }
  return suggestions;
};

const checkZoomer: Checker = (tree) => {
  const suggestions: Suggestion[] = [];
  for (const map of getMaps(tree)) {
    if (!mapHasChild(map, 'VASSAL.build.module.map.Zoomer')) {
      suggestions.push({
        id: 'map-missing-zoomer',
        severity: 'recommended',
        title: 'Add Zoom Controls',
        description: 'Zoomer lets players zoom in and out of the map. Essential for large maps.',
        autoFixAvailable: true,
        category: 'map-feature',
        targetPath: getDisplayName(map),
        fixData: {
          tag: 'VASSAL.build.module.map.Zoomer',
          attributes: { zoomStart: '3', maxZoom: '5', minZoom: '1' },
          children: [],
        },
      });
    }
  }
  return suggestions;
};

const checkFlare: Checker = (tree) => {
  const suggestions: Suggestion[] = [];
  for (const map of getMaps(tree)) {
    if (!mapHasChild(map, 'VASSAL.build.module.map.Flare')) {
      suggestions.push({
        id: 'map-missing-flare',
        severity: 'info',
        title: 'Add Flare',
        description:
          'Flare lets players Alt+click to ping a location, drawing attention in multiplayer games.',
        autoFixAvailable: true,
        category: 'map-feature',
        targetPath: getDisplayName(map),
        fixData: {
          tag: 'VASSAL.build.module.map.Flare',
          attributes: { color: '255,0,0', key: 'Alt+click', pulses: '5', pulsesPerSec: '2' },
          children: [],
        },
      });
    }
  }
  return suggestions;
};

const checkHighlightLastMoved: Checker = (tree) => {
  const suggestions: Suggestion[] = [];
  for (const map of getMaps(tree)) {
    if (!mapHasChild(map, 'VASSAL.build.module.map.HighlightLastMoved')) {
      suggestions.push({
        id: 'map-missing-highlight-last-moved',
        severity: 'info',
        title: 'Add Highlight Last Moved',
        description:
          'HighlightLastMoved draws a visible indicator on the most recently moved piece. Helps opponents see what changed.',
        autoFixAvailable: true,
        category: 'map-feature',
        targetPath: getDisplayName(map),
        fixData: {
          tag: 'VASSAL.build.module.map.HighlightLastMoved',
          attributes: { color: '255,0,0', thickness: '2' },
          children: [],
        },
      });
    }
  }
  return suggestions;
};

const checkTurnTracker: Checker = (tree) => {
  const has = tree.children.some((c) => c.tag === 'VASSAL.build.module.turn.TurnTracker');
  if (!has) {
    return [
      {
        id: 'no-turn-tracker',
        severity: 'recommended',
        title: 'Add Turn Tracker',
        description:
          'A Turn Tracker helps players track the current turn, phase, and sub-phase. Recommended for most games.',
        autoFixAvailable: false,
        category: 'module-feature',
      },
    ];
  }
  return [];
};

const checkDiceButton: Checker = (tree) => {
  const diceTags = ['VASSAL.build.module.DiceButton', 'VASSAL.build.module.SpecialDiceButton'];
  const has = tree.children.some((c) => diceTags.includes(c.tag));
  if (!has) {
    return [
      {
        id: 'no-dice-button',
        severity: 'info',
        title: 'Add Dice Button',
        description: 'A Dice Button provides built-in dice rolling with chat log reporting.',
        autoFixAvailable: false,
        category: 'module-feature',
      },
    ];
  }
  return [];
};

function getPrototypeTraitTexts(tree: ComponentNode): string[] {
  const protoDefs = findAllDescendants(tree, 'VASSAL.build.module.PrototypeDefinition');
  return protoDefs.map((p) => p.textContent ?? '').filter((t) => t.length > 0);
}

const checkFootprint: Checker = (tree) => {
  const texts = getPrototypeTraitTexts(tree);
  if (texts.length === 0) return [];
  const hasFootprint = texts.some((t) => t.includes('footprint;'));
  if (!hasFootprint) {
    return [
      {
        id: 'prototypes-missing-footprint',
        severity: 'recommended',
        title: 'Add Movement Trails',
        description:
          'No prototypes include the Footprint trait. Movement trails help players visualize piece movement history.',
        autoFixAvailable: false,
        category: 'piece-feature',
      },
    ];
  }
  return [];
};

const checkMovementMarkable: Checker = (tree) => {
  const texts = getPrototypeTraitTexts(tree);
  if (texts.length === 0) return [];
  const has = texts.some((t) => t.includes('markmoved;'));
  if (!has) {
    return [
      {
        id: 'prototypes-missing-movement-markable',
        severity: 'recommended',
        title: 'Add Movement Marking',
        description:
          'No prototypes include the MovementMarkable trait. Marking moved pieces helps enforce movement rules.',
        autoFixAvailable: false,
        category: 'piece-feature',
      },
    ];
  }
  return [];
};

const checkPrototypesContainer: Checker = (tree) => {
  const has = findAllDescendants(tree, 'VASSAL.build.module.PrototypesContainer').length > 0;
  if (!has) {
    return [
      {
        id: 'no-prototypes-container',
        severity: 'warning',
        title: 'No Prototype Definitions',
        description:
          'The module has no PrototypesContainer. Using shared Prototype definitions keeps pieces consistent and maintainable.',
        autoFixAvailable: false,
        category: 'quality',
      },
    ];
  }
  return [];
};

const checkInventory: Checker = (tree) => {
  const has = tree.children.some((c) => c.tag === 'VASSAL.build.module.Inventory');
  if (!has) {
    return [
      {
        id: 'no-inventory',
        severity: 'info',
        title: 'Add Piece Inventory',
        description:
          'An Inventory window provides a searchable list of all pieces, useful as an Order of Battle display.',
        autoFixAvailable: false,
        category: 'module-feature',
      },
    ];
  }
  return [];
};

const checkers: Checker[] = [
  checkCounterDetailViewer,
  checkZoomer,
  checkFlare,
  checkHighlightLastMoved,
  checkTurnTracker,
  checkDiceButton,
  checkFootprint,
  checkMovementMarkable,
  checkPrototypesContainer,
  checkInventory,
];

export function analyzeModule(tree: ComponentNode): Suggestion[] {
  return checkers.flatMap((checker) => checker(tree));
}
