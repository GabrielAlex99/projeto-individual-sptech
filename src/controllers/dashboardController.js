const dashboardModel = require("../models/dashboardModel");

function buscarMetricas(req, res) {
    // Fluxo assíncrono para carregar métricas agregadas das respostas em perguntas ativas.
    Promise.all([
        dashboardModel.buscarRespostasPorCorrente(),
        dashboardModel.buscarTotalRespostasAtivas(),
        dashboardModel.buscarTotalParticipantesAtivos(),
        dashboardModel.buscarTotalParticipantesConcluintes(),
        dashboardModel.buscarProgressoRespostasPorPerguntaAtiva()
    ])
        .then(function (resultados) {
            const distribuicaoPorCorrente = resultados[0] || [];
            const totalRespostas = Number(resultados[1]?.[0]?.totalRespostas) || 0;
            const totalParticipantes = Number(resultados[2]?.[0]?.totalParticipantes) || 0;
            const totalConcluintes = Number(resultados[3]?.[0]?.totalConcluintes) || 0;
            const progressoPorPergunta = resultados[4] || [];

            return res.status(200).json({
                totalRespostas: totalRespostas,
                totalParticipantes: totalParticipantes,
                totalConcluintes: totalConcluintes,
                progressoPorPergunta: progressoPorPergunta,
                distribuicaoPorCorrente: distribuicaoPorCorrente
            });
        })
        .catch(function (erro) {
            console.log("Houve um erro ao buscar métricas da dashboard:", erro.sqlMessage || erro.message);
            return res.status(500).send("Não foi possível carregar as métricas no momento.");
        });
}

module.exports = {
    buscarMetricas
};
