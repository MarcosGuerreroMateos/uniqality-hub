// --- DICCIONARIO DE IDIOMAS ---
const i18n = {
    es: {
        auth_required: "// AUTENTICACIÓN REQUERIDA",
        login_btn: "ACCEDER AL SISTEMA",
        login_error: "Credenciales incorrectas.",
        status_ok: "TODO BAJO CONTROL",
        conn_secure: "CONEXIÓN SEGURA",
        digital_twin: "digital_twin / live / interactivo",
        live_events: "EVENTOS EN VIVO",
        nav_dashboard: "Panel",
        nav_cameras: "Cámaras",
        nav_logs: "Terminal",
        nav_settings: "Ajustes",
        language: "Idioma del Sistema",
        theme_color: "Color del Sistema",
        logout_btn: "CERRAR SESIÓN"
    },
    en: {
        auth_required: "// AUTHENTICATION REQUIRED",
        login_btn: "SYSTEM LOGIN",
        login_error: "Access denied. Invalid credentials.",
        status_ok: "ALL SYSTEMS GO",
        conn_secure: "SECURE CONNECTION",
        digital_twin: "digital_twin / live / touch_to_rotate",
        live_events: "LIVE EVENTS",
        nav_dashboard: "Overview",
        nav_cameras: "Cameras",
        nav_logs: "Terminal",
        nav_settings: "Settings",
        language: "System Language",
        theme_color: "System Color",
        logout_btn: "LOGOUT"
    }
};

const app = {
    lang: 'es',
    scene3DInitialized: false, // Control para no cargar el 3D dos veces

    init() {
        // Cargar preferencias guardadas
        if(localStorage.getItem('theme')) this.changeTheme(localStorage.getItem('theme'));
        if(localStorage.getItem('lang')) this.changeLanguage(localStorage.getItem('lang'));
        
        // Iniciar reloj
        setInterval(() => {
            const now = new Date();
            document.getElementById('clock').innerText = now.toLocaleTimeString();
        }, 1000);
    },

    // --- SISTEMA DE LOGIN ---
    login() {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // Validar (Pon aquí la contraseña que quieras, por ahora acepta cualquiera si no está vacío)
        if(user !== "" && pass !== "") {
            document.getElementById('login-screen').classList.remove('active');
            document.getElementById('main-app').classList.add('active');
            
            // Cargar datos y 3D solo cuando entramos
            this.loadEvents();
            this.loadTerminal();
            if(!this.scene3DInitialized) {
                init3DModel();
                this.scene3DInitialized = true;
            }
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    },

    logout() {
        document.getElementById('main-app').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-error').style.display = 'none';
        this.switchTab('dashboard', document.querySelector('.nav-btn')); // Resetear pestaña
    },

    // --- NAVEGACIÓN DE PESTAÑAS ---
    switchTab(tabId, btnElement) {
        // 1. Ocultar todas las secciones
        document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
        // 2. Quitar color activo a todos los botones
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // 3. Mostrar la seleccionada
        document.getElementById(`view-${tabId}`).classList.add('active');
        btnElement.classList.add('active');
    },

    // --- AJUSTES (TEMA E IDIOMA) ---
    changeTheme(colorName) {
        document.documentElement.setAttribute('data-theme', colorName);
        localStorage.setItem('theme', colorName);
        this.addLog(`[SYSTEM] Color scheme changed to ${colorName}`, 'sys');
    },

    changeLanguage(langCode) {
        this.lang = langCode;
        localStorage.setItem('lang', langCode);
        
        // Buscar todos los elementos con data-i18n y cambiar su texto
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(i18n[langCode][key]) {
                el.innerText = i18n[langCode][key];
            }
        });
        this.addLog(`[SYSTEM] Language updated to ${langCode.toUpperCase()}`, 'sys');
    },

    // --- CARGA DE DATOS FALSOS ---
    loadEvents() {
        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = ''; // Limpiar
        const events = [
            { title: 'Movimiento detectado', loc: 'Patio Trasero', time: '12ms', type: '' },
            { title: 'Vehículo aproximándose', loc: 'Puerta Principal', time: '35s', type: 'warning' },
            { title: 'Persona no identificada', loc: 'Acceso Servidores', time: '1m', type: 'error' },
            { title: 'Autenticación OK', loc: 'Gachaval (Remoto)', time: '5m', type: 'ok' }
        ];

        events.forEach(ev => {
            let colorClass = ev.type === 'error' ? 'error' : (ev.type === 'warning' ? 'warning' : '');
            eventsList.innerHTML += `
                <div class="event-card ${colorClass}">
                    <div>
                        <div class="event-title ${colorClass}">${ev.title}</div>
                        <div class="event-loc">${ev.loc}</div>
                    </div>
                    <div style="font-size: 11px; color: #888;">${ev.time}</div>
                </div>
            `;
        });
    },

    loadTerminal() {
        const out = document.getElementById('terminal-output');
        out.innerHTML = ''; // Limpiar
        const logs = [
            { txt: 'Starting Uniqality Defense Daemon...' },
            { txt: 'Loading firewall rules: OK' },
            { txt: 'Connecting to mail.uniqality.com: SUCCESS' },
            { txt: 'WARNING: Unauthorized ping sweep detected on port 22', type: 'warn' },
            { txt: 'Intrusion Prevention System (IPS) activated.', type: 'sys' }
        ];
        logs.forEach(log => this.addLog(log.txt, log.type));
    },

    addLog(text, type = '') {
        const out = document.getElementById('terminal-output');
        if(!out) return;
        out.innerHTML += `<div class="log-line ${type}">> ${text}</div>`;
        out.scrollTop = out.scrollHeight;
    }
};

// --- MOTOR 3D (THREE.JS) ---
function init3DModel() {
    const container = document.getElementById('3d-canvas-container');
    if(!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Icosaedro (Simulando un nodo o escudo protector)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), materialLine);
    
    const materialPoints = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const points = new THREE.Points(geometry, materialPoints);

    const networkNode = new THREE.Group();
    networkNode.add(wireframe);
    networkNode.add(points);
    scene.add(networkNode);

    camera.position.z = 4.5;

    // Rotación manual
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            networkNode.rotation.y += (e.offsetX - prevMousePos.x) * 0.01;
            networkNode.rotation.x += (e.offsetY - prevMousePos.y) * 0.01;
        }
        prevMousePos = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);
    
    // Táctil para móviles
    renderer.domElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isDragging) {
            networkNode.rotation.y += (e.touches[0].clientX - prevMousePos.x) * 0.01;
            networkNode.rotation.x += (e.touches[0].clientY - prevMousePos.y) * 0.01;
        }
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchend', () => isDragging = false);

    // Bucle
    function animate() {
        requestAnimationFrame(animate);
        if(!isDragging) {
            networkNode.rotation.y += 0.005;
            networkNode.rotation.x += 0.002;
        }
        renderer.render(scene, camera);
    }
    animate();

    // Redimensionar si se cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        if(container.clientWidth > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}

// Inicializar la app al cargar
window.onload = () => app.init();// ==========================================
// 1. SISTEMA DE IDIOMAS (i18n)
// ==========================================
const translations = {
    es: {
        status_ok: 'TODO BAJO CONTROL',
        live_events: 'EVENTOS EN VIVO',
        nav_dashboard: 'Panel',
        nav_logs: 'Terminal',
        nav_settings: 'Ajustes',
        language: 'Idioma del Sistema',
        theme_color: 'Color de Neón',
        clear_cache: 'Limpiar Caché Local'
    },
    en: {
        status_ok: 'ALL SYSTEMS GO',
        live_events: 'LIVE EVENTS',
        nav_dashboard: 'Overview',
        nav_logs: 'Terminal',
        nav_settings: 'Settings',
        language: 'System Language',
        theme_color: 'Neon Accent',
        clear_cache: 'Clear Local Cache'
    }
};

// ==========================================
// 2. CONTROLADOR PRINCIPAL DE LA APP
// ==========================================
const app = {
    lang: localStorage.getItem('lang') || 'es',
    theme: localStorage.getItem('theme') || 'green',

    init() {
        this.changeTheme(this.theme);
        this.changeLanguage(this.lang);
        document.getElementById('lang-select').value = this.lang;
        
        // Cargar eventos y logs falsos para la demo
        this.loadEvents();
        this.loadTerminal();

        // Iniciar motor 3D
        init3DModel();
    },

    // Navegación de Pestañas
    switchTab(tabId, btnElement) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        // Quitar activo de botones
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Mostrar vista seleccionada
        document.getElementById(`view-${tabId}`).classList.add('active');
        btnElement.classList.add('active');
    },

    // Cambiar Tema (Colores)
    changeTheme(colorName) {
        this.theme = colorName;
        document.documentElement.setAttribute('data-theme', colorName);
        localStorage.setItem('theme', colorName);
        this.addLog(`Sistema de colores actualizado a: ${colorName}`, 'sys');
    },

    // Cambiar Idioma
    changeLanguage(langCode) {
        this.lang = langCode;
        localStorage.setItem('lang', langCode);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(translations[langCode][key]) {
                el.innerText = translations[langCode][key];
            }
        });
        this.addLog(`Language changed to: ${langCode.toUpperCase()}`, 'sys');
    },

    // Borrar Caché
    clearCache() {
        localStorage.clear();
        alert('Caché limpiado. La app se reiniciará.');
        location.reload();
    },

    // Inyectar Eventos en el HTML
    loadEvents() {
        const eventsList = document.getElementById('events-list');
        const events = [
            { title: 'Intrusión bloqueada', loc: 'Firewall Externo', time: '12ms', type: 'error' },
            { title: 'Autenticación DKIM OK', loc: 'mail.uniqality.com', time: '1s', type: 'ok' },
            { title: 'Greylisting Activo', loc: 'Conexión SMTP entrante', time: '45s', type: 'warning' },
            { title: 'Sincronización MariaDB', loc: 'Base de datos identidades', time: '2m', type: 'ok' }
        ];

        events.forEach(ev => {
            let colorClass = ev.type === 'error' ? 'error' : (ev.type === 'warning' ? 'warning' : '');
            eventsList.innerHTML += `
                <div class="event-card ${colorClass}">
                    <div>
                        <div class="event-title ${colorClass}">${ev.title}</div>
                        <div class="event-loc">${ev.loc}</div>
                    </div>
                    <div style="font-size: 11px; color: #888;">${ev.time}</div>
                </div>
            `;
        });
    },

    // Simulador de Terminal
    loadTerminal() {
        const logs = [
            { txt: 'postfix/smtpd[1234]: connect from unknown[192.168.1.1]' },
            { txt: 'postfix/cleanup[1235]: 4F3A2B1C: message-id=<test@...>' },
            { txt: 'iredapd[432]: Greylisting active for unknown IP', type: 'warn' },
            { txt: 'ERROR: connection refused by external MTA', type: 'err' }
        ];
        logs.forEach(log => this.addLog(log.txt, log.type));
    },

    addLog(text, type = '') {
        const out = document.getElementById('terminal-output');
        out.innerHTML += `<div class="log-line ${type}">> ${text}</div>`;
        out.scrollTop = out.scrollHeight; // Auto-scroll
    }
};

// ==========================================
// 3. MOTOR 3D (THREE.JS)
// ==========================================
function init3DModel() {
    const container = document.getElementById('3d-canvas-container');
    
    // Escena, Cámara y Renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // alpha:true permite fondo transparente
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Crear la estructura de un Nodo (Icosaedro como wireframe)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    
    // Material del alambre (usaremos blanco, y CSS le dará el glow)
    const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), materialLine);
    
    // Nodos en las intersecciones (puntos)
    const materialPoints = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const points = new THREE.Points(geometry, materialPoints);

    // Agrupar ambos
    const networkNode = new THREE.Group();
    networkNode.add(wireframe);
    networkNode.add(points);
    scene.add(networkNode);

    camera.position.z = 5;

    // Variables para rotación manual (Táctil/Ratón)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Eventos de ratón/táctil para girar el modelo 3D
    renderer.domElement.addEventListener('mousedown', (e) => { isDragging = true; });
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
            networkNode.rotation.y += deltaMove.x * 0.01;
            networkNode.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    
    // Soporte táctil móvil
    renderer.domElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaMove = { x: e.touches[0].clientX - previousMousePosition.x, y: e.touches[0].clientY - previousMousePosition.y };
            networkNode.rotation.y += deltaMove.x * 0.01;
            networkNode.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchend', () => { isDragging = false; });

    // Bucle de animación
    function animate() {
        requestAnimationFrame(animate);
        // Rotación automática lenta
        if(!isDragging) {
            networkNode.rotation.y += 0.005;
            networkNode.rotation.x += 0.002;
        }
        renderer.render(scene, camera);
    }
    
    animate();

    // Redimensionar el lienzo si cambia la pantalla
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Arrancar la App cuando cargue la web
window.onload = () => app.init();
