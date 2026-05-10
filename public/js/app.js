// =====================================================
// SIPRAS-NT — Frontend JS
// Theme toggle (light/dark) + sidebar mobile
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
      tombolTema.setAttribute(
        'title',
        tema === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'
      );
    }
  }

  // Inisialisasi: baca dari localStorage, fallback ke preference OS
  const temaTersimpan = localStorage.getItem(KUNCI_TEMA);
  const temaOS = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  terapkanTema(temaTersimpan || temaOS);

  if (tombolTema) {
    tombolTema.addEventListener('click', function () {
      const temaSekarang = document.documentElement.getAttribute('data-theme');
      const temaBaru = temaSekarang === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KUNCI_TEMA, temaBaru);
      terapkanTema(temaBaru);
    });
  }

  // ---------- Sidebar Mobile Toggle ----------
  const tombolSidebar = document.getElementById('tombolSidebar');
  const sidebar = document.querySelector('.sipras-sidebar');
  const overlay = document.getElementById('overlaySidebar');

  function tutupSidebar() {
    if (sidebar) sidebar.classList.remove('terbuka');
    if (overlay) overlay.classList.remove('terbuka');
  }

  if (tombolSidebar && sidebar) {
    tombolSidebar.addEventListener('click', function () {
      sidebar.classList.toggle('terbuka');
      if (overlay) overlay.classList.toggle('terbuka');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', tutupSidebar);
  }

// ---------- Toast Notification ----------
  (function () {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const durasi = parseInt(container.dataset.durasi, 10) || 4000;
    container.style.setProperty('--toast-durasi', durasi + 'ms');

    container.querySelectorAll('.toast-item').forEach(function (toast) {
      let timer = setTimeout(() => tutupToast(toast), durasi);
      let waktuMulai = Date.now();
      let waktuTersisa = durasi;

      // Pause animasi & timer pas hover
      toast.addEventListener('mouseenter', function () {
        clearTimeout(timer);
        toast.classList.add('toast-pause');
        waktuTersisa -= Date.now() - waktuMulai;
      });

      // Resume pas mouse keluar
      toast.addEventListener('mouseleave', function () {
        toast.classList.remove('toast-pause');
        waktuMulai = Date.now();
        timer = setTimeout(() => tutupToast(toast), waktuTersisa);
      });

      // Tombol close
      const tombolTutup = toast.querySelector('.toast-tutup');
      if (tombolTutup) {
        tombolTutup.addEventListener('click', function () {
          clearTimeout(timer);
          tutupToast(toast);
        });
      }
    });

    function tutupToast(toast) {
      toast.classList.add('toast-keluar');
      setTimeout(() => toast.remove(), 220);
    }
  })();

 // ---------- Highlight active nav link ----------
  const path = window.location.pathname;
  document.querySelectorAll('.sipras-sidebar .nav-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href || href === '/') return;
    if (path === href || path.startsWith(href + '/')) {
      link.classList.add('aktif');
    }
  });

  // ---------- Confirm Modal (replace native window.confirm) ----------
  (function () {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    const judul = document.getElementById('confirmModalTitle');
    const pesan = document.getElementById('confirmModalPesan');
    const ikon = document.getElementById('confirmModalIcon');
    const tombolOk = document.getElementById('confirmModalOk');

    let formAktif = null;

    function bukaModal({ title, message, varian, labelOk }) {
      judul.textContent = title || 'Konfirmasi';
      pesan.textContent = message || 'Apakah Anda yakin?';
      tombolOk.textContent = labelOk || 'Ya, Lanjutkan';

      // Set varian ikon
      ikon.className = 'confirm-modal-icon';
      const ikonI = ikon.querySelector('i');
      if (varian === 'bahaya') {
        ikon.classList.add('varian-bahaya');
        ikonI.className = 'bi bi-exclamation-triangle';
        tombolOk.classList.add('btn-bahaya');
        tombolOk.classList.remove('btn-primary');
      } else if (varian === 'info') {
        ikon.classList.add('varian-info');
        ikonI.className = 'bi bi-info-circle';
        tombolOk.classList.add('btn-primary');
        tombolOk.classList.remove('btn-bahaya');
      } else {
        ikonI.className = 'bi bi-question-circle';
        tombolOk.classList.add('btn-primary');
        tombolOk.classList.remove('btn-bahaya');
      }

      modal.classList.add('aktif');
      modal.setAttribute('aria-hidden', 'false');
      tombolOk.focus();
    }

    function tutupModal() {
      modal.classList.remove('aktif');
      modal.setAttribute('aria-hidden', 'true');
      formAktif = null;
    }

    // Handle klik tombol Cancel & backdrop
    modal.addEventListener('click', function (e) {
      const action = e.target.dataset.action;
      if (action === 'cancel') {
        tutupModal();
      } else if (action === 'ok') {
        if (formAktif) {
          // Submit form yang di-trigger
          formAktif.dataset.confirmed = 'true';
          formAktif.submit();
        }
        tutupModal();
      }
      
    });

    // Tutup modal dengan tombol Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('aktif')) {
        tutupModal();
      }
    });

    // Intercept semua form yang punya data-confirm
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.hasAttribute('data-confirm')) return;
      if (form.dataset.confirmed === 'true') {
        // Sudah di-confirm, biarkan submit
        return;
      }

      e.preventDefault();
      formAktif = form;
      bukaModal({
        title: form.dataset.confirmTitle,
        message: form.dataset.confirm,
        varian: form.dataset.confirmVarian,
        labelOk: form.dataset.confirmOk,
      });
    });

    // ---------- Toggle Show/Hide Password ----------
    (function () {
        document.querySelectorAll('input[type="password"]').forEach(function (input) {
          // Skip kalau udah di-wrap
          if (input.parentElement && input.parentElement.classList.contains('input-password-wrapper')) {
            return;
          }
          // Skip kalau di dalam input-group Bootstrap (kayak di form barang)
          if (input.closest('.input-group')) {
            return;
          }

          // Wrap input dengan div
          const wrapper = document.createElement('div');
          wrapper.className = 'input-password-wrapper';
          input.parentNode.insertBefore(wrapper, input);
          wrapper.appendChild(input);

          // Bikin tombol mata
          const tombol = document.createElement('button');
          tombol.type = 'button';
          tombol.className = 'input-password-toggle';
          tombol.setAttribute('aria-label', 'Tampilkan password');
          tombol.innerHTML = '<i class="bi bi-eye"></i>';
          wrapper.appendChild(tombol);

          // Toggle handler
          tombol.addEventListener('click', function () {
            const ikon = tombol.querySelector('i');
            if (input.type === 'password') {
              input.type = 'text';
              input.classList.add('is-password');
              ikon.className = 'bi bi-eye-slash';
              tombol.setAttribute('aria-label', 'Sembunyikan password');
            } else {
              input.type = 'password';
              input.classList.remove('is-password');
              ikon.className = 'bi bi-eye';
              tombol.setAttribute('aria-label', 'Tampilkan password');
            }
          });
        });
    })();
  })();
 })();


