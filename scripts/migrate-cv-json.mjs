/**
 * One-shot migration: legacy cv-data + descriptions → public/data/cv.json
 * Run: node scripts/migrate-cv-json.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(readFileSync(join(root, 'legacy/cv-data.json'), 'utf8'))
const en = JSON.parse(readFileSync(join(root, 'legacy/cv-descriptions-en.json'), 'utf8'))
const pt = JSON.parse(readFileSync(join(root, 'legacy/cv-descriptions-pt.json'), 'utf8'))

const rebrand = (s) =>
  String(s ?? '')
    .replaceAll('getpollystack', 'getpolystack')
    .replaceAll('PollyStack', 'PolyStack')
    .replaceAll('pollyStack', 'polyStack')
    .replaceAll('https://msmourao.github.io/getpolystack', 'https://getpolystack.com')

const bilingual = (obj) => {
  if (!obj || typeof obj !== 'object') return { pt: '', en: '' }
  if ('pt' in obj || 'en' in obj) {
    return { pt: rebrand(obj.pt ?? ''), en: rebrand(obj.en ?? '') }
  }
  return { pt: rebrand(obj), en: rebrand(obj) }
}

const stripHtml = (html) =>
  rebrand(html)
    .replace(/<\/?strong>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()

const splitTechs = (s) =>
  rebrand(s || '')
    .split(/,\s*/)
    .map((t) => t.replace(/\.$/, '').trim())
    .filter(Boolean)

const polyStackAboutPt =
  'Projeto pessoal de arquitetura de plataforma e engenharia de software: o PolyStack automatiza composição, validação e entrega de aplicações em múltiplas nuvens. Transforma decisões de arquitetura em configuração governada, recursos reproduzíveis e planos de entrega revisáveis — com o mesmo modelo no desenvolvimento local e na cloud. Site: https://getpolystack.com'
const polyStackAboutEn =
  'Personal platform architecture and software engineering project: PolyStack automates composition, validation, and delivery of applications across multiple clouds. It turns architecture decisions into governed configuration, reproducible resources, and reviewable delivery plans — with the same model from local development to the cloud. Site: https://getpolystack.com'

const polyStackBulletsPt = (pt.workExperience.pollyStack?.bullets || []).map((b) =>
  stripHtml(b).replace(/^PollyStack/i, 'PolyStack')
)
const polyStackBulletsEn = (en.workExperience.pollyStack?.bullets || []).map((b) =>
  stripHtml(b).replace(/^PollyStack/i, 'PolyStack')
)

function jobFromKey(job) {
  const key = job.key
  const isPoly = key === 'pollyStack' || key === 'polyStack'
  const descPt = isPoly ? polyStackAboutPt : rebrand(pt.workExperience[key]?.description || '')
  const descEn = isPoly ? polyStackAboutEn : rebrand(en.workExperience[key]?.description || '')
  const bulletsPt = isPoly
    ? polyStackBulletsPt
    : (pt.workExperience[key]?.bullets || []).map(stripHtml)
  const bulletsEn = isPoly
    ? polyStackBulletsEn
    : (en.workExperience[key]?.bullets || []).map(stripHtml)
  const techRaw = isPoly
    ? en.workExperience.pollyStack?.technologies
    : en.workExperience[key]?.technologies || pt.workExperience[key]?.technologies || ''

  return {
    id: isPoly ? 'polyStack' : key,
    company: bilingual(
      isPoly
        ? { pt: 'PolyStack (projeto pessoal)', en: 'PolyStack (personal project)' }
        : job.company
    ),
    title: bilingual(job.title),
    location: bilingual(job.location),
    period: bilingual(job.period),
    url: isPoly ? 'https://getpolystack.com' : job.link || null,
    highlight: isPoly,
    summary: { pt: descPt, en: descEn },
    bullets: { pt: bulletsPt, en: bulletsEn },
    technologies: splitTechs(techRaw),
  }
}

function eduItem(item, index) {
  const degree = bilingual(item.title || item.degree)
  const institution =
    typeof item.institution === 'string'
      ? { pt: item.institution, en: item.institution }
      : bilingual(item.institution)
  const note = item.note ? bilingual(item.note) : null
  return {
    id: `edu-${index}`,
    degree,
    institution,
    location: bilingual(item.location || { pt: '', en: '' }),
    period: bilingual(item.period),
    note,
    summary: { pt: note?.pt || '', en: note?.en || '' },
  }
}

function certItem(item, index) {
  return {
    id: `cert-${index}`,
    name: bilingual(item.name),
    issuer: bilingual(item.issuer || { pt: '', en: '' }),
    period: {
      pt: item.year ? String(item.year) : '',
      en: item.year ? String(item.year) : '',
    },
    url: item.link || null,
    summary: bilingual(item.description || { pt: '', en: '' }),
  }
}

function projectItem(item) {
  const key = item.key
  const isPoly = key === 'pollyStack' || key === 'polyStack'
  const namePt = isPoly
    ? 'PolyStack — Framework Multicloud Ready'
    : rebrand(pt.projects?.[key]?.name || item.name?.pt || key)
  const nameEn = isPoly
    ? 'PolyStack — Multicloud Ready Framework'
    : rebrand(en.projects?.[key]?.name || item.name?.en || key)
  return {
    id: isPoly ? 'polyStack' : key,
    name: { pt: namePt, en: nameEn },
    url: isPoly ? 'https://getpolystack.com' : item.link || null,
    summary: {
      pt: isPoly
        ? rebrand(
            (pt.projects?.pollyStack?.description || polyStackAboutPt).replaceAll(
              'PollyStack',
              'PolyStack'
            )
          )
        : rebrand(pt.projects?.[key]?.description || ''),
      en: isPoly
        ? rebrand(
            (en.projects?.pollyStack?.description || polyStackAboutEn).replaceAll(
              'PollyStack',
              'PolyStack'
            )
          )
        : rebrand(en.projects?.[key]?.description || ''),
    },
    technologies: splitTechs(
      en.projects?.[key]?.technologies || pt.projects?.[key]?.technologies || ''
    ),
  }
}

function achievementItem(item, index, langPair) {
  return {
    id: `ach-${index}`,
    title: {
      pt: rebrand(langPair.pt.title || item.title || ''),
      en: rebrand(langPair.en.title || item.title || ''),
    },
    summary: {
      pt: rebrand(langPair.pt.description || ''),
      en: rebrand(langPair.en.description || ''),
    },
  }
}

const normalizeLabels = (sections, buttons, lang) => ({
  about: sections.summary || (lang === 'pt' ? 'Sobre' : 'About'),
  experience: sections.workExperience || (lang === 'pt' ? 'Experiência' : 'Experience'),
  education: sections.education || (lang === 'pt' ? 'Formação' : 'Education'),
  skills: sections.techStack || (lang === 'pt' ? 'Competências' : 'Skills'),
  softSkills: sections.softSkills || (lang === 'pt' ? 'Soft Skills' : 'Soft Skills'),
  certifications: sections.certifications || (lang === 'pt' ? 'Certificações' : 'Certifications'),
  projects: sections.projects || (lang === 'pt' ? 'Projetos' : 'Projects'),
  achievements: sections.keyAchievements || (lang === 'pt' ? 'Conquistas' : 'Achievements'),
  hobbies: sections.hobbies || 'Hobbies',
  languages: sections.languages || (lang === 'pt' ? 'Idiomas' : 'Languages'),
  contact: sections.contact || (lang === 'pt' ? 'Contato' : 'Contact'),
  print: buttons.print || (lang === 'pt' ? 'Imprimir CV' : 'Print CV'),
  share: buttons.share || (lang === 'pt' ? 'Compartilhar' : 'Share'),
  listen: lang === 'pt' ? 'Ouvir' : 'Listen',
  stop: lang === 'pt' ? 'Parar' : 'Stop',
  theme: lang === 'pt' ? 'Tema' : 'Theme',
  template: lang === 'pt' ? 'Modelo' : 'Template',
  language: lang === 'pt' ? 'Idioma' : 'Language',
  copyPlainText: lang === 'pt' ? 'Copiar texto' : 'Copy plain text',
  downloadTxt: lang === 'pt' ? 'Baixar .txt' : 'Download .txt',
  repeatIntro: lang === 'pt' ? 'Repetir intro' : 'Repeat Intro',
  skipIntro: lang === 'pt' ? 'Pular' : 'Skip',
  professionalExperience:
    lang === 'pt' ? 'Experiência Profissional' : 'Professional Experience',
  whatsapp: buttons.shareOptions?.whatsapp || 'WhatsApp',
  emailShare: buttons.shareOptions?.email || 'Email',
  linkedinShare: buttons.shareOptions?.linkedin || 'LinkedIn',
})

const achPt = pt.keyAchievements || []
const achEn = en.keyAchievements || []
const achievements = achPt.map((a, i) =>
  achievementItem(a, i, { pt: a, en: achEn[i] || a })
)

const hobbiesPt = (data.hobbies || []).map((h) => rebrand(h.pt || h))
const hobbiesEn = (data.hobbies || []).map((h) => rebrand(h.en || h))

const softSkills = (data.softSkills || []).map((s) => bilingual(s))

const cv = {
  meta: {
    defaultLang: 'pt',
    supportedLangs: ['pt', 'en'],
    version: 2,
  },
  personal: {
    name: data.personal.name,
    photo: 'avatar.png',
    email: data.personal.email,
    phone: data.personal.phone,
    links: {
      linkedin: data.personal.linkedin,
      github: data.personal.github,
      website: 'https://getpolystack.com',
    },
    location: bilingual(data.personal.location),
    tagline: bilingual(data.personal.tagline),
  },
  sections: {
    about: {
      pt: rebrand(pt.about),
      en: rebrand(en.about),
    },
    experience: (data.workExperience || []).map(jobFromKey),
    education: (data.education || []).map(eduItem),
    skills: {
      technical: data.techStack || [],
      soft: softSkills,
      languages: (data.languages || []).map((l) => ({
        name: bilingual(l.name || l),
        level: bilingual(l.level || { pt: '', en: '' }),
        dots: l.dots ?? 0,
      })),
    },
    certifications: (data.certifications || []).map(certItem),
    projects: (data.projects || []).map(projectItem),
    achievements,
    hobbies: { pt: hobbiesPt, en: hobbiesEn },
  },
  ui: {
    labels: {
      pt: normalizeLabels(pt.sections || {}, pt.buttons || {}, 'pt'),
      en: normalizeLabels(en.sections || {}, en.buttons || {}, 'en'),
    },
    messages: {
      pt: pt.messages || {},
      en: en.messages || {},
    },
    seo: {
      pt: {
        title: pt.seo?.title || `${data.personal.name} — CV`,
        description: rebrand(pt.seo?.description || pt.about).slice(0, 200),
      },
      en: {
        title: en.seo?.title || `${data.personal.name} — Resume`,
        description: rebrand(en.seo?.description || en.about).slice(0, 200),
      },
    },
  },
  starWars: {
    audioUrl:
      'https://soundfxcenter.com/movies/star-wars/8d82b5_Star_Wars_Main_Theme_Song.mp3',
  },
}

const outDir = join(root, 'public/data')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'cv.json')
writeFileSync(outPath, JSON.stringify(cv, null, 2), 'utf8')
console.log('Wrote', outPath)

const raw = JSON.stringify(cv)
if (/PollyStack|pollyStack|getpollystack/i.test(raw)) {
  console.error('WARNING: PollyStack branding still present')
  process.exitCode = 1
} else {
  console.log('Branding check OK (no PollyStack)')
}
