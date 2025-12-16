/**
 * ============================================
 * MOBILE MANAGER
 * ============================================
 * 
 * Handles mobile navigation and section toggling
 * 
 * Responsibilities:
 * - Show/hide sections on mobile
 * - Handle mobile navigation clicks
 * - Prevent auto-scroll on mobile
 */

/**
 * Shows a specific section on mobile
 * @param {string} sectionName - Name of the section to show
 */
function showSection(sectionName) {
    // Don't handle mobile navigation for ATS-Friendly or Star Wars templates
    if (document.body.classList.contains('ats-friendly-template') ||
        document.body.classList.contains('star-wars-template')) {
        return;
    }

    // Remove active from all nav items
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Hide all sections
    document.querySelectorAll('.sidebar-section, .profile-section, .contact-section, .work-experience-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Remove duplicate mobile headers
    document.querySelectorAll('.mobile-header-section').forEach(header => {
        header.remove();
    });

    // Add active to nav item
    const navItem = document.querySelector(`.mobile-nav-item[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Handle section mapping for mobile
    if (sectionName === 'about') {
        // About: profile + contact + summary
        const profileSection = document.querySelector('.profile-section');
        const contactSection = document.querySelector('.contact-section');
        const summarySection = document.querySelector('[data-section="summary"]');
        
        if (profileSection) {
            profileSection.classList.add('active');
            addMobileHeader(profileSection);
        }
        if (contactSection) {
            contactSection.classList.add('active');
        }
        if (summarySection) {
            summarySection.classList.add('active');
        }
    } else if (sectionName === 'tech') {
        // Tech: skills + achievements
        const skillsSection = document.querySelector('[data-section="skills"]');
        const achievementsSection = document.querySelector('[data-section="achievements"]');
        
        if (skillsSection) {
            skillsSection.classList.add('active');
            addMobileHeader(skillsSection);
        }
        if (achievementsSection) {
            achievementsSection.classList.add('active');
        }
    } else if (sectionName === 'education') {
        // Education: education + certifications + languages
        const educationSection = document.querySelector('[data-section="education"]');
        const certificationsSection = document.querySelector('[data-section="certifications"]');
        const languagesSection = document.querySelector('[data-section="languages"]');
        
        if (educationSection) {
            educationSection.classList.add('active');
            addMobileHeader(educationSection);
        }
        if (certificationsSection) {
            certificationsSection.classList.add('active');
        }
        if (languagesSection) {
            languagesSection.classList.add('active');
        }
    } else if (sectionName === 'projects') {
        // Projects: projects + hobbies
        const projectsSection = document.querySelector('[data-section="projects"]');
        const hobbiesSection = document.querySelector('[data-section="hobbies"]');
        
        if (projectsSection) {
            projectsSection.classList.add('active');
            addMobileHeader(projectsSection);
        }
        if (hobbiesSection) {
            hobbiesSection.classList.add('active');
        }
    } else if (sectionName === 'experience') {
        // Experience: work experience
        const experienceSection = document.querySelector('[data-section="experience"]');
        if (experienceSection) {
            experienceSection.classList.add('active');
        }
        // Header já está no main-content para experiência
    } else {
        // Fallback: try to find section by data-section attribute
        const section = document.querySelector(`[data-section="${sectionName}"]`);
        if (section) {
            section.classList.add('active');
            addMobileHeader(section);
        }
    }
}

/**
 * Adds mobile header to a section
 * @param {HTMLElement} sectionEl - Section element
 */
function addMobileHeader(sectionEl) {
    if (!sectionEl) return;

    // Remove existing header if any
    const existingHeader = sectionEl.querySelector('.mobile-header-section');
    if (existingHeader) {
        existingHeader.remove();
    }

    // Get name and tagline for header
    const nameEl = document.getElementById('name');
    const taglineEl = document.getElementById('tagline');
    
    if (nameEl && taglineEl) {
        // Create header duplicate
        const header = document.createElement('header');
        header.className = 'mobile-header-section';
        header.innerHTML = `
            <h1 class="name">${nameEl.textContent}</h1>
            <div class="tagline">${taglineEl.textContent}</div>
        `;
        // Insert before section, ensuring it's the first element
        if (sectionEl.parentNode) {
            sectionEl.parentNode.insertBefore(header, sectionEl);
        }
    }
}

/**
 * Initializes mobile navigation
 * Waits for content to be rendered before showing sections
 */
function initializeMobile() {
    // Don't initialize if ATS-Friendly or Star Wars
    if (document.body.classList.contains('ats-friendly-template') ||
        document.body.classList.contains('star-wars-template')) {
        return;
    }
    
    if (window.innerWidth <= 768) {
        // Wait for content to be rendered - check multiple elements
        const checkContent = () => {
            const profileSection = document.querySelector('.profile-section');
            const contactSection = document.querySelector('.contact-section');
            const summarySection = document.querySelector('[data-section="summary"]');
            
            // Check if all required elements for "about" section exist and have content
            // More robust check: verify elements exist AND have meaningful content
            const hasProfile = profileSection && (
                profileSection.querySelector('.profile-image, #profile-image') || 
                (profileSection.textContent && profileSection.textContent.trim().length > 10)
            );
            const hasContact = contactSection && contactSection.textContent && contactSection.textContent.trim().length > 5;
            const hasSummary = summarySection && summarySection.textContent && summarySection.textContent.trim().length > 10;
            
            // Also check if data is loaded
            const dataLoaded = window.cvData && window.descriptions;
            
            // If we have data loaded AND at least one section with content, we can show
            if (dataLoaded && (hasProfile || hasContact || hasSummary)) {
                // Hide all sections first
                document.querySelectorAll('.sidebar-section, .profile-section, .contact-section, .work-experience-section').forEach(sec => {
                    sec.classList.remove('active');
                });
                // Show about section
                showSection('about');
            } else {
                // Retry after a short delay if content not ready (max 20 attempts = 2 seconds)
                if (checkContent.attempts === undefined) checkContent.attempts = 0;
                checkContent.attempts++;
                if (checkContent.attempts < 20) {
                    setTimeout(checkContent, 100);
                } else {
                    // After max attempts, show anyway (fallback) - content might be loading
                    document.querySelectorAll('.sidebar-section, .profile-section, .contact-section, .work-experience-section').forEach(sec => {
                        sec.classList.remove('active');
                    });
                    showSection('about');
                }
            }
        };
        
        // Start checking after DOM updates - use requestAnimationFrame to ensure renderCV completed
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(checkContent, 100);
            });
        });
    }
}

// Initialize on resize
let lastScrollTop = 0;
let isScrolling = false;
let scrollTimeout = null;
let isUserScrolling = false;

window.addEventListener('scroll', function() {
    if (document.body.classList.contains('ats-friendly-template') ||
        document.body.classList.contains('star-wars-template')) {
        return;
    }
    
    // Only handle on mobile
    if (window.innerWidth > 768) {
        return;
    }
    
    // Mark that user is actively scrolling
    isUserScrolling = true;
    
    // Clear any pending scroll timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // Prevent auto-scroll to top on mobile when reaching top or bottom
    // Only prevent if we're actually at the boundaries
    const isAtTop = currentScrollTop <= 5;
    const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 5;
    
    // Don't interfere with normal scrolling, only prevent unwanted jumps
    if ((isAtTop && lastScrollTop > 100) || (isAtBottom && lastScrollTop < scrollHeight - clientHeight - 100)) {
        // This might be an unwanted jump, but don't prevent it immediately
        // Just track the position
    }
    
    lastScrollTop = currentScrollTop;
    
    // Reset scroll tracking after a delay
    scrollTimeout = setTimeout(() => {
        lastScrollTop = currentScrollTop;
        isUserScrolling = false;
    }, 500);
});

window.addEventListener('resize', function() {
    if (document.body.classList.contains('ats-friendly-template') ||
        document.body.classList.contains('star-wars-template')) {
        return;
    }
    
    if (window.innerWidth <= 768) {
        // Only show 'about' if no section is active AND user is not actively scrolling
        // This prevents jumping back to 'about' when user is scrolling in experience section
        const hasActive = document.querySelector('.sidebar-section.active, .profile-section.active, .work-experience-section.active');
        if (!hasActive && !isUserScrolling) {
            showSection('about');
        }
    }
});

// Export to global scope - replace stubs
const realShowSection = showSection;
window.showSection = function(sectionName) {
    return realShowSection(sectionName);
};
window.showSection._realShowSection = realShowSection; // Mark as real implementation
window.addMobileHeader = addMobileHeader;
window.initializeMobile = initializeMobile;

