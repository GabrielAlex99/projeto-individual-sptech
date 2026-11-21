/*
  Arquivo: src/controllers/diarioController.js
  Responsabilidade: validar requisição do diário e chamar o model.
  Organização:
  1) validação de id;
  2) listagem por usuário;
  3) publicação;
  4) exclusão.
*/

const diarioModel = require("../models/diarioModel");

const LIMITE_TITULO_DIARIO = 100;

// Valida IDs numéricos positivos.
function idValido(idRecebido) {
  const idConvertido = Number(idRecebido);
  return Number.isInteger(idConvertido) && idConvertido > 0;
}

// Valida se o campo recebido é texto.
function campoTexto(valor) {
  return typeof valor === "string";
}

// Mantém compatibilidade com chamadas antigas que usam "listar".
function listar(req, res) {
  return listarPorUsuario(req, res);
}

// Fluxo assíncrono para listar apenas as reflexões do usuário autenticado.
async function listarPorUsuario(req, res) {
  const idUsuarioSessao = req.session?.usuario?.id;

  if (!idValido(idUsuarioSessao)) {
    return res.status(401).send("Sessão inválida ou expirada.");
  }

  try {
    const resultado = await diarioModel.listarPorUsuario(idUsuarioSessao);

    if (resultado.length > 0) {
      return res.status(200).json(resultado);
    }

    return res.status(204).send("Nenhuma reflexão registrada.");
  } catch (erro) {
    console.log("Houve um erro ao buscar os registros do diário:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível carregar o diário no momento.");
  }
}

/*
  Fluxo assíncrono para publicar nova reflexão.
  Regras:
  - título e conteúdo devem ser string;
  - título e conteúdo não podem ficar vazios após trim;
  - título deve respeitar limite de 100 caracteres (alinhado ao schema atual).
*/
async function publicar(req, res) {
  const tituloBruto = req.body?.titulo;
  const conteudoBruto = req.body?.conteudo;
  const idUsuarioSessao = req.session?.usuario?.id;

  if (!campoTexto(tituloBruto)) {
    return res.status(400).send("O título deve ser um texto válido.");
  }

  if (!campoTexto(conteudoBruto)) {
    return res.status(400).send("O conteúdo deve ser um texto válido.");
  }

  const titulo = tituloBruto.trim();
  const conteudo = conteudoBruto.trim();

  if (!titulo) {
    return res.status(400).send("O título é obrigatório.");
  }

  if (titulo.length > LIMITE_TITULO_DIARIO) {
    return res
      .status(400)
      .send(`O título pode ter no máximo ${LIMITE_TITULO_DIARIO} caracteres.`);
  }

  if (!conteudo) {
    return res.status(400).send("O conteúdo é obrigatório.");
  }

  if (!idValido(idUsuarioSessao)) {
    return res.status(401).send("Sessão inválida ou expirada.");
  }

  try {
    const resultado = await diarioModel.publicar(titulo, conteudo, idUsuarioSessao);
    return res.status(201).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao publicar registro do diário:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível publicar a reflexão no momento.");
  }
}

// Fluxo assíncrono para excluir uma reflexão do próprio usuário autenticado.
async function deletar(req, res) {
  const idDiario = req.params.idDiario;
  const idUsuarioSessao = req.session?.usuario?.id;

  if (!idValido(idDiario)) {
    return res.status(400).send("ID de reflexão inválido.");
  }

  if (!idValido(idUsuarioSessao)) {
    return res.status(401).send("Sessão inválida ou expirada.");
  }

  try {
    const resultado = await diarioModel.deletar(idDiario, idUsuarioSessao);

    if (!resultado || resultado.affectedRows < 1) {
      return res.status(404).send("Reflexão não encontrada para exclusão.");
    }

    return res.status(200).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao deletar registro do diário:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível excluir a reflexão no momento.");
  }
}

module.exports = {
  listar,
  listarPorUsuario,
  publicar,
  deletar,
};
