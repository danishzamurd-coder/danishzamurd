/* ==========================================================
   SHARED NAVIGATION + AUTH GUARD + PROFILE WIDGET
   Include on every protected page (index, about, skills,
   services, certificates, projects, contact) AFTER the
   Firebase compat SDK + firebase-init.js, and make sure each
   page has an empty <div id="navbar-root"></div> where the
   nav should render.
   ========================================================== */

(function () {

  const NAV_LINKS = [
    { label: 'About',        href: 'about.html' },
    { label: 'Skills',       href: 'skills.html' },
    { label: 'Services',     href: 'services.html' },
    { label: 'Certificates', href: 'certificates.html' },
    { label: 'Projects',     href: 'projects.html' },
    { label: 'Contact',      href: 'contact.html' }
  ];

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  function initials(profile) {
    const a = (profile.firstName || '?').trim().charAt(0);
    const b = (profile.lastName || '').trim().charAt(0);
    return (a + b || '?').toUpperCase();
  }

  function profilePanelHtml(profile, user) {
    const isFreelancer = profile.accountType === 'freelancer';
    const typeLabel = isFreelancer ? 'Work With Us' : 'Visitor';

    let extra = '';
    if (isFreelancer) {
      const engagement = profile.engagementType === 'collaborate'
        ? 'Collaborate / work together'
        : 'Hire for a project';
      const services = (profile.servicesNeeded && profile.servicesNeeded.length)
        ? profile.servicesNeeded.join(', ')
        : '—';

      extra = `
        <div class="profile-row"><span>Engagement</span><strong>${escapeHtml(engagement)}</strong></div>
        <div class="profile-row"><span>Services</span><strong>${escapeHtml(services)}</strong></div>
        <div class="profile-row"><span>Budget</span><strong>${escapeHtml(profile.budget || '—')}</strong></div>
        ${profile.projectBrief ? `<div class="profile-brief">"${escapeHtml(profile.projectBrief)}"</div>` : ''}
      `;
    }

    return `
      <div class="profile-header">
        <span class="profile-avatar large">${initials(profile)}</span>
        <div>
          <div class="profile-fullname">${escapeHtml(profile.firstName || '')} ${escapeHtml(profile.lastName || '')}</div>
          <span class="profile-badge ${isFreelancer ? 'freelancer' : 'visitor'}">${typeLabel}</span>
        </div>
      </div>
      <div class="profile-row"><span>Email</span><strong>${escapeHtml(profile.email || user.email || '')}</strong></div>
      <div class="profile-row"><span>Phone</span><strong>${escapeHtml(profile.phone || '—')}</strong></div>
      ${extra}
      <button type="button" class="btn btn-outline profile-logout" id="logoutBtn">Log Out</button>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderNav(user, profile) {
    const root = document.getElementById('navbar-root');
    if (!root) return;

    const safeProfile = profile || { firstName: 'Account', accountType: 'visitor' };

    const linksHtml = NAV_LINKS.map(link => `
      <li><a href="${link.href}" class="nav-link${currentPage === link.href ? ' active' : ''}">${link.label}</a></li>
    `).join('');

    root.innerHTML = `
      <nav id="navbar">
        <a href="index.html" class="logo">
          <img src="logo.jpeg" alt="Danish Zamurd logo">
          <span>DANISH ZAMURD</span>
        </a>

        <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <ul id="menu">
          ${linksHtml}
          <li class="profile-menu-item">
            <button type="button" class="profile-trigger" id="profileTrigger" aria-haspopup="true" aria-expanded="false">
              <span class="profile-avatar">${initials(safeProfile)}</span>
              <span class="profile-name">${escapeHtml(safeProfile.firstName || 'Account')}</span>
              <i class="fa-solid fa-chevron-down profile-caret"></i>
            </button>
            <div class="profile-panel" id="profilePanel" hidden>
              ${profile ? profilePanelHtml(profile, user) : '<p class="profile-row"><span>Loading profile...</span></p>'}
            </div>
          </li>
        </ul>
      </nav>
    `;

    bindNavEvents();
  }

  function bindNavEvents() {
    const navbar        = document.getElementById('navbar');
    const menuToggle     = document.getElementById('menuToggle');
    const menu           = document.getElementById('menu');
    const profileTrigger = document.getElementById('profileTrigger');
    const profilePanel   = document.getElementById('profilePanel');
    const logoutBtn      = document.getElementById('logoutBtn');

    function closeMenu() {
      menu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    menuToggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    });

    menu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    function handleScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (profileTrigger && profilePanel) {
      profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = profilePanel.hidden;
        profilePanel.hidden = !willOpen;
        profileTrigger.setAttribute('aria-expanded', String(willOpen));
      });

      document.addEventListener('click', (e) => {
        if (!profilePanel.hidden && !profilePanel.contains(e.target) && !profileTrigger.contains(e.target)) {
          profilePanel.hidden = true;
          profileTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        logoutBtn.disabled = true;
        logoutBtn.textContent = 'Logging out...';
        try {
          await auth.signOut();
        } finally {
          window.location.href = 'login.html';
        }
      });
    }
  }

  /* ---------- Auth guard ----------
     Every page that includes nav.js requires a logged-in user.
     If nobody is signed in, bounce to the login page. */
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    let profile = null;
    try {
      const snap = await db.collection('users').doc(user.uid).get();
      profile = snap.exists ? snap.data() : null;
    } catch (err) {
      console.error('Could not load profile:', err);
    }

    renderNav(user, profile);
    document.body.classList.add('auth-ready');
  });

})();
