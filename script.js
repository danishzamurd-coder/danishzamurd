// Mark JS as available so CSS can enable enhanced (animated) states
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  const navbar     = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const menu       = document.getElementById('menu');
  const navLinks   = document.querySelectorAll('.nav-link');
  const backToTop  = document.getElementById('backToTop');
  const typedEl    = document.getElementById('typed');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------
     Mobile menu toggle
  ---------------------------------------- */
  function closeMenu(){
    menu.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu(){
    const isOpen = menu.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  }

  menuToggle.addEventListener('click', toggleMenu);

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close the mobile menu when the dark overlay behind it is tapped
  document.addEventListener('click', (e) => {
    const isOpen = menu.classList.contains('open');
    if (!isOpen) return;
    const clickedInsideMenu = menu.contains(e.target);
    const clickedToggle = menuToggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle) closeMenu();
  });

  // Close menu with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ----------------------------------------
     Navbar background on scroll + back-to-top
  ---------------------------------------- */
  function handleScroll(){
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('show', window.scrollY > 400);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ----------------------------------------
     Active nav link on scroll
  ---------------------------------------- */
  const sections = document.querySelectorAll('main section, header#home');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(section => navObserver.observe(section));

  /* ----------------------------------------
     Typing animation for hero role
  ---------------------------------------- */
  const roles = [
    'Welcome to my website',
    'Please login or register',
    "Let's build something great",
    'Freelance web development, done right'
  ];

  if (typedEl && !prefersReducedMotion) {
    let roleIndex = 0;
    let charIndex = typedEl.textContent.length;
    let deleting = true; // start by erasing the static fallback text

    function typeLoop(){
      const current = roles[roleIndex];

      if (!deleting) {
        typedEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1600);
          return;
        }
      } else {
        typedEl.textContent = (typedEl.textContent || '').slice(0, charIndex - 1);
        charIndex--;
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          charIndex = 0;
        }
      }

      setTimeout(typeLoop, deleting ? 35 : 75);
    }

    typeLoop();
  }

  /* ----------------------------------------
     Cursor-follow glow on cards
  ---------------------------------------- */
  const glowCards = document.querySelectorAll(
    '.skills-category, .service-card, .cert-card, .project-card, .contact-item'
  );

  glowCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  /* ----------------------------------------
     Scroll-reveal animations
  ---------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

});
