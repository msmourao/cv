import { useCallback, useState } from "react";
import { buildPlainText } from "../../lib/plainText.js";
import { pick } from "../../lib/i18n.js";

function L(cv, lang, key, fallback) {
  const labels = pick(lang, cv?.ui?.labels) || {};
  return labels[key] || fallback;
}

function contactLine(personal, lang) {
  const parts = [];
  const location = pick(lang, personal?.location);
  if (location) parts.push(location);
  if (personal?.email) parts.push(personal.email);
  if (personal?.phone) parts.push(personal.phone);
  if (personal?.links?.linkedin) parts.push(personal.links.linkedin);
  if (personal?.links?.github) parts.push(personal.links.github);
  if (personal?.links?.website) parts.push(personal.links.website);
  return parts.join(" · ");
}

/**
 * ATS / PDF-first document — single column, semantic headings, linear reading order.
 * @param {{ cv: object, lang: string }} props
 */
export default function AtsDocument({ cv, lang }) {
  const [status, setStatus] = useState("");
  const personal = cv?.personal || {};
  const sections = cv?.sections || {};

  const copyText = useCallback(async () => {
    const text = buildPlainText(cv, lang);
    try {
      await navigator.clipboard.writeText(text);
      setStatus(lang === "en" ? "Copied." : "Copiado.");
    } catch {
      setStatus(lang === "en" ? "Copy failed." : "Falha ao copiar.");
    }
  }, [cv, lang]);

  const downloadTxt = useCallback(() => {
    const text = buildPlainText(cv, lang);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (personal.name || "cv").replace(/\s+/g, "-").toLowerCase();
    a.href = url;
    a.download = `${slug}-${lang}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(lang === "en" ? "Downloaded." : "Baixado.");
  }, [cv, lang, personal.name]);

  return (
    <article className="ats-document">
      <div className="ats-chrome">
        <button type="button" className="ats-chrome__btn" onClick={copyText}>
          {L(cv, lang, "copyPlainText", lang === "en" ? "Copy plain text" : "Copiar texto")}
        </button>
        <button type="button" className="ats-chrome__btn" onClick={downloadTxt}>
          {L(cv, lang, "downloadTxt", lang === "en" ? "Download .txt" : "Baixar .txt")}
        </button>
        {status ? (
          <span role="status" aria-live="polite">
            {status}
          </span>
        ) : null}
      </div>

      <h1>{personal.name}</h1>
      <p className="ats-tagline">{pick(lang, personal.tagline)}</p>
      <p className="ats-contact">{contactLine(personal, lang)}</p>

      {pick(lang, sections.about) ? (
        <section>
          <h2>{L(cv, lang, "about", lang === "en" ? "Summary" : "Resumo")}</h2>
          <p>{pick(lang, sections.about)}</p>
        </section>
      ) : null}

      {(sections.achievements || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "achievements", lang === "en" ? "Key Achievements" : "Principais Conquistas")}</h2>
          {(sections.achievements || []).map((a) => (
            <div className="ats-achievement" key={a.id || pick(lang, a.title)}>
              <h3>{pick(lang, a.title)}</h3>
              <p>{pick(lang, a.summary)}</p>
            </div>
          ))}
        </section>
      ) : null}

      {(sections.experience || []).length > 0 ? (
        <section>
          <h2>
            {L(
              cv,
              lang,
              "professionalExperience",
              lang === "en" ? "Professional Experience" : "Experiência Profissional",
            )}
          </h2>
          {(sections.experience || []).map((job) => {
            const company = pick(lang, job.company);
            const location = pick(lang, job.location);
            const bullets = pick(lang, job.bullets) || [];
            return (
              <div className="ats-job" key={job.id || company}>
                <h3>{pick(lang, job.title)}</h3>
                <p>
                  {[company, location].filter(Boolean).join(" | ")}
                </p>
                <p className="ats-period">{pick(lang, job.period)}</p>
                {pick(lang, job.summary) ? <p>{pick(lang, job.summary)}</p> : null}
                {bullets.length > 0 ? (
                  <ul>
                    {bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {Array.isArray(job.technologies) && job.technologies.length > 0 ? (
                  <p className="ats-tech">Technologies: {job.technologies.join(", ")}</p>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {(sections.skills?.technical || []).length > 0 || (sections.skills?.soft || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "skills", "Skills")}</h2>
          {(sections.skills?.technical || []).length > 0 ? (
            <p>{(sections.skills.technical || []).join(", ")}</p>
          ) : null}
          {(sections.skills?.soft || []).length > 0 ? (
            <>
              <h3>{L(cv, lang, "softSkills", "Soft Skills")}</h3>
              <p>{(sections.skills.soft || []).map((s) => pick(lang, s)).join(", ")}</p>
            </>
          ) : null}
        </section>
      ) : null}

      {(sections.education || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "education", lang === "en" ? "Education" : "Formação")}</h2>
          {(sections.education || []).map((edu) => {
            const institution = pick(lang, edu.institution);
            const location = pick(lang, edu.location);
            const note = pick(lang, edu.note) || pick(lang, edu.summary);
            return (
              <div className="ats-edu" key={edu.id || pick(lang, edu.degree)}>
                <h3>{pick(lang, edu.degree)}</h3>
                <p>{[institution, location].filter(Boolean).join(" | ")}</p>
                <p className="ats-period">{pick(lang, edu.period)}</p>
                {note ? <p>{note}</p> : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {(sections.certifications || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "certifications", lang === "en" ? "Certifications" : "Certificações")}</h2>
          {(sections.certifications || []).map((cert) => (
            <div className="ats-cert" key={cert.id || pick(lang, cert.name)}>
              <h3>{pick(lang, cert.name)}</h3>
              <p>{pick(lang, cert.issuer)}</p>
              <p className="ats-period">{pick(lang, cert.period)}</p>
              {pick(lang, cert.summary) ? <p>{pick(lang, cert.summary)}</p> : null}
            </div>
          ))}
        </section>
      ) : null}

      {(sections.skills?.languages || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "languages", lang === "en" ? "Languages" : "Idiomas")}</h2>
          <ul>
            {(sections.skills.languages || []).map((lng, i) => (
              <li key={i}>
                {pick(lang, lng.name)} — {pick(lang, lng.level)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(sections.projects || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "projects", lang === "en" ? "Projects" : "Projetos")}</h2>
          {(sections.projects || []).map((project) => (
            <div className="ats-project" key={project.id || pick(lang, project.name)}>
              <h3>{pick(lang, project.name)}</h3>
              {project.url ? <p>{project.url}</p> : null}
              <p>{pick(lang, project.summary)}</p>
              {Array.isArray(project.technologies) && project.technologies.length > 0 ? (
                <p className="ats-tech">Technologies: {project.technologies.join(", ")}</p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {(pick(lang, sections.hobbies) || []).length > 0 ? (
        <section>
          <h2>{L(cv, lang, "hobbies", "Hobbies")}</h2>
          <p>{(pick(lang, sections.hobbies) || []).join(", ")}</p>
        </section>
      ) : null}
    </article>
  );
}
