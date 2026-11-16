-- Dados iniciais do questionário dinâmico (5 perguntas ativas)
-- IMPORTANTE:
-- 1) Revise o conteúdo antes de executar.
-- 2) Execute manualmente no MySQL Workbench.
-- 3) Este script não altera estrutura de tabelas.
-- 4) Pode ser reexecutado com segurança (usa WHERE NOT EXISTS para evitar duplicidade).

USE projeto_filosofia;

-- ---------------------------------------------------------------------------
-- Pergunta 1 (preservada): já existente no projeto
-- ---------------------------------------------------------------------------
INSERT INTO pergunta_filosofica (enunciado, categoria, ordem_exibicao, ativo)
SELECT
    'Quando duas opções trazem incerteza, qual critério orienta melhor a sua decisão?',
    'Autoconhecimento',
    1,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM pergunta_filosofica
    WHERE enunciado = 'Quando duas opções trazem incerteza, qual critério orienta melhor a sua decisão?'
);

SET @idPergunta01 = (
    SELECT id
    FROM pergunta_filosofica
    WHERE enunciado = 'Quando duas opções trazem incerteza, qual critério orienta melhor a sua decisão?'
    LIMIT 1
);

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta01, 'Buscar serenidade e focar no que está sob seu controle.', 'Estoicismo', 1
WHERE @idPergunta01 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta01
        AND texto = 'Buscar serenidade e focar no que está sob seu controle.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta01, 'Assumir a liberdade da escolha e construir sentido pela ação.', 'Existencialismo', 1
WHERE @idPergunta01 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta01
        AND texto = 'Assumir a liberdade da escolha e construir sentido pela ação.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta01, 'Escolher a alternativa com maior benefício coletivo.', 'Utilitarismo', 1
WHERE @idPergunta01 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta01
        AND texto = 'Escolher a alternativa com maior benefício coletivo.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta01, 'Priorizar princípios racionais que possam valer como regra universal.', 'Racionalismo', 1
WHERE @idPergunta01 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta01
        AND texto = 'Priorizar princípios racionais que possam valer como regra universal.'
  );

-- ---------------------------------------------------------------------------
-- Pergunta 2
-- ---------------------------------------------------------------------------
INSERT INTO pergunta_filosofica (enunciado, categoria, ordem_exibicao, ativo)
SELECT
    'Ao enfrentar uma frustração importante, qual postura você tende a adotar?',
    'Resiliência',
    2,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM pergunta_filosofica
    WHERE enunciado = 'Ao enfrentar uma frustração importante, qual postura você tende a adotar?'
);

SET @idPergunta02 = (
    SELECT id
    FROM pergunta_filosofica
    WHERE enunciado = 'Ao enfrentar uma frustração importante, qual postura você tende a adotar?'
    LIMIT 1
);

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta02, 'Aceitar o que não depende de você e agir no que depende.', 'Estoicismo', 1
WHERE @idPergunta02 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta02
        AND texto = 'Aceitar o que não depende de você e agir no que depende.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta02, 'Reconstruir o sentido da situação a partir da sua liberdade de escolha.', 'Existencialismo', 1
WHERE @idPergunta02 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta02
        AND texto = 'Reconstruir o sentido da situação a partir da sua liberdade de escolha.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta02, 'Avaliar qual decisão gera mais bem-estar para o maior número de pessoas.', 'Utilitarismo', 1
WHERE @idPergunta02 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta02
        AND texto = 'Avaliar qual decisão gera mais bem-estar para o maior número de pessoas.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta02, 'Aplicar critérios lógicos e princípios consistentes antes de agir.', 'Racionalismo', 1
WHERE @idPergunta02 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta02
        AND texto = 'Aplicar critérios lógicos e princípios consistentes antes de agir.'
  );

-- ---------------------------------------------------------------------------
-- Pergunta 3
-- ---------------------------------------------------------------------------
INSERT INTO pergunta_filosofica (enunciado, categoria, ordem_exibicao, ativo)
SELECT
    'Quando precisa escolher um objetivo de longo prazo, o que pesa mais?',
    'Projeto de vida',
    3,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM pergunta_filosofica
    WHERE enunciado = 'Quando precisa escolher um objetivo de longo prazo, o que pesa mais?'
);

SET @idPergunta03 = (
    SELECT id
    FROM pergunta_filosofica
    WHERE enunciado = 'Quando precisa escolher um objetivo de longo prazo, o que pesa mais?'
    LIMIT 1
);

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta03, 'Cultivar disciplina interior e constância diante das mudanças.', 'Estoicismo', 1
WHERE @idPergunta03 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta03
        AND texto = 'Cultivar disciplina interior e constância diante das mudanças.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta03, 'Escolher um caminho que expresse quem você decide ser.', 'Existencialismo', 1
WHERE @idPergunta03 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta03
        AND texto = 'Escolher um caminho que expresse quem você decide ser.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta03, 'Priorizar o objetivo com maior impacto positivo coletivo.', 'Utilitarismo', 1
WHERE @idPergunta03 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta03
        AND texto = 'Priorizar o objetivo com maior impacto positivo coletivo.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta03, 'Definir metas com base em análise racional e coerência de princípios.', 'Racionalismo', 1
WHERE @idPergunta03 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta03
        AND texto = 'Definir metas com base em análise racional e coerência de princípios.'
  );

-- ---------------------------------------------------------------------------
-- Pergunta 4
-- ---------------------------------------------------------------------------
INSERT INTO pergunta_filosofica (enunciado, categoria, ordem_exibicao, ativo)
SELECT
    'Diante de um conflito entre razão e emoção, qual orientação você considera mais adequada?',
    'Tomada de decisão',
    4,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM pergunta_filosofica
    WHERE enunciado = 'Diante de um conflito entre razão e emoção, qual orientação você considera mais adequada?'
);

SET @idPergunta04 = (
    SELECT id
    FROM pergunta_filosofica
    WHERE enunciado = 'Diante de um conflito entre razão e emoção, qual orientação você considera mais adequada?'
    LIMIT 1
);

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta04, 'Manter serenidade e autocontrole para agir com clareza.', 'Estoicismo', 1
WHERE @idPergunta04 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta04
        AND texto = 'Manter serenidade e autocontrole para agir com clareza.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta04, 'Assumir que a escolha é sua e dar sentido pessoal à decisão.', 'Existencialismo', 1
WHERE @idPergunta04 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta04
        AND texto = 'Assumir que a escolha é sua e dar sentido pessoal à decisão.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta04, 'Escolher a alternativa com melhores consequências para o conjunto.', 'Utilitarismo', 1
WHERE @idPergunta04 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta04
        AND texto = 'Escolher a alternativa com melhores consequências para o conjunto.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta04, 'Seguir princípios universais construídos por argumentação racional.', 'Racionalismo', 1
WHERE @idPergunta04 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta04
        AND texto = 'Seguir princípios universais construídos por argumentação racional.'
  );

-- ---------------------------------------------------------------------------
-- Pergunta 5
-- ---------------------------------------------------------------------------
INSERT INTO pergunta_filosofica (enunciado, categoria, ordem_exibicao, ativo)
SELECT
    'Como você interpreta uma vida bem vivida?',
    'Sentido da vida',
    5,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM pergunta_filosofica
    WHERE enunciado = 'Como você interpreta uma vida bem vivida?'
);

SET @idPergunta05 = (
    SELECT id
    FROM pergunta_filosofica
    WHERE enunciado = 'Como você interpreta uma vida bem vivida?'
    LIMIT 1
);

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta05, 'Viver com virtude, equilíbrio e foco no que você pode governar.', 'Estoicismo', 1
WHERE @idPergunta05 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta05
        AND texto = 'Viver com virtude, equilíbrio e foco no que você pode governar.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta05, 'Construir sentido por escolhas autênticas ao longo da existência.', 'Existencialismo', 1
WHERE @idPergunta05 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta05
        AND texto = 'Construir sentido por escolhas autênticas ao longo da existência.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta05, 'Promover o maior bem possível para as outras pessoas.', 'Utilitarismo', 1
WHERE @idPergunta05 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta05
        AND texto = 'Promover o maior bem possível para as outras pessoas.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT @idPergunta05, 'Viver orientado por princípios racionais e coerentes.', 'Racionalismo', 1
WHERE @idPergunta05 IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM alternativa_filosofica
      WHERE fk_pergunta = @idPergunta05
        AND texto = 'Viver orientado por princípios racionais e coerentes.'
  );

-- ---------------------------------------------------------------------------
-- Execução manual no Workbench
-- ---------------------------------------------------------------------------
-- 1) Abra o MySQL Workbench e conecte no banco local.
-- 2) Abra este arquivo SQL.
-- 3) Confirme o schema em USE projeto_filosofia.
-- 4) Execute o script manualmente.
-- 5) Pode reexecutar: o script evita duplicidades nos registros planejados.
