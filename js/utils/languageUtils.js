/**
 * Language Utilities
 * Handles language detection and switching
 */

/**
 * Detects the language to use based on URL parameters or browser settings
 * @returns {string} Language code ('pt' or 'en')
 */
export function detectLanguage() {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('language');
    
    if (langParam === 'pt' || langParam === 'en') {
        return langParam;
    }
    
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) {
        return 'pt';
    }
    return 'en';
}

/**
 * Switches the application language
 * @param {string} lang - Language code ('pt' or 'en')
 */
export async function switchLanguage(lang) {
    if (window.currentLang === lang) return;
    
    window.currentLang = lang;
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    
    // Update language buttons
    if (window.updateLanguageButtons) {
        window.updateLanguageButtons();
    }
    
    // Notify Theme Manager
    if (window.ThemeManager && window.ThemeManager.updateLanguage) {
        window.ThemeManager.updateLanguage(lang);
    }
    
    // Notify TTS about language change
    if (window.TTS) {
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    // Reload data with new language
    if (window.loadData) {
        await window.loadData();
    }
}

/**
 * Updates the active state of language buttons
 */
export function updateLanguageButtons() {
    const ptBtn = document.getElementById('lang-pt');
    const enBtn = document.getElementById('lang-en');
    const currentLang = window.currentLang || 'pt';
    
    if (ptBtn) {
        if (currentLang === 'pt') {
            ptBtn.classList.add('active');
        } else {
            ptBtn.classList.remove('active');
        }
    }
    
    if (enBtn) {
        if (currentLang === 'en') {
            enBtn.classList.add('active');
        } else {
            enBtn.classList.remove('active');
        }
    }
}

// Export to global scope for inline onclick handlers
window.detectLanguage = detectLanguage;
window.switchLanguage = switchLanguage;
window.updateLanguageButtons = updateLanguageButtons;

