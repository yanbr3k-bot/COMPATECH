function pontuar(tv) {
  let pontos = 0;

  // resolução
  if (tv.resolucao === "4K") pontos += 3;
  else pontos += 1;

  // tamanho
  pontos += tv.tamanho / 10;

  // sistema
  if (tv.sistema === "Google TV") pontos += 3;
  else if (tv.sistema === "Tizen") pontos += 2;
  else if (tv.sistema === "webOS") pontos += 2;
  else pontos += 1;

  // preço (quanto menor melhor)
  pontos += (5000 - tv.preco) / 1000;

  return pontos;
}

const config = {
  dados: "tvs.json",
  campos: [
    { rotulo: "📺 Tamanho", valor: item => `${item.tamanho}"` },
    { rotulo: "🖥️ Resolução", valor: item => item.resolucao },
    { rotulo: "⚙️ Sistema", valor: item => item.sistema },
    { rotulo: "💰 Preço", valor: item => `R$ ${item.preco}` }
  ],
  pontuar,
  mensagemEmpate: "Empate! Nenhuma TV venceu."
};

iniciarComparacao(config);
