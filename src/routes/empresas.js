/*
  Arquivo: src/routes/empresas.js
  Responsabilidade: endpoints legados de empresa (base web-data-viz).
*/

const express = require("express");
const empresaController = require("../controllers/empresaController");

const router = express.Router();

// Cadastra empresa.
router.post("/cadastrar", empresaController.cadastrar);

// Busca empresa por CNPJ (query string).
router.get("/buscar", empresaController.buscarPorCnpj);

// Busca empresa por ID.
router.get("/buscar/:id", empresaController.buscarPorId);

// Lista empresas.
router.get("/listar", empresaController.listar);

module.exports = router;
