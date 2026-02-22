// MCP Capital v2 — Scroll reveal + subtle glitch effect
(() => {
  document.documentElement.classList.add("js");

  const els = document.querySelectorAll("[data-reveal]");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Scroll reveal
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.10 }
  );
  els.forEach((el) => io.observe(el));

  // Subtle nav highlight on scroll
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 20) {
      nav.style.borderBottomColor = "rgba(0, 255, 136, 0.18)";
    } else {
      nav.style.borderBottomColor = "";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // Typing cursor blink on hero label
  const label = document.querySelector(".hero .label");
  if (label) {
    const text = label.textContent;
    label.textContent = "";
    label.style.borderRight = "2px solid rgba(0,255,136,0.8)";
    label.style.display = "inline-block";
    label.style.paddingRight = "3px";
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        label.textContent = text.slice(0, i);
        i++;
        setTimeout(type, 38);
      } else {
        // Blink cursor
        let visible = true;
        setInterval(() => {
          label.style.borderRightColor = visible
            ? "rgba(0,255,136,0.8)"
            : "transparent";
          visible = !visible;
        }, 530);
      }
    };
    setTimeout(type, 400);
  }
})();
