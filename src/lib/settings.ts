import { useCallback, useEffect, useState } from 'react'
import type { SetId } from '../types'
import { ALL_SET_IDS } from '../data/sets'

const KEY = 'ds-owned-sets'

function load(): SetId[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return [...ALL_SET_IDS]
    const parsed = JSON.parse(raw) as SetId[]
    const valid = parsed.filter((s) => ALL_SET_IDS.includes(s))
    return valid.length ? valid : [...ALL_SET_IDS]
  } catch {
    return [...ALL_SET_IDS]
  }
}

/** Owned/enabled sets, persisted to localStorage. Defaults to all sets on. */
export function useOwnedSets(): {
  ownedSets: SetId[]
  toggleSet: (s: SetId) => void
  isOwned: (s: SetId) => boolean
} {
  const [ownedSets, setOwnedSets] = useState<SetId[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ownedSets))
  }, [ownedSets])

  const toggleSet = useCallback((s: SetId) => {
    setOwnedSets((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }, [])

  const isOwned = useCallback((s: SetId) => ownedSets.includes(s), [ownedSets])

  return { ownedSets, toggleSet, isOwned }
}
