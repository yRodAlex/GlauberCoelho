/* =========================
   Helpers
========================= */
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

function openModal(id){
  const overlay = document.getElementById(id);
  if(!overlay) return;
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

function closeModal(id){
  const overlay = document.getElementById(id);
  if(!overlay) return;
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

function isFirstVisit(){
  const key = "jt_first_visit";
  const val = localStorage.getItem(key);
  if(val) return false;
  localStorage.setItem(key, "1");
  return true;
}

/* =========================
   Mobile Menu
========================= */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navLinks = document.getElementById("navLinks");

if(hamburgerBtn && navLinks){
  hamburgerBtn.addEventListener("click", () => {
    const shown = navLinks.style.display === "flex";
    navLinks.style.display = shown ? "none" : "flex";
  });

  qsa("a", navLinks).forEach(a => {
    a.addEventListener("click", () => {
      if(window.matchMedia("(max-width: 900px)").matches){
        navLinks.style.display = "none";
      }
    });
  });

  window.addEventListener("resize", () => {
    if(!window.matchMedia("(max-width: 900px)").matches){
      navLinks.style.display = "flex";
    }else{
      navLinks.style.display = "none";
    }
  });

  // default state
  if(window.matchMedia("(max-width: 900px)").matches){
    navLinks.style.display = "none";
  }else{
    navLinks.style.display = "flex";
  }
}

/* =========================
   Lead Modal (Quero iniciar / entender)
========================= */
const openLeadBtn = document.getElementById("openLeadBtn");
const openLead2Btn = document.getElementById("openLead2Btn");

if(openLeadBtn) openLeadBtn.addEventListener("click", () => openModal("leadModal"));
if(openLead2Btn) openLead2Btn.addEventListener("click", () => openModal("leadModal"));

/* =========================
   PreCheckout Modal (Garantir vaga)
========================= */
const openPreCheckoutBtn = document.getElementById("openPreCheckoutBtn");
const openPreCheckoutBtn2 = document.getElementById("openPreCheckoutBtn2");

if(openPreCheckoutBtn) openPreCheckoutBtn.addEventListener("click", () => openModal("preCheckoutModal"));
if(openPreCheckoutBtn2) openPreCheckoutBtn2.addEventListener("click", () => openModal("preCheckoutModal"));

qsa("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

qsa(".modal-overlay").forEach(ov => {
  ov.addEventListener("click", (e) => {
    if(e.target === ov){
      closeModal(ov.id);
    }
  });
});

/* =========================
   Phone mask: "DD 12345-6789"
========================= */
function formatPhone(value){
  const digits = value.replace(/\D/g, "").slice(0, 11); // 2 + 9
  if(digits.length <= 2) return digits;
  const ddd = digits.slice(0,2);
  const rest = digits.slice(2);
  if(rest.length <= 5) return `${ddd} ${rest}`;
  return `${ddd} ${rest.slice(0,5)}-${rest.slice(5,9)}`;
}

function bindPhoneMask(input){
  if(!input) return;
  input.addEventListener("input", () => {
    const pos = input.selectionStart;
    input.value = formatPhone(input.value);
    input.setSelectionRange(pos, pos);
  });
}

qsa('input[placeholder="DD 12345-6789"]').forEach(bindPhoneMask);

/* =========================
   Email validation (basic)
========================= */
function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function bindEmailValidation(form){
  if(!form) return;
  const emailInput = qs('input[type="email"]', form);
  if(!emailInput) return;

  emailInput.addEventListener("input", () => {
    emailInput.setCustomValidity("");
    if(emailInput.value && !isValidEmail(emailInput.value)){
      emailInput.setCustomValidity("Digite um email válido.");
    }
  });
}

bindEmailValidation(document.getElementById("leadForm"));
bindEmailValidation(document.getElementById("preCheckoutForm"));

/* =========================
   Google Forms submit + UX
========================= */
const leadForm = document.getElementById("leadForm");
const leadSuccess = document.getElementById("leadSuccess");

if(leadForm){
  leadForm.addEventListener("submit", () => {
    if(leadSuccess){
      setTimeout(() => {
        leadSuccess.style.display = "block";
      }, 500);
      setTimeout(() => {
        closeModal("leadModal");
        leadSuccess.style.display = "none";
        leadForm.reset();
      }, 2600);
    }
  });
}

const preForm = document.getElementById("preCheckoutForm");
if(preForm){
  preForm.addEventListener("submit", () => {
    // no “mini telinha”: não mostramos mensagem (mantém limpo)
    // redireciona após um tempo curto para dar chance do POST ocorrer
    setTimeout(() => {
      // coloque seu link real de checkout Hotmart aqui:
      const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/";
      window.location.href = HOTMART_CHECKOUT_URL;
    }, 700);
  });
}

/* =========================
   WhatsApp Button
========================= */
const whatsBtn = document.getElementById("whatsBtn");
if(whatsBtn){
  // ajuste o número:
  const phone = "5511999999999";
  whatsBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent("Olá! Quero saber mais sobre a Jornada Terapêutica.")}`;
}

/* =========================
   YouTube End -> open lead modal on first visit
   (uses YouTube Iframe API)
========================= */

let player = null;

function loadYouTubeAPI(){
  if(window.YT && window.YT.Player) return;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function(){
  const holder = document.getElementById("ytPlayer");
  if(!holder) return;

  const first = isFirstVisit();

  player = new YT.Player("ytPlayer", {
    height: "100%",
    width: "100%",
    videoId: "dQw4w9WgXcQ", // TROQUE PELO ID DO SEU VIDEO
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onStateChange: (e) => {
        if(!first) return;
        if(e.data === YT.PlayerState.ENDED){
          openModal("leadModal");
        }
      }
    }
  });
};

loadYouTubeAPI();
