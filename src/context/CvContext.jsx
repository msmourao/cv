import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { pick } from '../lib/i18n.js'

const STORAGE = {
  lang: 'cv-lang',
  theme: 'cv-color-scheme',
  template: 'cv-template',
}

export const THEMES = [
  { id: 'graphite-redline', name: { pt: 'Graphite Redline', en: 'Graphite Redline' } },
  { id: 'pastel-green', name: { pt: 'Pastel Green', en: 'Pastel Green' } },
  { id: 'dark-corporate-blue', name: { pt: 'Dark Corporate Blue', en: 'Dark Corporate Blue' } },
  { id: 'dark', name: { pt: 'Escuro', en: 'Dark' } },
]

export const TEMPLATES = [
  { id: 'better-view', name: { pt: 'Padrão', en: 'Default' } },
  { id: 'ats-friendly', name: { pt: 'ATS-friendly', en: 'ATS-friendly' } },
  { id: 'star-wars', name: { pt: 'Star Wars', en: 'Star Wars' } },
]

const CvContext = createContext(null)

function readInitialTheme() {
  const saved = localStorage.getItem(STORAGE.theme)
  if (saved && THEMES.some((t) => t.id === saved)) return saved
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'graphite-redline'
}

/**
 * Query-string deep link for templates:
 *   ?template=star-wars | better-view | ats-friendly
 *   ?sw=1 | ?starwars=1 | ?star-wars=1  → Star Wars
 */
export function readTemplateFromQuery() {
  try {
    const params = new URLSearchParams(window.location.search)
    const raw =
      params.get('template') ||
      params.get('view') ||
      params.get('mode') ||
      ''
    const normalized = String(raw).trim().toLowerCase()

    if (
      normalized === 'star-wars' ||
      normalized === 'starwars' ||
      normalized === 'sw'
    ) {
      return 'star-wars'
    }
    if (
      normalized === 'ats-friendly' ||
      normalized === 'ats' ||
      normalized === 'atsfriendly'
    ) {
      return 'ats-friendly'
    }
    if (
      normalized === 'better-view' ||
      normalized === 'better' ||
      normalized === 'default'
    ) {
      return 'better-view'
    }

    const swFlag = params.get('sw') || params.get('starwars') || params.get('star-wars')
    if (swFlag != null && !['0', 'false', 'no', 'off'].includes(String(swFlag).toLowerCase())) {
      return 'star-wars'
    }
  } catch {
    /* ignore */
  }
  return null
}

function readInitialTemplate() {
  const fromQuery = readTemplateFromQuery()
  if (fromQuery) return fromQuery

  const saved = localStorage.getItem(STORAGE.template)
  // Never auto-load Star Wars from storage alone (legacy behavior)
  if (saved === 'star-wars') return 'better-view'
  if (saved && TEMPLATES.some((t) => t.id === saved)) return saved
  return 'better-view'
}

function readInitialLang(defaultLang) {
  try {
    const params = new URLSearchParams(window.location.search)
    const q = (params.get('lang') || params.get('language') || '').toLowerCase()
    if (q === 'en' || q === 'pt') return q
  } catch {
    /* ignore */
  }
  const saved = localStorage.getItem(STORAGE.lang)
  if (saved === 'pt' || saved === 'en') return saved
  return defaultLang === 'en' ? 'en' : 'pt'
}

export function CvProvider({ cv, children }) {
  const defaultLang = cv?.meta?.defaultLang || 'pt'
  const [lang, setLangState] = useState(() => readInitialLang(defaultLang))
  const [theme, setThemeState] = useState(readInitialTheme)
  const [template, setTemplateState] = useState(readInitialTemplate)

  const setLang = useCallback((next) => {
    const value = next === 'en' ? 'en' : 'pt'
    setLangState(value)
    localStorage.setItem(STORAGE.lang, value)
  }, [])

  const setTheme = useCallback((next) => {
    if (!THEMES.some((t) => t.id === next)) return
    setThemeState(next)
    localStorage.setItem(STORAGE.theme, next)
  }, [])

  const setTemplate = useCallback((next) => {
    if (!TEMPLATES.some((t) => t.id === next)) return
    setTemplateState(next)
    // Persist non-SW choices; SW from query should not stick forever via storage
    // (storage of star-wars is ignored on cold load unless query is present)
    localStorage.setItem(STORAGE.template, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-template', template)
    document.body.setAttribute('data-theme', theme)
    document.body.setAttribute('data-template', template)
    document.body.classList.toggle('ats-friendly-template', template === 'ats-friendly')
    document.body.classList.toggle('star-wars-template', template === 'star-wars')
    document.body.classList.toggle('better-view-template', template === 'better-view')
  }, [lang, theme, template])

  useEffect(() => {
    const seo = pick(lang, cv?.ui?.seo) || {}
    if (seo.title) document.title = seo.title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    if (seo.description) meta.content = seo.description
  }, [cv, lang])

  const t = useCallback(
    (key, fallback = '') => {
      const labels = pick(lang, cv?.ui?.labels) || {}
      return labels[key] ?? fallback
    },
    [cv, lang]
  )

  const value = useMemo(
    () => ({
      cv,
      lang,
      setLang,
      theme,
      setTheme,
      template,
      setTemplate,
      t,
      themes: THEMES,
      templates: TEMPLATES,
    }),
    [cv, lang, setLang, theme, setTheme, template, setTemplate, t]
  )

  return <CvContext.Provider value={value}>{children}</CvContext.Provider>
}

export function useCv() {
  const ctx = useContext(CvContext)
  if (!ctx) throw new Error('useCv must be used within CvProvider')
  return ctx
}
