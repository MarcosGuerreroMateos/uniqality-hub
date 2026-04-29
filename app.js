const i18n = {
    es: { loading: "// INICIALIZANDO PROTOCOLOS...", auth_title: "ACCESO RESTRINGIDO", login_btn: "VALIDAR" },
    en: { loading: "// INITIALIZING...", auth_title: "RESTRICTED ACCESS", login_btn: "VALIDATE" }
};

let globalMesh3D = null;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let terminalInput = "";
let isTerminalFocused = false;
let scannerState = { isScanning: false, videoStream: null, photos: [] };

document.addEventListener("DOMContentLoaded", function() {
    
    // Splash & Login
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }, 2500);

    const theme = localStorage.getItem('theme') || 'green';
    applyTheme(theme);

    // Reloj
    setInterval(() => {
        const clock = document.getElementById('current-time');
        if(clock) clock.innerText = new Date().toLocaleTimeString();
    }, 1000);

    // Login logic
    document.getElementById('btn-login').onclick = () => {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        setupTerminal();
        init3D(localStorage.getItem('theme') || 'green');
        initScanner();
    };

    // Navegación
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');
            this.classList.add('active');
        };
    });

    // Temas
    document.querySelectorAll('.theme-card').forEach(opt => {
        opt.onclick = function() {
            document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
            this.classList.add('active');
            applyTheme(this.dataset.t);
        };
    });

    // Reset Dashboard
    const btnResetDash = document.getElementById('btn-reset-dashboard');
    if(btnResetDash) {
        btnResetDash.onclick = () => {
            if(confirm("¿Restaurar nodo predeterminado?")) {
                localStorage.removeItem('soc_saved_model');
                init3D(localStorage.getItem('theme') || 'green');
            }
        };
    }

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        if(globalMesh3D && !localStorage.getItem('soc_saved_model')) {
            let hex = t === 'cyan' ? 0x00e5ff : t === 'magenta' ? 0xff00ff : t === 'orange' ? 0xff6600 : 0x00ff99;
            globalMesh3D.children.forEach(c => { if(c.material) c.material.color.setHex(hex); });
        }
    }

    // --- TERMINAL DINÁMICO ---
    function setupTerminal() {
        const log = document.getElementById('terminal-log');
        const box = document.querySelector('.terminal-box');
        const startTime = Date.now();
        if(!log || !box) return;

        box.setAttribute('tabindex', '0');
        box.onclick = () => isTerminalFocused = true;
        box.onblur = () => isTerminalFocused = false;

        document.onkeydown = (e) => {
            if(!isTerminalFocused) return;
            if(e.key === 'Enter') { executeCommand(terminalInput); terminalInput = ""; }
            else if(e.key === 'Backspace') terminalInput = terminalInput.slice(0, -1);
            updateDisplay();
        };
        document.onkeypress = (e) => { if(isTerminalFocused) terminalInput += e.key; updateDisplay(); };

        function updateDisplay() {
            const row = document.querySelector('.terminal-input-row');
            if(row) row.innerHTML = `<span class="prompt">soc@hub:~$</span><span style="color:var(--neon)">${terminalInput}</span><span class="cursor-blink">█</span>`;
        }

        async function executeCommand(cmd) {
            const t = cmd.trim().toLowerCase();
            log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] soc@hub:~$ ${cmd}</div>`;
            if(t === 'clear') { log.innerHTML = ''; return; }
            
            const out = await getOutput(t);
            out.split('\n').forEach(l => {
                log.innerHTML += `<div class="log-line">${l}</div>`;
            });
            log.scrollTop = log.scrollHeight;
        }

        async function getOutput(cmd) {
            switch(cmd) {
                case 'help': return "Comandos: status, devices, network, history, uptime, clear";
                case 'status': 
                    const gl = !!document.createElement('canvas').getContext('webgl');
                    return `Sistema: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'}\nWebGL: ${gl ? 'OK' : 'FAIL'}\nPlataforma: ${navigator.platform}`;
                case 'devices':
                    const devs = await navigator.mediaDevices.enumerateDevices();
                    return devs.map(d => `• [${d.kind.toUpperCase()}] ${d.label || 'Accesorio'}`).join('\n');
                case 'network':
                    const n = navigator.connection;
                    return `Tipo: ${n ? n.effectiveType : 'WIFI'}\nBajada: ${n ? n.downlink + 'Mbps' : '300Mbps'}`;
                case 'history':
                    return localStorage.getItem('soc_saved_model') ? "✓ Modelo IA detectado en caché." : "No hay modelos guardados.";
                case 'uptime':
                    const s = Math.floor((Date.now() - startTime)/1000);
                    return `Activo: ${Math.floor(s/60)}min ${s%60}seg`;
                default: return `Comando no válido. Escriba 'help'`;
            }
        }
    }

    // --- ESCÁNER CON API HUGGING FACE ---
    function initScanner() {
        const btnStart = document.getElementById('btn-start-scan');
        const btnTake = document.getElementById('btn-take-photo');
        btnStart.onclick = async () => {
            scannerState.photos = [];
            showScannerState('perm');
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                scannerState.videoStream = s;
                document.getElementById('scan-video').srcObject = s;
                showScannerState('scanning');
            } catch(e) { alert("Error cámara"); showScannerState('idle'); }
        };
        btnTake.onclick = () => {
            if(scannerState.photos.length >= 4) return;
            const v = document.getElementById('scan-video');
            const c = document.getElementById('scan-canvas');
            const ctx = c.getContext('2d');
            c.width = v.videoWidth; c.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            scannerState.photos.push(c.toDataURL('image/jpeg', 0.5));
            updateScanUI();
            if(scannerState.photos.length === 4) callAI();
        };
    }

    async function callAI() {
        const TOKEN = "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";
        showScannerState('processing');
        const proc = document.getElementById('proc-step');
        const fill = document.getElementById('proc-fill');
        
        try {
            proc.innerText = "Enviando a Hugging Face..."; fill.style.width = "30%";
            const res = await fetch("https://stabilityai-triposr.hf.space/run/predict", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}` },
                body: JSON.stringify({ data: [scannerState.photos[0], true, 85] })
            });
            if(!res.ok) throw new Error("Servidor lleno");
            fill.style.width = "70%";
            const d = await res.json();
            const url = d.data[0].url || d.data[0].data;
            localStorage.setItem('soc_saved_model', url);
            init3D(localStorage.getItem('theme'));
            showScannerState('viewer');
            loadRealModel(url);
        } catch(e) {
            proc.innerText = "ERROR SERVIDOR. REINTENTAR.";
            setTimeout(() => showScannerState('idle'), 3000);
        }
        scannerState.videoStream.getTracks().forEach(t => t.stop());
    }

    function loadRealModel(url) {
        const v = document.getElementById('pano-viewer');
        v.innerHTML = '';
        const s = new THREE.Scene(); s.background = new THREE.Color(0x05070a);
        const cam = new THREE.PerspectiveCamera(60, v.clientWidth/v.clientHeight, 0.1, 1000);
        const ren = new THREE.WebGLRenderer({ antialias: true });
        ren.setSize(v.clientWidth, v.clientHeight); v.appendChild(ren.domElement);
        s.add(new THREE.AmbientLight(0xffffff, 0.8));
        const grp = new THREE.Group(); s.add(grp);
        new THREE.GLTFLoader().load(url, (g) => {
            const m = g.scene;
            const box = new THREE.Box3().setFromObject(m);
            const size = box.getSize(new THREE.Vector3()).length();
            m.scale.set(5/size, 5/size, 5/size);
            grp.add(m);
        });
        cam.position.z = 8;
        const anim = () => { requestAnimationFrame(anim); grp.rotation.y += 0.005; ren.render(s, cam); };
        anim();
    }

    function init3D(t) {
        const v = document.getElementById('canvas-3d'); v.innerHTML = '';
        const s = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(75, v.clientWidth/v.clientHeight, 0.1, 1000);
        const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        ren.setSize(v.clientWidth, v.clientHeight); v.appendChild(ren.domElement);
        globalMesh3D = new THREE.Group(); s.add(globalMesh3D); cam.position.z = 3.5;
        const saved = localStorage.getItem('soc_saved_model');
        if(saved) {
            document.getElementById('btn-reset-dashboard').classList.remove('hidden');
            s.add(new THREE.AmbientLight(0xffffff, 1));
            new THREE.GLTFLoader().load(saved, (g) => {
                const m = g.scene;
                const b = new THREE.Box3().setFromObject(m);
                m.scale.set(2.5/b.getSize(new THREE.Vector3()).length(), 2.5/b.getSize(new THREE.Vector3()).length(), 2.5/b.getSize(new THREE.Vector3()).length());
                globalMesh3D.add(m);
            });
        } else {
            document.getElementById('btn-reset-dashboard').classList.add('hidden');
            let hex = t === 'cyan' ? 0x00e5ff : t === 'magenta' ? 0xff00ff : t === 'orange' ? 0xff6600 : 0x00ff99;
            const mat = new THREE.MeshBasicMaterial({ color: hex, wireframe: true });
            const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), mat);
            box.position.y = -0.5; globalMesh3D.add(box);
        }
        const anim = () => { requestAnimationFrame(anim); globalMesh3D.rotation.y += 0.01; ren.render(s, cam); };
        anim();
    }

    function showScannerState(s) {
        ['idle', 'perm', 'scanning', 'processing', 'viewer'].forEach(x => document.getElementById(`scanner-${x}`).classList.add('hidden'));
        document.getElementById(`scanner-${s}`).classList.remove('hidden');
    }

    function updateScanUI() {
        const n = scannerState.photos.length;
        document.getElementById('capture-instruction').innerText = n < 4 ? `FOTO ${n+1}/4` : "COMPLETO";
        if(n > 0) {
            const slot = document.getElementById(`slot-${n}`);
            slot.classList.add('filled'); slot.innerHTML = `<img src="${scannerState.photos[n-1]}">`;
        }
    }
});
