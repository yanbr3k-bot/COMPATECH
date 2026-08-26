// Utilitários compartilhados pelas páginas de comparação (CPU, GPU, placa-mãe,
// celular e TV). Cada página fornece apenas a sua configuração e chama
// iniciarComparacao().

function parsePrice(preco) {
  if (typeof preco === "number") return preco;
  return Number(String(preco).replace(/[R$\.\s]/g, ""));
}

function agruparPorMarca(itens) {
  const marcas = {};

  itens.forEach(item => {
    const marca = item.brand || item.nome.split(" ")[0];
    if (!marcas[marca]) marcas[marca] = [];
    marcas[marca].push(item);
  });

  return marcas;
}

function popularSelects(itens, sel1, sel2) {
  const marcas = agruparPorMarca(itens);

  Object.keys(marcas).sort().forEach(marca => {
    const grupo1 = document.createElement("optgroup");
    const grupo2 = document.createElement("optgroup");
    grupo1.label = marca;
    grupo2.label = marca;

    marcas[marca].forEach(item => {
      grupo1.appendChild(new Option(item.nome, item.id));
      grupo2.appendChild(new Option(item.nome, item.id));
    });

    sel1.appendChild(grupo1);
    sel2.appendChild(grupo2);
  });
}

// Compara dois itens critério por critério. Cada critério é
// { campo, menorMelhor?, valor? } — "valor" permite derivar o número comparado
// (ex.: converter "R$ 4.200" em 4200).
function pontuarCriterios(a, b, criterios) {
  let v1 = 0;
  let v2 = 0;

  criterios.forEach(criterio => {
    const x = criterio.valor ? criterio.valor(a) : a[criterio.campo];
    const y = criterio.valor ? criterio.valor(b) : b[criterio.campo];
    const ganhaA = criterio.menorMelhor ? x < y : x > y;
    const ganhaB = criterio.menorMelhor ? x > y : x < y;

    if (ganhaA) v1++;
    else if (ganhaB) v2++;
  });

  return [v1, v2];
}

// Campos: [{ rotulo, valor }] — "valor" recebe o item e devolve o texto exibido.
function renderCard(item, campos, venceu) {
  const linhas = campos
    .map(campo => `      <p>${campo.rotulo}: ${campo.valor(item)}</p>`)
    .join("\n");

  return `
    <div class="card ${venceu ? "winner" : ""}">
      <h2>${item.nome}</h2>
${linhas}
    </div>
  `;
}

// config:
//   dados          caminho do JSON com os itens
//   campos         [{ rotulo, valor }] exibidos no card
//   criterios      [{ campo, menorMelhor?, valor? }] usados na votação
//   pontuar        alternativa a "criterios": função item -> nota
//   mensagemEmpate texto exibido quando ninguém vence
function iniciarComparacao(config) {
  const sel1 = document.getElementById("sel1");
  const sel2 = document.getElementById("sel2");
  const resultado = document.getElementById("resultado");
  let itens = [];

  fetch(config.dados)
    .then(res => res.json())
    .then(data => {
      itens = data;
      popularSelects(itens, sel1, sel2);
    })
    .catch(err => console.error(`Erro ao carregar ${config.dados}:`, err));

  window.analisar = function analisar() {
    const item1 = itens.find(item => item.id === sel1.value);
    const item2 = itens.find(item => item.id === sel2.value);

    if (!item1 || !item2) {
      resultado.innerHTML =
        '<div class="tie-message">Selecione dois itens para comparar.</div>';
      return;
    }

    const [p1, p2] = config.pontuar
      ? [config.pontuar(item1), config.pontuar(item2)]
      : pontuarCriterios(item1, item2, config.criterios);
    const empate = p1 === p2;

    resultado.innerHTML =
      renderCard(item1, config.campos, !empate && p1 > p2) +
      renderCard(item2, config.campos, !empate && p2 > p1) +
      (empate ? `<div class="tie-message">${config.mensagemEmpate}</div>` : "");
  };
}
