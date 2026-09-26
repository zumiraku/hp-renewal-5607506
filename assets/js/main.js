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

  const counters = document.querySelectorAll('[data-count]');
  const fmt = (n, el) => (el.dataset.format === 'comma' ? n.toLocaleString('ja-JP') : String(n));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        const el = entry.target;
        const end = Number(el.dataset.count);
        const dur = 1600;
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 4))), el);
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = fmt(0, el);
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  const parallax = [...document.querySelectorAll('[data-parallax]')];
  const runParallax = () => {
    const vh = window.innerHeight;
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const shift = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
      el.style.translate = `0 ${shift.toFixed(1)}px`;
    });
  };
  if (!reduceMotion && parallax.length) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { runParallax(); ticking = false; });
    }, { passive: true });
    runParallax();
  }

  const stage = document.querySelector('.hero__stage');
  if (stage && !reduceMotion && matchMedia('(hover: hover) and (min-width: 960px)').matches) {
    const layers = stage.querySelectorAll('.hero__staff, .hero__bubble');
    stage.closest('.hero').addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      layers.forEach((el, i) => {
        const depth = 6 + (i % 3) * 5;
        el.style.transform = `translate(${(x * depth).toFixed(1)}px, ${(y * depth).toFixed(1)}px)`;
      });
    });
  }

  const navLinks = [...document.querySelectorAll('.gnav__list a[href^="#"]')];
  const spyTargets = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (spyTargets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach((t) => spy.observe(t));
  }

  document.querySelectorAll('[data-accordion]').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = summary.nextElementSibling;
    let anim = null;
    let lastClosing = false;

    summary.addEventListener('click', (e) => {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      const closing = anim ? !lastClosing : details.open;
      lastClosing = closing;
      anim?.cancel();
      const from = body.offsetHeight;
      if (!closing) details.open = true;
      const to = closing ? 0 : body.scrollHeight;
      body.style.overflow = 'hidden';
      anim = body.animate(
        [{ height: `${closing ? from : 0}px`, opacity: closing ? 1 : 0 }, { height: `${to}px`, opacity: closing ? 0 : 1 }],
        { duration: 380, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
      anim.onfinish = () => {
        if (closing) details.open = false;
        body.style.overflow = '';
        anim = null;
      };
    });
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

  document.documentElement.setAttribute('data-ready', '');
})();
