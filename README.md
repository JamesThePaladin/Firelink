FULLY SLOPPED UP, PROVIDED AS IS, USE AT YOUR OWN RISK

# Firelink

A free, offline **character sheet for [Dark Souls: The Board Game](https://www.steamforged.com/dark-souls-tbg)** —
a digital replacement for the paper character board. Named for Firelink Shrine, the hub
you always return to. It installs to your phone's home screen and runs fullscreen, fully
offline; everything is stored on your device and nothing is sent anywhere.

### ▶ [Open the live app →](https://jamesthepaladin.github.io/Firelink/)

Open that link in **Chrome on Android** → menu (⋮) → **Add to Home screen**. After the
first load it works with no connection. (It runs in any modern browser, but it's designed
for a phone in portrait.)

Covers **The Sunless City** + the **Characters Expansion** — 8 classes (Herald, Warrior,
Pyromancer, Thief, Mercenary, Cleric, Sorcerer, Deprived). Classes and items from both
boxes are available together; mix them freely.

## Features

- **Multiple saved characters**, stored locally in IndexedDB — no account, no server.
- **Stat tier track** (STR/DEX/INT/FAI, Base→T3) with soul-cost level-ups (refundable).
- **10-box endurance bar** (stamina + damage), Estus clear, and death state.
- **The four tokens** (Estus, Luck, Heroic, Ember), Heroic Action text, and Rest at Bonfire.
- **Equipment** with stat-gated equipping, 1H / 2H / backup slot rules, swap between hand
  and backup, and upgrade slots for rings/gems.
- **Dice roller** that auto-loads an equipped weapon action's dice pool + modifier, with a
  manual pool, green dodge dice, a left/right-hand switch, result breakdown, and history.

## A note on accuracy

This is a fan-made tool, not affiliated with Steamforged Games. The equipment catalog is
seeded from the community-built **"Mathog" DS:TBG scoring spreadsheet**
([link](https://docs.google.com/spreadsheets/d/1q76mS5wAMcfct8izvUsggbTJbezmfTuf_uPG5CPLsSc/edit))
— a huge thanks to its authors, whose meticulous data made this app possible. The class
boards are transcribed by hand, so some values are **approximate** — verify against your
physical components. Every value lives in a plain data file (`src/data/`) and the app
hot-reloads, so corrections are easy. See [`DATA_TODO.md`](DATA_TODO.md) for what's still
being verified.

## Run it locally

```bash
npm install
npm run dev        # open the printed URL (use the Network URL on a phone, same Wi-Fi)
```

Build / preview a production bundle:

```bash
npm run build
npm run preview
```

## Hosting & Android packaging

The live app above is deployed to **GitHub Pages** automatically on every push to `main`
(see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). To host it yourself,
or to build a sideloaded **Android APK** with [Capacitor](https://capacitorjs.com) (no host
needed), see [`docs/HOSTING.md`](docs/HOSTING.md).

## Stack

Vite + React + TypeScript + Tailwind v4 + Dexie (IndexedDB) + vite-plugin-pwa.

## License & disclaimer

Personal/fan project. *Dark Souls: The Board Game* and all related names and content are
trademarks of their respective owners; this app ships no copyrighted card art or rulebook
text and is not endorsed by Steamforged Games or FromSoftware.
