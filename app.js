const i18n = {
    es: { auth_title: "ACCESO RESTRINGIDO", status_ok: "SISTEMA_OK", settings: "AJUSTES", lang: "IDIOMA" },
    en: { auth_title: "RESTRICTED ACCESS", status_ok: "SYSTEM_GO", settings: "SETTINGS", lang: "LANGUAGE" }
};

const app = {
    init() {
        this.runSplash();
        this.bindEvents();
        this.startClock();
        if(localStorage.getItem('theme')) this.setTheme(localStorage.getItem('theme'));
    },

    runSplash() {
        const bar = document.querySelector('.progress');
        let progress = 0;
        
        // Animación visual de la barra (0 a 100% en 3 segundos)
        const interval = setInterval(() => {
            progress += 2; 
            if (bar) bar.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(interval);
                // Esperamos medio segundo en el 100% y entramos
                setTimeout(() => this.showLogin(), 500);
            }
        }, 50); 
    },

    showLogin() {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if(splash) splash.style.display = 'none';
        if(login) {
            login.classList.remove('hidden');
            login.style.display = 'flex';
        }
    },

    bindEvents() {
        // Botón Login
        document.getElementById('btn-login').addEventListener('click', () => this.login());
        
        // Navegación
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab, btn));
        });

        // Configuración
        document.getElementById('lang-toggle').addEventListener('change', (e) => this.setLanguage(e.target.value));
        document.querySelectorAll('.theme-opt').forEach(opt => {
            opt.addEventListener('click', () => this.setTheme(opt.dataset.t));
        });

        document.getElementById('btn-logout').addEventListener('click', () => location.reload());
    },

    login() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if(u !== "" && p !== "") {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-app').classList.remove('hidden');
            document.getElementById('main-app').style.display = 'flex';
            this.init3D();
            this.loadLogs();
            this.loadEvents();
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

    setTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
    },

    setLanguage(l) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if(i18n[l][key]) el.innerText = i18n[l][key];
        });
    },

    startClock() {
        setInterval(() => {
            const clock = document.getElementById('current-time');
            if(clock) clock.innerText = new Date().toLocaleTimeString();
        }, 1000);
    },

    init3D() {
        const container = document.getElementById('canvas-3d');
        if(!container) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff99, wireframe: true });
        const obj = new THREE.Mesh(geometry, material);
        scene.add(obj);
        camera.position.z = 4;

        function animate() {
            requestAnimationFrame(animate);
            obj.rotation.x += 0.01;
            obj.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    },

    loadLogs() {
        const log = document.getElementById('terminal-log');
        const lines = ["BOOTING...", "NET: OK", "UNIQALITY_HUB: CONNECTED", "READY."];
        lines.forEach((line, i) => {
            setTimeout(() => {
                if(log) log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${line}</div>`;
            }, i * 500);
        });
    },

    loadEvents() {
        const feed = document.getElementById('event-feed');
        if(!feed) return;
        feed.innerHTML = `<div class="event-card ok">SISTEMA ONLINE</div>`;
    }
};

window.onload = () => app.init();
