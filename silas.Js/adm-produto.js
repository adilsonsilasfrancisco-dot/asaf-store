/** @format */
/*=========================================================
                ASAF ADMIN
                produtos.js
=========================================================*/

/*=========================================================
LOGIN
=========================================================*/

if (localStorage.getItem("adminLogado") != "true") {
  window.location.href = "login-admin.html";
}

/*=========================================================
LOCAL STORAGE
=========================================================*/

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

/*=========================================================
ELEMENTOS
=========================================================*/

const modal = document.getElementById("modalProduto");

const btnNovo = document.getElementById("btnNovo");

const fechar = document.getElementById("fecharModal");

const form = document.getElementById("produtoForm");

const lista = document.getElementById("listaProdutos");

const preview = document.getElementById("previewImagem");

const imagem = document.getElementById("imagem");

let imagemBase64 = "";

let editando = null;

/*=========================================================
ABRIR MODAL
=========================================================*/

btnNovo.onclick = function () {
  editando = null;

  form.reset();

  preview.style.display = "none";

  preview.src = "";

  imagemBase64 = "";

  document.querySelector(".modal-header h2").innerHTML = "Novo Produto";

  modal.classList.add("active");
};

/*=========================================================
FECHAR MODAL
=========================================================*/

fechar.onclick = function () {
  modal.classList.remove("active");
};

window.onclick = function (e) {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
};

/*=========================================================
UPLOAD DA IMAGEM
=========================================================*/

imagem.addEventListener("change", function () {
  const arquivo = this.files[0];

  if (!arquivo) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    imagemBase64 = e.target.result;

    preview.src = imagemBase64;

    preview.style.display = "block";
  };

  reader.readAsDataURL(arquivo);
});

/*=========================================================
CRIAR ID
=========================================================*/

function novoID() {
  if (produtos.length == 0) return 1;

  return Math.max(...produtos.map((p) => p.id)) + 1;
}

/*=========================================================
SALVAR LOCAL STORAGE
=========================================================*/

function salvar() {
  localStorage.setItem(
    "produtos",

    JSON.stringify(produtos),
  );
}

/*=========================================================
FORMATA PREÇO
=========================================================*/

function dinheiro(valor) {
  return Number(valor).toLocaleString("pt-AO") + " Kz";
}

/*=========================================================
ESTADO DO STOCK
=========================================================*/

function estadoProduto(stock) {
  if (stock > 0) {
    return "Disponível";
  }

  return "Esgotado";
}

/*=========================================================
COR DO BADGE
=========================================================*/

function classeEstado(stock) {
  if (stock > 0) {
    return "disponivel";
  }

  return "esgotado";
}
/*=========================================================
                CRUD - PARTE 2
=========================================================*/

/*=========================================================
RENDERIZAR TABELA
=========================================================*/

function renderizarProdutos() {
  lista.innerHTML = "";

  if (produtos.length === 0) {
    lista.innerHTML = `

<tr>

<td colspan="7" style="text-align:center;padding:30px;">

Nenhum produto cadastrado.

</td>

</tr>

`;

    return;
  }

  produtos.forEach((produto) => {
    lista.innerHTML += `

<tr>

<td>

<img

src="${produto.imagem || ""}"

class="produto-img"

>

</td>

<td>${produto.nome}</td>

<td>${produto.categoria}</td>

<td>${dinheiro(produto.preco)}</td>

<td>${produto.stock}</td>

<td>

<span class="badge ${classeEstado(produto.stock)}">

${estadoProduto(produto.stock)}

</span>

</td>

<td>

<div class="acoes">

<button

class="btnEditar"

onclick="editarProduto(${produto.id})">

<i class="fas fa-pen"></i>

</button>

<button

class="btnExcluir"

onclick="eliminarProduto(${produto.id})">

<i class="fas fa-trash"></i>

</button>

</div>

</td>

</tr>

`;
  });
}

/*=========================================================
GUARDAR PRODUTO
=========================================================*/

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const produto = {
    id: editando || novoID(),

    nome: document.getElementById("nome").value,

    categoria: document.getElementById("categoria").value,

    preco: Number(document.getElementById("preco").value),

    stock: Number(document.getElementById("stock").value),

    descricao: document.getElementById("descricao").value,

    imagem: imagemBase64,
  };

  if (editando) {
    const indice = produtos.findIndex((p) => p.id === editando);

    if (produto.imagem === "") {
      produto.imagem = produtos[indice].imagem;
    }

    produtos[indice] = produto;

    toast("Produto atualizado com sucesso.");
  } else {
    produtos.push(produto);

    toast("Produto adicionado com sucesso.");
  }

  salvar();

  renderizarProdutos();

  modal.classList.remove("active");

  form.reset();

  preview.src = "";

  preview.style.display = "none";

  imagemBase64 = "";

  editando = null;
});

/*=========================================================
EDITAR
=========================================================*/

function editarProduto(id) {
  const produto = produtos.find((p) => p.id === id);

  if (!produto) return;

  editando = id;

  document.querySelector(".modal-header h2").innerHTML = "Editar Produto";

  document.getElementById("nome").value = produto.nome;

  document.getElementById("categoria").value = produto.categoria;

  document.getElementById("preco").value = produto.preco;

  document.getElementById("stock").value = produto.stock;

  document.getElementById("descricao").value = produto.descricao;

  imagemBase64 = produto.imagem;

  preview.src = produto.imagem;

  preview.style.display = "block";

  modal.classList.add("active");
}

/*=========================================================
ELIMINAR
=========================================================*/

function eliminarProduto(id) {
  const confirmar = confirm("Deseja realmente eliminar este produto?");

  if (!confirmar) return;

  produtos = produtos.filter((p) => p.id !== id);

  salvar();

  renderizarProdutos();

  toast("Produto eliminado.");
}


/*=========================================================
                CRUD - PARTE 3
=========================================================*/


/*=========================================================
PESQUISA
=========================================================*/

const campoPesquisa=document.getElementById("searchInput");

campoPesquisa.addEventListener("keyup",filtrarProdutos);

document.getElementById("categoryFilter").addEventListener("change",filtrarProdutos);


function filtrarProdutos(){

const texto=campoPesquisa.value.toLowerCase();

const categoria=document.getElementById("categoryFilter").value;

const linhas=lista.querySelectorAll("tr");

linhas.forEach(linha=>{

const colunas=linha.querySelectorAll("td");

if(colunas.length===0)return;

const nome=colunas[1].innerText.toLowerCase();

const cat=colunas[2].innerText;

const pesquisaOK=nome.includes(texto);

const categoriaOK=

categoria==="" ||

cat===categoria;

linha.style.display=

pesquisaOK && categoriaOK

?

""

:

"none";

});

}


/*=========================================================
TOAST
=========================================================*/

function toast(mensagem){

const antigo=document.querySelector(".toast");

if(antigo){

antigo.remove();

}

const div=document.createElement("div");

div.className="toast";

div.innerHTML=mensagem;

document.body.appendChild(div);

setTimeout(()=>{

div.classList.add("show");

},100);

setTimeout(()=>{

div.classList.remove("show");

setTimeout(()=>{

div.remove();

},400);

},3000);

}


/*=========================================================
ATUALIZAR DASHBOARD
=========================================================*/

function atualizarDashboard(){

localStorage.setItem(

"totalProdutos",

produtos.length

);

}


/*=========================================================
LOGOUT
=========================================================*/

function logout(){

if(confirm("Deseja sair do painel administrativo?")){

localStorage.removeItem("adminLogado");

window.location.href="login-admin.html";

}

}


/*=========================================================
ORDENAR POR NOME
=========================================================*/

function ordenarProdutos(){

produtos.sort((a,b)=>

a.nome.localeCompare(b.nome)

);

}


/*=========================================================
VERIFICAR STOCK
=========================================================*/

function verificarStock(){

produtos.forEach(produto=>{

if(produto.stock<5){

console.log(

"Stock baixo:",

produto.nome

);

}

});

}


/*=========================================================
ESTATÍSTICAS
=========================================================*/

function estatisticas(){

const total=produtos.length;

const disponiveis=

produtos.filter(

p=>p.stock>0

).length;

const esgotados=

produtos.filter(

p=>p.stock==0

).length;

console.log("Produtos:",total);

console.log("Disponíveis:",disponiveis);

console.log("Esgotados:",esgotados);

}


/*=========================================================
EXPORTAR PRODUTOS
=========================================================*/

function exportarProdutos(){

const dados=

JSON.stringify(produtos,null,4);

console.log(dados);

}


/*=========================================================
IMPORTAR PRODUTOS
=========================================================*/

function importarProdutos(listaNova){

produtos=listaNova;

salvar();

renderizarProdutos();

}


/*=========================================================
INICIALIZAÇÃO
=========================================================*/

ordenarProdutos();

renderizarProdutos();

verificarStock();

estatisticas();

atualizarDashboard();

console.log("CRUD Produtos iniciado.");