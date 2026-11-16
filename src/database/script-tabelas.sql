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