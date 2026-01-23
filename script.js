/* =========================================================
   CONFIG
   ========================================================= */

// Form 1: "Quero entender se é para mim"
const LEAD_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSc343T86qOwMwLlOx4PgyKtW4hqPOBp6NPW2Hz8oXrdYvGw7g/formResponse";

// Form 2: "Garantir minha vaga" (NOVO que você mandou)
const PRECHECKOUT_FORM_ACTION =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse";

// Checkout Hotmart (troque pela sua URL final do checkout)
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/"; // <-- troque aqui pela URL exata do seu produto

/* =========================================================
   HELPERS
   ========================================================= */

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function openModal(modalId) {
  const modal = qs(`#${modalId}`);
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = qs(`#${modalId}`);
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

window.openLeadModal = () => openModal("leadModal");
window.openPreCheckoutModal = () => openModal("preCheckoutModal");

/* Close modal by clicking X or background */
(function bindModalClose() {
  qsa("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close-modal")));
  });

  qsa(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      qsa(".modal-overlay.is-open").forEach(m => closeModal(m.id));
      closeMobileMenu();
    }
  });
})();

/* =========================================================
   NAV ACTIVE (IntersectionObserver)
   ========================================================= */
(function navHighlight() {
  const links = qsa('#navlinks a[data-target]');
  const sections = links.map(a => qs(`#${a.dataset.target}`)).filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const setActive = (id) => links.forEach(a => a.classList.toggle('active', a.dataset.target === id));

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

/* =========================================================
   MOBILE MENU
   ========================================================= */
const hamburgerBtn = qs("#hamburgerBtn");
const mobileMenu = qs("#mobileMenu");
const mobileBackdrop = qs("#mobileMenuBackdrop");
const mobileCloseBtn = qs("#mobileCloseBtn");

function openMobileMenu() {
  if (!mobileMenu || !mobileBackdrop || !hamburgerBtn) return;
  mobileMenu.classList.add("is-open");
  mobileBackdrop.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileBackdrop.setAttribute("aria-hidden", "false");
  hamburgerBtn.setAttribute("aria-expanded", "true");
}

function closeMobileMenu() {
  if (!mobileMenu || !mobileBackdrop || !hamburgerBtn) return;
  mobileMenu.classList.remove("is-open");
  mobileBackdrop.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileBackdrop.setAttribute("aria-hidden", "true");
  hamburgerBtn.setAttribute("aria-expanded", "false");
}

if (hamburgerBtn) hamburgerBtn.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.contains("is-open");
  isOpen ? closeMobileMenu() : openMobileMenu();
});

if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileMenu);
if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMobileMenu);

qsa("[data-mobile-link]").forEach(a => {
  a.addEventListener("click", () => closeMobileMenu());
});

/* =========================================================
   INPUT MASK: (DD) 12345-6789
   - Aceita 10 ou 11 dígitos: (11) 1234-5678 ou (11) 91234-5678
   - Você pediu o modelo: DDD 12345-6789 (vamos priorizar 11 dígitos)
   ========================================================= */
function onlyDigits(str) {
  return (str || "").replace(/\D/g, "");
}

function formatPhoneBR(value) {
  const d = onlyDigits(value).slice(0, 11);

  // DDD
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);

  if (!ddd) return "";

  // 11 dígitos: 9XXXX-XXXX
  if (d.length >= 11) {
    const p1 = rest.slice(0, 5);
    const p2 = rest.slice(5, 9);
    return `(${ddd}) ${p1}${p2 ? "-" + p2 : ""}`.trim();
  }

  // 10 dígitos: XXXX-XXXX
  const p1 = rest.slice(0, 4);
  const p2 = rest.slice(4, 8);
  return `(${ddd}) ${p1}${p2 ? "-" + p2 : ""}`.trim();
}

function bindPhoneMasks() {
  qsa("[data-phone-mask]").forEach(input => {
    input.addEventListener("input", () => {
      const cursorStart = input.selectionStart || 0;
      const before = input.value;

      input.value = formatPhoneBR(input.value);

      // Cursor handling simples (sem quebrar a digitação)
      const diff = input.value.length - before.length;
      const nextPos = Math.max(0, cursorStart + diff);
      try { input.setSelectionRange(nextPos, nextPos); } catch { }
    });

    // ao focar, se vazio, não adiciona nada
    input.addEventListener("blur", () => {
      input.value = formatPhoneBR(input.value);
    });
  });
}
bindPhoneMasks();

/* =========================================================
   VALIDATION
   ========================================================= */

function markInvalid(el, isInvalid) {
  if (!el) return;
  el.classList.toggle("is-invalid", !!isInvalid);
}

function isValidEmail(email) {
  // validação robusta o suficiente pro front
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || "").trim());
}

function isValidPhoneMasked(phoneValue) {
  const digits = onlyDigits(phoneValue);
  // 10 ou 11 dígitos (DDD + número)
  return digits.length === 10 || digits.length === 11;
}

function validateForm(form) {
  let ok = true;

  // limpa invalids
  qsa("input, textarea", form).forEach(el => markInvalid(el, false));

  // required
  qsa("[required]", form).forEach(el => {
    const val = (el.value || "").trim();

    // radio group
    if (el.type === "radio") {
      const name = el.name;
      const anyChecked = qsa(`input[type="radio"][name="${CSS.escape(name)}"]`, form).some(r => r.checked);
      if (!anyChecked) {
        // marca todos radios desse grupo como "inválido" via label (ux)
        qsa(`input[type="radio"][name="${CSS.escape(name)}"]`, form).forEach(r => {
          const lbl = form.querySelector(`label[for="${r.id}"]`);
          if (lbl) lbl.style.outline = "2px solid rgba(210, 60, 60, .35)";
          setTimeout(() => { if (lbl) lbl.style.outline = ""; }, 1800);
        });
        ok = false;
      }
      return;
    }

    if (!val) {
      markInvalid(el, true);
      ok = false;
    }
  });

  // email fields
  qsa('input[type="email"]', form).forEach(el => {
    if (!el.value.trim()) return; // required já pega
    if (!isValidEmail(el.value)) {
      markInvalid(el, true);
      ok = false;
    }
  });

  // phone masked inputs
  qsa("[data-phone-mask]", form).forEach(el => {
    if (!el.value.trim()) return; // required já pega
    if (!isValidPhoneMasked(el.value)) {
      markInvalid(el, true);
      ok = false;
    }
  });

  // foca no primeiro inválido
  if (!ok) {
    const first = qs(".is-invalid", form);
    if (first) first.focus();
  }

  return ok;
}

/* =========================================================
   SUBMIT (Google Forms)
   ========================================================= */

async function postToGoogleForms(actionUrl, formEl) {
  const formData = new FormData(formEl);

  // Google Forms gosta de POST application/x-www-form-urlencoded
  const body = new URLSearchParams();
  for (const [k, v] of formData.entries()) {
    body.append(k, v);
  }

  // no-cors: não dá para ler a resposta, mas envia
  await fetch(actionUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body
  });
}

/* =========================================================
   FORM 1: LeadForm (Entender se é para mim)
   ========================================================= */
(function bindLeadForm() {
  const form = qs("#leadForm");
  const success = qs("#leadSuccess");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    try {
      await postToGoogleForms(LEAD_FORM_ACTION, form);
      form.style.display = "none";
      if (success) success.style.display = "block";
      // fecha depois de um tempo (opcional)
      setTimeout(() => closeModal("leadModal"), 2200);
    } catch (err) {
      alert("Não conseguimos enviar agora. Tente novamente em instantes.");
      console.error(err);
    }
  });
})();

/* =========================================================
   FORM 2: PreCheckoutForm (Garantir minha vaga)
   - envia pro Google Forms novo
   - depois redireciona pro checkout da Hotmart
   ========================================================= */
(function bindPreCheckoutForm() {
  const form = qs("#preCheckoutForm");
  const success = qs("#preCheckoutSuccess");
  const btn = qs("#preCheckoutSubmitBtn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    if (btn) {
      btn.disabled = true;
      btn.style.opacity = "0.85";
      btn.textContent = "Enviando dados...";
    }

    try {
      await postToGoogleForms(PRECHECKOUT_FORM_ACTION, form);

      form.style.display = "none";
      if (success) success.style.display = "block";

      // Redireciona para Hotmart
      setTimeout(() => {
        window.location.href = HOTMART_CHECKOUT_URL;
      }, 1300);
    } catch (err) {
      alert("Não conseguimos enviar agora. Tente novamente em instantes.");
      console.error(err);
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = "";
        btn.textContent = "Continuar para pagamento";
      }
    }
  });
})();

/* =========================================================
   AUTO-OPEN FORM APÓS "assistir o vídeo" (somente 1ª visita)
   =========================================================
   - Para YouTube iframe embed normal, NÃO dá pra detectar o fim do vídeo sem usar a YouTube Iframe API.
   - Aqui deixo um fallback inteligente:
     1) Se for a primeira visita, após X segundos na seção do vídeo, abre o modal 1 ("entender se é para mim").
   - Se você quiser detecção REAL de final do vídeo, me diga e eu coloco a YouTube Iframe API certinho.
*/
(function firstVisitVideoPromptFallback() {
  const KEY = "glauber_first_visit_prompted_v1";
  if (localStorage.getItem(KEY) === "1") return;

  const videoSection = qs("#video");
  if (!videoSection || !("IntersectionObserver" in window)) return;

  let timer = null;
  const obs = new IntersectionObserver((entries) => {
    const seen = entries.some(e => e.isIntersecting && e.intersectionRatio > 0.45);
    if (seen) {
      if (!timer) {
        timer = setTimeout(() => {
          // marca como já exibido
          localStorage.setItem(KEY, "1");
          // abre modal do lead
          openModal("leadModal");
          obs.disconnect();
        }, 35_000); // 35s dentro/na seção do vídeo
      }
    } else {
      if (timer) { clearTimeout(timer); timer = null; }
    }
  }, { threshold: [0.15, 0.3, 0.45, 0.6] });

  obs.observe(videoSection);
})();
