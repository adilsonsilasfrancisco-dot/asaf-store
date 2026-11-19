/** @format */
/**
 * ==========================================================
 *                ASAF STORE - CARRINHO
 * ==========================================================
 */

/*==========================================================
                    CUPÕES
==========================================================*/
const COUPONS = {
  SAVE10: 10,
  PROMO20: 20,
  VIP30: 30,
  ASAF15: 15,
};

/*==========================================================
                    ESTADO
==========================================================*/
let cart = [];
let discountPct = 0;
let activeCoupon = null;

/*==========================================================
                LOCAL STORAGE
==========================================================*/
function carregarCarrinho() {
  const dados = localStorage.getItem("carrinho");
  cart = dados ? JSON.parse(dados) : [];
}

function guardarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(cart));
}

/*==========================================================
                UTILITÁRIOS
==========================================================*/
function fmt(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

function procurarProduto(id) {
  return cart.find((produto) => produto.id == id);
}

function quantidadeItens() {
  return cart.reduce((total, produto) => total + produto.quantidade, 0);
}

function subtotalCarrinho() {
  return cart.reduce(
    (total, produto) => total + produto.preco * produto.quantidade,
    0,
  );
}

/*==========================================================
                    TOAST
   - Na página do carrinho usa o #toast que já existe
   - Nas outras páginas (ex: Loja.html) cria um automático
==========================================================*/
function showToast(texto) {
  const toast = document.getElementById("toast");

  if (toast) {
    toast.textContent = texto;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
    return;
  }

  /* Fallback para páginas sem #toast */
  let aviso = document.getElementById("toast-asaf");

  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "toast-asaf";

    Object.assign(aviso.style, {
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      background: "#111",
      color: "#fff",
      padding: "0.9rem 1.2rem",
      borderRadius: "6px",
      fontFamily: "'Poppins', sans-serif",
      fontSize: "0.88rem",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      border: "1px solid #333",
      zIndex: "9999",
      maxWidth: "340px",
      opacity: "0",
      transform: "translateY(20px)",
      transition: "all 0.3s ease",
    });

    document.body.appendChild(aviso);
  }

  aviso.textContent = texto;

  requestAnimationFrame(() => {
    aviso.style.opacity = "1";
    aviso.style.transform = "translateY(0)";
  });

  clearTimeout(aviso._timer);

  aviso._timer = setTimeout(() => {
    aviso.style.opacity = "0";
    aviso.style.transform = "translateY(20px)";
  }, 2500);
}

/*==========================================================
            CARRINHO VAZIO
==========================================================*/
function carrinhoVazio() {
  return cart.length === 0;
}

/*==========================================================
            ATUALIZAR LOCAL STORAGE
==========================================================*/
function atualizarCarrinho() {
  guardarCarrinho();
  render();
}

/*==========================================================
                    RENDER
==========================================================*/
function render() {
  carregarCarrinho();

  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("empty-cart");
  const actionsEl = document.getElementById("cart-actions");
  const subtitle = document.getElementById("cart-subtitle");
  const label = document.getElementById("cart-count-label");

  /* Não estamos na página do carrinho (ex: Loja.html) */
  if (!itemsEl) return;

  itemsEl.innerHTML = "";

  /* Carrinho vazio */
  if (carrinhoVazio()) {
    emptyEl.style.display = "block";
    actionsEl.style.display = "none";
    subtitle.textContent = "O teu carrinho está vazio.";
    label.textContent = "";
    resetTotals();
    return;
  }

  emptyEl.style.display = "none";
  actionsEl.style.display = "flex";

  subtitle.textContent =
    quantidadeItens() +
    (quantidadeItens() === 1
      ? " produto no teu carrinho"
      : " produtos no teu carrinho");

  label.textContent = cart.length + (cart.length === 1 ? " ITEM" : " ITENS");

  /* Produtos */
  cart.forEach((produto) => {
    const subtotal = produto.preco * produto.quantidade;

    const imagem = produto.imagem
      ? `<img src="${produto.imagem}" alt="${produto.nome}">`
      : `<span class="emoji">🛍️</span>`;

    itemsEl.innerHTML += `
      <li class="cart-item">
        <div class="item-img">${imagem}</div>
        <div class="item-body">
          <div class="item-brand">ASAF STORE</div>
          <div class="item-name">${produto.nome}</div>
          <div class="item-desc">${produto.descricao}</div>
          <div class="item-price">${fmt(produto.preco)}</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="alterarQuantidade(${produto.id},-1)">−</button>
            <div class="qty-val">${produto.quantidade}</div>
            <button class="qty-btn" onclick="alterarQuantidade(${produto.id},1)">+</button>
          </div>
        </div>
        <div class="item-right">
          <div class="item-total">${fmt(subtotal)}</div>
          <button class="remove-btn" onclick="removerProduto(${produto.id})">Remover</button>
        </div>
      </li>`;
  });

  renderTotais();
}

/*==========================================================
                    TOTAIS
==========================================================*/
function resetTotals() {
  document.getElementById("subtotal-val").textContent = "—";
  document.getElementById("discount-val").textContent = "—";
  document.getElementById("total-val").textContent = "—";
  document.getElementById("checkout-btn").disabled = true;
}

function renderTotais() {
  const subtotal = subtotalCarrinho();
  const desconto = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - desconto;

  document.getElementById("subtotal-val").textContent = fmt(subtotal);
  document.getElementById("discount-val").textContent =
    desconto > 0 ? "- " + fmt(desconto) : "—";
  document.getElementById("total-val").textContent = fmt(total);
  document.getElementById("checkout-btn").disabled = subtotal === 0;
}

/*==========================================================
            ALTERAR QUANTIDADE
==========================================================*/
function alterarQuantidade(id, delta) {
  const produto = procurarProduto(id);
  if (!produto) return;

  produto.quantidade += delta;

  if (produto.quantidade <= 0) {
    removerProduto(id);
    return;
  }

  atualizarCarrinho();
}

/*==========================================================
                REMOVER PRODUTO
==========================================================*/
function removerProduto(id) {
  cart = cart.filter((produto) => produto.id != id);
  atualizarCarrinho();
  showToast("Produto removido do carrinho.");
}

/*==========================================================
                LIMPAR CARRINHO
==========================================================*/
function limparCarrinho() {
  cart = [];
  discountPct = 0;
  activeCoupon = null;

  guardarCarrinho();

  /* limpar desconto do localStorage também */
  localStorage.removeItem("desconto_carrinho");

  const input = document.getElementById("coupon-input");
  if (input) input.value = "";

  esconderMensagemCupao();
  render();
  showToast("Carrinho limpo.");
}

/*==========================================================
                CUPÕES
   Guarda o desconto no localStorage para o checkout.js
   conseguir ler o valor correcto
==========================================================*/
function aplicarCupao() {
  const input = document.getElementById("coupon-input");
  const mensagem = document.getElementById("coupon-msg");
  const codigo = input.value.trim().toUpperCase();

  if (codigo === "") {
    mensagem.className = "coupon-msg err";
    mensagem.textContent = "Digite um código.";
    return;
  }

  if (COUPONS[codigo]) {
    discountPct = COUPONS[codigo];
    activeCoupon = codigo;

    localStorage.setItem(
      "desconto_carrinho",
      JSON.stringify({
        codigo,
        pct: discountPct,
      }),
    );

    mensagem.className = "coupon-msg ok";
    mensagem.textContent = `✓ Código "${codigo}" aplicado (${discountPct}% de desconto).`;

    render();
    showToast("Cupão aplicado.");
  } else {
    discountPct = 0;
    activeCoupon = null;

    localStorage.removeItem("desconto_carrinho");

    mensagem.className = "coupon-msg err";
    mensagem.textContent = "Código inválido.";
  }
}

/*==========================================================
        ESCONDER MENSAGEM DO CUPÃO
==========================================================*/
function esconderMensagemCupao() {
  const msg = document.getElementById("coupon-msg");
  if (!msg) return;
  msg.textContent = "";
  msg.className = "coupon-msg";
}

/*==========================================================
            EVENTOS DOS CUPÕES
==========================================================*/
const btnCupao = document.getElementById("apply-coupon");
if (btnCupao) btnCupao.addEventListener("click", aplicarCupao);

const inputCupao = document.getElementById("coupon-input");
if (inputCupao) {
  inputCupao.addEventListener("keydown", function (e) {
    if (e.key === "Enter") aplicarCupao();
  });
}

/*==========================================================
            BOTÃO LIMPAR CARRINHO
==========================================================*/
const btnLimpar = document.getElementById("clear-cart");
if (btnLimpar) btnLimpar.addEventListener("click", limparCarrinho);

/*==========================================================
            FINALIZAR COMPRA
==========================================================*/
function finalizarCompra() {
  if (carrinhoVazio()) {
    showToast("O carrinho está vazio.");
    return;
  }

  guardarCarrinho();
  showToast("A encaminhar para o Checkout...");

  setTimeout(() => {
    window.location.href = "checkout.html";
  }, 900);
}

/*==========================================================
            RESERVAR NA LOJA
==========================================================*/
function reservarNaLoja() {
  if (carrinhoVazio()) {
    showToast("O carrinho está vazio.");
    return;
  }
  showToast("Reserva efetuada com sucesso.");
}

/*==========================================================
                EVENTOS
==========================================================*/
function configurarEventos() {
  const btnCheckout = document.getElementById("checkout-btn");
  if (btnCheckout) btnCheckout.addEventListener("click", finalizarCompra);

  const btnReserva = document.getElementById("reserve-btn");
  if (btnReserva) btnReserva.addEventListener("click", reservarNaLoja);
}

/*==========================================================
        LOJA.HTML — ABRIR MODAL DO PRODUTO
   Usado pela Nova Coleção, Produtos em Destaque e Promoções.
   Guarda o id, imagem e abre o modal na página de produtos.
==========================================================*/

function irParaProduto(id, imagem = null) {
  const idProduto = Number(id);

  if (!Number.isInteger(idProduto) || idProduto <= 0) {
    console.error("ID de produto inválido:", id);
    return;
  }

  // Guardar o produto selecionado e a imagem do cartão
  const produtoDestaque = {
    id: idProduto,
    imagem: imagem || null,
  };

  localStorage.setItem("produto_destaque", JSON.stringify(produtoDestaque));

  // Identificar a raiz do projeto
  const caminhoAtual = window.location.pathname;
  const partes = caminhoAtual.split("/").filter(Boolean);
  const indiceSilas = partes.lastIndexOf("silas.html");

  let raizProjeto;

  if (indiceSilas !== -1) {
    const prefixo = partes.slice(0, indiceSilas).join("/");
    raizProjeto = prefixo ? `/${prefixo}/` : "/";
  } else {
    raizProjeto = caminhoAtual.slice(0, caminhoAtual.lastIndexOf("/") + 1);
  }

  // Abrir Produtos.html preservando o caminho do GitHub Pages
  const destino = `${raizProjeto}silas.html/Produtos.html`;

  window.location.href = destino;
}

/*==========================================================
        LOJA.HTML — BOTÃO "COMPRAR" DOS DESTAQUES
   Lê o produto real do localStorage (preço e stock corretos)
==========================================================*/
function comprarProduto(id) {
  if (typeof Auth !== "undefined" && !Auth.logado()) {
    Auth.pedirLogin("/silas.html/inicio.html");
    return;
  }
  const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
  const produto = lista.find((p) => Number(p.id) === Number(id));

  if (!produto) {
    showToast("Produto não encontrado.");
    return;
  }

  const estoque = Number(produto.stock || 0);

  if (estoque <= 0) {
    showToast("Este produto está esgotado.");
    return;
  }

  carregarCarrinho();

  const existente = procurarProduto(produto.id);

  if (existente) {
    if (existente.quantidade >= estoque) {
      showToast("Stock máximo atingido (" + estoque + ").");
      return;
    }

    existente.quantidade += 1;
  } else {
    cart.push({ ...produto, quantidade: 1 });
  }

  guardarCarrinho();
  atualizarContadorHeader();
  showToast(`"${produto.nome}" adicionado ao carrinho!`);
}

/* Atualiza o contador #contadorCarrinho (se existir na página) */
function atualizarContadorHeader() {
  const contador = document.getElementById("contadorCarrinho");
  if (!contador) return;

  const dados = JSON.parse(localStorage.getItem("carrinho") || "[]");
  const total = dados.reduce((acc, p) => acc + p.quantidade, 0);

  contador.textContent = total;
}

/*==========================================================
            INICIALIZAÇÃO
==========================================================*/
function iniciarCarrinho() {
  carregarCarrinho();
  configurarEventos();
  render();
  atualizarContadorHeader();
}

document.addEventListener("DOMContentLoaded", iniciarCarrinho);
