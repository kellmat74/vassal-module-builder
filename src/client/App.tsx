import { useReducer, useCallback } from 'react';
import { FileUpload } from './components/FileUpload.js';
import { ModuleTree } from './components/ModuleTree.js';
import { NodeDetail } from './components/NodeDetail.js';
import { SuggestionsPanel } from './components/SuggestionsPanel.js';
import type { ComponentNode } from '../core/xml-serializer.js';
import type { Suggestion } from '../core/module-analyzer.js';

interface ModuleState {
  componentTree: ComponentNode | null;
  moduledata: { name: string; version: string; vassalVersion: string; description: string } | null;
  imageList: string[];
  selectedPath: number[] | null;
  suggestions: Suggestion[];
  filename: string | null;
}

type Action =
  | { type: 'LOAD_MODULE'; payload: { componentTree: ComponentNode; moduledata: ModuleState['moduledata']; imageList: string[]; filename: string } }
  | { type: 'SELECT_NODE'; path: number[] | null }
  | { type: 'SET_SUGGESTIONS'; suggestions: Suggestion[] }
  | { type: 'UPDATE_TREE'; tree: ComponentNode };

function reducer(state: ModuleState, action: Action): ModuleState {
  switch (action.type) {
    case 'LOAD_MODULE':
      return { ...state, ...action.payload, selectedPath: null, suggestions: [] };
    case 'SELECT_NODE':
      return { ...state, selectedPath: action.path };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.suggestions };
    case 'UPDATE_TREE':
      return { ...state, componentTree: action.tree };
    default:
      return state;
  }
}

const initialState: ModuleState = {
  componentTree: null,
  moduledata: null,
  imageList: [],
  selectedPath: null,
  suggestions: [],
  filename: null,
};

function getNodeAtPath(tree: ComponentNode, path: number[]): ComponentNode | null {
  let node: ComponentNode = tree;
  for (const idx of path) {
    if (!node.children || idx >= node.children.length) return null;
    node = node.children[idx];
  }
  return node;
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
      payload: { componentTree: data.componentTree, moduledata: data.moduledata, imageList: data.imageList ?? [], filename: file.name },
    });

    // Auto-analyze
    const analyzeRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentTree: data.componentTree }),
    });
    if (analyzeRes.ok) {
      const { suggestions } = await analyzeRes.json();
      dispatch({ type: 'SET_SUGGESTIONS', suggestions });
    }
  }, []);

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
          changes: [],
        },
        originalFilename: state.filename,
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

  // Prevent browser default drop behavior (downloading the file) everywhere
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
        <div className="ml-auto flex gap-2">
          {!state.componentTree && <FileUpload onUpload={handleUpload} />}
          {state.componentTree && (
            <>
              <FileUpload onUpload={handleUpload} />
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded font-medium"
              >
                Save Modded .vmod
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

          {/* Right: Suggestions */}
          <div className="w-1/4 border-l border-gray-800 overflow-y-auto p-2">
            <SuggestionsPanel suggestions={state.suggestions} />
          </div>
        </div>
      )}
    </div>
  );
}
