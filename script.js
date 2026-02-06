(() => {
  // ====== CONFIG ======
  const HOTMART_URL = 'https://go.hotmart.com/T102181800G?dp=1';
  const YT_EMBED_URL = 'https://www.youtube-nocookie.com/embed/mumPZDYSX5g?rel=0&modestbranding=1&playsinline=1';

  // ====== HELPERS ======
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function openModal(id){
    const overlay = document.getElementById(id);
    if(!overlay) return;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    // Focus first input if exists
    const first = overlay.querySelector('input, textarea, select, button');
    if(first) setTimeout(() => first.focus(), 0);
  }

  function closeModal(id){
    const overlay = document.getElementById(id);
    if(!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');

    // If no other modal open, restore body scroll
    const anyOpen = $$('.modal-overlay.show').length > 0;
    if(!anyOpen) document.body.classList.remove('modal-open');
  }

  function goHotmart(){
    window.location.href = HOTMART_URL;
  }

  // ====== YOUTUBE EMBED (HERO) ======
  const yt = document.getElementById('ytPlayer');
  if(yt){
    yt.innerHTML = `
      <iframe
        src="${YT_EMBED_URL}"
        title="Vídeo da Jornada"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
  }

  // ====== HEADER MENU (MOBILE) ======
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if(hamburgerBtn && navLinks){
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    // close menu after clicking a link (mobile)
    $$('#navLinks a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // click outside closes menu
    document.addEventListener('click', (e) => {
      if(!navLinks.classList.contains('open')) return;
      const clickedInside = navLinks.contains(e.target) || hamburgerBtn.contains(e.target);
      if(!clickedInside) navLinks.classList.remove('open');
    });
  }

  // ====== BUTTON BEHAVIOR ======
  // Agora estes botões vão direto para o Hotmart
  ['openPreCheckoutBtn', 'openPreCheckoutBtn2', 'openLeadBtn'].forEach((id) => {
    const btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', goHotmart);
  });

  // "Quero entender se é para mim" abre o formulário (lead)
  const leadBtn = document.getElementById('openLead2Btn');
  if(leadBtn) leadBtn.addEventListener('click', () => openModal('leadModal'));

  // ====== MODAL CLOSE ======
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if(closeBtn){
      closeModal(closeBtn.getAttribute('data-close'));
      return;
    }

    // click on overlay (outside modal) closes
    const overlay = e.target.classList.contains('modal-overlay') ? e.target : null;
    if(overlay){
      closeModal(overlay.id);
    }
  });

  // ESC closes any open modal
  document.addEventListener('keydown', (e) => {
    if(e.key !== 'Escape') return;
    $$('.modal-overlay.show').forEach(o => closeModal(o.id));
  });

  // ====== FORMS: UX (SUCCESS) ======
  // Google Forms via hidden iframe doesn't allow reliable success callback.
  // We show a friendly message on submit + keep user on page.
  const leadForm = document.getElementById('leadForm');
  const leadSuccess = document.getElementById('leadSuccess');
  if(leadForm && leadSuccess){
    leadForm.addEventListener('submit', () => {
      setTimeout(() => {
        leadSuccess.style.display = 'block';
      }, 300);
    });
  }
})();// WhatsApp CTA (sem número): abre o WhatsApp com mensagem pronta
const whatsBtn = document.getElementById('whatsBtn');
if (whatsBtn && (!whatsBtn.getAttribute('href') || whatsBtn.getAttribute('href') === '#')) {
  const msg = encodeURIComponent('Quero saber mais sobre a Jornada Terapêutica.');
  whatsBtn.setAttribute('href', `https://wa.me/?text=${msg}`);
}


