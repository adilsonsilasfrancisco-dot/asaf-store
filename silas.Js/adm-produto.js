/** @format */
/*=========================================================
                    ASAF ADMIN
                  GESTÃO DE PRODUTOS
=========================================================*/

"use strict";

/*=========================================================
LOGIN
=========================================================*/

if (localStorage.getItem("adminLogado") !== "true") {
  window.location.href = "login-admin.html";
}

/*=========================================================
DADOS
=========================================================*/

let produtos = [];
let imagemBase64 = "";
let editando = null;

const CHAVE_PRODUTOS = "produtos";
const CHAVE_INICIALIZACAO = "produtos_inicializados";

/*=========================================================
ELEMENTOS HTML
=========================================================*/

const modal = document.getElementById("modalProduto");
const btnNovo = document.getElementById("btnNovo");
const fechar = document.getElementById("fecharModal");
const form = document.getElementById("produtoForm");
const lista = document.getElementById("listaProdutos");
const preview = document.getElementById("previewImagem");
const imagem = document.getElementById("imagem");
const campoPesquisa = document.getElementById("searchInput");
const filtroCategoria = document.getElementById("categoryFilter");
const destaqueInicio = document.getElementById("destaqueInicio");
const ordemInicio = document.getElementById("ordemInicio");

/*=========================================================
NOTIFICAÇÕES
=========================================================*/

function toast(mensagem) {
  const antigo = document.querySelector(".toast");

  if (antigo) antigo.remove();

  const div = document.createElement("div");
  div.className = "toast";
  div.textContent = mensagem;

  document.body.appendChild(div);

  setTimeout(() => div.classList.add("show"), 100);

  setTimeout(() => {
    div.classList.remove("show");

    setTimeout(() => div.remove(), 400);
  }, 3000);
}

/*=========================================================
GUARDAR PRODUTOS COM SEGURANÇA
=========================================================*/

function salvarLista(novaLista) {
  try {
    localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(novaLista));

    localStorage.setItem(CHAVE_INICIALIZACAO, "true");

    produtos = novaLista;

    atualizarDashboard();

    return true;
  } catch (erro) {
    console.error("Erro ao guardar produtos:", erro);

    toast(
      "Não foi possível guardar. Verifica o espaço disponível no navegador.",
    );

    return false;
  }
}

/*=========================================================
NORMALIZAR DESTAQUES DOS PRODUTOS
=========================================================*/

function normalizarDestaques(lista) {
  if (!Array.isArray(lista)) return [];

  // Encontrar a maior posição já utilizada
  let maiorOrdem = 0;

  lista.forEach((produto) => {
    const ordem = Number(produto.ordemDestaque);

    if (
      produto.destaque === true &&
      Number.isInteger(ordem) &&
      ordem > maiorOrdem
    ) {
      maiorOrdem = ordem;
    }
  });

  let proximaOrdem = maiorOrdem + 1;

  return lista.map((produto) => {
    const atualizado = { ...produto };

    // Produtos antigos sem configuração continuam destacados
    if (typeof atualizado.destaque !== "boolean") {
      atualizado.destaque = true;
    }

    if (atualizado.destaque === true) {
      const ordem = Number(atualizado.ordemDestaque);

      if (!Number.isInteger(ordem) || ordem < 1) {
        atualizado.ordemDestaque = proximaOrdem++;
      }
    } else {
      atualizado.ordemDestaque = null;
    }

    return atualizado;
  });
}

/*=========================================================
CARREGAR PRODUTOS DO JSON E DO LOCAL STORAGE
=========================================================*/

async function carregarProdutos() {
  const dadosGuardados = localStorage.getItem(CHAVE_PRODUTOS);
  const inicializado = localStorage.getItem(CHAVE_INICIALIZACAO) === "true";

  let produtosLocais = null;

  if (dadosGuardados !== null) {
    try {
      produtosLocais = JSON.parse(dadosGuardados);

      if (!Array.isArray(produtosLocais)) {
        produtosLocais = null;
      }
    } catch (erro) {
      console.warn("Dados locais inválidos:", erro);
      produtosLocais = null;
    }
  }

  /*
    Se o painel já foi inicializado, respeita a lista
    guardada, incluindo eliminações feitas pelo administrador.
  */

  if (inicializado && Array.isArray(produtosLocais)) {
    produtos = normalizarDestaques(produtosLocais);

    salvarLista(produtos);

    console.log("Produtos carregados do localStorage:", produtos.length);

    return;
  }

  /*
    Primeira inicialização:
    carregar os produtos originais do JSON.
  */

  try {
    const caminhoJSON = new URL("../produtos.json", document.baseURI);

    const resposta = await fetch(caminhoJSON, {
      cache: "no-store",
    });

    if (!resposta.ok) {
      throw new Error(
        "Não foi possível carregar produtos.json: " + resposta.status,
      );
    }

    const produtosJSON = await resposta.json();

    if (!Array.isArray(produtosJSON)) {
      throw new Error("O ficheiro produtos.json não contém uma lista válida.");
    }

    /*
      Se houver dados locais antigos sem marca de inicialização,
      combina-os com o JSON, sem descartar os restantes produtos.
      Os dados locais prevalecem quando o ID é igual.
    */

    if (Array.isArray(produtosLocais) && produtosLocais.length > 0) {
      const mapa = new Map();

      produtosJSON.forEach((produto) => {
        mapa.set(String(produto.id), produto);
      });

      produtosLocais.forEach((produto) => {
        mapa.set(String(produto.id), produto);
      });

      produtos = Array.from(mapa.values());
    } else {
      produtos = produtosJSON;
    }

    produtos = normalizarDestaques(produtos);

    salvarLista(produtos);

    console.log("Produtos carregados do produtos.json:", produtos.length);
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);

    /*
      Se houver dados locais válidos, não os perde
      quando o ficheiro JSON não estiver disponível.
    */

    if (Array.isArray(produtosLocais)) {
      produtos = produtosLocais;
    } else {
      produtos = [];
    }

    toast("Não foi possível carregar o ficheiro de produtos.");
  }
}

/*=========================================================
CRIAR ID ÚNICO
=========================================================*/

function novoID() {
  if (produtos.length === 0) return 1;

  const maiorID = Math.max(
    ...produtos.map((produto) => Number(produto.id) || 0),
  );

  return maiorID + 1;
}

/*=========================================================
FORMATAÇÃO DE PREÇO
=========================================================*/

function dinheiro(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

/*=========================================================
ESTADO DO STOCK
=========================================================*/

function estadoProduto(stock) {
  return Number(stock) > 0 ? "Disponível" : "Esgotado";
}

function classeEstado(stock) {
  return Number(stock) > 0 ? "disponivel" : "esgotado";
}

/*=========================================================
ABRIR MODAL - NOVO PRODUTO
=========================================================*/

function abrirNovoProduto() {
  editando = null;
  imagemBase64 = "";

  form.reset();
  destaqueInicio.value = "nao";
  ordemInicio.value = "1";

  imagem.value = "";
  preview.src = "";
  preview.style.display = "none";

  document.querySelector(".modal-header h2").textContent = "Novo Produto";

  modal.classList.add("active");
}

btnNovo.addEventListener("click", abrirNovoProduto);

/*=========================================================
FECHAR MODAL
=========================================================*/

fechar.addEventListener("click", () => {
  modal.classList.remove("active");
});

window.addEventListener("click", (evento) => {
  if (evento.target === modal) {
    modal.classList.remove("active");
  }
});

/*=========================================================
UPLOAD E PRÉ-VISUALIZAÇÃO DA IMAGEM
=========================================================*/

imagem.addEventListener("change", function () {
  const arquivo = this.files[0];

  if (!arquivo) return;

  if (!arquivo.type.startsWith("image/")) {
    toast("Seleciona um ficheiro de imagem válido.");
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (evento) {
    imagemBase64 = evento.target.result;

    preview.src = imagemBase64;
    preview.style.display = "block";
  };

  reader.onerror = function () {
    toast("Erro ao carregar a imagem.");
  };

  reader.readAsDataURL(arquivo);
});

/*=========================================================
RENDERIZAR TABELA
=========================================================*/

function renderizarProdutos() {
  lista.innerHTML = "";

  if (produtos.length === 0) {
    const linha = document.createElement("tr");
    const coluna = document.createElement("td");

    coluna.colSpan = 7;
    coluna.textContent = "Nenhum produto cadastrado.";
    coluna.style.textAlign = "center";
    coluna.style.padding = "30px";

    linha.appendChild(coluna);
    lista.appendChild(linha);

    return;
  }

  produtos.forEach((produto) => {
    const linha = document.createElement("tr");

    // Imagem
    const colunaImagem = document.createElement("td");
    const img = document.createElement("img");

    img.src = produto.imagem || "";
    img.alt = produto.nome || "Produto";
    img.className = "produto-img";

    colunaImagem.appendChild(img);

    // Nome
    const colunaNome = document.createElement("td");
    colunaNome.textContent = produto.nome || "";

    // Categoria
    const colunaCategoria = document.createElement("td");
    colunaCategoria.textContent = produto.categoria || "";

    // Preço
    const colunaPreco = document.createElement("td");
    colunaPreco.textContent = dinheiro(produto.preco);

    // Stock
    const colunaStock = document.createElement("td");
    colunaStock.textContent = produto.stock ?? 0;

    // Estado
    const colunaEstado = document.createElement("td");
    const badge = document.createElement("span");

    badge.className = "badge " + classeEstado(produto.stock);

    badge.textContent = estadoProduto(produto.stock);

    colunaEstado.appendChild(badge);

    // Ações
    const colunaAcoes = document.createElement("td");
    const acoes = document.createElement("div");

    acoes.className = "acoes";

    const btnEditar = document.createElement("button");
    btnEditar.className = "btnEditar";
    btnEditar.innerHTML = '<i class="fas fa-pen"></i>';
    btnEditar.type = "button";

    btnEditar.addEventListener("click", () => {
      editarProduto(produto.id);
    });

    const btnExcluir = document.createElement("button");
    btnExcluir.className = "btnExcluir";
    btnExcluir.innerHTML = '<i class="fas fa-trash"></i>';
    btnExcluir.type = "button";

    btnExcluir.addEventListener("click", () => {
      eliminarProduto(produto.id);
    });

    acoes.appendChild(btnEditar);
    acoes.appendChild(btnExcluir);
    colunaAcoes.appendChild(acoes);

    linha.append(
      colunaImagem,
      colunaNome,
      colunaCategoria,
      colunaPreco,
      colunaStock,
      colunaEstado,
      colunaAcoes,
    );

    lista.appendChild(linha);
  });

  filtrarProdutos();
}

/*=========================================================
ADICIONAR E EDITAR PRODUTO
=========================================================*/

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const categoria = document.getElementById("categoria").value;
  const preco = Number(document.getElementById("preco").value);
  const stock = Number(document.getElementById("stock").value);
  const descricao = document.getElementById("descricao").value.trim();
  const mostrarInicio = destaqueInicio.value === "sim";
  const posicaoInicio = Number(ordemInicio.value);

  if (
    mostrarInicio &&
    (!Number.isInteger(posicaoInicio) || posicaoInicio < 1)
  ) {
    toast("Indica uma posição válida para a página inicial.");
    return;
  }

  if (
    !nome ||
    !categoria ||
    !Number.isFinite(preco) ||
    !Number.isFinite(stock)
  ) {
    toast("Preenche corretamente os campos do produto.");
    return;
  }

  let novaLista = [...produtos];
  const estavaEditando = editando !== null;

  if (editando !== null) {
    const indice = novaLista.findIndex(
      (produto) => String(produto.id) === String(editando),
    );

    if (indice === -1) {
      toast("Produto não encontrado.");
      return;
    }

    const imagemAnterior = novaLista[indice].imagem || "";

    const produtoAtualizado = {
      ...novaLista[indice],
      nome,
      categoria,
      preco,
      stock,
      descricao,
      imagem: imagemBase64 || imagemAnterior,
      destaque: mostrarInicio,
      ordemDestaque: mostrarInicio ? posicaoInicio : null,
    };

    novaLista[indice] = produtoAtualizado;
  } else {
    const novoProduto = {
      id: novoID(),
      nome,
      categoria,
      preco,
      stock,
      descricao,
      imagem: imagemBase64,
      destaque: mostrarInicio,
      ordemDestaque: mostrarInicio ? posicaoInicio : null,
    };

    // Acrescenta ao array existente, sem o substituir.
    novaLista.push(novoProduto);
  }

  if (!salvarLista(novaLista)) {
    return;
  }

  renderizarProdutos();

  modal.classList.remove("active");

  form.reset();

  imagem.value = "";
  preview.src = "";
  preview.style.display = "none";

  imagemBase64 = "";
  editando = null;

  toast(
    estavaEditando
      ? "Produto atualizado com sucesso."
      : "Produto adicionado com sucesso.",
  );
});

/*=========================================================
EDITAR PRODUTO
=========================================================*/

function editarProduto(id) {
  const produto = produtos.find((item) => String(item.id) === String(id));

  if (!produto) {
    toast("Produto não encontrado.");
    return;
  }

  editando = produto.id;

  document.querySelector(".modal-header h2").textContent = "Editar Produto";

  document.getElementById("nome").value = produto.nome || "";
  document.getElementById("categoria").value = produto.categoria || "";
  document.getElementById("preco").value = produto.preco ?? "";
  document.getElementById("stock").value = produto.stock ?? 0;
  document.getElementById("descricao").value = produto.descricao || "";
  destaqueInicio.value = produto.destaque === true ? "sim" : "nao";

  ordemInicio.value = produto.ordemDestaque || "1";

  imagemBase64 = produto.imagem || "";
  imagem.value = "";

  if (imagemBase64) {
    preview.src = imagemBase64;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }

  modal.classList.add("active");
}

/*=========================================================
ELIMINAR PRODUTO
=========================================================*/

function eliminarProduto(id) {
  const confirmar = confirm("Deseja realmente eliminar este produto?");

  if (!confirmar) return;

  const novaLista = produtos.filter(
    (produto) => String(produto.id) !== String(id),
  );

  if (!salvarLista(novaLista)) {
    return;
  }

  renderizarProdutos();

  toast("Produto eliminado com sucesso.");
}

/*=========================================================
PESQUISA E FILTROS
=========================================================*/

function filtrarProdutos() {
  if (!campoPesquisa || !filtroCategoria) return;

  const texto = campoPesquisa.value.toLowerCase().trim();
  const categoria = filtroCategoria.value;

  const linhas = lista.querySelectorAll("tr");

  linhas.forEach((linha) => {
    const colunas = linha.querySelectorAll("td");

    if (colunas.length < 7) return;

    const nome = colunas[1].textContent.toLowerCase();
    const cat = colunas[2].textContent;

    const pesquisaOK = nome.includes(texto);
    const categoriaOK = categoria === "" || cat === categoria;

    linha.style.display = pesquisaOK && categoriaOK ? "" : "none";
  });
}

campoPesquisa.addEventListener("input", filtrarProdutos);
filtroCategoria.addEventListener("change", filtrarProdutos);

/*=========================================================
ATUALIZAR DASHBOARD
=========================================================*/

function atualizarDashboard() {
  try {
    localStorage.setItem("totalProdutos", produtos.length);
  } catch (erro) {
    console.warn("Não foi possível atualizar o dashboard:", erro);
  }
}

/*=========================================================
ORDENAR PRODUTOS
=========================================================*/

function ordenarProdutos() {
  produtos.sort((a, b) =>
    String(a.nome || "").localeCompare(String(b.nome || ""), "pt"),
  );
}

/*=========================================================
VERIFICAR STOCK
=========================================================*/

function verificarStock() {
  produtos.forEach((produto) => {
    if (Number(produto.stock) < 5) {
      console.log("Stock baixo:", produto.nome);
    }
  });
}

/*=========================================================
ESTATÍSTICAS
=========================================================*/

function estatisticas() {
  const total = produtos.length;

  const disponiveis = produtos.filter(
    (produto) => Number(produto.stock) > 0,
  ).length;

  const esgotados = produtos.filter(
    (produto) => Number(produto.stock) === 0,
  ).length;

  console.log("Produtos:", total);
  console.log("Disponíveis:", disponiveis);
  console.log("Esgotados:", esgotados);
}

/*=========================================================
EXPORTAR PRODUTOS
=========================================================*/

function exportarProdutos() {
  const dados = JSON.stringify(produtos, null, 4);

  const ficheiro = new Blob([dados], { type: "application/json" });

  const url = URL.createObjectURL(ficheiro);
  const link = document.createElement("a");

  link.href = url;
  link.download = "produtos.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/*=========================================================
IMPORTAR PRODUTOS
=========================================================*/

function importarProdutos(listaNova) {
  if (!Array.isArray(listaNova)) {
    toast("A lista importada não é válida.");
    return;
  }

  listaNova = normalizarDestaques(listaNova);

  if (!salvarLista(listaNova)) return;
  ordenarProdutos();
  renderizarProdutos();

  toast("Produtos importados com sucesso.");
}

/*=========================================================
LOGOUT
=========================================================*/

function logout() {
  if (confirm("Deseja sair do painel administrativo?")) {
    localStorage.removeItem("adminLogado");
    window.location.href = "login-admin.html";
  }
}

/*=========================================================
INICIALIZAÇÃO
=========================================================*/

async function inicializarPainel() {
  await carregarProdutos();

  ordenarProdutos();
  renderizarProdutos();
  verificarStock();
  estatisticas();
  atualizarDashboard();

  console.log("CRUD Produtos iniciado.");
  console.log("Total de produtos:", produtos.length);
}

inicializarPainel();
