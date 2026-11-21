/*
  Arquivo: src/controllers/empresaController.js
  Responsabilidade: regras de validação de empresa e integração com empresaModel.
  Organização:
  1) buscar por CNPJ;
  2) listar;
  3) buscar por ID;
  4) cadastrar.
*/

const empresaModel = require("../models/empresaModel");

// Valida IDs numéricos positivos.
function idValido(idRecebido) {
  const idConvertido = Number(idRecebido);
  return Number.isInteger(idConvertido) && idConvertido > 0;
}

// Fluxo assíncrono para consultar empresa por CNPJ.
async function buscarPorCnpj(req, res) {
  const cnpj = req.query.cnpj ? req.query.cnpj.trim() : "";

  if (!cnpj) {
    return res.status(400).send("Informe o CNPJ.");
  }

  try {
    const resultado = await empresaModel.buscarPorCnpj(cnpj);
    return res.status(200).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao buscar empresa por CNPJ:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível buscar a empresa no momento.");
  }
}

// Fluxo assíncrono para listar empresas.
async function listar(req, res) {
  try {
    const resultado = await empresaModel.listar();
    return res.status(200).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao listar empresas:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível listar as empresas no momento.");
  }
}

// Fluxo assíncrono para buscar uma empresa por id.
async function buscarPorId(req, res) {
  const id = req.params.id;

  if (!idValido(id)) {
    return res.status(400).send("ID de empresa inválido.");
  }

  try {
    const resultado = await empresaModel.buscarPorId(id);
    return res.status(200).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao buscar empresa por id:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível buscar a empresa no momento.");
  }
}

// Fluxo assíncrono para cadastrar empresa com validação básica e sem duplicidade de CNPJ.
async function cadastrar(req, res) {
  const cnpj = req.body.cnpj ? req.body.cnpj.trim() : "";
  const razaoSocial = req.body.razaoSocial ? req.body.razaoSocial.trim() : "";

  if (!cnpj || !razaoSocial) {
    return res.status(400).send("Informe razão social e CNPJ.");
  }

  try {
    // Verifica se já existe empresa com o mesmo CNPJ.
    const empresaExistente = await empresaModel.buscarPorCnpj(cnpj);

    if (empresaExistente.length > 0) {
      return res.status(409).json({ mensagem: `A empresa com o CNPJ ${cnpj} já existe.` });
    }

    // Persiste no banco quando o CNPJ ainda não existe.
    const resultado = await empresaModel.cadastrar(razaoSocial, cnpj);
    return res.status(201).json(resultado);
  } catch (erro) {
    console.log("Houve um erro ao cadastrar empresa:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível cadastrar a empresa no momento.");
  }
}

module.exports = {
  buscarPorCnpj,
  buscarPorId,
  cadastrar,
  listar,
};
