import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{display:'grid', gap:16}}>
      <h2 style={{margin:'6px 0 4px'}}>Aukeratu joko bat</h2>
      <div className="grid">
        <GameCard to="/themes?target=words" emoji="🔤" label="Hitzak" />
        <GameCard to="/themes?target=syllables" emoji="👏" label="Silabak" />
        <GameCard to="/numbers" emoji="🧮" label="Zenbakiak" />
        <GameCard to="/themes?target=syllable-sort" emoji="🧩" label="Silabak sailkatu" />
        <GameCard to="/vowels" emoji="🅰️" label="Bokalak" />
        <GameCard to="/vowel-sort" emoji="👋" label="Bokalak sailkatu" />
        <GameCard to="/cv" emoji="🙌" label="Silabak ikasten" />
        <GameCard to="/themes?target=emoji-syllables" emoji="🔎" label="Emoji + Silabak" />
        <GameCard to="/emoji-vowel-match" emoji="🎯" label="Emoji + Bokal" />
      </div>
    </div>
  )
}

function GameCard({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link to={to} className="card" style={{textDecoration:'none', color:'inherit'}}>
      <div className="emoji">{emoji}</div>
      <div style={{fontWeight:800}}>{label}</div>
    </Link>
  )
}
