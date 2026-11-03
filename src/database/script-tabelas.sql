-- Script de apoio para criação do esquema da API.
-- Observação: este arquivo documenta a estrutura esperada,
-- mas só terá efeito após execução manual no MySQL.

/* comandos para mysql server */

CREATE DATABASE aquatech;
USE aquatech;

-- Tabela legada mantida para compatibilidade com rotas existentes.
CREATE TABLE empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(100) NOT NULL,
    cnpj CHAR(14),
    codigo_ativacao VARCHAR(50)
);

-- Usuário do sistema (cadastro/login e autor do diário/respostas).
CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    -- Armazena hash seguro da senha (não armazenar texto puro).
    senha VARCHAR(255) NOT NULL,
    fk_empresa INT,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id)
);

-- Registros do diário filosófico de cada usuário.
CREATE TABLE diario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT NOT NULL,
    data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fk_usuario INT NOT NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id)
);

-- Perguntas do questionário para descoberta de corrente filosófica.
CREATE TABLE pergunta_filosofica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enunciado VARCHAR(300) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    ordem_exibicao INT NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1
);

-- Alternativas vinculadas a cada pergunta, com corrente e peso para pontuação.
CREATE TABLE alternativa_filosofica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_pergunta INT NOT NULL,
    texto VARCHAR(300) NOT NULL,
    corrente_filosofica VARCHAR(80) NOT NULL,
    peso INT NOT NULL,
    FOREIGN KEY (fk_pergunta) REFERENCES pergunta_filosofica(id)
);

-- Resposta escolhida por usuário para cada pergunta do questionário.
CREATE TABLE resposta_filosofica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NOT NULL,
    fk_pergunta INT NOT NULL,
    fk_alternativa INT NOT NULL,
    data_resposta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_resposta_usuario_pergunta UNIQUE (fk_usuario, fk_pergunta),
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id),
    FOREIGN KEY (fk_pergunta) REFERENCES pergunta_filosofica(id),
    FOREIGN KEY (fk_alternativa) REFERENCES alternativa_filosofica(id)
);

-- Tabelas legadas mantidas temporariamente por compatibilidade.
CREATE TABLE aquario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(300),
    fk_empresa INT,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id)
);

CREATE TABLE medida (
    id INT PRIMARY KEY AUTO_INCREMENT,
    temperatura DECIMAL(10,2),
    momento DATETIME,
    fk_aquario INT,
    FOREIGN KEY (fk_aquario) REFERENCES aquario(id)
);
