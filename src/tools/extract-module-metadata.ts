/**
 * Batch module metadata extractor.
 *
 * Scans a directory (recursively) for .vmod files, extracts buildFile.xml
 * and moduledata from each, parses them into structured metadata, and
 * saves the results to a JSON database — WITHOUT storing any images.
 *
 * Usage:
 *   npx tsx src/tools/extract-module-metadata.ts [directory] [output-file]
 *
 * Defaults:
 *   directory  = ~/Library/CloudStorage/GoogleDrive-.../My Drive/Games
 *   output     = data/module-catalog.json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { parseBuildFile } from '../core/xml-parser.js';
import type { ComponentNode } from '../core/xml-serializer.js';

// ── Types ────────────────────────────────────────────────────────────────

export interface ModuleFingerprint {
  // Identity
  filename: string;
  name: string;
  version: string;
  vassalVersion: string;
  description: string;

  // Size info
  fileSizeBytes: number;
  xmlSizeBytes: number;
  imageCount: number;

  // Top-level components (direct children of GameModule)
  topLevelComponents: string[];

  // Map features (per map)
  maps: MapFingerprint[];

  // Trait usage across all prototypes and piece slots
  traitCounts: Record<string, number>;
  prototypeCount: number;
  pieceSlotCount: number;

  // Grid info
  gridTypes: string[];

  // Turn tracker structure
  turnStructure: string[] | null;

  // Notable features (boolean flags for quick filtering)
  features: {
    hasZoomer: boolean;
    hasCounterDetailViewer: boolean;
    hasFlare: boolean;
    hasHighlightLastMoved: boolean;
    hasGlobalMap: boolean;
    hasFootprint: boolean;
    hasMovementMarkable: boolean;
    hasTurnTracker: boolean;
    hasDiceButton: boolean;
    hasSpecialDiceButton: boolean;
    hasInventory: boolean;
    hasNotesWindow: boolean;
    hasChartWindow: boolean;
    hasPrivateMap: boolean;
    hasPlayerHand: boolean;
    hasDrawPile: boolean;
    hasLOS: boolean;
    hasMapShader: boolean;
    hasPredefinedSetup: boolean;
    hasPrototypes: boolean;
    hasMat: boolean;
    hasAttachment: boolean;
  };

  // Extraction metadata
  extractedAt: string;
  extractionErrors: string[];
}

interface MapFingerprint {
  name: string;
  subComponents: string[];
  gridType: string | null;
  boardCount: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function findAllDescendants(node: ComponentNode, tagSuffix: string): ComponentNode[] {
  const results: ComponentNode[] = [];
  const stack = [node];
  while (stack.length) {
    const current = stack.pop()!;
    if (current.tag.endsWith(tagSuffix)) results.push(current);
    for (const child of current.children) stack.push(child);
  }
  return results;
}

function shortTag(tag: string): string {
  return tag.split('.').pop() ?? tag;
}

function countTraits(node: ComponentNode): Record<string, number> {
  const counts: Record<string, number> = {};
  const traitPattern = /^([a-zA-Z]+\d*);/;

  // Gather all text content from PieceSlots and PrototypeDefinitions
  const containers = [
    ...findAllDescendants(node, 'PieceSlot'),
    ...findAllDescendants(node, 'PrototypeDefinition'),
  ];

  for (const c of containers) {
    if (!c.textContent) continue;
    // Traits are tab-separated
    const traits = c.textContent.split('\t');
    for (const trait of traits) {
      const match = trait.match(traitPattern);
      if (match) {
        const id = match[1];
        counts[id] = (counts[id] || 0) + 1;
      }
    }
  }

  return counts;
}

function extractTurnStructure(node: ComponentNode): string[] | null {
  const trackers = findAllDescendants(node, 'TurnTracker');
  if (trackers.length === 0) return null;

  const structure: string[] = [];
  const stack: ComponentNode[] = [trackers[0]];
  while (stack.length) {
    const current = stack.pop()!;
    const short = shortTag(current.tag);
    if (short === 'CounterTurnLevel') structure.push('Counter');
    else if (short === 'ListTurnLevel') structure.push('List');
    for (const child of current.children) stack.push(child);
  }
  return structure.length > 0 ? structure : null;
}

function extractGridTypes(node: ComponentNode): string[] {
  const gridTags = ['HexGrid', 'SquareGrid', 'RegionGrid', 'ZonedGrid'];
  const found = new Set<string>();
  const stack = [node];
  while (stack.length) {
    const current = stack.pop()!;
    const short = shortTag(current.tag);
    if (gridTags.includes(short)) found.add(short);
    for (const child of current.children) stack.push(child);
  }
  return [...found];
}

function extractMapFingerprints(tree: ComponentNode): MapFingerprint[] {
  const maps = tree.children.filter(c => c.tag === 'VASSAL.build.module.Map');
  return maps.map(map => {
    const subComponents = map.children.map(c => shortTag(c.tag));
    const boards = findAllDescendants(map, 'Board');
    const grids = extractGridTypes(map);
    return {
      name: map.attributes.mapName ?? map.attributes.name ?? '(unnamed)',
      subComponents,
      gridType: grids[0] ?? null,
      boardCount: boards.length,
    };
  });
}

function hasDescendant(node: ComponentNode, tagSuffix: string): boolean {
  const stack = [node];
  while (stack.length) {
    const current = stack.pop()!;
    if (current.tag.endsWith(tagSuffix)) return true;
    for (const child of current.children) stack.push(child);
  }
  return false;
}

function hasTraitInPrototypes(node: ComponentNode, traitId: string): boolean {
  const protos = findAllDescendants(node, 'PrototypeDefinition');
  return protos.some(p => p.textContent?.includes(`${traitId};`) ?? false);
}

// ── Main extraction ─────────────────────────────────────────────────────

async function extractOne(filePath: string): Promise<ModuleFingerprint> {
  const errors: string[] = [];
  const fileSize = statSync(filePath).size;
  const buffer = readFileSync(filePath);
  const zip = await JSZip.loadAsync(buffer);

  // Parse moduledata
  let name = '', version = '', vassalVersion = '', description = '';
  const moduledataEntry = zip.file('moduledata');
  if (moduledataEntry) {
    try {
      const xml = await moduledataEntry.async('string');
      const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false });
      const parsed = parser.parse(xml);
      const data = parsed.data ?? parsed;
      name = String(data.n ?? '');
      version = String(data.version ?? '');
      vassalVersion = String(data.VassalVersion ?? '');
      description = String(data.description ?? '');
    } catch (e) {
      errors.push(`moduledata parse error: ${e}`);
    }
  } else {
    errors.push('Missing moduledata');
  }

  // Parse buildFile.xml
  const buildEntry = zip.file('buildFile.xml') ?? zip.file('buildFile');
  let tree: ComponentNode = { tag: 'UNKNOWN', attributes: {}, children: [] };
  let xmlSize = 0;
  if (buildEntry) {
    try {
      const xml = await buildEntry.async('string');
      xmlSize = xml.length;
      tree = parseBuildFile(xml);
    } catch (e) {
      errors.push(`buildFile.xml parse error: ${e}`);
    }
  } else {
    errors.push('Missing buildFile.xml');
  }

  // Count images
  let imageCount = 0;
  for (const path of Object.keys(zip.files)) {
    if (path.startsWith('images/') && !zip.files[path].dir) imageCount++;
  }

  // Extract features
  const traitCounts = countTraits(tree);
  const maps = extractMapFingerprints(tree);

  return {
    filename: basename(filePath),
    name: name || tree.attributes?.name || basename(filePath),
    version: version || tree.attributes?.version || '',
    vassalVersion,
    description,
    fileSizeBytes: fileSize,
    xmlSizeBytes: xmlSize,
    imageCount,
    topLevelComponents: tree.children.map(c => shortTag(c.tag)),
    maps,
    traitCounts,
    prototypeCount: findAllDescendants(tree, 'PrototypeDefinition').length,
    pieceSlotCount: findAllDescendants(tree, 'PieceSlot').length,
    gridTypes: extractGridTypes(tree),
    turnStructure: extractTurnStructure(tree),
    features: {
      hasZoomer: hasDescendant(tree, 'Zoomer'),
      hasCounterDetailViewer: hasDescendant(tree, 'CounterDetailViewer'),
      hasFlare: hasDescendant(tree, 'Flare'),
      hasHighlightLastMoved: hasDescendant(tree, 'HighlightLastMoved'),
      hasGlobalMap: hasDescendant(tree, 'GlobalMap'),
      hasFootprint: hasTraitInPrototypes(tree, 'footprint'),
      hasMovementMarkable: hasTraitInPrototypes(tree, 'markmoved'),
      hasTurnTracker: hasDescendant(tree, 'TurnTracker'),
      hasDiceButton: tree.children.some(c => shortTag(c.tag) === 'DiceButton'),
      hasSpecialDiceButton: tree.children.some(c => shortTag(c.tag) === 'SpecialDiceButton'),
      hasInventory: tree.children.some(c => shortTag(c.tag) === 'Inventory'),
      hasNotesWindow: tree.children.some(c => shortTag(c.tag) === 'NotesWindow'),
      hasChartWindow: tree.children.some(c => shortTag(c.tag) === 'ChartWindow'),
      hasPrivateMap: tree.children.some(c => shortTag(c.tag) === 'PrivateMap'),
      hasPlayerHand: tree.children.some(c => shortTag(c.tag) === 'PlayerHand'),
      hasDrawPile: hasDescendant(tree, 'DrawPile'),
      hasLOS: hasDescendant(tree, 'LOS_Thread'),
      hasMapShader: hasDescendant(tree, 'MapShader'),
      hasPredefinedSetup: tree.children.some(c => shortTag(c.tag) === 'PredefinedSetup'),
      hasPrototypes: hasDescendant(tree, 'PrototypesContainer'),
      hasMat: hasTraitInPrototypes(tree, 'mat'),
      hasAttachment: hasTraitInPrototypes(tree, 'attachment'),
    },
    extractedAt: new Date().toISOString(),
    extractionErrors: errors,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────

function findVmods(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findVmods(full));
      } else if (entry.name.endsWith('.vmod')) {
        // Skip 0-byte files (Google Drive placeholders)
        try {
          const size = statSync(full).size;
          if (size > 0) results.push(full);
        } catch { /* skip inaccessible */ }
      }
    }
  } catch { /* skip inaccessible dirs */ }
  return results;
}

async function main() {
  const defaultDir = '/Users/matt.kelley/Library/CloudStorage/GoogleDrive-kellmat74@gmail.com/My Drive/Games';
  const dir = process.argv[2] ?? defaultDir;
  const outFile = process.argv[3] ?? 'data/module-catalog.json';

  console.log(`🔍 Scanning for .vmod files in: ${dir}`);
  const vmods = findVmods(dir);
  console.log(`📦 Found ${vmods.length} non-empty .vmod files\n`);

  const catalog: ModuleFingerprint[] = [];

  for (const vmod of vmods) {
    const name = basename(vmod);
    process.stdout.write(`  Extracting: ${name}...`);
    try {
      const fingerprint = await extractOne(vmod);
      catalog.push(fingerprint);
      const errs = fingerprint.extractionErrors.length;
      console.log(` ✅ ${fingerprint.pieceSlotCount} pieces, ${fingerprint.prototypeCount} prototypes${errs ? ` (${errs} warnings)` : ''}`);
    } catch (e) {
      console.log(` ❌ ${e}`);
      catalog.push({
        filename: name,
        name,
        version: '',
        vassalVersion: '',
        description: '',
        fileSizeBytes: 0,
        xmlSizeBytes: 0,
        imageCount: 0,
        topLevelComponents: [],
        maps: [],
        traitCounts: {},
        prototypeCount: 0,
        pieceSlotCount: 0,
        gridTypes: [],
        turnStructure: null,
        features: {
          hasZoomer: false, hasCounterDetailViewer: false, hasFlare: false,
          hasHighlightLastMoved: false, hasGlobalMap: false, hasFootprint: false,
          hasMovementMarkable: false, hasTurnTracker: false, hasDiceButton: false,
          hasSpecialDiceButton: false, hasInventory: false, hasNotesWindow: false,
          hasChartWindow: false, hasPrivateMap: false, hasPlayerHand: false,
          hasDrawPile: false, hasLOS: false, hasMapShader: false,
          hasPredefinedSetup: false, hasPrototypes: false, hasMat: false,
          hasAttachment: false,
        },
        extractedAt: new Date().toISOString(),
        extractionErrors: [`Fatal: ${e}`],
      });
    }
  }

  // Write catalog
  mkdirSync('data', { recursive: true });
  writeFileSync(outFile, JSON.stringify(catalog, null, 2));
  console.log(`\n📊 Catalog saved to ${outFile} (${catalog.length} modules)`);

  // Quick summary
  const successful = catalog.filter(m => m.extractionErrors.length === 0 || !m.extractionErrors.some(e => e.startsWith('Fatal')));
  console.log(`\n── Feature Prevalence ──`);
  const featureKeys = Object.keys(catalog[0]?.features ?? {}) as (keyof ModuleFingerprint['features'])[];
  for (const key of featureKeys) {
    const count = successful.filter(m => m.features[key]).length;
    const pct = successful.length > 0 ? Math.round(100 * count / successful.length) : 0;
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`  ${key.padEnd(30)} ${bar} ${count}/${successful.length} (${pct}%)`);
  }
}

main().catch(console.error);
