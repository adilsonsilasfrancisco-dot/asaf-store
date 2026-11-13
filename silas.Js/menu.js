/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const menu = document.querySelector(".nav2 ul");

  if (!hamburger || !menu) {
    console.error("Menu hamburguer ou menu de categorias não encontrado.");
    return;
  }

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    menu.classList.toggle("open");
  });

  /* =====================================================
     DROPDOWNS NO MOBILE
  ===================================================== */

  const dropdowns = document.querySelectorAll(".nav2 .dropdown");

  dropdowns.forEach((dropdown) => {
    const link = dropdown.querySelector(":scope > a");

    if (!link) return;

    link.addEventListener("click", (event) => {
      /* Só controla dropdown no mobile */
      if (window.innerWidth <= 768) {
        event.preventDefault();

        /* Fecha os outros dropdowns */
        dropdowns.forEach((outro) => {
          if (outro !== dropdown) {
            outro.classList.remove("open");
          }
        });

        /* Abre/fecha o atual */
        dropdown.classList.toggle("open");
      }
    });
  });

  /* =====================================================
     FECHAR MENU AO CLICAR NUM LINK NORMAL
  ===================================================== */

  const links = document.querySelectorAll(".nav2 ul li:not(.dropdown) a");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      menu.classList.remove("open");
    });
  });

  /* =====================================================
     FECHAR MENU AO REDIMENSIONAR PARA DESKTOP
  ===================================================== */

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      hamburger.classList.remove("open");
      menu.classList.remove("open");

      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
      });
    }
  });
});
