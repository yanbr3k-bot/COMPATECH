function mostrarCadastro() {
  const loginBox = document.getElementById("loginBox");
  const cadastroBox = document.getElementById("cadastroBox");
  loginBox.classList.remove("show");
  setTimeout(() => {
    loginBox.classList.add("hidden");
    cadastroBox.classList.remove("hidden");
    setTimeout(() => cadastroBox.classList.add("show"), 10);
  }, 300);
}

function mostrarLogin() {
  const loginBox = document.getElementById("loginBox");
  const cadastroBox = document.getElementById("cadastroBox");
  cadastroBox.classList.remove("show");
  setTimeout(() => {
    cadastroBox.classList.add("hidden");
    loginBox.classList.remove("hidden");
    setTimeout(() => loginBox.classList.add("show"), 10);
  }, 300);
}

function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senhaLogin").value;
  const erro = document.getElementById("erroLogin");

  if(usuario === localStorage.getItem("usuario") && senha === localStorage.getItem("senha")) {
    alert("Login realizado com sucesso!"); window.location.href = "../home/home.html";
  } else {
    erro.textContent = "Usuário ou senha inválidos!";
  }


}

function cadastrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senhaCadastro").value;
  const confirmar = document.getElementById("confirmarSenha").value;
  const erro = document.getElementById("erroCadastro");
  const cpf = document.getElementById("cpfCadastro").value;
  const cep = document.getElementById("cepCadastro").value;

  if(!nome || !email || !senha || !confirmar || !cpf || !cep) {
    erro.textContent = "Por favor, preencha todos os campos!";
    return;
  }

  if(senha !== confirmar) {
    erro.textContent = "As senhas não coincidem!";
    return;
  }

  if(senha.length < 6) {
    erro.textContent = "A senha deve ter pelo menos 6 caracteres!";
    return;
  }

  erro.textContent = "";
  alert("Cadastro realizado com sucesso!");
  localStorage.setItem("usuario", nome);
  localStorage.setItem("senha", senha);
  mostrarLogin();

  // ================= LOGIN =================
function login(){
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senhaLogin").value;
  const lembrar = document.getElementById("lembrar").checked;

  const erro = document.getElementById("erroLogin");

  const userSalvo = JSON.parse(localStorage.getItem("usuario"));

  if(!userSalvo){
    erro.innerText = "Usuário não cadastrado!";
    return;
  }

  if(usuario === userSalvo.usuario && senha === userSalvo.senha){

    erro.innerText = "";

    // 🔥 SALVAR OU REMOVER "LEMBRAR LOGIN"
    if(lembrar){
      localStorage.setItem("lembrar", "true");
    } else {
      localStorage.removeItem("lembrar");
    }

    alert("Login realizado com sucesso!");
    
  } else {
    erro.innerText = "Usuário ou senha incorretos!";
  }

}


// ================= CADASTRO =================
function cadastrar(){
  const usuario = document.getElementById("nome").value;
  const senha = document.getElementById("senhaCadastro").value;
  const confirmar = document.getElementById("confirmarSenha").value;

  const erro = document.getElementById("erroCadastro");

  if(senha !== confirmar){
    erro.innerText = "Senhas não coincidem!";
    return;
  }

  const user = {
    usuario: usuario,
    senha: senha
  };

  localStorage.setItem("usuario", JSON.stringify(user));

  alert("Cadastro realizado!");
  mostrarLogin();
}

}
async function buscarCEP() {
    const cep = document.getElementById("cepCadastro").value.replace(/\D/g, ''); // Remove caracteres não numéricos [2]
    if (cep.length !== 8) return alert('CEP inválido'); // Validação básica [14]

    try {
        const response= await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json(); // Converte resposta para JSON [1]

        if (data.erro) {
            alert('CEP não encontrado');
            return;
        }

        // Preenchendo campos
        document.getElementById('rua').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade;
        document.getElementById('estado').value = data.uf;
    } catch (error) {
        console.error('Erro ao buscar o CEP:', error);
      }
}
    function mascaraCPF(i) {
   let v = i.value;
   
   // Impede que o usuário digite letras
   if (isNaN(v[v.length-1])) {
      i.value = v.substring(0, v.length-1);
      return;
   }
   
   i.setAttribute("maxlength", "14");
   if (v.length == 3 || v.length == 7) i.value += ".";
   if (v.length == 11) i.value += "-";
  }

// CONTROLE DE ETAPA
let etapa = 0; // 0 = intro | 1 = pan | 2 = login

function irParaLogin(){
  // cancela tudo e vai direto pro login
  intro.classList.add("hidden");
  pan.classList.add("hidden");

  loginScreen.classList.remove("hidden");
  document.getElementById("loginBox").classList.add("show");
  document.getElementById("login").style.setProperty('--bg-opacity','1');

  etapa = 2;
}

// CLIQUE NA TELA
document.addEventListener("click", () => {

  if(etapa === 0){
    // pula intro → pan → login direto
    irParaLogin();
  }

});

setTimeout(() => {
  intro.classList.add("zoom");
}, 6000);

setTimeout(() => {
  if(etapa !== 0) return; // se já clicou, cancela

  switchScreen(intro, pan);
  panImg.classList.add("pan-run");
  etapa = 1;

}, 8200);

setTimeout(() => {
  if(etapa !== 1) return; // se já pulou, cancela

  switchScreen(pan, loginScreen);
  document.getElementById("loginBox").classList.add("show");
  document.getElementById("login").style.setProperty('--bg-opacity','1');

  etapa = 2;

}, 9900);

