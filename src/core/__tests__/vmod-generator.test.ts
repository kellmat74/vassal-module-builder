import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { generateVmod } from '../vmod-generator.js';
import { createMinimalModule } from '../module-factory.js';

describe('generateVmod', () => {
  it('produces a ZIP containing buildFile.xml and moduledata', async () => {
    const buf = await generateVmod({
      name: 'Test',
      version: '1.0',
      description: 'desc',
      vassalVersion: '3.7.20',
      componentTree: createMinimalModule('Test'),
    });

    const zip = await JSZip.loadAsync(buf);
    expect(zip.file('buildFile.xml')).not.toBeNull();
    expect(zip.file('moduledata')).not.toBeNull();
  });

  it('buildFile.xml contains XML declaration and root tag', async () => {
    const buf = await generateVmod({
      name: 'Test',
      version: '1.0',
      description: '',
      vassalVersion: '3.7.20',
      componentTree: createMinimalModule('Test'),
    });

    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file('buildFile.xml')!.async('string');
    expect(xml).toMatch(/^<\?xml/);
    expect(xml).toContain('VASSAL.build.GameModule');
  });

  it('moduledata contains module name and version', async () => {
    const buf = await generateVmod({
      name: 'My Game',
      version: '2.0',
      description: 'A game',
      vassalVersion: '3.7.20',
      componentTree: createMinimalModule('My Game', '2.0'),
    });

    const zip = await JSZip.loadAsync(buf);
    const md = await zip.file('moduledata')!.async('string');
    expect(md).toContain('<n>My Game</n>');
    expect(md).toContain('<version>2.0</version>');
    expect(md).toContain('<VassalVersion>3.7.20</VassalVersion>');
  });

  it('includes images when provided', async () => {
    const images = new Map<string, Buffer>();
    images.set('test.png', Buffer.from('fake-png'));

    const buf = await generateVmod({
      name: 'Test',
      version: '1.0',
      description: '',
      vassalVersion: '3.7.20',
      componentTree: createMinimalModule('Test'),
      images,
    });

    const zip = await JSZip.loadAsync(buf);
    expect(zip.file('images/test.png')).not.toBeNull();
  });
});
