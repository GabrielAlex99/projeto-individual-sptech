/*
  Arquivo: src/models/medidaModel.js
  Responsabilidade: consultas SQL de medições (legado web-data-viz).
*/

const database = require("../database/config");

function buscarUltimasMedidas(idAquario, limiteLinhas) {
  // Query de banco para buscar últimas medições de temperatura.
  const instrucaoSql = `
    SELECT
      temperatura,
      momento,
      DATE_FORMAT(momento, '%H:%i:%s') AS momento_grafico
    FROM medida
    WHERE fk_aquario = ?
    ORDER BY id DESC
    LIMIT ?;
  `;

  return database.executar(instrucaoSql, [idAquario, Number(limiteLinhas)]);
}

function buscarMedidasEmTempoReal(idAquario) {
  // Query de banco para buscar a medição mais recente de um aquário.
  const instrucaoSql = `
    SELECT
      temperatura,
      DATE_FORMAT(momento, '%H:%i:%s') AS momento_grafico,
      fk_aquario
    FROM medida
    WHERE fk_aquario = ?
    ORDER BY id DESC
    LIMIT 1;
  `;

  return database.executar(instrucaoSql, [idAquario]);
}

module.exports = {
  buscarUltimasMedidas,
  buscarMedidasEmTempoReal,
};
