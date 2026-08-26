let cpus = [];

fetch("cpus.json")
  .then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ao carregar cpus.json');
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('Formato inválido em cpus.json');
    cpus = data;
    preencher();
  })
  .catch(err => {
    console.error("Erro ao carregar cpus.json:", err);
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Não foi possível carregar a lista de processadores. Recarregue a página e tente novamente.</div>';
    document.getElementById("sel1").disabled = true;
    document.getElementById("sel2").disabled = true;
  });

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

  if (!cpus.length) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">A lista ainda não foi carregada. Recarregue a página.</div>';
    return;
  }

  const c1 = cpus.find(c => c.id === s1.value);
  const c2 = cpus.find(c => c.id === s2.value);

  if (!c1 || !c2) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Selecione dois processadores.</div>';
    return;
  }

  let v1 = 0, v2 = 0;

  if (c1.performance > c2.performance) v1++; else if (c1.performance < c2.performance) v2++;
  if (c1.cores > c2.cores) v1++; else if (c1.cores < c2.cores) v2++;
  if (c1.threads > c2.threads) v1++; else if (c1.threads < c2.threads) v2++;
  if (c1.clock > c2.clock) v1++; else if (c1.clock < c2.clock) v2++;
  if (c1.boost > c2.boost) v1++; else if (c1.boost < c2.boost) v2++;
  if (c1.cache > c2.cache) v1++; else if (c1.cache < c2.cache) v2++;
  if (c1.tdp < c2.tdp) v1++; else if (c1.tdp > c2.tdp) v2++;
  const preco1 = parsePrice(c1.preco);
  const preco2 = parsePrice(c2.preco);
  if (preco1 !== null && preco2 !== null) {
    if (preco1 < preco2) v1++; else if (preco1 > preco2) v2++;
  } else {
    if (preco1 === null) console.warn(`Preço inválido para ${c1.nome}.`);
    if (preco2 === null) console.warn(`Preço inválido para ${c2.nome}.`);
  }

  const empate = v1 === v2;
  document.getElementById("resultado").innerHTML =
    render(c1, !empate && v1 > v2) + render(c2, !empate && v2 > v1) +
    (empate ? '<div class="tie-message">Empate! Nenhum processador venceu.</div>' : '');
}

function parsePrice(preco) {
  if (typeof preco === "number") return Number.isFinite(preco) ? preco : null;
  const valor = String(preco ?? "").replace(/\D/g, "");
  if (!valor) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
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
