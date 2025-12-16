/**
 * ============================================
 * STAR WARS RENDERER
 * ============================================
 * 
 * Handles rendering of Star Wars crawl content
 */

/**
 * Renders the Star Wars crawl content
 * @param {Object} cvData - CV data object
 * @param {Object} descriptions - Descriptions object
 * @param {string} lang - Language code ('pt' or 'en')
 */
export function renderStarWarsCrawl(cvData, descriptions, lang) {
    const scroll = document.getElementById('sw-crawl');
    if (!scroll) {
        console.error('[renderStarWarsCrawl] Elemento sw-crawl não encontrado');
        return;
    }
    
    // Limpar conteúdo anterior e garantir que está invisível
    scroll.innerHTML = '';
    scroll.style.transform = 'none';
    scroll.style.visibility = 'hidden';
    scroll.style.opacity = '0';
    
    // Função helper para criar elementos
    function createElement(tag, text, className) {
        const el = document.createElement(tag);
        if (text) el.textContent = text;
        if (className) el.className = className;
        return el;
    }
    
    // Função helper para criar seção com data-section para TTS
    function createSection(sectionId, sectionTitle, contentCallback) {
        const sectionDiv = createElement('div', null, 'sw-crawl-section');
        sectionDiv.setAttribute('data-section', sectionId);
        
        if (sectionTitle) {
            const h3 = createElement('h3', sectionTitle.toUpperCase());
            sectionDiv.appendChild(h3);
        }
        
        if (contentCallback) {
            contentCallback(sectionDiv);
        }
        
        return sectionDiv;
    }
    
    // Summary (começa direto pelo resumo, sem títulos de episódio)
    if (descriptions.about) {
        const summarySection = createSection('summary', null, (section) => {
            const p = createElement('p', descriptions.about);
            section.appendChild(p);
        });
        scroll.appendChild(summarySection);
    }
    
    // Key Achievements
    if (descriptions.sections && descriptions.sections.keyAchievements) {
        const achievementsSection = createSection('achievements', descriptions.sections.keyAchievements, (section) => {
            if (descriptions.keyAchievements && Array.isArray(descriptions.keyAchievements) && descriptions.keyAchievements.length > 0) {
                const ul = createElement('ul');
                descriptions.keyAchievements.forEach(achievement => {
                    if (achievement) {
                        const li = createElement('li');
                        const title = achievement.title ? (typeof achievement.title === 'object' ? achievement.title[lang] : achievement.title) : '';
                        const desc = achievement.description ? (typeof achievement.description === 'object' ? achievement.description[lang] : achievement.description) : '';
                        if (title || desc) {
                            li.innerHTML = title && desc ? `<strong>${title}</strong>: ${desc}` : (title || desc);
                            ul.appendChild(li);
                        }
                    }
                });
                if (ul.children.length > 0) section.appendChild(ul);
            }
        });
        scroll.appendChild(achievementsSection);
    }
    
    // Skills (antes da experiência profissional)
    if (descriptions.sections && descriptions.sections.techStack) {
        const skillsSection = createSection('skills', descriptions.sections.techStack, (section) => {
            if (cvData.techStack && cvData.techStack.length > 0) {
                const ul = createElement('ul');
                cvData.techStack.forEach(skill => {
                    const li = createElement('li', skill);
                    ul.appendChild(li);
                });
                section.appendChild(ul);
            }
        });
        scroll.appendChild(skillsSection);
    }
    
    // Professional Experience
    if (descriptions.sections && descriptions.sections.workExperience) {
        const experienceSection = createSection('experience', descriptions.sections.workExperience, (section) => {
            if (cvData.workExperience && Array.isArray(cvData.workExperience) && cvData.workExperience.length > 0) {
                cvData.workExperience.forEach((job, index) => {
                    if (!job) return;
                    const jobTitle = job.title && typeof job.title === 'object' ? job.title[lang] : (job.title || '');
                    const jobCompany = job.company && typeof job.company === 'object' ? job.company[lang] : (job.company || '');
                    const jobPeriod = job.period && typeof job.period === 'object' ? job.period[lang] : (job.period || '');
                    
                    const p1 = createElement('p');
                    p1.innerHTML = `<strong>${jobTitle}</strong> - ${jobCompany}`;
                    section.appendChild(p1);
                    
                    const p2 = createElement('p', jobPeriod);
                    section.appendChild(p2);
                    
                    if (job.key && descriptions.workExperience && descriptions.workExperience[job.key]) {
                        const jobDesc = descriptions.workExperience[job.key];
                        if (jobDesc && jobDesc.description) {
                            const p3 = createElement('p', jobDesc.description);
                            section.appendChild(p3);
                        }
                    }
                    
                    if (index < cvData.workExperience.length - 1) {
                        const br = createElement('br');
                        section.appendChild(br);
                    }
                });
            }
        });
        scroll.appendChild(experienceSection);
    }
    
    // Education
    if (descriptions.sections && descriptions.sections.education) {
        const educationSection = createSection('education', descriptions.sections.education, (section) => {
            if (cvData.education && cvData.education.length > 0) {
                const ul = createElement('ul');
                cvData.education.forEach(edu => {
                    const title = edu.title ? edu.title[lang] : '';
                    const institution = edu.institution || '';
                    const period = edu.period ? edu.period[lang] : '';
                    const li = createElement('li', `${title} - ${institution} (${period})`);
                    ul.appendChild(li);
                });
                section.appendChild(ul);
            }
        });
        scroll.appendChild(educationSection);
    }
    
    // Certifications
    if (descriptions.sections && descriptions.sections.certifications && cvData.certifications) {
        const certificationsSection = createSection('certifications', descriptions.sections.certifications, (section) => {
            if (cvData.certifications && cvData.certifications.length > 0) {
                cvData.certifications.forEach(cert => {
                    if (!cert) return;
                    const certItem = createElement('div', null, 'certification-item');
                    
                    const certName = cert.name && typeof cert.name === 'object' ? cert.name[lang] : (cert.name || '');
                    const certIssuer = cert.issuer && typeof cert.issuer === 'object' ? cert.issuer[lang] : (cert.issuer || '');
                    const certYear = cert.year || '';
                    
                    const nameDiv = createElement('div', certName, 'certification-name');
                    certItem.appendChild(nameDiv);
                    
                    if (certIssuer) {
                        const issuerDiv = createElement('div', certIssuer, 'certification-issuer');
                        certItem.appendChild(issuerDiv);
                    }
                    
                    if (certYear) {
                        const yearDiv = createElement('div', certYear, 'certification-year');
                        certItem.appendChild(yearDiv);
                    }
                    
                    section.appendChild(certItem);
                });
            }
        });
        scroll.appendChild(certificationsSection);
    }
    
    // Languages
    if (descriptions.sections && descriptions.sections.languages) {
        const languagesSection = createSection('languages', descriptions.sections.languages, (section) => {
            if (cvData.languages && cvData.languages.length > 0) {
                const ul = createElement('ul');
                cvData.languages.forEach(langItem => {
                    const name = langItem.name ? langItem.name[lang] : '';
                    const level = langItem.level ? langItem.level[lang] : '';
                    const li = createElement('li', `${name} - ${level}`);
                    ul.appendChild(li);
                });
                section.appendChild(ul);
            }
        });
        scroll.appendChild(languagesSection);
    }
    
    // Projects
    if (descriptions.sections && descriptions.sections.projects) {
        const projectsSection = createSection('projects', descriptions.sections.projects, (section) => {
            if (cvData.projects && Array.isArray(cvData.projects) && cvData.projects.length > 0) {
                const ul = createElement('ul');
                cvData.projects.forEach(project => {
                    if (!project) return;
                    if (project.key && descriptions.projects && descriptions.projects[project.key]) {
                        const projDesc = descriptions.projects[project.key];
                        const li = createElement('li');
                        let projText = '';
                        
                        // Tentar obter nome e descrição
                        if (projDesc.name) {
                            const name = typeof projDesc.name === 'object' ? projDesc.name[lang] : projDesc.name;
                            projText = name || '';
                        }
                        
                        if (projDesc.description) {
                            const desc = typeof projDesc.description === 'object' ? projDesc.description[lang] : projDesc.description;
                            if (desc) {
                                projText = projText ? `${projText}: ${desc}` : desc;
                            }
                        }
                        
                        if (projText) {
                            li.textContent = projText;
                            ul.appendChild(li);
                        }
                    }
                });
                if (ul.children.length > 0) section.appendChild(ul);
            }
        });
        scroll.appendChild(projectsSection);
    }
    
    // Hobbies
    if (descriptions.sections && descriptions.sections.hobbies) {
        const hobbiesSection = createSection('hobbies', descriptions.sections.hobbies, (section) => {
            if (cvData.hobbies && cvData.hobbies.length > 0) {
                const ul = createElement('ul');
                cvData.hobbies.forEach(hobby => {
                    const li = createElement('li', hobby[lang]);
                    ul.appendChild(li);
                });
                section.appendChild(ul);
            }
        });
        scroll.appendChild(hobbiesSection);
    }
}

window.renderStarWarsCrawl = renderStarWarsCrawl;

