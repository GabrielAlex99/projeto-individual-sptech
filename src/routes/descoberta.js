/*
  Arquivo: src/routes/descoberta.js
  Responsabilidade: endpoints do questionário filosófico.
*/

const express = require("express");
const descobertaController = require("../controllers/descobertaController");
const autenticacao = require("../middlewares/autenticacao");

const router = express.Router();

// Leitura pública da pergunta ativa (visitantes podem visualizar).
router.get("/pergunta-ativa", descobertaController.buscarPerguntaAtiva);

// Busca próxima pergunta pendente (exige sessão).
router.get("/proxima-pergunta", autenticacao.validarSessao, descobertaController.buscarProximaPerguntaPendente);

// Consulta a resposta já registrada da pergunta ativa (exige sessão).
router.get("/resposta-ativa", autenticacao.validarSessao, descobertaController.buscarRespostaAtiva);

// Consulta o resultado final do usuário autenticado.
router.get("/meu-resultado", autenticacao.validarSessao, descobertaController.buscarMeuResultado);

// Registra resposta da pergunta pendente do usuário autenticado.
router.post("/responder", autenticacao.validarSessao, descobertaController.responderPergunta);

module.exports = router;
