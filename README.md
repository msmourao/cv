# Interactive CV (Vite + React)

Bilingual CV template with three views:

| Template | Purpose |
|----------|---------|
| **Better View** (default) | Visual CV — desktop 2 columns; mobile tabs via CSS (`data-tab`) |
| **ATS-friendly** | Parse-first / PDF — one column, semantic HTML, linear reading order |
| **Star Wars** | Intro + crawl choreography (timing preserved from the original) |

Live site (this fork): GitHub Pages from `docs/` with base `/cv/`.

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/cv/`).

### Publish to GitHub Pages

```bash
npm run publish:docs
```

This runs `vite build` into `docs/` and ensures `docs/.nojekyll` exists.

Then: **Settings → Pages → Deploy from branch → `/docs`**.

Repo Pages URL shape: `https://<user>.github.io/cv/`

---

## Customize for yourself

1. Edit **`public/data/cv.json`** (single source of truth).
2. Replace **`public/avatar.png`** (and optionally `public/lightsaber.png` for Star Wars).
3. `npm run dev` to preview; `npm run publish:docs` to ship.

You do **not** need to touch React code for content changes.

---

## `cv.json` schema (v2)

Bilingual fields are colocated as `{ "pt": "...", "en": "..." }` on the same node.

```json
{
  "meta": { "defaultLang": "pt", "supportedLangs": ["pt", "en"], "version": 2 },
  "personal": {
    "name": "Your Name",
    "photo": "avatar.png",
    "email": "...",
    "phone": "...",
    "links": { "linkedin": "...", "github": "...", "website": "..." },
    "location": { "pt": "...", "en": "..." },
    "tagline": { "pt": "...", "en": "..." }
  },
  "sections": {
    "about": { "pt": "...", "en": "..." },
    "experience": [
      {
        "id": "job-id",
        "company": { "pt": "...", "en": "..." },
        "title": { "pt": "...", "en": "..." },
        "location": { "pt": "...", "en": "..." },
        "period": { "pt": "...", "en": "..." },
        "url": "https://...",
        "highlight": false,
        "summary": { "pt": "...", "en": "..." },
        "bullets": { "pt": ["..."], "en": ["..."] },
        "technologies": ["React", ".NET"]
      }
    ],
    "education": [],
    "skills": {
      "technical": ["C#", ".NET"],
      "soft": [{ "pt": "...", "en": "..." }],
      "languages": [{ "name": { "pt": "Inglês", "en": "English" }, "level": { "pt": "Avançado", "en": "Advanced" }, "dots": 4 }]
    },
    "certifications": [],
    "projects": [],
    "achievements": [],
    "hobbies": { "pt": [], "en": [] }
  },
  "ui": {
    "labels": { "pt": {}, "en": {} },
    "messages": { "pt": {}, "en": {} },
    "seo": { "pt": { "title": "", "description": "" }, "en": { "title": "", "description": "" } }
  },
  "starWars": {
    "audioUrl": "https://...",
    "introSeenTtlHours": 1,
    "crawlSource": "custom",
    "customCrawl": {
      "pt": {
        "eyebrow": "Episódio …",
        "title": "…",
        "subtitle": "…",
        "paragraphs": ["…"],
        "closing": "…",
        "url": "https://getpolystack.com"
      },
      "en": { "eyebrow": "…", "title": "…", "paragraphs": ["…"] }
    }
  }
}
```

### Star Wars crawl

| Campo | Efeito |
|-------|--------|
| `crawlSource: "custom"` | Crawl usa `customCrawl` (paródia / história) em vez do CV |
| `crawlSource: "cv"` | Crawl clássico com about / experiência / etc. |
| `introSeenTtlHours` | Intro completa reaparece após N horas (padrão **1**). Só `localStorage`, sem backend. Também aceita `introSeenTtlMs`. |

### Deep link (query string)

Abrir direto no Star Wars (não depende do template salvo):

- `https://<user>.github.io/cv/?template=star-wars`
- aliases: `?sw=1`, `?starwars=1`, `?template=sw`
- idioma opcional: `?lang=en`

Preferências (lang / theme / template) ficam em `localStorage`. Star Wars **não** é aplicado sozinho no cold load a partir do storage — use a query string ou o seletor na UI.

---

## ATS / PDF (important)

The ATS template is built for **parser-friendly** output, not decoration.

### Recommended PDF

1. Select template **ATS-friendly**.
2. Chrome: **Print → Save as PDF** (A4, background graphics off is fine).
3. Open the PDF → Select All → Paste into Notepad.
4. Confirm blocks: Name → Contact → Professional Experience (Title → Company | Location → Dates → bullets) → Education → Skills.

### Plain text fallback

In ATS view use:

- **Copy plain text** — clipboard, same order as the DOM
- **Download .txt** — file download for ATS upload fields that accept text

Do **not** print the Better View or Star Wars templates if you need ATS parsing.

---

## Architecture notes

- **CSS-first**: layout, themes (`data-theme`), mobile panels (`data-tab` / `data-panel`), and print live in CSS layers (`tokens → base → layout → components → themes → templates`). No `innerWidth` layout hacks.
- **Star Wars**: intro hold 3s + fade 2s; logo 9s; crawl starts at logo+3s; header at logo+9s; crawl RAF `SPEED=15`, `EXTRA=160`; IDs `#sw-crawl` / `.sw-viewport` preserved. Intro “já vi” expira em ~1h (`introSeenTtlHours`). Crawl customizável via `starWars.customCrawl`.
- **Legacy** vanilla HTML/JS lives under `legacy/` for reference only (not used by the React app).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `docs/` |
| `npm run preview` | Preview production build |
| `npm run publish:docs` | Build + `.nojekyll` for Pages |

Optional one-shot migration from the old triple JSON:

```bash
node scripts/migrate-cv-json.mjs
```

---

## License / reuse

This repository is a **public template**. Clone it, replace `public/data/cv.json` + avatar, and publish your own Pages site.
