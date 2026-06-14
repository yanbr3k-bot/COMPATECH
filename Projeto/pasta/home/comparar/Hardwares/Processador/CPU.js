let cpus = [];

fetch("cpus.json")
  .then(res => res.json())
  .then(data => {
    cpus = data;
    preencher();
  })
  .catch(err => console.error("Erro ao carregar cpus.json:", err));

function preencher() {
  const s1 = document.getElementById("sel1");
  const s2 = document.getElementById("sel2");
  const brands = {};

  cpus.forEach(cpu => {
    const brand = cpu.brand || cpu.nome.split(' ')[0];
    if (!brands[brand]) brands[brand] = [];
    brands[brand].push(cpu);
  });

  Object.keys(brands).sort().forEach(brand => {
    const optgroup1 = document.createElement('optgroup');
    const optgroup2 = document.createElement('optgroup');
    optgroup1.label = brand;
    optgroup2.label = brand;

    brands[brand].forEach(cpu => {
      optgroup1.appendChild(new Option(cpu.nome, cpu.id));
      optgroup2.appendChild(new Option(cpu.nome, cpu.id));
    });

    s1.appendChild(optgroup1);
    s2.appendChild(optgroup2);
  });
}

function analisar() {
  const s1 = document.getElementById("sel1");
  const s2 = document.getElementById("sel2");
  const c1 = cpus.find(c => c.id === s1.value);
  const c2 = cpus.find(c => c.id === s2.value);

  let v1 = 0, v2 = 0;

  if (c1.performance > c2.performance) v1++; else if (c1.performance < c2.performance) v2++;
  if (c1.cores > c2.cores) v1++; else if (c1.cores < c2.cores) v2++;
  if (c1.threads > c2.threads) v1++; else if (c1.threads < c2.threads) v2++;
  if (c1.clock > c2.clock) v1++; else if (c1.clock < c2.clock) v2++;
  if (c1.boost > c2.boost) v1++; else if (c1.boost < c2.boost) v2++;
  if (c1.cache > c2.cache) v1++; else if (c1.cache < c2.cache) v2++;
  if (c1.tdp < c2.tdp) v1++; else if (c1.tdp > c2.tdp) v2++;
  if (parsePrice(c1.preco) < parsePrice(c2.preco)) v1++; else if (parsePrice(c1.preco) > parsePrice(c2.preco)) v2++;

  const empate = v1 === v2;
  document.getElementById("resultado").innerHTML =
    render(c1, !empate && v1 > v2) + render(c2, !empate && v2 > v1) +
    (empate ? '<div class="tie-message">Empate! Nenhum processador venceu.</div>' : '');
}

function parsePrice(preco) {
  return Number(preco.replace(/[R$\.\s]/g, ""));
}

function render(cpu, win) {
  return `
    <div class="card ${win ? 'winner' : ''}">
      <h2>${cpu.nome}</h2>
      <p>🔥 Performance: ${cpu.performance}</p>
      <p>🧠 Cores: ${cpu.cores}</p>
      <p>🧮 Threads: ${cpu.threads}</p>
      <p>💻 Clock: ${cpu.clock} MHz</p>
      <p>🚀 Boost: ${cpu.boost} MHz</p>
      <p>🧪 Cache: ${cpu.cache} MB</p>
      <p>🏗️ Arquitetura: ${cpu.arquitetura}</p>
      <p>⚡ TDP: ${cpu.tdp} W</p>
      <p>💾 Tipo: ${cpu.tipo}</p>
      <p>💰 Preço: ${cpu.preco}</p>
    </div>
  `;
}
