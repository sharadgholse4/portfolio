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
  // 1.5. Full-Page Shiny Stardust Constellation Background Engine
  // ==========================================================================
  function initShinyBackground() {
    const canvas = document.getElementById('bgShinyCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 18000), 65);

    class StarParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.2 + 0.8;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = -(Math.random() * 0.4 + 0.15);
        this.alpha = Math.random() * 0.7 + 0.3;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
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
        const currentAlpha = (Math.sin(this.twinklePhase) * 0.35 + 0.65) * (isDark ? 0.85 : 0.6);

        let color = '#2563eb';
        if (isDark) {
          if (this.hueType === 0) color = '#38bdf8'; // Electric Cyan
          else if (this.hueType === 1) color = '#818cf8'; // Neon Violet
          else color = '#fbbf24'; // Starlight Gold
        } else {
          if (this.hueType === 0) color = '#2563eb'; // Sapphire
          else if (this.hueType === 1) color = '#0284c7'; // Sky Teal
          else color = '#d97706'; // Warm Amber
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = isDark ? 12 : 6;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new StarParticle());
    }

    function loop() {
      ctx.clearRect(0, 0, width, height);

      const isDark = state.theme === 'dark';
      const lineColor = isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)';

      // Draw shiny connecting constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 110) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = (1 - dist / 110) * (isDark ? 1.2 : 0.8);
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
  // 4. WebGL GLSL Shader Matrix
  // ==========================================================================
  function initShaderMatrix() {
    const canvas = document.getElementById('shaderCanvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    function syncSize() {
      const w = canvas.parentElement?.clientWidth || canvas.clientWidth || 600;
      const h = canvas.parentElement?.clientHeight || canvas.clientHeight || 320;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_speed;
      uniform float u_chaos;
      uniform int u_preset;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;
        float t = u_time * u_speed;

        float n = noise(uv * u_chaos + t * 0.25);
        vec2 distort = uv + 0.08 * vec2(cos(n * 6.28 + t), sin(n * 6.28 + t));

        float dist = distance(uv, mouse);
        float wave = sin(dist * 20.0 - t * 3.0) * 0.03 * smoothstep(0.5, 0.0, dist);
        distort += (uv - mouse) * wave;

        // Preset 0: Sapphire
        vec3 c1 = vec3(0.92, 0.90, 0.86);
        vec3 c2 = vec3(0.15, 0.39, 0.92);
        vec3 c3 = vec3(0.01, 0.52, 0.78);

        if (u_preset == 1) {
          // Warm Amber
          c1 = vec3(0.93, 0.91, 0.88);
          c2 = vec3(0.85, 0.45, 0.10);
          c3 = vec3(0.80, 0.25, 0.20);
        } else if (u_preset == 2) {
          // Seafoam
          c1 = vec3(0.90, 0.93, 0.90);
          c2 = vec3(0.05, 0.58, 0.48);
          c3 = vec3(0.02, 0.50, 0.70);
        }

        vec3 finalColor = mix(c1, c2, distort.y);
        finalColor = mix(finalColor, c3, noise(distort * 6.0 + t * 0.4) * 0.45);
        finalColor += 0.03 * sin(t + distort.x * 12.0);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uSpeed = gl.getUniformLocation(prog, 'u_speed');
    const uChaos = gl.getUniformLocation(prog, 'u_chaos');
    const uPreset = gl.getUniformLocation(prog, 'u_preset');

    let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      mousePos.y = (rect.height - (e.clientY - rect.top)) * (canvas.height / rect.height);
    });

    const speedInput = document.getElementById('shaderSpeed');
    const speedVal = document.getElementById('speedVal');
    if (speedInput) {
      speedInput.addEventListener('input', (e) => {
        state.shaderSpeed = parseFloat(e.target.value);
        if (speedVal) speedVal.textContent = state.shaderSpeed.toFixed(1) + 'x';
      });
    }

    const chaosInput = document.getElementById('shaderChaos');
    const chaosVal = document.getElementById('chaosVal');
    if (chaosInput) {
      chaosInput.addEventListener('input', (e) => {
        state.shaderChaos = parseFloat(e.target.value);
        if (chaosVal) chaosVal.textContent = state.shaderChaos.toFixed(1);
      });
    }

    const presetMap = { quantum: 0, plasma: 1, cosmic: 2 };
    ['btnQuantum', 'btnPlasma', 'btnCosmic'].forEach((id, idx) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.preset-chip').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const keys = ['quantum', 'plasma', 'cosmic'];
          state.shaderPreset = keys[idx];
          playSynthTone(640 + idx * 80, 'sine', 0.08, 0.04);
        });
      }
    });

    function render(t) {
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mousePos.x, mousePos.y);
      if (uSpeed) gl.uniform1f(uSpeed, state.shaderSpeed);
      if (uChaos) gl.uniform1f(uChaos, state.shaderChaos);
      if (uPreset) gl.uniform1i(uPreset, presetMap[state.shaderPreset] || 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  // ==========================================================================
  // 5. Kinetic 2D Physics Particle Sandbox
  // ==========================================================================
  function initSandbox() {
    const canvas = document.getElementById('physicsCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
      width = canvas.parentElement?.clientWidth || canvas.clientWidth || 800;
      height = canvas.parentElement?.clientHeight || canvas.clientHeight || 440;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    const bodies = [];
    let spawnType = 'ball';
    let gravity = 9.8;
    let restitution = 0.75;

    class Body {
      constructor(x, y, vx, vy, type = 'ball', size = 16, color = '#2563eb') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.size = size;
        this.color = color;
        this.rotation = Math.random() * Math.PI * 2;
        this.vRot = (Math.random() - 0.5) * 0.1;
      }

      update(dt) {
        this.vy += gravity * 40 * dt;
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        this.rotation += this.vRot;

        // Left & Right bounds
        if (this.x - this.size < 0) {
          this.x = this.size;
          this.vx = -this.vx * restitution;
        } else if (this.x + this.size > width) {
          this.x = width - this.size;
          this.vx = -this.vx * restitution;
        }

        // Top & Bottom bounds
        if (this.y - this.size < 0) {
          this.y = this.size;
          this.vy = -this.vy * restitution;
        } else if (this.y + this.size > height - 4) {
          this.y = height - 4 - this.size;
          this.vy = -this.vy * restitution;
          this.vx *= 0.96;
        }
      }

      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.fillStyle = this.color;
        c.shadowColor = 'rgba(0,0,0,0.18)';
        c.shadowBlur = 8;
        c.shadowOffsetY = 3;

        if (this.type === 'ball') {
          c.beginPath();
          c.arc(0, 0, this.size, 0, Math.PI * 2);
          c.fill();
        } else {
          c.beginPath();
          c.roundRect
            ? c.roundRect(-this.size, -this.size, this.size * 2, this.size * 2, 4)
            : c.rect(-this.size, -this.size, this.size * 2, this.size * 2);
          c.fill();
        }
        c.restore();
      }
    }

    const colors = ['#2563eb', '#0284c7', '#0ea5e9', '#4f46e5', '#d97706'];
    for (let i = 0; i < 18; i++) {
      bodies.push(
        new Body(
          Math.random() * (width - 120) + 60,
          Math.random() * (height / 2.5) + 20,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          i % 2 === 0 ? 'ball' : 'box',
          14 + Math.random() * 8,
          colors[i % colors.length]
        )
      );
    }

    const btnBall = document.getElementById('btnSpawnBall');
    const btnBox = document.getElementById('btnSpawnBox');
    const btnExplode = document.getElementById('btnExplode');
    const btnClear = document.getElementById('btnClearSandbox');

    if (btnBall) {
      btnBall.addEventListener('click', () => {
        spawnType = 'ball';
        btnBall.classList.add('active');
        btnBox?.classList.remove('active');
      });
    }

    if (btnBox) {
      btnBox.addEventListener('click', () => {
        spawnType = 'box';
        btnBox.classList.add('active');
        btnBall?.classList.remove('active');
      });
    }

    if (btnExplode) {
      btnExplode.addEventListener('click', () => {
        bodies.forEach((b) => {
          b.vx += (Math.random() - 0.5) * 35;
          b.vy -= Math.random() * 25 + 10;
        });
        playSynthTone(220, 'sawtooth', 0.2, 0.08);
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        bodies.length = 0;
        playSynthTone(180, 'sine', 0.1, 0.04);
      });
    }

    const gravSlider = document.getElementById('gravitySlider');
    const gravVal = document.getElementById('gravityVal');
    if (gravSlider) {
      gravSlider.addEventListener('input', (e) => {
        gravity = parseFloat(e.target.value);
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

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      isDragging = true;
    });

    canvas.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      const vx = (dragStart.x - endX) * 0.15;
      const vy = (dragStart.y - endY) * 0.15;

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      bodies.push(new Body(dragStart.x, dragStart.y, vx, vy, spawnType, 16, randomColor));
      playSynthTone(440, 'triangle', 0.08, 0.05);
    });

    let lastTime = performance.now();
    const bodyCountElem = document.getElementById('bodyCount');

    function loop(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Subtle arena floor grid
      ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.size + b2.size;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            b1.vx -= p * 0.8 * nx;
            b1.vy -= p * 0.8 * ny;
            b2.vx += p * 0.8 * nx;
            b2.vy += p * 0.8 * ny;
          }
        }
      }

      bodies.forEach((b) => {
        b.update(dt);
        b.draw(ctx);
      });

      if (bodyCountElem) bodyCountElem.textContent = bodies.length;

      requestAnimationFrame(loop);
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
      initShaderMatrix();
      initSandbox();
    });
  } else {
    initShinyBackground();
    initHeroThreeJs();
    initShaderMatrix();
    initSandbox();
  }
})();
