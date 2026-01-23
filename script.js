(function () {
  // ---------------------------
  // Highlight do menu conforme rolagem
  // ---------------------------
  const navLinks = Array.from(document.querySelectorAll('#navlinks a[data-target]'));
  const sections = navLinks.map(a => document.getElementById(a.dataset.target)).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const setActive = (id) => navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--headerH')) || 76;

    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    }, {
      root: null,
      rootMargin: `-${Math.round(headerH + 10)}px 0px -60% 0px`,
      threshold: [0.15, 0.25, 0.4, 0.6, 0.8]
    });

    sections.forEach(sec => obs.observe(sec));
    setActive(sections[0].id);
  }

  // ---------------------------
  // Mobile menu
  // ---------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);

  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  document.querySelectorAll('.mobile-link').forEach(a => {
    a.addEventListener('click', () => closeMobileMenu());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('is-open')) closeMobileMenu();
  });

  // ---------------------------
  // Máscara WhatsApp: DD 12345-6789
  // ---------------------------
  function onlyDigits(v) { return (v || '').replace(/\D/g, ''); }

  function formatPhoneMask(value) {
    const d = onlyDigits(value).slice(0, 11);
    const ddd = d.slice(0, 2);
    const part1 = d.slice(2, 7);
    const part2 = d.slice(7, 11);

    if (!ddd) return '';
    if (d.length <= 2) return ddd;
    if (d.length <= 7) return `${ddd} ${part1}`;
    return `${ddd} ${part1}-${part2}`;
  }

  function attachPhoneMask(input) {
    if (!input) return;
    const handler = () => { input.value = formatPhoneMask(input.value); };
    input.addEventListener('input', handler);
    input.addEventListener('blur', handler);
    handler();
  }

  document.querySelectorAll('[data-phone-mask]').forEach(attachPhoneMask);

  // ---------------------------
  // Checkout modal (pré-checkout -> Hotmart)
  // ---------------------------
  const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/"; // <-- COLE AQUI O LINK REAL

  const promptModal = document.getElementById('promptModal');
  const closePromptModalBtn = document.getElementById('closePromptModal');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutSubmitBtn = document.getElementById('checkoutSubmitBtn');
  const checkoutError = document.getElementById('checkoutError');

  function openCheckoutModal() {
    if (!promptModal) return;
    promptModal.classList.add('is-open');
    promptModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    if (!promptModal) return;
    promptModal.classList.remove('is-open');
    promptModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (checkoutError) checkoutError.textContent = '';
    if (checkoutSubmitBtn) {
      checkoutSubmitBtn.disabled = false;
      checkoutSubmitBtn.textContent = 'Continuar para pagamento';
    }
    checkoutForm?.reset();
    checkoutForm?.querySelectorAll('input[type="radio"]').forEach(r => (r.checked = false));
  }

  window.openCheckoutModal = openCheckoutModal;

  closePromptModalBtn?.addEventListener('click', closeCheckoutModal);
  promptModal?.addEventListener('click', (e) => { if (e.target === promptModal) closeCheckoutModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && promptModal?.classList.contains('is-open')) closeCheckoutModal();
  });

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
      }

      if (checkoutError) checkoutError.textContent = '';

      try {
        checkoutSubmitBtn.disabled = true;
        checkoutSubmitBtn.textContent = 'Redirecionando...';

        const formData = new FormData(checkoutForm);

        await fetch(checkoutForm.action, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });

        // ✅ sem telinha/confusão: vai direto pro checkout
        window.location.href = HOTMART_CHECKOUT_URL;
      } catch (err) {
        if (checkoutError) checkoutError.textContent = 'Não foi possível continuar agora. Tente novamente.';
        checkoutSubmitBtn.disabled = false;
        checkoutSubmitBtn.textContent = 'Continuar para pagamento';
      }
    });
  }

  // ---------------------------
  // Lead modal ("Quero entender se é para mim")
  // ---------------------------
  const leadModal = document.getElementById('leadModal');
  const leadForm = document.getElementById('leadForm');
  const leadSubmitBtn = document.getElementById('leadSubmitBtn');
  const leadError = document.getElementById('leadError');
  const leadSuccess = document.getElementById('leadSuccess');

  function openLeadModal() {
    if (!leadModal) return;
    leadModal.classList.add('is-open');
    leadModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLeadModal() {
    if (!leadModal) return;
    leadModal.classList.remove('is-open');
    leadModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (leadError) leadError.textContent = '';
    if (leadSuccess) leadSuccess.style.display = 'none';
    if (leadForm) {
      leadForm.style.display = '';
      leadForm.reset();
      leadForm.querySelectorAll('input[type="radio"]').forEach(r => (r.checked = false));
    }
    if (leadSubmitBtn) {
      leadSubmitBtn.disabled = false;
      leadSubmitBtn.textContent = 'Enviar';
    }
  }

  window.openLeadModal = openLeadModal;

  leadModal?.querySelectorAll('[data-close="leadModal"]').forEach(btn => {
    btn.addEventListener('click', closeLeadModal);
  });

  leadModal?.addEventListener('click', (e) => { if (e.target === leadModal) closeLeadModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && leadModal?.classList.contains('is-open')) closeLeadModal();
  });

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!leadForm.checkValidity()) {
        leadForm.reportValidity();
        return;
      }

      if (leadError) leadError.textContent = '';

      try {
        leadSubmitBtn.disabled = true;
        leadSubmitBtn.textContent = 'Enviando...';

        const formData = new FormData(leadForm);

        await fetch(leadForm.action, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });

        leadForm.style.display = 'none';
        leadSuccess.style.display = 'block';
      } catch (err) {
        if (leadError) leadError.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
        leadSubmitBtn.disabled = false;
        leadSubmitBtn.textContent = 'Enviar';
      }
    });
  }
})();

(function () {
  const menu = document.getElementById('mobileMenu');
  const openBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('mobileMenuClose');

  if (!menu || !openBtn || !closeBtn) return;

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  menu.addEventListener('click', (e) => {
    if (e.target === menu) closeMenu();
  });

  menu.querySelectorAll('[data-close-menu]').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });
})();
