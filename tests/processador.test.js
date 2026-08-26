import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, loadScript, optgroups, stubFetchJson } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/home/comparar/Hardwares/Processador/CPU.js";

const I9 = {
  id: "cpu1", nome: "Intel Core i9-14900K", brand: "Intel", performance: 95, cores: 24, threads: 32,
  clock: 5600, boost: 5900, cache: 36, tdp: 125, arquitetura: "Raptor Lake", tipo: "Desktop", preco: "R$ 4.200",
};
const RYZEN5 = {
  id: "cpu2", nome: "AMD Ryzen 5 7600X", brand: "AMD", performance: 78, cores: 6, threads: 12,
  clock: 4700, boost: 5300, cache: 32, tdp: 105, arquitetura: "Zen 4", tipo: "Desktop", preco: "R$ 1.500",
};

function setUpDom() {
  document.body.innerHTML = `
    <select id="sel1"></select>
    <select id="sel2"></select>
    <div id="resultado"></div>
  `;
}

async function load(cpus = [I9, RYZEN5]) {
  setUpDom();
  const fetchMock = stubFetchJson(cpus);
  loadScript(SCRIPT);
  await flushPromises();
  return fetchMock;
}

function comparar(c1, c2) {
  document.getElementById("sel1").value = c1;
  document.getElementById("sel2").value = c2;
  analisar();
  return document.querySelectorAll("#resultado .card");
}

describe("Hardwares/Processador/CPU.js", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("carrega cpus.json e agrupa as opcoes por marca em ordem alfabetica", async () => {
    const fetchMock = await load();

    expect(fetchMock).toHaveBeenCalledWith("cpus.json");
    expect(optgroups(document.getElementById("sel1"))).toEqual([
      { label: "AMD", options: [{ text: "AMD Ryzen 5 7600X", value: "cpu2" }] },
      { label: "Intel", options: [{ text: "Intel Core i9-14900K", value: "cpu1" }] },
    ]);
    expect(optgroups(document.getElementById("sel2"))).toHaveLength(2);
  });

  it("usa a primeira palavra do nome quando a marca nao esta definida", async () => {
    await load([{ ...I9, brand: undefined }]);

    expect(optgroups(document.getElementById("sel1"))[0].label).toBe("Intel");
  });

  it("registra o erro quando o JSON nao pode ser carregado", async () => {
    setUpDom();
    const erro = new Error("falhou");
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(erro)));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    loadScript(SCRIPT);
    await flushPromises();

    expect(consoleError).toHaveBeenCalledWith("Erro ao carregar cpus.json:", erro);
    consoleError.mockRestore();
  });

  describe("parsePrice", () => {
    it("converte o preco em reais para numero", async () => {
      await load();

      expect(parsePrice("R$ 4.200")).toBe(4200);
      expect(parsePrice("R$ 1.234.567")).toBe(1234567);
      expect(parsePrice("999")).toBe(999);
    });
  });

  describe("render", () => {
    it("monta o card com todas as especificacoes", async () => {
      await load();

      document.body.innerHTML = render(I9, false);
      const texto = document.body.textContent;
      expect(texto).toContain("Intel Core i9-14900K");
      expect(texto).toContain("Cores: 24");
      expect(texto).toContain("Threads: 32");
      expect(texto).toContain("Clock: 5600 MHz");
      expect(texto).toContain("Boost: 5900 MHz");
      expect(texto).toContain("Cache: 36 MB");
      expect(texto).toContain("TDP: 125 W");
      expect(texto).toContain("Preço: R$ 4.200");
      expect(document.querySelector(".card").classList.contains("winner")).toBe(false);
    });

    it("marca o card vencedor", async () => {
      await load();

      document.body.innerHTML = render(I9, true);
      expect(document.querySelector(".card").classList.contains("winner")).toBe(true);
    });
  });

  describe("analisar", () => {
    it("elege o processador que ganha na maioria dos atributos", async () => {
      await load();

      const cards = comparar("cpu1", "cpu2");

      expect(cards[0].classList.contains("winner")).toBe(true);
      expect(cards[1].classList.contains("winner")).toBe(false);
      expect(document.getElementById("resultado").textContent).not.toContain("Empate");
    });

    it("mantem o resultado independente da ordem dos selects", async () => {
      await load();

      const cards = comparar("cpu2", "cpu1");

      expect(cards[0].classList.contains("winner")).toBe(false);
      expect(cards[1].classList.contains("winner")).toBe(true);
    });

    it("informa empate quando os processadores sao equivalentes", async () => {
      await load([I9, { ...I9, id: "cpu1b", nome: "Intel Core i9-14900KF" }]);

      const cards = comparar("cpu1", "cpu1b");

      expect([...cards].some((card) => card.classList.contains("winner"))).toBe(false);
      expect(document.getElementById("resultado").textContent).toContain("Empate!");
    });

    it("considera menor TDP e menor preco como vantagens", async () => {
      const economico = { ...I9, id: "cpu3", nome: "Intel Core i5-14600K", tdp: 65, preco: "R$ 1.200" };
      await load([I9, economico]);

      const cards = comparar("cpu3", "cpu1");

      expect(cards[0].classList.contains("winner")).toBe(true);
    });
  });
});
