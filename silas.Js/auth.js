/** @format */
/**
 * ==========================================================
 *                  ASAF STORE - AUTENTICAÇÃO
 * ==========================================================
 * Registo, login, sessão e proteção de páginas.
 * Tudo é guardado no localStorage (só no navegador).
 */

const Auth = (function () {
  /* ---------- CONFIGURAÇÃO ---------- */

  // Compatibilidade com GitHub Pages e execução local.
  const BASE_PATH = location.hostname.endsWith("github.io")
    ? "/asaf-store"
    : "";

  const PAGINA_LOGIN = `${BASE_PATH}/silas.html/LOGIN.HTML`;
  const PAGINA_INICIAL = `${BASE_PATH}/silas.html/inicio.html`;

  const CH_USUARIOS = "usuarios";
  const CH_SESSAO = "sessao";
  const CH_TENTATIVAS = "login_tentativas";

  const MAX_TENTATIVAS = 5;
  const BLOQUEIO_MS = 30000;

  /* ---------- LOCAL STORAGE ---------- */

  function ler(chave, padrao) {
    try {
      const v = JSON.parse(localStorage.getItem(chave));
      return v === null || v === undefined ? padrao : v;
    } catch (e) {
      return padrao;
    }
  }

  function gravar(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  /* ---------- HASH DA PALAVRA-PASSE ---------- */

  function cyrb53(str, seed) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;

    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);

    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  function gerarHash(sal, senha) {
    return cyrb53(sal + senha, 1) + cyrb53(senha + sal, 2);
  }

  function novoSal() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /* ---------- UTILITÁRIOS ---------- */

  function normalizar(texto) {
    return String(texto || "")
      .trim()
      .toLowerCase();
  }

  function erro(texto) {
    return { ok: false, erro: texto };
  }

  /* ---------- SESSÃO ---------- */

  function sessao() {
    return ler(CH_SESSAO, null);
  }

  function logado() {
    return !!sessao();
  }

  function criarSessao(utilizador) {
    gravar(CH_SESSAO, {
      id: utilizador.id,
      usuario: utilizador.usuario,
      email: utilizador.email,
      entrouEm: new Date().toISOString(),
    });
  }

  function sair() {
    localStorage.removeItem(CH_SESSAO);
    location.replace(PAGINA_LOGIN);
  }

  /* ---------- DESTINO SEGURO ---------- */

  function destinoSeguro() {
    const next = new URLSearchParams(location.search).get("next");

    if (
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/\\")
    ) {
      return next;
    }

    return PAGINA_INICIAL;
  }

  /* ---------- PROTEÇÃO DE PÁGINAS ---------- */

  // Páginas exclusivas para membros.
  function exigir() {
    function verificar() {
      if (!logado()) {
        const atual = location.pathname + location.search + location.hash;

        location.replace(PAGINA_LOGIN + "?next=" + encodeURIComponent(atual));
      }
    }

    verificar();

    // Verifica novamente ao voltar atrás no navegador.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) verificar();
    });

    // Verifica quando a sessão termina noutro separador.
    window.addEventListener("storage", function (e) {
      if (e.key === CH_SESSAO) verificar();
    });
  }

  // Vitrine: quem já tem sessão vai para o início de membros.
  function vitrine() {
    if (logado()) location.replace(PAGINA_INICIAL);

    window.addEventListener("pageshow", function (e) {
      if (e.persisted && logado()) {
        location.replace(PAGINA_INICIAL);
      }
    });
  }

  // Páginas de login/registo.
  function somenteVisitante() {
    if (logado()) location.replace(destinoSeguro());
  }

  // Solicita login e guarda o destino pretendido.
  function pedirLogin(destino) {
    const caminho =
      destino || location.pathname + location.search + location.hash;

    location.href = PAGINA_LOGIN + "?next=" + encodeURIComponent(caminho);
  }

  /* ---------- BLOQUEIO POR TENTATIVAS ---------- */

  function segundosBloqueio() {
    const t = ler(CH_TENTATIVAS, { n: 0, ate: 0 });

    return t.ate > Date.now() ? Math.ceil((t.ate - Date.now()) / 1000) : 0;
  }

  function registarFalha() {
    const t = ler(CH_TENTATIVAS, { n: 0, ate: 0 });

    t.n++;

    if (t.n >= MAX_TENTATIVAS) {
      t.ate = Date.now() + BLOQUEIO_MS;
      t.n = 0;
    }

    gravar(CH_TENTATIVAS, t);
  }

  /* ---------- REGISTO ---------- */

  function registar(usuario, email, senha) {
    usuario = String(usuario || "").trim();
    email = String(email || "").trim();
    senha = String(senha || "");

    if (!/^[\p{L}\d._-]{3,20}$/u.test(usuario)) {
      return erro(
        "O usuário deve ter 3 a 20 caracteres (letras, números, ponto, hífen ou _), sem espaços.",
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return erro("Introduz um email válido.");
    }

    if (senha.length < 6 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      return erro(
        "A palavra-passe deve ter pelo menos 6 caracteres, com letras e números.",
      );
    }

    const lista = ler(CH_USUARIOS, []);

    if (lista.some((u) => normalizar(u.email) === normalizar(email))) {
      return erro("Já existe uma conta com este email.");
    }

    if (lista.some((u) => normalizar(u.usuario) === normalizar(usuario))) {
      return erro("Este usuário já está em uso.");
    }

    const sal = novoSal();

    const novo = {
      id: Date.now(),
      usuario: usuario,
      email: email,
      sal: sal,
      hash: gerarHash(sal, senha),
      criadoEm: new Date().toISOString(),
    };

    lista.push(novo);
    gravar(CH_USUARIOS, lista);

    criarSessao(novo);

    return { ok: true };
  }

  /* ---------- LOGIN ---------- */

  function entrar(identificador, senha) {
    const espera = segundosBloqueio();

    if (espera > 0) {
      return erro("Demasiadas tentativas. Tenta novamente em " + espera + "s.");
    }

    const id = normalizar(identificador);

    if (!id || !senha) {
      return erro("Preenche o email ou usuário e a palavra-passe.");
    }

    const utilizador = ler(CH_USUARIOS, []).find(
      (u) => normalizar(u.email) === id || normalizar(u.usuario) === id,
    );

    if (utilizador && gerarHash(utilizador.sal, senha) === utilizador.hash) {
      localStorage.removeItem(CH_TENTATIVAS);
      criarSessao(utilizador);
      return { ok: true };
    }

    registarFalha();

    return erro("Email/usuário ou palavra-passe incorretos.");
  }

  /* ---------- INTERFACE ---------- */

  function mostrar(el, tipo, texto) {
    if (!el) return;

    el.className = "msg " + tipo;
    el.textContent = texto;
  }

  function ligarFormularios() {
    const msg = document.getElementById("msg");
    const campoSenha = document.getElementById("senha");
    const botaoVer = document.getElementById("verSenha");

    // Mostrar / esconder palavra-passe.
    if (botaoVer && campoSenha) {
      botaoVer.addEventListener("click", function () {
        const vai = campoSenha.type === "password";

        campoSenha.type = vai ? "text" : "password";
        botaoVer.innerHTML = vai ? "&#128275;" : "&#128274;";
      });
    }

    // Formulário de login.
    const formLogin = document.getElementById("loginForm");

    if (formLogin) {
      formLogin.addEventListener("submit", function (e) {
        e.preventDefault();

        const r = entrar(
          document.getElementById("identificador").value,
          campoSenha.value,
        );

        if (r.ok) {
          mostrar(msg, "ok", "Sessão iniciada. A entrar...");
          location.replace(destinoSeguro());
        } else {
          mostrar(msg, "erro", r.erro);
        }
      });
    }

    // Formulário de registo.
    const formCadastro = document.getElementById("cadastroForm");

    if (formCadastro) {
      formCadastro.addEventListener("submit", function (e) {
        e.preventDefault();

        const r = registar(
          document.getElementById("usuario").value,
          document.getElementById("email").value,
          campoSenha.value,
        );

        if (r.ok) {
          mostrar(msg, "ok", "Conta criada! A entrar na loja...");
          location.replace(destinoSeguro());
        } else {
          mostrar(msg, "erro", r.erro);
        }
      });
    }
  }

  /* ---------- BOTÃO SAIR ---------- */

  function ligarBotaoSair() {
    const s = sessao();
    const botao = document.getElementById("btn");

    if (!s || !botao) return;

    botao.textContent = "Sair";
    botao.href = "#";
    botao.title = "Sessão de " + s.usuario;

    botao.addEventListener("click", function (e) {
      e.preventDefault();
      sair();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ligarFormularios();
    ligarBotaoSair();
  });

  return {
    exigir: exigir,
    vitrine: vitrine,
    somenteVisitante: somenteVisitante,
    pedirLogin: pedirLogin,
    sair: sair,
    sessao: sessao,
    logado: logado,
  };
})();
