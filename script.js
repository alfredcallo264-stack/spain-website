(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -------------------------
  // Mobile menu toggle
  // -------------------------
  function initMobileMenu() {
    const toggle = $('.js-menuToggle');
    const panel = $('.js-mobilePanel');
    if (!toggle || !panel) return;

    const setOpen = (open) => {
      panel.classList.toggle('mobileMenu--open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.contains('mobileMenu--open');
      setOpen(!isOpen);
    });

    // Close when a link is clicked
    $$('.js-mobilePanel a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // -------------------------
  // Scroll reveal
  // -------------------------
  function initRevealOnScroll() {
    const els = $$('.reveal');
    if (!els.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      els.forEach(el => el.classList.add('reveal--in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('reveal--in');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.14 });

    els.forEach(el => io.observe(el));
  }

  // -------------------------
  // Home carousel
  // -------------------------
  function initCarousel() {
    const track = $('.carouselTrack');
    const bullets = $$('.bullet');
    if (!track || !bullets.length) return;

    let index = 0;
    let interval = null;

    const goTo = (i) => {
      index = i;
      track.style.transform = `translateX(${-index * 100}%)`;
      bullets.forEach((b, bi) => b.classList.toggle('bullet--active', bi === index));
    };

    bullets.forEach((b, bi) => {
      b.addEventListener('click', () => {
        goTo(bi);
        restart();
      });
    });

    const restart = () => {
      if (interval) clearInterval(interval);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;
      interval = setInterval(() => {
        index = (index + 1) % bullets.length;
        goTo(index);
      }, 5200);
    };

    goTo(0);
    restart();
  }

  // -------------------------
  // Destinations filter
  // -------------------------
  function initDestinationFilters() {
    const chips = $$('.js-filterChip');
    const cards = $$('.js-destinationCard');
    if (!chips.length || !cards.length) return;

    const apply = (tag) => {
      cards.forEach(card => {
        const ctags = (card.dataset.tags || '').split(',').map(s => s.trim());
        const show = tag === 'all' ? true : ctags.includes(tag);
        card.style.display = show ? '' : 'none';
      });
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
        apply(chip.dataset.filter || 'all');
      });
    });

    // default
    const active = chips.find(c => c.classList.contains('chip--active')) || chips[0];
    apply(active?.dataset.filter || 'all');
  }

  // -------------------------
  // Modal lightbox for destination
  // -------------------------
  function initModal() {
    const overlay = $('.modalOverlay');
    if (!overlay) return;

    const modalTitle = $('.modalTitle');
    const modalText = $('.modalText');
    const modalImg = $('.modalImg');

    const open = ({ title, text, img }) => {
      if (modalTitle) modalTitle.textContent = title || '';
      if (modalText) modalText.textContent = text || '';
      if (modalImg && img) {
        modalImg.src = img;
        modalImg.alt = title ? `${title} image` : 'Destination image';
      }
      overlay.classList.add('modalOverlay--open');
      document.body.style.overflow = 'hidden';
      overlay.setAttribute('aria-hidden', 'false');
    };

    const close = () => {
      overlay.classList.remove('modalOverlay--open');
      document.body.style.overflow = '';
      overlay.setAttribute('aria-hidden', 'true');
    };

    $$('.js-openModal').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.js-destinationCard');
        const title = btn.dataset.title || parent?.dataset.title || 'Spain destination';
        const text = btn.dataset.text || parent?.dataset.text || '';
        const img = btn.dataset.img || parent?.dataset.img || '';
        open({ title, text, img });
      });
    });

    const closeBtn = $('.js-modalClose');
    if (closeBtn) closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // -------------------------
  // Events subtle reveal (cards)
  // -------------------------
  function initEventsReveal() {
    const items = $$('.js-eventItem');
    if (!items.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      items.forEach(i => i.classList.add('reveal--in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) ent.target.classList.add('reveal--in');
      });
    }, { threshold: 0.18 });

    items.forEach(i => {
      i.classList.add('reveal');
      io.observe(i);
    });
  }

  // -------------------------
  // Form validation
  // -------------------------
  function initContactForm() {
    const form = $('.js-contactForm');
    if (!form) return;

    const name = $('#name');
    const email = $('#email');
    const message = $('#message');

    const errName = $('.js-errName');
    const errEmail = $('.js-errEmail');
    const errMsg = $('.js-errMsg');

    const show = (el, ok) => {
      if (!el) return;
      el.classList.toggle('error--show', !ok);
    };

    const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const onSubmit = (e) => {
      e.preventDefault();

      const vName = (name?.value || '').trim();
      const vEmail = (email?.value || '').trim();
      const vMsg = (message?.value || '').trim();

      const okName = vName.length >= 2;
      const okEmail = validateEmail(vEmail);
      const okMsg = vMsg.length >= 10;

      show(errName, okName);
      show(errEmail, okEmail);
      show(errMsg, okMsg);

      if (okName && okEmail && okMsg) {
        const status = $('.js-formStatus');
        if (status) {
          status.textContent = 'Message sent! Thanks for contacting Visit Spain.';
          status.style.display = 'block';
        }
        form.reset();
        $$('.error').forEach(el => el.classList.remove('error--show'));
      }
    };

    form.addEventListener('submit', onSubmit);

    // live validation
    [name, email, message].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', () => {
        if (inp === name) show(errName, (inp.value || '').trim().length >= 2);
        if (inp === email) show(errEmail, validateEmail((inp.value || '').trim()));
        if (inp === message) show(errMsg, (inp.value || '').trim().length >= 10);
      });
    });
  }

  // -------------------------
  // Navbar active state (light)
  // -------------------------
  function initNavbarActive() {
    const path = window.location.pathname;
    const links = $$('.navlinks a');
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href) return;
      const normalized = href.replace(/^\//, '');
      const current = path.replace(/^\//, '') || 'index.html';
      if (current.endsWith(normalized) || (normalized === 'index.html' && current === '')) {
        a.style.borderColor = 'rgba(255,255,255,.22)';
        a.style.background = 'rgba(255,255,255,.07)';
        a.style.color = 'rgba(255,255,255,.92)';
      }
    });
  }

  // -------------------------
  // Parallax-ish background position on hero
  // -------------------------
  function initHeroParallax() {
    const hero = $('.hero');
    if (!hero) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const onScroll = () => {
      const y = window.scrollY || 0;
      hero.style.setProperty('--heroParallaxY', `${Math.min(y * 0.12, 50)}px`);
    };

    hero.style.willChange = 'transform';
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    initMobileMenu();
    initRevealOnScroll();
    initCarousel();
    initDestinationFilters();
    initModal();
    initEventsReveal();
    initContactForm();
    initNavbarActive();
    initHeroParallax();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

