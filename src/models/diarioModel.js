const database = require("../database/config");

function listar() {
    console.log("ACESSEI O DIARIO MODEL \n\n function listar()");

    // Query que lista todos os registros de diário com os dados do autor.
    const instrucaoSql = `
        SELECT
            d.id AS idDiario,
            d.titulo,
            d.conteudo,
            d.data_registro,
            d.fk_usuario,
            u.id AS idUsuario,
            u.nome,
            u.email
        FROM diario d
        INNER JOIN usuario u ON d.fk_usuario = u.id
        ORDER BY d.data_registro DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPorUsuario(idUsuario) {
    console.log("ACESSEI O DIARIO MODEL \n\n function listarPorUsuario()", idUsuario);

    // Query de banco com parâmetro para listar registros do usuário logado.
    const instrucaoSql = `
        SELECT
            d.id AS idDiario,
            d.titulo,
            d.conteudo,
            d.data_registro,
            d.fk_usuario,
            u.id AS idUsuario,
            u.nome,
            u.email
        FROM diario d
        INNER JOIN usuario u ON d.fk_usuario = u.id
        WHERE u.id = ?
        ORDER BY d.data_registro DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario]);
}

function publicar(titulo, conteudo, idUsuario) {
    console.log("ACESSEI O DIARIO MODEL \n\n function publicar()", titulo, idUsuario);

    // Query de banco com parâmetros para inserir novo registro de diário.
    const instrucaoSql = `
        INSERT INTO diario (titulo, conteudo, data_registro, fk_usuario)
        VALUES (?, ?, NOW(), ?);
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [titulo, conteudo, idUsuario]);
}

function deletar(idDiario, idUsuario) {
    console.log("ACESSEI O DIARIO MODEL \n\n function deletar()", idDiario);

    // Query de banco com parâmetros para deletar somente registro do usuário logado.
    const instrucaoSql = `
        DELETE FROM diario WHERE id = ? AND fk_usuario = ?;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idDiario, idUsuario]);
}

module.exports = {
    listar,
    listarPorUsuario,
    publicar,
    deletar
};
