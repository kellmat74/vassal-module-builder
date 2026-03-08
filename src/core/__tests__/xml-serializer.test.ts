import { describe, it, expect } from 'vitest';
import { serializeBuildFile, type ComponentNode } from '../xml-serializer.js';

describe('serializeBuildFile', () => {
  it('produces XML declaration', () => {
    const node: ComponentNode = { tag: 'Root', attributes: {}, children: [] };
    expect(serializeBuildFile(node)).toMatch(/^<\?xml version="1.0" encoding="UTF-8" standalone="no"\?>/);
  });

  it('renders self-closing tags for childless nodes', () => {
    const node: ComponentNode = { tag: 'Empty', attributes: {}, children: [] };
    expect(serializeBuildFile(node)).toContain('<Empty/>');
  });

  it('renders attributes', () => {
    const node: ComponentNode = {
      tag: 'Elem',
      attributes: { name: 'Test', version: '1.0' },
      children: [],
    };
    const xml = serializeBuildFile(node);
    expect(xml).toContain('name="Test"');
    expect(xml).toContain('version="1.0"');
  });

  it('escapes special characters in attributes', () => {
    const node: ComponentNode = {
      tag: 'Elem',
      attributes: { value: 'a & b < c > d "e" \'f\'' },
      children: [],
    };
    const xml = serializeBuildFile(node);
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&lt;');
    expect(xml).toContain('&gt;');
    expect(xml).toContain('&quot;');
    expect(xml).toContain('&apos;');
  });

  it('renders nested children with indentation', () => {
    const node: ComponentNode = {
      tag: 'Parent',
      attributes: {},
      children: [
        { tag: 'Child', attributes: {}, children: [] },
      ],
    };
    const xml = serializeBuildFile(node);
    expect(xml).toContain('<Parent>');
    expect(xml).toContain('    <Child/>');
    expect(xml).toContain('</Parent>');
  });

  it('renders text content', () => {
    const node: ComponentNode = {
      tag: 'Slot',
      attributes: {},
      children: [],
      textContent: 'piece;trait data',
    };
    const xml = serializeBuildFile(node);
    expect(xml).toContain('<Slot>');
    expect(xml).toContain('piece;trait data');
    expect(xml).toContain('</Slot>');
  });

  it('escapes text content', () => {
    const node: ComponentNode = {
      tag: 'Slot',
      attributes: {},
      children: [],
      textContent: 'a & b',
    };
    expect(serializeBuildFile(node)).toContain('a &amp; b');
  });
});
