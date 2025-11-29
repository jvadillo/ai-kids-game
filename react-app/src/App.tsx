import { Routes, Route, Link } from 'react-router-dom'
import { OptionsProvider, useOptions } from './state/OptionsContext'
import Home from './pages/Home'
import ThemeSelect from './pages/ThemeSelect'
import WordGame from './games/words/WordGame'
import SyllableGame from './games/syllables/SyllableGame'
import NumberGame from './games/numbers/NumberGame'
import VowelGame from './games/vowels/VowelGame'
import VowelSortGame from './games/vowelSort/VowelSortGame'
import SyllableSortGame from './games/syllableSort/SyllableSortGame'
import ConsonantVowelGame from './games/cv/ConsonantVowelGame'
import EmojiSyllableGame from './games/emojiSyllables/EmojiSyllableGame'
import EmojiVowelMatchGame from './games/emojiVowelMatch/EmojiVowelMatchGame'

function Frame() {
  const { state } = useOptions()
  return (
    <div className={state.fontStyle === 'child' ? 'container font-child' : 'container'}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <Link to="/" style={{textDecoration:'none'}}><h1 style={{margin:0}}>Hitzak eta Zenbakiak</h1></Link>
        <div className="level-indicator" title="Aukerak" onClick={() => (document.getElementById('options-dialog') as HTMLDialogElement)?.showModal()}>⚙️</div>
      </header>
      <div className="screen">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/themes" element={<ThemeSelect/>} />
          <Route path="/words" element={<WordGame/>} />
          <Route path="/syllables" element={<SyllableGame/>} />
          <Route path="/numbers" element={<NumberGame/>} />
          <Route path="/vowels" element={<VowelGame/>} />
          <Route path="/vowel-sort" element={<VowelSortGame/>} />
          <Route path="/syllable-sort" element={<SyllableSortGame/>} />
          <Route path="/cv" element={<ConsonantVowelGame/>} />
          <Route path="/emoji-syllables" element={<EmojiSyllableGame/>} />
          <Route path="/emoji-vowel-match" element={<EmojiVowelMatchGame/>} />
          <Route path="*" element={<Home/>} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <OptionsProvider>
      <Frame />
    </OptionsProvider>
  )
}
