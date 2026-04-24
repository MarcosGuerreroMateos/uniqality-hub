const i18n = {
    es: { auth_title: "ACCESO RESTRINGIDO", status_ok: "SISTEMA_OK", settings: "AJUSTES", lang: "IDIOMA" },
    en: { auth_title: "RESTRICTED ACCESS", status_ok: "SYSTEM_GO", settings: "SETTINGS", lang: "LANGUAGE" }
};

const app = {
    lang: localStorage.getItem('lang') || 'es',
    theme: localStorage.getItem('theme') || 'green',
    scene3DInitialized: false,

    init() {
        console.log("Iniciando Uniqality OS - SOC Professional...");
        this.runSplash();
        this.bindEvents();
        this.startClock();
        this.setTheme(this.theme);
        this.changeLanguage(this.lang);
        
        // Pone el selector de idioma en el valor correcto
        const langToggle = document.getElementById('lang-toggle');
        if(langToggle) langToggle.value = this.lang;
    },

    runSplash() {
        const bar = document.querySelector('.progress');
        let width = 0;
        
        // Animación de carga simulada
        const interval = setInterval(() => {
            width += Math.random() * 12;
            if(width > 100) width = 100;
            
            if (bar) bar.style.width = width + '%';

            if(width >= 100) {
                clearInterval(interval);
                // Pequeño retraso para que se vea el 100%
                setTimeout(() => this.showLogin(), 600);
            }
        }, 180);

        // SEGURIDAD: Si por alguna razón la animación falla, forzamos el login a los 6s
        setTimeout(() => this.showLogin(), 6000);
    },

    showLogin() {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if(splash) splash.classList.add('hidden');
        if(login) login.classList.remove('hidden');
    },

    bindEvents() {
        // Botón Login
        const btnLogin = document.getElementById('btn-login');
        if(btnLogin) {
            btnLogin.addEventListener('click', () => this.login());
        }
        
        // Permitir login pulsando ENTER en el campo contraseña
        const passInput = document.getElementById('password');
        if(passInput) {
            passInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
        }

        // Navegación de pestañas
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab, btn));
        });

        // Cambio de idioma y tema en ajustes
        const langToggle = document.getElementById('lang-toggle');
        if(langToggle) {
            langToggle.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }

        document.querySelectorAll('.theme-opt').forEach(opt => {
            opt.addEventListener('click', () => this.setTheme(opt.dataset.t));
        });

        // Botón Desconectar
        const btnLogout = document.getElementById('btn-logout');
        if(btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.addLog("[SYS] Cerrando sesión...", "warn");
                setTimeout(() => location.reload(), 800);
            });
        }
    },

    login() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        // Entra con cualquier cosa que no esté vacía (para la demo)
        if(u !== "" && p !== "") {
            this.addLog(`[AUTH] Agente ${u} validado. Iniciando interfaz...`, "ok");
            
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            
            // Inicializar datos dinámicos solo al entrar
            if(!this.scene3DInitialized) {
                this.init3D();
                this.scene3DInitialized = true;
            }
            this.loadLogs();
            this.loadEvents();
        } else {
            const errorMsg = document.getElementById('login-error');
            if(errorMsg) {
                errorMsg.classList.remove('hidden');
                // Ocultar error tras 3 segundos
                setTimeout(() => errorMsg.classList.add('hidden'), 3000);
            }
        }
    },

    switchTab(tabId, btn) {
        // Ocultar todas las pestañas
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        // Quitar activo de todos los botones de menú
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        
        // Mostrar pestaña seleccionada
        const targetTab = document.getElementById(`tab-${tabId}`);
        if(targetTab) targetTab.classList.add('active');
        // Activar botón del menú
        if(btn) btn.classList.add('active');
        
        this.addLog(`[NAV] Accediendo a módulo: ${tabId.toUpperCase()}`);
    },

    setTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        // Actualizar visualmente los botones de tema
        document.querySelectorAll('.theme-opt').forEach(opt => {
            opt.classList.remove('active');
            if(opt.dataset.t === t) opt.classList.add('active');
        });
        // Si el motor 3D está cargado, cambiar el color del objeto
        if(this.mesh3D) {
            let color;
            switch(t) {
                case 'cyan': color = 0x00e5ff; break;
                case 'magenta': color = 0xff00ff; break;
                default: color = 0x00ff99; // green
            }
            this.mesh3D.material.color.setHex(color);
        }
    },

    changeLanguage(langCode) {
        this.lang = langCode;
        localStorage.setItem('lang', langCode);
        
        // Buscar y traducir todos los elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if(i18n[langCode] && i18n[langCode][key]) el.innerText = i18n[langCode][key];
        });
    },

    startClock() {
        const clockEl = document.getElementById('current-time');
        if(clockEl) {
            setInterval(() => {
                clockEl.innerText = new Date().toLocaleTimeString();
            }, 1000);
        }
    },

    init3D() {
        const container = document.getElementById('canvas-3d');
        // Si Three.js no se cargó, salimos
        if(!container || typeof THREE === 'undefined') {
            console.error("Three.js no detectado.");
            container.innerHTML = "<div style='color:red; padding:20px'>Fallo al cargar motor 3D</div>";
            return;
        }

        console.log("Inicializando motor 3D TorusKnot...");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Objeto TorusKnot más complejo y estético
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        
        // Color inicial basado en el tema
        let initialColor = 0x00ff99; // green default
        if(this.theme === 'cyan') initialColor = 0x00e5ff;
        if(this.theme === 'magenta') initialColor = 0xff00ff;

        const material = new THREE.MeshBasicMaterial({ color: initialColor, wireframe: true });
        this.mesh3D = new THREE.Mesh(geometry, material);
        scene.add(this.mesh3D);
        camera.position.z = 4;

        // Bucle de animación
        const animate = () => {
            requestAnimationFrame(animate);
            this.mesh3D.rotation.x += 0.008;
            this.mesh3D.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        // Soporte para redimensionar ventana
        window.addEventListener('resize', () => {
            if(container.clientWidth > 0) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    },

    loadLogs() {
        const log = document.getElementById('terminal-log');
        if(!log) return;
        log.innerHTML = ""; // Limpiar
        const lines = [
            {t: "BOOT", m: "Iniciando Uniqality SOC OS v3.1..."},
            {t: "SYS", m: "NET_PROTOCOLS: OK"},
            {t: "SYS", m: "FIREWALL_RULES: LOADED"},
            {t: "SYS", m: "ESTABLISHING VPN UNIQALITY_HUB..."},
            {t: "SYS", m: "ENCRYPTION: AES-256 ACTIVE"},
            {t: "OK", m: "CONEXIÓN ESTABLECIDA CON SERVIDOR DE CORREO"},
            {t: "SYS", m: "CÁMARAS DE VIGILANCIA: ONLINE (3/4)"},
            {t: "WARN", m: "CAM_04: SEÑAL PERDIDA", type: 'warn'},
            {t: "OK", m: "SISTEMA DE EVENTOS INICIADO."},
            {t: "SYS", m: "ESPERANDO ÓRDENES DEL AGENTE..."}
        ];
        lines.forEach((l, i) => {
            setTimeout(() => {
                let typeClass = l.type || '';
                log.innerHTML += `<div class="log-line ${typeClass}">[${l.t}] ${l.m}</div>`;
                log.scrollTop = log.scrollHeight; // Auto-scroll
            }, i * 350);
        });
    },

    loadEvents() {
        const feed = document.getElementById('event-feed');
        if(!feed) return;
        feed.innerHTML = ""; // Limpiar antes de cargar
        const evs = [
            { t: "AUTH_SUCCESS", m: "Acceso Agente 01 SOC", s: "ok" },
            { t: "DNS_CHECK", m: "Registros SPF/DKIM uniqality.com verificados", s: "ok" },
            { t: "MAIL_SENT", m: "Firma corporativa aplicada a mguerrero@", s: "ok" },
            { t: "CAM_LOSS", m: "Fallo de señal en CAM_04 (Parking)", s: "error" },
            { t: "NET_SCAN", m: "Escaneo de puertos detectado (bloqueado IP extern)", s: "warning" },
            { t: "DB_SYNC", m: "Sincronización MariaDB identities completada", s: "ok" }
        ];
        evs.forEach(e => {
            let severityClass = e.s === 'error' ? 'error' : (e.s === 'warning' ? 'warning' : '');
            feed.innerHTML += `
                <div class="event-card ${severityClass}" style="padding:12px; margin-bottom:10px; border-left:3px solid">
                    <strong style="text-transform:uppercase">${e.t}</strong><br>
                    <span style="font-size:12px; color:#aaa">${e.m}</span>
                </div>`;
        });
    },

    addLog(text, type = '') {
        const out = document.getElementById('terminal-output'); // Ojo, el ID en html es terminal-log
        const log = document.getElementById('terminal-log');
        if(!log) return;
        
        let typeClass = '';
        if(type === 'warn') typeClass = 'warn';
        if(type === 'error') typeClass = 'err';
        if(type === 'sys') typeClass = 'sys';
        if(type === 'ok') typeClass = '';

        log.innerHTML += `<div class="log-line ${typeClass}">> ${text}</div>`;
        log.scrollTop = log.scrollHeight;
    }
};

// Arrancar cuando la ventana esté lista
window.onload = () => app.init();
