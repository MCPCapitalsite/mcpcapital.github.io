(() => {
  document.documentElement.classList.add("js");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── 1. Scroll-reveal ─────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.07 });
    revealEls.forEach(el => io.observe(el));
  }

  if (prefersReduced) return;

  // ── 2. Staggered children ────────────────────────────────────────────────
  const STAGGER_SEL = [
    '.grid > *',
    '.what-grid > *',
    '.mirror__col',
    '.split--tight > *',
    '.contactcards > *',
    '.stats-strip .stat',
  ].join(', ');

  document.querySelectorAll(STAGGER_SEL).forEach(el => el.classList.add('stagger-child'));
  // slide-from-left for section labels
  document.querySelectorAll('.section-label').forEach(el => el.classList.add('slide-left'));

  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const children = e.target.querySelectorAll('.stagger-child:not(.stagger-visible), .slide-left:not(.stagger-visible)');
      children.forEach((child, i) => {
        child.style.animationDelay = `${i * 85}ms`;
        child.classList.add('stagger-visible');
      });
      staggerObs.unobserve(e.target);
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.section, .hero, .stats-strip').forEach(s => staggerObs.observe(s));

  // ── 3. Parallax dividers ─────────────────────────────────────────────────
  const dividers = document.querySelectorAll('.divider');

  function updateParallax() {
    const vh = window.innerHeight;
    dividers.forEach(div => {
      const rect = div.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      const baseY = parseFloat(div.dataset.parallaxBase ?? 50);
      const progress = (vh - rect.top) / (vh + rect.height);
      const shift = (progress - 0.5) * -70;
      div.style.backgroundPositionY = `calc(${baseY}% + ${shift}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();

  // ── 4. Scroll progress bar ───────────────────────────────────────────────
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  function updateBar() {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });

  // ── 5. Active nav highlight ──────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.menu a');

  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach(s => navObs.observe(s));

  // ── 6. Nav shrink ────────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  }, { passive: true });

  // ── 7. 3D card tilt ──────────────────────────────────────────────────────
  document.querySelectorAll('.card--hover').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
      card.style.transform = `perspective(800px) translateY(-3px) rotateX(${y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform .06s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s ease, border-color .18s ease, box-shadow .18s ease';
    });
  });

  // ── 8. h2 underline draw ─────────────────────────────────────────────────
  const h2Obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('h2-drawn'); h2Obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('h2').forEach(h => h2Obs.observe(h));

  // ── 9. Pill entrance ─────────────────────────────────────────────────────
  document.querySelectorAll('.pill').forEach((pill, i) => {
    pill.style.opacity = '0';
    pill.style.transform = 'translateY(10px)';
    setTimeout(() => {
      pill.style.transition = 'opacity .45s ease, transform .45s ease, border-color .15s ease';
      pill.style.opacity = '1';
      pill.style.transform = '';
    }, 700 + i * 110);
  });

  // ── 10. Timeline sequential reveal ──────────────────────────────────────
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const items = [...timeline.querySelectorAll('li')];
    const tlObs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      tlObs.disconnect();
      items.forEach((li, i) => setTimeout(() => li.classList.add('tl-active'), i * 260));
    }, { threshold: 0.25 });
    tlObs.observe(timeline);
  }

  // ── 11. Count-up animation ───────────────────────────────────────────────
  function countUp(el) {
    const target = parseInt(el.dataset.count);
    if (isNaN(target)) return;
    const duration = 1200;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stats-strip, .kpi').forEach(el => countObs.observe(el));

  // ── 12. Magnetic buttons ─────────────────────────────────────────────────
  document.querySelectorAll('.btn--glow, .btn--primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px) translateY(-1px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform .4s cubic-bezier(.22,1,.36,1), box-shadow .2s ease';
    });
  });

  // ── 13. Button ripple ────────────────────────────────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── 14. Hero floating particles (canvas) ────────────────────────────────
  const canvas = document.createElement('canvas');
  const particlesEl = document.querySelector('.hero__particles');
  if (particlesEl) {
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    particlesEl.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    const N = 40;

    function resize() {
      canvas.width = particlesEl.offsetWidth;
      canvas.height = particlesEl.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: -(Math.random() * 0.4 + 0.1),
        a: Math.random(),
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a * 0.4})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ── 15. Criteria section mouse-following glow ───────────────────────────
  const criteriaSection = document.querySelector('#criteria');
  if (criteriaSection) {
    const glow = document.createElement('div');
    glow.className = 'criteria-glow';
    criteriaSection.appendChild(glow);

    let cx = -800, cy = -800, tx = -800, ty = -800;
    let inside = false;

    criteriaSection.addEventListener('mouseenter', () => { inside = true; glow.style.opacity = '1'; });
    criteriaSection.addEventListener('mouseleave', () => { inside = false; glow.style.opacity = '0'; });
    criteriaSection.addEventListener('mousemove', e => {
      const r = criteriaSection.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    });

    (function animateGlow() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      requestAnimationFrame(animateGlow);
    })();
  }

  // ── 16. h1 word reveal ───────────────────────────────────────────────────
  const h1 = document.querySelector('.hero__h1');
  if (h1) {
    const words = h1.innerHTML.replace('<br>', ' ‖ ').split(' ');
    h1.innerHTML = words.map(w => {
      if (w === '‖') return '<br>';
      return `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="word" style="display:inline-block">${w}</span></span>`;
    }).join(' ');

    setTimeout(() => {
      h1.querySelectorAll('.word').forEach((w, i) => {
        w.style.transform = 'translateY(110%)';
        setTimeout(() => {
          w.style.transition = 'transform .65s cubic-bezier(.22,1,.36,1)';
          w.style.transform = '';
        }, 80 + i * 90);
      });
    }, 100);
  }

})();
