import Dexie, { type EntityTable } from 'dexie'
import type { Character } from '../types'

export const db = new Dexie('ds-character-sheet') as Dexie & {
  characters: EntityTable<Character, 'id'>
}

db.version(1).stores({
  // Primary key `id`; secondary indexes for sorting/lookup.
  characters: 'id, updatedAt, name',
})
