/**
 * Factory for creating minimal valid VASSAL component trees.
 */

import type { ComponentNode } from './xml-serializer.js';

export function createMinimalModule(name: string, version: string = '1.0'): ComponentNode {
  return {
    tag: 'VASSAL.build.GameModule',
    attributes: {
      ModuleOther1: '',
      ModuleOther2: '',
      VassalVersion: '3.7.20',
      description: '',
      name,
      nextPieceSlotId: '0',
      version,
    },
    children: [
      { tag: 'VASSAL.build.module.BasicCommandEncoder', attributes: {}, children: [] },
      {
        tag: 'VASSAL.build.module.Documentation',
        attributes: {},
        children: [
          {
            tag: 'VASSAL.build.module.documentation.AboutScreen',
            attributes: { fileName: '/images/Splash.png', title: 'About Module' },
            children: [],
          },
        ],
      },
      {
        tag: 'VASSAL.build.module.PlayerRoster',
        attributes: { buttonText: 'Retire', buttonToolTip: 'Switch sides' },
        children: [],
      },
      {
        tag: 'VASSAL.build.module.GlobalOptions',
        attributes: { autoReport: 'Always', playerIdFormat: '$PlayerName$' },
        children: [],
      },
      { tag: 'VASSAL.build.module.Chatter', attributes: {}, children: [] },
      { tag: 'VASSAL.build.module.KeyNamer', attributes: {}, children: [] },
      { tag: 'VASSAL.i18n.Language', attributes: {}, children: [] },
    ],
  };
}
