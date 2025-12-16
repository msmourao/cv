/* ============================================
   TEMPLATE MANAGEMENT SYSTEM
   ============================================ */

const TemplateManager = {
    currentTemplate: 'better-view',
    
    async loadTemplate(templateName = 'better-view') {
        try {
            const response = await fetch(`templates/${templateName}.html`);
            if (!response.ok) {
                throw new Error(`Template ${templateName} not found`);
            }
            const html = await response.text();
            const wrapper = document.querySelector('.resume-wrapper');
            if (wrapper) {
                // Para Star Wars, não esconder resume-wrapper (ele não é usado)
                // O Star Wars usa star-wars-container que está dentro do HTML do template
                if (templateName !== 'star-wars') {
                    wrapper.style.opacity = '0';
                    wrapper.style.visibility = 'hidden';
                } else {
                    // Para Star Wars, garantir que resume-wrapper está visível (mesmo que não seja usado)
                    // mas o star-wars-container é o que realmente aparece
                    wrapper.style.visibility = 'visible';
                    wrapper.style.opacity = '1';
                    // IMPORTANTE: Para Star Wars, NÃO mexer no overlay aqui
                    // O overlay será gerenciado pelo ThemeManager.selectTemplate()
                }
                
                wrapper.innerHTML = html;
                this.currentTemplate = templateName;
                
                // Para Star Wars, garantir que star-wars-container está visível desde o início
                if (templateName === 'star-wars') {
                    const starWarsContainer = document.querySelector('.star-wars-container');
                    if (starWarsContainer) {
                        // Container deve estar visível desde o início com estrelas
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
                } else {
                    // Para outros templates, aguardar renderização antes de mostrar
                    void wrapper.offsetHeight;
                    requestAnimationFrame(() => {
                        wrapper.style.visibility = 'visible';
                        wrapper.style.opacity = '1';
                    });
                }
                
                // Dispatch event for other scripts to react
                document.dispatchEvent(new CustomEvent('templateLoaded', { 
                    detail: { template: templateName } 
                }));
            }
        } catch (error) {
            console.error('Error loading template:', error);
            // Fallback to better-view if template fails
            if (templateName !== 'better-view') {
                await this.loadTemplate('better-view');
            }
        }
    },
    
    /**
     * Gerencia o overlay de loading
     */
    manageOverlay(show = false) {
        const overlay = document.getElementById('template-loading-overlay');
        if (!overlay) return;
        
        if (show) {
            overlay.style.display = 'block';
            overlay.classList.remove('hidden');
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.zIndex = '10001';
            void overlay.offsetHeight; // Forçar reflow
        } else {
            // Se não for Star Wars, esconder imediatamente
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            overlay.style.zIndex = '-1';
        }
    },
    
    /**
     * Gerencia a visibilidade do wrapper
     */
    manageWrapper(show = true) {
        // Para Star Wars, não mexer no resume-wrapper
        const isStarWars = document.body.classList.contains('star-wars-template');
        if (isStarWars) {
            return; // Star Wars usa star-wars-container, não resume-wrapper
        }
        
        const wrapper = document.querySelector('.resume-wrapper');
        if (!wrapper) return;
        
        if (show) {
            wrapper.style.display = '';
            wrapper.style.opacity = '1';
            wrapper.style.visibility = 'visible';
        } else {
            wrapper.style.opacity = '0';
            wrapper.style.visibility = 'hidden';
            wrapper.style.display = 'none';
        }
    },
    
    async init() {
        const savedTemplate = localStorage.getItem('cv-template');
        
        // NUNCA carregar Star Wars automaticamente no init
        // Star Wars só deve ser carregado quando o usuário seleciona explicitamente
        // Mesmo com a query string enableStarWars=true, não deve carregar automaticamente
        let templateToLoad = savedTemplate || 'better-view';
        
        // Se Star Wars estava salvo, usar better-view como padrão
        if (templateToLoad === 'star-wars') {
            templateToLoad = 'better-view';
            localStorage.setItem('cv-template', 'better-view');
        }
        
        // Gerenciar overlay e wrapper (nunca Star Wars no init)
        this.manageOverlay(false);
        
        // Load template (sempre better-view ou outro, nunca Star Wars)
        await this.loadTemplate(templateToLoad);
        
        // Esconder overlay e garantir que resume-wrapper está visível
        this.manageOverlay(false);
        this.manageWrapper(true);
    }
};

// Expor globalmente
window.TemplateManager = TemplateManager;

