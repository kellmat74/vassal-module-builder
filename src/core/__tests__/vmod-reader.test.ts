import { describe, it, expect } from 'vitest';
import { readVmod } from '../vmod-reader.js';
import { generateVmod } from '../vmod-generator.js';
import { createMinimalModule } from '../module-factory.js';
import { serializeBuildFile } from '../xml-serializer.js';

describe('readVmod', () => {
  it('round-trips: generateVmod → readVmod preserves component tree', async () => {
    const tree = createMinimalModule('Reader Test', '2.0');
    const vmodBuffer = await generateVmod({
      name: 'Reader Test',
      version: '2.0',
      description: 'A test module',
      vassalVersion: '3.7.20',
      componentTree: tree,
    });

    const contents = await readVmod(vmodBuffer);

    expect(contents.componentTree.tag).toBe('VASSAL.build.GameModule');
    expect(contents.componentTree.attributes.name).toBe('Reader Test');

    // Re-serialized XML should match
    const xml1 = serializeBuildFile(tree);
    const xml2 = serializeBuildFile(contents.componentTree);
    expect(xml2).toBe(xml1);
  });

  it('parses moduledata correctly', async () => {
    const vmodBuffer = await generateVmod({
      name: 'Meta Test',
      version: '1.5',
      description: 'Test description',
      vassalVersion: '3.7.20',
      componentTree: createMinimalModule('Meta Test', '1.5'),
    });

    const contents = await readVmod(vmodBuffer);
    expect(contents.moduledata.name).toBe('Meta Test');
    expect(contents.moduledata.version).toBe('1.5');
    expect(contents.moduledata.vassalVersion).toBe('3.7.20');
    expect(contents.moduledata.description).toBe('Test description');
  });

  it('populates images map correctly', async () => {
    const images = new Map<string, Buffer>();
    images.set('counter.png', Buffer.from('fake-png'));
    images.set('map.png', Buffer.from('fake-map'));

    const vmodBuffer = await generateVmod({
      name: 'Image Test',
      version: '1.0',
      description: '',
      vassalVersion: '3.7.20',
      componentTree: createMinimalModule('Image Test'),
      images,
    });

    const contents = await readVmod(vmodBuffer);
    expect(contents.images.size).toBe(2);
    expect(contents.images.get('counter.png')?.toString()).toBe('fake-png');
    expect(contents.images.get('map.png')?.toString()).toBe('fake-map');
  });
});
