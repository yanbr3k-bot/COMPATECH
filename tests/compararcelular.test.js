import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, loadScript, optgroups, stubFetchJson } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/home/comparar/compararcelular/script.js";

const S24U = {
  id: "s24u", nome: "Galaxy S24 Ultra", brand: "Samsung", processador: "Snapdragon 8 Gen 3", performance: 100,
  ram: 12, armazenamento: 256, tela: "6.8 AMOLED 120Hz", hz: 120, bateria: 5000, carregamento: "45W",
  camera_principal: "200MP", sistema: "Android",
};
const MOTO = {
  id: "moto", nome: "Moto G84", brand: "Motorola", processador: "Snapdragon 695", performance: 55,
  ram: 8, armazenamento: 256, tela: "6.5 pOLED 120Hz", hz: 120, bateria: 5000, carregamento: "30W",
  camera_principal: "50MP", sistema: "Android",
};

function setUpDom() {
  document.body.innerHTML = `
    <select id="sel1"></select>
    <select id="sel2"></select>
    <div id="resultado"></div>
  `;
}

async function load(celulares = [S24U, MOTO]) {
  setUpDom();
  const fetchMock = stubFetchJson(celulares);
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

describe("compararcelular/script.js", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("carrega celulares.json e agrupa as opcoes por marca", async () => {
    const fetchMock = await load();

    expect(fetchMock).toHaveBeenCalledWith("celulares.json");
    expect(optgroups(document.getElementById("sel1"))).toEqual([
      { label: "Motorola", options: [{ text: "Moto G84", value: "moto" }] },
      { label: "Samsung", options: [{ text: "Galaxy S24 Ultra", value: "s24u" }] },
    ]);
    expect(optgroups(document.getElementById("sel2"))).toHaveLength(2);
  });

  it("usa a primeira palavra do nome quando a marca nao esta definida", async () => {
    await load([{ ...MOTO, brand: undefined }]);

    expect(optgroups(document.getElementById("sel1"))[0].label).toBe("Moto");
  });

  it("render mostra as especificacoes do aparelho", async () => {
    await load();

    document.body.innerHTML = render(S24U, true);
    const card = document.querySelector(".card");
    expect(card.classList.contains("winner")).toBe(true);
    expect(card.textContent).toContain("Galaxy S24 Ultra");
    expect(card.textContent).toContain("CPU: Snapdragon 8 Gen 3");
    expect(card.textContent).toContain("RAM: 12GB");
    expect(card.textContent).toContain("Armazenamento: 256GB");
    expect(card.textContent).toContain("Bateria: 5000mAh");
    expect(card.textContent).toContain("Câmera: 200MP");
  });

  describe("analisar", () => {
    it("elege o celular com melhor desempenho e memoria", async () => {
      await load();

      const cards = comparar("s24u", "moto");

      expect(cards[0].classList.contains("winner")).toBe(true);
      expect(cards[1].classList.contains("winner")).toBe(false);
      expect(document.getElementById("resultado").textContent).not.toContain("Empate");
    });

    it("informa empate quando os atributos comparados sao iguais", async () => {
      await load([MOTO, { ...MOTO, id: "moto2", nome: "Moto G84 5G" }]);

      const cards = comparar("moto", "moto2");

      expect([...cards].some((card) => card.classList.contains("winner"))).toBe(false);
      expect(document.getElementById("resultado").textContent).toContain("Empate!");
    });

    it("desempata pela taxa de atualizacao da tela", async () => {
      const sessentaHz = { ...MOTO, id: "moto60", nome: "Moto G54", hz: 60 };
      await load([MOTO, sessentaHz]);

      const cards = comparar("moto", "moto60");

      expect(cards[0].classList.contains("winner")).toBe(true);
    });
  });
});
