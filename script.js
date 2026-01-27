/* =========================
   CONFIG
   ========================= */

// Troque pelo seu link real da Hotmart (checkout)
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/SEU_LINK_AQUI";

/* Auto-abrir lead modal ao terminar o vídeo (somente 1ª visita) */
const FIRST_VISIT_KEY = "jt_first_visit_video_modal_shown_v1";


/* =========================
   Helpers
   ========================= */
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;

  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function closeAnyOpenModal() {
  qsa(".modal-overlay.is-open").forEach(m => closeModal(m.id));
}

/* =========================
   Nav highlight
   ========================= */
(function navHighlight() {
  const links = qsa('#navlinks a[data-target]');
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
    rootMargin: `-${headerH + 10}px 0px -60% 0px`,
    threshold: [0.15, 0.25, 0.4, 0.6, 0.8]
  });

  sections.forEach(sec => obs.observe(sec));
  setActive(sections[0].id);
})();

/* =========================
   Mobile drawer
   ========================= */
(function mobileDrawer() {
  const drawer = document.getElementById("mobileDrawer");
  const openBtn = document.getElementById("hamburgerBtn");
  const closeBtn = document.getElementById("closeDrawerBtn");
  const links = document.getElementById("mobileDrawerLinks");

  if (!drawer || !openBtn || !closeBtn || !links) return;

  function open() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function close() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", () => {
    drawer.classList.contains("is-open") ? close() : open();
  });
  closeBtn.addEventListener("click", close);

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) close();
  });

  links.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
  });
})();

/* =========================
   Modal binds (Lead + Checkout)
   ========================= */
(function modalBinds() {
  const openLeadBtns = ["openLeadBtn", "openLeadBtn2"].map(id => document.getElementById(id)).filter(Boolean);
  const openCheckoutBtns = ["openCheckoutBtn", "openCheckoutBtn2", "openCheckoutBtn3"].map(id => document.getElementById(id)).filter(Boolean);

  openLeadBtns.forEach(btn => btn.addEventListener("click", () => openModal("leadModal")));
  openCheckoutBtns.forEach(btn => btn.addEventListener("click", () => openModal("checkoutModal")));

  // Close buttons
  qsa('[data-close]').forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close")));
  });

  // Click outside closes
  qsa(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Esc closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAnyOpenModal();
  });
})();

/* =========================
   Phone mask: "DD 12345-6789"
   ========================= */
function applyPhoneMask(input) {
  const digits = input.value.replace(/\D/g, "").slice(0, 11); // 2 + 5 + 4
  const ddd = digits.slice(0, 2);
  const mid = digits.slice(2, 7);
  const last = digits.slice(7, 11);

  let out = "";
  if (ddd) out += ddd;
  if (digits.length >= 3) out += " " + mid;
  if (digits.length >= 8) out += "-" + last;

  input.value = out.trim();
}

(function phoneMasks() {
  qsa(".phone-mask").forEach(inp => {
    inp.addEventListener("input", () => applyPhoneMask(inp));
    inp.addEventListener("blur", () => applyPhoneMask(inp));

    // hard validation pattern (HTML)
    inp.setAttribute("pattern", "^\\d{2}\\s\\d{5}-\\d{4}$");
    inp.setAttribute("title", "Use o formato: DD 12345-6789");
  });
})();

/* =========================
   Form submit behaviors
   - Lead: show success message and close later (optional)
   - Checkout: submit to Google Forms and redirect to Hotmart
   ========================= */
(function forms() {
  const leadForm = document.getElementById("leadForm");
  const leadSuccess = document.getElementById("leadSuccess");

  if (leadForm) {
    leadForm.addEventListener("submit", () => {
      // Deixa o Google Forms receber via hidden iframe
      // Depois mostramos mensagem e fechamos modal
      window.setTimeout(() => {
        if (leadSuccess) leadSuccess.style.display = "block";
        leadForm.style.display = "none";

        // Fecha depois de um tempo (opcional)
        window.setTimeout(() => {
          closeModal("leadModal");
          // reset visual
          leadForm.reset();
          leadForm.style.display = "";
          if (leadSuccess) leadSuccess.style.display = "none";
        }, 1800);
      }, 400);
    });
  }

  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutBtn = document.getElementById("checkoutSubmitBtn");

  if (checkoutForm && checkoutBtn) {
    checkoutForm.addEventListener("submit", () => {
      // Não mostrar "telinha" intermediária: redireciona logo após enviar
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Redirecionando...";

      // aguarda um pouco pro POST ser disparado no iframe, então redireciona
      window.setTimeout(() => {
        window.location.href = HOTMART_CHECKOUT_URL;
      }, 550);
    });
  }
})();

/* =========================
   YouTube: open lead modal on end (first visit only)
   ========================= */
let ytPlayer;

function onYouTubeIframeAPIReady() {
  const holder = document.getElementById("ytPlayer");
  if (!holder) return;

  const vid = holder.getAttribute("data-youtube-id") || "dQw4w9WgXcQ";

  ytPlayer = new YT.Player("ytPlayer", {
    videoId: vid,
    playerVars: {
      rel: 0,
      modestbranding: 1
    },
    events: {
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  // 0 = ended
  if (event.data !== YT.PlayerState.ENDED) return;

  const alreadyShown = localStorage.getItem(FIRST_VISIT_KEY) === "1";
  if (!alreadyShown) {
    localStorage.setItem(FIRST_VISIT_KEY, "1");
    openModal("leadModal");
  }
}
