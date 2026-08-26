import { beforeEach, describe, expect, it } from "vitest";
import { loadScript } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/home/home.js";

function setUpDom() {
  document.body.innerHTML = `
    <a id="loginBtn" href="#">Entrar</a>
    <div id="userMenu" class="hidden"><span id="userName"></span></div>
  `;
}

describe("home/home.js", () => {
  beforeEach(() => {
    localStorage.clear();
    setUpDom();
    loadScript(SCRIPT);
  });

  describe("checkLogin", () => {
    it("mostra o menu do usuario quando existe usuario salvo", () => {
      localStorage.setItem("usuario", "Yan");

      checkLogin();

      expect(document.getElementById("loginBtn").classList.contains("hidden")).toBe(true);
      expect(document.getElementById("userMenu").classList.contains("hidden")).toBe(false);
      expect(document.getElementById("userName").textContent).toBe("Yan");
    });

    it("mostra o botao de login quando nao ha usuario salvo", () => {
      checkLogin();

      expect(document.getElementById("loginBtn").classList.contains("hidden")).toBe(false);
      expect(document.getElementById("userMenu").classList.contains("hidden")).toBe(true);
      expect(typeof document.getElementById("loginBtn").onclick).toBe("function");
    });
  });

  describe("logout", () => {
    it("limpa os dados salvos e volta para o estado deslogado", () => {
      localStorage.setItem("usuario", "Yan");
      localStorage.setItem("senha", "123456");
      localStorage.setItem("lembrar", "true");
      checkLogin();

      logout();

      expect(localStorage.getItem("usuario")).toBeNull();
      expect(localStorage.getItem("senha")).toBeNull();
      expect(localStorage.getItem("lembrar")).toBeNull();
      expect(document.getElementById("loginBtn").classList.contains("hidden")).toBe(false);
      expect(document.getElementById("userMenu").classList.contains("hidden")).toBe(true);
    });
  });

  it("verifica o login quando o DOM termina de carregar", () => {
    localStorage.setItem("usuario", "Yan");

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.getElementById("userName").textContent).toBe("Yan");
  });
});
