/**
 * ============================================
 *        ASAF ADMIN - ENCOMENDAS
 * ============================================
 *
 * @format
 */

/*=========================================
            VARIÁVEIS
=========================================*/

let encomendas = [];

let encomendaSelecionada = null;

/*=========================================
            LOCAL STORAGE
=========================================*/

function carregarEncomendas() {
  const dados = localStorage.getItem("encomendas");

  encomendas = dados ? JSON.parse(dados) : [];
}

/*=========================================
            FORMATAÇÃO
=========================================*/

function fmt(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

/*=========================================
            BADGES
=========================================*/

function badgeEstado(estado) {
  switch (estado) {
    case "Pendente":
      return '<span class="badge pendente">Pendente</span>';

    case "Confirmada":
      return '<span class="badge confirmada">Confirmada</span>';

    case "Preparação":
      return '<span class="badge preparacao">Preparação</span>';

    case "Enviada":
      return '<span class="badge enviada">Enviada</span>';

    case "Entregue":
      return '<span class="badge entregue">Entregue</span>';

    case "Cancelada":
      return '<span class="badge cancelada">Cancelada</span>';

    default:
      return '<span class="badge pendente">Pendente</span>';
  }
}

/*=========================================
        RENDER DA TABELA
=========================================*/

function renderTabela() {
  carregarEncomendas();

  const tbody = document.getElementById("lista-encomendas");

  tbody.innerHTML = "";

  if (encomendas.length === 0) {
    tbody.innerHTML = `

<tr>

<td colspan="7" style="text-align:center;padding:40px;">

Nenhuma encomenda encontrada.

</td>

</tr>

`;

    return;
  }

  encomendas.forEach((encomenda, index) => {
    tbody.innerHTML += `

<tr>

<td>${encomenda.codigo}</td>

<td>${encomenda.cliente.nome}</td>

<td>${encomenda.cliente.telefone}</td>

<td>${encomenda.data}</td>

<td>${fmt(encomenda.total)}</td>

<td>

${badgeEstado(encomenda.estado)}

</td>

<td>

<button
class="btn btn-view"
onclick="abrirEncomenda(${index})">

Ver

</button>

</td>

</tr>

`;
  });
}

/*=========================================
        ABRIR ENCOMENDA
=========================================*/

function abrirEncomenda(index) {
  encomendaSelecionada = index;

  const encomenda = encomendas[index];

  const detalhes = document.getElementById("detalhes-encomenda");

  let produtosHTML = "";

  encomenda.produtos.forEach((produto) => {
    produtosHTML += `

<div class="produto-item">

    <div class="produto-esquerda">

        <img
            src="${produto.imagem}"
            alt="${produto.nome}">

        <div class="produto-info">

            <h4>${produto.nome}</h4>

            <p>${produto.descricao}</p>

            <small>

                Quantidade:
                ${produto.quantidade}

            </small>

        </div>

    </div>

    <div class="produto-total">

        ${fmt(produto.preco * produto.quantidade)}

    </div>

</div>

`;
  });

  detalhes.innerHTML = `

<div class="info-cliente">

<strong>Código:</strong>

${encomenda.codigo}

<br><br>

<strong>Cliente:</strong>

${encomenda.cliente.nome}

<br>

<strong>Telefone:</strong>

${encomenda.cliente.telefone}

<br>

<strong>Email:</strong>

${encomenda.cliente.email}

<br><br>

<strong>Província:</strong>

${encomenda.cliente.provincia}

<br>

<strong>Município:</strong>

${encomenda.cliente.municipio}

<br>

<strong>Bairro:</strong>

${encomenda.cliente.bairro}

<br>

<strong>Rua:</strong>

${encomenda.cliente.rua}

<br>

<strong>Número:</strong>

${encomenda.cliente.numero}

<br>

<strong>Referência:</strong>

${encomenda.cliente.referencia || "-"}

<br><br>

<strong>Entrega:</strong>

${encomenda.cliente.entrega}

<br>

<strong>Pagamento:</strong>

${encomenda.cliente.pagamento}

</div>

<h3 style="margin-top:25px">

Produtos

</h3>

<div class="produtos-lista">

${produtosHTML}

</div>

<hr>

<div class="info-cliente">

<strong>Subtotal:</strong>

${fmt(encomenda.subtotal)}

<br>

<strong>Desconto:</strong>

${fmt(encomenda.desconto)}

<br>

<strong>Total:</strong>

${fmt(encomenda.total)}

</div>

`;

  document.getElementById("novoEstado").value = encomenda.estado;

  document.getElementById("modal-encomenda").style.display = "flex";
}

/*=========================================
        GUARDAR NOVO ESTADO
=========================================*/

document
  .getElementById("btnGuardarEstado")
  .addEventListener("click", salvarEstado);

function salvarEstado() {
  if (encomendaSelecionada === null) return;

  const novoEstado = document.getElementById("novoEstado").value;

  encomendas[encomendaSelecionada].estado = novoEstado;

  localStorage.setItem("encomendas", JSON.stringify(encomendas));

  fecharModal();

  renderTabela();

  alert("Estado da encomenda atualizado com sucesso!");
}

/*=========================================
            FECHAR MODAL
=========================================*/

function fecharModal() {
  document.getElementById("modal-encomenda").style.display = "none";
}

document.getElementById("btnFechar").addEventListener("click", fecharModal);

document.getElementById("fecharModal").addEventListener("click", fecharModal);

window.addEventListener("click", function (e) {
  const modal = document.getElementById("modal-encomenda");

  if (e.target === modal) {
    fecharModal();
  }
});

/*=========================================
            PESQUISA
=========================================*/

document
  .getElementById("pesquisa")
  .addEventListener("keyup", pesquisarEncomendas);

function pesquisarEncomendas() {
  const texto = document.getElementById("pesquisa").value.toLowerCase();

  const linhas = document.querySelectorAll("#lista-encomendas tr");

  linhas.forEach((linha) => {
    if (linha.cells.length === 0) return;

    const codigo = linha.cells[0].textContent.toLowerCase();

    const cliente = linha.cells[1].textContent.toLowerCase();

    const telefone = linha.cells[2].textContent.toLowerCase();

    if (
      codigo.includes(texto) ||
      cliente.includes(texto) ||
      telefone.includes(texto)
    ) {
      linha.style.display = "";
    } else {
      linha.style.display = "none";
    }
  });
}

/*=========================================
            FILTRO POR ESTADO
=========================================*/

document
  .getElementById("filtroEstado")
  .addEventListener("change", filtrarEstado);

function filtrarEstado() {
  const estado = document.getElementById("filtroEstado").value;

  const linhas = document.querySelectorAll("#lista-encomendas tr");

  linhas.forEach((linha) => {
    if (linha.cells.length === 0) return;

    if (estado === "") {
      linha.style.display = "";

      return;
    }

    const textoEstado = linha.cells[5].textContent.trim().toLowerCase();

    if (textoEstado === estado.toLowerCase()) {
      linha.style.display = "";
    } else {
      linha.style.display = "none";
    }
  });
}

/*=========================================
            ATUALIZAR
=========================================*/

function atualizarTabela() {
  carregarEncomendas();

  renderTabela();
}

/*=========================================
            AUTO REFRESH
=========================================*/

window.addEventListener("storage", function () {
  atualizarTabela();
});

/*=========================================
            INICIALIZAÇÃO
=========================================*/

document.addEventListener("DOMContentLoaded", function () {
  atualizarTabela();
});
