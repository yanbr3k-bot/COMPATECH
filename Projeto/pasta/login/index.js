function lerArmazenamento(chave) {
  try {
    return localStorage.getItem(chave);
  } catch (error) {
    console.error(`Erro ao ler ${chave} no armazenamento:`, error);
    erroArmazenamento = true;
    return null;
  }
}

function salvarArmazenamento(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${chave} no armazenamento:`, error);
    return false;
  }
}

let erroArmazenamento = false;

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
  erroArmazenamento = false;
  const usuarioSalvo = lerArmazenamento("usuario");
  const senhaSalva = lerArmazenamento("senha");

  if(erroArmazenamento) {
    erro.textContent = "Não foi possível ler seus dados neste navegador.";
  } else if(usuario === usuarioSalvo && senha === senhaSalva) {
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
  const usuarioSalvo = salvarArmazenamento("usuario", nome);
  const senhaSalva = salvarArmazenamento("senha", senha);
  if(!usuarioSalvo || !senhaSalva) {
    erro.textContent = "Não foi possível salvar seus dados neste navegador.";
    return;
  }

  alert("Cadastro realizado com sucesso!");
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
    const erro = document.getElementById("erroCadastro");
    if (cep.length !== 8) {
        console.error('CEP inválido:', cep);
        erro.textContent = 'CEP inválido.';
        return;
    }

    try {
        const response= await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('HTTP ' + response.status + ' ao buscar o CEP');
        const data = await response.json(); // Converte resposta para JSON [1]

        if (data.erro) {
            console.error('CEP não encontrado:', cep);
            erro.textContent = 'CEP não encontrado.';
            return;
        }

        // Preenchendo campos
        preencherCampo('rua', data.logradouro);
        preencherCampo('bairro', data.bairro);
        preencherCampo('cidade', data.localidade);
        preencherCampo('estado', data.uf);
        erro.textContent = "";
    } catch (error) {
        console.error('Erro ao buscar o CEP:', error);
        erro.textContent = 'Não foi possível buscar o CEP. Tente novamente.';
      }
}

function preencherCampo(id, valor) {
    const campo = document.getElementById(id);
    if (!campo) {
        console.warn(`Campo #${id} não encontrado.`);
        return;
    }
    campo.value = valor || "";
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

