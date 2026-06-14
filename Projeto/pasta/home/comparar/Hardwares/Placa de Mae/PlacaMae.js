let mbs = [];

fetch("mbs.json")
  .then(res => res.json())
  .then(data => {
    mbs = data;
    preencher();
  })
  .catch(err => console.error("Erro ao carregar mbs.json:", err));

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
  const m1 = mbs.find(m => m.id === s1.value);
  const m2 = mbs.find(m => m.id === s2.value);

  let v1 = 0, v2 = 0;

  if (m1.performance > m2.performance) v1++; else if (m1.performance < m2.performance) v2++;
  if (m1.slots > m2.slots) v1++; else if (m1.slots < m2.slots) v2++;
  if (m1.m2_slots > m2.m2_slots) v1++; else if (m1.m2_slots < m2.m2_slots) v2++;
  if (m1.ports > m2.ports) v1++; else if (m1.ports < m2.ports) v2++;
  if (m1.max_ram > m2.max_ram) v1++; else if (m1.max_ram < m2.max_ram) v2++;
  if (m1.wifi > m2.wifi) v1++; else if (m1.wifi < m2.wifi) v2++;
  if (parsePrice(m1.preco) < parsePrice(m2.preco)) v1++; else if (parsePrice(m1.preco) > parsePrice(m2.preco)) v2++;

  const empate = v1 === v2;
  const resultado = render(m1, !empate && v1 > v2) + render(m2, !empate && v2 > v1);

  document.getElementById("resultado").innerHTML = resultado + (empate ? '<div class="tie-message">Empate! Nenhuma placa venceu.</div>' : '');
}

function parsePrice(preco) {
  return Number(preco.replace(/[R$\.\s]/g, ""));
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
