let tvs = [];

const sel1 = document.getElementById("sel1");
const sel2 = document.getElementById("sel2");

function escapeHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

fetch("tvs.json")
  .then(res => res.json())
  .then(data => {
    tvs = data;
    preencher();
  })
  .catch(err => console.error("Erro ao carregar tvs.json:", err));

function preencher() {
  const brands = {};

  tvs.forEach(tv => {
    const brand = tv.brand || tv.nome.split(' ')[0];
    if (!brands[brand]) brands[brand] = [];
    brands[brand].push(tv);
  });

  Object.keys(brands).sort().forEach(brand => {
    const optgroup1 = document.createElement('optgroup');
    const optgroup2 = document.createElement('optgroup');
    optgroup1.label = brand;
    optgroup2.label = brand;

    brands[brand].forEach((tv, index) => {
      const option1 = new Option(tv.nome, tvs.indexOf(tv));
      const option2 = new Option(tv.nome, tvs.indexOf(tv));
      optgroup1.appendChild(option1);
      optgroup2.appendChild(option2);
    });

    sel1.appendChild(optgroup1);
    sel2.appendChild(optgroup2);
  });
}

function pontuar(tv) {
  let pontos = 0;

  // resolução
  if (tv.resolucao === "4K") pontos += 3;
  else pontos += 1;

  // tamanho
  pontos += tv.tamanho / 10;

  // sistema
  if (tv.sistema === "Google TV") pontos += 3;
  else if (tv.sistema === "Tizen") pontos += 2;
  else if (tv.sistema === "webOS") pontos += 2;
  else pontos += 1;

  // preço (quanto menor melhor)
  pontos += (5000 - tv.preco) / 1000;

  return pontos;
}

function analisarTV() {
  const tv1 = tvs[sel1.value];
  const tv2 = tvs[sel2.value];

  if (!tv1 || !tv2) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Selecione duas TVs.</div>';
    return;
  }

  const p1 = pontuar(tv1);
  const p2 = pontuar(tv2);
  const empate = p1 === p2;

  const resultado = document.getElementById("resultado");

  resultado.innerHTML = `
    <div class="card ${!empate && p1 > p2 ? "winner" : ""}">
      <h2>${escapeHtml(tv1.nome)}</h2>
      <p>📺 Tamanho: ${escapeHtml(tv1.tamanho)}"</p>
      <p>🖥️ Resolução: ${escapeHtml(tv1.resolucao)}</p>
      <p>⚙️ Sistema: ${escapeHtml(tv1.sistema)}</p>
      <p>💰 Preço: R$ ${escapeHtml(tv1.preco)}</p>
    </div>

    <div class="card ${!empate && p2 > p1 ? "winner" : ""}">
      <h2>${escapeHtml(tv2.nome)}</h2>
      <p>📺 Tamanho: ${escapeHtml(tv2.tamanho)}"</p>
      <p>🖥️ Resolução: ${escapeHtml(tv2.resolucao)}</p>
      <p>⚙️ Sistema: ${escapeHtml(tv2.sistema)}</p>
      <p>💰 Preço: R$ ${escapeHtml(tv2.preco)}</p>
    </div>

    ${empate ? '<div class="tie-message">Empate! Nenhuma TV venceu.</div>' : ''}
  `;
}
