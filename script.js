/* ==========================================================================
   SHARAD GHOLSE - Clean Portfolio Engine
   ========================================================================== */

(function () {
  'use strict';

  // --- State Configuration ---
  const state = {
    theme: localStorage.getItem('sg_theme') || 'light',
    audioEnabled: false,
    shaderSpeed: 1.0,
    shaderChaos: 3.5,
    shaderPreset: 'quantum',
  };

  // ==========================================================================
  // 1. Theme Manager (Warm Light Mode Default + Compact Toggle)
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  function applyTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem('sg_theme', themeName);

    if (themeName === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
  }

  applyTheme(state.theme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      playSynthTone(750, 'sine', 0.08, 0.04);
    });
  }

  // ==========================================================================
  // 1.5. Full-Page Shiny Stardust Constellation Background Engine (Lightweight)
  // ==========================================================================
  function initShinyBackground() {
    const canvas = document.getElementById('bgShinyCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 36000), 32);

    class StarParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 1.8 + 0.8;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -(Math.random() * 0.3 + 0.1);
        this.alpha = Math.random() * 0.6 + 0.25;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.hueType = Math.floor(Math.random() * 3);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.twinklePhase += this.twinkleSpeed;

        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }

      draw() {
        const isDark = state.theme === 'dark';
        const currentAlpha = (Math.sin(this.twinklePhase) * 0.3 + 0.5) * (isDark ? 0.75 : 0.45);

        let color = '#2563eb';
        if (isDark) {
          if (this.hueType === 0) color = '#38bdf8';
          else if (this.hueType === 1) color = '#818cf8';
          else color = '#fbbf24';
        } else {
          if (this.hueType === 0) color = '#2563eb';
          else if (this.hueType === 1) color = '#0284c7';
          else color = '#d97706';
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new StarParticle());
    }

    function loop() {
      if (document.hidden) {
        requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const isDark = state.theme === 'dark';
      const lineColor = isDark ? 'rgba(56, 189, 248, 0.09)' : 'rgba(37, 99, 235, 0.05)';

      // Draw lightweight connecting constellation lines
      ctx.strokeStyle = lineColor;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 90) {
            ctx.globalAlpha = (1 - dist / 90) * (isDark ? 0.6 : 0.35);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // 2. Audio Synthesis
  // ==========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playSynthTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio catch
    }
  }

  const audioToggle = document.getElementById('audioToggle');
  const audioIcon = document.getElementById('audioIcon');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      if (state.audioEnabled) {
        initAudio();
        audioToggle.classList.add('active');
        if (audioIcon) audioIcon.textContent = 'volume_up';
        const label = audioToggle.querySelector('.sound-label');
        if (label) label.textContent = 'Audio: ON';
        playSynthTone(880, 'sine', 0.1, 0.06);
      } else {
        audioToggle.classList.remove('active');
        if (audioIcon) audioIcon.textContent = 'volume_off';
        const label = audioToggle.querySelector('.sound-label');
        if (label) label.textContent = 'Audio';
      }
    });
  }

  document.querySelectorAll('a, button, .tag-pill, .badge-pill, .social-link-item').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      playSynthTone(540, 'triangle', 0.03, 0.015);
    });
  });

  // ==========================================================================
  // 3. Three.js Hero 3D Physics Simulation Graph
  // ==========================================================================
  function initHeroThreeJs() {
    // Interactive background ambient glow cursor tracking
    window.addEventListener('mousemove', (e) => {
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    }, { passive: true });

    const container = document.getElementById('threejs-hero-container');
    if (!container || typeof THREE === 'undefined') return;

    let width = container.clientWidth || window.innerWidth || 800;
    let height = container.clientHeight || window.innerHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const skillNodes = [
      { name: 'C++', color: 0x2563eb },
      { name: 'Java', color: 0x0284c7 },
      { name: 'React', color: 0x0ea5e9 },
      { name: 'DSA', color: 0x4f46e5 },
      { name: 'OOP', color: 0x6366f1 },
      { name: 'SQLite', color: 0x0d9488 },
      { name: 'WebSockets', color: 0x10b981 },
      { name: 'Postgres', color: 0x3b82f6 },
      { name: 'HTML/CSS', color: 0xd97706 },
      { name: 'Git', color: 0x818cf8 },
    ];

    const nodes = [];
    const geometry = new THREE.IcosahedronGeometry(0.32, 2);

    skillNodes.forEach((item) => {
      const material = new THREE.MeshPhongMaterial({
        color: item.color,
        emissive: item.color,
        emissiveIntensity: 0.35,
        shininess: 70,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 7.5,
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 2.5
      );

      mesh.userData = {
        name: item.name,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.008
        ),
      };

      group.add(mesh);
      nodes.push(mesh);
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.16,
    });
    const lineGeo = new THREE.BufferGeometry();
    const lineMesh = new THREE.LineSegments(lineGeo, lineMaterial);
    scene.add(lineMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2563eb, 1.4, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const mouse3D = new THREE.Vector3(0, 0, 0);

    window.addEventListener('mousemove', (e) => {
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse3D.set(mx * 4.5, my * 3.0, 0);
    });

    window.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, textarea')) return;
      nodes.forEach((node) => {
        const diff = node.position.clone().sub(mouse3D);
        const dist = diff.length();
        if (dist < 4.5) {
          const impulse = diff.normalize().multiplyScalar(0.045 / Math.max(dist, 0.5));
          node.userData.velocity.add(impulse);
        }
      });
      playSynthTone(340, 'sine', 0.12, 0.05);
    });

    function animate() {
      requestAnimationFrame(animate);

      const positions = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.position.add(node.userData.velocity);

        if (Math.abs(node.position.x) > 4.6) node.userData.velocity.x *= -0.95;
        if (Math.abs(node.position.y) > 3.0) node.userData.velocity.y *= -0.95;
        if (Math.abs(node.position.z) > 2.0) node.userData.velocity.z *= -0.95;

        const attractForce = mouse3D.clone().sub(node.position).normalize().multiplyScalar(0.00035);
        node.userData.velocity.add(attractForce);

        node.userData.velocity.multiplyScalar(0.998);

        node.rotation.x += 0.01;
        node.rotation.y += 0.012;

        for (let j = i + 1; j < nodes.length; j++) {
          const dist = node.position.distanceTo(nodes[j].position);
          if (dist < 3.0) {
            positions.push(
              node.position.x, node.position.y, node.position.z,
              nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
            );
          }
        }
      }

      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      group.rotation.y += 0.001;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      width = container.clientWidth || window.innerWidth || 800;
      height = container.clientHeight || window.innerHeight || 600;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  }

  // ==========================================================================
  // 4. Next-Gen Cybernetic Systems Lab & Interactive Capabilities Matrix
  // ==========================================================================
  function initSystemsMatrixLab() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // --- State & Mode ---
    let currentMode = 'cosmos'; // 'cosmos' | 'sockets' | 'algorithms'
    let selectedSkillId = 'cpp';
    let hoveredNode = null;
    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };
    let rotX = 0.25;
    let rotY = 0.45;
    let targetRotX = 0.25;
    let targetRotY = 0.45;
    let rotVelX = 0.003;
    let rotVelY = 0.005;

    // FPS Telemetry
    let lastFpsTime = performance.now();
    let frameCount = 0;
    const fpsDisplay = document.getElementById('matrixFps');

    // Shockwave particles for cosmos
    const shockwaves = [];
    const ambientStars = [];

    // --- Skill Database Dictionary ---
    const SKILL_DB = {
      cpp: {
        name: 'C++ (Modern Systems)',
        category: 'Systems & Low-Level',
        desc: 'High-performance systems programming with direct memory control, RAII concurrency, and zero-cost abstractions.',
        metrics: ['Procedural / OOP', 'Direct Hardware', 'std::thread / Posix'],
        code: 'std::unique_ptr<SocketServer> srv = std::make_unique<SocketServer>(8080);',
        color: '#38bdf8',
        logoHtml: '<i class="devicon-cplusplus-plain colored"></i>',
        connected: ['sockets', 'oop', 'dsa', 'architecture', 'sqlite']
      },
      java: {
        name: 'Java (Enterprise & JVM)',
        category: 'Backend & OOP',
        desc: 'Robust object-oriented architectures, JVM memory profiling, multi-threading, and enterprise application frameworks.',
        metrics: ['Strict OOP', 'JVM GC Engine', 'ExecutorService'],
        code: 'CompletableFuture.supplyAsync(() -> queryDatabase(pool));',
        color: '#f97316',
        logoHtml: '<i class="devicon-java-plain colored"></i>',
        connected: ['oop', 'dsa', 'mysql', 'postgres', 'architecture']
      },
      react: {
        name: 'React (Component Architecture)',
        category: 'Frontend & UI',
        desc: 'Declarative component-driven interfaces, custom hooks state management, and optimized virtual DOM rendering.',
        metrics: ['Declarative UI', 'Virtual DOM Diff', 'Custom Hooks'],
        code: 'const [socketData, setSocketData] = useState<Packet[]>([]);',
        color: '#06b6d4',
        logoHtml: '<i class="devicon-react-original colored"></i>',
        connected: ['javascript', 'htmlcss', 'websockets', 'git']
      },
      javascript: {
        name: 'JavaScript (ES6+ / V8)',
        category: 'Frontend & Runtime',
        desc: 'Asynchronous event-loop execution, Promises, WebGL bindings, and dynamic web application logic.',
        metrics: ['Event-Driven', 'V8 JIT Compiled', 'Async / Await'],
        code: 'const response = await fetch("/api/v1/metrics").then(r => r.json());',
        color: '#eab308',
        logoHtml: '<i class="devicon-javascript-plain colored"></i>',
        connected: ['react', 'htmlcss', 'websockets', 'vscode']
      },
      htmlcss: {
        name: 'HTML5 & Modern CSS3',
        category: 'UI & Styling',
        desc: 'Semantic accessible web layouts, CSS Grid/Flexbox, custom properties, and GPU-accelerated keyframe transitions.',
        metrics: ['Semantic Markup', 'GPU Keyframes', 'WCAG 2.1 AA'],
        code: 'backdrop-filter: blur(16px); transform: translate3d(0,0,0);',
        color: '#ec4899',
        logoHtml: '<i class="devicon-html5-plain colored"></i>',
        connected: ['react', 'javascript']
      },
      dsa: {
        name: 'Data Structures & Algorithms',
        category: 'Core Computer Science',
        desc: 'Algorithmic efficiency mastery: Graph traversals (BFS/DFS, Dijkstra), Balanced Trees (AVL/Red-Black), Dynamic Programming.',
        metrics: ['Big-O Analysis', 'O(V + E) / O(log N)', 'Cache Locality'],
        code: 'priority_queue<Node, vector<Node>, greater<Node>> pq;',
        color: '#34d399',
        logoHtml: '<span class="material-symbols-outlined color-cyan">account_tree</span>',
        connected: ['cpp', 'java', 'architecture', 'debugging']
      },
      oop: {
        name: 'Object-Oriented Programming',
        category: 'Software Engineering',
        desc: 'Clean encapsulation, polymorphic inheritance, SOLID design patterns, and decoupled interface abstractions.',
        metrics: ['SOLID Principles', 'Design Patterns', 'Polymorphism'],
        code: 'class NetworkHandler : public INetworkObserver { ... };',
        color: '#a855f7',
        logoHtml: '<span class="material-symbols-outlined color-purple">category</span>',
        connected: ['cpp', 'java', 'architecture']
      },
      sockets: {
        name: 'Socket Programming',
        category: 'Systems Networking',
        desc: 'Low-level Berkeley sockets (AF_INET, SOCK_STREAM), non-blocking I/O multiplexing (epoll/select), and TCP packet buffering.',
        metrics: ['TCP / UDP Protocols', 'epoll / select I/O', 'Sub-ms RTT'],
        code: 'int sfd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0);',
        color: '#10b981',
        logoHtml: '<span class="material-symbols-outlined color-emerald">lan</span>',
        connected: ['cpp', 'websockets', 'architecture', 'dsa']
      },
      architecture: {
        name: 'System Architecture',
        category: 'System Design',
        desc: 'Designing scalable decoupled microservices, database sharding, caching layers, and high-availability concurrent pipelines.',
        metrics: ['High Availability', 'Decoupled Topology', 'Fault Tolerance'],
        code: '// Reactor Pattern + Thread Pool Work-Stealing Queue',
        color: '#6366f1',
        logoHtml: '<span class="material-symbols-outlined color-amber">architecture</span>',
        connected: ['cpp', 'sockets', 'dsa', 'postgres', 'oop']
      },
      debugging: {
        name: 'Debugging & SDLC',
        category: 'Engineering Practice',
        desc: 'GDB runtime memory inspection, Valgrind leak detection, CI/CD pipeline automation, and unit/integration testing.',
        metrics: ['Valgrind / GDB', 'Zero Memory Leaks', 'Automated CI'],
        code: 'gdb --args ./server_bin --threads=8 --port=8080',
        color: '#f43f5e',
        logoHtml: '<span class="material-symbols-outlined color-rose">bug_report</span>',
        connected: ['cpp', 'git', 'vscode', 'dsa']
      },
      sqlite: {
        name: 'SQLite (Embedded SQL)',
        category: 'Databases & Storage',
        desc: 'Self-contained zero-configuration serverless database engine with transactional ACID compliance and low memory footprint.',
        metrics: ['Zero-Config', 'WAL Mode', 'Single-File ACID'],
        code: 'PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;',
        color: '#38bdf8',
        logoHtml: '<i class="devicon-sqlite-plain colored"></i>',
        connected: ['cpp', 'postgres', 'mysql']
      },
      postgres: {
        name: 'PostgreSQL (Enterprise RDBMS)',
        category: 'Databases & Storage',
        desc: 'Advanced relational database with MVCC concurrency, JSONB document querying, indexing (B-Tree/GiST), and query planning.',
        metrics: ['ACID MVCC', 'B-Tree / GIN Indexes', 'Connection Pool'],
        code: 'EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = $1;',
        color: '#3b82f6',
        logoHtml: '<i class="devicon-postgresql-plain colored"></i>',
        connected: ['java', 'architecture', 'php', 'sqlite']
      },
      mysql: {
        name: 'MySQL (Relational Database)',
        category: 'Databases & Storage',
        desc: 'Scalable relational data management with InnoDB storage engine, replication clusters, and indexed query optimizations.',
        metrics: ['InnoDB Engine', 'Row-Level Locking', 'Clustered Index'],
        code: 'SELECT u.id, COUNT(t.id) FROM users u LEFT JOIN tx t GROUP BY u.id;',
        color: '#f59e0b',
        logoHtml: '<i class="devicon-mysql-plain colored"></i>',
        connected: ['php', 'java', 'postgres']
      },
      websockets: {
        name: 'WebSockets (Real-Time Duplex)',
        category: 'Networking & Protocols',
        desc: 'Full-duplex persistent communication channels over TCP for instant low-latency client-server state synchronization.',
        metrics: ['Full-Duplex TCP', 'Frame RFC6455', '<5ms Latency'],
        code: 'ws.send(JSON.stringify({ type: "SYNC_EVENT", timestamp: Date.now() }));',
        color: '#06b6d4',
        logoHtml: '<span class="material-symbols-outlined color-cyan">sensors</span>',
        connected: ['react', 'sockets', 'javascript']
      },
      git: {
        name: 'Git & GitHub Version Control',
        category: 'Developer Tooling',
        desc: 'Distributed version control, atomic branching strategies, rebase workflows, GitHub Actions CI/CD automation.',
        metrics: ['Git Flow', 'CI/CD Actions', 'Conflict Resolv.'],
        code: 'git checkout -b feat/kernel-opt && git commit -m "feat: epoll"',
        color: '#ea580c',
        logoHtml: '<i class="devicon-git-plain colored"></i>',
        connected: ['vscode', 'debugging', 'react']
      },
      vscode: {
        name: 'VS Code & Tooling Ecosystem',
        category: 'Developer Environment',
        desc: 'Modern IDE development with custom launch configurations, remote SSH container development, and multi-language LSP tooling.',
        metrics: ['LSP / IntelliSense', 'GDB Integration', 'Custom Tasks'],
        code: '{ "version": "2.0.0", "tasks": [{ "label": "Run Server" }] }',
        color: '#0284c7',
        logoHtml: '<i class="devicon-vscode-plain colored"></i>',
        connected: ['git', 'debugging', 'javascript']
      }
    };

    // --- Official SVG Icons Map for 3D Cosmos Rendering ---
    const SVG_ICONS = {
      cpp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#00599C" d="M117.7 58.7l-51.5-29.8c-1.4-.8-3.1-.8-4.5 0L10.3 58.7c-1.4.8-2.3 2.3-2.3 3.9v59.4c0 1.6.9 3.1 2.3 3.9l51.5 29.8c1.4.8 3.1.8 4.5 0l51.5-29.8c1.4-.8 2.3-2.3 2.3-3.9V62.6c-.1-1.6-.9-3.1-2.4-3.9z"/><path fill="#FFF" d="M64 45.2c-15.3 0-27.8 12.5-27.8 27.8s12.5 27.8 27.8 27.8c11.5 0 21.4-7 25.6-17.1h-12c-3.1 4.7-8.5 7.8-14.7 7.8-9.8 0-17.8-8-17.8-17.8s8-17.8 17.8-17.8c6.1 0 11.5 3.1 14.7 7.8h12c-4.2-10-14.1-17.1-25.6-17.1zm29.8 23.9v-6.9h-6.9v-5.2h6.9v-6.9h5.2v6.9h6.9v5.2h-6.9v6.9h-5.2zm17.4 0v-6.9h-6.9v-5.2h6.9v-6.9h5.2v6.9h6.9v5.2h-6.9v6.9h-5.2z"/></svg>`,
      java: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#5382A1" d="M46.7 89.2c-12.8 1-22.3-5.2-19.1-12.8 2.4-5.6 11.7-8.8 22.8-8.2 12.8.7 20.8 5.7 18.2 11.3-2.2 4.9-10.4 8.7-21.9 9.7z"/><path fill="#E76F00" d="M49.2 64.9c-8.9-8.4-1.2-16.5 4.5-23.7 2.3-3 4-5.9 3.5-9.3-.4-2.8-2.2-5.4-5.1-6.7 5.8 2.4 9.4 6.7 8.3 12.3-1.1 5.3-6.2 9.4-10.4 13.9-4.2 4.6-4.5 9.4-.8 13.5z"/><path fill="#E76F00" d="M59.1 50.8c3.2-3.8 5.5-7.7 5.1-12.2-.4-4.8-4.2-8.5-4.2-13.4 5.3 3.6 8.5 8.9 7.3 15.4-1 5.4-4.9 9.8-8.2 10.2z"/><path fill="#5382A1" d="M85.4 104.9c-20.9 9.1-51.7 8.4-66.5-1.1-4.7-3-2.4-6 4.3-8.8 7.4-3.1 19.5-4.7 32.7-4.6 20.9.2 36.2 5.5 29.5 14.5z"/></svg>`,
      react: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.232 23 20.463"><circle r="2.05" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1.2" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`,
      javascript: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#F7DF1E" d="M0 0h128v128H0z"/><path fill="#000" d="M67.3 99.4c1.9 3.1 4.7 5.4 9.1 5.4 4.5 0 7.3-2.2 7.3-5.3 0-3.6-2.9-4.9-7.8-7l-2.7-1.1c-7.7-3.3-12.9-7.4-12.9-16.3 0-8.1 6.2-14.2 15.9-14.2 6.9 0 11.9 2.4 15.3 8.3l-6.8 4.4c-1.7-2.9-3.7-4.2-7.5-4.2-3.5 0-5.8 2.2-5.8 4.9 0 3.2 2.1 4.5 6.9 6.6l2.7 1.1c9.3 4 14.3 8 14.3 17.2 0 9.8-7.7 15.2-17.8 15.2-9.9 0-16.2-4.8-19-10.4l8.9-4.6zm-38.6.6c1.7 2.8 3.9 5.1 7.8 5.1 4 0 6.6-1.7 6.6-8.2V61.5h10.4v35.3c0 11.9-7 17.3-16.8 17.3-7.7 0-12.7-3.9-15.5-9.6l7.5-4.5z"/></svg>`,
      htmlcss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#E44D26" d="M19.2 113.6L9.6 6.4h108.8l-9.6 107.2-44.8 12.8z"/><path fill="#F16529" d="M64 116.8l36.8-10.4 8-89.6H64z"/><path fill="#EBEBEB" d="M64 47.2H46.4l-1.6-16h38.4l1.6-16H30.4l4.8 48H64zm0 41.6l-.8.2-15.2-4-1-11.2H33.6l1.6 20.8 28.8 8z"/><path fill="#FFF" d="M64 63.2h15.2l-1.6 16.8L64 84V97l26.4-7.2L93.6 47.2H64zM96 15.2H64v16h33.6z"/></svg>`,
      sqlite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#003B57" d="M24 24h80v80H24z"/><path fill="#00ADEF" d="M64 36c-18 0-32 5-32 12v40c0 7 14 12 32 12s32-5 32-12V48c0-7-14-12-32-12zm0 8c14 0 24 3 24 6s-10 6-24 6-24-3-24-6 10-6 24-6z"/></svg>`,
      postgres: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#336791" d="M64 12c-28.7 0-52 23.3-52 52 0 22.5 14.3 41.7 34.4 48.8 2.6.5 3.6-1.1 3.6-2.5v-9.6c-13.9 3-16.8-5.9-16.8-5.9-2.3-5.8-5.6-7.3-5.6-7.3-4.5-3.1.3-3 .3-3 5 .4 7.7 5.2 7.7 5.2 4.5 7.6 11.7 5.4 14.6 4.1.5-3.2 1.8-5.4 3.2-6.7-11.1-1.3-22.8-5.5-22.8-24.7 0-5.5 2-9.9 5.2-13.4-.5-1.3-2.3-6.4.5-13.3 0 0 4.2-1.3 13.8 5.1 4-1.1 8.3-1.7 12.6-1.7 4.3 0 8.6.6 12.6 1.7 9.5-6.5 13.7-5.1 13.7-5.1 2.8 6.9 1 12 .5 13.3 3.3 3.5 5.2 8 5.2 13.4 0 19.2-11.7 23.4-22.9 24.6 1.8 1.6 3.4 4.6 3.4 9.3v13.8c0 1.4 1 3 3.6 2.5 20.1-7.1 34.4-26.3 34.4-48.8 0-28.7-23.3-52-52-52z"/></svg>`,
      mysql: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#00758F" d="M20 90c10-25 35-40 60-35-15 15-20 30-20 35z"/><path fill="#F29111" d="M75 35c15 5 25 20 25 35-10-5-20-10-25-35z"/></svg>`,
      git: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#F05032" d="M123.6 54.8L73.2 4.4c-5.8-5.8-15.4-5.8-21.2 0L4.4 52.1c-5.8 5.8-5.8 15.4 0 21.2l50.4 50.4c5.8 5.8 15.4 5.8 21.2 0l47.6-47.6c5.9-5.9 5.9-15.4 0-21.3z"/><circle cx="50" cy="50" r="10" fill="#FFF"/><circle cx="78" cy="78" r="10" fill="#FFF"/><circle cx="50" cy="78" r="10" fill="#FFF"/><path stroke="#FFF" stroke-width="6" d="M50 50v28M50 50l28 28"/></svg>`,
      vscode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#007ACC" d="M96 8l24 12v88l-24 12L36 76 12 94 4 88V40l8-6 24 18 60-44z"/><path fill="#1F9CF0" d="M96 8L50 64l46 56 24-12V20L96 8z"/></svg>`,
      dsa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="24" r="14" fill="#34D399"/><circle cx="34" cy="80" r="12" fill="#38BDF8"/><circle cx="94" cy="80" r="12" fill="#38BDF8"/><path stroke="#FFF" stroke-width="6" d="M64 38L34 68M64 38l30 30"/></svg>`,
      oop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#A855F7" d="M64 16l44 24v48l-44 24-44-24V40z"/><path fill="#C084FC" d="M64 16l44 24-44 24-44-24z"/><path fill="#9333EA" d="M64 64l44-24v48L64 112z"/></svg>`,
      sockets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="20" fill="#10B981"/><path stroke="#10B981" stroke-width="8" fill="none" d="M64 20a44 44 0 0 1 44 44M64 32a32 32 0 0 1 32 32M20 64a44 44 0 0 1 44-44M32 64a32 32 0 0 1 32-32"/></svg>`,
      architecture: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect x="20" y="20" width="36" height="28" rx="6" fill="#F59E0B"/><rect x="72" y="20" width="36" height="28" rx="6" fill="#F59E0B"/><rect x="46" y="80" width="36" height="28" rx="6" fill="#F59E0B"/><path stroke="#FFF" stroke-width="6" d="M38 48v20h52V48M64 68v12"/></svg>`,
      debugging: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="68" r="28" fill="#F43F5E"/><circle cx="64" cy="34" r="16" fill="#F43F5E"/><path stroke="#F43F5E" stroke-width="8" stroke-linecap="round" d="M32 54l-16-8M32 68H12M32 82l-16 8M96 54l16-8M96 68h20M96 82l16 8"/></svg>`,
      websockets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="14" fill="#06B6D4"/><path stroke="#06B6D4" stroke-width="8" fill="none" stroke-linecap="round" d="M40 40a34 34 0 0 0 0 48M88 40a34 34 0 0 1 0 48M24 24a56 56 0 0 0 0 80M104 24a56 56 0 0 1 0 80"/></svg>`
    };

    // Pre-create HTML Image objects for fast canvas rendering
    const nodeIconImages = {};
    Object.keys(SVG_ICONS).forEach((k) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(SVG_ICONS[k]);
      nodeIconImages[k] = img;
    });

    // --- 3D Constellation Nodes (Mode 1) ---
    const skillKeys = Object.keys(SKILL_DB);
    const totalNodes = skillKeys.length;
    const cosmosNodes = [];

    // Distribute on 3D Sphere using Golden Spiral (Radius 185 for spacious larger canvas)
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    skillKeys.forEach((key, idx) => {
      const y = 1 - (idx / (totalNodes - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * idx;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      cosmosNodes.push({
        id: key,
        data: SKILL_DB[key],
        ox: x * 185, // 3D coordinates
        oy: y * 185,
        oz: z * 185,
        px: 0, // projected 2D coordinates
        py: 0,
        scale: 1,
        alpha: 1,
        pulsePhase: Math.random() * Math.PI * 2,
        shockOffset: 0
      });
    });

    // Background ambient particles for 3D Cosmos
    for (let i = 0; i < 45; i++) {
      ambientStars.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 400,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    // --- Mode 2: Sockets & Concurrency Simulation State ---
    let socketPackets = [];
    let socketRttVal = 0.42;
    let packetCounter = 284;
    let socketClients = [
      { id: 'cli1', label: 'Client-1 (React App)', angle: -Math.PI * 0.75, dist: 130, color: '#38bdf8' },
      { id: 'cli2', label: 'Client-2 (Mobile Socket)', angle: -Math.PI * 0.25, dist: 130, color: '#a855f7' },
      { id: 'cli3', label: 'Worker Thread (Batch)', angle: Math.PI * 0.75, dist: 130, color: '#34d399' },
      { id: 'cli4', label: 'DB Pool (Postgres)', angle: Math.PI * 0.25, dist: 130, color: '#fbbf24' }
    ];
    let throughputHistory = new Array(40).fill(12);

    // --- Mode 3: Algorithm Lab State ---
    let activeAlgo = 'quicksort'; // 'quicksort' | 'dijkstra' | 'btree'
    let isAlgoRunning = false;
    let algoClockSpeed = 6;

    // Quicksort state
    const ARRAY_SIZE = 22;
    let sortArray = [];
    let sortSteps = [];
    let sortStepIdx = 0;
    let sortHighlights = { pivot: -1, compare1: -1, compare2: -1, sorted: [] };

    function generateRandomArray() {
      sortArray = [];
      for (let i = 0; i < ARRAY_SIZE; i++) {
        sortArray.push(Math.floor(Math.random() * 85) + 15);
      }
      buildQuicksortSteps();
    }

    function buildQuicksortSteps() {
      sortSteps = [];
      const arr = [...sortArray];

      function qs(start, end) {
        if (start >= end) {
          if (start === end) sortSteps.push({ type: 'sorted', idx: start });
          return;
        }
        const pivotVal = arr[end];
        let pIndex = start;
        sortSteps.push({ type: 'pivot', pivot: end, compare1: -1, compare2: -1 });

        for (let i = start; i < end; i++) {
          sortSteps.push({ type: 'compare', pivot: end, compare1: i, compare2: pIndex });
          if (arr[i] < pivotVal) {
            const temp = arr[i];
            arr[i] = arr[pIndex];
            arr[pIndex] = temp;
            sortSteps.push({ type: 'swap', pivot: end, compare1: i, compare2: pIndex, arr: [...arr] });
            pIndex++;
          }
        }
        const temp = arr[pIndex];
        arr[pIndex] = arr[end];
        arr[end] = temp;
        sortSteps.push({ type: 'swap', pivot: pIndex, compare1: pIndex, compare2: end, arr: [...arr] });
        sortSteps.push({ type: 'sorted', idx: pIndex });

        qs(start, pIndex - 1);
        qs(pIndex + 1, end);
      }

      qs(0, arr.length - 1);
      sortStepIdx = 0;
      sortHighlights = { pivot: -1, compare1: -1, compare2: -1, sorted: [] };
    }
    // --- 3B. Dynamic Dijkstra Pathfinder State & Generator ---
    const gridCols = 8;
    const gridRows = 5;
    let dijkstraStart = 0;
    let dijkstraTarget = 39;
    let dijkstraWalls = [];
    let dijkstraVisitedOrder = []; // array of { idx, dist }
    let dijkstraVisitedMap = {}; // idx -> dist
    let dijkstraPath = [];
    let dijkstraStepIdx = 0;
    let dijkstraFound = false;

    function generateRandomDijkstra() {
      const totalCells = gridCols * gridRows;
      // Pick random start
      dijkstraStart = Math.floor(Math.random() * totalCells);

      // Pick random target with Manhattan distance >= 3
      const sR = Math.floor(dijkstraStart / gridCols);
      const sC = dijkstraStart % gridCols;
      let validTarget = false;
      let attempts = 0;
      while (!validTarget && attempts < 100) {
        attempts++;
        dijkstraTarget = Math.floor(Math.random() * totalCells);
        const tR = Math.floor(dijkstraTarget / gridCols);
        const tC = dijkstraTarget % gridCols;
        if (Math.abs(sR - tR) + Math.abs(sC - tC) >= 3 && dijkstraTarget !== dijkstraStart) {
          validTarget = true;
        }
      }

      // Generate 3-5 random walls/obstacles
      dijkstraWalls = [];
      const numWalls = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numWalls; i++) {
        const wall = Math.floor(Math.random() * totalCells);
        if (wall !== dijkstraStart && wall !== dijkstraTarget && !dijkstraWalls.includes(wall)) {
          dijkstraWalls.push(wall);
        }
      }

      // Run Dijkstra/BFS to pre-compute visited sequence and shortest path
      dijkstraVisitedOrder = [];
      dijkstraVisitedMap = {};
      dijkstraPath = [];
      dijkstraStepIdx = 0;
      dijkstraFound = false;

      const dist = new Array(totalCells).fill(Infinity);
      const parent = new Array(totalCells).fill(-1);
      const queue = [dijkstraStart];
      dist[dijkstraStart] = 0;

      while (queue.length > 0) {
        queue.sort((a, b) => dist[a] - dist[b]);
        const curr = queue.shift();
        dijkstraVisitedOrder.push({ idx: curr, dist: dist[curr] });

        if (curr === dijkstraTarget) {
          dijkstraFound = true;
          break;
        }

        const r = Math.floor(curr / gridCols);
        const c = curr % gridCols;
        const neighbors = [];
        if (r > 0) neighbors.push((r - 1) * gridCols + c); // UP
        if (r < gridRows - 1) neighbors.push((r + 1) * gridCols + c); // DOWN
        if (c > 0) neighbors.push(r * gridCols + (c - 1)); // LEFT
        if (c < gridCols - 1) neighbors.push(r * gridCols + (c + 1)); // RIGHT

        for (const n of neighbors) {
          if (!dijkstraWalls.includes(n) && dist[curr] + 1 < dist[n]) {
            dist[n] = dist[curr] + 1;
            parent[n] = curr;
            if (!queue.includes(n)) queue.push(n);
          }
        }
      }

      // Reconstruct shortest path
      if (dist[dijkstraTarget] !== Infinity) {
        let curr = dijkstraTarget;
        while (curr !== -1) {
          dijkstraPath.unshift(curr);
          curr = parent[curr];
        }
      }
    }
    generateRandomDijkstra();

    // --- 3C. Dynamic B-Tree & Cache Simulation State & Generator ---
    let btreeData = {
      rootKey: 50,
      leftKeys: [20, 35],
      rightKeys: [65, 80],
      queryKey: 35,
      targetNode: 'left',
      l1Latency: '0.8ns',
      l2Latency: '3.4ns',
      searchPhase: 0, // 0: query root, 1: traverse branch, 2: cache hit
      phaseTimer: 0
    };

    function generateRandomBTree() {
      const rootKey = Math.floor(Math.random() * 21) + 40; // 40..60
      const l1 = Math.floor(Math.random() * (rootKey - 25)) + 10;
      const l2 = l1 + Math.floor(Math.random() * (rootKey - l1 - 5)) + 3;
      const leftKeys = [l1, l2];

      const r1 = rootKey + Math.floor(Math.random() * 15) + 5;
      const r2 = r1 + Math.floor(Math.random() * 20) + 5;
      const rightKeys = [r1, r2];

      const options = [
        { key: rootKey, node: 'root' },
        { key: l1, node: 'left' },
        { key: l2, node: 'left' },
        { key: r1, node: 'right' },
        { key: r2, node: 'right' }
      ];
      const chosen = options[Math.floor(Math.random() * options.length)];

      btreeData = {
        rootKey,
        leftKeys,
        rightKeys,
        queryKey: chosen.key,
        targetNode: chosen.node,
        l1Latency: (Math.random() * 0.4 + 0.6).toFixed(1) + 'ns',
        l2Latency: (Math.random() * 1.5 + 2.5).toFixed(1) + 'ns',
        searchPhase: 0,
        phaseTimer: 0
      };
    }
    generateRandomBTree();

    // --- Canvas Resize & DPR Sync ---
    function resizeCanvas() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth || 600;
      const h = parent.clientHeight || 380;

      if (width !== w || height !== h) {
        width = w;
        height = h;
        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- Category Icons Map ---
    const categoryIconMap = {
      'Systems & Low-Level': 'terminal',
      'Backend & OOP': 'settings_suggest',
      'Frontend & UI': 'layers',
      'Frontend & Runtime': 'code',
      'UI & Styling': 'palette',
      'Backend & Web APIs': 'lan',
      'Core Computer Science': 'psychology',
      'Software Engineering': 'architecture',
      'Systems Networking': 'hub',
      'System Design': 'account_tree',
      'Engineering Practice': 'bug_report',
      'Databases & Storage': 'database',
      'Networking & Protocols': 'wifi_tethering',
      'Developer Tooling': 'commit',
      'Developer Environment': 'terminal'
    };

    // --- Inspector HUD Updater with Smooth Animation ---
    function updateInspector(skillId) {
      const info = SKILL_DB[skillId];
      if (!info) return;

      selectedSkillId = skillId;

      const inspectorCard = document.getElementById('deckInspector');
      const inspCat = document.getElementById('inspCategory');
      const inspCatIcon = document.getElementById('inspCategoryIcon');
      const inspStatus = document.getElementById('inspStatus');
      const inspTitle = document.getElementById('inspTitle');
      const inspTechLogo = document.getElementById('inspTechLogo');
      const inspDesc = document.getElementById('inspDesc');
      const inspMetric1 = document.getElementById('inspMetric1');
      const inspMetric2 = document.getElementById('inspMetric2');
      const inspMetric3 = document.getElementById('inspMetric3');
      const inspCode = document.getElementById('inspCode');

      if (inspCat) inspCat.textContent = info.category;
      if (inspCatIcon) inspCatIcon.textContent = categoryIconMap[info.category] || 'code';
      if (inspStatus) inspStatus.textContent = `● ${info.metrics[1] || 'OPTIMIZED'}`;
      if (inspTitle) inspTitle.textContent = info.name;
      if (inspTechLogo && info.logoHtml) inspTechLogo.innerHTML = info.logoHtml;
      if (inspDesc) inspDesc.textContent = info.desc;
      if (inspMetric1 && info.metrics[0]) inspMetric1.textContent = info.metrics[0];
      if (inspMetric2 && info.metrics[1]) inspMetric2.textContent = info.metrics[1];
      if (inspMetric3 && info.metrics[2]) inspMetric3.textContent = info.metrics[2];
      if (inspCode) inspCode.innerHTML = `<code>${info.code}</code>`;

      // Trigger card pulse & content entrance animation
      if (inspectorCard) {
        inspectorCard.classList.remove('animating');
        void inspectorCard.offsetWidth; // Force CSS reflow
        inspectorCard.classList.add('animating');
      }

      // Sync active state with left-side pills
      document.querySelectorAll('.interactive-tag').forEach((pill) => {
        if (pill.getAttribute('data-skill') === skillId) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }

    // Initialize with C++
    updateInspector('cpp');

    // Left-side tag triggers
    document.querySelectorAll('.interactive-tag').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-skill');
        if (id) {
          updateInspector(id);
          playSynthTone(720, 'triangle', 0.08, 0.04);

          // If in cosmos mode, rotate to face this node
          const targetNode = cosmosNodes.find((n) => n.id === id);
          if (targetNode) {
            targetNode.pulsePhase = 0;
            // Detonate a small mini-shockwave
            shockwaves.push({ x: targetNode.px, y: targetNode.py, r: 5, maxR: 70, alpha: 1.0, color: targetNode.data.color });
          }
        }
      });
    });

    // --- Mode Switcher Tabs ---
    const tabs = [
      { id: 'tabCosmos', mode: 'cosmos', controls: 'controlsCosmos' },
      { id: 'tabSockets', mode: 'sockets', controls: 'controlsSockets' },
      { id: 'tabAlgorithms', mode: 'algorithms', controls: 'controlsAlgorithms' }
    ];

    tabs.forEach((t) => {
      const btn = document.getElementById(t.id);
      if (btn) {
        btn.addEventListener('click', () => {
          tabs.forEach((ot) => {
            const b = document.getElementById(ot.id);
            const c = document.getElementById(ot.controls);
            if (b) b.classList.remove('active');
            if (c) c.classList.add('hidden');
          });

          btn.classList.add('active');
          const ctrl = document.getElementById(t.controls);
          if (ctrl) ctrl.classList.remove('hidden');

          currentMode = t.mode;
          playSynthTone(580 + (t.mode === 'cosmos' ? 0 : t.mode === 'sockets' ? 120 : 240), 'sine', 0.12, 0.05);
        });
      }
    });

    // --- Mouse & Touch Controls on Canvas ---
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging && currentMode === 'cosmos') {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        lastMousePos = { x: e.clientX, y: e.clientY };
      }

      // Hit test nodes in cosmos mode
      if (currentMode === 'cosmos') {
        let found = null;
        for (let i = cosmosNodes.length - 1; i >= 0; i--) {
          const n = cosmosNodes[i];
          const dist = Math.hypot(n.px - mouseX, n.py - mouseY);
          if (dist < 32 * n.scale) {
            found = n;
            break;
          }
        }
        hoveredNode = found;
        canvas.style.cursor = found ? 'pointer' : 'crosshair';
      }
    });

    canvas.addEventListener('click', (e) => {
      if (currentMode === 'cosmos' && hoveredNode) {
        updateInspector(hoveredNode.id);
        playSynthTone(820, 'sine', 0.1, 0.05);
        shockwaves.push({
          x: hoveredNode.px,
          y: hoveredNode.py,
          r: 8,
          maxR: 95,
          alpha: 1.0,
          color: hoveredNode.data.color
        });
      }
    });

    // --- Button Event Handlers for Mode 1 (Cosmos) ---
    const btnPulseCosmos = document.getElementById('btnPulseCosmos');
    if (btnPulseCosmos) {
      btnPulseCosmos.addEventListener('click', () => {
        shockwaves.push({
          x: width / 2,
          y: height / 2,
          r: 10,
          maxR: Math.max(width, height) * 0.85,
          alpha: 1.0,
          color: '#38bdf8'
        });
        playSynthTone(440, 'triangle', 0.2, 0.08);
      });
    }

    const btnResetCosmos = document.getElementById('btnResetCosmos');
    if (btnResetCosmos) {
      btnResetCosmos.addEventListener('click', () => {
        targetRotX = 0.25;
        targetRotY = 0.45;
        rotVelX = 0.003;
        rotVelY = 0.005;
        playSynthTone(600, 'sine', 0.08, 0.04);
      });
    }

    // --- Button Event Handlers for Mode 2 (Sockets) ---
    function sendSocketPacket(fromCenter = true, clientIdx = 0, type = 'TCP_DATA') {
      const client = socketClients[clientIdx % socketClients.length];
      const cx = width / 2;
      const cy = height / 2;
      const tx = cx + Math.cos(client.angle) * client.dist;
      const ty = cy + Math.sin(client.angle) * client.dist;

      socketPackets.push({
        sx: fromCenter ? cx : tx,
        sy: fromCenter ? cy : ty,
        tx: fromCenter ? tx : cx,
        ty: fromCenter ? ty : cy,
        progress: 0,
        speed: 0.028 + Math.random() * 0.015,
        color: client.color,
        type: type,
        client: client
      });

      packetCounter++;
      socketRttVal = (0.35 + Math.random() * 0.2).toFixed(2);
      const rttEl = document.getElementById('socketRtt');
      const pktEl = document.getElementById('socketPktCount');
      if (rttEl) rttEl.textContent = socketRttVal + ' ms';
      if (pktEl) pktEl.textContent = packetCounter;
    }

    const btnSendPacket = document.getElementById('btnSendPacket');
    if (btnSendPacket) {
      btnSendPacket.addEventListener('click', () => {
        const randCli = Math.floor(Math.random() * socketClients.length);
        sendSocketPacket(true, randCli, 'TCP_STREAM');
        playSynthTone(920, 'sine', 0.05, 0.03);
      });
    }

    const btnBroadcastPacket = document.getElementById('btnBroadcastPacket');
    if (btnBroadcastPacket) {
      btnBroadcastPacket.addEventListener('click', () => {
        socketClients.forEach((_, idx) => {
          sendSocketPacket(true, idx, 'BROADCAST');
        });
        playSynthTone(750, 'triangle', 0.12, 0.06);
      });
    }

    const btnSpikeLoad = document.getElementById('btnSpikeLoad');
    if (btnSpikeLoad) {
      btnSpikeLoad.addEventListener('click', () => {
        for (let i = 0; i < 24; i++) {
          setTimeout(() => {
            const randCli = Math.floor(Math.random() * socketClients.length);
            sendSocketPacket(Math.random() > 0.4, randCli, 'SPIKE_1K');
          }, i * 35);
        }
        playSynthTone(1050, 'sawtooth', 0.25, 0.05);
      });
    }

    // --- Button Event Handlers for Mode 3 (Algorithms) ---
    ['btnAlgoQuicksort', 'btnAlgoDijkstra', 'btnAlgoBTree'].forEach((id, idx) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.algo-chip').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const algos = ['quicksort', 'dijkstra', 'btree'];
          activeAlgo = algos[idx];
          isAlgoRunning = false;
          updateAlgoPlayBtn();

          // Generate fresh randomized state on tab switch
          if (activeAlgo === 'quicksort') generateRandomArray();
          else if (activeAlgo === 'dijkstra') generateRandomDijkstra();
          else if (activeAlgo === 'btree') generateRandomBTree();

          playSynthTone(680 + idx * 80, 'sine', 0.08, 0.04);
        });
      }
    });

    const btnRunAlgo = document.getElementById('btnRunAlgo');
    const algoPlayIcon = document.getElementById('algoPlayIcon');
    const algoPlayText = document.getElementById('algoPlayText');

    function updateAlgoPlayBtn() {
      if (algoPlayIcon) algoPlayIcon.textContent = isAlgoRunning ? 'pause' : 'play_arrow';
      if (algoPlayText) algoPlayText.textContent = isAlgoRunning ? 'Pause' : 'Run';
    }

    if (btnRunAlgo) {
      btnRunAlgo.addEventListener('click', () => {
        isAlgoRunning = !isAlgoRunning;
        updateAlgoPlayBtn();
        if (isAlgoRunning) {
          playSynthTone(850, 'sine', 0.08, 0.05);
        }
      });
    }

    const btnRandomizeAlgo = document.getElementById('btnRandomizeAlgo');
    if (btnRandomizeAlgo) {
      btnRandomizeAlgo.addEventListener('click', () => {
        isAlgoRunning = false;
        updateAlgoPlayBtn();
        if (activeAlgo === 'quicksort') generateRandomArray();
        else if (activeAlgo === 'dijkstra') generateRandomDijkstra();
        else if (activeAlgo === 'btree') generateRandomBTree();
        else {
          generateRandomArray();
          generateRandomDijkstra();
          generateRandomBTree();
        }
        playSynthTone(520, 'triangle', 0.08, 0.04);
      });
    }

    // --- Slider & Copy Event Handlers ---
    const cosmosForceInput = document.getElementById('cosmosForce');
    const cosmosForceVal = document.getElementById('cosmosForceVal');
    if (cosmosForceInput) {
      cosmosForceInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (cosmosForceVal) cosmosForceVal.textContent = val.toFixed(1) + 'x';
        cosmosNodes.forEach((n) => {
          n.shockOffset = (val - 1.0) * 35;
        });
      });
    }

    const algoSpeedSlider = document.getElementById('algoSpeedSlider');
    const algoSpeedVal = document.getElementById('algoSpeedVal');
    if (algoSpeedSlider) {
      algoSpeedSlider.addEventListener('input', (e) => {
        algoClockSpeed = parseInt(e.target.value, 10);
        if (algoSpeedVal) algoSpeedVal.textContent = algoClockSpeed + 'x';
      });
    }

    const btnCopySnippet = document.getElementById('btnCopySnippet');
    if (btnCopySnippet) {
      btnCopySnippet.addEventListener('click', () => {
        const snippetEl = document.getElementById('inspCode');
        if (snippetEl) {
          const text = snippetEl.textContent.trim();
          navigator.clipboard.writeText(text).then(() => {
            btnCopySnippet.classList.add('copied');
            const label = btnCopySnippet.querySelector('.copy-label');
            const icon = btnCopySnippet.querySelector('.icon-copy');
            if (label) label.textContent = 'Copied!';
            if (icon) icon.textContent = 'done';
            playSynthTone(980, 'sine', 0.08, 0.03);

            setTimeout(() => {
              btnCopySnippet.classList.remove('copied');
              if (label) label.textContent = 'Copy';
              if (icon) icon.textContent = 'content_copy';
            }, 2000);
          }).catch(() => { });
        }
      });
    }

    // ==========================================================================
    // MAIN RENDER LOOP (60 FPS Multi-Mode Engine)
    // ==========================================================================
    let algoTimer = 0;

    function render(timestamp) {
      resizeCanvas();

      // Clear Screen with deep tech background
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle cyber grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update FPS counter every half second
      frameCount++;
      if (timestamp - lastFpsTime >= 500) {
        const fps = Math.round((frameCount * 1000) / (timestamp - lastFpsTime));
        if (fpsDisplay) fpsDisplay.textContent = fps + ' FPS';
        frameCount = 0;
        lastFpsTime = timestamp;
      }

      // Render Mode
      if (currentMode === 'cosmos') {
        renderCosmosMode(timestamp);
      } else if (currentMode === 'sockets') {
        renderSocketsMode(timestamp);
      } else if (currentMode === 'algorithms') {
        renderAlgorithmsMode(timestamp);
      }

      requestAnimationFrame(render);
    }

    // ==========================================================================
    // MODE 1: 3D Neural Skill Cosmos
    // ==========================================================================
    function renderCosmosMode(t) {
      const cx = width / 2;
      const cy = height / 2;

      // Inertia & continuous auto-rotation
      if (!isDragging) {
        targetRotY += rotVelY;
        targetRotX += rotVelX;
      }
      rotX += (targetRotX - rotX) * 0.1;
      rotY += (targetRotY - rotY) * 0.1;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Draw 3D Orbital Gyroscopic Rings in Background for depth
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1.2;
      [145, 170].forEach((r, idx) => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.15) {
          const rx = Math.cos(a) * r;
          const rz = Math.sin(a) * r;
          const ry = idx === 0 ? 0 : Math.sin(a * 2) * 20;

          // Rotate Y
          let x1 = rx * cosY - rz * sinY;
          let z1 = rz * cosY + rx * sinY;
          // Rotate X
          let y1 = ry * cosX - z1 * sinX;
          let z2 = z1 * cosX + ry * sinX;

          const fov = 360;
          const scale = fov / (fov + z2);
          const px = cx + x1 * scale;
          const py = cy + y1 * scale;

          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });
      ctx.restore();

      // Draw Ambient Stars in 3D
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ambientStars.forEach((star) => {
        let x1 = star.x * cosY - star.z * sinY;
        let z1 = star.z * cosY + star.x * sinY;
        let y1 = star.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + star.y * sinX;

        const fov = 350;
        const scale = fov / (fov + z2);
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;

        if (z2 > -fov) {
          ctx.beginPath();
          ctx.arc(px, py, star.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Project 3D Nodes
      cosmosNodes.forEach((node) => {
        const offsetR = 185 + (node.shockOffset || 0);
        const norm = Math.hypot(node.ox, node.oy, node.oz) || 1;
        const nx = (node.ox / norm) * offsetR;
        const ny = (node.oy / norm) * offsetR;
        const nz = (node.oz / norm) * offsetR;

        // Rotate Y
        let x1 = nx * cosY - nz * sinY;
        let z1 = nz * cosY + nx * sinY;
        // Rotate X
        let y1 = ny * cosX - z1 * sinX;
        let z2 = z1 * cosX + ny * sinX;

        const fov = 380;
        const scale = fov / (fov + z2);
        node.px = cx + x1 * scale;
        node.py = cy + y1 * scale;
        node.scale = scale;
        node.z = z2;
        node.pulsePhase += 0.035;
      });

      // Sort nodes back to front for accurate depth rendering
      cosmosNodes.sort((a, b) => a.z - b.z);

      // Draw Glowing Fiber-Optic Links between connected skills
      cosmosNodes.forEach((node) => {
        const connections = node.data.connected || [];
        connections.forEach((targetId) => {
          const target = cosmosNodes.find((n) => n.id === targetId);
          if (target && node.z > -320 && target.z > -320) {
            const isHighlighted = selectedSkillId === node.id || selectedSkillId === target.id;
            ctx.beginPath();
            ctx.moveTo(node.px, node.py);
            ctx.lineTo(target.px, target.py);

            if (isHighlighted) {
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
              ctx.lineWidth = 2.2;
            } else {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
              ctx.lineWidth = 0.9;
            }
            ctx.stroke();

            // Animated pulsing energy packet across link
            if (isHighlighted) {
              const progress = (Math.sin(node.pulsePhase * 2.5) + 1) / 2;
              const packetX = node.px + (target.px - node.px) * progress;
              const packetY = node.py + (target.py - node.py) * progress;
              ctx.beginPath();
              ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        });
      });

      // Draw Nodes with Official Brand Logos
      cosmosNodes.forEach((node) => {
        const isSelected = selectedSkillId === node.id;
        const isHovered = hoveredNode === node;
        const baseRadius = (isSelected ? 23 : isHovered ? 20 : 15) * node.scale;

        ctx.save();

        // Targeting Reticle for Selected Node
        if (isSelected) {
          ctx.save();
          ctx.translate(node.px, node.py);
          ctx.rotate(t * 0.002);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          const reticleR = baseRadius * 1.55;

          // 4 Bracket corners
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.arc(0, 0, reticleR, -0.32, 0.32);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Glowing outer halo
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.px, node.py, baseRadius * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = node.data.color;
          ctx.globalAlpha = isSelected ? 0.32 : 0.18;
          ctx.fill();
        }

        // Dark glass background circle with vibrant border
        ctx.beginPath();
        ctx.arc(node.px, node.py, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0b101b';
        ctx.globalAlpha = Math.max(0.65, Math.min(1.0, (node.scale - 0.35) * 1.6));
        ctx.shadowColor = node.data.color;
        ctx.shadowBlur = isSelected ? 20 : 10;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : node.data.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Draw Official Tech Brand SVG Logo inside the circle
        const iconImg = nodeIconImages[node.id];
        if (iconImg && iconImg.complete) {
          const iconSize = baseRadius * 1.35;
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.px, node.py, baseRadius - 1.5, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = Math.max(0.7, Math.min(1.0, (node.scale - 0.35) * 1.6));
          ctx.drawImage(
            iconImg,
            node.px - iconSize / 2,
            node.py - iconSize / 2,
            iconSize,
            iconSize
          );
          ctx.restore();
        }

        // Node Label below circle
        if (node.scale > 0.6 || isSelected || isHovered) {
          ctx.font = `700 ${Math.round((isSelected ? 12.5 : 11) * node.scale)}px "JetBrains Mono", monospace`;
          ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
          ctx.globalAlpha = Math.max(0.5, (node.scale - 0.4) * 1.5);
          ctx.textAlign = 'center';
          ctx.shadowBlur = isSelected ? 8 : 4;
          ctx.shadowColor = '#000000';
          ctx.fillText(node.data.name.split(' ')[0], node.px, node.py + baseRadius + 14);
        }

        ctx.restore();
      });

      // Update & Draw Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += 3.5;
        sw.alpha -= 0.02;

        if (sw.alpha <= 0 || sw.r >= sw.maxR) {
          shockwaves.splice(i, 1);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color || '#38bdf8';
          ctx.globalAlpha = sw.alpha;
          ctx.lineWidth = 2;
          ctx.shadowColor = sw.color || '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // ==========================================================================
    // MODE 2: Sockets & Concurrency Simulation
    // ==========================================================================
    function renderSocketsMode(t) {
      const cx = width / 2;
      const cy = height / 2 - 20;

      // Periodically inject ambient packets
      if (Math.random() < 0.05) {
        const randCli = Math.floor(Math.random() * socketClients.length);
        sendSocketPacket(Math.random() > 0.5, randCli, 'HEARTBEAT');
      }

      // Draw connection lines from center C++ kernel to clients
      socketClients.forEach((cli) => {
        const tx = cx + Math.cos(cli.angle) * cli.dist;
        const ty = cy + Math.sin(cli.angle) * cli.dist;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Client Endpoint Node
        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = cli.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = cli.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.stroke();

        // Client inner dot
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fillStyle = cli.color;
        ctx.fill();

        // Client Label
        ctx.font = '600 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(cli.label, tx, ty + (cli.angle > 0 ? 30 : -25));
        ctx.restore();
      });

      // Draw Center C++ Kernel Node
      ctx.save();
      const pulse = Math.sin(t * 0.005) * 4;

      // Outer glowing sonar rings
      ctx.beginPath();
      ctx.arc(cx, cy, 44 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 33, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('epoll_wait()', cx, cy - 6);
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('C++ Server', cx, cy + 9);
      ctx.restore();

      // Update & Draw Packets
      for (let i = socketPackets.length - 1; i >= 0; i--) {
        const p = socketPackets[i];
        p.progress += p.speed;

        if (p.progress >= 1.0) {
          socketPackets.splice(i, 1);
        } else {
          const curX = p.sx + (p.tx - p.sx) * p.progress;
          const curY = p.sy + (p.ty - p.sy) * p.progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw Mini Throughput Oscilloscope with Gradient Area Fill at bottom
      ctx.save();
      const oscY = height - 40;
      const oscH = 26;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(20, oscY - oscH, width - 40, oscH + 10);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeRect(20, oscY - oscH, width - 40, oscH + 10);

      // Slide throughput data
      if (Math.random() < 0.3) {
        throughputHistory.push(Math.sin(t * 0.01) * 8 + 12 + socketPackets.length * 1.5);
        throughputHistory.shift();
      }

      const step = (width - 60) / (throughputHistory.length - 1);

      // Area fill
      const gradFill = ctx.createLinearGradient(0, oscY - oscH, 0, oscY + 10);
      gradFill.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      gradFill.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      ctx.beginPath();
      ctx.moveTo(30, oscY + 10);
      throughputHistory.forEach((val, idx) => {
        const px = 30 + idx * step;
        const py = oscY - Math.min(oscH, Math.max(2, val));
        ctx.lineTo(px, py);
      });
      ctx.lineTo(30 + (throughputHistory.length - 1) * step, oscY + 10);
      ctx.closePath();
      ctx.fillStyle = gradFill;
      ctx.fill();

      // Top line
      ctx.beginPath();
      throughputHistory.forEach((val, idx) => {
        const px = 30 + idx * step;
        const py = oscY - Math.min(oscH, Math.max(2, val));
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.stroke();

      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('LIVE THROUGHPUT BUFFER (PACKETS/SEC)', 30, oscY - oscH + 11);
      ctx.restore();
    }

    // ==========================================================================
    // MODE 3: Algorithm & Architecture Lab
    // ==========================================================================
    function renderAlgorithmsMode(t) {
      if (activeAlgo === 'quicksort') {
        renderQuicksortVisualizer();
      } else if (activeAlgo === 'dijkstra') {
        renderDijkstraVisualizer(t);
      } else if (activeAlgo === 'btree') {
        renderBTreeVisualizer(t);
      }
    }

    // 3A. Quicksort Visualizer
    function renderQuicksortVisualizer() {
      algoTimer++;
      const interval = Math.max(1, 12 - algoClockSpeed);

      if (isAlgoRunning && algoTimer % interval === 0) {
        if (sortStepIdx < sortSteps.length) {
          const step = sortSteps[sortStepIdx];
          if (step.type === 'pivot') {
            sortHighlights.pivot = step.pivot;
            sortHighlights.compare1 = -1;
            sortHighlights.compare2 = -1;
          } else if (step.type === 'compare') {
            sortHighlights.pivot = step.pivot;
            sortHighlights.compare1 = step.compare1;
            sortHighlights.compare2 = step.compare2;
            const val = sortArray[step.compare1] || 50;
            playSynthTone(220 + val * 8, 'sine', 0.04, 0.02);
          } else if (step.type === 'swap') {
            sortArray = [...step.arr];
            sortHighlights.pivot = step.pivot;
            sortHighlights.compare1 = step.compare1;
            sortHighlights.compare2 = step.compare2;
          } else if (step.type === 'sorted') {
            sortHighlights.sorted.push(step.idx);
          }
          sortStepIdx++;
        } else {
          isAlgoRunning = false;
          updateAlgoPlayBtn();
          playSynthTone(880, 'sine', 0.15, 0.06);
        }
      }

      // Draw Bars with rounded corners and gradients
      const barW = Math.max(6, (width - 80) / sortArray.length - 4);
      const startX = 40;
      const maxH = height - 120;
      const baseY = height - 55;

      sortArray.forEach((val, idx) => {
        const barH = (val / 100) * maxH;
        const x = startX + idx * (barW + 4);
        const y = baseY - barH;

        let color = '#38bdf8';
        if (sortHighlights.sorted.includes(idx)) {
          color = '#10b981';
        } else if (idx === sortHighlights.pivot) {
          color = '#f59e0b';
        } else if (idx === sortHighlights.compare1 || idx === sortHighlights.compare2) {
          color = '#ec4899';
        }

        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = (idx === sortHighlights.compare1 || idx === sortHighlights.pivot) ? 12 : 2;
        ctx.fillRect(x, y, barW, barH);
        ctx.restore();
      });

      // Bottom Legend (Centered & Clearly Padded)
      ctx.shadowBlur = 0;
      ctx.font = '600 11.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`DUAL-PIVOT QUICKSORT | COMPLEXITY: O(N log N) | STEP: ${sortStepIdx}/${sortSteps.length}`, width / 2, height - 20);
    }

    // 3B. Dynamic Dijkstra Pathfinder Visualizer (Randomized Start & Target)
    function renderDijkstraVisualizer(t) {
      const cellSize = 40;
      const totalGridW = gridCols * (cellSize + 6) - 6;
      const totalGridH = gridRows * (cellSize + 6) - 6;
      const startX = (width - totalGridW) / 2;
      const startY = (height - 65 - totalGridH) / 2 + 10;

      // Advance search step if running
      algoTimer++;
      const interval = Math.max(1, 8 - algoClockSpeed);
      if (isAlgoRunning && algoTimer % interval === 0) {
        if (dijkstraStepIdx < dijkstraVisitedOrder.length) {
          const step = dijkstraVisitedOrder[dijkstraStepIdx];
          dijkstraVisitedMap[step.idx] = step.dist;
          playSynthTone(260 + (step.dist || 0) * 28, 'sine', 0.04, 0.02);
          dijkstraStepIdx++;

          if (step.idx === dijkstraTarget) {
            isAlgoRunning = false;
            updateAlgoPlayBtn();
            playSynthTone(880, 'sine', 0.2, 0.06);
          }
        } else {
          isAlgoRunning = false;
          updateAlgoPlayBtn();
        }
      }

      ctx.save();
      const showPath = dijkstraStepIdx >= dijkstraVisitedOrder.length || dijkstraVisitedMap[dijkstraTarget] !== undefined;

      // Draw Grid Cells
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const idx = r * gridCols + c;
          const x = startX + c * (cellSize + 6);
          const y = startY + r * (cellSize + 6);

          const isStart = idx === dijkstraStart;
          const isTarget = idx === dijkstraTarget;
          const isWall = dijkstraWalls.includes(idx);
          const isVisited = dijkstraVisitedMap[idx] !== undefined;
          const isPathCell = showPath && dijkstraPath.includes(idx);

          ctx.beginPath();
          ctx.rect(x, y, cellSize, cellSize);

          if (isStart) {
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 14;
          } else if (isTarget) {
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 14;
          } else if (isWall) {
            ctx.fillStyle = '#1e293b';
            ctx.shadowBlur = 0;
          } else if (isPathCell) {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
          } else if (isVisited) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.shadowBlur = 0;
          }

          ctx.strokeStyle = isWall ? '#334155' : isPathCell ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = isPathCell ? 2 : 1;
          ctx.fill();
          ctx.stroke();

          // Cell Labels
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (isStart) ctx.fillText('S', x + cellSize / 2, y + cellSize / 2);
          else if (isTarget) ctx.fillText('T', x + cellSize / 2, y + cellSize / 2);
          else if (isWall) {
            ctx.fillStyle = '#64748b';
            ctx.fillText('■', x + cellSize / 2, y + cellSize / 2);
          } else if (isVisited) {
            ctx.fillStyle = isPathCell ? '#0f172a' : '#93c5fd';
            ctx.fillText(`${dijkstraVisitedMap[idx]}`, x + cellSize / 2, y + cellSize / 2);
          }
        }
      }

      // Draw Shortest Path Line connecting cells
      if (showPath && dijkstraPath.length > 1) {
        ctx.beginPath();
        dijkstraPath.forEach((pIdx, i) => {
          const r = Math.floor(pIdx / gridCols);
          const c = pIdx % gridCols;
          const px = startX + c * (cellSize + 6) + cellSize / 2;
          const py = startY + r * (cellSize + 6) + cellSize / 2;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      ctx.restore();

      // Centered Legend
      ctx.font = '600 11.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      const status = showPath ? `PATH FOUND (LEN: ${dijkstraPath.length})` : isAlgoRunning ? `EXPLORING NODE ${dijkstraStepIdx}/${dijkstraVisitedOrder.length}` : `READY (START: ${dijkstraStart}, TARGET: ${dijkstraTarget})`;
      ctx.fillText(`DIJKSTRA PATHFINDER | ${status} | COMPLEXITY: O(V + E log V)`, width / 2, height - 20);
    }

    // 3C. Dynamic B-Tree & Cache Simulation Visualizer
    function renderBTreeVisualizer(t) {
      const cx = width / 2;
      const cy = 70;

      // Animate search phase progression if running
      algoTimer++;
      if (isAlgoRunning && algoTimer % 35 === 0) {
        btreeData.searchPhase = (btreeData.searchPhase + 1) % 3;
        if (btreeData.searchPhase === 0) {
          playSynthTone(480, 'sine', 0.05, 0.03);
        } else if (btreeData.searchPhase === 1) {
          playSynthTone(640, 'sine', 0.05, 0.03);
        } else if (btreeData.searchPhase === 2) {
          playSynthTone(880, 'sine', 0.12, 0.05);
        }
      }

      ctx.save();
      const isRootTarget = btreeData.targetNode === 'root';
      const isLeftTarget = btreeData.targetNode === 'left';
      const isRightTarget = btreeData.targetNode === 'right';

      // Level 1: Root Node (L1 Cache)
      const rootHighlighted = btreeData.searchPhase >= 0;
      const rootHit = isRootTarget && btreeData.searchPhase === 2;

      ctx.fillStyle = rootHit ? 'rgba(16, 185, 129, 0.25)' : '#1e293b';
      ctx.strokeStyle = rootHit ? '#10b981' : rootHighlighted ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = rootHit || rootHighlighted ? 2.5 : 1.5;
      ctx.shadowColor = rootHit ? '#10b981' : '#38bdf8';
      ctx.shadowBlur = rootHit ? 16 : rootHighlighted ? 8 : 0;

      ctx.fillRect(cx - 85, cy, 170, 42);
      ctx.strokeRect(cx - 85, cy, 170, 42);

      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillStyle = rootHit ? '#34d399' : '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`Root [Key: ${btreeData.rootKey}]`, cx, cy + 26);

      // Level 2: Children Nodes (L2 Cache)
      const c1x = cx - 130;
      const c2x = cx + 130;
      const cY = cy + 110;

      // Connecting branches
      const branchLeftActive = btreeData.searchPhase >= 1 && (isLeftTarget || isRootTarget);
      const branchRightActive = btreeData.searchPhase >= 1 && isRightTarget;

      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 42);
      ctx.lineTo(c1x, cY);
      ctx.strokeStyle = branchLeftActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = branchLeftActive ? 2.5 : 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 35, cy + 42);
      ctx.lineTo(c2x, cY);
      ctx.strokeStyle = branchRightActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = branchRightActive ? 2.5 : 1.2;
      ctx.stroke();

      // Left Child Node
      const leftHit = isLeftTarget && btreeData.searchPhase === 2;
      ctx.fillStyle = leftHit ? 'rgba(16, 185, 129, 0.25)' : '#1e293b';
      ctx.strokeStyle = leftHit ? '#10b981' : isLeftTarget && btreeData.searchPhase >= 1 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = leftHit ? 2.5 : 1.5;
      ctx.shadowColor = leftHit ? '#10b981' : '#38bdf8';
      ctx.shadowBlur = leftHit ? 14 : 0;

      ctx.fillRect(c1x - 70, cY, 140, 38);
      ctx.strokeRect(c1x - 70, cY, 140, 38);
      ctx.fillStyle = leftHit ? '#34d399' : '#e2e8f0';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.fillText(`[${btreeData.leftKeys[0]} | ${btreeData.leftKeys[1]}]`, c1x, cY + 24);

      // Right Child Node
      const rightHit = isRightTarget && btreeData.searchPhase === 2;
      ctx.fillStyle = rightHit ? 'rgba(16, 185, 129, 0.25)' : '#1e293b';
      ctx.strokeStyle = rightHit ? '#10b981' : isRightTarget && btreeData.searchPhase >= 1 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = rightHit ? 2.5 : 1.5;
      ctx.shadowColor = rightHit ? '#10b981' : '#38bdf8';
      ctx.shadowBlur = rightHit ? 14 : 0;

      ctx.fillRect(c2x - 70, cY, 140, 38);
      ctx.strokeRect(c2x - 70, cY, 140, 38);
      ctx.fillStyle = rightHit ? '#34d399' : '#e2e8f0';
      ctx.fillText(`[${btreeData.rightKeys[0]} | ${btreeData.rightKeys[1]}]`, c2x, cY + 24);

      // Cache metrics HUD Centered
      const hudW = Math.min(width - 40, 540);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.fillRect((width - hudW) / 2, height - 62, hudW, 38);
      ctx.strokeRect((width - hudW) / 2, height - 62, hudW, 38);

      const targetLabel = btreeData.targetNode === 'root' ? 'L1 ROOT HIT' : btreeData.targetNode === 'left' ? 'L2 LEFT HIT' : 'L2 RIGHT HIT';
      ctx.font = '600 11.5px "JetBrains Mono", monospace';
      ctx.fillStyle = btreeData.searchPhase === 2 ? '#34d399' : '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ L1: ${btreeData.l1Latency} | L2: ${btreeData.l2Latency} | QUERY [Key: ${btreeData.queryKey}] -> ${btreeData.searchPhase === 2 ? targetLabel : 'TRAVERSING...'}`, width / 2, height - 38);
      ctx.restore();
    }

    // Start animation loop
    requestAnimationFrame(render);
  }

  // ==========================================================================
  // 5. Kinetic 2D Physics Particle Sandbox (Advanced Cyber Physics Engine)
  // ==========================================================================
  function initSandbox() {
    const canvas = document.getElementById('physicsCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 800;
    let height = 440;
    let isVisible = true;

    function resize() {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || canvas.clientWidth || 800;
      height = parent?.clientHeight || canvas.clientHeight || 440;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      }, { threshold: 0.05 });
      obs.observe(canvas);
    }

    const bodies = [];
    const sparks = [];
    const impactRings = [];

    let spawnMode = 'ball';
    let gravity = 9.8;
    let restitution = 0.75;
    let isZeroG = false;
    let isVortexActive = false;
    let vortexPos = { x: 400, y: 220 };
    let lastSoundTime = 0;

    const NEON_PALETTE = [
      { fill: '#38bdf8', glow: '#0284c7' }, // 1. Electric Cyan
      { fill: '#10b981', glow: '#059669' }, // 2. Matrix Emerald
      { fill: '#a855f7', glow: '#7c3aed' }, // 3. Cyber Purple
      { fill: '#f59e0b', glow: '#d97706' }, // 4. Solar Gold
      { fill: '#f43f5e', glow: '#e11d48' }, // 5. Neon Rose
      { fill: '#06b6d4', glow: '#0891b2' }, // 6. Plasma Aqua
      { fill: '#ff7828', glow: '#ea580c' }  // 7. Flame Orange
    ];

    class PhysicsBody {
      constructor(x, y, vx, vy, type = 'ball', size = 16, palette = NEON_PALETTE[0]) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.size = size;
        this.mass = size;
        this.palette = palette;
        this.rotation = Math.random() * Math.PI * 2;
        this.vRot = (Math.random() - 0.5) * 0.06;
        this.trail = [];
      }

      update(dt) {
        // Stable, smooth force application
        if (isVortexActive) {
          const dx = vortexPos.x - this.x;
          const dy = vortexPos.y - this.y;
          const dist = Math.hypot(dx, dy) || 1;
          const force = Math.min(320, 7500 / (dist + 40));
          const nx = dx / dist;
          const ny = dy / dist;
          this.vx += (nx * force - ny * force * 0.35) * dt;
          this.vy += (ny * force + nx * force * 0.35) * dt;
        } else if (!isZeroG) {
          this.vy += gravity * 26 * dt;
        }

        // Air damping
        this.vx *= 0.992;
        this.vy *= 0.992;

        // Speed limit clamp to prevent tunneling
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > 16) {
          const scale = 16 / speed;
          this.vx *= scale;
          this.vy *= scale;
        }

        // Position integration
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        this.rotation += this.vRot;

        // Motion trail effect
        if (speed > 2.0) {
          this.trail.push({ x: this.x, y: this.y });
          if (this.trail.length > 6) this.trail.shift();
        } else if (this.trail.length > 0) {
          this.trail.shift();
        }

        // Arena Boundaries
        const pad = this.size;
        if (this.x - pad < 0) {
          this.x = pad;
          this.vx = -this.vx * restitution;
          this.emitCollisionFX(this.x, this.y, Math.abs(this.vx));
        } else if (this.x + pad > width) {
          this.x = width - pad;
          this.vx = -this.vx * restitution;
          this.emitCollisionFX(this.x, this.y, Math.abs(this.vx));
        }

        if (this.y - pad < 0) {
          this.y = pad;
          this.vy = -this.vy * restitution;
          this.emitCollisionFX(this.x, this.y, Math.abs(this.vy));
        } else if (this.y + pad > height) {
          this.y = height - pad;
          this.vy = -this.vy * restitution;
          this.vx *= 0.96; // ground friction
          this.emitCollisionFX(this.x, this.y, Math.abs(this.vy));
        }
      }

      emitCollisionFX(x, y, intensity) {
        if (intensity > 2.0) {
          const numSparks = Math.min(7, Math.floor(intensity * 1.0));
          for (let k = 0; k < numSparks; k++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * intensity * 0.85 + 1.2;
            sparks.push({
              x,
              y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: this.palette.fill,
              alpha: 1.0,
              size: Math.random() * 2.4 + 1
            });
          }

          if (intensity > 3.8) {
            impactRings.push({
              x,
              y,
              r: this.size * 0.8,
              maxR: this.size * 2.2,
              color: this.palette.fill,
              alpha: 0.85
            });
          }

          const now = performance.now();
          if (now - lastSoundTime > 75) {
            lastSoundTime = now;
            const freq = Math.min(1000, 220 + (28 - this.size) * 30 + intensity * 20);
            playSynthTone(freq, 'sine', 0.04, 0.015);
          }
        }
      }

      draw(c) {
        // 1. Multi-segment Glowing Motion Trail Ribbon
        if (this.trail.length > 1) {
          c.save();
          c.beginPath();
          c.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            c.lineTo(this.trail[i].x, this.trail[i].y);
          }
          c.strokeStyle = this.palette.fill;
          c.lineWidth = this.size * 0.8;
          c.lineCap = 'round';
          c.globalAlpha = 0.35;
          c.stroke();
          c.restore();
        }

        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);

        if (this.type === 'ball') {
          // Radiant Glowing Outer Aura (Radial Gradient)
          const auraGrad = c.createRadialGradient(0, 0, this.size * 0.6, 0, 0, this.size * 2.1);
          auraGrad.addColorStop(0, this.palette.fill);
          auraGrad.addColorStop(0.45, this.palette.glow);
          auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          c.beginPath();
          c.arc(0, 0, this.size * 2.1, 0, Math.PI * 2);
          c.fillStyle = auraGrad;
          c.globalAlpha = 0.60;
          c.fill();
          c.globalAlpha = 1.0;

          // Vibrant 3D Specular Ball Body
          const ballGrad = c.createRadialGradient(-this.size * 0.35, -this.size * 0.35, this.size * 0.08, 0, 0, this.size);
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.35, this.palette.fill);
          ballGrad.addColorStop(0.85, this.palette.glow);
          ballGrad.addColorStop(1, '#050a14');

          c.beginPath();
          c.arc(0, 0, this.size, 0, Math.PI * 2);
          c.fillStyle = ballGrad;
          c.fill();

          // High-Tech Specular Rim
          c.beginPath();
          c.arc(0, 0, this.size, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          c.lineWidth = 1.2;
          c.stroke();
        } else {
          // Radiant Glowing Outer Aura
          const boxAuraGrad = c.createRadialGradient(0, 0, this.size * 0.6, 0, 0, this.size * 2.2);
          boxAuraGrad.addColorStop(0, this.palette.fill);
          boxAuraGrad.addColorStop(0.5, this.palette.glow);
          boxAuraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          c.beginPath();
          c.arc(0, 0, this.size * 2.2, 0, Math.PI * 2);
          c.fillStyle = boxAuraGrad;
          c.globalAlpha = 0.55;
          c.fill();
          c.globalAlpha = 1.0;

          // Cyber Kinetic Box Shell
          c.beginPath();
          if (c.roundRect) {
            c.roundRect(-this.size, -this.size, this.size * 2, this.size * 2, 4);
          } else {
            c.rect(-this.size, -this.size, this.size * 2, this.size * 2);
          }
          c.fillStyle = '#080d18';
          c.fill();

          c.strokeStyle = this.palette.fill;
          c.lineWidth = 2.2;
          c.stroke();

          // Corner Energy Reticle
          c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          c.lineWidth = 1;
          c.stroke();

          // Dual-Tier Luminous Core
          c.beginPath();
          c.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
          c.fillStyle = this.palette.fill;
          c.fill();

          c.beginPath();
          c.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
          c.fillStyle = '#ffffff';
          c.fill();
        }

        c.restore();
      }
    }

    function spawnInitialBodies() {
      bodies.length = 0;
      for (let i = 0; i < 20; i++) {
        const pal = NEON_PALETTE[i % NEON_PALETTE.length];
        bodies.push(
          new PhysicsBody(
            Math.random() * (width - 160) + 80,
            Math.random() * (height / 2.2) + 40,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            i % 3 === 0 ? 'box' : 'ball',
            14 + Math.random() * 6,
            pal
          )
        );
      }
    }
    spawnInitialBodies();

    // Toolbar Control Buttons
    const btnBall = document.getElementById('btnSpawnBall');
    const btnBox = document.getElementById('btnSpawnBox');
    const btnVortex = document.getElementById('btnVortex');
    const btnZeroG = document.getElementById('btnZeroG');
    const btnExplode = document.getElementById('btnExplode');
    const btnClear = document.getElementById('btnClearSandbox');

    const modeButtons = [btnBall, btnBox, btnVortex, btnZeroG].filter(Boolean);

    function setActiveModeBtn(activeBtn) {
      modeButtons.forEach((b) => b.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
    }

    if (btnBall) {
      btnBall.addEventListener('click', () => {
        spawnMode = 'ball';
        isVortexActive = false;
        setActiveModeBtn(btnBall);
        playSynthTone(580, 'sine', 0.06, 0.03);
      });
    }

    if (btnBox) {
      btnBox.addEventListener('click', () => {
        spawnMode = 'box';
        isVortexActive = false;
        setActiveModeBtn(btnBox);
        playSynthTone(640, 'sine', 0.06, 0.03);
      });
    }

    if (btnVortex) {
      btnVortex.addEventListener('click', () => {
        isVortexActive = !isVortexActive;
        vortexPos = { x: width / 2, y: height / 2 };
        if (isVortexActive) {
          setActiveModeBtn(btnVortex);
          playSynthTone(780, 'triangle', 0.12, 0.04);
        } else {
          setActiveModeBtn(btnBall);
          spawnMode = 'ball';
        }
      });
    }

    if (btnZeroG) {
      btnZeroG.addEventListener('click', () => {
        isZeroG = !isZeroG;
        const gravSlider = document.getElementById('gravitySlider');
        const gravVal = document.getElementById('gravityVal');
        if (isZeroG) {
          btnZeroG.classList.add('active');
          if (gravSlider) gravSlider.value = 0;
          if (gravVal) gravVal.textContent = '0.0 m/s² (Zero-G)';
          gravity = 0;
          bodies.forEach((b) => {
            b.vx += (Math.random() - 0.5) * 6;
            b.vy += (Math.random() - 0.5) * 6;
          });
          playSynthTone(880, 'sine', 0.15, 0.05);
        } else {
          btnZeroG.classList.remove('active');
          gravity = 9.8;
          if (gravSlider) gravSlider.value = 9.8;
          if (gravVal) gravVal.textContent = '9.8 m/s²';
          playSynthTone(440, 'sine', 0.08, 0.03);
        }
      });
    }

    if (btnExplode) {
      btnExplode.addEventListener('click', () => {
        const cx = width / 2;
        const cy = height / 2;
        bodies.forEach((b) => {
          const dx = b.x - cx;
          const dy = b.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const power = Math.max(12, 32 - dist * 0.06);
          b.vx += (dx / dist) * power;
          b.vy += (dy / dist) * power - 6;
          b.emitCollisionFX(b.x, b.y, power * 0.4);
        });

        impactRings.push({
          x: cx,
          y: cy,
          r: 10,
          maxR: Math.max(width, height) * 0.5,
          color: '#38bdf8',
          alpha: 0.8
        });

        playSynthTone(220, 'sawtooth', 0.2, 0.06);
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        bodies.length = 0;
        sparks.length = 0;
        impactRings.length = 0;
        isVortexActive = false;
        setActiveModeBtn(btnBall);
        spawnMode = 'ball';
        playSynthTone(180, 'sine', 0.08, 0.03);
      });
    }

    // Sliders
    const gravSlider = document.getElementById('gravitySlider');
    const gravVal = document.getElementById('gravityVal');
    if (gravSlider) {
      gravSlider.addEventListener('input', (e) => {
        gravity = parseFloat(e.target.value);
        isZeroG = Math.abs(gravity) < 0.1;
        if (btnZeroG) btnZeroG.classList.toggle('active', isZeroG);
        if (gravVal) gravVal.textContent = `${gravity.toFixed(1)} m/s²`;
      });
    }

    const bounceSlider = document.getElementById('bounceSlider');
    const bounceVal = document.getElementById('bounceVal');
    if (bounceSlider) {
      bounceSlider.addEventListener('input', (e) => {
        restitution = parseFloat(e.target.value);
        if (bounceVal) bounceVal.textContent = restitution.toFixed(2);
      });
    }

    // Mouse & Slingshot Launcher
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragCurrent = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (spawnMode === 'vortex') {
        isVortexActive = true;
        vortexPos = { x: mx, y: my };
      } else {
        dragStart = { x: mx, y: my };
        dragCurrent = { x: mx, y: my };
        isDragging = true;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isVortexActive) {
        vortexPos = { x: mx, y: my };
      }
      if (isDragging) {
        dragCurrent = { x: mx, y: my };
      }
    }, { passive: true });

    window.addEventListener('mouseup', (e) => {
      if (isDragging) {
        isDragging = false;
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const vx = (dragStart.x - endX) * 0.14;
        const vy = (dragStart.y - endY) * 0.14;
        // Randomize from all 7 vibrant neon palette colors
        const pal = NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
        const size = Math.min(24, Math.max(13, 14 + Math.hypot(vx, vy) * 0.3));

        // Exact cap: Disappear after 60 counts
        if (bodies.length >= 60) bodies.shift();
        bodies.push(
          new PhysicsBody(
            dragStart.x,
            dragStart.y,
            vx,
            vy,
            spawnMode === 'box' ? 'box' : 'ball',
            size,
            pal
          )
        );

        playSynthTone(540, 'triangle', 0.08, 0.04);
      }
    });

    // Main Simulation Loop
    let lastTime = performance.now();
    const bodyCountElem = document.getElementById('bodyCount');
    const arenaStatusElem = document.getElementById('arenaStatus');
    let vortexAngle = 0;

    function loop(now) {
      requestAnimationFrame(loop);
      if (!isVisible || document.hidden) {
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.035);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Arena Floor Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
      ctx.lineWidth = 1;
      const arenaGrid = 36;
      for (let x = 0; x < width; x += arenaGrid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += arenaGrid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vortex Singularity
      if (isVortexActive) {
        ctx.save();
        vortexAngle += 0.05;
        ctx.translate(vortexPos.x, vortexPos.y);

        for (let r = 1; r <= 3; r++) {
          ctx.beginPath();
          ctx.rotate(vortexAngle * 0.4 * (r % 2 === 0 ? 1 : -1));
          ctx.arc(0, 0, r * 20, 0, Math.PI * 1.5);
          ctx.strokeStyle = r === 1 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // Pairwise Collisions
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.size + b2.size;

          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;

            const overlap = (minDist - dist) * 0.5;
            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const velAlongNormal = kx * nx + ky * ny;

            if (velAlongNormal > 0) {
              const impulse = (2 * velAlongNormal) / 2;
              b1.vx -= (impulse * restitution) * nx;
              b1.vy -= (impulse * restitution) * ny;
              b2.vx += (impulse * restitution) * nx;
              b2.vy += (impulse * restitution) * ny;

              if (velAlongNormal > 2.5) {
                const midX = (b1.x + b2.x) / 2;
                const midY = (b1.y + b2.y) / 2;
                b1.emitCollisionFX(midX, midY, velAlongNormal);
              }
            }
          }
        }
      }

      // Update & Draw Bodies
      bodies.forEach((b) => {
        b.update(dt);
        b.draw(ctx);
      });

      // Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.95;
        sp.vy *= 0.95;
        sp.alpha -= 0.04;

        if (sp.alpha <= 0) {
          sparks.splice(i, 1);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * sp.alpha, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.alpha;
          ctx.fill();
          ctx.restore();
        }
      }

      // Impact Rings
      for (let i = impactRings.length - 1; i >= 0; i--) {
        const ring = impactRings[i];
        ring.r += 2;
        ring.alpha -= 0.04;

        if (ring.alpha <= 0 || ring.r >= ring.maxR) {
          impactRings.splice(i, 1);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.5 * ring.alpha;
          ctx.globalAlpha = ring.alpha;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Slingshot Trajectory Arc
      if (isDragging) {
        ctx.save();
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;

        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const vx = dx * 0.14;
        const vy = dy * 0.14;
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        for (let t = 1; t <= 16; t++) {
          const tx = dragStart.x + vx * t;
          const ty = dragStart.y + vy * t + (!isZeroG ? 0.5 * gravity * 26 * (t * 0.016) * (t * 0.016) * 60 : 0);
          ctx.lineTo(tx, ty);
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // Telemetry HUD Readout
      if (bodyCountElem) bodyCountElem.textContent = bodies.length;
      if (arenaStatusElem) {
        arenaStatusElem.textContent = isVortexActive ? 'VORTEX ACTIVE' : isZeroG ? 'ZERO-G FLIGHT' : '60 Hz SOLVER';
      }
    }

    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // 6. Project Modals
  // ==========================================================================
  const projectBlueprints = {
    ums: {
      tag: 'C++ // React // SQLite Database',
      title: 'University Management System',
      content: `
        <p>A full-stack university portal engineered with a high-performance C++ backend, SQLite storage engine, and a multi-role React frontend.</p>
        <pre><code>// C++ Server: Authentication & Grade Computation
#include &lt;iostream&gt;
#include &lt;sqlite3.h&gt;

class UniversityServer {
public:
    bool authenticateUser(const std::string& username, const std::string& passHash) {
        std::string query = "SELECT role FROM users WHERE username = ? AND password = ?;";
        sqlite3_stmt* stmt;
        if (sqlite3_prepare_v2(db, query.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(stmt, 2, passHash.c_str(), -1, SQLITE_STATIC);
            return sqlite3_step(stmt) == SQLITE_ROW;
        }
        return false;
    }
};</code></pre>
        <p><strong>Key Architecture Highlights:</strong></p>
        <ul style="padding-left: 1.5rem; line-height: 1.8;">
          <li><strong>C++ Backend Engine:</strong> Handles user authentication, course registration scheduling, attendance records, and grade transcript computation.</li>
          <li><strong>React Dashboard:</strong> Tailored role-based views for Students, Faculty/Professors, and System Administrators.</li>
          <li><strong>SQLite Persistence:</strong> Relational student records, course metadata, and persistent transaction storage.</li>
        </ul>
      `,
    },
    broadcast: {
      tag: 'C++ // WebSockets // Socket Programming',
      title: 'Real-Time Broadcast Server',
      content: `
        <p>A CLI-based multi-client broadcast server engineered in C++ utilizing WebSockets for concurrent message synchronization.</p>
        <pre><code>// WebSocket Dispatcher & Multi-Client Broadcast
void BroadcastServer::broadcastMessage(const std::string& msg, int senderFd) {
    std::lock_guard&lt;std::mutex&gt; lock(clientsMutex);
    for (const auto& [clientFd, clientInfo] : activeClients) {
        if (clientFd != senderFd && clientInfo.isAlive) {
            sendWebSocketFrame(clientFd, msg);
        }
    }
}</code></pre>
        <p><strong>Key Architecture Highlights:</strong></p>
        <ul style="padding-left: 1.5rem; line-height: 1.8;">
          <li><strong>Multi-Client Concurrency:</strong> Non-blocking socket communication with thread-safe client management.</li>
          <li><strong>Fault Tolerance:</strong> Heartbeat tracking, auto-reconnection handling, and clean disconnection cleanup.</li>
          <li><strong>Low Latency:</strong> Lightweight binary/text framing for real-time data transmission.</li>
        </ul>
      `,
    },
  };

  window.openProjectModal = function (id) {
    const modal = document.getElementById('projectModal');
    const modalTag = document.getElementById('modalTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const blueprint = projectBlueprints[id];
    if (modal && blueprint) {
      if (modalTag) modalTag.textContent = blueprint.tag;
      if (modalTitle) modalTitle.textContent = blueprint.title;
      if (modalBody) modalBody.innerHTML = blueprint.content;
      modal.classList.add('active');
      playSynthTone(720, 'sine', 0.1, 0.06);
    }
  };

  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const projectModal = document.getElementById('projectModal');
  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', () => projectModal.classList.remove('active'));
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) projectModal.classList.remove('active');
    });
  }

  // ==========================================================================
  // 7. Contact Form Handler (Live Email Delivery via Web3Forms / Formspree)
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('callerName')?.value || 'Friend';
      const keyInput = document.getElementById('web3formsKey');
      const accessKey = keyInput ? keyInput.value : '';

      if (formStatus) {
        formStatus.innerHTML = `<span style="color:var(--color-primary); display:inline-flex; align-items:center; gap:0.4rem;"><span class="material-symbols-outlined icon-mini" style="animation:spin 1s linear infinite;">sync</span> Sending message...</span>`;
      }
      if (submitBtn) submitBtn.disabled = true;
      playSynthTone(880, 'sine', 0.15, 0.06);

      const formData = new FormData(contactForm);

      // If user hasn't put in their custom access key yet, provide simulation fallback with instructions
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        setTimeout(() => {
          if (formStatus) {
            formStatus.innerHTML = `<span style="color:#10b981;">✓ Message received, ${name}! (To deliver directly to your Gmail inbox, add your free key from web3forms.com in index.html)</span>`;
          }
          if (submitBtn) submitBtn.disabled = false;
          playSynthTone(1050, 'sine', 0.25, 0.08);
          contactForm.reset();
        }, 1000);
        return;
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          if (formStatus) {
            formStatus.innerHTML = `<span style="color:#10b981;">✓ Message sent successfully! I'll get back to you shortly.</span>`;
          }
          playSynthTone(1050, 'sine', 0.25, 0.08);
          contactForm.reset();
        } else {
          if (formStatus) {
            formStatus.innerHTML = `<span style="color:#ef4444;">✗ ${data.message || 'Submission error. Please try again.'}</span>`;
          }
          playSynthTone(220, 'sawtooth', 0.2, 0.06);
        }
      } catch (err) {
        if (formStatus) {
          formStatus.innerHTML = `<span style="color:#ef4444;">✗ Network error. Please check your connection.</span>`;
        }
        playSynthTone(220, 'sawtooth', 0.2, 0.06);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
    });
  }

  // Active section scroll spy
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.toggle('active', link.getAttribute('data-section') === id);
        });
      }
    });
  });

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initShinyBackground();
      initHeroThreeJs();
      initSystemsMatrixLab();
      initSandbox();
    });
  } else {
    initShinyBackground();
    initHeroThreeJs();
    initSystemsMatrixLab();
    initSandbox();
  }
})();
