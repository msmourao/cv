/**
 * ============================================
 * PRINT UTILITIES
 * ============================================
 * 
 * Handles print functionality and image preloading
 */

/**
 * Handles print action with image preloading
 */
function handlePrint() {
    // Star Wars template printing is now allowed
    
    const profileImage = document.getElementById('profile-image');
    if (profileImage) {
        // Ensure src is correct
        const currentSrc = profileImage.src || profileImage.getAttribute('src') || './avatar.png';
        profileImage.src = currentSrc;
        profileImage.setAttribute('src', './avatar.png');
        
        // Ensure container is visible
        const profileSection = profileImage.closest('.profile-section');
        if (profileSection) {
            profileSection.style.display = 'block';
            profileSection.style.visibility = 'visible';
            profileSection.style.opacity = '1';
        }
        
        // Force display and visibility on image
        profileImage.style.display = 'block';
        profileImage.style.visibility = 'visible';
        profileImage.style.opacity = '1';
        
        // Preload image
        const img = new Image();
        img.onload = function() {
            profileImage.style.display = 'block';
            profileImage.style.visibility = 'visible';
            profileImage.style.opacity = '1';
            profileImage.src = './avatar.png';
            
            // Wait for rendering before printing
            setTimeout(() => {
                window.print();
            }, 200);
        };
        img.onerror = function() {
            // Even on error, force src and try printing
            profileImage.src = './avatar.png';
            profileImage.setAttribute('src', './avatar.png');
            profileImage.style.display = 'block';
            profileImage.style.visibility = 'visible';
            profileImage.style.opacity = '1';
            if (profileSection) {
                profileSection.style.display = 'block';
                profileSection.style.visibility = 'visible';
                profileSection.style.opacity = '1';
            }
            setTimeout(() => {
                window.print();
            }, 200);
        };
        img.src = './avatar.png';
    } else {
        window.print();
    }
}

// Export to global scope
window.handlePrint = handlePrint;

