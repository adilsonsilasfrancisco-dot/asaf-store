/** @format */

(function () {
  var s = Auth.sessao();

  if (!s) return;

  var LOJA_PRODUTOS = "/silas.html/produtos.html";

  function $(id) {
    return document.getElementById(id);
  }

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function kz(v) {
    return Number(v || 0).toLocaleString("pt-AO") + " Kz";
  }

  function ler(chave) {
    try {
      var v = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  /* ── Saudação e data ── */
  var h = new Date().getHours();

  $("saudacao").textContent = h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite";
  $("nomeUsuario").textContent = s.usuario;
  $("dataHoje").textContent = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* ── Dados da conta ── */
  var conta = ler("usuarios").find(function (u) {
    return u.id === s.id;
  });

  $("resDesde").textContent =
    conta && conta.criadoEm
      ? new Date(conta.criadoEm).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })
      : "—";
  $("resEmail").textContent = s.email || "";

  /* ── Carrinho ── */
  var carrinho = ler("carrinho");
  var itens = 0;
  var total = 0;

  carrinho.forEach(function (p) {
    itens += Number(p.quantidade || 0);
    total += Number(p.preco || 0) * Number(p.quantidade || 0);
  });

  $("resItens").textContent = itens;
  $("resTotal").textContent = kz(total);
  $("contadorCarrinho").textContent = itens;

  var lista = $("carrinhoLista");

  if (!carrinho.length) {
    lista.innerHTML =
      '<div class="vazio">O teu carrinho está vazio. <a href="' +
      LOJA_PRODUTOS +
      '">Ver produtos</a></div>';
  } else {
    lista.innerHTML = carrinho
      .slice(0, 3)
      .map(function (p) {
        return (
          '<div class="linha"><img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + '" />' +
          "<div><b>" + esc(p.nome) + "</b><small>" + Number(p.quantidade || 0) + " × " + kz(p.preco) + "</small></div>" +
          "<strong>" + kz(Number(p.preco || 0) * Number(p.quantidade || 0)) + "</strong></div>"
        );
      })
      .join("");

    if (carrinho.length > 3) {
      lista.innerHTML += '<p class="mais">+ ' + (carrinho.length - 3) + " produto(s) no carrinho</p>";
    }
  }

  /* ── Novidades ── */
  var produtos = ler("produtos");
  var novidades = $("novidades");

  $("resProdutos").textContent = produtos.length;

  if (!produtos.length) {
    novidades.innerHTML = '<div class="vazio">Ainda não há produtos na loja.</div>';
  } else {
    novidades.innerHTML = produtos
      .slice(-4)
      .reverse()
      .map(function (p) {
        return (
          '<article class="item" data-id="' + esc(p.id) + '">' +
          '<img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + '" loading="lazy" />' +
          "<div><b>" + esc(p.nome) + "</b><span>" + kz(p.preco) + "</span></div></article>"
        );
      })
      .join("");
  }

  /* clicar num produto abre o modal na página de produtos */
  novidades.addEventListener("click", function (e) {
    var card = e.target.closest(".item");

    if (!card) return;

    localStorage.setItem(
      "produto_destaque",
      JSON.stringify({ id: Number(card.dataset.id), imagem: "" }),
    );
    location.href = LOJA_PRODUTOS;
  });

  /* ── Sair ── */
  $("btnSair").addEventListener("click", Auth.sair);
})();