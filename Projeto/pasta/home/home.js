 // Verificar se o usuário está logado
function lerArmazenamento(chave) {
  try {
    return localStorage.getItem(chave);
  } catch (error) {
    console.error(`Erro ao ler ${chave} no armazenamento:`, error);
    return null;
  }
}

function removerArmazenamento(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (error) {
    console.error(`Erro ao remover ${chave} do armazenamento:`, error);
  }
}

    function checkLogin() {
      const loginBtn = document.getElementById("loginBtn");
      const userMenu = document.getElementById("userMenu");
      const userName = document.getElementById("userName");

      if(!loginBtn || !userMenu || !userName) {
        console.warn("Elementos do cabeçalho não encontrados.");
        return;
      }

      const usuarioSalvo = lerArmazenamento("usuario");

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
      removerArmazenamento("usuario");
      removerArmazenamento("senha");
      removerArmazenamento("lembrar");
      checkLogin();
    }

    // Verificar login ao carregar a página
    document.addEventListener("DOMContentLoaded", checkLogin);