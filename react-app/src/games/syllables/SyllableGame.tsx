import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { db } from '../../db/dexie'
import { shuffleArray } from '../../utils/letters'

const WORDS_PER_LEVEL = 3

export default function SyllableGame() {
  const [sp] = useSearchParams()
  const theme = sp.get('theme') || 'animaliak'
  const navigate = useNavigate()

  const [words, setWords] = useState<{word:string; emoji:string; syllablesCount:number; syllableParts?: string[]}[]>([])
  const [idx, setIdx] = useState(0)
  const [level, setLevel] = useState(1)
  const [correctInLevel, setCorrectInLevel] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [feedback, setFeedback] = useState<'neutral'|'correct'|'incorrect'>('neutral')
  const timeoutRef = useRef<number | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => { (async () => {
    const arr = await db.words.where('themeKey').equals(theme as any).toArray()
    const shuffled = shuffleArray(arr)
    setWords(shuffled.map(w => ({ word: w.word, emoji: w.emoji, syllablesCount: w.syllablesCount, syllableParts: w.syllableParts })))
    setIdx(0)
    setLevel(1)
    setCorrectInLevel(0)
  })() }, [theme])

  const current = words[idx]

  // Reset selection and feedback when word changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setSelected(null)
    setFeedback('neutral')
  }, [idx])

  function onPick(n: number) {
    if (!current) return
    setSelected(n)
    
    if (n === current.syllablesCount) {
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
    } else {
      setFeedback('incorrect')
      timeoutRef.current = window.setTimeout(() => {
        setSelected(null)
        setFeedback('neutral')
      }, 800)
    }
  }

  if (!current) {
    return (
      <div style={{display:'grid', gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="button secondary" onClick={() => navigate('/themes?target=syllables')}>⬅ Atzera</button>
          <div className="level-indicator">Maila: {level}</div>
        </div>
        <div className="feedback">Gaia osatu duzu! 🏆</div>
      </div>
    )
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/themes?target=syllables')}>⬅ Atzera</button>
        <div className="level-indicator">Maila: {level}</div>
      </div>
      <div className="emoji" aria-label={`Emojia: ${current.word}`}>{current.emoji}</div>
      <h3 style={{textAlign:'center', margin:'8px 0 14px'}}>
        {level === 1 && current.syllableParts ? (
          <span style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:4}}>
            {current.syllableParts.map((s,i)=><span key={i} style={{border:'2px solid var(--accent-color)', borderRadius:'6px', padding:'4px 8px', backgroundColor:'rgba(103, 58, 183, 0.1)'}}>{s.toUpperCase()}</span>)}
          </span>
        ) : (
          <span>{current.word.toUpperCase()}</span>
        )}
      </h3>
      <div className="syllable-buttons" style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        {[1,2,3,4].map(n => (
          <button 
            key={n} 
            className={`button ${selected === n ? (feedback === 'correct' ? 'correct' : feedback === 'incorrect' ? 'incorrect' : 'selected') : ''}`}
            style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 14px',fontSize:'1em', minWidth:'60px'}}
            onClick={()=>onPick(n)}
            disabled={selected !== null}
            aria-pressed={selected === n}
          >
            <div style={{fontSize:'1.4em'}}>{'👏'.repeat(n)}</div>
            <div style={{fontWeight:900,marginTop:4}}>{n}</div>
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback}`} aria-live="polite">
        {feedback === 'correct' ? 'Oso ondo! 🎉' : feedback === 'incorrect' ? 'Saiatu berriro!' : 'Zenbat silaba ditu?'}
      </div>
    </div>
  )
}
