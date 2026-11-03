const diarioModel = require("../models/diarioModel");

function idValido(idRecebido) {
    const idConvertido = Number(idRecebido);
    return Number.isInteger(idConvertido) && idConvertido > 0;
}

function listar(req, res) {
    return listarPorUsuario(req, res);
}

function listarPorUsuario(req, res) {
    const idUsuarioSessao = req.session?.usuario?.id;

    if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada.");
    }

    // Fluxo assíncrono para buscar os registros de diário de um usuário.
    diarioModel.listarPorUsuario(idUsuarioSessao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os registros do diário: ", erro.sqlMessage || erro.message);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function publicar(req, res) {
    const titulo = req.body.titulo ? req.body.titulo.trim() : "";
    const conteudo = req.body.conteudo ? req.body.conteudo.trim() : "";
    const idUsuarioSessao = req.session?.usuario?.id;

    if (!titulo) {
        return res.status(400).send("O título é obrigatório!");
    } else if (!conteudo) {
        return res.status(400).send("O conteúdo é obrigatório!");
    } else if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada.");
    } else {
        // Fluxo assíncrono para publicar um novo registro no diário.
        diarioModel.publicar(titulo, conteudo, idUsuarioSessao)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("Houve um erro ao realizar o registro do diário: ", erro.sqlMessage || erro.message);
                res.status(500).json(erro.sqlMessage || erro.message);
            });
    }
}

function deletar(req, res) {
    const idDiario = req.params.idDiario;
    const idUsuarioSessao = req.session?.usuario?.id;

    if (!idValido(idDiario)) {
        return res.status(400).send("O id do registro do diário é inválido!");
    }

    if (!idValido(idUsuarioSessao)) {
        return res.status(401).send("Sessão inválida ou expirada.");
    }

    // Fluxo assíncrono para deletar um registro do diário.
    diarioModel.deletar(idDiario, idUsuarioSessao)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao deletar o registro do diário: ", erro.sqlMessage || erro.message);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

module.exports = {
    listar,
    listarPorUsuario,
    publicar,
    deletar
};
