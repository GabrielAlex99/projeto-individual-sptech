/*
  Arquivo: src/routes/index.js
  Responsabilidade: rota principal da aplicação.
*/

const express = require("express");
const path = require("path");

const router = express.Router();

// Rota GET "/" para servir a página inicial.
router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

module.exports = router;
