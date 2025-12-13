/* ============================================
   TEXT-TO-SPEECH (TTS) NATIVO
   ============================================ */

const TTS = {
    synth: null,
    currentUtterance: null,
    voices: [],
    isSupported: false,
    isSpeaking: false,
    isPaused: false,
    currentLang: 'pt-BR',
    sectionQueue: null,
    currentSectionIndex: 0,
    activePreset: null, // 'vader' ou null
    prefs: {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        voiceURI: null
    },
    /**
     * Presets de TTS disponíveis
     * Valores ajustáveis:
     * - rate: velocidade da fala (0.1 a 10, padrão 1.0)
     * - pitch: tom da voz (0 a 2, padrão 1.0, valores menores = mais grave)
     */
    presets: {
        vader: {
            rate: 0.9,  // Ligeiramente mais lento para efeito mais dramático
            pitch: 0.5, // Tom muito mais grave (Vader-like)
            name: 'Vader-like'
        }
    },
    
    /**
     * Inicializa o TTS
     */
    initTTS() {
        // Verificar suporte
        if (!('speechSynthesis' in window)) {
            this.isSupported = false;
            this.showUnsupportedMessage();
            return;
        }
        
        try {
            this.synth = window.speechSynthesis;
            this.isSupported = true;
        } catch (e) {
            this.isSupported = false;
            console.warn('TTS: Erro ao inicializar speechSynthesis:', e);
            this.showUnsupportedMessage();
            return;
        }
        
        // Carregar idioma atual
        this.loadCurrentLang();
        
        // Carregar preferências salvas
        this.loadPrefsForLang(this.currentLang);
        
        // Carregar vozes
        this.populateVoices();
        
        // Listener para mudanças de idioma
        document.addEventListener('languageChanged', (event) => {
            const lang = event.detail ? event.detail.lang : null;
            if (lang) {
                this.currentLang = lang === 'pt' ? 'pt-BR' : 'en-US';
            } else {
                this.loadCurrentLang();
            }
            this.loadPrefsForLang(this.currentLang);
            this.populateVoices();
        });
        
        // Listener para mudanças de voz
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.populateVoices();
            };
        }
        
        // Tentar carregar vozes novamente após um delay (alguns navegadores demoram)
        setTimeout(() => {
            this.populateVoices();
        }, 500);
    },
    
    /**
     * Carrega o idioma atual da página
     */
    loadCurrentLang() {
        // Tentar obter do elemento lang-select (se existir)
        const langSelect = document.getElementById('lang-select');
        if (langSelect && langSelect.value) {
            this.currentLang = langSelect.value === 'pt' ? 'pt-BR' : 'en-US';
            return;
        }
        
        // Tentar obter dos botões de idioma
        const langPt = document.getElementById('lang-pt');
        const langEn = document.getElementById('lang-en');
        if (langPt && langPt.classList.contains('active')) {
            this.currentLang = 'pt-BR';
            return;
        }
        if (langEn && langEn.classList.contains('active')) {
            this.currentLang = 'en-US';
            return;
        }
        
        // Tentar obter da variável global currentLang (se existir)
        if (typeof currentLang !== 'undefined') {
            this.currentLang = currentLang === 'pt' ? 'pt-BR' : 'en-US';
            return;
        }
        
        // Fallback: usar 'pt-BR' se não encontrar nenhum indicador
        this.currentLang = 'pt-BR';
    },
    
    /**
     * Popula a lista de vozes disponíveis
     */
    populateVoices() {
        if (!this.synth) return;
        
        // Tentar obter vozes
        let voices = this.synth.getVoices();
        
        // Se estiver vazio, tentar novamente após um delay
        if (voices.length === 0) {
            setTimeout(() => {
                voices = this.synth.getVoices();
                if (voices.length > 0) {
                    this.voices = voices;
                    this.updateVoiceSelect();
                    this.selectBestVoice();
                }
            }, 100);
            return;
        }
        
        this.voices = voices;
        this.updateVoiceSelect();
        this.selectBestVoice();
    },
    
    /**
     * Seleciona automaticamente a melhor voz de acordo com o idioma
     * Se o preset Vader estiver ativo, seleciona a voz mais grave
     */
    selectBestVoice() {
        if (this.voices.length === 0) return;
        
        // Filtrar vozes por idioma
        const langVoices = this.voices.filter(voice => 
            voice.lang.startsWith(this.currentLang.split('-')[0])
        );
        
        const voicesToChoose = langVoices.length > 0 ? langVoices : this.voices;
        
        if (this.activePreset === 'vader') {
            // Para preset Vader, escolher a voz mais grave disponível
            // Vozes masculinas geralmente têm nomes que contêm palavras como "male", "man", "masculine"
            // ou são do tipo "Google" que geralmente têm vozes mais graves
            const maleVoices = voicesToChoose.filter(v => {
                const name = v.name.toLowerCase();
                return name.includes('male') || 
                       name.includes('man') || 
                       name.includes('masculine') ||
                       name.includes('google') ||
                       name.includes('microsoft david') ||
                       name.includes('zira') ||
                       name.includes('daniel');
            });
            
            if (maleVoices.length > 0) {
                // Priorizar vozes nativas do idioma
                const nativeMaleVoices = maleVoices.filter(voice => 
                    voice.lang === this.currentLang
                );
                this.prefs.voiceURI = (nativeMaleVoices.length > 0 ? nativeMaleVoices : maleVoices)[0].voiceURI;
            } else {
                // Fallback: usar primeira voz disponível
                this.prefs.voiceURI = voicesToChoose[0].voiceURI;
            }
        } else {
            // Seleção normal
            if (langVoices.length === 0) {
                // Se não encontrar, usar qualquer voz
                this.prefs.voiceURI = this.voices[0].voiceURI;
            } else {
                // Priorizar vozes nativas do idioma
                const nativeVoices = langVoices.filter(voice => 
                    voice.lang === this.currentLang
                );
                
                if (nativeVoices.length > 0) {
                    // Preferir vozes com nome que contenha o idioma ou sejam "premium"
                    const preferred = nativeVoices.find(v => 
                        v.name.toLowerCase().includes(this.currentLang.split('-')[0]) ||
                        v.name.toLowerCase().includes('premium') ||
                        v.name.toLowerCase().includes('enhanced')
                    ) || nativeVoices[0];
                    
                    this.prefs.voiceURI = preferred.voiceURI;
                } else {
                    this.prefs.voiceURI = langVoices[0].voiceURI;
                }
            }
        }
        
        this.updateVoiceSelect();
        this.savePrefs();
    },
    
    /**
     * Atualiza o select de vozes na UI
     */
    updateVoiceSelect() {
        const voiceSelect = document.getElementById('tts-voice-select');
        if (!voiceSelect) return;
        
        voiceSelect.innerHTML = '';
        
        // Agrupar vozes por idioma
        const langVoices = this.voices.filter(voice => 
            voice.lang.startsWith(this.currentLang.split('-')[0])
        );
        
        const voicesToShow = langVoices.length > 0 ? langVoices : this.voices;
        
        voicesToShow.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voiceURI;
            option.textContent = `${voice.name} (${voice.lang})`;
            option.selected = voice.voiceURI === this.prefs.voiceURI;
            voiceSelect.appendChild(option);
        });
    },
    
    /**
     * Fala múltiplas seções em sequência
     */
    speakSections(sections) {
        if (!this.isSupported || sections.length === 0) return;
        
        this.stop();
        this.sectionQueue = sections;
        this.currentSectionIndex = 0;
        this.updateUI(); // Atualizar UI para habilitar botões de navegação
        this.speakNextSection();
    },
    
    /**
     * Fala a próxima seção da fila
     */
    speakNextSection() {
        if (!this.sectionQueue || this.currentSectionIndex >= this.sectionQueue.length) {
            this.isSpeaking = false;
            this.isPaused = false;
            this.clearHighlights();
            this.updateUI();
            return;
        }
        
        const section = this.sectionQueue[this.currentSectionIndex];
        this.speak(section.text, section.element);
    },
    
    /**
     * Fala um texto e destaca o elemento (se fornecido)
     */
    speak(text, highlightElement = null) {
        if (!this.isSupported || !text) return;
        
        // Destacar elemento
        if (highlightElement) {
            this.clearHighlights();
            highlightElement.classList.add('tts-highlight');
            // Scroll suave para o elemento se necessário
            highlightElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Criar utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = this.currentLang;
        
        // Aplicar preset se ativo
        if (this.activePreset && this.presets[this.activePreset]) {
            const preset = this.presets[this.activePreset];
            this.currentUtterance.rate = preset.rate;
            this.currentUtterance.pitch = preset.pitch;
        } else {
            this.currentUtterance.rate = this.prefs.rate;
            this.currentUtterance.pitch = this.prefs.pitch;
        }
        
        this.currentUtterance.volume = this.prefs.volume;
        
        if (this.prefs.voiceURI) {
            const selectedVoice = this.voices.find(v => v.voiceURI === this.prefs.voiceURI);
            if (selectedVoice) {
                this.currentUtterance.voice = selectedVoice;
            }
        }
        
        // Event listeners
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateUI();
        };
        
        this.currentUtterance.onend = () => {
            // Remover highlight da seção atual
            if (highlightElement) {
                highlightElement.classList.remove('tts-highlight');
            }
            
            // Falar próxima seção se houver
            if (this.sectionQueue && this.currentSectionIndex < this.sectionQueue.length - 1) {
                this.currentSectionIndex++;
                setTimeout(() => {
                    this.speakNextSection();
                }, 300); // Pequeno delay entre seções
            } else {
                this.isSpeaking = false;
                this.isPaused = false;
                this.currentUtterance = null;
                this.clearHighlights();
                this.updateUI();
            }
        };
        
        this.currentUtterance.onerror = (event) => {
            // Ignorar erros "interrupted" e "canceled" que são esperados quando:
            // - Usuário clica em stop
            // - Uma nova fala é iniciada antes da anterior terminar
            // - Navegação entre seções
            if (event.error === 'interrupted' || event.error === 'canceled') {
                // Não logar como erro, apenas atualizar estado se necessário
                if (event.error === 'interrupted') {
                    // Interrupção pode ser esperada, apenas limpar highlights
                    this.clearHighlights();
                }
                return;
            }
            
            // Logar apenas erros reais (network, synthesis-failed, etc)
            console.error('TTS Error:', event);
            this.isSpeaking = false;
            this.isPaused = false;
            this.clearHighlights();
            this.updateUI();
        };
        
        // Falar
        this.synth.speak(this.currentUtterance);
    },
    
    /**
     * Limpa todos os highlights
     */
    clearHighlights() {
        document.querySelectorAll('.tts-highlight').forEach(el => {
            el.classList.remove('tts-highlight');
        });
    },
    
    /**
     * Pausa a fala
     */
    pause() {
        if (!this.isSupported || !this.isSpeaking) return;
        
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            this.isPaused = true;
            this.updateUI();
        }
    },
    
    /**
     * Retoma a fala
     */
    resume() {
        if (!this.isSupported || !this.isPaused) return;
        
        if (this.synth.speaking && this.synth.paused) {
            this.synth.resume();
            this.isPaused = false;
            this.updateUI();
        }
    },
    
    /**
     * Para a fala
     */
    stop() {
        if (!this.isSupported) return;
        
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        // Não limpar sectionQueue aqui para permitir navegação
        this.clearHighlights();
        this.updateUI();
    },
    
    /**
     * Para completamente e esconde a barra
     */
    stopAndHide() {
        this.stop();
        this.sectionQueue = null;
        this.currentSectionIndex = 0;
        this.hideTopBar();
    },
    
    /**
     * Salva as preferências no localStorage
     */
    savePrefs() {
        const key = `tts-prefs-${this.currentLang}`;
        localStorage.setItem(key, JSON.stringify(this.prefs));
    },
    
    /**
     * Carrega as preferências do localStorage para um idioma específico
     */
    loadPrefsForLang(lang) {
        const key = `tts-prefs-${lang}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.prefs = { ...this.prefs, ...prefs };
                this.updateControls();
            } catch (e) {
                console.error('Erro ao carregar preferências TTS:', e);
            }
        }
        
        // Carregar preset ativo para o idioma
        const presetKey = `tts-preset-${lang}`;
        const savedPreset = localStorage.getItem(presetKey);
        if (savedPreset && this.presets[savedPreset]) {
            this.activePreset = savedPreset;
            // Aplicar preset (selecionar voz e ajustar prefs)
            this.selectBestVoice();
        }
    },
    
    /**
     * Atualiza os controles da UI com os valores atuais
     */
    updateControls() {
        const rateSlider = document.getElementById('tts-rate');
        const pitchSlider = document.getElementById('tts-pitch');
        const volumeSlider = document.getElementById('tts-volume');
        const voiceSelect = document.getElementById('tts-voice-select');
        
        if (rateSlider) {
            rateSlider.value = this.prefs.rate;
            rateSlider.nextElementSibling.textContent = this.prefs.rate.toFixed(1);
        }
        
        if (pitchSlider) {
            pitchSlider.value = this.prefs.pitch;
            pitchSlider.nextElementSibling.textContent = this.prefs.pitch.toFixed(1);
        }
        
        if (volumeSlider) {
            volumeSlider.value = this.prefs.volume;
            volumeSlider.nextElementSibling.textContent = Math.round(this.prefs.volume * 100) + '%';
        }
        
        if (voiceSelect && this.prefs.voiceURI) {
            voiceSelect.value = this.prefs.voiceURI;
        }
    },
    
    /**
     * Atualiza a UI com o estado atual
     */
    updateUI() {
        const statusText = document.getElementById('tts-status');
        const playBtn = document.getElementById('tts-play');
        const pauseBtn = document.getElementById('tts-pause');
        const stopBtn = document.getElementById('tts-stop');
        const progressBar = document.getElementById('tts-progress');
        const prevBtn = document.getElementById('tts-prev-section');
        const nextBtn = document.getElementById('tts-next-section');
        
        if (statusText) {
            if (this.isSpeaking && !this.isPaused) {
                statusText.textContent = 'Falando…';
                statusText.setAttribute('aria-live', 'polite');
            } else if (this.isPaused) {
                statusText.textContent = 'Pausado';
                statusText.setAttribute('aria-live', 'off');
            } else {
                statusText.textContent = 'Pronto';
                statusText.setAttribute('aria-live', 'off');
            }
        }
        
        if (playBtn) {
            playBtn.disabled = this.isSpeaking && !this.isPaused;
            playBtn.setAttribute('aria-label', this.isPaused ? 'Retomar fala' : 'Iniciar fala');
        }
        
        if (pauseBtn) {
            pauseBtn.disabled = !this.isSpeaking || this.isPaused;
            pauseBtn.setAttribute('aria-label', 'Pausar fala');
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.isSpeaking;
            stopBtn.setAttribute('aria-label', 'Parar fala');
        }
        
        if (prevBtn) {
            prevBtn.disabled = !this.sectionQueue || this.sectionQueue.length === 0 || this.currentSectionIndex <= 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = !this.sectionQueue || this.sectionQueue.length === 0 || this.currentSectionIndex >= this.sectionQueue.length - 1;
        }
        
        if (progressBar) {
            if (this.isSpeaking && !this.isPaused) {
                progressBar.style.width = '100%';
                progressBar.setAttribute('aria-valuenow', '100');
            } else {
                progressBar.style.width = '0%';
                progressBar.setAttribute('aria-valuenow', '0');
            }
        }
    },
    
    /**
     * Mostra mensagem quando TTS não é suportado
     */
    showUnsupportedMessage() {
        const ttsMenu = document.getElementById('tts-menu');
        if (ttsMenu) {
            ttsMenu.innerHTML = `
                <div class="tts-unsupported" style="padding: 1rem; text-align: center; color: var(--text-light);">
                    <p>TTS não é suportado neste navegador.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Use Chrome, Edge ou Safari para esta funcionalidade.</p>
                </div>
            `;
        }
    },
    
    /**
     * Fala o conteúdo de uma seção específica
     * @param {string} sectionId - ID do elemento a ser falado
     */
    speakSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (!element) {
            console.warn(`Elemento com ID "${sectionId}" não encontrado`);
            return;
        }
        
        // Obter texto do elemento (remover HTML, manter apenas texto)
        const text = element.innerText || element.textContent || '';
        
        if (!text.trim()) {
            console.warn(`Elemento "${sectionId}" não contém texto`);
            return;
        }
        
        this.speak(text, element);
    },
    
    /**
     * Alterna o menu TTS
     */
    toggleTTSMenu() {
        const menu = document.getElementById('tts-menu');
        if (!menu) return;
        
        menu.classList.toggle('show');
        
        // Fechar outros menus
        const themeMenu = document.getElementById('theme-menu');
        const shareMenu = document.getElementById('share-menu');
        if (themeMenu) themeMenu.classList.remove('show');
        if (shareMenu) shareMenu.classList.remove('show');
    },
    
    /**
     * Verifica se está no mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    /**
     * Verifica se o template atual é ATS-Friendly
     * @returns {boolean}
     */
    isATSFriendly() {
        return document.body.classList.contains('ats-friendly-template');
    },
    
    /**
     * Coleta texto na ordem correta: sidebar sections primeiro, depois experiência
     * No ATS-Friendly: todas as seções na ordem do template
     */
    collectTextInOrder() {
        const sections = [];
        const isATS = this.isATSFriendly();
        const isStarWars = document.body.classList.contains('star-wars-template');
        const isMobile = this.isMobile();
        
        // Se for Star Wars, ler as seções do crawl
        if (isStarWars) {
            const crawlElement = document.getElementById('sw-crawl');
            if (crawlElement) {
                // Buscar todas as seções dentro do crawl
                const crawlSections = crawlElement.querySelectorAll('[data-section]');
                if (crawlSections.length > 0) {
                    crawlSections.forEach(section => {
                        const sectionId = section.getAttribute('data-section');
                        const text = section.innerText || section.textContent || '';
                        if (text.trim()) {
                            sections.push({ id: sectionId, element: section, text: text.trim() });
                        }
                    });
                } else {
                    // Fallback: se não houver seções, ler todo o conteúdo
                    const text = crawlElement.innerText || crawlElement.textContent || '';
                    if (text.trim()) {
                        sections.push({ id: 'sw-crawl', element: crawlElement, text: text.trim() });
                    }
                }
            }
            return sections;
        }
        
        if (isATS) {
            // ATS-Friendly: ordem específica do template (todas as seções sempre visíveis)
            const atsSections = [
                'summary',
                'achievements',
                'experience',
                'skills',
                'education',
                'languages',
                'projects',
                'hobbies'
            ];
            
            atsSections.forEach(sectionId => {
                const section = document.querySelector(`[data-section="${sectionId}"]`);
                if (section) {
                    const text = section.innerText || section.textContent || '';
                    if (text.trim()) {
                        sections.push({ id: sectionId, element: section, text: text.trim() });
                    }
                }
            });
        } else {
            // Better-view: seções da sidebar primeiro, depois experiência
            const sidebarSections = [
                'summary',
                'skills',
                'achievements',
                'education',
                'languages',
                'projects',
                'hobbies'
            ];
            
            sidebarSections.forEach(sectionId => {
                const section = document.querySelector(`[data-section="${sectionId}"]`);
                if (section && (isMobile ? section.classList.contains('active') : true)) {
                    const text = section.innerText || section.textContent || '';
                    if (text.trim()) {
                        sections.push({ id: sectionId, element: section, text: text.trim() });
                    }
                }
            });
            
            // Experiência profissional
            const experienceSection = document.querySelector('[data-section="experience"]');
            if (experienceSection && (isMobile ? experienceSection.classList.contains('active') : true)) {
                const text = experienceSection.innerText || experienceSection.textContent || '';
                if (text.trim()) {
                    sections.push({ id: 'experience', element: experienceSection, text: text.trim() });
                }
            }
        }
        
        return sections;
    },
    
    /**
     * Mostra a barra superior do TTS
     */
    showTopBar() {
        const topBar = document.getElementById('tts-top-bar');
        if (topBar) {
            topBar.classList.add('show');
            // Adicionar padding-top ao body para não sobrepor conteúdo
            // Usar setTimeout para garantir que o DOM foi renderizado
            setTimeout(() => {
                document.body.style.paddingTop = topBar.offsetHeight + 'px';
            }, 10);
        }
    },
    
    /**
     * Atualiza o padding do body baseado na altura da barra
     */
    updateBodyPadding() {
        const topBar = document.getElementById('tts-top-bar');
        if (topBar && topBar.classList.contains('show')) {
            setTimeout(() => {
                document.body.style.paddingTop = topBar.offsetHeight + 'px';
            }, 10);
        }
    },
    
    /**
     * Esconde a barra superior do TTS
     */
    hideTopBar() {
        const topBar = document.getElementById('tts-top-bar');
        if (topBar) {
            topBar.classList.remove('show');
            document.body.style.paddingTop = '';
        }
    },
    
    /**
     * Fecha a barra superior e para a leitura
     */
    closeTopBar() {
        this.stopAndHide();
    },
    
    /**
     * Alterna controles avançados
     */
    toggleAdvancedControls() {
        const advancedControls = document.getElementById('tts-advanced-controls');
        const toggleBtn = document.getElementById('tts-toggle-advanced');
        
        if (advancedControls && toggleBtn) {
            advancedControls.classList.toggle('show');
            toggleBtn.classList.toggle('expanded');
            
            // Ajustar padding do body quando expandir/retrair
            this.updateBodyPadding();
        }
    },
    
    /**
     * Vai para a seção anterior
     */
    previousSection() {
        if (!this.sectionQueue || this.sectionQueue.length === 0 || this.currentSectionIndex <= 0) {
            // Se não há fila, criar uma
            const sections = this.collectTextInOrder();
            if (sections.length > 0) {
                this.sectionQueue = sections;
                this.currentSectionIndex = sections.length - 1; // Ir para a última seção
            } else {
                return;
            }
        } else {
            this.stop();
            this.currentSectionIndex--;
        }
        
        const section = this.sectionQueue[this.currentSectionIndex];
        this.speak(section.text, section.element);
        this.updateUI();
    },
    
    /**
     * Vai para a próxima seção
     */
    nextSection() {
        if (!this.sectionQueue || this.sectionQueue.length === 0) {
            // Se não há fila, criar uma
            const sections = this.collectTextInOrder();
            if (sections.length > 0) {
                this.sectionQueue = sections;
                this.currentSectionIndex = 0; // Começar da primeira seção
            } else {
                return;
            }
        } else if (this.currentSectionIndex >= this.sectionQueue.length - 1) {
            return; // Já está na última seção
        } else {
            this.stop();
            this.currentSectionIndex++;
        }
        
        const section = this.sectionQueue[this.currentSectionIndex];
        this.speak(section.text, section.element);
        this.updateUI();
    },
    
    /**
     * Handlers para os botões de controle
     */
    handlePlay() {
        if (this.isPaused) {
            this.resume();
        } else {
            // Limpar highlights anteriores
            this.clearHighlights();
            
            // Mostrar barra superior
            this.showTopBar();
            
            // Sempre criar a fila de seções para habilitar navegação
            const sections = this.collectTextInOrder();
            if (sections.length > 0) {
                this.sectionQueue = sections;
                this.currentSectionIndex = 0;
                this.updateUI(); // Atualizar UI para habilitar botões
                this.speakSections(sections);
            } else {
                // Fallback: ler conteúdo principal
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    this.speak(mainContent.innerText || mainContent.textContent || '', mainContent);
                }
            }
        }
    },
    
    handlePause() {
        this.pause();
    },
    
    handleStop() {
        this.stop();
    },
    
    /**
     * Atualiza a taxa de velocidade
     */
    updateRate(value) {
        this.prefs.rate = parseFloat(value);
        const slider = document.getElementById('tts-rate');
        if (slider && slider.nextElementSibling) {
            slider.nextElementSibling.textContent = this.prefs.rate.toFixed(1);
        }
        this.savePrefs();
    },
    
    /**
     * Atualiza o tom
     */
    updatePitch(value) {
        this.prefs.pitch = parseFloat(value);
        const slider = document.getElementById('tts-pitch');
        if (slider && slider.nextElementSibling) {
            slider.nextElementSibling.textContent = this.prefs.pitch.toFixed(1);
        }
        this.savePrefs();
    },
    
    /**
     * Atualiza o volume
     */
    updateVolume(value) {
        this.prefs.volume = parseFloat(value);
        const slider = document.getElementById('tts-volume');
        if (slider && slider.nextElementSibling) {
            slider.nextElementSibling.textContent = Math.round(this.prefs.volume * 100) + '%';
        }
        this.savePrefs();
    },
    
    /**
     * Atualiza a voz selecionada
     */
    updateVoice(voiceURI) {
        this.prefs.voiceURI = voiceURI;
        this.savePrefs();
    },
    
    /**
     * Aplica um preset de TTS (ex: 'vader')
     * @param {string} presetName - Nome do preset ('vader' ou null para desativar)
     */
    applyPreset(presetName) {
        if (presetName && !this.presets[presetName]) {
            console.warn(`Preset "${presetName}" não encontrado. Presets disponíveis:`, Object.keys(this.presets));
            return;
        }
        
        this.activePreset = presetName || null;
        
        // Salvar preset por idioma
        const presetKey = `tts-preset-${this.currentLang}`;
        if (this.activePreset) {
            localStorage.setItem(presetKey, this.activePreset);
        } else {
            localStorage.removeItem(presetKey);
        }
        
        // Selecionar voz apropriada para o preset
        if (this.activePreset) {
            this.selectBestVoice();
        }
        
        // Se estiver falando, parar e recomeçar com novo preset
        if (this.isSpeaking) {
            const wasPaused = this.isPaused;
            this.stop();
            if (!wasPaused && this.sectionQueue && this.currentSectionIndex < this.sectionQueue.length) {
                // Recomeçar da seção atual
                setTimeout(() => {
                    this.speakNextSection();
                }, 100);
            }
        }
    },
    
    /**
     * Verifica se um preset está ativo
     * @param {string} presetName - Nome do preset a verificar (opcional, se não fornecido retorna o preset ativo)
     * @returns {boolean|string} - true se o preset especificado estiver ativo, ou o nome do preset ativo, ou false/null
     */
    isPresetActive(presetName = null) {
        if (presetName) {
            return this.activePreset === presetName;
        }
        return this.activePreset;
    }
};

// Expor API pública
window.TTS = TTS;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TTS.initTTS();
    });
} else {
    TTS.initTTS();
}

// Adicionar atalho de teclado (Espaço para Play/Pause quando focado)
document.addEventListener('keydown', (e) => {
    const ttsMenu = document.getElementById('tts-menu');
    if (ttsMenu && ttsMenu.classList.contains('show')) {
        const activeElement = document.activeElement;
        const isTTSControl = activeElement && (
            activeElement.id === 'tts-play' ||
            activeElement.id === 'tts-pause' ||
            activeElement.id === 'tts-stop' ||
            activeElement.closest('.tts-controls')
        );
        
        if (isTTSControl && e.code === 'Space' && !e.target.matches('input, select, textarea')) {
            e.preventDefault();
            if (TTS.isSpeaking && !TTS.isPaused) {
                TTS.handlePause();
            } else if (TTS.isPaused) {
                TTS.handlePlay();
            } else {
                TTS.handlePlay();
            }
        }
    }
});

