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
                wrapper.innerHTML = html;
                this.currentTemplate = templateName;
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
        // Load saved template or default to better-view
        const savedTemplate = localStorage.getItem('cv-template');
        if (savedTemplate) {
            await this.loadTemplate(savedTemplate);
        } else {
            await this.loadTemplate('better-view');
        }
    }
};

// Expor globalmente
window.TemplateManager = TemplateManager;

