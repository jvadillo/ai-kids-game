import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../../db/dexie'
import { shuffleArray } from '../../utils/letters'

const VOWELS = ['A', 'E', 'I', 'O', 'U']
const ITEMS_PER_ROUND = 5

export default function EmojiVowelMatchGame() {
  const [sp] = useSearchParams()
  const theme = sp.get('theme') || 'animaliak'
  const navigate = useNavigate()

  const [words, setWords] = useState<{word:string; emoji:string; firstVowel:string}[]>([])
  const [round, setRound] = useState(0)
  const [items, setItems] = useState<{word:string; emoji:string; vowel:string}[]>([])
  const [placed, setPlaced] = useState<Record<string, string>>({}) // vowel -> emoji

  useEffect(() => { (async () => {
    const arr = await db.words.where('themeKey').equals(theme as any).toArray()
    const mapped = arr.map(w => {
      const fv = w.word.split('').find(c => VOWELS.includes(c.toUpperCase()))?.toUpperCase() || 'A'
      return { word: w.word, emoji: w.emoji, firstVowel: fv }
    })
    setWords(shuffleArray(mapped))
    setRound(0)
  })() }, [theme])

  useEffect(() => {
    if (!words.length) return
    const start = round * ITEMS_PER_ROUND
    const slice = words.slice(start, start + ITEMS_PER_ROUND)
    setItems(slice.map(w => ({ word: w.word, emoji: w.emoji, vowel: w.firstVowel })))
    setPlaced({})
  }, [round, words])

  function onDrop(emoji: string, vowel: string) {
    setPlaced(p => ({ ...p, [vowel]: emoji }))
  }

  function validate() {
    let allCorrect = true
    VOWELS.forEach(v => {
      const item = items.find(it => it.emoji === placed[v])
      if (!item || item.vowel !== v) allCorrect = false
    })
    if (allCorrect) {
      setTimeout(() => setRound(r => r + 1), 600)
    } else {
      setPlaced({})
    }
  }

  const allPlaced = VOWELS.every(v => placed[v])

  if (round * ITEMS_PER_ROUND >= words.length) {
    return (
      <div style={{display:'grid', gap:12}}>
        <button className="button secondary" onClick={() => navigate('/themes?target=emoji-vowel-match')}>⬅ Atzera</button>
        <div className="feedback">Jokoa bukatu duzu! 🏆</div>
      </div>
    )
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <button className="button secondary" onClick={() => navigate('/themes?target=emoji-vowel-match')}>⬅ Atzera</button>
      <div className="feedback">Arrastatu emojiak bokalera!</div>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        {items.filter(it => !Object.values(placed).includes(it.emoji)).map(it => (
          <EmojiTile key={it.emoji} emoji={it.emoji} word={it.word} />
        ))}
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        {VOWELS.map(v => (
          <VowelZone key={v} vowel={v} emoji={placed[v]} onDrop={(e)=>onDrop(e,v)} />
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'center'}}>
        <button className="button primary" disabled={!allPlaced} onClick={validate}>Egiaztatu</button>
      </div>
    </div>
  )
}

function EmojiTile({ emoji, word }: { emoji: string; word: string }) {
  return (
    <div className="letter-tile" draggable onDragStart={e=>e.dataTransfer.setData('text/plain', emoji)} aria-label={`Arrastatu ${word} emojia`}>
      {emoji}
    </div>
  )
}

function VowelZone({ vowel, emoji, onDrop }: { vowel: string; emoji?: string; onDrop: (emoji: string)=>void }) {
  return (
    <div className="drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{ const em = e.dataTransfer.getData('text/plain'); if (em) onDrop(em) }}>
      <div className="drop-label">{vowel}</div>
      {emoji && <div style={{fontSize:36}}>{emoji}</div>}
    </div>
  )
}
