/*
  Arquivo: src/routes/diario.js
  Responsabilidade: endpoints do diário filosófico.
*/

const express = require("express");
const diarioController = require("../controllers/diarioController");
const autenticacao = require("../middlewares/autenticacao");

const router = express.Router();

// Wrapper simples para evitar rejeições assíncronas sem tratamento no Express 4.
function executarAsyncSeguro(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(function (erro) {
      console.log("Erro não tratado em rota de diário:", erro.message);
      if (!res.headersSent) {
        return res.status(500).send("Não foi possível processar a requisição no momento.");
      }
      return next(erro);
    });
  };
}

// Protege todas as rotas deste arquivo exigindo sessão válida.
router.use(autenticacao.validarSessao);

// Lista as reflexões do usuário autenticado.
router.get("/listar", executarAsyncSeguro(diarioController.listarPorUsuario));

// Publica uma nova reflexão.
router.post("/publicar", executarAsyncSeguro(diarioController.publicar));

// Exclui uma reflexão específica do usuário.
router.delete("/deletar/:idDiario", executarAsyncSeguro(diarioController.deletar));

module.exports = router;
