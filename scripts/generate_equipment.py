#!/usr/bin/env python3
import re, json, parse_equipment as P

BOX2SLUG = {
 'Core':'core','Characters':'characters-expansion','Sunless City':'sunless-city',
 'Painted World':'painted-world','Tomb of Giants':'tomb-of-giants','Iron Keep':'iron-keep',
 'Darkroot':'darkroot','Explorers':'explorers','Phantoms':'phantoms','Asylum Demon':'asylum-demon',
 'Chariot':'chariot','Four Kings':'four-kings','Gaping Dragon':'gaping-dragon',
 'Guardian Dragon':'guardian-dragon','Kalameet':'kalameet','Last Giant':'last-giant',
 'Manus':'manus','Old Iron King':'old-iron-king','Vordt':'vordt',
}

def slug(s):
    return re.sub(r'-+','-', re.sub(r'[^a-z0-9]+','-', s.lower())).strip('-')

def main():
    items = P.parse('scripts/source/equipment.csv','equipment')
    cards=[]
    seen={}
    for it in items:
        name=it['name']
        sid=slug(name)
        seen[sid]=seen.get(sid,0)+1
        if seen[sid]>1: sid=f"{sid}-{seen[sid]}"
        sets=sorted({BOX2SLUG[b] for b in it['sets'] if b in BOX2SLUG})
        typ=it['type']
        spell = typ=='Spell'
        if typ=='Armor':
            slot='armour'
        elif typ in ('Weapon','Spell','Shield'):
            slot='two-hand' if (typ=='Weapon' and it.get('twoHanded')) else 'one-hand'
        else:
            continue
        card={'id':sid,'name':name,'sets':sets,'slot':slot}
        if spell: card['spell']=True
        if it.get('classId'): card['classId']=it['classId']
        actions=[]
        for a in it.get('actions',[]):
            act={'stamina':a.get('stamina',0),'dice':a.get('dice',{})}
            if a.get('modifier'): act['modifier']=a['modifier']
            if a.get('range') is not None: act['range']=a['range']
            if a.get('magic'): act['magic']=True
            actions.append(act)
        d=it.get('defence')
        if d:
            defact={'name':'Defend','stamina':0,'dice':d.get('dice',{})}
            if d.get('modifier'): defact['modifier']=d['modifier']
            if d.get('magic'): defact['magic']=True
            actions.insert(0, defact)
            if d.get('dodge') is not None: card['dodge']=d['dodge']
        if actions: card['actions']=actions
        if it.get('text'): card['text']=it['text']
        for t in it.get('tags',[]):
            if t=='Legendary': card['legendary']=True
            if t=='Transposed': card['transposed']=True
        cards.append(card)

    # emit TS
    def ts(v):
        if isinstance(v,bool): return 'true' if v else 'false'
        if isinstance(v,(int,float)): return repr(v)
        if isinstance(v,str):
            return "'"+v.replace('\\','\\\\').replace("'","\\'")+"'"
        if isinstance(v,list):
            return '['+', '.join(ts(x) for x in v)+']'
        if isinstance(v,dict):
            return '{ '+', '.join(f"{k}: {ts(val)}" for k,val in v.items())+' }'
        return 'undefined'

    lines=["// AUTO-GENERATED from the Mathog 'Equipment' sheet (community scoring tool).",
           "// From sheet (good): name, sets, class, type, dice/actions, magic, defence dice, text.",
           "// TODO(verify) - add/fix from physical cards: stat requirements (req), flat",
           "//   block/resist, upgrade slots, HANDEDNESS (1H/2H), and some secondary/basic",
           "//   weapon actions. See DATA_TODO.md.",
           "import type { EquipmentCard } from '../types'","",
           "export const EQUIPMENT: EquipmentCard[] = ["]
    for c in cards:
        lines.append('  '+ts(c)+',')
    lines.append(']')
    open('src/data/equipment.ts','w').write('\n'.join(lines)+'\n')
    print(f"wrote {len(cards)} cards")

if __name__=='__main__':
    main()
