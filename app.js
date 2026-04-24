const i18n = {
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
