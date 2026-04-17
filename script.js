// ============================================================
//  PORTFOLIO — FULL INTERACTIVE ENGINE
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

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
      document.body.style.overflowY = 'auto';

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
    const SHOOT_COUNT = 12;
    const shootPos = new Float32Array(SHOOT_COUNT * 3);
    for (let i = 0; i < SHOOT_COUNT * 3; i++)
      shootPos[i] = (Math.random() - 0.5) * 600;
    const shootGeo = new THREE.BufferGeometry();
    shootGeo.setAttribute('position', new THREE.BufferAttribute(shootPos, 3));
    const shootMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, transparent: true, opacity: 0.95 });
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

      // race shooting stars diagonally
      const shp = shootGeo.attributes.position.array;
      for (let i = 0; i < SHOOT_COUNT * 3; i += 3) {
        shp[i] -= 1.5 + Math.random() * 1;
        shp[i + 1] -= 1.5 + Math.random() * 0.8;
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

  // ── 3. FLOATING PARTICLES ────────────────────────────────
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-container';
  document.body.appendChild(particlesContainer);
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 20 + 's';
    particlesContainer.appendChild(p);
  }

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
    r.style.top  = e.clientY + 'px';
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
        document.body.style.overflow = 'hidden';
        if (navBar) navBar.style.background = 'transparent';
      } else {
        document.body.style.overflow = '';
        document.body.style.overflowX = 'hidden';
        if (navBar) navBar.style.background = ''; // reset to CSS default
      }
    });

    // Close menu when a link is clicked
    navLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('open');
        document.body.style.overflow = '';
        document.body.style.overflowX = 'hidden';
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
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
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
