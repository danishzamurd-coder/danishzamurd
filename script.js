// Mark JS as available so CSS can enable enhanced (animated) states
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  const backToTop = document.getElementById('backToTop');
  const typedEl    = document.getElementById('typed');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------
     Back-to-top button visibility
  ---------------------------------------- */
  if (backToTop) {
    function handleScroll(){
      backToTop.classList.toggle('show', window.scrollY > 400);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------
     Typing animation for hero role (homepage only)
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
