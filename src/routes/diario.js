const express = require("express");
const router = express.Router();

const diarioController = require("../controllers/diarioController");
const autenticacao = require("../middlewares/autenticacao");

router.use(autenticacao.validarSessao);

router.get("/listar", function (req, res) {
    diarioController.listarPorUsuario(req, res);
});

router.post("/publicar", function (req, res) {
    diarioController.publicar(req, res);
});

router.delete("/deletar/:idDiario", function (req, res) {
    diarioController.deletar(req, res);
});

module.exports = router;
