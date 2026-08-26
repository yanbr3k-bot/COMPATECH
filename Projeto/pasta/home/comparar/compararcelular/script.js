let celulares = [];

const sel1 = document.getElementById("sel1");
const sel2 = document.getElementById("sel2");

// carregar JSON
fetch("celulares.json")
  .then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ao carregar celulares.json');
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('Formato inválido em celulares.json');
    celulares = data;
    preencher();
  })
  .catch(err => {
    console.error("Erro ao carregar celulares.json:", err);
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Não foi possível carregar a lista de celulares. Recarregue a página e tente novamente.</div>';
    sel1.disabled = true;
    sel2.disabled = true;
  });

function preencher() {
  const brands = {};

  celulares.forEach(cel => {
    const brand = cel.brand || cel.nome.split(' ')[0];
    if (!brands[brand]) brands[brand] = [];
    brands[brand].push(cel);
  });

  Object.keys(brands).sort().forEach(brand => {
    const optgroup1 = document.createElement('optgroup');
    const optgroup2 = document.createElement('optgroup');
    optgroup1.label = brand;
    optgroup2.label = brand;

    brands[brand].forEach(cel => {
      optgroup1.appendChild(new Option(cel.nome, cel.id));
      optgroup2.appendChild(new Option(cel.nome, cel.id));
    });

    sel1.appendChild(optgroup1);
    sel2.appendChild(optgroup2);
  });
}

function analisar() {
  if (!celulares.length) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">A lista ainda não foi carregada. Recarregue a página.</div>';
    return;
  }

  const c1 = celulares.find(c => c.id === sel1.value);
  const c2 = celulares.find(c => c.id === sel2.value);

  if (!c1 || !c2) {
    document.getElementById("resultado").innerHTML = '<div class="tie-message">Selecione dois celulares.</div>';
    return;
  }

  let v1 = 0, v2 = 0;

  if (c1.performance > c2.performance) v1++; else if (c1.performance < c2.performance) v2++;
  if (c1.ram > c2.ram) v1++; else if (c1.ram < c2.ram) v2++;
  if (c1.bateria > c2.bateria) v1++; else if (c1.bateria < c2.bateria) v2++;
  if (c1.hz > c2.hz) v1++; else if (c1.hz < c2.hz) v2++;

  const empate = v1 === v2;
  document.getElementById("resultado").innerHTML =
    render(c1, !empate && v1 > v2) + render(c2, !empate && v2 > v1) +
    (empate ? '<div class="tie-message">Empate! Nenhum celular venceu.</div>' : '');
}

function render(cel, win) {
  return `
    <div class="card ${win ? 'winner' : ''}">
      <h2>${cel.nome}</h2>
      <p>⚙️ CPU: ${cel.processador}</p>
      <p>🚀 Performance: ${cel.performance}</p>
      <p>🧠 RAM: ${cel.ram}GB</p>
      <p>💾 Armazenamento: ${cel.armazenamento}GB</p>
      <p>📱 Tela: ${cel.tela}</p>
      <p>🔋 Bateria: ${cel.bateria}mAh</p>
      <p>⚡ Carregamento: ${cel.carregamento}</p>
      <p>📸 Câmera: ${cel.camera_principal}</p>
      <p>📦 Sistema: ${cel.sistema}</p>
    </div>
  `;
}