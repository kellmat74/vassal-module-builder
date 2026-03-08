# Grid Types Guide

Grids define how pieces snap to positions on a map board and how locations are named. VASSAL supports four grid types, and you can mix them on a single board using ZonedGrid.

---

## HexGrid

The standard hex grid used by the vast majority of wargames. Pieces snap to hex centers.

### Flat-Top vs. Pointy-Top

VASSAL's HexGrid has a **sideways** setting that controls orientation:

- **Flat-top hexes** (`sideways = false`, the default): The top edge of each hex is flat/horizontal. Hex columns run vertically. This is the most common orientation in wargaming.
  - **Games:** *Paths of Glory*, *Combat Commander*, *ASL*, most GMT and Decision Games titles.

- **Pointy-top hexes** (`sideways = true`): The top of each hex is a point/vertex. Hex rows run horizontally.
  - **Games:** *Memoir '44*, *Commands & Colors* series, some naval games.

**Rule of thumb:** If the hexes in your game have a flat edge on top, use the default. If they have a point on top, check "sideways."

### Key Settings

| Setting | What It Does |
|---------|-------------|
| **Hex Width / Height** | Size of each hex in pixels. Measure from your map image. |
| **X / Y Offset** | Pixel position of the top-left hex center. Adjusts the grid origin to align with your map image. |
| **Snap To** | When enabled, pieces dropped near a hex center snap exactly to it. Almost always on. |
| **Visible** | Draws the grid lines on the map. Useful for alignment during design; often turned off for play if the map image already has a printed grid. |
| **Color** | Grid line color when visible. |

### Aligning the Grid

To align a hex grid with your scanned map image:
1. Set hex width/height to match your map's hex size in pixels.
2. Adjust X/Y offset until the grid centers line up with the printed hex centers.
3. Use "Visible = true" temporarily to check alignment, then turn it off if your map already shows hexes.

---

## SquareGrid

A rectangular grid of square cells. Pieces snap to cell centers.

**When to use:** Games with square grids — *Panzer Leader*, *Squad Leader* (non-ASL), many tactical games, chess-like movement systems.

### Key Settings

Same concept as HexGrid: cell width/height, X/Y offset, snap-to, visible, color.

**Example:** *Panzer Leader* uses a square grid. Each cell represents a terrain area, and units snap to cell centers.

---

## RegionGrid

An irregular grid defined by **named points** (regions) at specific pixel coordinates. There are no regular cells — each region is a named location with an X,Y position on the map.

**When to use:** **Point-to-point** movement games where pieces move between named locations connected by paths, not across a regular grid.

**Example:** *Hannibal: Rome vs. Carthage* has a map with named cities and strategic points connected by roads. Each city is a Region with coordinates matching its position on the map image. Pieces snap to city centers.

### Defining Regions

Each region needs:
- **Name** — The location name (e.g., "Rome", "Carthage", "Tarentum")
- **X, Y coordinates** — Pixel position on the board image

Regions do not define connections between points — movement connectivity is handled by the game rules, not the grid.

---

## ZonedGrid

A container grid that divides a single board into **Zones**, each of which can have its own sub-grid. This lets you mix grid types on one map.

**When to use:** Maps that combine different area types:
- A hex main playing area plus box-based holding areas (reinforcement pools, eliminated units box)
- A hex tactical map with a point-to-point strategic overlay
- Different hex sizes in different map regions

### How It Works

1. The board gets a ZonedGrid instead of a plain HexGrid.
2. Inside the ZonedGrid, you define Zones — polygonal areas of the map.
3. Each Zone can contain its own sub-grid (HexGrid, SquareGrid, or RegionGrid).
4. Each Zone can also have **Zone Properties** — variables scoped to that zone that affect pieces within it.

**Example:** A game map with:
- A central hex area (Zone "Battlefield" with a HexGrid)
- A side box for eliminated units (Zone "Dead Pile" with a RegionGrid containing one point)
- A turn record track along the bottom (Zone "Turn Track" with a SquareGrid)

All three coexist on a single board image, each with appropriate snap behavior.

### Zone Properties

Zones can define properties that pieces automatically inherit while in that zone. This is powerful for terrain effects:
- Zone "Bocage" with property `DefenseModifier=2`
- Zone "Open Ground" with property `DefenseModifier=0`
- A piece's Calculated Property can read `{GetZoneProperty("DefenseModifier")}` to adjust combat calculations based on location.

---

## Grid Numbering

Both HexGrid and SquareGrid support a **GridNumbering** sub-component that controls how locations are labeled (the text shown in chat messages and piece reports).

### Matching Published Hex Numbers

Most published wargame maps have printed hex numbers (like "2011" or "AA15"). Grid Numbering lets you configure:

| Setting | Purpose |
|---------|---------|
| **Row/Column start numbers** | What number the first row and column begin at |
| **Starting corner** | Which corner of the map is row 1, column 1 |
| **Row/Column order** | Whether the number reads row-first (2011) or column-first (1120) |
| **Separator** | Character between row and column (none for "2011", dot for "20.11") |
| **Alphabetic** | Use letters for one axis (A, B, C... for columns) |
| **Row/Column digits** | How many digits to pad to (2 digits: "03", 4 digits: "0003") |

**Tip:** Look at the hex numbers printed on your game map. Find hex 0101 (or A1) and note which corner it is in. Count whether the first two digits are the column or the row. Configure Grid Numbering to match, then verify a few hexes across the map.

**Example:** A map with hex "2011" in the upper-left and "5035" in the lower-right. Column numbers increase left-to-right (20 to 50), row numbers increase top-to-bottom (11 to 35). Configure: starting corner = upper-left, column first, 2-digit columns + 2-digit rows, no separator.
