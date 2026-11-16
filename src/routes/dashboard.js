const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const autenticacao = require("../middlewares/autenticacao");

router.get("/metricas", autenticacao.validarSessao, function (req, res) {
    dashboardController.buscarMetricas(req, res);
});

module.exports = router;
