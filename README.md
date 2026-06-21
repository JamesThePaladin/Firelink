# Firelink

A private, offline character sheet (PWA) for **Dark Souls: The Board Game** — built to
replace the paper character board. Named for Firelink Shrine, the hub you always return to. Personal use; not for app stores. Installs to
an Android home screen and runs fullscreen, fully offline.

Loaded sets: **The Sunless City** + **Characters Expansion** (8 classes incl. the
Cleric). Built as a content library — enable the sets you own in Settings and mix
classes/items freely across them.

## Features

- Multiple saved characters (stored locally in IndexedDB; nothing leaves the device).
- Stat tier track (STR/DEX/INT/FAI, Base→T3) with soul-cost level-ups (2/4/8, refundable).
- 10-box endurance bar (stamina + damage), Estus clear, death state.
- The four tokens (Estus, Luck, Heroic, Ember) + Heroic Action text + Rest at Bonfire.
- Equipment (375 cards, all sets) with stat-gated equipping, 1H/2H/backup slot rules,
  and upgrade slots for rings/gems.
- Dice roller: auto-loads an equipped weapon action's dice pool + modifier, manual pool,
  green dodge dice, result breakdown and roll history.

## Run it

```bash
npm install
npm run dev        # then open the printed URL on your phone (same Wi-Fi)
```

Build / preview a production bundle:

```bash
npm run build
npm run preview
```

### Install on Android

Open the dev/preview URL in Chrome on your phone → menu → **Add to Home Screen**.
After first load it works offline (service worker precaches everything).

> Node was installed to `~/.local` (no sudo). If `npm` isn't found, ensure
> `~/.local/bin` is on your `PATH`.

## Hosting

To put Firelink online (so you can install it on your phone from anywhere), see
[`docs/HOSTING.md`](docs/HOSTING.md) — covers GitHub Pages, Netlify/Vercel, and
self-hosting, with the private-repo caveat for Pages.

## Data sources & accuracy

The **equipment catalog (375 items, all sets)** in `src/data/equipment.ts` is
**auto-generated** from the community "Mathog" scoring spreadsheet
(`scripts/source/equipment-sheet.xlsx` → stdlib Python parser in `scripts/`). From the
sheet we reliably get: name, set/box membership, class restriction, kind
(weapon/shield/spell/armour/ring/upgrade/ember), **handedness** (1H/2H), **stat
requirements**, source/rarity, and up to 3 dice **actions** (stamina, attack dice,
modifier, range, magic, effect tags).

Still to verify/build from your physical cards & boards (see `DATA_TODO.md`):

- **Upgrade-attach mechanic** — rings + gems/titanite attach into a gear item's 2 upgrade
  slots. Data + a basic attach UI exist; the rules need fleshing out (deliberate TODO).
- **Ember cards** (7) — imported but not yet slotted.
- **Class boards** in `src/data/classes.ts` — stat tiers are **approximate** (not exact);
  Heroic Action text and taunt are placeholders. Verify all from your boards. Slots start
  **empty**; equip from the catalog.
- **Dice faces** in `src/data/dice.ts` — black/blue/orange confirmed (match the sheet's
  averages); the **green dodge die** is defensive (not on any card) and still needs your
  physical die.

Edit any value in those plain data files; they hot-reload. Enable the sets you own in
**Settings** — the catalog filters to them. **See [`DATA_TODO.md`](DATA_TODO.md) for the
full checklist of values still to verify.**

## Stack

Vite + React + TypeScript + Tailwind v4 + Dexie (IndexedDB) + vite-plugin-pwa.
