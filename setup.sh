#!/bin/bash
# =============================================================================
# VASSAL Module Builder — Project Setup Script
# Run this in Claude Code after cloning the repo
# =============================================================================

set -e

echo "🎲 Setting up VASSAL Module Builder project..."

# --- Create directory structure ---
echo "📁 Creating directory structure..."

mkdir -p src/core          # SequenceEncoder, XML generator, ZIP packager
mkdir -p src/schema         # Component schema registry (TypeScript interfaces)
mkdir -p src/schema/traits  # Individual trait definitions
mkdir -p src/server         # Express API server
mkdir -p src/client         # React frontend
mkdir -p src/client/components
mkdir -p src/client/pages
mkdir -p src/client/hooks
mkdir -p src/client/styles
mkdir -p tests/core         # Unit tests for core modules
mkdir -p tests/schema       # Schema validation tests
mkdir -p tests/integration  # End-to-end .vmod generation tests
mkdir -p tests/fixtures     # Sample .vmod files for validation
mkdir -p docs               # Architecture docs, design notes
mkdir -p templates          # Pre-built module templates (hex wargame, CDG, etc.)

# --- Create .gitignore ---
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
build/
*.vmod
!tests/fixtures/*.vmod

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# TypeScript
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
EOF

# --- Create package.json ---
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "vassal-module-builder",
  "version": "0.1.0",
  "description": "Web-based menu-driven tool for creating VASSAL game engine modules (.vmod files)",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "server": "tsx src/server/index.ts",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint src/",
    "generate:vmod": "tsx src/core/cli.ts"
  },
  "keywords": ["vassal", "wargame", "boardgame", "module-builder", "vmod"],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# --- Create tsconfig.json ---
echo "⚙️ Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@schema/*": ["src/schema/*"],
      "@server/*": ["src/server/*"],
      "@client/*": ["src/client/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

# --- Create README.md ---
echo "📖 Creating README.md..."
cat > README.md << 'EOF'
# VASSAL Module Builder

A web-based, menu-driven tool for creating [VASSAL](https://vassalengine.org/) game engine modules (.vmod files).

## What is this?

VASSAL is the standard platform for playing hex-and-counter wargames online. Creating modules for it currently requires using VASSAL's Java-based Module Editor, which has a steep learning curve and no way to apply best-practice patterns across modules.

This tool aims to change that by providing:

- **A guided, wizard-style web UI** that walks you through module creation step by step
- **Best-practice templates** distilled from hundreds of high-quality modules
- **Automation patterns** for common wargame mechanics (CRTs, supply, reinforcements, turn tracking)
- **Smart defaults** that encode the collective wisdom of experienced module designers

The output is a standard `.vmod` file that opens in VASSAL just like any other module.

## How it works

A `.vmod` file is simply a ZIP archive containing:
- `buildFile.xml` — XML configuration defining all components and pieces
- `moduledata` — Module metadata
- `images/` — Graphic assets (maps, counters, icons)

This tool generates those files. No Java required.

## Development

```bash
npm install
npm run dev      # Start frontend dev server
npm run server   # Start backend API
npm test         # Run tests
```

## Project Status

- [x] Phase 0: VASSAL Engine Deep Dive (architecture analysis)
- [ ] Phase 1: Core Foundation (SequenceEncoder, Schema Registry, .vmod generator)
- [ ] Phase 2: Web UI (React wizard interface)
- [ ] Phase 3: Game Logic Templates
- [ ] Phase 4: Module Analysis & Pattern Extraction

## License

MIT
EOF

# --- Create placeholder source files ---
echo "🔧 Creating starter source files..."

# Core: SequenceEncoder stub
cat > src/core/sequence-encoder.ts << 'EOF'
/**
 * TypeScript port of VASSAL's SequenceEncoder.
 * 
 * VASSAL uses this to serialize/deserialize trait definitions.
 * The format uses semicolons and commas as delimiters with backslash escaping.
 * 
 * Source reference: vassal-app/src/main/java/VASSAL/tools/SequenceEncoder.java
 * 
 * TODO: Port from Java source — this is Phase 1, Task 1.
 */

export class SequenceEncoder {
  private parts: string[] = [];
  private separator: string;

  constructor(separator: string = ',') {
    this.separator = separator;
  }

  append(value: string): SequenceEncoder {
    // TODO: implement encoding with proper escaping
    this.parts.push(value);
    return this;
  }

  appendBoolean(value: boolean): SequenceEncoder {
    return this.append(value ? 'true' : 'false');
  }

  appendInt(value: number): SequenceEncoder {
    return this.append(String(Math.floor(value)));
  }

  getValue(): string {
    return this.parts.join(this.separator);
  }
}

export class SequenceDecoder {
  private parts: string[];
  private index: number = 0;

  constructor(encoded: string, separator: string = ',') {
    // TODO: implement decoding with proper unescaping
    this.parts = encoded.split(separator);
  }

  nextToken(defaultValue: string = ''): string {
    if (this.index < this.parts.length) {
      return this.parts[this.index++];
    }
    return defaultValue;
  }

  nextBoolean(defaultValue: boolean = false): boolean {
    const token = this.nextToken();
    return token ? token === 'true' : defaultValue;
  }

  nextInt(defaultValue: number = 0): number {
    const token = this.nextToken();
    return token ? parseInt(token, 10) : defaultValue;
  }

  hasMoreTokens(): boolean {
    return this.index < this.parts.length;
  }
}
EOF

# Core: VMOD generator stub
cat > src/core/vmod-generator.ts << 'EOF'
/**
 * Generates valid .vmod files (ZIP archives) from module configuration.
 * 
 * TODO: Implement XML serialization and ZIP packaging — Phase 1, Task 3.
 */

export interface ModuleConfig {
  name: string;
  version: string;
  description: string;
  vassalVersion: string;
}

export async function generateVmod(config: ModuleConfig): Promise<Buffer> {
  // TODO: 
  // 1. Generate buildFile.xml from component tree
  // 2. Generate moduledata
  // 3. Package with images into ZIP
  // 4. Return as Buffer (or write to file)
  throw new Error('Not yet implemented');
}
EOF

# Schema: Component registry stub  
cat > src/schema/component-registry.ts << 'EOF'
/**
 * Schema registry for all VASSAL Buildable components.
 * 
 * Each component definition includes:
 * - xmlTag: the fully-qualified Java class name used as XML element
 * - attributes: list of configurable attributes with types and defaults
 * - allowedChildren: which component types can be nested inside
 * - requiredChildren: components that must be present
 * 
 * This registry drives the UI — the menu system is generated from it.
 * 
 * TODO: Populate from VASSAL source analysis — Phase 1, Task 2.
 */

export interface AttributeDef {
  name: string;
  type: 'string' | 'int' | 'boolean' | 'color' | 'image' | 'keystroke' | 'expression';
  defaultValue?: string;
  description: string;
  required?: boolean;
}

export interface ComponentDef {
  xmlTag: string;
  displayName: string;
  description: string;
  category: 'map' | 'piece' | 'control' | 'display' | 'property' | 'logic';
  attributes: AttributeDef[];
  allowedChildren: string[];  // xmlTag references
  requiredChildren?: string[];
  wargameNotes?: string;  // guidance for hex-and-counter wargame usage
}

// Registry will be populated with all component definitions
export const componentRegistry: Map<string, ComponentDef> = new Map();

// Example: GameModule root
componentRegistry.set('VASSAL.build.GameModule', {
  xmlTag: 'VASSAL.build.GameModule',
  displayName: 'Game Module',
  description: 'Root module container',
  category: 'control',
  attributes: [
    { name: 'name', type: 'string', description: 'Module name', required: true },
    { name: 'version', type: 'string', defaultValue: '1.0', description: 'Module version' },
    { name: 'description', type: 'string', description: 'Module description' },
    { name: 'VassalVersion', type: 'string', defaultValue: '3.7.5', description: 'Target VASSAL version' },
    { name: 'nextPieceSlotId', type: 'int', defaultValue: '0', description: 'Counter for piece slot IDs' },
    { name: 'ModuleOther1', type: 'string', defaultValue: '', description: 'Reserved' },
    { name: 'ModuleOther2', type: 'string', defaultValue: '', description: 'Reserved' },
  ],
  allowedChildren: [
    'VASSAL.build.module.Map',
    'VASSAL.build.module.PieceWindow',
    'VASSAL.build.module.ToolbarMenu',
    'VASSAL.build.module.DiceButton',
    'VASSAL.build.module.GlobalKeyCommand',
    'VASSAL.build.module.StartupGlobalKeyCommand',
    'VASSAL.build.module.Inventory',
    'VASSAL.build.module.PredefinedSetup',
    'VASSAL.build.module.ChartWindow',
    'VASSAL.build.module.PrivateMap',
    'VASSAL.build.module.PlayerHand',
    'VASSAL.build.module.NotesWindow',
    'VASSAL.build.module.turn.TurnTracker',
    'VASSAL.build.module.ChessClockControl',
    'VASSAL.build.module.SpecialDiceButton',
    'VASSAL.build.module.DoActionButton',
    'VASSAL.build.module.MultiActionButton',
    'VASSAL.build.module.RandomTextButton',
  ],
  requiredChildren: [
    'VASSAL.build.module.BasicCommandEncoder',
    'VASSAL.build.module.Documentation',
    'VASSAL.build.module.GlobalOptions',
    'VASSAL.build.module.Chatter',
    'VASSAL.build.module.KeyNamer',
  ],
});
EOF

# Schema: Trait registry stub
cat > src/schema/traits/trait-registry.ts << 'EOF'
/**
 * Registry of all 44 VASSAL piece traits (Decorators).
 * 
 * Each trait definition includes its serialization ID, configurable
 * parameters, and serialization/deserialization logic.
 * 
 * TODO: Populate all traits — Phase 1, Task 2.
 */

export interface TraitParam {
  name: string;
  type: 'string' | 'int' | 'boolean' | 'keystroke' | 'expression' | 'image' | 'color';
  defaultValue?: string;
  description: string;
}

export interface TraitDef {
  id: string;          // Serialization ID (e.g., 'emb2;')
  className: string;   // Java class name
  displayName: string;
  category: 'visual' | 'visibility' | 'property' | 'action' | 'movement' | 'grouping';
  description: string;
  params: TraitParam[];
  wargameNotes?: string;
  addedInVersion?: string;  // e.g., '3.7' for newer features
}

export const traitRegistry: Map<string, TraitDef> = new Map();

// Example entries — full registry to be built in Phase 1
traitRegistry.set('piece;', {
  id: 'piece;',
  className: 'BasicPiece',
  displayName: 'Basic Piece',
  category: 'visual',
  description: 'Core piece: base image and name. Always the innermost element.',
  params: [
    { name: 'image', type: 'image', description: 'Base piece image' },
    { name: 'name', type: 'string', description: 'Piece name' },
  ],
});

traitRegistry.set('emb2;', {
  id: 'emb2;',
  className: 'Embellishment',
  displayName: 'Layer (Embellishment)',
  category: 'visual',
  description: 'Multi-state image layers. The workhorse of counter display. Use for flipped, disrupted, eliminated states.',
  params: [
    { name: 'activateCommand', type: 'string', description: 'Menu command to activate' },
    { name: 'activateKey', type: 'keystroke', description: 'Key to activate' },
    { name: 'upCommand', type: 'string', description: 'Menu command to increase level' },
    { name: 'downCommand', type: 'string', description: 'Menu command to decrease level' },
    // ... many more params
  ],
  wargameNotes: 'Use for: step reduction (full/reduced), combat status (disrupted/demoralized/broken), supply status overlays',
});

traitRegistry.set('macro;', {
  id: 'macro;',
  className: 'TriggerAction',
  displayName: 'Trigger Action (Macro)',
  category: 'action',
  description: 'Fires a sequence of key commands. Supports looping and conditional execution. The primary automation engine.',
  params: [
    { name: 'name', type: 'string', description: 'Description' },
    { name: 'command', type: 'string', description: 'Menu command' },
    { name: 'key', type: 'keystroke', description: 'Trigger key' },
    { name: 'propertyMatch', type: 'expression', description: 'Property filter' },
    { name: 'watchKeys', type: 'string', description: 'Keys to watch for' },
    { name: 'actionKeys', type: 'string', description: 'Keys to fire' },
    { name: 'loop', type: 'boolean', defaultValue: 'false', description: 'Enable looping' },
    { name: 'loopType', type: 'string', defaultValue: 'counted', description: 'Loop type: counted, while, until' },
  ],
  wargameNotes: 'Essential for: combat resolution sequences, supply checking, reinforcement placement, multi-step state changes',
});
EOF

echo ""
echo "✅ Project scaffolded successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: npm install typescript vite vitest @types/node tsx express jszip --save-dev"
echo "  2. Run: npm install react react-dom @types/react @types/react-dom tailwindcss --save"
echo "  3. git add -A && git commit -m 'chore: initial project scaffold'"
echo "  4. git push origin main"
echo ""
echo "Then start Phase 1 by porting the SequenceEncoder!"
EOF

chmod +x /home/claude/project-seed/setup.sh