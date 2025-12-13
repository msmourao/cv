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
        { id: 'better-view', name: { pt: 'Padrão', en: 'Default' } },
        { id: 'ats-friendly', name: { pt: 'ATS-friendly', en: 'ATS-friendly' } },
        { id: 'star-wars', name: { pt: 'Star Wars', en: 'Star Wars' } }
    ],
    
    /**
     * Verifica se Star Wars está habilitado via query string
     */
    isStarWarsEnabled() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('enableStarWars') === 'true';
    },
    
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
        
        // Se o template salvo for Star Wars mas não estiver habilitado, usar better-view
        if (savedTemplate && this.templates.find(t => t.id === savedTemplate)) {
            if (savedTemplate === 'star-wars' && !this.isStarWarsEnabled()) {
                // Se Star Wars não estiver habilitado, usar better-view
                this.currentTemplate = 'better-view';
                localStorage.setItem('cv-template', 'better-view');
            } else {
                this.currentTemplate = savedTemplate;
            }
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
        } else if (this.currentTemplate === 'star-wars' && this.isStarWarsEnabled()) {
            // Só aplicar Star Wars se estiver habilitado via query string
            document.body.classList.add('star-wars-template');
            document.body.classList.remove('ats-friendly-template');
            const swCss = document.getElementById('star-wars-css');
            if (swCss) swCss.disabled = false;
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = true;
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
        } else {
            // Se Star Wars estava salvo mas não está habilitado, usar better-view
            if (this.currentTemplate === 'star-wars') {
                this.currentTemplate = 'better-view';
                localStorage.setItem('cv-template', 'better-view');
                this.applyColorScheme(this.currentColorScheme);
            }
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
        // Não aplicar cores se o template ATS-friendly ou Star Wars estiver ativo
        if (this.currentTemplate === 'ats-friendly' || this.currentTemplate === 'star-wars') {
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
        
        // Verificar se Star Wars está habilitado antes de permitir seleção
        if (templateId === 'star-wars' && !this.isStarWarsEnabled()) {
            console.warn('Star Wars template requer enableStarWars=true na URL');
            return;
        }
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        this.currentTemplate = templateId;
        localStorage.setItem('cv-template', templateId);
        
        // Mostrar overlay de loading apenas para Star Wars
        const overlay = document.getElementById('template-loading-overlay');
        if (overlay && templateId === 'star-wars') {
            overlay.style.display = 'block';
            overlay.classList.remove('hidden');
            // Forçar reflow para garantir que o overlay apareça
            void overlay.offsetHeight;
        }
        
        // Carregar template
        if (window.TemplateManager) {
            const templateName = templateId === 'better-view' ? 'better-view' : 
                                templateId === 'ats-friendly' ? 'ats-friendly' : 
                                templateId === 'star-wars' ? 'star-wars' :
                                'better-view';
            await window.TemplateManager.loadTemplate(templateName);
        }
        
        // Para Star Wars, o overlay será removido quando o crawl iniciar
        // Para outros templates, esconder imediatamente
        if (overlay && templateId !== 'star-wars') {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                }
            }, 300);
        }
        
        // Aplicar estilos específicos do template
        this.applyTemplateStyles(templateId);
        
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
        
        // Aplicar preset Vader se for Star Wars
        if (templateId === 'star-wars' && window.TTS && window.TTS.applyPreset) {
            window.TTS.applyPreset('vader');
        } else if (templateId !== 'star-wars' && window.TTS && window.TTS.isPresetActive('vader')) {
            // Remover preset Vader se sair do tema Star Wars
            window.TTS.applyPreset(null);
        }
    },
    
    selectColorScheme(schemeId) {
        // Não aplicar se ATS-friendly ou Star Wars estiver ativo
        if (this.currentTemplate === 'ats-friendly' || this.currentTemplate === 'star-wars') {
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
        
        // Template Options (Radio buttons)
        // Filtrar Star Wars se não estiver habilitado via query string
        const availableTemplates = this.templates.filter(template => {
            if (template.id === 'star-wars') {
                return this.isStarWarsEnabled();
            }
            return true;
        });
        
        const templateOptionsHTML = availableTemplates
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
        
        // Color Scheme Options (Visual preview - desabilitados se ATS-friendly ou Star Wars)
        const colorSchemeOptionsHTML = this.colorSchemes.map(scheme => {
            const isActive = scheme.id === this.currentColorScheme;
            return `
                <div class="color-scheme-option ${isActive ? 'active' : ''} ${disableColors ? 'disabled' : ''}" 
                     data-scheme="${scheme.id}"
                     onclick="${disableColors ? '' : `ThemeManager.selectColorScheme('${scheme.id}')`}">
                    <div class="color-scheme-preview" data-scheme="${scheme.id}">
                        <div class="color-preview-color"></div>
                        <div class="color-preview-color"></div>
                        <div class="color-preview-color"></div>
                        <div class="color-preview-color"></div>
                    </div>
                    <span class="color-scheme-name">${scheme.name[lang]}</span>
                    ${isActive ? '<i class="bi bi-check-circle color-scheme-check"></i>' : ''}
                </div>
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
            const checkIcon = option.querySelector('.color-scheme-check');
            if (schemeId === this.currentColorScheme) {
                option.classList.add('active');
                if (!checkIcon) {
                    const icon = document.createElement('i');
                    icon.className = 'bi bi-check-circle color-scheme-check';
                    option.appendChild(icon);
                }
            } else {
                option.classList.remove('active');
                if (checkIcon) {
                    checkIcon.remove();
                }
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
