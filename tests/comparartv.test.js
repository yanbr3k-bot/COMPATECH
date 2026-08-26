import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, loadScript, optgroups, stubFetchJson } from "./helpers/loadScript.js";

const SCRIPT = "Projeto/pasta/home/comparar/comparartv/script.js";

const TVS = [
  { id: "tv1", nome: 'Samsung QLED 65"', brand: "Samsung", tamanho: 65, resolucao: "4K", sistema: "Tizen", preco: 4200 },
  { id: "tv2", nome: 'LG UHD 50"', brand: "LG", tamanho: 50, resolucao: "4K", sistema: "webOS", preco: 2500 },
  { id: "tv3", nome: 'TCL 55" Google TV', brand: "TCL", tamanho: 55, resolucao: "4K", sistema: "Google TV", preco: 2600 },
];

function setUpDom() {
  document.body.innerHTML = `
    <select id="sel1"></select>
    <select id="sel2"></select>
    <div id="resultado"></div>
  `;
}

async function load(tvs = TVS) {
  setUpDom();
  const fetchMock = stubFetchJson(tvs);
  loadScript(SCRIPT);
  await flushPromises();
  return fetchMock;
}

describe("comparartv/script.js", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("carrega tvs.json e preenche os dois selects", async () => {
    const fetchMock = await load();

    expect(fetchMock).toHaveBeenCalledWith("tvs.json");
    expect(optgroups(document.getElementById("sel1"))).toEqual([
      { label: "LG", options: [{ text: 'LG UHD 50"', value: "1" }] },
      { label: "Samsung", options: [{ text: 'Samsung QLED 65"', value: "0" }] },
      { label: "TCL", options: [{ text: 'TCL 55" Google TV', value: "2" }] },
    ]);
    expect(optgroups(document.getElementById("sel2"))).toEqual(optgroups(document.getElementById("sel1")));
  });

  it("agrupa pela primeira palavra do nome quando a marca nao esta definida", async () => {
    await load([{ nome: "Philco Smart 43", tamanho: 43, resolucao: "Full HD", sistema: "Android", preco: 1500 }]);

    expect(optgroups(document.getElementById("sel1"))[0].label).toBe("Philco");
  });

  it("registra o erro quando o JSON nao pode ser carregado", async () => {
    setUpDom();
    const erro = new Error("falhou");
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(erro)));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    loadScript(SCRIPT);
    await flushPromises();

    expect(consoleError).toHaveBeenCalledWith("Erro ao carregar tvs.json:", erro);
    consoleError.mockRestore();
  });

  describe("pontuar", () => {
    const base = { tamanho: 50, resolucao: "4K", sistema: "Tizen", preco: 2500 };

    it("soma resolucao, tamanho, sistema e preco", async () => {
      await load();

      // 3 (4K) + 5 (50/10) + 2 (Tizen) + 2.5 ((5000-2500)/1000)
      expect(pontuar(base)).toBe(12.5);
    });

    it("da menos pontos para resolucoes diferentes de 4K", async () => {
      await load();

      expect(pontuar({ ...base, resolucao: "Full HD" })).toBe(pontuar(base) - 2);
    });

    it("pontua os sistemas operacionais em ordem de preferencia", async () => {
      await load();

      const pontos = (sistema) => pontuar({ ...base, sistema });
      expect(pontos("Google TV")).toBeGreaterThan(pontos("Tizen"));
      expect(pontos("Tizen")).toBe(pontos("webOS"));
      expect(pontos("webOS")).toBeGreaterThan(pontos("Android"));
    });

    it("penaliza o preco mais alto e premia a tela maior", async () => {
      await load();

      expect(pontuar({ ...base, preco: 4500 })).toBeLessThan(pontuar(base));
      expect(pontuar({ ...base, tamanho: 65 })).toBeGreaterThan(pontuar(base));
    });
  });

  describe("analisarTV", () => {
    it("pede a selecao quando uma das TVs nao existe", async () => {
      await load();
      document.getElementById("sel1").value = "";

      analisarTV();

      expect(document.getElementById("resultado").innerHTML).toContain("Selecione duas TVs.");
    });

    it("marca como vencedora a TV com mais pontos", async () => {
      await load();
      document.getElementById("sel1").value = "2"; // TCL 55" Google TV
      document.getElementById("sel2").value = "0"; // Samsung QLED 65"

      analisarTV();

      const cards = document.querySelectorAll("#resultado .card");
      expect(cards[0].classList.contains("winner")).toBe(true);
      expect(cards[1].classList.contains("winner")).toBe(false);
      expect(cards[0].textContent).toContain('TCL 55" Google TV');
      expect(cards[0].textContent).toContain("Tamanho: 55");
      expect(cards[0].textContent).toContain("Preço: R$ 2600");
      expect(document.getElementById("resultado").textContent).not.toContain("Empate");
    });

    it("informa empate quando as pontuacoes sao iguais", async () => {
      await load([TVS[1], { ...TVS[1], id: "tv2b", nome: 'LG UHD 50" (2024)' }]);
      document.getElementById("sel1").value = "0";
      document.getElementById("sel2").value = "1";

      analisarTV();

      expect(document.querySelectorAll("#resultado .winner")).toHaveLength(0);
      expect(document.getElementById("resultado").textContent).toContain("Empate!");
    });
  });
});
