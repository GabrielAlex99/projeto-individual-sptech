const descobertaModel = require("../models/descobertaModel");

function idValido(idRecebido) {
    const idConvertido = Number(idRecebido);
    return Number.isInteger(idConvertido) && idConvertido > 0;
}

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

// Fluxo assíncrono para validar e registrar a resposta da descoberta do usuário autenticado.
async function responderPergunta(req, res) {
    const idUsuarioSessao = req.session?.usuario?.id;
    const idAlternativa = Number(req.body?.idAlternativa);

    if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada. Faça login novamente.");
    }

    if (!idValido(idAlternativa)) {
        return res.status(400).send("Dados da resposta inválidos.");
    }

    try {
        const perguntaAtiva = await descobertaModel.buscarPerguntaAtiva();

        if (!perguntaAtiva || perguntaAtiva.length === 0) {
            return res.status(400).send("Nenhuma pergunta ativa disponível para resposta.");
        }

        const idPerguntaAtiva = perguntaAtiva[0].idPergunta;
        const alternativaDaPergunta = await descobertaModel.buscarAlternativaDaPerguntaAtiva(idAlternativa, idPerguntaAtiva);

        if (!alternativaDaPergunta || alternativaDaPergunta.length === 0) {
            return res.status(400).send("Alternativa inválida para a pergunta ativa.");
        }

        const respostaExistente = await descobertaModel.buscarRespostaPorUsuarioPergunta(idUsuarioSessao, idPerguntaAtiva);

        if (respostaExistente && respostaExistente.length > 0) {
            return res.status(409).send("Você já respondeu a pergunta ativa. A resposta original foi mantida.");
        }

        await descobertaModel.registrarResposta(idUsuarioSessao, idPerguntaAtiva, idAlternativa);
        return res.status(201).send("Resposta registrada com sucesso.");
    } catch (erro) {
        if (erro && erro.code === "ER_DUP_ENTRY") {
            return res.status(409).send("Você já respondeu a pergunta ativa. A resposta original foi mantida.");
        }

        console.log("Houve um erro ao registrar resposta da descoberta:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível registrar a resposta no momento.");
    }
}

module.exports = {
    buscarPerguntaAtiva,
    responderPergunta
};
