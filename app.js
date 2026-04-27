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

let globalMesh3D = null;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let terminalInput = ""; // Para almacenar lo que escribe el usuario
let isTerminalActive = false;

// COMANDOS DEL TERMINAL SIMULADOS
const terminalCommands = {
    help: {
        es: `
╔════════════════════════════════════════════════════════════════╗
║                    COMANDOS DISPONIBLES                       ║
╚═════════════════════════════════════════════���══════════════════╝
• help           → Muestra esta lista de comandos
• status         → Estado general del sistema
• threats        → Información de amenazas detectadas
• agents         → Lista de agentes activos
• network        → Estado de la red
• shield         → Estado del escudo de perímetro
• logs [N]       → Últimos N registros (default: 5)
• clear          → Limpia la terminal
• scan           → Escaneo rápido de seguridad
• uptime         → Tiempo de actividad del sistema`,
        en: `
╔════════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                         ║
╚════════════════════════════════════════════════════════════════╝
• help           → Shows this command list
• status         → System general status
• threats        → Detected threats information
• agents         → List of active agents
• network        → Network status
• shield         → Perimeter shield status
• logs [N]       → Last N records (default: 5)
• clear          → Clears the terminal
• scan           → Quick security scan
• uptime         → System uptime`
    },
    status: {
        es: `STATUS REPORT — SISTEMA SOC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Servidor Principal: ONLINE
• Base de Datos: ONLINE
• Conexión VPN: SECURE
• Firewall: ACTIVE
• IDS/IPS: MONITORING
• Backup: SYNC (99.9%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ TODOS LOS SERVICIOS OPERACIONALES`,
        en: `STATUS REPORT — SOC SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Main Server: ONLINE
• Database: ONLINE
• VPN Connection: SECURE
• Firewall: ACTIVE
• IDS/IPS: MONITORING
• Backup: SYNC (99.9%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ ALL SERVICES OPERATIONAL`
    },
    threats: {
        es: `REPORTE DE AMENAZAS DETECTADAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[HIGH] SQL Injection attempt → 192.168.1.105:8080
[MEDIUM] Port Scan detected → 10.0.0.15
[LOW] Suspicious DNS queries → Internal network
[INFO] Malware signature match → Quarantine: db_clean_v3.exe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 4 eventos registrados
Estado: BAJO CONTROL`,
        en: `DETECTED THREATS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[HIGH] SQL Injection attempt → 192.168.1.105:8080
[MEDIUM] Port Scan detected → 10.0.0.15
[LOW] Suspicious DNS queries → Internal network
[INFO] Malware signature match → Quarantine: db_clean_v3.exe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 4 events recorded
Status: UNDER CONTROL`
    },
    agents: {
        es: `AGENTES SOC ACTIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID        NOMBRE              ESTADO      ÚLTIMA_ACTIVIDAD
──────────────────────────────────────────────────────────
AGENT-001 Carlos García       ONLINE      2 segundos atrás
AGENT-002 María López         ONLINE      35 segundos atrás
AGENT-003 Juan Rodríguez      OFFLINE     5 minutos atrás
AGENT-004 Ana Martínez        ONLINE      1 segundo atrás
AGENT-005 Pedro Sánchez       ONLINE      22 segundos atrás
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agentes Online: 4/5`,
        en: `ACTIVE SOC AGENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID        NAME               STATUS      LAST_ACTIVITY
──────────────────────────────────────────────────────────
AGENT-001 Carlos García       ONLINE      2 seconds ago
AGENT-002 María López         ONLINE      35 seconds ago
AGENT-003 Juan Rodríguez      OFFLINE     5 minutes ago
AGENT-004 Ana Martínez        ONLINE      1 second ago
AGENT-005 Pedro Sánchez       ONLINE      22 seconds ago
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Online Agents: 4/5`,
    },
    network: {
        es: `ESTADO DE RED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Interfaz: eth0
IP Local: 192.168.1.100
Gateway: 192.168.1.1
DNS: 8.8.8.8 | 8.8.4.4
Latencia: 12ms
Ancho de banda: 950 Mbps / 1000 Mbps
Paquetes pérdidos: 0.02%
Estado: ESTABLE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        en: `NETWORK STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Interface: eth0
Local IP: 192.168.1.100
Gateway: 192.168.1.1
DNS: 8.8.8.8 | 8.8.4.4
Latency: 12ms
Bandwidth: 950 Mbps / 1000 Mbps
Packet Loss: 0.02%
Status: STABLE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    },
    shield: {
        es: `ESCUDO DE PERÍMETRO — ESTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Modo: MÁXIMA SEGURIDAD
Firewall: ACTIVO ✓
Detección de Intrusiones: ACTIVA ✓
Prevención de Intrusiones: ACTIVA ✓
Análisis de Comportamiento: ACTIVO ✓
Protección DDoS: ACTIVA ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Última actualización de firmas: Hace 2 horas
Amenazas bloqueadas hoy: 127`,
        en: `PERIMETER SHIELD — STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode: MAXIMUM SECURITY
Firewall: ACTIVE ✓
Intrusion Detection: ACTIVE ✓
Intrusion Prevention: ACTIVE ✓
Behavior Analysis: ACTIVE ✓
DDoS Protection: ACTIVE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last signature update: 2 hours ago
Threats blocked today: 127`
    },
    scan: {
        es: `INICIANDO ESCANEO DE SEGURIDAD...
╔════════════════════════════════════════════════════════════════╗
Escaneo de puertos: 65535 puertos analizados
[████████████████████████████████████████] 100% - Completado ✓
Escaneo de malware: Base de datos: 2.1M firmas
[████████████████████████████████████████] 100% - Limpio ✓
Análisis de vulnerabilidades: 342 módulos
[████████████████████████████████████████] 100% - Sin críticas ✓
Verificación de integridad: 150K archivos
[████████████████████████████████████████] 100% - Válidos ✓
╚════════════════════════════════════════════════════════════════╝
RESULTADO: SISTEMA SEGURO - Sin amenazas detectadas`,
        en: `INITIATING SECURITY SCAN...
╔════════════════════════════════════════════════════════════════╗
Port Scan: 65535 ports analyzed
[████████████████████████████████████████] 100% - Completed ✓
Malware Scan: Database: 2.1M signatures
[████████████████████████████████████████] 100% - Clean ✓
Vulnerability Analysis: 342 modules
[████████████████████████████████████████] 100% - No critical ✓
Integrity Verification: 150K files
[████████████████████████████████████████] 100% - Valid ✓
╚════════════════════════════════════════════════════════════════╝
RESULT: SYSTEM SECURE - No threats detected`
    },
    uptime: {
        es: `ESTADÍSTICAS DE ACTIVIDAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tiempo de ejecución: 342 días, 15 horas, 23 minutos
Arranques totales: 28
Última reinicialización: 342 días atrás
Disponibilidad: 99.98%
MTBF (Mean Time Between Failures): 2848 horas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ SISTEMA ULTRA ESTABLE`,
        en: `UPTIME STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execution time: 342 days, 15 hours, 23 minutes
Total boots: 28
Last restart: 342 days ago
Availability: 99.98%
MTBF (Mean Time Between Failures): 2848 hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ ULTRA STABLE SYSTEM`
    }
};

document.addEventListener("DOMContentLoaded", function() {
    
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-screen');
        if(splash) splash.classList.add('hidden');
        if(login) login.classList.remove('hidden');
    }, 3000);

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
                setupTerminal();
                setTimeout(() => init3D(localStorage.getItem('theme') || 'green'), 500);
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
            applyLanguage(e.target.value);
        };
    }

    document.querySelectorAll('.theme-card').forEach(opt => {
        opt.onclick = function() {
            document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
            this.classList.add('active');
            applyTheme(this.dataset.t);
        };
    });

    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = () => location.reload();

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
        
        if(globalMesh3D) {
            let hexColor = 0x00ff99;
            if(t === 'cyan') hexColor = 0x00e5ff;
            if(t === 'magenta') hexColor = 0xff00ff;
            if(t === 'orange') hexColor = 0xff6600;
            
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

    // --- SETUP DEL TERMINAL INTERACTIVO ---
    function setupTerminal() {
        const terminalBody = document.getElementById('terminal-log');
        const terminalContainer = document.querySelector('.terminal-box');
        
        if(!terminalBody || !terminalContainer) return;

        // Hacer que el contenedor sea focusable
        terminalContainer.addEventListener('click', () => {
            terminalContainer.focus();
            isTerminalActive = true;
        });

        terminalContainer.addEventListener('blur', () => {
            isTerminalActive = false;
        });

        // Listener global para teclado
        document.addEventListener('keydown', (e) => {
            // Solo si la terminal está activa
            if(!isTerminalActive) return;

            if(e.key === 'Enter') {
                e.preventDefault();
                executeCommand(terminalInput);
                terminalInput = "";
                updateTerminalDisplay();
            } else if(e.key === 'Backspace') {
                e.preventDefault();
                terminalInput = terminalInput.slice(0, -1);
                updateTerminalDisplay();
            } else if(e.key === 'Control' || e.key === 'Meta' || e.key === 'Alt' || e.key === 'Shift') {
                return; // Ignorar teclas modificadoras
            } else if(e.key.length === 1) {
                e.preventDefault();
                terminalInput += e.key;
                updateTerminalDisplay();
            }
        });

        function updateTerminalDisplay() {
            const inputRow = document.querySelector('.terminal-input-row');
            if(inputRow) {
                inputRow.innerHTML = `<span class="prompt">soc@hub:~$</span><span style="color: var(--neon); margin: 0 4px;">${terminalInput}</span><span class="cursor-blink">█</span>`;
            }
        }

        function executeCommand(cmd) {
            const trimmedCmd = cmd.trim().toLowerCase();
            const inputRow = document.querySelector('.terminal-input-row');
            
            // Mostrar el comando ejecutado
            terminalBody.innerHTML += `<div class="log-line">[${new Date().toLocaleTimeString()}] soc@hub:~$ ${cmd}</div>`;
            
            if(trimmedCmd === 'clear') {
                terminalBody.innerHTML = '';
            } else if(trimmedCmd === '') {
                // Si está vacío, solo mostrar nueva línea
                terminalBody.innerHTML += `<div class="log-line sys"></div>`;
            } else {
                const lang = localStorage.getItem('lang') || 'es';
                const output = getCommandOutput(trimmedCmd, lang);
                
                output.split('\n').forEach(line => {
                    if(line.trim()) {
                        const lineClass = line.includes('[HIGH]') ? 'err' : 
                                        line.includes('[MEDIUM]') ? 'warn' : 
                                        line.includes('[LOW]') || line.includes('[INFO]') ? 'info' : 'sys';
                        terminalBody.innerHTML += `<div class="log-line ${lineClass}">${escapeHtml(line)}</div>`;
                    }
                });
            }
            
            // Scroll al final
            terminalBody.scrollTop = terminalBody.scrollHeight;
            
            // Restaurar el prompt
            if(inputRow) {
                inputRow.innerHTML = `<span class="prompt">soc@hub:~$</span><span class="cursor-blink">█</span>`;
            }
        }

        function getCommandOutput(cmd, lang) {
            const parts = cmd.split(' ');
            const mainCmd = parts[0];

            if(terminalCommands[mainCmd]) {
                return terminalCommands[mainCmd][lang] || terminalCommands[mainCmd]['es'];
            } else if(mainCmd === 'logs') {
                const num = parts[1] ? parseInt(parts[1]) : 5;
                return generateRandomLogs(num, lang);
            } else {
                return lang === 'es' ? 
                    `⚠ Comando no reconocido: "${mainCmd}"\nEscribe "help" para ver los comandos disponibles.` :
                    `⚠ Command not recognized: "${mainCmd}"\nType "help" to see available commands.`;
            }
        }

        function generateRandomLogs(num, lang) {
            const logTypes = [
                { type: '[INFO]', text: lang === 'es' ? 'Conexión establecida' : 'Connection established' },
                { type: '[WARN]', text: lang === 'es' ? 'Actividad sospechosa detectada' : 'Suspicious activity detected' },
                { type: '[ERR]', text: lang === 'es' ? 'Fallo de conexión' : 'Connection failed' },
                { type: '[OK]', text: lang === 'es' ? 'Operación completada' : 'Operation completed' }
            ];
            
            let result = '';
            for(let i = 0; i < num; i++) {
                const log = logTypes[Math.floor(Math.random() * logTypes.length)];
                const time = new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString();
                result += `[${time}] ${log.type} ${log.text}\n`;
            }
            return result;
        }
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
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
            if(currentTheme === 'orange') hexColor = 0xff6600;
            
            const material = new THREE.MeshBasicMaterial({ color: hexColor, wireframe: true });
            
            globalMesh3D = new THREE.Group();

            const baseGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
            const base = new THREE.Mesh(baseGeo, material);
            base.position.y = -0.6;

            const roofGeo = new THREE.ConeGeometry(1.2, 1, 4);
            const roof = new THREE.Mesh(roofGeo, material);
            roof.position.y = 0.5;
            roof.rotation.y = Math.PI / 4;

            globalMesh3D.add(base);
            globalMesh3D.add(roof);
            
            scene.add(globalMesh3D);
            camera.position.z = 3.5;
            camera.position.y = 0.5;
            
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

            const animate = () => {
                requestAnimationFrame(animate);
                if(globalMesh3D && !isDragging) {
                    globalMesh3D.rotation.y += 0.005;
                }
                renderer.render(scene, camera);
            };
            animate();

        } catch(e) { console.log("3D Falló silenciosamente"); }
    }
});
