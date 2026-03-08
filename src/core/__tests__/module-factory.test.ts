import { describe, it, expect } from 'vitest';
import { createMinimalModule } from '../module-factory.js';

describe('createMinimalModule', () => {
  it('returns a GameModule root node', () => {
    const root = createMinimalModule('Test');
    expect(root.tag).toBe('VASSAL.build.GameModule');
  });

  it('sets module name and version attributes', () => {
    const root = createMinimalModule('My Game', '2.0');
    expect(root.attributes.name).toBe('My Game');
    expect(root.attributes.version).toBe('2.0');
  });

  it('defaults version to 1.0', () => {
    const root = createMinimalModule('Test');
    expect(root.attributes.version).toBe('1.0');
  });

  it('includes all required child components', () => {
    const root = createMinimalModule('Test');
    const childTags = root.children.map((c) => c.tag);

    expect(childTags).toContain('VASSAL.build.module.BasicCommandEncoder');
    expect(childTags).toContain('VASSAL.build.module.Documentation');
    expect(childTags).toContain('VASSAL.build.module.PlayerRoster');
    expect(childTags).toContain('VASSAL.build.module.GlobalOptions');
    expect(childTags).toContain('VASSAL.build.module.Chatter');
    expect(childTags).toContain('VASSAL.build.module.KeyNamer');
    expect(childTags).toContain('VASSAL.i18n.Language');
  });

  it('Documentation contains AboutScreen child', () => {
    const root = createMinimalModule('Test');
    const docs = root.children.find((c) => c.tag === 'VASSAL.build.module.Documentation');
    expect(docs).toBeDefined();
    expect(docs!.children[0].tag).toBe('VASSAL.build.module.documentation.AboutScreen');
  });
});
