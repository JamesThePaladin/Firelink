#!/usr/bin/env python3
"""Parse the Mathog 'Equipment'/'Unique Equipment' CSV tabs into our schema."""
import csv, json, re, sys

BOX_NAMES = {
    'Core','Explorers','Darkroot','Iron Keep','Phantoms','Painted World',
    'Tomb of Giants','Sunless City','Asylum Demon','Chariot','Four Kings',
    'Gaping Dragon','Guardian Dragon','Kalameet','Last Giant','Manus',
    'Old Iron King','Vordt','Characters',
}
TAGS = {'Legendary','Transposed'}
CLASSES = {'Knight','Warrior','Assassin','Mercenary','Pyromancer','Sorcerer',
          'Cleric','Herald','Thief','Deprived'}
DICE = {'BLK':'black','BLU':'blue','ORA':'orange'}

def cell(r,i): return r[i].strip() if i < len(r) else ''

def parse_actions(r):
    """Find stamina-marked attack blocks and any leading defensive dice block."""
    actions=[]
    n=len(r)
    stamina_idx=[i for i in range(n) if '◼' in r[i] or '⬛' in r[i]]
    used=set()
    for s in stamina_idx:
        st=re.sub(r'[^0-9]','',r[s]) or '0'
        win=range(s+1, min(s+16, n))
        dice={}
        modifier=0; rng=None; magic=False; dodge=None
        # range token often sits just before stamina
        for j in (s-1, s-2):
            if j>=0 and '📏' in r[j]:
                m=re.sub(r'[^0-9]','',r[j]);  rng=int(m) if m else None
        for j in win:
            v=r[j].strip()
            if v in DICE: dice[DICE[v]]=dice.get(DICE[v],0)+1; used.add(j)
            elif '📏' in v:
                m=re.sub(r'[^0-9]','',v); rng=int(m) if m else rng
            elif '⚡' in v: magic=True
            elif '🤸' in v:
                m=re.sub(r'[^0-9]','',v); dodge=int(m) if m else dodge
            elif re.fullmatch(r'-?\d+', v) and j<=s+6 and v not in ('0',):
                # signed modifier near the dice
                if not dice and modifier==0: pass
                modifier=int(v)
            # stop dice run if we hit the next stamina marker
            if ('◼' in v or '⬛' in v): break
        a={'stamina':int(st),'dice':dice}
        if modifier: a['modifier']=modifier
        if rng is not None: a['range']=rng
        if magic: a['magic']=True
        if dodge is not None: a['dodge']=dodge
        actions.append(a)
    return actions

def parse_defence(r):
    """For armour: leading dice cluster + dodge before any stamina marker."""
    n=len(r)
    first_st=min([i for i in range(n) if '◼' in r[i] or '⬛' in r[i]], default=n)
    dice={}; dodge=None; magic=False; modifier=0
    for j in range(160, min(first_st, n)):
        v=r[j].strip()
        if v in DICE: dice[DICE[v]]=dice.get(DICE[v],0)+1
        elif '🤸' in v:
            m=re.sub(r'[^0-9]','',v); dodge=int(m) if m else dodge
        elif '⚡' in v: magic=True
        elif re.fullmatch(r'-?\d+', v) and v!='0' and abs(int(v))<=5: modifier=int(v)
    d={}
    if dice: d['dice']=dice
    if dodge is not None: d['dodge']=dodge
    if magic: d['magic']=True
    if modifier: d['modifier']=modifier
    return d

def effect_text(r):
    # The dedicated effect-text column lives at the far right (~241).
    texts=[r[i].strip() for i in range(235, len(r))
           if len(r[i].strip())>10 and re.search(r'[A-Za-z]{3,}', r[i])]
    texts=[t for t in texts if 'http' not in t]
    return ' / '.join(dict.fromkeys(texts)) or None

def parse(path, src):
    out=[]
    rows=list(csv.reader(open(path)))
    for r in rows[8:]:
        name=cell(r,0)
        typ=cell(r,30)
        if not name or typ not in ('Weapon','Armor','Spell','Shield'): continue
        sets=sorted({cell(r,i) for i in range(8,27) if cell(r,i) in BOX_NAMES})
        tags=sorted({cell(r,i) for i in range(8,27) if cell(r,i) in TAGS})
        cls=cell(r,25) if cell(r,25) in CLASSES else None
        two_handed = cell(r,19)=='TRUE'
        item={'name':name,'type':typ,'sets':sets,'src':src}
        if cls: item['classId']=cls.lower()
        if tags: item['tags']=tags
        if typ=='Weapon': item['twoHanded']=two_handed
        acts=parse_actions(r)
        if typ in ('Weapon','Spell') and acts: item['actions']=acts
        if typ in ('Armor','Shield'):
            d=parse_defence(r)
            if d: item['defence']=d
        txt=effect_text(r)
        if txt: item['text']=txt
        out.append(item)
    return out

if __name__=='__main__':
    eq=parse('scripts/source/equipment.csv','equipment')
    uq=parse('scripts/source/unique-names.csv','unique')
    allitems=eq+uq
    json.dump(allitems, open('/tmp/equipment.json','w'), ensure_ascii=False, indent=1)
    print(f"parsed {len(eq)} equipment + {len(uq)} unique = {len(allitems)}")
    # show known samples
    for nm in ('Spiked Mace','Claymore','Estoc','Pyromancy Flame','Eastern Armor','Gold-Hemmed Black Robes'):
        for it in allitems:
            if it['name']==nm:
                print(json.dumps(it, ensure_ascii=False)); break
