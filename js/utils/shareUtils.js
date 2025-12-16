/**
 * ============================================
 * SHARE UTILITIES
 * ============================================
 * 
 * Handles social sharing functionality
 */

/**
 * Toggles the share menu visibility
 */
export function toggleShareMenu() {
    const menu = document.getElementById('share-menu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

/**
 * Shares the CV via WhatsApp
 * @param {Event} event - Click event
 */
export function shareViaWhatsApp(event) {
    event.preventDefault();
    const menu = document.getElementById('share-menu');
    if (menu) {
        menu.classList.remove('show');
    }
    
    try {
        const descriptions = window.descriptions;
        if (!descriptions || !descriptions.messages) return;
        
        const phoneNumber = window.cvData?.personal?.phone?.replace(/[\s\-+]/g, '');
        if (!phoneNumber) return;
        
        const message = encodeURIComponent(descriptions.messages.whatsapp);
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error sharing via WhatsApp:', error);
    }
}

/**
 * Shares the CV via Email
 * @param {Event} event - Click event
 */
export function shareViaEmail(event) {
    event.preventDefault();
    const menu = document.getElementById('share-menu');
    if (menu) {
        menu.classList.remove('show');
    }
    
    try {
        const descriptions = window.descriptions;
        if (!descriptions || !descriptions.messages || !window.cvData) return;
        
        const subject = encodeURIComponent(descriptions.messages.email.subject);
        const body = encodeURIComponent(descriptions.messages.email.body);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (error) {
        console.error('Error sharing via email:', error);
    }
}

/**
 * Shares the CV via LinkedIn
 * @param {Event} event - Click event
 */
export function shareViaLinkedIn(event) {
    event.preventDefault();
    const menu = document.getElementById('share-menu');
    if (menu) {
        menu.classList.remove('show');
    }
    
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

// Export to global scope
window.toggleShareMenu = toggleShareMenu;
window.shareViaWhatsApp = shareViaWhatsApp;
window.shareViaEmail = shareViaEmail;
window.shareViaLinkedIn = shareViaLinkedIn;

