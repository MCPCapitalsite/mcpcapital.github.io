/* MCP Capital v2 — Institutional finance interactions */
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

  /* ── Custom cursor (refined) ──────────────────── */
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
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tickRing);
    })();

    document.querySelectorAll('a, button, .btn, .card--hover, details, summary').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ── Hero ambient particles (subtle, no network) ── */
  function initCanvas() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero__canvas';
    // Insert after the orb div if present, else first child
    const orb = hero.querySelector('.hero__orb');
    if (orb) orb.after(canvas);
    else hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    const N = 22;
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); rebuild(); }, { passive: true });

    function rebuild() {
      particles = Array.from({ length: N }, () => ({
        x:    Math.random() * W,
        y:    Math.random() * H,
        vx:   (Math.random() - 0.5) * 0.20,
        vy:   (Math.random() - 0.5) * 0.20,
        r:    Math.random() * 1.4 + 0.5,
        base: Math.random() * 0.10 + 0.04,
        phase: Math.random() * Math.PI * 2,
        freq:  0.007 + Math.random() * 0.010,
      }));
    }
    rebuild();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.phase += p.freq;

        const alpha = p.base + Math.sin(p.phase) * 0.04;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 110, ${Math.max(0, alpha)})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Text scramble (h2 decode on enter) ──────── */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-–_';

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
          start: Math.floor(Math.random() * 14),
          end:   Math.floor(Math.random() * 14) + 16,
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
          if (!item.char || Math.random() < 0.22)
            item.char = CHARS[Math.floor(Math.random() * CHARS.length)];
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
        setTimeout(() => {
          const sc = new TextScramble(e.target);
          sc.setText(e.target.innerText);
        }, 100);
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
        const el   = e.target;
        const raw  = el.textContent.trim();
        const num  = parseFloat(raw);
        if (isNaN(num)) return;
        const suffix = raw.replace(/[\d.]/g, '');
        const dec    = raw.includes('.') ? raw.split('.')[1]?.replace(/\D/g,'').length || 0 : 0;
        let start = null;
        const dur = 1600;
        const tick = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4); // quartic ease-out
          el.textContent = (eased * num).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.7 });
    document.querySelectorAll('.stat-strip__value').forEach(el => io.observe(el));
  }

  /* ── 3D card tilt (subtle) ────────────────────── */
  function initTilt() {
    document.querySelectorAll('.card--hover').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left  - r.width  / 2) / r.width;
        const dy = (e.clientY - r.top   - r.height / 2) / r.height;
        card.style.transition = 'box-shadow .18s, border-color .18s';
        card.style.transform  = `perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1), box-shadow .18s, border-color .18s';
        card.style.transform  = '';
      });
    });
  }

  /* ── Magnetic buttons (very subtle) ──────────── */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.20;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.20;
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
        div.style.backgroundPositionY = `calc(50% + ${(progress - 0.5) * 65}px)`;
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
    const els = document.querySelectorAll(
      '[data-reveal],[data-reveal-left],[data-reveal-right],[data-reveal-stagger]'
    );
    const io = new IntersectionObserver((entries) => {
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

  /* ── Hero label typing ────────────────────────── */
  function initTyping() {
    const label = document.querySelector('.hero .label');
    if (!label) return;
    const text = label.textContent.trim();
    label.textContent = '';
    label.style.borderRight = '1px solid rgba(200,169,110,0.65)';
    label.style.paddingRight = '2px';
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        label.textContent = text.slice(0, i++);
        setTimeout(type, 38 + Math.random() * 20);
      } else {
        let on = true;
        setInterval(() => {
          label.style.borderRightColor = (on = !on)
            ? 'rgba(200,169,110,0.65)'
            : 'transparent';
        }, 600);
      }
    };
    setTimeout(type, 600);
  }

  /* ── Financial ticker ─────────────────────────── */
  function initTicker() {
    const ticker = document.querySelector('.ticker__track');
    if (!ticker) return;
    // Duplicate content for seamless infinite scroll
    ticker.innerHTML += ticker.innerHTML;
  }

  /* ── Boot ─────────────────────────────────────── */
  initScrollProgress();
  initReveal();
  initNavScroll();
  initTicker();

  if (!prefersReduced) {
    initCursor();
    initCanvas();
    initScramble();
    initCounters();
    initTilt();
    initMagnetic();
    initParallax();
    initScrollDots();
    initTyping();
  }
})();
