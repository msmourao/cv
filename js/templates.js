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
                // Esconder conteúdo completamente durante carregamento (especialmente para Star Wars)
                if (templateName === 'star-wars') {
                    wrapper.style.display = 'none';
                    wrapper.style.opacity = '0';
                    wrapper.style.visibility = 'hidden';
                }
                
                wrapper.innerHTML = html;
                this.currentTemplate = templateName;
                
                // Aguardar renderização antes de mostrar
                if (templateName === 'star-wars') {
                    // Forçar múltiplos reflows para garantir renderização completa
                    void wrapper.offsetHeight;
                    requestAnimationFrame(() => {
                        void wrapper.offsetHeight;
                        requestAnimationFrame(() => {
                            // Mostrar wrapper mas ainda invisível até o crawl começar
                            wrapper.style.display = '';
                            wrapper.style.opacity = '0';
                            wrapper.style.visibility = 'hidden';
                        });
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
            void overlay.offsetHeight; // Forçar reflow
        } else {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                }
            }, 300);
        }
    },
    
    /**
     * Gerencia a visibilidade do wrapper
     */
    manageWrapper(show = true) {
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
        const isStarWars = savedTemplate === 'star-wars';
        
        // Gerenciar overlay e wrapper baseado no template
        this.manageOverlay(isStarWars);
        if (isStarWars) {
            this.manageWrapper(false);
        }
        
        // Load saved template or default to better-view
        if (savedTemplate) {
            await this.loadTemplate(savedTemplate);
        } else {
            await this.loadTemplate('better-view');
        }
        
        // Esconder overlay se não for Star Wars
        if (!isStarWars) {
            this.manageOverlay(false);
        }
    }
};

// Expor globalmente
window.TemplateManager = TemplateManager;

