import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, loadScript, optgroups, stubFetchJson } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/home/comparar/Hardwares/Placa de Video/PC.js";

const RTX4070 = {
  id: "gpu1", nome: "NVIDIA RTX 4070", brand: "NVIDIA", performance: 92, vram: 12, memory_bus: 192,
  clock: 2310, cores: 5888, arquitetura: "Ada Lovelace", ray_tracing: 1, tdp: 200, tipo: "GDDR6X", preco: "R$ 3.900",
};
const RX7600 = {
  id: "gpu2", nome: "AMD RX 7600", brand: "AMD", performance: 70, vram: 8, memory_bus: 128,
  clock: 2250, cores: 2048, arquitetura: "RDNA 3", ray_tracing: 0, tdp: 165, tipo: "GDDR6", preco: "R$ 1.900",
};

function setUpDom() {
  document.body.innerHTML = `
    <select id="sel1"></select>
    <select id="sel2"></select>
    <div id="resultado"></div>
  `;
}

async function load(gpus = [RTX4070, RX7600]) {
  setUpDom();
  const fetchMock = stubFetchJson(gpus);
  loadScript(SCRIPT);
  await flushPromises();
  return fetchMock;
}

function comparar(g1, g2) {
  document.getElementById("sel1").value = g1;
  document.getElementById("sel2").value = g2;
  analisar();
  return document.querySelectorAll("#resultado .card");
}

describe("Hardwares/Placa de Video/PC.js", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("carrega gpus.json e agrupa as opcoes por marca", async () => {
    const fetchMock = await load();

    expect(fetchMock).toHaveBeenCalledWith("gpus.json");
    expect(optgroups(document.getElementById("sel1"))).toEqual([
      { label: "AMD", options: [{ text: "AMD RX 7600", value: "gpu2" }] },
      { label: "NVIDIA", options: [{ text: "NVIDIA RTX 4070", value: "gpu1" }] },
    ]);
  });

  it("usa a primeira palavra do nome quando a marca nao esta definida", async () => {
    await load([{ ...RTX4070, brand: undefined }]);

    expect(optgroups(document.getElementById("sel2"))[0].label).toBe("NVIDIA");
  });

  it("registra o erro quando o JSON nao pode ser carregado", async () => {
    setUpDom();
    const erro = new Error("falhou");
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(erro)));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    loadScript(SCRIPT);
    await flushPromises();

    expect(consoleError).toHaveBeenCalledWith("Erro ao carregar gpus.json:", erro);
    consoleError.mockRestore();
  });

  it("parsePrice remove o simbolo de moeda e os separadores", async () => {
    await load();

    expect(parsePrice("R$ 3.900")).toBe(3900);
    expect(parsePrice("R$ 10.499")).toBe(10499);
  });

  it("render mostra as especificacoes e o ray tracing como Sim/Nao", async () => {
    await load();

    document.body.innerHTML = render(RTX4070, true) + render(RX7600, false);
    const cards = document.querySelectorAll(".card");
    expect(cards[0].classList.contains("winner")).toBe(true);
    expect(cards[0].textContent).toContain("VRAM: 12 GB");
    expect(cards[0].textContent).toContain("Barramento: 192 bits");
    expect(cards[0].textContent).toContain("Ray Tracing: Sim");
    expect(cards[1].textContent).toContain("Ray Tracing: Não");
  });

  describe("analisar", () => {
    it("elege a placa que ganha na maioria dos atributos", async () => {
      await load();

      const cards = comparar("gpu1", "gpu2");

      expect(cards[0].classList.contains("winner")).toBe(true);
      expect(cards[1].classList.contains("winner")).toBe(false);
    });

    it("informa empate quando as placas sao equivalentes", async () => {
      await load([RTX4070, { ...RTX4070, id: "gpu1b", nome: "NVIDIA RTX 4070 Dual" }]);

      const cards = comparar("gpu1", "gpu1b");

      expect([...cards].some((card) => card.classList.contains("winner"))).toBe(false);
      expect(document.getElementById("resultado").textContent).toContain("Empate!");
    });

    it("conta menor consumo como vantagem", async () => {
      const eficiente = { ...RTX4070, id: "gpu3", nome: "NVIDIA RTX 4070 Super", tdp: 150 };
      await load([RTX4070, eficiente]);

      const cards = comparar("gpu3", "gpu1");

      expect(cards[0].classList.contains("winner")).toBe(true);
    });
  });
});
