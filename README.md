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
