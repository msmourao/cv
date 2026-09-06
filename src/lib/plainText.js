/**
 * Plain-text CV export — same reading order as AtsDocument DOM.
 */

import { pick } from "./i18n.js";

function label(cv, lang, key, fallback) {
  const labels = pick(lang, cv?.ui?.labels) || {};
  return labels[key] || fallback;
}

function joinContact(personal) {
  const parts = [];
  if (personal?.email) parts.push(personal.email);
  if (personal?.phone) parts.push(personal.phone);
  if (personal?.links?.linkedin) parts.push(personal.links.linkedin);
  if (personal?.links?.github) parts.push(personal.links.github);
  if (personal?.links?.website) parts.push(personal.links.website);
  return parts.join(" | ");
}

function bulletsOf(job, lang) {
  const raw = pick(lang, job?.bullets);
  return Array.isArray(raw) ? raw : [];
}

/**
 * @param {object} cv
 * @param {string} lang
 * @returns {string}
 */
export function buildPlainText(cv, lang = "pt") {
  if (!cv) return "";

  const personal = cv.personal || {};
  const sections = cv.sections || {};
  const lines = [];

  const push = (text) => {
    if (text == null || text === "") return;
    lines.push(String(text));
  };
  const blank = () => {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
  };

  push(personal.name || "");
  push(pick(lang, personal.tagline));
  const location = pick(lang, personal.location);
  if (location) push(location);
  push(joinContact(personal));
  blank();

  // About
  const about = pick(lang, sections.about);
  if (about) {
    push(label(cv, lang, "about", lang === "en" ? "Summary" : "Resumo"));
    push(about);
    blank();
  }

  // Achievements
  const achievements = sections.achievements || [];
  if (achievements.length) {
    push(label(cv, lang, "achievements", lang === "en" ? "Key Achievements" : "Principais Conquistas"));
    for (const a of achievements) {
      push(pick(lang, a.title));
      push(pick(lang, a.summary));
      blank();
    }
  }

  // Experience
  const experience = sections.experience || [];
  if (experience.length) {
    push(
      label(
        cv,
        lang,
        "professionalExperience",
        lang === "en" ? "Professional Experience" : "Experiência Profissional",
      ),
    );
    for (const job of experience) {
      push(pick(lang, job.title));
      const company = pick(lang, job.company);
      const loc = pick(lang, job.location);
      push([company, loc].filter(Boolean).join(" | "));
      push(pick(lang, job.period));
      const summary = pick(lang, job.summary);
      if (summary) push(summary);
      for (const b of bulletsOf(job, lang)) {
        push(`- ${b}`);
      }
      if (Array.isArray(job.technologies) && job.technologies.length) {
        push(`Technologies: ${job.technologies.join(", ")}`);
      }
      blank();
    }
  }

  // Skills
  const technical = sections.skills?.technical || [];
  const soft = sections.skills?.soft || [];
  if (technical.length || soft.length) {
    push(label(cv, lang, "skills", "Skills"));
    if (technical.length) push(technical.join(", "));
    if (soft.length) {
      push(label(cv, lang, "softSkills", "Soft Skills"));
      push(soft.map((s) => pick(lang, s)).join(", "));
    }
    blank();
  }

  // Education
  const education = sections.education || [];
  if (education.length) {
    push(label(cv, lang, "education", lang === "en" ? "Education" : "Formação"));
    for (const edu of education) {
      push(pick(lang, edu.degree));
      const inst = pick(lang, edu.institution);
      const loc = pick(lang, edu.location);
      push([inst, loc].filter(Boolean).join(" | "));
      push(pick(lang, edu.period));
      const note = pick(lang, edu.note) || pick(lang, edu.summary);
      if (note) push(note);
      blank();
    }
  }

  // Certifications
  const certifications = sections.certifications || [];
  if (certifications.length) {
    push(label(cv, lang, "certifications", lang === "en" ? "Certifications" : "Certificações"));
    for (const cert of certifications) {
      push(pick(lang, cert.name));
      push(pick(lang, cert.issuer));
      push(pick(lang, cert.period));
      const summary = pick(lang, cert.summary);
      if (summary) push(summary);
      blank();
    }
  }

  // Languages
  const languages = sections.skills?.languages || [];
  if (languages.length) {
    push(label(cv, lang, "languages", lang === "en" ? "Languages" : "Idiomas"));
    for (const lng of languages) {
      push(`${pick(lang, lng.name)} — ${pick(lang, lng.level)}`);
    }
    blank();
  }

  // Projects
  const projects = sections.projects || [];
  if (projects.length) {
    push(label(cv, lang, "projects", lang === "en" ? "Projects" : "Projetos"));
    for (const project of projects) {
      push(pick(lang, project.name));
      if (project.url) push(project.url);
      push(pick(lang, project.summary));
      if (Array.isArray(project.technologies) && project.technologies.length) {
        push(`Technologies: ${project.technologies.join(", ")}`);
      }
      blank();
    }
  }

  // Hobbies
  const hobbies = pick(lang, sections.hobbies);
  if (Array.isArray(hobbies) && hobbies.length) {
    push(label(cv, lang, "hobbies", "Hobbies"));
    push(hobbies.join(", "));
  }

  return lines.join("\n").trim() + "\n";
}
