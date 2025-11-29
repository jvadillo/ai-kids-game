import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../../db/dexie'
import { shuffleArray } from '../../utils/letters'

const ITEMS_PER_ROUND = 4

export default function SyllableSortGame() {
  const [sp] = useSearchParams()
  const theme = sp.get('theme') || 'animaliak'
  const navigate = useNavigate()
  const [items, setItems] = useState<{id:number; word:string; emoji:string; syllables:number}[]>([])
  const [placed, setPlaced] = useState<Record<number, number[]>>({})

  useEffect(() => { nextRound() }, [theme])

  async function nextRound() {
    const arr = await db.words.where('themeKey').equals(theme as any).toArray()
    const pool = shuffleArray(arr).slice(0, ITEMS_PER_ROUND)
    setItems(pool.map(w => ({ id: w.id, word: w.word, emoji: w.emoji, syllables: w.syllablesCount })))
    setPlaced({})
  }

  function onDrop(itemId: number, zone: number) {
    const item = items.find(x => x.id === itemId)
    if (!item) return
    if (item.syllables === zone) {
      setPlaced(p => ({ ...p, [zone]: [...(p[zone]||[]), itemId] }))
    }
  }

  const allPlaced = items.every(it => Object.values(placed).flat().includes(it.id))

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/themes?target=syllable-sort')}>⬅ Atzera</button>
        <h2 style={{margin:0}}>Sailkatu silabak</h2>
      </div>
      <div className="feedback" aria-live="polite">{allPlaced && items.length>0 ? 'Ronda osatuta! 🎉' : 'Arrastatu eta askatu tokian.'}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center',marginBottom:10}}>
        {items.filter(it => !Object.values(placed).flat().includes(it.id)).map(it => (
          <DraggableTile key={it.id} id={it.id} emoji={it.emoji} word={it.word} />
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12}}>
        {[1,2,3,4].map(n => (
          <DropZone key={n} zone={n} onDrop={onDrop} items={items.filter(it => placed[n]?.includes(it.id))} />
        ))}
      </div>
      {allPlaced && items.length>0 && (
        <button className="button" onClick={nextRound}>Hurrengoa</button>
      )}
    </div>
  )
}

function DraggableTile({ id, emoji, word }: {id:number; emoji:string; word:string}) {
  return (
    <div className="letter-tile" draggable onDragStart={e=>e.dataTransfer.setData('text/plain', String(id))} style={{cursor:'grab',padding:'10px 14px'}} aria-label={`${word} hitza`}>
      <span style={{fontSize:28,marginRight:6}}>{emoji}</span> {word.toUpperCase()}
    </div>
  )
}

function DropZone({ zone, onDrop, items }: {zone:number; onDrop:(id:number,zone:number)=>void; items:{emoji:string;word:string}[]}) {
  return (
    <div onDragOver={e=>e.preventDefault()} onDrop={e=>{
      const id = e.dataTransfer.getData('text/plain')
      if (id) onDrop(Number(id), zone)
    }} style={{minHeight:100,border:'2px dashed var(--border-color-light)',borderRadius:10,padding:10,display:'flex',flexDirection:'column',gap:6}} role="region" aria-label={`${zone} silaba`}>
      <div style={{fontWeight:800,fontSize:'1.3em',color:'var(--accent-color)',textAlign:'center'}}>{zone} silaba</div>
      {items.map((it,i)=>(
        <div key={i} style={{fontSize:20}}>{it.emoji} {it.word.toUpperCase()}</div>
      ))}
    </div>
  )
}
