/* ============================================
   THEME MANAGEMENT SYSTEM
   ============================================ */

const ThemeManager = {
    themes: [
        { id: 'teal', name: { pt: 'Verde-água', en: 'Teal' } },
        { id: 'blue', name: { pt: 'Azul', en: 'Blue' } },
        { id: 'purple', name: { pt: 'Roxo', en: 'Purple' } },
        { id: 'green', name: { pt: 'Verde', en: 'Green' } },
        { id: 'orange', name: { pt: 'Laranja', en: 'Orange' } },
        { id: 'red', name: { pt: 'Vermelho', en: 'Red' } },
        { id: 'dark', name: { pt: 'Escuro', en: 'Dark' } }
    ],
    
    currentTheme: 'teal',
    currentLang: 'pt',
    
    init(lang = 'pt') {
        this.currentLang = lang;
        // Load saved theme or use default
        const savedTheme = localStorage.getItem('cv-theme');
        if (savedTheme && this.themes.find(t => t.id === savedTheme)) {
            this.currentTheme = savedTheme;
        }
        this.applyTheme(this.currentTheme);
        this.renderThemeMenu();
    },
    
    applyTheme(themeId) {
        this.currentTheme = themeId;
        document.documentElement.setAttribute('data-theme', themeId);
        document.body.setAttribute('data-theme', themeId);
        localStorage.setItem('cv-theme', themeId);
        this.updateActiveThemeOption();
    },
    
    renderThemeMenu() {
        const menu = document.getElementById('theme-menu');
        if (!menu) return;
        
        const themeOptionsHTML = this.themes.map(theme => {
            const isActive = theme.id === this.currentTheme;
            return `
                <div class="theme-option ${isActive ? 'active' : ''}" 
                     data-theme="${theme.id}" 
                     onclick="ThemeManager.selectTheme('${theme.id}')">
                    <div class="theme-preview" data-theme="${theme.id}">
                        <div class="theme-preview-color"></div>
                        <div class="theme-preview-color"></div>
                        <div class="theme-preview-color"></div>
                        <div class="theme-preview-color"></div>
                    </div>
                    <span class="theme-name">${theme.name[this.currentLang]}</span>
                    ${isActive ? '<i class="bi bi-check-circle theme-check"></i>' : ''}
                </div>
            `;
        }).join('');
        
        menu.innerHTML = `
            <div class="theme-menu-title">${this.currentLang === 'pt' ? 'Temas' : 'Themes'}</div>
            ${themeOptionsHTML}
        `;
    },
    
    selectTheme(themeId) {
        this.applyTheme(themeId);
        this.renderThemeMenu();
    },
    
    updateLanguage(lang) {
        this.currentLang = lang;
        this.renderThemeMenu();
    },
    
    toggleThemeMenu() {
        const menu = document.getElementById('theme-menu');
        if (menu) {
            menu.classList.toggle('show');
            // Close other menus
            const shareMenu = document.getElementById('share-menu');
            if (shareMenu) shareMenu.classList.remove('show');
        }
    }
};

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-button-wrapper') && !e.target.closest('.theme-menu')) {
        const menu = document.getElementById('theme-menu');
        if (menu) menu.classList.remove('show');
    }
    if (!e.target.closest('.share-button-wrapper') && !e.target.closest('.share-menu')) {
        const menu = document.getElementById('share-menu');
        if (menu) menu.classList.remove('show');
    }
});

