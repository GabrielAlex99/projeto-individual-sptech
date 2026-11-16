const express = require("express");
const router = express.Router();

const descobertaController = require("../controllers/descobertaController");
const autenticacao = require("../middlewares/autenticacao");

router.get("/pergunta-ativa", function (req, res) {
    descobertaController.buscarPerguntaAtiva(req, res);
});

router.post("/responder", autenticacao.validarSessao, function (req, res) {
    descobertaController.responderPergunta(req, res);
});

module.exports = router;
