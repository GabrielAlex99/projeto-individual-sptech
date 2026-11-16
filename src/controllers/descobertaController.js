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
            return res.status(500).send("Não foi possível carregar a pergunta ativa no momento.");
        });
}

function montarPerguntaComAlternativas(resultado) {
    if (!resultado || resultado.length === 0) {
        return null;
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

    return pergunta;
}

// Fluxo assíncrono para buscar a próxima pergunta pendente da descoberta para o usuário autenticado.
async function buscarProximaPerguntaPendente(req, res) {
    const idUsuarioSessao = req.session?.usuario?.id;

    if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada. Faça login novamente.");
    }

    try {
        const perguntasAtivas = await descobertaModel.listarPerguntasAtivasOrdenadas();
        const totalPerguntasAtivas = perguntasAtivas.length;
        const totalRespondidasResposta = await descobertaModel.contarPerguntasAtivasRespondidasDoUsuario(idUsuarioSessao);
        const totalRespondidas = Number(totalRespondidasResposta?.[0]?.totalRespondidas) || 0;

        if (totalPerguntasAtivas === 0) {
            return res.status(204).send("Nenhuma pergunta ativa encontrada.");
        }

        const proximaPergunta = await descobertaModel.buscarProximaPerguntaPendenteComAlternativas(idUsuarioSessao);

        if (!proximaPergunta || proximaPergunta.length === 0) {
            return res.status(200).json({
                concluido: true,
                totalPerguntasAtivas: totalPerguntasAtivas,
                totalRespondidas: totalRespondidas
            });
        }

        const perguntaMontada = montarPerguntaComAlternativas(proximaPergunta);
        const posicaoAtual = perguntasAtivas.findIndex(function (perguntaAtiva) {
            return Number(perguntaAtiva.idPergunta) === Number(perguntaMontada.idPergunta);
        }) + 1;

        return res.status(200).json({
            concluido: false,
            posicaoAtual: posicaoAtual > 0 ? posicaoAtual : 1,
            totalPerguntasAtivas: totalPerguntasAtivas,
            totalRespondidas: totalRespondidas,
            pergunta: perguntaMontada
        });
    } catch (erro) {
        console.log("Houve um erro ao buscar próxima pergunta pendente:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível carregar a próxima pergunta no momento.");
    }
}

// Fluxo assíncrono para consultar a resposta já registrada do usuário na pergunta ativa.
async function buscarRespostaAtiva(req, res) {
    const idUsuarioSessao = req.session?.usuario?.id;

    if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada. Faça login novamente.");
    }

    try {
        const resposta = await descobertaModel.buscarRespostaDoUsuarioNaPerguntaAtiva(idUsuarioSessao);

        if (!resposta || resposta.length === 0) {
            return res.status(204).send("Nenhuma resposta registrada para a pergunta ativa.");
        }

        return res.status(200).json({
            idAlternativa: resposta[0].idAlternativa
        });
    } catch (erro) {
        console.log("Houve um erro ao consultar resposta ativa da descoberta:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível consultar a resposta registrada no momento.");
    }
}

// Fluxo assíncrono para montar o resultado pessoal a partir da alternativa registrada.
async function buscarMeuResultado(req, res) {
    const idUsuarioSessao = req.session?.usuario?.id;

    if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada. Faça login novamente.");
    }

    try {
        const totalPerguntasAtivasResposta = await descobertaModel.contarPerguntasAtivas();
        const totalPerguntasAtivas = Number(totalPerguntasAtivasResposta?.[0]?.totalPerguntasAtivas) || 0;

        if (totalPerguntasAtivas === 0) {
            return res.status(204).send("Nenhuma pergunta ativa disponível para cálculo de resultado.");
        }

        const totalRespondidasResposta = await descobertaModel.contarPerguntasAtivasRespondidasDoUsuario(idUsuarioSessao);
        const totalRespondidas = Number(totalRespondidasResposta?.[0]?.totalRespondidas) || 0;

        if (totalRespondidas < totalPerguntasAtivas) {
            return res.status(200).json({
                statusQuestionario: "incompleto",
                totalPerguntasAtivas: totalPerguntasAtivas,
                totalRespondidas: totalRespondidas,
                faltam: totalPerguntasAtivas - totalRespondidas
            });
        }

        const pontuacoesPorCorrente = await descobertaModel.buscarResultadoDoUsuario(idUsuarioSessao);

        if (!pontuacoesPorCorrente || pontuacoesPorCorrente.length === 0) {
            return res.status(204).send("Não há pontuação disponível para o resultado no momento.");
        }

        const maiorPontuacao = Number(pontuacoesPorCorrente[0].pontuacaoTotal);
        const correntesEmpatadas = pontuacoesPorCorrente.filter(function (corrente) {
            return Number(corrente.pontuacaoTotal) === maiorPontuacao;
        });

        if (correntesEmpatadas.length === 1) {
            return res.status(200).json({
                statusQuestionario: "concluido",
                tipoResultado: "unico",
                correnteFilosofica: correntesEmpatadas[0].correnteFilosofica,
                pontuacaoVencedora: maiorPontuacao,
                totalPerguntasAtivas: totalPerguntasAtivas,
                totalRespondidas: totalRespondidas,
                pontuacoesPorCorrente: pontuacoesPorCorrente
            });
        }

        return res.status(200).json({
            statusQuestionario: "concluido",
            tipoResultado: "empate",
            correntesEmpatadas: correntesEmpatadas.map(function (corrente) {
                return corrente.correnteFilosofica;
            }),
            pontuacaoVencedora: maiorPontuacao,
            totalPerguntasAtivas: totalPerguntasAtivas,
            totalRespondidas: totalRespondidas,
            pontuacoesPorCorrente: pontuacoesPorCorrente
        });
    } catch (erro) {
        console.log("Houve um erro ao buscar o resultado pessoal:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível carregar seu resultado no momento.");
    }
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
        const perguntasAtivas = await descobertaModel.contarPerguntasAtivas();
        const totalPerguntasAtivas = Number(perguntasAtivas?.[0]?.totalPerguntasAtivas) || 0;

        if (totalPerguntasAtivas === 0) {
            return res.status(400).send("Nenhuma pergunta ativa disponível para resposta.");
        }

        const proximaPergunta = await descobertaModel.buscarProximaPerguntaPendenteComAlternativas(idUsuarioSessao);

        if (!proximaPergunta || proximaPergunta.length === 0) {
            return res.status(409).send("Questionário já concluído. Não há perguntas pendentes.");
        }

        const idPerguntaPendente = proximaPergunta[0].idPergunta;
        const alternativaDaPergunta = await descobertaModel.buscarAlternativaDaPerguntaAtiva(idAlternativa, idPerguntaPendente);

        if (!alternativaDaPergunta || alternativaDaPergunta.length === 0) {
            return res.status(400).send("Alternativa inválida para a pergunta pendente.");
        }

        const respostaExistente = await descobertaModel.buscarRespostaPorUsuarioPergunta(idUsuarioSessao, idPerguntaPendente);

        if (respostaExistente && respostaExistente.length > 0) {
            return res.status(409).send("Você já respondeu a pergunta pendente. A resposta original foi mantida.");
        }

        await descobertaModel.registrarResposta(idUsuarioSessao, idPerguntaPendente, idAlternativa);
        return res.status(201).send("Resposta registrada com sucesso.");
    } catch (erro) {
        if (erro && erro.code === "ER_DUP_ENTRY") {
            return res.status(409).send("Você já respondeu a pergunta pendente. A resposta original foi mantida.");
        }

        console.log("Houve um erro ao registrar resposta da descoberta:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível registrar a resposta no momento.");
    }
}

module.exports = {
    buscarPerguntaAtiva,
    buscarProximaPerguntaPendente,
    buscarRespostaAtiva,
    buscarMeuResultado,
    responderPergunta
};
