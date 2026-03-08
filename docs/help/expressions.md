# Expressions and Properties Guide

VASSAL has a built-in expression system that lets you add logic to your module without writing code. If you can write a spreadsheet formula, you can write VASSAL expressions.

---

## Two Expression Formats

### BeanShell Expressions `{curly braces}`

The modern, powerful format. Wrap your expression in curly braces. Supports math, comparisons, text operations, and function calls.

```
{Strength > 3}
{CurrentMap == "Main Map"}
{GetProperty("Steps") + GetProperty("Bonus")}
{Strength > 0 ? "Active" : "Eliminated"}
```

**Use BeanShell for:** Filter expressions (which pieces match?), calculated properties, conditional logic, any expression where you need comparison or math.

### Old-Style `$dollar sign$` Substitution

The simpler, older format. Wraps property names in dollar signs. VASSAL replaces each `$PropertyName$` with that property's current value. No math or logic — just string substitution.

```
$PlayerName$ moves $BasicName$ from $OldLocationName$ to $LocationName$
```

**Use old-style for:** Report Action message formats, text labels, anywhere you just need to insert a property value into a sentence.

### Which Format to Use

| Situation | Format | Example |
|-----------|--------|---------|
| Filtering pieces (GKC, Restrict Commands) | BeanShell | `{Nationality == "German" && Type == "Infantry"}` |
| Calculating a value | BeanShell | `{AttackStrength * 2 + Modifier}` |
| Chat log messages | Old-style | `$PlayerName$ fires at $BasicName$` |
| Text labels on pieces | Old-style | `Str: $Strength$` |
| Conditional logic | BeanShell | `{Steps > 0 ? "Active" : "Dead"}` |

---

## Common Functions

### GetProperty(name)

Reads a property value by name. The name can be a string or another expression.

```
{GetProperty("Strength")}
{GetProperty("Zone_" + CurrentZone + "_Modifier")}
```

**When to use:** Reading properties with computed names, or when you want to be explicit about where a value comes from.

### SumStack(propertyName)

Adds up a numeric property across all pieces in the same stack (pieces on the same map location).

```
{SumStack("AttackStrength")}
```

**Example:** Four units stacked in the same hex with AttackStrength values of 3, 4, 2, and 6. `SumStack("AttackStrength")` returns 15. Useful for automatic odds calculation.

### Sum(propertyName, expression)

Adds up a numeric property across all pieces on the current map that match the expression.

```
{Sum("VPValue", "{Nationality == \\'German\\'}")}
```

**Example:** Total up the VP value of all German pieces on the map.

### Count(expression)

Counts how many pieces on the current map match the expression.

```
{Count("{CurrentZone == \\'Berlin\\'}")}
```

**Example:** How many pieces are in the Berlin zone? Useful for stacking limit checks.

### Alert(message)

Pops up a dialog box with a message. Useful for debugging expressions during design.

```
{Alert("Current strength is " + Strength)}
```

---

## Properties Explained

A **property** is a named value — like a variable. Every piece, zone, map, and the module itself can have properties. When an expression references a property name, VASSAL searches for it in a specific order.

### Property Scopes (Search Order)

When you write `{Strength}` in an expression, VASSAL looks for a property named "Strength" in this order:

1. **Piece properties** — Traits on the current piece: Marker values, Dynamic Properties, Calculated Properties, and built-in piece properties (see below).
2. **Zone properties** — Properties defined on the Zone the piece is currently in.
3. **Map properties** — Global Properties defined on the Map the piece is on.
4. **Module properties** — Top-level Global Properties defined on the GameModule.
5. **System properties** — Built-in VASSAL properties (PlayerName, PlayerSide, etc.).

The first match wins. If a piece has a Marker called "Status" and the Zone also has a property called "Status," the piece's value takes priority.

**Think of it like this:** VASSAL looks in the smallest container first (the piece), then works outward to larger containers (zone, map, module), and finally checks the system defaults.

### Built-In Piece Properties

Every piece automatically has these properties (no traits needed):

| Property | Value |
|----------|-------|
| `BasicName` | The piece's name from BasicPiece |
| `CurrentMap` | Name of the map the piece is on |
| `CurrentBoard` | Name of the board |
| `CurrentZone` | Name of the zone (if using ZonedGrid) |
| `LocationName` | Grid location (e.g., "2011" for hex 2011) |
| `OldLocationName` | Previous location (after a move) |
| `OldMap` | Previous map (after inter-map move) |
| `DeckName` | Name of the Deck the piece is in (if any) |
| `PieceName` | Full display name including trait modifications |
| `PlayerSide` | The side of the player performing the action |
| `ClickedX` / `ClickedY` | Pixel coordinates of last click |

### Built-In System Properties

| Property | Value |
|----------|-------|
| `PlayerName` | Current player's name |
| `PlayerSide` | Current player's assigned side |

### Defining Your Own Properties

- **Marker trait** — Static property, set at design time, never changes. Use for fixed attributes: `Nationality=German`.
- **Dynamic Property trait** — Mutable property, changed by key commands during play. Use for game state: `Steps=4` that decrements when hit.
- **Calculated Property trait** — Auto-computed from an expression. Use for derived values: `{AttackStrength + TerrainBonus}`.
- **Global Property** (on Map or Module) — Shared variable accessible to all pieces. Use for game-wide state: `CurrentWeather`, `VPTotal`.
- **Scenario Property** *(new in 3.7)* — Set by players in a dialog when starting a new game. Use for variant toggles: `UseOptionalRules=true`.

---

## Expression Tips

- **String comparisons use `==`**, not `=`. Write `{Nationality == "German"}`, not `{Nationality = "German"}`.
- **Strings need double quotes** inside BeanShell: `{Type == "Infantry"}`.
- **Nested quotes need escaping** with backslash-single-quote: `{Sum("VP", "{Side == \\'Axis\\'}")}`.
- **Empty/missing properties return ""** (empty string). Check with `{PropertyName != ""}` rather than checking for null.
- **Numeric comparisons work** even though values are stored as strings. `{Strength > 3}` works if Strength contains a number.
- **Ternary operator** works for if/else: `{Strength > 0 ? "Active" : "Eliminated"}`.
- **String concatenation** uses `+`: `{"Unit " + BasicName + " in " + LocationName}`.
