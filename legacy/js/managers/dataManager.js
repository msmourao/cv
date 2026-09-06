/**
 * ============================================
 * DATA MANAGER
 * ============================================
 * 
 * Manages CV data loading, language switching, and rendering
 * 
 * Responsibilities:
 * - Load CV data and descriptions from JSON files
 * - Handle language detection and switching
 * - Coordinate CV rendering across different templates
 */

/**
 * Global data storage
 */
window.cvData = null;
window.descriptions = null;
window.currentLang = 'pt';

/**
 * Loads CV data and descriptions for the current language
 * @returns {Promise<void>}
 */
async function loadData() {
    try {
        const [dataResponse, descResponse] = await Promise.all([
            fetch('cv-data.json'),
            fetch(`cv-descriptions-${window.currentLang}.json`)
        ]);
        
        if (!dataResponse.ok || !descResponse.ok) {
            throw new Error('Failed to load CV data');
        }
        
        window.cvData = await dataResponse.json();
        window.descriptions = await descResponse.json();
        
        // Trigger CV rendering
        if (window.renderCV) {
            window.renderCV();
        }
    } catch (error) {
        console.error('Error loading CV data:', error);
    }
}

/**
 * Switches the application language
 * @param {string} lang - Language code ('pt' or 'en')
 */
async function switchLanguage(lang) {
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
    await loadData();
}

// Export functions to global scope for backward compatibility
window.loadData = loadData;
window.switchLanguage = switchLanguage;

