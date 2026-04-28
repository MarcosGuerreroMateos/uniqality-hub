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
        scanner: "ESCÁNER_3D",
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
        nav_scanner: "Escáner",
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
        scanner: "3D_SCANNER",
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
        nav_scanner: "Scanner",
        nav_terminal: "Terminal",
        nav_settings: "Settings",
        signal_lost: "SIGNAL_LOST"
    }
};

let globalMesh3D = null;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let terminalInput = "";
let isTerminalFocused = false;

// ESTADO DEL ESCÁNER
let scannerState = {
    isScanning: false,
    frames: [],
    zones: new Set(),
    coverage: 0,
    videoStream: null,
    deviceOrientation: { alpha: 0, beta: 0, gamma: 0 },
    pointCloud: [],
    panorama: null,
    renderer360: null,
    captureInterval: null
};

// COMANDOS DEL TERMINAL SIMULADOS
const terminalCommands = {
    help: {
        es: `
╔════════════════════════════════════════════════════════════════╗
║                    COMANDOS DISPONIBLES                       ║
╚════════════════════════════════════════════════════════════════╝
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━
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
                setTimeout(() => initScanner(), 600);
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
        feed.innerHTML = `<div class="event-card" style="border-left: 3px solid var(--neon); padding: 10px; margin-bottom: 10px; background: rgba(255,255,255,0.05);"><strong>AUTH_OK</strong><br><small>Usuario: AGENTE_01 | Hora: ${new Date().toLocaleTimeString()}</small></div>`;
    }

    // --- SETUP DEL TERMINAL INTERACTIVO ---
    function setupTerminal() {
        const terminalBody = document.getElementById('terminal-log');
        const terminalBox = document.querySelector('.terminal-box');
        
        if(!terminalBody || !terminalBox) return;

        terminalBox.setAttribute('tabindex', '0');

        terminalBox.addEventListener('click', () => {
            isTerminalFocused = true;
            terminalBox.style.outline = 'none';
        });

        terminalBox.addEventListener('blur', () => {
            isTerminalFocused = false;
        });

        document.addEventListener('keydown', (e) => {
            if(!isTerminalFocused) return;

            if(e.key === 'Enter') {
                e.preventDefault();
                executeCommand(terminalInput);
                terminalInput = "";
                updateTerminalDisplay();
            } else if(e.key === 'Backspace') {
                e.preventDefault();
                terminalInput = terminalInput.slice(0, -1);
                updateTerminalDisplay();
            }
        });

        document.addEventListener('keypress', (e) => {
            if(!isTerminalFocused) return;
            e.preventDefault();
            terminalInput += e.key;
            updateTerminalDisplay();
        });

        function updateTerminalDisplay() {
            const inputRow = document.querySelector('.terminal-input-row');
            if(inputRow) {
                inputRow.innerHTML = `<span class="prompt">soc@hub:~$</span><span style="color: var(--neon); margin-left: 4px;">${escapeHtml(terminalInput)}</span><span class="cursor-blink">█</span>`;
            }
        }

        function executeCommand(cmd) {
            const trimmedCmd = cmd.trim().toLowerCase();
            
            terminalBody.innerHTML += `<div class="log-line">[${new Date().toLocaleTimeString()}] soc@hub:~$ ${escapeHtml(cmd)}</div>`;
            
            if(trimmedCmd === 'clear') {
                terminalBody.innerHTML = '';
            } else if(trimmedCmd !== '') {
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
            
            terminalBody.scrollTop = terminalBody.scrollHeight;
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

    // ===== FUNCIONES DEL ESCÁNER 3D =====
    window.initScanner = function() {
        console.log("🔍 Inicializando escáner...");
        
        const btnStartScan = document.getElementById('btn-start-scan');
        const btnStopScan = document.getElementById('btn-stop-scan');
        const btnFinishScan = document.getElementById('btn-finish-scan');
        const btnPermRetry = document.getElementById('btn-perm-retry');
        const btnPermCancel = document.getElementById('btn-perm-cancel');
        const btnGyroView = document.getElementById('btn-gyro-view');
        const btnResetView = document.getElementById('btn-reset-view');
        const btnNewScan = document.getElementById('btn-new-scan');

        if(btnStartScan) {
            btnStartScan.onclick = async function() {
                console.log("✅ Click en INICIAR ESCÁNER");
                resetScannerState();
                showScannerState('perm');
                
                try {
                    await requestCameraPermission();
                    await requestGyroPermission();
                    startScanning();
                } catch(err) {
                    console.error('❌ Error:', err);
                    document.getElementById('btn-perm-retry').classList.remove('hidden');
                }
            };
        }

        if(btnPermCancel) {
            btnPermCancel.onclick = () => {
                console.log("❌ Cancelar permisos");
                stopScanning();
                showScannerState('idle');
            };
        }

        if(btnPermRetry) {
            btnPermRetry.onclick = async () => {
                try {
                    await requestCameraPermission();
                    startScanning();
                } catch(err) {
                    console.error('Error:', err);
                }
            };
        }

        if(btnStopScan) {
            btnStopScan.onclick = () => {
                console.log("⏹️ Detener escaneo");
                stopScanning();
                showScannerState('idle');
            };
        }

        if(btnFinishScan) {
            btnFinishScan.onclick = async () => {
                console.log("✓ Finalizar escaneo");
                stopScanning();
                showScannerState('processing');
                
                for(let i = 1; i <= 100; i += 10) {
                    document.getElementById('proc-fill').style.width = i + '%';
                    await new Promise(r => setTimeout(r, 200));
                }
                
                generate3DModel();
                showScannerState('viewer');
                showViewer360();
            };
        }

        if(btnGyroView) {
            btnGyroView.onclick = () => {
                const lang = localStorage.getItem('lang') || 'es';
                alert(lang === 'es' ? '📱 Modo giroscópico - Mueve el dispositivo para ver alrededor' : '📱 Gyro mode - Move your device to look around');
            };
        }

        if(btnResetView) {
            btnResetView.onclick = () => {
                showViewer360();
            };
        }

        if(btnNewScan) {
            btnNewScan.onclick = () => {
                resetScannerState();
                showScannerState('idle');
            };
        }

        window.addEventListener('deviceorientation', (event) => {
            scannerState.deviceOrientation = {
                alpha: event.alpha || 0,
                beta: event.beta || 0,
                gamma: event.gamma || 0
            };
            updateCompass();
        });
    };

    async function requestCameraPermission() {
        return new Promise(async (resolve, reject) => {
            const msg = document.getElementById('perm-msg');
            const permCam = document.getElementById('perm-cam');
            
            if(msg) msg.innerText = '📷 Solicitando acceso a la cámara...';
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment', 
                        width: { ideal: 1280 }, 
                        height: { ideal: 720 } 
                    } 
                });
                
                scannerState.videoStream = stream;
                
                if(permCam) {
                    permCam.querySelector('.perm-status').classList.remove('pend');
                    permCam.querySelector('.perm-status').classList.add('ok');
                    permCam.querySelector('.perm-status').innerText = '✓';
                }
                
                if(msg) msg.innerText = '✓ Cámara otorgada. Solicitando giroscopio...';
                console.log("✓ Cámara obtenida");
                resolve();
            } catch(err) {
                if(msg) msg.innerText = '⚠ Acceso a cámara denegado';
                console.error("❌ Error cámara:", err);
                reject(err);
            }
        });
    }

    async function requestGyroPermission() {
        return new Promise((resolve) => {
            const permGyro = document.getElementById('perm-gyro');
            
            if('DeviceOrientationEvent' in window) {
                if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if(permissionState === 'granted') {
                                if(permGyro) {
                                    permGyro.querySelector('.perm-status').classList.remove('pend');
                                    permGyro.querySelector('.perm-status').classList.add('ok');
                                    permGyro.querySelector('.perm-status').innerText = '✓';
                                }
                                console.log("✓ Giroscopio otorgado");
                            }
                            resolve();
                        })
                        .catch(() => {
                            console.log("⚠ Giroscopio no disponible");
                            resolve();
                        });
                } else {
                    if(permGyro) {
                        permGyro.querySelector('.perm-status').classList.remove('pend');
                        permGyro.querySelector('.perm-status').classList.add('ok');
                        permGyro.querySelector('.perm-status').innerText = '✓';
                    }
                    console.log("✓ Giroscopio disponible");
                    resolve();
                }
            } else {
                console.log("⚠ DeviceOrientation no disponible");
                resolve();
            }
        });
    }

    function startScanning() {
        console.log("🎥 Iniciando captura...");
        showScannerState('scanning');
        
        const video = document.getElementById('scan-video');
        const canvas = document.getElementById('scan-canvas');
        
        if(video && scannerState.videoStream) {
            video.srcObject = scannerState.videoStream;
            video.play().catch(e => console.error("Error play:", e));
            
            scannerState.captureInterval = setInterval(() => {
                if(!scannerState.isScanning) {
                    clearInterval(scannerState.captureInterval);
                    return;
                }
                
                if(canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                    const ctx = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    scannerState.frames.push({
                        data: imageData,
                        orientation: { ...scannerState.deviceOrientation },
                        timestamp: Date.now()
                    });
                    
                    detectZone();
                    updateScanStats();
                }
            }, 500);
        }
        
        scannerState.isScanning = true;
        const finishBtn = document.getElementById('btn-finish-scan');
        if(finishBtn) finishBtn.disabled = false;
    }

    function stopScanning() {
        console.log("⏹️ Deteniendo escaneo...");
        scannerState.isScanning = false;
        
        if(scannerState.captureInterval) {
            clearInterval(scannerState.captureInterval);
        }
        
        if(scannerState.videoStream) {
            scannerState.videoStream.getTracks().forEach(track => track.stop());
            scannerState.videoStream = null;
        }
    }

    function detectZone() {
        const alpha = Math.round(scannerState.deviceOrientation.alpha / 45);
        const beta = Math.round(scannerState.deviceOrientation.beta / 45);
        const zoneKey = `${alpha}-${beta}`;
        
        scannerState.zones.add(zoneKey);
        
        const coverage = Math.min((scannerState.zones.size / 64) * 100, 100);
        scannerState.coverage = coverage;
        
        const covPct = document.getElementById('cov-pct');
        const covFill = document.getElementById('cov-fill');
        
        if(covPct) covPct.innerText = Math.round(coverage) + '%';
        if(covFill) covFill.style.width = coverage + '%';
    }

    function updateScanStats() {
        const zonesEl = document.getElementById('zones-captured');
        const framesEl = document.getElementById('frames-total');
        const qualityEl = document.getElementById('scan-quality');
        
        if(zonesEl) zonesEl.innerText = scannerState.zones.size;
        if(framesEl) framesEl.innerText = scannerState.frames.length;
        
        let quality = '—';
        if(scannerState.frames.length > 50) quality = 'EXCELENTE';
        else if(scannerState.frames.length > 30) quality = 'BUENA';
        else if(scannerState.frames.length > 10) quality = 'MEDIA';
        
        if(qualityEl) qualityEl.innerText = quality;
    }

    function updateCompass() {
        const needle = document.getElementById('compass-needle');
        if(needle) {
            needle.style.transform = `rotate(${scannerState.deviceOrientation.alpha}deg)`;
        }
        
        const azEl = document.getElementById('hud-az');
        const el = document.getElementById('hud-el');
        
        if(azEl) azEl.innerText = `AZ ${Math.round(scannerState.deviceOrientation.alpha)}°`;
        if(el) el.innerText = `EL ${Math.round(scannerState.deviceOrientation.beta)}°`;
    }

    function generate3DModel() {
        console.log("🔧 Generando modelo 3D...");
        if(scannerState.frames.length === 0) return;
        
        scannerState.frames.forEach((frame, index) => {
            const imageData = frame.data;
            const data = imageData.data;
            
            for(let i = 0; i < data.length; i += 40) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                
                if(brightness > 50) {
                    const angle = (index / Math.max(scannerState.frames.length, 1)) * Math.PI * 2;
                    const distance = (brightness / 255) * 3;
                    const verticalPos = (Math.random() - 0.5) * 2;
                    
                    scannerState.pointCloud.push({
                        x: Math.cos(angle) * distance,
                        y: verticalPos,
                        z: Math.sin(angle) * distance,
                        color: new THREE.Color(r/255, g/255, b/255)
                    });
                }
            }
        });
        console.log("✓ Puntos generados:", scannerState.pointCloud.length);
    }

    function showViewer360() {
        console.log("📺 Mostrando visor 360...");
        const viewer = document.getElementById('pano-viewer');
        if(!viewer || typeof THREE === 'undefined') {
            console.error("❌ THREE.js no disponible o viewer no existe");
            return;
        }
        
        viewer.innerHTML = '';
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(viewer.clientWidth, viewer.clientHeight);
        viewer.appendChild(renderer.domElement);
        
        const geometry = new THREE.SphereGeometry(500, 64, 32);
        geometry.scale(-1, 1, 1);
        
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if(scannerState.pointCloud.length > 0) {
            scannerState.pointCloud.forEach(point => {
                const x = ((Math.atan2(point.z, point.x) / Math.PI + 1) / 2) * canvas.width;
                const y = ((Math.asin(point.y) / Math.PI + 0.5)) * canvas.height;
                
                if(x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                    ctx.fillStyle = `rgb(${Math.round(point.color.r * 255)},${Math.round(point.color.g * 255)},${Math.round(point.color.b * 255)})`;
                    ctx.fillRect(x, y, 3, 3);
                }
            });
        } else {
            for(let i = 0; i < canvas.width; i += 20) {
                for(let j = 0; j < canvas.height; j += 20) {
                    ctx.fillStyle = `hsl(${(i/canvas.width)*360}, 80%, 50%)`;
                    ctx.fillRect(i, j, 15, 15);
                }
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        
        camera.position.set(0, 0, 0);
        
        let isDrag = false;
        let prevPos = { x: 0, y: 0 };
        
        renderer.domElement.addEventListener('mousedown', () => { isDrag = true; });
        renderer.domElement.addEventListener('mousemove', (e) => {
            if(isDrag) {
                const deltaX = e.clientX - prevPos.x;
                const deltaY = e.clientY - prevPos.y;
                camera.rotation.y -= deltaX * 0.005;
                camera.rotation.x -= deltaY * 0.005;
            }
            prevPos = { x: e.clientX, y: e.clientY };
        });
        renderer.domElement.addEventListener('mouseup', () => { isDrag = false; });
        
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        
        const vhZones = document.getElementById('vh-zones');
        const vhCoverage = document.getElementById('vh-coverage');
        
        if(vhZones) vhZones.innerText = scannerState.zones.size + ' ZONAS';
        if(vhCoverage) vhCoverage.innerText = Math.round(scannerState.coverage) + '%';
    }

    function showScannerState(state) {
        const states = ['idle', 'perm', 'scanning', 'processing', 'viewer'];
        states.forEach(s => {
            const el = document.getElementById(`scanner-${s}`);
            if(el) el.classList.add('hidden');
        });
        
        const el = document.getElementById(`scanner-${state}`);
        if(el) {
            el.classList.remove('hidden');
            console.log(`📍 Estado del escáner: ${state}`);
        }
    }

    function resetScannerState() {
        scannerState = {
            isScanning: false,
            frames: [],
            zones: new Set(),
            coverage: 0,
            videoStream: null,
            deviceOrientation: { alpha: 0, beta: 0, gamma: 0 },
            pointCloud: [],
            panorama: null,
            renderer360: null,
            captureInterval: null
        };
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

        } catch(e) { console.error("3D Error:", e); }
    }
});
