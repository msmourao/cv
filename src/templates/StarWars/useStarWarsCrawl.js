import { useCallback, useEffect, useRef } from 'react'

const SPEED_PX_PER_S = 15
const EXTRA = 160
const DURATION_FALLBACK_MS = 28000

/**
 * RAF crawl logic ported from legacy/js/managers/starWarsManager.js.
 * Preserves SPEED_PX_PER_S=15, EXTRA=160, measure loop, resize + mutation restart.
 *
 * @param {React.RefObject<HTMLElement|null>} crawlRef - ref to #sw-crawl
 */
export function useStarWarsCrawl(crawlRef) {
  const stateRef = useRef({
    rafId: null,
    startTime: null,
    offsetMs: 0,
    running: false,
    resizeHandler: null,
    mutationObserver: null,
    isInitializing: false,
    measureInProgress: false,
  })
  const startAutoInProgressRef = useRef(false)
  const metricsRef = useRef({
    contentHeight: 0,
    startTranslate: 0,
    endTranslate: 0,
    DURATION_MS: DURATION_FALLBACK_MS,
  })

  const getScroll = useCallback(() => {
    return crawlRef.current || document.getElementById('sw-crawl')
  }, [crawlRef])

  const setTranslate = useCallback(
    (y) => {
      const scroll = getScroll()
      if (!scroll) return
      const transformValue = `translateY(${Math.round(y)}px) translateZ(0px)`
      scroll.style.transform = transformValue
      scroll.style.webkitTransform = transformValue
      void scroll.offsetHeight
    },
    [getScroll]
  )

  const getFirstTop = useCallback(() => {
    const scroll = getScroll()
    if (!scroll) return null
    const first = scroll.firstElementChild
    if (!first) return null
    const viewport = scroll.closest('.sw-viewport')
    if (viewport) {
      const viewportRect = viewport.getBoundingClientRect()
      const firstRect = first.getBoundingClientRect()
      return firstRect.top - viewportRect.top
    }
    return first.getBoundingClientRect().top
  }, [getScroll])

  const applyT = useCallback(
    (t) => {
      const { startTranslate, endTranslate } = metricsRef.current
      const y = startTranslate + (endTranslate - startTranslate) * t
      setTranslate(y)
    },
    [setTranslate]
  )

  const measureAndFindStart = useCallback(async () => {
    const state = stateRef.current
    if (state.measureInProgress) return
    state.measureInProgress = true

    try {
      const scroll = getScroll()
      if (!scroll) {
        state.measureInProgress = false
        return
      }

      const wasVisible =
        scroll.style.visibility !== 'hidden' && scroll.style.opacity !== '0'

      scroll.style.transform = 'none'
      scroll.style.webkitTransform = 'none'

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

      void document.body.offsetHeight
      void scroll.offsetHeight

      let contentHeight = scroll.scrollHeight
      metricsRef.current.contentHeight = contentHeight

      const viewport = scroll.closest('.sw-viewport')
      let desiredTop = window.innerHeight
      if (viewport) {
        desiredTop = viewport.getBoundingClientRect().height
      }

      let translate = 0
      setTranslate(translate)
      void scroll.offsetHeight
      await new Promise((r) => requestAnimationFrame(r))

      const maxIter = 15
      const tol = 2
      for (let i = 0; i < maxIter; i++) {
        void scroll.offsetHeight
        await new Promise((r) => requestAnimationFrame(r))

        const top = getFirstTop()
        if (top === null) break
        const delta = desiredTop - top
        if (Math.abs(delta) <= tol) {
          translate = translate + delta
          setTranslate(translate)
          break
        }
        const maxDelta = 2000
        const limitedDelta = Math.sign(delta) * Math.min(Math.abs(delta), maxDelta)
        translate = translate + limitedDelta
        setTranslate(translate)
      }

      const startTranslate = Math.round(translate)
      const endTranslate = startTranslate - (contentHeight + EXTRA)
      const distancePx = Math.abs(startTranslate - endTranslate)
      const DURATION_MS = Math.max(1, Math.round((distancePx / SPEED_PX_PER_S) * 1000))

      metricsRef.current = {
        contentHeight,
        startTranslate,
        endTranslate,
        DURATION_MS,
      }

      if (wasVisible) {
        scroll.style.visibility = 'visible'
        scroll.style.opacity = '1'
      }
    } catch {
      metricsRef.current = {
        contentHeight: 0,
        startTranslate: 0,
        endTranslate: 0,
        DURATION_MS: DURATION_FALLBACK_MS,
      }
    } finally {
      state.measureInProgress = false
    }
  }, [getFirstTop, getScroll, setTranslate])

  const frame = useCallback(
    (now) => {
      const state = stateRef.current
      const { DURATION_MS } = metricsRef.current
      if (!state.startTime) {
        state.startTime = now
      }
      const elapsed = now - state.startTime
      const total = state.offsetMs + elapsed
      const t = (total % DURATION_MS) / DURATION_MS
      applyT(t)
      if (state.running) {
        state.rafId = requestAnimationFrame(frame)
      }
    },
    [applyT]
  )

  const stopCrawl = useCallback(() => {
    const state = stateRef.current
    state.running = false
    if (state.rafId) {
      cancelAnimationFrame(state.rafId)
      state.rafId = null
    }
    state.startTime = null
    state.offsetMs = 0
    state.isInitializing = false
    startAutoInProgressRef.current = false
  }, [])

  const startAuto = useCallback(async () => {
    if (startAutoInProgressRef.current) return
    startAutoInProgressRef.current = true
    const state = stateRef.current
    state.isInitializing = true

    const scroll = getScroll()
    if (!scroll) {
      startAutoInProgressRef.current = false
      state.isInitializing = false
      return
    }

    if (state.running) {
      state.running = false
      if (state.rafId) {
        cancelAnimationFrame(state.rafId)
        state.rafId = null
      }
    }

    state.offsetMs = 0
    state.startTime = null

    scroll.style.transform = 'none'
    scroll.style.webkitTransform = 'none'
    scroll.style.visibility = 'hidden'
    scroll.style.opacity = '0'
    scroll.style.display = 'block'

    void scroll.offsetHeight
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await measureAndFindStart()

    const scrollFinal = getScroll()
    if (!scrollFinal) {
      startAutoInProgressRef.current = false
      state.isInitializing = false
      return
    }

    applyT(0)
    void scrollFinal.offsetHeight

    scrollFinal.style.visibility = 'visible'
    scrollFinal.style.opacity = '1'

    const crawlContainer = scrollFinal.closest('.sw-crawl-container')
    if (crawlContainer) {
      crawlContainer.style.opacity = '1'
      crawlContainer.style.visibility = 'visible'
    }

    void scrollFinal.offsetHeight

    state.startTime = performance.now()
    state.running = true
    frame(performance.now())

    setTimeout(() => {
      startAutoInProgressRef.current = false
      state.isInitializing = false
    }, 100)
  }, [applyT, frame, getScroll, measureAndFindStart])

  const setupListeners = useCallback(() => {
    const scroll = getScroll()
    if (!scroll) return
    const state = stateRef.current

    if (state.resizeHandler) {
      window.removeEventListener('resize', state.resizeHandler)
    }
    if (state.mutationObserver) {
      state.mutationObserver.disconnect()
    }

    state.resizeHandler = async () => {
      const el = getScroll()
      if (!el) return

      const wasVisible =
        el.style.visibility !== 'hidden' && el.style.opacity !== '0'
      const wasRunning = state.running
      const { DURATION_MS } = metricsRef.current

      if (wasRunning) {
        const now = performance.now()
        const elapsed = now - (state.startTime || now)
        state.offsetMs = (state.offsetMs + elapsed) % DURATION_MS
        state.running = false
        if (state.rafId) {
          cancelAnimationFrame(state.rafId)
        }
        state.startTime = null
      }

      await measureAndFindStart()

      if (wasVisible) {
        el.style.visibility = 'visible'
        el.style.opacity = '1'
        const crawlContainer = el.closest('.sw-crawl-container')
        if (crawlContainer) {
          crawlContainer.style.opacity = '1'
          crawlContainer.style.visibility = 'visible'
        }
      }

      applyT((state.offsetMs % metricsRef.current.DURATION_MS) / metricsRef.current.DURATION_MS)

      if (wasRunning) {
        state.startTime = performance.now()
        state.running = true
        frame(performance.now())
      }
    }

    window.addEventListener('resize', state.resizeHandler)

    state.mutationObserver = new MutationObserver(async (mutations) => {
      if (state.isInitializing || state.measureInProgress || startAutoInProgressRef.current) {
        return
      }
      let relevant = false
      for (const m of mutations) {
        if (
          m.type === 'attributes' &&
          m.attributeName &&
          (m.attributeName === 'style' || m.attributeName === 'class')
        ) {
          continue
        }
        if (m.type === 'childList' || m.type === 'characterData') {
          relevant = true
          break
        }
      }
      if (relevant && state.running) {
        state.running = false
        if (state.rafId) {
          cancelAnimationFrame(state.rafId)
        }
        state.startTime = null
        state.offsetMs = 0
        await measureAndFindStart()
        applyT(0)
        state.startTime = performance.now()
        state.running = true
        frame(performance.now())
      }
    })
    state.mutationObserver.observe(scroll, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }, [applyT, frame, getScroll, measureAndFindStart])

  const teardownListeners = useCallback(() => {
    const state = stateRef.current
    if (state.resizeHandler) {
      window.removeEventListener('resize', state.resizeHandler)
      state.resizeHandler = null
    }
    if (state.mutationObserver) {
      state.mutationObserver.disconnect()
      state.mutationObserver = null
    }
  }, [])

  useEffect(() => {
    setupListeners()

    const onStartEvent = () => {
      startAuto()
    }
    window.addEventListener('startStarWarsCrawl', onStartEvent)

    return () => {
      window.removeEventListener('startStarWarsCrawl', onStartEvent)
      stopCrawl()
      teardownListeners()
    }
  }, [setupListeners, startAuto, stopCrawl, teardownListeners])

  return {
    startAuto,
    stopCrawl,
    stateRef,
  }
}
