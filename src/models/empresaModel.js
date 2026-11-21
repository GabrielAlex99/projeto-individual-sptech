/*
  Arquivo: src/models/empresaModel.js
  Responsabilidade: consultas SQL do recurso empresa (legado web-data-viz).
*/

const database = require("../database/config");

function buscarPorId(id) {
  // Query de banco para buscar empresa por id.
  const instrucaoSql = `
    SELECT id, razao_social, cnpj, codigo_ativacao
    FROM empresa
    WHERE id = ?;
  `;

  return database.executar(instrucaoSql, [id]);
}

function listar() {
  // Query de banco para listar empresas.
  const instrucaoSql = `
    SELECT id, razao_social, cnpj, codigo_ativacao
    FROM empresa;
  `;

  return database.executar(instrucaoSql);
}

function buscarPorCnpj(cnpj) {
  // Query de banco para buscar empresa por CNPJ.
  const instrucaoSql = `
    SELECT id, razao_social, cnpj, codigo_ativacao
    FROM empresa
    WHERE cnpj = ?;
  `;

  return database.executar(instrucaoSql, [cnpj]);
}

function cadastrar(razaoSocial, cnpj) {
  // Query de banco para cadastrar empresa de forma parametrizada.
  const instrucaoSql = `
    INSERT INTO empresa (razao_social, cnpj)
    VALUES (?, ?);
  `;

  return database.executar(instrucaoSql, [razaoSocial, cnpj]);
}

module.exports = {
  buscarPorCnpj,
  buscarPorId,
  cadastrar,
  listar,
};
