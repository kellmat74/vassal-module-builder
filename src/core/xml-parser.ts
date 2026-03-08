/**
 * XML parser for VASSAL buildFile.xml — reverse of xml-serializer.ts.
 * Parses XML string back into a ComponentNode tree with round-trip fidelity.
 */

import { XMLParser } from 'fast-xml-parser';
import type { ComponentNode } from './xml-serializer.js';

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: true,
  trimValues: false,
  processEntities: true,
  allowBooleanAttributes: false,
  parseTagValue: false,
  // Dots in tag names are part of Java FQCNs, not nesting
  transformTagName: undefined,
};

function convertNode(parsed: Record<string, unknown>): ComponentNode | null {
  // In preserveOrder mode, each element is an object with one key (tag name)
  // and optionally ':@' for attributes and '#text' for text content
  const keys = Object.keys(parsed);
  const tagKey = keys.find(k => k !== ':@' && k !== '#text');

  if (!tagKey) return null;

  const tag = tagKey;
  const childArray = parsed[tagKey] as Record<string, unknown>[];
  const rawAttrs = (parsed[':@'] ?? {}) as Record<string, string>;

  // Strip the attribute prefix
  const attributes: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawAttrs)) {
    const key = k.startsWith('@_') ? k.slice(2) : k;
    attributes[key] = String(v);
  }

  const children: ComponentNode[] = [];
  let textContent: string | undefined;

  if (Array.isArray(childArray)) {
    for (const item of childArray) {
      if ('#text' in item) {
        const raw = String(item['#text']).trim();
        if (raw) textContent = raw;
      } else {
        const child = convertNode(item);
        if (child) children.push(child);
      }
    }
  }

  return { tag, attributes, children, ...(textContent !== undefined ? { textContent } : {}) };
}

export function parseBuildFile(xml: string): ComponentNode {
  const parser = new XMLParser(PARSER_OPTIONS);
  const parsed = parser.parse(xml) as Record<string, unknown>[];

  if (!Array.isArray(parsed)) {
    throw new Error('Unexpected XML parse result');
  }

  // Skip the XML declaration element, find the root element
  for (const item of parsed) {
    const keys = Object.keys(item);
    const tagKey = keys.find(k => k !== ':@' && k !== '#text' && k !== '?xml');
    if (tagKey) {
      const node = convertNode(item);
      if (node) return node;
    }
  }

  throw new Error('No root element found in XML');
}
