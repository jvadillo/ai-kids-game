import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EMOJIS = ['🍎','⚽','🧸','⭐','🚗','🎈','🎁','🐶','🐱','🚀','🍓','🦋','🌻','🍦','🎸']

export default function NumberGame() {
  const navigate = useNavigate()
  const [correct, setCorrect] = useState(1)
  const [emoji, setEmoji] = useState('🍎')
  const [disabled, setDisabled] = useState(false)

  useEffect(() => { nextRound() }, [])

  function nextRound() {
    setDisabled(false)
    setCorrect(1 + Math.floor(Math.random()*10))
    setEmoji(EMOJIS[Math.floor(Math.random()*EMOJIS.length)])
  }

  function pick(n: number) {
    if (disabled) return
    if (n === correct) {
      setDisabled(true)
      setTimeout(() => nextRound(), 700)
    } else {
      // brief shake; kept simple
    }
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="button secondary" onClick={() => navigate('/')}>⬅ Atzera</button>
        <h2 style={{margin:0}}>Zenbat daude?</h2>
      </div>
      <div role="img" aria-label="Kontatzeko emojiak" style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',fontSize:'40px',minHeight:100}}>
        {Array.from({length: correct}).map((_,i)=>(<span key={i}>{emoji}</span>))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10, maxWidth:400, margin:'0 auto'}}>
        {Array.from({length:10}).map((_,i)=>{
          const n = i+1
          return <button key={n} className="button" aria-label={`Aukeratu ${n}`} onClick={()=>pick(n)}>{n}</button>
        })}
      </div>
      <div className="feedback">Aukeratu zenbaki zuzena!</div>
    </div>
  )
}
