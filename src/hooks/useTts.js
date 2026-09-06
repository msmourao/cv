import { useCallback, useEffect, useRef, useState } from 'react'
import { buildPlainText } from '../lib/plainText.js'

/**
 * Lightweight Web Speech TTS — speak full CV plain text.
 */
export function useTts(lang) {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setSpeaking(false)
  }, [])

  useEffect(() => {
    stop()
  }, [lang, stop])

  const toggle = useCallback(
    (cv) => {
      if (!supported) return
      if (speaking) {
        stop()
        return
      }
      const text = buildPlainText(cv, lang)
      if (!text.trim()) return
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'en' ? 'en-US' : 'pt-BR'
      u.rate = 1
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      utteranceRef.current = u
      setSpeaking(true)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    },
    [lang, speaking, stop, supported]
  )

  return { supported, speaking, toggle, stop }
}
