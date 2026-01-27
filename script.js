// ✅ Troque pelo seu link real da Hotmart
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/SEU_LINK_AQUI";

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

function isMobile() {
  return window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
}

/* =========================
   Phone mask: DD 12345-6789
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

function bindPhoneMasks() {
  qsa(".phone-mask").forEach(inp => {
    inp.addEventListener("input", () => applyPhoneMask(inp));
    inp.addEventListener("blur", () => applyPhoneMask(inp));
    inp.setAttribute("pattern", "^\\d{2}\\s\\d{5}-\\d{4}$");
    inp.setAttribute("title", "Use o formato: DD 12345-6789");
  });
}

/* =========================
   Mobile drawer
   ========================= */
function bindDrawer() {
  const drawer = document.getElementById("mobileDrawer");
  const openBtn = document.getElementById("hamburgerBtn");
  const closeBtn = document.getElementById("closeDrawerBtn");
  const links = document.getElementById("mobileDrawerLinks");

  if (!drawer || !openBtn || !closeBtn || !links) return;

  function forceCloseDesktop() {
    // ✅ garante que no desktop o drawer nunca fique visível
    if (!isMobile()) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }

  function open() {
    if (!isMobile()) return; // ✅ não abre no desktop
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
    if (drawer.classList.contains("is-open")) close();
    else open();
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

  window.addEventListener("resize", forceCloseDesktop);
  forceCloseDesktop();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
      closeModal("leadModal");
      closeModal("checkoutModal");
    }
  });
}

/* =========================
   Modais (botões)
   ========================= */
function bindModals() {
  // ✅ abre lead
  const leadBtn = document.getElementById("openLeadBtn");
  if (leadBtn) {
    leadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("leadModal");
    });
  }

  // ✅ abre checkout
  const checkoutBtn = document.getElementById("openCheckoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("checkoutModal");
    });
  }

  // ✅ fechar com botões data-close
  qsa("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close");
      closeModal(id);
    });
  });

  // ✅ click fora fecha
  qsa(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

/* =========================
   Submits
   ========================= */
function bindForms() {
  const leadForm = document.getElementById("leadForm");
  const leadSuccess = document.getElementById("leadSuccess");

  if (leadForm) {
    leadForm.addEventListener("submit", () => {
      // envia via iframe e mostra sucesso
      window.setTimeout(() => {
        if (leadSuccess) leadSuccess.style.display = "block";
        leadForm.style.display = "none";
        window.setTimeout(() => {
          closeModal("leadModal");
          leadForm.reset();
          leadForm.style.display = "";
          if (leadSuccess) leadSuccess.style.display = "none";
        }, 1500);
      }, 300);
    });
  }

  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutSubmitBtn = document.getElementById("checkoutSubmitBtn");

  if (checkoutForm && checkoutSubmitBtn) {
    checkoutForm.addEventListener("submit", () => {
      checkoutSubmitBtn.disabled = true;
      checkoutSubmitBtn.textContent = "Redirecionando...";
      // envia pro Google Forms no iframe e redireciona logo em seguida
      window.setTimeout(() => {
        window.location.href = HOTMART_CHECKOUT_URL;
      }, 500);
    });
  }
}

/* =========================
   INIT
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // se o JS não rodar, nada abre — então garantimos init aqui
  bindPhoneMasks();
  bindDrawer();
  bindModals();
  bindForms();

  // ✅ segurança: garante drawer fechado por padrão sempre
  const drawer = document.getElementById("mobileDrawer");
  if (drawer) {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }
});
