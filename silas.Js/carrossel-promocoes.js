/** @format */

/* =========================================================
   CARROSSEL DE PROMOÇÕES
========================================================= */

(function () {
  "use strict";

  const cards = document.querySelectorAll(".card1");
  const track = document.querySelector(".track");

  if (!cards.length || !track) return;

  let current = 0;
  let autoPlay;
  let scrollFrame;

  const isMobile = () => window.innerWidth <= 768;

  /* =========================================================
     CARTÃO ATIVO
  ========================================================= */

  function setActive(index, centralizar = false) {
    if (index < 0 || index >= cards.length) return;

    current = index;

    cards.forEach(function (card, i) {
      card.classList.toggle("active", i === current);
    });

    if (centralizar && isMobile()) {
      requestAnimationFrame(function () {
        const card = cards[current];
        const trackRect = track.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        const cardCenter =
          cardRect.left -
          trackRect.left +
          track.scrollLeft +
          cardRect.width / 2;

        const scrollPosition = cardCenter - track.clientWidth / 2;

        track.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      });
    }
  }

  /* =========================================================
     IDENTIFICAR O CARTÃO MAIS PRÓXIMO DO CENTRO
  ========================================================= */

  function updateActiveFromScroll() {
    if (!isMobile()) return;

    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(function () {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + track.clientWidth / 2;

      let closestIndex = 0;
      let smallestDistance = Infinity;

      cards.forEach(function (card, index) {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;

        const distance = Math.abs(center - cardCenter);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      setActive(closestIndex);
    });
  }

  /* =========================================================
     AUTOPLAY
  ========================================================= */

  function startAutoPlay() {
    clearInterval(autoPlay);

    autoPlay = setInterval(function () {
      const nextIndex = (current + 1) % cards.length;
      setActive(nextIndex, true);
    }, 3000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlay);
  }

  /* =========================================================
     COMPUTADOR: PASSAR O RATO
  ========================================================= */

  cards.forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      if (current !== index) {
        setActive(index);
        startAutoPlay();
      }
    });
  });

  /* =========================================================
     TELEMÓVEL: DETETAR O SCROLL HORIZONTAL
  ========================================================= */

  track.addEventListener("scroll", updateActiveFromScroll, {
    passive: true,
  });

  track.addEventListener("touchstart", stopAutoPlay, {
    passive: true,
  });

  track.addEventListener("touchend", startAutoPlay, {
    passive: true,
  });

  /* =========================================================
     BOTÃO SEGUINTE
  ========================================================= */

  const next = document.getElementById("next");

  if (next) {
    next.addEventListener("click", function () {
      const nextIndex = (current + 1) % cards.length;

      setActive(nextIndex, true);
      startAutoPlay();
    });
  }

  /* =========================================================
     BOTÃO ANTERIOR
  ========================================================= */

  const prev = document.getElementById("prev");

  if (prev) {
    prev.addEventListener("click", function () {
      const prevIndex = (current - 1 + cards.length) % cards.length;

      setActive(prevIndex, true);
      startAutoPlay();
    });
  }

  /* =========================================================
     REDIMENSIONAMENTO DA JANELA
  ========================================================= */

  window.addEventListener("resize", function () {
    setActive(current, isMobile());
  });

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  setActive(0, true);
  startAutoPlay();
})();
