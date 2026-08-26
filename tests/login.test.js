import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, loadScript } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/login/index.js";

function setUpDom() {
  document.body.innerHTML = `
    <div id="intro"></div>
    <div id="pan"><img id="panImg"></div>
    <div id="loginScreen" class="hidden">
      <div id="login">
        <div id="loginBox">
          <input id="usuario">
          <input id="senhaLogin" type="password">
          <input id="lembrar" type="checkbox">
          <span id="erroLogin"></span>
        </div>
        <div id="cadastroBox" class="hidden">
          <input id="nome">
          <input id="email">
          <input id="senhaCadastro" type="password">
          <input id="confirmarSenha" type="password">
          <input id="cpfCadastro">
          <input id="cepCadastro">
          <input id="rua"><input id="bairro"><input id="cidade"><input id="estado">
          <span id="erroCadastro"></span>
        </div>
      </div>
    </div>
  `;

  // O script usa `intro`, `pan`, `panImg` e `loginScreen` como variaveis globais
  // implicitas, algo que o navegador cria a partir dos ids dos elementos.
  for (const id of ["intro", "pan", "panImg", "loginScreen"]) {
    globalThis[id] = document.getElementById(id);
  }
}

function preencherCadastro(campos) {
  for (const [id, valor] of Object.entries(campos)) document.getElementById(id).value = valor;
}

const CADASTRO_VALIDO = {
  nome: "Yan",
  email: "yan@example.com",
  senhaCadastro: "123456",
  confirmarSenha: "123456",
  cpfCadastro: "111.444.777-35",
  cepCadastro: "01001000",
};

describe("login/index.js", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    setUpDom();
    vi.stubGlobal("alert", vi.fn());
    loadScript(SCRIPT);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("alternancia entre os formularios", () => {
    it("mostrarCadastro esconde o login depois da animacao", () => {
      mostrarCadastro();

      expect(document.getElementById("loginBox").classList.contains("show")).toBe(false);
      expect(document.getElementById("cadastroBox").classList.contains("hidden")).toBe(true);

      vi.advanceTimersByTime(300);
      expect(document.getElementById("loginBox").classList.contains("hidden")).toBe(true);
      expect(document.getElementById("cadastroBox").classList.contains("hidden")).toBe(false);

      vi.advanceTimersByTime(10);
      expect(document.getElementById("cadastroBox").classList.contains("show")).toBe(true);
    });

    it("mostrarLogin volta para o formulario de login", () => {
      mostrarLogin();
      vi.advanceTimersByTime(310);

      expect(document.getElementById("cadastroBox").classList.contains("hidden")).toBe(true);
      expect(document.getElementById("loginBox").classList.contains("hidden")).toBe(false);
      expect(document.getElementById("loginBox").classList.contains("show")).toBe(true);
    });
  });

  describe("cadastrar", () => {
    it("exige que todos os campos sejam preenchidos", () => {
      preencherCadastro({ ...CADASTRO_VALIDO, email: "" });

      cadastrar();

      expect(document.getElementById("erroCadastro").textContent).toBe("Por favor, preencha todos os campos!");
      expect(localStorage.getItem("usuario")).toBeNull();
    });

    it("recusa senhas diferentes", () => {
      preencherCadastro({ ...CADASTRO_VALIDO, confirmarSenha: "654321" });

      cadastrar();

      expect(document.getElementById("erroCadastro").textContent).toBe("As senhas não coincidem!");
      expect(localStorage.getItem("usuario")).toBeNull();
    });

    it("recusa senha com menos de 6 caracteres", () => {
      preencherCadastro({ ...CADASTRO_VALIDO, senhaCadastro: "12345", confirmarSenha: "12345" });

      cadastrar();

      expect(document.getElementById("erroCadastro").textContent).toBe("A senha deve ter pelo menos 6 caracteres!");
      expect(localStorage.getItem("usuario")).toBeNull();
    });

    it("salva o usuario e volta para o login quando os dados sao validos", () => {
      preencherCadastro(CADASTRO_VALIDO);

      cadastrar();

      expect(document.getElementById("erroCadastro").textContent).toBe("");
      expect(localStorage.getItem("usuario")).toBe("Yan");
      expect(localStorage.getItem("senha")).toBe("123456");
      expect(alert).toHaveBeenCalledWith("Cadastro realizado com sucesso!");

      vi.advanceTimersByTime(310);
      expect(document.getElementById("loginBox").classList.contains("show")).toBe(true);
    });
  });

  describe("login", () => {
    it("mostra erro quando as credenciais nao conferem", () => {
      localStorage.setItem("usuario", "Yan");
      localStorage.setItem("senha", "123456");
      document.getElementById("usuario").value = "Yan";
      document.getElementById("senhaLogin").value = "senha-errada";

      login();

      expect(document.getElementById("erroLogin").textContent).toBe("Usuário ou senha inválidos!");
      expect(alert).not.toHaveBeenCalled();
    });

    it("mostra erro quando nao existe usuario cadastrado", () => {
      document.getElementById("usuario").value = "Yan";
      document.getElementById("senhaLogin").value = "123456";

      login();

      expect(document.getElementById("erroLogin").textContent).toBe("Usuário ou senha inválidos!");
    });
  });

  describe("mascaraCPF", () => {
    const input = () => document.getElementById("cpfCadastro");

    function digitar(texto) {
      const campo = input();
      campo.value = "";
      for (const caractere of texto) {
        campo.value += caractere;
        mascaraCPF(campo);
      }
      return campo.value;
    }

    it("formata o CPF com pontos e traco", () => {
      expect(digitar("11144477735")).toBe("111.444.777-35");
    });

    it("limita o tamanho do campo", () => {
      digitar("111");

      expect(input().getAttribute("maxlength")).toBe("14");
    });

    it("descarta caracteres que nao sao numeros", () => {
      const campo = input();
      campo.value = "11a";

      mascaraCPF(campo);

      expect(campo.value).toBe("11");
    });
  });

  describe("buscarCEP", () => {
    it("recusa CEP com quantidade de digitos invalida", async () => {
      document.getElementById("cepCadastro").value = "0100";
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await buscarCEP();

      expect(alert).toHaveBeenCalledWith("CEP inválido");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("preenche o endereco com os dados retornados pela API", async () => {
      document.getElementById("cepCadastro").value = "01001-000";
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve({
            json: () => Promise.resolve({ logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" }),
          }),
        ),
      );

      await buscarCEP();

      expect(fetch).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/");
      expect(document.getElementById("rua").value).toBe("Praça da Sé");
      expect(document.getElementById("bairro").value).toBe("Sé");
      expect(document.getElementById("cidade").value).toBe("São Paulo");
      expect(document.getElementById("estado").value).toBe("SP");
    });

    it("avisa quando a API nao encontra o CEP", async () => {
      document.getElementById("cepCadastro").value = "99999999";
      vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ erro: true }) })));

      await buscarCEP();

      expect(alert).toHaveBeenCalledWith("CEP não encontrado");
      expect(document.getElementById("rua").value).toBe("");
    });

    it("registra o erro quando a requisicao falha", async () => {
      document.getElementById("cepCadastro").value = "01001000";
      const erro = new Error("offline");
      vi.stubGlobal("fetch", vi.fn(() => Promise.reject(erro)));
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      await buscarCEP();
      await flushPromises();

      expect(consoleError).toHaveBeenCalledWith("Erro ao buscar o CEP:", erro);
      consoleError.mockRestore();
    });
  });

  describe("irParaLogin", () => {
    it("pula a introducao e revela a tela de login", () => {
      irParaLogin();

      expect(document.getElementById("intro").classList.contains("hidden")).toBe(true);
      expect(document.getElementById("pan").classList.contains("hidden")).toBe(true);
      expect(document.getElementById("loginScreen").classList.contains("hidden")).toBe(false);
      expect(document.getElementById("loginBox").classList.contains("show")).toBe(true);
      expect(document.getElementById("login").style.getPropertyValue("--bg-opacity")).toBe("1");
    });

    it("e acionada pelo clique na tela durante a introducao", () => {
      document.dispatchEvent(new Event("click"));

      expect(document.getElementById("loginScreen").classList.contains("hidden")).toBe(false);
    });
  });
});
