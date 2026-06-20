# Data TODO — values that still need real numbers

The app's logic is complete; what's left is replacing placeholder/approximate data
with verified values from the physical components. Nothing below is confirmed yet.
Everything lives in plain data files and hot-reloads — no in-app editing.

## 1. Class boards — `src/data/classes.ts`
Per class (10 total: Knight, Warrior, Assassin, Herald, Pyromancer, Cleric, Sorcerer,
Mercenary, Thief, Deprived):

- [ ] **Stat tiers** (`statTiers`) — currently APPROXIMATE (close, not exact). Replace
      each class's `str/dex/int/fai` arrays `[Base, T1, T2, T3]` with board values.
- [ ] **Heroic Action** (`heroicAction.name` + `.text`) — placeholder text. Replace.
- [ ] **Taunt** (`taunt`) — placeholder number. Replace.

(Class ids and which box each appears in are settled — no change needed there.)

## 2. Equipment — `src/data/equipment.ts` (auto-generated, ~310 items)
Reliable from the sheet: name, sets, class, type, dice actions, magic, defence dice, text.
Still needed per item, from the cards:

- [ ] **Stat requirements** (`req: { str, dex, int, fai }`) — none imported; add to gate equipping.
- [ ] **Flat block / resist** values (`block`, `resist`) where armour uses them.
- [ ] **Handedness** (`slot: 'one-hand'` vs `'two-hand'`) — sheet flag is unreliable; fix per weapon.
- [ ] **Upgrade slots** (`upgradeSlots`) and any **upgrade/ring cards** (not in the sheet).
- [ ] **Secondary/basic weapon actions** the sheet missed.

Note: editing then re-running the importer overwrites this file. Either keep manual edits
after the final import, or move corrections into the generator (`scripts/`).

## 3. Dice — `src/data/dice.ts`
- [x] Black / Blue / Orange faces — confirmed from the sheet's Dice tab.
- [ ] **Green (dodge) die** faces — current `[0,0,1,1,1,2]` is a guess; confirm from the physical die.

## How to hand me values
Type them or send photos of the boards/cards/dice and I'll bake them into the files above.
