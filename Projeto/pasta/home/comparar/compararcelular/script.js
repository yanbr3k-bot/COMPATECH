const config = {
  dados: "celulares.json",
  campos: [
    { rotulo: "⚙️ CPU", valor: item => item.processador },
    { rotulo: "🚀 Performance", valor: item => item.performance },
    { rotulo: "🧠 RAM", valor: item => `${item.ram}GB` },
    { rotulo: "💾 Armazenamento", valor: item => `${item.armazenamento}GB` },
    { rotulo: "📱 Tela", valor: item => item.tela },
    { rotulo: "🔋 Bateria", valor: item => `${item.bateria}mAh` },
    { rotulo: "⚡ Carregamento", valor: item => item.carregamento },
    { rotulo: "📸 Câmera", valor: item => item.camera_principal },
    { rotulo: "📦 Sistema", valor: item => item.sistema }
  ],
  criterios: [
    { campo: "performance" },
    { campo: "ram" },
    { campo: "bateria" },
    { campo: "hz" }
  ],
  mensagemEmpate: "Empate! Nenhum celular venceu."
};

iniciarComparacao(config);
