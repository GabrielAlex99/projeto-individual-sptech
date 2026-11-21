/*
  Arquivo: src/routes/diario.js
  Responsabilidade: endpoints do diário filosófico.
*/

const express = require("express");
const diarioController = require("../controllers/diarioController");
const autenticacao = require("../middlewares/autenticacao");

const router = express.Router();

// Protege todas as rotas deste arquivo exigindo sessão válida.
router.use(autenticacao.validarSessao);

// Lista as reflexões do usuário autenticado.
router.get("/listar", diarioController.listarPorUsuario);

// Publica uma nova reflexão.
router.post("/publicar", diarioController.publicar);

// Exclui uma reflexão específica do usuário.
router.delete("/deletar/:idDiario", diarioController.deletar);

module.exports = router;
