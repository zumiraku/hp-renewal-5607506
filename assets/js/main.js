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
