/*
  Arquivo: src/database/config.js
  Responsabilidade: centralizar conexão e execução de SQL no MySQL.
*/

const mysql = require("mysql2");

// Lê credenciais do banco pelas variáveis de ambiente.
const mySqlConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// Valida se o ambiente foi definido corretamente (desenvolvimento ou produção).
function ambienteProcessoValido() {
  return process.env.AMBIENTE_PROCESSO === "producao" || process.env.AMBIENTE_PROCESSO === "desenvolvimento";
}

// Fluxo assíncrono para executar query SQL com parâmetros (evita SQL Injection).
function executar(instrucao, parametros) {
  // Quando não houver parâmetros, usa array vazio.
  const valores = Array.isArray(parametros) ? parametros : [];

  // Bloqueia execução se o ambiente da aplicação não estiver configurado.
  if (!ambienteProcessoValido()) {
    console.log("\nO ambiente do processo não foi definido corretamente em .env/.env.dev ou app.js\n");
    return Promise.reject(new Error("AMBIENTE NÃO CONFIGURADO EM .env"));
  }

  // Abre conexão, executa query e retorna o resultado em Promise.
  return new Promise(function (resolve, reject) {
    const conexao = mysql.createConnection(mySqlConfig);

    conexao.connect(function (erroConexao) {
      if (erroConexao) {
        reject(erroConexao);
        return;
      }

      // Executa a instrução SQL usando placeholders e parâmetros.
      conexao.query(instrucao, valores, function (erroQuery, resultados) {
        conexao.end();

        if (erroQuery) {
          reject(erroQuery);
          return;
        }

        resolve(resultados);
      });
    });

    // Loga falhas de conexão/query vindas do driver.
    conexao.on("error", function (erro) {
      console.log("ERRO NO MySQL SERVER:", erro.sqlMessage || erro.message);
    });
  });
}

module.exports = {
  executar,
};
