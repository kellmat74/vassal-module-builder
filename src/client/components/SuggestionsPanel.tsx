import type { Suggestion } from '../../core/module-analyzer.js';

interface Props {
  suggestions: Suggestion[];
}

const severityColors: Record<string, string> = {
  info: 'bg-blue-900/50 text-blue-300 border-blue-700',
  recommended: 'bg-amber-900/50 text-amber-300 border-amber-700',
  warning: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
};

const severityBadge: Record<string, string> = {
  info: 'bg-blue-700 text-blue-100',
  recommended: 'bg-amber-700 text-amber-100',
  warning: 'bg-yellow-700 text-yellow-100',
};

export function SuggestionsPanel({ suggestions }: Props) {
  if (suggestions.length === 0) {
    return (
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">Suggestions</h2>
        <p className="text-sm text-gray-600 px-1">No suggestions — upload a module to analyze.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
        Suggestions ({suggestions.length})
      </h2>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className={`p-2 rounded border text-sm ${severityColors[s.severity] ?? severityColors.info}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${severityBadge[s.severity] ?? severityBadge.info}`}>
                {s.severity}
              </span>
              <span className="font-medium">{s.title}</span>
            </div>
            <p className="text-xs opacity-80">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
