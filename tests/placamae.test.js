import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, loadScript, optgroups, stubFetchJson } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/home/comparar/Hardwares/Placa de Mae/PlacaMae.js";

const ROG = {
  id: "mb1", nome: "ASUS ROG Strix X670E-F", brand: "ASUS", performance: 92, socket: "AM5", chipset: "X670E",
  max_ram: 128, slots: 4, m2_slots: 4, ports: 18, wifi: 1, formato: "ATX", preco: "R$ 3.200",
};
const A620 = {
  id: "mb2", nome: "ASRock A620M", brand: "ASRock", performance: 70, socket: "AM5", chipset: "A620",
  max_ram: 64, slots: 2, m2_slots: 2, ports: 10, wifi: 0, formato: "Micro-ATX", preco: "R$ 900",
};

function setUpDom() {
  document.body.innerHTML = `
    <select id="sel1"></select>
    <select id="sel2"></select>
    <div id="resultado"></div>
  `;
}

async function load(mbs = [ROG, A620]) {
  setUpDom();
  const fetchMock = stubFetchJson(mbs);
  loadScript(SCRIPT);
  await flushPromises();
  return fetchMock;
}

function comparar(m1, m2) {
  document.getElementById("sel1").value = m1;
  document.getElementById("sel2").value = m2;
  analisar();
  return document.querySelectorAll("#resultado .card");
}

describe("Hardwares/Placa de Mae/PlacaMae.js", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("carrega mbs.json e agrupa as opcoes por marca", async () => {
    const fetchMock = await load();

    expect(fetchMock).toHaveBeenCalledWith("mbs.json");
    expect(optgroups(document.getElementById("sel1"))).toEqual([
      { label: "ASRock", options: [{ text: "ASRock A620M", value: "mb2" }] },
      { label: "ASUS", options: [{ text: "ASUS ROG Strix X670E-F", value: "mb1" }] },
    ]);
  });

  it("usa a primeira palavra do nome quando a marca nao esta definida", async () => {
    await load([{ ...ROG, brand: undefined }]);

    expect(optgroups(document.getElementById("sel1"))[0].label).toBe("ASUS");
  });

  it("registra o erro quando o JSON nao pode ser carregado", async () => {
    setUpDom();
    const erro = new Error("falhou");
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(erro)));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    loadScript(SCRIPT);
    await flushPromises();

    expect(consoleError).toHaveBeenCalledWith("Erro ao carregar mbs.json:", erro);
    consoleError.mockRestore();
  });

  it("parsePrice converte o preco em reais para numero", async () => {
    await load();

    expect(parsePrice("R$ 3.200")).toBe(3200);
    expect(parsePrice("R$ 900")).toBe(900);
  });

  it("render mostra soquete, chipset e Wi-Fi como Sim/Nao", async () => {
    await load();

    document.body.innerHTML = render(ROG, false) + render(A620, false);
    const cards = document.querySelectorAll(".card");
    expect(cards[0].textContent).toContain("Soquete: AM5");
    expect(cards[0].textContent).toContain("Chipset: X670E");
    expect(cards[0].textContent).toContain("RAM máxima: 128 GB");
    expect(cards[0].textContent).toContain("M.2 slots: 4");
    expect(cards[0].textContent).toContain("Wi-Fi integrado: Sim");
    expect(cards[1].textContent).toContain("Wi-Fi integrado: Não");
    expect(cards[1].textContent).toContain("Formato: Micro-ATX");
  });

  describe("analisar", () => {
    it("elege a placa que ganha na maioria dos atributos", async () => {
      await load();

      const cards = comparar("mb1", "mb2");

      expect(cards[0].classList.contains("winner")).toBe(true);
      expect(cards[1].classList.contains("winner")).toBe(false);
    });

    it("informa empate quando as placas sao equivalentes", async () => {
      await load([ROG, { ...ROG, id: "mb1b", nome: "ASUS ROG Strix X670E-E" }]);

      const cards = comparar("mb1", "mb1b");

      expect([...cards].some((card) => card.classList.contains("winner"))).toBe(false);
      expect(document.getElementById("resultado").textContent).toContain("Empate!");
    });

    it("conta o menor preco como vantagem", async () => {
      const barata = { ...ROG, id: "mb3", nome: "ASUS TUF X670", preco: "R$ 1.500" };
      await load([ROG, barata]);

      const cards = comparar("mb3", "mb1");

      expect(cards[0].classList.contains("winner")).toBe(true);
    });
  });
});
