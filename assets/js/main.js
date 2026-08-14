(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
    backToTop.classList.toggle('show', window.scrollY > 500);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[data-nav]'));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- Typed role text ---------- */
  const roles = [
    'AI / ML Engineer',
    'Full-Stack Developer',
    'Data Science Student',
    'Deep Learning Practitioner'
  ];
  const typedEl = document.getElementById('typedRole');

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = roles[0];
    } else {
      let roleIndex = 0, charIndex = 0, deleting = false;
      const tick = () => {
        const current = roles[roleIndex];
        if (!deleting) {
          charIndex++;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) { deleting = true; setTimeout(tick, 1600); return; }
        } else {
          charIndex--;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
        }
        setTimeout(tick, deleting ? 35 : 65);
      };
      tick();
    }
  }

  /* ---------- Animated stat counters ---------- */
  const statEls = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCount(entry.target); statObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => statObserver.observe(el));

  /* =====================================================================
     GSAP-powered motion: hero entrance choreography, scroll-triggered
     stagger reveals, parallax background layers, an animated timeline
     connector, and magnetic buttons. Falls back to a plain visible state
     if GSAP failed to load or the user prefers reduced motion.
     ===================================================================== */

  if (!hasGsap) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = '1'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (reduceMotion) {
    gsap.set('.reveal', { opacity: 1, y: 0 });
    gsap.set(['.hero-visual', '.hero-title'], { clearProps: 'all' });
  } else {

    /* ---- Hero intro: pic + name splash that drags into the full layout on scroll ----
       Desktop/tablet: pin the hero and scrub the photo + name from a centered "splash"
       position into their normal grid slots, while the rest of the hero content fades
       in alongside. Small screens skip the pin (feels heavy-handed on touch) and just
       use a simple on-load fade/rise entrance instead. */
    const heroEls = {
      eyebrow: document.querySelector('.eyebrow'),
      title: document.querySelector('.hero-title'),
      role: document.querySelector('.hero-role'),
      summary: document.querySelector('.hero-summary'),
      cta: document.querySelector('.hero-cta'),
      socials: document.querySelector('.hero-socials'),
      visual: document.querySelector('.hero-visual')
    };
    const restSelectors = ['.eyebrow', '.hero-role', '.hero-summary', '.hero-cta', '.hero-socials'];

    let heroST = null;
    let heroTl = null;
    const DESKTOP_MIN = 821;

    function teardownHero() {
      if (heroST) { heroST.kill(); heroST = null; }
      if (heroTl) { heroTl.kill(); heroTl = null; }
      gsap.set([heroEls.title, heroEls.visual], { clearProps: 'transform' });
    }

    function runMobileHeroEntrance() {
      gsap.set([heroEls.eyebrow, heroEls.title, heroEls.role, heroEls.summary, heroEls.cta, heroEls.socials], { opacity: 0, y: 20 });
      gsap.set(heroEls.visual, { opacity: 0, scale: 0.88, y: 10 });
      gsap.set('.stats-bar .stat', { opacity: 0, y: 16 });
      gsap.set('.hero-socials a', { opacity: 0, y: 10 });

      heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
      heroTl
        .to(heroEls.eyebrow, { opacity: 1, y: 0, duration: 0.6 })
        .to(heroEls.title, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
        .to(heroEls.visual, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'expo.out' }, '-=0.55')
        .to(heroEls.role, { opacity: 1, y: 0, duration: 0.5 }, '-=0.7')
        .to(heroEls.summary, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .to(heroEls.cta, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .to(heroEls.socials, { opacity: 1, y: 0, duration: 0.4 }, '-=0.25')
        .to('.hero-socials a', { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3')
        .to('.stats-bar .stat', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.2');
    }

    function runDesktopHeroIntro() {
      const heroSection = document.querySelector('.hero');

      // Start from the natural, final layout so measurements are accurate.
      gsap.set([heroEls.title, heroEls.visual], { clearProps: 'transform' });
      gsap.set(restSelectors, { opacity: 0, y: 20 });
      gsap.set('.stats-bar .stat', { opacity: 0, y: 16 });
      gsap.set('.hero-socials a', { opacity: 0, y: 10 });
      gsap.set([heroEls.title, heroEls.visual], { opacity: 1 });

      const vw = window.innerWidth, vh = window.innerHeight;
      const photoScale = 1.15;
      const titleScale = 1.08;

      const photoRect = heroEls.visual.getBoundingClientRect();
      const titleRect = heroEls.title.getBoundingClientRect();

      // Splash target: photo centered a little above mid-viewport, name centered below it.
      const introPhotoCenterX = vw / 2;
      const introPhotoCenterY = vh * 0.38;
      const photoDX = introPhotoCenterX - (photoRect.left + photoRect.width / 2);
      const photoDY = introPhotoCenterY - (photoRect.top + photoRect.height / 2);

      const introTitleCenterX = vw / 2;
      const introTitleCenterY = introPhotoCenterY + (photoRect.height * photoScale) / 2 + titleRect.height / 2 + 40;
      const titleDX = introTitleCenterX - (titleRect.left + titleRect.width / 2);
      const titleDY = introTitleCenterY - (titleRect.top + titleRect.height / 2);

      gsap.set(heroEls.visual, { x: photoDX, y: photoDY, scale: photoScale, transformOrigin: '50% 50%' });
      gsap.set(heroEls.title, { x: titleDX, y: titleDY, scale: titleScale, transformOrigin: '50% 50%' });

      heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: '+=100%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      heroST = heroTl.scrollTrigger;

      heroTl
        .to(heroEls.visual, { x: 0, y: 0, scale: 1, duration: 1, ease: 'none' }, 0)
        .to(heroEls.title, { x: 0, y: 0, scale: 1, duration: 1, ease: 'none' }, 0)
        .to(heroEls.eyebrow, { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' }, 0.12)
        .to(heroEls.role, { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' }, 0.32)
        .to(heroEls.summary, { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' }, 0.48)
        .to(heroEls.cta, { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' }, 0.64)
        .to(heroEls.socials, { opacity: 1, y: 0, duration: 0.3, ease: 'power1.out' }, 0.76)
        .to('.hero-socials a', { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power1.out' }, 0.78)
        .to('.stats-bar .stat', { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power1.out' }, 0.85);
    }

    function initHero() {
      teardownHero();
      if (window.innerWidth >= DESKTOP_MIN) {
        runDesktopHeroIntro();
      } else {
        runMobileHeroEntrance();
      }
    }

    initHero();

    let heroResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(heroResizeTimer);
      heroResizeTimer = setTimeout(initHero, 300);
    });

    /* ---- Generic scroll reveal for standalone elements (kickers, titles, leads, timeline items, list rows) ---- */
    const soloReveal = gsap.utils.toArray('.reveal').filter(el =>
      !el.closest('.about-cards') && !el.closest('.skills-grid') &&
      !el.closest('.projects-grid') && !el.closest('.cert-grid') &&
      !el.closest('.contact-grid')
    );
    gsap.set(soloReveal, { opacity: 0, y: 24 });
    ScrollTrigger.batch(soloReveal, {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out' }),
      once: true
    });

    /* ---- Grid stagger reveals (cards animate in as a cascading group) ---- */
    const grids = ['.about-cards .about-card', '.skills-grid .skill-card', '.projects-grid .project-card', '.cert-grid .cert-card', '.contact-grid .contact-card'];
    grids.forEach(sel => {
      const items = gsap.utils.toArray(sel);
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 32, scale: 0.96 });
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.09, ease: 'power3.out' }),
        once: true
      });
    });

    /* ---- Timeline connector line draws in sync with scroll ---- */
    gsap.utils.toArray('.timeline').forEach(tl => {
      const line = tl.querySelector('.timeline-line');
      if (!line) return;
      gsap.to(line, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 80%', scrub: 0.6 }
      });
    });

    /* ---- Background blob parallax (decorative only) ---- */
    gsap.utils.toArray('.blob').forEach((blob, i) => {
      gsap.to(blob, {
        yPercent: (i + 1) * -14, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
      });
    });

    /* ---- Section kicker + title get a touch more lift than plain rows ---- */
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.fromTo(title, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 88%' }
      });
    });

    /* ---- Photo tilt on mouse move (hero focal element) ---- */
    if (hasHover) {
      const heroVisual = document.querySelector('.hero-visual');
      const photoFrame = document.querySelector('.photo-frame');
      if (heroVisual && photoFrame) {
        gsap.set(photoFrame, { transformPerspective: 800, transformStyle: 'preserve-3d' });
        const rotX = gsap.quickTo(photoFrame, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const rotY = gsap.quickTo(photoFrame, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        heroVisual.addEventListener('mousemove', (e) => {
          const r = heroVisual.getBoundingClientRect();
          const px = (e.clientX - r.left - r.width / 2) / (r.width / 2);
          const py = (e.clientY - r.top - r.height / 2) / (r.height / 2);
          rotY(px * 9);
          rotX(-py * 9);
        });
        heroVisual.addEventListener('mouseleave', () => { rotX(0); rotY(0); });
      }

      /* ---- Magnetic pull on the two primary hero CTAs (focal elements only) ---- */
      document.querySelectorAll('[data-magnetic]').forEach(el => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.3);
          yTo((e.clientY - r.top - r.height / 2) * 0.3);
        });
        el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
      });
    }

    /* ---- Recalculate trigger positions once fonts/images have settled ----
       Web fonts can shift text metrics after the splash transform was measured;
       re-run hero setup if the user hasn't scrolled away from the top yet,
       otherwise just refresh trigger positions so we don't rebuild mid-interaction. */
    const refreshAfterAssetsSettle = () => {
      if (window.scrollY < 10) initHero();
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', refreshAfterAssetsSettle);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshAfterAssetsSettle);
    }
  }

})();
