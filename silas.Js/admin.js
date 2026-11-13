/** @format */

const form = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const msg = document.getElementById("msg");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (email.value === "admin@asaf.com" && password.value === "123456") {
    localStorage.setItem("adminLogado", "true");

    msg.style.color = "green";

    msg.innerHTML = "Login realizado com sucesso...";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } else {
    msg.style.color = "red";

    msg.innerHTML = "Email ou palavra-passe incorretos.";
  }
});
