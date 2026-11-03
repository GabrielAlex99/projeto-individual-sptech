const database = require("../database/config");

function buscarPorEmail(email) {
    console.log("ACESSEI O USUARIO MODEL \n\n function buscarPorEmail()");

    // Query de banco para buscar usuário por email.
    const instrucaoSql = `
        SELECT id, nome, email, senha
        FROM usuario
        WHERE email = ?;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [email]);
}

function cadastrar(nome, email, senhaHash) {
    console.log("ACESSEI O USUARIO MODEL \n\n function cadastrar()");

    // Query de banco para cadastro de usuário com senha já em hash.
    const instrucaoSql = `
        INSERT INTO usuario (nome, email, senha)
        VALUES (?, ?, ?);
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [nome, email, senhaHash]);
}

function atualizarSenhaHash(idUsuario, senhaHash) {
    console.log("ACESSEI O USUARIO MODEL \n\n function atualizarSenhaHash()");

    // Query de banco para atualizar senha em hash de contas legadas.
    const instrucaoSql = `
        UPDATE usuario
        SET senha = ?
        WHERE id = ?;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [senhaHash, idUsuario]);
}

module.exports = {
    buscarPorEmail,
    cadastrar,
    atualizarSenhaHash
};
