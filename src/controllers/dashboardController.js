/*
  Arquivo: src/controllers/dashboardController.js
  Responsabilidade: consolidar dados da dashboard para o front-end.
  Organização:
  - uma função principal que consulta múltiplas métricas em paralelo.
*/

const dashboardModel = require("../models/dashboardModel");

// Fluxo assíncrono para consolidar métricas agregadas do questionário ativo.
async function buscarMetricas(req, res) {
  try {
    // Executa consultas em paralelo para reduzir tempo de resposta da API.
    const resultados = await Promise.all([
      dashboardModel.buscarRespostasPorCorrente(),
      dashboardModel.buscarTotalRespostasAtivas(),
      dashboardModel.buscarTotalParticipantesAtivos(),
      dashboardModel.buscarTotalParticipantesConcluintes(),
      dashboardModel.buscarProgressoRespostasPorPerguntaAtiva(),
      dashboardModel.buscarDistribuicaoCorrentesPorPerguntaAtiva(),
    ]);

    // Normaliza os dados para números e arrays.
    const distribuicaoPorCorrente = resultados[0] || [];
    const totalRespostas = Number(resultados[1]?.[0]?.totalRespostas) || 0;
    const totalParticipantes = Number(resultados[2]?.[0]?.totalParticipantes) || 0;
    const totalConcluintes = Number(resultados[3]?.[0]?.totalConcluintes) || 0;
    const progressoPorPergunta = resultados[4] || [];
    const distribuicaoCorrentesPorPergunta = resultados[5] || [];

    // Retorna payload pronto para renderização no front-end.
    return res.status(200).json({
      totalRespostas: totalRespostas,
      totalParticipantes: totalParticipantes,
      totalConcluintes: totalConcluintes,
      progressoPorPergunta: progressoPorPergunta,
      distribuicaoPorCorrente: distribuicaoPorCorrente,
      distribuicaoCorrentesPorPergunta: distribuicaoCorrentesPorPergunta,
    });
  } catch (erro) {
    // Em erro de banco/consulta, devolve mensagem didática para o cliente.
    console.log("Houve um erro ao buscar métricas da dashboard:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível carregar as métricas no momento.");
  }
}

module.exports = {
  buscarMetricas,
};
