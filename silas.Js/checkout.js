/**
 * ==========================================================
 *              ASAF STORE - CHECKOUT
 * ==========================================================
 *
 * @format
 */

/*==========================================================
                ESTADO
==========================================================*/
let cart = [];
let subtotal = 0;
let desconto = 0;
let total = 0;

/*==========================================================
                LOCAL STORAGE
   Lê tanto "carrinho" (chave original) como "asaf_carrinho"
   (chave usada pelo carrinho-shared.js) — compatível com os dois
==========================================================*/
function carregarCarrinho() {
  /* Tenta ler da chave original primeiro */
  let dados = localStorage.getItem("carrinho");

  /* Se não encontrar, tenta a chave do carrinho-shared.js */
  if (!dados) dados = localStorage.getItem("asaf_carrinho");

  if (!dados) {
    cart = [];
    return;
  }

  const raw = JSON.parse(dados);

  /* Normaliza o array: aceita "quantidade" ou "qty", "imagem" ou "img" */
  cart = raw.map((p) => ({
    id: p.id || "",
    nome: p.nome || p.name || "Produto",
    descricao: p.descricao || p.desc || "",
    preco: Number(p.preco || p.price || 0),
    quantidade: Number(p.quantidade || p.qty || 1),
    imagem: p.imagem || p.img || "",
    categoria: p.categoria || p.category || "",
  }));
}

/*==========================================================
                DESCONTO
   Lê o desconto guardado pelo carrinho (chave "asaf_desconto")
==========================================================*/
function carregarDesconto() {
  try {
    const d = JSON.parse(localStorage.getItem("desconto_carrinho"));
    desconto = d && d.pct ? Math.round((subtotal * d.pct) / 100) : 0;
  } catch {
    desconto = 0;
  }
}

/*==========================================================
                FORMATAÇÃO
==========================================================*/
function fmt(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

/*==========================================================
                CALCULAR TOTAIS
==========================================================*/
function calcularTotais() {
  subtotal = cart.reduce((s, p) => s + p.preco * p.quantidade, 0);
  carregarDesconto(); /* desconto calculado sobre o subtotal */
  total = subtotal - desconto;
}

/*==========================================================
                TOAST
==========================================================*/
function showToast(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/*==========================================================
            RENDERIZAR RESUMO DA ENCOMENDA
==========================================================*/
function renderResumo() {
  carregarCarrinho();
  calcularTotais();

  const lista = document.getElementById("checkout-items");
  if (!lista) return;

  lista.innerHTML = "";

  if (cart.length === 0) {
    lista.innerHTML = `<p class="empty">O carrinho está vazio.
      <a href="produtos.html">Ver produtos</a></p>`;
    atualizarTotais();
    /* Desactivar botão se carrinho vazio */
    const btn = document.getElementById("btn-finalizar");
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = ".5";
      btn.style.cursor = "not-allowed";
    }
    return;
  }

  cart.forEach((produto) => {
    const subtotalProduto = produto.preco * produto.quantidade;
    lista.innerHTML += `
      <div class="checkout-item">
        <div class="checkout-img">
          <img src="${produto.imagem}" alt="${produto.nome}"
               onerror="this.style.display='none'"/>
        </div>
        <div class="checkout-info">
          <h4>${produto.nome}</h4>
          <p>${produto.descricao}</p>
          <small>Quantidade: ${produto.quantidade}</small>
        </div>
        <div class="checkout-price">${fmt(subtotalProduto)}</div>
      </div>`;
  });

  atualizarTotais();
}

/*==========================================================
                ACTUALIZAR TOTAIS NO HTML
==========================================================*/
function atualizarTotais() {
  const subtotalEl = document.getElementById("subtotal");
  const descontoEl = document.getElementById("desconto");
  const totalEl = document.getElementById("total");

  if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
  if (descontoEl)
    descontoEl.textContent = desconto > 0 ? `−${fmt(desconto)}` : "0 Kz";
  if (totalEl) totalEl.textContent = fmt(total);
}

/*==========================================================
                VALIDAR FORMULÁRIO
==========================================================*/
function validarFormulario() {
  const campos = [
    { id: "nome", label: "Nome Completo" },
    { id: "email", label: "Email" },
    { id: "telefone", label: "Telefone" },
    { id: "provincia", label: "Província" },
    { id: "municipio", label: "Município" },
    { id: "bairro", label: "Bairro" },
    { id: "rua", label: "Rua" },
    { id: "numero", label: "Número da Casa" },
  ];

  for (const campo of campos) {
    const el = document.getElementById(campo.id);
    const val = el ? el.value.trim() : "";
    if (!val) {
      showToast(`Preenche o campo: ${campo.label}`);
      if (el) el.focus();
      return null;
    }
  }

  const pagamentoRadio = document.querySelector(
    'input[name="pagamento"]:checked',
  );
  const entregaRadio = document.querySelector('input[name="entrega"]:checked');

  if (!pagamentoRadio) {
    showToast("Selecciona um método de pagamento.");
    return null;
  }
  if (!entregaRadio) {
    showToast("Selecciona um método de entrega.");
    return null;
  }

  return {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    provincia: document.getElementById("provincia").value.trim(),
    municipio: document.getElementById("municipio").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    rua: document.getElementById("rua").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    referencia: document.getElementById("referencia").value.trim(),
    pagamento: pagamentoRadio.value,
    entrega: entregaRadio.value,
  };
}

/*==========================================================
            GERAR CÓDIGO DA ENCOMENDA
==========================================================*/
function gerarCodigo() {
  return "ASAF-" + Date.now().toString(36).toUpperCase();
}

/*==========================================================
            GUARDAR ENCOMENDA NO LOCAL STORAGE
==========================================================*/
function guardarEncomenda(dadosCliente) {
  const encomenda = {
    codigo: gerarCodigo(),
    data: new Date().toLocaleString("pt-PT"),
    cliente: dadosCliente,
    produtos: cart,
    subtotal,
    desconto,
    total,
    estado: "Pendente",
  };

  const encomendas = JSON.parse(localStorage.getItem("encomendas")) || [];
  encomendas.push(encomenda);
  localStorage.setItem("encomendas", JSON.stringify(encomendas));

  /* Guarda a última encomenda separadamente para a página de sucesso ler */
  localStorage.setItem("ultima_encomenda", JSON.stringify(encomenda));
}

/*==========================================================
            FINALIZAR COMPRA
==========================================================*/
function finalizarCompra() {
  if (cart.length === 0) {
    showToast("O carrinho está vazio.");
    return;
  }

  const cliente = validarFormulario();
  if (!cliente) return;

  guardarEncomenda(cliente);

  /* Limpar carrinho e desconto */
  localStorage.removeItem("carrinho");
  localStorage.removeItem("desconto_carrinho");

  showToast("Compra realizada com sucesso! ✓");

  setTimeout(() => {
    window.location.href = "sucesso.html";
  }, 1500);
}

/*==========================================================
                EVENTOS
==========================================================*/
function configurarEventos() {
  const btnFinalizar = document.getElementById("btn-finalizar");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", function (e) {
      e.preventDefault();
      finalizarCompra();
    });
  }
}

/*==========================================================
                INICIALIZAÇÃO
==========================================================*/
function iniciarCheckout() {
  renderResumo();
  configurarEventos();
}

document.addEventListener("DOMContentLoaded", iniciarCheckout);
