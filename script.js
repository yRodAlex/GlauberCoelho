    // Highlight do menu conforme rolagem (IntersectionObserver)
    (function () {
      const links = Array.from(document.querySelectorAll('#navlinks a[data-target]'));
      const sections = links
        .map(a => document.getElementById(a.dataset.target))
        .filter(Boolean);

      if (!('IntersectionObserver' in window) || sections.length === 0) return;

      const setActive = (id) => {
        links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
      };

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

    // Modal + envio para Google Forms usando os "entry.*"
    (function () {
      // ✅ seu Form ID (mesmo do embed)
      const FORM_ID = "1FAIpQLSc343T86qOwMwLlOx4PgyKtW4hqPOBp6NPW2Hz8oXrdYvGw7g";
      const FORM_ACTION = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

      const modal = document.getElementById('leadModal');
      const closeBtn = document.getElementById('closeLeadModal');
      const cancelBtn = document.getElementById('cancelLeadBtn');
      const form = document.getElementById('leadForm');
      const successMsg = document.getElementById('successMsg');
      const errorMsg = document.getElementById('leadError');
      const submitBtn = document.getElementById('submitLeadBtn');

      function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // reset visual (pra toda abertura ficar "limpa")
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        submitBtn.disabled = false;
      }

      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      // fecha
      closeBtn.addEventListener('click', closeModal);
      cancelBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });

      // expõe pra usar nos botões
      window.openLeadModal = openModal;

      // submit
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";

        try {
          const fd = new FormData(form);

          // Envio para Google Forms (no-cors, pois o Google bloqueia leitura de resposta)
          await fetch(FORM_ACTION, {
            method: "POST",
            mode: "no-cors",
            body: fd
          });

          // Se chegou aqui, consideramos sucesso (no-cors não dá pra ler status)
          form.reset();
          successMsg.style.display = 'block';
        } catch (err) {
          errorMsg.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    })();

    // Propaga UTMs/params da URL para links do Hotmart (pay.hotmart.com) automaticamente
    (function () {
      const params = new URLSearchParams(window.location.search);
      if ([...params.keys()].length === 0) return;

      function isHotmart(url) {
        try { return new URL(url, window.location.href).hostname.includes('hotmart'); }
        catch { return false; }
      }

      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (!href.includes('hotmart') && !href.includes('pay.hotmart.com')) return;
        if (!isHotmart(href)) return;

        const u = new URL(href, window.location.href);
        params.forEach((v, k) => {
          if (!u.searchParams.has(k)) u.searchParams.set(k, v);
        });
        a.setAttribute('href', u.toString());
      });
    })();

    /**
     * HOTMART CHECKOUT
     * 1) Troque HOTMART_CHECKOUT_BASE pela URL do seu checkout Hotmart (ex.: https://pay.hotmart.com/XXXXX)
     * 2) Opcional: se você usa parâmetros específicos, adicione aqui.
     *
     * Este script preserva UTMs da URL (utm_source, utm_medium, utm_campaign, utm_content, utm_term)
     * e repassa para o checkout via querystring.
     */
    (function () {
      const HOTMART_CHECKOUT_BASE = "https://pay.hotmart.com/SEU_CHECKOUT_AQUI";

      const UTM_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
      const qs = new URLSearchParams(window.location.search);

      function withUTM(url) {
        try {
          const u = new URL(url);
          UTM_KEYS.forEach(k => {
            const v = qs.get(k);
            if (v && !u.searchParams.get(k)) u.searchParams.set(k, v);
          });
          return u.toString();
        } catch (e) {
          // Se não for URL absoluta, retorna como veio
          return url;
        }
      }

      function goCheckout(customUrl) {
        const target = customUrl || HOTMART_CHECKOUT_BASE;
        window.location.href = withUTM(target);
      }

      // Bind automático: qualquer elemento com data-hotmart-checkout abre o checkout
      document.addEventListener("click", (e) => {
        const el = e.target.closest("[data-hotmart-checkout]");
        if (!el) return;
        e.preventDefault();
        const customUrl = el.getAttribute("data-hotmart-checkout-url") || null;
        goCheckout(customUrl);
      });

      // Exponha para uso opcional em onclick=""
      window.goHotmartCheckout = goCheckout;
    })();

    // YouTube API: abre o formulário ao finalizar o vídeo (somente na 1ª visita)
    (function () {
      const STORAGE_KEY = 'lp_jornada_form_after_video_shown_v1';

      function alreadyShown() {
        try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
      }
      function markShown() {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
      }

      let player;

      // Callback global exigido pela API do YouTube
      window.onYouTubeIframeAPIReady = function () {
        // Se já mostramos o modal nesta 1ª visita (ou visitas anteriores), não inicializa nada
        // (evita abrir de novo ao final do vídeo)
        player = new YT.Player('ytplayer', {
          events: { 'onStateChange': onPlayerStateChange }
        });
      };

      function onPlayerStateChange(event) {
        // 0 = vídeo terminou
        if (event.data === YT.PlayerState.ENDED) {
          if (!alreadyShown() && typeof window.openLeadModal === 'function') {
            window.openLeadModal();
            markShown();
          }
        }
      }
    })();