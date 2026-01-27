/* =========================================================
   Jornada Terapêutica — scripts (menu, modais, forms, vídeo)
   ========================================================= */

(function () {
  const docEl = document.documentElement;

  // ---------------------------
  // Helpers
  // ---------------------------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function openBackdrop(backdropEl) {
    if (!backdropEl) return;
    backdropEl.classList.add("is-open");
    backdropEl.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeBackdrop(backdropEl) {
    if (!backdropEl) return;
    backdropEl.classList.remove("is-open");
    backdropEl.setAttribute("aria-hidden", "true");
    lockScroll(false);
  }

  function isEmailValid(email) {
    // Usa validação simples + nativa do browser (type="email")
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function formatPhoneMask(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11); // 2 + 9
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function attachPhoneMask(input) {
    if (!input) return;
    input.addEventListener("input", () => {
      const cursorAtEnd = input.selectionStart === input.value.length;
      input.value = formatPhoneMask(input.value);
      // Mantém cursor no final (evita pular no iOS)
      if (cursorAtEnd) {
        try { input.setSelectionRange(input.value.length, input.value.length); } catch (_) {}
      }
    });
    // força formato ao sair
    input.addEventListener("blur", () => {
      input.value = formatPhoneMask(input.value);
    });
  }

  // ---------------------------
  // Navegação (highlight)
  // ---------------------------
  (function navHighlight() {
    const links = qsa('#navlinks a[data-target]');
    const sections = links.map(a => document.getElementById(a.dataset.target)).filter(Boolean);
    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const setActive = (id) => links.forEach(a => a.classList.toggle('active', a.dataset.target === id));

    const headerH = parseInt(getComputedStyle(docEl).getPropertyValue('--headerH')) || 76;

    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible && visible.target && visible.target.id) setActive(visible.target.id);
    }, {
      root: null,
      rootMargin: `-${headerH + 10}px 0px -60% 0px`,
      threshold: [0.15, 0.25, 0.4, 0.6, 0.8]
    });

    sections.forEach(sec => obs.observe(sec));
    setActive(sections[0].id);
  })();

  // ---------------------------
  // Mobile menu (hamburger)
  // ---------------------------
  (function mobileMenu() {
    const btn = qs("#mobileMenuBtn");
    const panel = qs("#mobileMenu");
    const backdrop = qs("#mobileMenuBackdrop");

    if (!btn || !panel || !backdrop) return;

    function openMenu() {
      backdrop.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      lockScroll(true);
    }

    function closeMenu() {
      backdrop.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      lockScroll(false);
    }

    btn.addEventListener("click", () => {
      const isOpen = backdrop.classList.contains("is-open");
      if (isOpen) closeMenu(); else openMenu();
    });

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeMenu();
    });

    qsa('a[data-target]', panel).forEach(a => {
      a.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("is-open")) closeMenu();
    });
  })();

  // ---------------------------
  // Lead modal (Quero entender)
  // ---------------------------
  const leadModal = qs("#leadModal");
  const closeLeadBtn = qs("#closeLeadModal");

  function openLeadModal() { openBackdrop(leadModal); }
  function closeLeadModal() { closeBackdrop(leadModal); }

  if (closeLeadBtn) closeLeadBtn.addEventListener("click", closeLeadModal);
  if (leadModal) {
    leadModal.addEventListener("click", (e) => { if (e.target === leadModal) closeLeadModal(); });
  }

  // Expor para botões inline
  window.openLeadModal = openLeadModal;

  // Lead form submit
  (function leadFormHandler() {
    const form = qs("#leadForm");
    const success = qs("#leadSuccess");
    const submitBtn = qs("#leadSubmit");

    if (!form) return;

    attachPhoneMask(qs("#leadWhatsapp", form));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validações nativas
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const email = qs("#leadEmail", form)?.value || "";
      if (!isEmailValid(email)) {
        qs("#leadEmail", form)?.setCustomValidity("Digite um e-mail válido.");
        form.reportValidity();
        qs("#leadEmail", form)?.setCustomValidity("");
        return;
      }

      const fd = new FormData(form);

      // Feedback simples no botão
      const originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando…";
      }

      try {
        // no-cors para Google Forms
        await fetch(form.action, { method: "POST", mode: "no-cors", body: fd });
      } catch (_) {
        // Mesmo se falhar (bloqueio), seguimos o fluxo para não travar o usuário
      }

      if (success) success.style.display = "block";
      form.style.display = "none";

      setTimeout(() => {
        closeLeadModal();
        // reset
        form.reset();
        form.style.display = "";
        if (success) success.style.display = "none";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }, 1200);
    });
  })();

  // ---------------------------
  // Checkout modal (Garantir vaga)
  // ---------------------------
  const checkoutModal = qs("#checkoutModal");
  const closeCheckoutBtn = qs("#closeCheckoutModal");
  const HOTMART_CHECKOUT_URL = window.HOTMART_CHECKOUT_URL || ""; // definido no HTML por você, se quiser

  function openCheckoutModal() { openBackdrop(checkoutModal); }
  function closeCheckoutModal() { closeBackdrop(checkoutModal); }

  window.openCheckoutModal = openCheckoutModal;

  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => { if (e.target === checkoutModal) closeCheckoutModal(); });
  }

  (function checkoutFormHandler() {
    const form = qs("#preCheckoutForm");
    const submitBtn = qs("#preCheckoutSubmit");
    if (!form) return;

    attachPhoneMask(qs('[data-phone-mask]', form));

    // ACTION do Google Forms (novo formulário de "Garantir vaga")
    const PRECHECKOUT_FORM_ACTION =
      "https://docs.google.com/forms/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const email = qs("#pc_email", form)?.value || "";
      if (!isEmailValid(email)) {
        qs("#pc_email", form)?.setCustomValidity("Digite um e-mail válido.");
        form.reportValidity();
        qs("#pc_email", form)?.setCustomValidity("");
        return;
      }

      const fd = new FormData(form);

      const originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Redirecionando…";
      }

      try {
        await fetch(PRECHECKOUT_FORM_ACTION, { method: "POST", mode: "no-cors", body: fd });
      } catch (_) {
        // não bloqueia o fluxo
      }

      // ✅ Sem “telinha” de sucesso: vai direto para o checkout
      if (HOTMART_CHECKOUT_URL) {
        window.location.href = HOTMART_CHECKOUT_URL;
      } else {
        // fallback: fecha modal se ainda não configurou a url
        closeCheckoutModal();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  })();

  // ---------------------------
  // Abrir lead modal ao terminar vídeo (apenas 1ª visita)
  // ---------------------------
  (function videoAutoOpenOnce() {
    const KEY = "leadModalAfterVideoShown_v1";
    if (localStorage.getItem(KEY) === "1") return;

    const iframe = qs('iframe[data-youtube-lead="1"]') || qs('.video iframe');
    if (!iframe) return;

    // Precisamos do YouTube Iframe API para detectar término.
    // Só ativamos se for um link do youtube embed.
    const src = iframe.getAttribute("src") || "";
    if (!/youtube\.com\/embed\//i.test(src)) return;

    // Garante enablejsapi=1
    if (!/enablejsapi=1/.test(src)) {
      const joiner = src.includes("?") ? "&" : "?";
      iframe.setAttribute("src", src + joiner + "enablejsapi=1");
    }

    // Carrega API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function () {
      try {
        // eslint-disable-next-line no-undef
        new YT.Player(iframe, {
          events: {
            onStateChange: (event) => {
              // 0 = ended
              if (event.data === 0) {
                localStorage.setItem(KEY, "1");
                openLeadModal();
              }
            }
          }
        });
      } catch (_) {}
    };
  })();

  // ---------------------------
  // ESC fecha modais
  // ---------------------------
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (checkoutModal && checkoutModal.classList.contains("is-open")) closeCheckoutModal();
    if (leadModal && leadModal.classList.contains("is-open")) closeLeadModal();
  });
})();