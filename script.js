// script.js
(() => {
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

  // =========================
  // Mobile menu
  // =========================
  const hamburgerBtn = $('#hamburgerBtn');
  const mobileMenu = $('#mobileMenu');

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileMenu() {
    if (!mobileMenu) return;
    const open = mobileMenu.classList.toggle('is-open');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    hamburgerBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  hamburgerBtn?.addEventListener('click', toggleMobileMenu);

  $$('.mobile-link').forEach(a => a.addEventListener('click', () => closeMobileMenu()));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeModal('leadModal');
      closeModal('precheckoutModal');
    }
  });

  // =========================
  // Abrir modais
  // =========================
  $('#openLeadModalHero')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('leadModal');
  });

  $('#openLeadModalVideo')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('leadModal');
  });

  // FAB carrinho abre o pré-checkout
  $('#fabCart')?.addEventListener('click', () => openModal('precheckoutModal'));

  // Fechar (X)
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')));
  });

  // Fechar clicando no backdrop
  ['leadModal', 'precheckoutModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(id);
    });
  });

  // =========================
  // Máscara e validações
  // =========================
  function isValidPhone(value) {
    return /^\d{2} \d{5}-\d{4}$/.test((value || '').trim());
  }

  function phoneMask(inputEl) {
    if (!inputEl) return;

    inputEl.addEventListener('input', () => {
      const digits = (inputEl.value || '').replace(/\D/g, '').slice(0, 11);
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

  phoneMask($('#leadPhone'));
  phoneMask($('#prePhone'));

  async function submitToGoogleForms({ actionUrl, formEl }) {
    const fd = new FormData(formEl);
    await fetch(actionUrl, { method: 'POST', mode: 'no-cors', body: fd });
  }

  function validateNative(formEl) {
    const inputs = $$('input, textarea', formEl);

    inputs.forEach(el => {
      if (el.id === 'leadPhone' || el.id === 'prePhone') {
        el.setCustomValidity(isValidPhone(el.value) ? '' : 'Digite no formato: DD 12345-6789');
      } else if (el.type === 'email') {
        el.setCustomValidity(el.validity.valid ? '' : 'Digite um email válido');
      } else {
        el.setCustomValidity('');
      }
    });

    return formEl.checkValidity();
  }

  // ACTION URLs
  const LEAD_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSc343T86qOwMwLlOx4PgyKtW4hqPOBp6NPW2Hz8oXrdYvGw7g/formResponse';
  const PRE_FORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse';

  // Hotmart checkout (troque pelo seu)
  const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/SEU_LINK_AQUI';

  // Lead form
  $('#leadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!validateNative(form)) {
      form.reportValidity();
      return;
    }

    try {
      await submitToGoogleForms({ actionUrl: LEAD_FORM_ACTION, formEl: form });
      closeModal('leadModal');
      form.reset();
    } catch {
      form.action = LEAD_FORM_ACTION;
      form.method = 'POST';
      form.target = '_self';
      form.submit();
    }
  });

  // Precheckout form
  $('#precheckoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!validateNative(form)) {
      form.reportValidity();
      return;
    }

    try {
      await submitToGoogleForms({ actionUrl: PRE_FORM_ACTION, formEl: form });
    } catch {
      form.action = PRE_FORM_ACTION;
      form.method = 'POST';
      form.target = '_self';
      form.submit();
      return;
    }

    closeModal('precheckoutModal');
    form.reset();
    window.location.href = HOTMART_CHECKOUT_URL;
  });

  // =========================
  // Abrir Lead ao terminar vídeo (1ª visita)
  // =========================
  window.onYouTubeIframeAPIReady = function () {
    try {
      const already = localStorage.getItem('lead_modal_after_video_seen');
      if (already === '1') return;

      // eslint-disable-next-line no-undef
      new YT.Player('youtubePlayer', {
        events: {
          onStateChange: (event) => {
            // eslint-disable-next-line no-undef
            if (event.data === YT.PlayerState.ENDED) {
              localStorage.setItem('lead_modal_after_video_seen', '1');
              openModal('leadModal');
            }
          }
        }
      });
    } catch {
      // sem ações
    }
  };
})();
