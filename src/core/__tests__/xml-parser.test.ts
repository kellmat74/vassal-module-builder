import { describe, it, expect } from 'vitest';
import { parseBuildFile } from '../xml-parser.js';
import { serializeBuildFile, type ComponentNode } from '../xml-serializer.js';
import { createMinimalModule } from '../module-factory.js';

describe('parseBuildFile', () => {
  it('parses minimal buildFile.xml into ComponentNode tree', () => {
    const tree = createMinimalModule('Test Module');
    const xml = serializeBuildFile(tree);
    const parsed = parseBuildFile(xml);

    expect(parsed.tag).toBe('VASSAL.build.GameModule');
    expect(parsed.attributes.name).toBe('Test Module');
    expect(parsed.children.length).toBe(7);
    expect(parsed.children[0].tag).toBe('VASSAL.build.module.BasicCommandEncoder');
  });

  it('round-trips: serialize → parse → serialize produces same XML', () => {
    const tree = createMinimalModule('Round Trip');
    const xml1 = serializeBuildFile(tree);
    const parsed = parseBuildFile(xml1);
    const xml2 = serializeBuildFile(parsed);

    expect(xml2).toBe(xml1);
  });

  it('handles text content in elements', () => {
    const node: ComponentNode = {
      tag: 'VASSAL.build.widget.PieceSlot',
      attributes: { entryName: 'Infantry', height: '100', width: '100' },
      children: [],
      textContent: '+/null/prototype;Prototype',
    };
    const xml = serializeBuildFile({
      tag: 'root',
      attributes: {},
      children: [node],
    });

    const parsed = parseBuildFile(xml);
    expect(parsed.children[0].textContent).toBe('+/null/prototype;Prototype');
  });

  it('handles self-closing elements', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<VASSAL.build.GameModule name="Test">
    <VASSAL.build.module.BasicCommandEncoder/>
</VASSAL.build.GameModule>
`;
    const parsed = parseBuildFile(xml);
    expect(parsed.children[0].tag).toBe('VASSAL.build.module.BasicCommandEncoder');
    expect(parsed.children[0].children).toEqual([]);
  });

  it('handles deeply nested trees', () => {
    const tree: ComponentNode = {
      tag: 'A',
      attributes: {},
      children: [{
        tag: 'B',
        attributes: {},
        children: [{
          tag: 'C',
          attributes: {},
          children: [{
            tag: 'D',
            attributes: { val: 'deep' },
            children: [],
          }],
        }],
      }],
    };
    const xml = serializeBuildFile(tree);
    const parsed = parseBuildFile(xml);
    expect(parsed.children[0].children[0].children[0].attributes.val).toBe('deep');
  });
});
