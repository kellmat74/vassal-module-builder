/**
 * Deep metadata extraction from VASSAL module buildFile.xml.
 *
 * Extracts rich structural data for Layer 1 and Layer 2 of the corpus DB:
 *   - Full trait chains with decoded parameters
 *   - Prototype definitions and inheritance mapping
 *   - Expressions (BeanShell and old-style)
 *   - Property definitions at all scopes
 *   - Global Key Command definitions
 *   - Piece organization (PieceWindow widget tree)
 *   - Full component tree (flattened for arbitrary queries)
 */

import type { ComponentNode } from '../core/xml-serializer.js';
import type {
  TraitChainRow, ExpressionRow, PropertyRow, GKCRow,
  PrototypeDefRow, PiecePrototypeRow, PieceOrgRow, ComponentTreeRow,
  DeepData,
} from './corpus-db.js';

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

/**
 * Parse a trait string into {trait_id, rawParams}.
 * Trait format: "traitId;param1;param2;..." or "piece;type;...;name"
 */
function parseTraitString(raw: string): { trait_id: string; rawParams: string } | null {
  // Match trait ID: letters/digits followed by semicolon
  const match = raw.match(/^([a-zA-Z]\w*);/);
  if (!match) {
    // Could be "null" or empty or a bare piece definition (rare)
    if (raw.startsWith('null;') || raw === 'null') {
      return { trait_id: 'null', rawParams: raw.substring(5) };
    }
    if (raw.startsWith('piece;') || raw === 'piece') {
      return { trait_id: 'piece', rawParams: raw.substring(6) };
    }
    return null;
  }
  return { trait_id: match[1], rawParams: raw.substring(match[0].length) };
}

/**
 * Split trait params by semicolons, respecting backslash escaping.
 * This is a lightweight decode — doesn't use SequenceDecoder because
 * the outer delimiter for traits is semicolon (the trait ID separator),
 * and inner params may use commas. We just split on unescaped semicolons
 * to get the raw parameter tokens.
 */
function splitTraitParams(rawParams: string): string[] {
  if (!rawParams) return [];
  const params: string[] = [];
  let current = '';
  for (let i = 0; i < rawParams.length; i++) {
    if (rawParams[i] === '\\' && i + 1 < rawParams.length) {
      current += rawParams[i + 1];
      i++;
    } else if (rawParams[i] === ';') {
      params.push(current);
      current = '';
    } else {
      current += rawParams[i];
    }
  }
  params.push(current);
  return params;
}

// ── Expression Extraction Helpers ────────────────────────────────────────

const BEANSHELL_RE = /\{([^}]{2,})\}/g;
const OLDSTYLE_RE = /\$([A-Za-z_]\w*)\$/g;
const FUNCTION_RE = /\b(GetProperty|SumStack|Sum|Count|Alert|Math\.\w+|Random|If)\s*\(/g;
const GETPROP_RE = /GetProperty\s*\(\s*"([^"]+)"\s*\)/g;

function extractFunctions(text: string): string[] {
  const fns = new Set<string>();
  let m;
  while ((m = FUNCTION_RE.exec(text)) !== null) fns.add(m[1]);
  FUNCTION_RE.lastIndex = 0;
  return [...fns];
}

function extractPropertyRefs(text: string): string[] {
  const props = new Set<string>();
  // BeanShell GetProperty references
  let m;
  while ((m = GETPROP_RE.exec(text)) !== null) props.add(m[1]);
  GETPROP_RE.lastIndex = 0;
  // Old-style $PropertyName$ references
  while ((m = OLDSTYLE_RE.exec(text)) !== null) props.add(m[1]);
  OLDSTYLE_RE.lastIndex = 0;
  return [...props];
}

function classifyExpression(text: string): 'beanshell' | 'oldstyle' | 'mixed' {
  const hasBeanshell = text.includes('{') && text.includes('}');
  const hasOldstyle = /\$[A-Za-z_]\w*\$/.test(text);
  if (hasBeanshell && hasOldstyle) return 'mixed';
  if (hasBeanshell) return 'beanshell';
  return 'oldstyle';
}

// ── Main Extraction Functions ────────────────────────────────────────────

/**
 * 1. Extract full trait chains from all PieceSlots and PrototypeDefinitions.
 */
export function extractTraitChains(tree: ComponentNode): TraitChainRow[] {
  const rows: TraitChainRow[] = [];

  // Process PrototypeDefinitions
  const protoDefs = findAllDescendants(tree, 'PrototypeDefinition');
  for (const proto of protoDefs) {
    if (!proto.textContent) continue;
    const traits = proto.textContent.split('\t');
    const name = proto.attributes.name ?? '(unnamed)';
    for (let i = 0; i < traits.length; i++) {
      const parsed = parseTraitString(traits[i]);
      if (!parsed) continue;
      const params = splitTraitParams(parsed.rawParams);
      rows.push({
        source_type: 'prototype',
        source_name: name,
        position: i,
        trait_id: parsed.trait_id,
        params_json: JSON.stringify(params),
      });
    }
  }

  // Process PieceSlots
  const pieceSlots = findAllDescendants(tree, 'PieceSlot');
  for (const slot of pieceSlots) {
    if (!slot.textContent) continue;
    const traits = slot.textContent.split('\t');
    const name = slot.attributes.entryName ?? slot.attributes.name ?? '(unnamed)';
    for (let i = 0; i < traits.length; i++) {
      const parsed = parseTraitString(traits[i]);
      if (!parsed) continue;
      const params = splitTraitParams(parsed.rawParams);
      rows.push({
        source_type: 'piece',
        source_name: name,
        position: i,
        trait_id: parsed.trait_id,
        params_json: JSON.stringify(params),
      });
    }
  }

  return rows;
}

/**
 * 2. Extract prototype definitions with full trait chain summaries.
 */
export function extractPrototypeDefinitions(tree: ComponentNode): PrototypeDefRow[] {
  const rows: PrototypeDefRow[] = [];
  const protoDefs = findAllDescendants(tree, 'PrototypeDefinition');

  for (const proto of protoDefs) {
    if (!proto.textContent) continue;
    const name = proto.attributes.name ?? '(unnamed)';
    const traits = proto.textContent.split('\t');
    const chain: { trait_id: string; params: string[] }[] = [];

    for (const raw of traits) {
      const parsed = parseTraitString(raw);
      if (!parsed) continue;
      chain.push({
        trait_id: parsed.trait_id,
        params: splitTraitParams(parsed.rawParams),
      });
    }

    rows.push({
      name,
      trait_chain_json: JSON.stringify(chain),
      trait_count: chain.length,
    });
  }

  return rows;
}

/**
 * 3. Extract piece → prototype inheritance links.
 */
export function extractPiecePrototypeLinks(tree: ComponentNode): PiecePrototypeRow[] {
  const rows: PiecePrototypeRow[] = [];

  const pieceSlots = findAllDescendants(tree, 'PieceSlot');
  for (const slot of pieceSlots) {
    if (!slot.textContent) continue;
    const pieceName = slot.attributes.entryName ?? slot.attributes.name ?? '(unnamed)';
    const traits = slot.textContent.split('\t');

    for (const raw of traits) {
      if (!raw.startsWith('prototype;')) continue;
      const params = splitTraitParams(raw.substring('prototype;'.length));
      if (params.length > 0 && params[0]) {
        rows.push({ piece_name: pieceName, prototype_name: params[0] });
      }
    }
  }

  // Also check prototype → prototype inheritance (UsePrototype within PrototypeDefinition)
  const protoDefs = findAllDescendants(tree, 'PrototypeDefinition');
  for (const proto of protoDefs) {
    if (!proto.textContent) continue;
    const protoName = proto.attributes.name ?? '(unnamed)';
    const traits = proto.textContent.split('\t');

    for (const raw of traits) {
      if (!raw.startsWith('prototype;')) continue;
      const params = splitTraitParams(raw.substring('prototype;'.length));
      if (params.length > 0 && params[0]) {
        // Prototype inherits from another prototype
        rows.push({ piece_name: `[proto]${protoName}`, prototype_name: params[0] });
      }
    }
  }

  return rows;
}

/**
 * 4. Extract all expressions from traits and component attributes.
 */
export function extractExpressions(tree: ComponentNode): ExpressionRow[] {
  const rows: ExpressionRow[] = [];
  const seen = new Set<string>(); // deduplicate identical expressions in same module

  function addExpression(context: string, sourceName: string, exprText: string) {
    const key = `${context}|${sourceName}|${exprText}`;
    if (seen.has(key)) return;
    seen.add(key);

    rows.push({
      context,
      source_name: sourceName,
      expression_text: exprText,
      expr_type: classifyExpression(exprText),
      functions_used: JSON.stringify(extractFunctions(exprText)),
      properties_referenced: JSON.stringify(extractPropertyRefs(exprText)),
    });
  }

  // Pass 1: Scan trait parameters for expressions
  const containers = [
    ...findAllDescendants(tree, 'PrototypeDefinition'),
    ...findAllDescendants(tree, 'PieceSlot'),
  ];

  for (const container of containers) {
    if (!container.textContent) continue;
    const sourceName = container.attributes.name ?? container.attributes.entryName ?? '(unnamed)';
    const traits = container.textContent.split('\t');

    for (const raw of traits) {
      // Check for BeanShell expressions
      let m;
      while ((m = BEANSHELL_RE.exec(raw)) !== null) {
        addExpression('trait_param', sourceName, m[0]);
      }
      BEANSHELL_RE.lastIndex = 0;

      // Check for old-style with multiple property refs (likely a format string)
      const oldStyleMatches = raw.match(/\$[A-Za-z_]\w*\$/g);
      if (oldStyleMatches && oldStyleMatches.length > 0) {
        // Find the containing parameter that has the $..$ expression
        // Extract report format strings (common pattern)
        const parsed = parseTraitString(raw);
        if (parsed && (parsed.trait_id === 'report' || parsed.trait_id === 'label')) {
          const params = splitTraitParams(parsed.rawParams);
          for (const param of params) {
            if (/\$[A-Za-z_]\w*\$/.test(param)) {
              addExpression('report_format', sourceName, param);
            }
          }
        }
      }
    }
  }

  // Pass 2: Scan component attributes for expressions
  const stack: ComponentNode[] = [tree];
  while (stack.length) {
    const node = stack.pop()!;
    const nodeName = shortTag(node.tag);

    for (const [key, val] of Object.entries(node.attributes)) {
      if (!val || val.length < 3) continue;

      // BeanShell in attributes
      let m;
      while ((m = BEANSHELL_RE.exec(val)) !== null) {
        addExpression('attribute', `${nodeName}.${key}`, m[0]);
      }
      BEANSHELL_RE.lastIndex = 0;

      // Old-style in known expression attributes
      if (['filter', 'propertyExpression', 'expression', 'summaryReportFormat',
           'counterReportFormat', 'reportFormat', 'menuCommand'].includes(key)) {
        if (/\$[A-Za-z_]\w*\$/.test(val)) {
          addExpression('attribute', `${nodeName}.${key}`, val);
        }
      }
    }

    for (const child of node.children) stack.push(child);
  }

  return rows;
}

/**
 * 5. Extract property definitions at all scopes.
 */
export function extractProperties(tree: ComponentNode): PropertyRow[] {
  const rows: PropertyRow[] = [];

  // Global properties at module level
  function extractGlobalProperties(node: ComponentNode, scope: PropertyRow['scope']) {
    const globalPropContainers = findAllDescendants(node, 'GlobalProperties');
    for (const container of globalPropContainers) {
      for (const child of container.children) {
        if (!shortTag(child.tag).includes('GlobalProperty')) continue;
        const name = child.attributes.name ?? child.attributes.key ?? '';
        if (!name) continue;
        rows.push({
          name,
          scope,
          prop_type: 'global',
          initial_value: child.attributes.initialValue ?? child.attributes.value ?? null,
          expression: null,
        });
      }
    }
  }

  // Module-level globals
  for (const child of tree.children) {
    if (shortTag(child.tag) === 'GlobalProperties') {
      for (const gp of child.children) {
        const name = gp.attributes.name ?? gp.attributes.key ?? '';
        if (!name) continue;
        rows.push({
          name,
          scope: 'module',
          prop_type: 'global',
          initial_value: gp.attributes.initialValue ?? gp.attributes.value ?? null,
          expression: null,
        });
      }
    }
  }

  // Map-level globals
  const maps = tree.children.filter(c => shortTag(c.tag) === 'Map' || shortTag(c.tag) === 'PrivateMap');
  for (const map of maps) {
    extractGlobalProperties(map, 'map');
  }

  // Zone-level globals
  const zones = findAllDescendants(tree, 'Zone');
  for (const zone of zones) {
    extractGlobalProperties(zone, 'zone');
  }

  // Piece-level properties from trait chains
  const containers = [
    ...findAllDescendants(tree, 'PrototypeDefinition'),
    ...findAllDescendants(tree, 'PieceSlot'),
  ];

  for (const container of containers) {
    if (!container.textContent) continue;
    const traits = container.textContent.split('\t');

    for (const raw of traits) {
      const parsed = parseTraitString(raw);
      if (!parsed) continue;
      const params = splitTraitParams(parsed.rawParams);

      if (parsed.trait_id === 'mark' && params.length >= 2) {
        // Marker: mark;key;value
        rows.push({
          name: params[0],
          scope: 'piece',
          prop_type: 'marker',
          initial_value: params[1] ?? '',
          expression: null,
        });
      } else if (parsed.trait_id === 'DYNPROP' && params.length >= 1) {
        // DynamicProperty: DYNPROP;name;...;initialValue;...
        rows.push({
          name: params[0],
          scope: 'piece',
          prop_type: 'dynamic',
          initial_value: params.length > 3 ? params[3] : null,
          expression: null,
        });
      } else if (parsed.trait_id === 'calcProp' && params.length >= 2) {
        // CalculatedProperty: calcProp;name;expression
        rows.push({
          name: params[0],
          scope: 'piece',
          prop_type: 'calculated',
          initial_value: null,
          expression: params[1] ?? null,
        });
      }
    }
  }

  return rows;
}

/**
 * 6. Extract Global Key Command definitions.
 */
export function extractGKCDefinitions(tree: ComponentNode): GKCRow[] {
  const rows: GKCRow[] = [];

  // Module-level GKCs
  for (const child of tree.children) {
    const tag = shortTag(child.tag);
    if (tag === 'GlobalKeyCommand' || tag === 'StartupGlobalKeyCommand') {
      rows.push({
        level: 'module',
        name: child.attributes.name ?? child.attributes.buttonText ?? tag,
        target_expression: child.attributes.filter ?? child.attributes.propertyExpression ?? null,
        key_command: child.attributes.key ?? child.attributes.hotkey ?? null,
        params_json: JSON.stringify(child.attributes),
      });
    }
  }

  // Map-level GKCs (MassKeyCommand)
  const maps = tree.children.filter(c =>
    ['Map', 'PrivateMap', 'PlayerHand'].includes(shortTag(c.tag))
  );
  for (const map of maps) {
    const mkcs = findAllDescendants(map, 'MassKeyCommand');
    for (const mkc of mkcs) {
      rows.push({
        level: 'map',
        name: mkc.attributes.name ?? mkc.attributes.buttonText ?? 'MassKeyCommand',
        target_expression: mkc.attributes.filter ?? mkc.attributes.propertyExpression ?? null,
        key_command: mkc.attributes.key ?? mkc.attributes.hotkey ?? null,
        params_json: JSON.stringify(mkc.attributes),
      });
    }
  }

  // Piece-level GKCs (globalkey; trait in prototypes/pieces)
  const containers = [
    ...findAllDescendants(tree, 'PrototypeDefinition'),
    ...findAllDescendants(tree, 'PieceSlot'),
  ];
  for (const container of containers) {
    if (!container.textContent) continue;
    const sourceName = container.attributes.name ?? container.attributes.entryName ?? '(unnamed)';
    const traits = container.textContent.split('\t');

    for (const raw of traits) {
      if (!raw.startsWith('globalkey;')) continue;
      const params = splitTraitParams(raw.substring('globalkey;'.length));
      rows.push({
        level: 'piece',
        name: sourceName,
        target_expression: params.length > 5 ? params[5] : null, // filter expression
        key_command: params.length > 2 ? params[2] : null,
        params_json: JSON.stringify(params),
      });
    }
  }

  return rows;
}

/**
 * 7. Extract PieceWindow widget tree organization.
 */
export function extractPieceOrganization(tree: ComponentNode): PieceOrgRow[] {
  const rows: PieceOrgRow[] = [];

  function walk(node: ComponentNode, path: string) {
    const tag = shortTag(node.tag);
    const entryName = node.attributes.entryName ?? node.attributes.name ?? '';

    // Build path from widget containers
    const widgetTags = ['PieceWindow', 'TabWidget', 'PanelWidget', 'ListWidget', 'ModuleSubFolder'];
    let currentPath = path;
    if (widgetTags.includes(tag) && entryName) {
      currentPath = path ? `${path}/${entryName}` : entryName;
    }

    // Count PieceSlots at this level
    if (tag === 'ListWidget' || tag === 'PanelWidget') {
      const pieceCount = node.children.filter(c => shortTag(c.tag) === 'PieceSlot').length;
      if (pieceCount > 0) {
        rows.push({
          widget_path: currentPath || '(root)',
          entry_name: entryName || '(unnamed)',
          piece_count: pieceCount,
        });
      }
    }

    for (const child of node.children) {
      walk(child, currentPath);
    }
  }

  walk(tree, '');
  return rows;
}

/**
 * 8. Flatten the full component tree for arbitrary queries.
 */
export function extractComponentTree(tree: ComponentNode): ComponentTreeRow[] {
  const rows: ComponentTreeRow[] = [];
  let nextId = 0;

  function walk(node: ComponentNode, parentId: number | null, depth: number) {
    const nodeId = nextId++;
    rows.push({
      node_id: nodeId,
      parent_id: parentId,
      tag: node.tag,
      short_tag: shortTag(node.tag),
      depth,
      attributes_json: JSON.stringify(node.attributes),
    });

    for (const child of node.children) {
      walk(child, nodeId, depth + 1);
    }
  }

  walk(tree, null, 0);
  return rows;
}

// ── Main Entry Point ─────────────────────────────────────────────────────

/**
 * Extract all deep metadata from a parsed ComponentNode tree.
 * rawXml should be the original buildFile.xml string.
 */
export function extractDeep(tree: ComponentNode, rawXml: string): DeepData {
  return {
    rawXml,
    traitChains: extractTraitChains(tree),
    expressions: extractExpressions(tree),
    properties: extractProperties(tree),
    gkcDefinitions: extractGKCDefinitions(tree),
    prototypeDefs: extractPrototypeDefinitions(tree),
    piecePrototypes: extractPiecePrototypeLinks(tree),
    pieceOrganization: extractPieceOrganization(tree),
    componentTree: extractComponentTree(tree),
  };
}
