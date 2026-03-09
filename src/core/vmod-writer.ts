/**
 * Writes modified .vmod files with change tracking via mod-manifest.json.
 */

import JSZip from 'jszip';
import { serializeBuildFile } from './xml-serializer.js';
import type { VmodContents, ModuleMetadata } from './vmod-reader.js';

export interface ModManifest {
  basedOn: { name: string; version: string };
  modifiedBy: string;
  modifiedDate: string;
  toolVersion: string;
  changes: { type: 'added' | 'modified' | 'removed'; description: string }[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateModuledata(metadata: ModuleMetadata): string {
  const extra1 = metadata.extra1 ? `<extra1>${escapeXml(metadata.extra1)}</extra1>` : '<extra1/>';
  const extra2 = metadata.extra2 ? `<extra2>${escapeXml(metadata.extra2)}</extra2>` : '<extra2/>';
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<data version="1">
  <version>${escapeXml(metadata.version)}</version>
  ${extra1}
  ${extra2}
  <VassalVersion>${escapeXml(metadata.vassalVersion)}</VassalVersion>
  <dateSaved>${Date.now()}</dateSaved>
  <description>${escapeXml(metadata.description)}</description>
  <name>${escapeXml(metadata.name)}</name>
</data>
`;
}

export async function writeModifiedVmod(
  contents: VmodContents,
  manifest: ModManifest,
): Promise<Buffer> {
  const zip = new JSZip();

  zip.file('buildFile.xml', serializeBuildFile(contents.componentTree));
  zip.file('moduledata', generateModuledata(contents.moduledata));
  zip.file('mod-manifest.json', JSON.stringify(manifest, null, 2));

  for (const [path, data] of contents.images) {
    zip.file(`images/${path}`, data);
  }

  for (const [path, data] of contents.otherFiles) {
    zip.file(path, data);
  }

  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  return Buffer.from(buf);
}
