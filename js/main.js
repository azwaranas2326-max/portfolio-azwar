/**
 * ============================================================================
 * PORTFOLIO JAVASCRIPT MODULES
 * Author: Muhammad Azwar Anas
 * Stack: Pure Vanilla JavaScript (ES6+) - No external libraries
 * ============================================================================
 * 
 * Modul ini dirancang agar ringan, modular, dan berperforma tinggi:
 * 1. Theme Switcher (Light / Dark Mode dengan penyimpanan localStorage)
 * 2. Custom Easing Smooth Scroll (Perpindahan ultra-halus ke atas & ke bawah)
 * 3. Bidirectional Fade-In-Up Reveal (Animasi mulus saat scroll ke bawah & ke atas)
 * 4. Navbar Scroll Glassmorphism
 * 5. Mobile Navigation Drawer Toggle
 * 6. Scrollspy (Active navigation highlight on scroll)
 * 7. Micro-interactions (Copy email to clipboard dengan feedback)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSmoothScroll();
  initScrollReveal();
  initNavbarScroll();
  initMobileNav();
  initScrollSpy();
  initCopyEmail();
});

/**
 * ----------------------------------------------------------------------------
 * 1. THEME SWITCHER (LIGHT / DARK MODE)
 * ----------------------------------------------------------------------------
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('azwar_portfolio_theme');
    if (savedTheme) return savedTheme;
    return 'light'; // Default: Light Mode
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('azwar_portfolio_theme', theme);
    const label = theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode';
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.setAttribute('title', label);
  };

  const currentTheme = getPreferredTheme();
  setTheme(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
}

/**
 * ----------------------------------------------------------------------------
 * 2. CUSTOM EASING SMOOTH SCROLLING (KE ATAS & KE BAWAH)
 * Memberikan efek scroll yang sangat halus (buttery smooth) dengan kurva
 * easing matematis (easeInOutCubic) saat berpindah antar section, baik ke bawah
 * maupun ke atas, tanpa lompatan kasar bawaan browser.
 * ----------------------------------------------------------------------------
 */
function initSmoothScroll() {
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');

  // Easing function: easeInOutCubic untuk deselerasi organik dan mewah
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const scrollToTarget = (targetY, duration = 850) => {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easeProgress);

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  allAnchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElem = document.querySelector(targetId);
      if (!targetElem) return;

      e.preventDefault();

      // Hitung posisi target dengan kompensasi offset navbar tetap
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 70;
      const elementPosition = targetElem.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navHeight + 8);

      // Jalankan animasi scroll mulus
      scrollToTarget(offsetPosition, 850);

      // Update URL hash secara halus tanpa reload
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  });
}

/**
 * ----------------------------------------------------------------------------
 * 3. BIDIRECTIONAL FADE-IN-UP REVEAL (SCROLL KE BAWAH & KE ATAS)
 * Menggunakan IntersectionObserver presisi:
 * - Saat elemen masuk viewport (dari bawah maupun atas): memicu fade-in-up halus.
 * - Saat elemen benar-benar keluar dari viewport: class di-reset agar dapat
 *   beranimasi kembali secara alami ketika pengunjung scroll berlawanan arah.
 * ----------------------------------------------------------------------------
 */
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const target = entry.target;
      const rect = entry.boundingClientRect;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (entry.isIntersecting) {
        // Elemen masuk ke area pandang -> tampilkan animasi fade-in-up
        target.classList.add('is-visible');
      } else {
        // Hanya reset jika elemen BENAR-BENAR sudah berada di luar layar (di atas atau di bawah)
        // Ini mencegah flicker saat elemen masih berada di pinggir layar
        const isCompletelyOutOfView = (rect.bottom < -60) || (rect.top > viewportHeight + 60);
        if (isCompletelyOutOfView) {
          target.classList.remove('is-visible');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '10px 0px 10px 0px',
    threshold: [0, 0.15, 0.5]
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * ----------------------------------------------------------------------------
 * 4. NAVBAR SCROLL EFFECT
 * ----------------------------------------------------------------------------
 */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * ----------------------------------------------------------------------------
 * 5. MOBILE NAVIGATION DRAWER
 * ----------------------------------------------------------------------------
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.classList.toggle('is-active', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * ----------------------------------------------------------------------------
 * 6. SCROLLSPY (ACTIVE NAVIGATION INDICATOR)
 * ----------------------------------------------------------------------------
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/**
 * ----------------------------------------------------------------------------
 * 7. COPY EMAIL MICRO-INTERACTION
 * ----------------------------------------------------------------------------
 */
function initCopyEmail() {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  if (!copyBtns.length) return;

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email') || 'azwaranas2326@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>✓ Tersalin ke Clipboard</span>`;
        btn.classList.add('copied');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 2200);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  });
}
