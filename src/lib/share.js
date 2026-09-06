import { pick } from './i18n.js'

export function shareWhatsApp(cv, lang) {
  const phone = String(cv?.personal?.phone || '').replace(/[\s\-+]/g, '')
  if (!phone) return
  const messages = pick(lang, cv?.ui?.messages) || {}
  const text = encodeURIComponent(messages.whatsapp || '')
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
}

export function shareEmail(cv, lang) {
  const messages = pick(lang, cv?.ui?.messages) || {}
  const email = messages.email || {}
  const subject = encodeURIComponent(email.subject || '')
  const body = encodeURIComponent(email.body || '')
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

export function shareLinkedIn() {
  const url = encodeURIComponent(window.location.href)
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    '_blank',
    'noopener,noreferrer'
  )
}

/**
 * Expand Better View job “Veja mais” details for print, restore afterward.
 * @returns {() => void} restore function
 */
export function expandJobDetailsForPrint() {
  const details = Array.from(document.querySelectorAll('details.bv-job__more'))
  const previouslyOpen = new Set()
  details.forEach((el, i) => {
    if (el.open) previouslyOpen.add(i)
    el.open = true
  })
  return () => {
    details.forEach((el, i) => {
      el.open = previouslyOpen.has(i)
    })
  }
}

export function printCv() {
  const restore = expandJobDetailsForPrint()
  const onAfter = () => {
    restore()
    window.removeEventListener('afterprint', onAfter)
  }
  window.addEventListener('afterprint', onAfter)
  requestAnimationFrame(() => {
    window.print()
  })
}
