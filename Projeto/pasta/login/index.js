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

if (localStorage.getItem("senha") !== null || localStorage.getItem("usuario") !== null) {
  localStorage.removeItem("usuario");
  localStorage.removeItem("senha");
  localStorage.removeItem("lembrar");
}

function bytesParaHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function gerarSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesParaHex(bytes);
}

async function hashSenha(senha, salt) {
  const dados = new TextEncoder().encode(`${salt}:${senha}`);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return bytesParaHex(new Uint8Array(hash));
}

function cpfValido(cpf) {
  const numeros = String(cpf).replace(/\D/g, "");
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(numeros[i]) * (10 - i);
  let resto = soma % 11;
  let digito = resto < 2 ? 0 : 11 - resto;
  if (digito !== Number(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(numeros[i]) * (11 - i);
  resto = soma % 11;
  digito = resto < 2 ? 0 : 11 - resto;
  return digito === Number(numeros[10]);
}

async function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senhaLogin").value;
  const lembrar = document.getElementById("lembrar").checked;
  const erro = document.getElementById("erroLogin");
  const registroSalvo = localStorage.getItem("compatech_usuario");
  let registro;

  try {
    registro = registroSalvo ? JSON.parse(registroSalvo) : null;
  } catch (error) {
    erro.textContent = "Usuário não cadastrado!";
    return;
  }

  if (!registro || typeof registro.usuario !== "string" ||
      typeof registro.salt !== "string" || typeof registro.hash !== "string") {
    erro.textContent = "Usuário não cadastrado!";
    return;
  }

  const hash = await hashSenha(senha, registro.salt);

  if (usuario === registro.usuario && hash === registro.hash) {
    erro.textContent = "";
    if (lembrar) {
      localStorage.setItem("lembrar", "true");
    } else {
      localStorage.removeItem("lembrar");
    }
    localStorage.setItem("compatech_sessao", registro.usuario);
    alert("Login realizado com sucesso!");
    window.location.href = "../home/home.html";
  } else {
    erro.textContent = "Usuário ou senha inválidos!";
  }
}

async function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senhaCadastro").value;
  const confirmar = document.getElementById("confirmarSenha").value;
  const erro = document.getElementById("erroCadastro");
  const cpf = document.getElementById("cpfCadastro").value;
  const cep = document.getElementById("cepCadastro").value;

  if(!nome || !email || !senha || !confirmar || !cpf || !cep) {
    erro.textContent = "Por favor, preencha todos os campos!";
    return;
  }

  if(nome.length < 2) {
    erro.textContent = "O nome deve ter pelo menos 2 caracteres!";
    return;
  }

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    erro.textContent = "Informe um email válido!";
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

  if(!cpfValido(cpf)) {
    erro.textContent = "CPF inválido!";
    return;
  }

  if(cep.replace(/\D/g, "").length !== 8) {
    erro.textContent = "CEP inválido!";
    return;
  }

  const salt = gerarSalt();
  const hash = await hashSenha(senha, salt);
  const registro = { usuario: nome, email, salt, hash };

  erro.textContent = "";
  localStorage.setItem("compatech_usuario", JSON.stringify(registro));
  alert("Cadastro realizado com sucesso!");
  mostrarLogin();
}

async function buscarCEP() {
    const cep = document.getElementById("cepCadastro").value.replace(/\D/g, ''); // Remove caracteres não numéricos [2]
    if (cep.length !== 8) return alert('CEP inválido'); // Validação básica [14]

    try {
        const response= await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json(); // Converte resposta para JSON [1]

        if (data.erro) {
            alert('CEP não encontrado');
            return;
        }

        [['rua', 'logradouro'], ['bairro', 'bairro'], ['cidade', 'localidade'], ['estado', 'uf']]
          .forEach(([id, campo]) => {
              const elemento = document.getElementById(id);
              if (elemento) elemento.value = data[campo] ?? "";
          });
    } catch (error) {
        console.error('Erro ao buscar o CEP:', error);
        document.getElementById("erroCadastro").textContent = "Não foi possível buscar o CEP. Tente novamente.";
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
