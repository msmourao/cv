/** Star Wars intro “seen” gate — client-only TTL (no backend). */

export const SW_INTRO_SEEN_KEY = 'sw-intro-seen'

/** Default: re-show intro after 1 hour */
export const SW_INTRO_SEEN_TTL_MS_DEFAULT = 60 * 60 * 1000

/**
 * @param {number} [ttlMs]
 * @returns {boolean} true when intro should be skipped
 */
export function hasSeenIntroRecently(ttlMs = SW_INTRO_SEEN_TTL_MS_DEFAULT) {
  try {
    const raw = localStorage.getItem(SW_INTRO_SEEN_KEY)
    if (!raw) return false

    // Legacy boolean flag → treat as expired so intro can play again under TTL rules
    if (raw === 'true' || raw === 'false') {
      localStorage.removeItem(SW_INTRO_SEEN_KEY)
      return false
    }

    const ts = Number(raw)
    if (!Number.isFinite(ts)) {
      localStorage.removeItem(SW_INTRO_SEEN_KEY)
      return false
    }

    const ttl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : SW_INTRO_SEEN_TTL_MS_DEFAULT
    return Date.now() - ts < ttl
  } catch {
    return false
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(SW_INTRO_SEEN_KEY, String(Date.now()))
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearIntroSeen() {
  try {
    localStorage.removeItem(SW_INTRO_SEEN_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Resolve TTL from cv.starWars (ms or hours).
 * @param {object} [starWars]
 */
export function resolveIntroSeenTtlMs(starWars) {
  if (!starWars || typeof starWars !== 'object') return SW_INTRO_SEEN_TTL_MS_DEFAULT
  if (Number.isFinite(starWars.introSeenTtlMs) && starWars.introSeenTtlMs > 0) {
    return starWars.introSeenTtlMs
  }
  if (Number.isFinite(starWars.introSeenTtlHours) && starWars.introSeenTtlHours > 0) {
    return starWars.introSeenTtlHours * 60 * 60 * 1000
  }
  return SW_INTRO_SEEN_TTL_MS_DEFAULT
}
