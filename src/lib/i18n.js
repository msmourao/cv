/**
 * i18n helpers — bilingual field pick + Vite base-aware asset URLs.
 */

/**
 * Pick a language value from a bilingual object `{ pt, en }` (or pass-through).
 * @param {string} lang
 * @param {unknown} bilingualObj
 * @returns {unknown}
 */
export function pick(lang, bilingualObj) {
  if (bilingualObj == null) return "";
  if (typeof bilingualObj !== "object" || Array.isArray(bilingualObj)) {
    return bilingualObj;
  }
  const key = lang === "en" ? "en" : "pt";
  if (Object.prototype.hasOwnProperty.call(bilingualObj, key) && bilingualObj[key] != null) {
    return bilingualObj[key];
  }
  if (bilingualObj.en != null) return bilingualObj.en;
  if (bilingualObj.pt != null) return bilingualObj.pt;
  return "";
}

/**
 * Resolve a public asset path against Vite `base` (e.g. `/cv/`).
 * @param {string} path — e.g. `avatar.png` or `./avatar.png`
 * @returns {string}
 */
export function assetUrl(path) {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const clean = String(path || "")
    .replace(/^\.\//, "")
    .replace(/^\//, "");
  return `${normalizedBase}${clean}`;
}
