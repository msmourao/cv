/**
 * Star Wars Manager
 * Handles Star Wars theme animations, music, and crawl functionality
 */

// Global state for crawl animation
let starWarsCrawlState = {
    rafId: null,
    startTime: null,
    offsetMs: 0,
    running: false,
    resizeHandler: null,
    mutationObserver: null,
    isInitializing: false,
    measureInProgress: false
};

// Expose state globally for external reset
window.starWarsCrawlState = starWarsCrawlState;

// Flag to prevent multiple simultaneous executions
let startAutoInProgress = false;

// Global flag for music state
let swMusicIsPlaying = false;
let swMusicAutoPlayTimeout = null;

/**
 * Starts the Star Wars crawl animation
 */
function startStarWarsCrawl() {
    const scroll = document.getElementById('sw-crawl');
    if (!scroll) {
        console.error('[startStarWarsCrawl] Elemento sw-crawl não encontrado');
        return;
    }
    
    // Stop previous animation if exists
    if (starWarsCrawlState.running) {
        starWarsCrawlState.running = false;
        if (starWarsCrawlState.rafId) {
            cancelAnimationFrame(starWarsCrawlState.rafId);
        }
    }
    
    // Remove previous listeners if exist
    if (starWarsCrawlState.resizeHandler) {
        window.removeEventListener('resize', starWarsCrawlState.resizeHandler);
    }
    if (starWarsCrawlState.mutationObserver) {
        starWarsCrawlState.mutationObserver.disconnect();
    }
    
    // Reset state completely
    starWarsCrawlState.startTime = null;
    starWarsCrawlState.offsetMs = 0;
    starWarsCrawlState.running = false;
    
    // Reset transform and keep invisible until startAuto() measures and applies correct position
    scroll.style.transform = 'none';
    scroll.style.visibility = 'hidden';
    scroll.style.opacity = '0';
    scroll.style.display = 'block';
    
    const SPEED_PX_PER_S = 15;  // px/s - slower = more time
    const EXTRA = 160; // extra space for when content exits top
    
    let contentHeight = 0;
    let startTranslate = 0;
    let endTranslate = 0;
    let DURATION_MS = 28000;
    
    function setTranslate(y) {
        const scroll = document.getElementById('sw-crawl');
        if (!scroll) return;
        const transformValue = `translateY(${Math.round(y)}px) translateZ(0px)`;
        scroll.style.transform = transformValue;
        scroll.style.webkitTransform = transformValue;
        void scroll.offsetHeight; // Force reflow
    }
    
    function getFirstTop() {
        const scroll = document.getElementById('sw-crawl');
        if (!scroll) return null;
        const first = scroll.firstElementChild;
        if (!first) return null;
        const viewport = scroll.closest('.sw-viewport');
        if (viewport) {
            const viewportRect = viewport.getBoundingClientRect();
            const firstRect = first.getBoundingClientRect();
            return firstRect.top - viewportRect.top;
        }
        return first.getBoundingClientRect().top;
    }
    
    async function measureAndFindStart() {
        if (starWarsCrawlState.measureInProgress) {
            return;
        }
        starWarsCrawlState.measureInProgress = true;
        
        try {
            const scroll = document.getElementById('sw-crawl');
            if (!scroll) {
                console.error('[measureAndFindStart] Elemento não encontrado');
                starWarsCrawlState.measureInProgress = false;
                return;
            }
            
            const wasVisible = scroll.style.visibility !== 'hidden' && scroll.style.opacity !== '0';
            
            scroll.style.transform = 'none';
            scroll.style.webkitTransform = 'none';
            
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            
            void document.body.offsetHeight;
            void scroll.offsetHeight;
            
            contentHeight = scroll.scrollHeight;
            
            if (contentHeight === 0) {
                console.error('[measureAndFindStart] ERRO: contentHeight é 0! scrollHeight:', scroll.scrollHeight, 'offsetHeight:', scroll.offsetHeight, 'innerHTML length:', scroll.innerHTML ? scroll.innerHTML.length : 0);
            }
            
            const viewport = scroll.closest('.sw-viewport');
            let desiredTop = window.innerHeight;
            if (viewport) {
                const viewportRect = viewport.getBoundingClientRect();
                desiredTop = viewportRect.height;
            }
            
            let translate = 0;
            setTranslate(translate);
            void scroll.offsetHeight;
            await new Promise(r => requestAnimationFrame(r));
            
            const maxIter = 15;
            const tol = 2;
            for (let i = 0; i < maxIter; i++) {
                void scroll.offsetHeight;
                await new Promise(r => requestAnimationFrame(r));
                
                const top = getFirstTop();
                if (top === null) {
                    break;
                }
                const delta = desiredTop - top;
                if (Math.abs(delta) <= tol) {
                    translate = translate + delta;
                    setTranslate(translate);
                    break;
                }
                const maxDelta = 2000;
                const limitedDelta = Math.sign(delta) * Math.min(Math.abs(delta), maxDelta);
                translate = translate + limitedDelta;
                setTranslate(translate);
            }
            
            startTranslate = Math.round(translate);
            endTranslate = startTranslate - (contentHeight + EXTRA);
            
            const distancePx = Math.abs(startTranslate - endTranslate);
            DURATION_MS = Math.max(1, Math.round((distancePx / SPEED_PX_PER_S) * 1000));
            
            if (wasVisible) {
                scroll.style.visibility = 'visible';
                scroll.style.opacity = '1';
            }
            
        } catch (error) {
            console.error('[measureAndFindStart] ERRO durante medição:', error);
            contentHeight = 0;
            startTranslate = 0;
            endTranslate = 0;
            DURATION_MS = 28000;
        } finally {
            starWarsCrawlState.measureInProgress = false;
        }
    }
    
    function applyT(t) {
        const y = startTranslate + (endTranslate - startTranslate) * t;
        setTranslate(y);
    }
    
    function frame(now) {
        if (!starWarsCrawlState.startTime) {
            starWarsCrawlState.startTime = now;
        }
        const elapsed = now - starWarsCrawlState.startTime;
        const total = (starWarsCrawlState.offsetMs + elapsed);
        const t = ((total % DURATION_MS) / DURATION_MS);
        applyT(t);
        if (starWarsCrawlState.running) {
            starWarsCrawlState.rafId = requestAnimationFrame(frame);
        } else {
            console.error('[frame] Animação parada! running:', starWarsCrawlState.running, 'rafId:', starWarsCrawlState.rafId);
        }
    }
    
    function resetStartAutoFlag() {
        startAutoInProgress = false;
        starWarsCrawlState.isInitializing = false;
    }
    
    window.resetStartAutoFlag = resetStartAutoFlag;
    
    async function startAuto() {
        if (startAutoInProgress) {
            return;
        }
        startAutoInProgress = true;
        starWarsCrawlState.isInitializing = true;
        
        const scroll = document.getElementById('sw-crawl');
        if (!scroll) {
            console.error('[startAuto] Elemento não encontrado');
            startAutoInProgress = false;
            starWarsCrawlState.isInitializing = false;
            return;
        }
        
        if (starWarsCrawlState.running) {
            starWarsCrawlState.running = false;
            if (starWarsCrawlState.rafId) {
                cancelAnimationFrame(starWarsCrawlState.rafId);
                starWarsCrawlState.rafId = null;
            }
        }
        
        starWarsCrawlState.offsetMs = 0;
        starWarsCrawlState.startTime = null;
        
        scroll.style.transform = 'none';
        scroll.style.webkitTransform = 'none';
        scroll.style.visibility = 'hidden';
        scroll.style.opacity = '0';
        scroll.style.display = 'block';
        
        void scroll.offsetHeight;
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        await measureAndFindStart();
        
        const scrollFinal = document.getElementById('sw-crawl');
        if (!scrollFinal) {
            startAutoInProgress = false;
            starWarsCrawlState.isInitializing = false;
            return;
        }
        
        applyT(0);
        void scrollFinal.offsetHeight;
        
        scrollFinal.style.visibility = 'visible';
        scrollFinal.style.opacity = '1';
        
        const crawlContainer = scrollFinal.closest('.sw-crawl-container');
        if (crawlContainer) {
            crawlContainer.style.opacity = '1';
            crawlContainer.style.visibility = 'visible';
        }
        
        void scrollFinal.offsetHeight;
        
        starWarsCrawlState.startTime = performance.now();
        starWarsCrawlState.running = true;
        frame(performance.now());
        
        setTimeout(() => {
            startAutoInProgress = false;
            starWarsCrawlState.isInitializing = false;
        }, 100);
    }
    
    window.startAuto = startAuto;
    
    starWarsCrawlState.resizeHandler = async () => {
        const scroll = document.getElementById('sw-crawl');
        if (!scroll) return;
        
        const wasVisible = scroll.style.visibility !== 'hidden' && scroll.style.opacity !== '0';
        const wasRunning = starWarsCrawlState.running;
        
        if (wasRunning) {
            const now = performance.now();
            const elapsed = now - (starWarsCrawlState.startTime || now);
            starWarsCrawlState.offsetMs = (starWarsCrawlState.offsetMs + elapsed) % DURATION_MS;
            starWarsCrawlState.running = false;
            if (starWarsCrawlState.rafId) {
                cancelAnimationFrame(starWarsCrawlState.rafId);
            }
            starWarsCrawlState.startTime = null;
        }
        
        await measureAndFindStart();
        
        if (wasVisible) {
            scroll.style.visibility = 'visible';
            scroll.style.opacity = '1';
            const crawlContainer = scroll.closest('.sw-crawl-container');
            if (crawlContainer) {
                crawlContainer.style.opacity = '1';
                crawlContainer.style.visibility = 'visible';
            }
        }
        
        applyT((starWarsCrawlState.offsetMs % DURATION_MS) / DURATION_MS);
        
        if (wasRunning) {
            starWarsCrawlState.startTime = performance.now();
            starWarsCrawlState.running = true;
            frame(performance.now());
        }
    };
    
    window.addEventListener('resize', starWarsCrawlState.resizeHandler);
    
    starWarsCrawlState.mutationObserver = new MutationObserver(async (mutations) => {
        if (starWarsCrawlState.isInitializing || starWarsCrawlState.measureInProgress || startAutoInProgress) {
            return;
        }
        let relevant = false;
        for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName && (m.attributeName === 'style' || m.attributeName === 'class')) {
                continue;
            }
            if (m.type === 'childList' || m.type === 'subtree' || m.type === 'characterData') {
                relevant = true;
                break;
            }
        }
        if (relevant && starWarsCrawlState.running) {
            starWarsCrawlState.running = false;
            if (starWarsCrawlState.rafId) {
                cancelAnimationFrame(starWarsCrawlState.rafId);
            }
            starWarsCrawlState.startTime = null;
            starWarsCrawlState.offsetMs = 0;
            await measureAndFindStart();
            applyT(0);
            starWarsCrawlState.startTime = performance.now();
            starWarsCrawlState.running = true;
            frame(performance.now());
        }
    });
    starWarsCrawlState.mutationObserver.observe(scroll, { childList: true, subtree: true, characterData: true });
}

window.addEventListener('startStarWarsCrawl', () => {
    if (typeof window.startAuto === 'function') {
        window.startAuto();
    } else {
        startStarWarsCrawl();
        if (typeof window.startAuto === 'function') {
            window.startAuto();
        }
    }
});

/**
 * Starts Star Wars music autoplay
 */
function startStarWarsMusic() {
    if (window._swMusicStartedByIntro) {
        return;
    }
    
    if (swMusicAutoPlayTimeout) {
        clearTimeout(swMusicAutoPlayTimeout);
        swMusicAutoPlayTimeout = null;
    }
    
    swMusicAutoPlayTimeout = setTimeout(() => {
        if (window.swPlayMusic && document.body.classList.contains('star-wars-template') && !swMusicIsPlaying) {
            window.swPlayMusic();
        }
        swMusicAutoPlayTimeout = null;
    }, 1500);
}

/**
 * Template change observer for music autoplay
 */
(function() {
    let lastTemplate = null;
    let initialized = false;
    
    function checkTemplateChange() {
        const isStarWars = document.body.classList.contains('star-wars-template');
        
        // Não iniciar música automaticamente aqui
        // A música só deve tocar quando:
        // 1. A intro acontece (em showStarWarsIntro())
        // 2. O usuário clica no botão play
        
        if (!isStarWars && lastTemplate === 'star-wars') {
            if (window.swPauseMusic) {
                window.swPauseMusic();
            }
            if (swMusicAutoPlayTimeout) {
                clearTimeout(swMusicAutoPlayTimeout);
                swMusicAutoPlayTimeout = null;
            }
        }
        
        lastTemplate = isStarWars ? 'star-wars' : null;
        initialized = true;
    }
    
    const observer = new MutationObserver(checkTemplateChange);
    
    function initObserver() {
        checkTemplateChange();
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initObserver);
    } else {
        setTimeout(initObserver, 100);
    }
    
    setTimeout(() => {
        if (!initialized) {
            initObserver();
        }
    }, 500);
})();

// Listen for language changes and reload crawl if Star Wars is active
document.addEventListener('languageChanged', async (event) => {
    if (!document.body.classList.contains('star-wars-template')) {
        return;
    }
    
    const lang = event.detail ? event.detail.lang : null;
    if (!lang) return;
    
    // Stop current crawl animation
    if (starWarsCrawlState.running) {
        starWarsCrawlState.running = false;
        if (starWarsCrawlState.rafId) {
            cancelAnimationFrame(starWarsCrawlState.rafId);
            starWarsCrawlState.rafId = null;
        }
    }
    
    // Reset state
    starWarsCrawlState.startTime = null;
    starWarsCrawlState.offsetMs = 0;
    starWarsCrawlState.isInitializing = false;
    startAutoInProgress = false;
    
    // Hide crawl element
    const scroll = document.getElementById('sw-crawl');
    if (scroll) {
        scroll.style.transform = 'none';
        scroll.style.webkitTransform = 'none';
        scroll.style.visibility = 'hidden';
        scroll.style.opacity = '0';
    }
    
    // Wait for data to be reloaded and rendered
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Re-render crawl with new language
    if (window.cvData && window.descriptions && window.renderStarWarsCrawl) {
        window.renderStarWarsCrawl(window.cvData, window.descriptions, lang);
    }
    
    // Wait for DOM to update and content to be rendered
    await new Promise(resolve => setTimeout(resolve, 300));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    
    // Restart crawl animation
    if (window.startAuto) {
        window.startAuto();
    } else {
        // Fallback: try to initialize startAuto
        const event = new CustomEvent('startStarWarsCrawl');
        window.dispatchEvent(event);
    }
});

/**
 * Play Star Wars music
 */
function swPlayMusic(force = false) {
    try {
        const audio = document.getElementById('sw-audio');
        const playBtn = document.getElementById('sw-play');
        const pauseBtn = document.getElementById('sw-pause');
        
        if (!audio) return;
        
        const isActuallyPlaying = audio && !audio.paused && audio.currentTime > 0 && audio.readyState > 2;
        
        if (isActuallyPlaying && !force) {
            return;
        }
        
        if (isActuallyPlaying !== swMusicIsPlaying) {
            swMusicIsPlaying = isActuallyPlaying;
            window.swMusicIsPlaying = isActuallyPlaying;
        }
        
        if (!document.body.classList.contains('star-wars-template')) {
            return;
        }
        
        const source = audio.querySelector('source');
        const hasSource = audio.src || (source && source.src);
        
        if (!hasSource) return;
        
        const isPaused = audio.paused && audio.currentTime > 0;
        
        const attemptPlay = () => {
            if (!isPaused) {
                if (force || audio.currentTime === 0) {
                    audio.currentTime = 0;
                }
            }
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (!swMusicIsPlaying) {
                        swMusicIsPlaying = true;
                        window.swMusicIsPlaying = true;
                        if (playBtn) playBtn.style.display = 'none';
                        if (pauseBtn) pauseBtn.style.display = 'flex';
                        const stopBtn = document.getElementById('sw-stop');
                        if (stopBtn) stopBtn.style.display = 'flex';
                    }
                }).catch(error => {
                    // Silently ignore autoplay errors
                });
            } else {
                if (!swMusicIsPlaying) {
                    swMusicIsPlaying = true;
                    window.swMusicIsPlaying = true;
                    if (playBtn) playBtn.style.display = 'none';
                    if (pauseBtn) pauseBtn.style.display = 'flex';
                    const stopBtn = document.getElementById('sw-stop');
                    if (stopBtn) stopBtn.style.display = 'flex';
                }
            }
        };
        
        if (!audio.src && source && source.src) {
            if (!audio.src) {
                audio.src = source.src;
            }
            audio.addEventListener('canplaythrough', () => {
                attemptPlay();
            }, { once: true });
            audio.load();
            return;
        }
        
        attemptPlay();
    } catch (error) {
        // Silently ignore errors
    }
}

/**
 * Pause Star Wars music
 */
function swPauseMusic() {
    try {
        const audio = document.getElementById('sw-audio');
        const playBtn = document.getElementById('sw-play');
        const pauseBtn = document.getElementById('sw-pause');
        const stopBtn = document.getElementById('sw-stop');
        
        if (audio) {
            audio.pause();
            swMusicIsPlaying = false;
            window.swMusicIsPlaying = false;
            if (playBtn) playBtn.style.display = 'flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'flex';
        }
    } catch (error) {
        // Silently ignore errors
    }
}

/**
 * Stop Star Wars music
 */
function swStopMusic() {
    try {
        const audio = document.getElementById('sw-audio');
        const playBtn = document.getElementById('sw-play');
        const pauseBtn = document.getElementById('sw-pause');
        const stopBtn = document.getElementById('sw-stop');
        
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            swMusicIsPlaying = false;
            window.swMusicIsPlaying = false;
            if (playBtn) playBtn.style.display = 'flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'flex';
        }
    } catch (error) {
        // Silently ignore errors
    }
}

/**
 * Set Star Wars music volume
 */
function swSetVolume(value) {
    try {
        const audio = document.getElementById('sw-audio');
        if (audio) {
            audio.volume = value / 100;
        }
    } catch (error) {
        console.error('Error in swSetVolume:', error);
    }
}

// Export to global scope
/**
 * Repeat Star Wars intro animation
 */
function swRepeatIntro() {
    try {
        if (!document.body.classList.contains('star-wars-template')) {
            return;
        }
        
        // Stop music
        if (window.swStopMusic) {
            window.swStopMusic();
        }
        
        // Reset intro seen flag
        localStorage.removeItem('sw-intro-seen');
        
        // Reset crawl state
        if (starWarsCrawlState.running) {
            starWarsCrawlState.running = false;
            if (starWarsCrawlState.rafId) {
                cancelAnimationFrame(starWarsCrawlState.rafId);
                starWarsCrawlState.rafId = null;
            }
        }
        
        // Reset crawl element
        const scroll = document.getElementById('sw-crawl');
        if (scroll) {
            scroll.style.transform = 'none';
            scroll.style.webkitTransform = 'none';
            scroll.style.visibility = 'hidden';
            scroll.style.opacity = '0';
        }
        
        const crawlContainer = document.querySelector('.sw-crawl-container');
        if (crawlContainer) {
            crawlContainer.style.visibility = 'hidden';
            crawlContainer.style.opacity = '0';
        }
        
        // Hide header and action buttons
        const header = document.querySelector('.sw-header');
        if (header) {
            header.style.opacity = '0';
            header.style.visibility = 'hidden';
            header.classList.remove('show', 'sw-fade-in-elements');
        }
        
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.opacity = '0';
            actionButtons.style.visibility = 'hidden';
            actionButtons.classList.remove('show', 'sw-fade-in-elements');
        }
        
        // Hide photo container
        const photoContainer = document.querySelector('.sw-photo-container');
        if (photoContainer) {
            photoContainer.style.display = 'none';
            photoContainer.style.visibility = 'hidden';
            photoContainer.style.opacity = '0';
        }
        
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.style.display = 'none';
            profileImage.style.visibility = 'hidden';
            profileImage.style.opacity = '0';
        }
        
        const lightsaber = document.querySelector('.sw-lightsaber');
        if (lightsaber) {
            lightsaber.style.display = 'none';
            lightsaber.style.visibility = 'hidden';
            lightsaber.style.opacity = '0';
        }
        
        // Reset logo animation
        const logoAnimation = document.getElementById('sw-logo-animation');
        if (logoAnimation) {
            logoAnimation.style.display = 'none';
            logoAnimation.style.visibility = 'hidden';
            logoAnimation.style.opacity = '0';
            logoAnimation.style.transform = 'none';
            logoAnimation.style.webkitTransform = 'none';
            logoAnimation.style.animation = 'none';
            logoAnimation.style.webkitAnimation = 'none';
        }
        
        // Show overlay again
        const overlay = document.getElementById('template-loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.visibility = 'visible';
            overlay.style.opacity = '1';
            overlay.classList.remove('hidden');
            overlay.style.zIndex = '10001';
        }
        
        // Call showStarWarsIntro immediately (don't wait for navigation)
        if (window.ThemeManager && window.ThemeManager.showStarWarsIntro) {
            // Call async function without await to avoid blocking
            window.ThemeManager.showStarWarsIntro().then(() => {
                // Set flag after intro completes
                localStorage.setItem('sw-intro-seen', 'true');
            }).catch(error => {
                console.error('Error showing Star Wars intro:', error);
            });
        }
    } catch (error) {
        console.error('Error in swRepeatIntro:', error);
    }
}

window.swPlayMusic = swPlayMusic;
window.swPauseMusic = swPauseMusic;
window.swStopMusic = swStopMusic;
window.swSetVolume = swSetVolume;
window.swRepeatIntro = swRepeatIntro;
window.startStarWarsCrawl = startStarWarsCrawl;


