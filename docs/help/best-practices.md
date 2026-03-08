# Best Practices for Module Builders

Hard-won advice for building clean, maintainable VASSAL modules.

---

## Use Prototypes for Everything Shared

If two or more pieces share the same traits, put those traits in a **Prototype** and use a UsePrototype trait on each piece. This is the single most important practice.

**Why it matters:** Without Prototypes, changing a shared behavior (like how movement marking works) means editing every single piece that uses it. With Prototypes, you change it once.

**Pattern:** Create layered Prototypes:
- "Base Unit" — Report Action, Movement Markable, Delete
- "NATO Counter" — inherits "Base Unit" + Embellishment (reduced side), Marker (Type)
- "German Infantry" — inherits "NATO Counter" + Marker (Nationality=German)

Each piece only needs a UsePrototype trait pointing to its most specific Prototype.

---

## Trait Ordering Rules of Thumb

Trait order matters because VASSAL processes commands from outside in. Here is a practical ordering guide, from **outermost** (top of list) to **innermost** (bottom, closest to BasicPiece):

1. **Restrict Commands / Restricted Access** — Gate commands before anything else processes them.
2. **Sub Menu / Menu Separator** — Organize the right-click menu.
3. **Report Action** — Log the action before it happens (so the report fires even if the piece is deleted).
4. **Trigger Action** — Automation macros that orchestrate other traits.
5. **Dynamic Property / Set Global Property** — State changes.
6. **Send to Location / Place Marker / Replace / Delete** — Movement and lifecycle.
7. **Embellishment** — Visual layers (later = drawn on top).
8. **Marker** — Static properties (position does not matter much, but convention is near inside).
9. **Use Prototype** — Injects its traits at this position.
10. **BasicPiece** — Always innermost.

**When in doubt:** Restrict traits go outside, visual traits go inside, action traits go in the middle.

---

## Naming Conventions

Consistent naming prevents confusion as modules grow.

### Properties
- Use **PascalCase** for property names: `AttackStrength`, `MovementPoints`, `IsDisrupted`.
- Prefix Global Properties with scope: `VP_Allied`, `Weather_Current`, `Turn_Number`.
- Boolean properties: use `Is` or `Has` prefix: `IsActivated`, `HasMoved`, `IsInSupply`.

### Key Commands
- Use **descriptive names** for named key commands: `FlipToReduced`, `MarkAsMoved`, `ResetMovement`.
- Group related commands with a common prefix: `Combat_Fire`, `Combat_Defend`, `Combat_Retreat`.

### Prototypes
- Name by what they represent: "Standard Infantry", "NATO Counter", "Card Base".
- Use a hierarchy prefix if you have many: "Base/Unit", "Base/Card", "German/Infantry".

---

## Common Mistakes and How to Avoid Them

### Duplicating traits instead of using Prototypes
**Problem:** 50 pieces each have the same 8 traits copied individually. Changing one behavior means editing 50 pieces.
**Fix:** Extract shared traits into Prototypes. Each piece gets one UsePrototype trait.

### Forgetting Report Actions in PBEM games
**Problem:** In play-by-email, your opponent replays your log file but cannot see what you did because nothing was reported to chat.
**Fix:** Add Report Action traits for every meaningful player action (moves, attacks, flips, status changes).

### Putting Restrict Commands too deep in the trait stack
**Problem:** A command fires (changing game state) before Restrict Commands can block it.
**Fix:** Place Restrict Commands near the outermost position in the trait list.

### Using hard-coded values instead of properties
**Problem:** A Trigger checks `{Strength == 4}` but some units have different starting strengths.
**Fix:** Use properties and expressions: `{Strength == MaxStrength}` where MaxStrength is a Marker.

### Not incrementing nextPieceSlotId
**Problem:** The module fails to load or pieces behave erratically.
**Fix:** Our builder handles this automatically. If editing XML by hand, make sure every PieceSlot has a unique slot ID and the module's `nextPieceSlotId` is higher than all of them.

### Overly complex single traits vs. simple trait chains
**Problem:** One massive Trigger Action with deeply nested conditions that is impossible to debug.
**Fix:** Break complex logic into multiple simple Triggers that fire each other in sequence. Each Trigger does one thing clearly.

---

## Embellishment vs. Multiple Pieces

A common question: should a unit's reduced side be an **Embellishment layer** or a **separate piece** swapped with Replace?

### Use Embellishment when:
- The piece keeps all its traits and properties across states
- You just need to change the image (full/reduced, active/spent)
- The piece has two or three visual states
- You want a smooth toggle via right-click menu

### Use Replace when:
- The reduced version has fundamentally different traits or capabilities
- Properties need to change to completely different values
- The transformation is one-way (you do not flip back)
- The "new" piece is a genuinely different game entity

**Most hex wargames** should use Embellishment for step reduction. The counter keeps its identity, markers, and position — only the image changes. Replace is better for transformations like "infantry promotes to elite" where the piece type changes.

---

## The Power of Trigger Action

TriggerAction is the most underused powerful trait. Think of it as a macro that runs a sequence of actions.

### Basic pattern: If-Then
A Trigger that checks a condition and fires a key command:
- **Watch for:** the key command that starts the check (e.g., `TakeHit`)
- **Condition:** `{Steps == 1}` (this is the last step)
- **Fire:** `EliminateUnit` key command
- Another Trigger watches for `TakeHit` with condition `{Steps > 1}` and fires `ReduceStep`

### Looping pattern: Process a stack
A Trigger with a counted loop:
- **Loop count:** `{SumStack("Count")}`
- **Loop action:** fire `ProcessNextUnit`
- **Post-loop action:** fire `FinishProcessing`

### Chain pattern: Multi-step automation
Triggers calling other Triggers:
1. `ResolveCombat` fires `CalculateOdds`
2. `CalculateOdds` sets a property, then fires `LookupResult`
3. `LookupResult` fires `ApplyResult`

Each step is simple and debuggable. The chain accomplishes complex automation.

---

## Quick Tips

- **Start simple.** Get a basic module working (map, grid, a few pieces) before adding automation. You can always add traits later.
- **Test frequently.** Open your module in VASSAL's editor after every few changes. Catch problems early.
- **Use Comments.** Add Comment traits to complex pieces explaining what the trait chain does. Future-you will thank present-you.
- **Keep images consistent.** Use the same pixel dimensions for all counters of a given size. Common sizes: 45x45, 50x50, or 60x60 pixels.
- **Name your key commands.** Use descriptive named key commands (`FlipUnit`) instead of keyboard shortcuts alone. Named commands are self-documenting and avoid shortcut conflicts.
