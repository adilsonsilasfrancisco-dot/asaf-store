
/** @format */

/**
 * ASAF STORE - ACESSÓRIOS
 * Carrega os produtos localmente ou através do produtos.json
 * no GitHub Pages.
 */

(function () {
  "use strict";

  var PRODUTOS_URL = "../produtos.json";
  var PAGINA_PRODUTOS = "Produtos.html";

  var TIPOS = [
    { id: "relogios", nome: "Relógios", chaves: ["relog"] },
    {
      id: "pulseiras",
      nome: "Pulseiras",
      chaves: ["pulseira", "bracelete"],
    },
    {
      id: "joias",
      nome: "Joias",
      chaves: ["joia", "anel", "colar", "brinco", "corrente"],
    },
    { id: "oculos", nome: "Óculos", chaves: ["oculos"] },
    { id: "cintos", nome: "Cintos", chaves: ["cinto"] },
    {
      id: "bolsas",
      nome: "Bolsas e mochilas",
      chaves: ["bolsa", "mochila", "carteira"],
    },
    {
      id: "chapeus",
      nome: "Bonés e cachecóis",
      chaves: ["bone", "chapeu", "cachecol"],
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

  function norm(t) {
    return String(t || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function ler(chave) {
    try {
      var v = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function temChave(texto, chaves) {
    return chaves.some(function (c) {
      return new RegExp("(^|[^a-z])" + c).test(texto);
    });
  }

  function tipoDe(p) {
    var texto = norm((p.nome || "") + " " + (p.categoria || ""));

    for (var i = 0; i < TIPOS.length; i++) {
      if (temChave(texto, TIPOS[i].chaves)) {
        return TIPOS[i];
      }
    }

    return null;
  }

  function eAcessorio(p) {
    var cat = norm(p.categoria);

    return (
      cat.indexOf("acessor") > -1 ||
      cat.indexOf("relog") > -1 ||
      !!tipoDe(p)
    );
  }

  /* Estado */
  var todos = [];
  var filtro = new URLSearchParams(location.search).get("tipo") || "todos";
  var busca = "";
  var avisoTimer;

  var publicado = location.hostname.endsWith("github.io");

  /*
   * Carregamento dos produtos:
   * Online: produtos.json
   * Local: localStorage
   */
  async function carregar() {
    try {
      var produtos = [];

      if (publicado) {
        var url = new URL(PRODUTOS_URL, document.baseURI);

        var resposta = await fetch(url, {
          cache: "no-store",
        });

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível carregar produtos.json. HTTP " +
              resposta.status,
          );
        }

        produtos = await resposta.json();
      } else {
        produtos = ler("produtos");
      }

      if (!Array.isArray(produtos)) {
        throw new Error("O catálogo não contém uma lista válida.");
      }

      todos = produtos
        .filter(eAcessorio)
        .reverse()
        .map(function (p) {
          var t = tipoDe(p);

          return Object.assign({}, p, {
            _tipoId: t ? t.id : "outros",
            _tipoNome: t ? t.nome : "Acessório",
          });
        });

      console.log(
        "ASAF STORE - Acessórios carregados:",
        todos.length,
        "produto(s)",
      );
    } catch (erro) {
      console.error("Erro ao carregar acessórios:", erro);
      todos = [];
    }

    desenharChips();
    desenhar();
  }

  /* Avisos */
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

  /* Contador do carrinho */
  function contador() {
    var elemento = $("contadorCarrinho");

    if (!elemento) return;

    var n = 0;

    ler("carrinho").forEach(function (p) {
      n += Number(p.quantidade || 0);
    });

    elemento.textContent = n;
  }

  /* Filtros */
  function desenharChips() {
    var existentes = {};

    todos.forEach(function (p) {
      existentes[p._tipoId] = p._tipoNome;
    });

    var botoes = [{ id: "todos", nome: "Todos" }];

    TIPOS.forEach(function (t) {
      if (existentes[t.id]) {
        botoes.push({
          id: t.id,
          nome: t.nome,
        });
      }
    });

    if (existentes.outros) {
      botoes.push({
        id: "outros",
        nome: "Outros",
      });
    }

    if (
      !botoes.some(function (b) {
        return b.id === filtro;
      })
    ) {
      filtro = "todos";
    }

    $("chips").innerHTML = botoes
      .map(function (b) {
        return (
          '<button type="button" data-tipo="' +
          b.id +
          '"' +
          (b.id === filtro ? ' class="ativo"' : "") +
          ">" +
          esc(b.nome) +
          "</button>"
        );
      })
      .join("");
  }

  function filtrados() {
    var q = norm(busca);

    return todos.filter(function (p) {
      var tipoOk = filtro === "todos" || p._tipoId === filtro;

      var buscaOk =
        !q ||
        norm(p.nome).indexOf(q) > -1 ||
        norm(p.descricao).indexOf(q) > -1;

      return tipoOk && buscaOk;
    });
  }

  /* Cartões dos produtos */
  function criarCard(p) {
    var est = Number(p.stock || 0);
    var esg = est <= 0;

    return (
      '<article class="card" data-id="' +
      esc(p.id) +
      '">' +
      '<div class="card-img">' +
      '<img src="' +
      esc(p.imagem) +
      '" alt="' +
      esc(p.nome) +
      '" loading="lazy" />' +
      '<span class="badge">' +
      esc(p._tipoNome) +
      "</span>" +
      "</div>" +
      '<div class="card-info">' +
      "<h3>" +
      esc(p.nome) +
      "</h3>" +
      '<p class="card-desc">' +
      esc(p.descricao || "Produto de qualidade ASAF STORE.") +
      "</p>" +
      '<div class="card-rodape">' +
      '<span class="preco">' +
      kz(p.preco) +
      "</span>" +
      '<span class="stock' +
      (esg ? " esgotado" : "") +
      '">' +
      (esg ? "Esgotado" : "Stock: " + est) +
      "</span>" +
      "</div>" +
      '<button type="button" class="btn-comprar" data-add="' +
      esc(p.id) +
      '"' +
      (esg ? " disabled" : "") +
      ">" +
      '<i class="fa-solid fa-cart-shopping"></i> ' +
      (esg ? "Produto Esgotado" : "Adicionar ao Carrinho") +
      "</button>" +
      "</div>" +
      "</article>"
    );
  }

  function desenhar() {
    var lista = filtrados();

    var grelha = $("listaAcessorios");
    var vazio = $("semProdutos");

    grelha.innerHTML = lista.map(criarCard).join("");

    if (!lista.length) {
      vazio.hidden = false;
      $("contagem").textContent = "";

      $("semTexto").textContent = todos.length
        ? "Tenta pesquisar outro nome ou escolher outro tipo."
        : "Ainda não há acessórios na loja. Verifica o catálogo de produtos.";

      return;
    }

    vazio.hidden = true;

    $("contagem").textContent =
      lista.length + (lista.length === 1 ? " produto" : " produtos");
  }

  /* Carrinho */
  function adicionar(id) {
    var p = todos.find(function (x) {
      return Number(x.id) === Number(id);
    });

    if (!p) return;

    var est = Number(p.stock || 0);

    if (est <= 0) {
      aviso("Este produto está esgotado.");
      return;
    }

    var carrinho = ler("carrinho");

    var ex = carrinho.find(function (x) {
      return Number(x.id) === Number(id);
    });

    if (ex) {
      if (Number(ex.quantidade) >= est) {
        aviso("Stock máximo atingido (" + est + ").");
        return;
      }

      ex.quantidade = Number(ex.quantidade) + 1;
    } else {
      var copia = Object.assign({}, p);

      delete copia._tipoId;
      delete copia._tipoNome;

      copia.quantidade = 1;

      carrinho.push(copia);
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    contador();
    aviso('"' + p.nome + '" adicionado ao carrinho!');
  }

  /* Eventos dos filtros */
  $("chips").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tipo]");

    if (!b) return;

    filtro = b.dataset.tipo;

    $("chips")
      .querySelectorAll("button")
      .forEach(function (x) {
        x.classList.toggle("ativo", x === b);
      });

    desenhar();
  });

  /* Pesquisa */
  $("pesquisa").addEventListener("input", function (e) {
    busca = e.target.value;
    desenhar();
  });

  /* Eventos dos cartões */
  $("listaAcessorios").addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");

    if (add) {
      adicionar(add.dataset.add);
      return;
    }

    var card = e.target.closest(".card");

    if (!card) return;

    var p = todos.find(function (x) {
      return String(x.id) === card.dataset.id;
    });

    localStorage.setItem(
      "produto_destaque",
      JSON.stringify({
        id: Number(card.dataset.id),
        imagem: p ? p.imagem : "",
      }),
    );

    location.href = PAGINA_PRODUTOS;
  });

  /* Actualizações feitas noutro separador */
  window.addEventListener("storage", function (e) {
    if (e.key === "produtos" && !publicado) {
      carregar();
    }

    if (e.key === "carrinho") {
      contador();
    }
  });

  /* Inicialização */
  contador();
  carregar();
})();
