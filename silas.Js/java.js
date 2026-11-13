/** @format */

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let erro = document.getElementById("erro");

  if (!email.includes("@")) {
    erro.textContent = "Email inválido";
    return;
  }

  if (password.length < 6) {
    erro.textContent = "Senha deve ter pelo menos 6 caracteres";
    return;
  }

  erro.textContent = "Dados válidos!";
});

/* =========================================================
   MENU HAMBÚRGUER - MOBILE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburger || !mobileMenu) return;

  /* Abrir / fechar menu */
  hamburger.addEventListener("click", function () {
    const aberto = mobileMenu.classList.toggle("open");

    hamburger.classList.toggle("open", aberto);

    hamburger.setAttribute("aria-expanded", aberto);
  });

  /* =======================================================
     DROPDOWNS NO MOBILE
  ======================================================= */

  const dropdowns = document.querySelectorAll(".nav2 ul li.dropdown");

  dropdowns.forEach(function (dropdown) {
    const link = dropdown.querySelector(":scope > a");

    if (!link) return;

    link.addEventListener("click", function (event) {
      /*
       * No celular, o dropdown será controlado
       * pelo clique.
       */
      if (window.innerWidth <= 768) {
        event.preventDefault();

        /* Fecha os outros dropdowns */
        dropdowns.forEach(function (outro) {
          if (outro !== dropdown) {
            outro.classList.remove("open");
          }
        });

        /* Abre / fecha o atual */
        dropdown.classList.toggle("open");
      }
    });
  });

  /* =======================================================
     FECHAR MENU AO CLICAR NUM LINK NORMAL
  ======================================================= */

  const linksMenu = mobileMenu.querySelectorAll("li:not(.dropdown) a");

  linksMenu.forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");

      hamburger.classList.remove("open");

      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  /* =======================================================
     SE REDIMENSIONAR PARA DESKTOP
  ======================================================= */

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      mobileMenu.classList.remove("open");

      hamburger.classList.remove("open");

      hamburger.setAttribute("aria-expanded", "false");

      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove("open");
      });
    }
  });
});
