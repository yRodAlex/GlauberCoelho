// script.js
(() => {
  // =========================
  // Helpers
  // =========================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function isValidPhone(value) {
    // "DD 12345-6789" => 2 digits + space + 5 digits + "-" + 4 digits
    return /^\d{2} \d{5}-\d{4}$/.test(value.trim());
  }

  function phoneMask(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      const digits = (inputEl.value || '').replace(/\D/g, '').slice(0, 11); // DD + 9 digits
      let out = '';

      if (digits.length >= 1) out = digits.slice(0, 2);
      if (digits.length >= 3) out = digits.slice(0, 2) + ' ' + digits.slice(2, 7);
      if (digits.length >= 8) out = digits.slice(0, 2) + ' ' + digits.slice(2, 7) + '-' + digits.slice(7, 11);

      inputEl.value = out;
      inputEl.setCustomValidity(isValidPhone(out) ? '' : 'Digite no formato: DD 12345-6789');
    });

    inputEl.addEventListener('blur', () => {
      inputEl.setCustomValidity(isValidPhone(inputEl.value) ? '' : 'Digite no formato: DD 12345-6789');
    });
  }

  async function submitToGoogleForms({ actionUrl, formEl }) {
    // Envia via fetch (no-cors) para não sair da página
    const fd = new FormData(formEl);
    await fetch(actionUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: fd
    });
  }

  // =========================
  // Mobile menu
  // =========================
  const hamburgerBtn = $('#hamburgerBtn');
  const mobileMenu = $('#mobileMenu');

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileMenu() {
    if (!mobileMenu) return;
    const open = mobileMenu.classList.toggle('is-open');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }

  // Fechar menu ao clicar em link
  $$('.mobile-link').forEach(a => {
    a.addEventListener('click', () => closeMobileMenu());
  });

  // Fechar menu ao redimensionar para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileMenu();
  });

  // =========================
  // Modais: abrir/fechar
  // =========================
  const leadModalId = 'leadModal';
  const preId = 'precheckoutModal';

  // Botões "Quero entender..."
  const openLeadBtns = ['openLeadModalHero', 'openLeadModalVideo']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  openLeadBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(leadModalId);
  }));

  // Botões "Garantir minha vaga"
  const openPreBtns = ['openPrecheckoutTop', 'openPrecheckoutVideo', 'openPrecheckoutFinal']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  openPreBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(preId);
  }));

  // Fechar ao clicar no X
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      closeModal(id);
    });
  });

  // Fechar ao clicar no backdrop
  [leadModalId, preId].forEach(id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(id);
    });
  });

  // ESC fecha
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('#' + leadModalId)?.classList.contains('is-open')) closeModal(leadModalId);
    if ($('#' + preId)?.classList.contains('is-open')) closeModal(preId);
    closeMobileMenu();
  });

  // =========================
  // Forms: validação + máscara
  // =========================
  const leadForm = $('#leadForm');
  const preForm = $('#precheckoutForm');

  phoneMask($('#leadPhone'));
  phoneMask($('#prePhone'));

  // ACTION URLs (Google Forms)
  const LEAD_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSc343T86qOwMwLlOx4PgyKtW4hqPOBp6NPW2Hz8oXrdYvGw7g/formResponse';
  const PRE_FORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse';

  // Link do checkout (Hotmart) - troque pelo seu
  const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/SEU_LINK_AQUI';

  function validateNative(formEl) {
    // força mensagens nativas do browser
    const inputs = $$('input, textarea', formEl);

    // valida phone explicitamente
    inputs.forEach(el => {
      if (el.id === 'leadPhone' || el.id === 'prePhone') {
        el.setCustomValidity(isValidPhone(el.value) ? '' : 'Digite no formato: DD 12345-6789');
      } else if (el.type === 'email') {
        // deixa o browser validar, mas podemos reforçar
        el.setCustomValidity(el.validity.valid ? '' : 'Digite um email válido');
      } else {
        el.setCustomValidity('');
      }
    });

    return formEl.checkValidity();
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateNative(leadForm)) {
        leadForm.reportValidity();
        return;
      }

      try {
        await submitToGoogleForms({ actionUrl: LEAD_FORM_ACTION, formEl: leadForm });
        closeModal(leadModalId);
        leadForm.reset();
      } catch {
        // fallback: se algo bloquear fetch, tenta submit normal em nova aba invisível
        leadForm.action = LEAD_FORM_ACTION;
        leadForm.method = 'POST';
        leadForm.target = '_self';
        leadForm.submit();
      }
    });
  }

  if (preForm) {
    preForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateNative(preForm)) {
        preForm.reportValidity();
        return;
      }

      try {
        await submitToGoogleForms({ actionUrl: PRE_FORM_ACTION, formEl: preForm });
      } catch {
        // se fetch falhar, tenta submit normal (pode trocar de página)
        preForm.action = PRE_FORM_ACTION;
        preForm.method = 'POST';
        preForm.target = '_self';
        preForm.submit();
        return;
      }

      // Sem "telinha confusa": fecha e redireciona direto
      closeModal(preId);
      preForm.reset();

      // Redireciona pro Hotmart
      window.location.href = HOTMART_CHECKOUT_URL;
    });
  }

  // =========================
  // Abrir "Quero entender..." ao terminar o vídeo (apenas 1ª visita)
  // =========================
  window.onYouTubeIframeAPIReady = function () {
    try {
      const already = localStorage.getItem('lead_modal_after_video_seen');
      if (already === '1') return;

      const player = new YT.Player('youtubePlayer', {
        events: {
          onStateChange: (event) => {
            // 0 = ended
            if (event.data === YT.PlayerState.ENDED) {
              localStorage.setItem('lead_modal_after_video_seen', '1');
              openModal(leadModalId);
            }
          }
        }
      });
    } catch {
      // Se a API falhar, não faz nada
    }
  };
})();
