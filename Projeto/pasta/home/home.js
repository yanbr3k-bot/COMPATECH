 // Verificar se o usuário está logado
    function checkLogin() {
      const usuarioSalvo = localStorage.getItem("usuario");
      const loginBtn = document.getElementById("loginBtn");
      const userMenu = document.getElementById("userMenu");
      const userName = document.getElementById("userName");

      if(usuarioSalvo) {
        loginBtn.classList.add("hidden");
        userMenu.classList.remove("hidden");
        userName.textContent = usuarioSalvo;
      } else {
        loginBtn.classList.remove("hidden");
        userMenu.classList.add("hidden");
        loginBtn.onclick = function() {
          window.location.href = "../login/index.html";
        };
      }
    }

    // Fazer logout
    function logout() {
      localStorage.removeItem("usuario");
      localStorage.removeItem("senha");
      localStorage.removeItem("lembrar");
      checkLogin();
    }

    // Verificar login ao carregar a página
    document.addEventListener("DOMContentLoaded", checkLogin);