import Dexie, { Table } from 'dexie'
import { themes as seedThemes, words as seedWords, type WordEntry, type Theme, type ThemeKey } from './seed'

export interface SettingsRow { id: 'global'; letterCase: 'upper'|'lower'; fontStyle: 'normal'|'child' }
export interface ProgressRow { id: string; game: string; themeKey?: ThemeKey; level: number; correctStreak?: number; lastPlayedAt: number }

class GameDB extends Dexie {
  themes!: Table<Theme, string>
  words!: Table<WordEntry, number>
  settings!: Table<SettingsRow, string>
  progress!: Table<ProgressRow, string>

  constructor() {
    super('AiKidsGameDB')
    this.version(1).stores({
      themes: 'key',
      words: '++id, themeKey, word',
      settings: 'id',
      progress: 'id, game, themeKey'
    }).upgrade(async () => {})
  }
}

export const db = new GameDB()

// Seed on first run
export async function ensureSeeded() {
  const count = await db.themes.count()
  if (count > 0) return
  await db.transaction('readwrite', db.themes, db.words, db.settings, async () => {
    await db.themes.bulkAdd(seedThemes)
    await db.words.bulkAdd(seedWords)
    await db.settings.put({ id: 'global', letterCase: 'upper', fontStyle: 'normal' })
  })
}
