/*
  Arquivo: src/middlewares/autenticacao.js
  Responsabilidade: bloquear rotas privadas quando não existe sessão válida.
*/

function validarSessao(req, res, next) {
  // Verifica se o usuário autenticado existe dentro da sessão.
  if (!req.session || !req.session.usuario || !req.session.usuario.id) {
    return res.status(401).send("Sessão inválida ou expirada. Faça login novamente.");
  }

  // Libera a continuação da requisição para o próximo middleware/controller.
  next();
}

module.exports = {
  validarSessao,
};
