const i18n = {
    es: { auth_title: "ACCESO RESTRINGIDO", status_ok: "SISTEMA_OK", settings: "AJUSTES", lang: "IDIOMA" },
    en: { auth_title: "RESTRICTED ACCESS", status_ok: "SYSTEM_GO", settings: "SETTINGS", lang: "LANGUAGE" }
};

// ESPERAMOS A QUE EL NAVEGADOR LEA EL HTML
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. CARGA BLINDADA (A los 3 segundos MUESTRA EL LOGIN SÍ O SÍ)
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if(splash) splash.classList.add('hidden');
        if(login) login.classList.remove('hidden');
    }, 3000); // <-- 3 segundos clavados.

    // 2. CONFIGURACIÓN INICIAL
    const theme = localStorage.getItem('theme') || 'green';
    const lang = localStorage.getItem('lang') || 'es';
    
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if(i18n[lang][el.dataset.i18n]) el.innerText = i18n[lang][el.dataset.i18n];
    });

    const langSelect = document.getElementById('lang-toggle');
    if(langSelect) langSelect.value = lang;

    // 3. RELOJ
    setInterval(() => {
        const clock = document.getElementById('current-time');
        if(clock) clock.innerText = new Date().toLocaleTimeString();
    }, 1000);

    // 4. EVENTOS DE BOTONES
    const btnLogin = document.getElementById('btn-login');
    if(btnLogin) {
        btnLogin.onclick = function() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            if(u !== "" && p !== "") {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                
                // Disparamos las funciones internas una vez logueados
                loadLogs();
                loadEvents();
                setTimeout(() => init3D(theme), 500);
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        };
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');
            this.classList.add('active');
        };
    });

    if(langSelect) {
        langSelect.onchange = function(e) {
            localStorage.setItem('lang', e.target.value);
            location.reload(); // Recarga simple para aplicar idioma
        };
    }

    document.querySelectorAll('.theme-opt').forEach(opt => {
        opt.onclick = function() {
            const t = this.dataset.t;
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem('theme', t);
            // El 3D no lo actualizamos al vuelo para no romperlo, se aplica al recargar
        };
    });

    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = () => location.reload();

    // 5. FUNCIONES SECUNDARIAS
    function loadLogs() {
        const log = document.getElementById('terminal-log');
        if(!log) return;
        const lines = ["BOOT_OS...", "NET_PROTOCOLS: OK", "ESTABLISHING VPN...", "SYSTEM READY."];
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
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);
            
            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            let hexColor = 0x00ff99;
            if(currentTheme === 'cyan') hexColor = 0x00e5ff;
            if(currentTheme === 'magenta') hexColor = 0xff00ff;
            
            const material = new THREE.MeshBasicMaterial({ color: hexColor, wireframe: true });
            const obj = new THREE.Mesh(geometry, material);
            scene.add(obj);
            camera.position.z = 4;
            
            const animate = () => {
                requestAnimationFrame(animate);
                obj.rotation.x += 0.01;
                obj.rotation.y += 0.01;
                renderer.render(scene, camera);
            };
            animate();
        } catch(e) { console.log("3D Falló silenciosamente"); }
    }
});const i18n = {
    es: { auth_title: "ACCESO RESTRINGIDO", status_ok: "SISTEMA_OK", settings: "AJUSTES", lang: "IDIOMA" },
    en: { auth_title: "RESTRICTED ACCESS", status_ok: "SYSTEM_GO", settings: "SETTINGS", lang: "LANGUAGE" }
};

const app = {
    init() {
        console.log("Iniciando...");
        this.runSplash();
        this.bindEvents();
        this.startClock();
    },

    runSplash() {
        const bar = document.querySelector('.progress');
        let width = 0;
        
        // Animación de la barra
        const interval = setInterval(() => {
            width += 5;
            if (bar) bar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
                this.showLogin();
            }
        }, 50);

        // SEGURO DE VIDA: A los 3 segundos, entramos sí o sí, pase lo que pase
        setTimeout(() => this.showLogin(), 3000);
    },

    showLogin() {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        
        if(splash) splash.style.display = 'none';
        if(login) {
            login.classList.remove('hidden');
            login.style.display = 'flex';
            login.style.opacity = '1';
        }
    },

    bindEvents() {
        const btn = document.getElementById('btn-login');
        if(btn) btn.onclick = () => this.login();

        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = () => this.switchTab(item.dataset.tab, item);
        });

        const logout = document.getElementById('btn-logout');
        if(logout) logout.onclick = () => location.reload();
    },

    login() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if(u !== "" && p !== "") {
            document.getElementById('login-screen').style.display = 'none';
            const main = document.getElementById('main-app');
            main.classList.remove('hidden');
            main.style.display = 'flex';
            
            // Intentar cargar el 3D después de entrar
            setTimeout(() => this.init3D(), 500);
            this.loadLogs();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    },

    switchTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        btn.classList.add('active');
    },

    init3D() {
        const container = document.getElementById('canvas-3d');
        if(!container || typeof THREE === 'undefined') return;
        
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff99, wireframe: true });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            camera.position.z = 4;

            const animate = () => {
                requestAnimationFrame(animate);
                mesh.rotation.x += 0.01;
                mesh.rotation.y += 0.01;
                renderer.render(scene, camera);
            };
            animate();
        } catch(e) { console.log("Error 3D"); }
    },

    startClock() {
        setInterval(() => {
            const clock = document.getElementById('current-time');
            if(clock) clock.innerText = new Date().toLocaleTimeString();
        }, 1000);
    },

    loadLogs() {
        const log = document.getElementById('terminal-log');
        if(log) log.innerHTML = "SISTEMA CARGADO. BIENVENIDO AGENTE.";
    }
};

window.onload = () => app.init();
