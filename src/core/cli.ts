/**
 * CLI entry point for generating a test .vmod file.
 * Usage: npx tsx src/core/cli.ts
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { createMinimalModule } from './module-factory.js';
import { generateVmod } from './vmod-generator.js';

async function main() {
  const componentTree = createMinimalModule('Test Module');

  const vmodBuffer = await generateVmod({
    name: 'Test Module',
    version: '1.0',
    description: 'A minimal test module',
    vassalVersion: '3.7.20',
    componentTree,
  });

  await mkdir('output', { recursive: true });
  await writeFile('output/test-module.vmod', vmodBuffer);

  console.log('Generated output/test-module.vmod');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
