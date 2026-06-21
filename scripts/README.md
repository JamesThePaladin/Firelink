# Equipment data import

`src/data/equipment.ts` (375 cards) is generated from the community **Mathog**
scoring sheet ("Dark Souls Board Game – Enemy & Equipment Score"). The source
workbook is committed as `scripts/source/equipment-sheet.xlsx` so regeneration needs
no network.

Regenerate (from the repo root):

```bash
PYTHONPATH=scripts python3 scripts/generate_equipment.py
```

- `xlsxread.py` — a tiny stdlib-only `.xlsx` reader (no openpyxl/pandas). Resolves
  shared strings, theme colours, and per-cell fill colours.
- `generate_equipment.py` — reads the **Equipment** tab (rows 22–396) and writes
  `EquipmentCard[]`. Per item it pulls: name, set membership (cols I/L/O), class
  restriction (Z/AC), kind (AE: Weapon/Shield/Spell/Armor/Ring/Ember/Upgrade),
  handedness (AF `2H` flag), stat requirements (AI–AL = Str/Dex/Int/Fth),
  source/rarity (J), and up to **3 action blocks** (GB.., GU.., HN..) — each with
  Range, Cost, four Die slots, Mod, Mag, and effect flags. Dice are 3-letter codes
  in the cells (`BLK`/`BLU`/`ORA`); only attack dice appear (no green/dodge die).

The xlsx is the user's shared copy (id `1iAU_eg7…`), which — unlike the earlier copy
— contains real **stat requirements** and **handedness**. To export a fresh copy:
**File → Download → Microsoft Excel (.xlsx)** and replace `source/equipment-sheet.xlsx`.

Put any manual corrections in `generate_equipment.py` (mappings/overrides), not in the
generated `equipment.ts` — re-running overwrites the output. `source/dice.csv` is the
old confirmation of the black/blue/orange die faces.
