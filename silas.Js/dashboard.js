/**
 * ============================================
 *          ASAF ADMIN DASHBOARD
 * ============================================
 * dashboard.js
 * @format
 */

/*==================================================
            VARIÁVEIS GLOBAIS
==================================================*/
let produtos   = [];
let encomendas = [];
let clientes   = [];
let receitaTotal = 0;
let grafico    = null;

/*==================================================
            FORMATAÇÃO
==================================================*/
function fmt(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

/*==================================================
            LOCAL STORAGE
==================================================*/
function carregarDados() {
  produtos   = JSON.parse(localStorage.getItem("produtos"))   || [];
  encomendas = JSON.parse(localStorage.getItem("encomendas")) || [];
  clientes   = JSON.parse(localStorage.getItem("clientes"))   || [];
}

/*==================================================
            CONTADOR ANIMADO
==================================================*/
function contador(id, valorFinal, moeda = false) {
  const elemento = document.getElementById(id);
  if (!elemento) return;

  let atual = 0;
  const incremento = Math.max(1, Math.ceil(valorFinal / 60));

  const intervalo = setInterval(() => {
    atual += incremento;
    if (atual >= valorFinal) {
      atual = valorFinal;
      clearInterval(intervalo);
    }
    elemento.textContent = moeda ? fmt(atual) : atual;
  }, 20);
}

/*==================================================
            ATUALIZAR CARDS
==================================================*/
function atualizarDashboard() {
  carregarDados();

  receitaTotal = 0;
  let pendentes   = 0;
  let confirmadas = 0;
  let enviadas    = 0;
  let entregues   = 0;

  encomendas.forEach((encomenda) => {
    receitaTotal += Number(encomenda.total || 0);
    switch (encomenda.estado) {
      case "Pendente":   pendentes++;   break;
      case "Confirmada": confirmadas++; break;
      case "Enviada":    enviadas++;    break;
      case "Entregue":   entregues++;   break;
    }
  });

  contador("produtos",    produtos.length);
  contador("clientes",    clientes.length);
  contador("pedidos",     encomendas.length);
  contador("receita",     receitaTotal, true);
  contador("pendentes",   pendentes);
  contador("confirmadas", confirmadas);
  contador("enviadas",    enviadas);
  contador("entregues",   entregues);
}

/*==================================================
            RESUMO GERAL
==================================================*/
function carregarResumo() {
  const resumo = document.getElementById("resumoDashboard");
  if (!resumo) return;

  resumo.innerHTML = `
    <div class="resumo-item">
      <span>Total de Produtos</span>
      <strong>${produtos.length}</strong>
    </div>
    <div class="resumo-item">
      <span>Total de Clientes</span>
      <strong>${clientes.length}</strong>
    </div>
    <div class="resumo-item">
      <span>Total de Encomendas</span>
      <strong>${encomendas.length}</strong>
    </div>
    <div class="resumo-item">
      <span>Receita Total</span>
      <strong>${fmt(receitaTotal)}</strong>
    </div>`;
}

/*==================================================
            DATA ACTUAL
==================================================*/
function atualizarData() {
  const el = document.getElementById("dataAtual");
  if (!el) return;

  const hoje = new Date();
  el.textContent = hoje.toLocaleDateString("pt-PT", {
    weekday: "long",
    day:     "2-digit",
    month:   "long",
    year:    "numeric",
  });
}

/*==================================================
            ÚLTIMAS ENCOMENDAS
==================================================*/
function carregarUltimasEncomendas() {
  const tabela = document.getElementById("ordersTable");
  if (!tabela) return;

  tabela.innerHTML = "";

  if (encomendas.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#888;padding:24px">
          Nenhuma encomenda encontrada.
        </td>
      </tr>`;
    return;
  }

  const ultimas = [...encomendas].reverse().slice(0, 5);

  ultimas.forEach((encomenda) => {
    let badge = "warning";
    switch (encomenda.estado) {
      case "Confirmada": badge = "success"; break;
      case "Enviada":    badge = "info";    break;
      case "Entregue":   badge = "success"; break;
      case "Cancelada":  badge = "danger";  break;
    }

    const produto = encomenda.produtos && encomenda.produtos.length > 0
      ? encomenda.produtos[0].nome
      : "—";

    const nomeCliente = encomenda.cliente
      ? encomenda.cliente.nome
      : "—";

    tabela.innerHTML += `
      <tr>
        <td>${encomenda.codigo || "—"}</td>
        <td>${nomeCliente}</td>
        <td>${produto}</td>
        <td>${fmt(encomenda.total)}</td>
        <td><span class="badge ${badge}">${encomenda.estado}</span></td>
      </tr>`;
  });
}

/*==================================================
            ATIVIDADE RECENTE
==================================================*/
function carregarAtividades() {
  const lista = document.getElementById("activityList");
  if (!lista) return;

  lista.innerHTML = "";

  if (encomendas.length === 0) {
    lista.innerHTML = `
      <div class="activity-item">
        <h4>Nenhuma atividade</h4>
        <p>Ainda não existem encomendas.</p>
      </div>`;
    return;
  }

  const recentes = [...encomendas].reverse().slice(0, 6);

  recentes.forEach((e) => {
    const nome = e.cliente ? e.cliente.nome : "Cliente";
    lista.innerHTML += `
      <div class="activity-item">
        <div>
          <h4>Nova encomenda — ${e.codigo || ""}</h4>
          <p>${nome} realizou uma compra de <strong>${fmt(e.total)}</strong></p>
        </div>
      </div>`;
  });
}

/*==================================================
            PRODUTOS MAIS VENDIDOS
==================================================*/
function carregarProdutosMaisVendidos() {
  const area = document.getElementById("bestProducts");
  if (!area) return;

  area.innerHTML = "";

  const ranking = {};

  encomendas.forEach((encomenda) => {
    if (!encomenda.produtos) return;
    encomenda.produtos.forEach((produto) => {
      if (!ranking[produto.nome]) ranking[produto.nome] = 0;
      ranking[produto.nome] += Number(produto.quantidade || 1);
    });
  });

  const lista = Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (lista.length === 0) {
    area.innerHTML = `<p style="color:#888;font-size:13px">Sem vendas registadas.</p>`;
    return;
  }

  lista.forEach(([nome, vendas]) => {
    area.innerHTML += `
      <div class="best-item">
        <span>${nome}</span>
        <strong>${vendas} venda${vendas !== 1 ? "s" : ""}</strong>
      </div>`;
  });
}

/*==================================================
            GRÁFICO DE RECEITA MENSAL
            ── CORRIGIDO: só corre depois do
               Chart.js estar carregado ──
==================================================*/
function criarGrafico() {
  /* Espera o Chart.js estar disponível */
  if (typeof Chart === "undefined") {
    setTimeout(criarGrafico, 100);
    return;
  }

  const canvas = document.getElementById("graficoVendas");
  if (!canvas) return;

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun",
                  "Jul","Ago","Set","Out","Nov","Dez"];
  const vendas = new Array(12).fill(0);

  encomendas.forEach((encomenda) => {
    if (!encomenda.data) return;
    /* Suporta tanto Date() como string "dd/mm/yyyy, hh:mm:ss" */
    const data = new Date(encomenda.data);
    if (isNaN(data.getTime())) return;
    const mes = data.getMonth();
    vendas[mes] += Number(encomenda.total || 0);
  });

  if (grafico) {
    grafico.destroy();
    grafico = null;
  }

  const wrapper = canvas.parentElement;
  wrapper.style.position = "relative";
  wrapper.style.width    = "100%";
  wrapper.style.height   = "300px";

  grafico = new Chart(canvas, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [{
        label: "Receita (Kz)",
        data: vendas,
        backgroundColor: "#2a78d6cc",
        hoverBackgroundColor: "#2a78d6",
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => " " + fmt(ctx.parsed.y),
          },
          backgroundColor: "#fff",
          titleColor: "#0b0b0b",
          bodyColor: "#52514e",
          borderColor: "rgba(11,11,11,.1)",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#898781", font: { size: 12, family: "Poppins, sans-serif" } },
          border: { color: "#c3c2b7" },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#e1e0d9", lineWidth: 1 },
          border: { display: false },
          ticks: {
            color: "#898781",
            font: { size: 11, family: "Poppins, sans-serif" },
            callback: val => {
              if (val === 0) return "0";
              if (val >= 1000000) return (val / 1000000).toFixed(1) + "M Kz";
              if (val >= 1000)    return (val / 1000).toFixed(0) + "K Kz";
              return val;
            },
          },
        },
      },
    },
  });
}

/*==================================================
            TOAST
==================================================*/
function toast(texto) {
  /* Remove toast anterior se existir */
  const anterior = document.querySelector(".toast-admin");
  if (anterior) anterior.remove();

  const t = document.createElement("div");
  t.className     = "toast toast-admin";
  t.textContent   = texto;
  t.style.cssText = `
    position:fixed;bottom:28px;right:28px;
    background:#111827;color:#fff;
    padding:14px 22px;border-radius:10px;
    font-size:13px;font-family:Poppins,sans-serif;
    opacity:0;visibility:hidden;
    transition:.3s;z-index:9999;
    box-shadow:0 8px 24px rgba(0,0,0,.2);`;

  document.body.appendChild(t);

  setTimeout(() => { t.style.opacity = "1"; t.style.visibility = "visible"; }, 50);
  setTimeout(() => {
    t.style.opacity = "0"; t.style.visibility = "hidden";
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

/*==================================================
            LOGOUT
==================================================*/
function logout() {
  localStorage.removeItem("adminLogado");
  window.location.href = "login-admin.html";
}

/*==================================================
            MENU TOGGLE (mobile)
==================================================*/
const toggle = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");

if (toggle && sidebar) {
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

/*==================================================
            LOADER
==================================================*/
window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  if (loader) setTimeout(() => loader.classList.add("hide"), 700);
});

/*==================================================
            INICIALIZAÇÃO
            ── CORRIGIDO: verificação de login
               dentro do DOMContentLoaded para
               não bloquear o render ──
==================================================*/
document.addEventListener("DOMContentLoaded", () => {

  /* ── Verificar login ── */
  if (localStorage.getItem("adminLogado") !== "true") {
    window.location.href = "login-admin.html";
    return; /* Para aqui — não continua a inicializar */
  }

  /* ── Carregar tudo ── */
  atualizarDashboard();
  carregarResumo();
  carregarUltimasEncomendas();
  carregarProdutosMaisVendidos();
  carregarAtividades();
  atualizarData();
  criarGrafico();

  setTimeout(() => toast("Bem-vindo ao Painel Administrativo ASAF."), 600);
});