/*
  Arquivo: src/routes/usuarios.js
  Responsabilidade: mapear endpoints de autenticação e sessão.
*/

const express = require("express");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

// Wrapper simples para evitar rejeições assíncronas sem tratamento no Express 4.
function executarAsyncSeguro(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(function (erro) {
      console.log("Erro não tratado em rota de usuário:", erro.message);
      if (!res.headersSent) {
        return res.status(500).send("Não foi possível processar a requisição no momento.");
      }
      return next(erro);
    });
  };
}

// Cadastro de novo usuário.
router.post("/cadastrar", executarAsyncSeguro(usuarioController.cadastrar));

// Login do usuário.
router.post("/autenticar", executarAsyncSeguro(usuarioController.autenticar));

// Validação da sessão atual.
router.get("/sessao", executarAsyncSeguro(usuarioController.verificarSessao));

// Encerramento da sessão (logout).
router.post("/sair", executarAsyncSeguro(usuarioController.encerrarSessao));

module.exports = router;
