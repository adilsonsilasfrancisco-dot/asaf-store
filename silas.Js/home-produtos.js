/**
 * ASAF STORE - PRODUTOS DA PÁGINA INICIAL
 *
 * @format
 */

(async function () {
  "use strict";

  const NOVA_COLECAO = [11, 12, 13, 14];
  const DESTAQUES = [1, 2, 5, 8];

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-AO") + " Kz";
  }

  /* =========================================================
     CARREGAR PRODUTOS
  ========================================================= */

  async function carregarProdutosHome() {
    // No GitHub Pages, carregar os produtos do JSON publicado.
    if (location.hostname.endsWith("github.io")) {
      const resposta = await fetch(new URL("produtos.json", document.baseURI), {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar produtos.json");
      }

      const dados = await resposta.json();
      return Array.isArray(dados) ? dados : [];
    }

    // Localmente, tentar primeiro o LocalStorage.
    try {
      const dadosLocais = JSON.parse(localStorage.getItem("produtos") || "[]");

      if (Array.isArray(dadosLocais) && dadosLocais.length > 0) {
        return dadosLocais;
      }
    } catch (erro) {
      console.warn("Não foi possível ler os produtos locais:", erro);
    }

    // Se não existirem produtos locais, utilizar o JSON.
    const resposta = await fetch(new URL("produtos.json", document.baseURI));

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar produtos.json");
    }

    const dados = await resposta.json();
    return Array.isArray(dados) ? dados : [];
  }

  /* =========================================================
     ENCONTRAR PRODUTO PELO ID
  ========================================================= */

  function encontrarProduto(produtos, id) {
    return produtos.find((produto) => Number(produto.id) === Number(id));
  }

  /* =========================================================
     ATUALIZAR IMAGEM
  ========================================================= */

  function atualizarImagem(cartao, produto) {
    const imagem = cartao.querySelector("img");

    if (!imagem) return;

    imagem.src = produto.imagem || "";
    imagem.alt = produto.nome || "Produto ASAF STORE";
    imagem.loading = "lazy";
  }

  /* =========================================================
     ATUALIZAR NOVA COLEÇÃO
  ========================================================= */

  function atualizarNovaColecao(produtos) {
    const container = document.querySelector(".colecao + .container");

    if (!container) return;

    const cartoes = container.querySelectorAll(".card");

    NOVA_COLECAO.forEach((id, indice) => {
      const cartao = cartoes[indice];
      const produto = encontrarProduto(produtos, id);

      if (!cartao || !produto) return;

      atualizarImagem(cartao, produto);

      cartao.dataset.productId = produto.id;

      cartao.setAttribute(
        "aria-label",
        produto.nome + " - " + formatarPreco(produto.preco),
      );
    });
  }

  /* =========================================================
     ATUALIZAR PRODUTOS EM DESTAQUE
  ========================================================= */

  function atualizarDestaques(produtos) {
    const cartoes = document.querySelectorAll(".destaques .cards .card3");

    DESTAQUES.forEach((id, indice) => {
      const cartao = cartoes[indice];
      const produto = encontrarProduto(produtos, id);

      if (!cartao || !produto) return;

      atualizarImagem(cartao, produto);

      const titulo = cartao.querySelector("h2");
      const descricao = cartao.querySelector("p");

      if (titulo) {
        titulo.textContent = produto.nome || "Produto ASAF STORE";
      }

      if (descricao) {
        descricao.textContent =
          (produto.descricao || produto.categoria || "Produto ASAF STORE") +
          " | " +
          formatarPreco(produto.preco);
      }

      cartao.dataset.productId = produto.id;
    });
  }

  /* =========================================================
     NAVEGAR PARA A PÁGINA DE PRODUTOS
  ========================================================= */

  window.irParaProduto = function (id) {
    localStorage.setItem("produto_destaque", String(id));

    window.location.href = new URL(
      "silas.html/Produtos.html",
      document.baseURI,
    ).href;
  };

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  try {
    const produtos = await carregarProdutosHome();

    atualizarNovaColecao(produtos);
    atualizarDestaques(produtos);

    console.log(
      "ASAF STORE: " +
        produtos.length +
        " produtos carregados na página inicial.",
    );
  } catch (erro) {
    console.error("Erro ao atualizar produtos da página inicial:", erro);
  }
})();
