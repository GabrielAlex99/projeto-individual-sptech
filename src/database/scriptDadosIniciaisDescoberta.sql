-- Script didático para inserir dados iniciais da tela de descoberta.
-- Execute este arquivo no schema do projeto para permitir teste manual da descoberta.

USE projeto_filosofia;

-- 1) Insere uma pergunta ativa apenas se ela ainda não existir (evita duplicidade).
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

-- 2) Obtém o id da pergunta (já existente ou recém-inserida).
SET @idPerguntaDescoberta = (
    SELECT id
    FROM pergunta_filosofica
    WHERE enunciado = 'Quando duas opções trazem incerteza, qual critério orienta melhor a sua decisão?'
    LIMIT 1
);

-- 3) Insere alternativas vinculadas à pergunta, sem repetir registros existentes.
INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT
    @idPerguntaDescoberta,
    'Buscar serenidade e focar no que está sob seu controle.',
    'Estoicismo',
    1
WHERE @idPerguntaDescoberta IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPerguntaDescoberta
        AND texto = 'Buscar serenidade e focar no que está sob seu controle.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT
    @idPerguntaDescoberta,
    'Assumir a liberdade da escolha e construir sentido pela ação.',
    'Existencialismo',
    1
WHERE @idPerguntaDescoberta IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPerguntaDescoberta
        AND texto = 'Assumir a liberdade da escolha e construir sentido pela ação.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT
    @idPerguntaDescoberta,
    'Escolher a alternativa com maior benefício coletivo.',
    'Utilitarismo',
    1
WHERE @idPerguntaDescoberta IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPerguntaDescoberta
        AND texto = 'Escolher a alternativa com maior benefício coletivo.'
  );

INSERT INTO alternativa_filosofica (fk_pergunta, texto, corrente_filosofica, peso)
SELECT
    @idPerguntaDescoberta,
    'Priorizar princípios racionais que possam valer como regra universal.',
    'Racionalismo',
    1
WHERE @idPerguntaDescoberta IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM alternativa_filosofica
      WHERE fk_pergunta = @idPerguntaDescoberta
        AND texto = 'Priorizar princípios racionais que possam valer como regra universal.'
  );

-- Como executar no Workbench (manual):
-- 1. Abra o MySQL Workbench e conecte no banco local.
-- 2. Abra este arquivo e confirme o schema em USE projeto_filosofia.
-- 3. Execute todo o script (ícone de raio).
-- 4. Reexecute se quiser: os WHERE NOT EXISTS evitam duplicar a pergunta e as alternativas.
