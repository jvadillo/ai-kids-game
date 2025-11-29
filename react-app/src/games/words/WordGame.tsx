import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { db } from '../../db/dexie'
import { useOptions } from '../../state/OptionsContext'
import { formatLetter, shuffleArray } from '../../utils/letters'

const WORDS_PER_LEVEL = 3
const MAX_DISTRACTORS_CAP = 3

export default function WordGame() {
  const [sp] = useSearchParams()
  const theme = sp.get('theme') || 'animaliak'
  const navigate = useNavigate()
  const { state: options } = useOptions()

  const [words, setWords] = useState<{word:string; emoji:string}[]>([])
  const [idx, setIdx] = useState(0)
  const [level, setLevel] = useState(1)
  const [correctInLevel, setCorrectInLevel] = useState(0)

  const [lettersInBoxes, setLettersInBoxes] = useState<(string|null)[]>([])
  const [pool, setPool] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'neutral'|'correct'|'incorrect'>('neutral')
  const timeoutRef = useRef<number | null>(null)

  // Cleanup timeout on unmount or word change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => { (async () => {
    const arr = await db.words.where('themeKey').equals(theme as any).toArray()
    const shuffled = shuffleArray(arr)
    setWords(shuffled.map(w => ({ word: w.word.toUpperCase(), emoji: w.emoji })))
    setIdx(0)
    setLevel(1)
    setCorrectInLevel(0)
  })() }, [theme])

  const current = words[idx]

  useEffect(() => {
    if (!current) return
    // Clear any pending timeout when word changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setFeedback('neutral')
    const letters = current.word.split('')
    setLettersInBoxes(Array(letters.length).fill(null))
    const distractors = genDistractors(current.word, level)
    setPool(shuffleArray([...letters, ...distractors]))
  }, [current?.word, level])

  function genDistractors(word: string, level: number) {
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
    const needed = Math.min(Math.max(0, level-1), MAX_DISTRACTORS_CAP)
    const res: string[] = []
    while (res.length < needed) {
      const c = alphabet[Math.floor(Math.random()*alphabet.length)]
      if (!word.includes(c) && !res.includes(c)) res.push(c)
    }
    return res
  }

  function onDrop(letter: string, i: number) {
    if (!current) return
    // Validate drop position - letter must match expected position
    if (current.word[i] === letter && lettersInBoxes[i] === null) {
      const next = [...lettersInBoxes]
      next[i] = letter
      setLettersInBoxes(next)
      setPool(p => p.filter(l => l !== letter || next.filter(x=>x===letter).length < current.word.split(letter).length-1))
      // check completion
      if (next.every(v => v !== null)) {
        setFeedback('correct')
        const newCorrect = correctInLevel + 1
        const remaining = idx < words.length - 1
        if (newCorrect >= WORDS_PER_LEVEL && remaining) {
          setLevel(l => l + 1)
          setCorrectInLevel(0)
          timeoutRef.current = window.setTimeout(() => setIdx(prev => prev + 1), 800)
        } else {
          setCorrectInLevel(newCorrect)
          timeoutRef.current = window.setTimeout(() => setIdx(prev => prev + 1), 600)
        }
      }
    } else if (lettersInBoxes[i] === null) {
      // Wrong letter for this position
      setFeedback('incorrect')
      timeoutRef.current = window.setTimeout(() => setFeedback('neutral'), 800)
    }
  }

  if (!current) {
    return (
      <div style={{display:'grid', gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="button secondary" onClick={() => navigate('/themes?target=words')}>⬅ Atzera</button>
          <div className="level-indicator">Maila: {level}</div>
        </div>
        <div className="feedback">Gaia osatu duzu! 🏆</div>
      </div>
    )
  }

  const letterCase = options.letterCase
  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/themes?target=words')}>⬅ Atzera</button>
        <div className="level-indicator">Maila: {level}</div>
      </div>
      <div className="emoji" aria-label={`Emojia: ${current.word.toLowerCase()}`}>{current.emoji}</div>
      <div className="word-boxes" style={{margin:'8px 0 14px'}}>
        {current.word.split('').map((_,i) => (
          <WordBox key={i} value={lettersInBoxes[i]} onDrop={(l)=>onDrop(l,i)} />
        ))}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
        {pool.map((l, i) => (
          <LetterTile key={`${l}-${i}`} letter={formatLetter(l, letterCase)} dataLetter={l} onPick={(orig)=>onDrop(orig, lettersInBoxes.findIndex(v=>v===null))} />
        ))}
      </div>
      <div className={`feedback ${feedback}`} aria-live="polite">
        {feedback === 'correct' ? 'Oso ondo! 🎉' : feedback === 'incorrect' ? 'Saiatu berriro!' : 'Osatu hitza!'}
      </div>
    </div>
  )
}

function WordBox({ value, onDrop }: { value: string|null; onDrop: (letter: string)=>void }) {
  return (
    <div className="word-box" onDragOver={e=>e.preventDefault()} onDrop={e=>{ const l = e.dataTransfer.getData('text/plain'); if (l) onDrop(l) }}>
      {value}
    </div>
  )
}

function LetterTile({ letter, onPick, dataLetter }: { letter: string; onPick: (orig:string)=>void; dataLetter: string }) {
  return (
    <div className="letter-tile" draggable onDragStart={e=>e.dataTransfer.setData('text/plain', dataLetter)} onClick={()=>onPick(dataLetter)}>
      {letter}
    </div>
  )
}
