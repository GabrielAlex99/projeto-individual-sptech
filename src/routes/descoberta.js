const express = require("express");
const router = express.Router();

const descobertaController = require("../controllers/descobertaController");

router.get("/pergunta-ativa", function (req, res) {
    descobertaController.buscarPerguntaAtiva(req, res);
});

module.exports = router;
