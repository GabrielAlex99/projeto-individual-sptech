/*
  Arquivo: app.js
  Responsabilidade: ponto de entrada da API.
  Aqui configuramos ambiente, middlewares, sessão, rotas e inicialização do servidor.
*/

// const ambienteProcesso = "producao";
const ambienteProcesso = "desenvolvimento";
const caminhoEnv = ambienteProcesso === "producao" ? ".env" : ".env.dev";

// Carrega variáveis de ambiente de acordo com o contexto (local ou produção).
require("dotenv").config({ path: caminhoEnv });

const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

// Importa os módulos de rota da aplicação.
const indexRouter = require("./src/routes/index");
const usuarioRouter = require("./src/routes/usuarios");
const diarioRouter = require("./src/routes/diario");
const descobertaRouter = require("./src/routes/descoberta");
const dashboardRouter = require("./src/routes/dashboard");

// Define configurações base do servidor.
const portaApp = Number(process.env.APP_PORT) || 3333;
const hostApp = process.env.APP_HOST || "localhost";
const sessionSecret = process.env.SESSION_SECRET;

const app = express();

// Garante que a chave de sessão foi configurada.
if (!sessionSecret) {
  console.log("SESSION_SECRET não foi configurado no ambiente.");
  process.exit(1);
}

// Em produção, informa ao Express que existe proxy na frente da aplicação.
if (process.env.AMBIENTE_PROCESSO === "producao") {
  app.set("trust proxy", 1);
}

// Middleware para leitura de JSON no corpo das requisições.
app.use(express.json());

// Middleware para leitura de dados enviados por formulário.
app.use(express.urlencoded({ extended: false }));

// Middleware para servir arquivos estáticos do front-end (pasta public).
app.use(express.static(path.join(__dirname, "public")));

// Middleware de CORS para permitir chamadas entre origens quando necessário.
app.use(cors());

// Middleware de sessão para autenticação no servidor.
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.AMBIENTE_PROCESSO === "producao",
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

// Registra as rotas da aplicação.
app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/diario", diarioRouter);
app.use("/descoberta", descobertaRouter);
app.use("/dashboard", dashboardRouter);

// Inicia o servidor HTTP na porta definida.
app.listen(portaApp, function () {
  console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
    \n\n\n                                                                                                 
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${hostApp}:${portaApp} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n`);
});
