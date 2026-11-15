# Especificação geral do Projeto Filosofia

## 1. Contexto

O Projeto Filosofia é uma aplicação web acadêmica para apoiar o autoconhecimento por meio de perguntas filosóficas, registro de reflexões pessoais e apresentação de informações agregadas em uma dashboard.

O sistema começou a partir de uma estrutura Web Data Viz. O fluxo atual já possui cadastro, login com senha armazenada em formato de hash, sessão no servidor e diário conectado ao MySQL. A tela de descoberta já consulta uma pergunta ativa e suas alternativas, mas depende de registros existentes no banco. O registro de respostas, o resultado calculado e a dashboard com dados reais ainda são etapas futuras.

Esta especificação reúne objetivos e regras estáveis do projeto. Cada plano de implementação deve atender somente à funcionalidade pedida na tarefa em andamento. A existência de uma funcionalidade nesta especificação não significa que ela já esteja implementada.

## 2. Objetivo

Permitir que uma pessoa crie uma conta, explore perguntas filosóficas, registre respostas e reflexões pessoais, consulte seus próprios registros e compreenda os resultados de forma clara.

A aplicação também deverá apresentar uma dashboard com dados agregados das respostas dos participantes, sem expor o conteúdo privado dos diários.

## 3. Usuários e acesso

1. Visitante. Pode acessar as páginas públicas e iniciar o fluxo de cadastro ou login.
2. Usuário autenticado. Pode acessar as funcionalidades associadas à própria conta, incluindo o diário e o registro de respostas que venha a ser implementado.

O servidor deve identificar o usuário autenticado pela sessão. Para operações privadas, o identificador do usuário deve vir da sessão validada no servidor.

## 4. Escopo do projeto

### Dentro do escopo

1. Página inicial com caminhos claros para cadastro e login.
2. Cadastro e autenticação de usuários.
3. Sessão autenticada mantida pelo servidor.
4. Diário pessoal com criação, consulta e leitura expandida das reflexões do próprio usuário.
5. Descoberta filosófica com perguntas e alternativas carregadas do MySQL.
6. Registro da alternativa escolhida por um usuário autenticado.
7. Exibição de resultado derivado das respostas registradas.
8. Dashboard com métricas agregadas sobre respostas filosóficas.

### Fora do escopo atual

1. Exposição pública automática das reflexões do diário.
2. Compartilhamento de reflexões sem ação explícita do autor.
3. Recomendações geradas por inteligência artificial.
4. Painel administrativo e sistemas complexos de permissões.
5. Reativação das rotas antigas de AquaTech, salvo solicitação específica.

## 5. Funcionalidades gerais

### 5.1 Cadastro e login

1. O visitante pode criar uma conta informando nome, email e senha.
2. O email de cada conta deve ser único.
3. A senha deve ser armazenada como hash, nunca em texto puro.
4. O usuário existente pode entrar pela tela de login.
5. O usuário pode encerrar a sessão.
6. Mensagens de erro devem informar o problema sem expor detalhes internos do banco ou credenciais.

### 5.2 Diário pessoal

1. O usuário autenticado pode registrar uma reflexão com título e conteúdo.
2. O usuário pode consultar o histórico das próprias reflexões.
3. Cada registro do histórico deve permitir a leitura do conteúdo completo.
4. O usuário não pode consultar ou excluir registros pertencentes a outra conta.
5. O diário permanece privado por padrão.

### 5.3 Descoberta filosófica

1. A interface deve carregar uma pergunta ativa e suas alternativas a partir do banco.
2. A interface deve informar carregamento, ausência de pergunta e falha de comunicação.
3. O usuário autenticado poderá registrar a alternativa escolhida quando essa etapa for implementada.
4. A regra de cálculo de resultado deve ser definida antes da implementação do resultado dinâmico. O esquema possui corrente filosófica e peso nas alternativas, mas a forma de combinar respostas ainda precisa ser decidida.

### 5.4 Resultado filosófico

1. O resultado deverá ser calculado a partir de respostas realmente registradas.
2. A tela não deve apresentar uma corrente fixa como se fosse resultado individual quando ainda não houver cálculo baseado em respostas.
3. A regra de desempate e a quantidade de respostas necessárias permanecem pendentes de definição.

### 5.5 Dashboard

1. A dashboard deverá apresentar dados agregados das respostas filosóficas.
2. Os gráficos deverão utilizar dados fornecidos pelo sistema, e não valores simulados, quando a integração for concluída.
3. A dashboard não deve exibir o conteúdo textual privado dos diários.
4. As métricas e os períodos exibidos devem ser definidos antes da implementação final.

## 6. Regras de negócio

RN01. O email de cadastro não pode estar associado a outra conta.

RN02. Senhas devem ser comparadas e armazenadas por meio do mecanismo de hash existente no projeto.

RN03. Rotas privadas devem validar a sessão no servidor.

RN04. As consultas do diário devem limitar os resultados ao usuário identificado pela sessão.

RN05. O conteúdo do diário é privado e não pode ser usado como dado público da dashboard.

RN06. Respostas filosóficas devem estar vinculadas ao usuário autenticado, à pergunta e a uma alternativa válida.

RN07. A regra do banco prevê no máximo uma resposta por usuário para cada pergunta. Qualquer mudança nessa regra precisa ser especificada antes de alterar o esquema.

RN08. A criação ou exclusão de tabelas e outras alterações estruturais no banco dependem de solicitação explícita. O agente não deve executar comandos SQL no banco por iniciativa própria.

## 7. Dados tratados

1. Usuário. Nome, email e hash da senha.
2. Reflexão. Título, conteúdo, data de registro e identificador do autor.
3. Pergunta filosófica. Enunciado, categoria, ordem de exibição e estado ativo.
4. Alternativa filosófica. Texto, corrente associada e peso definido no banco.
5. Resposta filosófica. Usuário, pergunta, alternativa escolhida e data da resposta.

As credenciais de conexão e outros segredos devem permanecer em variáveis de ambiente e não podem ser incluídos em código, relatórios ou logs.

## 8. Interface e estados

1. A interface deve manter a identidade visual escura e dourada já utilizada no projeto.
2. As páginas de cadastro e login devem oferecer navegação entre si.
3. Formulários e consultas devem apresentar mensagens claras de carregamento, sucesso, ausência de dados e erro quando esses estados forem relevantes.
4. A navegação deve informar ao usuário qual ação está disponível e evitar avançar como se uma resposta tivesse sido registrada quando isso não ocorreu.
5. Dados escritos pelo usuário devem ser exibidos como texto, sem interpretá-los como marcação HTML.

## 9. Padrões técnicos e limites

1. Interface em HTML, CSS e JavaScript sem framework de front end.
2. Servidor em Node.js com Express e banco MySQL usando mysql2.
3. Separar interface, rotas, controladores, modelos e configuração do banco conforme a estrutura existente e as orientações de AGENTS.md.
4. Controladores devem validar entradas e coordenar o fluxo. Modelos devem conter as consultas ao banco.
5. Consultas que recebem valores externos devem usar parâmetros para prevenir injeção de SQL.
6. Operações assíncronas e consultas devem tratar erros e retornar respostas compreensíveis.
7. Comentários curtos devem explicar funções assíncronas e operações de banco quando isso ajudar o entendimento acadêmico.
8. Usar const por padrão e let somente quando houver reatribuição.
9. Evitar bibliotecas, abstrações e padrões avançados que não sejam necessários para o curso.
10. Preservar arquivos existentes, alterações locais e funcionalidades fora da tarefa solicitada.
11. Não modificar arquivos listados em .gitignore.
12. Não ler nem modificar arquivos de ambiente durante tarefas que não dependam deles.

## 10. Critérios gerais de aceitação

CA01. Um visitante consegue encontrar os caminhos de cadastro e login.

CA02. Uma conta pode ser criada e utilizada para iniciar uma sessão.

CA03. Rotas privadas recusam acesso sem sessão válida.

CA04. Um usuário autenticado consegue criar e consultar somente as próprias reflexões.

CA05. O histórico permite ler o conteúdo completo de cada reflexão do usuário autenticado.

CA06. A tela de descoberta apresenta a pergunta ativa e suas alternativas cadastradas ou informa claramente quando esses dados não estão disponíveis.

CA07. Respostas, resultados e métricas futuras são derivados de dados armazenados, conforme regras definidas, sem valores fictícios apresentados como reais.

CA08. Nenhuma funcionalidade expõe segredos, hashes de senha ou conteúdo privado do diário.

## 11. Pendências que precisam de decisão

1. Cadastrar dados iniciais de perguntas e alternativas no banco.
2. Definir se a descoberta exige autenticação antes de responder ou somente antes de salvar a resposta.
3. Definir como combinar os pesos das alternativas e resolver empates no resultado.
4. Definir quais métricas e períodos a dashboard deve apresentar.
5. Definir se haverá compartilhamento voluntário de reflexões em uma área separada. Até essa decisão, os registros permanecem privados.

## 12. Uso desta especificação

Esta é a referência geral do projeto e deve ser atualizada quando seus objetivos ou regras estáveis mudarem.

Para cada tarefa, o pedido ao OpenCode deve identificar em uma frase a funcionalidade específica a planejar. O plano deve considerar somente aquela tarefa, listar arquivos, fluxo, decisões, impactos e etapas de validação. A implementação deve começar depois da revisão do plano.
