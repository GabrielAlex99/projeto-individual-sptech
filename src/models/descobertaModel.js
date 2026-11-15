const database = require("../database/config");

function buscarPerguntaAtivaComAlternativas() {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarPerguntaAtivaComAlternativas()");

    // Query de banco para buscar a primeira pergunta ativa e suas alternativas vinculadas.
    const instrucaoSql = `
        SELECT
            p.id AS idPergunta,
            p.enunciado,
            p.categoria,
            p.ordem_exibicao,
            a.id AS idAlternativa,
            a.texto AS textoAlternativa
        FROM pergunta_filosofica p
        LEFT JOIN alternativa_filosofica a ON a.fk_pergunta = p.id
        WHERE p.id = (
            SELECT id
            FROM pergunta_filosofica
            WHERE ativo = 1
            ORDER BY ordem_exibicao ASC
            LIMIT 1
        )
        ORDER BY a.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarPerguntaAtivaComAlternativas
};
