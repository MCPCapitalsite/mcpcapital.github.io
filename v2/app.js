/* MCP Capital v2 — Futuristic interactions */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ── Scroll progress bar ──────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ── Custom cursor ────────────────────────────── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot  = document.createElement('div'); dot.className  = 'cursor';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -200, my = -200, rx = -200, ry = -200;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function tickRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tickRing);
    })();

    document.querySelectorAll('a, button, .btn, .card--hover, details, summary').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ── Hero canvas particles ────────────────────── */
  function initCanvas() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero__canvas';
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext('2d');

    const N = 55, MAX = 140;
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); rebuild(); }, { passive: true });

    function rebuild() {
      particles = Array.from({ length: N }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r:  Math.random() * 1.5 + 0.8,
        o:  Math.random() * 0.4 + 0.2,
      }));
    }
    rebuild();

    // Mouse interaction
    let mouse = { x: -9999, y: -9999 };
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < N; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // Repel from mouse
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          p.x += (dx / dist) * 1.4;
          p.y += (dy / dist) * 1.4;
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,136,${p.o})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < N; j++) {
          const q = particles[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < MAX) {
            const alpha = (1 - d / MAX) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,136,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Glitch on hero h1 ────────────────────────── */
  function initGlitch() {
    const h1 = document.querySelector('.hero h1');
    if (!h1) return;
    h1.setAttribute('data-text', h1.textContent);

    function doGlitch() {
      h1.classList.add('glitching');
      setTimeout(() => h1.classList.remove('glitching'), 280);
      setTimeout(doGlitch, 3200 + Math.random() * 5500);
    }
    setTimeout(doGlitch, 1800);
  }

  /* ── Text scramble ────────────────────────────── */
  const CHARS = '!<>-_\\/[]{}=+*^?#01';

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.queue = [];
      this.frame = 0;
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const old = this.el.innerText;
      const len = Math.max(old.length, newText.length);
      const promise = new Promise(r => (this.resolve = r));
      this.queue = [];
      for (let i = 0; i < len; i++) {
        this.queue.push({
          from:  old[i] || '',
          to:    newText[i] || '',
          start: Math.floor(Math.random() * 16),
          end:   Math.floor(Math.random() * 16) + 18,
          char:  '',
        });
      }
      cancelAnimationFrame(this.raf);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let out = '', done = 0;
      for (const item of this.queue) {
        if (this.frame >= item.end) {
          done++;
          out += item.to;
        } else if (this.frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          out += `<span class="scramble-char">${item.char}</span>`;
        } else {
          out += item.from;
        }
      }
      this.el.innerHTML = out;
      if (done === this.queue.length) { this.resolve(); return; }
      this.raf = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  function initScramble() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        // Delay slightly so the reveal animation starts first
        setTimeout(() => {
          const sc = new TextScramble(e.target);
          sc.setText(e.target.innerText);
        }, 120);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('h2').forEach(el => io.observe(el));
  }

  /* ── Counter animation ────────────────────────── */
  function initCounters() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw);
        if (isNaN(num)) return;
        const suffix = raw.replace(/[\d.]/g, '');
        const dec = raw.includes('.') ? raw.split('.')[1].replace(/\D/g, '').length : 0;

        let start = null;
        const dur = 1400;
        const tick = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (eased * num).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.7 });

    document.querySelectorAll('.stat-strip__value').forEach(el => io.observe(el));
  }

  /* ── 3-D card tilt ────────────────────────────── */
  function initTilt() {
    document.querySelectorAll('.card--hover').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left  - r.width  / 2) / r.width;
        const dy = (e.clientY - r.top   - r.height / 2) / r.height;
        card.style.transition = 'box-shadow .18s, border-color .18s';
        card.style.transform  =
          `perspective(700px) rotateX(${-dy * 9}deg) rotateY(${dx * 9}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .45s cubic-bezier(.23,1,.32,1), box-shadow .18s, border-color .18s';
        card.style.transform  = '';
      });
    });
  }

  /* ── Magnetic buttons ─────────────────────────── */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
        btn.style.transition = 'box-shadow .18s, background .12s, border-color .12s';
        btn.style.transform  = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1), box-shadow .18s';
        btn.style.transform  = '';
      });
    });
  }

  /* ── Parallax on dividers ─────────────────────── */
  function initParallax() {
    const dividers = document.querySelectorAll('.divider');
    function tick() {
      const vh = window.innerHeight;
      dividers.forEach(div => {
        const r = div.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (vh - r.top) / (vh + r.height);
        const offset = (progress - 0.5) * 70;
        div.style.backgroundPositionY = `calc(50% + ${offset}px)`;
      });
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── Side scroll dots ─────────────────────────── */
  function initScrollDots() {
    const sections = ['about', 'process', 'criteria', 'value', 'team', 'contact'];
    const nav = document.createElement('nav');
    nav.className = 'scroll-dots';
    nav.setAttribute('aria-label', 'Page sections');
    nav.innerHTML = sections
      .map(id => `<a href="#${id}" class="scroll-dot" data-section="${id}" title="${id}"></a>`)
      .join('');
    document.body.appendChild(nav);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const dot = nav.querySelector(`[data-section="${e.target.id}"]`);
        if (dot) dot.classList.toggle('active', e.isIntersecting);
      });
    }, { threshold: 0.35 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ── Scroll reveal ────────────────────────────── */
  function initReveal() {
    const attr = ['[data-reveal]', '[data-reveal-left]', '[data-reveal-right]', '[data-reveal-stagger]'];
    const els  = document.querySelectorAll(attr.join(','));
    const io   = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10 });
    els.forEach(el => {
      if (prefersReduced) el.classList.add('is-visible');
      else io.observe(el);
    });
  }

  /* ── Nav style on scroll ──────────────────────── */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* ── Hero label typing effect ─────────────────── */
  function initTyping() {
    const label = document.querySelector('.hero .label');
    if (!label) return;
    const text = label.textContent.trim();
    label.textContent = '';
    label.style.borderRight = '2px solid rgba(0,255,136,.85)';
    label.style.paddingRight = '2px';
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        label.textContent = text.slice(0, i++);
        setTimeout(type, 36 + Math.random() * 22);
      } else {
        // Blink cursor after done
        let on = true;
        setInterval(() => {
          label.style.borderRightColor = (on = !on)
            ? 'rgba(0,255,136,.85)'
            : 'transparent';
        }, 500);
      }
    };
    setTimeout(type, 500);
  }

  /* ── Boot ─────────────────────────────────────── */
  initScrollProgress();
  initReveal();
  initNavScroll();

  if (!prefersReduced) {
    initCursor();
    initCanvas();
    initGlitch();
    initScramble();
    initCounters();
    initTilt();
    initMagnetic();
    initParallax();
    initScrollDots();
    initTyping();
  }
})();
