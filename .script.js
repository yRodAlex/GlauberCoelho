/* =========================
   CONFIGURAÇÕES
   ========================= */

// ⚠️ Coloque aqui o link do checkout da Hotmart (o seu real).
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
}

function formatPhoneBR(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 11);
  const ddd = digits.slice(0, 2);
  const mid = digits.slice(2, 7);
  const tail = digits.slice(7, 11);
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

function validateForm(form) {
  let ok = true;
  const fields = qsa(".field", form);

  fields.forEach(f => {
    clearFieldError(f);

    const el = f.querySelector("input, textarea, select");
    if (!el) return;

    const required = el.hasAttribute("required");
    const val = (el.value || "").trim();

    if (required && !val) {
      ok = false;
      setFieldError(f, "Campo obrigatório");
      return;
    }

    if (el.type === "email" && val) {
      if (!isValidEmail(val)) {
        ok = false;
        setFieldError(f, "Digite um email válido");
        return;
      }
    }

    if (el.dataset.phone !== undefined && val) {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 10) {
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

    if (el.tagName === "SELECT" && required) {
      if (!val) {
        ok = false;
        setFieldError(f, "Selecione uma opção");
        return;
      }
    }
  });

  if (!ok) {
    const firstInvalid = form.querySelector(".is-invalid");
    if (firstInvalid) firstInvalid.focus({ preventScroll: false });
  }

  return ok;
}

async function submitToGoogleForms(form) {
  const action = form.getAttribute("action");
  const fd = new FormData(form);

  await fetch(action, {
    method: "POST",
    mode: "no-cors",
    body: fd
  });
}

/* =========================
   MENU HAMBURGER
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
  const openLeadBtn = document.getElementById("openLeadBtn");
  const openLeadBtn2 = document.getElementById("openLeadBtn2");
  const openCheckoutBtn = document.getElementById("openCheckoutBtn");
  const openCheckoutBtnMobile = document.getElementById("openCheckoutBtnMobile");
  const floatingCart = document.getElementById("floatingCart");

  openLeadBtn?.addEventListener("click", () => openModal("leadModal"));
  openLeadBtn2?.addEventListener("click", () => openModal("leadModal"));

  openCheckoutBtn?.addEventListener("click", () => openModal("checkoutModal"));
  openCheckoutBtnMobile?.addEventListener("click", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    mobileMenu?.classList.remove("is-open");
    mobileMenu?.setAttribute("aria-hidden", "true");
    openModal("checkoutModal");
  });

  floatingCart?.addEventListener("click", () => openModal("checkoutModal"));

  qsa("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close")));
  });

  ["leadModal", "checkoutModal"].forEach(id => {
    const m = document.getElementById(id);
    if (!m) return;
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(id);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const leadOpen = document.getElementById("leadModal")?.classList.contains("is-open");
    const checkoutOpen = document.getElementById("checkoutModal")?.classList.contains("is-open");
    if (leadOpen) closeModal("leadModal");
    if (checkoutOpen) closeModal("checkoutModal");
  });
})();

/* =========================
   PHONE MASK
   ========================= */
(function initPhoneMask() {
  qsa("input[data-phone]").forEach(inp => {
    inp.addEventListener("input", () => {
      const caret = inp.selectionStart || 0;
      const before = inp.value;
      inp.value = formatPhoneBR(inp.value);

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

  leadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(leadForm)) return;

    try {
      await submitToGoogleForms(leadForm);

      if (leadSuccess) leadSuccess.hidden = false;

      leadForm.reset();
      setTimeout(() => {
        if (leadSuccess) leadSuccess.hidden = true;
        closeModal("leadModal");
      }, 1400);
    } catch (err) {
      closeModal("leadModal");
    }
  });

  checkoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(checkoutForm)) return;

    try {
      await submitToGoogleForms(checkoutForm);
    } catch (err) {
    } finally {
      closeModal("checkoutModal");
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
    const holder = document.getElementById("ytPlayer");
    if (holder) {
      holder.innerHTML = `<iframe src="https://www.youtube.com/embed/${YT_VIDEO_ID}"
        title="Vídeo de apresentação" loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
    }
    return;
  }

  const already = localStorage.getItem(LS_VIDEO_TRIGGER_KEY) === "1";

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = function () {
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


function ajustarScrollModal() {
  const header = document.querySelector('.modal-header');
  const body = document.querySelector('.modal-body');

  if (header && body) {
    body.style.paddingTop = header.offsetHeight + 12 + 'px';
  }
}


openModalBtn.addEventListener('click', () => {
  modal.classList.add('open');
  ajustarScrollModal();
});
