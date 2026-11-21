/*
  Arquivo: src/routes/aquarios.js
  Responsabilidade: endpoints legados de aquário (base web-data-viz).
*/

const express = require("express");
const aquarioController = require("../controllers/aquarioController");

const router = express.Router();

// Lista aquários da empresa informada.
router.get("/:empresaId", aquarioController.buscarAquariosPorEmpresa);

// Cadastra novo aquário.
router.post("/cadastrar", aquarioController.cadastrar);

module.exports = router;
