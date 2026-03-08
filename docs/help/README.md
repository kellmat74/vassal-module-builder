# VASSAL Module Builder — Help Content System

## Overview

This directory contains contextual help content for the VASSAL Module Builder web UI. Each file covers a topic area that maps to one or more sections of the wizard-style interface.

## File Map

| File | UI Section(s) | Audience |
|------|---------------|----------|
| `concepts.md` | Welcome / onboarding | First-time users who have never built a module |
| `components.md` | Component selection panels (Map, Charts, Dice, etc.) | Users adding structural elements |
| `traits.md` | Piece editor / trait picker | Users defining game pieces |
| `grids.md` | Grid configuration step | Users setting up map grids |
| `expressions.md` | Any field that accepts expressions or properties | Users writing game logic |
| `best-practices.md` | Sidebar tips, validation warnings | All users |

## How Content Is Surfaced

- **Tooltips** — The `summary` field from `src/schema/help-content.ts` provides one-sentence tooltip text for each component, trait, or concept.
- **Sidebar help panels** — The full `description` field renders as markdown in a collapsible sidebar when the user clicks a help icon.
- **Inline examples** — The `examples` and `tips` arrays provide contextual wargame examples and best-practice callouts.
- **See Also links** — The `seeAlso` field cross-references related entries for deeper exploration.

## Data Module

`src/schema/help-content.ts` exports the same content as structured TypeScript data (`HelpEntry` objects keyed by ID) so the React UI can consume it programmatically. The markdown files here are the authoritative source; the TypeScript module mirrors the most important entries.

## Style Conventions

- Written for hex-and-counter wargamers, not programmers
- Concrete game examples over abstract descriptions
- Bold key terms on first use
- Scannable formatting (consistent headings, short paragraphs)
- No jargon without explanation
