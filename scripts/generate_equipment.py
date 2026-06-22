#!/usr/bin/env python3
"""Regenerate src/data/equipment.ts from the Mathog "Equipment" sheet.

Source of truth: scripts/source/equipment-sheet.xlsx (the user's shared copy of
the community scoring spreadsheet, id 1iAU_eg7...). Run:

    PYTHONPATH=scripts python3 scripts/generate_equipment.py

The Equipment tab is a wide scoring sheet. Item rows are 22..396. We read:
  A  Name
  I/L/O  Expansion membership (a card can appear in up to 3 boxes)
  Z / AC  Class restriction
  AE Type -> our `kind` (Weapon/Shield/Spell/Armor/Ring/Ember/Upgrade)
  AF '2H' flag -> handedness for hand-held gear
  AI/AJ/AK/AL  Str/Dex/Int/Fth requirements
  J  Source/rarity (Transposed / *Boss / Legendary / Invader; blank = base)
  Three Action blocks (GB.., GU.., HN..) each: Range, Cost, 4 Die, Mod, Mag,
    then effect flags (node/bleed/poison/frost/stagger/push/move/buff/shaft/repeat).

Dice are stored as 3-letter codes in the cells (BLK/BLU/ORA); only attack dice
appear here (no green/dodge die — that's defensive, off-card).
"""
import os, re, sys
from xlsxread import Wb, colnum

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(HERE, 'source', 'equipment-sheet.xlsx')
OUT = os.path.join(HERE, '..', 'src', 'data', 'equipment.ts')
SHEET = 'xl/worksheets/sheet3.xml'  # "Equipment"
ROW_LO, ROW_HI = 22, 396

EXP2SET = {
    'Core': 'core', 'Sunless City': 'sunless-city', 'Characters': 'characters-expansion',
    'Painted World': 'painted-world', 'Tomb of Giants': 'tomb-of-giants', 'Iron Keep': 'iron-keep',
    'Darkroot': 'darkroot', 'Explorers': 'explorers', 'Phantoms': 'phantoms', 'Asylum Demon': 'asylum-demon',
    'Chariot': 'chariot', 'Four Kings': 'four-kings', 'Gaping Dragon': 'gaping-dragon',
    'Guardian Dragon': 'guardian-dragon', 'Kalameet': 'kalameet', 'Last Giant': 'last-giant',
    'Manus': 'manus', 'Old Iron King': 'old-iron-king', 'Vordt': 'vordt',
}
DIE = {'BLK': 'black', 'BLU': 'blue', 'ORA': 'orange', 'GRN': 'green'}
KIND = {'Weapon': 'weapon', 'Shield': 'shield', 'Spell': 'spell', 'Armor': 'armour',
        'Ring': 'ring', 'Ember': 'ember', 'Upgrade': 'upgrade'}
SOURCE = {'Transposed': 'transposed', 'Legendary': 'legendary', 'Mini Boss': 'mini-boss',
          'Main Boss': 'main-boss', 'Mega Boss': 'mega-boss', 'Invader': 'invader'}
EFFECTS = ['node', 'bleed', 'poison', 'frost', 'stagger', 'push', 'move', 'buff', 'shaft', 'repeat']
ACT_BASE = {'1': 'GB', '2': 'GU', '3': 'HN'}
HAND_KINDS = {'weapon', 'shield', 'spell'}


def num(s):
    if s is None:
        return None
    try:
        f = float(s)
        return int(f) if f == int(f) else f
    except ValueError:
        return None


def slug(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip('-')
    return s or 'item'


def main():
    wb = Wb(XLSX)
    sh = wb.sheet(SHEET)
    C = colnum

    def cell(rn, L):
        return sh.get(rn, C(L))[0]

    def die_pool(rn, letters):
        dice = {}
        for L in letters:
            dv = sh.get(rn, C(L))[0]
            if dv in DIE:
                d = DIE[dv]
                dice[d] = dice.get(d, 0) + 1
        return dice

    def defence(rn):
        # Defence section: FP/FQ block dice + FR mod, FS/FT resist dice + FU mod,
        # FV dodge rating (green dice). Block/resist cells are always dice codes.
        d = {}
        block, bmod = die_pool(rn, ('FP', 'FQ')), num(cell(rn, 'FR'))
        if block or bmod:
            d['block'] = {'dice': block}
            if bmod:
                d['block']['modifier'] = bmod
        resist, rmod = die_pool(rn, ('FS', 'FT')), num(cell(rn, 'FU'))
        if resist or rmod:
            d['resist'] = {'dice': resist}
            if rmod:
                d['resist']['modifier'] = rmod
        dodge = num(cell(rn, 'FV'))
        if dodge:
            d['dodge'] = int(dodge)
        return d or None

    def action(rn, base):
        b = C(base)
        rng = num(sh.get(rn, b + 0)[0])
        cost = num(sh.get(rn, b + 1)[0])
        dice = {}
        for k in range(4):
            dv = sh.get(rn, b + 2 + k)[0]
            if dv in DIE:
                d = DIE[dv]
                dice[d] = dice.get(d, 0) + 1
        mod = num(sh.get(rn, b + 6)[0])
        mag = sh.get(rn, b + 7)[0]
        eff = []
        for off, name in enumerate(EFFECTS):
            ev = sh.get(rn, b + 8 + off)[0]
            if ev not in (None, '', '0', '0.0'):
                eff.append(name)
        if not dice and cost is None and not eff:
            return None
        a = {}
        if cost is not None:
            a['stamina'] = cost
        a['dice'] = dice
        if mod not in (None, 0):
            a['modifier'] = mod
        if rng is not None:
            a['range'] = rng
        if mag not in (None, '', '0', '0.0'):
            a['magic'] = True
        if eff:
            a['effects'] = eff
        return a

    items = []
    seen = {}
    starting = {}  # classId -> [item dicts]
    for rn in range(ROW_LO, ROW_HI + 1):
        name = cell(rn, 'A')
        if not name:
            continue
        kind = KIND.get(cell(rn, 'AE'))
        if not kind:
            continue
        sets = []
        for L in ('I', 'L', 'O'):
            e = cell(rn, L)
            sid = EXP2SET.get(e) if e else None
            if sid and sid not in sets:
                sets.append(sid)
        req = {}
        for L, key in (('AI', 'str'), ('AJ', 'dex'), ('AK', 'int'), ('AL', 'fai')):
            v = num(cell(rn, L))
            if v:
                req[key] = v
        cls = cell(rn, 'Z') or cell(rn, 'AC')
        src = SOURCE.get(cell(rn, 'J'))
        acts = [a for a in (action(rn, ACT_BASE[i]) for i in ('1', '2', '3')) if a]

        base_id = slug(name)
        seen[base_id] = seen.get(base_id, 0) + 1
        item_id = base_id if seen[base_id] == 1 else f"{base_id}-{seen[base_id]}"

        item = {'id': item_id, 'name': name, 'sets': sets, 'kind': kind}
        if kind in HAND_KINDS:
            item['hands'] = 2 if str(cell(rn, 'AF')) == '1' else 1
        if cls:
            item['classId'] = cls.lower()
        if req:
            item['req'] = req
        slots = num(cell(rn, 'FX'))  # 'Slots Num' — real per-item upgrade-slot count
        if slots:
            item['upgradeSlots'] = int(slots)
        if src:
            item['source'] = src
        dfc = defence(rn)
        if dfc:
            item['defence'] = dfc
        if acts:
            item['actions'] = acts
        # 'Extras > Description' (col IH): rules text shown in the detail panel.
        # Runs of 2+ spaces in the sheet separate logical lines -> newlines.
        desc = cell(rn, 'IH')
        if desc:
            desc = re.sub(r' {2,}', '\n', str(desc).strip())
            desc = re.sub(r'\n{2,}', '\n', desc)
            if desc:
                item['text'] = desc
        items.append(item)

        # "Base Item" flag (col Y) marks a class's starting/default kit.
        if str(cell(rn, 'Y')) == '1' and cls:
            starting.setdefault(cls.lower(), []).append(item)

    # Order each class's kit: armour, then weapons, spells, shields.
    kit_order = {'armour': 0, 'weapon': 1, 'spell': 2, 'shield': 3}
    starting_ids = {}
    for cid, kit in starting.items():
        kit.sort(key=lambda i: (kit_order.get(i['kind'], 9), i['name'].lower()))
        starting_ids[cid] = [i['id'] for i in kit]

    items.sort(key=lambda i: (i['kind'], i['name'].lower(), i['id']))
    write_ts(items, starting_ids)
    kinds = {}
    for i in items:
        kinds[i['kind']] = kinds.get(i['kind'], 0) + 1
    print(f"wrote {len(items)} cards -> {os.path.relpath(OUT)}")
    print('kinds:', kinds)


def ts_str(s):
    return (
        "'"
        + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
        + "'"
    )


def ts_dice(d):
    order = ['black', 'blue', 'orange', 'green']
    parts = [f"{k}: {d[k]}" for k in order if k in d]
    return '{ ' + ', '.join(parts) + ' }' if parts else '{}'


def ts_defence(d):
    parts = []
    for key in ('block', 'resist'):
        if key in d:
            r = d[key]
            rp = [f"dice: {ts_dice(r['dice'])}"]
            if 'modifier' in r:
                rp.append(f"modifier: {r['modifier']}")
            parts.append(f"{key}: {{ {', '.join(rp)} }}")
    if 'dodge' in d:
        parts.append(f"dodge: {d['dodge']}")
    return '{ ' + ', '.join(parts) + ' }'


def ts_action(a):
    p = []
    if 'stamina' in a:
        p.append(f"stamina: {a['stamina']}")
    p.append(f"dice: {ts_dice(a['dice'])}")
    if 'modifier' in a:
        p.append(f"modifier: {a['modifier']}")
    if 'range' in a:
        p.append(f"range: {a['range']}")
    if a.get('magic'):
        p.append('magic: true')
    if 'effects' in a:
        p.append('effects: [' + ', '.join(ts_str(e) for e in a['effects']) + ']')
    return '{ ' + ', '.join(p) + ' }'


def ts_card(c):
    p = [f"id: {ts_str(c['id'])}", f"name: {ts_str(c['name'])}"]
    p.append('sets: [' + ', '.join(ts_str(s) for s in c['sets']) + ']')
    p.append(f"kind: {ts_str(c['kind'])}")
    if 'hands' in c:
        p.append(f"hands: {c['hands']}")
    if 'classId' in c:
        p.append(f"classId: {ts_str(c['classId'])}")
    if 'req' in c:
        rp = ', '.join(f"{k}: {v}" for k, v in c['req'].items())
        p.append('req: { ' + rp + ' }')
    if 'upgradeSlots' in c:
        p.append(f"upgradeSlots: {c['upgradeSlots']}")
    if 'source' in c:
        p.append(f"source: {ts_str(c['source'])}")
    if 'defence' in c:
        p.append(f"defence: {ts_defence(c['defence'])}")
    if 'actions' in c:
        p.append('actions: [' + ', '.join(ts_action(a) for a in c['actions']) + ']')
    if 'text' in c:
        p.append(f"text: {ts_str(c['text'])}")
    return '  { ' + ', '.join(p) + ' },'


def write_ts(items, starting_ids):
    lines = [
        "// AUTO-GENERATED by scripts/generate_equipment.py — do not edit by hand.",
        "// Source: scripts/source/equipment-sheet.xlsx (community 'Mathog' scoring sheet).",
        "//",
        "// Reliable from the sheet: name, set membership, class restriction, kind,",
        "// handedness (2H flag), stat requirements (Str/Dex/Int/Fth), source/rarity,",
        "// defence (block/resist dice + mod, dodge rating from the Defence section),",
        "// up to 3 actions (stamina, attack dice BLK/BLU/ORA, modifier, range, magic",
        "// flag, effect tags), and the 'Extras > Description' rules text (col IH).",
        "// Ring + Upgrade cards attach into a gear item's 2 upgrade slots (UI = TODO).",
        "",
        "import type { EquipmentCard } from '../types'",
        "",
        "export const EQUIPMENT: EquipmentCard[] = [",
    ]
    lines += [ts_card(c) for c in items]
    lines.append(']')
    lines.append('')
    lines.append("// Each class's starting/default loadout (sheet 'Base Item' flag, col Y),")
    lines.append("// ordered armour, weapon(s), spell, shield. Auto-equipped on creation.")
    lines.append("export const STARTING_EQUIPMENT: Record<string, string[]> = {")
    for cid in sorted(starting_ids):
        ids = ', '.join(ts_str(i) for i in starting_ids[cid])
        lines.append(f"  {ts_str(cid)}: [{ids}],")
    lines.append('}')
    lines.append('')
    with open(OUT, 'w') as f:
        f.write('\n'.join(lines))


if __name__ == '__main__':
    sys.exit(main())
