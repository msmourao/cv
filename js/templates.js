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
    
    async init() {
        // Esconder overlay se não for Star Wars
        const overlay = document.getElementById('template-loading-overlay');
        const savedTemplate = localStorage.getItem('cv-template');
        
        // Mostrar overlay apenas se for Star Wars - ANTES de qualquer renderização
        if (overlay && savedTemplate === 'star-wars') {
            overlay.style.display = 'block';
            overlay.classList.remove('hidden');
            overlay.style.opacity = '1';
            // Forçar reflow para garantir que aparece
            void overlay.offsetHeight;
        } else if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
        
        // Esconder wrapper completamente se for Star Wars
        const wrapper = document.querySelector('.resume-wrapper');
        if (wrapper && savedTemplate === 'star-wars') {
            wrapper.style.opacity = '0';
            wrapper.style.visibility = 'hidden';
            wrapper.style.display = 'none';
        }
        
        // Load saved template or default to better-view
        if (savedTemplate) {
            await this.loadTemplate(savedTemplate);
        } else {
            await this.loadTemplate('better-view');
        }
        
        // Esconder overlay após carregamento (se não for Star Wars)
        if (overlay && savedTemplate !== 'star-wars') {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                }
            }, 300);
        }
    }
};

// Expor globalmente
window.TemplateManager = TemplateManager;

