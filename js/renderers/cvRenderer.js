/**
 * ============================================
 * CV RENDERER
 * ============================================
 * 
 * Handles rendering of CV content for Better View and ATS-Friendly templates
 * 
 * Responsibilities:
 * - Render personal information
 * - Render work experience, education, certifications
 * - Render tech stack, languages, projects, hobbies
 * - Update SEO metadata
 */

/**
 * Formats date string to MM/yyyy format
 * @param {string} dateStr - Date string to format
 * @param {string} lang - Language code ('pt' or 'en')
 * @returns {string} Formatted date string
 */
function formatDateToMMYYYY(dateStr, lang) {
    const monthMapPt = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    const monthMapEn = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    
    const monthMap = lang === 'pt' ? monthMapPt : monthMapEn;
    const present = lang === 'pt' ? 'Presente' : 'Present';
    
    if (dateStr.includes('–') || dateStr.includes('—') || dateStr.includes('-')) {
        const separator = dateStr.includes('–') ? '–' : (dateStr.includes('—') ? '—' : '-');
        const parts = dateStr.split(separator).map(s => s.trim());
        
        const formatPart = (part) => {
            if (part.toLowerCase() === present.toLowerCase()) {
                return lang === 'pt' ? 'Presente' : 'Present';
            }
            const words = part.toLowerCase().split(' ');
            if (words.length >= 2) {
                const month = words[0];
                const year = words[1];
                const monthNum = monthMap[month] || month;
                return `${monthNum}/${year}`;
            }
            return part;
        };
        
        return `${formatPart(parts[0])} - ${formatPart(parts[1])}`;
    }
    
    return dateStr;
}

/**
 * Renders the complete CV content
 * Updates all sections with data from window.cvData and window.descriptions
 */
function renderCV() {
    if (!window.cvData || !window.descriptions) return;

    const currentLang = window.currentLang || 'pt';
    const cvData = window.cvData;
    const descriptions = window.descriptions;

    // Update SEO metadata
    const pageTitle = descriptions.seo ? descriptions.seo.title : (currentLang === 'pt' ? 'Currículo - Marcelo Mourão' : 'Resume - Marcelo Mourão');
    const pageDescription = descriptions.seo ? descriptions.seo.description : (currentLang === 'pt' ? 'Desenvolvedor Sênior e Arquiteto de Software com mais de 15 anos de experiência' : 'Senior Developer and Software Architect with over 15 years of experience');
    
    document.getElementById('page-title').textContent = pageTitle;
    
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDescription = document.getElementById('twitter-description');
    const metaDescription = document.getElementById('meta-description');
    
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);
    if (ogDescription) ogDescription.setAttribute('content', pageDescription);
    if (twitterTitle) twitterTitle.setAttribute('content', pageTitle);
    if (twitterDescription) twitterDescription.setAttribute('content', pageDescription);
    if (metaDescription) metaDescription.setAttribute('content', pageDescription);

    // Check active template
    const isATSFriendly = document.body.classList.contains('ats-friendly-template');
    const isStarWars = document.body.classList.contains('star-wars-template');
    
    // Render header
    const nameEl = document.getElementById('name');
    const taglineEl = document.getElementById('tagline');
    if (nameEl) {
        if (isStarWars) {
            nameEl.textContent = cvData.personal.name.toUpperCase();
        } else {
            nameEl.textContent = cvData.personal.name;
        }
    }
    if (taglineEl) taglineEl.textContent = cvData.personal.tagline[currentLang];
    
    // Render profile image (not for ATS-Friendly)
    if (!isATSFriendly) {
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            let photoPath = cvData.personal.photo;
            if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
                photoPath = './' + photoPath.split('/').pop();
            } else if (!photoPath.startsWith('./')) {
                photoPath = './' + photoPath;
            }
            profileImage.src = photoPath;
            profileImage.setAttribute('src', photoPath);
        }
    }
    
    // If Star Wars, render crawl (handled by starWarsRenderer)
    if (isStarWars) {
        if (window.renderStarWarsCrawl) {
            window.renderStarWarsCrawl(cvData, descriptions, currentLang);
        }
        // Apply Vader preset for TTS
        if (window.TTS && window.TTS.applyPreset) {
            window.TTS.applyPreset('vader');
        }
        return; // Star Wars has its own renderer
    }

    // Render contact list
    const phoneNumber = cvData.personal.phone.replace(/[\s\-+]/g, '');
    const whatsappMessage = encodeURIComponent(descriptions.messages.whatsapp);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
    
    const emailSubject = encodeURIComponent(descriptions.messages.email.subject);
    const emailBody = encodeURIComponent(descriptions.messages.email.body);
    const emailUrl = `mailto:${cvData.personal.email}?subject=${emailSubject}&body=${emailBody}`;
    
    const contactListEl = document.getElementById('contact-list');
    if (contactListEl) {
        if (isATSFriendly) {
            // ATS-Friendly: simple contact, no icons, in header
            contactListEl.innerHTML = `
                <ul>
                    <li>${cvData.personal.location[currentLang]}</li>
                    <li>${cvData.personal.phone}</li>
                    <li><a href="${emailUrl}">${cvData.personal.email}</a></li>
                    <li><a href="${cvData.personal.linkedin}" target="_blank">${cvData.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></li>
                    <li><a href="${cvData.personal.github}" target="_blank">${cvData.personal.github.replace(/^https?:\/\/(www\.)?/, '')}</a></li>
                </ul>
            `;
        } else {
            // Better-view: contact with icons in sidebar
            contactListEl.innerHTML = `
                <li class="contact-item"><i class="bi bi-geo-alt"></i><span>${cvData.personal.location[currentLang]}</span></li>
                <li class="contact-item">
                    <a href="${whatsappUrl}" target="_blank">
                        <i class="bi bi-telephone"></i>
                        <i class="bi bi-whatsapp"></i>
                        <span>${cvData.personal.phone}</span>
                    </a>
                </li>
                <li class="contact-item">
                    <a href="${emailUrl}">
                        <i class="bi bi-envelope"></i>
                        <span>${cvData.personal.email}</span>
                    </a>
                </li>
                <li class="contact-item"><a href="${cvData.personal.linkedin}" target="_blank"><i class="bi bi-linkedin"></i> <span>${cvData.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span></a></li>
                <li class="contact-item"><a href="${cvData.personal.github}" target="_blank"><i class="bi bi-github"></i> <span>${cvData.personal.github.replace(/^https?:\/\/(www\.)?/, '')}</span></a></li>
            `;
        }
    }

    // Render section titles
    const sectionSummary = document.getElementById('section-summary');
    const sectionAchievements = document.getElementById('section-key-achievements');
    const sectionWork = document.getElementById('section-work');
    const sectionTech = document.getElementById('section-tech');
    const sectionEducation = document.getElementById('section-education');
    const sectionCertifications = document.getElementById('section-certifications');
    const sectionLanguages = document.getElementById('section-languages');
    const sectionProjects = document.getElementById('section-projects');
    const sectionHobbies = document.getElementById('section-hobbies');
    
    if (sectionSummary) sectionSummary.textContent = descriptions.sections.summary;
    if (sectionAchievements) sectionAchievements.textContent = descriptions.sections.keyAchievements;
    if (sectionWork) sectionWork.textContent = descriptions.sections.workExperience;
    if (sectionTech) sectionTech.textContent = descriptions.sections.techStack;
    if (sectionEducation) sectionEducation.textContent = descriptions.sections.education;
    if (sectionCertifications && descriptions.sections.certifications) {
        sectionCertifications.textContent = descriptions.sections.certifications;
    }
    if (sectionLanguages) sectionLanguages.textContent = descriptions.sections.languages;
    if (sectionProjects) sectionProjects.textContent = descriptions.sections.projects;
    if (sectionHobbies) sectionHobbies.textContent = descriptions.sections.hobbies;
    
    // Update button labels
    if (descriptions.buttons) {
        const shareButton = document.getElementById('share-button-title');
        const printButton = document.getElementById('print-button-title');
        const whatsappLabel = document.getElementById('share-whatsapp-label');
        const emailLabel = document.getElementById('share-email-label');
        const linkedinLabel = document.getElementById('share-linkedin-label');
        
        if (shareButton) shareButton.title = descriptions.buttons.share;
        if (printButton) printButton.title = descriptions.buttons.print;
        if (whatsappLabel && descriptions.buttons.shareOptions) whatsappLabel.textContent = descriptions.buttons.shareOptions.whatsapp;
        if (emailLabel && descriptions.buttons.shareOptions) emailLabel.textContent = descriptions.buttons.shareOptions.email;
        if (linkedinLabel && descriptions.buttons.shareOptions) linkedinLabel.textContent = descriptions.buttons.shareOptions.linkedin;
    }

    // Render summary
    const summaryText = document.getElementById('summary-text');
    if (summaryText) summaryText.textContent = descriptions.about;

    // Render tech stack
    const techStack = document.getElementById('tech-stack');
    if (techStack) {
        techStack.innerHTML = cvData.techStack.map(tech => 
            `<li>${tech}</li>`
        ).join('');
    }

    // Update mobile navigation labels (not for ATS-Friendly)
    if (!isATSFriendly) {
        const navLabels = currentLang === 'pt' 
            ? { about: 'Sobre', tech: 'Tech', education: 'Formação', projects: 'Projetos', experience: 'Experiência' }
            : { about: 'About', tech: 'Tech', education: 'Education', projects: 'Projects', experience: 'Experience' };
        const navAbout = document.getElementById('mobile-nav-about');
        const navTech = document.getElementById('mobile-nav-tech');
        const navEducation = document.getElementById('mobile-nav-education');
        const navProjects = document.getElementById('mobile-nav-projects');
        const navExperience = document.getElementById('mobile-nav-experience');
        
        if (navAbout) navAbout.textContent = navLabels.about;
        if (navTech) navTech.textContent = navLabels.tech;
        if (navEducation) navEducation.textContent = navLabels.education;
        if (navProjects) navProjects.textContent = navLabels.projects;
        if (navExperience) navExperience.textContent = navLabels.experience;
    }

    // Render key achievements
    if (descriptions.keyAchievements) {
        const keyAchievementsEl = document.getElementById('key-achievements');
        if (keyAchievementsEl) {
            const keyAchievementsHTML = descriptions.keyAchievements.map(achievement => `
                <div class="key-achievement-item">
                    <i class="bi ${achievement.icon} key-achievement-icon"></i>
                    <div class="key-achievement-content">
                        <h4>${achievement.title}</h4>
                        <p>${achievement.description}</p>
                    </div>
                </div>
            `).join('');
            keyAchievementsEl.innerHTML = keyAchievementsHTML;
        }
    }

    // Render work experience
    const workExp = document.getElementById('work-experience');
    if (workExp) {
        workExp.innerHTML = cvData.workExperience.map(job => {
            const jobDesc = descriptions.workExperience[job.key];
            if (!jobDesc) return '';
            
            const location = job.location ? job.location[currentLang] : '';
            const formattedPeriod = formatDateToMMYYYY(job.period[currentLang], currentLang);
            
            return `
                <article class="timeline-item">
                    <div class="timeline-header">
                        <div class="timeline-header-row">
                            <div class="timeline-header-left">
                                <h3 class="timeline-title">${job.title[currentLang]}</h3>
                            </div>
                            <div class="timeline-header-right">
                                <div class="timeline-period">${formattedPeriod}</div>
                            </div>
                        </div>
                        <div class="timeline-header-row">
                            <div class="timeline-header-left">
                                <div class="timeline-company">${typeof job.company === 'object' ? job.company[currentLang] : job.company}</div>
                            </div>
                            <div class="timeline-header-right">
                                ${location ? `<div class="timeline-location"><i class="bi bi-geo-alt-fill"></i> ${location}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="timeline-content">
                        <p>${jobDesc.description}</p>
                        <ul>
                            ${jobDesc.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                        </ul>
                        <div class="technologies-box">
                            <strong>${currentLang === 'pt' ? 'Tecnologias e ferramentas:' : 'Technologies and tools:'}</strong> ${jobDesc.technologies}
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    // Render education
    const education = document.getElementById('education');
    if (education) {
        education.innerHTML = cvData.education.map(edu => `
            <div class="education-item">
                <div class="education-title">${edu.title[currentLang]}</div>
                <div class="education-institution">${edu.institution}</div>
                <div class="education-period">${edu.period[currentLang]}</div>
                ${edu.note ? `<div class="education-period" style="font-style: italic; margin-top: 0.25rem;">${edu.note[currentLang]}</div>` : ''}
            </div>
        `).join('');
    }

    // Render certifications
    const certifications = document.getElementById('certifications');
    if (certifications && cvData.certifications) {
        certifications.innerHTML = cvData.certifications.map(cert => {
            const certName = cert.name && typeof cert.name === 'object' ? cert.name[currentLang] : (cert.name || '');
            const certIssuer = cert.issuer && typeof cert.issuer === 'object' ? cert.issuer[currentLang] : (cert.issuer || '');
            const certYear = cert.year || '';
            
            return `
                <div class="certification-item">
                    <div class="certification-name">${certName}</div>
                    ${certIssuer ? `<div class="certification-issuer">${certIssuer}</div>` : ''}
                    ${certYear ? `<div class="certification-year">${certYear}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Render languages
    const languages = document.getElementById('languages');
    if (languages) {
        languages.innerHTML = cvData.languages.map(lang => {
            const dots = Array(5).fill(0).map((_, i) => 
                `<div class="language-dot ${i < lang.dots ? 'filled' : ''}"></div>`
            ).join('');
            
            return `
                <div class="language-item">
                    <div class="language-info">
                        <div class="language-name">${lang.name[currentLang]}</div>
                        <div class="language-level">${lang.level[currentLang]}</div>
                    </div>
                    <div class="language-dots">${dots}</div>
                </div>
            `;
        }).join('');
    }

    // Render projects
    const projects = document.getElementById('projects');
    if (projects) {
        projects.innerHTML = cvData.projects.map(proj => {
            const projDesc = descriptions.projects[proj.key];
            if (!projDesc) return '';
            
            return `
                <div class="project-item">
                    <div class="project-title">${projDesc.name}</div>
                    <div class="project-description">${projDesc.description}</div>
                </div>
            `;
        }).join('');
    }

    // Render hobbies
    const hobbies = document.getElementById('hobbies');
    if (hobbies) {
        hobbies.innerHTML = cvData.hobbies.map(hobby => 
            `<li>${hobby[currentLang]}</li>`
        ).join('');
    }
}

// Export to global scope
window.renderCV = renderCV;

