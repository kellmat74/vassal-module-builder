/**
 * XML serializer for VASSAL buildFile.xml generation.
 * Produces hierarchical XML where tags are fully-qualified Java class names.
 */

export interface ComponentNode {
  tag: string;
  attributes: Record<string, string>;
  children: ComponentNode[];
  textContent?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function serializeNode(node: ComponentNode, indent: number): string {
  const pad = '    '.repeat(indent);
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join('');

  if (node.children.length === 0 && !node.textContent) {
    return `${pad}<${node.tag}${attrs}/>`;
  }

  const lines: string[] = [];
  lines.push(`${pad}<${node.tag}${attrs}>`);

  if (node.textContent) {
    lines.push(`${pad}    ${escapeXml(node.textContent)}`);
  }

  for (const child of node.children) {
    lines.push(serializeNode(child, indent + 1));
  }

  lines.push(`${pad}</${node.tag}>`);
  return lines.join('\n');
}

export function serializeBuildFile(root: ComponentNode): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${serializeNode(root, 0)}\n`;
}
