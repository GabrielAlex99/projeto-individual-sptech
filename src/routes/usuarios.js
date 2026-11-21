/*
  Arquivo: src/routes/usuarios.js
  Responsabilidade: mapear endpoints de autenticação e sessão.
*/

const express = require("express");
const usuarioController = require("../controllers/usuarioController");

const router = express.Router();

// Cadastro de novo usuário.
router.post("/cadastrar", usuarioController.cadastrar);

// Login do usuário.
router.post("/autenticar", usuarioController.autenticar);

// Validação da sessão atual.
router.get("/sessao", usuarioController.verificarSessao);

// Encerramento da sessão (logout).
router.post("/sair", usuarioController.encerrarSessao);

module.exports = router;
