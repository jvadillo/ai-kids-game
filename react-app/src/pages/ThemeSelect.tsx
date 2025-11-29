import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../db/dexie'
import { useLiveQuery } from 'dexie-react-hooks'

export default function ThemeSelect() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const target = sp.get('target') ?? 'words'
  const themes = useLiveQuery(() => db.themes.toArray(), []) ?? []

  return (
    <div style={{display:'grid', gap:16}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate(-1)}>⬅ Atzera</button>
        <h2 style={{margin:0}}>Aukeratu gai bat</h2>
      </div>
      <div className="grid">
        {themes.map(t => (
          <Link key={t.key} to={`/${target}?theme=${t.key}`} className="card" style={{textDecoration:'none', color:'inherit'}}>
            <div style={{fontWeight:800}}>{t.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
