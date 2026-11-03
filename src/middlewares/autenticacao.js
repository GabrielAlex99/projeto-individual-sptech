function validarSessao(req, res, next) {
    // Validação simples da sessão para proteger rotas autenticadas.
    if (!req.session || !req.session.usuario || !req.session.usuario.id) {
        return res.status(401).send("Sessão inválida ou expirada. Faça login novamente.");
    }

    next();
}

module.exports = {
    validarSessao
};
