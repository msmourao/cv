/* ============================================
   TEMPLATE MANAGEMENT SYSTEM
   ============================================ */

const TemplateManager = {
    currentTemplate: 'default',
    
    async loadTemplate(templateName = 'default') {
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
            // Fallback to default if template fails
            if (templateName !== 'default') {
                await this.loadTemplate('default');
            }
        }
    },
    
    async init() {
        // Load default template
        const savedTemplate = localStorage.getItem('cv-template');
        if (savedTemplate) {
            await this.loadTemplate(savedTemplate);
        } else {
            await this.loadTemplate('default');
        }
    }
};

