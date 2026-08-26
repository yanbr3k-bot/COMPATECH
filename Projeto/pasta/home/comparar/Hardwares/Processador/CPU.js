const config = {
  dados: "cpus.json",
  campos: [
    { rotulo: "🔥 Performance", valor: item => item.performance },
    { rotulo: "🧠 Cores", valor: item => item.cores },
    { rotulo: "🧮 Threads", valor: item => item.threads },
    { rotulo: "💻 Clock", valor: item => `${item.clock} MHz` },
    { rotulo: "🚀 Boost", valor: item => `${item.boost} MHz` },
    { rotulo: "🧪 Cache", valor: item => `${item.cache} MB` },
    { rotulo: "🏗️ Arquitetura", valor: item => item.arquitetura },
    { rotulo: "⚡ TDP", valor: item => `${item.tdp} W` },
    { rotulo: "💾 Tipo", valor: item => item.tipo },
    { rotulo: "💰 Preço", valor: item => item.preco }
  ],
  criterios: [
    { campo: "performance" },
    { campo: "cores" },
    { campo: "threads" },
    { campo: "clock" },
    { campo: "boost" },
    { campo: "cache" },
    { campo: "tdp", menorMelhor: true },
    { campo: "preco", menorMelhor: true, valor: item => parsePrice(item.preco) }
  ],
  mensagemEmpate: "Empate! Nenhum processador venceu."
};

iniciarComparacao(config);
