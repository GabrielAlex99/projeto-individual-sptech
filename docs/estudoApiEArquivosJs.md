# Guia de Estudo — API e arquivos JavaScript do Projeto Filosofia

**Projeto:** Projeto Individual (Web-Data-Viz refatorado)  
**Stack:** HTML, CSS, JavaScript (Vanilla), Node.js, Express, MySQL  
**Objetivo didático:** facilitar sua explicação na banca, camada por camada.

---

## 1) Visão geral simples (para abrir a apresentação)

O projeto segue o fluxo:

1. **Front-end (`public/`)**: usuário interage com páginas e scripts JS.
2. **Rotas (`src/routes/`)**: recebem as requisições HTTP.
3. **Controllers (`src/controllers/`)**: validam dados e regras de negócio.
4. **Models (`src/models/`)**: executam queries SQL no banco.
5. **Banco MySQL**: guarda usuários, respostas filosóficas e reflexões do diário.

---

## 2) Estrutura da API (mapa de endpoints)

## 2.1 Usuário (`/usuarios`)
- `POST /usuarios/cadastrar` → cadastro de novo usuário.
- `POST /usuarios/autenticar` → login e criação de sessão.
- `GET /usuarios/sessao` → valida sessão atual.
- `POST /usuarios/sair` → encerra sessão.

## 2.2 Diário (`/diario`) — protegido por sessão
- `GET /diario/listar` → lista reflexões do usuário logado.
- `POST /diario/publicar` → cria nova reflexão.
- `DELETE /diario/deletar/:idDiario` → exclui reflexão do próprio usuário.

## 2.3 Descoberta (`/descoberta`)
- `GET /descoberta/pergunta-ativa` → leitura pública da pergunta inicial.
- `GET /descoberta/proxima-pergunta` → próxima pergunta pendente do usuário.
- `GET /descoberta/resposta-ativa` → resposta já salva (sessão).
- `GET /descoberta/meu-resultado` → resultado pessoal (sessão).
- `POST /descoberta/responder` → registra resposta (`idAlternativa`) com sessão.

## 2.4 Dashboard (`/dashboard`) — protegido por sessão
- `GET /dashboard/metricas` → total de respostas, participantes, concluintes, progresso e distribuição por corrente.

---

## 3) Arquivos JavaScript do projeto (um por um)

## 3.1 Raiz

### `app.js`
**Papel:** inicializa o servidor Express.  
**O que faz:**
- carrega variáveis de ambiente;
- configura middlewares (JSON, static, CORS, session);
- registra rotas principais (`/usuarios`, `/diario`, `/descoberta`, `/dashboard`);
- inicia servidor HTTP.

---

## 3.2 Front-end (`public/js`)

### `public/js/script.js`
**Papel:** utilitários globais compartilhados.  
**Funções-chave:**
- `exibirErro` / `sumirMensagem`: mostra/oculta mensagens visuais de erro;
- `encerrarSessaoUsuario`: chama `POST /usuarios/sair` e redireciona para login;
- `inicializarAcaoSair`: liga os links `.acao-sair`;
- `inicializarRevelacaoSuave`: efeito visual de entrada dos blocos `.reveal`.

### `public/js/auth.js`
**Papel:** lógica de login e cadastro.  
**Funções-chave:**
- `entrar`: valida campos, chama `POST /usuarios/autenticar`, salva dados básicos em `sessionStorage`;
- `cadastrar`: valida formulário e chama `POST /usuarios/cadastrar`;
- `calcularNivelForcaSenha` e feedback em tempo real da senha;
- controle de estado do botão durante envio para evitar clique duplicado.

### `public/js/diario.js`
**Papel:** fluxo completo da página de diário.  
**Funções-chave:**
- valida sessão com `GET /usuarios/sessao`;
- carrega histórico com `GET /diario/listar`;
- publica reflexão com `POST /diario/publicar`;
- exclui reflexão com `DELETE /diario/deletar/:idDiario`;
- renderiza lista de reflexões com abrir/fechar conteúdo.

### `public/js/dashboard.js`
**Papel:** fluxo da dashboard com dados reais da API.  
**Funções-chave:**
- busca métricas em `GET /dashboard/metricas`;
- renderiza resumo textual (respostas, participantes, concluintes e líder);
- renderiza listas textuais de distribuição e progresso por pergunta;
- carrega Chart.js sob demanda e monta gráficos;
- mantém fallback textual quando gráfico indisponível.

### `public/js/descoberta.js`
**Papel:** experiência do questionário na descoberta.  
**Funções-chave:**
- tenta carregar pergunta pendente da sessão (`/descoberta/proxima-pergunta`);
- sem sessão, exibe pergunta pública (`/descoberta/pergunta-ativa`);
- registra resposta em `/descoberta/responder`;
- trata estados: sem sessão, concluído, já respondido, erro.

### `public/js/resultado.js`
**Papel:** exibe resultado final do usuário autenticado.  
**Funções-chave:**
- consulta `/descoberta/meu-resultado`;
- mostra estado incompleto ou concluído;
- trata empate de correntes;
- exibe ranking de pontuações por corrente;
- renderiza significado didático das correntes.

### `public/js/demoCadastroLoginVetorFor.js`
**Papel:** arquivo didático de algoritmo (vetor e laço `for`).  
**Observação:** não participa do fluxo real da aplicação.

---

## 3.3 Rotas (`src/routes`)

### `src/routes/index.js`
Rota base (`/`) para servir `public/index.html`.

### `src/routes/usuarios.js`
Mapeia endpoints de autenticação e sessão para `usuarioController`.

### `src/routes/diario.js`
Aplica middleware de sessão e expõe listar/publicar/deletar reflexões.

### `src/routes/descoberta.js`
Define endpoints públicos e protegidos da descoberta/resultado.

### `src/routes/dashboard.js`
Expõe endpoint protegido de métricas agregadas.

### `src/routes/empresas.js`, `src/routes/aquarios.js`, `src/routes/medidas.js`
Rotas legadas da base web-data-viz (mantidas como referência técnica).

---

## 3.4 Controllers (`src/controllers`)

### `usuarioController.js`
**Responsável por:** cadastro, login, sessão e logout.  
**Pontos importantes para explicar:**
- senha em hash com `crypto.scrypt`;
- validação de login com comparação segura (`timingSafeEqual`);
- migração transparente de senha legada para hash no primeiro login.

### `descobertaController.js`
**Responsável por:** pergunta ativa, próxima pendente, resposta e resultado.  
**Regras-chave:**
- usuário é identificado por sessão;
- resposta é registrada somente com `idAlternativa`;
- impede resposta duplicada;
- resultado final soma pesos por corrente e trata empate.

### `diarioController.js`
**Responsável por:** CRUD do diário privado do usuário logado.  
**Regras-chave:**
- cada usuário acessa só os próprios registros;
- validação de título/conteúdo;
- exclusão protegida por `fk_usuario`.

### `dashboardController.js`
**Responsável por:** consolidar métricas agregadas da dashboard.  
**Retorna:**
- `totalRespostas`;
- `totalParticipantes`;
- `totalConcluintes`;
- `progressoPorPergunta`;
- `distribuicaoPorCorrente`.

### `empresaController.js`, `aquarioController.js`, `medidaController.js`
Controllers legados refatorados para `async/await` e validações básicas.

---

## 3.5 Models (`src/models`)

### `usuarioModel.js`
Queries de usuário (buscar por email, cadastrar, atualizar hash de senha).

### `descobertaModel.js`
Queries do questionário:
- pergunta ativa;
- próxima pendente;
- validação de alternativa;
- inserção de resposta;
- contagens e resultado por corrente.

### `diarioModel.js`
Queries do diário:
- listar por usuário;
- inserir reflexão;
- deletar com vínculo do usuário.

### `dashboardModel.js`
Queries agregadas da dashboard:
- distribuição por corrente;
- total de respostas;
- total de participantes;
- total de concluintes;
- progresso por pergunta ativa.

### `empresaModel.js`, `aquarioModel.js`, `medidaModel.js`
Models legados refatorados com **queries parametrizadas** (evita SQL Injection).

---

## 3.6 Middleware e banco

### `src/middlewares/autenticacao.js`
Middleware simples para bloquear rotas sem sessão válida.

### `src/database/config.js`
Centraliza conexão e execução de SQL com parâmetros (`mysql2`).

---

## 4) Fluxos que você pode explicar passo a passo na banca

## 4.1 Login
1. Front (`auth.js`) valida campos.
2. Envia `POST /usuarios/autenticar`.
3. Controller valida credenciais e cria `req.session.usuario`.
4. Front redireciona para `diario.html`.

## 4.2 Descoberta (questionário)
1. Front chama `GET /descoberta/proxima-pergunta`.
2. API retorna próxima pendente + progresso.
3. Usuário escolhe alternativa.
4. Front envia `POST /descoberta/responder`.
5. API valida e registra resposta única por usuário/pergunta.

## 4.3 Resultado
1. Front chama `GET /descoberta/meu-resultado`.
2. API confere se questionário foi concluído.
3. Se concluído, soma pesos por corrente.
4. Front exibe corrente líder ou empate.

## 4.4 Diário
1. Front valida sessão (`GET /usuarios/sessao`).
2. Lista reflexões (`GET /diario/listar`).
3. Publica nova (`POST /diario/publicar`).
4. Exclui (`DELETE /diario/deletar/:idDiario`) com confirmação.

## 4.5 Dashboard
1. Front chama `GET /dashboard/metricas`.
2. API agrega métricas no controller com `Promise.all`.
3. Front exibe resumo textual + gráfico (quando disponível).

---

## 5) Banco de dados (tabelas principais do escopo Filosofia)

- `usuario`
- `diario`
- `pergunta_filosofica`
- `alternativa_filosofica`
- `resposta_filosofica`

Scripts SQL:
- Schema: `src/database/script-tabelas.sql`
- Seed inicial simples: `src/database/scriptDadosIniciaisDescoberta.sql`
- Seed de 5 perguntas: `src/database/scriptDadosIniciaisQuestionario5Perguntas.sql`

---

## 6) Perguntas rápidas que podem cair na banca (com resposta curta)

1. **Como o usuário é identificado nas rotas privadas?**  
   Pela sessão (`req.session.usuario.id`).

2. **Como você evita SQL Injection?**  
   Usando queries parametrizadas com placeholders (`?`) nos models.

3. **Qual regra impede responder duas vezes a mesma pergunta?**  
   Regra de unicidade no banco (`fk_usuario`, `fk_pergunta`) + validação no controller.

4. **Qual a diferença entre total de respostas e participantes?**  
   Respostas = quantidade de respostas registradas; participantes = usuários distintos que responderam.

5. **Como o resultado final é calculado?**  
   Soma dos pesos por corrente filosófica nas perguntas ativas respondidas.

---

## 7) Resumo final para fechamento da apresentação

- O projeto mantém a arquitetura web-data-viz por camadas.
- O código foi simplificado para facilitar manutenção e explicação.
- O fluxo principal está alinhado ao escopo acadêmico: cadastro/login, descoberta, resultado, diário e dashboard.
- O material está pronto para consulta durante ensaio e apresentação.
