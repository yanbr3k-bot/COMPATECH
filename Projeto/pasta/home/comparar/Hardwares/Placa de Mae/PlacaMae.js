const config = {
  dados: "mbs.json",
  campos: [
    { rotulo: "🔥 Performance", valor: item => item.performance },
    { rotulo: "🧩 Soquete", valor: item => item.socket },
    { rotulo: "🏷️ Chipset", valor: item => item.chipset },
    { rotulo: "🧠 RAM máxima", valor: item => `${item.max_ram} GB` },
    { rotulo: "🖧 Slots PCIe", valor: item => item.slots },
    { rotulo: "💾 M.2 slots", valor: item => item.m2_slots },
    { rotulo: "🔌 Portas", valor: item => item.ports },
    { rotulo: "📶 Wi-Fi integrado", valor: item => item.wifi ? "Sim" : "Não" },
    { rotulo: "📏 Formato", valor: item => item.formato },
    { rotulo: "💰 Preço", valor: item => item.preco }
  ],
  criterios: [
    { campo: "performance" },
    { campo: "slots" },
    { campo: "m2_slots" },
    { campo: "ports" },
    { campo: "max_ram" },
    { campo: "wifi" },
    { campo: "preco", menorMelhor: true, valor: item => parsePrice(item.preco) }
  ],
  mensagemEmpate: "Empate! Nenhuma placa venceu."
};

iniciarComparacao(config);
