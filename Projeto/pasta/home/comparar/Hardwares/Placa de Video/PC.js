const config = {
  dados: "gpus.json",
  campos: [
    { rotulo: "🔥 Performance", valor: item => item.performance },
    { rotulo: "🧠 VRAM", valor: item => `${item.vram} GB` },
    { rotulo: "🛠️ Barramento", valor: item => `${item.memory_bus} bits` },
    { rotulo: "💻 Clock", valor: item => `${item.clock} MHz` },
    { rotulo: "🧮 Cores", valor: item => item.cores },
    { rotulo: "🏗️ Arquitetura", valor: item => item.arquitetura },
    { rotulo: "✨ Ray Tracing", valor: item => item.ray_tracing ? "Sim" : "Não" },
    { rotulo: "⚡ TDP", valor: item => `${item.tdp} W` },
    { rotulo: "💾 Tipo", valor: item => item.tipo },
    { rotulo: "💰 Preço", valor: item => item.preco }
  ],
  criterios: [
    { campo: "performance" },
    { campo: "vram" },
    { campo: "memory_bus" },
    { campo: "clock" },
    { campo: "cores" },
    { campo: "tdp", menorMelhor: true },
    { campo: "ray_tracing" },
    { campo: "preco", menorMelhor: true, valor: item => parsePrice(item.preco) }
  ],
  mensagemEmpate: "Empate! Nenhuma placa venceu."
};

iniciarComparacao(config);
