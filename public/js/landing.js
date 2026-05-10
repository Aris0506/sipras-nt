// =====================================================
// SIPRAS-NT — Landing Page JS
// Theme toggle + reveal on scroll + counter animation
// =====================================================

(function () {
  // ---------- Theme Toggle ----------
  const KUNCI_TEMA = 'sipras_tema';
  const tombolTema = document.getElementById('tombolTema');

  function terapkanTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    if (tombolTema) {
      const ikon = tombolTema.querySelector('i');
      if (ikon) {
        ikon.className = tema === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
      }
    }
  }

  const temaTersimpan = localStorage.getItem(KUNCI_TEMA);
  const temaOS = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  terapkanTema(temaTersimpan || temaOS);

  if (tombolTema) {
    tombolTema.addEventListener('click', function () {
      const sekarang = document.documentElement.getAttribute('data-theme');
      const baru = sekarang === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KUNCI_TEMA, baru);
      terapkanTema(baru);
    });
  }

  // ---------- Reveal on Scroll ----------
  const elemenReveal = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay, 10) || 0;
            setTimeout(() => entry.target.classList.add('aktif'), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elemenReveal.forEach((el) => observer.observe(el));
  } else {
    // Fallback untuk browser lama
    elemenReveal.forEach((el) => el.classList.add('aktif'));
  }

  // ---------- Counter Animation ----------
  const counters = document.querySelectorAll('[data-counter]');

  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.counter, 10);
            const duration = 1500;
            const steps = 60;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(current);
              }
            }, duration / steps);

            counterObs.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => counterObs.observe(c));
  }

  // ---------- Parallax tipis di shapes ---------- 
  const shapes = document.querySelectorAll('.shape');
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animasiParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    shapes.forEach((shape, i) => {
      const intensitas = (i + 1) * 5;
      shape.style.transform = `translate(${currentX * intensitas}px, ${currentY * intensitas}px) rotate(${shape.dataset.rotasi || 0}deg)`;
    });

    requestAnimationFrame(animasiParallax);
  }

  if (shapes.length > 0 && window.innerWidth > 768) {
    animasiParallax();
  }
})();