/**
 * ==========================================================
 *              ASAF STORE - PRODUTOS
 * ==========================================================
 *
 * - Lê produtos do LocalStorage
 * - Organiza por categorias
 * - Gera cards automaticamente
 * - Clique no card abre o modal de detalhes
 * - Integra com o carrinho
 * - Pesquisa e filtra produtos
 *
 * @format
 */

/* ==========================================================
   LOCAL STORAGE
========================================================== */

async function carregarProdutos() {
  // No ambiente local, tentar primeiro o LocalStorage
  if (!location.hostname.endsWith("github.io")) {
    try {
      const dados = localStorage.getItem("produtos");

      if (dados) {
        const lista = JSON.parse(dados);

        if (Array.isArray(lista) && lista.length > 0) {
          return lista;
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar produtos locais:", erro);
    }
  }

  // Se não houver produtos locais, carregar o JSON
  try {
    const urlProdutos = new URL("../produtos.json", document.baseURI);

    const resposta = await fetch(urlProdutos, {
      cache: "no-store",
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar produtos.json");
    }

    const lista = await resposta.json();

    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    return [];
  }
}

/* ==========================================================
   PRODUTOS
========================================================== */

let produtos = [];

/* ==========================================================
   ELEMENTOS
========================================================== */

const listaRelogios = document.getElementById("listaRelogios");
const listaTenis = document.getElementById("listaTenis");
const listaVestuario = document.getElementById("listaVestuario");
const listaAcessorios = document.getElementById("listaAcessorios");
const listaOutros = document.getElementById("listaOutros");
const secaoOutros = document.getElementById("secaoOutros");
const campoPesquisa = document.getElementById("pesquisaProduto");
const filtroCategoria = document.getElementById("filtroCategoria");
const semProdutos = document.getElementById("semProdutos");
const contadorCarrinho = document.getElementById("contadorCarrinho");

/* ==========================================================
   FORMATAR PREÇO
========================================================== */

function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-AO") + " Kz";
}

/* ==========================================================
   NORMALIZAR TEXTO
========================================================== */

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/* ==========================================================
   IDENTIFICAR CATEGORIA
========================================================== */

function identificarCategoria(categoria) {
  const cat = normalizarTexto(categoria);

  if (cat.includes("relog")) {
    return "relogios";
  }

  if (
    cat.includes("tenis") ||
    cat.includes("sapato") ||
    cat.includes("calcado")
  ) {
    return "tenis";
  }

  if (
    cat.includes("vestuario") ||
    cat.includes("roupa") ||
    cat.includes("camisa") ||
    cat.includes("camiseta") ||
    cat.includes("calca") ||
    cat.includes("vestido")
  ) {
    return "vestuario";
  }

  if (
    cat.includes("acessorio") ||
    cat.includes("oculos") ||
    cat.includes("bolsa") ||
    cat.includes("bone") ||
    cat.includes("cachecol") ||
    cat.includes("mochila")
  ) {
    return "acessorios";
  }

  return "outros";
}

/* ==========================================================
   CRIAR CARD
   - O card inteiro abre o modal
   - O botão do carrinho usa stopPropagation para não abrir
========================================================== */

function criarCard(produto) {
  const estoque = Number(produto.stock || 0);

  const indisponivel = estoque <= 0;

  return `

    <article
      class="produto-card"
      style="cursor:pointer"
      onclick="abrirModalProduto(${produto.id})"
    >

      <!-- BADGE -->

      <div class="produto-badge">

        ${produto.categoria || "Produto"}

      </div>


          <!-- IMAGEM -->

      <div class="produto-imagem">
       <img src="${produto.imagem || ""}" alt="${produto.nome}" />
      </div>


      <!-- INFORMAÇÕES -->

      <div class="produto-info">

        <h3 class="produto-nome">

          ${produto.nome || "Produto sem nome"}

        </h3>


        <p class="produto-descricao">

          ${produto.descricao || "Produto de qualidade ASAF STORE."}

        </p>


        <!-- AVALIAÇÃO -->

        <div class="produto-estrelas">

          ★★★★★

          <span>(5.0)</span>

        </div>


        <!-- PREÇO / STOCK -->

        <div class="produto-footer">

          <div class="produto-preco">

            ${formatarPreco(produto.preco)}

          </div>


          <div class="produto-stock ${indisponivel ? "esgotado" : ""}">

            ${indisponivel ? "Esgotado" : "Stock: " + estoque}

          </div>

        </div>


        <!-- BOTÃO -->

        <button
          class="btn-comprar"
          onclick="event.stopPropagation(); adicionarCarrinho(${produto.id})"
          ${indisponivel ? "disabled" : ""}
        >

          <i class="fa-solid fa-cart-shopping"></i>

          ${indisponivel ? "Produto Esgotado" : "Adicionar ao Carrinho"}

        </button>

      </div>

    </article>

  `;
}

/* ==========================================================
   MOSTRAR PRODUTOS
========================================================== */

function mostrarProdutos(lista = produtos) {
  if (listaRelogios) listaRelogios.innerHTML = "";
  if (listaTenis) listaTenis.innerHTML = "";
  if (listaVestuario) listaVestuario.innerHTML = "";
  if (listaAcessorios) listaAcessorios.innerHTML = "";
  if (listaOutros) listaOutros.innerHTML = "";

  if (lista.length === 0) {
    if (semProdutos) {
      semProdutos.style.display = "block";
    }

    esconderSecoesVazias();

    return;
  }

  if (semProdutos) {
    semProdutos.style.display = "none";
  }

  lista.forEach((produto) => {
    const categoria = identificarCategoria(produto.categoria);

    const card = criarCard(produto);

    switch (categoria) {
      case "relogios":
        if (listaRelogios) listaRelogios.innerHTML += card;
        break;

      case "tenis":
        if (listaTenis) listaTenis.innerHTML += card;
        break;

      case "vestuario":
        if (listaVestuario) listaVestuario.innerHTML += card;
        break;

      case "acessorios":
        if (listaAcessorios) listaAcessorios.innerHTML += card;
        break;

      default:
        if (listaOutros) listaOutros.innerHTML += card;
        break;
    }
  });

  esconderSecoesVazias();
}

/* ==========================================================
   ESCONDER CATEGORIAS VAZIAS
========================================================== */

function esconderSecoesVazias() {
  const secoes = document.querySelectorAll(".categoria-secao");

  secoes.forEach((secao) => {
    const lista = secao.querySelector(".lista-produtos");

    if (!lista) return;

    if (lista.children.length === 0) {
      secao.style.display = "none";
    } else {
      secao.style.display = "";
    }
  });

  if (secaoOutros) {
    if (listaOutros && listaOutros.children.length > 0) {
      secaoOutros.style.display = "";
    } else {
      secaoOutros.style.display = "none";
    }
  }
}

/* ==========================================================
   PREENCHER FILTRO DE CATEGORIAS
========================================================== */

function carregarCategorias() {
  if (!filtroCategoria) return;

  const categorias = [
    ...new Set(produtos.map((produto) => produto.categoria).filter(Boolean)),
  ];

  categorias.sort((a, b) => a.localeCompare(b));

  filtroCategoria.innerHTML = `

    <option value="todos">

      Todas as categorias

    </option>

  `;

  categorias.forEach((categoria) => {
    filtroCategoria.innerHTML += `

      <option value="${categoria}">

        ${categoria}

      </option>

    `;
  });
}

/* ==========================================================
   PESQUISAR E FILTRAR
========================================================== */

function aplicarFiltros() {
  const texto = normalizarTexto(campoPesquisa ? campoPesquisa.value : "");

  const categoriaSelecionada = filtroCategoria
    ? filtroCategoria.value
    : "todos";

  const resultado = produtos.filter((produto) => {
    const nome = normalizarTexto(produto.nome);
    const descricao = normalizarTexto(produto.descricao);
    const categoria = normalizarTexto(produto.categoria);

    const pesquisaOK =
      texto === "" ||
      nome.includes(texto) ||
      descricao.includes(texto) ||
      categoria.includes(texto);

    const categoriaOK =
      categoriaSelecionada === "todos" ||
      produto.categoria === categoriaSelecionada;

    return pesquisaOK && categoriaOK;
  });

  mostrarProdutos(resultado);
}

/* ==========================================================
   EVENTOS - PESQUISA E CATEGORIA
========================================================== */

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", aplicarFiltros);
}

if (filtroCategoria) {
  filtroCategoria.addEventListener("change", aplicarFiltros);
}

/* ==========================================================
   ADICIONAR AO CARRINHO
========================================================== */

function adicionarCarrinho(id) {
  const produto = produtos.find((p) => Number(p.id) === Number(id));

  if (!produto) {
    console.error("Produto não encontrado:", id);

    return;
  }

  const estoque = Number(produto.stock || 0);

  if (estoque <= 0) {
    alert("Este produto está esgotado.");

    return;
  }

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const existente = carrinho.find((p) => Number(p.id) === Number(id));

  if (existente) {
    if (existente.quantidade >= estoque) {
      alert(
        "Não é possível adicionar mais unidades. Stock disponível: " + estoque,
      );

      return;
    }

    existente.quantidade++;
  } else {
    carrinho.push({
      ...produto,

      quantidade: 1,
    });
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  atualizarContadorCarrinho();

  mostrarMensagem(produto.nome + " foi adicionado ao carrinho!");
}

/* ==========================================================
   CONTADOR DO CARRINHO
========================================================== */

function atualizarContadorCarrinho() {
  if (!contadorCarrinho) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const quantidade = carrinho.reduce(
    (total, produto) => total + Number(produto.quantidade || 0),
    0,
  );

  contadorCarrinho.textContent = quantidade;
}

/* ==========================================================
   MENSAGEM
========================================================== */

function mostrarMensagem(texto) {
  const antiga = document.querySelector(".produto-toast");

  if (antiga) {
    antiga.remove();
  }

  const toast = document.createElement("div");

  toast.className = "produto-toast";

  toast.innerHTML = `

    <i class="fa-solid fa-circle-check"></i>

    <span>${texto}</span>

  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

/* ==========================================================
   MODAL DE PRODUTO
   (usado pelos cards da página e pela Nova Coleção)
========================================================== */

function abrirModalProduto(id, imagemDestaque) {
  const produto = produtos.find((p) => Number(p.id) === Number(id));

  if (!produto) return;

  const estoque = Number(produto.stock || 0);

  const indisponivel = estoque <= 0;

  const anterior = document.getElementById("modal-produto");

  if (anterior) anterior.remove();

  const modal = document.createElement("div");

  modal.id = "modal-produto";

  modal.innerHTML = `
    <div class="modal-overlay" onclick="fecharModal()"></div>

    <div class="modal-conteudo">

      <button class="modal-fechar" onclick="fecharModal()">✕</button>

      <div class="modal-imagem">
        <img src="${imagemDestaque || produto.imagem || ""}" alt="${produto.nome}" />
      </div>

      <div class="modal-info">

        <span class="modal-categoria">${produto.categoria || ""}</span>

        <h2 class="modal-nome">${produto.nome}</h2>

        <p class="modal-descricao">
          ${produto.descricao || "Produto de qualidade ASAF STORE."}
        </p>

        <div class="modal-estrelas">★★★★★ <span>(5.0)</span></div>

        <div class="modal-preco">${formatarPreco(produto.preco)}</div>

        <div class="modal-stock ${indisponivel ? "esgotado" : ""}">
          ${indisponivel ? "Produto Esgotado" : "Em stock: " + estoque + " unidades"}
        </div>

        <button
          class="modal-btn-comprar"
          onclick="adicionarCarrinho(${produto.id}); fecharModal();"
          ${indisponivel ? "disabled" : ""}
        >
          <i class="fa-solid fa-cart-shopping"></i>
          ${indisponivel ? "Esgotado" : "Adicionar ao Carrinho"}
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  document.body.style.overflow = "hidden";

  setTimeout(() => modal.classList.add("modal-aberto"), 10);
}

function fecharModal() {
  const modal = document.getElementById("modal-produto");

  if (!modal) return;

  modal.classList.remove("modal-aberto");

  document.body.style.overflow = "";

  setTimeout(() => modal.remove(), 300);
}

/* Fechar o modal com a tecla ESC */

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fecharModal();
});

/* ==========================================================
   ATUALIZAR QUANDO O LOCALSTORAGE MUDAR
========================================================== */

window.addEventListener("storage", async function (evento) {
  if (evento.key === "produtos") {
    produtos = await carregarProdutos();

    carregarCategorias();

    aplicarFiltros();
  }

  if (evento.key === "carrinho") {
    atualizarContadorCarrinho();
  }
});

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

async function iniciarProdutos() {
  produtos = await carregarProdutos();

  carregarCategorias();

  mostrarProdutos();

  atualizarContadorCarrinho();

  /* Veio da Nova Coleção: abre o modal do produto escolhido */

  const produtoDestaque = localStorage.getItem("produto_destaque");

  if (produtoDestaque) {
    localStorage.removeItem("produto_destaque");

    let idDestaque = produtoDestaque;
    let imagemDestaque = "";

    try {
      const dadosDestaque = JSON.parse(produtoDestaque);

      if (dadosDestaque && typeof dadosDestaque === "object") {
        idDestaque = dadosDestaque.id;
        imagemDestaque = dadosDestaque.imagem || "";
      } else {
        idDestaque = dadosDestaque;
      }
    } catch (erro) {
      // Compatibilidade com IDs guardados como texto simples
    }

    const existe = produtos.some((p) => Number(p.id) === Number(idDestaque));

    if (existe) {
      setTimeout(
        () => abrirModalProduto(Number(idDestaque), imagemDestaque),
        600,
      );
    } else {
      console.warn("Produto selecionado não encontrado:", idDestaque);
    }
  }
  console.log("ASAF STORE: " + produtos.length + " produtos carregados.");
}

document.addEventListener("DOMContentLoaded", iniciarProdutos);
