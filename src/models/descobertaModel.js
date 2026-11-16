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

function listarPerguntasAtivasOrdenadas() {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function listarPerguntasAtivasOrdenadas()");

    // Query de banco para listar todas as perguntas ativas na ordem do questionário.
    const instrucaoSql = `
        SELECT
            p.id AS idPergunta,
            p.ordem_exibicao
        FROM pergunta_filosofica p
        WHERE p.ativo = 1
        ORDER BY p.ordem_exibicao ASC, p.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarProximaPerguntaPendenteComAlternativas(idUsuario) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarProximaPerguntaPendenteComAlternativas()");

    // Query de banco para buscar a próxima pergunta ativa não respondida pelo usuário e suas alternativas.
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
            SELECT p2.id
            FROM pergunta_filosofica p2
            WHERE p2.ativo = 1
              AND NOT EXISTS (
                  SELECT 1
                  FROM resposta_filosofica r
                  WHERE r.fk_usuario = ?
                    AND r.fk_pergunta = p2.id
              )
            ORDER BY p2.ordem_exibicao ASC, p2.id ASC
            LIMIT 1
        )
        ORDER BY a.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario]);
}

function buscarPerguntaAtiva() {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarPerguntaAtiva()");

    // Query de banco para buscar apenas o identificador da pergunta ativa.
    const instrucaoSql = `
        SELECT
            p.id AS idPergunta
        FROM pergunta_filosofica p
        WHERE p.ativo = 1
        ORDER BY p.ordem_exibicao ASC
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarAlternativaDaPerguntaAtiva(idAlternativa, idPerguntaAtiva) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarAlternativaDaPerguntaAtiva()");

    // Query de banco para validar se a alternativa enviada pertence à pergunta ativa.
    const instrucaoSql = `
        SELECT
            a.id
        FROM alternativa_filosofica a
        WHERE a.id = ?
          AND a.fk_pergunta = ?
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idAlternativa, idPerguntaAtiva]);
}

function buscarRespostaPorUsuarioPergunta(idUsuario, idPerguntaAtiva) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarRespostaPorUsuarioPergunta()");

    // Query de banco para verificar se o usuário já respondeu a pergunta ativa.
    const instrucaoSql = `
        SELECT
            r.id
        FROM resposta_filosofica r
        WHERE r.fk_usuario = ?
          AND r.fk_pergunta = ?
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario, idPerguntaAtiva]);
}

function buscarRespostaDoUsuarioNaPerguntaAtiva(idUsuario) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarRespostaDoUsuarioNaPerguntaAtiva()");

    // Query de banco para obter a alternativa já escolhida pelo usuário na pergunta ativa.
    const instrucaoSql = `
        SELECT
            r.fk_alternativa AS idAlternativa
        FROM resposta_filosofica r
        WHERE r.fk_usuario = ?
          AND r.fk_pergunta = (
              SELECT p.id
              FROM pergunta_filosofica p
              WHERE p.ativo = 1
              ORDER BY p.ordem_exibicao ASC
              LIMIT 1
          )
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario]);
}

function buscarResultadoDoUsuario(idUsuario) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function buscarResultadoDoUsuario()");

    // Query parametrizada para somar pesos por corrente nas perguntas ativas respondidas pelo usuário.
    const instrucaoSql = `
        SELECT
            a.corrente_filosofica AS correnteFilosofica,
            SUM(a.peso) AS pontuacaoTotal
        FROM resposta_filosofica r
        INNER JOIN alternativa_filosofica a ON a.id = r.fk_alternativa
        INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
        WHERE r.fk_usuario = ?
          AND p.ativo = 1
        GROUP BY a.corrente_filosofica
        ORDER BY pontuacaoTotal DESC, a.corrente_filosofica ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario]);
}

function contarPerguntasAtivas() {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function contarPerguntasAtivas()");

    // Query de banco para contar quantas perguntas ativas existem no questionário.
    const instrucaoSql = `
        SELECT COUNT(*) AS totalPerguntasAtivas
        FROM pergunta_filosofica
        WHERE ativo = 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function contarPerguntasAtivasRespondidasDoUsuario(idUsuario) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function contarPerguntasAtivasRespondidasDoUsuario()");

    // Query de banco para contar perguntas ativas já respondidas pelo usuário autenticado.
    const instrucaoSql = `
        SELECT COUNT(DISTINCT r.fk_pergunta) AS totalRespondidas
        FROM resposta_filosofica r
        INNER JOIN pergunta_filosofica p ON p.id = r.fk_pergunta
        WHERE r.fk_usuario = ?
          AND p.ativo = 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario]);
}

function registrarResposta(idUsuario, idPerguntaAtiva, idAlternativa) {
    console.log("ACESSEI O DESCOBERTA MODEL \n\n function registrarResposta()");

    // Query de banco para registrar a resposta do usuário autenticado na pergunta ativa.
    const instrucaoSql = `
        INSERT INTO resposta_filosofica (fk_usuario, fk_pergunta, fk_alternativa)
        VALUES (?, ?, ?);
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [idUsuario, idPerguntaAtiva, idAlternativa]);
}

module.exports = {
    buscarPerguntaAtivaComAlternativas,
    listarPerguntasAtivasOrdenadas,
    buscarProximaPerguntaPendenteComAlternativas,
    buscarPerguntaAtiva,
    buscarAlternativaDaPerguntaAtiva,
    buscarRespostaPorUsuarioPergunta,
    buscarRespostaDoUsuarioNaPerguntaAtiva,
    buscarResultadoDoUsuario,
    contarPerguntasAtivas,
    contarPerguntasAtivasRespondidasDoUsuario,
    registrarResposta
};
