import { useState, useMemo } from 'react';
import {
  featureCatalog,
  featureCategories,
  moduleHasFeature,
  type CatalogFeature,
} from '../../schema/feature-catalog.js';
import type { ComponentNode } from '../../core/xml-serializer.js';

interface Props {
  tree: ComponentNode | null;
  onAddFeature: (feature: CatalogFeature, params: Record<string, string | number | boolean>) => void;
  addedFeatureIds: string[];
}

function FeatureCard({
  feature,
  alreadyHas,
  justAdded,
  onAdd,
}: {
  feature: CatalogFeature;
  alreadyHas: boolean;
  justAdded: boolean;
  onAdd: (feature: CatalogFeature, params: Record<string, string | number | boolean>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string | number | boolean>>(() => {
    const defaults: Record<string, string | number | boolean> = {};
    for (const p of feature.params ?? []) {
      defaults[p.id] = p.default;
    }
    return defaults;
  });

  const prevalenceBar = Math.round(feature.prevalence / 5);

  return (
    <div className={`rounded border text-sm ${
      alreadyHas && !justAdded
        ? 'border-green-800/50 bg-green-900/20 opacity-60'
        : justAdded
        ? 'border-amber-800/50 bg-amber-900/20'
        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
    }`}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-2.5 py-2 cursor-pointer"
        onClick={() => !alreadyHas && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${alreadyHas && !justAdded ? 'text-green-400' : justAdded ? 'text-amber-400' : 'text-gray-200'}`}>
              {feature.name}
            </span>
            {alreadyHas && !justAdded && <span className="text-[10px] text-green-500">✓ Present</span>}
            {justAdded && <span className="text-[10px] text-amber-500">⊕ To be added</span>}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{feature.description}</p>
        </div>
        {!alreadyHas && (
          <span className="text-gray-600 text-xs shrink-0">{expanded ? '▼' : '▶'}</span>
        )}
      </div>

      {/* Expanded: prevalence + params + add button */}
      {expanded && !alreadyHas && (
        <div className="px-2.5 pb-2.5 border-t border-gray-800/50 pt-2 space-y-2">
          {/* Prevalence bar */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Used in {feature.prevalence}% of modules</span>
            <div className="flex gap-px">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-2 rounded-sm ${i < prevalenceBar ? 'bg-amber-600' : 'bg-gray-800'}`}
                />
              ))}
            </div>
          </div>

          {/* Long description */}
          {feature.longDescription && (
            <p className="text-[11px] text-gray-400 leading-relaxed">{feature.longDescription}</p>
          )}

          {/* Parameters */}
          {feature.params && feature.params.length > 0 && (
            <div className="space-y-1.5">
              {feature.params.map((param) => (
                <div key={param.id}>
                  <label className="text-[11px] text-gray-400 block mb-0.5" title={param.description}>
                    {param.label}
                  </label>
                  {param.type === 'boolean' ? (
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-300">
                      <input
                        type="checkbox"
                        checked={Boolean(paramValues[param.id])}
                        onChange={(e) => setParamValues({ ...paramValues, [param.id]: e.target.checked })}
                        className="rounded"
                      />
                      {param.description}
                    </label>
                  ) : param.type === 'select' ? (
                    <select
                      value={String(paramValues[param.id])}
                      onChange={(e) => setParamValues({ ...paramValues, [param.id]: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-gray-200"
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={String(paramValues[param.id])}
                      min={param.min}
                      max={param.max}
                      onChange={(e) => setParamValues({
                        ...paramValues,
                        [param.id]: param.type === 'number' ? Number(e.target.value) : e.target.value,
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-gray-200"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            onClick={() => onAdd(feature, paramValues)}
            className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-medium transition"
          >
            + Add to Module
          </button>
        </div>
      )}
    </div>
  );
}

export function FeatureCatalog({ tree, onAddFeature, addedFeatureIds }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Determine which features the module already has
  const featureStatus = useMemo(() => {
    if (!tree) return new Map<string, boolean>();
    const map = new Map<string, boolean>();
    for (const feature of featureCatalog) {
      map.set(feature.id, moduleHasFeature(tree, feature));
    }
    return map;
  }, [tree]);

  // Filter features
  const filtered = useMemo(() => {
    return featureCatalog.filter((f) => {
      if (selectedCategory && f.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedCategory]);

  // Group by category
  const grouped = useMemo(() => {
    const groups = new Map<string, CatalogFeature[]>();
    for (const f of filtered) {
      const list = groups.get(f.category) ?? [];
      list.push(f);
      groups.set(f.category, list);
    }
    return groups;
  }, [filtered]);

  const presentCount = [...featureStatus.values()].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1 shrink-0">
        Add Features
        {tree && (
          <span className="ml-1 text-gray-600 normal-case font-normal">
            ({presentCount}/{featureCatalog.length} present)
          </span>
        )}
      </h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search features..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 mb-2 shrink-0"
      />

      {/* Category pills */}
      <div className="flex flex-wrap gap-1 mb-2 shrink-0">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
            !selectedCategory ? 'bg-amber-700 text-amber-100' : 'bg-gray-800 text-gray-500 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {featureCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              selectedCategory === cat.id ? 'bg-amber-700 text-amber-100' : 'bg-gray-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feature list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {!tree ? (
          <p className="text-sm text-gray-600 px-1">Upload a module to see available features.</p>
        ) : (
          [...grouped.entries()].map(([catId, features]) => {
            const catLabel = featureCategories.find(c => c.id === catId)?.label ?? catId;
            return (
              <div key={catId}>
                {!selectedCategory && (
                  <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mt-2 mb-1 px-1">
                    {catLabel}
                  </h3>
                )}
                {features.map((f) => (
                  <FeatureCard
                    key={f.id}
                    feature={f}
                    alreadyHas={featureStatus.get(f.id) ?? false}
                    justAdded={addedFeatureIds.includes(f.id)}
                    onAdd={onAddFeature}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
