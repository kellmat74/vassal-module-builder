/**
 * Registry of all 44 VASSAL piece traits (Decorators).
 * 
 * Each trait definition includes its serialization ID, configurable
 * parameters, and serialization/deserialization logic.
 * 
 * TODO: Populate all traits — Phase 1, Task 2.
 */

export interface TraitParam {
  name: string;
  type: 'string' | 'int' | 'boolean' | 'keystroke' | 'expression' | 'image' | 'color';
  defaultValue?: string;
  description: string;
}

export interface TraitDef {
  id: string;          // Serialization ID (e.g., 'emb2;')
  className: string;   // Java class name
  displayName: string;
  category: 'visual' | 'visibility' | 'property' | 'action' | 'movement' | 'grouping';
  description: string;
  params: TraitParam[];
  wargameNotes?: string;
  addedInVersion?: string;  // e.g., '3.7' for newer features
}

export const traitRegistry: Map<string, TraitDef> = new Map();

// Example entries — full registry to be built in Phase 1
traitRegistry.set('piece;', {
  id: 'piece;',
  className: 'BasicPiece',
  displayName: 'Basic Piece',
  category: 'visual',
  description: 'Core piece: base image and name. Always the innermost element.',
  params: [
    { name: 'image', type: 'image', description: 'Base piece image' },
    { name: 'name', type: 'string', description: 'Piece name' },
  ],
});

traitRegistry.set('emb2;', {
  id: 'emb2;',
  className: 'Embellishment',
  displayName: 'Layer (Embellishment)',
  category: 'visual',
  description: 'Multi-state image layers. The workhorse of counter display. Use for flipped, disrupted, eliminated states.',
  params: [
    { name: 'activateCommand', type: 'string', description: 'Menu command to activate' },
    { name: 'activateKey', type: 'keystroke', description: 'Key to activate' },
    { name: 'upCommand', type: 'string', description: 'Menu command to increase level' },
    { name: 'downCommand', type: 'string', description: 'Menu command to decrease level' },
    // ... many more params
  ],
  wargameNotes: 'Use for: step reduction (full/reduced), combat status (disrupted/demoralized/broken), supply status overlays',
});

traitRegistry.set('macro;', {
  id: 'macro;',
  className: 'TriggerAction',
  displayName: 'Trigger Action (Macro)',
  category: 'action',
  description: 'Fires a sequence of key commands. Supports looping and conditional execution. The primary automation engine.',
  params: [
    { name: 'name', type: 'string', description: 'Description' },
    { name: 'command', type: 'string', description: 'Menu command' },
    { name: 'key', type: 'keystroke', description: 'Trigger key' },
    { name: 'propertyMatch', type: 'expression', description: 'Property filter' },
    { name: 'watchKeys', type: 'string', description: 'Keys to watch for' },
    { name: 'actionKeys', type: 'string', description: 'Keys to fire' },
    { name: 'loop', type: 'boolean', defaultValue: 'false', description: 'Enable looping' },
    { name: 'loopType', type: 'string', defaultValue: 'counted', description: 'Loop type: counted, while, until' },
  ],
  wargameNotes: 'Essential for: combat resolution sequences, supply checking, reinforcement placement, multi-step state changes',
});
