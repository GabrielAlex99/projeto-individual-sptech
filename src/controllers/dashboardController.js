const dashboardModel = require("../models/dashboardModel");

function buscarMetricas(req, res) {
    // Fluxo assíncrono para carregar métricas agregadas das respostas da pergunta ativa.
    dashboardModel.buscarRespostasPorCorrente()
        .then(function (resultado) {
            if (!resultado || resultado.length === 0) {
                return res.status(204).send();
            }

            return res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Houve um erro ao buscar métricas da dashboard:", erro.sqlMessage || erro.message);
            return res.status(500).send("Não foi possível carregar as métricas no momento.");
        });
}

module.exports = {
    buscarMetricas
};
