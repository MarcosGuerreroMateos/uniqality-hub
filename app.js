// ==========================================
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
