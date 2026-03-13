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
    }, { threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  }

  if (prefersReduced) return;

  // ── 2. Staggered children ────────────────────────────────────────────────
  const STAGGER_SEL = [
    '.grid > *',
    '.what-grid > *',
    '.mirror__col',
    '.timeline > li',
    '.split--tight > *',
    '.contactcards > *',
  ].join(', ');

  document.querySelectorAll(STAGGER_SEL).forEach(el => el.classList.add('stagger-child'));

  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const children = e.target.querySelectorAll('.stagger-child:not(.stagger-visible)');
      children.forEach((child, i) => {
        child.style.animationDelay = `${i * 90}ms`;
        child.classList.add('stagger-visible');
      });
      staggerObs.unobserve(e.target);
    });
  }, { threshold: 0.07 });

  document.querySelectorAll('.section, .hero').forEach(s => staggerObs.observe(s));

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

  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

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

  // ── 6. 3D card tilt on hover ─────────────────────────────────────────────
  document.querySelectorAll('.card--hover').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
      card.style.transform = `perspective(700px) translateY(-3px) rotateX(${y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform .06s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .35s ease, border-color .12s ease, box-shadow .12s ease';
    });
  });

  // ── 7. h2 underline draw on scroll ──────────────────────────────────────
  const h2Obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('h2-drawn');
        h2Obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('h2').forEach(h => h2Obs.observe(h));

  // ── 8. Nav shrink on scroll ──────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── 9. Pill stagger on hero load ─────────────────────────────────────────
  document.querySelectorAll('.pill').forEach((pill, i) => {
    pill.style.opacity = '0';
    pill.style.transform = 'translateY(8px)';
    setTimeout(() => {
      pill.style.transition = 'opacity .4s ease, transform .4s ease';
      pill.style.opacity = '1';
      pill.style.transform = '';
    }, 600 + i * 100);
  });

  // ── 10. Timeline step highlight on scroll ────────────────────────────────
  const timelineObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('tl-active');
    });
  }, { threshold: 0.7 });

  document.querySelectorAll('.timeline li').forEach(li => timelineObs.observe(li));

})();
