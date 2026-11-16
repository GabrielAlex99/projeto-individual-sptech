-- Cria a base de dados do projeto de filosofia
CREATE DATABASE IF NOT EXISTS projeto_filosofia;
USE projeto_filosofia;

-- Tabela de usuários (integrada com a tela de cadastro e login)
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- Tabela do diário filosófico (para armazenar as reflexões dos usuários)
CREATE TABLE IF NOT EXISTS diario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fk_usuario INT,
    CONSTRAINT fk_usuario_diario FOREIGN KEY (fk_usuario) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS pergunta_filosofica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enunciado VARCHAR(300) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    ordem_exibicao INT NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alternativa_filosofica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fk_pergunta INT NOT NULL,
    texto VARCHAR(300) NOT NULL,
    corrente_filosofica VARCHAR(80) NOT NULL,
    peso INT NOT NULL,
    CONSTRAINT fk_alt_fil_pergunta
        FOREIGN KEY (fk_pergunta) REFERENCES pergunta_filosofica(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resposta_filosofica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT NOT NULL,
    fk_pergunta INT NOT NULL,
    fk_alternativa INT NOT NULL,
    data_resposta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_resposta_usuario_pergunta
        UNIQUE (fk_usuario, fk_pergunta),
    CONSTRAINT fk_resp_fil_usuario
        FOREIGN KEY (fk_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_resp_fil_pergunta
        FOREIGN KEY (fk_pergunta) REFERENCES pergunta_filosofica(id),
    CONSTRAINT fk_resp_fil_alternativa
        FOREIGN KEY (fk_alternativa) REFERENCES alternativa_filosofica(id)
) ENGINE=InnoDB;

-- Script didático para inserir dados iniciais da tela de descoberta.
-- Execute este arquivo no schema do projeto para permitir teste manual da descoberta.

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
