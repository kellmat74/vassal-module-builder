import { describe, it, expect } from 'vitest';
import type { ComponentNode } from '../xml-serializer.js';
import {
  addChild,
  removeChild,
  updateAttributes,
  updateTextContent,
  findNodeByPath,
  findAllByTag,
} from '../tree-ops.js';

function makeTree(): ComponentNode {
  return {
    tag: 'Root',
    attributes: { name: 'root' },
    children: [
      {
        tag: 'ChildA',
        attributes: { id: '1' },
        children: [
          { tag: 'Grandchild', attributes: { id: 'gc1' }, children: [] },
        ],
      },
      { tag: 'ChildB', attributes: { id: '2' }, children: [] },
    ],
  };
}

describe('addChild', () => {
  it('adds child at root level', () => {
    const tree = makeTree();
    const newChild: ComponentNode = { tag: 'NewChild', attributes: {}, children: [] };
    const result = addChild(tree, [], newChild);

    expect(result.children.length).toBe(3);
    expect(result.children[2].tag).toBe('NewChild');
    // Original unchanged
    expect(tree.children.length).toBe(2);
  });

  it('adds child at nested level', () => {
    const tree = makeTree();
    const newChild: ComponentNode = { tag: 'Deep', attributes: {}, children: [] };
    const result = addChild(tree, [0], newChild);

    expect(result.children[0].children.length).toBe(2);
    expect(result.children[0].children[1].tag).toBe('Deep');
    expect(tree.children[0].children.length).toBe(1);
  });
});

describe('removeChild', () => {
  it('removes a child', () => {
    const tree = makeTree();
    const result = removeChild(tree, [1]);

    expect(result.children.length).toBe(1);
    expect(result.children[0].tag).toBe('ChildA');
    expect(tree.children.length).toBe(2);
  });
});

describe('updateAttributes', () => {
  it('updates attributes on a node', () => {
    const tree = makeTree();
    const result = updateAttributes(tree, [0], { id: '99', extra: 'yes' });

    expect(result.children[0].attributes.id).toBe('99');
    expect(result.children[0].attributes.extra).toBe('yes');
    expect(tree.children[0].attributes.id).toBe('1');
  });
});

describe('updateTextContent', () => {
  it('sets text content on a node', () => {
    const tree = makeTree();
    const result = updateTextContent(tree, [1], 'some text');

    expect(result.children[1].textContent).toBe('some text');
    expect(tree.children[1].textContent).toBeUndefined();
  });
});

describe('findNodeByPath', () => {
  it('finds root with empty path', () => {
    const tree = makeTree();
    expect(findNodeByPath(tree, [])?.tag).toBe('Root');
  });

  it('finds nested node', () => {
    const tree = makeTree();
    expect(findNodeByPath(tree, [0, 0])?.tag).toBe('Grandchild');
  });

  it('returns null for invalid path', () => {
    const tree = makeTree();
    expect(findNodeByPath(tree, [5])).toBeNull();
  });
});

describe('findAllByTag', () => {
  it('finds all nodes with matching tag', () => {
    const tree: ComponentNode = {
      tag: 'Root',
      attributes: {},
      children: [
        { tag: 'Target', attributes: { id: '1' }, children: [] },
        {
          tag: 'Container',
          attributes: {},
          children: [
            { tag: 'Target', attributes: { id: '2' }, children: [] },
          ],
        },
      ],
    };

    const results = findAllByTag(tree, 'Target');
    expect(results.length).toBe(2);
    expect(results[0].path).toEqual([0]);
    expect(results[1].path).toEqual([1, 0]);
  });
});
