/**
 * Generates valid .vmod files (ZIP archives) from module configuration.
 */

import JSZip from 'jszip';
import { type ComponentNode, serializeBuildFile } from './xml-serializer.js';

export interface ModuleConfig {
  name: string;
  version: string;
  description: string;
  vassalVersion: string;
  componentTree: ComponentNode;
  images?: Map<string, Buffer>;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateModuledata(config: ModuleConfig): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<data version="1">
  <version>${escapeXml(config.version)}</version>
  <extra1/>
  <extra2/>
  <VassalVersion>${escapeXml(config.vassalVersion)}</VassalVersion>
  <dateSaved>${Date.now()}</dateSaved>
  <description>${escapeXml(config.description)}</description>
  <n>${escapeXml(config.name)}</n>
</data>
`;
}

export async function generateVmod(config: ModuleConfig): Promise<Buffer> {
  const zip = new JSZip();

  zip.file('buildFile.xml', serializeBuildFile(config.componentTree));
  zip.file('moduledata', generateModuledata(config));

  if (config.images) {
    for (const [path, data] of config.images) {
      zip.file(`images/${path}`, data);
    }
  }

  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  return Buffer.from(buf);
}
