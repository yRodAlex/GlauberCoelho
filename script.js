// ============================
// Helpers
// ============================
function lockBody(lock) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

function openOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  lockBody(true);
}

function closeOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  lockBody(false);
}

function maskPhoneBR(value) {
  // Mantém só números
  const digits = (value || "").replace(/\D/g, "").slice(0, 11);

  // Formato: DD 12345-6789 (10 ou 11 dígitos depois do DDD)
  const ddd = digits.slice(0, 2);
  const part1 = digits.slice(2, 7);
  const part2 = digits.slice(7, 11);

  if (!ddd) return "";
  if (!part1) return `${ddd}`;
  if (!part2) return `${ddd} ${part1}`;
  return `${ddd} ${part1}-${part2}`;
}

function wirePhoneMask(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener("input", (e) => {
    const cursorEnd = inputEl.selectionEnd;
    const before = inputEl.value;
    inputEl.value = maskPhoneBR(inputEl.value);
    try {
      inputEl.setSelectionRange(cursorEnd, cursorEnd);
    } catch {}
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email || "");
}

async function submitToGoogleForms(formEl, actionUrl) {
  const fd = new FormData(formEl);

  // Envio silencioso
  await fetch(actionUrl, {
    method: "POST",
    mode: "no-cors",
    body: fd,
  });
}

// ============================
// DOM Ready
// ============================
document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
      const isOpen = mobileMenu.classList.contains("is-open");
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    });

    // Fecha menu ao clicar em links
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        mobileMenu.setAttribute("aria-hidden", "true");
      });
    });
  }

  // Botões que abrem modais
  const openLeadBtn = document.getElementById("openLeadBtn");
  const openUnderstandBtn = document.getElementById("openUnderstandBtn");
  const openCheckoutBtn = document.getElementById("openCheckoutBtn");
  const openCheckoutBtnMobile = document.getElementById("openCheckoutBtnMobile");
  const openCheckoutBtnBottom = document.getElementById("openCheckoutBtnBottom");

  openLeadBtn?.addEventListener("click", () => openOverlay("leadModal"));
  openUnderstandBtn?.addEventListener("click", () => openOverlay("understandModal"));

  const openCheckout = () => openOverlay("checkoutModal");
  openCheckoutBtn?.addEventListener("click", openCheckout);
  openCheckoutBtnMobile?.addEventListener("click", openCheckout);
  openCheckoutBtnBottom?.addEventListener("click", openCheckout);

  // Fechar modais (botão X e clique fora)
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeOverlay(btn.getAttribute("data-close")));
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay(overlay.id);
    });
  });

  // ============================
  // Máscara e validações (2 formulários + checkout)
  // ============================
  const leadForm = document.getElementById("leadForm");
  const understandForm = document.getElementById("understandForm");
  const checkoutForm = document.getElementById("checkoutForm");

  // Inputs WhatsApp
  wirePhoneMask(leadForm?.querySelector('input[name="entry.1559174376"]'));
  wirePhoneMask(understandForm?.querySelector('input[name="entry.1927941383"]'));
  wirePhoneMask(checkoutForm?.querySelector('input[name="entry.1927941383"]'));

  // ============================
  // Lead Form (Quero iniciar minha jornada)
  // ============================
  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailEl = leadForm.querySelector('input[name="entry.526339929"]');
      if (emailEl && !isValidEmail(emailEl.value)) {
        emailEl.focus();
        emailEl.setCustomValidity("Digite um e-mail válido.");
        emailEl.reportValidity();
        emailEl.setCustomValidity("");
        return;
      }

      // Envio Google Forms (seu endpoint original)
      const actionUrl =
        "https://docs.google.com/forms/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse";

      try {
        await submitToGoogleForms(leadForm, actionUrl);
        leadForm.style.display = "none";
        const ok = document.getElementById("leadSuccess");
        if (ok) ok.style.display = "block";
      } catch (err) {
        alert("Não foi possível enviar agora. Tente novamente.");
      }
    });
  }

  // ============================
  // Understand Form (Quero entender se é para mim)
  // ============================
  if (understandForm) {
    understandForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailEl = understandForm.querySelector('input[name="entry.224218993"]');
      if (emailEl && !isValidEmail(emailEl.value)) {
        emailEl.focus();
        emailEl.setCustomValidity("Digite um e-mail válido.");
        emailEl.reportValidity();
        emailEl.setCustomValidity("");
        return;
      }

      const actionUrl =
        "https://docs.google.com/forms/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse";

      try {
        await submitToGoogleForms(understandForm, actionUrl);
        understandForm.style.display = "none";
        const ok = document.getElementById("understandSuccess");
        if (ok) ok.style.display = "block";
      } catch (err) {
        alert("Não foi possível enviar agora. Tente novamente.");
      }
    });
  }

  // ============================
  // Checkout Form (Garantir minha vaga) -> redireciona para Hotmart
  // ============================
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailEl = checkoutForm.querySelector('input[name="entry.224218993"]');
      if (emailEl && !isValidEmail(emailEl.value)) {
        emailEl.focus();
        emailEl.setCustomValidity("Digite um e-mail válido.");
        emailEl.reportValidity();
        emailEl.setCustomValidity("");
        return;
      }

      const actionUrl =
        "https://docs.google.com/forms/d/e/1FAIpQLSdHeWEx2NfbnrxQYTne4wl72QzJPVd2lNOa1LjOS2fCyShx1A/formResponse";

      try {
        await submitToGoogleForms(checkoutForm, actionUrl);

        // ✅ aqui você coloca a URL do checkout Hotmart
        // Exemplo (troque pela sua):
        const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/SEU_CHECKOUT_AQUI";
        window.location.href = HOTMART_CHECKOUT_URL;
      } catch (err) {
        alert("Não foi possível enviar agora. Tente novamente.");
      }
    });
  }

  // WhatsApp CTA (se quiser colocar link real)
  const whatsBtn = document.getElementById("whatsBtn");
  if (whatsBtn) {
    whatsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // troque pelo número e mensagem:
      const phone = "5500000000000";
      const msg = encodeURIComponent("Olá! Quero saber mais sobre a Jornada Terapêutica.");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    });
  }
});
