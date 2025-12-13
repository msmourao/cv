/* ============================================
   THEME & TEMPLATE MANAGEMENT SYSTEM
   ============================================ */

const ThemeManager = {
    // Reduzido para apenas 3 esquemas de cores
    colorSchemes: [
        { id: 'blue', name: { pt: 'Azul', en: 'Blue' } },
        { id: 'red', name: { pt: 'Vermelho', en: 'Red' } },
        { id: 'dark', name: { pt: 'Escuro', en: 'Dark' } }
    ],
    
    // Templates disponíveis
    templates: [
        { id: 'better-view', name: { pt: 'Better-view', en: 'Better-view' } },
        { id: 'ats-friendly', name: { pt: 'ATS-friendly', en: 'ATS-friendly' } }
    ],
    
    currentColorScheme: 'blue',
    currentTemplate: 'better-view',
    currentLang: 'pt',
    
    init(lang = 'pt') {
        this.currentLang = lang;
        // Load saved preferences
        const savedColorScheme = localStorage.getItem('cv-color-scheme');
        const savedTemplate = localStorage.getItem('cv-template');
        
        if (savedColorScheme && this.colorSchemes.find(c => c.id === savedColorScheme)) {
            this.currentColorScheme = savedColorScheme;
        }
        if (savedTemplate && this.templates.find(t => t.id === savedTemplate)) {
            this.currentTemplate = savedTemplate;
        }
        
        // Aplicar template salvo
        if (this.currentTemplate === 'ats-friendly') {
            document.body.classList.add('ats-friendly-template');
            document.body.classList.remove('star-wars-template');
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = false;
            const swCss = document.getElementById('star-wars-css');
            if (swCss) swCss.disabled = true;
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
        } else if (this.currentTemplate === 'star-wars') {
            document.body.classList.add('star-wars-template');
            document.body.classList.remove('ats-friendly-template');
            const swCss = document.getElementById('star-wars-css');
            if (swCss) swCss.disabled = false;
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = true;
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
        } else {
            document.body.classList.remove('ats-friendly-template');
            document.body.classList.remove('star-wars-template');
            this.applyColorScheme(this.currentColorScheme);
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = true;
            const swCss = document.getElementById('star-wars-css');
            if (swCss) swCss.disabled = true;
        }
        
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            this.renderThemeMenu();
        }, 100);
    },
    
    applyColorScheme(schemeId) {
        // Não aplicar cores se o template ATS-friendly estiver ativo
        if (this.currentTemplate === 'ats-friendly') {
            return;
        }
        
        this.currentColorScheme = schemeId;
        document.documentElement.setAttribute('data-theme', schemeId);
        document.body.setAttribute('data-theme', schemeId);
        localStorage.setItem('cv-color-scheme', schemeId);
        this.updateActiveColorSchemeOption();
    },
    
    async selectTemplate(templateId) {
        // Não fazer nada se for placeholder
        if (templateId === 'placeholder') {
            return;
        }
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        this.currentTemplate = templateId;
        localStorage.setItem('cv-template', templateId);
        
        // Carregar template
        if (window.TemplateManager) {
            const templateName = templateId === 'better-view' ? 'better-view' : 
                                templateId === 'ats-friendly' ? 'ats-friendly' : 
                                'better-view';
            await window.TemplateManager.loadTemplate(templateName);
        }
        
        // Se for ATS-friendly, remover tema de cores e aplicar estilos
        if (templateId === 'ats-friendly') {
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
            document.body.classList.add('ats-friendly-template');
            // Habilitar CSS do ATS-friendly
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = false;
        } else {
            document.body.classList.remove('ats-friendly-template');
            // Desabilitar CSS do ATS-friendly
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = true;
            this.applyColorScheme(this.currentColorScheme);
        }
        
        this.renderThemeMenu();
        this.updateActiveTemplateOption();
        this.toggleThemeMenu(); // Fechar menu após seleção
        
        // Recarregar dados após mudança de template
        if (typeof loadData === 'function') {
            await loadData();
            if (typeof renderCV === 'function') {
                renderCV();
            }
            if (typeof initializeMobile === 'function') {
                initializeMobile();
            }
        }
    },
    
    selectColorScheme(schemeId) {
        // Não aplicar se ATS-friendly estiver ativo
        if (this.currentTemplate === 'ats-friendly') {
            return;
        }
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.applyColorScheme(schemeId);
        this.renderThemeMenu();
        this.toggleThemeMenu(); // Fechar menu após seleção
    },
    
    renderThemeMenu() {
        const menu = document.getElementById('theme-menu');
        if (!menu) return;
        
        const lang = this.currentLang;
        const isATS = this.currentTemplate === 'ats-friendly';
        const isStarWars = this.currentTemplate === 'star-wars';
        const disableColors = isATS || isStarWars;
        
        // Template Options (Radio buttons) - esconder Star Wars
        const templateOptionsHTML = this.templates
            .filter(template => !template.hidden)
            .map(template => {
                const isActive = template.id === this.currentTemplate;
                return `
                    <label class="template-option ${isActive ? 'active' : ''}" 
                           data-template="${template.id}">
                        <input type="radio"
                               name="template"
                               value="${template.id}"
                               ${isActive ? 'checked' : ''}
                               onclick="ThemeManager.selectTemplate('${template.id}')">
                        <span class="template-name">${template.name[lang]}</span>
                    </label>
                `;
            }).join('');
        
        // Color Scheme Options (Checkboxes - desabilitados se ATS-friendly ou Star Wars)
        const colorSchemeOptionsHTML = this.colorSchemes.map(scheme => {
            const isActive = scheme.id === this.currentColorScheme;
            return `
                <label class="color-scheme-option ${isActive ? 'active' : ''} ${disableColors ? 'disabled' : ''}" 
                       data-scheme="${scheme.id}">
                    <input type="checkbox" 
                           ${isActive ? 'checked' : ''}
                           ${disableColors ? 'disabled' : ''}
                           onchange="ThemeManager.selectColorScheme('${scheme.id}')">
                    <div class="color-scheme-preview" data-scheme="${scheme.id}">
                        <div class="color-preview-color"></div>
                        <div class="color-preview-color"></div>
                        <div class="color-preview-color"></div>
                        <div class="color-preview-color"></div>
                    </div>
                    <span class="color-scheme-name">${scheme.name[lang]}</span>
                </label>
            `;
        }).join('');
        
        menu.innerHTML = `
            <div class="theme-menu-section">
                <div class="theme-menu-section-title">${lang === 'pt' ? 'Opções de Template' : 'Theme Options'}</div>
                <div class="template-options">
                    ${templateOptionsHTML}
                </div>
            </div>
            <div class="theme-menu-divider"></div>
            <div class="theme-menu-section">
                <div class="theme-menu-section-title">${lang === 'pt' ? 'Esquema de Cores' : 'Color Scheme'}</div>
                <div class="color-scheme-options">
                    ${colorSchemeOptionsHTML}
                </div>
            </div>
        `;
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
            
            // Render menu if empty
            if (menu.innerHTML.trim() === '') {
                this.renderThemeMenu();
            }
        }
    },
    
    updateActiveColorSchemeOption() {
        const menu = document.getElementById('theme-menu');
        if (!menu) return;
        
        const options = menu.querySelectorAll('.color-scheme-option');
        options.forEach(option => {
            const schemeId = option.getAttribute('data-scheme');
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (schemeId === this.currentColorScheme) {
                option.classList.add('active');
                if (checkbox) checkbox.checked = true;
            } else {
                option.classList.remove('active');
                if (checkbox) checkbox.checked = false;
            }
        });
    },
    
    updateActiveTemplateOption() {
        const menu = document.getElementById('theme-menu');
        if (!menu) return;
        
        const options = menu.querySelectorAll('.template-option');
        options.forEach(option => {
            const templateId = option.getAttribute('data-template');
            const radio = option.querySelector('input[type="radio"]');
            if (templateId === this.currentTemplate) {
                option.classList.add('active');
                if (radio) radio.checked = true;
            } else {
                option.classList.remove('active');
                if (radio) radio.checked = false;
            }
        });
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
