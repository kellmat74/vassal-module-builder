import { useState, useCallback } from 'react';
import type { ComponentNode } from '../../core/xml-serializer.js';
import { getComponentHelp } from '../helpers/help-lookup.js';

interface Props {
  tree: ComponentNode;
  selectedPath: number[] | null;
  onSelect: (path: number[]) => void;
}

function displayTag(tag: string): string {
  return tag
    .replace(/^VASSAL\.build\.module\.documentation\./, '')
    .replace(/^VASSAL\.build\.module\.map\.boardPicker\.board\.mapgrid\./, '')
    .replace(/^VASSAL\.build\.module\.map\.boardPicker\.board\./, '')
    .replace(/^VASSAL\.build\.module\.map\.boardPicker\./, '')
    .replace(/^VASSAL\.build\.module\.map\./, '')
    .replace(/^VASSAL\.build\.module\.turn\./, '')
    .replace(/^VASSAL\.build\.module\.folder\./, '')
    .replace(/^VASSAL\.build\.module\./, '')
    .replace(/^VASSAL\.build\.widget\./, '')
    .replace(/^VASSAL\.build\./, '')
    .replace(/^VASSAL\./, '');
}

function TreeNode({
  node,
  path,
  selectedPath,
  onSelect,
  depth,
}: {
  node: ComponentNode;
  path: number[];
  selectedPath: number[] | null;
  onSelect: (path: number[]) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedPath && path.length === selectedPath.length && path.every((v, i) => v === selectedPath[i]);

  const handleClick = useCallback(() => {
    onSelect(path);
  }, [path, onSelect]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  const label = node.attributes?.name
    ? `${displayTag(node.tag)} "${node.attributes.name}"`
    : displayTag(node.tag);

  const help = getComponentHelp(node.tag);

  return (
    <div>
      <div
        className={`flex items-center h-7 cursor-pointer text-xs select-none
          ${isSelected ? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/5'}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
        title={help?.summary}
      >
        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <span
            onClick={toggle}
            className={`inline-flex items-center justify-center w-4 h-4 mr-1 text-[10px] text-gray-500 hover:text-gray-200 transition-transform ${expanded ? '' : '-rotate-90'}`}
          >
            ▾
          </span>
        ) : (
          <span className="w-4 mr-1" />
        )}

        {/* Icon */}
        <span className="mr-1.5 text-sm opacity-60">
          {hasChildren ? (expanded ? '📂' : '📁') : '📄'}
        </span>

        {/* Label */}
        <span className="truncate">{label}</span>

        {hasChildren && (
          <span className="ml-1.5 text-[10px] text-gray-600 tabular-nums">{node.children.length}</span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="relative">
          {/* Indent guide line */}
          <div
            className="absolute top-0 bottom-0 border-l border-gray-800"
            style={{ left: `${depth * 16 + 11}px` }}
          />
          {node.children.map((child, i) => (
            <TreeNode
              key={i}
              node={child}
              path={[...path, i]}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ModuleTree({ tree, selectedPath, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">
        Component Tree
      </h2>
      <TreeNode
        node={tree}
        path={[]}
        selectedPath={selectedPath}
        onSelect={onSelect}
        depth={0}
      />
    </div>
  );
}
