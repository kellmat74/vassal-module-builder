/**
 * Reads .vmod files (ZIP archives) back into structured data.
 */

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import type { ComponentNode } from './xml-serializer.js';
import { parseBuildFile } from './xml-parser.js';

export interface ModuleMetadata {
  name: string;
  version: string;
  vassalVersion: string;
  description: string;
  dateSaved: string;
}

export interface VmodContents {
  componentTree: ComponentNode;
  moduledata: ModuleMetadata;
  images: Map<string, Buffer>;
  otherFiles: Map<string, Buffer>;
}

function parseModuledata(xml: string): ModuleMetadata {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
  });
  const parsed = parser.parse(xml);
  const data = parsed.data ?? parsed;

  return {
    name: String(data.n ?? ''),
    version: String(data.version ?? ''),
    vassalVersion: String(data.VassalVersion ?? ''),
    description: String(data.description ?? ''),
    dateSaved: String(data.dateSaved ?? ''),
  };
}

export async function readVmod(buffer: Buffer): Promise<VmodContents> {
  const zip = await JSZip.loadAsync(buffer);

  const buildFileEntry = zip.file('buildFile.xml');
  if (!buildFileEntry) {
    throw new Error('Missing buildFile.xml in .vmod archive');
  }
  const buildXml = await buildFileEntry.async('string');
  const componentTree = parseBuildFile(buildXml);

  const moduledataEntry = zip.file('moduledata');
  if (!moduledataEntry) {
    throw new Error('Missing moduledata in .vmod archive');
  }
  const moduledataXml = await moduledataEntry.async('string');
  const moduledata = parseModuledata(moduledataXml);

  const images = new Map<string, Buffer>();
  const otherFiles = new Map<string, Buffer>();

  const skipFiles = new Set(['buildFile.xml', 'moduledata']);

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || skipFiles.has(path)) continue;

    const data = Buffer.from(await entry.async('nodebuffer'));

    if (path.startsWith('images/')) {
      const relativePath = path.slice('images/'.length);
      if (relativePath) images.set(relativePath, data);
    } else {
      otherFiles.set(path, data);
    }
  }

  return { componentTree, moduledata, images, otherFiles };
}
