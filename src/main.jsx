import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { assetUrl } from './lib/i18n.js'
import { CvProvider } from './context/CvContext.jsx'
import App from './App.jsx'
import './styles/index.css'
import './styles/templates/star-wars.css'

function Boot() {
  const [cv, setCv] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(assetUrl('data/cv.json'))
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load cv.json (${r.status})`)
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setCv(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="boot-error" role="alert">
        <h1>CV failed to load</h1>
        <p>{error}</p>
        <p>
          Edit <code>public/data/cv.json</code> and restart <code>npm run dev</code>.
        </p>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="boot-loading" aria-busy="true">
        Loading…
      </div>
    )
  }

  return (
    <CvProvider cv={cv}>
      <App />
    </CvProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Boot />
  </StrictMode>
)
