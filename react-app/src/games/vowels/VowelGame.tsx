import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/dexie'
import { shuffleArray } from '../../utils/letters'

const VOWELS = ['A','E','I','O','U'] as const

export default function VowelGame() {
  const navigate = useNavigate()
  const [vowelIdx, setVowelIdx] = useState(0)
  const [pool, setPool] = useState<{word:string; emoji:string; correct:boolean}[]>([])
  const vowel = VOWELS[vowelIdx]

  useEffect(() => { (async () => {
    const all = await db.words.toArray()
    const words = all.map(w => ({ word: w.word, emoji: w.emoji }))
    const matching = words.filter(w => w.word[0].toUpperCase() === vowel)
    const distractors = words.filter(w => w.word[0].toUpperCase() !== vowel)
    const choices = shuffleArray([...
      matching.slice(0,5).map(w => ({...w, correct:true})),
      ...distractors.slice(0,5).map(w => ({...w, correct:false}))
    ])
    setPool(choices)
  })() }, [vowel])

  function onPick(i: number) {
    setPool(prev => prev.map((p,idx) => idx===i ? {...p, picked:true} as any : p))
  }

  const remainingCorrect = pool.filter(x => x.correct && !(x as any).picked).length
  const doneVowel = remainingCorrect === 0 && pool.length>0

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/')}>⬅ Atzera</button>
        <div className="level-indicator">Aukeratu: {vowel}</div>
      </div>
      <div className="feedback" aria-live="polite">{doneVowel ? 'Oso ondo! Hurrengoa...' : ''}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
        {pool.map((item,i)=> (
          <button key={i} className="button" aria-pressed={(item as any).picked?true:false} onClick={()=>onPick(i)}>
            <span style={{fontSize:28, marginRight:6}}>{item.emoji}</span> {item.word.toUpperCase()}
          </button>
        ))}
      </div>
      {doneVowel && (
        <button className="button" onClick={()=>setVowelIdx(v => v < VOWELS.length-1 ? v+1 : v)}>Hurrengoa</button>
      )}
    </div>
  )
}
