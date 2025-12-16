/**
 * ============================================
 * THEME & TEMPLATE MANAGEMENT SYSTEM
 * ============================================
 * 
 * Manages color themes and CV templates.
 * Handles theme switching, template loading, and UI updates.
 * 
 * Features:
 * - Multiple color schemes (Graphite Redline, Pastel Green, Dark Corporate Blue, Dark)
 * - Three CV templates (Better View, ATS-Friendly, Star Wars)
 * - Persistent user preferences via localStorage
 * - Dynamic CSS loading for templates
 * - Star Wars specific animations and effects
 */

const ThemeManager = {
    /**
     * Available color schemes
     * Each scheme has an id and localized name
     */
    colorSchemes: [
        { id: 'graphite-redline', name: { pt: 'Graphite Redline', en: 'Graphite Redline' } },
        { id: 'pastel-green', name: { pt: 'Pastel Green', en: 'Pastel Green' } },
        { id: 'dark-corporate-blue', name: { pt: 'Dark Corporate Blue', en: 'Dark Corporate Blue' } },
        { id: 'dark', name: { pt: 'Escuro', en: 'Dark' } }
    ],
    
    /**
     * Available CV templates
     * Each template has an id and localized name
     */
    templates: [
        { id: 'better-view', name: { pt: 'Padrão', en: 'Default' } },
        { id: 'ats-friendly', name: { pt: 'ATS-friendly', en: 'ATS-friendly' } },
        { id: 'star-wars', name: { pt: 'Star Wars', en: 'Star Wars' } }
    ],
    
    /**
     * Checks if Star Wars template is enabled via query string
     * @returns {boolean} Always returns true (Star Wars is always available)
     * @deprecated Star Wars is now always available, this function is kept for compatibility
     */
    isStarWarsEnabled() {
        return true; // Star Wars is now always available
    },
    
    /** Current color scheme ID */
    currentColorScheme: 'graphite-redline',
    
    /** Current template ID */
    currentTemplate: 'better-view',
    
    /** Current language code ('pt' or 'en') */
    currentLang: 'pt',
    
    /**
     * Initializes the theme manager
     * Loads saved preferences from localStorage and applies them
     * @param {string} lang - Language code ('pt' or 'en')
     */
    init(lang = 'pt') {
        this.currentLang = lang;
        
        // Detectar preferência dark do sistema
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Load saved preferences
        const savedColorScheme = localStorage.getItem('cv-color-scheme');
        const savedTemplate = localStorage.getItem('cv-template');
        
        // Se não houver tema salvo E sistema estiver em modo dark, usar tema dark
        if (!savedColorScheme && prefersDark) {
            this.currentColorScheme = 'dark';
            localStorage.setItem('cv-color-scheme', 'dark');
        } else if (savedColorScheme && this.colorSchemes.find(c => c.id === savedColorScheme)) {
            this.currentColorScheme = savedColorScheme;
        } else {
            // Se não houver tema salvo ou se o tema salvo não existir mais, usar graphite-redline como padrão
            this.currentColorScheme = 'graphite-redline';
        }
        
        // Se o template salvo for Star Wars, NÃO aplicar automaticamente
        // Star Wars só deve ser aplicado quando o usuário seleciona explicitamente
        // Mesmo com a query string enableStarWars=true, não deve carregar automaticamente
        if (savedTemplate && this.templates.find(t => t.id === savedTemplate)) {
            if (savedTemplate === 'star-wars') {
                // Se Star Wars estava salvo, usar better-view como padrão
                // O usuário precisa selecionar explicitamente para ver Star Wars
                this.currentTemplate = 'better-view';
                localStorage.setItem('cv-template', 'better-view');
            } else {
                this.currentTemplate = savedTemplate;
            }
        }
        
        // Aplicar template salvo (NUNCA aplicar Star Wars automaticamente no init)
        if (this.currentTemplate === 'ats-friendly') {
            document.body.classList.add('ats-friendly-template');
            document.body.classList.remove('star-wars-template');
            const atsCss = document.getElementById('ats-friendly-css');
            if (atsCss) atsCss.disabled = false;
            const swCss = document.getElementById('star-wars-css');
            if (swCss) swCss.disabled = true;
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
        } else {
            // Sempre usar better-view como padrão (nunca Star Wars no init)
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
    
    /**
     * Applies a color scheme to the document
     * @param {string} schemeId - Color scheme ID to apply
     */
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
    
    /**
     * Selects and loads a CV template
     * @param {string} templateId - Template ID to load ('better-view', 'ats-friendly', or 'star-wars')
     * @returns {Promise<void>}
     */
    async selectTemplate(templateId) {
        // Não fazer nada se for placeholder
        if (templateId === 'placeholder') {
            return;
        }
        
        // Verificar se Star Wars está habilitado antes de permitir seleção
        // Star Wars is now always available, no check needed
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        this.currentTemplate = templateId;
        localStorage.setItem('cv-template', templateId);
        
        // Para Star Wars: esconder avatar e lightsaber antes de carregar template
        // A animação cuidará de exibi-los novamente
        if (templateId === 'star-wars') {
            const photoContainer = document.querySelector('.sw-photo-container');
            const profileImage = document.querySelector('.sw-profile-image, #profile-image');
            const lightsaber = document.querySelector('.sw-lightsaber');
            
            if (photoContainer) {
                photoContainer.style.display = 'none';
                photoContainer.style.visibility = 'hidden';
                photoContainer.style.opacity = '0';
            }
            
            if (profileImage) {
                profileImage.style.display = 'none';
                profileImage.style.visibility = 'hidden';
                profileImage.style.opacity = '0';
            }
            
            if (lightsaber) {
                lightsaber.style.display = 'none';
                lightsaber.style.visibility = 'hidden';
                lightsaber.style.opacity = '0';
            }
        }
        
        // Mostrar overlay de loading apenas para Star Wars
        const overlay = document.getElementById('template-loading-overlay');
        if (overlay && templateId === 'star-wars') {
            overlay.style.display = 'block';
            overlay.style.opacity = '1';
            overlay.classList.remove('hidden');
            // Forçar reflow para garantir que o overlay apareça (especialmente no mobile)
            void overlay.offsetHeight;
            requestAnimationFrame(() => {
                void overlay.offsetHeight;
            });
        }
        
        // Carregar template
        if (window.TemplateManager) {
            const templateName = templateId === 'better-view' ? 'better-view' : 
                                templateId === 'ats-friendly' ? 'ats-friendly' : 
                                templateId === 'star-wars' ? 'star-wars' :
                                'better-view';
            await window.TemplateManager.loadTemplate(templateName);
        }
        
        // Para Star Wars, MANTER overlay visível - será gerenciado pela animação
        // Para outros templates, esconder imediatamente
        if (overlay && templateId !== 'star-wars') {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                }
            }, 300);
        } else if (overlay && templateId === 'star-wars') {
            // Garantir que overlay está visível para Star Wars
            overlay.style.display = 'block';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.zIndex = '10001';
            overlay.classList.remove('hidden');
        }
        
        // Aplicar estilos específicos do template
        this.applyTemplateStyles(templateId);
        
        this.renderThemeMenu();
        this.updateActiveTemplateOption();
        this.toggleThemeMenu(); // Fechar menu após seleção
        
        // Recarregar dados após mudança de template
        // Aguardar um pouco para garantir que o template foi carregado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (typeof window.loadData === 'function') {
            await window.loadData();
            
            // Verificar se é primeira vez selecionando Star Wars
            if (templateId === 'star-wars') {
                // Atualizar texto do botão Repeat Intro
                this.updateRepeatIntroButtonText();
                
                const hasSeenIntro = localStorage.getItem('sw-intro-seen');
                // Verificar explicitamente se é null, undefined, ou string vazia
                if (hasSeenIntro === null || hasSeenIntro === undefined || hasSeenIntro === '') {
                    // Primeira vez - mostrar animação de introdução
                    await this.showStarWarsIntro();
                    // Setar flag APENAS após a intro completar completamente
                    localStorage.setItem('sw-intro-seen', 'true');
                } else {
                    // Já viu - pular animação e iniciar normalmente
                    await this.startStarWarsNormal();
                }
            } else {
                // Outros templates - garantir que renderCV foi chamado
                // loadData já chama renderCV, mas vamos garantir
                if (typeof window.renderCV === 'function') {
                    window.renderCV();
                }
                if (typeof window.initializeMobile === 'function' && templateId !== 'ats-friendly') {
                    window.initializeMobile();
                }
            }
        } else {
            // Se loadData não estiver disponível, tentar renderizar diretamente
            if (typeof window.renderCV === 'function') {
                window.renderCV();
            }
        }
        
        // Aplicar preset Vader se for Star Wars e garantir controles retraídos
        if (templateId === 'star-wars' && window.TTS && window.TTS.applyPreset) {
            // Garantir que controles avançados estão retraídos
            const ttsAdvancedControls = document.getElementById('tts-advanced-controls');
            const ttsToggleBtn = document.getElementById('tts-toggle-advanced');
            if (ttsAdvancedControls) {
                ttsAdvancedControls.classList.remove('show');
            }
            if (ttsToggleBtn) {
                ttsToggleBtn.classList.remove('expanded');
            }
            window.TTS.applyPreset('vader');
        } else if (templateId !== 'star-wars' && window.TTS && window.TTS.isPresetActive('vader')) {
            // Remover preset Vader se sair do tema Star Wars
            window.TTS.applyPreset(null);
        }
    },
    
    /**
     * Selects a color scheme
     * @param {string} schemeId - Color scheme ID to select
     */
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
    
    /**
     * Applies template-specific styles
     * @param {string} templateId - Template ID ('better-view', 'ats-friendly', or 'star-wars')
     */
    applyTemplateStyles(templateId) {
        // Remover atributos de tema padrão
        document.documentElement.removeAttribute('data-theme');
        document.body.removeAttribute('data-theme');
        
        // Obter referências aos CSS
        const atsCss = document.getElementById('ats-friendly-css');
        const swCss = document.getElementById('star-wars-css');
        
        if (templateId === 'ats-friendly') {
            document.body.classList.add('ats-friendly-template');
            document.body.classList.remove('star-wars-template');
            if (atsCss) atsCss.disabled = false;
            if (swCss) swCss.disabled = true;
        } else if (templateId === 'star-wars') {
            document.body.classList.add('star-wars-template');
            document.body.classList.remove('ats-friendly-template');
            if (swCss) swCss.disabled = false;
            if (atsCss) atsCss.disabled = true;
        } else {
            document.body.classList.remove('ats-friendly-template');
            document.body.classList.remove('star-wars-template');
            if (atsCss) atsCss.disabled = true;
            if (swCss) swCss.disabled = true;
            this.applyColorScheme(this.currentColorScheme);
        }
    },
    
    /**
     * Renders the theme menu with current options
     */
    renderThemeMenu() {
        const menu = document.getElementById('theme-menu');
        if (!menu) return;
        
        const lang = this.currentLang;
        const isATS = this.currentTemplate === 'ats-friendly';
        const isStarWars = this.currentTemplate === 'star-wars';
        const disableColors = isATS || isStarWars;
        
        // Template Options - Star Wars is now always available
        const templateOptionsHTML = this.templates
            .map(template => {
                const isActive = template.id === this.currentTemplate;
                const isStarWars = template.id === 'star-wars';
                return `
                    <div class="template-option ${isActive ? 'active' : ''}" 
                         data-template="${template.id}"
                         onclick="ThemeManager.selectTemplate('${template.id}')">
                        <span class="template-name ${isStarWars ? 'sw-template-name' : ''}">${template.name[lang]}</span>
                        ${isActive ? '<i class="bi bi-check-circle template-check"></i>' : ''}
                    </div>
                `;
            }).join('');
        
        // Color Scheme Options
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
        
        // Build menu HTML
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
    
    /**
     * Updates the current language and re-renders the theme menu
     * @param {string} lang - Language code ('pt' or 'en')
     */
    updateLanguage(lang) {
        this.currentLang = lang;
        this.renderThemeMenu();
        this.updateRepeatIntroButtonText();
    },
    
    /**
     * Updates the Repeat Intro button text based on current language
     * (No longer needed since button is icon-only, but keeping for compatibility)
     */
    updateRepeatIntroButtonText() {
        const repeatBtn = document.getElementById('sw-repeat-intro');
        if (repeatBtn) {
            // Update title attribute for accessibility
            const titles = {
                pt: 'Repetir Intro',
                en: 'Repeat Intro'
            };
            repeatBtn.setAttribute('title', titles[this.currentLang] || titles.pt);
        }
    },
    
    /**
     * Toggles the theme menu visibility
     */
    toggleThemeMenu() {
        const menu = document.getElementById('theme-menu');
        if (menu) {
            // Render menu if empty or if it doesn't have content
            if (menu.innerHTML.trim() === '' || !menu.querySelector('.theme-menu-section')) {
                this.renderThemeMenu();
            }
            
            menu.classList.toggle('show');
            // Close other menus
            const shareMenu = document.getElementById('share-menu');
            if (shareMenu) shareMenu.classList.remove('show');
        }
    },
    
    /**
     * Updates the active state of color scheme options in the menu
     */
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
    
    /**
     * Updates the active state of template options in the menu
     */
    updateActiveTemplateOption() {
        const menu = document.getElementById('theme-menu');
        if (!menu) return;
        
        const options = menu.querySelectorAll('.template-option');
        options.forEach(option => {
            const templateId = option.getAttribute('data-template');
            const checkIcon = option.querySelector('.template-check');
            if (templateId === this.currentTemplate) {
                option.classList.add('active');
                if (!checkIcon) {
                    const icon = document.createElement('i');
                    icon.className = 'bi bi-check-circle template-check';
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
    
    /**
     * Shows Star Wars intro animation (first time only)
     * @returns {Promise<void>}
     */
    async showStarWarsIntro() {
        const overlay = document.getElementById('template-loading-overlay');
        const introText = document.getElementById('sw-intro-text');
        const logoAnimation = document.getElementById('sw-logo-animation');
        
        if (!overlay || !introText || !logoAnimation) {
            return;
        }
        
        // Garantir que overlay está visível e com z-index alto
        overlay.style.display = 'block';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        overlay.style.zIndex = '10001';
        overlay.classList.remove('hidden');
        void overlay.offsetHeight; // Forçar reflow
        
        // Obter nome e tagline do JSON
        let userName = 'MARCELO MOURÃO';
        let userTagline = 'Desenvolvedor Sênior e Arquiteto de Software';
        try {
            const dataResponse = await fetch('cv-data.json');
            if (dataResponse.ok) {
                const cvData = await dataResponse.json();
                if (cvData.personal && cvData.personal.name) {
                    userName = cvData.personal.name.toUpperCase();
                }
                if (cvData.personal && cvData.personal.tagline) {
                    const currentLang = this.currentLang || 'pt';
                    userTagline = typeof cvData.personal.tagline === 'object' 
                        ? cvData.personal.tagline[currentLang] 
                        : cvData.personal.tagline;
                }
            }
        } catch (e) {
            console.error('Erro ao carregar nome:', e);
        }
        
        // Preencher sw-name e sw-title no overlay
        const swNameEl = document.getElementById('sw-name');
        const swTitleEl = document.getElementById('sw-title');
        if (swNameEl) {
            swNameEl.textContent = userName;
        }
        if (swTitleEl) {
            swTitleEl.textContent = userTagline;
        }
        
        // Marcar que a música será iniciada pela animação ANTES de qualquer coisa
        // para evitar que o autoplay normal seja executado
        window._swMusicStartedByIntro = true;
        
        // Obter texto introdutório baseado no idioma
        const currentLang = this.currentLang || 'pt';
        const introTexts = {
            pt: 'Há muito tempo, em uma galáxia muito, muito distante...',
            en: 'A long time ago, in a galaxy far, far away...'
        };
        const introTextContent = introTexts[currentLang] || introTexts.pt;
        
        // Mostrar texto introdutório
        introText.textContent = introTextContent;
        introText.style.display = 'block';
        introText.style.visibility = 'visible';
        introText.style.opacity = '1';
        introText.classList.remove('hide');
        introText.classList.add('show');
        void introText.offsetHeight; // Forçar reflow
        
        // Aguardar 3 segundos e fazer fade out
        await new Promise(resolve => setTimeout(resolve, 3000));
        introText.classList.remove('show');
        introText.classList.add('hide');
        
        // Aguardar fade out completar
        await new Promise(resolve => setTimeout(resolve, 2000));
        introText.style.display = 'none';
        
        // NÃO remover overlay ainda - será removido depois do logo aparecer
        // O logo tem z-index maior, então pode aparecer acima do overlay
        
        // Renderizar CV antes de mostrar elementos
        if (typeof window.renderCV === 'function') {
            window.renderCV();
        }
        
        // Garantir que resume-wrapper está visível (mesmo que não seja usado no Star Wars)
        // O star-wars-container é o que realmente aparece, mas resume-wrapper precisa estar visível
        const resumeWrapper = document.querySelector('.resume-wrapper');
        if (resumeWrapper) {
            resumeWrapper.style.visibility = 'visible';
            resumeWrapper.style.opacity = '1';
            resumeWrapper.style.display = '';
        }
        
        // Garantir que star-wars-container está visível desde o início (com estrelas)
        // Usar star-wars-container ao invés de resume-wrapper para não interferir com outros templates
        const starWarsContainer = document.querySelector('.star-wars-container');
        const header = document.querySelector('.sw-header');
        const actionButtons = document.querySelector('.action-buttons');
        const crawlContainer = document.querySelector('.sw-crawl-container');
        
        // Container deve estar visível desde o início com background preto e estrelas
        if (starWarsContainer) {
            starWarsContainer.style.display = '';
            starWarsContainer.style.opacity = '1';
            starWarsContainer.style.visibility = 'visible';
            starWarsContainer.style.background = '#000';
            starWarsContainer.style.backgroundColor = '#000';
            starWarsContainer.style.position = 'fixed';
            starWarsContainer.style.top = '0';
            starWarsContainer.style.left = '0';
            starWarsContainer.style.zIndex = '1';
        }
        
        // Preparar elementos de conteúdo para fade in (mas mantê-los invisíveis)
        if (header) {
            header.style.opacity = '0';
            header.style.visibility = 'visible';
        }
        
        if (actionButtons) {
            actionButtons.style.opacity = '0';
            actionButtons.style.visibility = 'visible';
        }
        
        if (crawlContainer) {
            crawlContainer.style.opacity = '0';
            crawlContainer.style.visibility = 'visible';
        }
        
        // Garantir que logo está escondido inicialmente
        logoAnimation.style.display = 'none';
        logoAnimation.style.visibility = 'hidden';
        logoAnimation.style.opacity = '0';
        
        // Verificar se fonte está carregada ANTES de configurar o texto
        // Usar font-display: block garante que a fonte seja carregada antes de renderizar
        let fontReady = false;
        if (document.fonts && document.fonts.check) {
            // Verificar especificamente a fonte que vamos usar
            fontReady = document.fonts.check('5rem "SF Distant Galaxy AltOutline"');
        }
        
        // Se fonte não está pronta, aguardar
        if (!fontReady && document.fonts) {
            if (document.fonts.ready) {
                await document.fonts.ready;
                // Verificar novamente após ready
                if (document.fonts.check) {
                    fontReady = document.fonts.check('5rem "SF Distant Galaxy AltOutline"');
                }
            }
            // Se ainda não está pronta, aguardar um pouco mais
            if (!fontReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (document.fonts.check) {
                    fontReady = document.fonts.check('5rem "SF Distant Galaxy AltOutline"');
                }
            }
        }
        
        // AGORA configurar o texto APENAS quando fonte estiver carregada
        // Dividir nome em palavras e colocar cada uma em uma linha
        const nameParts = userName.split(' ');
        logoAnimation.innerHTML = nameParts.map(part => `<div style="line-height: 1; margin: 0; padding: 0;">${part}</div>`).join('');
        
        // NÃO definir fonte dinamicamente - já está definida no CSS com !important
        // A fonte será aplicada automaticamente pelo CSS
        // Forçar reflow para garantir que fonte está aplicada
        void logoAnimation.offsetHeight;
        
        // Garantir z-index alto para aparecer acima do overlay
        logoAnimation.style.zIndex = '10002';
        
        // Resetar animação removendo e adicionando novamente
        logoAnimation.style.animation = 'none';
        logoAnimation.style.webkitAnimation = 'none';
        // GARANTIR que está completamente invisível até estar pronto
        logoAnimation.style.display = 'none';
        logoAnimation.style.opacity = '0';
        logoAnimation.style.visibility = 'hidden';
        logoAnimation.style.transform = 'none';
        logoAnimation.style.webkitTransform = 'none';
        
        // SÓ AGORA preparar para animar - usar clone para medir sem mostrar o original
        await (async () => {
            // Criar clone temporário para medir dimensões sem mostrar o original
            const clone = logoAnimation.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.left = '-9999px';
            clone.style.visibility = 'visible';
            clone.style.display = 'block';
            clone.style.opacity = '1';
            clone.style.transform = 'none';
            clone.style.zIndex = '-9999';
            document.body.appendChild(clone);
            
            // Forçar reflow
            void clone.offsetHeight;
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            
            // Medir dimensões do clone
            const dimensionsBeforeTransform = {
                offsetWidth: clone.offsetWidth,
                offsetHeight: clone.offsetHeight,
                scrollWidth: clone.scrollWidth,
                scrollHeight: clone.scrollHeight
            };
            
            // Remover clone
            document.body.removeChild(clone);
            
            // AGORA preparar o elemento real (ainda completamente invisível)
            logoAnimation.style.display = 'block';
            logoAnimation.style.visibility = 'hidden';
            logoAnimation.style.opacity = '0';
            logoAnimation.style.transform = 'none';
            logoAnimation.style.webkitTransform = 'none';
            
            void logoAnimation.offsetHeight;
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            
            // Verificar se tem dimensões agora
            const currentDims = {
                offsetWidth: logoAnimation.offsetWidth,
                offsetHeight: logoAnimation.offsetHeight
            };
            
            // Usar dimensões do clone se o elemento real ainda não tem
            const finalDims = (dimensionsBeforeTransform.offsetWidth > 0 && dimensionsBeforeTransform.offsetHeight > 0) 
                ? dimensionsBeforeTransform 
                : currentDims;
            
            // Aplicar transform inicial (ainda invisível)
            logoAnimation.style.transform = 'translate(-50%, -50%) scale(3)';
            logoAnimation.style.webkitTransform = 'translate(-50%, -50%) scale(3)';
            
            // Forçar reflow após transform
            void logoAnimation.offsetHeight;
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            
            // AGORA SIM TORNAR VISÍVEL E ANIMAR
            logoAnimation.style.visibility = 'visible';
            logoAnimation.style.opacity = '1';
            logoAnimation.style.display = 'block';
            void logoAnimation.offsetHeight; // Forçar reflow
            
            // AGORA aplicar animação
            logoAnimation.style.animation = 'logoFadeOut 9s ease-out forwards';
            logoAnimation.style.webkitAnimation = 'logoFadeOut 9s ease-out forwards';
        })();
        
        // Aguardar um pouco para garantir que o logo apareceu antes de remover overlay
        await new Promise(r => setTimeout(r, 100));
        
        // Remover overlay AGORA que o logo está aparecendo (logo tem z-index maior)
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.classList.add('hidden');
        overlay.style.zIndex = '-1';
        
        // Iniciar música quando o logo aparece
        // Primeiro garantir que os botões estão no estado correto (play escondido, pause/stop visíveis)
        const playBtn = document.getElementById('sw-play');
        const pauseBtn = document.getElementById('sw-pause');
        const stopBtn = document.getElementById('sw-stop');
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'flex';
        if (stopBtn) stopBtn.style.display = 'flex';
        
        // Marcar que música está tocando antes de chamar swPlayMusic
        if (window.swMusicIsPlaying !== undefined) {
            window.swMusicIsPlaying = true;
        }
        
        if (window.swPlayMusic) {
            window.swPlayMusic(true);
        }
        
        // Iniciar crawl ANTES do logo terminar
        // Frase leva 3s + fade out 2s = 5s, logo aparece e leva 9s
        // Crawl deve iniciar aos 3s após logo aparecer = 5s + 3s = 8s do início total
        const crawlStartDelay = 3000; // 3 segundos após logo aparecer
        setTimeout(() => {
            // Disparar evento para iniciar crawl (como na versão antiga)
            const event = new CustomEvent('startStarWarsCrawl');
            window.dispatchEvent(event);
        }, crawlStartDelay);
        
        // Fade in dos elementos de conteúdo DEPOIS do logo sumir (9 segundos)
        setTimeout(() => {
            if (header) {
                header.style.visibility = 'visible';
                header.classList.add('sw-fade-in-elements');
                header.style.opacity = '';
                void header.offsetHeight;
                setTimeout(() => {
                    header.classList.add('show');
                    header.style.opacity = '';
                    header.style.visibility = 'visible';
                }, 50);
            }
            
            if (actionButtons) {
                actionButtons.style.visibility = 'visible';
                actionButtons.classList.add('sw-fade-in-elements');
                actionButtons.style.opacity = '';
                void actionButtons.offsetHeight;
                setTimeout(() => {
                    actionButtons.classList.add('show');
                    actionButtons.style.opacity = '';
                    actionButtons.style.visibility = 'visible';
                }, 50);
            }
            
            // NÃO tornar crawl visível aqui - ele será controlado pelo startAuto()
            // O crawlContainer e crawl devem permanecer invisíveis até o startAuto() torná-los visíveis
            
            // Garantir que todos os elementos filhos também fiquem visíveis
            // EXCETO os botões do player e o crawl que são controlados separadamente
            const allElements = document.querySelectorAll('.star-wars-container *, .sw-header *');
            allElements.forEach(el => {
                // Pular botões do player - eles são controlados separadamente
                if (el.id === 'sw-play' || el.id === 'sw-pause' || el.id === 'sw-stop' || 
                    el.classList.contains('sw-player-btn') || el.classList.contains('sw-player-controls')) {
                    return;
                }
                
                // Pular crawl e crawl container - eles são controlados pelo startAuto()
                if (el.id === 'sw-crawl' || el.id === 'sw-scene' || el.id === 'sw-crawl-container' ||
                    el.classList.contains('sw-crawl') || el.classList.contains('sw-crawl-container') ||
                    el.closest('.sw-crawl-container') || el.closest('#sw-scene')) {
                    return;
                }
                
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.visibility === 'hidden' || el.style.visibility === 'hidden') {
                    el.style.visibility = 'visible';
                }
                // Garantir que display não seja none
                if (computedStyle.display === 'none' && !el.classList.contains('sw-logo-animation') && !el.classList.contains('sw-intro-text')) {
                    el.style.display = '';
                }
            });
            
            // Garantir que os botões do player estão no estado correto após fade in
            const playBtn = document.getElementById('sw-play');
            const pauseBtn = document.getElementById('sw-pause');
            const stopBtn = document.getElementById('sw-stop');
            if (playBtn && pauseBtn && stopBtn) {
                // Se música está tocando, manter play escondido e pause/stop visíveis
                if (window.swMusicIsPlaying) {
                    playBtn.style.display = 'none';
                    pauseBtn.style.display = 'flex';
                    stopBtn.style.display = 'flex';
                } else {
                    // Se não está tocando, mostrar play e esconder pause
                    playBtn.style.display = 'flex';
                    pauseBtn.style.display = 'none';
                    stopBtn.style.display = 'flex';
                }
            }
            
            // Fazer o fade top overlay aparecer junto com o header
            // Isso fará as estrelas desaparecerem (cobertas pelo gradiente)
            const fadeTop = document.getElementById('sw-crawl-fade-top');
            if (fadeTop) {
                fadeTop.style.visibility = 'visible';
                fadeTop.classList.add('show');
            }
            
            // Também garantir que elementos específicos do Star Wars estejam visíveis
            const swElements = document.querySelectorAll('.sw-name, .sw-tagline');
            swElements.forEach(el => {
                el.style.visibility = 'visible';
                el.style.opacity = '';
            });
            
            // Mostrar avatar e lightsaber junto com fade in do header
            const photoContainer = document.querySelector('.sw-photo-container');
            const profileImage = document.querySelector('.sw-profile-image, #profile-image');
            const lightsaber = document.querySelector('.sw-lightsaber');
            
            if (photoContainer) {
                photoContainer.style.display = 'flex';
                photoContainer.style.visibility = 'visible';
                photoContainer.style.opacity = '0';
                // Adicionar classe para transição suave
                photoContainer.classList.add('sw-fade-in-elements');
                void photoContainer.offsetHeight; // Forçar reflow
                setTimeout(() => {
                    photoContainer.style.opacity = '1';
                }, 50);
            }
            
            if (profileImage) {
                profileImage.style.display = 'block';
                profileImage.style.visibility = 'visible';
                profileImage.style.opacity = '0';
                profileImage.classList.add('show');
                void profileImage.offsetHeight; // Forçar reflow
                setTimeout(() => {
                    profileImage.style.opacity = '1';
                }, 50);
            }
            
            if (lightsaber) {
                lightsaber.style.display = 'block';
                lightsaber.style.visibility = 'visible';
                lightsaber.style.opacity = '0';
                lightsaber.classList.add('show');
                void lightsaber.offsetHeight; // Forçar reflow
                setTimeout(() => {
                    lightsaber.style.opacity = '1';
                }, 50);
            }
        }, 9000); // 9 segundos após logo aparecer (depois que logo sumiu)
        
        // Aguardar animação do logo completar (9 segundos)
        await new Promise(resolve => setTimeout(resolve, 9000));
        logoAnimation.style.display = 'none';
        
        // Remover overlay após animação completar
        if (overlay) {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                    overlay.style.visibility = 'hidden';
                    overlay.style.opacity = '0';
                }
            }, 300);
        }
        
        // Limpar flag após tudo estar completo
        window._swMusicStartedByIntro = false;
    },
    
    /**
     * Starts Star Wars template normally (without intro animation)
     * @returns {Promise<void>}
     */
    async startStarWarsNormal() {
        
        // Resetar estado do audio para garantir que botões funcionem
        const audio = document.getElementById('sw-audio');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            if (window.swMusicIsPlaying !== undefined) {
                window.swMusicIsPlaying = false;
            }
            window._swMusicStartedByIntro = false;
            const playBtn = document.getElementById('sw-play');
            const pauseBtn = document.getElementById('sw-pause');
            const stopBtn = document.getElementById('sw-stop');
            if (playBtn) playBtn.style.display = 'flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'flex';
        }
        
        // Renderizar CV normalmente
        if (typeof window.renderCV === 'function') {
            window.renderCV();
        }
        if (typeof window.initializeMobile === 'function') {
            window.initializeMobile();
        }
        
        // Garantir que overlay está escondido
        const overlay = document.getElementById('template-loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                }
            }, 300);
        }
        
        // Parar qualquer animação em andamento antes de reiniciar
        const crawl = document.getElementById('sw-crawl');
        if (crawl && window.starWarsCrawlState) {
            // Só parar se não estiver inicializando (para evitar race condition)
            if (window.starWarsCrawlState.running && !window.starWarsCrawlState.isInitializing) {
                window.starWarsCrawlState.running = false;
                if (window.starWarsCrawlState.rafId) {
                    cancelAnimationFrame(window.starWarsCrawlState.rafId);
                    window.starWarsCrawlState.rafId = null;
                }
            }
            // Resetar estado completamente
            window.starWarsCrawlState.offsetMs = 0;
            window.starWarsCrawlState.startTime = null;
            // NÃO resetar isInitializing aqui, deixar startAuto() gerenciar
        }
        
        // Mostrar foto e sabre imediatamente (sem animação)
        const photoContainer = document.querySelector('.sw-photo-container');
        const profileImage = document.querySelector('.sw-profile-image, #profile-image');
        const lightsaber = document.querySelector('.sw-lightsaber');
        
        if (photoContainer) {
            photoContainer.style.display = 'flex';
            photoContainer.style.visibility = 'visible';
            photoContainer.style.opacity = '1';
        }
        
        if (profileImage) {
            profileImage.style.display = 'block';
            profileImage.style.visibility = 'visible';
            profileImage.style.opacity = '1';
            profileImage.classList.add('show');
        }
        
        if (lightsaber) {
            lightsaber.style.display = 'block';
            lightsaber.style.visibility = 'visible';
            lightsaber.style.opacity = '1';
            lightsaber.classList.add('show');
        }
        
        // Parar animação atual se estiver rodando
        if (window.starWarsCrawlState && window.starWarsCrawlState.running) {
            window.starWarsCrawlState.running = false;
            if (window.starWarsCrawlState.rafId) {
                cancelAnimationFrame(window.starWarsCrawlState.rafId);
                window.starWarsCrawlState.rafId = null;
            }
        }
        
        // Resetar flag para permitir nova inicialização
        if (typeof window.resetStartAutoFlag === 'function') {
            window.resetStartAutoFlag();
        }
        
        // Aguardar um pouco para garantir que tudo está renderizado
        await new Promise(r => setTimeout(r, 200));
        
        // Aguardar startAuto estar disponível
        let attempts = 0;
        while (typeof window.startAuto !== 'function' && attempts < 20) {
            await new Promise(r => setTimeout(r, 50));
            attempts++;
        }
        
        // Aguardar flag estar liberada antes de chamar startAuto
        attempts = 0;
        while (window.starWarsCrawlState && window.starWarsCrawlState.isInitializing && attempts < 50) {
            await new Promise(r => setTimeout(r, 50));
            attempts++;
        }
        
        // Iniciar crawl - startAuto() já faz todo o reset necessário
        if (typeof window.startAuto === 'function') {
            window.startAuto();
        } else {
            // Se startAuto não estiver disponível, disparar evento
            // O evento será tratado pelo listener em starWarsManager.js
            const event = new CustomEvent('startStarWarsCrawl');
            window.dispatchEvent(event);
        }
    }
};

// Expose ThemeManager to global scope
window.ThemeManager = ThemeManager;

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
