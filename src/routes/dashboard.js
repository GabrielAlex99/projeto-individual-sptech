/*
  Arquivo: src/routes/dashboard.js
  Responsabilidade: endpoint da dashboard de métricas agregadas.
*/

const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const autenticacao = require("../middlewares/autenticacao");

const router = express.Router();

// Retorna métricas do questionário (somente usuário autenticado).
router.get("/metricas", autenticacao.validarSessao, dashboardController.buscarMetricas);

module.exports = router;
