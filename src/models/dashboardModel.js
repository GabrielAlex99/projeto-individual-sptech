const database = require("../database/config");

function buscarRespostasPorCorrente() {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarRespostasPorCorrente()");

    // Query que conta respostas por corrente filosófica somente para a pergunta ativa.
    const instrucaoSql = `
        SELECT
            a.corrente_filosofica AS correnteFilosofica,
            COUNT(r.id) AS totalRespostas
        FROM resposta_filosofica r
        INNER JOIN alternativa_filosofica a ON a.id = r.fk_alternativa
        INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
        WHERE p.id = (
            SELECT id
            FROM pergunta_filosofica
            WHERE ativo = 1
            ORDER BY ordem_exibicao ASC
            LIMIT 1
        )
        GROUP BY a.corrente_filosofica
        ORDER BY totalRespostas DESC, a.corrente_filosofica ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarRespostasPorCorrente
};
