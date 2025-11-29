import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/dexie'
import { shuffleArray } from '../../utils/letters'

const VOWELS = ['A','E','I','O','U'] as const
const ITEMS_PER_ROUND = 5

export default function VowelSortGame() {
  const navigate = useNavigate()
  const [items, setItems] = useState<{id:number; word:string; emoji:string; vowel:string}[]>([])
  const [placed, setPlaced] = useState<Record<string, number[]>>({})

  useEffect(() => { nextRound() }, [])

  async function nextRound() {
    const all = await db.words.toArray()
    const pool = shuffleArray(all).slice(0, ITEMS_PER_ROUND)
    setItems(pool.map(w => ({ id: w.id, word: w.word, emoji: w.emoji, vowel: w.word[0].toUpperCase() })))
    setPlaced({})
  }

  function onDrop(itemId: number, vowel: string) {
    const item = items.find(x => x.id === itemId)
    if (!item) return
    if (item.vowel === vowel) {
      setPlaced(p => ({ ...p, [vowel]: [...(p[vowel]||[]), itemId] }))
    }
  }

  const allPlaced = items.every(it => Object.values(placed).flat().includes(it.id))

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/')}>⬅ Atzera</button>
        <h2 style={{margin:0}}>Bokalak Sailkatu</h2>
      </div>
      <div className="feedback" aria-live="polite">{allPlaced && items.length>0 ? 'Ronda osatuta! 🎉' : 'Arrastatu hitzak bokal egokira.'}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center',marginBottom:10}}>
        {items.filter(it => !Object.values(placed).flat().includes(it.id)).map(it => (
          <DraggableTile key={it.id} id={it.id} emoji={it.emoji} word={it.word} />
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
        {VOWELS.map(v => (
          <DropZone key={v} vowel={v} onDrop={onDrop} items={items.filter(it => placed[v]?.includes(it.id))} />
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

function DropZone({ vowel, onDrop, items }: {vowel:string; onDrop:(id:number,vowel:string)=>void; items:{emoji:string;word:string}[]}) {
  return (
    <div onDragOver={e=>e.preventDefault()} onDrop={e=>{
      const id = e.dataTransfer.getData('text/plain')
      if (id) onDrop(Number(id), vowel)
    }} style={{minHeight:100,border:'2px dashed var(--border-color-light)',borderRadius:10,padding:10,display:'flex',flexDirection:'column',gap:6}} role="region" aria-label={`${vowel} bokala`}>
      <div style={{fontWeight:800,fontSize:'1.3em',color:'var(--accent-color)',textAlign:'center'}}>{vowel}</div>
      {items.map((it,i)=>(
        <div key={i} style={{fontSize:20}}>{it.emoji} {it.word.toUpperCase()}</div>
      ))}
    </div>
  )
}
