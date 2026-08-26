let mbs = [];

fetch("mbs.json")
  .then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ao carregar mbs.json');
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('Formato inválido em mbs.json');
    mbs = data;
    preencher();
  })
  .catch(err => {
    console.error("Erro ao carregar mbs.json:", err);
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Não foi possível carregar a lista de placas-mãe. Recarregue a página e tente novamente.</div>';
    document.getElementById("sel1").disabled = true;
    document.getElementById("sel2").disabled = true;
  });

function preencher() {
  const s1 = document.getElementById("sel1");
  const s2 = document.getElementById("sel2");
  const brands = {};

  mbs.forEach(mb => {
    const brand = mb.brand || mb.nome.split(' ')[0];
    if (!brands[brand]) brands[brand] = [];
    brands[brand].push(mb);
  });

  Object.keys(brands).sort().forEach(brand => {
    const optgroup1 = document.createElement('optgroup');
    const optgroup2 = document.createElement('optgroup');
    optgroup1.label = brand;
    optgroup2.label = brand;

    brands[brand].forEach(mb => {
      optgroup1.appendChild(new Option(mb.nome, mb.id));
      optgroup2.appendChild(new Option(mb.nome, mb.id));
    });

    s1.appendChild(optgroup1);
    s2.appendChild(optgroup2);
  });
}

function analisar() {
  const s1 = document.getElementById("sel1");
  const s2 = document.getElementById("sel2");

  if (!mbs.length) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">A lista ainda não foi carregada. Recarregue a página.</div>';
    return;
  }

  const m1 = mbs.find(m => m.id === s1.value);
  const m2 = mbs.find(m => m.id === s2.value);

  if (!m1 || !m2) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Selecione duas placas-mãe.</div>';
    return;
  }

  let v1 = 0, v2 = 0;

  if (m1.performance > m2.performance) v1++; else if (m1.performance < m2.performance) v2++;
  if (m1.slots > m2.slots) v1++; else if (m1.slots < m2.slots) v2++;
  if (m1.m2_slots > m2.m2_slots) v1++; else if (m1.m2_slots < m2.m2_slots) v2++;
  if (m1.ports > m2.ports) v1++; else if (m1.ports < m2.ports) v2++;
  if (m1.max_ram > m2.max_ram) v1++; else if (m1.max_ram < m2.max_ram) v2++;
  if (m1.wifi > m2.wifi) v1++; else if (m1.wifi < m2.wifi) v2++;
  const preco1 = parsePrice(m1.preco);
  const preco2 = parsePrice(m2.preco);
  if (preco1 !== null && preco2 !== null) {
    if (preco1 < preco2) v1++; else if (preco1 > preco2) v2++;
  } else {
    if (preco1 === null) console.warn(`Preço inválido para ${m1.nome}.`);
    if (preco2 === null) console.warn(`Preço inválido para ${m2.nome}.`);
  }

  const empate = v1 === v2;
  const resultado = render(m1, !empate && v1 > v2) + render(m2, !empate && v2 > v1);

  document.getElementById("resultado").innerHTML = resultado + (empate ? '<div class="tie-message">Empate! Nenhuma placa venceu.</div>' : '');
}

function parsePrice(preco) {
  if (typeof preco === "number") return Number.isFinite(preco) ? preco : null;
  const valor = String(preco ?? "").replace(/\D/g, "");
  if (!valor) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function render(mb, win) {
  return `
    <div class="card ${win ? 'winner' : ''}">
      <h2>${mb.nome}</h2>
      <p>🔥 Performance: ${mb.performance}</p>
      <p>🧩 Soquete: ${mb.socket}</p>
      <p>🏷️ Chipset: ${mb.chipset}</p>
      <p>🧠 RAM máxima: ${mb.max_ram} GB</p>
      <p>🖧 Slots PCIe: ${mb.slots}</p>
      <p>💾 M.2 slots: ${mb.m2_slots}</p>
      <p>🔌 Portas: ${mb.ports}</p>
      <p>📶 Wi-Fi integrado: ${mb.wifi ? 'Sim' : 'Não'}</p>
      <p>📏 Formato: ${mb.formato}</p>
      <p>💰 Preço: ${mb.preco}</p>
    </div>
  `;
}
