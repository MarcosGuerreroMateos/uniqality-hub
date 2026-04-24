const i18n = {
    es: { auth_title: "ACCESO RESTRINGIDO", status_ok: "SISTEMA_OK", settings: "AJUSTES", lang: "IDIOMA" },
    en: { auth_title: "RESTRICTED ACCESS", status_ok: "SYSTEM_GO", settings: "SETTINGS", lang: "LANGUAGE" }
};

const app = {
    lang: localStorage.getItem('lang') || 'es',
    theme: localStorage.getItem('theme') || 'green',
    mesh3D: null, // Para guardar el objeto 3D y cambiarle el color

    init() {
        console.log("Iniciando Uniqality OS...");
        this.runVisualLoad(); 
        this.bindEvents();
        this.startClock();
        this.setTheme(this.theme); // Aplicar tema guardado
    },

    runVisualLoad() {
        const bar = document.querySelector('.progress');
        let progress = 0;
        const timer = setInterval(() => {
            progress += 2; 
            if (bar) bar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(timer);
                setTimeout(() => this.forceShowLogin(), 500);
            }
        }, 40);
        setTimeout(() => this.forceShowLogin(), 5000);
    },

    forceShowLogin() {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if (splash) splash.style.display = 'none';
        if (login) {
            login.classList.remove('hidden');
            login.style.display = 'flex';
        }
    },

    bindEvents() {
        document.getElementById('btn-login').onclick = () => this.login();
        
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => this.switchTab(btn.dataset.tab, btn);
        });

        document.getElementById('lang-toggle').onchange = (e) => this.setLanguage(e.target.value);
        
        document.querySelectorAll('.theme-opt').forEach(opt => {
            opt.onclick = () => this.setTheme(opt.dataset.t);
        });

        document.getElementById('btn-logout').onclick = () => location.reload();
    },

    login() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if (u !== "" && p !== "") {
            document.getElementById('login-screen').style.display = 'none';
            const main = document.getElementById('main-app');
            main.classList.remove('hidden');
            main.style.display = 'flex';
            
            // INICIALIZAMOS EL 3D AQUÍ, CUANDO YA ESTAMOS DENTRO
            setTimeout(() => this.init3D(), 100);
            this.loadLogs();
            this.loadEvents();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    },

    init3D() {
        const container = document.getElementById('canvas-3d');
        if (!container) return;

        // Comprobamos si la librería Three.js se ha cargado correctamente
        if (typeof THREE === 'undefined') {
            container.innerHTML = "<div style='color:red; padding:20px; font-size:10px;'>ERR: THREE_JS_NOT_FOUND</div>";
            return;
        }

        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.innerHTML = ""; // Limpiar el contenedor
            container.appendChild(renderer.domElement);

            // Geometría: Un Nudo de Torus (Muy tecnológico)
            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            
            // Color basado en el tema actual
            let neonColor = this.getNeonHex();
            
            const material = new THREE.MeshBasicMaterial({ color: neonColor, wireframe: true });
            this.mesh3D = new THREE.Mesh(geometry, material);
            
            scene.add(this.mesh3D);
            camera.position.z = 3.5;

            const animate = () => {
                requestAnimationFrame(animate);
                if (this.mesh3D) {
                    this.mesh3D.rotation.x += 0.01;
                    this.mesh3D.rotation.y += 0.01;
                }
                renderer.render(scene, camera);
            };
            animate();

            // Ajustar si se cambia el tamaño de la ventana
            window.addEventListener('resize', () => {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            });

        } catch (e) {
            console.error("Error al iniciar el motor 3D:", e);
        }
    },

    getNeonHex() {
        if (this.theme === 'cyan') return 0x00e5ff;
        if (this.theme === 'magenta') return 0xff00ff;
        return 0x00ff99; // green
    },

    setTheme(t) {
        this.theme = t;
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        
        // Si el objeto 3D ya existe, le cambiamos el color al vuelo
        if (this.mesh3D) {
            this.mesh3D.material.color.setHex(this.getNeonHex());
        }
    },

    switchTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add('active');
        if (btn) btn.classList.add('active');
    },

    setLanguage(l) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (i18n[l][key]) el.innerText = i18n[l][key];
        });
    },

    startClock() {
        const clock = document.getElementById('current-time');
        setInterval(() => {
            if (clock) clock.innerText = new Date().toLocaleTimeString();
        }, 1000);
    },

    loadLogs() {
        const log = document.getElementById('terminal-log');
        if (!log) return;
        const lines = ["BOOT_SEQUENCE_COMPLETE", "CORE_SHIELD: ACTIVE", "CONNECTING_TO_NODES...", "ENCRYPTION: AES_256"];
        lines.forEach((line, i) => {
            setTimeout(() => {
                log.innerHTML += `<div style="margin-bottom:5px;">[${new Date().toLocaleTimeString()}] ${line}</div>`;
                log.scrollTop = log.scrollHeight;
            }, i * 400);
        });
    },

    loadEvents() {
        const feed = document.getElementById('event-feed');
        if (feed) feed.innerHTML = `<div class="event-card ok" style="border-left:3px solid var(--neon); padding:10px; background:rgba(255,255,255,0.05);">SISTEMA VIGILANCIA: ON</div>`;
    }
};

window.onload = () => app.init();
