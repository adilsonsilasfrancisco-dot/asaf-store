/** @format */
/**
 * Esconde o menu ao descer e mostra-o ao subir.
 * Só põe/tira a classe "nav-hidden" no <body>; o visual está no CSS.
 */
(function () {
  var LIMITE = 80; // só esconde depois de descer este tanto (px)
  var MIN = 6; // ignora movimentos muito pequenos (px)
  var ultimo = window.scrollY;
  var ocupado = false;

  function atualizar() {
    var y = window.scrollY;

    ocupado = false;

    if (Math.abs(y - ultimo) < MIN) return;

    if (y > ultimo && y > LIMITE) {
      document.body.classList.add("nav-hidden"); // a descer
    } else if (y < ultimo || y <= LIMITE) {
      document.body.classList.remove("nav-hidden"); // a subir
    }

    ultimo = y;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ocupado) {
        ocupado = true;
        requestAnimationFrame(atualizar);
      }
    },
    { passive: true },
  );
})();
