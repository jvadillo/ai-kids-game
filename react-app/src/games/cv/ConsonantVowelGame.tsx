import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/dexie'
import { shuffleArray } from '../../utils/letters'

const CONSONANTS = ['P','M','K','L','D','B','S','G','T'] as const
const VOWELS = ['A','E','I','O','U'] as const

export default function ConsonantVowelGame() {
  const navigate = useNavigate()
  const [consonant, setConsonant] = useState<string | null>(null)
  const [vowelIdx, setVowelIdx] = useState(0)
  const [pool, setPool] = useState<{word:string; emoji:string; correct:boolean}[]>([])

  useEffect(() => {
    if (!consonant) return
    const combo = consonant + VOWELS[vowelIdx];
    (async () => {
      const all = await db.words.toArray()
      const matching = all.filter(w => w.word.toUpperCase().startsWith(combo))
      const distractors = all.filter(w => !w.word.toUpperCase().startsWith(combo))
      const choices = shuffleArray([...
        matching.slice(0,4).map(w => ({word:w.word, emoji:w.emoji, correct:true})),
        ...distractors.slice(0,4).map(w => ({word:w.word, emoji:w.emoji, correct:false}))
      ])
      setPool(choices)
    })()
  }, [consonant, vowelIdx])

  function onPick(i: number) {
    setPool(prev => prev.map((p,idx) => idx===i ? {...p, picked:true} as any : p))
  }

  const remainingCorrect = pool.filter(x => x.correct && !(x as any).picked).length
  const doneVowel = remainingCorrect === 0 && pool.length>0

  if (!consonant) {
    return (
      <div style={{display:'grid', gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="button secondary" onClick={() => navigate('/')}>⬅ Atzera</button>
          <h2 style={{margin:0}}>Aukeratu konsonante bat</h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10}}>
          {CONSONANTS.map(c => (
            <button key={c} className="button" onClick={()=>setConsonant(c)} aria-label={`Konsonante ${c}`}>{c}</button>
          ))}
        </div>
      </div>
    )
  }

  const combo = consonant + VOWELS[vowelIdx]
  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => {setConsonant(null); setVowelIdx(0)}}>⬅ Atzera</button>
        <div className="level-indicator">Konbinazioa: {combo}</div>
      </div>
      <div className="feedback" aria-live="polite">{doneVowel ? 'Zorionak! Hurrengoa.' : ''}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
        {pool.map((item,i)=> (
          <button key={i} className="button" aria-pressed={(item as any).picked?true:false} onClick={()=>onPick(i)}>
            <span style={{fontSize:28, marginRight:6}}>{item.emoji}</span> {item.word.toUpperCase()}
          </button>
        ))}
      </div>
      {doneVowel && (
        <button className="button" onClick={()=>{
          if (vowelIdx < VOWELS.length-1) setVowelIdx(v => v+1)
          else { setConsonant(null); setVowelIdx(0) }
        }}>Hurrengoa</button>
      )}
    </div>
  )
}
