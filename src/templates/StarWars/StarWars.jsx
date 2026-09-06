import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStarWarsCrawl } from './useStarWarsCrawl.js'
import { useStarWarsIntro } from './useStarWarsIntro.js'
import { hasSeenIntroRecently, resolveIntroSeenTtlMs } from '../../lib/swIntroStorage.js'
import '../../styles/templates/star-wars.css'

function L(value, lang) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[lang] ?? value.pt ?? value.en ?? ''
}

function label(t, key, fallback = '') {
  if (typeof t === 'function') {
    const v = t(key)
    return v != null && v !== '' ? v : fallback
  }
  if (t && typeof t === 'object' && t[key] != null) return t[key]
  return fallback
}

function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(path).replace(/^\.\//, '').replace(/^\//, '')}`
}

function CrawlContent({ cv, lang, t }) {
  const sections = cv?.sections || {}
  const seeMore = lang === 'pt' ? 'Veja mais: ' : 'See more: '
  const sw = cv?.starWars || {}
  const crawlSource = sw.crawlSource === 'cv' ? 'cv' : 'custom'
  const custom = L(sw.customCrawl, lang)

  if (crawlSource === 'custom' && custom && typeof custom === 'object') {
    const paragraphs = Array.isArray(custom.paragraphs) ? custom.paragraphs.filter(Boolean) : []
    const blocks = Array.isArray(custom.blocks) ? custom.blocks : []
    return (
      <>
        {(custom.eyebrow || custom.episode) && (
          <div className="sw-crawl-section" data-section="custom-eyebrow">
            <p className="sw-crawl-eyebrow">{custom.eyebrow || custom.episode}</p>
          </div>
        )}
        {custom.title && (
          <div className="sw-crawl-section" data-section="custom-title">
            <h3>{String(custom.title).toUpperCase()}</h3>
          </div>
        )}
        {custom.subtitle && (
          <div className="sw-crawl-section" data-section="custom-subtitle">
            <p>
              <strong>{custom.subtitle}</strong>
            </p>
          </div>
        )}
        {paragraphs.map((p, i) => (
          <div className="sw-crawl-section" data-section={`custom-p-${i}`} key={`p-${i}`}>
            <p>{p}</p>
          </div>
        ))}
        {blocks.map((block, i) => {
          const heading = typeof block === 'object' ? block.heading || block.title : null
          const body = typeof block === 'object' ? block.body || block.text : String(block)
          const list = typeof block === 'object' && Array.isArray(block.items) ? block.items : null
          return (
            <div className="sw-crawl-section" data-section={`custom-block-${i}`} key={`b-${i}`}>
              {heading ? <h3>{String(heading).toUpperCase()}</h3> : null}
              {body ? <p>{body}</p> : null}
              {list ? (
                <ul>
                  {list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        })}
        {custom.closing && (
          <div className="sw-crawl-section" data-section="custom-closing">
            <p>{custom.closing}</p>
          </div>
        )}
        {custom.url && (
          <div className="sw-crawl-section" data-section="custom-url">
            <span className="project-link">
              {seeMore}
              <a href={custom.url} target="_blank" rel="noopener noreferrer">
                {custom.url}
              </a>
            </span>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {sections.about && (
        <div className="sw-crawl-section" data-section="summary">
          <p>{L(sections.about, lang)}</p>
        </div>
      )}

      {Array.isArray(sections.achievements) && sections.achievements.length > 0 && (
        <div className="sw-crawl-section" data-section="achievements">
          <h3>{label(t, 'achievements', 'Key Achievements').toUpperCase()}</h3>
          <ul>
            {sections.achievements.map((item) => {
              const title = L(item.title, lang)
              const desc = L(item.summary, lang)
              if (!title && !desc) return null
              return (
                <li key={item.id || title}>
                  {title && desc ? (
                    <>
                      <strong>{title}</strong>: {desc}
                    </>
                  ) : (
                    title || desc
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {sections.skills?.technical?.length > 0 && (
        <div className="sw-crawl-section" data-section="skills">
          <h3>{label(t, 'skills', 'Skills').toUpperCase()}</h3>
          <ul>
            {sections.skills.technical.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(sections.experience) && sections.experience.length > 0 && (
        <div className="sw-crawl-section" data-section="experience">
          <h3>
            {label(t, 'professionalExperience', label(t, 'experience', 'Work Experience')).toUpperCase()}
          </h3>
          {sections.experience.map((job, index) => {
            const jobTitle = L(job.title, lang)
            const jobCompany = L(job.company, lang)
            const jobPeriod = L(job.period, lang)
            const jobSummary = L(job.summary, lang)
            return (
              <div key={job.id || index}>
                <p>
                  <strong>{jobTitle}</strong> - {jobCompany}
                </p>
                {jobPeriod ? <p>{jobPeriod}</p> : null}
                {jobSummary ? <p>{jobSummary}</p> : null}
                {job.url ? (
                  <span className="project-link">
                    {seeMore}
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {job.url}
                    </a>
                  </span>
                ) : null}
                {index < sections.experience.length - 1 ? <br /> : null}
              </div>
            )
          })}
        </div>
      )}

      {Array.isArray(sections.education) && sections.education.length > 0 && (
        <div className="sw-crawl-section" data-section="education">
          <h3>{label(t, 'education', 'Education').toUpperCase()}</h3>
          <ul>
            {sections.education.map((edu) => {
              const title = L(edu.degree || edu.title, lang)
              const institution = L(edu.institution, lang)
              const period = L(edu.period, lang)
              const note = L(edu.note, lang)
              const text = `${title} - ${institution} (${period})${note ? ` ${note}` : ''}`
              return <li key={edu.id || text}>{text}</li>
            })}
          </ul>
        </div>
      )}

      {Array.isArray(sections.certifications) && sections.certifications.length > 0 && (
        <div className="sw-crawl-section" data-section="certifications">
          <h3>{label(t, 'certifications', 'Certifications').toUpperCase()}</h3>
          {sections.certifications.map((cert) => (
            <div key={cert.id || L(cert.name, lang)} className="certification-item">
              <div className="certification-name">{L(cert.name, lang)}</div>
              {cert.issuer ? (
                <div className="certification-issuer">{L(cert.issuer, lang)}</div>
              ) : null}
              {cert.period || cert.year ? (
                <div className="certification-year">{L(cert.period, lang) || cert.year}</div>
              ) : null}
              {cert.summary ? (
                <div className="certification-description">{L(cert.summary, lang)}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {sections.skills?.languages?.length > 0 && (
        <div className="sw-crawl-section" data-section="languages">
          <h3>{label(t, 'languages', 'Languages').toUpperCase()}</h3>
          <ul>
            {sections.skills.languages.map((langItem) => {
              const name = L(langItem.name, lang)
              const level = L(langItem.level, lang)
              return (
                <li key={name}>
                  {name} - {level}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {Array.isArray(sections.projects) && sections.projects.length > 0 && (
        <div className="sw-crawl-section" data-section="projects">
          <h3>{label(t, 'projects', 'Projects').toUpperCase()}</h3>
          <ul>
            {sections.projects.map((project) => {
              const name = L(project.name, lang)
              const desc = L(project.summary, lang)
              const text = name && desc ? `${name}: ${desc}` : name || desc
              if (!text) return null
              return (
                <li key={project.id || name}>
                  {text}
                  {project.url ? (
                    <span className="project-link">
                      {' '}
                      {seeMore}
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        {project.url}
                      </a>
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {(() => {
        const hobbies = sections.hobbies
        const list = Array.isArray(hobbies)
          ? hobbies.map((h) => L(h, lang)).filter(Boolean)
          : Array.isArray(hobbies?.[lang])
            ? hobbies[lang]
            : []
        if (!list.length) return null
        return (
          <div className="sw-crawl-section" data-section="hobbies">
            <h3>{label(t, 'hobbies', 'Hobbies').toUpperCase()}</h3>
            <ul>
              {list.map((hobby) => (
                <li key={hobby}>{hobby}</li>
              ))}
            </ul>
          </div>
        )
      })()}
    </>
  )
}

/**
 * Star Wars CV template — intro + crawl choreography preserved from legacy.
 * @param {{ cv: object, lang: string, t: Function|object, onExitTemplate?: () => void }} props
 */
export default function StarWars({ cv, lang = 'pt', t, onExitTemplate }) {
  const crawlRef = useRef(null)
  const audioRef = useRef(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [logoParts, setLogoParts] = useState([])
  const audioUrl = cv?.starWars?.audioUrl ||
    'https://soundfxcenter.com/movies/star-wars/8d82b5_Star_Wars_Main_Theme_Song.mp3'
  const introTtlMs = resolveIntroSeenTtlMs(cv?.starWars)

  const userName = cv?.personal?.name || 'MARCELO MOURÃO'
  const userTagline = L(cv?.personal?.tagline, lang)
  const photoSrc = assetUrl(cv?.personal?.photo || 'avatar.png')
  const lightsaberSrc = assetUrl('lightsaber.png')

  const [introActive, setIntroActive] = useState(
    () => !hasSeenIntroRecently(introTtlMs)
  )

  const { startAuto, stopCrawl, stateRef } = useStarWarsCrawl(crawlRef)

  const setMusicUiPlaying = useCallback((playing) => {
    setMusicPlaying(!!playing)
  }, [])

  const playMusic = useCallback((force = false) => {
    const audio = audioRef.current || document.getElementById('sw-audio')
    if (!audio) return
    if (!document.body.classList.contains('star-wars-template')) return

    const isActuallyPlaying =
      audio && !audio.paused && audio.currentTime > 0 && audio.readyState > 2
    if (isActuallyPlaying && !force) return

    const source = audio.querySelector('source')
    const hasSource = audio.src || (source && source.src)
    if (!hasSource) return

    const isPaused = audio.paused && audio.currentTime > 0

    const attemptPlay = () => {
      if (!isPaused) {
        if (force || audio.currentTime === 0) {
          audio.currentTime = 0
        }
      }
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setMusicPlaying(true)
            window.swMusicIsPlaying = true
          })
          .catch(() => {
            /* autoplay may be blocked */
          })
      } else {
        setMusicPlaying(true)
        window.swMusicIsPlaying = true
      }
    }

    if (!audio.src && source?.src) {
      audio.src = source.src
      audio.addEventListener('canplaythrough', () => attemptPlay(), { once: true })
      audio.load()
      return
    }
    attemptPlay()
  }, [])

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current || document.getElementById('sw-audio')
    if (!audio) return
    audio.pause()
    setMusicPlaying(false)
    window.swMusicIsPlaying = false
  }, [])

  const stopMusic = useCallback(() => {
    const audio = audioRef.current || document.getElementById('sw-audio')
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setMusicPlaying(false)
    window.swMusicIsPlaying = false
  }, [])

  const onVolume = useCallback((value) => {
    const v = Number(value)
    setVolume(v)
    const audio = audioRef.current || document.getElementById('sw-audio')
    if (audio) audio.volume = v / 100
  }, [])

  const { skipIntro, repeatIntro } = useStarWarsIntro({
    lang,
    userName,
    startCrawl: startAuto,
    playMusic,
    stopMusic,
    setMusicUiPlaying,
    setLogoParts,
    crawlStateRef: stateRef,
    setIntroActive,
    starWarsConfig: cv?.starWars,
  })

  useEffect(() => {
    document.body.classList.add('star-wars-template')
    const audio = audioRef.current
    if (audio) audio.volume = volume / 100

    window.swPlayMusic = playMusic
    window.swPauseMusic = pauseMusic
    window.swStopMusic = stopMusic
    window.swRepeatIntro = () => {
      setIntroActive(true)
      repeatIntro()
    }

    return () => {
      document.body.classList.remove('star-wars-template')
      stopCrawl()
      stopMusic()
      delete window.swPlayMusic
      delete window.swPauseMusic
      delete window.swStopMusic
      delete window.swRepeatIntro
      window.swMusicIsPlaying = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setIntroActive(!hasSeenIntroRecently(introTtlMs))
  }, [introTtlMs])

  const handleSkip = useCallback(async () => {
    setIntroActive(false)
    await skipIntro()
  }, [skipIntro])

  const handleRepeat = useCallback(async () => {
    setIntroActive(true)
    await repeatIntro()
  }, [repeatIntro])

  const skipLabel = useMemo(
    () => label(t, 'skipIntro', lang === 'pt' ? 'Pular' : 'Skip'),
    [t, lang]
  )
  const repeatLabel = useMemo(
    () => label(t, 'repeatIntro', lang === 'pt' ? 'Repetir intro' : 'Repeat Intro'),
    [t, lang]
  )

  return (
    <div className="star-wars-root">
      <div
        id="template-loading-overlay"
        className={`template-loading-overlay${introActive ? '' : ' hidden'}`}
      >
        <div id="sw-intro-text" className="sw-intro-text" />
        {introActive ? (
          <button
            type="button"
            className="sw-skip-intro-btn"
            id="sw-skip-intro"
            onClick={handleSkip}
          >
            {skipLabel}
          </button>
        ) : null}
      </div>

      <div
        id="sw-logo-animation"
        className="sw-logo-animation"
        aria-hidden="true"
      >
        {logoParts.map((part) => (
          <div key={part} style={{ lineHeight: 1, margin: 0, padding: 0 }}>
            {part}
          </div>
        ))}
      </div>

      <div className="star-wars-container">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />

        <div className="sw-header" style={{ opacity: 0, visibility: 'hidden' }}>
          <div
            className="sw-photo-container"
            style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
          >
            <img
              id="profile-image"
              className="sw-profile-image"
              src={photoSrc}
              alt={userName}
              style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
            />
            <img
              src={lightsaberSrc}
              alt=""
              className="sw-lightsaber"
              style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
            />
          </div>
          <div className="sw-name-section">
            <h1 className="sw-name" id="name">
              {String(userName).toUpperCase()}
            </h1>
            <div className="sw-tagline" id="tagline">
              {userTagline}
            </div>
          </div>
        </div>

        <div
          className="sw-crawl-container"
          id="sw-scene"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <div
            className="sw-crawl-fade-top"
            id="sw-crawl-fade-top"
            aria-hidden="true"
          />
          <div className="sw-tilt" id="sw-tilt">
            <div className="sw-viewport" id="sw-viewport">
              <div
                className="sw-crawl"
                id="sw-crawl"
                ref={crawlRef}
                style={{ visibility: 'hidden', opacity: 0 }}
              >
                <CrawlContent cv={cv} lang={lang} t={t} />
              </div>
            </div>
          </div>
        </div>

        <div className="sw-exit-actions" style={{ opacity: 0, visibility: 'hidden' }}>
          <div className="action-buttons-container">
            {typeof onExitTemplate === 'function' ? (
              <button
                type="button"
                className="theme-button"
                onClick={onExitTemplate}
                title={lang === 'pt' ? 'Sair do tema' : 'Exit template'}
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <div className="sw-music-player" id="sw-music-player">
          <audio id="sw-audio" ref={audioRef} preload="auto" loop>
            <source src={audioUrl} type="audio/mpeg" />
          </audio>

          <button
            type="button"
            className="sw-player-btn sw-player-btn-float"
            id="sw-play"
            onClick={() => playMusic(true)}
            title="Play"
            style={{ display: musicPlaying ? 'none' : 'flex' }}
          >
            <span aria-hidden="true">▶</span>
          </button>
          <button
            type="button"
            className="sw-player-btn sw-player-btn-float"
            id="sw-pause"
            onClick={pauseMusic}
            title="Pause"
            style={{ display: musicPlaying ? 'flex' : 'none' }}
          >
            <span aria-hidden="true">❚❚</span>
          </button>
          <button
            type="button"
            className="sw-player-btn sw-player-btn-float"
            id="sw-stop"
            onClick={stopMusic}
            title="Stop"
            style={{ display: 'flex' }}
          >
            <span aria-hidden="true">■</span>
          </button>

          <div className="sw-volume-container">
            <div className="sw-volume-control">
              <input
                type="range"
                id="sw-volume"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolume(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="sw-repeat-intro-btn"
            id="sw-repeat-intro"
            onClick={handleRepeat}
            title={repeatLabel}
          >
            <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    </div>
  )
}
