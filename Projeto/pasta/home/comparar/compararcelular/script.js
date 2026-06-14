let celulares = [];

const sel1 = document.getElementById("sel1");
const sel2 = document.getElementById("sel2");

// carregar JSON
fetch("celulares.json")
  .then(res => res.json())
  .then(data => {
    celulares = data;
    preencher();
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
  const c1 = celulares.find(c => c.id === sel1.value);
  const c2 = celulares.find(c => c.id === sel2.value);

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