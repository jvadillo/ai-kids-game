import { db, type ProgressRow } from '../db/dexie'
import type { ThemeKey } from '../db/seed'

export async function getProgress(game: string, themeKey?: ThemeKey) {
  const id = themeKey ? `${game}:${themeKey}` : game
  let row = await db.progress.get(id)
  if (!row) {
    row = { id, game, themeKey, level: 1, lastPlayedAt: Date.now() }
    await db.progress.put(row)
  }
  return row
}

export async function updateProgress(game: string, themeKey: ThemeKey | undefined, patch: Partial<ProgressRow>) {
  const id = themeKey ? `${game}:${themeKey}` : game
  const existing = await db.progress.get(id)
  const next: ProgressRow = {
    id,
    game,
    themeKey,
    level: patch.level ?? existing?.level ?? 1,
    correctStreak: patch.correctStreak ?? existing?.correctStreak,
    lastPlayedAt: Date.now(),
  }
  await db.progress.put(next)
  return next
}
