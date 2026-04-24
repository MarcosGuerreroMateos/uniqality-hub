// DICCIONARIO COMPLETO
const i18n = {
    es: { 
        loading: "// INICIALIZANDO PROTOCOLOS SOC...",
        auth_title: "ACCESO RESTRINGIDO", 
        auth_sub: "// IDENTIFICACIÓN DE AGENTE",
        login_btn: "VALIDAR CREDENCIALES",
        login_err: "ERROR: CREDENCIALES NO VÁLIDAS",
        sys_active: "SISTEMA_ACTIVO",
        recent_events: "EVENTOS_RECIENTES",
        settings: "CONFIGURACIÓN", 
        lang: "IDIOMA",
        theme: "TEMA DE NEÓN",
        logout: "DESCONECTAR"
    },
    en: { 
        loading: "// INITIALIZING SOC PROTOCOLS...",
        auth_title: "RESTRICTED ACCESS", 
        auth_sub: "// AGENT IDENTIFICATION REQUIRED",
        login_btn: "VALIDATE CREDENTIALS",
        login_err: "ERROR: INVALID CREDENTIALS",
        sys_active: "SYSTEM_ACTIVE",
        recent_events: "RECENT EVENTS",
        settings: "SYSTEM SETTINGS", 
        lang: "LANGUAGE",
        theme: "NEON THEME",
        logout: "DISCONNECT"
    }
};

let globalMesh3D = null; // Guardamos el entorno 3D completo
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener("DOMContentLoaded", function() {
    
    // CARGA VISUAL A LOS 3 SEGS
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if(splash) splash.classList.add('hidden');
        if(login) login.classList.remove('hidden');
    }, 3000);

    // CONFIG INICIAL
    const theme = localStorage.getItem('theme') || 'green';
    const lang = localStorage.getItem('lang') || 'es';
    
    applyTheme(theme);
    applyLanguage(lang);

    const langSelect = document.getElementById('lang-toggle');
    if(langSelect) langSelect.value = lang;

    // RELOJ
    setInterval(() => {
        const clock = document.getElementById('current-time');
        if(clock) clock.innerText = new Date().toLocaleTimeString();
    }, 1000);

    // LOGIN
    const btnLogin = document.getElementById('btn-login');
    if(btnLogin) {
        btnLogin.onclick = function() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            if(u !== "" && p !== "") {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                
                loadLogs();
                loadEvents();
                setTimeout(() => init3D(localStorage.getItem('theme') || 'green'), 500);
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        };
    }

    // TABS NAVEGACIÓN
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');
            this.classList.add('active');
        };
    });

    // CAMBIAR IDIOMA EN VIVO
    if(langSelect) {
        langSelect.onchange = function(e) {
            applyLanguage(e.target.value);
        };
    }

    // CAMBIAR COLOR EN VIVO
    document.querySelectorAll('.theme-opt').forEach(opt => {
        opt.onclick = function() {
            applyTheme(this.dataset.t);
        };
    });

    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = () => location.reload();

    // --- FUNCIONES DE SOPORTE ---
    
    function applyLanguage(l) {
        localStorage.setItem('lang', l);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if(i18n[l] && i18n[l][key]) el.innerText = i18n[l][key];
        });
    }

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        
        // Si el entorno 3D está cargado, cambiamos el color a las líneas
        if(globalMesh3D) {
            let hexColor = 0x00ff99; // verde
            if(t === 'cyan') hexColor = 0x00e5ff;
            if(t === 'magenta') hexColor = 0xff00ff;
            
            globalMesh3D.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material.color.setHex(hexColor);
                } else if (child.children) {
                    // Para grupos como las farolas
                    child.children.forEach(sub => {
                        if (sub.material && sub.material.color) { sub.material.color.setHex(hexColor); }
                    });
                }
            });
        }
    }

    function loadLogs() {
        const log = document.getElementById('terminal-log');
        if(!log) return;
        const lines = ["BOOT_OS...", "NET_PROTOCOLS: OK", "ESTABLISHING VPN...", "PERIMETER SHIELD: ACTIVE", "CAMS ONLINE: 4/4", "SYSTEM READY."];
        lines.forEach((line, i) => {
            setTimeout(() => {
                log.innerHTML += `<div class="log-line sys">[${new Date().toLocaleTimeString()}] ${line}</div>`;
            }, i * 400);
        });
    }

    function loadEvents() {
        const feed = document.getElementById('event-feed');
        if(!feed) return;
        feed.innerHTML = `<div class="event-card" style="border-left: 3px solid var(--neon); padding: 10px; margin-bottom: 10px; background: rgba(255,255,255,0.05);"><strong>AUTH_OK</strong><br><span style="font-size:12px;color:#aaa">Acceso concedido</span></div>`;
    }

    function init3D(currentTheme) {
        const container = document.getElementById('canvas-3d');
        if(!container || typeof THREE === 'undefined') return;
        
        container.innerHTML = ''; 

        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);
            
            let hexColor = 0x00ff99;
            if(currentTheme === 'cyan') hexColor = 0x00e5ff;
            if(currentTheme === 'magenta') hexColor = 0xff00ff;
            
            const material = new THREE.MeshBasicMaterial({ color: hexColor, wireframe: true });
            const cameraMaterial = new THREE.MeshBasicMaterial({ color: 0xff3366, wireframe: false }); // Rojo para las cámaras
            
            // --- CONSTRUCCIÓN DEL ENTORNO FAMILIAR 3D ---
            globalMesh3D = new THREE.Group();

            // 1. Base de la casa principal
            const houseBaseGeo = new THREE.BoxGeometry(2, 1.3, 1.5);
            const houseBase = new THREE.Mesh(houseBaseGeo, material);
            houseBase.position.y = -0.65;
            globalMesh3D.add(houseBase);

            // 2. Porche lateral
            const porchGeo = new THREE.BoxGeometry(0.8, 0.8, 1);
            const porch = new THREE.Mesh(porchGeo, material);
            porch.position.set(1.4, -0.9, 0.25);
            globalMesh3D.add(porch);

            // 3. Techo principal (Pirámide)
            const roofGeo = new THREE.ConeGeometry(1.6, 1.2, 4);
            const roof = new THREE.Mesh(roofGeo, material);
            roof.position.y = 0.6;
            roof.rotation.y = Math.PI / 4; 
            globalMesh3D.add(roof);

            // 4. Puerta y ventanas (pequeños cubos incrustados)
            const winGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
            const doorGeo = new THREE.BoxGeometry(0.4, 0.7, 0.1);
            
            const createWin = (x, y, z) => {
                const win = new THREE.Mesh(winGeo, material);
                win.
