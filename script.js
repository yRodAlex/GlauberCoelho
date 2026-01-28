// Highlight do menu conforme rolagem (IntersectionObserver)
(function () {
  const links = Array.from(document.querySelectorAll('#navlinks a[data-target]'));
  const sections = links
    .map(a => document.getElementById(a.dataset.target))
    .filter(Boolean);

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
  };

  const obs = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActive(visible.target.id);
  }, {
    root: null,
    rootMargin: `-${Math.round(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--headerH')) + 10)}px 0px -60% 0px`,
    threshold: [0.15, 0.25, 0.4, 0.6, 0.8]
  });

  sections.forEach(sec => obs.observe(sec));
  setActive(sections[0].id);
})();

// Helpers: máscara WhatsApp (DD 12345-6789)
function maskWhatsapp(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', () => {
    let v = inputEl.value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2) {
      inputEl.value = v;
      return;
    }
    const dd = v.slice(0, 2);
    const rest = v.slice(2);
    if (rest.length <= 5) {
      inputEl.value = `${dd} ${rest}`;
    } else {
      inputEl.value = `${dd} ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
  });
}

// Modal (open/close genérico)
(function () {
  const body = document.body;

  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  };

  const closeModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  };

  // Botões abrir
  const openLeadBtn = document.getElementById('openLeadBtn');
  const openLeadBtn2 = document.getElementById('openLeadBtn2');
  const openCheckoutBtn = document.getElementById('openCheckoutBtn');

  if (openLeadBtn) openLeadBtn.addEventListener('click', () => openModal('leadModal'));
  if (openLeadBtn2) openLeadBtn2.addEventListener('click', () => openModal('leadModal'));
  if (openCheckoutBtn) openCheckoutBtn.addEventListener('click', () => openModal('checkoutModal'));

  // Fechar
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')));
  });

  // Click fora fecha
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ESC fecha
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m.id));
  });

  // Expor para debug (opcional)
  window.openLeadModal = () => openModal('leadModal');
  window.openCheckoutModal = () => openModal('checkoutModal');
})();

// Lead form submit (Google Forms via hidden iframe)
(function () {
  const form = document.getElementById('leadForm');
  const success = document.getElementById('leadSuccess');
  const leadWhatsapp = document.getElementById('leadWhatsapp');
  maskWhatsapp(leadWhatsapp);

  if (!form) return;

  form.addEventListener('submit', () => {
    // mostra sucesso depois de um pequeno delay (envio acontece no iframe)
    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.style.display = 'block';
    }, 300);
  });
})();

// Checkout form submit -> depois redireciona pra Hotmart
(function () {
  const form = document.getElementById('checkoutForm');
  const btn = document.getElementById('checkoutSubmitBtn');
  const checkoutWhatsapp = document.getElementById('checkoutWhatsapp');
  maskWhatsapp(checkoutWhatsapp);

  // URL HOTMART (troque pelo seu link final se precisar)
  const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/";

  if (!form) return;

  form.addEventListener('submit', (e) => {
    // deixa enviar pro Google Forms no iframe (sem sair da página)
    // e redireciona pra Hotmart logo depois
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Redirecionando...";
    }

    setTimeout(() => {
      window.location.href = HOTMART_CHECKOUT_URL;
    }, 600);
  });
})();

// YouTube: abrir leadModal ao terminar vídeo (primeira visita)
(function () {
  const key = "jw_video_modal_once";
  const already = localStorage.getItem(key) === "1";
  if (already) return;

  // API do YouTube
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  let player;
  window.onYouTubeIframeAPIReady = function () {
    try {
      player = new YT.Player('ytPlayer', {
        events: {
          'onStateChange': function (event) {
            // 0 = ended
            if (event.data === 0) {
              localStorage.setItem(key, "1");
              if (window.openLeadModal) window.openLeadModal();
            }
          }
        }
      });
    } catch (e) {
      // se der algo, não quebra a página
      console.warn("YT init failed", e);
    }
  };
})();
