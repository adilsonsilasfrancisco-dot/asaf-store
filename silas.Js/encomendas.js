/**
 * ==========================================================
 *              ASAF STORE - ENCOMENDAS
 * ==========================================================
 *
 * @format
 */

let encomendas = [];

let encomendaAtual = null;

/*==========================================
        FORMATAÇÃO
==========================================*/

function fmt(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

/*==========================================
        CARREGAR ENCOMENDAS
==========================================*/

function carregarEncomendas() {
  const dados = localStorage.getItem("encomendas");

  encomendas = dados ? JSON.parse(dados) : [];
}

/*==========================================
        MOSTRAR LISTA
==========================================*/

function renderEncomendas() {
  carregarEncomendas();

  const lista = document.getElementById("lista-encomendas");

  if (!lista) return;

  lista.innerHTML = "";

  if (encomendas.length === 0) {
    lista.innerHTML = `
        <div class="encomenda-card">

            <div class="encomenda-info">

                <h3>Nenhuma encomenda encontrada.</h3>

                <p>
                    Ainda não existem compras realizadas.
                </p>

            </div>

        </div>
        `;

    return;
  }

  encomendas
    .slice()
    .reverse()
    .forEach((encomenda, index) => {
      lista.innerHTML += criarCard(encomenda, index);
    });
}

/*==========================================
        CRIAR CARD
==========================================*/

function criarCard(encomenda, index) {
  return `

    <div class="encomenda-card">

        <div class="encomenda-info">

            <h3>

                ${encomenda.codigo}

            </h3>

            <p>

                <strong>Data:</strong>

                ${encomenda.data}

            </p>

            <p>

                <strong>Cliente:</strong>

                ${encomenda.cliente.nome}

            </p>

            <p>

                <strong>Produtos:</strong>

                ${encomenda.produtos.length}

            </p>

            <p>

                <strong>Estado:</strong>

                <span class="estado ${encomenda.estado.toLowerCase()}">

                    ${encomenda.estado}

                </span>

            </p>

        </div>

        <div class="encomenda-total">

            <h2>

                ${fmt(encomenda.total)}

            </h2>

            <button
                class="ver-detalhes"
                onclick="abrirModal(${index})">

                Ver Detalhes

            </button>

        </div>

    </div>

    `;
}

/*==========================================
        PESQUISAR ENCOMENDAS
==========================================*/

function pesquisarEncomendas() {
  const texto = document.getElementById("pesquisa").value.toLowerCase();

  const cards = document.querySelectorAll(".encomenda-card");

  cards.forEach((card) => {
    const conteudo = card.textContent.toLowerCase();

    if (conteudo.includes(texto)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}
/*==========================================
        ABRIR MODAL
==========================================*/

function abrirModal(index) {
  encomendaAtual = encomendas.slice().reverse()[index];

  const modal = document.getElementById("modal-encomenda");

  const conteudo = document.getElementById("conteudo-modal");

  let produtosHTML = "";

  encomendaAtual.produtos.forEach((produto) => {
    produtosHTML += `

        <div class="produto-item">

            <div>

                <strong>${produto.nome}</strong><br>

                ${produto.descricao}<br>

                Quantidade: ${produto.quantidade}

            </div>

            <div>

                ${fmt(produto.preco * produto.quantidade)}

            </div>

        </div>

        `;
  });

  conteudo.innerHTML = `

    <div class="detalhes">

        <div>

            <strong>Código</strong>

            ${encomendaAtual.codigo}

        </div>

        <div>

            <strong>Data</strong>

            ${encomendaAtual.data}

        </div>

        <div>

            <strong>Cliente</strong>

            ${encomendaAtual.cliente.nome}

        </div>

        <div>

            <strong>Telefone</strong>

            ${encomendaAtual.cliente.telefone}

        </div>

        <div>

            <strong>Email</strong>

            ${encomendaAtual.cliente.email}

        </div>

        <div>

            <strong>Pagamento</strong>

            ${encomendaAtual.cliente.pagamento}

        </div>

        <div>

            <strong>Entrega</strong>

            ${encomendaAtual.cliente.entrega}

        </div>

        <div>

            <strong>Estado</strong>

            <span class="estado ${encomendaAtual.estado.toLowerCase()}">

                ${encomendaAtual.estado}

            </span>

        </div>

    </div>

    <h3>

        Endereço de Entrega

    </h3>

    <p>

        ${encomendaAtual.cliente.provincia},
        ${encomendaAtual.cliente.municipio},
        Bairro ${encomendaAtual.cliente.bairro},
        Rua ${encomendaAtual.cliente.rua},
        Nº ${encomendaAtual.cliente.numero}

    </p>

    <p>

        <strong>Referência:</strong>

        ${encomendaAtual.cliente.referencia || "Não informada"}

    </p>

    <hr>

    <h3>

        Produtos

    </h3>

    <div class="lista-produtos">

        ${produtosHTML}

    </div>

    <hr>

    <div class="detalhes">

        <div>

            <strong>Subtotal</strong>

            ${fmt(encomendaAtual.subtotal)}

        </div>

        <div>

            <strong>Desconto</strong>

            ${fmt(encomendaAtual.desconto)}

        </div>

        <div>

            <strong>Total</strong>

            ${fmt(encomendaAtual.total)}

        </div>

    </div>

    `;

  modal.style.display = "flex";
}
/*==========================================
        FECHAR MODAL
==========================================*/

function fecharModal() {
  const modal = document.getElementById("modal-encomenda");

  if (modal) {
    modal.style.display = "none";
  }
}

/*==========================================
    FECHAR AO CLICAR FORA DO MODAL
==========================================*/

window.addEventListener("click", function (e) {
  const modal = document.getElementById("modal-encomenda");

  if (e.target === modal) {
    fecharModal();
  }
});

/*==========================================
        CONFIGURAR EVENTOS
==========================================*/

function configurarEventos() {
  const pesquisa = document.getElementById("pesquisa");

  if (pesquisa) {
    pesquisa.addEventListener("keyup", pesquisarEncomendas);
  }

  const fechar = document.querySelector(".fechar");

  if (fechar) {
    fechar.addEventListener("click", fecharModal);
  }
}

/*==========================================
        ATUALIZAR ESTADO
==========================================*/

function atualizarEstado(codigo, novoEstado) {
  let lista = JSON.parse(localStorage.getItem("encomendas")) || [];

  lista.forEach((encomenda) => {
    if (encomenda.codigo === codigo) {
      encomenda.estado = novoEstado;
    }
  });

  localStorage.setItem("encomendas", JSON.stringify(lista));

  renderEncomendas();

  fecharModal();
}

/*==========================================
        INICIALIZAÇÃO
==========================================*/

document.addEventListener("DOMContentLoaded", () => {
  renderEncomendas();

  configurarEventos();
});
