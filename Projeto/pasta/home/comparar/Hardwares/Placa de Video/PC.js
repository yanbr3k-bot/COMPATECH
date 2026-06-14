let gpus = [];

fetch("gpus.json")
  .then(res => res.json())
  .then(data => {
    gpus = data;
    preencher();
  })
  .catch(err => console.error("Erro ao carregar gpus.json:", err));

function preencher() {
  const s1 = document.getElementById("sel1");
  const s2 = document.getElementById("sel2");
  const brands = {};

  gpus.forEach(gpu => {
    const brand = gpu.brand || gpu.nome.split(' ')[0];
    if (!brands[brand]) brands[brand] = [];
    brands[brand].push(gpu);
  });

  Object.keys(brands).sort().forEach(brand => {
    const optgroup1 = document.createElement('optgroup');
    const optgroup2 = document.createElement('optgroup');
    optgroup1.label = brand;
    optgroup2.label = brand;

    brands[brand].forEach(gpu => {
      optgroup1.appendChild(new Option(gpu.nome, gpu.id));
      optgroup2.appendChild(new Option(gpu.nome, gpu.id));
    });

    s1.appendChild(optgroup1);
    s2.appendChild(optgroup2);
  });
}

function analisar() {
  const s1 = document.getElementById("sel1");
  const s2 = document.getElementById("sel2");
  const g1 = gpus.find(g => g.id === s1.value);
  const g2 = gpus.find(g => g.id === s2.value);

  let v1 = 0, v2 = 0;

  if (g1.performance > g2.performance) v1++; else if (g1.performance < g2.performance) v2++;
  if (g1.vram > g2.vram) v1++; else if (g1.vram < g2.vram) v2++;
  if (g1.memory_bus > g2.memory_bus) v1++; else if (g1.memory_bus < g2.memory_bus) v2++;
  if (g1.clock > g2.clock) v1++; else if (g1.clock < g2.clock) v2++;
  if (g1.cores > g2.cores) v1++; else if (g1.cores < g2.cores) v2++;
  if (g1.tdp < g2.tdp) v1++; else if (g1.tdp > g2.tdp) v2++;
  if (g1.ray_tracing > g2.ray_tracing) v1++; else if (g1.ray_tracing < g2.ray_tracing) v2++;
  if (parsePrice(g1.preco) < parsePrice(g2.preco)) v1++; else if (parsePrice(g1.preco) > parsePrice(g2.preco)) v2++;

  const empate = v1 === v2;
  document.getElementById("resultado").innerHTML =
    render(g1, !empate && v1 > v2) + render(g2, !empate && v2 > v1) +
    (empate ? '<div class="tie-message">Empate! Nenhuma placa venceu.</div>' : '');
}

function parsePrice(preco) {
  return Number(preco.replace(/[R$\.\s]/g, ""));
}

function render(gpu, win) {
  return `
    <div class="card ${win ? 'winner' : ''}">
      <h2>${gpu.nome}</h2>
      <p>🔥 Performance: ${gpu.performance}</p>
      <p>🧠 VRAM: ${gpu.vram} GB</p>
      <p>🛠️ Barramento: ${gpu.memory_bus} bits</p>
      <p>💻 Clock: ${gpu.clock} MHz</p>
      <p>🧮 Cores: ${gpu.cores}</p>
      <p>🏗️ Arquitetura: ${gpu.arquitetura}</p>
      <p>✨ Ray Tracing: ${gpu.ray_tracing ? 'Sim' : 'Não'}</p>
      <p>⚡ TDP: ${gpu.tdp} W</p>
      <p>💾 Tipo: ${gpu.tipo}</p>
      <p>💰 Preço: ${gpu.preco}</p>
    </div>
  `;
}
