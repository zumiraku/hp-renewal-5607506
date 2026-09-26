(() => {
  const header = document.querySelector('[data-header]');
  const pagetop = document.querySelector('[data-pagetop]');

  const flow = document.querySelector('[data-flow]');

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    header?.classList.toggle('is-scrolled', y > 8);
    pagetop?.classList.toggle('is-show', y > vh * 0.8);
    if (flow) {
      const r = flow.getBoundingClientRect();
      const p = Math.min(Math.max((vh * 0.75 - r.top) / r.height, 0), 1);
      flow.style.setProperty('--progress', p.toFixed(3));
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--d', `${i * 0.12}s`);
    });
  });

  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-inview'));
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-slider-track]');
    const items = [...track.children];
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    const dotsWrap = slider.querySelector('[data-slider-dots]');

    const dots = items.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `${i + 1}件目を表示`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(b);
      return b;
    });

    const offsetOf = (i) => items[i].offsetLeft - items[0].offsetLeft;
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const current = () => {
      const x = track.scrollLeft;
      let idx = 0;
      items.forEach((_, i) => {
        if (Math.abs(offsetOf(i) - x) < Math.abs(offsetOf(idx) - x)) idx = i;
      });
      return x >= maxScroll() - 4 ? items.length - 1 : idx;
    };
    const goTo = (i) => {
      const idx = Math.max(0, Math.min(i, items.length - 1));
      track.scrollTo({ left: Math.min(offsetOf(idx), maxScroll()), behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    const update = () => {
      const idx = current();
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= maxScroll() - 4;
    };

    prev?.addEventListener('click', () => goTo(current() - 1));
    next?.addEventListener('click', () => goTo(current() + 1));
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();

    if (reduceMotion) return;
    let timer = 0;
    let paused = false;
    let visible = false;
    const tick = () => {
      if (paused || !visible) return;
      track.scrollLeft >= maxScroll() - 4 ? goTo(0) : goTo(current() + 1);
    };
    const start = () => { clearInterval(timer); timer = setInterval(tick, 6000); };
    ['mouseenter', 'focusin', 'touchstart'].forEach((ev) => slider.addEventListener(ev, () => { paused = true; }, { passive: true }));
    ['mouseleave', 'focusout'].forEach((ev) => slider.addEventListener(ev, () => { paused = false; start(); }));
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(slider);
    start();
  });

  const menuBtn = document.querySelector('[data-menu-btn]');
  const drawer = document.querySelector('[data-drawer]');
  if (menuBtn && drawer) {
    const panel = drawer.querySelector('.drawer__panel');
    let lastFocus = null;

    const setOpen = (open) => {
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.querySelector('.menu-btn__label').textContent = open ? '閉じる' : 'メニュー';
      document.body.classList.toggle('is-locked', open);
      document.body.classList.toggle('is-menu-open', open);
      if (open) {
        lastFocus = document.activeElement;
        panel.querySelector('a')?.focus({ preventScroll: true });
      } else if (lastFocus) {
        lastFocus.focus({ preventScroll: true });
      }
    };

    menuBtn.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
    drawer.querySelectorAll('[data-drawer-close]').forEach((el) => {
      el.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [menuBtn, ...panel.querySelectorAll('a, button')];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    matchMedia('(min-width: 1080px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }
})();
