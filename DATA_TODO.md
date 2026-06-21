# Data TODO — values that still need real numbers

All core data is now verified from the physical components: class boards (stat
tiers, Heroic Actions, taunt), all four dice, and the equipment catalog (stat
requirements, handedness, actions). What's left is the upgrade-attach feature
work, not missing numbers. Everything lives in plain data files and hot-reloads —
no in-app editing.

## 1. Class boards — `src/data/classes.ts`
All 10 classes transcribed from the physical boards (Tabletop Sim captures, 2026-06-20):

- [x] **Stat tiers** (`statTiers`) — real Base/T1/T2/T3 values from each board.
- [x] **Heroic Action** (`heroicAction.name` + `.text`) — transcribed.
- [x] **Taunt** (`taunt`) — from each board's taunt token.
- [x] **Heroic Action symbols resolved** — Warrior grants a black die, Pyromancer an
      orange die; Sorcerer's Spell Fury grants infinite range (not a die).

## 2. Equipment — `src/data/equipment.ts` (auto-generated, 375 items)
Now imported from the user's richer copy of the Mathog sheet
(`scripts/source/equipment-sheet.xlsx`, id `1iAU_eg7…`). **Reliably imported now:**
name, set membership (up to 3 boxes), class restriction, kind
(weapon/shield/spell/armour/ring/upgrade/ember), **handedness** (1H/2H), **stat
requirements** (`req`), source/rarity, and up to 3 actions each (stamina, attack
dice BLK/BLU/ORA, modifier, range, magic flag, effect tags).

Still to verify / build out:

- [x] **Stat requirements** (`req`) — imported (AI–AL on the sheet).
- [x] **Handedness** (`hands: 1 | 2`) — imported from the `2H` flag.
- [ ] **Upgrade-attach mechanic** — rings + gems/titanite (`kind: 'ring' | 'upgrade'`)
      attach into a gear item's 2 upgrade slots. Data + a basic attach UI exist, but the
      *rules* (which upgrades fit which gear, ring limits, effects) need fleshing out.
      **User flagged this as a deliberate TODO for later.**
- [ ] **Ember cards** (`kind: 'ember'`, 7 of them) — imported but not slotted; decide how
      they're used.
- [ ] **Spot-check stat-req scale** lines up with the final class stat tiers (both use the
      same 0–40 scale; confirm once class boards are finalised).
- [ ] **Flat block / resist** — not on this sheet; armour defence is expressed via actions.

Note: editing then re-running the importer overwrites this file. Put any manual
corrections into the generator (`scripts/generate_equipment.py`), not the output.

## 3. Dice — `src/data/dice.ts`
- [x] Black / Blue / Orange faces — confirmed (this sheet's Dice tab gives matching
      min/max/avg: BLK 0–2 avg 1.167, BLU 1–3 avg 1.833, ORA 1–4 avg 2.5).
- [x] **Green (dodge) die** — confirmed from the physical die: `[0,0,0,1,1,1]`
      (3 blank faces + 3 dodge-symbol faces).

## How to hand me values
Type them or send photos of the boards/cards/dice and I'll bake them into the files above.
