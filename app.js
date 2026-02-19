// Safe scroll-reveal:
// - Visible by default (CSS failsafe)
// - Adds animations only if JS is running
(() => {
  document.documentElement.classList.add("js");

  const els = document.querySelectorAll("[data-reveal]");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();
