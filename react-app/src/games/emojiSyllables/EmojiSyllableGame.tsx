import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../../db/dexie'
import { useOptions } from '../../state/OptionsContext'
import { formatLetter, shuffleArray } from '../../utils/letters'

const WORDS_PER_LEVEL = 3

export default function EmojiSyllableGame() {
  const [sp] = useSearchParams()
  const theme = sp.get('theme') || 'animaliak'
  const navigate = useNavigate()
  const { state: options } = useOptions()

  const [words, setWords] = useState<{word:string; emoji:string; syllableParts:string[]}[]>([])
  const [idx, setIdx] = useState(0)
  const [level, setLevel] = useState(1)
  const [correctInLevel, setCorrectInLevel] = useState(0)

  const [syllablesInBoxes, setSyllablesInBoxes] = useState<(string|null)[]>([])
  const [pool, setPool] = useState<string[]>([])

  useEffect(() => { (async () => {
    const arr = await db.words.where('themeKey').equals(theme as any).toArray()
    const shuffled = shuffleArray(arr).filter(w => w.syllableParts && w.syllableParts.length>0)
    setWords(shuffled.map(w => ({ word: w.word, emoji: w.emoji, syllableParts: w.syllableParts! })))
    setIdx(0)
    setLevel(1)
    setCorrectInLevel(0)
  })() }, [theme])

  const current = words[idx]

  useEffect(() => {
    if (!current) return
    setSyllablesInBoxes(Array(current.syllableParts.length).fill(null))
    setPool(shuffleArray([...current.syllableParts]))
  }, [current?.word])

  function onDrop(syllable: string, i: number) {
    if (!current) return
    if (current.syllableParts[i] === syllable) {
      const next = [...syllablesInBoxes]
      next[i] = syllable
      setSyllablesInBoxes(next)
      setPool(p => p.filter(s => s !== syllable))
      if (next.every(v => v !== null)) {
        const newCorrect = correctInLevel + 1
        const remaining = idx < words.length - 1
        if (newCorrect >= WORDS_PER_LEVEL && remaining) {
          setLevel(l => l + 1)
          setCorrectInLevel(0)
          setTimeout(() => setIdx(i => i + 1), 800)
        } else {
          setCorrectInLevel(newCorrect)
          setTimeout(() => setIdx(i => i + 1), 600)
        }
      }
    }
  }

  if (!current) {
    return (
      <div style={{display:'grid', gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="button secondary" onClick={() => navigate('/themes?target=emoji-syllables')}>⬅ Atzera</button>
          <div className="level-indicator">Maila: {level}</div>
        </div>
        <div className="feedback">Gaia osatu duzu! 🏆</div>
      </div>
    )
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/themes?target=emoji-syllables')}>⬅ Atzera</button>
        <div className="level-indicator">Maila: {level}</div>
      </div>
      <div className="emoji" aria-label={`Emojia: ${current.word}`}>{current.emoji}</div>
      <div className="word-boxes" style={{margin:'8px 0 14px'}}>
        {current.syllableParts.map((_,i) => (
          <SyllableBox key={i} value={syllablesInBoxes[i]} onDrop={(s)=>onDrop(s,i)} />
        ))}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
        {pool.map((syl, i) => (
          <SyllableTile key={`${syl}-${i}`} syllable={syl} onPick={(s)=>onDrop(s, syllablesInBoxes.findIndex(v=>v===null))} />
        ))}
      </div>
      <div className="feedback">Osatu hitza silabekin!</div>
    </div>
  )
}

function SyllableBox({ value, onDrop }: { value: string|null; onDrop: (syllable: string)=>void }) {
  return (
    <div className="word-box" onDragOver={e=>e.preventDefault()} onDrop={e=>{ const s = e.dataTransfer.getData('text/plain'); if (s) onDrop(s) }}>
      {value}
    </div>
  )
}

function SyllableTile({ syllable, onPick }: { syllable: string; onPick: (s:string)=>void }) {
  return (
    <div className="letter-tile" draggable onDragStart={e=>e.dataTransfer.setData('text/plain', syllable)} onClick={()=>onPick(syllable)}>
      {syllable}
    </div>
  )
}
