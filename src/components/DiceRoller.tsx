import { useMemo, useState } from 'react'
import type {
  Character,
  ClassBoard,
  DiceColor,
  DicePool,
  EquippedItem,
} from '../types'
import { ATTACK_DICE } from '../types'
import { getCard } from '../data'
import { DIE_LABEL, DIE_STYLE } from '../data/dice'
import { rollPool, poolSize, poolLabel, type RollResult } from '../lib/roll'
import Modal from './Modal'

// Game rule learned from play (not on the source sheet): Havel's Greatshield
// prevents dodging — you get 0 dodge dice while it's equipped.
const NO_DODGE_IDS = new Set(['havel-s-greatshield'])

const DEF_DICE: DiceColor[] = [...ATTACK_DICE, 'green']

function mergePool(into: DicePool, add: DicePool) {
  for (const c of DEF_DICE) {
    const n = add[c] ?? 0
    if (n) into[c] = (into[c] ?? 0) + n
  }
}

interface Props {
  character: Character
  cls: ClassBoard
  onClose: () => void
}

type HandSource = 'leftHand' | 'rightHand' | 'backup'

interface Preset {
  label: string
  pool: DicePool
  modifier: number
  text?: string
  source: HandSource
}

const HAND_LABEL: Record<HandSource, string> = {
  leftHand: 'Left Hand',
  rightHand: 'Right Hand',
  backup: 'Backup',
}
const HAND_ORDER: HandSource[] = ['leftHand', 'rightHand', 'backup']

function DiceFaces({ dice }: { dice: RollResult['dice'] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {dice.map((d, i) => (
        <span
          key={i}
          className="flex h-10 w-10 items-center justify-center rounded-md border font-serif text-lg"
          style={{
            background: DIE_STYLE[d.color].bg,
            color: DIE_STYLE[d.color].fg,
            borderColor: DIE_STYLE[d.color].ring,
          }}
        >
          {d.value}
        </span>
      ))}
    </div>
  )
}

export default function DiceRoller({ character, onClose }: Props) {
  const [pool, setPool] = useState<DicePool>({})
  const [modifier, setModifier] = useState(0)
  const [result, setResult] = useState<RollResult | null>(null)
  const [dodgeResult, setDodgeResult] = useState<RollResult | null>(null)
  const [sunless, setSunless] = useState(true)
  const [history, setHistory] = useState<{ label: string; result: string }[]>([])
  const [handTab, setHandTab] = useState<HandSource | null>(null)

  // Build presets from every equipped weapon's actions, tagged by hand.
  const presets = useMemo<Preset[]>(() => {
    const out: Preset[] = []
    const add = (item: { cardId: string } | null, source: HandSource) => {
      if (!item) return
      const card = getCard(item.cardId)
      if (!card?.actions) return
      for (const a of card.actions) {
        if (poolSize(a.dice) === 0) continue // skip non-dice actions (e.g. pure heals)
        out.push({
          label: `${card.name}: ${a.name ?? (a.stamina != null ? `${a.stamina} ST` : 'Attack')}`,
          pool: a.dice,
          modifier: a.modifier ?? 0,
          text: a.text,
          source,
        })
      }
    }
    add(character.equipped.leftHand, 'leftHand')
    add(character.equipped.rightHand, 'rightHand')
    for (const b of character.equipped.backup) add(b, 'backup')
    return out
  }, [character.equipped])

  // Your defence is the AGGREGATE of all worn/held gear: armour + both hands (plus
  // their attached upgrades). Block reduces physical damage, resist reduces magic.
  // Dodge is a SEPARATE thing — it doesn't reduce damage, so its dice are never
  // mixed into a block/resist total; they're rolled and shown on their own. In The
  // Sunless City you roll dodge alongside your defence every time (the toggle), then
  // pick the better outcome. Dodge is wholly gear-derived (0 is valid). Backup gear is
  // sheathed and doesn't contribute. Havel's Greatshield disables dodging entirely.
  const defence = useMemo(() => {
    const block: DicePool = {}
    const resist: DicePool = {}
    let blockMod = 0
    let resistMod = 0
    let dodge = 0
    let noDodge = false
    const consume = (item: EquippedItem | null) => {
      if (!item) return
      for (const id of [item.cardId, ...item.upgrades]) {
        if (NO_DODGE_IDS.has(id)) noDodge = true
        const d = getCard(id)?.defence
        if (!d) continue
        if (d.block) {
          mergePool(block, d.block.dice)
          blockMod += d.block.modifier ?? 0
        }
        if (d.resist) {
          mergePool(resist, d.resist.dice)
          resistMod += d.resist.modifier ?? 0
        }
        dodge += d.dodge ?? 0
      }
    }
    consume(character.equipped.armour)
    consume(character.equipped.leftHand)
    consume(character.equipped.rightHand)
    if (noDodge) dodge = 0

    const presets: { label: string; pool: DicePool; modifier: number }[] = []
    if (poolSize(block) > 0)
      presets.push({ label: 'Block — physical', pool: block, modifier: blockMod })
    if (poolSize(resist) > 0)
      presets.push({ label: 'Resist — magic', pool: resist, modifier: resistMod })
    return { presets, dodge, noDodge }
  }, [character.equipped])

  // Which hands actually have rollable actions, and the active tab.
  const handSources = HAND_ORDER.filter((s) => presets.some((p) => p.source === s))
  const activeHand =
    handTab && handSources.includes(handTab) ? handTab : (handSources[0] ?? null)
  const shownPresets = presets.filter((p) => p.source === activeHand)

  const rollsDodge = sunless && defence.dodge > 0

  function bump(color: DiceColor, delta: number) {
    setPool((p) => {
      const n = Math.max(0, (p[color] ?? 0) + delta)
      const next = { ...p }
      if (n === 0) delete next[color]
      else next[color] = n
      return next
    })
  }

  function applyPreset(p: { pool: DicePool; modifier: number }) {
    setPool(p.pool)
    setModifier(p.modifier)
    setResult(null)
    setDodgeResult(null)
  }

  function doRoll() {
    if (poolSize(pool) === 0) return
    const r = rollPool(pool, modifier)
    setResult(r)
    let dodgeStr = ''
    if (rollsDodge) {
      const dr = rollPool({ green: defence.dodge }, 0)
      setDodgeResult(dr)
      dodgeStr = ` · ${dr.sum} dodge`
    } else {
      setDodgeResult(null)
    }
    setHistory((h) =>
      [
        { label: poolLabel(pool) + fmtMod(modifier), result: `${r.total}${dodgeStr}` },
        ...h,
      ].slice(0, 6),
    )
  }

  function rollDodge() {
    if (defence.dodge <= 0) return
    const dr = rollPool({ green: defence.dodge }, 0)
    setDodgeResult(dr)
    setHistory((h) =>
      [
        { label: `${defence.dodge} ${DIE_LABEL.green}`, result: `${dr.sum} dodge` },
        ...h,
      ].slice(0, 6),
    )
  }

  return (
    <Modal title="Dice Roller" onClose={onClose}>
      {/* Sunless City: always roll dodge alongside the main roll. */}
      <button
        role="switch"
        aria-checked={sunless}
        onClick={() => setSunless((s) => !s)}
        className="mb-4 flex w-full items-center justify-between rounded-md border border-ash-700 bg-ash-900 p-2 text-left"
      >
        <span className="text-sm text-ash-300">
          Sunless City{' '}
          <span className="text-ash-500">— roll dodge with every roll</span>
        </span>
        <span
          className={`flex h-6 w-11 flex-none items-center rounded-full px-0.5 transition ${
            sunless ? 'justify-end bg-ember-600' : 'justify-start bg-ash-600'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-ash-950" />
        </span>
      </button>

      {presets.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs text-ash-500">Equipped weapon actions</p>
          {handSources.length > 1 && (
            <div className="mb-2 flex gap-1 rounded-md border border-ash-700 bg-ash-900 p-1">
              {handSources.map((s) => (
                <button
                  key={s}
                  onClick={() => setHandTab(s)}
                  className={`flex-1 rounded px-2 py-1 text-xs ${
                    s === activeHand
                      ? 'bg-ember-600 font-semibold text-ash-950'
                      : 'text-ash-300 active:bg-ash-800'
                  }`}
                >
                  {HAND_LABEL[s]}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {shownPresets.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                className="flex items-center justify-between rounded-md border border-ash-700 bg-ash-850 px-2 py-1.5 text-left active:bg-ash-800"
              >
                <span className="text-sm text-soul-400">{p.label}</span>
                <span className="text-xs text-ash-400">
                  {poolLabel(p.pool)}
                  {fmtMod(p.modifier)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {defence.presets.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs text-ash-500">
            Defence — your total from all worn gear
          </p>
          <div className="flex flex-col gap-1">
            {defence.presets.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                className="flex items-center justify-between rounded-md border border-ash-700 bg-ash-850 px-2 py-1.5 text-left active:bg-ash-800"
              >
                <span className="text-sm text-soul-400">{p.label}</span>
                <span className="text-xs text-ash-400">
                  {poolLabel(p.pool)}
                  {fmtMod(p.modifier)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dodge — always shown with your aggregate; never folded into block/resist. */}
      <div className="mb-4">
        <div className="flex items-center justify-between rounded-md border border-ash-700 bg-ash-850 px-2 py-1.5">
          <span className="text-sm text-soul-400">
            Dodge
            <span className="ml-2 text-xs text-ash-400">
              {defence.dodge} {DIE_LABEL.green} dice
            </span>
          </span>
          <button
            onClick={rollDodge}
            disabled={defence.dodge <= 0}
            className="rounded border border-ash-700 px-3 py-1 text-xs text-ash-200 disabled:opacity-30 active:bg-ash-700"
          >
            Roll
          </button>
        </div>
        {defence.noDodge ? (
          <p className="mt-1 text-[11px] text-blood-500">
            Havel's Greatshield equipped — you can't dodge (0 dice).
          </p>
        ) : defence.dodge === 0 ? (
          <p className="mt-1 text-[11px] text-ash-600">No dodge dice from your gear.</p>
        ) : null}
      </div>

      {/* Manual pool builder (attack/block dice — dodge is handled above) */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {ATTACK_DICE.map((color) => (
          <div
            key={color}
            className="flex items-center justify-between rounded-md border border-ash-700 bg-ash-900 p-1"
          >
            <span className="ml-1 text-xs" style={{ color: DIE_STYLE[color].ring }}>
              {DIE_LABEL[color]}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => bump(color, -1)}
                className="h-7 w-7 rounded text-lg text-ash-300 active:bg-ash-800"
              >
                −
              </button>
              <span className="w-5 text-center font-serif text-soul-400">
                {pool[color] ?? 0}
              </span>
              <button
                onClick={() => bump(color, 1)}
                className="h-7 w-7 rounded text-lg text-ash-300 active:bg-ash-800"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modifier */}
      <div className="mb-3 flex items-center justify-between rounded-md border border-ash-700 bg-ash-900 p-2">
        <span className="text-sm text-ash-400">Modifier</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModifier((m) => m - 1)}
            className="h-8 w-8 rounded text-lg text-ash-300 active:bg-ash-800"
          >
            −
          </button>
          <span className="w-8 text-center font-serif text-soul-400">
            {modifier > 0 ? `+${modifier}` : modifier}
          </span>
          <button
            onClick={() => setModifier((m) => m + 1)}
            className="h-8 w-8 rounded text-lg text-ash-300 active:bg-ash-800"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={doRoll}
        disabled={poolSize(pool) === 0}
        className="w-full rounded-lg bg-ember-600 py-3 font-serif text-lg font-semibold text-ash-950 disabled:opacity-40 active:bg-ember-500"
      >
        Roll {poolLabel(pool)}
        {fmtMod(modifier)}
        {rollsDodge && poolSize(pool) > 0 ? ` + ${defence.dodge} dodge` : ''}
      </button>

      {result && (
        <div className="mt-4 rounded-lg border border-ash-600 bg-ash-850 p-3 text-center">
          <DiceFaces dice={result.dice} />
          <div className="mt-3 font-serif text-3xl text-ember-400">
            {result.total}
          </div>
          <div className="text-xs text-ash-500">
            {result.sum} dice {fmtMod(result.modifier)} = {result.total}
          </div>
        </div>
      )}

      {dodgeResult && (
        <div className="mt-3 rounded-lg border border-green-700/50 bg-ash-850 p-3 text-center">
          <DiceFaces dice={dodgeResult.dice} />
          <div className="mt-2 font-serif text-2xl text-green-400">
            {dodgeResult.sum}
          </div>
          <div className="text-xs text-ash-500">
            dodge {dodgeResult.sum === 1 ? 'success' : 'successes'} (separate — does
            not reduce damage)
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-xs text-ash-500">Recent rolls</p>
          <div className="flex flex-col gap-1">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-ash-800 bg-ash-900 px-2 py-1 text-xs"
              >
                <span className="text-ash-400">{h.label}</span>
                <span className="font-serif text-soul-400">{h.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

function fmtMod(m: number): string {
  if (!m) return ''
  return m > 0 ? ` +${m}` : ` ${m}`
}
