/**
 * Schema registry for all VASSAL Buildable components.
 * 
 * Each component definition includes:
 * - xmlTag: the fully-qualified Java class name used as XML element
 * - attributes: list of configurable attributes with types and defaults
 * - allowedChildren: which component types can be nested inside
 * - requiredChildren: components that must be present
 * 
 * This registry drives the UI — the menu system is generated from it.
 * 
 * TODO: Populate from VASSAL source analysis — Phase 1, Task 2.
 */

export interface AttributeDef {
  name: string;
  type: 'string' | 'int' | 'boolean' | 'color' | 'image' | 'keystroke' | 'expression';
  defaultValue?: string;
  description: string;
  required?: boolean;
}

export interface ComponentDef {
  xmlTag: string;
  displayName: string;
  description: string;
  category: 'map' | 'piece' | 'control' | 'display' | 'property' | 'logic';
  attributes: AttributeDef[];
  allowedChildren: string[];  // xmlTag references
  requiredChildren?: string[];
  wargameNotes?: string;  // guidance for hex-and-counter wargame usage
}

// Registry will be populated with all component definitions
export const componentRegistry: Map<string, ComponentDef> = new Map();

// Example: GameModule root
componentRegistry.set('VASSAL.build.GameModule', {
  xmlTag: 'VASSAL.build.GameModule',
  displayName: 'Game Module',
  description: 'Root module container',
  category: 'control',
  attributes: [
    { name: 'name', type: 'string', description: 'Module name', required: true },
    { name: 'version', type: 'string', defaultValue: '1.0', description: 'Module version' },
    { name: 'description', type: 'string', description: 'Module description' },
    { name: 'VassalVersion', type: 'string', defaultValue: '3.7.5', description: 'Target VASSAL version' },
    { name: 'nextPieceSlotId', type: 'int', defaultValue: '0', description: 'Counter for piece slot IDs' },
    { name: 'ModuleOther1', type: 'string', defaultValue: '', description: 'Reserved' },
    { name: 'ModuleOther2', type: 'string', defaultValue: '', description: 'Reserved' },
  ],
  allowedChildren: [
    'VASSAL.build.module.Map',
    'VASSAL.build.module.PieceWindow',
    'VASSAL.build.module.ToolbarMenu',
    'VASSAL.build.module.DiceButton',
    'VASSAL.build.module.GlobalKeyCommand',
    'VASSAL.build.module.StartupGlobalKeyCommand',
    'VASSAL.build.module.Inventory',
    'VASSAL.build.module.PredefinedSetup',
    'VASSAL.build.module.ChartWindow',
    'VASSAL.build.module.PrivateMap',
    'VASSAL.build.module.PlayerHand',
    'VASSAL.build.module.NotesWindow',
    'VASSAL.build.module.turn.TurnTracker',
    'VASSAL.build.module.ChessClockControl',
    'VASSAL.build.module.SpecialDiceButton',
    'VASSAL.build.module.DoActionButton',
    'VASSAL.build.module.MultiActionButton',
    'VASSAL.build.module.RandomTextButton',
  ],
  requiredChildren: [
    'VASSAL.build.module.BasicCommandEncoder',
    'VASSAL.build.module.Documentation',
    'VASSAL.build.module.GlobalOptions',
    'VASSAL.build.module.Chatter',
    'VASSAL.build.module.KeyNamer',
  ],
});
