/*
  Arquivo: src/controllers/aquarioController.js
  Responsabilidade: validações de aquário e chamada ao aquarioModel.
  Organização:
  1) busca por empresa;
  2) cadastro.
*/

const aquarioModel = require("../models/aquarioModel");

// Valida IDs numéricos positivos.
function idValido(idRecebido) {
  const idConvertido = Number(idRecebido);
  return Number.isInteger(idConvertido) && idConvertido > 0;
}

// Fluxo assíncrono para listar aquários vinculados a uma empresa.
async function buscarAquariosPorEmpresa(req, res) {
  const empresaId = req.params.empresaId;

  if (!idValido(empresaId)) {
    return res.status(400).send("ID da empresa inválido.");
  }

  try {
    const resultado = await aquarioModel.buscarAquariosPorEmpresa(empresaId);

    if (resultado.length > 0) {
      return res.status(200).json(resultado);
    }

    return res.status(204).json([]);
  } catch (erro) {
    console.log("Houve um erro ao buscar aquários:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível buscar os aquários no momento.");
  }
}

// Fluxo assíncrono para cadastrar aquário.
async function cadastrar(req, res) {
  const descricao = req.body.descricao ? req.body.descricao.trim() : "";
  // Mantém compatibilidade com payload legado ("idUsuario") e atual ("empresaId").
  const empresaId = req.body.empresaId ?? req.body.idUsuario;

  if (!descricao) {
    return res.status(400).send("Descrição é obrigatória.");
  }

  if (!idValido(empresaId)) {
    return res.status(400).send("ID da empresa inválido.");
  }

  try {
    const resultado = await aquarioModel.cadastrar(descricao, empresaId);
    return res.status(201).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao cadastrar aquário:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível cadastrar o aquário no momento.");
  }
}

module.exports = {
  buscarAquariosPorEmpresa,
  cadastrar,
};
