let gpus = [];

fetch("gpus.json")
  .then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ao carregar gpus.json');
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('Formato inválido em gpus.json');
    gpus = data;
    preencher();
  })
  .catch(err => {
    console.error("Erro ao carregar gpus.json:", err);
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Não foi possível carregar a lista de placas de vídeo. Recarregue a página e tente novamente.</div>';
    document.getElementById("sel1").disabled = true;
    document.getElementById("sel2").disabled = true;
  });

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

  if (!gpus.length) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">A lista ainda não foi carregada. Recarregue a página.</div>';
    return;
  }

  const g1 = gpus.find(g => g.id === s1.value);
  const g2 = gpus.find(g => g.id === s2.value);

  if (!g1 || !g2) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Selecione duas placas de vídeo.</div>';
    return;
  }

  let v1 = 0, v2 = 0;

  if (g1.performance > g2.performance) v1++; else if (g1.performance < g2.performance) v2++;
  if (g1.vram > g2.vram) v1++; else if (g1.vram < g2.vram) v2++;
  if (g1.memory_bus > g2.memory_bus) v1++; else if (g1.memory_bus < g2.memory_bus) v2++;
  if (g1.clock > g2.clock) v1++; else if (g1.clock < g2.clock) v2++;
  if (g1.cores > g2.cores) v1++; else if (g1.cores < g2.cores) v2++;
  if (g1.tdp < g2.tdp) v1++; else if (g1.tdp > g2.tdp) v2++;
  if (g1.ray_tracing > g2.ray_tracing) v1++; else if (g1.ray_tracing < g2.ray_tracing) v2++;
  const preco1 = parsePrice(g1.preco);
  const preco2 = parsePrice(g2.preco);
  if (preco1 !== null && preco2 !== null) {
    if (preco1 < preco2) v1++; else if (preco1 > preco2) v2++;
  } else {
    if (preco1 === null) console.warn(`Preço inválido para ${g1.nome}.`);
    if (preco2 === null) console.warn(`Preço inválido para ${g2.nome}.`);
  }

  const empate = v1 === v2;
  document.getElementById("resultado").innerHTML =
    render(g1, !empate && v1 > v2) + render(g2, !empate && v2 > v1) +
    (empate ? '<div class="tie-message">Empate! Nenhuma placa venceu.</div>' : '');
}

function parsePrice(preco) {
  if (typeof preco === "number") return Number.isFinite(preco) ? preco : null;
  const valor = String(preco ?? "").replace(/\D/g, "");
  if (!valor) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
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
