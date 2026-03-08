import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { writeModifiedVmod, type ModManifest } from '../vmod-writer.js';
import { readVmod } from '../vmod-reader.js';
import { generateVmod } from '../vmod-generator.js';
import { createMinimalModule } from '../module-factory.js';
import { updateAttributes } from '../tree-ops.js';

async function makeTestContents() {
  const images = new Map<string, Buffer>();
  images.set('counter.png', Buffer.from('fake-png'));

  const vmodBuffer = await generateVmod({
    name: 'Writer Test',
    version: '1.0',
    description: 'Original',
    vassalVersion: '3.7.20',
    componentTree: createMinimalModule('Writer Test'),
    images,
  });

  return readVmod(vmodBuffer);
}

const testManifest: ModManifest = {
  basedOn: { name: 'Writer Test', version: '1.0' },
  modifiedBy: 'test-suite',
  modifiedDate: '2026-03-08',
  toolVersion: '0.1.0',
  changes: [{ type: 'modified', description: 'Changed module name' }],
};

describe('writeModifiedVmod', () => {
  it('includes mod-manifest.json', async () => {
    const contents = await makeTestContents();
    const buf = await writeModifiedVmod(contents, testManifest);

    const zip = await JSZip.loadAsync(buf);
    const manifestEntry = zip.file('mod-manifest.json');
    expect(manifestEntry).not.toBeNull();

    const json = JSON.parse(await manifestEntry!.async('string'));
    expect(json.basedOn.name).toBe('Writer Test');
    expect(json.changes.length).toBe(1);
  });

  it('reflects tree changes in buildFile.xml', async () => {
    const contents = await makeTestContents();
    contents.componentTree = updateAttributes(contents.componentTree, [], { name: 'Modified Name' });

    const buf = await writeModifiedVmod(contents, testManifest);
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file('buildFile.xml')!.async('string');

    expect(xml).toContain('name="Modified Name"');
  });

  it('passes through images unchanged', async () => {
    const contents = await makeTestContents();
    const buf = await writeModifiedVmod(contents, testManifest);

    const zip = await JSZip.loadAsync(buf);
    const imgData = await zip.file('images/counter.png')!.async('nodebuffer');
    expect(Buffer.from(imgData).toString()).toBe('fake-png');
  });
});
