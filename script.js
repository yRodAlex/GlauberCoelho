/* =========================
   CONFIGURAÇÕES
   ========================= */

// ⚠️ Coloque aqui o link do checkout da Hotmart (o seu real).
// Exemplo (troque pelo seu):
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/SEU_LINK_AQUI";

/* YouTube video ID (troque se quiser) */
const YT_VIDEO_ID = "dQw4w9WgXcQ"; // você pode trocar

/* Abrir lead form ao terminar vídeo (somente 1ª visita) */
const OPEN_LEAD_ON_VIDEO_END_FIRST_VISIT = true;
const LS_VIDEO_TRIGGER_KEY = "leadModalShownAfterVideo";

/* =========================
   HELPERS
   ========================= */

function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add("is-open");
  m.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove("is-open");
  m.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function isValidEmail(email) {
  // simples e confiável para validação front
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
}

/**
 * Máscara: "DD 12345-6789"
 * - Aceita só números.
 * - Primeiro 2 dígitos (DDD), depois 4 ou 5, depois 4.
 */
function formatPhoneBR(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 11); // 2 + 9 = 11 máx
  const ddd = digits.slice(0, 2);
  const mid = digits.slice(2, 7); // até 5
  const tail = digits.slice(7, 11); // 4
  let out = "";

  if (ddd.length) out += ddd;
  if (digits.length > 2) out += " " + mid;
  if (digits.length > 7) out += "-" + tail;

  return out.trim();
}

function setFieldError(fieldEl, msg) {
  const input = fieldEl.querySelector("input, textarea, select");
  const small = fieldEl.querySelector(".error");
  if (input) input.classList.add("is-invalid");
  if (small) small.textContent = msg || "Campo obrigatório";
}

function clearFieldError(fieldEl) {
  const input = fieldEl.querySelector("input, textarea, select");
  const small = fieldEl.querySelector(".error");
  if (input) input.classList.remove("is-invalid");
  if (small) small.textContent = "";
}

/* Valida um form seguindo regras pedidas */
function validateForm(form) {
  let ok = true;
  const fields = qsa(".field", form);

  fields.forEach(f => {
    clearFieldError(f);

    const el = f.querySelector("input, textarea, select");
    if (!el) return;

    const required = el.hasAttribute("required");
    const name = el.getAttribute("name") || "";
    const val = (el.value || "").trim();

    if (required && !val) {
      ok = false;
      setFieldError(f, "Campo obrigatório");
      return;
    }

    // email
    if (el.type === "email" && val) {
      if (!isValidEmail(val)) {
        ok = false;
        setFieldError(f, "Digite um email válido");
        return;
      }
    }

    // phone mask completeness: precisa ter no mínimo "DD 12345-6789" (2 + 9 = 11 dígitos)
    if (el.dataset.phone !== undefined && val) {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 10) { // mínimo 10 (DDD+8) — mas vamos exigir 11 se quiser estrito
        ok = false;
        setFieldError(f, "Use o formato: DD 12345-6789");
        return;
      }
      if (digits.length !== 11 && digits.length !== 10) {
        ok = false;
        setFieldError(f, "Use o formato: DD 12345-6789");
        return;
      }
    }

    // selects
    if (el.tagName === "SELECT" && required) {
      if (!val) {
        ok = false;
        setFieldError(f, "Selecione uma opção");
        return;
      }
    }
  });

  // foco no primeiro erro
  if (!ok) {
    const firstInvalid = form.querySelector(".is-invalid");
    if (firstInvalid) firstInvalid.focus({ preventScroll: false });
  }

  return ok;
}

/**
 * Envia para Google Forms via fetch no-cors
 * (não dá pra ler resposta, mas salva no form).
 */
async function submitToGoogleForms(form) {
  const action = form.getAttribute("action");
  const fd = new FormData(form);

  // no-cors pra não travar no browser
  await fetch(action, {
    method: "POST",
    mode: "no-cors",
    body: fd
  });
}

/* =========================
   MENU HAMBURGER (somente mobile)
   ========================= */
(function initMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const btn = document.getElementById("hamburgerBtn");
  const closeBtn = document.getElementById("closeMobileMenu");

  if (!menu || !btn || !closeBtn) return;

  function open() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function close() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  menu.addEventListener("click", (e) => {
    if (e.target === menu) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) close();
  });

  qsa(".mobileLink", menu).forEach(a => {
    a.addEventListener("click", () => close());
  });
})();

/* =========================
   MODAIS
   ========================= */
(function initModals() {
  // Open buttons
  const openLeadBtn = document.getElementById("openLeadBtn");
  const openLeadBtn2 = document.getElementById("openLeadBtn2");
  const openCheckoutBtn = document.getElementById("openCheckoutBtn");
  const openCheckoutBtnMobile = document.getElementById("openCheckoutBtnMobile");
  const floatingCart = document.getElementById("floatingCart");

  openLeadBtn?.addEventListener("click", () => openModal("leadModal"));
  openLeadBtn2?.addEventListener("click", () => openModal("leadModal"));

  openCheckoutBtn?.addEventListener("click", () => openModal("checkoutModal"));
  openCheckoutBtnMobile?.addEventListener("click", () => {
    // fecha menu mobile se estiver aberto
    const mobileMenu = document.getElementById("mobileMenu");
    mobileMenu?.classList.remove("is-open");
    mobileMenu?.setAttribute("aria-hidden", "true");
    openModal("checkoutModal");
  });

  floatingCart?.addEventListener("click", () => openModal("checkoutModal"));

  // Close buttons
  qsa("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close")));
  });

  // Click outside closes
  ["leadModal", "checkoutModal"].forEach(id => {
    const m = document.getElementById(id);
    if (!m) return;
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(id);
    });
  });

  // ESC closes any open modal
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const leadOpen = document.getElementById("leadModal")?.classList.contains("is-open");
    const checkoutOpen = document.getElementById("checkoutModal")?.classList.contains("is-open");
    if (leadOpen) closeModal("leadModal");
    if (checkoutOpen) closeModal("checkoutModal");
  });
})();

/* =========================
   PHONE MASK (2 forms)
   ========================= */
(function initPhoneMask() {
  qsa("input[data-phone]").forEach(inp => {
    inp.addEventListener("input", () => {
      const caret = inp.selectionStart || 0;
      const before = inp.value;
      inp.value = formatPhoneBR(inp.value);

      // cuidado simples para não “pular demais” o cursor
      const after = inp.value;
      const diff = after.length - before.length;
      const next = Math.max(0, caret + diff);
      inp.setSelectionRange(next, next);
    });
  });
})();

/* =========================
   SUBMIT FORMS
   ========================= */
(function initForms() {
  const leadForm = document.getElementById("leadForm");
  const checkoutForm = document.getElementById("checkoutForm");
  const leadSuccess = document.getElementById("leadSuccess");

  // Limpa erro ao digitar
  function wireLiveValidation(form) {
    qsa("input, textarea, select", form).forEach(el => {
      el.addEventListener("input", () => {
        const field = el.closest(".field");
        if (field) clearFieldError(field);
      });
      el.addEventListener("change", () => {
        const field = el.closest(".field");
        if (field) clearFieldError(field);
      });
      el.addEventListener("blur", () => {
        // validações pontuais em blur
        const field = el.closest(".field");
        if (!field) return;

        if (el.type === "email" && el.value.trim() && !isValidEmail(el.value)) {
          setFieldError(field, "Digite um email válido");
        }

        if (el.dataset.phone !== undefined && el.value.trim()) {
          const digits = el.value.replace(/\D/g, "");
          if (digits.length !== 10 && digits.length !== 11) {
            setFieldError(field, "Use o formato: DD 12345-6789");
          }
        }
      });
    });
  }

  if (leadForm) wireLiveValidation(leadForm);
  if (checkoutForm) wireLiveValidation(checkoutForm);

  // Lead form
  leadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(leadForm)) return;

    try {
      await submitToGoogleForms(leadForm);

      // feedback simples (sem confusão)
      if (leadSuccess) leadSuccess.hidden = false;

      // limpa campos após sucesso
      leadForm.reset();
      setTimeout(() => {
        if (leadSuccess) leadSuccess.hidden = true;
        closeModal("leadModal");
      }, 1400);
    } catch (err) {
      // falha silenciosa: ainda assim não quebra o fluxo
      closeModal("leadModal");
    }
  });

  // Checkout form: envia e redireciona direto (sem telinha intermediária)
  checkoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(checkoutForm)) return;

    try {
      await submitToGoogleForms(checkoutForm);
    } catch (err) {
      // mesmo se falhar, não trava
    } finally {
      closeModal("checkoutModal");
      // redireciona para hotmart direto
      window.location.href = HOTMART_CHECKOUT_URL;
    }
  });
})();

/* =========================
   ACTIVE MENU (desktop)
   ========================= */
(function navHighlight() {
  const links = Array.from(document.querySelectorAll('#navlinks a[data-target]'));
  const sections = links.map(a => document.getElementById(a.dataset.target)).filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
  };

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
})();

/* =========================
   YOUTUBE: abrir lead modal ao terminar (1ª visita)
   ========================= */
(function initYouTubeEndTrigger() {
  if (!OPEN_LEAD_ON_VIDEO_END_FIRST_VISIT) {
    // fallback: embed normal
    const holder = document.getElementById("ytPlayer");
    if (holder) {
      holder.innerHTML = `<iframe src="https://www.youtube.com/embed/${YT_VIDEO_ID}"
        title="Vídeo de apresentação" loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
    }
    return;
  }

  // Só na primeira visita (ou enquanto não marcou)
  const already = localStorage.getItem(LS_VIDEO_TRIGGER_KEY) === "1";

  // carrega API do YouTube
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = function () {
    // cria player
    // eslint-disable-next-line no-undef
    new YT.Player("ytPlayer", {
      videoId: YT_VIDEO_ID,
      playerVars: {
        rel: 0,
        modestbranding: 1
      },
      events: {
        onStateChange: (event) => {
          // eslint-disable-next-line no-undef
          if (event.data === YT.PlayerState.ENDED) {
            if (!already) {
              localStorage.setItem(LS_VIDEO_TRIGGER_KEY, "1");
              openModal("leadModal");
            }
          }
        }
      }
    });
  };
})();
