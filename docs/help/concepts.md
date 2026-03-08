# What Is a VASSAL Module?

If you have played a wargame online using VASSAL, you have used a **module** — the `.vmod` file you downloaded and opened. This guide explains what is inside that file and how the pieces fit together, so you can build your own.

## The .vmod File

A `.vmod` file is a **ZIP archive** with a different extension. If you renamed `MyGame.vmod` to `MyGame.zip` and unzipped it, you would find:

- **buildFile.xml** — The master configuration file. It defines every map, piece, chart, button, and rule in the module. This is what our builder generates for you.
- **moduledata** — A small metadata file (module name, version, date).
- **images/** — All graphic assets: map scans, counter images, toolbar icons.
- **sounds/** — Optional audio files (dice rolls, fanfares).
- **help/** — Optional HTML help pages.

That is the entire module. No compiled code, no database — just XML and images packaged in a ZIP. Our builder creates the XML; you supply the images.

## The Component Tree

A VASSAL module is organized as a **tree of components**, similar to folders on your computer. The top level is the **GameModule** (the root), and everything else nests inside it:

```
GameModule
├── Map ("Main Map")
│   ├── Board
│   │   └── HexGrid
│   ├── At-Start Stack (setup pieces)
│   └── Deck (draw pile)
├── Game Piece Palette (counter trays)
├── Chart Window (CRT, TEC)
├── Dice Button
├── Turn Tracker
└── Prototypes (shared piece behaviors)
```

Each component in the tree has a **type** (Map, Board, HexGrid, etc.) and **settings** (hex size, grid color, image file, etc.). Our builder walks you through adding and configuring these components step by step.

**Think of it like this:** The module is a box (GameModule). Inside the box you put a map board (Map + Board), a tray of counters (Game Piece Palette), reference charts (ChartWindow), dice (DiceButton), and a turn marker (TurnTracker). Each of those items has its own configuration — the map has a grid, the dice have a number of sides, and so on.

## How Pieces Work

Game pieces in VASSAL are built from **traits** stacked on top of each other, like layers of an onion.

At the center is always a **BasicPiece** — it holds the piece's name and base image (the front of the counter). Every other capability is added by wrapping additional traits around it:

| Want the piece to... | Add this trait |
|---|---|
| Show a "flipped" or "reduced" side | **Embellishment** (Layer) |
| Have a nationality or type label | **Marker** (static value) |
| Track changing strength or status | **Dynamic Property** |
| Be hidden from opponents | **Hideable** or **Obscurable** |
| Move to a specific location | **Send to Location** |
| Post a message in the chat log | **Report Action** |
| Trigger a chain of actions | **Trigger Action** (Macro) |

A typical infantry counter might look like this, from inside out:

```
BasicPiece (image: inf_front.png, name: "1st Infantry")
  └── Embellishment (reduced side image)
      └── Marker (Type=Infantry)
          └── Marker (Nationality=German)
              └── Dynamic Property (Status: Fresh/Spent)
                  └── Report Action ("$BasicName$ moved to $LocationName$")
                      └── Prototype (Standard NATO Unit)
```

There are 44 trait types in VASSAL. You do not need all of them — most pieces use 5-10 traits. Our builder helps you pick the right ones.

## Design-Time vs. Play-Time

There is an important distinction between what happens when you **build** a module and what happens when someone **plays** it:

- **Design-time (building):** You define piece types in the Game Piece Palette and place starting pieces on the map using At-Start Stacks. You configure maps, grids, charts, and dice. Nothing is "live" yet — you are setting up the template.
- **Play-time (using):** Players drag pieces from the palette onto the map, right-click for commands, roll dice, advance the turn tracker. The traits you defined determine what players can do with each piece.

Some things only exist at design-time (like Prototype definitions), and some things only matter at play-time (like which player side owns a hidden piece). Our builder focuses on the design-time side — creating the module that players will use.

## Why Trait Order Matters

Because traits wrap around each other like layers, **the order you stack them matters**. VASSAL processes commands from the outermost trait inward. This means:

- A **Restrict Commands** trait placed on the outside can hide menu options before inner traits ever see the command.
- An **Embellishment** placed later in the list draws on top of earlier ones.
- A **Trigger Action** can only "see" and fire commands at traits in its position in the chain.

**Analogy:** Think of traits like security checkpoints at an airport. If passport control (Restrict Commands) is the first checkpoint, it can turn people away before they ever reach the gate. If you put it after the gate, it is too late — the command already got through.

The good news: our builder applies sensible default ordering, and the traits guide (see `traits.md`) explains the recommended positions. You do not need to memorize the rules — the tool handles it.
