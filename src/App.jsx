import { useEffect } from 'react'
import { useCv } from './context/CvContext.jsx'
import ActionRail from './components/ActionRail.jsx'
import BetterView from './templates/BetterView/BetterView.jsx'
import AtsDocument from './templates/AtsDocument/AtsDocument.jsx'
import StarWars from './templates/StarWars/StarWars.jsx'
import { expandJobDetailsForPrint } from './lib/share.js'

export default function App() {
  const { cv, lang, template, t, setTemplate } = useCv()

  // Ctrl+P / browser print also expands “Veja mais”
  useEffect(() => {
    let restore = null
    const onBefore = () => {
      restore = expandJobDetailsForPrint()
    }
    const onAfter = () => {
      if (typeof restore === 'function') restore()
      restore = null
    }
    window.addEventListener('beforeprint', onBefore)
    window.addEventListener('afterprint', onAfter)
    return () => {
      window.removeEventListener('beforeprint', onBefore)
      window.removeEventListener('afterprint', onAfter)
    }
  }, [])

  return (
    <div className="app-shell" data-template={template}>
      <ActionRail />

      <main className="app-main" id="cv-root">
        {template === 'better-view' && <BetterView cv={cv} lang={lang} />}
        {template === 'ats-friendly' && <AtsDocument cv={cv} lang={lang} />}
        {template === 'star-wars' && (
          <StarWars
            cv={cv}
            lang={lang}
            t={t}
            onExitTemplate={() => setTemplate('better-view')}
          />
        )}
      </main>
    </div>
  )
}
