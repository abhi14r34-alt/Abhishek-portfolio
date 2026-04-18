// ============================================================
//  PORTFOLIO — FULL INTERACTIVE ENGINE
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  // Lock scroll on load for splash screen
  document.body.classList.add('no-scroll');

  // ── 0. SPLASH SCREEN ENTER ────────────────────────────────
  const splashScreen = document.getElementById('splash-screen');
  const mainPortfolio = document.getElementById('main-portfolio');
  const enterBtn = document.getElementById('enter-btn');

  if (enterBtn && splashScreen && mainPortfolio) {
    enterBtn.addEventListener('click', () => {
      // Fade out splash
      splashScreen.style.opacity = '0';
      splashScreen.style.visibility = 'hidden';

      // Reveal portfolio
      mainPortfolio.style.opacity = '1';
      mainPortfolio.style.pointerEvents = 'auto';

      // Re-enable scrolling
      document.body.classList.remove('no-scroll');

      // Remove splash from DOM after transition
      setTimeout(() => {
        splashScreen.remove();
      }, 900);
    });
  }

  // ── 1. DYNAMIC BACKGROUND (time-based) ──────────────────
  function updateBackground() {
    const h = new Date().getHours();
    const g =
      h < 6 ? 'linear-gradient(135deg, #020611 0%, #0a1628 50%, #070e1e 100%)' :
        h < 12 ? 'linear-gradient(135deg, #020611 0%, #06122b 50%, #0b1e3a 100%)' :
          h < 18 ? 'linear-gradient(135deg, #060a14 0%, #0b2040 50%, #06122b 100%)' :
            'linear-gradient(135deg, #020611 0%, #0a1628 50%, #070e1e 100%)';
    document.body.style.backgroundImage = g;
  }
  updateBackground();
  setInterval(updateBackground, 60000);

  // ── 2. THREE.JS — STARFIELD + SHOOTING STARS ────────────
  function initThreeJS() {
    if (typeof THREE === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      zIndex: '-3', pointerEvents: 'none'
    });
    document.body.prepend(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 800);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    /* — background stars — */
    const STAR_COUNT = 6000;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT * 3; i++)
      starPos[i] = (Math.random() - 0.5) * 600;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xaaaaff, size: 0.55, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* — shooting stars — */
    const SHOOT_COUNT = 15;
    const shootPos = new Float32Array(SHOOT_COUNT * 3);
    for (let i = 0; i < SHOOT_COUNT * 3; i++)
      shootPos[i] = (Math.random() - 0.5) * 600;
    const shootGeo = new THREE.BufferGeometry();
    shootGeo.setAttribute('position', new THREE.BufferAttribute(shootPos, 3));
    const shootMat = new THREE.PointsMaterial({ color: 0xffffff, size: 4.8, transparent: true, opacity: 0.98 });
    const shootStars = new THREE.Points(shootGeo, shootMat);
    scene.add(shootStars);

    /* — render loop — */
    (function animate() {
      requestAnimationFrame(animate);
      // drift background stars
      const sp = starGeo.attributes.position.array;
      for (let i = 1; i < STAR_COUNT * 3; i += 3) {
        sp[i] -= 0.12 + Math.random() * 0.02;
        if (sp[i] < -200) sp[i] = 200;
      }
      starGeo.attributes.position.needsUpdate = true;

      // race shooting stars diagonally (increased speed slightly)
      const shp = shootGeo.attributes.position.array;
      for (let i = 0; i < SHOOT_COUNT * 3; i += 3) {
        shp[i] -= 2.2 + Math.random() * 1.5;
        shp[i + 1] -= 2.2 + Math.random() * 1.2;
        if (shp[i + 1] < -300 || shp[i] < -300) {
          shp[i] = (Math.random() - 0.5) * 600;
          shp[i + 1] = 300 + Math.random() * 100;
          shp[i + 2] = (Math.random() - 0.5) * 200;
        }
      }
      shootGeo.attributes.position.needsUpdate = true;
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
    })();

    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }
  initThreeJS();

  // ── 3. INTERACTIVE CANVAS PARTICLES (SCROLL-REACT TEXT) ──
  const pCanvas = document.createElement('canvas');
  const pCtx = pCanvas.getContext('2d', { alpha: true });
  pCanvas.id = 'particle-canvas';
  Object.assign(pCanvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    zIndex: '-1', pointerEvents: 'none'
  });
  document.body.appendChild(pCanvas);

  const tCanvas = document.createElement('canvas');
  const tCtx = tCanvas.getContext('2d');

  let particles = [];
  const PARTICLE_COUNT = 2500; // Increased massively for highly dense section text
  let mouse = { x: -1000, y: -1000, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.init();
    }
    init() {
      this.x = Math.random() * pCanvas.width;
      this.y = Math.random() * pCanvas.height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 2 + 1.2; // Smaller size for more detail
      this.density = (Math.random() * 25) + 5;
      this.color = 'rgba(45, 168, 255, 0.8)';
      this.opacity = Math.random() * 0.5 + 0.3;
      this.baseOpacity = this.opacity;
      this.hue = 200; // Starting hue (cyan)
      this.glow = 0;
      this.glow = 0;
      // Pure mathematical bounds for a smooth sphere
      this.theta = Math.random() * Math.PI * 2;
      this.phi = Math.acos((Math.random() * 2) - 1);
    }
    draw() {
      const alpha = this.opacity + this.glow;
      pCtx.fillStyle = `hsla(${this.hue}, 100%, ${70 + this.glow * 30}%, ${alpha})`;
      // Using fillRect instead of arc for extreme performance gains
      const d = (this.size + this.glow * 2) * 2;
      pCtx.fillRect(this.x - d / 2, this.y - d / 2, d, d);
    }
    update() {
      if (window.earthMode) {
        let t = (Date.now() - window.earthStartTime) * 0.0005; // Spin speed
        let r = 400; // Massively Giant Earth sphere radius
        let rotTheta = this.theta - t - Math.PI * 0.5; // Offset pointing exactly at India mapping

        let sphX = r * Math.sin(this.phi) * Math.cos(rotTheta);
        let sphY = r * Math.sin(this.phi) * Math.sin(rotTheta);
        let sphZ = r * Math.cos(this.phi);
        let persp = 800 / (800 + sphZ); // Pulled 3D perspective camera back to handle giant globe


        let targetX = window.earthCenter.x + sphX * persp;
        let targetY = window.earthCenter.y + sphY * persp;

        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;
        this.opacity = Math.max(0.1, 0.1 + (persp - 0.6) * 1.5); // Falloff shadow on back of earth
      } else {
        this.opacity = this.baseOpacity;

        // --- Interactive Hover Repulsion ONLY on text ---
        let mx = mouse.x - this.x;
        let my = mouse.y - this.y;
        let distance = Math.sqrt(mx * mx + my * my);

        if (distance < mouse.radius) {
          this.glow += (0.4 - this.glow) * 0.1;
          let forceDirX = mx / distance;
          let forceDirY = my / distance;
          let force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirX * force * this.density;
          this.y -= forceDirY * force * this.density;
        } else {
          this.glow *= 0.9;
        }

        // Return to flat text shape smoothly
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          this.x -= dx / 15;
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          this.y -= dy / 15;
        }
      }
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.85;
      this.vy *= 0.85;
    }
  }

  function initParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  let textTransitionTimeout;
  function updateParticleText(text) {
    if (!text) return;

    tCanvas.width = pCanvas.width;
    tCanvas.height = pCanvas.height;
    tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);

    // Responsive font size
    const fontSize = Math.min(pCanvas.width / (text.length * 0.6), 180);
    tCtx.font = `900 ${fontSize}px Poppins`;
    tCtx.fillStyle = 'white';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(text.toUpperCase(), tCanvas.width / 2, tCanvas.height / 2);

    const data = tCtx.getImageData(0, 0, tCanvas.width, tCanvas.height).data;
    const points = [];
    const step = 2; // Extremely fine step for maximum text point availability

    for (let y = 0; y < tCanvas.height; y += step) {
      for (let x = 0; x < tCanvas.width; x += step) {
        if (data[(y * tCanvas.width + x) * 4 + 3] > 128) {
          points.push({ x, y });
        }
      }
    }

    // Shuffle points to distribute particles evenly across the word
    const shuffledPoints = points.sort(() => Math.random() - 0.5);

    // Assign points to particles
    for (let i = 0; i < particles.length; i++) {
      if (i < shuffledPoints.length) {
        particles[i].baseX = shuffledPoints[i].x;
        particles[i].baseY = shuffledPoints[i].y;
        particles[i].opacity = 0.8;
      } else {
        // Surround the text with a looser cloud
        particles[i].baseX = Math.random() * pCanvas.width;
        particles[i].baseY = Math.random() * pCanvas.height;
        particles[i].opacity = 0.1;
      }
    }
  }

  function connectParticles() {
    let opacityValue = 1;
    // Connect particles to each other (aggressively reduced check density)
    for (let a = 0; a < particles.length; a += 20) {
      for (let b = a; b < particles.length; b += 20) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 60) {
          opacityValue = 1 - (distance / 60);
          pCtx.strokeStyle = `hsla(${particles[a].hue}, 100%, 70%, ${opacityValue * 0.2})`;
          pCtx.lineWidth = 0.5;
          pCtx.beginPath();
          pCtx.moveTo(particles[a].x, particles[a].y);
          pCtx.lineTo(particles[b].x, particles[b].y);
          pCtx.stroke();
        }
      }
    }
  }

  // ── 4. OCEAN ENTITIES (SHIP, DOLPHINS, SHARKS) ──────────
  const oceanEntities = [];
  const ENTITY_PATHS = {
    A: 'FONT' // We will use native font rendering for ultimate quality
  };

  class OceanEntity {
    constructor(type) {
      this.type = type;
      if (!window.entityPts) Object.assign(window, { entityPts: {} });
      if (!window.entityPts[type]) {
        tCanvas.width = 300; tCanvas.height = 300;
        tCtx.clearRect(0, 0, 300, 300);

        if (type === 'A') {
          tCtx.fillStyle = '#fff';
          tCtx.font = '900 240px Poppins, sans-serif';
          tCtx.textAlign = 'center';
          tCtx.textBaseline = 'middle';
          tCtx.fillText('A', 150, 150);
        } else {
          tCtx.save();
          tCtx.translate(150, 150);
          tCtx.scale(2.5, 2.5); // Slightly smaller base scale for 3D
          tCtx.translate(-50, -50);
          tCtx.fillStyle = '#fff';
          tCtx.fill(new Path2D(ENTITY_PATHS[type]));
          tCtx.restore();
        }

        const data = tCtx.getImageData(0, 0, 300, 300).data;
        const pts = [];
        for (let y = 0; y < 300; y += 6) { // Halving the point density again
          for (let x = 0; x < 300; x += 6) {
            if (data[(y * 300 + x) * 4 + 3] > 128) {
              // Generate 3D volume by adding Z layers (fewer layers for speed)
              const baseZ = 40;
              const layers = 1; // Only 3 layers total (-1, 0, 1)
              for (let z = -layers; z <= layers; z++) {
                pts.push({
                  bx: x - 150,
                  by: y - 150,
                  bz: z * (baseZ / layers) * (1 - Math.abs((y - 150) / 150)) // Puffy hull/body
                });
              }
            }
          }
        }
        window.entityPts[type] = pts;
      }
      this.rootPts = window.entityPts[type];
      this.rotationY = 0;
      this.reset();
    }
    reset() {
      this.z = 1500; // Deep center background
      this.x = 0; // Fixed center X
      this.y = 0; // Fixed center Y
      this.speedZ = 3.5; // Consistent outward speed
      this.speedX = 0; // No horizontal drift
      this.speedY = 0; // No vertical drift
      this.scale = 7.0; // Mega massive grand scale for S+ grade
      this.angle = 0; // Start facing viewer
      this.particles = this.rootPts.map(p => ({
        x: p.bx, y: p.by, z: p.bz,
        bx: p.bx, by: p.by, bz: p.bz,
        vx: 0, vy: 0, vz: 0, glow: 0
      }));
      this.wakes = [];
    }
    draw(currentHue) {
      const focalLength = 350; // Cinematic FOV
      pCtx.save();
      pCtx.translate(pCanvas.width / 2, pCanvas.height / 2); // Center perspective

      const cosY = Math.cos(this.angle);
      const sinY = Math.sin(this.angle);

      // Sort by combined Z
      const sorted = this.particles.slice().sort((a, b) => {
        return (this.z + b.z) - (this.z + a.z);
      });

      sorted.forEach(p => {
        // Local 3D Rotation
        let rx = p.x * cosY - p.z * sinY;
        let rz = p.x * sinY + p.z * cosY;

        // World-space Z
        const worldZ = this.z + rz;
        if (worldZ < -focalLength) return; // Behind camera

        // Perspective
        const persp = focalLength / (focalLength + worldZ);

        // Screen coords (with entity world position)
        const sx = (this.x + rx) * persp;
        const sy = (this.y + p.y) * persp;

        // Cinema-style scaling and brightness
        const distRatio = Math.max(0, 1 - worldZ / 1500);
        const brightness = 60 + distRatio * 30 + p.glow * 30;
        const opacity = Math.min((0.4 + distRatio * 0.6 + p.glow) * persp, 1);

        if (opacity <= 0.05) return; // Skip drawing very faint particles

        pCtx.fillStyle = `hsla(${currentHue}, 100%, ${brightness}%, ${opacity})`;
        const finalSize = (2.0 + p.glow) * persp * this.scale * 2;
        // fillRect is exponentially faster than arc/fill combo
        pCtx.fillRect(sx - finalSize / 2, sy - finalSize / 2, finalSize, finalSize);
      });
      pCtx.restore();
    }
    update() {
      this.z -= this.speedZ;
      this.x += this.speedX;
      this.y += this.speedY;
      this.angle += 0.025; // Re-enabled rotation for the majestic A

      // Entity wakes (converted to 3D aware would be complex, keeping 2D for fast aesthetics)
      // Wakes are less visible in this Z-flying mode, but we can add bubble trails
      if (this.type === 'ship' && Math.random() > 0.7) {
        // Wakes are best as background drift here
      }

      // Ocean Entity updating (Hover completely removed for grand ships)
      const cosY = Math.cos(this.angle);
      const sinY = Math.sin(this.angle);

      this.particles.forEach(p => {
        // Return to base positions cleanly
        p.vx += (p.bx - p.x) * 0.12;
        p.vy += (p.by - p.y) * 0.12;
        p.vz += (p.bz - p.z) * 0.12;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.vz *= 0.82;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
      });

      // Reset when it passes the camera or gets too close
      if (this.z < -200) this.reset();
    }
  }

  function initOcean() {
    oceanEntities.length = 0;
    // User requested to remove the passing A / Ship entities to keep it perfectly clean
  }
  initOcean();

  window.earthMode = false;
  window.earthCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.earthStartTime = Date.now();

  // Handle Gravity/Earth click
  document.addEventListener('click', (e) => {
    if (e.target.closest('nav') || e.target.closest('button') || e.target.closest('a')) return;

    // Toggle 3D Earth Mode on and set origin to click
    window.earthMode = !window.earthMode;
    if (window.earthMode) {
      window.earthCenter.x = e.clientX;
      window.earthCenter.y = e.clientY;
      window.earthStartTime = Date.now(); // Reset spin so it consistently reveals India first
    }
  });

  function drawLightRays() {
    const time = Date.now() * 0.0005;
    pCtx.save();
    pCtx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const x = (Math.sin(time + i) * 0.3 + 0.5) * pCanvas.width;
      const grad = pCtx.createRadialGradient(x, -200, 0, x, pCanvas.height, pCanvas.width);
      grad.addColorStop(0, 'rgba(100, 200, 255, 0.15)');
      grad.addColorStop(0.5, 'rgba(45, 168, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    }
    pCtx.restore();
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    drawLightRays(); // Cinematic light effect

    const time = Date.now() * 0.001;
    const currentHue = (200 + Math.sin(time * 0.5) * 40);

    // Draw Ocean Entities with internal particle systems
    oceanEntities.forEach(e => {
      e.update();
      e.draw(currentHue);
    });

    for (let i = 0; i < particles.length; i++) {
      particles[i].hue = currentHue;
      particles[i].update();
      particles[i].draw();
    }

    // Disable neural line webs while in Earth mode to see continents clearly
    if (!window.earthMode) {
      connectParticles();
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  window.addEventListener('resize', () => {
    initParticles();
    // Re-trigger text update on current active section
    const active = document.querySelector('.nav-links a.active');
    if (active) updateParticleText(active.textContent);
  });

  // ── 4. TYPING EFFECT FOR HERO NAME ──────────────────────
  const nameEl = document.querySelector('#home h1') || document.querySelector('header h1');
  if (nameEl) {
    const original = nameEl.textContent.trim();
    nameEl.textContent = '';
    let idx = 0;
    setTimeout(function type() {
      if (idx < original.length) {
        nameEl.textContent += original[idx++];
        setTimeout(type, 120);
      }
    }, 800);
  }

  // ── 5. INTERSECTION OBSERVER — SCROLL REVEAL ────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // — sections
  document.querySelectorAll('section').forEach(s => revealObserver.observe(s));

  // — timeline items (staggered)
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    item.style.transitionDelay = (i * 0.08) + 's';
    revealObserver.observe(item);
  });

  // — project cards (staggered)
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.08) + 's';
    revealObserver.observe(card);
  });

  // — award cards (staggered)
  document.querySelectorAll('.award-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.1) + 's';
    revealObserver.observe(card);
  });

  // ── 6. ANIMATED SKILL PROGRESS BARS ─────────────────────
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const progress = bar.querySelector('.progress');
        const target = progress ? progress.getAttribute('data-width') : null;
        if (target) {
          bar.classList.add('animate-in');
          setTimeout(() => { progress.style.width = target; }, 100);
        }
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-bar').forEach((bar, i) => {
    bar.style.transitionDelay = (i * 0.06) + 's';
    barObserver.observe(bar);
  });

  // ── 7. MOUSE PARALLAX ON HERO ────────────────────────────
  document.addEventListener('mousemove', (e) => {
    const mx = e.clientX / innerWidth - 0.5;
    const my = e.clientY / innerHeight - 0.5;

    const heroText = document.querySelector('.hero-text');
    if (heroText) {
      heroText.style.transform = `translate(${mx * 12}px, ${my * 8}px)`;
    }

    // Subtle cube follow
    const cube = document.querySelector('.cube');
    if (cube) {
      cube.style.transform = `rotateX(${-my * 60}deg) rotateY(${mx * 60}deg)`;
    }
  });

  // ── 8. (hover pause removed) ─────────────────────────────

  // ── 9. CLICK RIPPLE (excl. UI buttons) ──────────────────
  document.addEventListener('click', (e) => {
    // Avoid ripples on nav/buttons to reduce visual noise/stutter
    if (e.target.closest('nav') || e.target.closest('button')) return;

    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 1000);
  });

  // ── 10. HAMBURGER MENU TOGGLE ─────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');
  const navBar = document.querySelector('nav');

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.toggle('open');
      hamburger.classList.toggle('active');

      if (isOpen) {
        document.body.classList.add('no-scroll');
        if (navBar) navBar.style.background = 'transparent';
      } else {
        document.body.classList.remove('no-scroll');
        if (navBar) navBar.style.background = ''; // reset to CSS default
      }
    });

    // Close menu when a link is clicked
    navLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('open');
        document.body.classList.remove('no-scroll');
        if (navBar) navBar.style.background = '';
      });
    });
  }

  // ── 11. SMOOTH NAV SCROLL ────────────────────────────────
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── 12. NAV ACTIVE LINK HIGHLIGHT ON SCROLL (OPTIMIZED) ──
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionIds = ['home', 'aboutMe', 'experience', 'skills', 'projects', 'achievements', 'contactme'];

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          const isActive = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', isActive);
          if (isActive) {
            // Update particle background text to match section
            updateParticleText(a.textContent);
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) navObserver.observe(el);
  });

  // ── 13. DISABLE PARALLAX ON TOUCH DEVICES ────────────────
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    // Remove mouse parallax on hero text (can cause jank on touch)
    const heroText = document.querySelector('.hero-text');
    if (heroText) heroText.style.transform = 'none';
  }

});
