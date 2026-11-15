const descobertaModel = require("../models/descobertaModel");

function buscarPerguntaAtiva(req, res) {
    // Fluxo assíncrono para buscar pergunta ativa e alternativas da tela de descoberta.
    descobertaModel.buscarPerguntaAtivaComAlternativas()
        .then(function (resultado) {
            if (!resultado || resultado.length === 0) {
                return res.status(204).send("Nenhuma pergunta ativa encontrada.");
            }

            const pergunta = {
                idPergunta: resultado[0].idPergunta,
                enunciado: resultado[0].enunciado,
                categoria: resultado[0].categoria,
                alternativas: []
            };

            for (let i = 0; i < resultado.length; i++) {
                if (resultado[i].idAlternativa !== null) {
                    pergunta.alternativas.push({
                        idAlternativa: resultado[i].idAlternativa,
                        texto: resultado[i].textoAlternativa
                    });
                }
            }

            return res.status(200).json(pergunta);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar pergunta ativa da descoberta:", erro.sqlMessage || erro.message);
            return res.status(500).json(erro.sqlMessage || erro.message);
        });
}

module.exports = {
    buscarPerguntaAtiva
};
