/** @format */

(function () {
  var s = Auth.sessao();

  if (!s) return;

  var PRODUTOS_URL = "/silas.html/produtos.html";

  /* ── CARROSSEL DE MEMBROS ──
     Estas imagens NÃO estão no carrossel da Loja.html.
     Para usar as tuas, copia fotos horizontais para /img/ e troca os caminhos. */
  var SLIDES = [
    {
      img: "/img/pexels-andrea-prochilo-3062027-36180515.jpg",
      etiqueta: "Só para membros",
      titulo: "Bem-vindo à tua ASAF",
      texto: "Uma seleção pensada para quem já faz parte da casa.",
      link: PRODUTOS_URL,
      botao: "Ver produtos",
    },
    {
      img: "/img/pexels-elena-kravets-1601294419-34150928.jpg",
      etiqueta: "Acessórios",
      titulo: "Detalhes que fazem a diferença",
      texto: "Relógios, pulseiras e joias para completar o teu visual.",
      link: "/silas.html/acessorios.html",
      botao: "Ver acessórios",
    },
    {
      img: "/img/Men's Solid Color Front Closure Pocket Long Sleeve Jacket, Autumn_Winter.jfif",
      etiqueta: "Cupão de membro",
      titulo: "15% só para ti",
      texto: "Usa o cupão ASAF15 no carrinho e poupa na tua compra.",
      link: "/silas.html/carrinho.html",
      botao: "Ir ao carrinho",
    },
    {
      img: "/img/Dresses for Women Cherry Print Ruched Bust Puff Sleeve Dress.jfif",
      etiqueta: "Novidades",
      titulo: "Chegou o que é novo",
      texto: "Vê primeiro as últimas peças adicionadas à loja.",
      link: PRODUTOS_URL,
      botao: "Descobrir",
    },
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
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

  var avisoTimer;

  function aviso(texto) {
    var t = $("toast");

    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }

    t.textContent = texto;
    t.classList.add("show");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 2600);
  }

  function contador() {
    var n = 0;

    ler("carrinho").forEach(function (p) {
      n += Number(p.quantidade || 0);
    });
    $("contadorCarrinho").textContent = n;
  }

  /* ── Saudação ── */
  var h = new Date().getHours();

  $("saudacao").textContent =
    h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite";
  $("nome").textContent = s.usuario;

  /* ── Carrossel ── */
  var slider = $("slider");
  var dots = $("dots");
  var atual = 0;
  var timer;

  SLIDES.forEach(function (sl, i) {
    var d = document.createElement("div");

    d.className = "slide" + (i ? "" : " ativo");
    d.style.backgroundImage = 'url("' + sl.img + '")';
    d.innerHTML =
      '<div class="slide-texto"><span>' +
      esc(sl.etiqueta) +
      "</span><h1>" +
      esc(sl.titulo) +
      "</h1><p>" +
      esc(sl.texto) +
      '</p><a class="btn" href="' +
      sl.link +
      '">' +
      esc(sl.botao) +
      "</a></div>";

    slider.insertBefore(d, $("anterior"));
  });

  dots.innerHTML = SLIDES.map(function (sl, i) {
    return (
      '<button type="button" aria-label="Slide ' +
      (i + 1) +
      '"' +
      (i ? "" : ' class="ativo"') +
      "></button>"
    );
  }).join("");

  var slides = slider.querySelectorAll(".slide");
  var pontos = dots.querySelectorAll("button");

  function ir(i) {
    atual = (i + slides.length) % slides.length;

    slides.forEach(function (x, k) {
      x.classList.toggle("ativo", k === atual);
    });
    pontos.forEach(function (x, k) {
      x.classList.toggle("ativo", k === atual);
    });
  }

  function auto() {
    clearInterval(timer);
    timer = setInterval(function () {
      ir(atual + 1);
    }, 5500);
  }

  $("anterior").addEventListener("click", function () {
    ir(atual - 1);
    auto();
  });

  $("seguinte").addEventListener("click", function () {
    ir(atual + 1);
    auto();
  });

  pontos.forEach(function (b, k) {
    b.addEventListener("click", function () {
      ir(k);
      auto();
    });
  });

  var x0 = 0;

  slider.addEventListener(
    "touchstart",
    function (e) {
      x0 = e.touches[0].clientX;
    },
    { passive: true },
  );

  slider.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - x0;

    if (Math.abs(dx) > 40) {
      ir(atual + (dx < 0 ? 1 : -1));
      auto();
    }
  });

  slider.addEventListener("mouseenter", function () {
    clearInterval(timer);
  });
  slider.addEventListener("mouseleave", auto);
  auto();

  /* ── Cupão ── */
  $("copiar").addEventListener("click", function () {
    var cod = "ASAF15";

    if (navigator.clipboard) {
      navigator.clipboard.writeText(cod).then(
        function () {
          aviso("Cupão " + cod + " copiado!");
        },
        function () {
          aviso("Cupão: " + cod);
        },
      );
    } else {
      aviso("Cupão: " + cod);
    }
  });

  /* ── Destaques (produtos reais, os mais recentes primeiro) ── */
  var produtos = ler("produtos").slice().reverse();
  var grid = $("destaques");
  var chips = $("chips");
  var filtro = "todos";

  function desenhar() {
    if (!produtos.length) {
      grid.innerHTML =
        '<div class="vazio">Ainda não há produtos na loja.</div>';
      return;
    }

    var lista = produtos
      .filter(function (p) {
        return filtro === "todos" || p.categoria === filtro;
      })
      .slice(0, 8);

    if (!lista.length) {
      grid.innerHTML =
        '<div class="vazio">Nenhum produto nesta categoria.</div>';
      return;
    }

    grid.innerHTML = lista
      .map(function (p) {
        var est = Number(p.stock || 0);
        var esg = est <= 0;

        return (
          '<article class="item" data-id="' +
          esc(p.id) +
          '">' +
          '<img src="' +
          esc(p.imagem) +
          '" alt="' +
          esc(p.nome) +
          '" loading="lazy" />' +
          '<div class="item-info">' +
          "<small>" +
          esc(p.categoria) +
          "</small>" +
          "<b>" +
          esc(p.nome) +
          "</b>" +
          '<div class="item-rodape"><span class="item-preco">' +
          kz(p.preco) +
          "</span>" +
          '<span class="item-stock' +
          (esg ? " esgotado" : "") +
          '">' +
          (esg ? "Esgotado" : "Stock: " + est) +
          "</span></div>" +
          '<button type="button" class="btn-comprar" data-add="' +
          esc(p.id) +
          '"' +
          (esg ? " disabled" : "") +
          ">" +
          '<i class="fa-solid fa-cart-shopping"></i> ' +
          (esg ? "Produto Esgotado" : "Adicionar ao Carrinho") +
          "</button></div></article>"
        );
      })
      .join("");
  }

  var cats = [];

  produtos.forEach(function (p) {
    if (p.categoria && cats.indexOf(p.categoria) < 0) cats.push(p.categoria);
  });

  chips.innerHTML = ["todos"]
    .concat(cats)
    .map(function (c) {
      return (
        '<button type="button" data-cat="' +
        esc(c) +
        '"' +
        (c === "todos" ? ' class="ativo"' : "") +
        ">" +
        (c === "todos" ? "Todos" : esc(c)) +
        "</button>"
      );
    })
    .join("");

  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");

    if (!b) return;

    filtro = b.dataset.cat;
    chips.querySelectorAll("button").forEach(function (x) {
      x.classList.toggle("ativo", x === b);
    });
    desenhar();
  });

  function adicionar(id) {
    var p = produtos.find(function (x) {
      return Number(x.id) === Number(id);
    });

    if (!p) return;

    var est = Number(p.stock || 0);

    if (est <= 0) {
      aviso("Este produto está esgotado.");
      return;
    }

    var c = ler("carrinho");
    var ex = c.find(function (x) {
      return Number(x.id) === Number(id);
    });

    if (ex) {
      if (Number(ex.quantidade) >= est) {
        aviso("Stock máximo atingido (" + est + ").");
        return;
      }
      ex.quantidade = Number(ex.quantidade) + 1;
    } else {
      c.push(Object.assign({}, p, { quantidade: 1 }));
    }

    localStorage.setItem("carrinho", JSON.stringify(c));
    contador();
    aviso('"' + p.nome + '" adicionado ao carrinho!');
  }

  /* ── Modal do produto (abre nesta mesma página) ── */
  function fecharModal() {
    var m = $("modalProduto");

    if (!m) return;

    m.classList.remove("aberto");
    document.body.style.overflow = "";
    setTimeout(function () {
      m.remove();
    }, 300);
  }

  function abrirModal(id) {
    var p = produtos.find(function (x) {
      return Number(x.id) === Number(id);
    });

    if (!p) return;

    var est = Number(p.stock || 0);
    var esg = est <= 0;
    var antigo = $("modalProduto");

    if (antigo) antigo.remove();

    var m = document.createElement("div");

    m.id = "modalProduto";
    m.className = "modal";
    m.innerHTML =
      '<div class="modal-fundo" data-fechar></div>' +
      '<div class="modal-caixa" role="dialog" aria-modal="true" aria-label="' +
      esc(p.nome) +
      '">' +
      '<button type="button" class="modal-fechar" data-fechar aria-label="Fechar">&#10005;</button>' +
      '<div class="modal-img"><img src="' +
      esc(p.imagem) +
      '" alt="' +
      esc(p.nome) +
      '" /></div>' +
      '<div class="modal-info">' +
      '<span class="modal-cat">' +
      esc(p.categoria) +
      "</span>" +
      "<h2>" +
      esc(p.nome) +
      "</h2>" +
      '<p class="modal-desc">' +
      esc(p.descricao || "Produto de qualidade ASAF STORE.") +
      "</p>" +
      '<div class="modal-preco">' +
      kz(p.preco) +
      "</div>" +
      '<div class="modal-stock' +
      (esg ? " esgotado" : "") +
      '">' +
      (esg ? "Produto esgotado" : "Em stock: " + est + " unidades") +
      "</div>" +
      '<button type="button" class="btn-comprar" data-add-modal="' +
      esc(p.id) +
      '"' +
      (esg ? " disabled" : "") +
      ">" +
      '<i class="fa-solid fa-cart-shopping"></i> ' +
      (esg ? "Produto Esgotado" : "Adicionar ao Carrinho") +
      "</button>" +
      "</div></div>";

    document.body.appendChild(m);
    document.body.style.overflow = "hidden";

    m.addEventListener("click", function (e) {
      if (e.target.closest("[data-fechar]")) {
        fecharModal();
        return;
      }

      var add = e.target.closest("[data-add-modal]");

      if (add) {
        adicionar(add.dataset.addModal);
        fecharModal();
      }
    });

    setTimeout(function () {
      m.classList.add("aberto");
    }, 10);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharModal();
  });

  grid.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");

    if (add) {
      adicionar(add.dataset.add);
      return;
    }

    var card = e.target.closest(".item");

    if (card) abrirModal(card.dataset.id);
  });

  desenhar();
  contador();
})();
