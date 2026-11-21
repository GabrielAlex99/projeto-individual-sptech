/*
  Arquivo: src/routes/medidas.js
  Responsabilidade: endpoints legados de medidas de sensor (base web-data-viz).
*/

const express = require("express");
const medidaController = require("../controllers/medidaController");

const router = express.Router();

// Retorna as últimas medições de um aquário.
router.get("/ultimas/:idAquario", medidaController.buscarUltimasMedidas);

// Retorna a medição mais recente (tempo real) de um aquário.
router.get("/tempo-real/:idAquario", medidaController.buscarMedidasEmTempoReal);

module.exports = router;
