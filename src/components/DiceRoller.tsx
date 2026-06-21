import { useMemo, useState } from 'react'
import type { Character, ClassBoard, DiceColor, DicePool } from '../types'
import { ATTACK_DICE } from '../types'
import { getCard } from '../data'
import { DIE_LABEL, DIE_STYLE } from '../data/dice'
import { rollPool, poolSize, poolLabel, type RollResult } from '../lib/roll'
import Modal from './Modal'

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

const ALL_DICE: DiceColor[] = [...ATTACK_DICE, 'green']

const HAND_LABEL: Record<HandSource, string> = {
  leftHand: 'Left Hand',
  rightHand: 'Right Hand',
  backup: 'Backup',
}
const HAND_ORDER: HandSource[] = ['leftHand', 'rightHand', 'backup']

export default function DiceRoller({ character, onClose }: Props) {
  const [pool, setPool] = useState<DicePool>({})
  const [modifier, setModifier] = useState(0)
  const [result, setResult] = useState<RollResult | null>(null)
  const [history, setHistory] = useState<{ label: string; total: number }[]>([])
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

  // Defensive rolls (block / resist / dodge) from every equipped piece, incl. armour.
  const defencePresets = useMemo(() => {
    const out: { label: string; pool: DicePool; modifier: number }[] = []
    const add = (item: { cardId: string } | null) => {
      const d = item && getCard(item.cardId)?.defence
      const name = item && getCard(item.cardId)?.name
      if (!d || !name) return
      if (d.block && poolSize(d.block.dice) > 0)
        out.push({ label: `${name} · Block`, pool: d.block.dice, modifier: d.block.modifier ?? 0 })
      if (d.resist && poolSize(d.resist.dice) > 0)
        out.push({ label: `${name} · Resist`, pool: d.resist.dice, modifier: d.resist.modifier ?? 0 })
      if (d.dodge)
        out.push({ label: `${name} · Dodge`, pool: { green: d.dodge }, modifier: 0 })
    }
    add(character.equipped.armour)
    add(character.equipped.leftHand)
    add(character.equipped.rightHand)
    for (const b of character.equipped.backup) add(b)
    return out
  }, [character.equipped])

  // Which hands actually have rollable actions, and the active tab.
  const handSources = HAND_ORDER.filter((s) => presets.some((p) => p.source === s))
  const activeHand =
    handTab && handSources.includes(handTab) ? handTab : (handSources[0] ?? null)
  const shownPresets = presets.filter((p) => p.source === activeHand)

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
  }

  function doRoll() {
    if (poolSize(pool) === 0) return
    const r = rollPool(pool, modifier)
    setResult(r)
    setHistory((h) =>
      [{ label: poolLabel(pool) + fmtMod(modifier), total: r.total }, ...h].slice(
        0,
        6,
      ),
    )
  }

  return (
    <Modal title="Dice Roller" onClose={onClose}>
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

      {defencePresets.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs text-ash-500">Defence — block / resist / dodge</p>
          <div className="flex flex-col gap-1">
            {defencePresets.map((p, i) => (
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

      {/* Manual pool builder */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {ALL_DICE.map((color) => (
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
      </button>

      {result && (
        <div className="mt-4 rounded-lg border border-ash-600 bg-ash-850 p-3 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {result.dice.map((d, i) => (
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
          <div className="mt-3 font-serif text-3xl text-ember-400">
            {result.total}
          </div>
          <div className="text-xs text-ash-500">
            {result.sum} dice {fmtMod(result.modifier)} = {result.total}
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
                <span className="font-serif text-soul-400">{h.total}</span>
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
