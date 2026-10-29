
        // Organização: o jogo roda em um único script autocontido. O Canvas principal
        // cuida da simulação e dos personagens; o PixiJS, quando disponível, só adiciona
        // brilho e efeitos visuais. update() altera o estado e render() desenha cada quadro.
        // Inicialização
        window.addEventListener('load', () => {
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            const pixiCanvas = document.getElementById('pixiCanvas');
            const medusaSprite = new Image();
            medusaSprite.addEventListener('error', () => {
                console.error('Não foi possível carregar a imagem da Medusa em assets/medusa.png.');
            });
            medusaSprite.src = 'assets/medusa.png';
            // Converte linhas de caracteres em sprites pixel art; "." representa transparência.
            const createPixelArtSprite = (rows, palette) => {
                const pixelSize = 4;
                const sprite = document.createElement('canvas');
                const gridWidth = Math.max(...rows.map(row => row.length));
                sprite.width = gridWidth * pixelSize;
                sprite.height = rows.length * pixelSize;
                const spriteCtx = sprite.getContext('2d');
                rows.forEach((row, y) => {
                    const rowOffset = Math.floor((gridWidth - row.length) / 2);
                    Array.from(row).forEach((colorKey, x) => {
                        if (colorKey !== '.' && palette[colorKey]) {
                            spriteCtx.fillStyle = palette[colorKey];
                            spriteCtx.fillRect((x + rowOffset) * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        }
                    });
                });
                return sprite;
            };
            const monsterPixelArt = Object.create(null);
            const godPixelArt = Object.create(null);
            const pixelArtDefinitions = [
                {
                    name: 'Minotauro',
                    palette: { k: '#21150f', b: '#7c3f20', B: '#b76a35', h: '#e8c982', H: '#9c7443', e: '#fff2b0', r: '#a22c22', g: '#5a301d' },
                    rows: [
                        '...h....h...',
                        '..hHh..hHh..',
                        '...Hk..kH...',
                        '..kbbbbbbk..',
                        '.kbbBeebbBbk.',
                        '.kbbgBBggbbk.',
                        '..kbbBrbbk...',
                        '...kBBBBk....',
                        '..kkBrrBkk...',
                        '..kBrrrBBk...',
                        '.kkbb..bbkk..',
                        '.kkk....kkk..'
                    ]
                },
                {
                    name: 'Esqueleto Hoplita',
                    palette: { k: '#202633', b: '#e5e7eb', B: '#aab4c2', e: '#151b25', g: '#64748b', h: '#cbd5e1', r: '#9f1239' },
                    rows: [
                        '....gggg....',
                        '...gBBBBg...',
                        '..gBbbbbBg..',
                        '..gBeeBBeg.',
                        '..gBebbeBg..',
                        '...gBhhBg...',
                        '....gBBg....',
                        '..kggggggk..',
                        '.kgBghhBgk..',
                        '.kggBggBggk.',
                        '..kBggggBk..',
                        '..kkg..gkk..'
                    ]
                },
                {
                    name: 'Harpia',
                    palette: { k: '#10294a', b: '#1686bd', B: '#56c8f2', c: '#b8edff', e: '#fff7cc', f: '#fff7cc', g: '#f59e0b', w: '#e0f2fe', h: '#854d0e', r: '#0c4a6e' },
                    rows: [
                        '....kB.....kB....',
                        '...kBBk...kBBk...',
                        '..kBBBbk.kbBBBk..',
                        '.kBBBBBBkkBBBBBBk.',
                        'kBBBBbBBkkBBbBBBBk',
                        'kBBBBBBk..kBBBBBBk',
                        '.kBBbk......kBBbk.',
                        '..kk...kBBk...kk..',
                        '.......kBfBk.......',
                        '.......kBegk.......',
                        '........kBBk........',
                        '........kBBk........',
                        '.......kk..kk.......',
                        '......kh....hk......'
                    ]
                },
                {
                    name: 'Medusa',
                    palette: { k: '#12311e', b: '#16a34a', B: '#86efac', e: '#fef08a', g: '#4d7c0f', w: '#fefce8', r: '#166534' },
                    rows: [
                        '.g.g.g.g.g.g.',
                        'gBgBgBgBgBgBg',
                        '.gkgbgkgbgkg',
                        '..kBBBBBBk..',
                        '.kbbBeebbBbk.',
                        '.kbbBBBBbbbk.',
                        '..kbBggBbk...',
                        '...kBBBBk....',
                        '..kBBrrBBk...',
                        '..kbBBBBbk...',
                        '.kkbb..bbkk..',
                        '.kkk....kkk..'
                    ]
                },
                {
                    name: 'Cérbero',
                    palette: { k: '#280d0d', b: '#861b1b', B: '#d3332e', e: '#fff0a6', g: '#4b1717', h: '#f2b84b', r: '#ff713d', w: '#f5d6b8' },
                    rows: [
                        '...kB......kB......kB...',
                        '..kBBk....kBBk....kBBk..',
                        '.kBeeBk...kBeeBk...kBeeBk.',
                        '.kBbbBk...kBbbBk...kBbbBk.',
                        '..kBrk.....kBrk.....kBrk..',
                        '......kBBBBBBBBBBBk......',
                        '.....kBBBBhBBBhBBBBk.....',
                        '....kBBBBBBBBBBBBBBBk....',
                        '....kBkkBBBBBBBBBkkBk....',
                        '...kk..kBBBBBBBBBk..kk...',
                        '...kk...kBBk...kBBk...kk...',
                        '..kkk..kk..k...k..kk..kkk..'
                    ]
                },
                {
                    name: 'Sátiro',
                    palette: { k: '#382315', b: '#b77935', B: '#e9b96e', h: '#f3d28b', e: '#fff1bd', g: '#556b2f', r: '#6b3b23' },
                    rows: [
                        '..h......h...',
                        '.hHh....hHh..',
                        '..Hk....kH...',
                        '..kBBBBBBk...',
                        '.kBBBeebbBBk..',
                        '.kBBBgggBBBk..',
                        '..kBBrrBBk....',
                        '...kBBBBk.....',
                        '..kBBggBBk....',
                        '.kkbB..Bbkk...',
                        '.kkk....kkk...',
                        '..kk....kk....'
                    ]
                },
                {
                    name: 'ARES',
                    palette: { k: '#321312', b: '#991b1b', B: '#dc2626', h: '#fbbf24', e: '#fff1a6', g: '#55565b', w: '#e5e7eb', r: '#5f1010' },
                    rows: [
                        '.....h......',
                        '....hBh.....',
                        '...hBBBh...',
                        '..kBBBBBBk..',
                        '.kgBBBBBBgk.',
                        '.kBBBeebbBk.',
                        '..kBBrrBBk..',
                        '...kBBBBk...',
                        '..kBggggBk..',
                        '.kkBBggBBkk.',
                        '.kkk....kkk.',
                        '..w......w..'
                    ]
                },
                {
                    name: 'POSEIDON',
                    palette: { k: '#082f49', b: '#0e7490', B: '#22d3ee', h: '#fde68a', e: '#fef3c7', w: '#bae6fd', g: '#164e63', r: '#155e75' },
                    rows: [
                        '.......h....',
                        '..w..w.B.w..',
                        '..w..w.B.w..',
                        '..w..w.B.w..',
                        '..w..wkw.w..',
                        '..wkBBBBBk..',
                        '.kBBBeebbBBk.',
                        '.kBBBBggBBBk.',
                        '..kBBrrBBk...',
                        '...kBBBBk....',
                        '..kBBBBBBk...',
                        '.kkk....kkk..'
                    ]
                },
                {
                    name: 'HADES',
                    palette: { k: '#211323', b: '#581c36', B: '#9d174d', h: '#fb923c', e: '#fef08a', g: '#3f1d39', w: '#d8b4fe', r: '#7f1d1d' },
                    rows: [
                        '..h..h..h...',
                        '.hBhBhBhBh..',
                        '..kBBBBBk...',
                        '.kBBBBBBBk..',
                        '.kBBBeebbBk.',
                        '..kBBggBBk...',
                        '..kBBrrBBk...',
                        '...kBBBBk....',
                        '..kBBwwBBk...',
                        '.kkbBBBBbkk..',
                        '.kkk....kkk..',
                        '..h......h...'
                    ]
                },
                {
                    name: 'APOLO',
                    palette: { k: '#713f12', b: '#b45309', B: '#f59e0b', h: '#fde047', e: '#fff7c2', g: '#854d0e', w: '#fef3c7', r: '#92400e' },
                    rows: [
                        '...h.h.h....',
                        '..hBBBBBh...',
                        '.hBkkkkkBh..',
                        '...kBBBBk...',
                        '..kBBBBBBk..',
                        '.kBBBeebbBBk.',
                        '.kBBBBggBBBk.',
                        '..kBBrrBBk...',
                        '...kBBBBk....',
                        '..kBwwwwBk...',
                        '.kkbBBBBbkk..',
                        '.kkk....kkk..'
                    ]
                },
                {
                    name: 'ATENA',
                    palette: { k: '#1e293b', b: '#475569', B: '#94a3b8', h: '#fbbf24', e: '#fff1a6', g: '#334155', w: '#e2e8f0', r: '#64748b' },
                    rows: [
                        '....hBh.....',
                        '...hBBBh...',
                        '..kBBBBBBk..',
                        '..kBBBBBBk..',
                        '.kBBBeebbBBk.',
                        '.kBBBBggBBBk.',
                        '..kBBrrBBk...',
                        '..kBBBBBBk...',
                        '.kkBBwwBBkk..',
                        '.kkbBBBBbkk..',
                        '.kkk....kkk..',
                        '..kk....kk...'
                    ]
                },
                {
                    name: 'ZEUS',
                    palette: { k: '#273244', b: '#64748b', B: '#cbd5e1', h: '#facc15', e: '#fff7c2', g: '#475569', w: '#f8fafc', r: '#2563eb' },
                    rows: [
                        '....h..h....',
                        '...hBBBBh...',
                        '..kBBBBBBk..',
                        '.kBBBBBBBBk.',
                        '.kBBBeebbBBk.',
                        '..kBBggBBk...',
                        '...kBrrBk....',
                        '..kBBBBBBk...',
                        '.kkBwwwwBkk..',
                        '.kkkBwwBkkk..',
                        '.kkk....kkk..',
                        '..h......h...'
                    ]
                }
            ];
            pixelArtDefinitions.forEach(definition => {
                const sprite = createPixelArtSprite(definition.rows, definition.palette);
                (['ARES', 'POSEIDON', 'HADES', 'APOLO', 'ATENA', 'ZEUS'].includes(definition.name)
                    ? godPixelArt
                    : monsterPixelArt)[definition.name] = sprite;
            });
            let medusaPixelArt = null;
            medusaSprite.addEventListener('load', () => {
                medusaPixelArt = document.createElement('canvas');
                medusaPixelArt.width = 24;
                medusaPixelArt.height = 18;
                const medusaPixelCtx = medusaPixelArt.getContext('2d');
                medusaPixelCtx.imageSmoothingEnabled = false;
                medusaPixelCtx.drawImage(medusaSprite, 0, 0, medusaPixelArt.width, medusaPixelArt.height);
            });
            let viewportWidth = window.innerWidth;
            let viewportHeight = window.innerHeight;
            let pixiApp = null;
            let pixiFxRoot = null;
            let pixiGlowLayer = null;
            let pixiLightningLayer = null;

            // PIXI: cria a camada WebGL sem substituir o Canvas das mecânicas
            // Function: initPixiFx — inicializa os efeitos gráficos do PixiJS.
            function initPixiFx() {
                if (!window.PIXI) {
                    console.warn('PixiJS não foi carregado; o jogo continuará usando os gráficos Canvas.');
                    return;
                }

                try {
                    pixiApp = new PIXI.Application({
                        view: pixiCanvas,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        backgroundAlpha: 0,
                        antialias: true,
                        autoDensity: true,
                        resolution: Math.min(window.devicePixelRatio || 1, 2),
                        powerPreference: 'high-performance'
                    });
                    pixiApp.ticker.stop();

                    pixiFxRoot = new PIXI.Container();
                    pixiGlowLayer = new PIXI.Graphics();
                    pixiLightningLayer = new PIXI.Graphics();
                    pixiFxRoot.addChild(pixiGlowLayer, pixiLightningLayer);
                    pixiApp.stage.addChild(pixiFxRoot);
                } catch (error) {
                    console.error('Não foi possível iniciar os efeitos gráficos do PixiJS:', error);
                    if (pixiApp) pixiApp.destroy(true, { children: true });
                    pixiApp = null;
                    pixiFxRoot = null;
                    pixiGlowLayer = null;
                    pixiLightningLayer = null;
                }
            }

            // Function: resizeCanvas — ajusta os canvases ao tamanho e à resolução da tela.
            function resizeCanvas() {
                viewportWidth = window.innerWidth;
                viewportHeight = window.innerHeight;
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.round(viewportWidth * pixelRatio);
                canvas.height = Math.round(viewportHeight * pixelRatio);
                ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                if (pixiApp) pixiApp.renderer.resize(viewportWidth, viewportHeight);
            }
            resizeCanvas();
            initPixiFx();
            window.addEventListener('resize', resizeCanvas);

            // Áudio
            const AudioFX = {
                ctx: null,
                unavailable: false,
                // Function: init — prepara e retorna o contexto de áudio.
                init() {
                    if (this.unavailable) return null;

                    try {
                        if (!this.ctx) {
                            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                            if (!AudioContextClass) {
                                this.unavailable = true;
                                console.error('Web Audio API não é suportada neste navegador.');
                                return null;
                            }
                            this.ctx = new AudioContextClass();
                        }

                        if (this.ctx.state === 'suspended') {
                            this.ctx.resume().catch(error => {
                                console.error('Não foi possível ativar o áudio do jogo:', error);
                            });
                        }
                        return this.ctx;
                    } catch (error) {
                        this.unavailable = true;
                        console.error('Não foi possível inicializar o áudio do jogo:', error);
                        return null;
                    }
                },
                // Function: play — reproduz um efeito após liberar o contexto de áudio.
                play(callback) {
                    const audioContext = this.init();
                    if (!audioContext) return;

                    if (audioContext.state === 'running') {
                        callback(audioContext);
                        return;
                    }

                    audioContext.resume()
                        .then(() => {
                            if (audioContext.state === 'running') callback(audioContext);
                        })
                        .catch(error => {
                            console.error('Não foi possível reproduzir o áudio do jogo:', error);
                        });
                },
                // Function: playSword — toca o efeito do ataque de espada.
                playSword() {
                    this.play(audioContext => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(300, audioContext.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.15);
                        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.15);
                    });
                },
                // Function: playLightning — toca o efeito de lançamento do raio.
                playLightning() {
                    this.play(audioContext => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(600, audioContext.currentTime);
                        osc.frequency.setValueAtTime(200, audioContext.currentTime + 0.05);
                        gain.gain.setValueAtTime(0.25, audioContext.currentTime);
                        gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.25);
                    });
                },
                // Function: playLightningImpact — toca o impacto e o trovão do raio.
                playLightningImpact() {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const crackDuration = 0.16;
                        const rumbleDuration = 0.55;
                        const noiseBuffer = audioContext.createBuffer(
                            1,
                            Math.floor(audioContext.sampleRate * crackDuration),
                            audioContext.sampleRate
                        );
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let sample = 0; sample < noiseData.length; sample++) {
                            noiseData[sample] = (Math.random() * 2 - 1) * Math.exp(-sample / (noiseData.length * 0.22));
                        }

                        const crack = audioContext.createBufferSource();
                        const filter = audioContext.createBiquadFilter();
                        const crackGain = audioContext.createGain();
                        crack.buffer = noiseBuffer;
                        filter.type = 'highpass';
                        filter.frequency.setValueAtTime(700, now);
                        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.025);
                        crackGain.gain.setValueAtTime(0.32, now);
                        crackGain.gain.exponentialRampToValueAtTime(0.01, now + crackDuration);
                        crack.connect(filter);
                        filter.connect(crackGain);
                        crackGain.connect(audioContext.destination);
                        crack.start(now);
                        crack.stop(now + crackDuration);

                        const rumble = audioContext.createOscillator();
                        const rumbleGain = audioContext.createGain();
                        rumble.type = 'triangle';
                        rumble.frequency.setValueAtTime(95 + Math.random() * 35, now + 0.025);
                        rumble.frequency.exponentialRampToValueAtTime(32, now + rumbleDuration);
                        rumbleGain.gain.setValueAtTime(0.2, now + 0.025);
                        rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + rumbleDuration);
                        rumble.connect(rumbleGain);
                        rumbleGain.connect(audioContext.destination);
                        rumble.start(now + 0.025);
                        rumble.stop(now + rumbleDuration);
                    });
                },
                // Function: playLightningChain — toca os estalos da corrente de raios.
                playLightningChain(segmentCount) {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const segments = Math.max(1, segmentCount);
                        const segmentDelay = 0.11;
                        const crackDuration = 0.09;
                        const toneDuration = 0.2;

                        for (let index = 0; index < segments; index++) {
                            const startTime = now + index * segmentDelay;
                            const pitch = Math.max(260, 1050 - index * 105);
                            const noiseBuffer = audioContext.createBuffer(
                                1,
                                Math.floor(audioContext.sampleRate * crackDuration),
                                audioContext.sampleRate
                            );
                            const noiseData = noiseBuffer.getChannelData(0);
                            for (let sample = 0; sample < noiseData.length; sample++) {
                                noiseData[sample] = (Math.random() * 2 - 1) * Math.exp(-sample / (noiseData.length * 0.18));
                            }

                            const crack = audioContext.createBufferSource();
                            const filter = audioContext.createBiquadFilter();
                            const crackGain = audioContext.createGain();
                            crack.buffer = noiseBuffer;
                            filter.type = 'highpass';
                            filter.frequency.setValueAtTime(Math.max(500, pitch * 1.4), startTime);
                            crackGain.gain.setValueAtTime(0.24, startTime);
                            crackGain.gain.exponentialRampToValueAtTime(0.01, startTime + crackDuration);
                            crack.connect(filter);
                            filter.connect(crackGain);
                            crackGain.connect(audioContext.destination);
                            crack.start(startTime);
                            crack.stop(startTime + crackDuration);

                            const tone = audioContext.createOscillator();
                            const toneGain = audioContext.createGain();
                            tone.type = 'sawtooth';
                            tone.frequency.setValueAtTime(pitch, startTime);
                            tone.frequency.exponentialRampToValueAtTime(pitch * 0.48, startTime + toneDuration);
                            toneGain.gain.setValueAtTime(0.1, startTime);
                            toneGain.gain.exponentialRampToValueAtTime(0.01, startTime + toneDuration);
                            tone.connect(toneGain);
                            toneGain.connect(audioContext.destination);
                            tone.start(startTime);
                            tone.stop(startTime + toneDuration);
                        }
                    });
                },
                // Function: playFireLaunch — toca o lançamento da bola de fogo.
                playFireLaunch() {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const duration = 0.28;
                        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let i = 0; i < noiseData.length; i++) {
                            noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
                        }

                        const noise = audioContext.createBufferSource();
                        const filter = audioContext.createBiquadFilter();
                        const noiseGain = audioContext.createGain();
                        noise.buffer = noiseBuffer;
                        filter.type = 'bandpass';
                        filter.frequency.setValueAtTime(1300, now);
                        filter.frequency.exponentialRampToValueAtTime(350, now + duration);
                        filter.Q.value = 0.7;
                        noiseGain.gain.setValueAtTime(0.22, now);
                        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        noise.connect(filter);
                        filter.connect(noiseGain);
                        noiseGain.connect(audioContext.destination);
                        noise.start(now);
                        noise.stop(now + duration);

                        const body = audioContext.createOscillator();
                        const bodyGain = audioContext.createGain();
                        body.type = 'triangle';
                        body.frequency.setValueAtTime(170, now);
                        body.frequency.exponentialRampToValueAtTime(65, now + duration);
                        bodyGain.gain.setValueAtTime(0.12, now);
                        bodyGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        body.connect(bodyGain);
                        bodyGain.connect(audioContext.destination);
                        body.start(now);
                        body.stop(now + duration);
                    });
                },
                // Function: playFireImpact — toca a explosão da bola de fogo.
                playFireImpact() {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const duration = 0.36;
                        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let i = 0; i < noiseData.length; i++) {
                            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.16));
                        }

                        const noise = audioContext.createBufferSource();
                        const filter = audioContext.createBiquadFilter();
                        const noiseGain = audioContext.createGain();
                        noise.buffer = noiseBuffer;
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(2200, now);
                        filter.frequency.exponentialRampToValueAtTime(180, now + duration);
                        noiseGain.gain.setValueAtTime(0.42, now);
                        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        noise.connect(filter);
                        filter.connect(noiseGain);
                        noiseGain.connect(audioContext.destination);
                        noise.start(now);
                        noise.stop(now + duration);

                        const boom = audioContext.createOscillator();
                        const boomGain = audioContext.createGain();
                        boom.type = 'sine';
                        boom.frequency.setValueAtTime(105, now);
                        boom.frequency.exponentialRampToValueAtTime(38, now + 0.28);
                        boomGain.gain.setValueAtTime(0.32, now);
                        boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
                        boom.connect(boomGain);
                        boomGain.connect(audioContext.destination);
                        boom.start(now);
                        boom.stop(now + 0.28);
                    });
                },
                // Function: playMiniExplosion — toca a microexplosão das fagulhas.
                playMiniExplosion() {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const duration = 0.1;
                        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let i = 0; i < noiseData.length; i++) {
                            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.2));
                        }

                        const noise = audioContext.createBufferSource();
                        const filter = audioContext.createBiquadFilter();
                        const noiseGain = audioContext.createGain();
                        noise.buffer = noiseBuffer;
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(2600, now);
                        filter.frequency.exponentialRampToValueAtTime(700, now + duration);
                        noiseGain.gain.setValueAtTime(0.16, now);
                        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        noise.connect(filter);
                        filter.connect(noiseGain);
                        noiseGain.connect(audioContext.destination);
                        noise.start(now);
                        noise.stop(now + duration);
                    });
                },
                // Function: playIceCast — toca o lançamento da habilidade de gelo.
                playIceCast() {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const duration = 0.42;
                        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let i = 0; i < noiseData.length; i++) {
                            noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
                        }

                        const noise = audioContext.createBufferSource();
                        const filter = audioContext.createBiquadFilter();
                        const noiseGain = audioContext.createGain();
                        noise.buffer = noiseBuffer;
                        filter.type = 'bandpass';
                        filter.frequency.setValueAtTime(1800, now);
                        filter.frequency.exponentialRampToValueAtTime(500, now + duration);
                        filter.Q.value = 1.2;
                        noiseGain.gain.setValueAtTime(0.01, now);
                        noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.08);
                        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        noise.connect(filter);
                        filter.connect(noiseGain);
                        noiseGain.connect(audioContext.destination);
                        noise.start(now);
                        noise.stop(now + duration);

                        const iceTone = audioContext.createOscillator();
                        const toneGain = audioContext.createGain();
                        iceTone.type = 'sine';
                        iceTone.frequency.setValueAtTime(1100, now);
                        iceTone.frequency.exponentialRampToValueAtTime(420, now + duration);
                        toneGain.gain.setValueAtTime(0.08, now);
                        toneGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        iceTone.connect(toneGain);
                        toneGain.connect(audioContext.destination);
                        iceTone.start(now);
                        iceTone.stop(now + duration);
                    });
                },
                // Function: playFreezeImpact — toca o impacto de congelamento.
                playFreezeImpact() {
                    this.play(audioContext => {
                        const now = audioContext.currentTime;
                        const duration = 0.2;
                        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let i = 0; i < noiseData.length; i++) {
                            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.12));
                        }

                        const crack = audioContext.createBufferSource();
                        const filter = audioContext.createBiquadFilter();
                        const crackGain = audioContext.createGain();
                        crack.buffer = noiseBuffer;
                        filter.type = 'highpass';
                        filter.frequency.setValueAtTime(900, now);
                        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.04);
                        crackGain.gain.setValueAtTime(0.3, now);
                        crackGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                        crack.connect(filter);
                        filter.connect(crackGain);
                        crackGain.connect(audioContext.destination);
                        crack.start(now);
                        crack.stop(now + duration);

                        const frostTone = audioContext.createOscillator();
                        const toneGain = audioContext.createGain();
                        frostTone.type = 'triangle';
                        frostTone.frequency.setValueAtTime(720, now);
                        frostTone.frequency.exponentialRampToValueAtTime(180, now + 0.16);
                        toneGain.gain.setValueAtTime(0.11, now);
                        toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
                        frostTone.connect(toneGain);
                        toneGain.connect(audioContext.destination);
                        frostTone.start(now);
                        frostTone.stop(now + 0.16);
                    });
                },
                // Function: playLevelUp — toca o efeito de subida de nível.
                playLevelUp() {
                    this.play(audioContext => {
                        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
                            const startTime = audioContext.currentTime + idx * 0.08;
                            const osc = audioContext.createOscillator();
                            const gain = audioContext.createGain();
                            osc.type = 'sine';
                            osc.frequency.value = freq;
                            gain.gain.setValueAtTime(0.15, startTime);
                            gain.gain.linearRampToValueAtTime(0.01, startTime + 0.3);
                            osc.connect(gain);
                            gain.connect(audioContext.destination);
                            osc.start(startTime);
                            osc.stop(startTime + 0.3);
                        });
                    });
                }
            };
            window.addEventListener('pointerdown', () => AudioFX.init());
            window.addEventListener('keydown', () => AudioFX.init());

            // Cada bioma agrupa a paleta do cenário, estruturas decorativas e seu evento periódico.
            const BIOMES = [
                {
                    name: "Ruínas do Olimpo",
                    bg: "#101622",
                    floor: "#1c2536",
                    grid: "#2a374e",
                    ruinColor: "#d4af37",
                    particleColor: "#fef08a",
                    ruinTypes: ['broken_column', 'god_statue', 'god_statue'],
                    event: "onda",
                    eventName: "Chamado do Olimpo"
                },
                {
                    name: "Tártaro / Submundo",
                    bg: "#14090c",
                    floor: "#241016",
                    grid: "#3d1822",
                    ruinColor: "#991b1b",
                    particleColor: "#f87171",
                    ruinTypes: ['tartarus_gate', 'soul_obelisk', 'underworld_altar'],
                    event: "cerberus",
                    eventName: "Investida do Submundo"
                },
                {
                    name: "Costa do Egeu",
                    bg: "#081c24",
                    floor: "#0f3240",
                    grid: "#184e63",
                    ruinColor: "#38bdf8",
                    particleColor: "#7dd3fc",
                    ruinTypes: ['shipwreck', 'poseidon_statue', 'poseidon_statue'],
                    event: "healing",
                    eventName: "Maré Curativa"
                },
                {
                    name: "Floresta dos Sátiros",
                    bg: "#0a1a0f",
                    floor: "#132e1b",
                    grid: "#1e472a",
                    ruinColor: "#22c55e",
                    particleColor: "#86efac",
                    ruinTypes: ['sacred_tree', 'rune_stone', 'forest_shrine'],
                    event: "satyrs",
                    eventName: "Emboscada dos Sátiros"
                },
                {
                    name: "Pico Nebuloso",
                    bg: "#0f172a",
                    floor: "#1e293b",
                    grid: "#334155",
                    ruinColor: "#e2e8f0",
                    particleColor: "#38bdf8",
                    ruinTypes: ['frozen_monolith', 'frozen_statue', 'frozen_statue'],
                    event: "frost",
                    eventName: "Nevasca Divina"
                }
            ];

            let currentBiomeIdx = 0;
            let biomeTimer = 30;
            let activeBiomeEvent = null;
            let enemyProjectiles = [];
            let pendingLightningStrikes = [];
            const biomeFloorPatterns = new Array(BIOMES.length).fill(null);
            let cachedVignette = null;
            let cachedVignetteWidth = 0;
            let cachedVignetteHeight = 0;

            // Estado global da partida: progressão, ciclo de chefes e entradas ativas.
            let isStarted = false;
            let isPaused = false;
            let isGameOver = false;
            let screenShake = 0;
            let totalKills = 0;
            let survivalTime = 0;
            let bossesDefeated = 0;
            let zeusDefeated = false;
            // Os cinco chefes regulares aparecem nesta ordem; depois da lista, a escolha é aleatória.
            const regularBosses = ['ARES', 'POSEIDON', 'HADES', 'APOLO', 'ATENA'];
            let nextRegularBossIndex = 0;
            let enemySpawnTimer = 1 / (0.04 * 60);
            let keys = {};
            let touchMovement = { x: 0, y: 0 };
            let mousePos = { x: viewportWidth / 2, y: viewportHeight / 2 };
            const recordsKey = 'olimpoRpgRecords';

            // Function: loadRecords — carrega os recordes salvos no navegador.
            function loadRecords() {
                const emptyRecords = { level: 0, kills: 0, survival: 0, bosses: 0 };
                try {
                    const savedRecords = localStorage.getItem(recordsKey);
                    if (!savedRecords) return emptyRecords;
                    const parsed = JSON.parse(savedRecords);
                    return {
                        level: Number.isFinite(parsed.level) ? parsed.level : 0,
                        kills: Number.isFinite(parsed.kills) ? parsed.kills : 0,
                        survival: Number.isFinite(parsed.survival) ? parsed.survival : 0,
                        bosses: Number.isFinite(parsed.bosses) ? parsed.bosses : 0
                    };
                } catch (error) {
                    console.error('Não foi possível carregar os recordes do jogo:', error);
                    return emptyRecords;
                }
            }

            let records = loadRecords();

            // Function: saveRecords — atualiza e salva os recordes da partida.
            function saveRecords() {
                records = {
                    level: Math.max(records.level, player.level),
                    kills: Math.max(records.kills, totalKills),
                    survival: Math.max(records.survival, Math.floor(survivalTime)),
                    bosses: Math.max(records.bosses, bossesDefeated)
                };
                try {
                    localStorage.setItem(recordsKey, JSON.stringify(records));
                } catch (error) {
                    console.error('Não foi possível salvar os recordes do jogo:', error);
                }
            }

            // Function: getObjectives — retorna o progresso dos objetivos.
            function getObjectives() {
                return [
                    { title: 'Derrote 100 inimigos', progress: Math.min(totalKills, 100), goal: 100, done: totalKills >= 100 },
                    { title: 'Sobreviva por 2 minutos', progress: Math.min(Math.floor(survivalTime), 120), goal: 120, done: survivalTime >= 120 },
                    { title: 'Derrote Zeus', progress: zeusDefeated ? 1 : 0, goal: 1, done: zeusDefeated }
                ];
            }

            // Function: renderObjectives — mostra os objetivos em um painel.
            function renderObjectives(containerId) {
                const container = document.getElementById(containerId);
                container.innerHTML = getObjectives().map(objective => `
                    <div class="flex justify-between gap-2 ${objective.done ? 'text-green-300' : 'text-gray-300'}">
                        <span>${objective.done ? '✓' : '○'} ${objective.title}</span>
                        <strong>${objective.progress}/${objective.goal}</strong>
                    </div>
                `).join('');
            }

            // Function: renderRecords — mostra os recordes em um painel.
            function renderRecords(containerId) {
                const container = document.getElementById(containerId);
                container.innerHTML = `
                    <div class="flex justify-between text-gray-300"><span>Maior nível</span><strong class="text-amber-300">${records.level}</strong></div>
                    <div class="flex justify-between text-gray-300"><span>Mais inimigos</span><strong class="text-amber-300">${records.kills}</strong></div>
                    <div class="flex justify-between text-gray-300"><span>Maior sobrevivência</span><strong class="text-cyan-200">${formatRunTime(records.survival)}</strong></div>
                    <div class="flex justify-between text-gray-300"><span>Chefes derrotados</span><strong class="text-purple-300">${records.bosses}</strong></div>
                `;
            }

            // Function: formatRunTime — formata segundos como minutos e segundos.
            function formatRunTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`;
            }

            // A câmera acompanha o jogador; as entidades do mundo são desenhadas em coordenadas de tela
            // subtraindo a posição da câmera.
            const camera = {
                x: 0,
                y: 0
            };

            // Estado, atributos e recursos do jogador. As melhorias e passivas ficam aninhadas no objeto.
            const player = {
                x: 0,
                y: 0,
                radius: 20,
                speed: 4.5,
                hp: 100,
                maxHp: 100,
                level: 1,
                xp: 0,
                xpNeeded: 100,
                lastHitTime: Date.now(),
                regenTimer: 0,
                fireAuraTimer: 0,
                damageBuffTimer: 0,
                
                // Recargas
                cdDash: 0,
                maxCdDash: 2.5,
                dashTimer: 0,
                dashDirection: { x: 0, y: 0 },
                cdQ: 0, maxCdQ: 4,
                cdE: 0, maxCdE: 6,
                cdF: 0, maxCdF: 5,
                cdR: 0, maxCdR: 12,
                cdT: 0, maxCdT: 18,
                hasSuperSkill: false,
                hasInfernoSkill: false,

                // Habilidades passivas
                passives: {
                    fireAura: false,
                    shield: false,
                    lifesteal: false,
                    crit: false,
                    giantSword: false,
                    swiftness: false
                },
                upgrades: {
                    fire: 0,
                    frost: 0,
                    lightning: 0
                },

                // Ataque
                isAttacking: false,
                attackAngle: 0,
                attackTimer: 0,

                inventory: [],

                // Function: getSkillScale — calcula a escala atual das habilidades.
                getSkillScale() {
                    // Escala das habilidades
                    return Math.min(3.0, 1.0 + (this.level - 1) * (2.0 / 99));
                },

                // Function: getAttackDamage — calcula o dano do ataque básico.
                getAttackDamage() {
                    return Math.floor(25 * (1 + (this.level - 1) * 0.15));
                }
            };

            // Listas do jogo
            let enemies = [];
            let projectiles = [];
            let particles = [];
            let floatingTexts = [];
            let itemsOnGround = [];
            let ruinsList = [];
            let currentBoss = null;
            let activeBossArena = null;
            const BOSS_ARENA_RADIUS = 680;
            const BOSS_ARENA_STYLES = {
                ARES: { floor: '#2a1114', edge: '#ef4444', accent: '#fbbf24' },
                ZEUS: { floor: '#172235', edge: '#a5b4fc', accent: '#facc15' },
                POSEIDON: { floor: '#0b2935', edge: '#38bdf8', accent: '#67e8f9' },
                HADES: { floor: '#240d19', edge: '#c026d3', accent: '#fb7185' },
                APOLO: { floor: '#35230f', edge: '#f59e0b', accent: '#fef08a' },
                ATENA: { floor: '#1d2931', edge: '#94a3b8', accent: '#a5f3fc' }
            };

            // Distribui três estruturas ao redor de cada sítio, mantendo espaço livre perto do centro
            // para o combate e evitando que os desenhos se sobreponham.
            const ruinSites = [
                { x: -1400, y: -1100 },
                { x: 0, y: -1300 },
                { x: 1400, y: -1000 },
                { x: -1000, y: 0 },
                { x: 350, y: 100 },
                { x: 1500, y: 850 },
                { x: -700, y: 1350 },
                { x: 750, y: 1500 }
            ];
            ruinSites.forEach(site => {
                const siteOffset = Math.random() * Math.PI * 2;
                for (let i = 0; i < 3; i++) {
                    const angle = siteOffset + i * Math.PI * 2 / 3;
                    const distance = 300 + Math.random() * 90;
                    ruinsList.push({
                        x: site.x + Math.cos(angle) * distance,
                        y: site.y + Math.sin(angle) * distance,
                        type: i % 3,
                        scale: 0.9 + Math.random() * 0.3,
                        used: false
                    });
                }
            });
            let nearbyRuin = null;
            let altarChoiceRuin = null;
            const RUIN_INTERACTION_RANGE = 135;

            // Traduz o tipo visual da estrutura em uma categoria de interação, ou null se for decorativa.
            function getRuinInteractionKind(ruin) {
                const type = BIOMES[currentBiomeIdx].ruinTypes[ruin.type];
                if (type.endsWith('_altar') || type.endsWith('_shrine') ||
                    type.endsWith('_temple') || type === 'snow_sanctuary') return 'altar';
                if (type.includes('obelisk') || type === 'rune_stone' ||
                    type === 'frozen_monolith') return 'obelisk';
                return null;
            }

            // Retorna a estrutura utilizável mais próxima dentro do alcance ajustado pelo tamanho.
            function findNearbyRuin() {
                let closest = null;
                let closestDistance = Infinity;
                ruinsList.forEach(ruin => {
                    if (ruin.used || !getRuinInteractionKind(ruin)) return;
                    const distance = Math.hypot(player.x - ruin.x, player.y - ruin.y);
                    if (distance <= RUIN_INTERACTION_RANGE * ruin.scale && distance < closestDistance) {
                        closest = ruin;
                        closestDistance = distance;
                    }
                });
                return closest;
            }

            // Sincroniza o aviso de teclado e o botão de toque com a estrutura atualmente alcançável.
            function updateRuinInteractionHint() {
                const hint = document.getElementById('structure-interact-hint');
                const mobileButton = document.getElementById('mobile-interact');
                nearbyRuin = !activeBossArena && !isPaused && !isGameOver && isStarted ? findNearbyRuin() : null;
                if (!nearbyRuin) {
                    hint.classList.add('hidden');
                    mobileButton.classList.add('hidden');
                    return;
                }

                const kind = getRuinInteractionKind(nearbyRuin);
                document.getElementById('structure-interact-name').textContent =
                    kind === 'altar' ? 'Santuário · escolha uma dádiva' : 'Obelisco · bênção de dano';
                hint.classList.remove('hidden');
                mobileButton.classList.remove('hidden');
                mobileButton.setAttribute('aria-label', `Interagir com ${kind === 'altar' ? 'santuário' : 'obelisco'}`);
            }

            // Abre a escolha do altar ou consome o obelisco; estruturas usadas não podem ser reutilizadas.
            function activateRuin() {
                if (!isStarted || isPaused || isGameOver || !nearbyRuin) return;
                if (getRuinInteractionKind(nearbyRuin) === 'altar') {
                    altarChoiceRuin = nearbyRuin;
                    isPaused = true;
                    document.getElementById('modal-altar-choice').classList.remove('hidden');
                    document.getElementById('btn-altar-heal').focus();
                    updateRuinInteractionHint();
                    return;
                }

                nearbyRuin.used = true;
                player.damageBuffTimer = Math.max(player.damageBuffTimer, 30);
                floatingTexts.push({
                    text: 'BÊNÇÃO DO OBELISCO · +30% DANO',
                    x: player.x,
                    y: player.y - 55,
                    color: '#c084fc',
                    life: 2,
                    fontSize: 18
                });
                AudioFX.playLevelUp();
                updateRuinInteractionHint();
            }

            // Aplica a dádiva escolhida e encerra a pausa aberta pelo modal do altar.
            function resolveAltarChoice(choice) {
                if (!altarChoiceRuin) return;
                const ruin = altarChoiceRuin;
                altarChoiceRuin = null;
                ruin.used = true;
                document.getElementById('modal-altar-choice').classList.add('hidden');

                if (choice === 'heal') {
                    const restored = Math.min(player.maxHp * 0.4, player.maxHp - player.hp);
                    player.hp += restored;
                    floatingTexts.push({
                        text: `DÁDIVA VITAL · +${Math.round(restored)} VIDA`,
                        x: player.x,
                        y: player.y - 55,
                        color: '#4ade80',
                        life: 2,
                        fontSize: 18
                    });
                } else {
                    player.damageBuffTimer = Math.max(player.damageBuffTimer, 30);
                    floatingTexts.push({
                        text: 'FÚRIA OLIMPIANA · +30% DANO',
                        x: player.x,
                        y: player.y - 55,
                        color: '#fbbf24',
                        life: 2,
                        fontSize: 18
                    });
                }

                AudioFX.playLevelUp();
                isPaused = false;
                updateRuinInteractionHint();
            }

            // Fecha a escolha sem consumir o altar, permitindo interagir com ele mais tarde.
            function cancelAltarChoice() {
                if (!altarChoiceRuin) return;
                altarChoiceRuin = null;
                document.getElementById('modal-altar-choice').classList.add('hidden');
                isPaused = false;
                updateRuinInteractionHint();
            }

            // Controles
            // Function: keydown — processa movimento, pausa e atalhos de habilidades.
            window.addEventListener('keydown', (e) => {
                if (!isStarted) return;
                if (!document.getElementById('modal-altar-choice').classList.contains('hidden')) {
                    if (e.key === 'Escape') cancelAltarChoice();
                    return;
                }
                keys[e.key.toLowerCase()] = true;
                if (e.key === 'Escape') {
                    togglePause();
                }
                if (!isPaused) {
                    if (e.key.toLowerCase() === 'g') activateRuin();
                    if (e.key === ' ' || e.code === 'Space') {
                        playerAttack();
                    }
                    if (e.key.toLowerCase() === 'q') castSkillQ();
                    if (e.key.toLowerCase() === 'e') castSkillE();
                    if (e.key.toLowerCase() === 'f') castSkillF();
                    if (e.key.toLowerCase() === 'r' && player.hasSuperSkill) castSkillR();
                    if (e.key.toLowerCase() === 't' && player.hasInfernoSkill) castSkillT();
                }
            });

            // Function: keyup — libera a tecla registrada como pressionada.
            window.addEventListener('keyup', (e) => {
                keys[e.key.toLowerCase()] = false;
            });

            // Function: blur — limpa teclas pressionadas quando a janela perde foco.
            window.addEventListener('blur', () => {
                keys = {};
                resetTouchJoystick();
            });

            const touchJoystick = document.getElementById('touch-joystick');
            const touchJoystickKnob = document.getElementById('touch-joystick-knob');
            let activeJoystickPointer = null;

            // Converte a posição do ponteiro em direção normalizada e limita o movimento do manche.
            function updateTouchJoystick(event) {
                const bounds = touchJoystick.getBoundingClientRect();
                const maxDistance = bounds.width * 0.34;
                const offsetX = event.clientX - (bounds.left + bounds.width / 2);
                const offsetY = event.clientY - (bounds.top + bounds.height / 2);
                const distance = Math.hypot(offsetX, offsetY);
                const scale = distance > maxDistance ? maxDistance / distance : 1;
                const limitedX = offsetX * scale;
                const limitedY = offsetY * scale;
                const directionLength = Math.hypot(limitedX, limitedY);
                const directionX = directionLength ? limitedX / directionLength : 0;
                const directionY = directionLength ? limitedY / directionLength : 0;

                touchJoystickKnob.style.left = `calc(50% + ${limitedX}px)`;
                touchJoystickKnob.style.top = `calc(50% + ${limitedY}px)`;
                touchMovement = directionLength > maxDistance * 0.18
                    ? { x: directionX, y: directionY }
                    : { x: 0, y: 0 };

                if (touchMovement.x || touchMovement.y) {
                    mousePos.x = viewportWidth / 2 + directionX * 120;
                    mousePos.y = viewportHeight / 2 + directionY * 120;
                }
            }

            // Zera o deslocamento móvel ao soltar o manche ou perder a captura do ponteiro.
            function resetTouchJoystick() {
                activeJoystickPointer = null;
                touchMovement = { x: 0, y: 0 };
                touchJoystickKnob.style.left = '50%';
                touchJoystickKnob.style.top = '50%';
            }

            touchJoystick.addEventListener('pointerdown', event => {
                event.preventDefault();
                activeJoystickPointer = event.pointerId;
                touchJoystick.setPointerCapture(event.pointerId);
                updateTouchJoystick(event);
            });
            touchJoystick.addEventListener('pointermove', event => {
                if (event.pointerId === activeJoystickPointer) updateTouchJoystick(event);
            });
            touchJoystick.addEventListener('pointerup', event => {
                if (event.pointerId === activeJoystickPointer) resetTouchJoystick();
            });
            touchJoystick.addEventListener('pointercancel', resetTouchJoystick);
            touchJoystick.addEventListener('lostpointercapture', resetTouchJoystick);

            // Function: mousemove — atualiza a posição do cursor para mirar.
            window.addEventListener('mousemove', (e) => {
                mousePos.x = e.clientX;
                mousePos.y = e.clientY;
            });

            // Function: mousedown — executa ataque ou esquiva pelos botões do mouse.
            window.addEventListener('mousedown', (e) => {
                if (e.target.tagName !== 'CANVAS' || !isStarted || isPaused) return;
                if (e.button === 0) {
                    playerAttack();
                } else if (e.button === 2) {
                    dash();
                }
            });
            canvas.addEventListener('contextmenu', e => e.preventDefault());

            // Botões da interface conectam os modais, ações de pausa e equivalentes dos controles móveis.
            // Function: startGame — fecha o menu inicial e inicia a partida.
            document.getElementById('btn-start').addEventListener('click', () => {
                isStarted = true;
                document.getElementById('start-menu').classList.add('hidden');
                lastTime = performance.now();
            });
            document.getElementById('btn-pause').addEventListener('click', togglePause);
            document.getElementById('btn-resume').addEventListener('click', togglePause);
            document.getElementById('btn-close-pause').addEventListener('click', togglePause);
            document.getElementById('btn-restart').addEventListener('click', () => location.reload());
            document.getElementById('btn-game-over-restart').addEventListener('click', () => location.reload());
            document.getElementById('btn-victory-restart').addEventListener('click', () => location.reload());
            document.getElementById('btn-altar-heal').addEventListener('click', () => resolveAltarChoice('heal'));
            document.getElementById('btn-altar-damage').addEventListener('click', () => resolveAltarChoice('damage'));
            document.getElementById('btn-altar-leave').addEventListener('click', cancelAltarChoice);
            const mobileActions = {
                attack: playerAttack,
                dash,
                fire: castSkillQ,
                frost: castSkillE,
                lightning: castSkillF,
                super: castSkillR,
                inferno: castSkillT,
                interact: activateRuin
            };
            document.querySelectorAll('[data-mobile-action]').forEach(button => {
                button.addEventListener('click', () => {
                    if (!isStarted || isPaused || isGameOver) return;
                    mobileActions[button.dataset.mobileAction]();
                });
            });

            // Function: togglePause — alterna a pausa da partida.
            function togglePause() {
                if (!isStarted || isGameOver ||
                    !document.getElementById('modal-level-up').classList.contains('hidden')) return;
                isPaused = !isPaused;
                const modal = document.getElementById('modal-pause');
                if (isPaused) {
                    updatePauseMenuUI();
                    modal.classList.remove('hidden');
                } else {
                    modal.classList.add('hidden');
                }
                updateRuinInteractionHint();
            }

            // Ações e habilidades do jogador
            // Function: dash — esquiva na direção do cursor.
            function dash() {
                if (player.cdDash > 0 || player.dashTimer > 0 || isGameOver) return;

                let directionX = mousePos.x + camera.x - player.x;
                let directionY = mousePos.y + camera.y - player.y;
                let directionLength = Math.hypot(directionX, directionY);

                if (directionLength < 1) {
                    directionX = Number(Boolean(keys['d'] || keys['arrowright'])) - Number(Boolean(keys['a'] || keys['arrowleft']));
                    directionY = Number(Boolean(keys['s'] || keys['arrowdown'])) - Number(Boolean(keys['w'] || keys['arrowup']));
                    directionLength = Math.hypot(directionX, directionY);
                }

                if (directionLength < 1) {
                    directionX = 1;
                    directionY = 0;
                    directionLength = 1;
                }

                player.dashDirection.x = directionX / directionLength;
                player.dashDirection.y = directionY / directionLength;
                player.dashTimer = 0.18;
                player.cdDash = player.maxCdDash;
            }

            // Function: playerAttack — executa o golpe básico e verifica acertos.
            function playerAttack() {
                if (player.attackTimer > 0) return;
                player.isAttacking = true;
                player.attackTimer = 0.25; // seconds
                
                // Angle towards mouse
                const worldMouseX = mousePos.x + camera.x;
                const worldMouseY = mousePos.y + camera.y;
                player.attackAngle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);

                AudioFX.playSword();

                // Hit detection in arc
                const reach = (player.passives.giantSword ? 90 : 65) * player.getSkillScale();
                const dmg = player.getAttackDamage() * (player.passives.crit && Math.random() < 0.3 ? 2.0 : 1.0);

                enemies.forEach(enemy => {
                    const dx = enemy.x - player.x;
                    const dy = enemy.y - player.y;
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist < reach + enemy.radius) {
                        const angleToEnemy = Math.atan2(dy, dx);
                        let diff = Math.abs(player.attackAngle - angleToEnemy);
                        if (diff > Math.PI) diff = Math.PI * 2 - diff;

                        if (diff < Math.PI / 1.8) {
                            damageEnemy(enemy, dmg);
                            // Lifesteal passive
                            if (player.passives.lifesteal) {
                                player.hp = Math.min(player.maxHp, player.hp + dmg * 0.15);
                            }
                            // Knockback
                            enemy.x += Math.cos(angleToEnemy) * 15;
                            enemy.y += Math.sin(angleToEnemy) * 15;
                        }
                    }
                });

                // Sword swing arc particles
                for (let i = -5; i <= 5; i++) {
                    const pAngle = player.attackAngle + (i * 0.1);
                    particles.push({
                        x: player.x + Math.cos(pAngle) * (reach * 0.7),
                        y: player.y + Math.sin(pAngle) * (reach * 0.7),
                        vx: Math.cos(pAngle) * 2,
                        vy: Math.sin(pAngle) * 2,
                        radius: 3 * player.getSkillScale(),
                        color: '#fef08a',
                        life: 0.2
                    });
                }
            }

            // Poder Q: fogo
            // Function: castSkillQ — lança uma bola de fogo na direção do cursor.
            function castSkillQ() {
                if (player.cdQ > 0) return;
                player.cdQ = player.maxCdQ;
                AudioFX.playFireLaunch();

                const worldMouseX = mousePos.x + camera.x;
                const worldMouseY = mousePos.y + camera.y;
                const angle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);

                const scale = player.getSkillScale();
                projectiles.push({
                    type: 'fireball',
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(angle) * 8,
                    vy: Math.sin(angle) * 8,
                    radius: 12 * scale,
                    damage: Math.floor(40 * scale * (1 + player.level * 0.1) * (1 + player.upgrades.fire * 0.2)),
                    life: 2.0,
                    scale: scale
                });
            }

            // Poder E: gelo
            // Function: castSkillE — causa dano e lentidão em área.
            function castSkillE() {
                if (player.cdE > 0) return;
                player.cdE = player.maxCdE;
                AudioFX.playIceCast();

                const scale = player.getSkillScale();
                const waveRadius = 140 * scale;
                const dmg = Math.floor(30 * scale * (1 + player.level * 0.08));
                const waveDuration = 0.45;

                screenShake = 5;

                particles.push({
                    type: 'ice_wave',
                    x: player.x,
                    y: player.y,
                    radius: waveRadius,
                    scale: scale,
                    life: waveDuration,
                    maxLife: waveDuration
                });

                // Slow and damage all enemies in area
                let hitAnyEnemy = false;
                enemies.forEach(enemy => {
                    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
                    if (dist < waveRadius + enemy.radius) {
                        hitAnyEnemy = true;
                        damageEnemy(enemy, dmg);
                        enemy.slowTimer = 3.0 + player.upgrades.frost;
                    }
                });
                if (hitAnyEnemy) AudioFX.playFreezeImpact();

                // Ice shards ring effect
                for (let i = 0; i < 30 * scale; i++) {
                    const ang = (Math.PI * 2 / (30 * scale)) * i;
                    particles.push({
                        x: player.x,
                        y: player.y,
                        vx: Math.cos(ang) * (6 * scale),
                        vy: Math.sin(ang) * (6 * scale),
                        radius: 4 * scale,
                        color: '#38bdf8',
                        life: 0.5
                    });
                }
            }

            // Poder F: raios
            // Function: castSkillF — encadeia raios entre inimigos próximos.
            function castSkillF() {
                if (player.cdF > 0) return;
                
                // Find primary enemy near player or cursor
                const scale = player.getSkillScale();
                const maxRange = 350 * scale;
                let targets = [];

                // Sort enemies by distance to player
                let validEnemies = enemies.filter(e => Math.hypot(e.x - player.x, e.y - player.y) < maxRange);
                if (validEnemies.length === 0) return; // No targets available

                player.cdF = player.maxCdF;

                // Chain up to 3 + floor(level/10) enemies
                const chainCount = Math.min(12, Math.floor(3 + player.level / 15) + player.upgrades.lightning);
                let currentPos = { x: player.x, y: player.y };
                let visited = new Set();

                for (let i = 0; i < chainCount; i++) {
                    let closest = null;
                    let minDist = Infinity;

                    enemies.forEach(e => {
                        if (!visited.has(e)) {
                            const d = Math.hypot(e.x - currentPos.x, e.y - currentPos.y);
                            if (d < minDist && d < 250 * scale) {
                                minDist = d;
                                closest = e;
                            }
                        }
                    });

                    if (closest) {
                        visited.add(closest);
                        targets.push(closest);
                        currentPos = { x: closest.x, y: closest.y };
                    } else break;
                }

                // Apply chain damage and draw electric lines
                const baseDmg = Math.floor(35 * scale * (1 + player.level * 0.12));
                let prev = { x: player.x, y: player.y };
                AudioFX.playLightningChain(targets.length);

                targets.forEach((target, idx) => {
                    const dmg = Math.floor(baseDmg * Math.pow(0.85, idx));
                    damageWithLightning(target, dmg);

                    // Create Lightning visual beam
                    particles.push({
                        type: 'lightning_beam',
                        x1: prev.x, y1: prev.y,
                        x2: target.x, y2: target.y,
                        color: '#facc15',
                        life: 0.3
                    });

                    prev = { x: target.x, y: target.y };
                });
            }

            // Poder R: tempestade de raios
            // Function: castSkillR — agenda uma tempestade de raios.
            function castSkillR() {
                if (player.cdR > 0) return;
                player.cdR = player.maxCdR;

                screenShake = 15;
                AudioFX.playLightning();

                const scale = player.getSkillScale();
                const boltCount = Math.floor(8 * scale);

                for (let i = 0; i < boltCount; i++) {
                    pendingLightningStrikes.push({ delay: i * 0.08, scale });
                }
            }

            // Tempestade: executa raios pelo relógio do jogo para respeitar a pausa
            // Function: strikeLightning — aplica o impacto de um raio em área.
            function strikeLightning(scale) {
                const targetX = player.x + (Math.random() - 0.5) * 700;
                const targetY = player.y + (Math.random() - 0.5) * 700;

                particles.push({
                    type: 'lightning_strike',
                    x: targetX,
                    y: targetY,
                    scale,
                    life: 0.4
                });
                AudioFX.playLightningImpact();

                const radius = 90 * scale;
                const damage = Math.floor(80 * scale * (1 + player.level * 0.15));
                enemies.forEach(enemy => {
                    if (Math.hypot(enemy.x - targetX, enemy.y - targetY) < radius + enemy.radius) {
                        damageWithLightning(enemy, damage);
                    }
                });
            }

            // Poder T: ondas do inferno
            // Function: castSkillT — cria três ondas de fogo expansivas.
            function castSkillT() {
                if (player.cdT > 0) return;
                player.cdT = player.maxCdT;

                const scale = player.getSkillScale();
                const waveDuration = 1.1;
                const waveRadius = 520 * scale;
                const dmg = Math.floor(90 * scale * (1 + player.level * 0.12) * (1 + player.upgrades.fire * 0.2));

                screenShake = 12;
                for (let wave = 0; wave < 3; wave++) {
                    particles.push({
                        type: 'inferno_wave',
                        x: player.x,
                        y: player.y,
                        radius: waveRadius,
                        scale: scale,
                        damage: dmg,
                        delay: wave * 0.2,
                        soundPlayed: false,
                        life: waveDuration,
                        maxLife: waveDuration,
                        previousRadius: 0,
                        hitEnemies: new Set()
                    });
                }
            }

            // Combate
            // Function: damageWithLightning — aplica o bônus de raio contra alvos lentos.
            function damageWithLightning(enemy, amount) {
                if (enemy.slowTimer > 0) {
                    amount = Math.floor(amount * 1.5);
                    floatingTexts.push({
                        text: 'SOBRECARGA!',
                        x: enemy.x,
                        y: enemy.y - enemy.radius - 18,
                        color: '#67e8f9',
                        life: 0.7,
                        fontSize: 13
                    });
                }
                damageEnemy(enemy, amount);
            }

            // Function: damageEnemy — aplica dano e derrota inimigos sem vida.
            function damageEnemy(enemy, amount) {
                if (enemy.defeated || enemy.despawned) return;
                if (player.damageBuffTimer > 0) amount *= 1.3;
                enemy.hp -= amount;
                enemy.lastHitTime = Date.now();

                // Floating damage text
                floatingTexts.push({
                    text: Math.floor(amount),
                    x: enemy.x + (Math.random() - 0.5) * 20,
                    y: enemy.y - 15,
                    color: amount > 50 ? '#f59e0b' : '#ffffff',
                    life: 0.8,
                    fontSize: amount > 50 ? 20 : 14
                });

                // Hit particles
                for (let i = 0; i < 4; i++) {
                    particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        radius: 2,
                        color: '#ef4444',
                        life: 0.3
                    });
                }

                if (enemy.hp <= 0) {
                    killEnemy(enemy);
                }
            }

            // Function: killEnemy — registra a derrota e concede recompensas.
            function killEnemy(enemy) {
                if (enemy.defeated) return;
                enemy.defeated = true;
                totalKills++;
                if (enemy.isBoss) bossesDefeated++;
                if (enemy.isBoss && enemy.type === 'ZEUS') zeusDefeated = true;
                addXP(enemy.xpValue);

                // Chance to drop item
                if (Math.random() < 0.15) {
                    dropLoot(enemy.x, enemy.y);
                }

                enemies = enemies.filter(e => e !== enemy);
                if (enemy.isBoss) updateCurrentBoss();
                if (zeusDefeated) finishVictory();
            }

            // Function: updateCurrentBoss — atualiza o chefe ativo e sua barra de vida.
            function updateCurrentBoss() {
                const hadActiveBoss = Boolean(currentBoss);
                const activeBosses = enemies.filter(enemy => enemy.isBoss && !enemy.defeated);
                currentBoss = activeBosses[activeBosses.length - 1] || null;

                const bossHud = document.getElementById('boss-hud');
                if (!currentBoss) {
                    bossHud.classList.add('hidden');
                    if (hadActiveBoss) {
                        activeBossArena = null;
                        enemySpawnTimer = 1 / (0.04 * 60);
                        updateRuinInteractionHint();
                    }
                    return;
                }

                document.getElementById('boss-name').textContent = currentBoss.name;
                bossHud.classList.remove('hidden');
            }

            // Function: damagePlayer — aplica dano ao jogador e verifica a derrota.
            function damagePlayer(amount) {
                if (isGameOver) return;
                player.hp -= amount;
                player.lastHitTime = Date.now();
                screenShake = 6;

                floatingTexts.push({
                    text: `-${Math.floor(amount)}`,
                    x: player.x,
                    y: player.y - 25,
                    color: '#ef4444',
                    life: 0.8,
                    fontSize: 16
                });

                if (player.hp <= 0) {
                    player.hp = 0;
                    finishRun();
                }
            }

            // Function: finishRun — encerra a partida e exibe o resumo.
            function finishRun() {
                if (isGameOver) return;
                isGameOver = true;
                isPaused = true;
                saveRecords();
                document.getElementById('final-level').textContent = player.level;
                document.getElementById('final-kills').textContent = totalKills;
                document.getElementById('final-time').textContent = formatRunTime(Math.floor(survivalTime));
                document.getElementById('final-bosses').textContent = bossesDefeated;
                renderObjectives('final-objectives');
                renderRecords('final-records');
                document.getElementById('game-over-modal').classList.remove('hidden');
            }

            // Function: finishVictory — encerra a partida e exibe o resumo da vitória.
            function finishVictory() {
                if (isGameOver) return;
                isGameOver = true;
                isPaused = true;
                saveRecords();
                document.getElementById('victory-level').textContent = player.level;
                document.getElementById('victory-kills').textContent = totalKills;
                document.getElementById('victory-time').textContent = formatRunTime(Math.floor(survivalTime));
                document.getElementById('victory-bosses').textContent = bossesDefeated;
                renderObjectives('victory-objectives');
                document.getElementById('victory-modal').classList.remove('hidden');
                document.getElementById('btn-victory-restart').focus();
            }

            // Function: addXP — soma experiência e processa os níveis alcançados.
            function addXP(amount) {
                if (player.level >= 100) return;
                player.xp += amount;
                while (player.xp >= player.xpNeeded && player.level < 100) {
                    player.xp -= player.xpNeeded;
                    levelUp();
                }
                if (player.level >= 100) player.xp = 0;
            }

            // Function: levelUp — aumenta atributos e prepara recompensas de nível.
            function levelUp() {
                if (player.level >= 100) return;
                player.level++;

                player.xpNeeded = Math.floor(100 * Math.pow(1.08, player.level - 1));
                
                // Auto status scaling
                player.maxHp = Math.floor(100 + (player.level - 1) * 25);
                player.hp = player.maxHp; // Full heal on level up
                
                AudioFX.playLevelUp();

                floatingTexts.push({
                    text: `NÍVEL ${player.level}!`,
                    x: player.x,
                    y: player.y - 45,
                    color: '#facc15',
                    life: 1.5,
                    fontSize: 24
                });

                const rewards = [];
                if (player.level % 5 === 0) rewards.push('upgrade');
                if (player.level % 10 === 0) rewards.push('passive');
                if (player.level % 15 === 0) rewards.push('super');
                levelRewardQueue.push(...rewards);
                if (levelRewardQueue.length && !isPaused) {
                    isPaused = true;
                    showNextLevelReward();
                }

                // Check Boss Spawns
                if (player.level === 100) {
                    spawnBoss('ZEUS');
                } else if (player.level === 10 || (player.level > 10 && player.level % 15 === 10)) {
                    const god = nextRegularBossIndex < regularBosses.length
                        ? regularBosses[nextRegularBossIndex++]
                        : regularBosses[Math.floor(Math.random() * regularBosses.length)];
                    spawnBoss(god);
                }
            }

            // Escolha de habilidades
            let levelRewardQueue = [];

            // Function: showNextLevelReward — abre a próxima recompensa da fila.
            function showNextLevelReward() {
                const reward = levelRewardQueue.shift();
                if (!reward) {
                    document.getElementById('modal-level-up').classList.add('hidden');
                    isPaused = false;
                    document.getElementById('btn-pause').focus();
                    return;
                }
                triggerSkillChoiceModal(reward);
            }

            // Function: finishLevelReward — fecha a escolha atual e avança a fila.
            function finishLevelReward() {
                document.getElementById('modal-level-up').classList.add('hidden');
                showNextLevelReward();
            }

            // Function: triggerSkillChoiceModal — monta as opções de melhoria do nível.
            function triggerSkillChoiceModal(reward) {
                isPaused = true;
                const modal = document.getElementById('modal-level-up');
                const title = document.getElementById('level-modal-title');
                const subtitle = document.getElementById('level-modal-subtitle');
                const container = document.getElementById('cards-container');

                container.innerHTML = '';

                if (reward === 'super') {
                    subtitle.textContent = "SUPER HABILIDADE DIVINA";
                    title.textContent = "DÁDIVA DOS DEUSES DO OLIMPO";

                    const superSkills = [
                        { id: 'super_zeus', name: 'Tempestade de Zeus', icon: 'fa-cloud-bolt', color: 'text-purple-400', desc: 'Invocação de tempestade devastadora que atinge toda a tela com raios míticos.' },
                        { id: 'super_inferno', name: 'Ondas do Inferno', icon: 'fa-fire-flame-curved', color: 'text-red-400', desc: 'Três ondas de fogo atravessam o campo, incinerando inimigos em uma vasta área.' },
                        { id: 'super_shield', name: 'Égide Sagrada', icon: 'fa-shield-cat', color: 'text-amber-400', desc: 'Escudo impenetrável permanente que reduz todo o dano recebido em 30%.' },
                        { id: 'super_aura', name: 'Aura Olímpica Incandescente', icon: 'fa-sun', color: 'text-orange-400', desc: 'Aura contínua de fogo ao redor do paladino queimando inimigos próximos.' }
                    ].filter(skill => {
                        if (skill.id === 'super_zeus') return !player.hasSuperSkill;
                        if (skill.id === 'super_inferno') return !player.hasInfernoSkill;
                        if (skill.id === 'super_shield') return !player.passives.shield;
                        return !player.passives.fireAura;
                    });

                    if (superSkills.length === 0) {
                        showNextLevelReward();
                        return;
                    }

                    superSkills.forEach(s => {
                        const card = document.createElement('button');
                        card.type = 'button';
                        card.className = 'mythic-card skill-choice-card p-5 rounded-2xl flex-1 flex flex-col items-center text-center';
                        card.setAttribute('aria-label', `${s.name}. ${s.desc}`);
                        card.innerHTML = `
                            <span class="block text-4xl ${s.color} mb-3" aria-hidden="true"><i class="fa-solid ${s.icon}"></i></span>
                            <span class="block font-cinzel text-xl font-bold text-white mb-2">${s.name}</span>
                            <span class="block text-xs text-gray-300">${s.desc}</span>
                        `;
                        card.addEventListener('click', () => {
                            if (s.id === 'super_zeus') {
                                player.hasSuperSkill = true;
                                document.getElementById('slot-r').classList.remove('hidden');
                                document.getElementById('mobile-slot-r').classList.remove('hidden');
                            } else if (s.id === 'super_inferno') {
                                player.hasInfernoSkill = true;
                                document.getElementById('slot-t').classList.remove('hidden');
                                document.getElementById('mobile-slot-t').classList.remove('hidden');
                            } else if (s.id === 'super_shield') {
                                player.passives.shield = true;
                            } else if (s.id === 'super_aura') {
                                player.passives.fireAura = true;
                            }
                            finishLevelReward();
                        });
                        container.appendChild(card);
                    });
                } else if (reward === 'upgrade') {
                    subtitle.textContent = 'APRIMORAMENTO ELEMENTAL';
                    title.textContent = 'ESCOLHA UMA MELHORIA';

                    const upgrades = [
                        { id: 'fire', max: 5, name: 'Chamas Intensificadas', icon: 'fa-fire', color: 'text-orange-400', desc: `Aumenta o dano do fogo em 20%. Nível atual: ${player.upgrades.fire}/5.` },
                        { id: 'frost', max: 5, name: 'Geada Profunda', icon: 'fa-snowflake', color: 'text-cyan-300', desc: `Aumenta em 1 segundo a duração do congelamento. Nível atual: ${player.upgrades.frost}/5.` },
                        { id: 'lightning', name: 'Condutor Divino', icon: 'fa-bolt-lightning', color: 'text-yellow-300', desc: `A corrente de raios atinge mais um inimigo. Nível atual: ${player.upgrades.lightning}.` }
                    ].filter(upgrade => {
                        if (upgrade.id === 'lightning') {
                            const baseChainCount = Math.floor(3 + player.level / 15);
                            return Math.min(12, baseChainCount + player.upgrades.lightning) < 12;
                        }
                        return player.upgrades[upgrade.id] < upgrade.max;
                    });

                    if (upgrades.length === 0) {
                        showNextLevelReward();
                        return;
                    }

                    upgrades.forEach(upgrade => {
                        const card = document.createElement('button');
                        card.type = 'button';
                        card.className = 'mythic-card skill-choice-card p-5 rounded-2xl flex-1 flex flex-col items-center text-center';
                        card.setAttribute('aria-label', `${upgrade.name}. ${upgrade.desc}`);
                        card.innerHTML = `
                            <span class="block text-4xl ${upgrade.color} mb-3" aria-hidden="true"><i class="fa-solid ${upgrade.icon}"></i></span>
                            <span class="block font-cinzel text-xl font-bold text-white mb-2">${upgrade.name}</span>
                            <span class="block text-xs text-gray-300">${upgrade.desc}</span>
                        `;
                        card.addEventListener('click', () => {
                            if (upgrade.id !== 'lightning' && player.upgrades[upgrade.id] >= upgrade.max) {
                                finishLevelReward();
                                return;
                            }
                            player.upgrades[upgrade.id]++;
                            floatingTexts.push({
                                text: `${upgrade.name.toUpperCase()}!`,
                                x: player.x,
                                y: player.y - 70,
                                color: '#facc15',
                                life: 1.5,
                                fontSize: 18
                            });
                            finishLevelReward();
                        });
                        container.appendChild(card);
                    });
                } else {
                    subtitle.textContent = "EVOLUÇÃO DO PALADINO";
                    title.textContent = "ESCOLHA UMA HABILIDADE PASSIVA";

                    const passivesPool = [
                        { id: 'giantSword', name: 'Espada Gigante', icon: 'fa-khanda', color: 'text-amber-300', desc: '+50% de alcance do golpe de espada e arcos mais largos.' },
                        { id: 'crit', name: 'Crítico Divino', icon: 'fa-crosshairs', color: 'text-red-400', desc: '30% de chance de causar o dobro de dano no ataque básico.' },
                        { id: 'lifesteal', name: 'Vampirismo Sagrado', icon: 'fa-droplet', color: 'text-rose-400', desc: 'Recupera 15% do dano causado no ataque básico em Vida.' },
                        { id: 'swiftness', name: 'Velocidade da Luz', icon: 'fa-bolt-lightning', color: 'text-yellow-300', desc: 'Aumenta a velocidade de movimento do Paladino em 25%.' }
                    ].filter(passive => !player.passives[passive.id]);

                    if (passivesPool.length === 0) {
                        showNextLevelReward();
                        return;
                    }

                    // Pick 3 random
                    const shuffled = passivesPool.sort(() => 0.5 - Math.random()).slice(0, 3);
                    shuffled.forEach(p => {
                        const card = document.createElement('button');
                        card.type = 'button';
                        card.className = 'mythic-card skill-choice-card p-5 rounded-2xl flex-1 flex flex-col items-center text-center';
                        card.setAttribute('aria-label', `${p.name}. ${p.desc}`);
                        card.innerHTML = `
                            <span class="block text-4xl ${p.color} mb-3" aria-hidden="true"><i class="fa-solid ${p.icon}"></i></span>
                            <span class="block font-cinzel text-xl font-bold text-white mb-2">${p.name}</span>
                            <span class="block text-xs text-gray-300">${p.desc}</span>
                        `;
                        card.addEventListener('click', () => {
                            player.passives[p.id] = true;
                            if (p.id === 'swiftness') player.speed *= 1.25;
                            finishLevelReward();
                        });
                        container.appendChild(card);
                    });
                }

                modal.classList.remove('hidden');
                const firstChoice = container.querySelector('button');
                if (firstChoice) firstChoice.focus();
            }

            // Itens e inventário
            // Function: dropLoot — cria um item que pode ser coletado.
            function dropLoot(x, y) {
                const itemsList = [
                    { name: "Espada Mítica", icon: "fa-sword", type: "weapon" },
                    { name: "Armadura do Olimpo", icon: "fa-shield-halved", type: "armor" },
                    { name: "Anel Solar", icon: "fa-ring", type: "ring" },
                    { name: "Elixir de Vida", icon: "fa-flask", type: "potion" },
                    { name: "Relíquia Divina", icon: "fa-gem", type: "relic" }
                ];

                const dropped = itemsList[Math.floor(Math.random() * itemsList.length)];
                itemsOnGround.push({
                    x: x,
                    y: y,
                    item: dropped,
                    life: 15.0 // Despawns in 15s
                });
            }

            // Function: collectItem — coleta um item se houver espaço no inventário.
            function collectItem(itemObj) {
                if (player.inventory.length >= 12) {
                    if (!itemObj.fullInventoryNoticeShown) {
                        floatingTexts.push({
                            text: 'Inventário cheio',
                            x: player.x,
                            y: player.y - 30,
                            color: '#fbbf24',
                            life: 1.2,
                            fontSize: 14
                        });
                        itemObj.fullInventoryNoticeShown = true;
                    }
                    return false;
                }

                player.inventory.push(itemObj.item);
                floatingTexts.push({
                    text: `+ ${itemObj.item.name}`,
                    x: player.x,
                    y: player.y - 30,
                    color: '#67e8f9',
                    life: 1.0,
                    fontSize: 14
                });
                if (itemObj.item.type === 'potion') {
                    player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.35);
                }
                return true;
            }

            // Cada chefe define sua área e dano, além do projétil (velocidade, dano, quantidade
            // na salva e, quando aplicável, perseguição). updateBossBehavior usa esses dados
            // para alternar ataques e movimentação sem duplicar a lógica de cada deus.
            const bossAttackStyles = {
                ARES: { color: '#ef4444', area: 'slam', areaName: 'IMPACTO DE GUERRA', radius: 155, damage: 56, projectile: 'spear', projectileName: 'LANÇA DE ARES', speed: 8, projectileDamage: 40 },
                POSEIDON: { color: '#22d3ee', area: 'wave', areaName: 'MARÉ DE POSEIDON', radius: 360, damage: 48, projectile: 'trident', projectileName: 'TRIDENTE DAS MARÉS', speed: 6, projectileDamage: 36 },
                HADES: { color: '#c084fc', area: 'shadow', areaName: 'FOSSO DO SUBMUNDO', radius: 135, damage: 60, projectile: 'soul', projectileName: 'ORBE DAS ALMAS', speed: 4.5, projectileDamage: 34, homing: true },
                APOLO: { color: '#fbbf24', area: 'solar', areaName: 'NOVA SOLAR', radius: 175, damage: 52, projectile: 'sunbolt', projectileName: 'LANÇA SOLAR', speed: 9, projectileDamage: 38 },
                ATENA: { color: '#93c5fd', area: 'aegis', areaName: 'ONDA DA ÉGIDE', radius: 125, damage: 44, projectile: 'spear', projectileName: 'SALVA DE LANÇAS', speed: 7, projectileDamage: 30, volley: 3 },
                ZEUS: { color: '#fde047', area: 'storm', areaName: 'JULGAMENTO DE ZEUS', radius: 145, damage: 72, projectile: 'lightning', projectileName: 'RAIO DIVINO', speed: 11, projectileDamage: 46, volley: 3 }
            };

            // Faz os ataques dos chefes acompanharem a progressão sem crescimento infinito de dificuldade.
            function scaleBossDamage(amount) {
                const levelMultiplier = 1 + Math.min(4, (player.level - 1) * 0.04);
                return Math.round(amount * levelMultiplier);
            }

            // Mostra o aviso antes do golpe; a partícula guarda os dados que serão usados no impacto.
            function createBossTelegraph(boss, style, attackType) {
                const targetX = attackType === 'area' && style.area !== 'wave' ? player.x : boss.x;
                const targetY = attackType === 'area' && style.area !== 'wave' ? player.y : boss.y;
                const radius = attackType === 'area' ? style.radius : 52;
                particles.push({
                    type: 'boss_telegraph',
                    attack: attackType === 'area' ? style.area : 'projectile',
                    color: style.color,
                    x: targetX,
                    y: targetY,
                    originX: boss.x,
                    originY: boss.y,
                    radius,
                    life: attackType === 'area' ? 0.85 : 0.55,
                    maxLife: attackType === 'area' ? 0.85 : 0.55,
                    damage: scaleBossDamage(style.damage),
                    bossType: boss.type,
                    label: attackType === 'area' ? style.areaName : style.projectileName
                });
                floatingTexts.push({
                    text: attackType === 'area' ? style.areaName : style.projectileName,
                    x: targetX,
                    y: targetY - radius - 25,
                    color: style.color,
                    life: 0.9,
                    fontSize: 18
                });
            }

            // Cria um projétil mirando o jogador; o deslocamento angular distribui salvas em leque.
            function launchBossProjectile(boss, style, angleOffset = 0) {
                const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + angleOffset;
                enemyProjectiles.push({
                    type: 'boss_projectile',
                    kind: style.projectile,
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * style.speed,
                    vy: Math.sin(angle) * style.speed,
                    speed: style.speed,
                    radius: style.projectile === 'trident' ? 15 : style.projectile === 'lightning' ? 11 : 13,
                    damage: scaleBossDamage(style.projectileDamage),
                    color: style.color,
                    life: 5,
                    armingTime: 0.18,
                    homing: Boolean(style.homing)
                });
            }

            // Resolve o acerto de um golpe em área. A esquiva durante o impacto concede evasão.
            function useBossAreaAttack(attack, isDashing) {
                if (isDashing) return;
                const damage = player.passives.shield ? attack.damage * 0.7 : attack.damage;
                if (Math.hypot(player.x - attack.x, player.y - attack.y) < attack.radius + player.radius) {
                    damagePlayer(damage);
                }
            }

            function updateBossBehavior(boss, dt, dirX, dirY, dist) {
                const style = bossAttackStyles[boss.type] || bossAttackStyles.ZEUS;
                let moveX = dirX;
                let moveY = dirY;
                let moveMultiplier = 1;

                if (boss.type === 'POSEIDON' || boss.type === 'APOLO' || boss.type === 'ATENA') {
                    const preferredDistance = boss.type === 'POSEIDON' ? 275 : boss.type === 'APOLO' ? 365 : 210;
                    if (dist > preferredDistance + 45) {
                        moveX = dirX;
                        moveY = dirY;
                    } else if (dist < preferredDistance - 45) {
                        moveX = -dirX;
                        moveY = -dirY;
                    } else {
                        moveX = -dirY * boss.orbitDirection;
                        moveY = dirX * boss.orbitDirection;
                    }
                }

                if (boss.type === 'HADES') {
                    boss.teleportTimer -= dt;
                    moveX = -dirY * boss.orbitDirection * 0.65 + dirX * 0.35;
                    moveY = dirX * boss.orbitDirection * 0.65 + dirY * 0.35;
                    if (boss.teleportTimer <= 0) {
                        particles.push({ type: 'boss_teleport', x: boss.x, y: boss.y, color: style.color, radius: boss.radius, life: 0.55, maxLife: 0.55 });
                        boss.x = player.x - dirX * 320 + dirY * 55;
                        boss.y = player.y - dirY * 320 - dirX * 55;
                        particles.push({ type: 'boss_teleport', x: boss.x, y: boss.y, color: style.color, radius: boss.radius, life: 0.55, maxLife: 0.55 });
                        boss.teleportTimer = 7;
                    }
                }

                if (boss.type === 'ARES') {
                    boss.chargeCooldown -= dt;
                    if (boss.chargeWindup > 0) {
                        boss.chargeWindup = Math.max(0, boss.chargeWindup - dt);
                        moveX = 0;
                        moveY = 0;
                        if (boss.chargeWindup === 0) boss.chargeTimer = 1.0;
                    } else if (boss.chargeTimer > 0) {
                        boss.chargeTimer = Math.max(0, boss.chargeTimer - dt);
                        moveMultiplier = 3.4;
                    } else if (dist < 470 && boss.chargeCooldown <= 0) {
                        boss.chargeWindup = 0.65;
                        boss.chargeCooldown = 5.5;
                        particles.push({ type: 'boss_telegraph', attack: 'charge', color: style.color, x: boss.x, y: boss.y, radius: boss.radius * 2, life: 0.65, maxLife: 0.65 });
                    }
                } else if (boss.type === 'ATENA') {
                    boss.dashCooldown -= dt;
                    if (boss.dashTimer > 0) {
                        boss.dashTimer = Math.max(0, boss.dashTimer - dt);
                        moveMultiplier = 2.8;
                    } else if (dist < 390 && boss.dashCooldown <= 0) {
                        boss.dashTimer = 0.42;
                        boss.dashCooldown = 4.8;
                        particles.push({ type: 'boss_telegraph', attack: 'charge', color: style.color, x: boss.x, y: boss.y, radius: boss.radius * 1.8, life: 0.42, maxLife: 0.42 });
                    }
                }

                if (boss.type === 'ZEUS') {
                    moveMultiplier = Math.sin(performance.now() * 0.002) > 0.72 ? 1.8 : 1;
                }

                const movementLength = Math.hypot(moveX, moveY);
                if (movementLength > 0) {
                    boss.x += (moveX / movementLength) * boss.speed * moveMultiplier * dt * 60;
                    boss.y += (moveY / movementLength) * boss.speed * moveMultiplier * dt * 60;
                }
                if (activeBossArena) {
                    const dx = boss.x - activeBossArena.x;
                    const dy = boss.y - activeBossArena.y;
                    const distance = Math.hypot(dx, dy);
                    const maxDistance = BOSS_ARENA_RADIUS - boss.radius;
                    if (distance > maxDistance) {
                        boss.x = activeBossArena.x + dx / distance * maxDistance;
                        boss.y = activeBossArena.y + dy / distance * maxDistance;
                    }
                }

                boss.attackTimer -= dt;
                if (boss.attackTimer <= 0) {
                    const attackType = boss.attackIndex % 2 === 0 ? 'area' : 'projectile';
                    createBossTelegraph(boss, style, attackType);
                    boss.attackIndex++;
                    boss.attackTimer = 2.65;
                }
            }

            // Limpa ameaças comuns, congela o ciclo de mundo via currentBoss e manifesta a arena no local.
            // A posição central é guardada para limitar o movimento durante a luta e restaurar a exploração
            // quando o chefe for derrotado.
            // Function: spawnBoss — inicia um chefe e prepara a arena para a luta.
            function spawnBoss(godName) {
                if (enemies.some(enemy => enemy.isBoss && !enemy.defeated)) return;

                // Limpa os inimigos comuns para que o confronto fique focado no chefe.
                enemies.forEach(enemy => {
                    if (!enemy.isBoss && !enemy.defeated) enemy.despawned = true;
                });
                enemies = enemies.filter(enemy => enemy.isBoss && !enemy.defeated);
                enemyProjectiles = [];
                enemySpawnTimer = 1 / (0.04 * 60);
                activeBossArena = { x: player.x, y: player.y, type: godName };

                const angle = Math.random() * Math.PI * 2;
                const bossX = player.x + Math.cos(angle) * 420;
                const bossY = player.y + Math.sin(angle) * 420;

                const isZeus = (godName === 'ZEUS');
                const bossHp = Math.floor((isZeus ? 25000 : 5000) * (1 + (player.level - 1) * 0.1));
                const bossColors = {
                    ARES: '#991b1b',
                    ZEUS: '#64748b',
                    POSEIDON: '#0e7490',
                    HADES: '#581c36',
                    APOLO: '#b45309',
                    ATENA: '#475569'
                };
                const bossTitles = {
                    ARES: 'DEUS DA GUERRA',
                    POSEIDON: 'SENHOR DOS MARES',
                    HADES: 'SENHOR DO SUBMUNDO',
                    APOLO: 'DEUS DO SOL',
                    ATENA: 'DEUSA DA SABEDORIA',
                    ZEUS: 'REI DO OLIMPO'
                };

                const boss = {
                    name: `${godName} - ${bossTitles[godName] || 'DEUS DA MITOLOGIA'}`,
                    x: bossX,
                    y: bossY,
                    radius: isZeus ? 45 : 35,
                    hp: bossHp,
                    maxHp: bossHp,
                    speed: isZeus ? 2.5 : 2.0,
                    isBoss: true,
                    type: godName,
                    color: bossColors[godName] || '#7f1d1d',
                    xpValue: isZeus ? 10000 : 2500,
                    attackTimer: 1.1,
                    attackIndex: 0,
                    chargeCooldown: 3.2,
                    chargeWindup: 0,
                    chargeTimer: 0,
                    dashCooldown: 2.8,
                    dashTimer: 0,
                    teleportTimer: 5.5,
                    orbitDirection: Math.random() < 0.5 ? -1 : 1,
                    slowTimer: 0
                };

                enemies.push(boss);
                updateCurrentBoss();
            }

            // Function: spawnRegularEnemy — cria um inimigo comum de tipo variado.
            function spawnRegularEnemy(forcedTypeName = null) {
                if (currentBoss || enemies.some(enemy => enemy.isBoss && !enemy.defeated)) return;
                if (enemies.length >= 25) return; // Cap density

                const types = [
                    { name: 'Minotauro', radius: 24, speed: 1.8, hp: 120, color: '#b45309', xp: 45, behavior: 'charge' },
                    { name: 'Esqueleto Hoplita', radius: 18, speed: 2.2, hp: 70, color: '#9ca3af', xp: 25, behavior: 'chase' },
                    { name: 'Harpia', radius: 15, speed: 3.2, hp: 50, color: '#38bdf8', xp: 30, behavior: 'flank' },
                    { name: 'Medusa', radius: 20, speed: 1.5, hp: 90, color: '#16a34a', xp: 50, behavior: 'ranged' },
                    { name: 'Cérbero', radius: 28, speed: 2.0, hp: 180, color: '#dc2626', xp: 70, behavior: 'rush' },
                    { name: 'Sátiro', radius: 17, speed: 2.4, hp: 60, color: '#ca8a04', xp: 35, behavior: 'dodge' }
                ];

                const enemyType = types.find(type => type.name === forcedTypeName) ||
                    types[Math.floor(Math.random() * types.length)];
                const spawnAngle = Math.random() * Math.PI * 2;
                const spawnDist = 600 + Math.random() * 200;

                const lvlScale = 1 + (player.level - 1) * 0.12;

                enemies.push({
                    name: enemyType.name,
                    x: player.x + Math.cos(spawnAngle) * spawnDist,
                    y: player.y + Math.sin(spawnAngle) * spawnDist,
                    radius: enemyType.radius,
                    speed: enemyType.speed,
                    hp: Math.floor(enemyType.hp * lvlScale),
                    maxHp: Math.floor(enemyType.hp * lvlScale),
                    color: enemyType.color,
                    xpValue: Math.floor(enemyType.xp * lvlScale),
                    behavior: enemyType.behavior,
                    isBoss: false,
                    slowTimer: 0,
                    attackCd: 1.5 + Math.random() * 1.5,
                    chargeCooldown: 2 + Math.random() * 2,
                    chargeWindup: 0,
                    chargeTimer: 0,
                    chargeAngle: 0,
                    rushCooldown: 2 + Math.random() * 2,
                    rushTimer: 0,
                    orbitDirection: Math.random() < 0.5 ? -1 : 1
                });
            }

            // Atualização do jogo
            let lastTime = performance.now();

            // Function: gameLoop — atualiza e desenha cada quadro da partida.
            function gameLoop(now) {
                // Limita o delta após pausas ou travamentos para evitar saltos grandes na simulação.
                const dt = Math.min((now - lastTime) / 1000, 0.1); // Delta time in seconds
                lastTime = now;

                if (isStarted && !isPaused) {
                    update(dt);
                    render();
                }

                requestAnimationFrame(gameLoop);
            }

            // Function: beginBiomeEvent — inicia o evento do bioma atual.
            function beginBiomeEvent() {
                const biome = BIOMES[currentBiomeIdx];
                activeBiomeEvent = { name: biome.eventName, remaining: 8 };

                floatingTexts.push({
                    text: biome.eventName.toUpperCase(),
                    x: player.x,
                    y: player.y - 75,
                    color: '#67e8f9',
                    life: 2.2,
                    fontSize: 22
                });

                if (biome.event === 'onda') {
                    for (let i = 0; i < 4; i++) spawnRegularEnemy();
                } else if (biome.event === 'cerberus') {
                    for (let i = 0; i < 3; i++) spawnRegularEnemy('Cérbero');
                } else if (biome.event === 'healing') {
                    player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.25);
                    floatingTexts.push({
                        text: 'MARÉ RESTAURA VIDA!',
                        x: player.x,
                        y: player.y - 45,
                        color: '#38bdf8',
                        life: 1.5,
                        fontSize: 16
                    });
                } else if (biome.event === 'satyrs') {
                    for (let i = 0; i < 5; i++) spawnRegularEnemy('Sátiro');
                } else if (biome.event === 'frost') {
                    enemies.forEach(enemy => {
                        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 8);
                    });
                }
            }

            // Function: update — atualiza temporizadores, movimento, combate e efeitos.
            function update(dt) {
                const frameScale = dt * 60;
                survivalTime += dt;
                // Enquanto um chefe está ativo, bioma e evento ficam congelados; o restante do combate
                // continua atualizando normalmente.
                if (!currentBoss) {
                    if (activeBiomeEvent) {
                        activeBiomeEvent.remaining -= dt;
                        if (activeBiomeEvent.remaining <= 0) activeBiomeEvent = null;
                    }

                    // O bioma e o evento atual retomam de onde pararam após a luta.
                    biomeTimer -= dt;
                    if (biomeTimer <= 0) {
                        biomeTimer = 30;
                        currentBiomeIdx = (currentBiomeIdx + 1) % BIOMES.length;
                        beginBiomeEvent();
                        floatingTexts.push({
                            text: `BIOMA: ${BIOMES[currentBiomeIdx].name.toUpperCase()}`,
                            x: player.x,
                            y: player.y - 60,
                            color: '#d4af37',
                            life: 2.0,
                            fontSize: 22
                        });
                    }
                }

                // 2. Recargas e duração de efeitos do jogador.
                if (player.cdQ > 0) player.cdQ = Math.max(0, player.cdQ - dt);
                if (player.cdDash > 0) player.cdDash = Math.max(0, player.cdDash - dt);
                if (player.cdE > 0) player.cdE = Math.max(0, player.cdE - dt);
                if (player.cdF > 0) player.cdF = Math.max(0, player.cdF - dt);
                if (player.cdR > 0) player.cdR = Math.max(0, player.cdR - dt);
                if (player.cdT > 0) player.cdT = Math.max(0, player.cdT - dt);
                if (player.damageBuffTimer > 0) player.damageBuffTimer = Math.max(0, player.damageBuffTimer - dt);
                if (player.attackTimer > 0) {
                    player.attackTimer = Math.max(0, player.attackTimer - dt);
                    player.isAttacking = player.attackTimer > 0;
                }

                // 3. Regeneração passiva: recupera vida após alguns segundos sem receber dano.
                if (Date.now() - player.lastHitTime >= 3000) {
                    player.regenTimer += dt;
                    if (player.regenTimer >= 1.0) {
                        player.regenTimer = 0;
                        if (player.hp < player.maxHp) {
                            player.hp = Math.min(player.maxHp, player.hp + 2);
                            floatingTexts.push({
                                text: '+2 HP',
                                x: player.x + 15,
                                y: player.y - 15,
                                color: '#4ade80',
                                life: 0.6,
                                fontSize: 12
                            });
                        }
                    }
                }

                // 4. Movimento combina teclado e manche; a correção abaixo mantém jogador e chefe na arena.
                let moveX = 0;
                let moveY = 0;
                if (keys['w'] || keys['arrowup']) moveY -= 1;
                if (keys['s'] || keys['arrowdown']) moveY += 1;
                if (keys['a'] || keys['arrowleft']) moveX -= 1;
                if (keys['d'] || keys['arrowright']) moveX += 1;
                moveX += touchMovement.x;
                moveY += touchMovement.y;

                if (moveX !== 0 || moveY !== 0) {
                    const len = Math.hypot(moveX, moveY);
                    player.x += (moveX / len) * player.speed * frameScale;
                    player.y += (moveY / len) * player.speed * frameScale;
                }

                let isDashingThisFrame = false;
                if (player.dashTimer > 0) {
                    const dashStep = Math.min(dt, player.dashTimer);
                    const dashSpeed = 1050;
                    player.x += player.dashDirection.x * dashSpeed * dashStep;
                    player.y += player.dashDirection.y * dashSpeed * dashStep;
                    player.dashTimer = Math.max(0, player.dashTimer - dt);
                    isDashingThisFrame = true;
                    particles.push({
                        x: player.x,
                        y: player.y,
                        radius: player.radius * 0.8,
                        color: '#67e8f9',
                        life: 0.18
                    });
                }
                if (activeBossArena) {
                    const dx = player.x - activeBossArena.x;
                    const dy = player.y - activeBossArena.y;
                    const distance = Math.hypot(dx, dy);
                    const maxDistance = BOSS_ARENA_RADIUS - player.radius;
                    if (distance > maxDistance) {
                        player.x = activeBossArena.x + dx / distance * maxDistance;
                        player.y = activeBossArena.y + dy / distance * maxDistance;
                    }
                }

                // Camera smoothly follows player
                camera.x = player.x - viewportWidth / 2;
                camera.y = player.y - viewportHeight / 2;
                updateRuinInteractionHint();

                // 5. Inimigos comuns só surgem fora das lutas contra chefes.
                if (!currentBoss) {
                    enemySpawnTimer -= dt;
                    if (enemySpawnTimer <= 0) {
                        spawnRegularEnemy();
                        enemySpawnTimer = 1 / (0.04 * 60);
                    }
                }

                // 6. Update Passive Aura at a fixed damage interval
                if (player.passives.fireAura) {
                    const auraRadius = 110 * player.getSkillScale();
                    player.fireAuraTimer += dt;
                    while (player.fireAuraTimer >= 0.5) {
                        player.fireAuraTimer -= 0.5;
                        enemies.forEach(enemy => {
                            if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < auraRadius) {
                                damageEnemy(enemy, 15);
                            }
                        });
                    }
                } else {
                    player.fireAuraTimer = 0;
                }

                // Tempestade: adia os raios durante pausa e recompensa de nível
                for (let strikeIndex = pendingLightningStrikes.length - 1; strikeIndex >= 0; strikeIndex--) {
                    const strike = pendingLightningStrikes[strikeIndex];
                    strike.delay -= dt;
                    if (strike.delay <= 0) {
                        strikeLightning(strike.scale);
                        pendingLightningStrikes.splice(strikeIndex, 1);
                    }
                }

                // 7. Update Enemies & AI
                enemies.forEach(e => {
                    if (e.slowTimer > 0) e.slowTimer -= dt;
                    const effectiveSpeed = e.slowTimer > 0 ? e.speed * 0.4 : e.speed;

                    const dx = player.x - e.x;
                    const dy = player.y - e.y;
                    const dist = Math.hypot(dx, dy);
                    const dirX = dist > 0 ? dx / dist : 0;
                    const dirY = dist > 0 ? dy / dist : 0;
                    let moveX = 0;
                    let moveY = 0;

                    if (e.isBoss) {
                        updateBossBehavior(e, dt, dirX, dirY, dist);
                        moveX = 0;
                        moveY = 0;
                    } else if (e.behavior === 'chase') {
                        moveX = dirX;
                        moveY = dirY;
                    } else if (e.behavior === 'charge') {
                        e.chargeCooldown = Math.max(0, e.chargeCooldown - dt);
                        if (e.chargeWindup > 0) {
                            e.chargeWindup -= dt;
                            if (e.chargeWindup <= 0) {
                                e.chargeTimer = 0.45;
                                e.chargeAngle = Math.atan2(dy, dx);
                            }
                        } else if (e.chargeTimer > 0) {
                            e.chargeTimer -= dt;
                            moveX = Math.cos(e.chargeAngle) * 3.5;
                            moveY = Math.sin(e.chargeAngle) * 3.5;
                        } else {
                            moveX = dirX;
                            moveY = dirY;
                            if (dist < 390 && e.chargeCooldown <= 0) {
                                e.chargeWindup = 0.7;
                                e.chargeCooldown = 4.5;
                            }
                        }
                    } else if (e.behavior === 'rush') {
                        e.rushCooldown = Math.max(0, e.rushCooldown - dt);
                        if (e.rushTimer > 0) {
                            e.rushTimer -= dt;
                            moveX = dirX * 2.6;
                            moveY = dirY * 2.6;
                        } else {
                            moveX = dirX;
                            moveY = dirY;
                            if (dist < 340 && e.rushCooldown <= 0) {
                                e.rushTimer = 0.8;
                                e.rushCooldown = 3.5;
                            }
                        }
                    } else if (e.behavior === 'ranged') {
                        e.attackCd -= dt;
                        if (dist > 310) {
                            moveX = dirX;
                            moveY = dirY;
                        } else if (dist < 210) {
                            moveX = -dirX;
                            moveY = -dirY;
                        } else {
                            moveX = -dirY * e.orbitDirection * 0.55;
                            moveY = dirX * e.orbitDirection * 0.55;
                        }

                        if (dist < 520 && e.attackCd <= 0) {
                            enemyProjectiles.push({
                                x: e.x,
                                y: e.y,
                                vx: dirX * 4.2,
                                vy: dirY * 4.2,
                                radius: 8,
                                damage: 10 + Math.floor(player.level * 0.6),
                                life: 4
                            });
                            e.attackCd = 2.4;
                        }
                    } else {
                        const preferredDistance = e.behavior === 'dodge' ? 145 : 225;
                        if (dist > preferredDistance + 35) {
                            moveX = dirX;
                            moveY = dirY;
                        } else if (dist < preferredDistance - 35) {
                            moveX = -dirX;
                            moveY = -dirY;
                        } else {
                            moveX = -dirY * e.orbitDirection;
                            moveY = dirX * e.orbitDirection;
                        }
                    }

                    if (Math.hypot(moveX, moveY) > 0 && (e.chargeTimer || 0) <= 0) {
                        const movementLength = Math.hypot(moveX, moveY);
                        e.x += (moveX / movementLength) * effectiveSpeed * (e.behavior === 'rush' && e.rushTimer > 0 ? 2.6 : 1) * frameScale;
                        e.y += (moveY / movementLength) * effectiveSpeed * (e.behavior === 'rush' && e.rushTimer > 0 ? 2.6 : 1) * frameScale;
                    } else if (e.behavior === 'charge' && e.chargeTimer > 0) {
                        e.x += moveX * effectiveSpeed * frameScale;
                        e.y += moveY * effectiveSpeed * frameScale;
                    }

                    // Collision with player
                    if (!isDashingThisFrame && dist < e.radius + player.radius) {
                        const baseDmg = e.isBoss ? scaleBossDamage(25) : 8;
                        const finalDmg = player.passives.shield ? baseDmg * 0.7 : baseDmg;
                        damagePlayer(finalDmg * dt * 2); // DPS on contact
                    }

                });

                enemyProjectiles.forEach(projectile => {
                    if (projectile.armingTime > 0) {
                        projectile.armingTime = Math.max(0, projectile.armingTime - dt);
                    }
                    const isArmed = projectile.armingTime === undefined || projectile.armingTime <= 0;
                    if (projectile.homing) {
                        const targetAngle = Math.atan2(player.y - projectile.y, player.x - projectile.x);
                        const currentAngle = Math.atan2(projectile.vy, projectile.vx);
                        const turn = Math.atan2(
                            Math.sin(targetAngle - currentAngle),
                            Math.cos(targetAngle - currentAngle)
                        );
                        const nextAngle = currentAngle + Math.max(-dt * 1.2, Math.min(dt * 1.2, turn));
                        projectile.vx = Math.cos(nextAngle) * projectile.speed;
                        projectile.vy = Math.sin(nextAngle) * projectile.speed;
                    }
                    if (isArmed) {
                        projectile.x += projectile.vx * frameScale;
                        projectile.y += projectile.vy * frameScale;
                    }
                    projectile.life -= dt;
                    if (!isDashingThisFrame && projectile.life > 0 && isArmed &&
                        Math.hypot(projectile.x - player.x, projectile.y - player.y) < projectile.radius + player.radius) {
                        projectile.life = 0;
                        damagePlayer(player.passives.shield ? projectile.damage * 0.7 : projectile.damage);
                    }
                });
                enemyProjectiles = enemyProjectiles.filter(projectile => projectile.life > 0);

                // 8. Update Projectiles
                projectiles.forEach((p, idx) => {
                    p.x += p.vx * frameScale;
                    p.y += p.vy * frameScale;
                    p.life -= dt;

                    // Flame Trail
                    particles.push({
                        x: p.x, y: p.y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        radius: 5 * p.scale,
                        color: '#f97316',
                        life: 0.3
                    });

                    // Collision with enemies
                    enemies.forEach(e => {
                        if (p.life > 0 && Math.hypot(e.x - p.x, e.y - p.y) < p.radius + e.radius) {
                            p.life = 0;
                            AudioFX.playFireImpact();
                            damageEnemy(e, p.damage);
                            particles.push({
                                type: 'burning_area',
                                x: p.x,
                                y: p.y,
                                radius: 48 * p.scale,
                                damage: Math.max(1, Math.floor(p.damage * 0.08)),
                                tickTimer: 0,
                                life: 2.5,
                                maxLife: 2.5,
                                scale: p.scale
                            });

                            const sparkCount = 8;
                            for (let sparkIndex = 0; sparkIndex < sparkCount; sparkIndex++) {
                                const sparkAngle = (Math.PI * 2 / sparkCount) * sparkIndex + Math.random() * 0.25;
                                const sparkSpeed = (130 + Math.random() * 90) * p.scale;
                                particles.push({
                                    type: 'fire_spark',
                                    x: p.x,
                                    y: p.y,
                                    vx: Math.cos(sparkAngle) * sparkSpeed,
                                    vy: Math.sin(sparkAngle) * sparkSpeed,
                                    radius: 4 * p.scale,
                                    scale: p.scale,
                                    damage: Math.max(1, Math.floor(p.damage * 0.08)),
                                    explosionRadius: 32 * p.scale,
                                    color: sparkIndex % 2 === 0 ? '#fb923c' : '#facc15',
                                    life: 0.25 + Math.random() * 0.12
                                });
                            }
                        }
                    });
                });
                projectiles = projectiles.filter(p => p.life > 0);

                // 9. Collect Loot
                itemsOnGround.forEach((itemObj, idx) => {
                    itemObj.life -= dt;
                    if (Math.hypot(player.x - itemObj.x, player.y - itemObj.y) < player.radius + 20) {
                        if (collectItem(itemObj)) itemObj.life = 0;
                    }
                });
                itemsOnGround = itemsOnGround.filter(i => i.life > 0);

                // 10. Update Particles & Floating Texts
                particles.forEach(p => {
                    if (p.type === 'boss_telegraph') {
                        p.life -= dt;
                        if (p.life <= 0 && p.attack === 'projectile') {
                            const style = bossAttackStyles[p.bossType];
                            const volleyCount = style.volley || 1;
                            for (let i = 0; i < volleyCount; i++) {
                                const spread = (i - (volleyCount - 1) / 2) * 0.16;
                                launchBossProjectile({ x: p.originX, y: p.originY }, style, spread);
                            }
                            p.life = 0;
                        } else if (p.life <= 0 && p.attack === 'charge') {
                            p.life = 0;
                        } else if (p.life <= 0) {
                            if (p.attack === 'wave') {
                                p.type = 'boss_blast';
                                p.life = 0.9;
                                p.maxLife = 0.9;
                                p.previousRadius = 0;
                                p.hitPlayer = false;
                            } else {
                                useBossAreaAttack(p, isDashingThisFrame);
                                p.type = 'boss_blast';
                                p.life = 0.65;
                                p.maxLife = 0.65;
                            }
                            screenShake = Math.max(screenShake, p.bossType === 'ZEUS' ? 13 : 8);
                        }
                    } else if (p.type === 'boss_blast' && p.attack === 'wave') {
                        p.life -= dt;
                        const currentRadius = p.radius * (1 - p.life / p.maxLife);
                        const playerDistance = Math.hypot(player.x - p.x, player.y - p.y);
                        if (!isDashingThisFrame && !p.hitPlayer && playerDistance + player.radius >= p.previousRadius &&
                            playerDistance - player.radius <= currentRadius) {
                            damagePlayer(player.passives.shield ? p.damage * 0.7 : p.damage);
                            p.hitPlayer = true;
                        }
                        p.previousRadius = currentRadius;
                    } else if (p.type === 'boss_blast' || p.type === 'boss_teleport') {
                        p.life -= dt;
                    } else if (p.type === 'burning_area') {
                        p.life -= dt;
                        p.tickTimer -= dt;
                        if (p.tickTimer <= 0) {
                            p.tickTimer = 0.5;
                            enemies.forEach(enemy => {
                                if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < p.radius + enemy.radius) {
                                    damageEnemy(enemy, p.damage);
                                }
                            });
                        }
                    } else if (p.type === 'fire_spark') {
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        p.life -= dt;

                        if (p.life <= 0) {
                            AudioFX.playMiniExplosion();
                            p.type = 'fire_pop';
                            p.radius = p.explosionRadius;
                            p.maxLife = 0.18;
                            p.life = p.maxLife;

                            enemies.forEach(enemy => {
                                if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < p.explosionRadius + enemy.radius) {
                                    damageEnemy(enemy, p.damage);
                                }
                            });
                        }
                    } else if (p.type === 'inferno_wave') {
                        if (p.delay > 0) {
                            p.delay = Math.max(0, p.delay - dt);
                        } else {
                            if (!p.soundPlayed) {
                                AudioFX.playFireLaunch();
                                p.soundPlayed = true;
                            }
                            p.life -= dt;
                            const currentRadius = p.radius * (1 - p.life / p.maxLife);

                            enemies.forEach(enemy => {
                                const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
                                if (!p.hitEnemies.has(enemy) &&
                                    dist + enemy.radius >= p.previousRadius &&
                                    dist - enemy.radius <= currentRadius) {
                                    p.hitEnemies.add(enemy);
                                    damageEnemy(enemy, p.damage);
                                }
                            });

                            p.previousRadius = currentRadius;
                        }
                    } else {
                        p.life -= dt;
                    }
                });
                particles = particles.filter(p => p.life > 0);

                floatingTexts.forEach(ft => {
                    ft.y -= 20 * dt;
                    ft.life -= dt;
                });
                floatingTexts = floatingTexts.filter(ft => ft.life > 0);

                // 11. Screen Shake Decay
                if (screenShake > 0) screenShake -= dt * 30;

                // 12. Update UI DOM Elements
                updateHUD();
            }

            // PIXI: brilhos mitológicos e relâmpagos em camada independente
            // Function: renderPixiFx — desenha brilhos e relâmpagos via PixiJS.
            function renderPixiFx(shakeX, shakeY) {
                if (!pixiApp) return;

                pixiGlowLayer.clear();
                pixiLightningLayer.clear();
                pixiFxRoot.position.set(shakeX, shakeY);

                const pulse = 0.88 + Math.sin(performance.now() * 0.004) * 0.12;
                // Function: drawGlow — desenha círculos de brilho em camadas.
                const drawGlow = (x, y, radius, color, strength = 1) => {
                    const glowBands = [
                        { scale: 2.2, alpha: 0.025 },
                        { scale: 1.55, alpha: 0.045 },
                        { scale: 1.08, alpha: 0.075 }
                    ];
                    glowBands.forEach(band => {
                        pixiGlowLayer.beginFill(color, band.alpha * strength);
                        pixiGlowLayer.drawCircle(x, y, Math.max(2, radius * band.scale));
                        pixiGlowLayer.endFill();
                    });
                };
                // Function: drawLightning — desenha um raio segmentado em zigue-zague.
                const drawLightning = (x1, y1, x2, y2, color, width, alpha) => {
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const length = Math.hypot(dx, dy) || 1;
                    const perpendicularX = -dy / length;
                    const perpendicularY = dx / length;
                    const segments = Math.max(4, Math.min(12, Math.floor(length / 35)));

                    pixiLightningLayer.lineStyle(width, color, alpha);
                    pixiLightningLayer.moveTo(x1, y1);
                    for (let segment = 1; segment < segments; segment++) {
                        const progress = segment / segments;
                        const jitter = (Math.random() - 0.5) * Math.min(28, length * 0.08);
                        pixiLightningLayer.lineTo(
                            x1 + dx * progress + perpendicularX * jitter,
                            y1 + dy * progress + perpendicularY * jitter
                        );
                    }
                    pixiLightningLayer.lineTo(x2, y2);
                };

                // Auras reforçam a silhueta do paladino, inimigos congelados e chefes
                const playerX = player.x - camera.x;
                const playerY = player.y - camera.y;
                drawGlow(playerX, playerY, player.radius * 1.15, player.dashTimer > 0 ? 0x67e8f9 : 0xfacc15, pulse);

                if (player.passives.fireAura) {
                    drawGlow(playerX, playerY, 110 * player.getSkillScale(), 0xf97316, 0.9);
                }

                enemies.forEach(enemy => {
                    const enemyX = enemy.x - camera.x;
                    const enemyY = enemy.y - camera.y;
                    const glowMargin = enemy.radius * (enemy.isBoss ? 3.1 : 2.4);
                    if (enemyX < -glowMargin || enemyX > viewportWidth + glowMargin ||
                        enemyY < -glowMargin || enemyY > viewportHeight + glowMargin) return;
                    if (enemy.isBoss) {
                        drawGlow(enemyX, enemyY, enemy.radius * 1.35, enemy.type === 'ZEUS' ? 0xfacc15 : 0xef4444, pulse);
                    } else if (enemy.slowTimer > 0) {
                        drawGlow(enemyX, enemyY, enemy.radius, 0x38bdf8, 0.75);
                    } else if (enemy.chargeWindup > 0) {
                        drawGlow(enemyX, enemyY, enemy.radius, 0xfb923c, pulse);
                    }
                });

                projectiles.forEach(projectile => {
                    const projectileX = projectile.x - camera.x;
                    const projectileY = projectile.y - camera.y;
                    const glowMargin = projectile.radius * 2.2;
                    if (projectileX < -glowMargin || projectileX > viewportWidth + glowMargin ||
                        projectileY < -glowMargin || projectileY > viewportHeight + glowMargin) return;
                    drawGlow(projectileX, projectileY, projectile.radius, 0xf97316, 1.15);
                });

                itemsOnGround.forEach(item => {
                    drawGlow(item.x - camera.x, item.y - camera.y, 8, 0x67e8f9, pulse);
                });

                // Raios em zigue-zague destacam correntes e impactos da tempestade
                particles.forEach(particle => {
                    if (particle.type === 'lightning_beam') {
                        drawLightning(
                            particle.x1 - camera.x,
                            particle.y1 - camera.y,
                            particle.x2 - camera.x,
                            particle.y2 - camera.y,
                            0xfef08a,
                            8,
                            0.24
                        );
                        drawLightning(
                            particle.x1 - camera.x,
                            particle.y1 - camera.y,
                            particle.x2 - camera.x,
                            particle.y2 - camera.y,
                            0xfacc15,
                            2.5,
                            0.95
                        );
                    } else if (particle.type === 'lightning_strike') {
                        const targetX = particle.x - camera.x;
                        const targetY = particle.y - camera.y;
                        drawLightning(targetX + 20, Math.max(-30, targetY - 420), targetX, targetY, 0xfef08a, 12, 0.3);
                        drawLightning(targetX + 20, Math.max(-30, targetY - 420), targetX, targetY, 0xfacc15, 4, 1);
                        drawGlow(targetX, targetY, 80 * particle.scale, 0xfacc15, pulse);
                    }
                });

                pixiApp.renderer.render(pixiApp.stage);
            }

            // Cenário: pisos de pedra e ornamentos próprios de cada bioma
            // Function: createBiomeFloorPattern — cria o padrão visual do piso do bioma.
            function createBiomeFloorPattern(biome) {
                const tileSize = 176;
                const tile = document.createElement('canvas');
                tile.width = tileSize;
                tile.height = tileSize;
                const tileContext = tile.getContext('2d');
                const variation = Math.abs(Math.sin(BIOMES.indexOf(biome) * 37.719 + 12.9898));
                const center = tileSize / 2;

                tileContext.fillStyle = biome.floor;
                tileContext.fillRect(0, 0, tileSize, tileSize);
                tileContext.fillStyle = variation > 0.5
                    ? 'rgba(255, 255, 255, 0.025)'
                    : 'rgba(0, 0, 0, 0.07)';
                tileContext.fillRect(2, 2, tileSize - 4, tileSize - 4);

                tileContext.strokeStyle = biome.grid;
                tileContext.lineWidth = 2;
                tileContext.strokeRect(1, 1, tileSize - 2, tileSize - 2);
                tileContext.globalAlpha = 0.22;
                tileContext.lineWidth = 1;
                tileContext.strokeRect(8, 8, tileSize - 16, tileSize - 16);

                // Grava a marca do bioma uma única vez na textura reutilizável
                tileContext.save();
                tileContext.translate(center, center);
                tileContext.strokeStyle = biome.ruinColor;
                tileContext.fillStyle = biome.particleColor;
                tileContext.globalAlpha = 0.22 + variation * 0.1;
                tileContext.lineWidth = 2;

                if (biome.event === 'onda') {
                    tileContext.rotate(Math.PI / 4);
                    tileContext.strokeRect(-14, -14, 28, 28);
                    tileContext.globalAlpha *= 0.65;
                    tileContext.beginPath();
                    tileContext.arc(0, 0, 5, 0, Math.PI * 2);
                    tileContext.fill();
                } else if (biome.event === 'cerberus') {
                    tileContext.beginPath();
                    tileContext.moveTo(-34, -42);
                    tileContext.lineTo(-12, -10);
                    tileContext.lineTo(-25, 8);
                    tileContext.lineTo(4, 22);
                    tileContext.lineTo(22, 46);
                    tileContext.stroke();
                    tileContext.globalAlpha *= 0.55;
                    tileContext.beginPath();
                    tileContext.arc(-30, -38, 3, 0, Math.PI * 2);
                    tileContext.arc(20, 43, 4, 0, Math.PI * 2);
                    tileContext.fill();
                } else if (biome.event === 'healing') {
                    for (let wave = -1; wave <= 1; wave++) {
                        tileContext.beginPath();
                        tileContext.ellipse(0, wave * 13, 42, 8, 0, 0, Math.PI);
                        tileContext.stroke();
                    }
                } else if (biome.event === 'satyrs') {
                    tileContext.beginPath();
                    tileContext.moveTo(-30, 28);
                    tileContext.quadraticCurveTo(0, -6, 30, -28);
                    tileContext.moveTo(-2, 2);
                    tileContext.quadraticCurveTo(-27, -2, -25, -27);
                    tileContext.moveTo(4, -4);
                    tileContext.quadraticCurveTo(29, 1, 26, 26);
                    tileContext.stroke();
                    tileContext.beginPath();
                    tileContext.arc(0, 0, 4, 0, Math.PI * 2);
                    tileContext.fill();
                } else {
                    tileContext.beginPath();
                    tileContext.moveTo(0, -34);
                    tileContext.lineTo(0, 34);
                    tileContext.moveTo(-30, -17);
                    tileContext.lineTo(30, 17);
                    tileContext.moveTo(-30, 17);
                    tileContext.lineTo(30, -17);
                    tileContext.stroke();
                    tileContext.beginPath();
                    tileContext.arc(0, 0, 5, 0, Math.PI * 2);
                    tileContext.fill();
                }

                tileContext.restore();
                return ctx.createPattern(tile, 'repeat');
            }

            // Function: drawBiomeFloor — desenha o piso e a vinheta do bioma.
            function drawBiomeFloor(currentBiome) {
                const tileSize = 176;
                if (!biomeFloorPatterns[currentBiomeIdx]) {
                    biomeFloorPatterns[currentBiomeIdx] = createBiomeFloorPattern(currentBiome);
                }

                const pattern = biomeFloorPatterns[currentBiomeIdx];
                if (pattern) {
                    const offsetX = -camera.x % tileSize;
                    const offsetY = -camera.y % tileSize;
                    ctx.save();
                    ctx.translate(offsetX, offsetY);
                    ctx.fillStyle = pattern;
                    ctx.fillRect(-offsetX, -offsetY, viewportWidth + tileSize, viewportHeight + tileSize);
                    ctx.restore();
                } else {
                    ctx.fillStyle = currentBiome.floor;
                    ctx.fillRect(0, 0, viewportWidth, viewportHeight);
                }

                // Reutiliza a vinheta até a janela mudar de tamanho
                if (!cachedVignette || cachedVignetteWidth !== viewportWidth || cachedVignetteHeight !== viewportHeight) {
                    cachedVignette = ctx.createRadialGradient(
                        viewportWidth / 2, viewportHeight / 2, Math.min(viewportWidth, viewportHeight) * 0.18,
                        viewportWidth / 2, viewportHeight / 2, Math.max(viewportWidth, viewportHeight) * 0.72
                    );
                    cachedVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    cachedVignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
                    cachedVignetteWidth = viewportWidth;
                    cachedVignetteHeight = viewportHeight;
                }
                ctx.fillStyle = cachedVignette;
                ctx.fillRect(0, 0, viewportWidth, viewportHeight);
            }

            // Desenha a arena temática temporária e o símbolo correspondente ao chefe ativo.
            function drawBossArena() {
                if (!activeBossArena) return;
                const style = BOSS_ARENA_STYLES[activeBossArena.type] || BOSS_ARENA_STYLES.ZEUS;
                const centerX = activeBossArena.x - camera.x;
                const centerY = activeBossArena.y - camera.y;
                const radius = BOSS_ARENA_RADIUS;

                ctx.save();
                ctx.shadowColor = style.edge;
                ctx.shadowBlur = 28;
                ctx.fillStyle = style.floor;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.globalAlpha = 0.28;
                ctx.strokeStyle = style.accent;
                ctx.lineWidth = 3;
                [radius * 0.48, radius * 0.72, radius * 0.9].forEach(ringRadius => {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
                    ctx.stroke();
                });

                for (let i = 0; i < 12; i++) {
                    const angle = i * Math.PI / 6;
                    const innerRadius = radius * 0.78;
                    const outerRadius = radius * 0.9;
                    ctx.beginPath();
                    ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
                    ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
                    ctx.stroke();

                    const pillarX = centerX + Math.cos(angle) * radius * 0.94;
                    const pillarY = centerY + Math.sin(angle) * radius * 0.94;
                    ctx.save();
                    ctx.translate(pillarX, pillarY);
                    ctx.rotate(angle);
                    ctx.globalAlpha = 0.92;
                    ctx.fillStyle = '#cbd5e1';
                    ctx.fillRect(-22, -12, 44, 24);
                    ctx.fillStyle = style.edge;
                    ctx.fillRect(-18, -5, 36, 10);
                    ctx.restore();
                }

                ctx.globalAlpha = 0.95;
                ctx.strokeStyle = style.edge;
                ctx.lineWidth = 12;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 0.75;
                ctx.strokeStyle = style.accent;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 18, 0, Math.PI * 2);
                ctx.stroke();

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.globalAlpha = 0.24;
                ctx.strokeStyle = style.accent;
                ctx.fillStyle = style.accent;
                ctx.lineWidth = 18;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                if (activeBossArena.type === 'ZEUS') {
                    ctx.moveTo(22, -112);
                    ctx.lineTo(-28, -12);
                    ctx.lineTo(20, -12);
                    ctx.lineTo(-18, 112);
                } else if (activeBossArena.type === 'POSEIDON') {
                    ctx.moveTo(0, 96);
                    ctx.lineTo(0, -66);
                    ctx.moveTo(-58, -78);
                    ctx.lineTo(-58, -30);
                    ctx.lineTo(0, -2);
                    ctx.lineTo(58, -30);
                    ctx.lineTo(58, -78);
                    ctx.moveTo(-58, -30);
                    ctx.lineTo(-80, -58);
                    ctx.moveTo(58, -30);
                    ctx.lineTo(80, -58);
                } else if (activeBossArena.type === 'ARES') {
                    ctx.moveTo(-74, -74);
                    ctx.lineTo(74, 74);
                    ctx.moveTo(74, -74);
                    ctx.lineTo(-74, 74);
                } else if (activeBossArena.type === 'HADES') {
                    ctx.moveTo(-64, 86);
                    ctx.bezierCurveTo(-112, 18, -26, -4, -56, -96);
                    ctx.bezierCurveTo(12, -46, 12, 12, 0, 86);
                    ctx.moveTo(64, 86);
                    ctx.bezierCurveTo(26, 30, 102, -2, 58, -80);
                } else if (activeBossArena.type === 'APOLO') {
                    ctx.arc(0, 0, 52, 0, Math.PI * 2);
                    for (let i = 0; i < 8; i++) {
                        const angle = i * Math.PI / 4;
                        ctx.moveTo(Math.cos(angle) * 76, Math.sin(angle) * 76);
                        ctx.lineTo(Math.cos(angle) * 112, Math.sin(angle) * 112);
                    }
                } else {
                    ctx.arc(-36, -18, 29, 0, Math.PI * 2);
                    ctx.moveTo(65, -18);
                    ctx.arc(36, -18, 29, 0, Math.PI * 2);
                    ctx.moveTo(-77, -8);
                    ctx.lineTo(-98, -44);
                    ctx.lineTo(-50, -33);
                    ctx.moveTo(77, -8);
                    ctx.lineTo(98, -44);
                    ctx.lineTo(50, -33);
                }
                ctx.stroke();
                ctx.restore();
                ctx.restore();
            }

            // Desenha a silhueta da estrutura conforme o bioma, usando uma escala aplicada pelo render().
            function drawRuinStructure(ruin, biome) {
                const detailColor = biome.particleColor;
                ctx.fillStyle = biome.ruinColor;
                ctx.strokeStyle = biome.ruinColor;
                ctx.lineWidth = 4;

                switch (biome.ruinTypes[ruin.type]) {
                    case 'olympus_temple':
                        ctx.fillRect(-48, 28, 96, 12);
                        ctx.fillRect(-40, 18, 80, 8);
                        [-30, -10, 10, 30].forEach(x => {
                            ctx.fillRect(x - 4, -22, 8, 40);
                            ctx.fillRect(x - 7, -26, 14, 5);
                            ctx.fillRect(x - 7, 17, 14, 5);
                        });
                        ctx.beginPath();
                        ctx.moveTo(-46, -28);
                        ctx.lineTo(0, -52);
                        ctx.lineTo(46, -28);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = detailColor;
                        ctx.beginPath();
                        ctx.arc(0, -35, 5, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'broken_column':
                        ctx.fillRect(-25, 20, 50, 9);
                        ctx.fillRect(-19, -22, 38, 42);
                        ctx.fillRect(-24, -28, 48, 7);
                        ctx.fillRect(-20, 20, 40, 6);
                        ctx.beginPath();
                        ctx.moveTo(-19, -22);
                        ctx.lineTo(7, -22);
                        ctx.lineTo(-1, -12);
                        ctx.lineTo(19, -5);
                        ctx.lineTo(19, 20);
                        ctx.lineTo(-19, 20);
                        ctx.closePath();
                        ctx.fill();
                        ctx.save();
                        ctx.translate(28, 22);
                        ctx.rotate(-0.38);
                        ctx.fillRect(-28, -4, 56, 9);
                        ctx.fillRect(-31, -8, 12, 17);
                        ctx.fillRect(19, -8, 12, 17);
                        ctx.restore();
                        break;
                    case 'god_statue':
                        ctx.fillRect(-24, 24, 48, 10);
                        ctx.fillRect(-17, 12, 34, 12);
                        ctx.fillRect(-12, -12, 24, 25);
                        ctx.beginPath();
                        ctx.arc(0, -22, 11, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(-13, -31);
                        ctx.lineTo(-8, -43);
                        ctx.lineTo(0, -35);
                        ctx.lineTo(8, -43);
                        ctx.lineTo(13, -31);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.beginPath();
                        ctx.moveTo(-22, -8);
                        ctx.lineTo(-31, 10);
                        ctx.moveTo(22, -8);
                        ctx.lineTo(31, 10);
                        ctx.stroke();
                        break;
                    case 'tartarus_gate':
                        ctx.fillRect(-38, 12, 12, 34);
                        ctx.fillRect(26, 12, 12, 34);
                        ctx.fillRect(-46, 41, 92, 9);
                        ctx.beginPath();
                        ctx.arc(0, 12, 32, Math.PI, 0);
                        ctx.lineTo(32, 15);
                        ctx.arc(0, 15, 22, 0, Math.PI, true);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = '#14090c';
                        ctx.beginPath();
                        ctx.arc(0, 14, 21, Math.PI, 0);
                        ctx.lineTo(21, 33);
                        ctx.lineTo(-21, 33);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = detailColor;
                        ctx.globalAlpha = 0.75;
                        ctx.beginPath();
                        ctx.ellipse(0, 20, 8, 18, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                        break;
                    case 'soul_obelisk':
                        ctx.fillRect(-26, 31, 52, 8);
                        ctx.beginPath();
                        ctx.moveTo(-20, 30);
                        ctx.lineTo(-13, -26);
                        ctx.lineTo(0, -47);
                        ctx.lineTo(13, -26);
                        ctx.lineTo(20, 30);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.beginPath();
                        ctx.moveTo(0, -27);
                        ctx.lineTo(-4, -7);
                        ctx.lineTo(5, 1);
                        ctx.lineTo(-3, 18);
                        ctx.stroke();
                        break;
                    case 'underworld_altar':
                        ctx.fillRect(-34, 24, 68, 12);
                        ctx.fillRect(-26, 12, 52, 12);
                        ctx.fillRect(-18, -1, 36, 13);
                        ctx.fillStyle = detailColor;
                        ctx.beginPath();
                        ctx.moveTo(0, -35);
                        ctx.quadraticCurveTo(20, -13, 0, 3);
                        ctx.quadraticCurveTo(-17, -10, 0, -35);
                        ctx.fill();
                        break;
                    case 'coastal_temple':
                        ctx.fillRect(-45, 22, 90, 9);
                        [-30, -10, 10, 30].forEach(x => {
                            ctx.fillRect(x - 4, -12, 8, 33);
                            ctx.fillRect(x - 7, -16, 14, 5);
                        });
                        ctx.beginPath();
                        ctx.moveTo(-43, -18);
                        ctx.lineTo(0, -40);
                        ctx.lineTo(43, -18);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        [-1, 1].forEach(direction => {
                            ctx.beginPath();
                            ctx.moveTo(-38, 39 * direction);
                            ctx.quadraticCurveTo(0, 30 * direction, 38, 39 * direction);
                            ctx.stroke();
                        });
                        break;
                    case 'shipwreck':
                        ctx.beginPath();
                        ctx.moveTo(-43, 1);
                        ctx.lineTo(38, 1);
                        ctx.lineTo(23, 21);
                        ctx.lineTo(-27, 21);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillRect(-3, -43, 6, 45);
                        ctx.beginPath();
                        ctx.moveTo(2, -38);
                        ctx.lineTo(29, -10);
                        ctx.lineTo(2, -10);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.beginPath();
                        ctx.moveTo(-38, 29);
                        ctx.quadraticCurveTo(-17, 21, 0, 29);
                        ctx.quadraticCurveTo(20, 37, 40, 28);
                        ctx.stroke();
                        break;
                    case 'poseidon_statue':
                        ctx.fillRect(-24, 23, 48, 10);
                        ctx.fillRect(-13, 5, 26, 19);
                        ctx.beginPath();
                        ctx.arc(0, -9, 11, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.lineWidth = 4;
                        ctx.beginPath();
                        ctx.moveTo(23, 17);
                        ctx.lineTo(23, -37);
                        ctx.moveTo(13, -34);
                        ctx.quadraticCurveTo(23, -43, 33, -34);
                        ctx.moveTo(15, -30);
                        ctx.lineTo(15, -22);
                        ctx.moveTo(31, -30);
                        ctx.lineTo(31, -22);
                        ctx.stroke();
                        break;
                    case 'sacred_tree':
                        ctx.fillRect(-8, 2, 16, 37);
                        ctx.beginPath();
                        ctx.arc(-13, -7, 19, 0, Math.PI * 2);
                        ctx.arc(13, -12, 21, 0, Math.PI * 2);
                        ctx.arc(0, -28, 19, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(0, 34);
                        ctx.lineTo(0, -12);
                        ctx.lineTo(-12, -24);
                        ctx.moveTo(0, 0);
                        ctx.lineTo(12, -16);
                        ctx.stroke();
                        break;
                    case 'rune_stone':
                        ctx.beginPath();
                        ctx.moveTo(-27, 31);
                        ctx.lineTo(-21, -20);
                        ctx.lineTo(-7, -40);
                        ctx.lineTo(23, -31);
                        ctx.lineTo(29, 31);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(0, -24);
                        ctx.lineTo(0, 20);
                        ctx.moveTo(0, -8);
                        ctx.lineTo(12, 1);
                        ctx.moveTo(0, 5);
                        ctx.lineTo(-11, 14);
                        ctx.stroke();
                        break;
                    case 'forest_shrine':
                        ctx.fillRect(-31, 19, 62, 10);
                        ctx.fillRect(-25, 9, 50, 9);
                        ctx.fillRect(-20, -14, 7, 23);
                        ctx.fillRect(13, -14, 7, 23);
                        ctx.fillRect(-25, -18, 50, 6);
                        ctx.beginPath();
                        ctx.moveTo(-27, -20);
                        ctx.lineTo(0, -39);
                        ctx.lineTo(27, -20);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.beginPath();
                        ctx.arc(0, -2, 8, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                    case 'snow_sanctuary':
                        ctx.fillRect(-43, 21, 86, 10);
                        [-27, -9, 9, 27].forEach(x => {
                            ctx.fillRect(x - 4, -12, 8, 33);
                            ctx.fillRect(x - 7, -16, 14, 5);
                        });
                        ctx.beginPath();
                        ctx.moveTo(-46, -17);
                        ctx.lineTo(0, -39);
                        ctx.lineTo(46, -17);
                        ctx.lineTo(36, -12);
                        ctx.lineTo(26, -20);
                        ctx.lineTo(15, -12);
                        ctx.lineTo(4, -20);
                        ctx.lineTo(-7, -12);
                        ctx.lineTo(-20, -20);
                        ctx.lineTo(-33, -12);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = detailColor;
                        ctx.beginPath();
                        ctx.arc(0, -4, 5, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'frozen_monolith':
                        ctx.beginPath();
                        ctx.moveTo(-23, 32);
                        ctx.lineTo(-18, -29);
                        ctx.lineTo(-5, -47);
                        ctx.lineTo(8, -30);
                        ctx.lineTo(23, 32);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = detailColor;
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(-6, -24);
                        ctx.lineTo(7, -6);
                        ctx.lineTo(-4, 4);
                        ctx.lineTo(9, 24);
                        ctx.stroke();
                        break;
                    case 'frozen_statue':
                        ctx.fillRect(-26, 25, 52, 10);
                        ctx.fillRect(-16, 12, 32, 13);
                        ctx.fillRect(-11, -10, 22, 24);
                        ctx.beginPath();
                        ctx.arc(0, -20, 11, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = detailColor;
                        ctx.beginPath();
                        ctx.moveTo(-13, -27);
                        ctx.lineTo(-18, -39);
                        ctx.lineTo(-5, -33);
                        ctx.lineTo(0, -44);
                        ctx.lineTo(7, -33);
                        ctx.lineTo(18, -39);
                        ctx.lineTo(13, -27);
                        ctx.closePath();
                        ctx.fill();
                        break;
                }
            }

            // Rostos: expressões e silhuetas próprias para cada criatura
            // Function: drawEnemyFace — desenha o rosto correspondente ao inimigo.
            function drawEnemyFace(enemy) {
                const radius = enemy.radius;
                const eyeY = -radius * 0.16;
                const eyeSpacing = radius * 0.34;
                const eyeRadius = Math.max(1.8, radius * 0.13);

                ctx.save();
                ctx.shadowBlur = 0;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Function: drawEye — desenha um olho com pupila colorida.
                const drawEye = (x, y, size = eyeRadius, pupilColor = '#7f1d1d') => {
                    ctx.fillStyle = '#fff7d6';
                    ctx.beginPath();
                    ctx.ellipse(x, y, size * 1.18, size, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = pupilColor;
                    ctx.beginPath();
                    ctx.arc(x, y, size * 0.62, 0, Math.PI * 2);
                    ctx.fill();
                };
                // Function: drawMouth — desenha a boca do personagem.
                const drawMouth = (width = radius * 0.42, y = radius * 0.38) => {
                    ctx.strokeStyle = '#2b1111';
                    ctx.lineWidth = Math.max(1.5, radius * 0.09);
                    ctx.beginPath();
                    ctx.moveTo(-width / 2, y);
                    ctx.quadraticCurveTo(0, y + radius * 0.12, width / 2, y);
                    ctx.stroke();
                };

                if (enemy.isBoss) {
                    if (enemy.type === 'ARES') {
                        // Ares: elmo de guerra, crista escarlate e olhar dourado
                        ctx.fillStyle = '#7f1d1d';
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.62, -radius * 0.12);
                        ctx.lineTo(-radius * 0.5, -radius * 0.58);
                        ctx.quadraticCurveTo(0, -radius * 0.82, radius * 0.5, -radius * 0.58);
                        ctx.lineTo(radius * 0.62, -radius * 0.12);
                        ctx.lineTo(radius * 0.42, radius * 0.48);
                        ctx.lineTo(radius * 0.2, radius * 0.16);
                        ctx.lineTo(-radius * 0.2, radius * 0.16);
                        ctx.lineTo(-radius * 0.42, radius * 0.48);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = '#fbbf24';
                        ctx.lineWidth = Math.max(2, radius * 0.08);
                        ctx.beginPath();
                        ctx.moveTo(0, -radius * 0.78);
                        ctx.quadraticCurveTo(radius * 0.42, -radius * 0.98, radius * 0.5, -radius * 0.56);
                        ctx.moveTo(-radius * 0.44, -radius * 0.32);
                        ctx.lineTo(-radius * 0.2, -radius * 0.18);
                        ctx.moveTo(radius * 0.44, -radius * 0.32);
                        ctx.lineTo(radius * 0.2, -radius * 0.18);
                        ctx.stroke();
                        drawEye(-eyeSpacing, eyeY, eyeRadius * 1.1, '#facc15');
                        drawEye(eyeSpacing, eyeY, eyeRadius * 1.1, '#facc15');
                        ctx.fillStyle = '#450a0a';
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.18, radius * 0.1);
                        ctx.lineTo(radius * 0.18, radius * 0.1);
                        ctx.lineTo(radius * 0.28, radius * 0.4);
                        ctx.lineTo(-radius * 0.28, radius * 0.4);
                        ctx.closePath();
                        ctx.fill();
                    } else if (enemy.type === 'ZEUS') {
                        // Zeus: olhos celestes, sobrancelhas de relâmpago e barba divina
                        drawEye(-eyeSpacing, eyeY, eyeRadius * 1.25, '#2563eb');
                        drawEye(eyeSpacing, eyeY, eyeRadius * 1.25, '#2563eb');
                        ctx.strokeStyle = '#fef08a';
                        ctx.lineWidth = Math.max(2, radius * 0.1);
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.46, -radius * 0.36);
                        ctx.lineTo(-radius * 0.08, -radius * 0.23);
                        ctx.lineTo(-radius * 0.34, -radius * 0.06);
                        ctx.moveTo(radius * 0.46, -radius * 0.36);
                        ctx.lineTo(radius * 0.08, -radius * 0.23);
                        ctx.lineTo(radius * 0.34, -radius * 0.06);
                        ctx.stroke();
                        ctx.fillStyle = '#facc15';
                        ctx.beginPath();
                        ctx.moveTo(radius * 0.02, -radius * 0.48);
                        ctx.lineTo(-radius * 0.12, -radius * 0.05);
                        ctx.lineTo(radius * 0.06, -radius * 0.1);
                        ctx.lineTo(-radius * 0.02, radius * 0.18);
                        ctx.lineTo(radius * 0.2, -radius * 0.2);
                        ctx.lineTo(radius * 0.08, -radius * 0.16);
                        ctx.closePath();
                        ctx.fill();
                    } else if (enemy.type === 'POSEIDON') {
                        // Poseidon: coroa de ondas, olhos marinhos e barba ondulada
                        ctx.strokeStyle = '#67e8f9';
                        ctx.lineWidth = Math.max(2, radius * 0.1);
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.62, -radius * 0.36);
                        ctx.quadraticCurveTo(-radius * 0.44, -radius * 0.72, -radius * 0.25, -radius * 0.38);
                        ctx.quadraticCurveTo(0, -radius * 0.82, radius * 0.22, -radius * 0.38);
                        ctx.quadraticCurveTo(radius * 0.44, -radius * 0.72, radius * 0.62, -radius * 0.36);
                        ctx.stroke();
                        drawEye(-eyeSpacing, eyeY, eyeRadius * 1.15, '#0891b2');
                        drawEye(eyeSpacing, eyeY, eyeRadius * 1.15, '#0891b2');
                        ctx.fillStyle = '#bae6fd';
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.42, radius * 0.2);
                        ctx.quadraticCurveTo(-radius * 0.22, radius * 0.34, 0, radius * 0.22);
                        ctx.quadraticCurveTo(radius * 0.22, radius * 0.34, radius * 0.42, radius * 0.2);
                        ctx.quadraticCurveTo(radius * 0.25, radius * 0.76, 0, radius * 0.58);
                        ctx.quadraticCurveTo(-radius * 0.25, radius * 0.76, -radius * 0.42, radius * 0.2);
                        ctx.fill();
                        ctx.strokeStyle = '#0e7490';
                        ctx.lineWidth = 2;
                        [-0.2, 0, 0.2].forEach(offset => {
                            ctx.beginPath();
                            ctx.moveTo(radius * offset, radius * 0.31);
                            ctx.lineTo(radius * offset, radius * 0.53);
                            ctx.stroke();
                        });
                    } else if (enemy.type === 'HADES') {
                        // Hades: capuz sombrio, olhos infernais e coroa de chamas
                        ctx.fillStyle = '#1f1020';
                        ctx.beginPath();
                        ctx.arc(0, -radius * 0.04, radius * 0.67, Math.PI, Math.PI * 2);
                        ctx.lineTo(radius * 0.48, radius * 0.44);
                        ctx.lineTo(-radius * 0.48, radius * 0.44);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = '#fb7185';
                        ctx.lineWidth = Math.max(2, radius * 0.09);
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.48, -radius * 0.37);
                        ctx.lineTo(-radius * 0.36, -radius * 0.7);
                        ctx.lineTo(-radius * 0.14, -radius * 0.42);
                        ctx.lineTo(radius * 0.04, -radius * 0.76);
                        ctx.lineTo(radius * 0.24, -radius * 0.42);
                        ctx.lineTo(radius * 0.45, -radius * 0.67);
                        ctx.lineTo(radius * 0.5, -radius * 0.34);
                        ctx.stroke();
                        drawEye(-eyeSpacing, eyeY, eyeRadius * 1.2, '#ef4444');
                        drawEye(eyeSpacing, eyeY, eyeRadius * 1.2, '#ef4444');
                        drawMouth(radius * 0.38, radius * 0.4);
                    } else if (enemy.type === 'APOLO') {
                        // Apolo: raios solares, louros dourados e olhos luminosos
                        ctx.strokeStyle = '#fbbf24';
                        ctx.lineWidth = Math.max(2, radius * 0.07);
                        ctx.beginPath();
                        for (let ray = 0; ray < 12; ray++) {
                            const angle = (Math.PI * 2 * ray) / 12;
                            const innerRadius = radius * 0.61;
                            const outerRadius = radius * (ray % 2 === 0 ? 0.9 : 0.78);
                            ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
                            ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
                        }
                        ctx.stroke();
                        ctx.strokeStyle = '#fde68a';
                        ctx.lineWidth = Math.max(2, radius * 0.08);
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.53, -radius * 0.35);
                        ctx.quadraticCurveTo(-radius * 0.32, -radius * 0.62, -radius * 0.08, -radius * 0.38);
                        ctx.moveTo(radius * 0.53, -radius * 0.35);
                        ctx.quadraticCurveTo(radius * 0.32, -radius * 0.62, radius * 0.08, -radius * 0.38);
                        ctx.stroke();
                        drawEye(-eyeSpacing, eyeY, eyeRadius * 1.15, '#d97706');
                        drawEye(eyeSpacing, eyeY, eyeRadius * 1.15, '#d97706');
                        drawMouth(radius * 0.4, radius * 0.4);
                    } else if (enemy.type === 'ATENA') {
                        // Atena: elmo grego, crista, olhos firmes e proteção facial
                        ctx.fillStyle = '#cbd5e1';
                        ctx.beginPath();
                        ctx.moveTo(-radius * 0.62, -radius * 0.24);
                        ctx.lineTo(-radius * 0.52, -radius * 0.64);
                        ctx.lineTo(-radius * 0.28, -radius * 0.48);
                        ctx.quadraticCurveTo(0, -radius * 0.64, radius * 0.28, -radius * 0.48);
                        ctx.lineTo(radius * 0.52, -radius * 0.64);
                        ctx.lineTo(radius * 0.62, -radius * 0.24);
                        ctx.lineTo(radius * 0.44, radius * 0.34);
                        ctx.lineTo(radius * 0.25, radius * 0.48);
                        ctx.lineTo(radius * 0.2, radius * 0.08);
                        ctx.lineTo(-radius * 0.2, radius * 0.08);
                        ctx.lineTo(-radius * 0.25, radius * 0.48);
                        ctx.lineTo(-radius * 0.44, radius * 0.34);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = '#f8fafc';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.fillStyle = '#94a3b8';
                        ctx.beginPath();
                        ctx.moveTo(0, -radius * 0.84);
                        ctx.quadraticCurveTo(radius * 0.36, -radius * 0.58, 0, -radius * 0.4);
                        ctx.quadraticCurveTo(-radius * 0.24, -radius * 0.65, 0, -radius * 0.84);
                        ctx.fill();
                        drawEye(-eyeSpacing, eyeY, eyeRadius, '#1d4ed8');
                        drawEye(eyeSpacing, eyeY, eyeRadius, '#1d4ed8');
                        ctx.strokeStyle = '#334155';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(0, radius * 0.02);
                        ctx.lineTo(0, radius * 0.28);
                        ctx.stroke();
                        drawMouth(radius * 0.3, radius * 0.38);
                    } else {
                        drawEye(-eyeSpacing, eyeY, eyeRadius * 1.1);
                        drawEye(eyeSpacing, eyeY, eyeRadius * 1.1);
                        drawMouth(radius * 0.48, radius * 0.4);
                    }
                } else if (enemy.name === 'Cérbero') {
                    // Três focinhos e olhos para o cão guardião
                    [-0.48, 0, 0.48].forEach((offset, index) => {
                        const headX = radius * offset;
                        const headY = -radius * (index === 1 ? 0.02 : -0.08);
                        ctx.fillStyle = index === 1 ? '#991b1b' : '#b91c1c';
                        ctx.beginPath();
                        ctx.arc(headX, headY, radius * 0.43, 0, Math.PI * 2);
                        ctx.fill();
                        drawEye(headX - radius * 0.13, headY - radius * 0.05, eyeRadius * 0.72, '#facc15');
                        drawEye(headX + radius * 0.13, headY - radius * 0.05, eyeRadius * 0.72, '#facc15');
                        ctx.fillStyle = '#1f0a0a';
                        ctx.beginPath();
                        ctx.ellipse(headX, headY + radius * 0.17, radius * 0.13, radius * 0.09, 0, 0, Math.PI * 2);
                        ctx.fill();
                    });
                } else if (enemy.name === 'Minotauro') {
                    // Chifres curvos, olhos ferozes e focinho
                    ctx.fillStyle = '#f5deb3';
                    ctx.beginPath();
                    ctx.moveTo(-radius * 0.46, -radius * 0.38);
                    ctx.quadraticCurveTo(-radius * 0.95, -radius * 1.02, -radius * 0.9, -radius * 0.18);
                    ctx.lineTo(-radius * 0.52, -radius * 0.04);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(radius * 0.46, -radius * 0.38);
                    ctx.quadraticCurveTo(radius * 0.95, -radius * 1.02, radius * 0.9, -radius * 0.18);
                    ctx.lineTo(radius * 0.52, -radius * 0.04);
                    ctx.closePath();
                    ctx.fill();
                    drawEye(-eyeSpacing, eyeY, eyeRadius, '#7f1d1d');
                    drawEye(eyeSpacing, eyeY, eyeRadius, '#7f1d1d');
                    ctx.fillStyle = '#78350f';
                    ctx.beginPath();
                    ctx.ellipse(0, radius * 0.25, radius * 0.3, radius * 0.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fef3c7';
                    [-1, 1].forEach(side => {
                        ctx.beginPath();
                        ctx.moveTo(side * radius * 0.16, radius * 0.28);
                        ctx.lineTo(side * radius * 0.11, radius * 0.48);
                        ctx.lineTo(side * radius * 0.25, radius * 0.31);
                        ctx.fill();
                    });
                } else if (enemy.name === 'Esqueleto Hoplita') {
                    // Cavidades escuras, nariz triangular e dentes
                    ctx.fillStyle = '#e5e7eb';
                    ctx.beginPath();
                    ctx.arc(0, radius * 0.12, radius * 0.62, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#1f2937';
                    [-eyeSpacing, eyeSpacing].forEach(x => {
                        ctx.beginPath();
                        ctx.ellipse(x, eyeY, eyeRadius * 1.45, eyeRadius * 1.7, 0, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.beginPath();
                    ctx.moveTo(0, radius * 0.02);
                    ctx.lineTo(-radius * 0.12, radius * 0.25);
                    ctx.lineTo(radius * 0.12, radius * 0.25);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(-radius * 0.28, radius * 0.34, radius * 0.56, radius * 0.16);
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 1;
                    for (let tooth = -1; tooth <= 1; tooth++) {
                        ctx.beginPath();
                        ctx.moveTo(tooth * radius * 0.14, radius * 0.34);
                        ctx.lineTo(tooth * radius * 0.14, radius * 0.49);
                        ctx.stroke();
                    }
                } else if (enemy.name === 'Harpia') {
                    // Olhos atentos e bico dourado
                    drawEye(-eyeSpacing, eyeY, eyeRadius * 0.9, '#1e3a8a');
                    drawEye(eyeSpacing, eyeY, eyeRadius * 0.9, '#1e3a8a');
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.moveTo(-radius * 0.2, radius * 0.02);
                    ctx.lineTo(radius * 0.2, radius * 0.02);
                    ctx.lineTo(0, radius * 0.52);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#92400e';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(-radius * 0.15, -radius * 0.4);
                    ctx.lineTo(0, -radius * 0.2);
                    ctx.lineTo(radius * 0.15, -radius * 0.4);
                    ctx.stroke();
                } else if (enemy.name === 'Medusa') {
                    // Serpentes no alto da cabeça e olhar verde
                    ctx.strokeStyle = '#86efac';
                    ctx.lineWidth = Math.max(2, radius * 0.11);
                    [-0.62, -0.2, 0.2, 0.62].forEach((offset, index) => {
                        const snakeX = radius * offset;
                        const snakeHeight = radius * (0.66 + (index % 2) * 0.14);
                        ctx.beginPath();
                        ctx.moveTo(snakeX, -radius * 0.48);
                        ctx.quadraticCurveTo(snakeX + radius * 0.12, -snakeHeight, snakeX + radius * 0.08, -radius * 0.4);
                        ctx.stroke();
                        ctx.fillStyle = '#facc15';
                        ctx.beginPath();
                        ctx.arc(snakeX + radius * 0.08, -radius * 0.4, Math.max(1.2, radius * 0.045), 0, Math.PI * 2);
                        ctx.fill();
                    });
                    drawEye(-eyeSpacing, eyeY, eyeRadius, '#166534');
                    drawEye(eyeSpacing, eyeY, eyeRadius, '#166534');
                    drawMouth(radius * 0.32, radius * 0.38);
                } else if (enemy.name === 'Sátiro') {
                    // Chifres curtos, olhos brincalhões e sorriso
                    ctx.strokeStyle = '#fef3c7';
                    ctx.lineWidth = Math.max(2, radius * 0.13);
                    ctx.beginPath();
                    ctx.moveTo(-radius * 0.32, -radius * 0.42);
                    ctx.quadraticCurveTo(-radius * 0.72, -radius * 0.95, -radius * 0.7, -radius * 0.35);
                    ctx.moveTo(radius * 0.32, -radius * 0.42);
                    ctx.quadraticCurveTo(radius * 0.72, -radius * 0.95, radius * 0.7, -radius * 0.35);
                    ctx.stroke();
                    drawEye(-eyeSpacing, eyeY, eyeRadius * 0.82, '#78350f');
                    drawEye(eyeSpacing, eyeY, eyeRadius * 0.82, '#78350f');
                    drawMouth(radius * 0.44, radius * 0.3);
                } else {
                    drawEye(-eyeSpacing, eyeY, eyeRadius * 1.1, '#7f1d1d');
                    drawEye(eyeSpacing, eyeY, eyeRadius * 1.1, '#7f1d1d');
                    drawMouth(radius * 0.48, radius * 0.4);
                }

                ctx.restore();
            }

            // Desenho do jogo
            // Function: render — desenha cenário, personagem, inimigos e efeitos.
            function render() {
                const currentBiome = BIOMES[currentBiomeIdx];

                // Vibração sincronizada nas duas camadas gráficas
                let shakeX = 0;
                let shakeY = 0;
                ctx.save();
                if (screenShake > 0) {
                    shakeX = (Math.random() - 0.5) * screenShake;
                    shakeY = (Math.random() - 0.5) * screenShake;
                    ctx.translate(shakeX, shakeY);
                }

                // 1. Piso temático do bioma atual
                drawBiomeFloor(currentBiome);
                drawBossArena();

                // 2. Draw Ruins Structures
                if (!activeBossArena) ruinsList.forEach(ruin => {
                    const screenX = ruin.x - camera.x;
                    const screenY = ruin.y - camera.y;
                    const drawMargin = 180 * ruin.scale;

                    // Only draw if visible on canvas
                    if (screenX > -drawMargin && screenX < viewportWidth + drawMargin &&
                        screenY > -drawMargin && screenY < viewportHeight + drawMargin) {
                        
                        ctx.save();
                        ctx.translate(screenX, screenY);
                        ctx.scale(ruin.scale, ruin.scale);

                        const interactionKind = getRuinInteractionKind(ruin);
                        if (interactionKind && !ruin.used) {
                            const glowColor = interactionKind === 'altar' ? '#4ade80' : '#c084fc';
                            const pulse = 0.7 + Math.sin(performance.now() / 300) * 0.15;
                            ctx.globalAlpha = pulse;
                            ctx.fillStyle = glowColor;
                            ctx.shadowColor = glowColor;
                            ctx.shadowBlur = 18;
                            ctx.beginPath();
                            ctx.ellipse(0, 25, 42, 10, 0, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        } else if (ruin.used) {
                            ctx.globalAlpha = 0.55;
                        }
                        ctx.shadowColor = currentBiome.ruinColor;
                        ctx.shadowBlur = ruin.used ? 0 : 10;
                        drawRuinStructure(ruin, currentBiome);
                        ctx.restore();
                    }
                });

                // 3. Draw Loot Items on Ground
                itemsOnGround.forEach(itemObj => {
                    const sx = itemObj.x - camera.x;
                    const sy = itemObj.y - camera.y;

                    ctx.save();
                    ctx.fillStyle = '#67e8f9';
                    ctx.shadowColor = '#06b6d4';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });

                // 4. Draw Fire Aura Passive if active
                if (player.passives.fireAura) {
                    const px = player.x - camera.x;
                    const py = player.y - camera.y;
                    const auraRad = 110 * player.getSkillScale();

                    ctx.save();
                    ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(px, py, auraRad, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }

                // 5. Draw Player (Paladin)
                const px = player.x - camera.x;
                const py = player.y - camera.y;

                ctx.save();
                ctx.translate(px, py);

                // Radiant Armor Glow
                ctx.shadowColor = player.dashTimer > 0 ? '#67e8f9' : '#fef08a';
                ctx.shadowBlur = player.dashTimer > 0 ? 28 : 15;

                // Body / Armor (Bright White & Gold)
                ctx.fillStyle = '#ffffff'; // White armor
                ctx.beginPath();
                ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
                ctx.fill();

                // Gold Trimmings
                ctx.strokeStyle = '#d4af37';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Helmet Visor
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-6, -8, 12, 4);

                // Draw the sword in the direction of the cursor, sweeping through the attack.
                const aimAngle = Math.atan2(mousePos.y - py, mousePos.x - px);
                const attackProgress = player.isAttacking
                    ? 1 - player.attackTimer / 0.25
                    : 0;
                const swingOffset = player.isAttacking
                    ? (attackProgress - 0.5) * 1.4
                    : 0.18;
                const swordScale = (player.passives.giantSword ? 1.25 : 1) * player.getSkillScale();

                ctx.save();
                ctx.rotate((player.isAttacking ? player.attackAngle : aimAngle) + swingOffset);
                ctx.scale(swordScale, swordScale);

                // Gold hilt and crossguard
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#8b5e1a';
                ctx.lineWidth = 7;
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(30, 0);
                ctx.stroke();
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(27, -12, 4, 24);
                ctx.beginPath();
                ctx.arc(10, 0, 4, 0, Math.PI * 2);
                ctx.fill();

                // Silver blade with a bright center edge
                ctx.fillStyle = '#dbeafe';
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(30, -6);
                ctx.lineTo(68, -3);
                ctx.lineTo(78, 0);
                ctx.lineTo(68, 3);
                ctx.lineTo(30, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // Brief slash trail follows the blade through its swing.
                if (player.isAttacking) {
                    const reach = (player.passives.giantSword ? 90 : 65) * player.getSkillScale();
                    ctx.globalAlpha = 0.25 + (1 - attackProgress) * 0.5;
                    ctx.strokeStyle = '#fef08a';
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.arc(0, 0, reach, player.attackAngle - Math.PI / 3, player.attackAngle + Math.PI / 3);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }

                ctx.restore();

                // 6. Draw Enemies & Bosses
                enemies.forEach(e => {
                    const ex = e.x - camera.x;
                    const ey = e.y - camera.y;
                    const spriteMargin = Math.max(e.radius * 3.2, 80) + (e.isBoss ? 36 : 0);
                    if (ex < -spriteMargin || ex > viewportWidth + spriteMargin ||
                        ey < -spriteMargin || ey > viewportHeight + spriteMargin) return;

                    ctx.save();
                    const bossPulse = e.isBoss ? 1 + Math.sin(performance.now() * 0.006 + e.x) * 0.035 : 1;
                    const bossBob = e.isBoss ? Math.sin(performance.now() * 0.004 + e.y) * 2.5 : 0;
                    ctx.translate(ex, ey + bossBob);

                    if (e.isBoss) {
                        ctx.rotate(Math.sin(performance.now() * 0.0015 + e.y) * 0.04);
                        ctx.scale(bossPulse, bossPulse);
                        ctx.shadowColor = e.color;
                        ctx.shadowBlur = 24 + Math.sin(performance.now() * 0.008) * 7;
                    }

                    const pixelArtSprite = e.isBoss
                        ? godPixelArt[e.type]
                        : (e.name === 'Medusa' && medusaPixelArt
                            ? medusaPixelArt
                            : monsterPixelArt[e.name]);
                    const hasPixelArtSprite = Boolean(pixelArtSprite);
                    const isMedusaSprite = e.name === 'Medusa';
                    const spriteWidth = e.radius * (isMedusaSprite ? 4 : 3.2);
                    const spriteHeight = hasPixelArtSprite
                        ? (isMedusaSprite
                            ? e.radius * 3
                            : spriteWidth * pixelArtSprite.height / pixelArtSprite.width)
                        : e.radius * 2;
                    if (hasPixelArtSprite) {
                        if (!e.isBoss) {
                            ctx.shadowColor = e.name === 'Medusa' ? '#22c55e' : e.color;
                            ctx.shadowBlur = 8;
                        }
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(
                            pixelArtSprite,
                            -spriteWidth / 2,
                            -spriteHeight / 2,
                            spriteWidth,
                            spriteHeight
                        );
                        ctx.shadowBlur = 0;
                    } else {
                        // Enemy Body
                        ctx.fillStyle = e.color || '#ef4444';
                        ctx.beginPath();
                        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    if (e.isBoss) {
                        const orbit = performance.now() * 0.0018;
                        ctx.shadowColor = e.color;
                        ctx.shadowBlur = 18;
                        ctx.strokeStyle = e.color;
                        ctx.globalAlpha = 0.7;
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.ellipse(0, 0, e.radius * 1.35, e.radius * 0.58, orbit, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.globalAlpha = 0.9;
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(Math.cos(orbit) * e.radius * 1.35, Math.sin(orbit) * e.radius * 0.58, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                        ctx.shadowBlur = 0;
                    }

                    if (e.chargeWindup > 0) {
                        ctx.strokeStyle = '#facc15';
                        ctx.lineWidth = 3;
                        ctx.shadowColor = '#f97316';
                        ctx.shadowBlur = 14;
                        ctx.beginPath();
                        ctx.arc(0, 0, e.radius + 9 + Math.sin(e.chargeWindup * 20) * 3, 0, Math.PI * 2);
                        ctx.stroke();
                    }

                    // Zeus details
                    if (e.type === 'ZEUS' && !hasPixelArtSprite) {
                        ctx.fillStyle = '#ffffff'; // White Toga / Beard
                        ctx.beginPath();
                        ctx.arc(0, 8, e.radius * 0.7, 0, Math.PI);
                        ctx.fill();

                        ctx.strokeStyle = '#d4af37'; // Laurel Crown
                        ctx.lineWidth = 3;
                        ctx.strokeRect(-12, -20, 24, 6);
                    }

                    if (!hasPixelArtSprite) drawEnemyFace(e);

                    // Enemy Health Bar above head
                    if (!e.isBoss) {
                        ctx.fillStyle = 'rgba(0,0,0,0.6)';
                        const healthBarOffset = hasPixelArtSprite
                            ? spriteHeight / 2 + e.radius * 0.6
                            : e.radius;
                        ctx.fillRect(-15, -healthBarOffset - 10, 30, 4);
                        ctx.fillStyle = '#ef4444';
                        ctx.fillRect(-15, -healthBarOffset - 10, (e.hp / e.maxHp) * 30, 4);
                    }

                    ctx.restore();
                });

                enemyProjectiles.forEach(projectile => {
                    const sx = projectile.x - camera.x;
                    const sy = projectile.y - camera.y;
                    const drawMargin = projectile.radius * 3;
                    if (sx < -drawMargin || sx > viewportWidth + drawMargin ||
                        sy < -drawMargin || sy > viewportHeight + drawMargin) return;
                    ctx.save();
                    const bossProjectile = projectile.type === 'boss_projectile';
                    const pulse = 0.82 + Math.sin(performance.now() * 0.018 + projectile.x) * 0.18;
                    ctx.fillStyle = bossProjectile ? projectile.color : '#a3e635';
                    ctx.shadowColor = bossProjectile ? projectile.color : '#84cc16';
                    ctx.shadowBlur = bossProjectile ? 20 : 14;
                    if (bossProjectile) {
                        const angle = Math.atan2(projectile.vy, projectile.vx);
                        ctx.translate(sx, sy);
                        ctx.rotate(angle);
                        ctx.globalAlpha = 0.55;
                        ctx.beginPath();
                        ctx.ellipse(-projectile.radius * 1.3, 0, projectile.radius * 2.2, projectile.radius * 0.55, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                        if (projectile.kind === 'trident' || projectile.kind === 'spear') {
                            ctx.beginPath();
                            ctx.moveTo(-projectile.radius, -projectile.radius * 0.7);
                            ctx.lineTo(projectile.radius * 1.7, 0);
                            ctx.lineTo(-projectile.radius, projectile.radius * 0.7);
                            ctx.closePath();
                            ctx.fill();
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        } else if (projectile.kind === 'lightning') {
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.moveTo(-projectile.radius, 0);
                            ctx.lineTo(-projectile.radius * 0.2, -projectile.radius * 0.65);
                            ctx.lineTo(projectile.radius * 0.1, projectile.radius * 0.35);
                            ctx.lineTo(projectile.radius, -projectile.radius * 0.2);
                            ctx.stroke();
                        }
                    }
                    ctx.beginPath();
                    ctx.arc(bossProjectile ? 0 : sx, bossProjectile ? 0 : sy, projectile.radius * (bossProjectile ? pulse : 1), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });

                // 7. Draw Projectiles
                projectiles.forEach(p => {
                    const sx = p.x - camera.x;
                    const sy = p.y - camera.y;
                    const drawMargin = p.radius * 2.2;
                    if (sx < -drawMargin || sx > viewportWidth + drawMargin ||
                        sy < -drawMargin || sy > viewportHeight + drawMargin) return;

                    ctx.save();
                    ctx.fillStyle = '#f97316';
                    ctx.shadowColor = '#ea580c';
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });

                // Partículas e efeitos
                particles.forEach(p => {
                    if (p.type === 'burning_area') {
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;
                        const flicker = 0.85 + Math.sin((p.maxLife - p.life) * 18) * 0.15;

                        ctx.save();
                        ctx.globalAlpha = (p.life / p.maxLife) * 0.75;
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
                        ctx.strokeStyle = '#fb923c';
                        ctx.lineWidth = 3 * p.scale;
                        ctx.shadowColor = '#f97316';
                        ctx.shadowBlur = 18 * flicker * p.scale;
                        ctx.beginPath();
                        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    } else if (p.type === 'ice_wave') {
                        const progress = 1 - p.life / p.maxLife;
                        const radius = p.radius * progress;
                        const alpha = p.life / p.maxLife;
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;

                        ctx.save();
                        ctx.globalAlpha = alpha;
                        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
                        ctx.strokeStyle = '#7dd3fc';
                        ctx.lineWidth = 3 * p.scale;
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 16 * p.scale;
                        ctx.beginPath();
                        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    } else if (p.type === 'fire_spark') {
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;

                        ctx.save();
                        ctx.fillStyle = p.color;
                        ctx.shadowColor = '#f97316';
                        ctx.shadowBlur = 12 * p.scale;
                        ctx.beginPath();
                        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else if (p.type === 'fire_pop') {
                        const progress = 1 - p.life / p.maxLife;
                        const radius = p.radius * (0.25 + progress * 0.75);
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;

                        ctx.save();
                        ctx.globalAlpha = p.life / p.maxLife;
                        ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
                        ctx.strokeStyle = '#facc15';
                        ctx.lineWidth = 2 * p.scale;
                        ctx.shadowColor = '#ef4444';
                        ctx.shadowBlur = 12 * p.scale;
                        ctx.beginPath();
                        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    } else if (p.type === 'inferno_wave') {
                        if (p.delay > 0) return;

                        const progress = 1 - p.life / p.maxLife;
                        const radius = p.radius * progress;
                        const alpha = p.life / p.maxLife;
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;

                        ctx.save();
                        ctx.globalAlpha = alpha;
                        ctx.fillStyle = 'rgba(249, 115, 22, 0.14)';
                        ctx.strokeStyle = '#fb923c';
                        ctx.lineWidth = 4 * p.scale;
                        ctx.shadowColor = '#ef4444';
                        ctx.shadowBlur = 18 * p.scale;
                        ctx.beginPath();
                        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    } else if (p.type === 'lightning_beam') {
                        ctx.save();
                        ctx.strokeStyle = p.color;
                        ctx.lineWidth = 4;
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.moveTo(p.x1 - camera.x, p.y1 - camera.y);
                        ctx.lineTo(p.x2 - camera.x, p.y2 - camera.y);
                        ctx.stroke();
                        ctx.restore();
                    } else if (p.type === 'lightning_strike') {
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;
                        ctx.save();
                        ctx.strokeStyle = '#facc15';
                        ctx.lineWidth = 6 * p.scale;
                        ctx.shadowColor = '#fef08a';
                        ctx.shadowBlur = 20;
                        ctx.beginPath();
                        ctx.moveTo(sx + (Math.random() - 0.5) * 40, sy - 400);
                        ctx.lineTo(sx, sy);
                        ctx.stroke();

                        // Impact circle
                        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
                        ctx.beginPath();
                        ctx.arc(sx, sy, 80 * p.scale, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else if (p.type === 'boss_telegraph') {
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;
                        const progress = 1 - p.life / p.maxLife;
                        const pulse = 0.8 + Math.sin(performance.now() * 0.025) * 0.2;
                        const warningRadius = p.attack === 'charge'
                            ? p.radius * (0.9 + progress * 0.45)
                            : p.radius * (0.9 + Math.sin(performance.now() * 0.012) * 0.08);
                        ctx.save();
                        ctx.globalAlpha = 0.45 + pulse * 0.35;
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha *= 0.12;
                        ctx.beginPath();
                        ctx.arc(sx, sy, warningRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 0.45 + pulse * 0.35;
                        ctx.strokeStyle = p.color;
                        ctx.lineWidth = p.attack === 'wave' ? 6 : 4;
                        ctx.setLineDash(p.attack === 'charge' ? [8, 7] : [12, 8]);
                        ctx.lineDashOffset = -performance.now() * 0.035;
                        ctx.beginPath();
                        ctx.arc(sx, sy, warningRadius, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.globalAlpha = 0.8;
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 12px Rajdhani, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(p.attack === 'charge' ? 'INVESTIDA!' : 'DESVIE!', sx, sy - warningRadius - 8);
                        ctx.restore();
                    } else if (p.type === 'boss_blast') {
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;
                        const progress = 1 - p.life / p.maxLife;
                        const isWave = p.attack === 'wave';
                        const currentRadius = isWave ? p.radius * progress : p.radius * (0.45 + progress * 0.75);
                        ctx.save();
                        ctx.globalAlpha = Math.max(0.08, (p.life / p.maxLife) * 0.55);
                        ctx.fillStyle = p.color || '#ef4444';
                        ctx.beginPath();
                        if (isWave) {
                            ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
                            ctx.arc(sx, sy, Math.max(0, currentRadius - 18), 0, Math.PI * 2, true);
                            ctx.fill('evenodd');
                        } else {
                            ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = Math.max(0.2, 1 - progress * 0.75);
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = isWave ? 7 : 3;
                        ctx.beginPath();
                        ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    } else if (p.type === 'boss_teleport') {
                        const sx = p.x - camera.x;
                        const sy = p.y - camera.y;
                        const progress = 1 - p.life / p.maxLife;
                        ctx.save();
                        ctx.globalAlpha = 1 - progress;
                        ctx.strokeStyle = p.color;
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 22;
                        ctx.lineWidth = 5;
                        ctx.beginPath();
                        ctx.arc(sx, sy, p.radius + progress * 60, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        // Standard Particle
                        ctx.save();
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(p.x - camera.x, p.y - camera.y, Math.max(1, p.radius), 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                });

                // 9. Draw Floating Damage Numbers
                floatingTexts.forEach(ft => {
                    ctx.save();
                    ctx.font = `bold ${ft.fontSize}px 'Rajdhani', sans-serif`;
                    ctx.fillStyle = ft.color;
                    ctx.shadowColor = '#000000';
                    ctx.shadowBlur = 4;
                    ctx.fillText(ft.text, ft.x - camera.x, ft.y - camera.y);
                    ctx.restore();
                });

                ctx.restore(); // Restore screen shake transform
                renderPixiFx(shakeX, shakeY);
            }

            // Atualização da interface
            // Function: updateHUD — atualiza as informações da partida na tela.
            function updateHUD() {
                document.getElementById('player-level').textContent = `Nv. ${player.level}`;
                document.getElementById('hp-text').textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
                document.getElementById('hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;

                document.getElementById('xp-text').textContent = `${player.xp} / ${player.xpNeeded}`;
                document.getElementById('xp-bar').style.width = `${(player.xp / player.xpNeeded) * 100}%`;

                document.getElementById('biome-name').textContent = BIOMES[currentBiomeIdx].name;
                document.getElementById('biome-timer').textContent = `${Math.ceil(biomeTimer)}s`;
                const eventHud = document.getElementById('biome-event');
                if (activeBiomeEvent) {
                    const pausedText = activeBossArena ? ' · PAUSADO' : '';
                    eventHud.textContent = `${activeBiomeEvent.name} · ${Math.ceil(activeBiomeEvent.remaining)}s${pausedText}`;
                    eventHud.classList.remove('hidden');
                } else {
                    eventHud.classList.add('hidden');
                }
                const damageBuffStatus = document.getElementById('damage-buff-status');
                if (player.damageBuffTimer > 0) {
                    damageBuffStatus.textContent = `Fúria divina · +30% dano · ${Math.ceil(player.damageBuffTimer)}s`;
                    damageBuffStatus.classList.remove('hidden');
                } else {
                    damageBuffStatus.classList.add('hidden');
                }

                // Ability Cooldown Overlays
                document.getElementById('cd-q').style.height = `${(player.cdQ / player.maxCdQ) * 100}%`;
                document.getElementById('cd-dash').style.height = `${(player.cdDash / player.maxCdDash) * 100}%`;
                document.getElementById('cd-e').style.height = `${(player.cdE / player.maxCdE) * 100}%`;
                document.getElementById('cd-f').style.height = `${(player.cdF / player.maxCdF) * 100}%`;
                document.getElementById('cd-r').style.height = `${(player.cdR / player.maxCdR) * 100}%`;
                document.getElementById('cd-t').style.height = `${(player.cdT / player.maxCdT) * 100}%`;

                // Boss HUD
                if (currentBoss) {
                    document.getElementById('boss-hp-text').textContent = `${Math.ceil(currentBoss.hp)} / ${currentBoss.maxHp}`;
                    document.getElementById('boss-hp-bar').style.width = `${Math.max(0, (currentBoss.hp / currentBoss.maxHp) * 100)}%`;
                }
            }

            // Function: updatePauseMenuUI — atualiza atributos, inventário e recordes.
            function updatePauseMenuUI() {
                document.getElementById('stat-level').textContent = player.level;
                document.getElementById('stat-hp').textContent = player.maxHp;
                document.getElementById('stat-atk').textContent = player.getAttackDamage();
                document.getElementById('stat-scale').textContent = `${player.getSkillScale().toFixed(2)}x`;
                document.getElementById('stat-kills').textContent = totalKills;

                const grid = document.getElementById('inventory-grid');
                grid.innerHTML = '';
                document.getElementById('inventory-count').textContent = `${player.inventory.length} / 12 Itens`;

                player.inventory.forEach(item => {
                    const slot = document.createElement('div');
                    slot.className = 'w-10 h-10 bg-gray-900 border border-amber-500/40 rounded flex items-center justify-center text-amber-300 text-base';
                    slot.title = item.name;
                    slot.innerHTML = `<i class="fa-solid ${item.icon}"></i>`;
                    grid.appendChild(slot);
                });

                renderObjectives('pause-objectives');
                renderRecords('pause-records');
            }

            // Início do jogo
            render();
            requestAnimationFrame(gameLoop);
        });
