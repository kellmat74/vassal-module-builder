/**
 * Maps VASSAL fully-qualified XML tags to help-content keys.
 * Falls back through increasingly aggressive prefix stripping.
 */
import { componentHelp, traitHelp, conceptHelp, type HelpEntry } from '../../schema/help-content.js';

const tagToKey: Record<string, string> = {
  'VASSAL.build.module.Map': 'Map',
  'VASSAL.build.module.PrivateMap': 'PrivateMap',
  'VASSAL.build.module.PlayerHand': 'PlayerHand',
  'VASSAL.build.module.PieceWindow': 'PieceWindow',
  'VASSAL.build.module.ChartWindow': 'ChartWindow',
  'VASSAL.build.module.DiceButton': 'DiceButton',
  'VASSAL.build.module.turn.TurnTracker': 'TurnTracker',
  'VASSAL.build.module.map.DrawPile': 'DrawPile',
  'VASSAL.build.module.map.SetupStack': 'SetupStack',
  'VASSAL.build.module.GlobalKeyCommand': 'GlobalKeyCommand',
  'VASSAL.build.module.Inventory': 'Inventory',
  'VASSAL.build.module.PredefinedSetup': 'PredefinedSetup',
  'VASSAL.build.module.map.boardPicker.board.mapgrid.HexGrid': 'HexGrid',
  'VASSAL.build.module.map.boardPicker.board.mapgrid.SquareGrid': 'SquareGrid',
  'VASSAL.build.module.map.boardPicker.board.mapgrid.RegionGrid': 'RegionGrid',
  'VASSAL.build.module.map.boardPicker.board.mapgrid.ZonedGrid': 'ZonedGrid',
  'VASSAL.build.module.map.boardPicker.board.mapgrid.GridNumbering': 'GridNumbering',
  'VASSAL.build.module.Documentation': 'Documentation',
  'VASSAL.build.module.PlayerRoster': 'PlayerRoster',
  'VASSAL.build.module.GlobalOptions': 'GlobalOptions',
  'VASSAL.build.module.Chatter': 'Chatter',
  'VASSAL.build.module.map.Zoomer': 'Zoomer',
  'VASSAL.build.module.map.CounterDetailViewer': 'CounterDetailViewer',
  'VASSAL.build.module.map.Flare': 'Flare',
  'VASSAL.build.module.map.HighlightLastMoved': 'HighlightLastMoved',
  'VASSAL.build.module.map.GlobalMap': 'GlobalMap',
  'VASSAL.build.module.map.LOS_Thread': 'LOS_Thread',
  'VASSAL.build.module.map.MapShader': 'MapShader',
  'VASSAL.build.module.map.ImageSaver': 'ImageSaver',
  'VASSAL.build.module.map.MassKeyCommand': 'MassKeyCommand',
  'VASSAL.build.module.map.HidePiecesButton': 'HidePiecesButton',
  'VASSAL.build.module.PrototypesContainer': 'PrototypesContainer',
  'VASSAL.build.module.PrototypeDefinition': 'Prototype',
  'VASSAL.build.module.NotesWindow': 'NotesWindow',
  'VASSAL.build.module.DoActionButton': 'DoActionButton',
  'VASSAL.build.module.ToolbarMenu': 'ToolbarMenu',
  'VASSAL.build.module.map.BoardPicker': 'BoardPicker',
  'VASSAL.build.module.map.boardPicker.Board': 'Board',
};

/** Well-known attribute descriptions (attribute key → human explanation) */
const attrHelp: Record<string, string> = {
  // GameModule root
  name: 'Display name of the module shown in VASSAL\'s module manager.',
  version: 'Version number of this module (e.g., "1.0", "3.2").',
  VassalVersion: 'The VASSAL engine version this module was built for.',
  description: 'Short text description shown in the module manager.',
  nextPieceSlotId: 'Internal counter tracking the next available piece slot ID. Auto-incremented.',
  ModuleOther1: 'Reserved field for module-specific metadata.',
  ModuleOther2: 'Reserved field for module-specific metadata.',

  // Map
  mapName: 'The name that appears on the map window tab.',
  boardList: 'Reference to boards assigned to this map.',
  boardPicker: 'Controls how boards are selected when starting a game.',
  changeFormat: 'Report format when a piece changes state on this map.',
  createFormat: 'Report format when a new piece is added to this map.',
  moveKey: 'Hotkey used to move selected pieces.',
  moveWithinFormat: 'Report format when a piece moves within this map.',
  moveToFormat: 'Report format when a piece moves to this map.',

  // HexGrid / SquareGrid
  sideways: 'If true, hexes are flat-topped. If false, pointy-topped.',
  dx: 'Hex/square width in pixels.',
  dy: 'Hex/square height in pixels.',
  x0: 'X pixel offset of the grid origin from the top-left of the board image.',
  y0: 'Y pixel offset of the grid origin from the top-left of the board image.',
  snapTo: 'If true, pieces snap to grid intersections/centers when dropped.',
  visible: 'If true, the grid lines are drawn over the map image.',
  dotsVisible: 'If true, center dots are drawn at each hex/square center.',
  color: 'Color of grid lines (R,G,B format).',
  edgesLegal: 'If true, pieces can snap to hex edge midpoints.',
  cornersLegal: 'If true, pieces can snap to hex corners/vertices.',

  // GridNumbering
  hType: 'Horizontal numbering direction (A=left-to-right, etc.).',
  vType: 'Vertical numbering direction.',
  first: 'Which coordinate comes first: "H" for column-first, "V" for row-first.',
  hOff: 'Starting number for horizontal (column) labels.',
  vOff: 'Starting number for vertical (row) labels.',
  hDescend: 'If true, column numbers decrease left to right.',
  vDescend: 'If true, row numbers decrease top to bottom.',
  sep: 'Separator between column and row numbers (often empty for "0101" style).',
  stagger: 'If true, numbering staggers for hex grids (odd/even row offset).',

  // CounterDetailViewer
  delay: 'Milliseconds to hover before the popup appears.',
  graphicsZoom: 'Zoom level for piece images in the popup.',
  showgraph: 'If true, show piece images in the mouseover popup.',
  showtext: 'If true, show text details in the mouseover popup.',
  summaryReportFormat: 'Text format for the stack summary line.',
  counterReportFormat: 'Text format for each individual piece line.',

  // Zoomer
  zoomStart: 'Index of the initial zoom level when the map opens.',
  maxZoom: 'Maximum zoom level (e.g., 5 = 500%).',
  minZoom: 'Minimum zoom level (e.g., 1 = 100%).',

  // DiceButton
  nDice: 'Number of dice to roll.',
  nSides: 'Number of sides per die.',
  text: 'Button label on the toolbar.',
  tooltip: 'Tooltip shown when hovering the button.',
  reportFormat: 'Chat log format for the roll result.',
  reportTotal: 'If true, report the sum of all dice rather than individual results.',

  // GlobalKeyCommand
  key: 'The keyboard shortcut that triggers this command.',

  // PlayerRoster
  buttonText: 'Label shown on the Retire/Switch Sides button.',
  buttonToolTip: 'Tooltip for the Retire button.',

  // GlobalOptions
  autoReport: 'When to auto-report moves in chat: "Always", "Never", or "Use Preferences".',
  playerIdFormat: 'Format for player identification in chat messages.',

  // Flare
  pulses: 'Number of times the flare circle pulses.',
  pulsesPerSec: 'How fast the flare pulses.',

  // HighlightLastMoved
  thickness: 'Line thickness of the highlight indicator in pixels.',

  // PieceSlot / PrototypeDefinition
  gpid: 'Global Piece ID — unique identifier for this piece slot.',
  entryName: 'Display name shown in the piece palette.',
  height: 'Height of the piece image in pixels.',
  width: 'Width of the piece image in pixels.',

  // TurnTracker levels
  turnFormat: 'Display format for the current turn state.',
  lengthStyle: 'How the counter limit is determined: "Fixed", "Prompt", "Maximum".',

  // General
  buttonHotkey: 'Keyboard shortcut to activate this button.',
  icon: 'Path to the toolbar icon image.',
  fileName: 'Path to the image file within the module archive.',
  title: 'Window or dialog title text.',
  hotkey: 'Keyboard shortcut for this action.',
  propertyName: 'Name of the property this component reads or writes.',
};

export function getComponentHelp(tag: string): HelpEntry | undefined {
  const key = tagToKey[tag];
  if (key) {
    return componentHelp.get(key);
  }
  // Try short name as fallback
  const shortName = tag.split('.').pop() ?? '';
  return componentHelp.get(shortName);
}

export function getTraitHelp(traitId: string): HelpEntry | undefined {
  return traitHelp.get(traitId);
}

export function getConceptHelp(conceptId: string): HelpEntry | undefined {
  return conceptHelp.get(conceptId);
}

export function getAttributeHelp(attrKey: string): string | undefined {
  return attrHelp[attrKey];
}
