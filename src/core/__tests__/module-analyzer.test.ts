import { describe, it, expect } from 'vitest';
import { analyzeModule, getDisplayName, type Suggestion } from '../module-analyzer.js';
import { createMinimalModule } from '../module-factory.js';
import type { ComponentNode } from '../xml-serializer.js';

function makeMap(name: string, children: ComponentNode[] = []): ComponentNode {
  return {
    tag: 'VASSAL.build.module.Map',
    attributes: { mapName: name },
    children,
  };
}

function makeCompleteModule(): ComponentNode {
  const root = createMinimalModule('Complete');

  // Add a map with all recommended sub-components
  root.children.push(
    makeMap('Main Map', [
      { tag: 'VASSAL.build.module.map.CounterDetailViewer', attributes: {}, children: [] },
      { tag: 'VASSAL.build.module.map.Zoomer', attributes: {}, children: [] },
      { tag: 'VASSAL.build.module.map.Flare', attributes: {}, children: [] },
      { tag: 'VASSAL.build.module.map.HighlightLastMoved', attributes: {}, children: [] },
    ]),
  );

  // Turn tracker
  root.children.push({
    tag: 'VASSAL.build.module.turn.TurnTracker',
    attributes: {},
    children: [],
  });

  // Dice button
  root.children.push({
    tag: 'VASSAL.build.module.DiceButton',
    attributes: {},
    children: [],
  });

  // Inventory
  root.children.push({
    tag: 'VASSAL.build.module.Inventory',
    attributes: {},
    children: [],
  });

  // Prototypes container with footprint and markmoved
  root.children.push({
    tag: 'VASSAL.build.module.PrototypesContainer',
    attributes: {},
    children: [
      {
        tag: 'VASSAL.build.module.PrototypeDefinition',
        attributes: { name: 'Standard Unit' },
        children: [],
        textContent: 'piece;;\t footprint;\tmarkmoved;\t',
      },
    ],
  });

  return root;
}

describe('getDisplayName', () => {
  it('strips VASSAL.build.module. prefix', () => {
    const node: ComponentNode = { tag: 'VASSAL.build.module.Map', attributes: {}, children: [] };
    expect(getDisplayName(node)).toBe('Map');
  });

  it('includes name attribute if present', () => {
    const node: ComponentNode = {
      tag: 'VASSAL.build.module.Map',
      attributes: { name: 'Main Map' },
      children: [],
    };
    expect(getDisplayName(node)).toBe('Map (Main Map)');
  });

  it('uses mapName attribute as fallback', () => {
    const node: ComponentNode = {
      tag: 'VASSAL.build.module.Map',
      attributes: { mapName: 'Main Map' },
      children: [],
    };
    expect(getDisplayName(node)).toBe('Map (Main Map)');
  });
});

describe('analyzeModule', () => {
  it('returns many suggestions for minimal module', () => {
    const root = createMinimalModule('Test');
    const suggestions = analyzeModule(root);
    // Minimal module has no map, no turn tracker, no dice, no prototypes, no inventory
    expect(suggestions.length).toBeGreaterThanOrEqual(4);
    const ids = suggestions.map((s) => s.id);
    expect(ids).toContain('no-turn-tracker');
    expect(ids).toContain('no-dice-button');
    expect(ids).toContain('no-prototypes-container');
    expect(ids).toContain('no-inventory');
  });

  it('returns few suggestions for complete module', () => {
    const root = makeCompleteModule();
    const suggestions = analyzeModule(root);
    expect(suggestions.length).toBe(0);
  });

  it('detects missing CounterDetailViewer on map', () => {
    const root = createMinimalModule('Test');
    root.children.push(makeMap('Main Map'));
    const suggestions = analyzeModule(root);
    const cdv = suggestions.find((s) => s.id === 'map-missing-counter-detail-viewer');
    expect(cdv).toBeDefined();
    expect(cdv!.autoFixAvailable).toBe(true);
    expect(cdv!.targetPath).toBe('Map (Main Map)');
  });

  it('detects missing Zoomer on map', () => {
    const root = createMinimalModule('Test');
    root.children.push(makeMap('Main Map'));
    const suggestions = analyzeModule(root);
    expect(suggestions.find((s) => s.id === 'map-missing-zoomer')).toBeDefined();
  });

  it('detects missing Flare on map', () => {
    const root = createMinimalModule('Test');
    root.children.push(makeMap('Main Map'));
    const suggestions = analyzeModule(root);
    expect(suggestions.find((s) => s.id === 'map-missing-flare')).toBeDefined();
  });

  it('detects missing HighlightLastMoved on map', () => {
    const root = createMinimalModule('Test');
    root.children.push(makeMap('Main Map'));
    const suggestions = analyzeModule(root);
    expect(suggestions.find((s) => s.id === 'map-missing-highlight-last-moved')).toBeDefined();
  });

  it('does not flag footprint/markmoved when no prototypes exist', () => {
    const root = createMinimalModule('Test');
    const suggestions = analyzeModule(root);
    const ids = suggestions.map((s) => s.id);
    expect(ids).not.toContain('prototypes-missing-footprint');
    expect(ids).not.toContain('prototypes-missing-movement-markable');
  });

  it('flags missing footprint in prototypes', () => {
    const root = createMinimalModule('Test');
    root.children.push({
      tag: 'VASSAL.build.module.PrototypesContainer',
      attributes: {},
      children: [
        {
          tag: 'VASSAL.build.module.PrototypeDefinition',
          attributes: { name: 'Unit' },
          children: [],
          textContent: 'piece;;\tmark;Nationality\tGerman',
        },
      ],
    });
    const suggestions = analyzeModule(root);
    expect(suggestions.find((s) => s.id === 'prototypes-missing-footprint')).toBeDefined();
    expect(suggestions.find((s) => s.id === 'prototypes-missing-movement-markable')).toBeDefined();
  });

  it('provides fixData with correct tag for auto-fixable suggestions', () => {
    const root = createMinimalModule('Test');
    root.children.push(makeMap('Main Map'));
    const suggestions = analyzeModule(root);
    const fixable = suggestions.filter((s) => s.autoFixAvailable);
    for (const s of fixable) {
      expect(s.fixData).toBeDefined();
      expect(s.fixData!.tag).toMatch(/^VASSAL\./);
    }
  });
});
