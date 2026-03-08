import { useState } from 'react';
import type { ComponentNode } from '../../core/xml-serializer.js';
import { getComponentHelp, getAttributeHelp } from '../helpers/help-lookup.js';

interface Props {
  node: ComponentNode;
  path: number[];
}

function displayTag(tag: string): string {
  return tag
    .replace(/^VASSAL\.build\.module\./, '')
    .replace(/^VASSAL\.build\./, '')
    .replace(/^VASSAL\./, '');
}

function AttrRow({ attrKey, value }: { attrKey: string; value: string }) {
  const [showTip, setShowTip] = useState(false);
  const help = getAttributeHelp(attrKey);

  return (
    <tr className="border-b border-gray-900 hover:bg-gray-900/50 group">
      <td
        className="py-1.5 pr-2 text-gray-300 font-mono text-xs relative"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        <span className={help ? 'border-b border-dotted border-gray-600 cursor-help' : ''}>
          {attrKey}
        </span>
        {help && <span className="ml-1 text-gray-600 text-[10px]">ⓘ</span>}
        {help && showTip && (
          <div className="absolute left-0 top-full z-50 mt-1 w-72 p-2 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 shadow-lg leading-relaxed">
            {help}
          </div>
        )}
      </td>
      <td className="py-1.5 text-gray-200 font-mono text-xs break-all">
        {value || <span className="text-gray-600">(empty)</span>}
      </td>
    </tr>
  );
}

export function NodeDetail({ node }: Props) {
  const attrs = Object.entries(node.attributes ?? {});
  const help = getComponentHelp(node.tag);

  return (
    <div>
      <h2 className="text-xl font-bold text-amber-400 mb-0.5">{displayTag(node.tag)}</h2>
      <p className="text-[11px] text-gray-500 mb-3 font-mono">{node.tag}</p>

      {/* Component help summary */}
      {help && (
        <div className="mb-4 p-3 rounded bg-gray-900 border border-gray-800">
          <p className="text-sm text-gray-200 leading-relaxed">{help.summary}</p>
          {help.tips && help.tips.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Tips</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                {help.tips.map((tip, i) => (
                  <li key={i}>💡 {tip}</li>
                ))}
              </ul>
            </div>
          )}
          {help.seeAlso && help.seeAlso.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Related</p>
              <div className="flex flex-wrap gap-1">
                {help.seeAlso.map((ref) => (
                  <span key={ref} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{ref}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {attrs.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Attributes
            <span className="ml-2 text-[10px] text-gray-600 font-normal">hover ⓘ for help</span>
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-1 text-gray-500 font-medium w-1/3">Key</th>
                <th className="text-left py-1 text-gray-500 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {attrs.map(([key, value]) => (
                <AttrRow key={key} attrKey={key} value={value} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {node.textContent && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Text Content (Trait Chain)</h3>
          <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-96 border border-gray-800">
            {node.textContent}
          </pre>
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Children ({node.children.length})
          </h3>
          <ul className="text-sm text-gray-400 space-y-0.5">
            {node.children.map((child, i) => (
              <li key={i} className="font-mono text-xs">
                {displayTag(child.tag)}
                {child.attributes?.name ? ` "${child.attributes.name}"` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
