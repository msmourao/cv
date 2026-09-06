import { useCallback, useEffect, useRef } from 'react'
import {
  clearIntroSeen,
  hasSeenIntroRecently,
  markIntroSeen,
  resolveIntroSeenTtlMs,
  SW_INTRO_SEEN_KEY,
} from '../../lib/swIntroStorage.js'

/** Exact legacy timings from themes.js showStarWarsIntro / startStarWarsNormal */
export const SW_INTRO_HOLD_MS = 3000
export const SW_INTRO_FADE_MS = 2000
export const SW_LOGO_FADE_MS = 9000
export const SW_CRAWL_AFTER_LOGO_MS = 3000
export const SW_HEADER_AFTER_LOGO_MS = 9000
export { SW_INTRO_SEEN_KEY }

const INTRO_TEXTS = {
  pt: 'Há muito tempo, em uma galáxia muito, muito distante...',
  en: 'A long time ago, in a galaxy far, far away...',
}

/**
 * Intro sequence ported from legacy themes.js
 * (showStarWarsIntro + startStarWarsNormal + Repeat Intro gate).
 *
 * @param {object} options
 * @param {string} options.lang
 * @param {string} options.userName
 * @param {() => void} options.startCrawl
 * @param {(force?: boolean) => void} options.playMusic
 * @param {() => void} options.stopMusic
 * @param {(playing: boolean) => void} options.setMusicUiPlaying
 * @param {(parts: string[]) => void} options.setLogoParts
 * @param {React.MutableRefObject<object>} [options.crawlStateRef]
 * @param {(active: boolean) => void} [options.setIntroActive]
 * @param {object} [options.starWarsConfig] — cv.starWars (TTL etc.)
 */
export function useStarWarsIntro({
  lang,
  userName,
  startCrawl,
  playMusic,
  stopMusic,
  setMusicUiPlaying,
  setLogoParts,
  crawlStateRef,
  setIntroActive,
  starWarsConfig,
}) {
  const introTtlMs = resolveIntroSeenTtlMs(starWarsConfig)
  const timersRef = useRef([])
  const cancelledRef = useRef(false)
  const runningIntroRef = useRef(false)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
  }, [])

  const wait = useCallback((ms) => {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms)
      timersRef.current.push(id)
    })
  }, [])

  const hideOverlay = useCallback(() => {
    const overlay = document.getElementById('template-loading-overlay')
    if (!overlay) return
    overlay.classList.add('hidden')
    const id = setTimeout(() => {
      if (overlay.classList.contains('hidden')) {
        overlay.style.display = 'none'
        overlay.style.visibility = 'hidden'
        overlay.style.opacity = '0'
        overlay.style.zIndex = '-1'
      }
    }, 300)
    timersRef.current.push(id)
  }, [])

  const showOverlay = useCallback(() => {
    const overlay = document.getElementById('template-loading-overlay')
    if (!overlay) return
    overlay.style.display = 'flex'
    overlay.style.visibility = 'visible'
    overlay.style.opacity = '1'
    overlay.classList.remove('hidden')
    overlay.style.zIndex = '10001'
    void overlay.offsetHeight
  }, [])

  const fadeInHeaderUi = useCallback(() => {
    const header = document.querySelector('.sw-header')
    const actionButtons = document.querySelector('.action-buttons')

    if (header) {
      header.style.visibility = 'visible'
      header.classList.add('sw-fade-in-elements')
      header.style.opacity = ''
      void header.offsetHeight
      const id = setTimeout(() => {
        header.classList.add('show')
        header.style.opacity = ''
        header.style.visibility = 'visible'
      }, 50)
      timersRef.current.push(id)
    }

    if (actionButtons) {
      actionButtons.style.visibility = 'visible'
      actionButtons.classList.add('sw-fade-in-elements')
      actionButtons.style.opacity = ''
      void actionButtons.offsetHeight
      const id = setTimeout(() => {
        actionButtons.classList.add('show')
        actionButtons.style.opacity = ''
        actionButtons.style.visibility = 'visible'
      }, 50)
      timersRef.current.push(id)
    }

    const fadeTop = document.getElementById('sw-crawl-fade-top')
    if (fadeTop) {
      fadeTop.style.visibility = 'visible'
      fadeTop.classList.add('show')
    }

    const photoContainer = document.querySelector('.sw-photo-container')
    const profileImage = document.querySelector('.sw-profile-image, #profile-image')
    const lightsaber = document.querySelector('.sw-lightsaber')

    if (photoContainer) {
      photoContainer.style.display = 'flex'
      photoContainer.style.visibility = 'visible'
      photoContainer.style.opacity = '0'
      photoContainer.classList.add('sw-fade-in-elements')
      void photoContainer.offsetHeight
      const id = setTimeout(() => {
        photoContainer.style.opacity = '1'
      }, 50)
      timersRef.current.push(id)
    }

    if (profileImage) {
      profileImage.style.display = 'block'
      profileImage.style.visibility = 'visible'
      profileImage.style.opacity = '0'
      profileImage.classList.add('show')
      void profileImage.offsetHeight
      const id = setTimeout(() => {
        profileImage.style.opacity = '1'
      }, 50)
      timersRef.current.push(id)
    }

    if (lightsaber) {
      lightsaber.style.display = 'block'
      lightsaber.style.visibility = 'visible'
      lightsaber.style.opacity = '0'
      lightsaber.classList.add('show')
      void lightsaber.offsetHeight
      const id = setTimeout(() => {
        lightsaber.style.opacity = '1'
      }, 50)
      timersRef.current.push(id)
    }

    document.querySelectorAll('.sw-name, .sw-tagline').forEach((el) => {
      el.style.visibility = 'visible'
      el.style.opacity = ''
    })
  }, [])

  const showPhotoImmediate = useCallback(() => {
    const photoContainer = document.querySelector('.sw-photo-container')
    const profileImage = document.querySelector('.sw-profile-image, #profile-image')
    const lightsaber = document.querySelector('.sw-lightsaber')

    if (photoContainer) {
      photoContainer.style.display = 'flex'
      photoContainer.style.visibility = 'visible'
      photoContainer.style.opacity = '1'
    }
    if (profileImage) {
      profileImage.style.display = 'block'
      profileImage.style.visibility = 'visible'
      profileImage.style.opacity = '1'
      profileImage.classList.add('show')
    }
    if (lightsaber) {
      lightsaber.style.display = 'block'
      lightsaber.style.visibility = 'visible'
      lightsaber.style.opacity = '1'
      lightsaber.classList.add('show')
    }

    const header = document.querySelector('.sw-header')
    if (header) {
      header.style.opacity = '1'
      header.style.visibility = 'visible'
      header.classList.add('sw-fade-in-elements', 'show')
    }
    const actionButtons = document.querySelector('.action-buttons')
    if (actionButtons) {
      actionButtons.style.opacity = '1'
      actionButtons.style.visibility = 'visible'
      actionButtons.classList.add('sw-fade-in-elements', 'show')
    }
    const fadeTop = document.getElementById('sw-crawl-fade-top')
    if (fadeTop) {
      fadeTop.style.visibility = 'visible'
      fadeTop.classList.add('show')
    }
  }, [])

  const prepareContentHidden = useCallback(() => {
    const starWarsContainer = document.querySelector('.star-wars-container')
    const header = document.querySelector('.sw-header')
    const actionButtons = document.querySelector('.action-buttons')
    const crawlContainer = document.querySelector('.sw-crawl-container')

    if (starWarsContainer) {
      starWarsContainer.style.display = ''
      starWarsContainer.style.opacity = '1'
      starWarsContainer.style.visibility = 'visible'
      starWarsContainer.style.background = '#000'
      starWarsContainer.style.backgroundColor = '#000'
    }

    if (header) {
      header.style.opacity = '0'
      header.style.visibility = 'visible'
      header.classList.remove('show', 'sw-fade-in-elements')
    }
    if (actionButtons) {
      actionButtons.style.opacity = '0'
      actionButtons.style.visibility = 'visible'
      actionButtons.classList.remove('show', 'sw-fade-in-elements')
    }
    if (crawlContainer) {
      crawlContainer.style.opacity = '0'
      crawlContainer.style.visibility = 'visible'
    }
  }, [])

  const runLogoAnimation = useCallback(async () => {
    const logoAnimation = document.getElementById('sw-logo-animation')
    if (!logoAnimation) return

    const name = (userName || '').toUpperCase()
    const nameParts = name.split(/\s+/).filter(Boolean)
    setLogoParts(nameParts)

    let fontReady = false
    if (document.fonts?.check) {
      fontReady = document.fonts.check('5rem "SF Distant Galaxy AltOutline"')
    }
    if (!fontReady && document.fonts) {
      if (document.fonts.ready) {
        await document.fonts.ready
        if (document.fonts.check) {
          fontReady = document.fonts.check('5rem "SF Distant Galaxy AltOutline"')
        }
      }
      if (!fontReady) {
        await wait(100)
        if (document.fonts.check) {
          fontReady = document.fonts.check('5rem "SF Distant Galaxy AltOutline"')
        }
      }
    }

    // Wait a frame so React can commit logo word children
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    logoAnimation.style.zIndex = '10002'
    logoAnimation.style.animation = 'none'
    logoAnimation.style.webkitAnimation = 'none'
    logoAnimation.style.display = 'none'
    logoAnimation.style.opacity = '0'
    logoAnimation.style.visibility = 'hidden'
    logoAnimation.style.transform = 'none'
    logoAnimation.style.webkitTransform = 'none'

    const clone = logoAnimation.cloneNode(true)
    clone.style.position = 'absolute'
    clone.style.top = '-9999px'
    clone.style.left = '-9999px'
    clone.style.visibility = 'visible'
    clone.style.display = 'block'
    clone.style.opacity = '1'
    clone.style.transform = 'none'
    clone.style.zIndex = '-9999'
    document.body.appendChild(clone)
    void clone.offsetHeight
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    document.body.removeChild(clone)

    logoAnimation.style.display = 'block'
    logoAnimation.style.visibility = 'hidden'
    logoAnimation.style.opacity = '0'
    logoAnimation.style.transform = 'none'
    logoAnimation.style.webkitTransform = 'none'
    void logoAnimation.offsetHeight
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    logoAnimation.style.transform = 'translate(-50%, -50%) scale(3)'
    logoAnimation.style.webkitTransform = 'translate(-50%, -50%) scale(3)'
    void logoAnimation.offsetHeight
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    logoAnimation.style.visibility = 'visible'
    logoAnimation.style.opacity = '1'
    logoAnimation.style.display = 'block'
    void logoAnimation.offsetHeight

    logoAnimation.style.animation = 'logoFadeOut 9s ease-out forwards'
    logoAnimation.style.webkitAnimation = 'logoFadeOut 9s ease-out forwards'
  }, [setLogoParts, userName, wait])

  const showStarWarsIntro = useCallback(async () => {
    if (runningIntroRef.current) return
    runningIntroRef.current = true
    cancelledRef.current = false
    clearTimers()

    const overlay = document.getElementById('template-loading-overlay')
    const introText = document.getElementById('sw-intro-text')
    const logoAnimation = document.getElementById('sw-logo-animation')
    if (!overlay || !introText || !logoAnimation) {
      runningIntroRef.current = false
      return
    }

    showOverlay()
    window._swMusicStartedByIntro = true

    const introTextContent = INTRO_TEXTS[lang] || INTRO_TEXTS.pt
    introText.textContent = introTextContent
    introText.style.display = 'block'
    introText.style.visibility = 'visible'
    introText.style.opacity = '1'
    introText.classList.remove('hide')
    introText.classList.add('show')
    void introText.offsetHeight

    await wait(SW_INTRO_HOLD_MS)
    if (cancelledRef.current) {
      runningIntroRef.current = false
      return
    }

    introText.classList.remove('show')
    introText.classList.add('hide')
    await wait(SW_INTRO_FADE_MS)
    if (cancelledRef.current) {
      runningIntroRef.current = false
      return
    }
    introText.style.display = 'none'

    prepareContentHidden()

    logoAnimation.style.display = 'none'
    logoAnimation.style.visibility = 'hidden'
    logoAnimation.style.opacity = '0'

    await runLogoAnimation()
    if (cancelledRef.current) {
      runningIntroRef.current = false
      return
    }

    await wait(100)
    if (cancelledRef.current) {
      runningIntroRef.current = false
      return
    }

    overlay.style.display = 'none'
    overlay.style.opacity = '0'
    overlay.style.visibility = 'hidden'
    overlay.classList.add('hidden')
    overlay.style.zIndex = '-1'

    setMusicUiPlaying(true)
    playMusic(true)

    // Crawl at logo+3000ms
    const crawlTimer = setTimeout(() => {
      if (cancelledRef.current) return
      window.dispatchEvent(new CustomEvent('startStarWarsCrawl'))
      if (typeof startCrawl === 'function') startCrawl()
    }, SW_CRAWL_AFTER_LOGO_MS)
    timersRef.current.push(crawlTimer)

    // Header / fade-top at logo+9000ms
    const headerTimer = setTimeout(() => {
      if (cancelledRef.current) return
      fadeInHeaderUi()
    }, SW_HEADER_AFTER_LOGO_MS)
    timersRef.current.push(headerTimer)

    await wait(SW_LOGO_FADE_MS)
    if (cancelledRef.current) {
      runningIntroRef.current = false
      return
    }

    logoAnimation.style.display = 'none'
    hideOverlay()
    window._swMusicStartedByIntro = false
    markIntroSeen()
    if (typeof setIntroActive === 'function') setIntroActive(false)
    runningIntroRef.current = false
  }, [
    clearTimers,
    fadeInHeaderUi,
    hideOverlay,
    lang,
    playMusic,
    prepareContentHidden,
    runLogoAnimation,
    setIntroActive,
    setMusicUiPlaying,
    showOverlay,
    startCrawl,
    wait,
  ])

  const startStarWarsNormal = useCallback(async () => {
    cancelledRef.current = false
    clearTimers()
    runningIntroRef.current = false
    window._swMusicStartedByIntro = false

    stopMusic()
    setMusicUiPlaying(false)

    const introText = document.getElementById('sw-intro-text')
    if (introText) {
      introText.style.display = 'none'
      introText.classList.remove('show')
      introText.classList.add('hide')
    }
    const logoAnimation = document.getElementById('sw-logo-animation')
    if (logoAnimation) {
      logoAnimation.style.display = 'none'
      logoAnimation.style.visibility = 'hidden'
      logoAnimation.style.opacity = '0'
      logoAnimation.style.animation = 'none'
    }

    hideOverlay()
    showPhotoImmediate()

    const crawl = document.getElementById('sw-crawl')
    const state = crawlStateRef?.current
    if (crawl && state) {
      if (state.running && !state.isInitializing) {
        state.running = false
        if (state.rafId) {
          cancelAnimationFrame(state.rafId)
          state.rafId = null
        }
      }
      state.offsetMs = 0
      state.startTime = null
    }

    await wait(200)

    let attempts = 0
    while (crawlStateRef?.current?.isInitializing && attempts < 50) {
      await wait(50)
      attempts++
    }

    if (typeof setIntroActive === 'function') setIntroActive(false)

    if (typeof startCrawl === 'function') {
      startCrawl()
    } else {
      window.dispatchEvent(new CustomEvent('startStarWarsCrawl'))
    }
  }, [
    clearTimers,
    crawlStateRef,
    hideOverlay,
    setIntroActive,
    setMusicUiPlaying,
    showPhotoImmediate,
    startCrawl,
    stopMusic,
    wait,
  ])

  const skipIntro = useCallback(async () => {
    cancelledRef.current = true
    clearTimers()
    runningIntroRef.current = false
    markIntroSeen()
    window._swMusicStartedByIntro = false
    if (typeof setIntroActive === 'function') setIntroActive(false)
    await startStarWarsNormal()
  }, [clearTimers, setIntroActive, startStarWarsNormal])

  const repeatIntro = useCallback(async () => {
    cancelledRef.current = true
    clearTimers()
    stopMusic()
    setMusicUiPlaying(false)

    clearIntroSeen()

    const state = crawlStateRef?.current
    if (state?.running) {
      state.running = false
      if (state.rafId) {
        cancelAnimationFrame(state.rafId)
        state.rafId = null
      }
    }

    const scroll = document.getElementById('sw-crawl')
    if (scroll) {
      scroll.style.transform = 'none'
      scroll.style.webkitTransform = 'none'
      scroll.style.visibility = 'hidden'
      scroll.style.opacity = '0'
    }

    const crawlContainer = document.querySelector('.sw-crawl-container')
    if (crawlContainer) {
      crawlContainer.style.visibility = 'hidden'
      crawlContainer.style.opacity = '0'
    }

    const header = document.querySelector('.sw-header')
    if (header) {
      header.style.opacity = '0'
      header.style.visibility = 'hidden'
      header.classList.remove('show', 'sw-fade-in-elements')
    }

    const actionButtons = document.querySelector('.action-buttons')
    if (actionButtons) {
      actionButtons.style.opacity = '0'
      actionButtons.style.visibility = 'hidden'
      actionButtons.classList.remove('show', 'sw-fade-in-elements')
    }

    const photoContainer = document.querySelector('.sw-photo-container')
    if (photoContainer) {
      photoContainer.style.display = 'none'
      photoContainer.style.visibility = 'hidden'
      photoContainer.style.opacity = '0'
    }

    const profileImage = document.getElementById('profile-image')
    if (profileImage) {
      profileImage.style.display = 'none'
      profileImage.style.visibility = 'hidden'
      profileImage.style.opacity = '0'
    }

    const lightsaber = document.querySelector('.sw-lightsaber')
    if (lightsaber) {
      lightsaber.style.display = 'none'
      lightsaber.style.visibility = 'hidden'
      lightsaber.style.opacity = '0'
    }

    const logoAnimation = document.getElementById('sw-logo-animation')
    if (logoAnimation) {
      logoAnimation.style.display = 'none'
      logoAnimation.style.visibility = 'hidden'
      logoAnimation.style.opacity = '0'
      logoAnimation.style.transform = 'none'
      logoAnimation.style.webkitTransform = 'none'
      logoAnimation.style.animation = 'none'
      logoAnimation.style.webkitAnimation = 'none'
    }

    const fadeTop = document.getElementById('sw-crawl-fade-top')
    if (fadeTop) {
      fadeTop.classList.remove('show')
      fadeTop.style.visibility = 'hidden'
      fadeTop.style.opacity = '0'
    }

    showOverlay()
    if (typeof setIntroActive === 'function') setIntroActive(true)
    cancelledRef.current = false
    await showStarWarsIntro()
  }, [
    clearTimers,
    crawlStateRef,
    setIntroActive,
    setMusicUiPlaying,
    showOverlay,
    showStarWarsIntro,
    stopMusic,
  ])

  useEffect(() => {
    cancelledRef.current = false
    if (!hasSeenIntroRecently(introTtlMs)) {
      showStarWarsIntro()
    } else {
      startStarWarsNormal()
    }

    return () => {
      cancelledRef.current = true
      clearTimers()
      runningIntroRef.current = false
      window._swMusicStartedByIntro = false
    }
    // Mount-once gate; TTL checked at mount (revisit after ttlMs shows intro again)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    skipIntro,
    repeatIntro,
    showStarWarsIntro,
    startStarWarsNormal,
  }
}
