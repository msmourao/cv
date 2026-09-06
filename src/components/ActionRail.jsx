import { useEffect, useRef, useState } from 'react'
import { useCv } from '../context/CvContext.jsx'
import { useTts } from '../hooks/useTts.js'
import { printCv, shareEmail, shareLinkedIn, shareWhatsApp } from '../lib/share.js'
import { pick } from '../lib/i18n.js'

/**
 * Legacy-style floating action rail: PT/EN pill + circular icon buttons.
 */
export default function ActionRail() {
  const { cv, lang, setLang, theme, setTheme, template, setTemplate, t, themes, templates } =
    useCv()
  const { supported, speaking, toggle } = useTts(lang)
  const [shareOpen, setShareOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const rootRef = useRef(null)

  const colorsDisabled = template === 'ats-friendly' || template === 'star-wars'

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current?.contains(e.target)) {
        setShareOpen(false)
        setThemeOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const openShare = (e) => {
    e.stopPropagation()
    setShareOpen((v) => !v)
    setThemeOpen(false)
  }

  const openTheme = (e) => {
    e.stopPropagation()
    setThemeOpen((v) => !v)
    setShareOpen(false)
  }

  return (
    <div className="action-buttons no-print" ref={rootRef} aria-label={t('template', 'Actions')}>
      <div className="action-buttons-container">
        <div className="action-buttons-group">
          <div className="language-switch" role="group" aria-label={t('language', 'Language')}>
            <button
              type="button"
              className={`lang-btn${lang === 'pt' ? ' active' : ''}`}
              onClick={() => setLang('pt')}
              title="Português"
            >
              PT
            </button>
            <button
              type="button"
              className={`lang-btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => setLang('en')}
              title="English"
            >
              EN
            </button>
          </div>

          <div className="share-button-wrapper">
            <button
              type="button"
              className="share-button"
              onClick={openShare}
              title={t('share', 'Share')}
              aria-expanded={shareOpen}
            >
              <i className="bi bi-share" aria-hidden="true" />
            </button>
            <div className={`share-menu${shareOpen ? ' show' : ''}`} role="menu">
              <div className="share-menu-title">{t('share', 'Share')}</div>
              <button
                type="button"
                className="share-menu-item"
                role="menuitem"
                onClick={() => {
                  shareWhatsApp(cv, lang)
                  setShareOpen(false)
                }}
              >
                <i className="bi bi-whatsapp" aria-hidden="true" />
                <span>{t('whatsapp', 'WhatsApp')}</span>
              </button>
              <button
                type="button"
                className="share-menu-item"
                role="menuitem"
                onClick={() => {
                  shareEmail(cv, lang)
                  setShareOpen(false)
                }}
              >
                <i className="bi bi-envelope" aria-hidden="true" />
                <span>{t('emailShare', 'Email')}</span>
              </button>
              <button
                type="button"
                className="share-menu-item"
                role="menuitem"
                onClick={() => {
                  shareLinkedIn()
                  setShareOpen(false)
                }}
              >
                <i className="bi bi-linkedin" aria-hidden="true" />
                <span>{t('linkedinShare', 'LinkedIn')}</span>
              </button>
            </div>
          </div>

          <div className="theme-button-wrapper">
            <button
              type="button"
              className="theme-button"
              onClick={openTheme}
              title={t('theme', 'Theme')}
              aria-expanded={themeOpen}
            >
              <i className="bi bi-palette" aria-hidden="true" />
            </button>
            <div className={`theme-menu${themeOpen ? ' show' : ''}`} role="menu">
              <div className="theme-menu-section">
                <div className="theme-menu-section-title">
                  {lang === 'pt' ? 'Opções de Template' : 'Theme Options'}
                </div>
                <div className="template-options">
                  {templates.map((item) => {
                    const active = item.id === template
                    const isSw = item.id === 'star-wars'
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`template-option${active ? ' active' : ''}`}
                        onClick={() => {
                          setTemplate(item.id)
                          setThemeOpen(false)
                        }}
                      >
                        <span className={`template-name${isSw ? ' sw-template-name' : ''}`}>
                          {pick(lang, item.name)}
                        </span>
                        {active ? <i className="bi bi-check-circle template-check" aria-hidden="true" /> : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="theme-menu-divider" />

              <div className="theme-menu-section">
                <div className="theme-menu-section-title">
                  {lang === 'pt' ? 'Esquema de Cores' : 'Color Scheme'}
                </div>
                <div className="color-scheme-options">
                  {themes.map((item) => {
                    const active = item.id === theme
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`color-scheme-option${active ? ' active' : ''}${
                          colorsDisabled ? ' disabled' : ''
                        }`}
                        disabled={colorsDisabled}
                        onClick={() => {
                          if (colorsDisabled) return
                          setTheme(item.id)
                          setThemeOpen(false)
                        }}
                      >
                        <div className="color-scheme-preview" data-scheme={item.id}>
                          <div className="color-preview-color" />
                          <div className="color-preview-color" />
                          <div className="color-preview-color" />
                          <div className="color-preview-color" />
                        </div>
                        <span className="color-scheme-name">{pick(lang, item.name)}</span>
                        {active ? (
                          <i className="bi bi-check-circle color-scheme-check" aria-hidden="true" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="print-button"
            onClick={printCv}
            title={t('print', 'Print CV')}
          >
            <i className="bi bi-printer" aria-hidden="true" />
          </button>

          {supported && (
            <div className="tts-button-wrapper">
              <button
                type="button"
                className="tts-button"
                onClick={() => toggle(cv)}
                title={speaking ? t('stop', 'Stop') : t('listen', 'Listen')}
                aria-pressed={speaking}
                aria-label={speaking ? t('stop', 'Stop') : t('listen', 'Listen')}
              >
                <i
                  className={`bi ${speaking ? 'bi-stop-fill' : 'bi-volume-up-fill'}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
