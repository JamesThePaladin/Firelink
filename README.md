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
- Equipment with stat-gated equipping, 1H/2H/backup slot rules, upgrades, and inventory.
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

The **equipment catalog (~310 items, all sets)** in `src/data/equipment.ts` is
**auto-generated** from the community "Mathog" scoring spreadsheet
(`/tmp` CSV → `scripts`-style Python parser). From the sheet we reliably get:
name, set/box membership, class restriction, type, dice **actions** (stamina, dice,
range, magic), armour **defence dice**, and effect text.

What the sheet does **not** contain — add/verify from your physical cards & boards:

- **Stat requirements** (`req`) and flat block/resist — not in the sheet; add per card.
- **Handedness** (1H/2H) and some secondary weapon actions — sheet is imperfect here.
- **Class boards** in `src/data/classes.ts` — stat tiers are **approximate** (not exact);
  Heroic Action text and taunt are placeholders. Verify all from your boards. Slots start
  **empty**; equip from the catalog.
- **Dice faces** in `src/data/dice.ts` — black/blue/orange confirmed from the sheet;
  the **green dodge die** still needs your physical die.

Edit any value in those plain data files; they hot-reload. Enable the sets you own in
**Settings** — the catalog filters to them. **See [`DATA_TODO.md`](DATA_TODO.md) for the
full checklist of values still to verify.**

## Stack

Vite + React + TypeScript + Tailwind v4 + Dexie (IndexedDB) + vite-plugin-pwa.
