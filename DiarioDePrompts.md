# Diário de Prompts

## 2026-10-28

### Prompt
Crie o arquivo `index.html` dentro da pasta `public` contendo a página inicial do projeto de Filosofia, com estética sombria e minimalista, tipografia serifada, cores escuras, cabeçalho simples, título de impacto sobre autoconhecimento filosófico e botão chamativo para **"Descubra sua Corrente Filosófica"**.

### Ação realizada
- Página inicial `public/index.html` reestruturada com layout escuro e minimalista.
- Inclusão de cabeçalho simples com identificação do projeto.
- Inclusão de título principal com foco em autoconhecimento filosófico.
- Inclusão de botão chamativo apontando para `cadastro.html`.

### Prompt
Refatore o arquivo `public/cadastro.html` para a identidade visual sombria e minimalista com tipografia serifada, removendo cabeçalho antigo e referências ao AquaTech, mantendo no formulário apenas Nome, Email, Senha e Confirmação de Senha, alterando o botão para **"Iniciar Jornada"**, preservando o `fetch` para rota de usuários e removendo validação de código de ativação e busca de empresas.

### Ação realizada
- Refatoração completa de `public/cadastro.html` para o novo visual sombrio/minimalista e tipografia serifada.
- Remoção do cabeçalho antigo e de todas as referências ao sistema AquaTech.
- Formulário simplificado para os campos: Nome, Email, Senha e Confirmação de Senha.
- Texto do botão alterado para **"Iniciar Jornada"**.
- JavaScript simplificado: mantida a função `cadastrar()` com `fetch` para `/usuarios/cadastrar`, removidas integralmente a validação por código de ativação e a lógica de listagem/busca de empresas.

### Prompt
Refatore o arquivo `public/login.html` para a identidade visual sombria e minimalista com tipografia serifada, removendo cabeçalho antigo e referências ao AquaTech, mantendo apenas os campos Email e Senha, alterando o botão para **"Retomar Reflexão"**, adicionando uma citação filosófica curta em itálico acima do formulário e preservando a função `entrar()` com `fetch` para rota de usuários, com redirecionamento de sucesso para `diario.html`.

### Ação realizada
- Refatoração completa de `public/login.html` para o novo visual sombrio/minimalista com tipografia serifada, alinhado ao `cadastro.html`.
- Remoção do cabeçalho antigo, rodapé antigo e de todas as referências ao AquaTech.
- Formulário mantido apenas com os campos: Email e Senha.
- Texto do botão principal alterado para **"Retomar Reflexão"**.
- Inclusão de citação filosófica curta em itálico acima do formulário para enriquecer a experiência visual.
- JavaScript preservado na lógica de autenticação com `fetch` para `/usuarios/autenticar`, com ajuste do redirecionamento de sucesso para `./diario.html`.

### Prompt
Crie o arquivo `public/dashboard.html` mantendo identidade visual sombria, minimalista e tipografia serifada, com menu lateral esquerdo contendo links para Diário, Dashboard e Sair. Na área principal, montar o esqueleto de um painel com dois gráficos em Chart.js (CDN): rosca para **Temas Filosóficos Mais Explorados** e linha para **Evolução do Autoconhecimento**, com dados estáticos simulados.

### Ação realizada
- Criação do arquivo `public/dashboard.html` com layout escuro/minimalista e tipografia serifada, alinhado às páginas de autenticação.
- Implementação de menu lateral esquerdo com links para `diario.html`, `dashboard.html` e `login.html` (Sair).
- Estrutura principal do painel com dois cards de métricas filosóficas.
- Importação da biblioteca Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js`).
- Configuração de gráfico de rosca para **Temas Filosóficos Mais Explorados** com dados simulados.
- Configuração de gráfico de linha para **Evolução do Autoconhecimento** com dados simulados e estilização compatível com o tema.

### Prompt
Crie o arquivo `public/diario.html` mantendo a identidade visual sombria, minimalista e com tipografia serifada, com o mesmo menu lateral esquerdo do dashboard. Na área principal, dividir a tela em duas partes: uma para interação com o agente de IA (caixa de texto grande + botão **"Enviar Reflexão"**) e outra com histórico de reflexões passadas contendo datas e títulos simulados.

### Ação realizada
- Criação do arquivo `public/diario.html` com layout escuro/minimalista e tipografia serifada, consistente com as demais telas.
- Reutilização do menu lateral esquerdo com links para `diario.html`, `dashboard.html` e `login.html` (Sair).
- Estrutura principal dividida em duas colunas:
  - Área de interação com o agente de IA com `textarea` grande e botão **"Enviar Reflexão"**.
  - Coluna lateral com histórico simulado de reflexões, exibindo títulos e datas.
- Inclusão de responsividade para adaptar o layout em telas menores.

### Prompt
Refatore os arquivos `public/login.html` e `public/cadastro.html` para remover referências que geram erro no console: excluir a importação de `./js/sessao.js` no `<head>` e apagar chamadas de `aguardar()`, `finalizarAguardar()` e `limparFormulario()`, mantendo visual e lógica principal de `fetch`.

### Ação realizada
- Remoção da tag `<script src="./js/sessao.js"></script>` dos arquivos `public/login.html` e `public/cadastro.html`.
- Limpeza das chamadas obsoletas:
  - `aguardar()` removida da função `entrar()`.
  - `finalizarAguardar()` removida dos blocos de validação/erro em `login.html` e `cadastro.html`.
  - `limparFormulario()` removida do fluxo de sucesso em `cadastro.html`.
- Preservação do layout visual e da lógica de requisição `fetch` para autenticação e cadastro.

### Prompt
Analisar as cinco páginas (`index`, `login`, `cadastro`, `diario`, `dashboard`) para extrair e unificar todo o CSS em um arquivo global e todo o JavaScript em um arquivo único, eliminando redundâncias de classes e adicionando verificações condicionais para evitar erros em páginas sem formulários ou gráficos.

### Ação realizada
- Criação do arquivo `public/css/global.css` com consolidação dos estilos das cinco páginas.
- Unificação visual mantendo o tema sombrio/minimalista com tipografia serifada.
- Remoção de redundâncias em estilos compartilhados (como `body`, `card` e botões), mantendo variações por contexto (home, autenticação, diário e dashboard).
- Criação do arquivo `public/js/script.js` com consolidação de:
  - Função `entrar()` (autenticação com `fetch` em `/usuarios/autenticar`);
  - Função `cadastrar()` (cadastro com `fetch` em `/usuarios/cadastrar`);
  - Inicialização de gráficos do dashboard (rosca e linha com dados simulados).
- Inclusão de verificações condicionais no JS para evitar erros quando elementos não existem na página (ex.: `email_input`, `nome_input`, `graficoTemas`, `graficoEvolucao`).
- Inclusão de carregamento condicional do Chart.js via CDN apenas quando há canvas de gráficos na página.

### Prompt
Criar os arquivos `public/descoberta.html` e `public/resultado.html` com identidade visual sombria/minimalista/serifada, importando obrigatoriamente `./css/global.css` no cabeçalho e `./js/script.js` no final do corpo, sem estilos inline e sem reescrever arquivos antigos.

### Ação realizada
- Criação do arquivo `public/descoberta.html` com pergunta de dilema filosófico profundo.
- Inclusão de três opções de resposta em formato de botões largos/cartões clicáveis.
- Inclusão de botão de avanço para a próxima tela (`resultado.html`).
- Criação do arquivo `public/resultado.html` com tela de impacto exibindo corrente filosófica simulada (**Estoicismo**), parágrafo explicativo e botão **"Iniciar Jornada"** apontando para `cadastro.html`.
- Em ambas as páginas, inclusão das referências obrigatórias:
  - `<link rel="stylesheet" href="./css/global.css">`
  - `<script src="./js/script.js"></script>`

## 2026-11-15

### Prompt
Atualize o plano da funcionalidade de descoberta e registre essa alteração no diário de prompts, incluindo: tratamento de duplicidade no banco com `ER_DUP_ENTRY` retornando `409` com mensagem de resposta já registrada, e remoção do avanço para `resultado.html` estático até existir resultado dinâmico.

### Ação realizada
- Atualização de `docs/planoImplementacao.md` para complementar a validação de resposta repetida com fallback de erro de duplicidade MySQL (`ER_DUP_ENTRY`), retornando `409` com a mesma mensagem clara de resposta já registrada e sem expor detalhes internos.
- Atualização do plano para incluir ajuste de interface na descoberta: remover link clicável para `resultado.html` nesta etapa e, após salvamento bem-sucedido, exibir mensagem informando que a resposta foi registrada e que o resultado será conectado em etapa futura.
- Revisão das seções de arquivos envolvidos, fluxo, validações, respostas da API, impactos e etapas de validação para refletir essas duas decisões, mantendo as demais definições já aprovadas.

## 2026-11-15

### Prompt
Atualize a especificação geral para refletir a regra de acesso definida no plano da descoberta: leitura pública da pergunta ativa e alternativas, e salvamento da resposta apenas para usuário autenticado com identificação via sessão e envio de somente `idAlternativa` pela interface.

### Ação realizada
- Atualização de `docs/especificacao.md` na seção de funcionalidades da descoberta para explicitar que a consulta da pergunta ativa e alternativas é pública (sem sessão).
- Atualização de `docs/especificacao.md` para definir que o envio de resposta exige sessão autenticada, com identificação do usuário no servidor e envio de apenas `idAlternativa` pela interface.
- Inclusão dessas definições nas regras de negócio da especificação.
- Remoção da pendência sobre “exigir autenticação antes de interagir ou somente ao salvar resposta”, mantendo as demais pendências.

## 2026-11-15

### Prompt
Use o modo Build para implementar o registro da resposta na descoberta: nova rota protegida apenas para gravação, validação por sessão/pergunta ativa/alternativa, tratamento de resposta repetida com `409` (incluindo `ER_DUP_ENTRY`), remoção do avanço para resultado estático e registro da implementação no diário de prompts.

### Ação realizada
- Implementação da rota `POST /descoberta/responder` com proteção por `autenticacao.validarSessao`, mantendo pública a leitura `GET /descoberta/pergunta-ativa`.
- Implementação no controlador da descoberta para:
  - identificar o usuário pela sessão;
  - validar `idAlternativa` enviada pela interface;
  - localizar pergunta ativa;
  - validar pertencimento da alternativa à pergunta ativa;
  - impedir segunda resposta, mantendo a primeira e retornando `409`.
- Implementação no model com consultas parametrizadas para busca de pergunta ativa, validação de alternativa, verificação de resposta existente e insert da resposta.
- Tratamento de falha `ER_DUP_ENTRY` como resposta repetida (`409`) com mensagem clara, sem expor detalhes internos do banco ao cliente.
- Atualização da interface da descoberta para enviar somente `idAlternativa`, tratar os retornos de status e exibir, após sucesso, a mensagem de que o resultado dinâmico será conectado em etapa futura.
- Remoção do avanço clicável para `resultado.html` em `public/descoberta.html`.

## 2026-11-15

### Prompt
Preparar apenas os dados iniciais da descoberta em um arquivo SQL separado, com uma pergunta ativa e alternativas vinculadas, evitando duplicidade em reexecução e sem executar comandos no banco.

### Ação realizada
- Criação do arquivo `src/database/scriptDadosIniciaisDescoberta.sql` com inserção didática de 1 pergunta filosófica ativa e 4 alternativas vinculadas.
- Uso exclusivo de tabelas e colunas existentes no esquema atual: `pergunta_filosofica` e `alternativa_filosofica`.
- Estrutura do script com `WHERE NOT EXISTS` para impedir duplicação da pergunta e das alternativas em execuções repetidas.
- Inclusão de comentários curtos no SQL explicando a ordem dos inserts e como executar manualmente no MySQL Workbench.

## 2026-11-15

### Prompt
Ajustar apenas a navegação entre telas para permitir acesso à descoberta pelos menus do Diário e Dashboard e incluir navegação de volta em `descoberta.html`, sem alterar API, banco, sessão ou regras da descoberta.

### Ação realizada
- Atualização do menu lateral de `public/diario.html` com novo link para `descoberta.html`.
- Atualização do menu lateral de `public/dashboard.html` com novo link para `descoberta.html`.
- Inclusão de navegação simples em `public/descoberta.html` com links para `diario.html` e `dashboard.html`, mantendo coerência visual com os estilos existentes.
- Nenhum link para `resultado.html` foi adicionado na navegação da descoberta.

## 2026-11-15

### Prompt
Implementar apenas a visualização persistente da resposta já registrada na descoberta, com consulta protegida por sessão para a resposta do usuário na pergunta ativa e destaque visual da alternativa escolhida ao salvar e ao reabrir a página.

### Ação realizada
- Criação da rota `GET /descoberta/resposta-ativa` protegida por sessão para consultar a resposta do usuário autenticado na pergunta ativa.
- Implementação no controlador da descoberta para retornar:
  - `200` com `idAlternativa` quando houver resposta;
  - `204` quando não houver resposta registrada;
  - `401` para sessão inválida;
  - `500` em falha de consulta.
- Implementação no model com consulta parametrizada para buscar a alternativa já registrada do usuário na pergunta ativa.
- Atualização de `public/js/descoberta.js` para:
  - consultar resposta registrada após carregar pergunta/alternativas;
  - destacar a alternativa já escolhida;
  - desabilitar opções quando já houver resposta;
  - destacar e bloquear alternativas imediatamente após salvamento bem-sucedido.
- Inclusão de estilo específico em `public/css/global.css` para destacar visualmente o botão da alternativa registrada.

## 2026-11-15

### Prompt
Corrigir a descoberta para tratar claramente os estados da resposta salva (com destaque perceptível e sem falso destaque) e implementar exclusão de reflexões no diário usando a rota `DELETE /diario/deletar/:idDiario` com confirmação, bloqueio de cliques repetidos e atualização da interface apenas após sucesso.

### Ação realizada
- Ajuste de `public/js/descoberta.js` para separar os estados da consulta da resposta salva:
  - sem sessão: mensagem orientando entrar na conta para responder;
  - sem resposta: opções habilitadas para escolha;
  - resposta encontrada: destaque da alternativa correspondente e bloqueio das opções;
  - falha de consulta: mensagem visível de erro sem afirmar verificação concluída.
- Inclusão de validação de correspondência entre `idAlternativa` retornado e alternativas renderizadas, evitando destaque falso quando não houver opção correspondente.
- Reforço visual em `public/css/global.css` para alternativa registrada continuar claramente destacada, inclusive desabilitada.
- Implementação em `public/js/script.js` de botão de exclusão para cada reflexão com criação via DOM, confirmação por `confirm()`, chamada `DELETE` com sessão, bloqueio de cliques repetidos durante a requisição e remoção do item apenas após confirmação de sucesso.
- Ajuste em `src/controllers/diarioController.js` para não simular sucesso quando nada for removido (`affectedRows < 1`), retornando mensagem de não encontrado para exclusão.
- Atualização de `docs/especificacao.md` para registrar a exclusão das próprias reflexões e a visualização da resposta salva na descoberta, sem alterar a pendência de cálculo de resultado.

## 2026-11-16

### Prompt
Diagnosticar por que resultado e dashboard não funcionavam para o usuário e corrigir somente a causa comprovada, mantendo sessão, resposta única e dados reais.

### Ação realizada
- Diagnóstico do processo em execução e das rotas: `GET /descoberta/pergunta-ativa` respondeu `200` no servidor atual; chamadas protegidas sem cookie (`/descoberta/resposta-ativa`, `/descoberta/meu-resultado`, `/dashboard/metricas`) responderam `401`, confirmando proteção por sessão ativa no backend.
- Identificada causa funcional na dashboard: o carregamento de métricas dependia do Chart.js. Quando o CDN falhava, a tela não consultava a API e não exibia os valores reais.
- Correção em `public/js/script.js` para consultar `/dashboard/metricas` mesmo sem Chart.js e exibir fallback textual com contagens reais por corrente.
- Ajuste em `public/dashboard.html` com container textual (`#metricas_textuais`) e em `public/css/global.css` com estilo simples para a lista textual.
- Mantido o resultado pessoal baseado na resposta salva do usuário autenticado e sem alteração na regra de uma resposta por usuário/pergunta.

## 2026-11-16

### Prompt
Fechar diagnóstico e correção de Resultado e Dashboard com dados reais e sessão autenticada, separando falha de API de falha de gráfico e garantindo fallback textual quando necessário.

### Ação realizada
- Revisão do encadeamento atual de `public/js/script.js` e confirmação de rotas/endereços ativos em `app.js`, `src/routes/descoberta.js` e `src/routes/dashboard.js`.
- Ajuste da renderização da dashboard para separar cenários:
  - falha da API continua tratada no fluxo de `fetch`/status HTTP;
  - falha na criação do gráfico (mesmo com métricas carregadas) passou a ser tratada separadamente, com mensagem específica e manutenção dos dados reais em lista textual.
- Atualização da função de criação de gráfico para retornar sucesso/falha sem lançar erro para o bloco de erro da API.
- Preservação das regras de sessão e da regra de uma resposta por usuário/pergunta, sem mudanças no banco, rotas de autenticação, diário ou exclusão.

## 2026-11-16

### Prompt
Realizar auditoria completa do projeto com testes de rotas/páginas e comparação com documentação, sem implementar novas correções nesta etapa.

### Ação realizada
- Auditoria documental e técnica em `AGENTS.md`, `docs/especificacao.md`, `docs/planoImplementacao.md`, entradas recentes deste diário e arquivos de rotas/controladores/modelos/interfaces.
- Verificação de infraestrutura local:
  - porta `3333` estava livre antes de iniciar o servidor;
  - servidor iniciado com `node app.js` no diretório do projeto;
  - respostas HTTP de páginas estáticas, CSS e JS confirmaram que o conteúdo servido corresponde aos arquivos atuais desta pasta.
- Testes HTTP executados sem sessão (via `curl`):
  - `GET /descoberta/pergunta-ativa` → `200` com pergunta ativa e 4 alternativas;
  - `GET /descoberta/resposta-ativa` → `401`;
  - `GET /descoberta/meu-resultado` → `401`;
  - `GET /dashboard/metricas` → `401`;
  - `GET /usuarios/sessao` → `401`;
  - `POST /usuarios/autenticar` com corpo vazio → `400` ("Informe o email.").
- Limitações registradas:
  - sem credenciais válidas/cookie de sessão no ambiente de teste, não foi possível validar fluxo autenticado fim a fim;
  - sem observação direta em navegador neste contexto, validações visuais de Resultado e Dashboard ficaram pendentes.
- Divergência encontrada entre documentos:
  - `docs/planoImplementacao.md` ainda descreve etapa sem conexão de resultado/dashboard;
  - `docs/especificacao.md` e código atual já consideram resultado pessoal e métricas da dashboard conectados a dados reais.

## 2026-11-15

### Prompt
Conectar o resultado pessoal à alternativa salva e substituir os dados simulados da dashboard por contagens reais de respostas por corrente filosófica para a pergunta ativa, usando como regra inicial a corrente associada à alternativa escolhida.

### Ação realizada
- Inclusão de consulta autenticada do resultado pessoal na descoberta, usando o usuário da sessão e a corrente associada à resposta da pergunta ativa.
- Atualização da tela `public/resultado.html` para exibir a pergunta, a alternativa escolhida e a corrente retornada pela API, com estados para sessão ausente, resposta inexistente e erro.
- Inclusão de link para o resultado após o registro ou a consulta de uma resposta existente na descoberta.
- Criação da rota, controlador e modelo da dashboard para contar respostas registradas por corrente filosófica na pergunta ativa.
- Substituição dos dados simulados do gráfico por dados retornados pela API e inclusão de mensagens para carregamento, ausência de respostas e falha.
- Atualização de `docs/especificacao.md` com a regra inicial de resultado e a métrica implementada, mantendo como pendentes somente as regras para várias perguntas e métricas por período.
- Nenhuma alteração estrutural ou execução de SQL no banco.

## 2026-11-16

### Prompt
Registrar o estado da integração do resultado pessoal e da dashboard com respostas reais, para continuidade do trabalho no OpenCode.

### Ação realizada
- Resultado pessoal definido para a pergunta ativa como a corrente filosófica associada à alternativa escolhida pelo usuário autenticado.
- Adicionada consulta autenticada do resultado pessoal em `GET /descoberta/meu-resultado`.
- `public/resultado.html` deixou de exibir uma corrente fixa e passou a carregar pergunta, alternativa e corrente pela API.
- Adicionado link para abrir o resultado após a resposta ser salva ou recuperada na descoberta.
- Criada a rota autenticada `GET /dashboard/metricas` com consulta agregada da quantidade de respostas por corrente na pergunta ativa.
- Dashboard atualizada para substituir dados simulados por dados retornados pela API e informar carregamento, ausência de respostas e falha.
- Arquivos envolvidos nesta integração: `app.js`, `src/routes/descoberta.js`, `src/controllers/descobertaController.js`, `src/models/descobertaModel.js`, `src/routes/dashboard.js`, `src/controllers/dashboardController.js`, `src/models/dashboardModel.js`, `public/descoberta.html`, `public/js/descoberta.js`, `public/resultado.html`, `public/js/resultado.js`, `public/dashboard.html`, `public/js/script.js`, `docs/especificacao.md` e este diário.
- Nenhuma tabela foi criada ou alterada e nenhum SQL foi executado.
- A implementação ainda precisa de diagnóstico e validação no navegador. O usuário informou que as telas ainda não estão funcionais. Antes de novas alterações, conferir rotas, respostas HTTP, sessão, caminhos dos scripts e estados visuais, sem presumir que a falha seja de banco.

## 2026-11-16

### Prompt
Melhorar a experiência nas páginas Início, Descoberta e Dashboard com os dados reais já existentes, sem alterações de backend, mantendo escopo acadêmico e registrando validações realizadas.

### Ação realizada
- Atualização de `public/index.html` para ampliar o conteúdo da página inicial com:
  - propósito do projeto;
  - relação entre filosofia, autoconhecimento e diário de reflexões;
  - caminhos claros para cadastro e login.
- Atualização de `public/descoberta.html` e `public/js/descoberta.js` para exibir, na própria descoberta, o resultado pessoal da pergunta ativa quando:
  - já existe resposta registrada ao abrir a página; ou
  - a resposta acabou de ser salva com sucesso.
- Mantida a regra de bloqueio da segunda tentativa e o destaque da alternativa original na descoberta.
- Tratamento explícito de estados na descoberta:
  - sessão ausente;
  - resposta ainda não registrada;
  - falha de API;
  - resultado carregado.
- Atualização de `public/dashboard.html` e `public/js/script.js` para incluir resumo textual com:
  - total de respostas;
  - corrente líder (com tratamento de empate).
- Preservado uso das métricas reais da API (`/dashboard/metricas`) sem alterar consulta, banco ou backend.
- Mantido fallback textual quando o gráfico estiver indisponível, preservando a apresentação dos dados em texto.
- Ajustes visuais em `public/css/global.css` para as novas seções da home, descoberta e dashboard, mantendo o tema escuro/dourado.

### Validações realizadas
- Verificação de sintaxe JavaScript:
  - `node --check public/js/descoberta.js`
  - `node --check public/js/script.js`
- Revisão estrutural dos arquivos alterados para garantir IDs, caminhos e carregamento dos scripts nas páginas.
- Limitação desta etapa: não houve validação visual em navegador no ambiente desta execução, então a validação visual completa permanece pendente.

## 2026-11-16

### Prompt
Corrigir somente a inicialização da Dashboard para iniciar consulta de métricas sem aguardar Chart.js, restringir o fluxo ao contexto da página dashboard e manter resumo/métricas textuais reais quando o gráfico estiver lento ou indisponível.

### Ação realizada
- Ajuste de `public/js/script.js` para inicialização específica da dashboard:
  - criada verificação de página ativa (`paginaDashboardAtiva`);
  - criada função `inicializarPaginaDashboard` para executar o fluxo apenas quando `status_dashboard` existir;
  - removida a chamada global que iniciava métricas para qualquer página com `script.js`.
- Ajuste de ordem de execução na dashboard:
  - `GET /dashboard/metricas` agora inicia imediatamente ao carregar a página dashboard;
  - carregamento do Chart.js acontece em paralelo e não bloqueia a consulta da API.
- Ajuste de renderização para manter dados reais visíveis:
  - resumo textual e lista de métricas textuais continuam visíveis com dados da API mesmo enquanto o gráfico carrega lentamente;
  - em falha de carregamento/criação de gráfico, mantém os dados textuais e atualiza status com indisponibilidade do gráfico.
- Preservados os estados já existentes:
  - sessão ausente (`401`);
  - ausência de respostas (`204`);
  - falha da API (`catch`/status não ok).
- Atualização de `public/dashboard.html` para remover import síncrono direto do CDN do Chart.js, evitando bloqueio da inicialização da consulta de métricas.

### Validações realizadas
- Verificação de sintaxe JavaScript:
  - `node --check public/js/script.js`
- Revisão de código e caminhos:
  - `public/dashboard.html` mantém apenas `./js/script.js`;
  - `public/js/script.js` chama `carregarMetricasDashboard()` somente dentro de `inicializarPaginaDashboard()`.
- Limitação desta etapa:
  - sem observação direta em navegador nesta execução, a validação visual/autenticada permanece pendente.
