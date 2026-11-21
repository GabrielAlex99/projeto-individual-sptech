/*
  Arquivo: src/models/aquarioModel.js
  Responsabilidade: consultas SQL do recurso aquário (legado web-data-viz).
*/

const database = require("../database/config");

function buscarAquariosPorEmpresa(empresaId) {
  // Query de banco para listar aquários de uma empresa.
  const instrucaoSql = `
    SELECT id, descricao, fk_empresa AS fkEmpresa
    FROM aquario
    WHERE fk_empresa = ?;
  `;

  return database.executar(instrucaoSql, [empresaId]);
}

function cadastrar(descricao, empresaId) {
  // Query de banco para cadastrar aquário de forma parametrizada.
  const instrucaoSql = `
    INSERT INTO aquario (descricao, fk_empresa)
    VALUES (?, ?);
  `;

  return database.executar(instrucaoSql, [descricao, empresaId]);
}

module.exports = {
  buscarAquariosPorEmpresa,
  cadastrar,
};
