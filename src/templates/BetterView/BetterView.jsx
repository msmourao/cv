import { useState } from "react";
import { assetUrl, pick } from "../../lib/i18n.js";

function labels(cv, lang) {
  return pick(lang, cv?.ui?.labels) || {};
}

function L(cv, lang, key, fallback) {
  return labels(cv, lang)[key] || fallback;
}

function displayHost(url) {
  if (!url) return "";
  return String(url)
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function IconPin() {
  return (
    <svg className="bv-contact__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0a5 5 0 0 0-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 0 0-5-5zm0 7.5A2.5 2.5 0 1 1 8 2.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="bv-contact__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.535 1.25-.12 1.825a16.89 16.89 0 0 0 9.39 9.39c.575.415 1.341.363 1.825-.12l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 6.494a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="bv-contact__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.586l-1.326-.798-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg className="bv-contact__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.52 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg className="bv-contact__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const MOBILE_TABS = [
  { id: "about", pt: "Sobre", en: "About", icon: "👤" },
  { id: "tech", pt: "Tech", en: "Tech", icon: "</>" },
  { id: "education", pt: "Formação", en: "Education", icon: "🎓" },
  { id: "projects", pt: "Projetos", en: "Projects", icon: "📁" },
  { id: "experience", pt: "Experiência", en: "Experience", icon: "💼" },
];

/**
 * Better View template — desktop 2-col; mobile CSS tabs via data-tab.
 * @param {{ cv: object, lang: string }} props
 */
export default function BetterView({ cv, lang }) {
  const [tab, setTab] = useState("about");
  const personal = cv?.personal || {};
  const sections = cv?.sections || {};
  const photoSrc = assetUrl(personal.photo || "avatar.png");
  const location = pick(lang, personal.location);
  const seeMore = lang === "en" ? "See more" : "Veja mais";

  return (
    <div className="better-view" data-tab={tab}>
      <header className="better-view__header">
        <h1 className="better-view__name">{personal.name}</h1>
        <p className="better-view__tagline">{pick(lang, personal.tagline)}</p>
      </header>

      <aside className="better-view__aside">
        <div className="bv-photo-wrap" data-panel="about">
          <img className="bv-photo" src={photoSrc} alt={personal.name || ""} width={150} height={150} />
        </div>

        <ul className="bv-contact" data-panel="about">
          {location ? (
            <li className="bv-contact__item">
              <IconPin />
              <span>{location}</span>
            </li>
          ) : null}
          {personal.phone ? (
            <li className="bv-contact__item">
              <a href={`tel:${personal.phone.replace(/\s/g, "")}`}>
                <IconPhone />
                <span>{personal.phone}</span>
              </a>
            </li>
          ) : null}
          {personal.email ? (
            <li className="bv-contact__item">
              <a href={`mailto:${personal.email}`}>
                <IconMail />
                <span>{personal.email}</span>
              </a>
            </li>
          ) : null}
          {personal.links?.linkedin ? (
            <li className="bv-contact__item">
              <a href={personal.links.linkedin} target="_blank" rel="noopener noreferrer">
                <IconLinkedIn />
                <span>{displayHost(personal.links.linkedin)}</span>
              </a>
            </li>
          ) : null}
          {personal.links?.github ? (
            <li className="bv-contact__item">
              <a href={personal.links.github} target="_blank" rel="noopener noreferrer">
                <IconGitHub />
                <span>{displayHost(personal.links.github)}</span>
              </a>
            </li>
          ) : null}
        </ul>

        <section data-panel="about">
          <h2 className="better-view__aside-title">{L(cv, lang, "about", "Resumo")}</h2>
          <p className="bv-summary">{pick(lang, sections.about)}</p>
        </section>

        <section data-panel="tech">
          <h2 className="better-view__aside-title">{L(cv, lang, "achievements", "Principais Conquistas")}</h2>
          {(sections.achievements || []).map((a) => (
            <article className="bv-achievement" key={a.id || pick(lang, a.title)}>
              <h3 className="bv-achievement__title">{pick(lang, a.title)}</h3>
              <p className="bv-achievement__body">{pick(lang, a.summary)}</p>
            </article>
          ))}
        </section>

        <section data-panel="projects">
          <h2 className="better-view__aside-title">{L(cv, lang, "projects", "Projetos")}</h2>
          {(sections.projects || []).map((project) => (
            <article className="bv-card" key={project.id || pick(lang, project.name)}>
              <h3 className="bv-card__title">
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    {pick(lang, project.name)}
                  </a>
                ) : (
                  pick(lang, project.name)
                )}
              </h3>
              <p className="bv-card__body">{pick(lang, project.summary)}</p>
            </article>
          ))}
        </section>

        <section data-panel="education">
          <h2 className="better-view__aside-title">{L(cv, lang, "education", "Formação")}</h2>
          {(sections.education || []).map((edu) => (
            <article className="bv-card" key={edu.id || pick(lang, edu.degree)}>
              <h3 className="bv-card__title">{pick(lang, edu.degree)}</h3>
              <p className="bv-card__meta">{pick(lang, edu.institution)}</p>
              <p className="bv-card__meta">{pick(lang, edu.period)}</p>
              {pick(lang, edu.note) || pick(lang, edu.summary) ? (
                <p className="bv-card__body">{pick(lang, edu.note) || pick(lang, edu.summary)}</p>
              ) : null}
            </article>
          ))}
        </section>

        <section data-panel="education">
          <h2 className="better-view__aside-title">{L(cv, lang, "certifications", "Certificações")}</h2>
          {(sections.certifications || []).map((cert) => (
            <article className="bv-card" key={cert.id || pick(lang, cert.name)}>
              <h3 className="bv-card__title">{pick(lang, cert.name)}</h3>
              <p className="bv-card__meta">{pick(lang, cert.issuer)}</p>
              <p className="bv-card__meta">{pick(lang, cert.period)}</p>
            </article>
          ))}
        </section>

        <section data-panel="tech">
          <h2 className="better-view__aside-title">{L(cv, lang, "skills", "Skills")}</h2>
          <ul className="bv-chips">
            {(sections.skills?.technical || []).map((skill) => (
              <li key={skill} className="bv-chip">
                {skill}
              </li>
            ))}
          </ul>
          {(sections.skills?.soft || []).length > 0 ? (
            <>
              <h3 className="better-view__aside-title" style={{ marginTop: "1.5rem", fontSize: "1rem" }}>
                {L(cv, lang, "softSkills", "Soft Skills")}
              </h3>
              <ul className="bv-chips">
                {(sections.skills?.soft || []).map((skill, i) => (
                  <li key={i} className="bv-chip">
                    {pick(lang, skill)}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <section data-panel="education">
          <h2 className="better-view__aside-title">{L(cv, lang, "languages", "Idiomas")}</h2>
          {(sections.skills?.languages || []).map((lng, i) => {
            const dots = Number(lng.dots) || 0;
            return (
              <div className="bv-lang" key={i}>
                <div>
                  <div className="bv-lang__name">{pick(lang, lng.name)}</div>
                  <div className="bv-lang__level">{pick(lang, lng.level)}</div>
                </div>
                <div className="bv-lang__dots" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, d) => (
                    <span key={d} className={`bv-lang__dot${d < dots ? " is-filled" : ""}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section data-panel="projects">
          <h2 className="better-view__aside-title">{L(cv, lang, "hobbies", "Hobbies")}</h2>
          <ul className="bv-hobbies">
            {(pick(lang, sections.hobbies) || []).map((hobby, i) => (
              <li key={i}>{hobby}</li>
            ))}
          </ul>
        </section>
      </aside>

      <main className="better-view__main">
        <section data-panel="experience" className="work-experience-section">
          <h2 className="better-view__section-title">
            {L(cv, lang, "experience", "Experiência Profissional")}
          </h2>
          {(sections.experience || []).map((job) => {
            const bullets = pick(lang, job.bullets) || [];
            const company = pick(lang, job.company);
            const collapsed = bullets.length > 3;
            return (
              <article className="bv-job" key={job.id || company}>
                <h3 className="bv-job__title">{pick(lang, job.title)}</h3>
                <p className="bv-job__company">
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {company}
                    </a>
                  ) : (
                    company
                  )}
                </p>
                <p className="bv-job__location">{pick(lang, job.location)}</p>
                <p className="bv-job__period">{pick(lang, job.period)}</p>
                {pick(lang, job.summary) ? (
                  <p className="bv-job__summary">{pick(lang, job.summary)}</p>
                ) : null}
                {collapsed ? (
                  <details className="bv-job__more">
                    <summary className="bv-job__more-summary">
                      <span className="bv-job__more-open">{seeMore}</span>
                    </summary>
                    <ul className="bv-job__bullets">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    {Array.isArray(job.technologies) && job.technologies.length ? (
                      <p className="bv-job__tech">
                        <strong>{lang === "en" ? "Technologies:" : "Tecnologias:"}</strong>{" "}
                        {job.technologies.join(", ")}
                      </p>
                    ) : null}
                  </details>
                ) : (
                  <>
                    {bullets.length ? (
                      <ul className="bv-job__bullets">
                        {bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                    {Array.isArray(job.technologies) && job.technologies.length ? (
                      <p className="bv-job__tech">
                        <strong>{lang === "en" ? "Technologies:" : "Tecnologias:"}</strong>{" "}
                        {job.technologies.join(", ")}
                      </p>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
        </section>
      </main>

      <nav className="better-view__mobile-nav" aria-label="Sections">
        {MOBILE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`mobile-nav__item${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
          >
            <span className="mobile-nav__icon" aria-hidden="true">
              {t.icon}
            </span>
            <span>{lang === "en" ? t.en : t.pt}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
