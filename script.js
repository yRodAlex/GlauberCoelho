/* =========================
   CONFIGURAÇÕES IMPORTANTES
   ========================= */

// 1) Checkout Hotmart (troque pela sua URL real)
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/SEU_CHECKOUT_AQUI";

// 2) Google Forms (Lead + Pré-checkout)
// Troque pelos seus links reais de formResponse e os entry.ID reais.
// Exemplo de endpoint: https://docs.google.com/forms/d/e/SEU_ID/formResponse
const GOOGLE_FORMS = {
  lead: {
    endpoint: "", // <-- coloque aqui
    // mapeamento (name do input -> entry.X)
    map: {
      "entry.NOME": "entry.407392332",
      "entry.EMAIL": "entry.526339929",
      "entry.WHATS": "entry.1559174376",
      "entry.MOTIVO": "entry.804946524",
      "entry.CONTATO": "entry.268953612"
    }
  },
  checkout: {
    endpoint: "", // <-- coloque aqui
    map: {
      "entry.NOME": "entry.407392332",
      "entry.EMAIL": "entry.526339929",
      "entry.CPF": "entry.000000000",      // opcional (troque)
      "entry.WHATS": "entry.1559174376",
      "entry.OBJETIVO": "entry.804946524", // troque se for outro
      "entry.CONTATO": "entry.268953612"
    }
  }
};

// 3) “Abrir formulário quando termina o vídeo” apenas 1ª visita
const FIRST_VISIT_KEY = "lp_first_visit_done";
const VIDEO_MODAL_OPENED_KEY = "lp_video_modal_opened";

/* =========================
   HELPERS
   ========================= */

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function lockScroll(lock) {
  document.body.style.overflow = lock ? "hidden" : "";
}

function openOverlay(el) {
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
  lockScroll(true);
}

function closeOverlay(el) {
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
  lockScroll(false);
}

function isFirstVisit() {
  return !localStorage.getItem(FIRST_VISIT_KEY);
}

function markVisited() {
  localStorage.setItem(FIRST_VISIT_KEY, "1");
}

/**
 * Envia para Google Forms via POST no-cors
 * (sem depender de backend)
 */
async function postToGoogleForms(formEl, cfg) {
  if (!cfg?.endpoint) return { ok: false, skipped: true };

  const fd = new FormData();
  const raw = new FormData(formEl);

  for (const [k, v] of raw.entries()) {
    const entryKey = cfg.map[k];
    if (!entryKey) continue;
    fd.append(entryKey, v);
  }

  try {
    await fetch(cfg.endpoint, {
      method: "POST",
      mode: "no-cors",
      body: fd
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

/* =========================
   MENU HAMBURGER (drawer)
   ========================= */

(function initDrawer() {
  const btn = qs("#hamburgerBtn");
  const backdrop = qs("#drawerBackdrop");
  const closeBtn = qs("#drawerClose");

  if (!btn || !backdrop || !closeBtn) return;

  function openDrawer() {
    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    lockScroll(true);
  }

  function closeDrawer() {
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    lockScroll(false);
  }

  btn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.classList.contains("is-open")) closeDrawer();
  });

  // Fechar ao clicar em links
  qsa("#navlinks a").forEach(a => {
    a.addEventListener("click", () => closeDrawer());
  });

  // Ações no drawer
  const drawerLeadBtn = qs("#drawerLeadBtn");
  const drawerCheckoutBtn = qs("#drawerCheckoutBtn");

  drawerLeadBtn?.addEventListener("click", () => {
    closeDrawer();
    openLeadModal();
  });

  drawerCheckoutBtn?.addEventListener("click", () => {
    closeDrawer();
    openCheckoutModal();
  });
})();

/* =========================
   MODAIS
   ========================= */

const leadModal = qs("#leadModal");
const checkoutModal = qs("#checkoutModal");

function openLeadModal() {
  if (!leadModal) return;
  openOverlay(leadModal);
}

function closeLeadModal() {
  if (!leadModal) return;
  closeOverlay(leadModal);
}

function openCheckoutModal() {
  if (!checkoutModal) return;
  openOverlay(checkoutModal);
}

function closeCheckoutModal() {
  if (!checkoutModal) return;
  closeOverlay(checkoutModal);
}

(function initModals() {
  // Botões de abrir
  qs("#openLeadBtn")?.addEventListener("click", openLeadModal);
  qs("#openLeadBtn2")?.addEventListener("click", openLeadModal);

  qs("#openCheckoutBtn")?.addEventListener("click", openCheckoutModal);
  qs("#openCheckoutBtn2")?.addEventListener("click", openCheckoutModal);
  qs("#topCtaBtn")?.addEventListener("click", openCheckoutModal); // CTA do header abre prompt (não rola)

  // Botões de fechar
  qs("#closeLeadModal")?.addEventListener("click", closeLeadModal);
  qs("#closeCheckoutModal")?.addEventListener("click", closeCheckoutModal);

  // Fechar clicando fora
  leadModal?.addEventListener("click", (e) => { if (e.target === leadModal) closeLeadModal(); });
  checkoutModal?.addEventListener("click", (e) => { if (e.target === checkoutModal) closeCheckoutModal(); });

  // Esc fecha
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (leadModal?.classList.contains("is-open")) closeLeadModal();
    if (checkoutModal?.classList.contains("is-open")) closeCheckoutModal();
  });
})();

/* =========================
   FORM: LEAD
   ========================= */

(function initLeadForm() {
  const form = qs("#leadForm");
  const success = qs("#leadSuccess");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type='submit']");
    const old = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }

    await postToGoogleForms(form, GOOGLE_FORMS.lead);

    // UI success
    if (success) success.style.display = "block";
    form.querySelectorAll("input,textarea,button").forEach(el => el.disabled = true);

    setTimeout(() => {
      closeLeadModal();
      // reset visual (se quiser, comente)
      // location.reload();
    }, 1200);

    if (btn) { btn.disabled = true; btn.textContent = old || "Enviado"; }
  });
})();

/* =========================
   FORM: PRÉ-CHECKOUT
   - Envia dados para Google Forms (se configurado)
   - Abre checkout Hotmart
   ========================= */

(function initCheckoutForm() {
  const form = qs("#checkoutForm");
  const success = qs("#checkoutSuccess");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type='submit']");
    const old = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }

    await postToGoogleForms(form, GOOGLE_FORMS.checkout);

    if (success) success.style.display = "block";

    // Fecha modal e abre checkout
    setTimeout(() => {
      closeCheckoutModal();

      if (HOTMART_CHECKOUT_URL && HOTMART_CHECKOUT_URL.includes("http")) {
        window.open(HOTMART_CHECKOUT_URL, "_blank", "noopener");
      } else {
        alert("⚠️ Configure a URL do checkout Hotmart no script.js");
      }
    }, 700);

    if (btn) { btn.disabled = false; btn.textContent = old || "Continuar para pagamento"; }
  });
})();

/* =========================
   ABRIR FORM AO FINAL DO VÍDEO (1ª visita)
   - usa YouTube IFrame API
   ========================= */

let ytPlayer = null;

window.onYouTubeIframeAPIReady = function () {
  const iframeEl = document.getElementById("ytPlayer");
  if (!iframeEl) return;

  ytPlayer = new YT.Player("ytPlayer", {
    events: {
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerStateChange(event) {
  // 0 = ended
  if (event.data !== YT.PlayerState.ENDED) return;

  // só na primeira visita + só 1 vez
  if (!isFirstVisit()) return;
  if (localStorage.getItem(VIDEO_MODAL_OPENED_KEY)) return;

  localStorage.setItem(VIDEO_MODAL_OPENED_KEY, "1");
  markVisited();

  // abre o modal lead ao terminar
  openLeadModal();
}

/* =========================
   (IMPORTANTE) E-MAIL PÓS PAGAMENTO
   =========================
   Front-end NÃO consegue saber se a pessoa pagou na Hotmart.
   O correto é:
   - configurar Webhook da Hotmart (evento: purchase approved)
   - no webhook: enviar email para o cliente + notificar o Glauber
   Isso exige:
   - backend (Node/Express) OU
   - automação (Make/Zapier) OU
   - Google Apps Script (com endpoint)
*/
