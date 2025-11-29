import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { db, ensureSeeded, type SettingsRow } from '../db/dexie'

export type OptionsState = Pick<SettingsRow, 'letterCase'|'fontStyle'>
interface Ctx {
  state: OptionsState
  update: (patch: Partial<OptionsState>) => Promise<void>
}

const OptionsCtx = createContext<Ctx | null>(null)

export function OptionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OptionsState>({ letterCase: 'upper', fontStyle: 'normal' })

  useEffect(() => { (async () => {
    await ensureSeeded()
    const row = await db.settings.get('global')
    if (row) setState({ letterCase: row.letterCase, fontStyle: row.fontStyle })
  })() }, [])

  const update = async (patch: Partial<OptionsState>) => {
    setState(s => ({ ...s, ...patch }))
    const curr = await db.settings.get('global')
    const next: SettingsRow = { id: 'global', letterCase: patch.letterCase ?? curr?.letterCase ?? 'upper', fontStyle: patch.fontStyle ?? curr?.fontStyle ?? 'normal' }
    await db.settings.put(next)
  }

  const value = useMemo(() => ({ state, update }), [state])
  return <OptionsCtx.Provider value={value}>{children}<OptionsDialog/></OptionsCtx.Provider>
}

export function useOptions() {
  const c = useContext(OptionsCtx)
  if (!c) throw new Error('OptionsProvider missing')
  return c
}

function OptionsDialog() {
  const { state, update } = useOptions()
  return (
    <dialog id="options-dialog" style={{borderRadius:12, padding:16}}>
      <h3 style={{marginTop:0}}>Aukerak</h3>
      <div style={{display:'grid', gap:12}}>
        <label>
          Letra mota:
          <div>
            <label style={{marginRight:10}}>
              <input type="radio" name="letterCase" checked={state.letterCase==='upper'} onChange={() => update({letterCase:'upper'})}/> ABC
            </label>
            <label>
              <input type="radio" name="letterCase" checked={state.letterCase==='lower'} onChange={() => update({letterCase:'lower'})}/> abc
            </label>
          </div>
        </label>
        <label>
          Letra-tipoa:
          <select value={state.fontStyle} onChange={e=>update({fontStyle: e.target.value as any})}>
            <option value="normal">Normala</option>
            <option value="child">Haurrentzako</option>
          </select>
        </label>
        <button className="button" onClick={() => (document.getElementById('options-dialog') as HTMLDialogElement).close()}>Itxi</button>
      </div>
    </dialog>
  )
}
