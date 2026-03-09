import { useReducer, useCallback } from 'react';
import { FileUpload } from './components/FileUpload.js';
import { ModuleTree } from './components/ModuleTree.js';
import { NodeDetail } from './components/NodeDetail.js';
import { FeatureCatalog } from './components/FeatureCatalog.js';
import type { ComponentNode } from '../core/xml-serializer.js';
import type { CatalogFeature } from '../schema/feature-catalog.js';

interface ModuleState {
  componentTree: ComponentNode | null;
  moduledata: { name: string; version: string; vassalVersion: string; description: string; extra1: string; extra2: string } | null;
  imageList: string[];
  selectedPath: number[] | null;
  filename: string | null;
  sessionId: string | null;
  changes: { featureId: string; featureName: string }[];
}

type Action =
  | { type: 'LOAD_MODULE'; payload: { componentTree: ComponentNode; moduledata: ModuleState['moduledata']; imageList: string[]; filename: string; sessionId: string } }
  | { type: 'SELECT_NODE'; path: number[] | null }
  | { type: 'UPDATE_TREE'; tree: ComponentNode; change: { featureId: string; featureName: string } };

function reducer(state: ModuleState, action: Action): ModuleState {
  switch (action.type) {
    case 'LOAD_MODULE':
      return { ...state, ...action.payload, selectedPath: null, changes: [] };
    case 'SELECT_NODE':
      return { ...state, selectedPath: action.path };
    case 'UPDATE_TREE':
      return { ...state, componentTree: action.tree, changes: [...state.changes, action.change] };
    default:
      return state;
  }
}

const initialState: ModuleState = {
  componentTree: null,
  moduledata: null,
  imageList: [],
  selectedPath: null,
  filename: null,
  sessionId: null,
  changes: [],
};

function getNodeAtPath(tree: ComponentNode, path: number[]): ComponentNode | null {
  let node: ComponentNode = tree;
  for (const idx of path) {
    if (!node.children || idx >= node.children.length) return null;
    node = node.children[idx];
  }
  return node;
}

/** Deep clone a ComponentNode tree (immutable update) */
function cloneTree(node: ComponentNode): ComponentNode {
  return {
    tag: node.tag,
    attributes: { ...node.attributes },
    children: node.children.map(cloneTree),
    ...(node.textContent !== undefined ? { textContent: node.textContent } : {}),
  };
}

/** Add a child node to a specific target in the tree */
function addChildToNode(tree: ComponentNode, child: ComponentNode, targetTag?: string): ComponentNode {
  const newTree = cloneTree(tree);
  if (!targetTag) {
    // Add to root
    newTree.children.push(child);
    return newTree;
  }
  // Find first matching descendant and add as child
  const stack: ComponentNode[] = [newTree];
  while (stack.length) {
    const current = stack.pop()!;
    if (current.tag === targetTag || current.tag.endsWith(`.${targetTag}`)) {
      current.children.push(child);
      return newTree;
    }
    for (const c of current.children) stack.push(c);
  }
  // Fallback: add to root
  newTree.children.push(child);
  return newTree;
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('module', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json();
      alert(`Upload failed: ${err.error}`);
      return;
    }

    const data = await res.json();
    dispatch({
      type: 'LOAD_MODULE',
      payload: { componentTree: data.componentTree, moduledata: data.moduledata, imageList: data.imageList ?? [], filename: file.name, sessionId: data.sessionId },
    });
  }, []);

  const handleAddFeature = useCallback((feature: CatalogFeature, params: Record<string, string | number | boolean>) => {
    if (!state.componentTree) return;

    const template = feature.buildTemplate(params);

    let newTree = state.componentTree;

    if (typeof template === 'string') {
      // Trait string — need to inject into prototypes (future: let user pick which ones)
      // For now, show what would be added
      alert(`Trait injection coming soon!\n\nWould add to prototypes:\n${template}`);
      return;
    }

    // Component node — add based on target
    if (feature.target === 'module') {
      newTree = addChildToNode(newTree, template);
    } else if (feature.target === 'each-map' || feature.target === 'first-map') {
      const clone = cloneTree(newTree);
      let added = false;
      for (const child of clone.children) {
        if (child.tag === 'VASSAL.build.module.Map') {
          child.children.push({ ...template, children: [...template.children] });
          added = true;
          if (feature.target === 'first-map') break;
        }
      }
      if (!added) {
        // No maps found, add to root as fallback
        clone.children.push(template);
      }
      newTree = clone;
    }

    dispatch({
      type: 'UPDATE_TREE',
      tree: newTree,
      change: { featureId: feature.id, featureName: feature.name },
    });
  }, [state.componentTree]);

  const handleDownload = useCallback(async () => {
    if (!state.componentTree || !state.moduledata) return;
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        componentTree: state.componentTree,
        moduledata: state.moduledata,
        manifest: {
          basedOn: { name: state.moduledata.name, version: state.moduledata.version },
          modifiedBy: 'VASSAL Module Builder',
          modifiedDate: new Date().toISOString(),
          toolVersion: '0.1.0',
          changes: state.changes.map(c => ({ type: 'added', component: c.featureName, description: `Added ${c.featureName}` })),
        },
        originalFilename: state.filename,
        sessionId: state.sessionId,
      }),
    });
    if (!res.ok) { alert('Download failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (state.filename ?? 'module.vmod').replace(/\.vmod$/i, '_modded.vmod');
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const selectedNode = state.componentTree && state.selectedPath
    ? getNodeAtPath(state.componentTree, state.selectedPath)
    : null;

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.vmod')) handleUpload(file);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100" onDragOver={onDragOver} onDrop={onDrop}>
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-2 bg-gray-900 border-b border-gray-800">
        <h1 className="text-lg font-bold text-amber-400">VASSAL Module Builder</h1>
        {state.moduledata && (
          <span className="text-sm text-gray-400">
            {state.moduledata.name} v{state.moduledata.version}
          </span>
        )}
        {state.changes.length > 0 && (
          <span className="text-xs text-amber-500">
            {state.changes.length} change{state.changes.length !== 1 ? 's' : ''} pending
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {!state.componentTree && <FileUpload onUpload={handleUpload} />}
          {state.componentTree && (
            <>
              <FileUpload onUpload={handleUpload} />
              <button
                onClick={handleDownload}
                className={`px-3 py-1.5 text-white text-sm rounded font-medium ${
                  state.changes.length > 0
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Save Modded .vmod{state.changes.length > 0 ? ` (${state.changes.length})` : ''}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      {!state.componentTree ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400 mb-2">Upload a .vmod file to get started</p>
            <p className="text-gray-500">Drag and drop or click the Upload button above</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Tree */}
          <div className="w-1/4 border-r border-gray-800 overflow-y-auto p-2">
            <ModuleTree
              tree={state.componentTree}
              selectedPath={state.selectedPath}
              onSelect={(path) => dispatch({ type: 'SELECT_NODE', path })}
            />
          </div>

          {/* Center: Detail */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedNode ? (
              <NodeDetail node={selectedNode} path={state.selectedPath!} />
            ) : (
              <p className="text-gray-500 text-center mt-10">Select a node from the tree to view its details</p>
            )}
          </div>

          {/* Right: Feature Catalog */}
          <div className="w-1/4 border-l border-gray-800 p-2">
            <FeatureCatalog tree={state.componentTree} onAddFeature={handleAddFeature} addedFeatureIds={state.changes.map(c => c.featureId)} />
          </div>
        </div>
      )}
    </div>
  );
}
