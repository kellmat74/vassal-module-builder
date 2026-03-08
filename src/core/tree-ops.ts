/**
 * Immutable tree operations for ComponentNode trees.
 * All mutation functions return new trees — critical for React state management.
 */

import type { ComponentNode } from './xml-serializer.js';

function cloneNode(node: ComponentNode): ComponentNode {
  return {
    tag: node.tag,
    attributes: { ...node.attributes },
    children: [...node.children],
    ...(node.textContent !== undefined ? { textContent: node.textContent } : {}),
  };
}

/**
 * Navigate to a parent via path, cloning each node along the way.
 * Returns [newRoot, parentNode] where parentNode is the cloned node at parentPath.
 */
function clonePath(tree: ComponentNode, path: number[]): [ComponentNode, ComponentNode] {
  const root = cloneNode(tree);
  let current = root;

  for (const idx of path) {
    if (idx < 0 || idx >= current.children.length) {
      throw new Error(`Invalid path index ${idx}: node has ${current.children.length} children`);
    }
    const cloned = cloneNode(current.children[idx]);
    current.children[idx] = cloned;
    current = cloned;
  }

  return [root, current];
}

export function addChild(tree: ComponentNode, parentPath: number[], child: ComponentNode): ComponentNode {
  const [root, parent] = clonePath(tree, parentPath);
  parent.children.push(child);
  return root;
}

export function removeChild(tree: ComponentNode, path: number[]): ComponentNode {
  if (path.length === 0) {
    throw new Error('Cannot remove root node');
  }
  const parentPath = path.slice(0, -1);
  const childIdx = path[path.length - 1];
  const [root, parent] = clonePath(tree, parentPath);

  if (childIdx < 0 || childIdx >= parent.children.length) {
    throw new Error(`Invalid child index ${childIdx}`);
  }
  parent.children.splice(childIdx, 1);
  return root;
}

export function updateAttributes(
  tree: ComponentNode,
  path: number[],
  attrs: Record<string, string>,
): ComponentNode {
  const [root, target] = clonePath(tree, path);
  Object.assign(target.attributes, attrs);
  return root;
}

export function updateTextContent(
  tree: ComponentNode,
  path: number[],
  text: string,
): ComponentNode {
  const [root, target] = clonePath(tree, path);
  target.textContent = text;
  return root;
}

export function findNodeByPath(tree: ComponentNode, path: number[]): ComponentNode | null {
  let current: ComponentNode = tree;
  for (const idx of path) {
    if (idx < 0 || idx >= current.children.length) return null;
    current = current.children[idx];
  }
  return current;
}

export function findAllByTag(
  tree: ComponentNode,
  tag: string,
): { node: ComponentNode; path: number[] }[] {
  const results: { node: ComponentNode; path: number[] }[] = [];

  function walk(node: ComponentNode, currentPath: number[]): void {
    if (node.tag === tag) {
      results.push({ node, path: [...currentPath] });
    }
    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i], [...currentPath, i]);
    }
  }

  walk(tree, []);
  return results;
}
