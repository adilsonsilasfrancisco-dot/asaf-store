/** @format */

(function () {
  "use strict";

  if (typeof Auth === "undefined") {
    console.error("ASAF: ficheiro auth.js não foi carregado.");
    return;
  }

  var s = Auth.sessao();

  if (!s) return;

  /* CAMINHOS COMPATÍVEIS COM LOCALHOST E GITHUB PAGES */
  var PRODUTOS_URL = new URL("Produtos.html", document.baseURI).href;
  var IMAGENS_URL = new URL("../img/", document.baseURI).href;

  function caminhoImagem(nome) {
    return new URL(nome, IMAGENS_URL).href;
  }

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

  /* SAUDAÇÃO */
  var h = new Date().getHours();

  if ($("saudacao")) {
    $("saudacao").textContent =
      h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite";
  }

  if ($("nome")) {
    $("nome").textContent = s.usuario || "";
  }

  /* CONTADOR DO CARRINHO */
  function contador() {
    var n = 0;

    ler("carrinho").forEach(function (p) {
      n += Number(p.quantidade || 0);
    });

    if ($("contadorCarrinho")) {
      $("contadorCarrinho").textContent = n;
    }
  }

  /* CARROSSEL */
  var SLIDES = [
    {
      img: "loro_piana.jfif",
      etiqueta: "Só para membros",
      titulo: "Bem-vindo à tua ASAF",
      texto: "Uma seleção pensada para quem já faz parte da casa.",
      link: PRODUTOS_URL,
      botao: "Ver produtos",
    },
    {
      img: "nike verde.jfif",
      etiqueta: "Acessórios",
      titulo: "Detalhes que fazem a diferença",
      texto: "Relógios, pulseiras e joias para completar o teu visual.",
      link: new URL("acessorios.html", document.baseURI).href,
      botao: "Ver acessórios",
    },
    {
      img: "nike vermelha.avif",
      etiqueta: "Cupão de membro",
      titulo: "15% só para ti",
      texto: "Usa o cupão ASAF15 no carrinho e poupa na tua compra.",
      link: new URL("carrinho.html", document.baseURI).href,
      botao: "Ir ao carrinho",
    },
    {
      img: "Zara.jpg",
      etiqueta: "Novidades",
      titulo: "Chegou o que é novo",
      texto: "Vê primeiro as últimas peças adicionadas à loja.",
      link: PRODUTOS_URL,
      botao: "Descobrir",
    },
  ];

  var doAdmin = ler("carrossel_membros").filter(function (x) {
    return x && x.ativo !== false && x.imagem;
  });

  if (doAdmin.length) {
    SLIDES = doAdmin.map(function (x) {
      return {
        img: x.imagem,
        etiqueta: "",
        titulo: x.titulo || "",
        texto: x.texto || "",
        link: x.link || "",
        botao: x.botao || "",
      };
    });
  }

  var slider = $("slider");
  var dots = $("dots");
  var atual = 0;
  var timer;

  if (slider && dots && SLIDES.length) {
    SLIDES.forEach(function (sl, i) {
      var d = document.createElement("div");

      d.className = "slide" + (i ? "" : " ativo");

      var imagem = /^data:image\//i.test(sl.img)
        ? sl.img
        : caminhoImagem(sl.img);

      d.style.backgroundImage =
        'url("' + String(imagem).replace(/"/g, "%22") + '")';

      d.innerHTML =
        '<div class="slide-texto">' +
        (sl.etiqueta ? "<span>" + esc(sl.etiqueta) + "</span>" : "") +
        "<h1>" +
        esc(sl.titulo) +
        "</h1><p>" +
        esc(sl.texto) +
        "</p>" +
        (sl.link && sl.botao
          ? '<a class="btn" href="' +
            esc(sl.link) +
            '">' +
            esc(sl.botao) +
            "</a>"
          : "") +
        "</div>";

      var anterior = $("anterior");

      if (anterior) {
        slider.insertBefore(d, anterior);
      } else {
        slider.appendChild(d);
      }
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

    if ($("anterior")) {
      $("anterior").addEventListener("click", function () {
        ir(atual - 1);
        auto();
      });
    }

    if ($("seguinte")) {
      $("seguinte").addEventListener("click", function () {
        ir(atual + 1);
        auto();
      });
    }

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
  }

  /* CUPÃO */
  if ($("copiar")) {
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
  }

  /* PRODUTOS */
  var produtos = [];
  var grid = $("destaques");
  var chips = $("chips");
  var filtro = "todos";

  if (!grid || !chips) {
    console.error("ASAF: elementos de produtos não encontrados.");
    contador();
    return;
  }

  var mq = window.matchMedia("(max-width: 720px)");
  var GRANDES = 3;
  var FILA = 6;

  var MAX_MOBILE = 15;

  var DESK_A = 3;
  var DESK_B = 6;

  var MAX_DESKTOP = 15;

  function cartao(p) {
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
      '" loading="lazy" draggable="false" />' +
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
  }

  function linha(lista, tipo) {
    if (!lista.length) return "";

    var cards = lista.map(cartao).join("");

    if (tipo === "b") {
      return (
        '<div class="linha linha-b">' +
        '<div class="linha-scroll">' +
        cards +
        "</div></div>"
      );
    }

    return '<div class="linha linha-' + tipo + '">' + cards + "</div>";
  }

  function desenhar() {
    if (!produtos.length) {
      grid.innerHTML =
        '<div class="vazio">Ainda não há produtos na loja.</div>';
      return;
    }

    var todos = produtos.filter(function (p) {
      return filtro === "todos" || p.categoria === filtro;
    });

    if (!todos.length) {
      grid.innerHTML =
        '<div class="vazio">Nenhum produto nesta categoria.</div>';
      return;
    }

    if (!mq.matches) {
      var d = todos.slice(0, MAX_DESKTOP);
      var k = 0;
      var out = "";

      var pegar = function (n) {
        var r = d.slice(k, k + n);
        k += n;
        return r;
      };

      while (k < d.length) {
        out += pegar(1).map(cartao).join("");
        out += linha(pegar(DESK_A), "a");
        out += pegar(1).map(cartao).join("");
        out += linha(pegar(DESK_B), "b");
      }

      grid.innerHTML = out;
      return;
    }

    var lista = todos.slice(0, MAX_MOBILE);
    var bloco = GRANDES + FILA;
    var html = "";

    for (var i = 0; i < lista.length; i += bloco) {
      var grandes = lista.slice(i, i + GRANDES);
      var fila = lista.slice(i + GRANDES, i + bloco);

      html += grandes.map(cartao).join("");

      if (fila.length) {
        html +=
          '<div class="fila">' +
          '<h3 class="fila-titulo">Mais para ti</h3>' +
          '<div class="fila-scroll">' +
          fila.map(cartao).join("") +
          "</div></div>";
      }
    }

    grid.innerHTML = html;
  }

  function prepararCategorias() {
    var cats = [];

    produtos.forEach(function (p) {
      if (p.categoria && cats.indexOf(p.categoria) < 0) {
        cats.push(p.categoria);
      }
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

    desenhar();
  }

  if (mq.addEventListener) {
    mq.addEventListener("change", desenhar);
  } else if (mq.addListener) {
    mq.addListener(desenhar);
  }

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

  /* MODAL */
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

  /* DESLIZAMENTO HORIZONTAL */
  grid.addEventListener(
    "wheel",
    function (e) {
      var sc = e.target.closest(".linha-scroll");

      if (!sc) return;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        sc.scrollLeft += e.deltaX;
      }
    },
    { passive: false },
  );

  var arrasto = null;
  var arrastou = false;

  grid.addEventListener("mousedown", function (e) {
    var sc = e.target.closest(".linha-scroll");

    if (!sc || e.button !== 0) return;

    arrasto = {
      sc: sc,
      x: e.clientX,
      left: sc.scrollLeft,
    };

    arrastou = false;
  });

  window.addEventListener("mousemove", function (e) {
    if (!arrasto) return;

    var dx = e.clientX - arrasto.x;

    if (Math.abs(dx) > 5) {
      arrastou = true;
      arrasto.sc.classList.add("arrastando");
    }

    if (arrastou) {
      arrasto.sc.scrollLeft = arrasto.left - dx;
    }
  });

  window.addEventListener("mouseup", function () {
    if (!arrasto) return;

    arrasto.sc.classList.remove("arrastando");
    arrasto = null;
  });

  grid.addEventListener("click", function (e) {
    if (arrastou) {
      arrastou = false;
      return;
    }

    var add = e.target.closest("[data-add]");

    if (add) {
      adicionar(add.dataset.add);
      return;
    }

    var card = e.target.closest(".item");

    if (card) abrirModal(card.dataset.id);
  });

  /* CARREGAMENTO DOS PRODUTOS */
  async function carregarProdutos() {
    var locais = ler("produtos");
    var publicado = location.hostname.endsWith("github.io");

    if (!publicado && locais.length) {
      produtos = locais.slice().reverse();
      prepararCategorias();
      contador();
      return;
    }

    try {
      var resposta = await fetch(
        new URL("../produtos.json", document.baseURI),
        { cache: "no-store" },
      );

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar produtos.json.");
      }

      var dados = await resposta.json();

      produtos = Array.isArray(dados) ? dados.slice().reverse() : [];

      prepararCategorias();
    } catch (erro) {
      console.error("ASAF: erro ao carregar produtos:", erro);

      produtos = [];

      prepararCategorias();

      aviso("Não foi possível carregar os produtos.");
    }

    contador();
  }

  carregarProdutos();
})();
