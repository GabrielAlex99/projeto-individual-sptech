const database = require("../database/config");

function buscarRespostasPorCorrente() {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarRespostasPorCorrente()");

    // Query que conta respostas por corrente filosófica considerando todas as perguntas ativas.
    const instrucaoSql = `
        SELECT
            a.corrente_filosofica AS correnteFilosofica,
            COUNT(r.id) AS totalRespostas
        FROM resposta_filosofica r
        INNER JOIN alternativa_filosofica a ON a.id = r.fk_alternativa
        INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
        WHERE p.ativo = 1
        GROUP BY a.corrente_filosofica
        ORDER BY totalRespostas DESC, a.corrente_filosofica ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTotalRespostasAtivas() {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarTotalRespostasAtivas()");

    // Query de banco para contar todas as respostas vinculadas às perguntas ativas.
    const instrucaoSql = `
        SELECT COUNT(r.id) AS totalRespostas
        FROM resposta_filosofica r
        INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
        WHERE p.ativo = 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTotalParticipantesAtivos() {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarTotalParticipantesAtivos()");

    // Query de banco para contar usuários distintos com ao menos uma resposta em perguntas ativas.
    const instrucaoSql = `
        SELECT COUNT(DISTINCT r.fk_usuario) AS totalParticipantes
        FROM resposta_filosofica r
        INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
        WHERE p.ativo = 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTotalParticipantesConcluintes() {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarTotalParticipantesConcluintes()");

    // Query de banco para contar participantes que responderam todas as perguntas ativas.
    const instrucaoSql = `
        SELECT COUNT(*) AS totalConcluintes
        FROM (
            SELECT
                r.fk_usuario
            FROM resposta_filosofica r
            INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
            WHERE p.ativo = 1
            GROUP BY r.fk_usuario
            HAVING COUNT(DISTINCT r.fk_pergunta) = (
                SELECT COUNT(*)
                FROM pergunta_filosofica
                WHERE ativo = 1
            )
               AND (
                SELECT COUNT(*)
                FROM pergunta_filosofica
                WHERE ativo = 1
               ) > 0
        ) AS participantesConcluintes;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarProgressoRespostasPorPerguntaAtiva() {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarProgressoRespostasPorPerguntaAtiva()");

    // Query de banco para mostrar progresso de respostas por pergunta ativa, incluindo perguntas sem respostas.
    const instrucaoSql = `
        SELECT
            p.id AS idPergunta,
            p.enunciado,
            p.ordem_exibicao AS ordemExibicao,
            COUNT(r.id) AS totalRespostas
        FROM pergunta_filosofica p
        LEFT JOIN resposta_filosofica r ON r.fk_pergunta = p.id
        WHERE p.ativo = 1
        GROUP BY p.id, p.enunciado, p.ordem_exibicao
        ORDER BY p.ordem_exibicao ASC, p.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarRespostasPorCorrente,
    buscarTotalRespostasAtivas,
    buscarTotalParticipantesAtivos,
    buscarTotalParticipantesConcluintes,
    buscarProgressoRespostasPorPerguntaAtiva
};
