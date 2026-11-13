/** @format */
/**
 * Ao descer, esconde o menu de cima e mostra a barra branca das categorias.
 * Faz o mesmo que o java.js faz na Loja.html (adiciona a classe "scrolled").
 */
(function () {
  var LIMITE = 80; // px de scroll para a barra branca aparecer

  function atualizar() {
    document.body.classList.toggle("scrolled", window.scrollY > LIMITE);
  }

  window.addEventListener("scroll", atualizar, { passive: true });
  atualizar();
})();