// DICCIONARIO COMPLETO
const i18n = {
    es: { 
        loading: "// INICIALIZANDO PROTOCOLOS SOC...",
        auth_title: "ACCESO RESTRINGIDO", 
        auth_sub: "// IDENTIFICACIÓN DE AGENTE SOC",
        login_btn: "VALIDAR CREDENCIALES",
        login_err: "ERROR: CREDENCIALES NO VÁLIDAS",
        sys_active: "● SISTEMA_ACTIVO",
        recent_events: "EVENTOS_RECIENTES",
        panel: "PANEL_CONTROL",
        cameras: "VIGILANCIA_CÁMARAS",
        terminal: "TERMINAL_SOC",
        settings: "CONFIGURACIÓN", 
        lang_system: "IDIOMA DEL SISTEMA",
        language: "LANGUAGE",
        lang_desc: "Interfaz del panel SOC",
        theme: "TEMA DE NEÓN",
        green_theme: "VERDE",
        cyan_theme: "CIAN",
        magenta_theme: "MAGENTA",
        orange_theme: "NARANJA",
        session: "SESIÓN ACTIVA",
        agent: "AGENTE",
        level: "NIVEL",
        uptime: "UPTIME",
        logout: "DESCONECTAR SESIÓN",
        nav_panel: "Panel",
        nav_cameras: "Cámaras",
        nav_terminal: "Terminal",
        nav_settings: "Ajustes",
        signal_lost: "SEÑAL_PERDIDA"
    },
    en: { 
        loading: "// INITIALIZING SOC PROTOCOLS...",
        auth_title: "RESTRICTED ACCESS", 
        auth_sub: "// AGENT IDENTIFICATION REQUIRED",
        login_btn: "VALIDATE CREDENTIALS",
        login_err: "ERROR: INVALID CREDENTIALS",
        sys_active: "● SYSTEM_ACTIVE",
        recent_events: "RECENT EVENTS",
        panel: "CONTROL_PANEL",
        cameras: "CAMERA_SURVEILLANCE",
        terminal: "TERMINAL_SOC",
        settings: "SYSTEM SETTINGS", 
        lang_system: "SYSTEM LANGUAGE",
        language: "LANGUAGE",
        lang_desc: "SOC panel interface",
        theme: "NEON THEME",
        green_theme: "GREEN",
        cyan_theme: "CYAN",
        magenta_theme: "MAGENTA",
        orange_theme: "ORANGE",
        session: "ACTIVE SESSION",
        agent: "AGENT",
        level: "LEVEL",
        uptime: "UPTIME",
        logout: "DISCONNECT SESSION",
        nav_panel: "Panel",
        nav_cameras: "Cameras",
        nav_terminal: "Terminal",
        nav_settings: "Settings",
        signal_lost: "SIGNAL_LOST"
    }
};

let globalMesh3D = null; // Guardamos la casa 3D en memoria
let isDragging = false;  // Variable para saber si estamos arrastrando la casa
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

    // CAMBIAR COLOR EN VIVO - CORREGIDO: Ahora busca .theme-card en lugar de .theme-opt
    document.querySelectorAll('.theme-card').forEach(opt => {
        opt.onclick = function() {
            // Remover clase active de todos
            document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
            // Añadir clase active al seleccionado
            this.classList.add('active');
            applyTheme(this.dataset.t);
        };
    });

    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = () => location.reload();

    // --- FUNCIONES DE SOPORTE ---
    
    function applyLanguage(l) {
        localStorage.setItem('lang', l);
        document.documentElement.setAttribute('lang', l);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if(i18n[l] && i18n[l][key]) el.innerText = i18n[l][key];
        });
    }

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        
        // Si la casa 3D está cargada, le cambiamos el color instantáneamente a sus partes
        if(globalMesh3D) {
            let hexColor = 0x00ff99; // verde
            if(t === 'cyan') hexColor = 0x00e5ff;
            if(t === 'magenta') hexColor = 0xff00ff;
            if(t === 'orange') hexColor = 0xff6600; // CORREGIDO: Añadido color orange
            
            globalMesh3D.children.forEach(child => {
                child.material.color.setHex(hexColor);
            });
        }
    }

    function loadLogs() {
        const log = document.getElementById('terminal-log');
        if(!log) return;
        const lines = ["BOOT_OS...", "NET_PROTOCOLS: OK", "ESTABLISHING VPN...", "PERIMETER SHIELD: ACTIVE", "SYSTEM READY."];
        lines.forEach((line, i) => {
            setTimeout(() => {
                log.innerHTML += `<div class="log-line sys">[${new Date().toLocaleTimeString()}] ${line}</div>`;
            }, i * 400);
        });
    }

    function loadEvents() {
        const feed = document.getElementById('event-feed');
        if(!feed) return;
        feed.innerHTML = `<div class="event-card" style="border-left: 3px solid var(--neon); padding: 10px; margin-bottom: 10px; background: rgba(255,255,255,0.05);"><strong>AUTH_OK</strong><br><small>Acceso de agente validado</small><br><span style="font-size:9px; color: var(--muted);">hace 2 min</span></div>`;
    }

    function init3D(currentTheme) {
        const container = document.getElementById('canvas-3d');
        if(!container || typeof THREE === 'undefined') return;
        
        // Limpiamos por si se ejecuta dos veces
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
            if(currentTheme === 'orange') hexColor = 0xff6600; // CORREGIDO: Añadido color orange
            
            const material = new THREE.MeshBasicMaterial({ color: hexColor, wireframe: true });
            
            // --- CONSTRUCCIÓN DE LA CASA 3D ---
            globalMesh3D = new THREE.Group();

            // 1. Base de la casa (Cubo)
            const baseGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
            const base = new THREE.Mesh(baseGeo, material);
            base.position.y = -0.6; // Bajamos la base un poco

            // 2. Techo de la casa (Pirámide)
            const roofGeo = new THREE.ConeGeometry(1.2, 1, 4);
            const roof = new THREE.Mesh(roofGeo, material);
            roof.position.y = 0.5; // Subimos el techo
            roof.rotation.y = Math.PI / 4; // Giramos 45º para alinear las esquinas con la base

            // Juntamos las piezas
            globalMesh3D.add(base);
            globalMesh3D.add(roof);
            
            scene.add(globalMesh3D);
            camera.position.z = 3.5;
            camera.position.y = 0.5; // Miramos la casa un poco desde arriba
            
            // --- LÓGICA DE INTERACCIÓN (ROTACIÓN MANUAL) ---
            
            // Ratón (PC)
            renderer.domElement.addEventListener('mousedown', (e) => { isDragging = true; });
            renderer.domElement.addEventListener('mousemove', (e) => {
                if (isDragging && globalMesh3D) {
                    const deltaX = e.offsetX - previousMousePosition.x;
                    const deltaY = e.offsetY - previousMousePosition.y;
                    globalMesh3D.rotation.y += deltaX * 0.01;
                    globalMesh3D.rotation.x += deltaY * 0.01;
                }
                previousMousePosition = { x: e.offsetX, y: e.offsetY };
            });
            window.addEventListener('mouseup', () => { isDragging = false; });

            // Táctil (Móvil)
            renderer.domElement.addEventListener('touchstart', (e) => {
                isDragging = true;
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            });
            renderer.domElement.addEventListener('touchmove', (e) => {
                if (isDragging && globalMesh3D) {
                    const deltaX = e.touches[0].clientX - previousMousePosition.x;
                    const deltaY = e.touches[0].clientY - previousMousePosition.y;
                    globalMesh3D.rotation.y += deltaX * 0.01;
                    globalMesh3D.rotation.x += deltaY * 0.01;
                }
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            });
            window.addEventListener('touchend', () => { isDragging = false; });

            // Animación continua suave si no estamos arrastrando
            const animate = () => {
                requestAnimationFrame(animate);
                if(globalMesh3D && !isDragging) {
                    globalMesh3D.rotation.y += 0.005; // Gira lentamente sola
                }
                renderer.render(scene, camera);
            };
            animate();

        } catch(e) { console.log("3D Falló silenciosamente"); }
    }
});
