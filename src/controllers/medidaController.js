/*
  Arquivo: src/controllers/medidaController.js
  Responsabilidade: validar entrada e retornar medições para gráficos.
  Organização:
  1) últimas medidas;
  2) medida em tempo real.
*/

const medidaModel = require("../models/medidaModel");

// Valida IDs numéricos positivos.
function idValido(idRecebido) {
  const idConvertido = Number(idRecebido);
  return Number.isInteger(idConvertido) && idConvertido > 0;
}

// Fluxo assíncrono para buscar as últimas medidas de um aquário.
async function buscarUltimasMedidas(req, res) {
  const limiteLinhas = 7;
  const idAquario = req.params.idAquario;

  if (!idValido(idAquario)) {
    return res.status(400).send("ID do aquário inválido.");
  }

  try {
    const resultado = await medidaModel.buscarUltimasMedidas(idAquario, limiteLinhas);

    if (resultado.length > 0) {
      return res.status(200).json(resultado);
    }

    return res.status(204).send("Nenhum resultado encontrado.");
  } catch (erro) {
    console.log("Houve um erro ao buscar as últimas medidas:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível carregar as últimas medidas no momento.");
  }
}

// Fluxo assíncrono para buscar a medida mais recente em tempo real de um aquário.
async function buscarMedidasEmTempoReal(req, res) {
  const idAquario = req.params.idAquario;

  if (!idValido(idAquario)) {
    return res.status(400).send("ID do aquário inválido.");
  }

  try {
    const resultado = await medidaModel.buscarMedidasEmTempoReal(idAquario);

    if (resultado.length > 0) {
      return res.status(200).json(resultado);
    }

    return res.status(204).send("Nenhum resultado encontrado.");
  } catch (erro) {
    console.log("Houve um erro ao buscar medidas em tempo real:", erro.sqlMessage || erro.message);
    return res.status(500).send("Não foi possível carregar as medidas em tempo real no momento.");
  }
}

module.exports = {
  buscarUltimasMedidas,
  buscarMedidasEmTempoReal,
};
