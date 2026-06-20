# Equipment data import

`src/data/equipment.ts` is generated from the community **Mathog** scoring sheet
("Dark Souls Board Game – Enemy & Equipment Score"). Source CSV tabs are saved in
`scripts/source/` so regeneration needs no network.

Regenerate (from the repo root):

```bash
PYTHONPATH=scripts python3 scripts/generate_equipment.py
```

- `parse_equipment.py` — reads `source/equipment.csv` (a 243-column scoring sheet),
  extracting name, set/box membership, class, type/handedness, dice **actions**
  (stamina/dice/range/magic), armour **defence dice**, and effect text.
- `generate_equipment.py` — maps that to `EquipmentCard[]` and writes `src/data/equipment.ts`.

The sheet does NOT contain stat requirements, flat block/resist, or reliable
handedness — add/correct those by editing `src/data/equipment.ts` directly
(regenerating will overwrite it, so do manual edits after the last import, or extend
the generator). `source/dice.csv` confirmed the black/blue/orange die faces;
`source/unique-names.csv` is just a per-box checklist of unique item names.
