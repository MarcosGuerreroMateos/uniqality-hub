const i18n = {
    es: { 
        loading: "// INICIALIZANDO PROTOCOLOS SOC...", auth_title: "ACCESO RESTRINGIDO", 
        auth_sub: "// IDENTIFICACIÓN DE AGENTE", login_btn: "VALIDAR CREDENCIALES",
        login_err: "ERROR: CREDENCIALES NO VÁLIDAS", sys_active: "SISTEMA_ACTIVO",
        recent_events: "EVENTOS_RECIENTES", settings: "CONFIGURACIÓN", 
        lang: "IDIOMA", theme: "TEMA DE NEÓN", logout: "DESCONECTAR"
    },
    en: { 
        loading: "// INITIALIZING SOC PROTOCOLS...", auth_title: "RESTRICTED ACCESS", 
        auth_sub: "// AGENT IDENTIFICATION REQUIRED", login_btn: "VALIDATE CREDENTIALS",
        login_err: "ERROR: INVALID CREDENTIALS", sys_active: "SYSTEM_ACTIVE",
        recent_events: "RECENT EVENTS", settings: "SYSTEM SETTINGS", 
        lang: "LANGUAGE", theme: "NEON THEME", logout: "DISCONNECT"
    }
};

let globalMesh3D = null;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.onload = function() {
    
    // 1. SALTO FORZADO AL LOGIN (Garantizado a los 3s)
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if(splash) splash.style.display = 'none';
        if(login) {
            login.classList.remove('hidden');
            login.style.display = 'flex';
        }
    }, 3000);

    // 2. APLICAR CONFIGURACIÓN GUARDADA
    const theme = localStorage.getItem('theme') || 'green';
    const lang = localStorage.getItem('lang') || 'es';
    
    applyTheme(theme);
    applyLanguage(lang);

    const langSelect = document.getElementById('lang-toggle');
    if(langSelect) langSelect.value = lang;

    setInterval(() => {
        const clock = document.getElementById('current-time');
        if(clock) clock.innerText = new Date().toLocaleTimeString();
    }, 1000);

    // 3. EVENTOS
    const btnLogin = document.getElementById('btn-login');
    if(btnLogin) {
        btnLogin.onclick = function() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            if(u !== "" && p !== "") {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('main-app').classList.remove('hidden');
                document.getElementById('main-app').style.display = 'flex';
                
                loadLogs();
                loadEvents();
                setTimeout(() => init3DHouse(localStorage.getItem('theme') || 'green'), 500);
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

    if(langSelect) langSelect.onchange = (e) => applyLanguage(e.target.value);
    
    document.querySelectorAll('.theme-opt').forEach(opt => {
        opt.onclick = function() { applyTheme(this.dataset.t); };
    });

    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = () => location.reload();

    // 4. FUNCIONES
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
        
        if(globalMesh3D) {
            let hexColor = 0x00ff99;
            if(t === 'cyan') hexColor = 0x00e5ff;
            if(t === 'magenta') hexColor = 0xff00ff;
            
            globalMesh3D.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material.color.setHex(hexColor);
                } else if (child.children) {
                    child.children.forEach(sub => {
                        if (sub.material && sub.material.color) sub.material.color.setHex(hexColor);
                    });
                }
            });
        }
    }

    function loadLogs() {
        const log = document.getElementById('terminal-log');
        if(!log) return;
        const lines = ["BOOT_OS...", "NET_PROTOCOLS: OK", "PERIMETER SHIELD: ACTIVE", "CAMS ONLINE: 4/4", "SYSTEM READY."];
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

    // --- LA CASA 3D ---
    function init3DHouse(currentTheme) {
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
            const cameraMaterial = new THREE.MeshBasicMaterial({ color: 0xff3366 }); // Rojo sólido
            
            globalMesh3D = new THREE.Group();

            // Base de la casa
            const houseBase = new THREE.Mesh(new THREE.BoxGeometry(2, 1.3, 1.5), material);
            houseBase.position.y = -0.65;
            globalMesh3D.add(houseBase);

            // Porche
            const porch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1), material);
            porch.position.set(1.4, -0.9, 0.25);
            globalMesh3D.add(porch);

            // Techo
            const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 4), material);
            roof.position.y = 0.6;
            roof.rotation.y = Math.PI / 4; 
            globalMesh3D.add(roof);

            // Aceras
            const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.05, 0.5), material);
            sidewalk.position.set(0, -1.3, 1.2);
            globalMesh3D.add(sidewalk);
            
            // Farolas
            const createStreetlight = (x, z) => {
                const lamp = new THREE.Group();
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2, 8), material);
                const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), material);
                head.position.y = 1;
                lamp.add(pole); lamp.add(head);
                lamp.position.set(x, -0.3, z);
                globalMesh3D.add(lamp);
            };
            createStreetlight(-2, 1.2);
            createStreetlight(2, 1.2);

            // Cámaras (Puntos rojos)
            const camerasGroup = new THREE.Group();
            const createCam = (x, y, z) => {
                const cam = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), cameraMaterial);
                cam.position.set(x, y, z);
                camerasGroup.add(cam);
            };
            createCam(-0.9, 0, 0.7);  
            createCam(0.9, 0, 0.7);   
            createCam(-0.9, 0, -0.7); 
            createCam(1.7, -0.5, 0.7); 
            globalMesh3D.add(camerasGroup);
            
            scene.add(globalMesh3D);
            camera.position.z = 5;
            camera.position.y = 0.8; 
            
            // Controles
            renderer.domElement.addEventListener('mousedown', () => isDragging = true);
            renderer.domElement.addEventListener('mousemove', (e) => {
                if (isDragging && globalMesh3D) {
                    globalMesh3D.rotation.y += (e.offsetX - previousMousePosition.x) * 0.01;
                    globalMesh3D.rotation.x += (e.offsetY - previousMousePosition.y) * 0.01;
                }
                previousMousePosition = { x: e.offsetX, y: e.offsetY };
            });
            window.addEventListener('mouseup', () => isDragging = false);

            renderer.domElement.addEventListener('touchstart', (e) => {
                isDragging = true;
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            });
            renderer.domElement.addEventListener('touchmove', (e) => {
                if (isDragging && globalMesh3D) {
                    globalMesh3D.rotation.y += (e.touches[0].clientX - previousMousePosition.x) * 0.01;
                    globalMesh3D.rotation.x += (e.touches[0].clientY - previousMousePosition.y) * 0.01;
                }
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            });
            window.addEventListener('touchend', () => isDragging = false);

            let camPulse = 0;
            const animate = () => {
                requestAnimationFrame(animate);
                if(globalMesh3D && !isDragging) globalMesh3D.rotation.y += 0.003;
                
                camPulse += 0.1;
                camerasGroup.children.forEach(c => {
                    c.material.opacity = 0.5 + Math.sin(camPulse) * 0.5;
                    c.material.transparent = true;
                });
                renderer.render(scene, camera);
            };
            animate();
        } catch(e) { console.log("3D error"); }
    }
});
